(() => {
  const STORAGE_KEY = "ha_consent_v2";
  const LEGACY_STORAGE_KEY = "ha_consent_v1";
  const CONSENT_VERSION = 2;
  const CONSENT_STATS_ENDPOINT = (() => {
    if (typeof window.HA_EXPERT_CONSENT_STATS_ENDPOINT === "string") {
      return window.HA_EXPERT_CONSENT_STATS_ENDPOINT;
    }
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1" || /^192\.168\./.test(host) || /^100\./.test(host);
    if (isLocal) return `http://${host}:8094/api/consent-stats`;
    return host === "ha-expert.com" || host === "www.ha-expert.com"
      ? "https://analytics.ha-expert.com/api/consent-stats" : null;
  })();
  const COPY = {
    pl: {
      ariaLabel: "Ustawienia prywatności",
      message: "Za zgodą używamy analityki i narzędzi reklamowych, aby mierzyć korzystanie ze strony i skuteczność reklam.",
      acceptAll: "Akceptuję wszystkie", rejectAll: "Odrzucam", settings: "Ustawienia",
      settingsTitle: "Ustawienia prywatności",
      settingsIntro: "Niezbędne funkcje strony są zawsze aktywne. Pozostałe cele możesz wybrać osobno.",
      analyticsTitle: "Analityka",
      analyticsText: "Google Analytics i anonimowa analityka HA Expert pomagają zrozumieć korzystanie ze strony.",
      marketingTitle: "Reklamy i marketing",
      marketingText: "Google Ads mierzy skuteczność reklam i może personalizować reklamy zgodnie z Twoją decyzją.",
      save: "Zapisz wybór", privacyButton: "Ustawienia prywatności",
      policyLink: "Polityka prywatności", policyHref: "/pl/polityka-prywatnosci/"
    },
    en: {
      ariaLabel: "Privacy settings",
      message: "With your consent, we use analytics and advertising tools to measure how the website is used and how effective our ads are.",
      acceptAll: "Accept all", rejectAll: "Reject all", settings: "Settings",
      settingsTitle: "Privacy settings",
      settingsIntro: "Essential site functions are always active. You can choose the other purposes separately.",
      analyticsTitle: "Analytics",
      analyticsText: "Google Analytics and anonymous HA Expert analytics help us understand how the site is used.",
      marketingTitle: "Advertising and marketing",
      marketingText: "Google Ads measures advertising performance and may personalise ads according to your choice.",
      save: "Save selection", privacyButton: "Privacy settings",
      policyLink: "Privacy Policy", policyHref: "/en/privacy-policy/"
    },
    da: {
      ariaLabel: "Privatlivsindstillinger",
      message: "Med dit samtykke bruger vi analyseværktøjer og annonceringsværktøjer til at måle brugen af hjemmesiden og effekten af vores annoncer.",
      acceptAll: "Accepter alle", rejectAll: "Afvis alle", settings: "Indstillinger",
      settingsTitle: "Privatlivsindstillinger",
      settingsIntro: "Nødvendige funktioner på siden er altid aktive. Du kan vælge de øvrige formål separat.",
      analyticsTitle: "Analyse",
      analyticsText: "Google Analytics og anonym HA Expert-analyse hjælper os med at forstå, hvordan siden bruges.",
      marketingTitle: "Annoncering og marketing",
      marketingText: "Google Ads måler effekten af annoncer og kan tilpasse annoncer efter dit valg.",
      save: "Gem valg", privacyButton: "Privatlivsindstillinger",
      policyLink: "Privatlivspolitik", policyHref: "/dk/privatlivspolitik/"
    }
  };

  let banner = null;
  let spacer = null;
  let privacyButton = null;
  let resizeObserver = null;

  const normalizeLang = (value) => {
    const lang = String(value || "").trim().toLowerCase();
    if (lang === "dk" || lang.startsWith("da")) return "da";
    if (lang.startsWith("pl")) return "pl";
    return "en";
  };

  const detectLang = () => {
    try {
      const searchLang = new URLSearchParams(window.location.search).get("lang");
      if (searchLang) return normalizeLang(searchLang);
    } catch (error) {
      // Fall back to the document language for malformed query strings.
    }
    const bodyLang = document.body && document.body.dataset ? document.body.dataset.demoLang : "";
    return normalizeLang(bodyLang || document.documentElement.lang || navigator.language || "en");
  };

  const normalizeDecision = (value) => {
    if (!value || value.version !== CONSENT_VERSION) return null;
    if (typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean") return null;
    return { version: CONSENT_VERSION, analytics: value.analytics, marketing: value.marketing };
  };

  const readStoredDecision = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeDecision(JSON.parse(raw)) : null;
    } catch (error) {
      return null;
    }
  };

  const writeStoredDecision = (decision) => {
    const normalized = normalizeDecision(decision);
    if (!normalized) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return true;
    } catch (error) {
      return false;
    }
  };

  const migrateLegacyDenial = () => {
    if (readStoredDecision()) return;
    try {
      if (window.localStorage.getItem(LEGACY_STORAGE_KEY) === "denied") {
        writeStoredDecision({ version: CONSENT_VERSION, analytics: false, marketing: false });
      }
    } catch (error) {
      // Storage can be unavailable; the banner will remain available in that case.
    }
  };

  const googleConsentFor = (decision) => ({
    ad_storage: decision.marketing ? "granted" : "denied",
    ad_user_data: decision.marketing ? "granted" : "denied",
    ad_personalization: decision.marketing ? "granted" : "denied",
    analytics_storage: decision.analytics ? "granted" : "denied"
  });

  const sendConsentUpdate = (decision) => {
    if (typeof window.gtag !== "function") return false;
    window.gtag("consent", "update", googleConsentFor(decision));
    return true;
  };

  const dispatchConsentChange = (decision) => {
    window.dispatchEvent(new CustomEvent("ha:consent-changed", { detail: { ...decision } }));
  };

  const sendConsentStat = (eventType) => {
    if (!CONSENT_STATS_ENDPOINT || typeof window.fetch !== "function") return;
    try {
      void window.fetch(CONSENT_STATS_ENDPOINT, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: eventType })
      }).catch(() => {});
    } catch (error) {
      // Pomiar zbiorczy nigdy nie może wpływać na działanie bannera.
    }
  };

  const applyDecision = (decision, { persist = true, close = true } = {}) => {
    const normalized = normalizeDecision(decision);
    if (!normalized) return;
    if (persist) writeStoredDecision(normalized);
    sendConsentUpdate(normalized);
    dispatchConsentChange(normalized);
    if (close) removeBanner();
  };

  const getMobileBottomOffset = () => {
    const mobileBottomBar = document.querySelector(".mobile-bottom-bar");
    const isMobile = window.matchMedia("(max-width: 820px)").matches;
    return mobileBottomBar && isMobile && window.getComputedStyle(mobileBottomBar).display !== "none"
      ? Math.ceil(mobileBottomBar.getBoundingClientRect().height) + 10 : 0;
  };

  const updateBannerLayout = () => {
    const bottomOffset = getMobileBottomOffset();
    if (banner && spacer) {
      banner.style.bottom = `${bottomOffset + 14}px`;
      spacer.style.height = `${Math.ceil(banner.getBoundingClientRect().height) + 22}px`;
    }
    if (privacyButton) privacyButton.style.bottom = `${bottomOffset + 12}px`;
  };

  function removeBanner() {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (banner) banner.remove();
    if (spacer) spacer.remove();
    banner = null;
    spacer = null;
    if (privacyButton) privacyButton.hidden = false;
    updateBannerLayout();
  }

  const buildButton = (label, className, onClick) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  };

  const buildOption = (name, title, text, checked) => {
    const label = document.createElement("label");
    label.className = "consent-banner__option";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = name;
    input.checked = checked;
    const copy = document.createElement("span");
    const heading = document.createElement("strong");
    const description = document.createElement("span");
    heading.textContent = title;
    description.textContent = text;
    copy.append(heading, description);
    label.append(input, copy);
    return label;
  };

  const renderBanner = (mode = "initial") => {
    if (!document.body) return;
    removeBanner();
    const copy = COPY[detectLang()] || COPY.en;
    const selected = readStoredDecision() || { version: CONSENT_VERSION, analytics: false, marketing: false };
    banner = document.createElement("aside");
    banner.className = `consent-banner${mode === "settings" ? " consent-banner--settings" : ""}`;
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", copy.ariaLabel);
    const copyWrap = document.createElement("div");
    copyWrap.className = "consent-banner__copy";

    if (mode === "settings") {
      const title = document.createElement("h2");
      title.className = "consent-banner__title";
      title.textContent = copy.settingsTitle;
      const intro = document.createElement("p");
      intro.className = "consent-banner__text";
      intro.textContent = copy.settingsIntro;
      const options = document.createElement("div");
      options.className = "consent-banner__options";
      options.append(
        buildOption("analytics", copy.analyticsTitle, copy.analyticsText, selected.analytics),
        buildOption("marketing", copy.marketingTitle, copy.marketingText, selected.marketing)
      );
      copyWrap.append(title, intro, options);
    } else {
      const text = document.createElement("p");
      text.className = "consent-banner__text";
      text.textContent = copy.message;
      copyWrap.appendChild(text);
    }

    const actions = document.createElement("div");
    actions.className = "consent-banner__actions";
    if (mode === "settings") {
      actions.appendChild(buildButton(copy.save, "consent-banner__btn consent-banner__btn--accept", () => {
        applyDecision({
          version: CONSENT_VERSION,
          analytics: banner.querySelector('input[name="analytics"]').checked,
          marketing: banner.querySelector('input[name="marketing"]').checked
        });
      }));
    } else {
      actions.append(
        buildButton(copy.acceptAll, "consent-banner__btn consent-banner__btn--accept", () => {
          sendConsentStat("accepted");
          applyDecision({ version: CONSENT_VERSION, analytics: true, marketing: true });
        }),
        buildButton(copy.rejectAll, "consent-banner__btn consent-banner__btn--reject", () => {
          sendConsentStat("rejected");
          applyDecision({ version: CONSENT_VERSION, analytics: false, marketing: false });
        }),
        buildButton(copy.settings, "consent-banner__btn consent-banner__btn--settings", () => renderBanner("settings"))
      );
    }
    const policyLink = document.createElement("a");
    policyLink.className = "consent-banner__policy-link";
    policyLink.href = copy.policyHref;
    policyLink.textContent = copy.policyLink;
    actions.appendChild(policyLink);
    banner.append(copyWrap, actions);
    spacer = document.createElement("div");
    spacer.className = "consent-banner-spacer";
    spacer.setAttribute("aria-hidden", "true");
    document.body.append(banner, spacer);
    if (privacyButton) privacyButton.hidden = true;
    resizeObserver = new ResizeObserver(updateBannerLayout);
    resizeObserver.observe(banner);
    const mobileBottomBar = document.querySelector(".mobile-bottom-bar");
    if (mobileBottomBar) resizeObserver.observe(mobileBottomBar);
    updateBannerLayout();
    if (mode === "initial") sendConsentStat("shown");
  };

  const renderPrivacyButton = () => {
    if (!document.body || privacyButton) return;
    const copy = COPY[detectLang()] || COPY.en;
    privacyButton = buildButton(copy.privacyButton, "consent-privacy-button", () => renderBanner("settings"));
    privacyButton.setAttribute("aria-label", copy.privacyButton);
    document.body.appendChild(privacyButton);
    updateBannerLayout();
  };

  const initializeBody = () => {
    renderPrivacyButton();
    if (!readStoredDecision()) renderBanner("initial");
  };

  migrateLegacyDenial();
  const initialDecision = readStoredDecision();
  if (initialDecision) sendConsentUpdate(initialDecision);
  window.HAExpertConsent = Object.freeze({
    version: CONSENT_VERSION,
    get: () => readStoredDecision(),
    has: (purpose) => Boolean(readStoredDecision() && readStoredDecision()[purpose] === true),
    openSettings: () => document.body ? renderBanner("settings") : document.addEventListener("DOMContentLoaded", () => renderBanner("settings"), { once: true })
  });
  window.addEventListener("resize", updateBannerLayout);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeBody, { once: true });
  else initializeBody();

  const consentScriptUrl = document.currentScript && document.currentScript.src;
  if (consentScriptUrl) {
    const tracker = document.createElement("script");
    tracker.src = new URL("analytics.js?v=20260826-local-1", consentScriptUrl).href;
    tracker.async = true;
    document.head.appendChild(tracker);
  }
})();
