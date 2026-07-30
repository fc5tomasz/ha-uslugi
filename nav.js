const navStates = [];
const guideMenuStates = [];

const closeAllGuideMenus = (except = null, restoreFocus = false) => {
  guideMenuStates.forEach(({ menu, closeMenu }) => {
    if (menu !== except) {
      closeMenu(restoreFocus);
    }
  });
};

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const closeAllMobileMenus = () => {
  navStates.forEach(({ closeMenu }) => closeMenu());
  closeAllGuideMenus();
};

const syncHeaderState = () => {
  const header = document.querySelector("header");
  if (!header) {
    return;
  }

  header.classList.toggle("scrolled", window.scrollY > 24);
};

const normalizePathname = (pathname) => {
  if (!pathname) {
    return "/";
  }

  const normalized = pathname
    .replace(/\/index\.html$/, "/")
    .replace(/\/{2,}/g, "/");

  if (normalized === "") {
    return "/";
  }

  if (normalized !== "/" && normalized.endsWith("/")) {
    return normalized.slice(0, -1);
  }

  return normalized;
};

const getAnchorTarget = (link) => {
  const href = link.getAttribute("href");
  if (!href) {
    return null;
  }

  const targetUrl = new URL(href, window.location.href);
  const currentPath = normalizePathname(window.location.pathname);
  const targetPath = normalizePathname(targetUrl.pathname);
  const samePageAnchor =
    targetUrl.origin === window.location.origin &&
    targetPath === currentPath &&
    targetUrl.hash;

  if (!samePageAnchor) {
    return null;
  }

  return document.querySelector(targetUrl.hash);
};

const scrollToAnchorTarget = (target, behavior = "smooth") => {
  if (target.id === "top") {
    if (behavior === "smooth") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo(0, 0);
    }
    return;
  }

  target.scrollIntoView({
    behavior,
    block: "start",
  });
};

const runAfterLayoutSettles = (callback) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      callback();
      window.setTimeout(callback, 140);
    });
  });
};

const stabilizeInitialMobileView = () => {
  if (window.innerWidth > 820) {
    syncHeaderState();
    return;
  }

  const hash = window.location.hash;
  const target = hash ? document.querySelector(hash) : null;

  runAfterLayoutSettles(() => {
    if (target) {
      scrollToAnchorTarget(target, "auto");
    } else {
      window.scrollTo(0, 0);
    }
    syncHeaderState();
  });
};

const handleMobileNavigation = (event, link) => {
  if (window.innerWidth > 820) {
    return;
  }

  const target = getAnchorTarget(link);
  if (!target) {
    closeAllMobileMenus();
    return;
  }

  event.preventDefault();
  closeAllMobileMenus();

  runAfterLayoutSettles(() => {
    scrollToAnchorTarget(target);
    window.history.replaceState(null, "", `#${target.id}`);
    syncHeaderState();
  });
};

const stabilizeDesktopNavWidths = () => {
  if (!document.body.classList.contains("pl-home-bg-test")) {
    return;
  }

  const links = document.querySelectorAll(
    "nav > ul > li > a",
  );

  links.forEach((link) => {
    link.style.minWidth = "";
  });

  if (window.innerWidth <= 820) {
    return;
  }

  links.forEach((link) => {
    const previousInlineWeight = link.style.fontWeight;
    const previousInlineTransition = link.style.transition;
    link.style.transition = "none";
    link.style.fontWeight = "700";
    const reservedWidth = Math.ceil(link.getBoundingClientRect().width);
    link.style.fontWeight = previousInlineWeight;
    link.getBoundingClientRect();
    link.style.transition = previousInlineTransition;
    link.style.minWidth = `${reservedWidth}px`;
  });
};

