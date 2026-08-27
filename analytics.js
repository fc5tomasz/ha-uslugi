(() => {
  const SESSION_KEY = "ha_analytics_session_v1";
  const SESSION_STARTED_KEY = "ha_analytics_started_v1";
  const PREVIOUS_PATH_KEY = "ha_analytics_previous_path_v1";
  const FORM_START_ATTRIBUTE = "data-ha-analytics-started";
  const FLUSH_DELAY_MS = 700;
  const HEARTBEAT_MS = Math.max(1000, Number(window.HA_EXPERT_ANALYTICS_HEARTBEAT_MS) || 15000);
  const BATCH_SIZE = 8;
  const HOME_PATHS = new Set(["/pl/", "/en/", "/dk/"]);
  let active = false;
  let queue = [];
  let flushTimer = null;
  let heartbeatTimer = null;
  let observer = null;
  let heartbeatStartedAt = null;
  let sentScroll = new Set();
  let sentSections = new Set();

  const endpoint = (() => {
    if (typeof window.HA_EXPERT_ANALYTICS_ENDPOINT === "string") return window.HA_EXPERT_ANALYTICS_ENDPOINT;
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1" || /^192\.168\./.test(host) || /^100\./.test(host);
    if (isLocal) return `http://${host}:8094/api/events`;
    const isProduction = host === "ha-expert.com" || host === "www.ha-expert.com";
    return isProduction ? "https://analytics.ha-expert.com/api/events" : null;
  })();
  const safeSessionGet = (key) => { try { return window.sessionStorage.getItem(key); } catch (error) { return null; } };
  const safeSessionSet = (key, value) => { try { window.sessionStorage.setItem(key, value); } catch (error) { /* no-op */ } };
  const safeSessionRemove = (key) => { try { window.sessionStorage.removeItem(key); } catch (error) { /* no-op */ } };
  const randomToken = (prefix) => window.crypto && typeof window.crypto.randomUUID === "function"
    ? `${prefix}_${window.crypto.randomUUID()}`
    : `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
  const getSessionId = () => {
    let value = safeSessionGet(SESSION_KEY);
    if (!value) { value = randomToken("web"); safeSessionSet(SESSION_KEY, value); }
    return value;
  };
  const language = () => {
    const value = (document.documentElement.lang || "en").toLowerCase();
    if (value.startsWith("pl")) return "PL";
    if (value === "dk" || value.startsWith("da")) return "DK";
    return "EN";
  };
  const pathOnly = () => window.location.pathname.replace(/\/index\.html$/, "/").replace(/\/{2,}/g, "/") || "/";
  const campaignMarkers = () => {
    const params = new URLSearchParams(window.location.search);
    const markers = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"].filter((name) => params.has(name));
    try {
      const host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
      if (/(^|\.)bing\.com$/.test(host)) markers.unshift("bing");
    } catch (error) { /* no marker */ }
    return markers.length ? markers.join(":").slice(0, 80) : null;
  };
  const source = () => {
    const params = new URLSearchParams(window.location.search);
    const medium = (params.get("utm_medium") || "").toLowerCase();
    if (params.has("gclid") || /^(cpc|ppc|paid|paidsearch)$/.test(medium)) return "google_ads";
    if (!document.referrer) return "direct";
    try {
      const referrer = new URL(document.referrer);
      if (referrer.hostname === window.location.hostname) return "direct";
      if (/(^|\.)google\./.test(referrer.hostname)) return "google_organic";
      return "referral";
    } catch (error) { return "other"; }
  };
  const commonPayload = () => {
    const payload = { event_id: randomToken("evt"), session_id: getSessionId(), timestamp: new Date().toISOString(), language: language(), source: source() };
    const campaign = campaignMarkers();
    if (campaign) payload.campaign = campaign;
    return payload;
  };
  const sendOne = async (payload, keepalive) => {
    if (!endpoint || !active) return;
    try {
      const response = await fetch(endpoint, {
        method: "POST", mode: "cors", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", keepalive,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (response.ok) window.dispatchEvent(new CustomEvent("ha:analytics-sent", { detail: { eventType: payload.event_type } }));
    } catch (error) { /* Collector failure must never affect the page. */ }
  };
  const flush = (keepalive = false) => {
    if (flushTimer) window.clearTimeout(flushTimer);
    flushTimer = null;
    if (!active || !endpoint || queue.length === 0) return;
    const batch = queue.splice(0, BATCH_SIZE);
    Promise.allSettled(batch.map((payload) => sendOne(payload, keepalive))).finally(() => {
      if (queue.length && active) flushTimer = window.setTimeout(() => flush(keepalive), 50);
    });
  };
  const track = (eventType, details = {}, { immediate = false } = {}) => {
    if (!active || !endpoint) return false;
    queue.push({ ...commonPayload(), event_type: eventType, ...details });
    if (immediate || queue.length >= BATCH_SIZE) flush(immediate);
    else if (!flushTimer) flushTimer = window.setTimeout(() => flush(false), FLUSH_DELAY_MS);
    return true;
  };
  const emitHeartbeat = (final = false) => {
    if (!active) return;
    if (!final && (document.visibilityState !== "visible" || !document.hasFocus())) { heartbeatStartedAt = null; return; }
    const now = Date.now();
    if (heartbeatStartedAt === null) { heartbeatStartedAt = now; return; }
    const seconds = Math.max(1, Math.min(300, Math.round((now - heartbeatStartedAt) / 1000)));
    heartbeatStartedAt = now;
    track(final ? "active_time" : "heartbeat", { path: pathOnly(), active_seconds: seconds, action_name: "last_activity" }, { immediate: final });
  };
  const observeSections = () => {
    if (!HOME_PATHS.has(pathOnly()) || typeof IntersectionObserver !== "function") return;
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.45) return;
        const section = `#${entry.target.id}`;
        if (sentSections.has(section)) return;
        sentSections.add(section);
        track("section_view", { path: pathOnly(), section });
      });
    }, { threshold: [0.45] });
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
  };
  const handleScroll = () => {
    if (!active) return;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    [25, 50, 75, 90].forEach((threshold) => {
      if (percent >= threshold && !sentScroll.has(threshold)) {
        sentScroll.add(threshold);
        track(`scroll_${threshold}`, { path: pathOnly() });
      }
    });
  };
  const handleClick = (event) => {
    if (!active || !event.isTrusted) return;
    const link = event.target.closest("a,button");
    if (!link) return;
    if (link.matches(".forum-community-link, a[href^='https://forum.ha-expert.com']")) {
      track("forum_click", { path: pathOnly(), action_name: "forum_link" }, { immediate: true }); return;
    }
    if (link.matches("a[href^='mailto:']")) {
      track("contact_email_click", { path: pathOnly(), action_name: "contact_email" }, { immediate: true }); return;
    }
    if (link.matches(".hero-contact-link,.nav-cta,a[href$='#kontakt'],a[href$='#contact']")) {
      const actionName = link.classList.contains("hero-contact-link") ? "hero_contact" : link.classList.contains("nav-cta") ? "navigation_contact" : "primary_cta";
      track("cta", { path: pathOnly(), action_name: actionName }, { immediate: true });
    }
  };
  const handleFormStart = (event) => {
    if (!active || !event.isTrusted) return;
    const form = event.target.closest && event.target.closest("#contactForm");
    if (!form || form.hasAttribute(FORM_START_ATTRIBUTE)) return;
    form.setAttribute(FORM_START_ATTRIBUTE, "true");
    track("contact_form_start", { path: pathOnly(), action_name: "contact_form" });
  };
  const start = () => {
    if (active || !endpoint) return;
    active = true;
    sentScroll = new Set(); sentSections = new Set();
    const currentPath = pathOnly();
    const previousPath = safeSessionGet(PREVIOUS_PATH_KEY);
    if (!safeSessionGet(SESSION_STARTED_KEY)) {
      track("session_start", { path: currentPath, landing_page: currentPath, ...(previousPath ? { previous_path: previousPath } : {}) });
      safeSessionSet(SESSION_STARTED_KEY, "1");
    }
    track("page_view", { path: currentPath, ...(previousPath ? { previous_path: previousPath } : {}) });
    safeSessionSet(PREVIOUS_PATH_KEY, currentPath);
    heartbeatStartedAt = document.visibilityState === "visible" && document.hasFocus() ? Date.now() : null;
    heartbeatTimer = window.setInterval(() => emitHeartbeat(false), HEARTBEAT_MS);
    observeSections(); handleScroll();
  };
  const stop = () => {
    active = false; queue = [];
    if (flushTimer) window.clearTimeout(flushTimer);
    if (heartbeatTimer) window.clearInterval(heartbeatTimer);
    if (observer) observer.disconnect();
    flushTimer = null; heartbeatTimer = null; observer = null; heartbeatStartedAt = null;
    safeSessionRemove(SESSION_KEY); safeSessionRemove(SESSION_STARTED_KEY); safeSessionRemove(PREVIOUS_PATH_KEY);
    document.querySelectorAll(`[${FORM_START_ATTRIBUTE}]`).forEach((form) => form.removeAttribute(FORM_START_ATTRIBUTE));
  };
  const syncConsent = () => {
    const allowed = Boolean(window.HAExpertConsent && window.HAExpertConsent.has("analytics"));
    if (allowed) start(); else if (active) stop();
  };
  document.addEventListener("click", handleClick, { capture: true });
  ["focusin", "input", "change", "pointerdown", "keydown"].forEach((name) => document.addEventListener(name, handleFormStart, { capture: true }));
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("focus", () => { if (active) heartbeatStartedAt = Date.now(); });
  window.addEventListener("blur", () => { if (active) emitHeartbeat(true); });
  document.addEventListener("visibilitychange", () => {
    if (!active) return;
    if (document.visibilityState === "hidden") emitHeartbeat(true); else heartbeatStartedAt = document.hasFocus() ? Date.now() : null;
  });
  window.addEventListener("pagehide", () => {
    if (!active) return;
    emitHeartbeat(true); safeSessionSet(PREVIOUS_PATH_KEY, pathOnly()); flush(true);
  });
  window.addEventListener("ha:consent-changed", syncConsent);
  window.HAExpertAnalytics = Object.freeze({ track: (eventType, details = {}) => track(eventType, details, { immediate: true }), isActive: () => active });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncConsent, { once: true }); else syncConsent();
})();
