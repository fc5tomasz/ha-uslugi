const navStates = [];

const closeAllMobileMenus = () => {
  navStates.forEach(({ closeMenu }) => closeMenu());
};

const handleMobileNavigation = (event, link) => {
  if (window.innerWidth > 820) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href) {
    closeAllMobileMenus();
    return;
  }

  const targetUrl = new URL(href, window.location.href);
  const samePageAnchor =
    targetUrl.origin === window.location.origin &&
    targetUrl.pathname === window.location.pathname &&
    targetUrl.hash;

  if (!samePageAnchor) {
    closeAllMobileMenus();
    return;
  }

  const target = document.querySelector(targetUrl.hash);
  if (!target) {
    closeAllMobileMenus();
    return;
  }

  event.preventDefault();
  closeAllMobileMenus();

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
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

  nav.querySelectorAll("nav a, .lang-switch a, .nav-demo-link, .nav-cta").forEach((link) => {
    link.addEventListener("click", (event) => {
      handleMobileNavigation(event, link);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });

  closeMenu();
});

document.querySelectorAll(".mobile-bottom-link").forEach((link) => {
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
