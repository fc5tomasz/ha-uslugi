/* Panel premium "Rekuperacja / Ventilation": /pl/projekty/rekuperacja/,
   /dk/projekter/ventilation/, /en/projects/ventilation/.
   W pełni symulowana demonstracja: cztery niezależne jednostki decentralne.
   Brak połączenia z Home Assistant, stany żyją tylko w tej karcie.
   Język sterowany atrybutem data-demo-lang (pl / dk / en). */
(() => {
  const stage = document.getElementById("rkStage");
  const roomsMount = document.getElementById("rkRooms");
  if (!stage || !roomsMount) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- teksty ---------------- */
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
        salon: { name: "Salon", subtitle: "Strefa dzienna" },
        kuchnia: { name: "Kuchnia", subtitle: "Świeże powietrze podczas gotowania" },
        sypialnia: { name: "Sypialnia", subtitle: "Cicha noc i spokojny sen" },
        "pokoj-goscinny": { name: "Pokój gościnny", subtitle: "Komfort dla Twoich gości" },
      },
      working: "Pracuje",
      paused: "Wstrzymana",
      offState: "Wyłączona",
      temperature: "Temperatura",
      humidity: "Wilgotność",
      deviceMode: "Tryb urządzenia",
      exhaust: "Wywiew",
      intake: "Nawiew",
      filter: "Filtr:",
      speed: "Prędkość",
      speedAria: (room) => `Prędkość wentylatora, ${room}`,
      dirAria: (room) => `Kierunek przepływu, ${room}`,
      powerAria: (room) => `Wstrzymaj lub wznów jednostkę, ${room}`,
      dialAria: (room) => `Wentylator, ${room}`,
      airingDefault: "Maksymalna wymiana",
      airingLeft: (mmss) => `Pozostało ${mmss}`,
      fsOpen: "Pełny ekran",
      fsClose: "Zamknij pełny ekran",
      seasonAutumn: "Profil sezonu: Jesień",
      seasonSummer: "Profil sezonu: Lato",
      offAll: "Wyłącz wszystko",
      onAll: "Włącz wszystko",
      offSubRunning: (n) => `${n} z 4 jednostek pracuje`,
      offSubAllOff: "4 jednostki wyłączone",
      notes: {
        manual: "W trybie ręcznym każda jednostka trzyma ustawioną prędkość i kierunek.",
        humidity: "Tryb AUTO wilgotność. Prędkość liczona osobno dla każdego pomieszczenia.",
        timed: "Tryb AUTO czasowe. Prędkość według harmonogramu doby.",
        summer: "Profil letni. Nocą, gdy na zewnątrz jest chłodniej niż w domu, jednostki zwiększają nawiew.",
        airing: "Przewietrzanie. Wszystkie jednostki pracują na maksimum przez 15 minut.",
      },
      settings: {
        manual: "Tryb ręczny: każdą jednostkę ustawiasz osobno, czyli jej prędkość i kierunek (nawiew lub wywiew). Wspólny suwak zmienia wszystkie naraz, potem możesz poprawić pojedynczy pokój.",
        humidity: "Tryb AUTO wilgotność. Progi: do 55% → 30, 56–60 → 40, 61–65 → 55, 66–70 → 70, 71–75 → 85, powyżej 75% → 100. Każdy pokój liczony niezależnie.",
        timed: "Tryb AUTO czasowe. Harmonogram: 06:00–16:00 → 45%, 16:00–22:00 → 60%, 22:00–06:00 → 30%. W pełnej wersji dochodzą dni tygodnia i wyjątki.",
        summer: "Profil letni: gdy temperatura na zewnątrz jest niższa niż w domu, jednostki nocą zwiększają nawiew, żeby wychłodzić pomieszczenia świeżym powietrzem.",
        airing: "Przewietrzanie: wszystkie jednostki na 100% przez 15 minut, potem automatyczny powrót do poprzedniego trybu.",
      },
      toastOff: "Wszystkie jednostki wyłączone. Kliknij „Włącz wszystko”, aby wznowić pracę.",
      toastOn: "Jednostki znów pracują w trybie: ",
      toastAiringDone: "Przewietrzanie zakończone. Jednostki wróciły do poprzedniego trybu.",
      modeLabels: {
        manual: "Ręczny", humidity: "AUTO wilgotność", timed: "AUTO czasowe",
        summer: "Lato", airing: "Przewietrzanie",
      },
    },

    dk: {
      decimalSep: ",",
      rooms: {
        salon: { name: "Stue", subtitle: "Dagområde" },
        kuchnia: { name: "Køkken", subtitle: "Frisk luft under madlavning" },
        sypialnia: { name: "Soveværelse", subtitle: "Stille nat og rolig søvn" },
        "pokoj-goscinny": { name: "Gæsteværelse", subtitle: "Komfort for dine gæster" },
      },
      working: "Kører",
      paused: "Standset",
      offState: "Slukket",
      temperature: "Temperatur",
      humidity: "Luftfugtighed",
      deviceMode: "Enhedstilstand",
      exhaust: "Udsug",
      intake: "Indblæsning",
      filter: "Filter:",
      speed: "Hastighed",
      speedAria: (room) => `Ventilatorhastighed, ${room}`,
      dirAria: (room) => `Luftretning, ${room}`,
      powerAria: (room) => `Sæt enheden på pause eller genoptag, ${room}`,
      dialAria: (room) => `Ventilator ${room}`,
      airingDefault: "Maksimal udskiftning",
      airingLeft: (mmss) => `Tilbage ${mmss}`,
      fsOpen: "Fuld skærm",
      fsClose: "Luk fuld skærm",
      seasonAutumn: "Sæsonprofil: Efterår",
      seasonSummer: "Sæsonprofil: Sommer",
      offAll: "Sluk alt",
      onAll: "Tænd alt",
      offSubRunning: (n) => `${n} af 4 enheder kører`,
      offSubAllOff: "4 enheder slukket",
      notes: {
        manual: "I manuel tilstand holder hver enhed den indstillede hastighed og retning.",
        humidity: "Tilstanden AUTO fugt. Hastigheden beregnes separat for hvert rum.",
        timed: "Tilstanden AUTO tidsplan. Hastighed efter døgnplanen.",
        summer: "Sommerprofil. Om natten, når det er køligere udenfor end indenfor, øger enhederne indblæsningen.",
        airing: "Udluftning. Alle enheder kører på maksimum i 15 minutter.",
      },
      settings: {
        manual: "Manuel tilstand: hver enhed indstilles separat, altså hastighed og retning (indblæsning eller udsug). Den fælles skyder ændrer alle på en gang, derefter kan du justere det enkelte rum.",
        humidity: "Tilstanden AUTO fugt. Tærskler: op til 55% → 30, 56–60 → 40, 61–65 → 55, 66–70 → 70, 71–75 → 85, over 75% → 100. Hvert rum beregnes uafhængigt.",
        timed: "Tilstanden AUTO tidsplan. Plan: 06:00–16:00 → 45%, 16:00–22:00 → 60%, 22:00–06:00 → 30%. I den fulde version tilføjes ugedage og undtagelser.",
        summer: "Sommerprofil: når temperaturen udenfor er lavere end indenfor, øger enhederne om natten indblæsningen for at køle rummene med frisk luft.",
        airing: "Udluftning: alle enheder på 100% i 15 minutter, derefter automatisk tilbage til den forrige tilstand.",
      },
      toastOff: "Alle enheder er slukket. Klik på „Tænd alt”, for at genoptage driften.",
      toastOn: "Enhederne kører igen i tilstand: ",
      toastAiringDone: "Udluftningen er afsluttet. Enhederne er tilbage i den forrige tilstand.",
      modeLabels: {
        manual: "Manuel", humidity: "AUTO fugt", timed: "AUTO tidsplan",
        summer: "Sommer", airing: "Udluftning",
      },
    },

    en: {
      decimalSep: ".",
      rooms: {
        salon: { name: "Living room", subtitle: "Living area" },
        kuchnia: { name: "Kitchen", subtitle: "Fresh air while cooking" },
        sypialnia: { name: "Bedroom", subtitle: "A quiet night and restful sleep" },
        "pokoj-goscinny": { name: "Guest room", subtitle: "Comfort for your guests" },
      },
      working: "Running",
      paused: "Paused",
      offState: "Off",
      temperature: "Temperature",
      humidity: "Humidity",
      deviceMode: "Device mode",
      exhaust: "Extract",
      intake: "Supply",
      filter: "Filter:",
      speed: "Speed",
      speedAria: (room) => `Fan speed, ${room}`,
      dirAria: (room) => `Air direction, ${room}`,
      powerAria: (room) => `Pause or resume the unit, ${room}`,
      dialAria: (room) => `Fan ${room}`,
      airingDefault: "Maximum exchange",
      airingLeft: (mmss) => `${mmss} left`,
      fsOpen: "Fullscreen",
      fsClose: "Exit fullscreen",
      seasonAutumn: "Seasonal profile: Autumn",
      seasonSummer: "Seasonal profile: Summer",
      offAll: "Turn everything off",
      onAll: "Turn everything on",
      offSubRunning: (n) => `${n} of 4 units running`,
      offSubAllOff: "4 units off",
      notes: {
        manual: "In manual mode each unit keeps its set speed and direction.",
        humidity: "AUTO humidity mode. Speed calculated separately for each room.",
        timed: "AUTO schedule mode. Speed follows the daily timetable.",
        summer: "Summer profile. At night, when it is cooler outside than indoors, the units increase supply air.",
        airing: "Airing. All units run at maximum for 15 minutes.",
      },
      settings: {
        manual: "Manual mode: each unit is set individually, that is its speed and direction (supply or extract). The shared slider changes all of them at once, then you can fine-tune a single room.",
        humidity: "AUTO humidity mode. Thresholds: up to 55% → 30, 56–60 → 40, 61–65 → 55, 66–70 → 70, 71–75 → 85, above 75% → 100. Each room is calculated independently.",
        timed: "AUTO schedule mode. Timetable: 06:00–16:00 → 45%, 16:00–22:00 → 60%, 22:00–06:00 → 30%. The full version adds weekdays and exceptions.",
        summer: "Summer profile: when the outdoor temperature is lower than indoors, the units increase supply air at night to cool the rooms with fresh air.",
        airing: "Airing: all units at 100% for 15 minutes, then an automatic return to the previous mode.",
      },
      toastOff: "All units are off. Click “Turn everything on” to resume operation.",
      toastOn: "The units are running again in mode: ",
      toastAiringDone: "Airing finished. The units returned to the previous mode.",
      modeLabels: {
        manual: "Manual", humidity: "AUTO humidity", timed: "AUTO schedule",
        summer: "Summer", airing: "Airing",
      },
    },
  };
  const t = STRINGS[LANG] || STRINGS.pl;

  /* ---------------- dane pomieszczeń (nazwy w STRINGS[LANG].rooms) ---------------- */
  const ROOMS = [
    {
      id: "salon",
      img: "/assets/demo/rekuperacja/salon.webp",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v6h-2v-2H5v2H3v-6a2 2 0 0 1 0-4Z"/></svg>',
      temp: 25.0, hum: 61, filter: 0, dir: "exhaust", speed: 50,
    },
    {
      id: "kuchnia",
      img: "/assets/demo/rekuperacja/kuchnia.webp",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v6a3 3 0 0 0 6 0V3M11 3v18M17 3c-1.7 0-3 1.8-3 4s1.3 4 3 4v10"/></svg>',
      temp: 24.0, hum: 62, filter: 0, dir: "exhaust", speed: 50,
    },
    {
      id: "sypialnia",
      img: "/assets/demo/rekuperacja/sypialnia.webp",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17v-5a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v4M3 13h16M3 17v3M21 14v6"/><path d="M7 10V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/></svg>',
      temp: 20.0, hum: 69, filter: 100, dir: "intake", speed: 50,
    },
    {
      id: "pokoj-goscinny",
      img: "/assets/demo/rekuperacja/pokoj-goscinny.webp",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 20c.2-2.4 1.5-4 3.5-4s3 1.6 3 4"/></svg>',
      temp: 19.0, hum: 76, filter: 0, dir: "intake", speed: 50,
    },
  ];
  const roomName = (id) => (t.rooms[id] || STRINGS.pl.rooms[id]).name;
  const roomSubtitle = (id) => (t.rooms[id] || STRINGS.pl.rooms[id]).subtitle;

  const ICON_THERMO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z"/><path d="M12 9v6"/></svg>';
  const ICON_DROP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5s6 6.6 6 10.5a6 6 0 0 1-12 0c0-3.9 6-10.5 6-10.5Z"/></svg>';
  const ICON_LEAF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4S9 3 5.5 10.5C3 15.7 6.5 20 6.5 20S18 20 20 8c.4-2.4 0-4 0-4Z"/><path d="M5 20c3-7 8-11 13-13"/></svg>';

  const DIAL_R = 52;
  const DIAL_C = 2 * Math.PI * DIAL_R;

  // harmonogram doby (AUTO czasowe)
  const SLOTS = [
    { from: 6, to: 16, pct: 45 },
    { from: 16, to: 22, pct: 60 },
    { from: 22, to: 6, pct: 30 },
  ];

  // profil letni: docelowe prędkości i kierunki
  const SUMMER = {
    salon: { pct: 60, dir: "intake" },
    kuchnia: { pct: 65, dir: "exhaust" },
    sypialnia: { pct: 75, dir: "intake" },
    "pokoj-goscinny": { pct: 70, dir: "intake" },
  };

  const state = {
    mode: "manual",
    outTemp: 13.0,
    inTemp: 23.5,
    airing: null,
    allOff: false,
    savedPowers: null,
    timedSlot: null, // null => według zegara
  };

  /* ---------------- pomocnicze ---------------- */
  const fmtTemp = (v) => `${v.toFixed(1).replace(".", t.decimalSep)}°`;
  const fmtTempC = (v) => `${v.toFixed(1).replace(".", t.decimalSep)}°C`;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round5 = (v) => Math.round(v / 5) * 5;
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const spinDur = (speed) => (speed <= 0 ? 6 : (3.6 - (speed / 100) * 3.1)).toFixed(2);
  const airDur = (speed) => (speed <= 0 ? 4 : (3.4 - (speed / 100) * 2.2)).toFixed(2);

  function humidityTarget(hum) {
    if (hum <= 55) return 30;
    if (hum <= 60) return 40;
    if (hum <= 65) return 55;
    if (hum <= 70) return 70;
    if (hum <= 75) return 85;
    return 100;
  }

  function currentSlot() {
    if (state.timedSlot != null) return state.timedSlot;
    const h = new Date().getHours();
    if (h >= 6 && h < 16) return 0;
    if (h >= 16 && h < 22) return 1;
    return 2;
  }

  /* ---------------- budowa kart ---------------- */
  const els = {};

  ROOMS.forEach((room) => {
    const art = document.createElement("article");
    art.className = "rk-room" + (room.dir === "intake" ? " is-intake" : "");
    art.dataset.rkRoom = room.id;
    art.style.setProperty("--rk-room-img", `url("${room.img}")`);
    art.innerHTML = `
      <div class="rk-room-bg"></div>
      <div class="rk-room-air" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="rk-room-top">
        <div class="rk-room-id">
          <span class="rk-room-ic">${room.icon}</span>
          <div><h3>${roomName(room.id)}</h3><p>${roomSubtitle(room.id)}</p></div>
        </div>
        <button class="rk-room-status" type="button" data-rk-power aria-pressed="true" aria-label="${t.powerAria(roomName(room.id))}">
          <span class="rk-dot"></span><span data-rk-ref="status">${t.working}</span>
        </button>
      </div>
      <div class="rk-room-metrics">
        <div class="rk-metric"><span class="rk-metric-ic">${ICON_THERMO}</span><div><b data-rk-ref="temp">${fmtTemp(room.temp)}</b><span>${t.temperature}</span></div></div>
        <div class="rk-metric"><span class="rk-metric-ic">${ICON_DROP}</span><div><b data-rk-ref="hum">${room.hum}%</b><span>${t.humidity}</span></div></div>
      </div>
      <div class="rk-room-device">
        <div class="rk-device-left">
          <span class="rk-device-eyebrow">${t.deviceMode}</span>
          <button class="rk-dir" type="button" data-rk-dir aria-label="${t.dirAria(roomName(room.id))}">
            <span class="rk-dir-ic">${ICON_LEAF}</span><span data-rk-ref="dir">${room.dir === "intake" ? t.intake : t.exhaust}</span>
          </button>
          <span class="rk-filter">${t.filter} <b data-rk-ref="filter">${room.filter}%</b></span>
        </div>
        <button class="rk-dial" type="button" data-rk-dial aria-label="${t.dialAria(roomName(room.id))}">
          <svg class="rk-dial-svg" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="rk-dial-track" cx="60" cy="60" r="${DIAL_R}"></circle>
            <circle class="rk-dial-arc" data-rk-ref="arc" cx="60" cy="60" r="${DIAL_R}"
              stroke-dasharray="${DIAL_C.toFixed(1)}" stroke-dashoffset="${DIAL_C.toFixed(1)}"></circle>
            <g class="rk-rotor" data-rk-ref="rotor">
              <circle cx="60" cy="60" r="7" fill="currentColor"></circle>
              <path d="M60 53c6-10 18-9 18-3 0 5-9 6-18 3Z" fill="currentColor" opacity="0.9"></path>
              <path d="M60 67c-6 10-18 9-18 3 0-5 9-6 18-3Z" fill="currentColor" opacity="0.9"></path>
              <path d="M53 60c-10-6-9-18-3-18 5 0 6 9 3 18Z" fill="currentColor" opacity="0.9"></path>
              <path d="M67 60c10 6 9 18 3 18-5 0-6-9-3-18Z" fill="currentColor" opacity="0.9"></path>
            </g>
          </svg>
        </button>
      </div>
      <div class="rk-room-fan">
        <div class="rk-fan-head"><span>${t.speed}</span><b data-rk-ref="speedVal">${room.speed}%</b></div>
        <input type="range" class="rk-range" data-rk-speed min="0" max="100" step="5" value="${room.speed}" aria-label="${t.speedAria(roomName(room.id))}">
      </div>
    `;
    roomsMount.appendChild(art);

    const q = (sel) => art.querySelector(sel);
    els[room.id] = {
      root: art,
      power: true,
      status: q('[data-rk-ref="status"]'),
      temp: q('[data-rk-ref="temp"]'),
      hum: q('[data-rk-ref="hum"]'),
      dir: q('[data-rk-ref="dir"]'),
      filter: q('[data-rk-ref="filter"]'),
      arc: q('[data-rk-ref="arc"]'),
      speedVal: q('[data-rk-ref="speedVal"]'),
      range: q("[data-rk-speed]"),
      powerBtn: q("[data-rk-power]"),
    };
  });

  /* ---------------- referencje panelu ---------------- */
  const refs = {
    outTemp: document.querySelector('[data-rk="outTemp"]'),
    inTemp: document.querySelector('[data-rk="inTemp"]'),
    commonNote: document.querySelector('[data-rk="commonNote"]'),
    commonSpeed: document.getElementById("rkCommonSpeed"),
    commonSpeedVal: document.querySelector('[data-rk="commonSpeedVal"]'),
    season: document.querySelector('[data-rk="season"]'),
    airingSub: document.querySelector('[data-rk="airingSub"]'),
    offLabel: document.querySelector('[data-rk="offLabel"]'),
    offSub: document.querySelector('[data-rk="offSub"]'),
    offBtn: document.querySelector('[data-rk-action="off"]'),
    modeBtns: Array.from(document.querySelectorAll("[data-rk-mode]")),
    schedule: document.querySelector("[data-rk-schedule]"),
    scheduleRows: Array.from(document.querySelectorAll("[data-rk-slot]")),
    toast: document.querySelector("[data-rk-toast]"),
  };
  const airingBtn = refs.modeBtns.find((b) => b.dataset.rkMode === "airing");

  function setCommonSpeedUi(v) {
    refs.commonSpeed.value = String(v);
    refs.commonSpeed.style.setProperty("--rk-fill", `${v}%`);
    refs.commonSpeedVal.textContent = `${v}%`;
  }

  function updateOffButton() {
    const running = ROOMS.filter((r) => els[r.id].power).length;
    refs.offLabel.textContent = state.allOff ? t.onAll : t.offAll;
    refs.offSub.textContent = state.allOff ? t.offSubAllOff : t.offSubRunning(running);
    refs.offBtn.setAttribute("aria-pressed", state.allOff ? "true" : "false");
    refs.offBtn.classList.toggle("is-armed", state.allOff);
  }

  /* ---------------- render ---------------- */
  function renderRoom(room) {
    const e = els[room.id];
    const on = e.power && !state.allOff;
    const shownSpeed = on ? room.speed : 0;

    e.root.classList.toggle("is-off", !on);
    e.root.classList.toggle("is-intake", room.dir === "intake");

    e.status.textContent = state.allOff ? t.offState : (e.power ? t.working : t.paused);
    e.powerBtn.setAttribute("aria-pressed", on ? "true" : "false");

    e.temp.textContent = fmtTemp(room.temp);
    e.hum.textContent = `${Math.round(room.hum)}%`;
    e.filter.textContent = `${room.filter}%`;
    e.dir.textContent = room.dir === "intake" ? t.intake : t.exhaust;

    e.speedVal.textContent = `${room.speed}%`;
    if (e.range.value !== String(room.speed)) e.range.value = String(room.speed);
    e.range.style.setProperty("--rk-fill", `${room.speed}%`);
    e.range.disabled = !on;

    e.arc.setAttribute("stroke-dashoffset", (DIAL_C * (1 - shownSpeed / 100)).toFixed(1));
    e.root.style.setProperty("--rk-spin-dur", `${spinDur(shownSpeed)}s`);
    e.root.style.setProperty("--rk-air-dur", `${airDur(shownSpeed)}s`);
  }

  function renderAll() {
    ROOMS.forEach(renderRoom);
    refs.outTemp.textContent = fmtTempC(state.outTemp);
    refs.inTemp.textContent = fmtTempC(state.inTemp);
    updateOffButton();
  }

  /* ---------------- tryby ---------------- */
  function markMode(mode) {
    refs.modeBtns.forEach((b) => {
      const active = b.dataset.rkMode === mode;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function renderSchedule() {
    const active = currentSlot();
    refs.scheduleRows.forEach((row, i) => {
      row.classList.toggle("is-active", i === active);
      row.setAttribute("aria-current", i === active ? "true" : "false");
    });
  }

  function applyTimed() {
    const pct = SLOTS[currentSlot()].pct;
    ROOMS.forEach((r) => { r._target = pct; });
    renderSchedule();
  }

  function setMode(mode, opts = {}) {
    if (mode === "airing") { toggleAiring(); return; }
    if (state.airing && !opts.fromAiring) cancelAiring(false);

    state.mode = mode;
    if (mode !== "timed") state.timedSlot = null;
    markMode(mode);
    refs.commonNote.textContent = t.notes[mode] || "";
    refs.season.textContent = mode === "summer" ? t.seasonSummer : t.seasonAutumn;
    refs.schedule.hidden = mode !== "timed";

    if (mode === "summer") {
      ROOMS.forEach((r) => {
        const s = SUMMER[r.id];
        r.dir = s.dir;
        r._target = s.pct;
      });
    } else if (mode === "timed") {
      applyTimed();
    } else if (mode === "humidity") {
      ROOMS.forEach((r) => { r._target = humidityTarget(r.hum); });
    } else {
      ROOMS.forEach((r) => { r._target = null; });
    }

    // bez animacji: od razu ustaw prędkości docelowe trybu
    if (prefersReduced) {
      ROOMS.forEach((r) => { if (r._target != null && els[r.id].power) r.speed = round5(r._target); });
    }
    renderAll();
  }

  /* ---------------- globalny wyłącznik ---------------- */
  function setAllOff(off) {
    if (off === state.allOff) return;
    if (off) {
      state.savedPowers = ROOMS.map((r) => els[r.id].power);
      ROOMS.forEach((r) => { els[r.id].power = false; });
      state.allOff = true;
      if (state.airing) cancelAiring(false);
      toast(t.toastOff);
    } else {
      ROOMS.forEach((r, i) => { els[r.id].power = state.savedPowers ? state.savedPowers[i] : true; });
      state.savedPowers = null;
      state.allOff = false;
      toast(t.toastOn + (t.modeLabels[state.mode] || state.mode));
    }
    renderAll();
  }

  // wywoływane przez akcje, które implikują pracę jednostek
  function clearAllOff() {
    if (!state.allOff) return;
    state.allOff = false;
    state.savedPowers = null;
    updateOffButton();
  }

  /* ---------------- przewietrzanie ---------------- */
  function toggleAiring() {
    if (state.airing) { cancelAiring(true); return; }
    clearAllOff();

    state.airing = {
      left: 15 * 60,
      prevMode: state.mode,
      prevSpeeds: ROOMS.map((r) => r.speed),
      prevPowers: ROOMS.map((r) => els[r.id].power),
      timer: null,
    };
    ROOMS.forEach((r) => { els[r.id].power = true; r.speed = 100; r._target = null; });
    state.mode = "airing";
    markMode("airing");
    refs.schedule.hidden = true;
    airingBtn.classList.add("is-running");
    refs.commonNote.textContent = t.notes.airing;
    setCommonSpeedUi(100);
    tickAiring();
    state.airing.timer = setInterval(tickAiring, 1000);
    renderAll();
  }

  function tickAiring() {
    if (!state.airing) return;
    if (state.airing.left <= 0) { finishAiring(); return; }
    refs.airingSub.textContent = t.airingLeft(mmss(state.airing.left));
    state.airing.left -= 1;
  }

  function cancelAiring(restore) {
    if (!state.airing) return;
    clearInterval(state.airing.timer);
    const a = state.airing;
    state.airing = null;
    airingBtn.classList.remove("is-running");
    refs.airingSub.textContent = t.airingDefault;
    if (restore) {
      ROOMS.forEach((r, i) => { r.speed = a.prevSpeeds[i]; els[r.id].power = a.prevPowers[i]; });
      setMode(a.prevMode, { fromAiring: true });
      setCommonSpeedUi(round5(ROOMS.reduce((s, r) => s + r.speed, 0) / ROOMS.length));
    }
  }

  function finishAiring() {
    cancelAiring(true);
    toast(t.toastAiringDone);
  }

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
    }, 4600);
  }

  /* ---------------- interakcje kart ---------------- */
  roomsMount.addEventListener("click", (ev) => {
    const art = ev.target.closest(".rk-room");
    if (!art) return;
    const room = ROOMS.find((r) => r.id === art.dataset.rkRoom);
    const e = els[room.id];

    if (ev.target.closest("[data-rk-dir]")) {
      room.dir = room.dir === "intake" ? "exhaust" : "intake";
      renderRoom(room);
      return;
    }
    if (ev.target.closest("[data-rk-power]") || ev.target.closest("[data-rk-dial]")) {
      if (state.allOff) { clearAllOff(); ROOMS.forEach((r) => { els[r.id].power = false; }); }
      e.power = !e.power;
      if (e.power && room.speed === 0) room.speed = 30;
      renderAll();
    }
  });

  roomsMount.addEventListener("input", (ev) => {
    const range = ev.target.closest("[data-rk-speed]");
    if (!range) return;
    const room = ROOMS.find((r) => r.id === range.closest(".rk-room").dataset.rkRoom);
    room.speed = round5(Number(range.value));
    room._target = null;
    if (state.airing) cancelAiring(false);
    if (state.mode !== "manual") setMode("manual");
    clearAllOff();
    els[room.id].power = room.speed > 0 ? true : els[room.id].power;
    renderRoom(room);
    updateOffButton();
  });

  /* ---------------- sterowanie wspólne ---------------- */
  refs.modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.rkMode)));

  refs.scheduleRows.forEach((row) => {
    row.addEventListener("click", () => {
      state.timedSlot = Number(row.dataset.rkSlot);
      if (state.mode !== "timed") { setMode("timed"); return; }
      applyTimed();
      if (prefersReduced) ROOMS.forEach((r) => { if (els[r.id].power) r.speed = round5(r._target); });
      renderAll();
    });
  });

  refs.commonSpeed.addEventListener("input", () => {
    const v = round5(Number(refs.commonSpeed.value));
    if (state.airing) cancelAiring(false);
    if (state.mode !== "manual") setMode("manual");
    clearAllOff();
    setCommonSpeedUi(v);
    ROOMS.forEach((r) => { r.speed = v; r._target = null; if (v > 0) els[r.id].power = true; });
    renderAll();
  });
  setCommonSpeedUi(round5(Number(refs.commonSpeed.value)));

  document.querySelectorAll("[data-rk-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.rkAction;
      if (action === "settings") {
        const key = state.airing ? "airing" : state.mode;
        toast(t.settings[key] || t.settings.manual);
      } else if (action === "off") {
        setAllOff(!state.allOff);
      }
    });
  });

  /* ---------------- pełny ekran ---------------- */
  const fsButtons = Array.from(document.querySelectorAll("[data-rk-fs]"));
  const fsPanel = document.getElementById("rkPanel");
  const canNativeFs = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
  const FS_MARGIN = 26;
  const FS_MIN_W = 900;

  function isFs() {
    return document.fullscreenElement === stage ||
      document.webkitFullscreenElement === stage ||
      stage.classList.contains("is-rk-pseudo-fs");
  }

  function fitFullscreen() {
    if (!fsPanel) return;
    if (!isFs() || window.innerWidth < FS_MIN_W) {
      fsPanel.style.removeProperty("--rk-fs-scale");
      return;
    }
    fsPanel.style.removeProperty("--rk-fs-scale");
    const pw = fsPanel.offsetWidth || 1;
    const ph = fsPanel.offsetHeight || 1;
    const s = Math.min(
      (window.innerWidth - FS_MARGIN * 2) / pw,
      (window.innerHeight - FS_MARGIN * 2) / ph,
      2.2
    );
    fsPanel.style.setProperty("--rk-fs-scale", (s > 0 ? s : 1).toFixed(3));
  }

  function syncFsUi() {
    const on = isFs();
    document.body.classList.toggle("is-rk-fullscreen", on);
    stage.classList.toggle("is-rk-fullscreen", on);
    fsButtons.forEach((b) => {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      const label = b.querySelector(".rk-fs-label");
      if (label) label.textContent = on ? t.fsClose : t.fsOpen;
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

  function pseudoFs() {
    stage.classList.add("is-rk-pseudo-fs");
    syncFsUi();
  }

  function enterFs() {
    if (!canNativeFs) { pseudoFs(); return; }
    try {
      const req = (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      if (req && typeof req.catch === "function") req.catch(pseudoFs);
    } catch (err) {
      pseudoFs();
    }
  }

  function exitFs() {
    if (stage.classList.contains("is-rk-pseudo-fs")) {
      stage.classList.remove("is-rk-pseudo-fs");
      syncFsUi();
      return;
    }
    (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
  }

  fsButtons.forEach((b) => b.addEventListener("click", () => (isFs() ? exitFs() : enterFs())));
  document.addEventListener("fullscreenchange", syncFsUi);
  document.addEventListener("webkitfullscreenchange", syncFsUi);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && stage.classList.contains("is-rk-pseudo-fs")) exitFs();
  });

  /* ---------------- pętla symulacji ---------------- */
  if (!prefersReduced) {
    setInterval(() => {
      ROOMS.forEach((r) => {
        r.temp = clamp(r.temp + (Math.random() - 0.5) * 0.24, r._baseT - 0.6, r._baseT + 0.6);
        r.hum = clamp(r.hum + (Math.random() - 0.5) * 1.4, r._baseH - 4, r._baseH + 4);
      });
      state.outTemp = clamp(state.outTemp + (Math.random() - 0.5) * 0.2, 12, 15);
      state.inTemp = clamp(state.inTemp + (Math.random() - 0.5) * 0.12, 22.5, 24.5);
      renderAll();
    }, 4200);

    setInterval(() => {
      if (state.airing || state.allOff) return;
      if (!["humidity", "timed", "summer"].includes(state.mode)) return;
      let changed = false;
      ROOMS.forEach((r) => {
        if (state.mode === "humidity") r._target = humidityTarget(r.hum);
        if (r._target == null || !els[r.id].power) return;
        if (r.speed === r._target) return;
        r.speed = round5(clamp(r.speed + (r.speed < r._target ? 5 : -5), 0, 100));
        changed = true;
      });
      if (changed) renderAll();
    }, 2500);
  }

  /* ---------------- start ---------------- */
  ROOMS.forEach((r) => { r._baseT = r.temp; r._baseH = r.hum; r._target = null; });
  setMode("manual");
  syncFsUi();
})();
