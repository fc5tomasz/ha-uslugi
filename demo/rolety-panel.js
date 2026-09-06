/* Panel premium "Sterowanie roletami": /pl/projekty/rolety/
   (w przygotowaniu: /dk/projekter/..., /en/projects/...).
   Demonstracja mozliwosci sterowania roletami w Home Assistant. Wszystkim
   steruje uzytkownik: przeciaga rolete w oknie, wybiera scene dnia albo
   uklada harmonogram. Nic nie dzieje sie samo.
   Bohater: okno z roleta, ktora PLYNNIE sie roluje (requestAnimationFrame),
   a wnetrze rozjasnia sie przy odslanianiu.
   Sterowanie pozycja 0-100% (0 = odslonieta, 100 = zasadonieta).
   PL na start; DK/EN dojda z tamtymi lokalami. */
(() => {
  const stage = document.getElementById("rlStage");
  const zonesMount = document.getElementById("rlZones");
  if (!stage || !zonesMount) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- teksty (PL / DK / EN) ---------------- */
  const normLang = (v) => {
    const s = (v || "").toLowerCase();
    if (s === "dk" || s.startsWith("dk-") || s === "da" || s.startsWith("da-")) return "dk";
    if (s === "en" || s.startsWith("en-")) return "en";
    return "pl";
  };
  const LANG = normLang(document.body.dataset.demoLang || document.documentElement.getAttribute("lang"));

  const STRINGS = {
    pl: {
      dateLocale: "pl-PL",
      zones: {
        salon: { name: "Salon", sub: "Strefa dzienna" },
        kuchnia: { name: "Kuchnia", sub: "Codzienny komfort" },
        sypialnia: { name: "Sypialnia", sub: "Spokój i prywatność" },
        gabinet: { name: "Gabinet", sub: "Praca i koncentracja" },
        lazienka: { name: "Łazienka", sub: "Komfort i dyskrecja" },
        kino: { name: "Kino / TV", sub: "Pełne wrażenia" },
      },
      posLabel: "zasłonięcie",
      setAria: (z) => `Pozycja rolety, ${z}`,
      dragHint: "Przeciągnij, aby zasłonić",
      presets: { open: "Odsłoń", half: "Połowa", close: "Zasłoń" },
      fsOpen: "Pełny ekran",
      fsClose: "Zamknij pełny ekran",
      states: { open: "Odsłonięta", part: "Częściowo", closed: "Zasłonięta" },
      zoneMode: { manual: "Ustawiona ręcznie", scene: (s) => `Scena ${s}` },
      sceneName: { dzien: "Dzień", wieczor: "Wieczór", prywatnosc: "Prywatność", kino: "Kino", nieobecnosc: "Nieobecność" },
      sceneShort: {
        dzien: "Rolety w całym domu odsłonięte, żeby wpuścić światło.",
        wieczor: "Rolety przyćmione do połowy, prywatność bez odcinania widoku.",
        prywatnosc: "Rolety zasłonięte, z zewnątrz nie widać wnętrza.",
        kino: "Strefa TV zaciemniona, salon przymknięty, reszta domu bez zmian.",
        nieobecnosc: "Wszystkie rolety zasłonięte, dom zamknięty na czas wyjścia.",
      },
      sceneLog: {
        dzien: "Scena Dzień: rolety odsłonięte.",
        wieczor: "Scena Wieczór: rolety przyciemnione.",
        prywatnosc: "Scena Prywatność: rolety zasłonięte.",
        kino: "Scena Kino: zaciemniona strefa TV i salon.",
        nieobecnosc: "Scena Nieobecność: wszystkie rolety zasłonięte.",
      },
      sceneToast: {
        dzien: "Scena Dzień. Rolety w całym domu odsłonięte, żeby wpuścić światło.",
        wieczor: "Scena Wieczór. Rolety przyćmione do połowy, prywatność bez odcinania widoku.",
        prywatnosc: "Scena Prywatność. Rolety zasłonięte, z zewnątrz nie widać wnętrza.",
        kino: "Scena Kino. Strefa TV zaciemniona, salon przymknięty, reszta domu bez zmian.",
        nieobecnosc: "Scena Nieobecność. Wszystkie rolety zasłonięte, dom zamknięty na czas wyjścia.",
      },
      kickerScene: "Aktywna scena",
      sysPrefix: "System",
      sysReady: "panel gotowy do sterowania.",
      manualLog: (zone, p) => `${zone}: roleta ${p}% (ręcznie).`,
      masterLog: (p) => `Wszystkie rolety ustawione na ${p}%.`,
      presetLog: (zone, p) => `${zone}: roleta ${p}%.`,
      startLog: "Panel uruchomiony. Scena Dzień aktywna.",
      schedAddLog: (s) => `Harmonogram: dodano regułę (${s}).`,
      schedDelLog: "Harmonogram: reguła usunięta.",
      schedAddToast: "Reguła dodana do harmonogramu. To tryb demonstracyjny, nic nie zapisuje się w Home Assistant.",
      schedTimes: (open, close) => `odsłania ${open}, zasłania ${close}`,
      schedNeedDay: "Wybierz przynajmniej jeden dzień tygodnia.",
      schedDel: "Usuń",
      schedDelAria: "Usuń regułę",
      dayAbbr: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
      daysEvery: "Codziennie",
      daysWorkweek: "Pn-Pt",
      daysWeekend: "Weekend",
      scopeAll: "Wszystkie rolety",
      seedLog: [
        { kind: "manual", text: "Salon: roleta 0%." },
        { kind: "scene", text: "Scena Wieczór: rolety przyciemnione." },
        { kind: "manual", text: "Sypialnia: roleta 100% (ręcznie)." },
        { kind: "scene", text: "Harmonogram: dodano regułę (Wszystkie rolety · Pn-Pt · odsłania 07:00, zasłania 21:30)." },
      ],
    },

    dk: {
      dateLocale: "da-DK",
      zones: {
        salon: { name: "Stue", sub: "Dagligområde" },
        kuchnia: { name: "Køkken", sub: "Hverdagskomfort" },
        sypialnia: { name: "Soveværelse", sub: "Ro og privatliv" },
        gabinet: { name: "Kontor", sub: "Arbejde og fokus" },
        lazienka: { name: "Badeværelse", sub: "Komfort og diskretion" },
        kino: { name: "Biograf / TV", sub: "Fuld fordybelse" },
      },
      posLabel: "lukning",
      setAria: (z) => `Rullegardinets position, ${z}`,
      dragHint: "Træk for at sænke",
      presets: { open: "Hæv", half: "Halvt", close: "Sænk" },
      fsOpen: "Fuld skærm",
      fsClose: "Luk fuld skærm",
      states: { open: "Hævet", part: "Delvist", closed: "Sænket" },
      zoneMode: { manual: "Indstillet manuelt", scene: (s) => `Scene ${s}` },
      sceneName: { dzien: "Dag", wieczor: "Aften", prywatnosc: "Privatliv", kino: "Biograf", nieobecnosc: "Fravær" },
      sceneShort: {
        dzien: "Rullegardinerne i hele hjemmet er hævet, så lyset kommer ind.",
        wieczor: "Rullegardinerne er sænket til det halve, privatliv uden at lukke for udsigten.",
        prywatnosc: "Rullegardinerne er sænket, man kan ikke se ind udefra.",
        kino: "TV-zonen er mørklagt, stuen er trukket for, resten af hjemmet er uændret.",
        nieobecnosc: "Alle rullegardiner er sænket, hjemmet er lukket, mens du er ude.",
      },
      sceneLog: {
        dzien: "Scene Dag: rullegardinerne er hævet.",
        wieczor: "Scene Aften: rullegardinerne er dæmpet.",
        prywatnosc: "Scene Privatliv: rullegardinerne er sænket.",
        kino: "Scene Biograf: TV-zonen og stuen er mørklagt.",
        nieobecnosc: "Scene Fravær: alle rullegardiner er sænket.",
      },
      sceneToast: {
        dzien: "Scene Dag. Rullegardinerne i hele hjemmet er hævet, så lyset kommer ind.",
        wieczor: "Scene Aften. Rullegardinerne er sænket til det halve, privatliv uden at lukke for udsigten.",
        prywatnosc: "Scene Privatliv. Rullegardinerne er sænket, man kan ikke se ind udefra.",
        kino: "Scene Biograf. TV-zonen er mørklagt, stuen er trukket for, resten af hjemmet er uændret.",
        nieobecnosc: "Scene Fravær. Alle rullegardiner er sænket, hjemmet er lukket, mens du er ude.",
      },
      kickerScene: "Aktiv scene",
      sysPrefix: "System",
      sysReady: "panelet er klar til styring.",
      manualLog: (zone, p) => `${zone}: rullegardin ${p}% (manuelt).`,
      masterLog: (p) => `Alle rullegardiner sat til ${p}%.`,
      presetLog: (zone, p) => `${zone}: rullegardin ${p}%.`,
      startLog: "Panelet er startet. Scene Dag er aktiv.",
      schedAddLog: (s) => `Tidsplan: regel tilføjet (${s}).`,
      schedDelLog: "Tidsplan: regel fjernet.",
      schedAddToast: "Regel tilføjet til tidsplanen. Dette er en demonstration, intet gemmes i Home Assistant.",
      schedTimes: (open, close) => `hæver ${open}, sænker ${close}`,
      schedNeedDay: "Vælg mindst en ugedag.",
      schedDel: "Fjern",
      schedDelAria: "Fjern regel",
      dayAbbr: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
      daysEvery: "Hver dag",
      daysWorkweek: "Man-fre",
      daysWeekend: "Weekend",
      scopeAll: "Alle rullegardiner",
      seedLog: [
        { kind: "manual", text: "Stue: rullegardin 0%." },
        { kind: "scene", text: "Scene Aften: rullegardinerne er dæmpet." },
        { kind: "manual", text: "Soveværelse: rullegardin 100% (manuelt)." },
        { kind: "scene", text: "Tidsplan: regel tilføjet (Alle rullegardiner · Man-fre · hæver 07:00, sænker 21:30)." },
      ],
    },

    en: {
      dateLocale: "en-GB",
      zones: {
        salon: { name: "Living room", sub: "Daytime zone" },
        kuchnia: { name: "Kitchen", sub: "Everyday comfort" },
        sypialnia: { name: "Bedroom", sub: "Calm and privacy" },
        gabinet: { name: "Home office", sub: "Work and focus" },
        lazienka: { name: "Bathroom", sub: "Comfort and discretion" },
        kino: { name: "Cinema / TV", sub: "Full immersion" },
      },
      posLabel: "closed",
      setAria: (z) => `Blind position, ${z}`,
      dragHint: "Drag to lower",
      presets: { open: "Open", half: "Half", close: "Close" },
      fsOpen: "Fullscreen",
      fsClose: "Exit fullscreen",
      states: { open: "Open", part: "Partly", closed: "Closed" },
      zoneMode: { manual: "Set manually", scene: (s) => `${s} scene` },
      sceneName: { dzien: "Day", wieczor: "Evening", prywatnosc: "Privacy", kino: "Cinema", nieobecnosc: "Away" },
      sceneShort: {
        dzien: "Blinds across the home are open to let the light in.",
        wieczor: "Blinds lowered halfway, privacy without cutting off the view.",
        prywatnosc: "Blinds are down, no one can see inside from outdoors.",
        kino: "The TV zone is darkened, the living room dimmed, the rest of the home unchanged.",
        nieobecnosc: "All blinds are down, the home closed while you are out.",
      },
      sceneLog: {
        dzien: "Day scene: blinds opened.",
        wieczor: "Evening scene: blinds dimmed.",
        prywatnosc: "Privacy scene: blinds lowered.",
        kino: "Cinema scene: TV zone and living room darkened.",
        nieobecnosc: "Away scene: all blinds lowered.",
      },
      sceneToast: {
        dzien: "Day scene. Blinds across the home are open to let the light in.",
        wieczor: "Evening scene. Blinds lowered halfway, privacy without cutting off the view.",
        prywatnosc: "Privacy scene. Blinds are down, no one can see inside from outdoors.",
        kino: "Cinema scene. The TV zone is darkened, the living room dimmed, the rest of the home unchanged.",
        nieobecnosc: "Away scene. All blinds are down, the home closed while you are out.",
      },
      kickerScene: "Active scene",
      sysPrefix: "System",
      sysReady: "panel ready for control.",
      manualLog: (zone, p) => `${zone}: blind ${p}% (manual).`,
      masterLog: (p) => `All blinds set to ${p}%.`,
      presetLog: (zone, p) => `${zone}: blind ${p}%.`,
      startLog: "Panel started. Day scene active.",
      schedAddLog: (s) => `Schedule: rule added (${s}).`,
      schedDelLog: "Schedule: rule removed.",
      schedAddToast: "Rule added to the schedule. This is a demonstration, nothing is saved in Home Assistant.",
      schedTimes: (open, close) => `opens ${open}, closes ${close}`,
      schedNeedDay: "Pick at least one day of the week.",
      schedDel: "Remove",
      schedDelAria: "Remove rule",
      dayAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      daysEvery: "Every day",
      daysWorkweek: "Mon-Fri",
      daysWeekend: "Weekend",
      scopeAll: "All blinds",
      seedLog: [
        { kind: "manual", text: "Living room: blind 0%." },
        { kind: "scene", text: "Evening scene: blinds dimmed." },
        { kind: "manual", text: "Bedroom: blind 100% (manual)." },
        { kind: "scene", text: "Schedule: rule added (All blinds · Mon-Fri · opens 07:00, closes 21:30)." },
      ],
    },
  };
  const t = STRINGS[LANG] || STRINGS.pl;

  const ZONE_IC = {
    salon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 4 0v6h-2v-2H5v2H3v-6a2 2 0 0 1 0-4Z"/></svg>',
    kuchnia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a3 3 0 0 0 6 0V3M9 3v18M17 3c-1.7 0-3 2-3 5s1.3 4 3 4v9"/></svg>',
    sypialnia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17v-5a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v4M3 13h16M3 17v3M21 14v6"/><path d="M7 10V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/></svg>',
    gabinet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
    lazienka: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V6a2 2 0 0 1 2-2c1 0 1.7.5 2 1.4"/><path d="M6 19l-1 2M19 19l1 2"/></svg>',
    kino: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  };
  const SCENE_IC = {
    dzien: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    wieczor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 3v4M4 8l2 2M20 8l-2 2"/></svg>',
    prywatnosc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    kino: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M8 5 6 9M14 5l-2 4M20 5l-2 4"/></svg>',
    nieobecnosc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  };

  /* ---------------- konfiguracja ---------------- */
  const BASE = "/assets/demo/rolety/";
  const ZONES = [
    { id: "salon", img: BASE + "strefa-salon.webp", base: 0 },
    { id: "kuchnia", img: BASE + "strefa-kuchnia.webp", base: 0 },
    { id: "sypialnia", img: BASE + "strefa-sypialnia.webp", base: 12 },
    { id: "gabinet", img: BASE + "strefa-gabinet.webp", base: 0 },
    { id: "lazienka", img: BASE + "strefa-lazienka.webp", base: 45 },
    { id: "kino", img: BASE + "strefa-kino.webp", base: 0 },
  ];
  const MOTOR_SPEED = 17;   // %/s -> pelne zamkniecie w ~6 s (spokojnie, jak silnik rolety)

  const SCENES = {
    dzien: { salon: 0, kuchnia: 0, sypialnia: 0, gabinet: 0, lazienka: 45, kino: 0 },
    wieczor: { salon: 58, kuchnia: 58, sypialnia: 66, gabinet: 58, lazienka: 82, kino: 62 },
    prywatnosc: { salon: 88, kuchnia: 100, sypialnia: 100, gabinet: 100, lazienka: 100, kino: 92 },
    kino: { kino: 100, salon: 90 },
    nieobecnosc: { salon: 100, kuchnia: 100, sypialnia: 100, gabinet: 100, lazienka: 100, kino: 100 },
  };

  const state = { scene: "dzien", lastAction: t.sysReady };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round = Math.round;
  const pad2 = (n) => String(n).padStart(2, "0");
  const clockHM = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
  const zoneName = (id) => t.zones[id].name;

  function stateKey(z) {
    if (z.pos <= 6) return "open";
    if (z.pos >= 94) return "closed";
    return "part";
  }
  const zoneModeText = (z) => z.manual ? t.zoneMode.manual : t.zoneMode.scene(t.sceneName[state.scene]);

  /* ---------------- budowa kart ---------------- */
  const els = {};
  ZONES.forEach((zone) => {
    zone.baseTarget = SCENES.dzien[zone.id] != null ? SCENES.dzien[zone.id] : zone.base;
    zone.pos = zone.baseTarget;
    zone.target = zone.pos;
    zone.manual = false;

    const art = document.createElement("article");
    art.className = "rl-zone";
    art.dataset.rlZone = zone.id;
    art.style.setProperty("--rl-zone-img", `url("${zone.img}")`);
    art.innerHTML = `
      <div class="rl-zone-top">
        <div class="rl-zone-id">
          <span class="rl-zone-ic">${ZONE_IC[zone.id]}</span>
          <div><h3>${zoneName(zone.id)}</h3><p>${t.zones[zone.id].sub}</p></div>
        </div>
        <div class="rl-zone-pos"><b data-rl-ref="pos">0%</b><i>${t.posLabel}</i></div>
      </div>
      <div class="rl-win" data-rl-ref="win">
        <div class="rl-win-view" aria-hidden="true"></div>
        <div class="rl-blind" data-rl-ref="blind" aria-hidden="true">
          <div class="rl-blind-face"></div>
          <div class="rl-blind-rail"><span class="rl-blind-grip"></span></div>
        </div>
        <div class="rl-blind-box" aria-hidden="true"></div>
        <div class="rl-win-frame" aria-hidden="true"></div>
        <span class="rl-zone-status" data-rl-ref="status"><span class="rl-dot"></span><span data-rl-ref="statusText">${t.states.open}</span></span>
        <span class="rl-win-hint" aria-hidden="true">${t.dragHint}</span>
      </div>
      <div class="rl-zone-ctrl">
        <input type="range" class="rl-range" data-rl-set min="0" max="100" step="1" value="0" aria-label="${t.setAria(zoneName(zone.id))}">
        <div class="rl-presets">
          <button class="rl-preset" type="button" data-rl-preset="0">${t.presets.open}</button>
          <button class="rl-preset" type="button" data-rl-preset="50">${t.presets.half}</button>
          <button class="rl-preset" type="button" data-rl-preset="100">${t.presets.close}</button>
        </div>
        <div class="rl-zone-mode"><span data-rl-ref="mode"></span></div>
      </div>
    `;
    zonesMount.appendChild(art);
    const q = (s) => art.querySelector(s);
    els[zone.id] = {
      root: art, win: q('[data-rl-ref="win"]'), blind: q('[data-rl-ref="blind"]'),
      status: q('[data-rl-ref="status"]'), statusText: q('[data-rl-ref="statusText"]'),
      pos: q('[data-rl-ref="pos"]'), mode: q('[data-rl-ref="mode"]'),
      range: q("[data-rl-set]"), presets: Array.from(art.querySelectorAll("[data-rl-preset]")),
    };
  });

  /* ---------------- referencje ---------------- */
  const R = (s) => document.querySelector(s);
  const refs = {
    statusIc: R('[data-rl="statusIc"]'),
    statusKicker: R('[data-rl="statusKicker"]'),
    statusTitle: R('[data-rl="statusTitle"]'),
    statusDesc: R('[data-rl="statusDesc"]'),
    statusSys: R('[data-rl="statusSys"]'),
    condClock: R('[data-rl="condClock"]'),
    condDate: R('[data-rl="condDate"]'),
    masterRange: R("[data-rl-master]"),
    masterOpen: R('[data-rl="masterOpen"]'),
    masterAvg: R('[data-rl="masterAvg"]'),
    masterPresets: Array.from(document.querySelectorAll("[data-rl-master-preset]")),
    modeBtns: Array.from(document.querySelectorAll("[data-rl-mode]")),
    schedForm: R("[data-rl-sched-form]"),
    schedScope: R("[data-rl-sched-scope]"),
    schedDays: R("[data-rl-sched-days]"),
    schedOpen: R("[data-rl-sched-open]"),
    schedClose: R("[data-rl-sched-close]"),
    schedList: R("[data-rl-sched-list]"),
    log: R('[data-rl="log"]'),
    toast: R("[data-rl-toast]"),
  };

  /* ---------------- dziennik + toast ---------------- */
  function logRow(kind, text, timeStr) {
    if (!refs.log) return;
    const li = document.createElement("li");
    li.dataset.kind = kind;
    li.innerHTML = `<span class="rl-log-time">${timeStr}</span><span class="rl-log-ic"></span><span class="rl-log-txt">${text}</span>`;
    refs.log.prepend(li);
    while (refs.log.children.length > 16) refs.log.lastElementChild.remove();
  }
  function logEvent(kind, text) { state.lastAction = text; logRow(kind, text, clockHM()); renderStatus(); }
  function seedLog() {
    const base = new Date(Date.now() - 12 * 60000);
    t.seedLog.forEach((row, i) => {
      const d = new Date(base.getTime() + i * 3 * 60000);
      logRow(row.kind, row.text, `${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
    });
  }
  let toastTimer = null;
  function toast(msg) {
    if (!refs.toast) return;
    refs.toast.textContent = msg;
    refs.toast.hidden = false;
    requestAnimationFrame(() => refs.toast.classList.add("is-shown"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      refs.toast.classList.remove("is-shown");
      setTimeout(() => { refs.toast.hidden = true; }, 220);
    }, 4600);
  }

  /* ---------------- render ---------------- */
  function renderZone(zone) {
    const e = els[zone.id];
    const key = stateKey(zone);
    e.blind.style.height = `${clamp(zone.pos, 0, 100)}%`;
    e.win.style.setProperty("--rl-dim", clamp((zone.pos - 8) / 84, 0, 1).toFixed(3));
    e.statusText.textContent = t.states[key];
    e.status.dataset.state = key;
    e.pos.textContent = `${round(zone.pos)}%`;
    e.mode.textContent = zoneModeText(zone);
    const shown = round(zone.baseTarget);
    if (document.activeElement !== e.range && !zone._dragging) e.range.value = String(shown);
    e.range.style.setProperty("--rl-fill", `${shown}%`);
    e.presets.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.rlPreset) === shown));
  }
  function renderStatus() {
    refs.statusIc.innerHTML = SCENE_IC[state.scene] || SCENE_IC.dzien;
    refs.statusKicker.textContent = t.kickerScene;
    refs.statusTitle.textContent = t.sceneName[state.scene];
    refs.statusDesc.textContent = t.sceneShort[state.scene];
    refs.statusSys.innerHTML = `<b>${t.sysPrefix}:</b> ${state.lastAction}`;
  }
  function renderClock() {
    const d = new Date();
    refs.condClock.textContent = clockHM();
    refs.condDate.textContent = d.toLocaleDateString(t.dateLocale, { weekday: "long", day: "numeric", month: "long" });
  }
  function renderMaster() {
    const openN = ZONES.filter((z) => z.pos <= 25).length;
    const avg = round(ZONES.reduce((s, z) => s + z.pos, 0) / ZONES.length);
    refs.masterOpen.textContent = String(openN);
    refs.masterAvg.textContent = `${avg}%`;
    if (document.activeElement !== refs.masterRange) refs.masterRange.value = String(avg);
    refs.masterRange.style.setProperty("--rl-fill", `${avg}%`);
  }
  function markModes() {
    refs.modeBtns.forEach((b) => {
      const on = b.dataset.rlMode === state.scene;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function renderZonesLight() { ZONES.forEach(renderZone); renderMaster(); }
  function renderAll() { ZONES.forEach(renderZone); renderStatus(); renderMaster(); markModes(); }

  /* ---------------- plynne rolowanie (rAF) ---------------- */
  let lastFrame = 0;
  function animLoop(ts) {
    const dt = lastFrame ? Math.min(0.2, (ts - lastFrame) / 1000) : 0.016;
    lastFrame = ts;
    let moving = false;
    ZONES.forEach((z) => {
      if (z._dragging) return;
      const d = z.target - z.pos;
      if (Math.abs(d) < 0.2) { if (z.pos !== z.target) { z.pos = z.target; moving = true; } return; }
      // stala predkosc + lagodne wyhamowanie na ostatnich 10%
      const ease = 0.4 + 0.6 * Math.min(1, Math.abs(d) / 10);
      z.pos += Math.sign(d) * Math.min(Math.abs(d), MOTOR_SPEED * dt * ease);
      moving = true;
    });
    if (moving) renderZonesLight();
    requestAnimationFrame(animLoop);
  }

  /* ---------------- sceny ---------------- */
  function applyScene(scene) {
    state.scene = scene;
    const map = SCENES[scene] || {};
    ZONES.forEach((z) => { if (map[z.id] != null) { z.baseTarget = map[z.id]; z.manual = false; z.target = map[z.id]; } });
    if (prefersReduced) ZONES.forEach((z) => { z.pos = z.target; });
    markModes();
    logEvent("scene", t.sceneLog[scene]);
    toast(t.sceneToast[scene]);
    renderAll();
  }
  refs.modeBtns.forEach((b) => b.addEventListener("click", () => { if (b.dataset.rlMode) applyScene(b.dataset.rlMode); }));

  /* ---------------- sterowanie strefami ---------------- */
  function setZoneBase(zone, value, opts = {}) {
    const v = clamp(round(value), 0, 100);
    zone.baseTarget = v;
    zone.target = v;
    zone.manual = true;
    if (prefersReduced) zone.pos = v;
    if (opts.log) logEvent("manual", t.presetLog(zoneName(zone.id), v));
    renderAll();
  }
  function setAll(value, opts = {}) {
    const v = clamp(round(value), 0, 100);
    ZONES.forEach((z) => { z.baseTarget = v; z.target = v; z.manual = true; if (prefersReduced) z.pos = v; });
    if (opts.log) logEvent("manual", t.masterLog(v));
    renderAll();
  }

  zonesMount.addEventListener("input", (ev) => {
    const r = ev.target.closest("[data-rl-set]");
    if (!r) return;
    setZoneBase(ZONES.find((z) => z.id === r.closest(".rl-zone").dataset.rlZone), Number(r.value));
  });
  zonesMount.addEventListener("change", (ev) => {
    const r = ev.target.closest("[data-rl-set]");
    if (!r) return;
    const zone = ZONES.find((z) => z.id === r.closest(".rl-zone").dataset.rlZone);
    logEvent("manual", t.manualLog(zoneName(zone.id), clamp(round(Number(r.value)), 0, 100)));
  });
  zonesMount.addEventListener("click", (ev) => {
    const p = ev.target.closest("[data-rl-preset]");
    if (!p) return;
    setZoneBase(ZONES.find((z) => z.id === p.closest(".rl-zone").dataset.rlZone), Number(p.dataset.rlPreset), { log: true });
  });

  // przeciaganie rolety w oknie
  ZONES.forEach((zone) => {
    const win = els[zone.id].win;
    let raf = 0;
    const apply = (clientY) => {
      const r = win.getBoundingClientRect();
      const v = clamp(((clientY - r.top) / r.height) * 100, 0, 100);
      zone.baseTarget = v; zone.pos = v; zone.target = v; zone.manual = true; zone._dragging = true;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; renderAll(); });
    };
    win.addEventListener("pointerdown", (ev) => {
      if (ev.target.closest(".rl-preset")) return;
      win.setPointerCapture(ev.pointerId);
      apply(ev.clientY);
    });
    win.addEventListener("pointermove", (ev) => { if (win.hasPointerCapture(ev.pointerId)) apply(ev.clientY); });
    const end = (ev) => {
      if (!zone._dragging) return;
      zone._dragging = false;
      try { win.releasePointerCapture(ev.pointerId); } catch (e) {}
      logEvent("manual", t.manualLog(zoneName(zone.id), round(zone.baseTarget)));
      renderAll();
    };
    win.addEventListener("pointerup", end);
    win.addEventListener("pointercancel", end);
  });

  refs.masterRange.addEventListener("input", () => setAll(Number(refs.masterRange.value)));
  refs.masterRange.addEventListener("change", () => logEvent("manual", t.masterLog(clamp(round(Number(refs.masterRange.value)), 0, 100))));
  refs.masterPresets.forEach((b) => b.addEventListener("click", () => setAll(Number(b.dataset.rlMasterPreset), { log: true })));

  /* ---------------- harmonogram ---------------- */
  const schedRules = [];
  function scopeSel() {
    const btns = Array.from(refs.schedScope.querySelectorAll("[data-zone]"));
    const chosen = btns.filter((b) => b.classList.contains("is-on")).map((b) => b.dataset.zone);
    const all = refs.schedScope.querySelector('[data-scope="all"]').classList.contains("is-on");
    return all || chosen.length === 0 ? "all" : chosen;
  }
  function scopeText(scope) {
    if (scope === "all") return t.scopeAll;
    return scope.map((id) => zoneName(id)).join(", ");
  }
  function daysSel() {
    return Array.from(refs.schedDays.querySelectorAll(".is-on")).map((b) => Number(b.dataset.day)).sort((a, b) => a - b);
  }
  function daysText(days) {
    if (days.length === 7) return t.daysEvery;
    if (days.length === 5 && days.join() === "1,2,3,4,5") return t.daysWorkweek;
    if (days.length === 2 && days.join() === "0,6") return t.daysWeekend;
    return days.map((d) => t.dayAbbr[d]).join(" ");
  }
  function renderSched() {
    refs.schedList.innerHTML = "";
    schedRules.forEach((rule) => {
      const li = document.createElement("li");
      li.className = "rl-sched-item";
      li.innerHTML = `
        <span class="rl-sched-item-body">
          <b>${scopeText(rule.scope)}</b>
          <i>${daysText(rule.days)} · ${t.schedTimes(rule.open, rule.close)}</i>
        </span>
        <button type="button" class="rl-sched-del" data-rule="${rule.id}" aria-label="${t.schedDelAria}">${t.schedDel}</button>`;
      refs.schedList.appendChild(li);
    });
  }
  refs.schedScope.addEventListener("click", (ev) => {
    const b = ev.target.closest("button");
    if (!b) return;
    if (b.dataset.scope === "all") {
      refs.schedScope.querySelectorAll("[data-zone]").forEach((z) => z.classList.remove("is-on"));
      b.classList.add("is-on");
    } else {
      b.classList.toggle("is-on");
      const anyZone = refs.schedScope.querySelector("[data-zone].is-on");
      refs.schedScope.querySelector('[data-scope="all"]').classList.toggle("is-on", !anyZone);
    }
  });
  refs.schedDays.addEventListener("click", (ev) => {
    const b = ev.target.closest("button");
    if (b) b.classList.toggle("is-on");
  });
  refs.schedForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const days = daysSel();
    if (!days.length) { toast(t.schedNeedDay); return; }
    const rule = {
      id: "r" + Date.now(),
      scope: scopeSel(),
      days,
      open: refs.schedOpen.value || "07:00",
      close: refs.schedClose.value || "21:30",
    };
    schedRules.unshift(rule);
    renderSched();
    const summary = `${scopeText(rule.scope)} · ${daysText(rule.days)} · ${t.schedTimes(rule.open, rule.close)}`;
    logEvent("scene", t.schedAddLog(summary));
    toast(t.schedAddToast);
  });
  refs.schedList.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-rule]");
    if (!b) return;
    const i = schedRules.findIndex((r) => r.id === b.dataset.rule);
    if (i > -1) { schedRules.splice(i, 1); renderSched(); logEvent("scene", t.schedDelLog); }
  });

  /* ---------------- pelny ekran ---------------- */
  const fsButtons = Array.from(document.querySelectorAll("[data-rl-fs]"));
  const fsPanel = document.getElementById("rlPanel");
  const canNativeFs = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
  const FS_MARGIN = 26, FS_MIN_W = 900;
  const isFs = () => document.fullscreenElement === stage || document.webkitFullscreenElement === stage || stage.classList.contains("is-rl-pseudo-fs");
  function fitFullscreen() {
    if (!fsPanel) return;
    if (!isFs() || window.innerWidth < FS_MIN_W) { fsPanel.style.removeProperty("--rl-fs-scale"); return; }
    fsPanel.style.removeProperty("--rl-fs-scale");
    const pw = fsPanel.offsetWidth || 1, ph = fsPanel.offsetHeight || 1;
    const s = Math.min((window.innerWidth - FS_MARGIN * 2) / pw, (window.innerHeight - FS_MARGIN * 2) / ph, 2.2);
    fsPanel.style.setProperty("--rl-fs-scale", (s > 0 ? s : 1).toFixed(3));
  }
  function syncFsUi() {
    const on = isFs();
    document.body.classList.toggle("is-rl-fullscreen", on);
    stage.classList.toggle("is-rl-fullscreen", on);
    fsButtons.forEach((b) => {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      const l = b.querySelector(".rl-fs-label");
      if (l) l.textContent = on ? t.fsClose : t.fsOpen;
    });
    fitFullscreen(); requestAnimationFrame(fitFullscreen); setTimeout(fitFullscreen, 220);
  }
  let fsResizeTimer = null;
  window.addEventListener("resize", () => { if (isFs()) { clearTimeout(fsResizeTimer); fsResizeTimer = setTimeout(fitFullscreen, 120); } });
  const pseudoFs = () => { stage.classList.add("is-rl-pseudo-fs"); syncFsUi(); };
  function enterFs() {
    if (!canNativeFs) return pseudoFs();
    try {
      const req = (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      if (req && typeof req.catch === "function") req.catch(pseudoFs);
    } catch (e) { pseudoFs(); }
  }
  function exitFs() {
    if (stage.classList.contains("is-rl-pseudo-fs")) { stage.classList.remove("is-rl-pseudo-fs"); syncFsUi(); return; }
    (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
  }
  fsButtons.forEach((b) => b.addEventListener("click", () => (isFs() ? exitFs() : enterFs())));
  document.addEventListener("fullscreenchange", syncFsUi);
  document.addEventListener("webkitfullscreenchange", syncFsUi);
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && stage.classList.contains("is-rl-pseudo-fs")) exitFs(); });

  /* ---------------- start ---------------- */
  schedRules.push({ id: "seed", scope: "all", days: [1, 2, 3, 4, 5], open: "07:00", close: "21:30" });
  renderSched();
  renderAll();
  renderClock();
  syncFsUi();
  seedLog();
  logEvent("scene", t.startLog);
  setInterval(renderClock, 20000);
  if (!prefersReduced) requestAnimationFrame(animLoop);
})();