const initDesktopSectionNavigation = () => {
  const primaryNav = document.querySelector("#primary-nav");
  if (!primaryNav || !document.body.classList.contains("pl-home-bg-test")) {
    return;
  }

  const currentPath = normalizePathname(window.location.pathname);
  const sectionLinks = Array.from(
    primaryNav.querySelectorAll(
      ":scope > ul > li:not(.nav-mobile-cta-item) > a[href*='#']",
    ),
  )
    .map((link) => {
      const targetUrl = new URL(link.href, window.location.href);
      const target =
        targetUrl.origin === window.location.origin &&
        normalizePathname(targetUrl.pathname) === currentPath &&
        targetUrl.hash
          ? document.querySelector(targetUrl.hash)
          : null;

      return target ? { link, target } : null;
    })
    .filter(Boolean);

  if (!sectionLinks.length) {
    return;
  }

  let frameRequested = false;

  const setActiveLink = (activeLink = null) => {
    sectionLinks.forEach(({ link }) => {
      const isActive = link === activeLink;
      link.classList.toggle("is-section-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else if (link.getAttribute("aria-current") === "location") {
        link.removeAttribute("aria-current");
      }
    });
  };

  const syncActiveSection = () => {
    frameRequested = false;

    if (window.innerWidth <= 820) {
      setActiveLink();
      return;
    }

    const headerHeight =
      document.querySelector("header")?.getBoundingClientRect().height || 0;
    const probePosition =
      window.scrollY +
      headerHeight +
      Math.max(80, (window.innerHeight - headerHeight) * 0.3);
    const orderedSections = sectionLinks
      .map((item) => ({
        ...item,
        top: item.target.getBoundingClientRect().top + window.scrollY,
      }))
      .sort((first, second) => first.top - second.top);
    const activeSection = orderedSections.reduce(
      (current, item) => (item.top <= probePosition ? item : current),
      null,
    );

    setActiveLink(activeSection?.link || null);
  };

  const requestSectionSync = () => {
    if (frameRequested) {
      return;
    }

    frameRequested = true;
    window.requestAnimationFrame(syncActiveSection);
  };

  window.addEventListener("scroll", requestSectionSync, { passive: true });
  window.addEventListener("resize", requestSectionSync);
  window.addEventListener("load", requestSectionSync);
  window.addEventListener("pageshow", requestSectionSync);
  requestSectionSync();
};

stabilizeDesktopNavWidths();
if (document.fonts?.ready) {
  document.fonts.ready.then(stabilizeDesktopNavWidths);
}
window.addEventListener("resize", stabilizeDesktopNavWidths);

document.querySelectorAll(".nav").forEach((nav) => {
  const toggle = nav.querySelector(".nav-toggle");
  if (!toggle) {
    return;
  }

  const primaryList = nav.querySelector(":scope > nav > ul");
  const primaryCta = nav.querySelector(":scope > .nav-cta");
  if (primaryList && primaryCta) {
    const mobileCtaItem = document.createElement("li");
    const mobileCta = primaryCta.cloneNode(true);
    mobileCtaItem.className = "nav-mobile-cta-item";
    mobileCta.className = "nav-mobile-menu-cta";
    mobileCta.removeAttribute("id");
    mobileCtaItem.append(mobileCta);
    primaryList.append(mobileCtaItem);
  }

  const closeMenu = () => {
    nav.classList.remove("menu-open");
    document.body.classList.remove("mobile-menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    toggle.innerHTML = '<span aria-hidden="true">☰</span>';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toggle.blur());
    });
  };

  const openMenu = () => {
    nav.classList.add("menu-open");
    document.body.classList.add("mobile-menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    toggle.innerHTML = '<span aria-hidden="true">✕</span>';
  };

  navStates.push({ nav, closeMenu });

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("menu-open")) {
      closeMenu();
    } else {
      closeAllMobileMenus();
      openMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });

  closeMenu();
});

initDesktopSectionNavigation();

document.querySelectorAll(".nav-guides").forEach((menu) => {
  const toggle = menu.querySelector(".nav-guides-toggle");
  const dropdown = menu.querySelector(".nav-guides-dropdown");

  if (!toggle || !dropdown) {
    return;
  }

  const closeMenu = (restoreFocus = false) => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");

    if (restoreFocus) {
      toggle.focus();
    }
  };

  const openMenu = () => {
    closeAllGuideMenus(menu);
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  guideMenuStates.push({ menu, closeMenu });
  menu.classList.toggle(
    "has-current",
    Boolean(dropdown.querySelector('[aria-current="page"]')),
  );

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  dropdown.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  closeMenu();
});

document.addEventListener("click", (event) => {
  guideMenuStates.forEach(({ menu, closeMenu }) => {
    if (!menu.contains(event.target)) {
      closeMenu();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  let guideWasOpen = false;
  guideMenuStates.forEach(({ menu, closeMenu }) => {
    if (menu.classList.contains("is-open")) {
      guideWasOpen = true;
      closeMenu(true);
    }
  });

  if (!guideWasOpen) {
    closeAllMobileMenus();
  }
});

document.querySelectorAll("a[href*='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    handleMobileNavigation(event, link);
  });
});

const refreshMobileBottomBar = () => {
  if (window.innerWidth > 820) {
    return;
  }

  document.querySelectorAll(".mobile-bottom-bar").forEach((bar) => {
    bar.style.transform = "translateY(1px)";
    window.requestAnimationFrame(() => {
      bar.style.transform = "translateY(0)";
    });
  });
};

window.addEventListener("load", refreshMobileBottomBar);
window.addEventListener("pageshow", refreshMobileBottomBar);
window.addEventListener("resize", refreshMobileBottomBar);
window.addEventListener("load", stabilizeInitialMobileView);
window.addEventListener("pageshow", stabilizeInitialMobileView);
