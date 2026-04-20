(() => {
  const STORAGE_KEY = "ha_consent_v1";
  const CONSENT_GRANTED = {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted"
  };
  const CONSENT_DENIED = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  };
  const COPY = {
    pl: {
      ariaLabel: "Baner zgody na pliki cookie",
      message:
        "Używamy plików cookie do analityki i mierzenia skuteczności reklam, aby rozwijać stronę.",
      accept: "Akceptuję",
      reject: "Odrzucam"
    },
    en: {
      ariaLabel: "Cookie consent banner",
      message:
        "We use cookies for analytics and to measure ad performance so we can improve the site.",
      accept: "Accept",
      reject: "Reject"
    },
    da: {
      ariaLabel: "Cookie consent banner",
      message:
        "Vi bruger cookies til analyse og til at måle effektiviteten af annoncer, så vi kan forbedre siden.",
      accept: "Accepter",
      reject: "Afvis"
    }
  };

  let banner = null;
  let spacer = null;
  let resizeObserver = null;

  const normalizeLang = (value) => {
    const lang = String(value || "").trim().toLowerCase();

    if (lang === "dk" || lang.startsWith("da")) {
      return "da";
    }

    if (lang.startsWith("pl")) {
      return "pl";
    }

    return "en";
  };

  const detectLang = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const searchLang = params.get("lang");

      if (searchLang) {
        return normalizeLang(searchLang);
      }
    } catch (error) {
      // Ignore malformed URL params and fall back to document language.
    }

    const bodyLang = document.body && document.body.dataset ? document.body.dataset.demoLang : "";

    if (bodyLang) {
      return normalizeLang(bodyLang);
    }

    return normalizeLang(document.documentElement.lang || navigator.language || "en");
  };

  const readStoredDecision = () => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === "granted" || value === "denied" ? value : null;
    } catch (error) {
      return null;
    }
  };

  const writeStoredDecision = (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // Ignore storage write errors and keep the banner visible on next page load.
    }
  };

  const sendConsentUpdate = (state) => {
    if (typeof window.gtag !== "function") {
      return false;
    }

    window.gtag("consent", "update", state === "granted" ? CONSENT_GRANTED : CONSENT_DENIED);
    return true;
  };

  const applyStoredConsent = () => {
    const stored = readStoredDecision();

    if (stored) {
      sendConsentUpdate(stored);
    }

    return stored;
  };

  const updateBannerLayout = () => {
    if (!banner || !spacer) {
      return;
    }

    const mobileBottomBar = document.querySelector(".mobile-bottom-bar");
    const isMobile = window.matchMedia("(max-width: 820px)").matches;
    const hasVisibleBottomBar =
      Boolean(mobileBottomBar) &&
      isMobile &&
      window.getComputedStyle(mobileBottomBar).display !== "none";

    const bottomOffset = hasVisibleBottomBar
      ? Math.ceil(mobileBottomBar.getBoundingClientRect().height) + 10
      : 0;

    banner.style.bottom = `${bottomOffset + 14}px`;
    spacer.style.height = `${Math.ceil(banner.getBoundingClientRect().height) + 22}px`;
  };

  const removeBanner = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    window.removeEventListener("resize", updateBannerLayout);

    if (banner) {
      banner.remove();
      banner = null;
    }

    if (spacer) {
      spacer.remove();
      spacer = null;
    }
  };

  const handleDecision = (state) => {
    writeStoredDecision(state);
    sendConsentUpdate(state);
    removeBanner();
  };

  const buildButton = (label, className, onClick) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  };

  const renderBanner = () => {
    if (readStoredDecision() || !document.body) {
      return;
    }

    const copy = COPY[detectLang()] || COPY.en;

    banner = document.createElement("aside");
    banner.className = "consent-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", copy.ariaLabel);

    const copyWrap = document.createElement("div");
    copyWrap.className = "consent-banner__copy";

    const text = document.createElement("p");
    text.className = "consent-banner__text";
    text.textContent = copy.message;
    copyWrap.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "consent-banner__actions";
    actions.appendChild(
      buildButton(copy.accept, "consent-banner__btn consent-banner__btn--accept", () =>
        handleDecision("granted")
      )
    );
    actions.appendChild(
      buildButton(copy.reject, "consent-banner__btn consent-banner__btn--reject", () =>
        handleDecision("denied")
      )
    );

    banner.appendChild(copyWrap);
    banner.appendChild(actions);

    spacer = document.createElement("div");
    spacer.className = "consent-banner-spacer";
    spacer.setAttribute("aria-hidden", "true");

    document.body.appendChild(banner);
    document.body.appendChild(spacer);

    resizeObserver = new ResizeObserver(updateBannerLayout);
    resizeObserver.observe(banner);

    const mobileBottomBar = document.querySelector(".mobile-bottom-bar");
    if (mobileBottomBar) {
      resizeObserver.observe(mobileBottomBar);
    }

    window.addEventListener("resize", updateBannerLayout);
    updateBannerLayout();
  };

  applyStoredConsent();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderBanner, { once: true });
  } else {
    renderBanner();
  }
})();
