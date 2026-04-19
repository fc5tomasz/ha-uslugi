const navStates = [];

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const closeAllMobileMenus = () => {
  navStates.forEach(({ closeMenu }) => closeMenu());
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

document.querySelectorAll(".nav").forEach((nav) => {
  const toggle = nav.querySelector(".nav-toggle");
  if (!toggle) {
    return;
  }

  const closeMenu = () => {
    nav.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    toggle.innerHTML = '<span aria-hidden="true">☰</span>';
  };

  const openMenu = () => {
    nav.classList.add("menu-open");
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
