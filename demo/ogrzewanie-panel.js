/* Panel premium "Ogrzewanie i źródła ciepła": /pl/projekty/ogrzewanie/
   (w przygotowaniu: /dk/projekter/opvarmning/, /en/projects/heating/).
   W pełni symulowana demonstracja: fotowoltaika, grzałka w buforze, bufor ciepła,
   piec gazowy i dystrybucja CO/CWU oraz cztery strefy z temperaturą zadaną.
   Brak połączenia z Home Assistant, stany żyją tylko w tej karcie.
   Język sterowany atrybutem data-demo-lang. Fizyka symulacji bez zmian. */
(() => {
  const stage = document.getElementById("ogStage");
  const zonesMount = document.getElementById("ogZones");
  if (!stage || !zonesMount) return;

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
      zones: {
        salon: { name: "Salon", subtitle: "Strefa dzienna" },
        sypialnia: { name: "Sypialnia", subtitle: "Strefa nocna" },
        lazienka: { name: "Łazienka", subtitle: "Strefa komfortu" },
        cwu: { name: "CWU", subtitle: "Ciepła woda użytkowa" },
      },
      curLabel: "Temperatura",
      curLabelWater: "Temperatura wody",
      setLabel: "Zadana",
      zoneModeLabel: "Tryb strefy",
      adjust: "Ustaw",
      adjustAria: (zone) => `Pokaż sterowanie strefy ${zone}`,
      boost: "Szybkie dogrzanie",
      boostLeft: (mmss) => `Szybkie dogrzanie ${mmss}`,
      states: { heat: "Grzeje", hold: "Utrzymuje", ready: "Gotowe", lower: "Obniżenie", off: "Wyłączona" },
      setAria: (zone) => `Temperatura zadana, ${zone}`,
      boostAria: (zone) => `Szybkie dogrzanie, ${zone}`,
      fsOpen: "Pełny ekran",
      fsClose: "Zamknij pełny ekran",

      pvTagOn: "Dostępna nadwyżka",
      pvTagOff: "Brak nadwyżki",
      heaterTagOn: "Grzeje z PV",
      heaterTagOff: "Nie grzeje",
      gasTagStandby: "Czuwa",
      gasTagHeating: "Grzeje",
      pvHeatOff: "0 kW",

      modeDesc: {
        komfort: "Stała temperatura",
        eco: "Oszczędzanie energii",
        nieobecnosc: "Obniżona temperatura",
        wakacje: "Ochrona przed zamarzaniem",
        reczny: "Ustawiane ręcznie",
      },
      settings: {
        komfort: "Tryb Komfort: strefy trzymają swoje temperatury bazowe (Salon 21,5, Sypialnia 19,5, Łazienka 22,5, woda 48 stopni). Piec gazowy startuje dopiero, gdy bufor u góry spadnie do 42 stopni.",
        eco: "Tryb Eco: temperatura zadana w pokojach minus 2 stopnie, ciepła woda minus 3 stopnie. Najprostszy sposób na niższy rachunek bez rezygnacji z ogrzewania.",
        nieobecnosc: "Tryb Nieobecność: pokoje minus pół stopnia, woda bez zmian. Dla krótkich wyjść, gdy dom ma być gotowy na powrót.",
        wakacje: "Tryb Wakacje: pokoje schodzą do około 12 stopni, co chroni instalację przed zamarznięciem. Grzanie ciepłej wody jest wyłączone. Po powrocie wystarczy wybrać Komfort.",
        reczny: "Tryb Ręczny: pełna kontrola. Rozwiń strefę i ustaw jej temperaturę suwakiem, wspólny suwak „Docelowy komfort” zmienia wszystkie pokoje naraz.",
      },
      toastPv: (on) => on ? "Grzanie z PV włączone. Nadwyżka z fotowoltaiki ładuje bufor ciepła." : "Grzanie z PV wyłączone. Bufor ładuje tylko piec gazowy, gdy dostanie zezwolenie.",
      toastGasOn: "Piec gazowy włączony ręcznie. Grzeje i ładuje bufor niezależnie od jego temperatury.",
      toastGasAuto: "Piec gazowy wrócił do trybu automatycznego. Startuje sam, gdy w buforze zabraknie ciepła.",
      toastBoost: (zone) => `Szybkie dogrzanie strefy ${zone}. Przez 15 minut temperatura zadana jest wyższa o 2 stopnie.`,
      toastBoostDone: (zone) => `Szybkie dogrzanie zakończone. Strefa ${zone} wróciła do temperatury zadanej.`,
      toastGasStart: "Bufor wychłodzony. Piec gazowy dostał zezwolenie i rozpoczął grzanie.",
      toastGasStop: "Bufor naładowany. Piec gazowy wrócił w stan czuwania, grzanie z bufora.",
      modeLabels: { komfort: "Komfort", eco: "Eco", nieobecnosc: "Nieobecność", wakacje: "Wakacje", reczny: "Ręczny" },
    },

    dk: {
      decimalSep: ",",
      zones: {
        salon: { name: "Stue", subtitle: "Dagområde" },
        sypialnia: { name: "Soveværelse", subtitle: "Natområde" },
        lazienka: { name: "Badeværelse", subtitle: "Komfortzone" },
        cwu: { name: "Varmt vand", subtitle: "Brugsvand" },
      },
      curLabel: "Temperatur",
      curLabelWater: "Vandtemperatur",
      setLabel: "Ønsket",
      zoneModeLabel: "Zonetilstand",
      adjust: "Indstil",
      adjustAria: (zone) => `Vis styring af zonen ${zone}`,
      boost: "Hurtig opvarmning",
      boostLeft: (mmss) => `Hurtig opvarmning ${mmss}`,
      states: { heat: "Varmer", hold: "Holder", ready: "Klar", lower: "Sænkning", off: "Slukket" },
      setAria: (zone) => `Ønsket temperatur, ${zone}`,
      boostAria: (zone) => `Hurtig opvarmning, ${zone}`,
      fsOpen: "Fuld skærm",
      fsClose: "Luk fuld skærm",

      pvTagOn: "Overskud til rådighed",
      pvTagOff: "Intet overskud",
      heaterTagOn: "Varmer fra PV",
      heaterTagOff: "Varmer ikke",
      gasTagStandby: "Standby",
      gasTagHeating: "Varmer",
      pvHeatOff: "0 kW",

      modeDesc: {
        komfort: "Fast temperatur",
        eco: "Energibesparelse",
        nieobecnosc: "Sænket temperatur",
        wakacje: "Frostsikring",
        reczny: "Indstilles manuelt",
      },
      settings: {
        komfort: "Tilstanden Komfort: zonerne holder deres grundtemperaturer (Stue 21,5, Soveværelse 19,5, Badeværelse 22,5, vand 48 grader). Gaskedlen starter først, når buffertanken i toppen falder til 42 grader.",
        eco: "Tilstanden Eco: ønsket temperatur i rummene minus 2 grader, varmt vand minus 3 grader. Den enkleste måde at sænke regningen på uden at give afkald på opvarmning.",
        nieobecnosc: "Tilstanden Fravær: rummene minus en halv grad, vandet uændret. Til korte ture, når hjemmet skal være klar til hjemkomst.",
        wakacje: "Tilstanden Ferie: rummene går ned til omkring 12 grader, hvilket beskytter anlægget mod frost. Opvarmning af varmt vand er slået fra. Ved hjemkomst vælger du bare Komfort.",
        reczny: "Tilstanden Manuel: fuld kontrol. Fold zonen ud og indstil dens temperatur med skyderen, den fælles skyder „Ønsket komfort” ændrer alle rum på en gang.",
      },
      toastPv: (on) => on ? "Varme fra PV slået til. Overskuddet fra solcellerne lader buffertanken." : "Varme fra PV slået fra. Buffertanken lades kun af gaskedlen, når den får tilladelse.",
      toastGasOn: "Gaskedlen tændt manuelt. Den varmer og lader buffertanken uanset dens temperatur.",
      toastGasAuto: "Gaskedlen er tilbage i automatisk tilstand. Den starter selv, når buffertanken mangler varme.",
      toastBoost: (zone) => `Hurtig opvarmning af zonen ${zone}. I 15 minutter er den ønskede temperatur 2 grader højere.`,
      toastBoostDone: (zone) => `Hurtig opvarmning afsluttet. Zonen ${zone} er tilbage ved den ønskede temperatur.`,
      toastGasStart: "Buffertanken er kølet ned. Gaskedlen fik tilladelse og begyndte at varme.",
      toastGasStop: "Buffertanken er ladet op. Gaskedlen er tilbage i standby, varme fra tanken.",
      modeLabels: { komfort: "Komfort", eco: "Eco", nieobecnosc: "Fravær", wakacje: "Ferie", reczny: "Manuel" },
    },

    en: {
      decimalSep: ".",
      zones: {
        salon: { name: "Living room", subtitle: "Daytime zone" },
        sypialnia: { name: "Bedroom", subtitle: "Night zone" },
        lazienka: { name: "Bathroom", subtitle: "Comfort zone" },
        cwu: { name: "Hot water", subtitle: "Domestic hot water" },
      },
      curLabel: "Temperature",
      curLabelWater: "Water temperature",
      setLabel: "Target",
      zoneModeLabel: "Zone mode",
      adjust: "Adjust",
      adjustAria: (zone) => `Show controls for the ${zone} zone`,
      boost: "Quick boost",
      boostLeft: (mmss) => `Quick boost ${mmss}`,
      states: { heat: "Heating", hold: "Holding", ready: "Ready", lower: "Setback", off: "Off" },
      setAria: (zone) => `Target temperature, ${zone}`,
      boostAria: (zone) => `Quick boost, ${zone}`,
      fsOpen: "Fullscreen",
      fsClose: "Exit fullscreen",

      pvTagOn: "Surplus available",
      pvTagOff: "No surplus",
      heaterTagOn: "Heating from PV",
      heaterTagOff: "Not heating",
      gasTagStandby: "Standby",
      gasTagHeating: "Heating",
      pvHeatOff: "0 kW",

      modeDesc: {
        komfort: "Steady temperature",
        eco: "Energy saving",
        nieobecnosc: "Reduced temperature",
        wakacje: "Frost protection",
        reczny: "Set manually",
      },
      settings: {
        komfort: "Comfort mode: zones hold their base temperatures (Living room 21.5, Bedroom 19.5, Bathroom 22.5, water 48 degrees). The gas boiler only starts once the top of the buffer tank drops to 42 degrees.",
        eco: "Eco mode: target temperature in the rooms minus 2 degrees, hot water minus 3 degrees. The simplest way to lower the bill without giving up heating.",
        nieobecnosc: "Away mode: rooms minus half a degree, water unchanged. For short trips, when the home should be ready for your return.",
        wakacje: "Holiday mode: rooms drop to about 12 degrees, which protects the system from frost. Hot water heating is off. On your return, just pick Comfort.",
        reczny: "Manual mode: full control. Expand a zone and set its temperature with the slider, the shared “Comfort target” slider changes all rooms at once.",
      },
      toastPv: (on) => on ? "Heating from PV turned on. The surplus from the panels charges the buffer tank." : "Heating from PV turned off. The buffer tank is charged only by the gas boiler when it gets permission.",
      toastGasOn: "Gas boiler turned on manually. It heats and charges the buffer tank regardless of its temperature.",
      toastGasAuto: "Gas boiler back in automatic mode. It starts on its own when the buffer tank runs low on heat.",
      toastBoost: (zone) => `Quick boost for the ${zone} zone. For 15 minutes the target temperature is 2 degrees higher.`,
      toastBoostDone: (zone) => `Quick boost finished. The ${zone} zone is back at its target temperature.`,
      toastGasStart: "The buffer tank has cooled down. The gas boiler got permission and started heating.",
      toastGasStop: "The buffer tank is charged. The gas boiler is back on standby, heating from the tank.",
      modeLabels: { komfort: "Comfort", eco: "Eco", nieobecnosc: "Away", wakacje: "Holiday", reczny: "Manual" },
    },
  };
  const t = STRINGS[LANG] || STRINGS.pl;

  /* ---------------- ikony ---------------- */
  const ICON = {
    salon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v6h-2v-2H5v2H3v-6a2 2 0 0 1 0-4Z"/></svg>',
    sypialnia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17v-5a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v4M3 13h16M3 17v3M21 14v6"/><path d="M7 10V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/></svg>',
    lazienka: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V6a2 2 0 0 1 2-2c1 0 1.7.5 2 1.4"/><path d="M6 19l-1 2M19 19l1 2"/></svg>',
    cwu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5s6 6.6 6 10.5a6 6 0 0 1-12 0c0-3.9 6-10.5 6-10.5Z"/></svg>',
  };
  const ICON_THERMO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z"/><path d="M12 9v6"/></svg>';
  const ICON_FLAME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s5 4.3 5 9a5 5 0 0 1-10 0c0-1.7.6-3.1 1.6-4.1.1 1.4.9 2.4 2 2.8C10 9.4 9.7 6.4 12 3Z"/></svg>';
  const ICON_WAVES = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4c-1.1 1.4-1.1 3 0 4.4S9 11.4 8 13M13 4c-1.1 1.4-1.1 3 0 4.4S14 11.4 13 13M18 4c-1.1 1.4-1.1 3 0 4.4S19 11.4 18 13"/></svg>';
  const ICON_LEAF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4S9 3 5.5 10.5C3 15.7 6.5 20 6.5 20S18 20 20 8c.4-2.4 0-4 0-4Z"/><path d="M5 20c3-7 8-11 13-13"/></svg>';
  const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/></svg>';
  const ICON_SNOW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M4 6l16 12M20 6 4 18M6 3l1.6 3M18 21l-1.6-3M18 3l-1.6 3M6 21l1.6-3"/></svg>';
  const ICON_HAND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12V5a1.6 1.6 0 0 1 3.2 0V11m0-1V4a1.6 1.6 0 0 1 3.2 0v7m0-2V6a1.6 1.6 0 0 1 3.2 0v8a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2l-2.4-3.2a1.7 1.7 0 0 1 2.6-2.1L8 14"/></svg>';
  const MODE_ICON = { komfort: ICON_LEAF, eco: ICON_LEAF, nieobecnosc: ICON_HAND, wakacje: ICON_SNOW, reczny: ICON_HAND };
  const zoneModeIcon = () => {
    if (state.mode === "wakacje") return ICON_SNOW;
    if (state.mode === "eco") return ICON_LEAF;
    if (state.mode === "reczny") return ICON_HAND;
    return state.mode === "nieobecnosc" ? ICON_HAND : ICON_LEAF;
  };

  /* ---------------- konfiguracja stref ---------------- */
  const ROOM_MIN = 12, ROOM_MAX = 26;
  const WATER_MIN = 40, WATER_MAX = 55;

  const ZONES = [
    { id: "salon", img: "/assets/demo/ogrzewanie/strefa-salon.webp", baseSet: 21.5, cur: 21.1, water: false },
    { id: "sypialnia", img: "/assets/demo/ogrzewanie/strefa-sypialnia.webp", baseSet: 19.5, cur: 19.3, water: false },
    { id: "lazienka", img: "/assets/demo/ogrzewanie/strefa-lazienka.webp", baseSet: 22.5, cur: 22.0, water: false },
    { id: "cwu", img: "/assets/demo/ogrzewanie/strefa-cwu.webp", baseSet: 48, cur: 47.2, water: true },
  ];
  const ROOMS = ZONES.filter((z) => !z.water);
  const CWU = ZONES.find((z) => z.water);
  const zoneName = (id) => (t.zones[id] || STRINGS.pl.zones[id]).name;
  const zoneSub = (id) => (t.zones[id] || STRINGS.pl.zones[id]).subtitle;

  const GAS_ON = 42;   // bufor góra <= GAS_ON  -> piec dostaje zezwolenie
  const GAS_OFF = 52;   // bufor góra >= GAS_OFF -> piec wraca w czuwanie
  const BOOST_SECONDS = 15 * 60;
  const SIM_MS = 3200;

  const state = {
    mode: "komfort",
    buffer: { top: 52.0, bot: 41.0, charge: 75 },
    gas: "blocked",           // blocked | heating
    gasManual: null,          // null = automat (histereza), "on" = wymuszony ręcznie
    pv: true,
    pvSurplus: 2.8,           // kW nadwyżki z PV
    outTemp: 3.5,
    inTemp: 21.0,
  };

  /* ---------------- pomocnicze ---------------- */
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const dec = (v, p = 1) => v.toFixed(p).replace(".", t.decimalSep);
  const fmtC = (v) => `${dec(v)}°C`;
  const fmtCr = (v) => `${Math.round(v)}°C`;
  const fmtKw = (v) => `${dec(v)} kW`;
  const round1 = (v) => Math.round(v * 2) / 2;
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.max(0, s % 60)).padStart(2, "0")}`;

  function effTarget(zone) {
    if (zone.water) {
      if (state.mode === "wakacje") return null;              // grzanie wody wyłączone
      if (state.mode === "eco") return clamp(zone.userSet - 3, WATER_MIN, WATER_MAX);
      return zone.userSet;
    }
    if (state.mode === "wakacje") return 12;
    if (state.mode === "eco") return clamp(zone.userSet - 2, ROOM_MIN, ROOM_MAX);
    if (state.mode === "nieobecnosc") return clamp(zone.userSet - 0.5, ROOM_MIN, ROOM_MAX);
    return zone.userSet;
  }
  function heatTarget(zone) {
    const base = effTarget(zone);
    if (base == null) return null;
    return zone.boost ? clamp(base + 2, zone.water ? WATER_MIN : ROOM_MIN, zone.water ? WATER_MAX : ROOM_MAX) : base;
  }
  function zoneStateKey(zone) {
    const tgt = heatTarget(zone);
    if (tgt == null) return "off";
    if (zone.cur < tgt - 0.2) return "heat";
    if (zone.cur > tgt + 0.35) return "lower";
    return "hold";
  }
  const roomsDemand = () => ROOMS.some((z) => zoneStateKey(z) === "heat");
  const cwuDemand = () => zoneStateKey(CWU) === "heat";

  /* ---------------- budowa kart stref ---------------- */
  const els = {};

  ZONES.forEach((zone) => {
    zone.userSet = zone.baseSet;
    zone.boost = 0;
    zone._base = zone.cur;

    const art = document.createElement("article");
    art.className = "og-zone" + (zone.water ? " og-zone--water" : "");
    art.dataset.ogZone = zone.id;
    art.style.setProperty("--og-zone-img", `url("${zone.img}")`);
    const min = zone.water ? WATER_MIN : ROOM_MIN;
    const max = zone.water ? WATER_MAX : ROOM_MAX;
    const step = zone.water ? 1 : 0.5;
    art.innerHTML = `
      <div class="og-zone-photo">
        <div class="og-zone-bg" aria-hidden="true"></div>
        <div class="og-zone-scrim" aria-hidden="true"></div>
        <div class="og-zone-glow" aria-hidden="true"></div>
        <span class="og-zone-status" data-og-ref="status"><span class="og-dot"></span><span data-og-ref="statusText">${t.states.hold}</span></span>
      </div>
      <div class="og-zone-body">
        <div class="og-zone-id">
          <span class="og-zone-ic">${ICON[zone.id]}</span>
          <div><h3>${zoneName(zone.id)}</h3><p>${zoneSub(zone.id)}</p></div>
        </div>
        <div class="og-zone-metrics">
          <div class="og-zm">
            <span class="og-zm-ic">${ICON_THERMO}</span>
            <span class="og-zm-body"><b data-og-ref="cur">${fmtC(zone.cur)}</b><i>${zone.water ? t.curLabelWater : t.curLabel}</i></span>
          </div>
          <div class="og-zm">
            <span class="og-zm-ic og-flame-ic" data-og-ref="flame">${ICON_WAVES}</span>
            <span class="og-zm-body"><b data-og-ref="set">${fmtC(zone.userSet)}</b><i>${t.setLabel}</i></span>
          </div>
        </div>
        <div class="og-zone-mode">
          <span class="og-zone-mode-ic" data-og-ref="modeIc">${zoneModeIcon()}</span>
          <span class="og-zone-mode-body">
            <i>${t.zoneModeLabel}</i>
            <b data-og-ref="mode">${t.modeLabels[state.mode]}</b>
            <small data-og-ref="modeDesc">${t.modeDesc[state.mode]}</small>
          </span>
          <button class="og-zone-toggle" type="button" data-og-expand aria-expanded="false" aria-label="${t.adjustAria(zoneName(zone.id))}">
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <div class="og-zone-control" data-og-ref="control" hidden>
          <div class="og-zone-set-head">
            <label for="ogSet-${zone.id}">${t.setLabel === "Zadana" ? "Temperatura zadana" : t.setLabel}</label>
            <b data-og-ref="setBig">${fmtC(zone.userSet)}</b>
          </div>
          <input type="range" id="ogSet-${zone.id}" class="og-range" data-og-set min="${min}" max="${max}" step="${step}" value="${zone.userSet}" aria-label="${t.setAria(zoneName(zone.id))}">
          <button class="og-boost" type="button" data-og-boost aria-label="${t.boostAria(zoneName(zone.id))}">
            <span class="og-boost-ic" aria-hidden="true">${ICON_FLAME}</span>
            <span data-og-ref="boost">${t.boost}</span>
          </button>
        </div>
      </div>
    `;
    zonesMount.appendChild(art);

    const q = (s) => art.querySelector(s);
    els[zone.id] = {
      root: art,
      status: q('[data-og-ref="status"]'),
      statusText: q('[data-og-ref="statusText"]'),
      cur: q('[data-og-ref="cur"]'),
      mode: q('[data-og-ref="mode"]'),
      modeDesc: q('[data-og-ref="modeDesc"]'),
      modeIc: q('[data-og-ref="modeIc"]'),
      flame: q('[data-og-ref="flame"]'),
      set: q('[data-og-ref="set"]'),
      setBig: q('[data-og-ref="setBig"]'),
      control: q('[data-og-ref="control"]'),
      toggle: q("[data-og-expand]"),
      range: q("[data-og-set]"),
      boostBtn: q("[data-og-boost]"),
      boostLabel: q('[data-og-ref="boost"]'),
    };
  });

  /* ---------------- referencje panelu ---------------- */
  const refs = {
    climateOut: document.querySelector('[data-og="climateOut"]'),
    climateIn: document.querySelector('[data-og="climateIn"]'),
    bufTop: document.querySelector('[data-og="bufTop"]'),
    bufBot: document.querySelector('[data-og="bufBot"]'),
    bufCharge: document.querySelector('[data-og="bufCharge"]'),
    bufHeat: document.querySelector('[data-og="bufHeat"]'),
    gasFlame: document.querySelector('[data-og="gasFlame"]'),
    gasStateShort: document.querySelector('[data-og="gasStateShort"]'),
    gasTag: document.querySelector('[data-og="gasTag"]'),
    pvSource: document.querySelector('[data-og-source="pv"]'),
    gasSource: document.querySelector('[data-og-source="gas"]'),
    pvSurplus: document.querySelector('[data-og="pvSurplus"]'),
    pvHeat: document.querySelector('[data-og="pvHeat"]'),
    pvTag: document.querySelector('[data-og="pvTag"]'),
    heaterTag: document.querySelector('[data-og="heaterTag"]'),
    heaterCard: document.querySelector('[data-node="heater"]'),
    coSupply: document.querySelector('[data-og="coSupply"]'),
    coBar: document.querySelector('[data-og="coBar"]'),
    cwuTank: document.querySelector('[data-og="cwuTank"]'),
    cwuBar: document.querySelector('[data-og="cwuBar"]'),
    modeBtns: Array.from(document.querySelectorAll("[data-og-mode]")),
    commonNote: document.querySelector('[data-og="commonNote"]'),
    commonTemp: document.getElementById("ogCommonTemp"),
    commonTempVal: document.querySelector('[data-og="commonTempVal"]'),
    targetBox: document.querySelector("[data-og-target]"),
    toast: document.querySelector("[data-og-toast]"),
  };

  function setCommonTempUi(v) {
    refs.commonTemp.value = String(v);
    const pct = ((v - 16) / (24 - 16)) * 100;
    refs.commonTemp.style.setProperty("--og-fill", `${pct}%`);
    refs.commonTempVal.textContent = fmtC(v);
  }
  const setTag = (el, on, onText, offText) => {
    if (!el) return;
    el.classList.toggle("is-on", on);
    const txt = el.querySelector(".og-tag-txt");
    if (txt) txt.textContent = on ? onText : offText;
  };

  /* ---------------- render ---------------- */
  function renderZone(zone) {
    const e = els[zone.id];
    let key = zoneStateKey(zone);
    const heating = key === "heat";
    const shownKey = (key === "hold" && zone.water) ? "ready" : key;

    e.root.classList.toggle("is-heating", heating);
    e.root.classList.toggle("is-off", key === "off");
    e.root.classList.toggle("is-lower", key === "lower");
    e.root.classList.toggle("is-ready", shownKey === "ready");

    e.statusText.textContent = t.states[shownKey];
    e.status.dataset.state = shownKey;

    e.cur.textContent = fmtC(zone.cur);
    const setTxt = key === "off" ? "—" : fmtC(zone.userSet);
    e.set.textContent = setTxt;
    e.setBig.textContent = setTxt;

    const modeTxt = zone.boost ? t.boost : t.modeLabels[state.mode];
    e.mode.textContent = modeTxt;
    e.modeDesc.textContent = zone.boost ? t.boostLeft(mmss(zone.boost)) : t.modeDesc[state.mode];
    e.modeIc.innerHTML = zoneModeIcon();

    if (e.range.value !== String(zone.userSet)) e.range.value = String(zone.userSet);
    const min = zone.water ? WATER_MIN : ROOM_MIN;
    const max = zone.water ? WATER_MAX : ROOM_MAX;
    e.range.style.setProperty("--og-fill", `${((zone.userSet - min) / (max - min)) * 100}%`);
    e.range.disabled = key === "off";

    e.boostBtn.classList.toggle("is-running", !!zone.boost);
    e.boostBtn.disabled = key === "off";
    e.boostLabel.textContent = zone.boost ? t.boostLeft(mmss(zone.boost)) : t.boost;
  }

  function renderSources() {
    const b = state.buffer;
    const co = roomsDemand();
    const cwu = cwuDemand();
    const gasHeating = state.gas === "heating";

    // klimat
    refs.climateOut.textContent = fmtC(state.outTemp);
    refs.climateIn.textContent = fmtC(state.inTemp);

    // fotowoltaika + grzałka
    refs.pvSource.classList.toggle("is-active", state.pv);
    refs.pvSource.setAttribute("aria-pressed", state.pv ? "true" : "false");
    refs.pvSurplus.textContent = state.pv ? fmtKw(state.pvSurplus) : "0 kW";
    refs.pvHeat.textContent = state.pv ? fmtKw(Math.max(0, state.pvSurplus - 0.3)) : t.pvHeatOff;
    if (refs.heaterCard) refs.heaterCard.classList.toggle("is-active", state.pv);
    setTag(refs.pvTag, state.pv, t.pvTagOn, t.pvTagOff);
    setTag(refs.heaterTag, state.pv, t.heaterTagOn, t.heaterTagOff);

    // bufor
    refs.bufTop.textContent = fmtCr(b.top);
    refs.bufBot.textContent = fmtCr(b.bot);
    refs.bufCharge.textContent = `${Math.round(b.charge)}%`;
    if (refs.bufHeat) refs.bufHeat.style.width = `${clamp(b.charge, 6, 100)}%`;

    // piec
    refs.gasSource.classList.toggle("is-active", gasHeating);
    refs.gasSource.setAttribute("aria-pressed", state.gasManual === "on" ? "true" : "false");
    refs.gasStateShort.textContent = gasHeating ? t.gasTagHeating : t.gasTagStandby;
    if (refs.gasTag) refs.gasTag.classList.toggle("is-on", gasHeating);
    if (refs.gasFlame) refs.gasFlame.classList.toggle("is-lit", gasHeating);

    // dystrybucja
    const coSupply = clamp(b.top - 16 - (co ? 0 : 8), 26, 46);
    refs.coSupply.textContent = fmtCr(coSupply);
    const coRooms = ROOMS.filter((z) => zoneStateKey(z) === "heat").length;
    refs.coBar.style.width = `${co ? clamp(28 + coRooms * 22, 0, 100) : 12}%`;
    refs.coBar.parentElement.classList.toggle("is-active", co);
    refs.cwuTank.textContent = fmtCr(CWU.cur);
    refs.cwuBar.style.width = `${clamp((CWU.cur - 30) / (WATER_MAX - 30) * 100, 6, 100)}%`;
    refs.cwuBar.parentElement.classList.toggle("is-active", cwu);
  }

  function renderAll() {
    ZONES.forEach(renderZone);
    renderSources();
  }

  /* ---------------- tryby ---------------- */
  function markMode(mode) {
    refs.modeBtns.forEach((btn) => {
      const active = btn.dataset.ogMode === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setMode(mode, opts = {}) {
    state.mode = mode;
    markMode(mode);

    if (!opts.keepSets) {
      if (mode === "komfort") {
        ZONES.forEach((z) => { z.userSet = z.baseSet; });
      } else if (mode === "eco") {
        ROOMS.forEach((z) => { z.userSet = clamp(z.baseSet - 2, ROOM_MIN, ROOM_MAX); });
        CWU.userSet = clamp(CWU.baseSet - 3, WATER_MIN, WATER_MAX);
      } else if (mode === "nieobecnosc") {
        ROOMS.forEach((z) => { z.userSet = clamp(z.baseSet - 0.5, ROOM_MIN, ROOM_MAX); });
        CWU.userSet = CWU.baseSet;
      } else if (mode === "wakacje") {
        ROOMS.forEach((z) => { z.userSet = 12; });
        CWU.userSet = CWU.baseSet;
      }
      // reczny: zostaw bieżące userSet
    }

    if (refs.targetBox) refs.targetBox.hidden = mode !== "reczny";
    setCommonTempUi(clamp(round1(ROOMS[0].userSet), 16, 24));

    if (prefersReduced) settleImmediate();
    refreshGas();
    renderAll();
  }

  /* ---------------- piec gazowy: histereza + ręczne wymuszenie ---------------- */
  function refreshGas() {
    if (state.gasManual === "on") {
      const was = state.gas;
      state.gas = "heating";
      return was === "blocked" ? "start" : null;
    }
    const top = state.buffer.top;
    if (state.gas === "blocked" && top <= GAS_ON) {
      state.gas = "heating";
      return "start";
    }
    if (state.gas === "heating" && top >= GAS_OFF) {
      state.gas = "blocked";
      return "stop";
    }
    return null;
  }

  function toggleGas() {
    if (state.gasManual === "on") {
      state.gasManual = null;
      toast(t.toastGasAuto);
    } else {
      state.gasManual = "on";
      state.gas = "heating";
      toast(t.toastGasOn);
    }
    refreshGas();
    renderAll();
  }

  /* ---------------- szybkie dogrzanie ---------------- */
  function toggleBoost(zone) {
    if (zone.boost) {
      zone.boost = 0;
      renderZone(zone);
      renderSources();
      return;
    }
    zone.boost = BOOST_SECONDS;
    toast(t.toastBoost(zoneName(zone.id)));
    if (prefersReduced) { zone.cur = clamp(heatTarget(zone), zone.water ? WATER_MIN : ROOM_MIN, zone.water ? WATER_MAX : ROOM_MAX); }
    renderAll();
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
    }, 4800);
  }

  /* ---------------- interakcje stref ---------------- */
  zonesMount.addEventListener("input", (ev) => {
    const range = ev.target.closest("[data-og-set]");
    if (!range) return;
    const zone = ZONES.find((z) => z.id === range.closest(".og-zone").dataset.ogZone);
    const min = zone.water ? WATER_MIN : ROOM_MIN;
    const max = zone.water ? WATER_MAX : ROOM_MAX;
    zone.userSet = clamp(Number(range.value), min, max);
    if (state.mode !== "reczny") setMode("reczny", { keepSets: true });
    if (prefersReduced) settleImmediate();
    renderAll();
  });

  zonesMount.addEventListener("click", (ev) => {
    const expand = ev.target.closest("[data-og-expand]");
    if (expand) {
      const e = els[expand.closest(".og-zone").dataset.ogZone];
      const open = e.control.hasAttribute("hidden");
      e.control.toggleAttribute("hidden", !open);
      e.toggle.setAttribute("aria-expanded", open ? "true" : "false");
      e.root.classList.toggle("is-open", open);
      return;
    }
    const boost = ev.target.closest("[data-og-boost]");
    if (boost) {
      const zone = ZONES.find((z) => z.id === boost.closest(".og-zone").dataset.ogZone);
      if (zoneStateKey(zone) === "off") return;
      toggleBoost(zone);
    }
  });

  /* ---------------- sterowanie wspólne ---------------- */
  refs.modeBtns.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.ogMode)));

  refs.commonTemp.addEventListener("input", () => {
    const v = clamp(round1(Number(refs.commonTemp.value)), 16, 24);
    if (state.mode !== "reczny") setMode("reczny", { keepSets: true });
    ROOMS.forEach((z) => { z.userSet = v; });
    setCommonTempUi(v);
    if (prefersReduced) settleImmediate();
    renderAll();
  });

  document.querySelectorAll("[data-og-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.ogAction === "settings") toast(t.settings[state.mode] || t.settings.komfort);
    });
  });

  /* ---------------- grzanie z PV ---------------- */
  function togglePv() {
    state.pv = !state.pv;
    toast(t.toastPv(state.pv));
    renderSources();
  }
  refs.pvSource.addEventListener("click", togglePv);
  refs.pvSource.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); togglePv(); }
  });
  refs.gasSource.addEventListener("click", toggleGas);
  refs.gasSource.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toggleGas(); }
  });

  /* ---------------- pełny ekran ---------------- */
  const fsButtons = Array.from(document.querySelectorAll("[data-og-fs]"));
  const fsPanel = document.getElementById("ogPanel");
  const canNativeFs = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
  const FS_MARGIN = 26;
  const FS_MIN_W = 900;

  function isFs() {
    return document.fullscreenElement === stage ||
      document.webkitFullscreenElement === stage ||
      stage.classList.contains("is-og-pseudo-fs");
  }

  function fitFullscreen() {
    if (!fsPanel) return;
    if (!isFs() || window.innerWidth < FS_MIN_W) {
      fsPanel.style.removeProperty("--og-fs-scale");
      return;
    }
    fsPanel.style.removeProperty("--og-fs-scale");
    const pw = fsPanel.offsetWidth || 1;
    const ph = fsPanel.offsetHeight || 1;
    const s = Math.min(
      (window.innerWidth - FS_MARGIN * 2) / pw,
      (window.innerHeight - FS_MARGIN * 2) / ph,
      2.2
    );
    fsPanel.style.setProperty("--og-fs-scale", (s > 0 ? s : 1).toFixed(3));
  }

  function syncFsUi() {
    const on = isFs();
    document.body.classList.toggle("is-og-fullscreen", on);
    stage.classList.toggle("is-og-fullscreen", on);
    fsButtons.forEach((b) => {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      const label = b.querySelector(".og-fs-label");
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
  function pseudoFs() { stage.classList.add("is-og-pseudo-fs"); syncFsUi(); }
  function enterFs() {
    if (!canNativeFs) { pseudoFs(); return; }
    try {
      const req = (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      if (req && typeof req.catch === "function") req.catch(pseudoFs);
    } catch (err) { pseudoFs(); }
  }
  function exitFs() {
    if (stage.classList.contains("is-og-pseudo-fs")) {
      stage.classList.remove("is-og-pseudo-fs");
      syncFsUi();
      return;
    }
    (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
  }
  fsButtons.forEach((b) => b.addEventListener("click", () => (isFs() ? exitFs() : enterFs())));
  document.addEventListener("fullscreenchange", syncFsUi);
  document.addEventListener("webkitfullscreenchange", syncFsUi);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && stage.classList.contains("is-og-pseudo-fs")) exitFs();
  });

  /* ---------------- symulacja ---------------- */
  function settleImmediate() {
    ZONES.forEach((z) => {
      const tgt = heatTarget(z);
      if (tgt == null) { z.cur = clamp(z.cur, 26, 34); return; }
      z.cur = tgt;
    });
  }

  function simTick() {
    const b = state.buffer;
    const co = roomsDemand();
    const cwu = cwuDemand();

    // wejścia ciepła do bufora
    if (state.gas === "heating") { b.top += 0.7; b.bot += 0.45; }
    if (state.pv) { b.top += 0.18; b.bot += 0.1; }
    // pobór ciepła
    if (co) { b.top -= 0.22; b.bot -= 0.14; }
    if (cwu) b.top -= 0.32;
    b.top -= 0.05; b.bot -= 0.04;
    b.top = clamp(b.top, 30, 62);
    b.bot = clamp(b.bot, 25, b.top - 0.5);

    const gasEvent = refreshGas();
    if (gasEvent === "start") toast(t.toastGasStart);
    if (gasEvent === "stop") toast(t.toastGasStop);

    const avg = (b.top + b.bot) / 2;
    b.charge = clamp(Math.round((avg - 30) / (52 - 30) * 100), 0, 100);

    // otoczenie
    state.outTemp = clamp(state.outTemp + (Math.random() - 0.5) * 0.22, 1.5, 6.5);
    state.inTemp = clamp((ROOMS.reduce((s, z) => s + z.cur, 0) / ROOMS.length) + (Math.random() - 0.5) * 0.1, 11, 24);
    if (state.pv) state.pvSurplus = clamp(state.pvSurplus + (Math.random() - 0.5) * 0.28, 1.6, 3.6);

    // strefy dochodzą do temperatury
    ZONES.forEach((z) => {
      const key = zoneStateKey(z);
      const tgt = heatTarget(z);
      if (key === "off") {
        z.cur = clamp(z.cur - 0.06 + (Math.random() - 0.5) * 0.05, 27, 33);
      } else if (key === "heat") {
        const rate = z.water ? 0.22 : 0.14;
        z.cur = Math.min(tgt + 0.1, z.cur + rate + Math.random() * 0.06);
      } else if (key === "lower") {
        z.cur = Math.max(tgt, z.cur - (z.water ? 0.14 : 0.09));
      } else {
        z.cur = clamp(z.cur + (Math.random() - 0.5) * 0.08, tgt - 0.35, tgt + 0.3);
      }
      if (z.boost) {
        z.boost -= Math.round(SIM_MS / 1000);
        if (z.boost <= 0) {
          z.boost = 0;
          toast(t.toastBoostDone(zoneName(z.id)));
        }
      }
    });

    renderAll();
  }

  /* ---------------- start ---------------- */
  setMode("komfort");
  syncFsUi();

  if (!prefersReduced) {
    setInterval(simTick, SIM_MS);
  }
})();
