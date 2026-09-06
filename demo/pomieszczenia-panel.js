/* Panel premium "Sterowanie pomieszczeniami":
   /pl/projekty/pomieszczenia/, /dk/projekter/rum/, /en/projects/rooms/.
   W pelni symulowana demonstracja: trzy rownorzedne pokoje (Salon, Sypialnia,
   Lazienka), kazdy z wlasnym, niezaleznym i zapamietanym kompletem sterowania
   (swiatlo + sceny, rolety i zaslony, klimat pokoju, radio internetowe).
   Przelacznik zmienia pokoj z plynnym przejsciem. Pasek scen domowych na dole
   dziala na wszystkie pokoje naraz. Brak polaczenia z Home Assistant, stany
   zyja tylko w tej karcie. Jezyk sterowany atrybutem data-demo-lang.
   Fizyka symulacji trzymana osobno od renderu i i18n. */
(() => {
  const stage = document.getElementById("rmStage");
  const panel = document.getElementById("rmPanel");
  if (!stage || !panel) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- jezyk ---------------- */
  const normLang = (v) => {
    const s = (v || "").toLowerCase();
    if (s === "dk" || s.startsWith("dk-") || s === "da" || s.startsWith("da-")) return "dk";
    if (s === "en" || s.startsWith("en-")) return "en";
    return "pl";
  };
  const LANG = normLang(document.body.dataset.demoLang || document.documentElement.getAttribute("lang"));

  const STRINGS = {
    pl: {
      decimalSep: ",",
      rooms: {
        salon: { name: "Salon", tag: "Miejsce, w którym dom tętni życiem." },
        sypialnia: { name: "Sypialnia", tag: "Spokój, prywatność, odpoczynek." },
        lazienka: { name: "Łazienka", tag: "Komfort w każdym szczególe." },
      },
      eyebrow: "Projekt · Sterowanie pomieszczeniami",
      roomSwitchAria: "Wybór pokoju",
      outside: "Na zewnątrz",
      allGoodTitle: "Wszystko w porządku",
      allGoodNote: "Wszystkie systemy działają prawidłowo.",
      demoBadge: "Tryb demonstracyjny",
      fsOpen: "Pełny ekran",
      fsClose: "Zamknij pełny ekran",

      lightTitle: "Światło",
      lightNote: "Stwórz odpowiedni nastrój.",
      sceneLabel: "Sceny",
      groupLabel: "Grupy świateł",
      scenes: {
        relaks: "Relaks", czytanie: "Czytanie", film: "Film", sen: "Do snu",
        kapiel: "Kąpiel", poranek: "Poranek", off: "Wył.",
      },
      groups: {
        main: "Główne", mood: "Nastrojowe", tv: "Strefa TV",
        night: "Nocne", mirror: "Lustro",
      },
      lightState: (n) => n > 0 ? `Włączone · ${n}%` : "Wyłączone",

      blindsTitle: "Rolety i zasłony",
      blindsNote: "Kontrola światła i prywatności.",
      blinds: {
        taras: "Roleta tarasowa", firana: "Firana", dach: "Okno dachowe",
        black: "Roleta zaciemniająca", okno: "Roleta okienna",
      },
      blindOpen: "Otwarta",
      blindClosed: "Zamknięta",
      blindPartial: (openPct) => `Otwarta w ${openPct}%`,
      blindUp: "Otwórz", blindStop: "Stop", blindDown: "Zamknij",
      blindAria: (name) => `Roleta: ${name}`,

      climateTitle: "Klimat pokoju",
      climateNote: "Idealna temperatura przez cały rok.",
      climateNow: (v) => `Aktualnie: ${v}`,
      climateModes: { auto: "Auto", chlodzenie: "Chłodzenie", grzanie: "Grzanie", wentylator: "Wentylator" },
      climateOn: "Włączony", climateOff: "Wyłączony",
      climateOnNote: "Utrzymuje komfortową temperaturę.", climateOffNote: "Sterowanie klimatem wstrzymane.",
      climatePlus: "Podnieś temperaturę", climateMinus: "Obniż temperaturę",
      floorTitle: "Ogrzewanie podłogowe",
      floorOn: "Włączone", floorOff: "Wyłączone",

      radioTitle: "Radio internetowe",
      radioNote: "Twoja muzyka w każdym momencie.",
      radioStations: {
        radioNova: "Radio Nova", jazzCafe: "Jazz Cafe", klasyka: "Klasyka FM",
        sleepRadio: "Sleep Radio", nocneFale: "Nocne Fale", ambient: "Ambient Sleep",
        spaRelax: "Spa & Relax", porannaKawa: "Poranna Kawa", chillout: "Chillout",
      },
      radioKind: "Radio internetowe",
      radioPlay: "Odtwarzaj", radioPause: "Pauza", radioPrev: "Poprzednia stacja", radioNext: "Następna stacja",
      radioVol: "Głośność",
      radioPaused: "Wstrzymane",

      homeScenesTitle: "Sceny domowe",
      homeScenesNote: "Jednym kliknięciem zmień atmosferę w całym domu.",
      homeScenes: {
        dziendobry: { name: "Dzień dobry", desc: "Otwiera rolety, włącza światła i ustawia komfortową temperaturę." },
        dobranoc: { name: "Dobranoc", desc: "Wyłącza światła, zamyka rolety i obniża temperaturę." },
        wychodze: { name: "Wychodzę", desc: "Wyłącza wszystkie urządzenia i zabezpiecza dom." },
        film: { name: "Film", desc: "Przyciemnia światła, zamyka zasłony i tworzy kinowy nastrój." },
        relaks: { name: "Relaks", desc: "Ciepłe, spokojne światło i wyciszona muzyka w całym domu." },
        kapiel: { name: "Kąpiel", desc: "Ciepłe światło, ogrzewanie podłogowe i spokojny nastrój." },
      },
      homeSceneAria: "Sceny domowe, działają na wszystkie pokoje",

      foot: "Eleganckie sterowanie pomieszczeniami. Większy komfort na co dzień.",
      footTags: "Twój inteligentny dom · Komfort · Nastrój · Prywatność",

      toastRoom: (name) => `Pokój: ${name}. Każdy pokój ma własny, zapamiętany komplet ustawień.`,
      toastScene: (name) => `Scena światła: ${name}.`,
      toastHome: (name) => `Scena domowa „${name}" uruchomiona we wszystkich pokojach.`,
      toastClimate: (on) => on ? "Klimat pokoju włączony." : "Klimat pokoju wyłączony.",
      toastFloor: (on) => on ? "Ogrzewanie podłogowe włączone." : "Ogrzewanie podłogowe wyłączone.",
      toastRadio: (playing, station) => playing ? `Odtwarzanie: ${station}.` : "Odtwarzanie wstrzymane.",
      toastStation: (station) => `Stacja: ${station}.`,

      statusLightsOff: "światła wył.",
      statusClimateOff: "klimat wył.",
      statusRadioOn: "radio gra",
      statusRadioOff: "radio wył.",
      lightWord: (n) => n === 1 ? "światło" : (n >= 2 && n <= 4 ? "światła" : "świateł"),
      lastPrefix: "Ostatnio",
      lastReady: "panel gotowy",
      act: {
        scene: (room, name) => `${room}: scena ${name}`,
        light: (room, grp, n) => n > 0 ? `${room}: światło ${grp} ${n}%` : `${room}: światło ${grp} wył.`,
        blind: (room, name, dir) => dir ? `${room}: ${name}, ${dir}` : `${room}: ${name}`,
        blindDir: { up: "otwieranie", down: "zamykanie", stop: "stop" },
        climateSet: (room, v) => `${room}: klimat ${v}`,
        climateMode: (room, m) => `${room}: tryb ${m}`,
        climatePower: (room, on) => `${room}: klimat ${on ? "włączony" : "wyłączony"}`,
        floor: (room, on) => `${room}: podłogówka ${on ? "włączona" : "wyłączona"}`,
        floorSet: (room, v) => `${room}: podłogówka ${v}`,
        radioToggle: (room, on) => `${room}: ${on ? "odtwarzanie" : "pauza"}`,
        station: (room, s) => `${room}: stacja ${s}`,
        room: (name) => `pokój ${name}`,
        home: (name) => `scena domowa ${name}`,
      },

      days: ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."],
      months: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"],
    },

    dk: {
      decimalSep: ",",
      rooms: {
        salon: { name: "Stue", tag: "Stedet, hvor hjemmet summer af liv." },
        sypialnia: { name: "Soveværelse", tag: "Ro, privatliv og hvile." },
        lazienka: { name: "Badeværelse", tag: "Komfort i hver detalje." },
      },
      eyebrow: "Projekt · Rumstyring",
      fsOpen: "Fuld skærm",
      fsClose: "Luk fuld skærm",

      scenes: {
        relaks: "Afslapning", czytanie: "Læsning", film: "Film", sen: "Sovetid",
        kapiel: "Bad", poranek: "Morgen", off: "Sluk",
      },
      groups: {
        main: "Hovedlys", mood: "Stemning", tv: "TV-zone",
        night: "Natlys", mirror: "Spejl",
      },
      lightState: (n) => n > 0 ? `Tændt · ${n}%` : "Slukket",

      blinds: {
        taras: "Terrassegardin", firana: "Forhæng", dach: "Ovenlysvindue",
        black: "Mørklægningsgardin", okno: "Vinduesgardin",
      },
      blindOpen: "Åben",
      blindClosed: "Lukket",
      blindPartial: (openPct) => `Åben ${openPct}%`,
      blindUp: "Åbn", blindStop: "Stop", blindDown: "Luk",

      climateNow: (v) => `Nu: ${v}`,
      climateModes: { auto: "Auto", chlodzenie: "Køling", grzanie: "Varme", wentylator: "Ventilator" },
      climateOn: "Tændt", climateOff: "Slukket",
      climateOnNote: "Holder en behagelig temperatur.", climateOffNote: "Klimastyring sat på pause.",
      floorOn: "Tændt", floorOff: "Slukket",

      radioStations: {
        radioNova: "Radio Nova", jazzCafe: "Jazz Cafe", klasyka: "Klassisk FM",
        sleepRadio: "Sleep Radio", nocneFale: "Nattetimer", ambient: "Ambient Sleep",
        spaRelax: "Spa & Relax", porannaKawa: "Morgenkaffe", chillout: "Chillout",
      },
      radioKind: "Internetradio",
      radioPlay: "Afspil", radioPause: "Pause", radioPrev: "Forrige station", radioNext: "Næste station",
      radioPaused: "Sat på pause",

      homeScenes: {
        dziendobry: { name: "Godmorgen", desc: "Åbner gardiner, tænder lys og sætter en behagelig temperatur." },
        dobranoc: { name: "Godnat", desc: "Slukker lyset, lukker gardiner og sænker temperaturen." },
        wychodze: { name: "Jeg går", desc: "Slukker alle enheder og sikrer hjemmet." },
        film: { name: "Film", desc: "Dæmper lyset, lukker forhæng og skaber biografstemning." },
        relaks: { name: "Afslapning", desc: "Varmt, roligt lys og dæmpet musik i hele hjemmet." },
        kapiel: { name: "Bad", desc: "Varmt lys, gulvvarme og en rolig stemning." },
      },

      toastRoom: (name) => `Rum: ${name}. Hvert rum har sit eget, gemte sæt indstillinger.`,
      toastScene: (name) => `Lysscene: ${name}.`,
      toastHome: (name) => `Hjemmescenen „${name}" er aktiveret i alle rum.`,
      toastClimate: (on) => on ? "Rumklima tændt." : "Rumklima slukket.",
      toastFloor: (on) => on ? "Gulvvarme tændt." : "Gulvvarme slukket.",
      toastRadio: (playing, station) => playing ? `Afspiller: ${station}.` : "Afspilning sat på pause.",
      toastStation: (station) => `Station: ${station}.`,

      statusLightsOff: "lys slukket",
      statusClimateOff: "klima slukket",
      statusRadioOn: "radio spiller",
      statusRadioOff: "radio slukket",
      lightWord: () => "lys",
      lastPrefix: "Senest",
      lastReady: "panel klar",
      act: {
        scene: (room, name) => `${room}: scene ${name}`,
        light: (room, grp, n) => n > 0 ? `${room}: ${grp} ${n}%` : `${room}: ${grp} slukket`,
        blind: (room, name, dir) => dir ? `${room}: ${name}, ${dir}` : `${room}: ${name}`,
        blindDir: { up: "åbner", down: "lukker", stop: "stop" },
        climateSet: (room, v) => `${room}: klima ${v}`,
        climateMode: (room, m) => `${room}: tilstand ${m}`,
        climatePower: (room, on) => `${room}: klima ${on ? "tændt" : "slukket"}`,
        floor: (room, on) => `${room}: gulvvarme ${on ? "tændt" : "slukket"}`,
        floorSet: (room, v) => `${room}: gulvvarme ${v}`,
        radioToggle: (room, on) => `${room}: ${on ? "afspiller" : "pause"}`,
        station: (room, s) => `${room}: station ${s}`,
        room: (name) => `rum ${name}`,
        home: (name) => `hjemmescene ${name}`,
      },

      days: ["søn.", "man.", "tir.", "ons.", "tor.", "fre.", "lør."],
      months: ["jan.", "feb.", "mar.", "apr.", "maj", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "dec."],
    },

    en: {
      decimalSep: ".",
      rooms: {
        salon: { name: "Living room", tag: "The place where the home comes alive." },
        sypialnia: { name: "Bedroom", tag: "Calm, privacy and rest." },
        lazienka: { name: "Bathroom", tag: "Comfort in every detail." },
      },
      eyebrow: "Project · Room control",
      fsOpen: "Fullscreen",
      fsClose: "Exit fullscreen",

      scenes: {
        relaks: "Relax", czytanie: "Reading", film: "Film", sen: "Bedtime",
        kapiel: "Bath", poranek: "Morning", off: "Off",
      },
      groups: {
        main: "Main", mood: "Ambient", tv: "TV zone",
        night: "Night", mirror: "Mirror",
      },
      lightState: (n) => n > 0 ? `On · ${n}%` : "Off",

      blinds: {
        taras: "Terrace blind", firana: "Sheer curtain", dach: "Roof window",
        black: "Blackout blind", okno: "Window blind",
      },
      blindOpen: "Open",
      blindClosed: "Closed",
      blindPartial: (openPct) => `Open ${openPct}%`,
      blindUp: "Open", blindStop: "Stop", blindDown: "Close",

      climateNow: (v) => `Now: ${v}`,
      climateModes: { auto: "Auto", chlodzenie: "Cooling", grzanie: "Heating", wentylator: "Fan" },
      climateOn: "On", climateOff: "Off",
      climateOnNote: "Keeps a comfortable temperature.", climateOffNote: "Climate control paused.",
      floorOn: "On", floorOff: "Off",

      radioStations: {
        radioNova: "Radio Nova", jazzCafe: "Jazz Cafe", klasyka: "Classic FM",
        sleepRadio: "Sleep Radio", nocneFale: "Night Waves", ambient: "Ambient Sleep",
        spaRelax: "Spa & Relax", porannaKawa: "Morning Coffee", chillout: "Chillout",
      },
      radioKind: "Internet radio",
      radioPlay: "Play", radioPause: "Pause", radioPrev: "Previous station", radioNext: "Next station",
      radioPaused: "Paused",

      homeScenes: {
        dziendobry: { name: "Good morning", desc: "Opens the blinds, turns on the lights and sets a comfortable temperature." },
        dobranoc: { name: "Good night", desc: "Turns off the lights, closes the blinds and lowers the temperature." },
        wychodze: { name: "Leaving", desc: "Turns off every device and secures the home." },
        film: { name: "Film", desc: "Dims the lights, closes the curtains and sets a cinema mood." },
        relaks: { name: "Relax", desc: "Warm, calm light and quiet music throughout the home." },
        kapiel: { name: "Bath", desc: "Warm light, underfloor heating and a calm mood." },
      },

      toastRoom: (name) => `Room: ${name}. Each room keeps its own saved set of settings.`,
      toastScene: (name) => `Light scene: ${name}.`,
      toastHome: (name) => `Home scene “${name}” activated in every room.`,
      toastClimate: (on) => on ? "Room climate on." : "Room climate off.",
      toastFloor: (on) => on ? "Underfloor heating on." : "Underfloor heating off.",
      toastRadio: (playing, station) => playing ? `Playing: ${station}.` : "Playback paused.",
      toastStation: (station) => `Station: ${station}.`,

      statusLightsOff: "lights off",
      statusClimateOff: "climate off",
      statusRadioOn: "radio playing",
      statusRadioOff: "radio off",
      lightWord: (n) => n === 1 ? "light" : "lights",
      lastPrefix: "Last",
      lastReady: "panel ready",
      act: {
        scene: (room, name) => `${room}: scene ${name}`,
        light: (room, grp, n) => n > 0 ? `${room}: ${grp} light ${n}%` : `${room}: ${grp} light off`,
        blind: (room, name, dir) => dir ? `${room}: ${name}, ${dir}` : `${room}: ${name}`,
        blindDir: { up: "opening", down: "closing", stop: "stop" },
        climateSet: (room, v) => `${room}: climate ${v}`,
        climateMode: (room, m) => `${room}: mode ${m}`,
        climatePower: (room, on) => `${room}: climate ${on ? "on" : "off"}`,
        floor: (room, on) => `${room}: underfloor heating ${on ? "on" : "off"}`,
        floorSet: (room, v) => `${room}: underfloor heating ${v}`,
        radioToggle: (room, on) => `${room}: ${on ? "playing" : "paused"}`,
        station: (room, s) => `${room}: station ${s}`,
        room: (name) => `room ${name}`,
        home: (name) => `home scene ${name}`,
      },

      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
  };
  const t = STRINGS[LANG] || STRINGS.pl;

  /* ---------------- ikony ---------------- */
  const SVG = {
    salon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v6h-2v-2H5v2H3v-6a2 2 0 0 1 0-4Z"/></svg>',
    sypialnia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17v-5a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v4M3 13h16M3 17v3M21 14v6"/><path d="M7 10V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/></svg>',
    lazienka: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V6a2 2 0 0 1 2-2c1 0 1.7.5 2 1.4"/><path d="M6 19l-1 2M19 19l1 2"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.3-1 2.5H9c0-1.2-.3-1.8-1-2.5A6 6 0 0 1 12 3Z"/></svg>',
    blinds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 8h16M4 12h16M4 16h16"/></svg>',
    climate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z"/><path d="M12 9v6"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.6 3.6M20.4 20.4 19 19M5 19l-1.4 1.4M20.4 3.6 19 5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 10h5M16 10h5M3 14h5M16 14h5"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4S9 3 5.5 10.5C3 15.7 6.5 20 6.5 20S18 20 20 8c.4-2.4 0-4 0-4Z"/><path d="M5 20c3-7 8-11 13-13"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V6a2 2 0 0 1 2-2c1 0 1.7.5 2 1.4"/></svg>',
    door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h8M14 3l4 2v14l-4 2M14 3v18M11 12h.01"/></svg>',
    chevUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>',
    chevDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 5v14l-9-7ZM7 5h2v14H7z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5v14l9-7ZM15 5h2v14h-2z"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>',
    fan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 3-7s3 3-1 7M14 12c4 0 7 1 7 3s-3 3-7-1M12 14c0 4-1 7-3 7s-3-3 1-7M10 12c-4 0-7-1-7-3s3-3 7 1"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M4 6l16 12M20 6 4 18M6 3l1.6 3M18 21l-1.6-3M18 3l-1.6 3M6 21l1.6-3"/></svg>',
    power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v8"/><path d="M6.3 7.3a8 8 0 1 0 11.4 0"/></svg>',
    floor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8c2-2 4 2 6 0s4-2 6 0 4 2 4 2M4 14c2-2 4 2 6 0s4-2 6 0 4 2 4 2"/></svg>',
  };
  const SCENE_ICON = { relaks: SVG.leaf, czytanie: SVG.bulb, film: SVG.film, sen: SVG.moon, kapiel: SVG.bath, poranek: SVG.sun, off: SVG.power };
  const CLIMATE_ICON = { auto: SVG.leaf, chlodzenie: SVG.snow, grzanie: SVG.sun, wentylator: SVG.fan };
  const HOME_ICON = { dziendobry: SVG.sun, dobranoc: SVG.moon, wychodze: SVG.door, film: SVG.film, relaks: SVG.leaf, kapiel: SVG.bath };

  /* ---------------- definicje pokoi (stan poczatkowy) ---------------- */
  const ROOM_IDS = ["salon", "sypialnia", "lazienka"];
  const THIRD_SCENE = { salon: "film", sypialnia: "relaks", lazienka: "kapiel" };
  const BASE_SET = { salon: 22, sypialnia: 20, lazienka: 23 };
  const CLIMATE_MIN = 16, CLIMATE_MAX = 28;
  const FLOOR_MIN = 18, FLOOR_MAX = 32;

  const DEFS = {
    salon: {
      photo: "/assets/demo/pomieszczenia/salon.webp",
      groups: [{ id: "main", val: 70 }, { id: "mood", val: 40 }, { id: "tv", val: 60 }],
      sceneList: ["relaks", "czytanie", "film", "off"],
      activeScene: null,
      blinds: [{ id: "taras", pos: 30 }, { id: "firana", pos: 20 }, { id: "dach", pos: 0 }],
      climate: { set: 22, cur: 21.4, mode: "auto", on: true },
      floor: null,
      radio: { list: ["radioNova", "jazzCafe", "klasyka"], idx: 0, playing: true, vol: 45 },
      scenePresets: {
        relaks: { main: 28, mood: 55, tv: 0 },
        czytanie: { main: 75, mood: 35, tv: 0 },
        film: { main: 8, mood: 25, tv: 40 },
        off: { main: 0, mood: 0, tv: 0 },
      },
    },
    sypialnia: {
      photo: "/assets/demo/pomieszczenia/sypialnia.webp",
      groups: [{ id: "main", val: 60 }, { id: "night", val: 30 }, { id: "mood", val: 60 }],
      sceneList: ["relaks", "czytanie", "sen", "off"],
      activeScene: null,
      blinds: [{ id: "black", pos: 100 }, { id: "firana", pos: 0 }],
      climate: { set: 20, cur: 20.4, mode: "auto", on: true },
      floor: null,
      radio: { list: ["sleepRadio", "nocneFale", "ambient"], idx: 0, playing: false, vol: 35 },
      scenePresets: {
        relaks: { main: 35, night: 20, mood: 55 },
        czytanie: { main: 70, night: 10, mood: 30 },
        sen: { main: 0, night: 12, mood: 0 },
        off: { main: 0, night: 0, mood: 0 },
      },
    },
    lazienka: {
      photo: "/assets/demo/pomieszczenia/lazienka.webp",
      groups: [{ id: "main", val: 80 }, { id: "mirror", val: 70 }, { id: "mood", val: 30 }],
      sceneList: ["relaks", "kapiel", "poranek", "off"],
      activeScene: null,
      blinds: [{ id: "okno", pos: 30 }],
      climate: { set: 23, cur: 22.6, mode: "grzanie", on: true },
      floor: { set: 28, cur: 27.3, on: true },
      radio: { list: ["spaRelax", "porannaKawa", "chillout"], idx: 0, playing: false, vol: 40 },
      scenePresets: {
        relaks: { main: 20, mirror: 35, mood: 50 },
        kapiel: { main: 25, mirror: 45, mood: 55 },
        poranek: { main: 90, mirror: 80, mood: 0 },
        off: { main: 0, mirror: 0, mood: 0 },
      },
    },
  };

  /* presety scen domowych: swiatlo per pokoj + rolety + klimat + radio */
  const HOME_LIGHT = {
    dziendobry: { salon: { main: 65, mood: 30, tv: 0 }, sypialnia: { main: 55, night: 0, mood: 25 }, lazienka: { main: 80, mirror: 70, mood: 0 } },
    dobranoc: { salon: { main: 0, mood: 15, tv: 0 }, sypialnia: { main: 0, night: 12, mood: 0 }, lazienka: { main: 0, mirror: 0, mood: 10 } },
    wychodze: { salon: { main: 0, mood: 0, tv: 0 }, sypialnia: { main: 0, night: 0, mood: 0 }, lazienka: { main: 0, mirror: 0, mood: 0 } },
    film: { salon: { main: 8, mood: 25, tv: 40 }, sypialnia: { main: 5, night: 8, mood: 15 }, lazienka: { main: 10, mirror: 0, mood: 20 } },
    relaks: { salon: { main: 28, mood: 55, tv: 0 }, sypialnia: { main: 30, night: 15, mood: 50 }, lazienka: { main: 18, mirror: 30, mood: 48 } },
    kapiel: { salon: { main: 15, mood: 35, tv: 0 }, sypialnia: { main: 12, night: 10, mood: 30 }, lazienka: { main: 25, mirror: 45, mood: 55 } },
  };

  /* ---------------- stan runtime ---------------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const state = { active: "salon", rooms: {}, weatherOut: 16 };
  ROOM_IDS.forEach((id) => {
    const d = DEFS[id];
    state.rooms[id] = {
      groups: clone(d.groups),
      activeScene: d.activeScene,
      blinds: clone(d.blinds),
      climate: clone(d.climate),
      floor: d.floor ? clone(d.floor) : null,
      radio: clone(d.radio),
    };
  });

  /* ---------------- pomocnicze ---------------- */
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const dec = (v, p = 1) => v.toFixed(p).replace(".", t.decimalSep);
  const fmtC = (v) => `${dec(v)}°C`;
  const fmtCr = (v) => `${Math.round(v)}°C`;
  const cur = () => state.rooms[state.active];
  const def = () => DEFS[state.active];
  const roomName = (id) => (t.rooms[id] || STRINGS.pl.rooms[id]).name;
  const stationName = (key) => t.radioStations[key] || key;

  /* ---------------- referencje DOM ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const refs = {
    bgA: $("[data-rm-bg='a']"),
    bgB: $("[data-rm-bg='b']"),
    roomName: $("[data-rm='roomName']"),
    roomTag: $("[data-rm='roomTag']"),
    tabs: $$("[data-rm-room]"),
    clock: $("[data-rm='clock']"),
    date: $("[data-rm='date']"),
    weatherOut: $("[data-rm='weatherOut']"),
    cards: $("[data-rm='cards']"),

    sceneRow: $("[data-rm='sceneRow']"),
    groupRows: $("[data-rm='groupRows']"),

    blindRows: $("[data-rm='blindRows']"),

    climateVal: $("[data-rm='climateVal']"),
    climateNow: $("[data-rm='climateNow']"),
    climateModes: $("[data-rm='climateModes']"),
    climatePower: $("[data-rm='climatePower']"),
    climatePowerState: $("[data-rm='climatePowerState']"),
    climatePowerNote: $("[data-rm='climatePowerNote']"),
    climateMinus: $("[data-rm-climate='minus']"),
    climatePlus: $("[data-rm-climate='plus']"),
    floorBlock: $("[data-rm='floorBlock']"),
    floorVal: $("[data-rm='floorVal']"),
    floorNow: $("[data-rm='floorNow']"),
    floorPower: $("[data-rm='floorPower']"),
    floorMinus: $("[data-rm-floor='minus']"),
    floorPlus: $("[data-rm-floor='plus']"),

    radioCover: $("[data-rm='radioCover']"),
    radioStation: $("[data-rm='radioStation']"),
    radioKind: $("[data-rm='radioKind']"),
    radioToggle: $("[data-rm-radio='toggle']"),
    radioPrev: $("[data-rm-radio='prev']"),
    radioNext: $("[data-rm-radio='next']"),
    radioVol: $("[data-rm='radioVol']"),
    radioVolVal: $("[data-rm='radioVolVal']"),

    homeRow: $("[data-rm='homeRow']"),
    toast: $("[data-rm-toast]"),

    statusCard: $("[data-rm='statusCard']"),
    statusSummary: $("[data-rm='statusSummary']"),
    statusLast: $("[data-rm='statusLast']"),
  };

  /* ---------------- toast ---------------- */
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
    }, 4200);
  }

  /* ---------------- kafelek statusowy ---------------- */
  let pulseTimer = null;
  function renderStatus() {
    if (!refs.statusSummary) return;
    const r = cur();
    const nOn = r.groups.filter((g) => g.val > 0).length;
    const lights = nOn > 0 ? `${nOn} ${t.lightWord(nOn)}` : t.statusLightsOff;
    const clim = r.climate.on ? fmtCr(r.climate.set) : t.statusClimateOff;
    const radio = r.radio.playing ? t.statusRadioOn : t.statusRadioOff;
    refs.statusSummary.textContent = [lights, clim, radio].join(" · ");
  }
  function setLast(text) {
    if (!refs.statusLast) return;
    refs.statusLast.textContent = `${t.lastPrefix}: ${text}`;
    if (prefersReduced || !refs.statusCard) return;
    refs.statusCard.classList.remove("is-pulse");
    void refs.statusCard.offsetWidth;
    refs.statusCard.classList.add("is-pulse");
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => refs.statusCard.classList.remove("is-pulse"), 700);
  }

  /* ---------------- zegar + data ---------------- */
  function tickClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    if (refs.clock) refs.clock.textContent = `${hh}:${mm}`;
    if (refs.date) refs.date.textContent = `${t.days[now.getDay()]} ${now.getDate()} ${t.months[now.getMonth()]}`;
  }

  /* ---------------- swiatlo ---------------- */
  function groupLabel(id) { return t.groups[id] || id; }

  function renderLights() {
    const r = cur();
    const d = def();

    // sceny
    if (refs.sceneRow.dataset.room !== state.active) {
      refs.sceneRow.dataset.room = state.active;
      refs.sceneRow.innerHTML = d.sceneList.map((s) => `
        <button class="rm-scene" type="button" data-rm-scene="${s}">
          <span class="rm-scene-ic" aria-hidden="true">${SCENE_ICON[s] || ""}</span>
          <span>${t.scenes[s] || s}</span>
        </button>`).join("");
    }
    $$("[data-rm-scene]", refs.sceneRow).forEach((b) => {
      b.classList.toggle("is-active", b.dataset.rmScene === r.activeScene);
    });

    // grupy
    if (refs.groupRows.dataset.room !== state.active) {
      refs.groupRows.dataset.room = state.active;
      refs.groupRows.innerHTML = r.groups.map((g, i) => `
        <div class="rm-grp" data-rm-grp="${g.id}">
          <div class="rm-grp-head">
            <button class="rm-grp-toggle" type="button" data-rm-grp-toggle aria-pressed="true">
              <span class="rm-grp-dot" aria-hidden="true"></span>
              <span class="rm-grp-name">${groupLabel(g.id)}</span>
            </button>
            <b class="rm-grp-val" data-rm-ref="grpVal">${g.val}%</b>
          </div>
          <input type="range" class="rm-range" data-rm-grp-range="${i}" min="0" max="100" step="1" value="${g.val}"
            aria-label="${groupLabel(g.id)}">
        </div>`).join("");
    }
    $$("[data-rm-grp]", refs.groupRows).forEach((row, i) => {
      const g = r.groups[i];
      row.classList.toggle("is-off", g.val <= 0);
      const range = $("[data-rm-grp-range]", row);
      if (range.value !== String(g.val)) range.value = String(g.val);
      range.style.setProperty("--rm-fill", `${g.val}%`);
      $("[data-rm-ref='grpVal']", row).textContent = t.lightState(g.val);
      $("[data-rm-grp-toggle]", row).setAttribute("aria-pressed", g.val > 0 ? "true" : "false");
    });
  }

  function applyScene(sceneKey) {
    const r = cur();
    const d = def();
    const preset = d.scenePresets[sceneKey];
    if (!preset) return;
    r.groups.forEach((g) => { if (preset[g.id] != null) g.val = preset[g.id]; });
    r.activeScene = sceneKey;
    refs.groupRows.dataset.room = "";
    renderLights();
    renderStatus();
    setLast(t.act.scene(roomName(state.active), t.scenes[sceneKey] || sceneKey));
    toast(t.toastScene(t.scenes[sceneKey] || sceneKey));
  }

  /* ---------------- rolety ---------------- */
  function blindLabel(id) { return t.blinds[id] || id; }
  function blindStateText(pos) {
    if (pos <= 2) return t.blindOpen;
    if (pos >= 98) return t.blindClosed;
    return t.blindPartial(100 - Math.round(pos));
  }

  function renderBlinds() {
    const r = cur();
    if (refs.blindRows.dataset.room !== state.active) {
      refs.blindRows.dataset.room = state.active;
      refs.blindRows.innerHTML = r.blinds.map((b, i) => `
        <div class="rm-blind" data-rm-blind="${i}">
          <div class="rm-blind-info">
            <b>${blindLabel(b.id)}</b>
            <i data-rm-ref="blindState">${blindStateText(b.pos)}</i>
          </div>
          <div class="rm-blind-track" aria-hidden="true"><span data-rm-ref="blindFill"></span></div>
          <div class="rm-blind-btns">
            <button class="rm-icon-btn" type="button" data-rm-blind-act="up" aria-label="${t.blindUp}: ${blindLabel(b.id)}">${SVG.chevUp}</button>
            <button class="rm-icon-btn" type="button" data-rm-blind-act="stop" aria-label="${t.blindStop}: ${blindLabel(b.id)}">${SVG.stop}</button>
            <button class="rm-icon-btn" type="button" data-rm-blind-act="down" aria-label="${t.blindDown}: ${blindLabel(b.id)}">${SVG.chevDown}</button>
          </div>
        </div>`).join("");
    }
    $$("[data-rm-blind]", refs.blindRows).forEach((row, i) => {
      const b = r.blinds[i];
      $("[data-rm-ref='blindState']", row).textContent = blindStateText(b.pos);
      $("[data-rm-ref='blindFill']", row).style.height = `${clamp(b.pos, 0, 100)}%`;
    });
  }

  let blindAnim = null;
  function nudgeBlind(i, dir) {
    const r = cur();
    const b = r.blinds[i];
    setLast(t.act.blind(roomName(state.active), blindLabel(b.id), t.act.blindDir[dir]));
    if (dir === "stop") { b._goal = null; renderBlinds(); return; }
    const goal = dir === "up" ? 0 : 100;
    if (prefersReduced) { b.pos = goal; renderBlinds(); return; }
    b._goal = goal;
    if (!blindAnim) {
      blindAnim = setInterval(() => {
        let moving = false;
        r.blinds.forEach((bl) => {
          if (bl._goal == null) return;
          const diff = bl._goal - bl.pos;
          if (Math.abs(diff) <= 4) { bl.pos = bl._goal; bl._goal = null; }
          else { bl.pos += Math.sign(diff) * 4; moving = true; }
        });
        renderBlinds();
        if (!moving) { clearInterval(blindAnim); blindAnim = null; }
      }, 40);
    }
  }

  /* ---------------- klimat ---------------- */
  function renderClimate() {
    const r = cur();
    const c = r.climate;
    refs.climateVal.textContent = fmtCr(c.set);
    refs.climateNow.textContent = t.climateNow(fmtC(c.cur));

    if (refs.climateModes.dataset.ready !== "1") {
      refs.climateModes.dataset.ready = "1";
      refs.climateModes.innerHTML = ["auto", "chlodzenie", "grzanie", "wentylator"].map((m) => `
        <button class="rm-cmode" type="button" data-rm-cmode="${m}" aria-pressed="false">
          <span class="rm-cmode-ic" aria-hidden="true">${CLIMATE_ICON[m]}</span>
          <span>${t.climateModes[m]}</span>
        </button>`).join("");
    }
    $$("[data-rm-cmode]", refs.climateModes).forEach((b) => {
      b.classList.toggle("is-active", b.dataset.rmCmode === c.mode && c.on);
      b.setAttribute("aria-pressed", b.dataset.rmCmode === c.mode && c.on ? "true" : "false");
    });

    refs.climatePower.classList.toggle("is-on", c.on);
    refs.climatePower.setAttribute("aria-pressed", c.on ? "true" : "false");
    refs.climatePowerState.textContent = c.on ? t.climateOn : t.climateOff;
    refs.climatePowerNote.textContent = c.on ? t.climateOnNote : t.climateOffNote;
    refs.climateMinus.disabled = !c.on;
    refs.climatePlus.disabled = !c.on;

    // ogrzewanie podlogowe
    if (r.floor) {
      refs.floorBlock.hidden = false;
      refs.floorVal.textContent = fmtCr(r.floor.set);
      refs.floorNow.textContent = t.climateNow(fmtC(r.floor.cur));
      refs.floorPower.classList.toggle("is-on", r.floor.on);
      refs.floorPower.setAttribute("aria-pressed", r.floor.on ? "true" : "false");
      refs.floorPower.querySelector("[data-rm-ref='floorState']").textContent = r.floor.on ? t.floorOn : t.floorOff;
      refs.floorMinus.disabled = !r.floor.on;
      refs.floorPlus.disabled = !r.floor.on;
    } else {
      refs.floorBlock.hidden = true;
    }
  }

  /* ---------------- radio ---------------- */
  function renderRadio() {
    const r = cur().radio;
    const key = r.list[r.idx];
    refs.radioStation.textContent = stationName(key);
    refs.radioKind.textContent = r.playing ? t.radioKind : t.radioPaused;
    refs.radioCover.dataset.station = key;
    refs.radioCover.classList.toggle("is-playing", r.playing && !prefersReduced);
    refs.radioToggle.innerHTML = r.playing ? SVG.pause : SVG.play;
    refs.radioToggle.setAttribute("aria-label", r.playing ? t.radioPause : t.radioPlay);
    refs.radioToggle.setAttribute("aria-pressed", r.playing ? "true" : "false");
    if (refs.radioVol.value !== String(r.vol)) refs.radioVol.value = String(r.vol);
    refs.radioVol.style.setProperty("--rm-fill", `${r.vol}%`);
    refs.radioVolVal.textContent = `${r.vol}%`;
  }

  /* ---------------- sceny domowe ---------------- */
  function renderHomeRow() {
    const third = THIRD_SCENE[state.active];
    const keys = ["dziendobry", "dobranoc", third, "wychodze"];
    if (refs.homeRow.dataset.third === third) return;
    refs.homeRow.dataset.third = third;
    refs.homeRow.innerHTML = keys.map((k) => `
      <button class="rm-home" type="button" data-rm-home="${k}">
        <span class="rm-home-ic" aria-hidden="true">${HOME_ICON[k] || ""}</span>
        <span class="rm-home-body">
          <b>${t.homeScenes[k].name}</b>
          <small>${t.homeScenes[k].desc}</small>
        </span>
      </button>`).join("");
  }

  function applyHomeScene(key) {
    const lights = HOME_LIGHT[key];
    ROOM_IDS.forEach((id) => {
      const r = state.rooms[id];
      if (lights && lights[id]) {
        r.groups.forEach((g) => { if (lights[id][g.id] != null) g.val = lights[id][g.id]; });
      }
      r.activeScene = null;

      if (key === "dziendobry") {
        r.blinds.forEach((b) => { b.pos = 0; b._goal = null; });
        r.climate.on = true;
        r.climate.set = BASE_SET[id];
        if (r.floor) r.floor.on = true;
      } else if (key === "dobranoc") {
        r.blinds.forEach((b) => { b.pos = 100; b._goal = null; });
        r.climate.set = clamp(BASE_SET[id] - 2, CLIMATE_MIN, CLIMATE_MAX);
        r.radio.playing = false;
      } else if (key === "wychodze") {
        r.blinds.forEach((b) => { b.pos = 100; b._goal = null; });
        r.climate.on = true;
        r.climate.set = clamp(BASE_SET[id] - 3, CLIMATE_MIN, CLIMATE_MAX);
        if (r.floor) r.floor.on = false;
        r.radio.playing = false;
      } else if (key === "film") {
        r.blinds.forEach((b) => { b.pos = 100; b._goal = null; });
      } else if (key === "relaks") {
        r.blinds.forEach((b) => { b.pos = 40; b._goal = null; });
      } else if (key === "kapiel") {
        if (r.floor) { r.floor.on = true; r.floor.set = 30; }
      }
    });
    if (blindAnim) { clearInterval(blindAnim); blindAnim = null; }
    refs.groupRows.dataset.room = "";
    refs.blindRows.dataset.room = "";
    renderAll();
    setLast(t.act.home(t.homeScenes[key].name));
    toast(t.toastHome(t.homeScenes[key].name));
  }

  /* ---------------- render zbiorczy ---------------- */
  function renderHeader() {
    refs.roomName.textContent = roomName(state.active);
    refs.roomTag.textContent = (t.rooms[state.active] || STRINGS.pl.rooms[state.active]).tag;
    refs.tabs.forEach((b) => {
      const on = b.dataset.rmRoom === state.active;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (refs.weatherOut) refs.weatherOut.textContent = fmtCr(state.weatherOut);
  }

  function renderAll() {
    renderHeader();
    renderLights();
    renderBlinds();
    renderClimate();
    renderRadio();
    renderHomeRow();
    renderStatus();
  }

  /* ---------------- przelaczanie pokoju z przejsciem ---------------- */
  let bgTop = "a";
  function setRoom(id, opts = {}) {
    if (id === state.active && !opts.force) return;
    state.active = id;

    const nextBg = bgTop === "a" ? refs.bgB : refs.bgA;
    const prevBg = bgTop === "a" ? refs.bgA : refs.bgB;
    nextBg.style.backgroundImage = `url("${DEFS[id].photo}")`;
    nextBg.style.opacity = "1";
    prevBg.style.opacity = "0";
    bgTop = bgTop === "a" ? "b" : "a";

    refs.sceneRow.dataset.room = "";
    refs.groupRows.dataset.room = "";
    refs.blindRows.dataset.room = "";

    if (!prefersReduced) {
      refs.cards.classList.remove("is-swap");
      void refs.cards.offsetWidth;
      refs.cards.classList.add("is-swap");
    }
    renderAll();
    if (!opts.silent) {
      setLast(t.act.room(roomName(id)));
      toast(t.toastRoom(roomName(id)));
    }
  }

  /* ---------------- zdarzenia ---------------- */
  refs.tabs.forEach((b) => b.addEventListener("click", () => setRoom(b.dataset.rmRoom)));

  refs.sceneRow.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rm-scene]");
    if (b) applyScene(b.dataset.rmScene);
  });

  refs.groupRows.addEventListener("input", (e) => {
    const range = e.target.closest("[data-rm-grp-range]");
    if (!range) return;
    const i = Number(range.dataset.rmGrpRange);
    const g = cur().groups[i];
    g.val = clamp(Number(range.value), 0, 100);
    cur().activeScene = null;
    renderLights();
    renderStatus();
    setLast(t.act.light(roomName(state.active), groupLabel(g.id).toLowerCase(), g.val));
  });
  refs.groupRows.addEventListener("click", (e) => {
    const tg = e.target.closest("[data-rm-grp-toggle]");
    if (!tg) return;
    const row = tg.closest("[data-rm-grp]");
    const i = $$("[data-rm-grp]", refs.groupRows).indexOf(row);
    const g = cur().groups[i];
    if (g.val > 0) { g._last = g.val; g.val = 0; }
    else { g.val = g._last || 60; delete g._last; }
    cur().activeScene = null;
    refs.groupRows.dataset.room = "";
    renderLights();
    renderStatus();
    setLast(t.act.light(roomName(state.active), groupLabel(g.id).toLowerCase(), g.val));
  });

  refs.blindRows.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rm-blind-act]");
    if (!b) return;
    const i = Number(b.closest("[data-rm-blind]").dataset.rmBlind);
    nudgeBlind(i, b.dataset.rmBlindAct);
  });

  refs.climateModes.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rm-cmode]");
    if (!b) return;
    const c = cur().climate;
    c.mode = b.dataset.rmCmode;
    c.on = true;
    renderClimate();
    renderStatus();
    setLast(t.act.climateMode(roomName(state.active), t.climateModes[c.mode]));
  });
  refs.climatePower.addEventListener("click", () => {
    const c = cur().climate;
    c.on = !c.on;
    renderClimate();
    renderStatus();
    setLast(t.act.climatePower(roomName(state.active), c.on));
    toast(t.toastClimate(c.on));
  });
  refs.climateMinus.addEventListener("click", () => stepClimate(-0.5));
  refs.climatePlus.addEventListener("click", () => stepClimate(0.5));
  function stepClimate(d) {
    const c = cur().climate;
    if (!c.on) return;
    c.set = clamp(Math.round((c.set + d) * 2) / 2, CLIMATE_MIN, CLIMATE_MAX);
    renderClimate();
    renderStatus();
    setLast(t.act.climateSet(roomName(state.active), fmtCr(c.set)));
  }

  refs.floorPower.addEventListener("click", () => {
    const f = cur().floor;
    if (!f) return;
    f.on = !f.on;
    renderClimate();
    renderStatus();
    setLast(t.act.floor(roomName(state.active), f.on));
    toast(t.toastFloor(f.on));
  });
  refs.floorMinus.addEventListener("click", () => stepFloor(-1));
  refs.floorPlus.addEventListener("click", () => stepFloor(1));
  function stepFloor(d) {
    const f = cur().floor;
    if (!f || !f.on) return;
    f.set = clamp(f.set + d, FLOOR_MIN, FLOOR_MAX);
    renderClimate();
    renderStatus();
    setLast(t.act.floorSet(roomName(state.active), fmtCr(f.set)));
  }

  refs.radioToggle.addEventListener("click", () => {
    const r = cur().radio;
    r.playing = !r.playing;
    renderRadio();
    renderStatus();
    setLast(t.act.radioToggle(roomName(state.active), r.playing));
    toast(t.toastRadio(r.playing, stationName(r.list[r.idx])));
  });
  refs.radioPrev.addEventListener("click", () => cycleStation(-1));
  refs.radioNext.addEventListener("click", () => cycleStation(1));
  function cycleStation(d) {
    const r = cur().radio;
    r.idx = (r.idx + d + r.list.length) % r.list.length;
    r.playing = true;
    renderRadio();
    renderStatus();
    setLast(t.act.station(roomName(state.active), stationName(r.list[r.idx])));
    toast(t.toastStation(stationName(r.list[r.idx])));
  }
  refs.radioVol.addEventListener("input", () => {
    cur().radio.vol = clamp(Number(refs.radioVol.value), 0, 100);
    renderRadio();
  });

  refs.homeRow.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rm-home]");
    if (b) applyHomeScene(b.dataset.rmHome);
  });

  /* ---------------- pelny ekran ---------------- */
  const fsButtons = $$("[data-rm-fs]");
  const canNativeFs = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
  const FS_MARGIN = 26, FS_MIN_W = 900;

  function isFs() {
    return document.fullscreenElement === stage ||
      document.webkitFullscreenElement === stage ||
      stage.classList.contains("is-rm-pseudo-fs");
  }
  function fitFullscreen() {
    if (!isFs() || window.innerWidth < FS_MIN_W) { panel.style.removeProperty("--rm-fs-scale"); return; }
    panel.style.removeProperty("--rm-fs-scale");
    const s = Math.min(
      (window.innerWidth - FS_MARGIN * 2) / (panel.offsetWidth || 1),
      (window.innerHeight - FS_MARGIN * 2) / (panel.offsetHeight || 1),
      2.2
    );
    panel.style.setProperty("--rm-fs-scale", (s > 0 ? s : 1).toFixed(3));
  }
  function syncFsUi() {
    const on = isFs();
    document.body.classList.toggle("is-rm-fullscreen", on);
    stage.classList.toggle("is-rm-fullscreen", on);
    fsButtons.forEach((b) => {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      const l = b.querySelector(".rm-fs-label");
      if (l) l.textContent = on ? t.fsClose : t.fsOpen;
    });
    fitFullscreen();
    requestAnimationFrame(fitFullscreen);
    setTimeout(fitFullscreen, 220);
  }
  let fsResizeTimer = null;
  window.addEventListener("resize", () => {
    if (!isFs()) return;
    clearTimeout(fsResizeTimer);
    fsResizeTimer = setTimeout(fitFullscreen, 120);
  });
  function pseudoFs() { stage.classList.add("is-rm-pseudo-fs"); syncFsUi(); }
  function enterFs() {
    if (!canNativeFs) { pseudoFs(); return; }
    try {
      const req = (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      if (req && typeof req.catch === "function") req.catch(pseudoFs);
    } catch (err) { pseudoFs(); }
  }
  function exitFs() {
    if (stage.classList.contains("is-rm-pseudo-fs")) { stage.classList.remove("is-rm-pseudo-fs"); syncFsUi(); return; }
    (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
  }
  fsButtons.forEach((b) => b.addEventListener("click", () => (isFs() ? exitFs() : enterFs())));
  document.addEventListener("fullscreenchange", syncFsUi);
  document.addEventListener("webkitfullscreenchange", syncFsUi);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && stage.classList.contains("is-rm-pseudo-fs")) exitFs();
  });

  /* ---------------- symulacja ---------------- */
  function simTick() {
    ROOM_IDS.forEach((id) => {
      const r = state.rooms[id];
      const c = r.climate;
      const goal = c.on ? c.set : 19;
      if (c.on && c.mode === "wentylator") {
        c.cur = clamp(c.cur + (Math.random() - 0.5) * 0.08, goal - 1.5, goal + 1.5);
      } else {
        const diff = goal - c.cur;
        c.cur = Math.abs(diff) < 0.12 ? goal + (Math.random() - 0.5) * 0.06 : c.cur + Math.sign(diff) * 0.14;
      }
      if (r.floor) {
        const fg = r.floor.on ? r.floor.set : 19;
        const fd = fg - r.floor.cur;
        r.floor.cur = Math.abs(fd) < 0.15 ? fg + (Math.random() - 0.5) * 0.05 : r.floor.cur + Math.sign(fd) * 0.1;
      }
    });
    state.weatherOut = clamp(state.weatherOut + (Math.random() - 0.5) * 0.2, 12, 20);
    renderClimate();
    if (refs.weatherOut) refs.weatherOut.textContent = fmtCr(state.weatherOut);
  }

  /* ---------------- start ---------------- */
  refs.bgA.style.backgroundImage = `url("${DEFS.salon.photo}")`;
  refs.bgA.style.opacity = "1";
  refs.bgB.style.opacity = "0";
  tickClock();
  setInterval(tickClock, 20000);
  setRoom("salon", { force: true, silent: true });
  setLast(t.lastReady);
  syncFsUi();
  if (!prefersReduced) setInterval(simTick, 3200);
})();
