// Localized service disclosure, sharing the existing primary navigation and hamburger.
const serviceNavigation = {
  pl: { title: 'Usługi', entries: [['Zakres usług', '/pl/uslugi/'], ['Doradztwo', '/pl/konsultant-home-assistant/'], ['Usługi dla firm', '/pl/uslugi-dla-firm/']] },
  en: { title: 'Services', entries: [['Services', '/en/services/'], ['Consulting', '/en/home-assistant-consultant/'], ['Services for businesses', '/en/services-for-businesses/']] },
  da: { title: 'Ydelser', entries: [['Ydelser', '/dk/ydelser/'], ['Rådgivning', '/dk/home-assistant-konsulent/'], ['Ydelser til virksomheder', '/dk/ydelser-til-virksomheder/']] }
}[document.documentElement.lang.split('-')[0].toLowerCase()];
if (serviceNavigation) {
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = '/pl-services-nav.css?v=20261015-business-i18n-1';
  document.head.append(sheet);
  document.querySelectorAll('.nav > nav > ul').forEach((list) => {
    const consulting = list.querySelector(`a[href="${serviceNavigation.entries[1][1]}"]`);
    if (!consulting) return;
    const item = consulting.closest('li');
    list.querySelector(`a[href="${serviceNavigation.entries[0][1]}"]`)?.closest('li').remove();
    item.dataset.services = '';
    const toggle = document.createElement('a');
    toggle.href = serviceNavigation.entries[0][1];
    toggle.textContent = serviceNavigation.title;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'services-submenu');
    const submenu = document.createElement('ul');
    submenu.id = 'services-submenu';
    submenu.hidden = true;
    const entries = serviceNavigation.entries;
    const current = window.location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
    entries.forEach(([label, href]) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      if (href === current) {
        link.setAttribute('aria-current', 'page');
        toggle.classList.add('is-section-active');
      }
      li.append(link);
      submenu.append(li);
    });
    item.replaceChildren(toggle, submenu);
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
}
