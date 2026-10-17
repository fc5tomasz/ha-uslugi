(() => {
  const SESSION_KEY = "ha_analytics_session_v1";
  const SESSION_STARTED_KEY = "ha_analytics_started_v1";
  const SESSION_LAST_EVENT_KEY = "ha_analytics_last_event_at_v1";
  const PREVIOUS_PATH_KEY = "ha_analytics_previous_path_v1";
  const BROWSER_KEY = "ha_analytics_browser_v1";
  const BROWSER_TTL_MS = 90 * 24 * 60 * 60 * 1000;
  const SOURCE_KEY = "ha_analytics_source_v2";
  const CAMPAIGN_KEY = "ha_analytics_campaign_v2";
  const FORM_START_ATTRIBUTE = "data-ha-analytics-started";
  const FLUSH_DELAY_MS = 700;
  const HEARTBEAT_MS = Math.max(1000, Number(window.HA_EXPERT_ANALYTICS_HEARTBEAT_MS) || 15000);
  const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  const BATCH_SIZE = 8;
  const HOME_PATHS = new Set(["/pl/", "/en/", "/dk/"]);
  let active = false;
  let previousReturnVisits = false;
  let queue = [];
  let flushTimer = null;
  let heartbeatTimer = null;
  let observer = null;
  let heartbeatStartedAt = null;
  let activeRemainderMs = 0;
  let formObserver = null;
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
  const consentAllowed = () => Boolean(window.HAExpertConsent && window.HAExpertConsent.has("analytics"));
  const forgetBrowser = () => { try { window.localStorage.removeItem(BROWSER_KEY); } catch (error) { /* storage unavailable */ } };
  const getBrowserId = () => {
    if (!consentAllowed() || !window.HAExpertConsent.has("returnVisits")) { forgetBrowser(); return null; }
    try {
      const now = Date.now();
      const stored = JSON.parse(window.localStorage.getItem(BROWSER_KEY) || "null");
      if (stored && /^browser_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(stored.id) && Number.isFinite(stored.createdAt)
          && stored.createdAt <= now && now - stored.createdAt < BROWSER_TTL_MS) return stored.id;
      if (!window.crypto || typeof window.crypto.randomUUID !== "function") { forgetBrowser(); return null; }
      const id = `browser_${window.crypto.randomUUID()}`;
      window.localStorage.setItem(BROWSER_KEY, JSON.stringify({id, createdAt:now}));
      return id;
    } catch (error) { return null; } // Session analytics still works without persistent storage.
  };
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
    const markers = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"].filter((name) => params.has(name));
    try {
      const host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
      if (/(^|\.)bing\.com$/.test(host)) markers.unshift("bing");
    } catch (error) { /* no marker */ }
    return markers.length ? markers.join(":").slice(0, 80) : null;
  };
  const source = () => {
    const params = new URLSearchParams(window.location.search);
    const medium = (params.get("utm_medium") || "").toLowerCase();
    const campaignSource = (params.get("utm_source") || "").toLowerCase();
    if (["gclid", "gbraid", "wbraid"].some(key => params.has(key)) || (/^(google|googleads|google_ads)$/.test(campaignSource) && /^(cpc|ppc|paid|paidsearch)$/.test(medium))) return "google_ads";
    if (/^(cpc|ppc|paid|paidsearch|paid_social)$/.test(medium)) return "other";
    if (!document.referrer) return "direct";
    try {
      const referrer = new URL(document.referrer);
      if (referrer.hostname.replace(/^www\./, "") === window.location.hostname.replace(/^www\./, "")) return "direct";
      if (/(^|\.)google\./.test(referrer.hostname)) return "google_organic";
      return "referral";
    } catch (error) { return "other"; }
  };
  const commonPayload = (now = Date.now()) => {
    if (!safeSessionGet(SOURCE_KEY)) safeSessionSet(SOURCE_KEY, source());
    const payload = { event_id: randomToken("evt"), session_id: getSessionId(), timestamp: new Date(now).toISOString(), language: language(), source: safeSessionGet(SOURCE_KEY) || source(), device: window.matchMedia("(max-width: 820px)").matches ? "mobile" : "desktop", measurement_version: 2 };
    const browserId = getBrowserId();
    if (browserId) payload.browser_id = browserId;
    const campaign = safeSessionGet(CAMPAIGN_KEY) || campaignMarkers();
    if (campaign) safeSessionSet(CAMPAIGN_KEY, campaign);
    if (campaign) payload.campaign = campaign;
    return payload;
  };
  const enqueueEvent = (eventType, details, now) => {
    queue.push({ ...commonPayload(now), event_type: eventType, ...details });
    safeSessionSet(SESSION_LAST_EVENT_KEY, String(now));
  };
  const sessionExpired = (now) => {
    if (!safeSessionGet(SESSION_KEY)) return false;
    const lastEventAt = Number(safeSessionGet(SESSION_LAST_EVENT_KEY));
    return !Number.isFinite(lastEventAt) || lastEventAt <= 0 || now - lastEventAt > SESSION_IDLE_TIMEOUT_MS;
  };
  const rotateExpiredSession = (now = Date.now()) => {
    if (!active || !consentAllowed() || !sessionExpired(now)) return false;
    const currentPath = pathOnly();
    const previousPath = safeSessionGet(PREVIOUS_PATH_KEY);
    safeSessionRemove(SOURCE_KEY); safeSessionRemove(CAMPAIGN_KEY);
    safeSessionRemove(SESSION_KEY);
    safeSessionRemove(SESSION_STARTED_KEY);
    safeSessionRemove(SESSION_LAST_EVENT_KEY);
    sentScroll = new Set(); sentSections = new Set(); activeRemainderMs = 0;
    heartbeatStartedAt = document.visibilityState === "visible" && document.hasFocus() ? performance.now() : null;
    document.querySelectorAll(`[${FORM_START_ATTRIBUTE}]`).forEach((form) => form.removeAttribute(FORM_START_ATTRIBUTE));
    enqueueEvent("session_start", { path: currentPath, landing_page: currentPath, ...(previousPath ? { previous_path: previousPath } : {}) }, now);
    safeSessionSet(SESSION_STARTED_KEY, "1");
    enqueueEvent("page_view", { path: currentPath, ...(previousPath ? { previous_path: previousPath } : {}) }, now);
    safeSessionSet(PREVIOUS_PATH_KEY, currentPath);
    observeSections(); observeForm();
    if (!flushTimer) flushTimer = window.setTimeout(() => flush(false), FLUSH_DELAY_MS);
    return true;
  };
  const sendOne = async (payload, keepalive) => {
    if (!endpoint || !active || !consentAllowed()) return;
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
    if (!active || !endpoint || !consentAllowed()) return false;
    const now = Date.now();
    rotateExpiredSession(now);
    enqueueEvent(eventType, details, now);
    if (immediate || queue.length >= BATCH_SIZE) flush(immediate);
    else if (!flushTimer) flushTimer = window.setTimeout(() => flush(false), FLUSH_DELAY_MS);
    return true;
  };
  const resumeActive = () => {
    if (active && heartbeatStartedAt === null && document.visibilityState === "visible" && document.hasFocus()) heartbeatStartedAt = performance.now();
  };
  const emitHeartbeat = (final = false) => {
    if (!active) return;
    // A suspended timer must not carry the previous session's segment into a new visit.
    if (rotateExpiredSession()) { if (final) heartbeatStartedAt = null; return; }
    if (!final && (document.visibilityState !== "visible" || !document.hasFocus())) { emitHeartbeat(true); return; }
    if (heartbeatStartedAt === null) { if (!final) resumeActive(); return; }
    const now = performance.now();
    activeRemainderMs += Math.max(0, Math.min(300000, now - heartbeatStartedAt));
    heartbeatStartedAt = final ? null : now;
    const seconds = Math.floor(activeRemainderMs / 1000);
    activeRemainderMs -= seconds * 1000;
    if (seconds > 0) track(final ? "active_time" : "heartbeat", { path: pathOnly(), active_seconds: Math.min(seconds, 300), action_name: "last_activity" }, { immediate: final });
  };
  const offerPaths = new Set([
    "/pl/uslugi/", "/en/services/", "/dk/ydelser/",
    "/pl/konsultant-home-assistant/", "/en/home-assistant-consultant/", "/dk/home-assistant-konsulent/",
    "/pl/uslugi-dla-firm/", "/en/services-for-businesses/", "/dk/ydelser-til-virksomheder/"
  ]);
  const sourceGroup = () => HOME_PATHS.has(pathOnly()) ? "home"
    : /\/(projekty|projects|projekter)\//.test(pathOnly()) ? "projects"
    : document.body.classList.contains("knowledge-page") && !offerPaths.has(pathOnly()) ? "guide"
    : offerPaths.has(pathOnly()) ? "offer" : "other";
  const observeForm = () => {
    const form = document.getElementById("contactForm");
    if (!form || typeof IntersectionObserver !== "function") return;
    if (formObserver) formObserver.disconnect();
    let recorded = false;
    formObserver = new IntersectionObserver(entries => {
      if (!recorded && entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.1)) {
        recorded = true;
        track("form_view", { path: pathOnly() });
        formObserver.disconnect();
      }
    }, { threshold: 0.1 });
    formObserver.observe(form);
  };
  const observeSections = () => {
    if (!HOME_PATHS.has(pathOnly()) || typeof IntersectionObserver !== "function") return;
    if (observer) observer.disconnect();
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
    rotateExpiredSession();
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
    if (link.matches('a[aria-controls="services-submenu"],button[aria-controls="services-submenu"]')) {
      track("offer_menu_toggle", {path:pathOnly(),action_name:link.getAttribute("aria-expanded") === "true" ? "close" : "open"}, {immediate:true});
      return;
    }
    if (link.matches("a[href]")) {
      try {
        const target = new URL(link.href, location.href);
        const targetPath = target.pathname.replace(/\/index\.html$/, "/");
        const offerAnchor = HOME_PATHS.has(targetPath) && ["#uslugi", "#services", "#ydelser"].includes(target.hash);
        if (target.origin === location.origin && (offerPaths.has(targetPath) || offerAnchor)) {
          const element = link.closest(".nav, nav, .mobile-menu, .nav-mobile-menu, .mobile-bottom-bar, .site-nav, header") ? "menu"
            : link.matches(".hero-contact-link,.nav-cta,[class*=cta],[class*=button]") ? "cta" : "content_link";
          track("offer_click", { path: pathOnly(), target_path: targetPath,
            action_name: offerAnchor ? "services_section" : targetPath.includes("firm") || targetPath.includes("business") || targetPath.includes("virksomhed") ? "business" : targetPath.includes("konsult") || targetPath.includes("consultant") ? "consulting" : "services",
            element, source_group: sourceGroup() }, { immediate: true });
        }
      } catch (error) { /* Ignore malformed or external links. */ }
    }
    if (link.matches(".forum-community-link, a[href^='https://forum.ha-expert.com']")) {
      track("forum_click", { path: pathOnly(), action_name: "forum_link" }, { immediate: true }); return;
    }
    if (link.matches("a[href^='mailto:']")) {
      track("contact_email_click", { path: pathOnly(), action_name: "contact_email" }, { immediate: true }); return;
    }
    if (link.matches(".hero-contact-link,.nav-cta,a[href$='#kontakt'],a[href$='#contact']")) {
      const actionName = link.classList.contains("hero-contact-link") ? "hero_contact" : link.classList.contains("nav-cta") ? "navigation_contact" : "primary_cta";
      let contactTarget = null;
      try { const url = new URL(link.href, location.href); if (url.origin === location.origin) contactTarget = url.pathname.replace(/\/index\.html$/, "/"); } catch (error) { /* Button without a URL. */ }
      track("cta", { path: pathOnly(), action_name: actionName, target_path:contactTarget,
        element:link.closest(".nav,nav,header,.mobile-bottom-bar") ? "menu" : "cta", source_group:sourceGroup() }, { immediate: true });
    }
  };
  const handleFormStart = (event) => {
    if (!active || !event.isTrusted || event.type !== "input") return;
    const form = event.target.closest && event.target.closest("#contactForm");
    if (!form || form.hasAttribute(FORM_START_ATTRIBUTE) || !event.target.matches("input:not([type=hidden]):not([type=file]),textarea")) return;
    // "Napisz e-mail" sits inside the form, but opening a mail program is not a form start.
    if (event.target.closest(".contact-email-action")) return;
    form.setAttribute(FORM_START_ATTRIBUTE, "true");
    track("form_input", { path: pathOnly(), action_name: "contact_form" });
  };
  const start = () => {
    if (active || !endpoint) return;
    active = true;
    sentScroll = new Set(); sentSections = new Set();
    const currentPath = pathOnly();
    const previousPath = safeSessionGet(PREVIOUS_PATH_KEY);
    if (!rotateExpiredSession()) {
      if (!safeSessionGet(SESSION_STARTED_KEY)) {
        track("session_start", { path: currentPath, landing_page: currentPath, ...(previousPath ? { previous_path: previousPath } : {}) });
        safeSessionSet(SESSION_STARTED_KEY, "1");
      }
      track("page_view", { path: currentPath, ...(previousPath ? { previous_path: previousPath } : {}) });
      safeSessionSet(PREVIOUS_PATH_KEY, currentPath);
    }
    heartbeatStartedAt = document.visibilityState === "visible" && document.hasFocus() ? performance.now() : null;
    heartbeatTimer = window.setInterval(() => emitHeartbeat(false), HEARTBEAT_MS);
    observeSections(); observeForm(); handleScroll();
  };
  const stop = ({forgetIdentity = true} = {}) => {
    active = false; queue = []; activeRemainderMs = 0;
    if (forgetIdentity) forgetBrowser();
    if (flushTimer) window.clearTimeout(flushTimer);
    if (heartbeatTimer) window.clearInterval(heartbeatTimer);
    if (observer) observer.disconnect();
    if (formObserver) formObserver.disconnect();
    flushTimer = null; heartbeatTimer = null; observer = null; heartbeatStartedAt = null;
    safeSessionRemove(SOURCE_KEY); safeSessionRemove(CAMPAIGN_KEY);
    safeSessionRemove(SESSION_KEY); safeSessionRemove(SESSION_STARTED_KEY); safeSessionRemove(SESSION_LAST_EVENT_KEY); safeSessionRemove(PREVIOUS_PATH_KEY);
    document.querySelectorAll(`[${FORM_START_ATTRIBUTE}]`).forEach((form) => form.removeAttribute(FORM_START_ATTRIBUTE));
  };
  const syncConsent = () => {
    const allowed = Boolean(window.HAExpertConsent && window.HAExpertConsent.has("analytics"));
    const returning = allowed && window.HAExpertConsent.has("returnVisits");
    if (active && returning !== previousReturnVisits) stop({forgetIdentity: !returning});
    previousReturnVisits = returning;
    if (!returning) forgetBrowser();
    if (allowed) start(); else { forgetBrowser(); if (active) stop(); }
  };
  document.addEventListener("submit", event => {
    if (active && event.isTrusted && event.target.id === "contactForm") track("form_attempt", { path:pathOnly(), action_name:"submit" }, { immediate:true });
  }, {capture:true});
  let validationReported = false;
  document.addEventListener("invalid", event => {
    if (!active || !event.isTrusted || !event.target.closest("#contactForm") || validationReported) return;
    validationReported = true;
    track("form_error", {path:pathOnly(),action_name:"validation"}, {immediate:true});
    setTimeout(()=>{validationReported=false;},0);
  }, {capture:true});
  document.addEventListener("click", handleClick, { capture: true });
  ["focusin", "input", "change", "pointerdown", "keydown"].forEach((name) => document.addEventListener(name, handleFormStart, { capture: true }));
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("focus", () => {
    if (!active) return;
    const now = Date.now();
    rotateExpiredSession(now);
    resumeActive();
  });
  window.addEventListener("pageshow", event => {
    const alreadyActive = active;
    syncConsent();
    if (!active) return;
    if (event.persisted && alreadyActive && !rotateExpiredSession()) {
      const previous = safeSessionGet(PREVIOUS_PATH_KEY);
      track("page_view", {path:pathOnly(), ...(previous ? {previous_path:previous} : {})});
      safeSessionSet(PREVIOUS_PATH_KEY,pathOnly());
      sentScroll = new Set(); sentSections = new Set();
      observeSections(); observeForm();
    }
    resumeActive();
  });
  window.addEventListener("blur", () => { if (active) emitHeartbeat(true); });
  document.addEventListener("visibilitychange", () => {
    if (!active) return;
    if (document.visibilityState === "hidden") emitHeartbeat(true);
    else {
      const now = Date.now();
      rotateExpiredSession(now);
      resumeActive();
    }
  });
  window.addEventListener("pagehide", () => {
    if (!active) return;
    emitHeartbeat(true); safeSessionSet(PREVIOUS_PATH_KEY, pathOnly()); flush(true);
  });
  window.addEventListener("ha:consent-changed", syncConsent);
  window.HAExpertAnalytics = Object.freeze({ track: (eventType, details = {}) => track(eventType, details, { immediate: true }), isActive: () => active && consentAllowed(), sessionId: () => active && consentAllowed() ? getSessionId() : null });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncConsent, { once: true }); else syncConsent();
})();
