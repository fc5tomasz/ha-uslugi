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

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll("nav a, .lang-switch a, .nav-demo-link, .nav-cta").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        closeMenu();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });

  closeMenu();
});
