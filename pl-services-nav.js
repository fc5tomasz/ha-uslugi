// Enhance the service submenu already present in HTML; never generate navigation links.
document.querySelectorAll(".nav > nav > ul > li[data-services]").forEach((item) => {
    const toggle = item.querySelector(':scope > a[aria-controls="services-submenu"]');
    const submenu = item.querySelector(':scope > ul');
    if (!toggle || !submenu) return;
    const setOpen = (open, focus = false) => {
      submenu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (focus) (open ? submenu.querySelector('a') : toggle).focus();
    };
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(submenu.hidden);
    });
    toggle.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(event.key === 'ArrowDown' || submenu.hidden, event.key === 'ArrowDown');
      }
    });
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !submenu.hidden) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false, true);
      }
    });
    item.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' && window.innerWidth > 1328) setOpen(true);
    });
    item.addEventListener('pointerleave', () => {
      if (window.innerWidth > 1328 && !item.contains(document.activeElement)) setOpen(false);
    });
    item.addEventListener('focusout', (event) => {
      if (!item.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (!item.contains(event.target)) setOpen(false);
    });
    document.querySelector('.nav-toggle')?.addEventListener('click', () => setOpen(false));
    window.addEventListener('resize', () => setOpen(false));
  });
