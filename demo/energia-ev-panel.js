/* Panel premium "Energia i EV":
   /pl/projekty/energia-ev/, /dk/projekter/energi-elbil/, /en/projects/energy-ev/.
   W pelni symulowana demonstracja zarzadzania energia: PV, dom, siec, magazyn
   energii, ladowarka EV, inteligentna taryfa z dodatkowym tanim oknem oraz
   ochrona baterii, ktora nie pozwala baterii zasilac auta w tym oknie.
   Brak polaczenia z Home Assistant i brak danych jakiegokolwiek klienta.

   ZASADA BILANSU: najpierw liczymy PV, dom, EV i decyzje baterii, a siec
   wynika z bilansu: grid = dom + EV + ladowanie baterii - rozladowanie - PV.
   SOC zmienia sie tylko przez calkowanie mocy baterii. Liczniki dzienne tylko
   rosna i zeruja sie o polnocy symulowanego zegara.

   SCENARIUSZ (ok. 85 s, petla po czasie doby):
   10:30 PV -> 12:30 ladowanie baterii -> 15:30 dodatkowe tanie okno, EV laduje,
   ochrona: Idle -> Protecting -> Holding -> 16:30 koniec okna: Restoring -> Idle
   -> 17:00 wieczor, bateria zasila dom -> 22:30 szybka noc -> 10:30.

   PODMIANA TLA: --ee-hero-img w energia-ev-panel.css oraz BG ponizej.
*/
(() => {
  const stage = document.getElementById("eeStage");
  const panel = document.getElementById("eePanel");
  if (!stage || !panel) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = panel) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const SVGNS = "http://www.w3.org/2000/svg";

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
      dec: ",",
      locale: "pl-PL",
      fsOpen: "Pełny ekran",
      fsClose: "Zamknij pełny ekran",
      nodes: { solar: "Fotowoltaika", grid: "Sieć", home: "Dom", ev: "Ładowarka EV", battery: "Magazyn" },
      short: { solar: "PV", grid: "Sieć", home: "Dom", ev: "EV", battery: "Bateria" },
      balanceTitle: "Bilans teraz: skąd i dokąd płynie energia",
      kpi: {
        solar: "Fotowoltaika", home: "Dom", battery: "Magazyn energii", grid: "Sieć", ev: "Ładowarka EV", tariff: "Taryfa",
        today: (v) => `Dziś ${v}`,
      },
      bat: { charging: "Ładowanie", discharging: "Zasila dom", idle: "Czuwanie", held: "Wstrzymany", full: "Pełny" },
      grid: { import: "Pobór", export: "Oddawanie", idle: "Bilans zerowy" },
      ev: { away: "Auto poza domem", ready: "Gotowa", charging: "Ładowanie", connected: "Auto podłączone" },
      tariff: { peak: "Strefa droga", offpeak: "Strefa tania", slot: "Dodatkowe tanie okno" },
      unitRate: "zł/kWh",
      rate: { peak: 1.15, cheap: 0.45 },
      flowTitle: "Przepływ energii",
      flowNote: "Kierunek i moc na żywo",
      protectTitle: "Ochrona baterii",
      protect: {
        idle: { title: "Czuwanie", note: "Brak aktywnego okna ładowania EV." },
        protecting: { title: "Włączanie ochrony", note: "Wysłano polecenie do falownika, trwa weryfikacja." },
        holding: { title: "Bateria chroniona", note: "Auto ładuje się z sieci, bateria nie zasila EV." },
        restoring: { title: "Przywracanie ustawień", note: "Okno zakończone, przywracam poprzedni tryb falownika." },
        off: { title: "Ochrona wyłączona", note: "Bateria może zasilać auto w tanim oknie." },
        leak: { title: "Bateria zasila auto", note: "Energia z magazynu trafia do samochodu w tanim oknie." },
      },
      steps: { idle: "Czuwanie", protecting: "Ochrona", holding: "Wstrzymanie", restoring: "Przywracanie" },
      protectRows: { batToEv: "Bateria → EV", mode: "Tryb falownika", lastRestore: "Ostatnie przywrócenie", none: "brak" },
      modes: { self: "Autokonsumpcja", hold: "Rozładowanie wstrzymane (EV)", offpeak: "Strefa tania: bateria wstrzymana" },
      toggle: "Ochrona baterii",
      toggleOn: "Włączona",
      toggleOff: "Wyłączona",
      tariffTitle: "Inteligentna taryfa",
      tariffRows: { now: "Cena teraz", next: "Następna zmiana", slot: "Dodatkowe okno", none: "brak zaplanowanego", planned: "zaplanowane", active: "aktywne teraz", done: "zakończone" },
      evTitle: "Ładowarka EV",
      evRows: { power: "Moc ładowania", session: "Energia sesji", source: "Źródło energii", since: "Podłączone od", fromGrid: "sieć", fromSolar: "PV", fromBat: "bateria" },
      batTitle: "Magazyn energii",
      batRows: { power: "Moc", capacity: "Pojemność", reserve: "Rezerwa", charged: "Naładowano dziś", discharged: "Rozładowano dziś" },
      chartTitle: "Moc · ostatnie 24 godziny",
      chartLegend: { solar: "PV", home: "Dom", ev: "EV", import: "Pobór z sieci", soc: "SOC baterii" },
      chartBands: { cheap: "Tania strefa", slot: "Dodatkowe okno" },
      energyTitle: "Energia dziś",
      energyRows: { solar: "Produkcja PV", home: "Zużycie domu", ev: "Ładowanie EV", import: "Pobór z sieci", export: "Oddane do sieci", selfSuff: "Samowystarczalność" },
      weekTitle: "Ostatnie 7 dni",
      weekLegend: { solar: "PV", home: "Dom", import: "Pobór", export: "Oddanie" },
      eventsTitle: "Ostatnie zdarzenia",
      statusTitle: "Status systemu",
      timelineTitle: "Scenariusz dnia",
      phases: { pv: "Produkcja PV", charge: "Ładowanie baterii", slot: "Okno EV", end: "Koniec okna", evening: "Wieczór", night: "Noc" },
      play: "Wznów",
      pause: "Wstrzymaj",
      fastNight: "Noc w przyspieszeniu",
      weather: { sun: "Słonecznie", cloud: "Zachmurzenie", night: "Pogodnie" },
      days: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
      ev_: {
        slotPlanned: (a, b) => `Zaplanowano dodatkowe tanie okno ${a}–${b}`,
        slotStart: "Rozpoczęło się dodatkowe tanie okno",
        evConnected: "Auto podłączone do ładowarki",
        evStart: "EV: Gotowa → Ładowanie",
        evStop: "EV: Ładowanie → Gotowa",
        evAway: "Auto odjechało",
        protOn: "Ochrona baterii: rozładowanie wstrzymane",
        protHold: "Falownik potwierdził: bateria nie zasila EV",
        protRestore: "Koniec okna, przywracanie trybu falownika",
        protIdle: "Przywrócono autokonsumpcję i sprawdzono tryb",
        leak: "Uwaga: bateria zasila ładowanie auta",
        batFull: "Magazyn naładowany, nadwyżka trafia do sieci",
        solarEnd: "Koniec produkcji PV, bateria zasila dom",
        offpeakStart: "Tania strefa nocna: bateria wstrzymana harmonogramem",
        offpeakEnd: "Koniec taniej strefy, bateria znów zasila dom",
        reserve: "Bateria osiągnęła rezerwę",
        midnight: "Nowa doba: liczniki dzienne wyzerowane",
        toggleOn: "Ochrona baterii włączona ręcznie",
        toggleOff: "Ochrona baterii wyłączona ręcznie",
        ready: "System gotowy",
      },
      info: {
        pv: "Fotowoltaika pokrywa zużycie domu, a nadwyżka ładuje magazyn energii.",
        charge: "Magazyn ładuje się nadwyżką z PV. Gdy jest pełny, energia trafia do sieci.",
        slotWait: "Dostawca zaplanował dodatkowe tanie okno. Auto jest podłączone i czeka.",
        slot: "Tanie okno: auto ładuje się z sieci, a bateria jest wstrzymana na wieczór.",
        leak: "Bez ochrony falownik traktuje auto jak dom i rozładowuje baterię do samochodu.",
        end: "Okno się skończyło. System przywraca poprzedni tryb falownika i sprawdza wynik.",
        evening: "PV już nie produkuje. Bateria zasila dom, sieć pokrywa tylko szczyty.",
        night: "Noc w przyspieszeniu. W taniej strefie bateria jest wstrzymana, dom korzysta z sieci.",
        paused: "Symulacja wstrzymana. Wybierz etap albo wznów odtwarzanie.",
      },
    },
    en: {
      dec: ".",
      locale: "en-GB",
      fsOpen: "Fullscreen",
      fsClose: "Close fullscreen",
      nodes: { solar: "Solar", grid: "Grid", home: "Home", ev: "EV charger", battery: "Battery" },
      short: { solar: "Solar", grid: "Grid", home: "Home", ev: "EV", battery: "Battery" },
      balanceTitle: "Balance now: where the energy goes",
      kpi: {
        solar: "Solar", home: "Home", battery: "Home battery", grid: "Grid", ev: "EV charger", tariff: "Tariff",
        today: (v) => `Today ${v}`,
      },
      bat: { charging: "Charging", discharging: "Powering home", idle: "Standby", held: "Held", full: "Full" },
      grid: { import: "Importing", export: "Exporting", idle: "Balanced" },
      ev: { away: "Car away", ready: "Ready", charging: "Charging", connected: "Car connected" },
      tariff: { peak: "Peak rate", offpeak: "Off-peak", slot: "Extra cheap slot" },
      unitRate: "p/kWh",
      rate: { peak: 27.5, cheap: 7.0 },
      flowTitle: "Power flow",
      flowNote: "Live direction and power",
      protectTitle: "Battery protection",
      protect: {
        idle: { title: "Idle", note: "No active EV charging slot." },
        protecting: { title: "Protecting", note: "Command sent to the inverter, checking the result." },
        holding: { title: "Holding", note: "The car charges from the grid. The battery does not supply the EV." },
        restoring: { title: "Restoring", note: "Slot finished, restoring the previous inverter mode." },
        off: { title: "Protection off", note: "The battery may supply the car during a cheap slot." },
        leak: { title: "Battery supplying the car", note: "Stored energy is going into the car during a cheap slot." },
      },
      steps: { idle: "Idle", protecting: "Protecting", holding: "Holding", restoring: "Restoring" },
      protectRows: { batToEv: "Battery → EV", mode: "Inverter mode", lastRestore: "Last restore", none: "none" },
      modes: { self: "Self-use", hold: "Discharge paused (EV)", offpeak: "Off-peak: battery held" },
      toggle: "Battery protection",
      toggleOn: "On",
      toggleOff: "Off",
      tariffTitle: "Smart tariff",
      tariffRows: { now: "Rate now", next: "Next change", slot: "Extra slot", none: "none planned", planned: "planned", active: "active now", done: "finished" },
      evTitle: "EV charger",
      evRows: { power: "Charging power", session: "Session energy", source: "Energy source", since: "Connected since", fromGrid: "grid", fromSolar: "solar", fromBat: "battery" },
      batTitle: "Home battery",
      batRows: { power: "Power", capacity: "Capacity", reserve: "Reserve", charged: "Charged today", discharged: "Discharged today" },
      chartTitle: "Power · last 24 hours",
      chartLegend: { solar: "Solar", home: "Home", ev: "EV", import: "Grid import", soc: "Battery SOC" },
      chartBands: { cheap: "Off-peak", slot: "Extra slot" },
      energyTitle: "Energy today",
      energyRows: { solar: "Solar production", home: "Home use", ev: "EV charging", import: "Grid import", export: "Grid export", selfSuff: "Self-sufficiency" },
      weekTitle: "Last 7 days",
      weekLegend: { solar: "Solar", home: "Home", import: "Import", export: "Export" },
      eventsTitle: "Recent events",
      statusTitle: "System status",
      timelineTitle: "Day scenario",
      phases: { pv: "Solar production", charge: "Battery charging", slot: "EV slot", end: "Slot ends", evening: "Evening", night: "Night" },
      play: "Resume",
      pause: "Pause",
      fastNight: "Night, fast forward",
      weather: { sun: "Sunny", cloud: "Cloudy", night: "Clear" },
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      ev_: {
        slotPlanned: (a, b) => `Extra cheap slot planned ${a}–${b}`,
        slotStart: "Extra cheap slot started",
        evConnected: "Car connected to the charger",
        evStart: "EV: Ready → Charging",
        evStop: "EV: Charging → Ready",
        evAway: "Car left",
        protOn: "Battery protection: discharge paused",
        protHold: "Inverter confirmed: the battery does not supply the EV",
        protRestore: "Slot ended, restoring the inverter mode",
        protIdle: "Self-use restored and verified",
        leak: "Warning: the battery is supplying the car",
        batFull: "Battery full, surplus exported",
        solarEnd: "Solar finished, the battery powers the home",
        offpeakStart: "Off-peak window: battery held by schedule",
        offpeakEnd: "Off-peak ended, the battery powers the home again",
        reserve: "Battery reached its reserve",
        midnight: "New day: daily counters reset",
        toggleOn: "Battery protection switched on",
        toggleOff: "Battery protection switched off",
        ready: "System ready",
      },
      info: {
        pv: "Solar covers the home and the surplus charges the home battery.",
        charge: "The battery charges from surplus solar. Once it is full, the rest is exported.",
        slotWait: "The supplier has planned an extra cheap slot. The car is connected and waiting.",
        slot: "Cheap slot: the car charges from the grid and the battery is kept for the evening.",
        leak: "Without protection the inverter treats the car as home load and discharges the battery into it.",
        end: "The slot has ended. The system restores the previous inverter mode and checks the result.",
        evening: "No more solar. The battery powers the home and the grid only covers the peaks.",
        night: "Night, fast forward. In the off-peak window the battery is held and the home runs from the grid.",
        paused: "Simulation paused. Pick a stage or resume playback.",
      },
    },
    dk: {
      dec: ",",
      locale: "da-DK",
      fsOpen: "Fuld skærm",
      fsClose: "Luk fuld skærm",
      nodes: { solar: "Solceller", grid: "Elnet", home: "Hus", ev: "Ladeboks", battery: "Batteri" },
      short: { solar: "Sol", grid: "Net", home: "Hus", ev: "Elbil", battery: "Batteri" },
      balanceTitle: "Balance nu: hvor energien går hen",
      kpi: {
        solar: "Solceller", home: "Hus", battery: "Husbatteri", grid: "Elnet", ev: "Ladeboks", tariff: "Tarif",
        today: (v) => `I dag ${v}`,
      },
      bat: { charging: "Lader", discharging: "Forsyner huset", idle: "Standby", held: "Holdt", full: "Fuldt" },
      grid: { import: "Køber", export: "Sælger", idle: "I balance" },
      ev: { away: "Bilen er væk", ready: "Klar", charging: "Lader", connected: "Bilen er tilsluttet" },
      tariff: { peak: "Dyr periode", offpeak: "Billig periode", slot: "Ekstra billig periode" },
      unitRate: "kr/kWh",
      rate: { peak: 2.85, cheap: 0.95 },
      flowTitle: "Energiflow",
      flowNote: "Retning og effekt live",
      protectTitle: "Batteribeskyttelse",
      protect: {
        idle: { title: "Standby", note: "Ingen aktiv ladeperiode for elbilen." },
        protecting: { title: "Beskytter", note: "Kommando sendt til inverteren, resultatet kontrolleres." },
        holding: { title: "Holder batteriet", note: "Bilen lader fra nettet. Batteriet forsyner ikke elbilen." },
        restoring: { title: "Gendanner", note: "Perioden er slut, inverterens tidligere tilstand gendannes." },
        off: { title: "Beskyttelse slået fra", note: "Batteriet kan forsyne bilen i en billig periode." },
        leak: { title: "Batteriet forsyner bilen", note: "Lagret strøm går til bilen i en billig periode." },
      },
      steps: { idle: "Standby", protecting: "Beskytter", holding: "Holder", restoring: "Gendanner" },
      protectRows: { batToEv: "Batteri → elbil", mode: "Invertertilstand", lastRestore: "Seneste gendannelse", none: "ingen" },
      modes: { self: "Egetforbrug", hold: "Afladning pauset (elbil)", offpeak: "Billig periode: batteri holdt" },
      toggle: "Batteribeskyttelse",
      toggleOn: "Til",
      toggleOff: "Fra",
      tariffTitle: "Smart tarif",
      tariffRows: { now: "Pris nu", next: "Næste skift", slot: "Ekstra periode", none: "ingen planlagt", planned: "planlagt", active: "aktiv nu", done: "afsluttet" },
      evTitle: "Ladeboks",
      evRows: { power: "Ladeeffekt", session: "Energi i sessionen", source: "Energikilde", since: "Tilsluttet siden", fromGrid: "elnet", fromSolar: "sol", fromBat: "batteri" },
      batTitle: "Husbatteri",
      batRows: { power: "Effekt", capacity: "Kapacitet", reserve: "Reserve", charged: "Opladet i dag", discharged: "Afladet i dag" },
      chartTitle: "Effekt · seneste 24 timer",
      chartLegend: { solar: "Sol", home: "Hus", ev: "Elbil", import: "Køb fra nettet", soc: "Batteri SOC" },
      chartBands: { cheap: "Billig periode", slot: "Ekstra periode" },
      energyTitle: "Energi i dag",
      energyRows: { solar: "Solcelleproduktion", home: "Husets forbrug", ev: "Opladning af elbil", import: "Købt fra nettet", export: "Solgt til nettet", selfSuff: "Selvforsyning" },
      weekTitle: "Seneste 7 dage",
      weekLegend: { solar: "Sol", home: "Hus", import: "Køb", export: "Salg" },
      eventsTitle: "Seneste hændelser",
      statusTitle: "Systemstatus",
      timelineTitle: "Døgnets forløb",
      phases: { pv: "Solproduktion", charge: "Batteriet lader", slot: "Elbilperiode", end: "Periode slut", evening: "Aften", night: "Nat" },
      play: "Fortsæt",
      pause: "Pause",
      fastNight: "Natten i hurtig gengivelse",
      weather: { sun: "Solrigt", cloud: "Skyet", night: "Klart" },
      days: ["søn", "man", "tir", "ons", "tor", "fre", "lør"],
      ev_: {
        slotPlanned: (a, b) => `Ekstra billig periode planlagt ${a}–${b}`,
        slotStart: "Ekstra billig periode startet",
        evConnected: "Bilen er tilsluttet ladeboksen",
        evStart: "Elbil: Klar → Lader",
        evStop: "Elbil: Lader → Klar",
        evAway: "Bilen er kørt",
        protOn: "Batteribeskyttelse: afladning pauset",
        protHold: "Inverteren bekræfter: batteriet forsyner ikke elbilen",
        protRestore: "Perioden er slut, invertertilstanden gendannes",
        protIdle: "Egetforbrug gendannet og kontrolleret",
        leak: "Advarsel: batteriet forsyner bilen",
        batFull: "Batteriet er fuldt, overskud sælges",
        solarEnd: "Solproduktionen er slut, batteriet forsyner huset",
        offpeakStart: "Billig natperiode: batteriet holdes af tidsplanen",
        offpeakEnd: "Billig periode slut, batteriet forsyner igen huset",
        reserve: "Batteriet har nået sin reserve",
        midnight: "Nyt døgn: dagstællere nulstillet",
        toggleOn: "Batteribeskyttelse slået til",
        toggleOff: "Batteribeskyttelse slået fra",
        ready: "Systemet er klar",
      },
      info: {
        pv: "Solcellerne dækker husets forbrug, og overskuddet lader husbatteriet.",
        charge: "Batteriet lader med overskud fra solcellerne. Når det er fuldt, sælges resten.",
        slotWait: "Elselskabet har planlagt en ekstra billig periode. Bilen er tilsluttet og venter.",
        slot: "Billig periode: bilen lader fra nettet, og batteriet gemmes til aftenen.",
        leak: "Uden beskyttelse ser inverteren bilen som husets forbrug og aflader batteriet til den.",
        end: "Perioden er slut. Systemet gendanner inverterens tidligere tilstand og kontrollerer resultatet.",
        evening: "Solcellerne producerer ikke længere. Batteriet forsyner huset, og nettet dækker kun toppene.",
        night: "Natten i hurtig gengivelse. I den billige periode holdes batteriet, og huset kører på nettet.",
        paused: "Simuleringen er sat på pause. Vælg et trin, eller fortsæt afspilningen.",
      },
    },
  };
  const t = STRINGS[LANG];

  /* ---------------- model instalacji (dane demonstracyjne) ---------------- */
  const CAP = 11.6;          // kWh pojemnosci uzytkowej
  const MAX_CH = 3.6;        // kW ladowania
  const MAX_DIS = 2.8;       // kW rozladowania
  const RESERVE = 10;        // % rezerwy
  const EV_KW = 7.2;         // kW ladowarki
  const EFF = 0.95;          // sprawnosc jednego kierunku
  const hm = (h, m) => h * 60 + m;
  const OFFPEAK = [hm(23, 30), hm(5, 30)];
  const SLOT = [hm(15, 30), hm(16, 30)];
  const SLOT_PLANNED = hm(14, 50);
  const EV_ARRIVE = hm(14, 10);
  const EV_LEAVE = hm(8, 0);
  const NIGHT_EV_KWH = 9.5;  // dodatkowa sesja w tanim oknie nocnym
  const PROTECT_MIN = 2;     // min symulowanych na weryfikacje

  /* odcinki czasu doby -> sekundy rzeczywiste (lacznie ok. 85 s) */
  const SEGMENTS = [
    { from: hm(10, 30), to: hm(12, 30), sec: 14 },
    { from: hm(12, 30), to: hm(15, 25), sec: 14 },
    { from: hm(15, 25), to: hm(15, 36), sec: 8 },
    { from: hm(15, 36), to: hm(16, 29), sec: 12 },
    { from: hm(16, 29), to: hm(16, 36), sec: 6 },
    { from: hm(16, 36), to: hm(17, 0), sec: 3 },
    { from: hm(17, 0), to: hm(22, 30), sec: 18 },
    { from: hm(22, 30), to: hm(34, 30), sec: 10 }, // noc do 10:30 nastepnego dnia
  ];
  const PHASES = [
    { id: "pv", start: hm(10, 30) },
    { id: "charge", start: hm(12, 30) },
    { id: "slot", start: hm(15, 25) },
    { id: "end", start: hm(16, 29) },
    { id: "evening", start: hm(17, 0) },
    { id: "night", start: hm(22, 30) },
  ];
  const CYCLE_START = hm(10, 30);

  const tod = (m) => ((m % 1440) + 1440) % 1440;
  const dayOf = (m) => Math.floor(m / 1440);
  const inRange = (x, a, b) => (a <= b ? x >= a && x < b : x >= a || x < b);

  function speedAt(m) {
    let x = tod(m);
    if (x < hm(10, 30)) x += 1440;
    for (const s of SEGMENTS) if (x >= s.from && x < s.to) return (s.to - s.from) / s.sec;
    return 10;
  }
  function phaseAt(m) {
    let x = tod(m);
    if (x < CYCLE_START) x += 1440;
    let cur = PHASES[0];
    for (const p of PHASES) if (x >= p.start) cur = p;
    return cur.id;
  }

  /* profil domu: punkty [minuta, kW], interpolacja + zmarszczki + krotkie piki */
  const HOME_PTS = [[0, .38], [360, .38], [400, .65], [440, 1.1], [500, .8], [690, .78], [720, 1.2], [780, .82], [1020, .9], [1050, 1.25], [1065, 2.35], [1135, 2.5], [1150, 1.4], [1260, 1.3], [1290, 1.0], [1350, .58], [1440, .38]];
  const SPIKES = [[hm(10, 52), 3, 2.0], [hm(13, 20), 4, 1.6], [hm(16, 4), 4, 1.8], [hm(18, 10), 3, 1.2], [hm(7, 15), 3, 2.0]];
  function homeLoad(m) {
    const x = tod(m);
    let base = HOME_PTS[0][1];
    for (let i = 1; i < HOME_PTS.length; i++) {
      const [a, va] = HOME_PTS[i - 1], [b, vb] = HOME_PTS[i];
      if (x >= a && x <= b) { const k = (x - a) / (b - a); const s = k * k * (3 - 2 * k); base = va + (vb - va) * s; break; }
    }
    const ripple = 0.06 * Math.sin(x / 6.3) + 0.04 * Math.sin(x / 2.7 + 1.3) + 0.03 * Math.sin(x / 17 + dayOf(m));
    let spike = 0;
    for (const [s, len, kw] of SPIKES) if (x >= s && x < s + len) spike += kw;
    return Math.max(0.25, base + ripple + spike);
  }
  const SUNRISE = hm(7, 0), SUNSET = hm(19, 5);
  function solarPower(m) {
    const x = tod(m);
    if (x <= SUNRISE || x >= SUNSET) return 0;
    const k = (x - SUNRISE) / (SUNSET - SUNRISE);
    const shape = Math.pow(Math.sin(Math.PI * k), 1.6);
    const day = dayOf(m);
    const dayF = 0.94 + 0.06 * Math.sin(day * 1.9 + 0.4);
    const cloud = 1 - 0.14 * Math.max(0, Math.sin(x / 21 + day)) * Math.max(0, Math.sin(x / 53 + 0.7));
    return Math.max(0, 4.4 * shape * dayF * cloud);
  }
  function outsideTemp(m) {
    const x = tod(m);
    const bump = x > hm(7, 0) && x < hm(22, 0) ? Math.sin(Math.PI * (x - hm(7, 0)) / hm(15, 0)) : 0;
    return 11.5 + 6.5 * bump;
  }
  const isOffpeak = (m) => inRange(tod(m), OFFPEAK[0], OFFPEAK[1]);
  const isSlot = (m) => inRange(tod(m), SLOT[0], SLOT[1]);
  function tariffAt(m) {
    if (isSlot(m)) return "slot";
    if (isOffpeak(m)) return "offpeak";
    return "peak";
  }
  const rateOf = (kind) => (kind === "peak" ? t.rate.peak : t.rate.cheap);

  /* ---------------- stan ---------------- */
  function freshState(startMinute) {
    return {
      m: startMinute,
      soc: 22,
      solar: 0, home: 0, ev: 0, bat: 0, grid: 0,
      evConn: false, evCharging: false, session: 0, sessionTarget: 0, connSince: null, nightDone: false,
      prot: "idle", protT: 0, lastRestore: null, leakWarned: false,
      mode: "self",
      flows: { s2h: 0, s2e: 0, s2b: 0, s2g: 0, b2h: 0, b2e: 0, g2h: 0, g2e: 0 },
      today: { solar: 0, home: 0, ev: 0, imp: 0, exp: 0, batIn: 0, batOut: 0 },
      week: [],
      partialDay: true,
      hist: [],
      events: [],
      flags: { full: false, solarEnd: false, reserve: false, planned: false, slotStart: false },
    };
  }
  let protectionEnabled = true;
  let S = null;

  function pushEvent(key, tone = "info", arg) {
    const msg = typeof t.ev_[key] === "function" ? t.ev_[key](...(arg || [])) : t.ev_[key];
    S.events.unshift({ m: S.m, msg, tone });
    if (S.events.length > 8) S.events.length = 8;
  }

  /* jeden krok fizyki (dt w minutach) */
  function step(dt) {
    const prev = S.m;
    const m = S.m + dt;
    const x = tod(m);

    // polnoc: zerowanie licznikow dziennych
    if (dayOf(m) !== dayOf(prev)) {
      if (!S.partialDay) S.week.push({ ...S.today });
      S.partialDay = false;
      if (S.week.length > 6) S.week.shift();
      S.today = { solar: 0, home: 0, ev: 0, imp: 0, exp: 0, batIn: 0, batOut: 0 };
      S.flags = { full: false, solarEnd: false, reserve: false, planned: false, slotStart: false };
      S.nightDone = false;
      pushEvent("midnight", "info");
    }
    S.m = m;

    // auto: przyjazd, wyjazd
    const crossed = (edge) => inRange(edge, tod(prev), x) && tod(prev) !== x;
    if (!S.evConn && crossed(EV_ARRIVE)) { S.evConn = true; S.connSince = m; pushEvent("evConnected", "info"); }
    if (S.evConn && crossed(EV_LEAVE)) { S.evConn = false; S.evCharging = false; S.connSince = null; pushEvent("evAway", "info"); }

    // taryfa: zapowiedz i start okna
    if (!S.flags.planned && crossed(SLOT_PLANNED)) { S.flags.planned = true; pushEvent("slotPlanned", "info", [fmtTime(SLOT[0]), fmtTime(SLOT[1])]); }
    if (!S.flags.slotStart && crossed(SLOT[0])) { S.flags.slotStart = true; pushEvent("slotStart", "info"); }
    if (crossed(OFFPEAK[0])) pushEvent("offpeakStart", "info");
    if (crossed(OFFPEAK[1])) pushEvent("offpeakEnd", "info");

    // ladowanie auta: dodatkowe okno (od +1 min) oraz tania strefa nocna
    const slotNow = isSlot(m);
    const wantSlot = slotNow && S.evConn && inRange(x, SLOT[0] + 1, SLOT[1]);
    const wantNight = isOffpeak(m) && S.evConn && !S.nightDone;
    if (!S.evCharging && (wantSlot || wantNight)) {
      S.evCharging = true; S.session = 0; S.sessionTarget = wantNight ? NIGHT_EV_KWH : 99;
      pushEvent("evStart", "info");
    } else if (S.evCharging && !(wantSlot || wantNight)) {
      S.evCharging = false; pushEvent("evStop", "info");
    } else if (S.evCharging && wantNight && S.session >= S.sessionTarget) {
      S.evCharging = false; S.nightDone = true; pushEvent("evStop", "info");
    }
    const targetEv = S.evCharging ? EV_KW : 0;
    S.ev = S.ev + (targetEv - S.ev) * clamp(dt / 0.6, 0, 1); // krotka rampa jak w realnej ladowarce
    if (S.ev < 0.02) S.ev = 0;

    // ochrona baterii (tylko dodatkowe okno dostawcy)
    const slotCharging = slotNow && S.evCharging;
    if (protectionEnabled) {
      if (S.prot === "idle" && slotCharging) { S.prot = "protecting"; S.protT = m; pushEvent("protOn", "ok"); }
      else if (S.prot === "protecting" && m - S.protT >= PROTECT_MIN) { S.prot = "holding"; S.protT = m; pushEvent("protHold", "ok"); }
      else if ((S.prot === "protecting" || S.prot === "holding") && !slotCharging) { S.prot = "restoring"; S.protT = m; pushEvent("protRestore", "info"); }
      else if (S.prot === "restoring" && m - S.protT >= PROTECT_MIN) { S.prot = "idle"; S.lastRestore = m; pushEvent("protIdle", "ok"); }
    } else if (S.prot === "protecting" || S.prot === "holding") {
      S.prot = "restoring"; S.protT = m;
    } else if (S.prot === "restoring" && m - S.protT >= PROTECT_MIN) {
      S.prot = "idle"; S.lastRestore = m; pushEvent("protIdle", "ok");
    }

    // moce zrodel
    S.solar = solarPower(m);
    S.home = homeLoad(m);
    const holdForEv = S.prot === "protecting" || S.prot === "holding";
    S.mode = holdForEv ? "hold" : (isOffpeak(m) ? "offpeak" : "self");

    // decyzja baterii
    const net = S.solar - S.home - S.ev;
    let charge = 0, discharge = 0;
    if (net > 0 && S.soc < 100) {
      const taper = S.soc < 95 ? 1 : clamp((100 - S.soc) / 5, 0, 1);
      charge = Math.min(net, MAX_CH * taper);
    } else if (net < 0 && S.mode === "self" && S.soc > RESERVE) {
      const taper = S.soc > RESERVE + 3 ? 1 : clamp((S.soc - RESERVE) / 3, 0, 1);
      discharge = Math.min(-net, MAX_DIS * taper);
    }
    S.bat = charge - discharge;
    S.grid = S.home + S.ev + charge - discharge - S.solar;

    // podzial przeplywow (PV: dom, EV, bateria, siec; bateria: dom, EV)
    const f = S.flows;
    let rem = S.solar;
    f.s2h = Math.min(rem, S.home); rem -= f.s2h;
    f.s2e = Math.min(rem, S.ev); rem -= f.s2e;
    f.s2b = Math.min(rem, charge); rem -= f.s2b;
    f.s2g = Math.max(0, rem);
    f.b2h = Math.min(discharge, S.home - f.s2h);
    f.b2e = Math.max(0, discharge - f.b2h);
    f.g2h = Math.max(0, S.home - f.s2h - f.b2h);
    f.g2e = Math.max(0, S.ev - f.s2e - f.b2e);

    // calkowanie energii
    const h = dt / 60;
    S.soc = clamp(S.soc + (charge * EFF - discharge / EFF) * h / CAP * 100, 0, 100);
    S.today.solar += S.solar * h;
    S.today.home += S.home * h;
    S.today.ev += S.ev * h;
    S.today.imp += Math.max(0, S.grid) * h;
    S.today.exp += Math.max(0, -S.grid) * h;
    S.today.batIn += charge * h;
    S.today.batOut += discharge * h;
    if (S.evCharging) S.session += S.ev * h;

    // zdarzenia stanu
    if (!S.flags.full && S.soc >= 99.5) { S.flags.full = true; pushEvent("batFull", "ok"); }
    if (!S.flags.solarEnd && x > hm(16, 0) && S.solar < 0.05) { S.flags.solarEnd = true; pushEvent("solarEnd", "info"); }
    if (!S.flags.reserve && S.soc <= RESERVE + 0.3) { S.flags.reserve = true; pushEvent("reserve", "warn"); }
    if (f.b2e > 0.05 && !S.leakWarned) { S.leakWarned = true; pushEvent("leak", "warn"); }
    if (f.b2e <= 0.05) S.leakWarned = false;

    // historia co 5 min
    const last = S.hist[S.hist.length - 1];
    if (!last || m - last.m >= 5) {
      S.hist.push({ m, solar: S.solar, home: S.home, ev: S.ev, imp: Math.max(0, S.grid), soc: S.soc });
      while (S.hist.length && S.hist[0].m < m - 1440) S.hist.shift();
    }
  }
  function advance(minutes) {
    let left = minutes;
    while (left > 1e-9) { const d = Math.min(0.5, left); step(d); left -= d; }
  }

  /* start: rozbieg od 10:30 poprzedniego dnia, zeby wykres i liczniki mialy dane */
  const BASE_DAY = 1;
  function bootState(targetMinute) {
    S = freshState(BASE_DAY * 1440 - 1440 + CYCLE_START - 1440);
    S.evConn = false;
    // syntetyczne wczesniejsze dni do wykresu tygodnia (spojne rzedy wielkosci)
    for (let i = 0; i < 6; i++) {
      const k = Math.sin(i * 2.1 + 0.6);
      S.week.push({ solar: 19 + 5 * k, home: 17 + 2.5 * Math.cos(i * 1.3), ev: i % 2 ? 7.1 : 16.6, imp: 13 + 4 * Math.cos(i * 1.7), exp: 6 + 3 * k, batIn: 9, batOut: 9 });
    }
    advance(targetMinute - S.m);
    S.events = [];
  }

  /* ---------------- formatowanie ---------------- */
  const fmtNum = (v, d = 1) => v.toFixed(d).replace(".", t.dec);
  const fmtPow = (kw) => {
    const a = Math.abs(kw);
    if (a < 0.05) return "0 W";
    if (a < 1) return `${Math.round(a * 1000 / 10) * 10} W`;
    return `${fmtNum(a, 1)} kW`;
  };
  const fmtKwh = (v) => `${fmtNum(v, 1)} kWh`;
  function fmtTime(m) {
    const x = tod(m);
    return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(Math.floor(x % 60)).padStart(2, "0")}`;
  }
  const fmtRate = (r) => `${fmtNum(r, t.unitRate === "p/kWh" ? 1 : 2)} ${t.unitRate}`;
  const realDay0 = new Date(); realDay0.setHours(0, 0, 0, 0);
  function simDate(m) {
    const d = new Date(realDay0.getTime() + (dayOf(m) - BASE_DAY) * 86400000);
    return d;
  }
  function fmtDate(m) {
    const d = simDate(m);
    try { return d.toLocaleDateString(t.locale, { weekday: "short", day: "numeric", month: "short" }).replace(/\.$/, ""); }
    catch (e) { return `${t.days[d.getDay()]} ${d.getDate()}`; }
  }

  /* ---------------- ikony ---------------- */
  const ICON = {
    solar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5 7.5 21.5M12 2.5l4.5 19M5 7.5h14M6.2 12.5h11.6M9.5 7.5l5 5M14.5 7.5l-5 5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/></svg>',
    ev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 15.5 6 10.5c.3-1 1.2-1.7 2.2-1.7h7.6c1 0 1.9.7 2.2 1.7l1.5 5"/><path d="M3.5 15.5h17v3.2H3.5z"/><circle cx="7.3" cy="18.7" r="1.4"/><circle cx="16.7" cy="18.7" r="1.4"/><path d="m12.6 3.5-1.9 3h2.6l-1.9 3"/></svg>',
    battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="4.5" width="11" height="16.5" rx="2"/><path d="M10 2.8h4"/><path d="m12.6 8.5-2 3.4h3l-2 3.6"/></svg>',
    tariff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 2.8 19.5h18.4Z"/><path d="M12 10v4.2M12 17.2v.1"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v1.8M12 19.2V21M3 12h1.8M19.2 12H21M5.6 5.6l1.3 1.3M17.1 17.1l1.3 1.3M5.6 18.4l1.3-1.3M17.1 6.9l1.3-1.3"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18Z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg>',
  };

  /* ---------------- budowa DOM ---------------- */
  const refs = {};
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function buildKpis() {
    const wrap = $("[data-ee='kpis']");
    const defs = [["solar", "solar"], ["home", "home"], ["battery", "battery"], ["grid", "grid"], ["ev", "ev"], ["tariff", "tariff"]];
    refs.kpi = {};
    defs.forEach(([key, icon]) => {
      const k = el("div", `ee-kpi ee-kpi--${key}`);
      k.innerHTML = `<span class="ee-kpi-top"><span class="ee-kpi-ic" aria-hidden="true">${ICON[icon]}</span><span class="ee-kpi-label">${t.kpi[key]}</span></span>
        <b class="ee-kpi-val"></b><small class="ee-kpi-sub"></small>${key === "battery" ? '<span class="ee-kpi-bar"><i></i></span>' : ""}`;
      wrap.appendChild(k);
      refs.kpi[key] = { root: k, val: k.querySelector(".ee-kpi-val"), sub: k.querySelector(".ee-kpi-sub"), bar: k.querySelector(".ee-kpi-bar i") };
    });
  }

  /* schemat przeplywu: SVG */
  const NODES = {
    solar: { x: 320, y: 92, r: 52 },
    grid: { x: 92, y: 262, r: 52 },
    home: { x: 320, y: 262, r: 66 },
    ev: { x: 548, y: 262, r: 52 },
    battery: { x: 320, y: 432, r: 52 },
  };
  const LINKS = ["solar", "grid", "ev", "battery"];
  function linkPoints(key, reverse) {
    const a = NODES[key], b = NODES.home;
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L;
    const p1 = { x: a.x + ux * (a.r + 8), y: a.y + uy * (a.r + 8) };
    const p2 = { x: b.x - ux * (b.r + 8), y: b.y - uy * (b.r + 8) };
    return reverse ? [p2, p1] : [p1, p2];
  }
  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function buildFlow() {
    const host = $("[data-ee='flow']");
    const svg = svgEl("svg", { viewBox: "0 0 640 520", class: "ee-flow-svg", role: "img", "aria-label": t.flowTitle });
    host.appendChild(svg);
    const defs = svgEl("defs", {}, svg);
    const glow = svgEl("filter", { id: "eeGlow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    svgEl("feGaussianBlur", { stdDeviation: "6", result: "b" }, glow);
    const merge = svgEl("feMerge", {}, glow);
    svgEl("feMergeNode", { in: "b" }, merge);
    svgEl("feMergeNode", { in: "SourceGraphic" }, merge);

    refs.links = {};
    LINKS.forEach((key) => {
      const g = svgEl("g", { class: "ee-link is-idle", "data-link": key }, svg);
      const [p1, p2] = linkPoints(key, false);
      const d = `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      const track = svgEl("path", { d, class: "ee-link-track" }, g);
      const flow = svgEl("path", { d, class: "ee-link-flow", id: `eePath-${key}` }, g);
      const arrows = [];
      for (let i = 0; i < 2; i++) {
        const ar = svgEl("path", { d: "M-6 -5 L4 0 L-6 5", class: "ee-link-arrow" }, g);
        arrows.push(ar);
      }
      refs.links[key] = { g, track, flow, arrows, dir: 0, speed: 0 };
    });

    refs.nodes = {};
    Object.entries(NODES).forEach(([key, n]) => {
      const g = svgEl("g", { class: `ee-node ee-node--${key}`, transform: `translate(${n.x} ${n.y})` }, svg);
      svgEl("circle", { r: n.r + 12, class: "ee-node-halo" }, g);
      svgEl("circle", { r: n.r, class: "ee-node-disc" }, g);
      let ring = null;
      if (key === "battery") {
        const C = 2 * Math.PI * (n.r + 6);
        svgEl("circle", { r: n.r + 6, class: "ee-soc-track" }, g);
        ring = svgEl("circle", { r: n.r + 6, class: "ee-soc-ring", "stroke-dasharray": `0 ${C}`, transform: "rotate(-90)" }, g);
        ring._C = C;
      }
      const fo = svgEl("foreignObject", { x: -n.r, y: -n.r, width: n.r * 2, height: n.r * 2 }, g);
      const inner = document.createElement("div");
      inner.className = "ee-node-inner";
      inner.innerHTML = `<span class="ee-node-ic">${ICON[key]}</span><b class="ee-node-val">0 W</b>${key === "battery" ? '<small class="ee-node-soc">0%</small>' : key === "home" ? `<small class="ee-node-soc">${t.nodes.home}</small>` : ""}`;
      fo.appendChild(inner);
      if (key !== "home") {
        const label = svgEl("text", { y: n.r + (key === "battery" ? 36 : 30), class: "ee-node-label", "text-anchor": "middle", "dominant-baseline": "middle" }, g);
        label.textContent = t.nodes[key];
        if (key === "solar") label.setAttribute("y", -n.r - 22);
      }
      refs.nodes[key] = { g, val: inner.querySelector(".ee-node-val"), soc: inner.querySelector(".ee-node-soc"), ring };
    });
  }

  const BALANCE = [["s2h", "solar", "home"], ["s2e", "solar", "ev"], ["s2b", "solar", "battery"], ["s2g", "solar", "grid"], ["b2h", "battery", "home"], ["b2e", "battery", "ev"], ["g2h", "grid", "home"], ["g2e", "grid", "ev"]];
  function buildBalance() {
    const host = $("[data-ee='flow']");
    const box = el("div", "ee-balance");
    box.innerHTML = `<small>${t.balanceTitle}</small><div class="ee-balance-grid">${BALANCE.map(([k, a, b]) => `<span class="ee-bal is-from-${a}" data-bal="${k}"><i></i><em>${t.short[a]} → ${t.short[b]}</em><b></b></span>`).join("")}</div>`;
    host.appendChild(box);
    refs.bal = {};
    BALANCE.forEach(([k]) => { const n = box.querySelector(`[data-bal='${k}']`); refs.bal[k] = { root: n, val: n.querySelector("b") }; });
  }

  function buildSide() {
    // ochrona baterii
    const p = $("[data-ee='protect']");
    p.innerHTML = `
      <div class="ee-card-head"><span class="ee-card-title"><span class="ee-card-ic" aria-hidden="true">${ICON.shield}</span>${t.protectTitle}</span>
        <button class="ee-switch" type="button" data-ee="toggle" aria-pressed="true"><span class="ee-switch-label">${t.toggle}</span><span class="ee-switch-track"><i></i></span><span class="ee-switch-state" data-ee="toggleState"></span></button></div>
      <div class="ee-protect-main" data-ee="protMain" role="status" aria-live="polite">
        <span class="ee-protect-badge" data-ee="protIc" aria-hidden="true">${ICON.shield}</span>
        <span class="ee-protect-copy"><b data-ee="protTitle"></b><small data-ee="protNote"></small></span>
      </div>
      <ol class="ee-steps" data-ee="steps">${["idle", "protecting", "holding", "restoring"].map((k) => `<li data-step="${k}"><i></i><span>${t.steps[k]}</span></li>`).join("")}</ol>
      <dl class="ee-rows">
        <div><dt>${t.protectRows.batToEv}</dt><dd data-ee="batToEv"></dd></div>
        <div><dt>${t.protectRows.mode}</dt><dd data-ee="invMode"></dd></div>
        <div><dt>${t.protectRows.lastRestore}</dt><dd data-ee="lastRestore"></dd></div>
      </dl>`;
    // taryfa
    const tr = $("[data-ee='tariff']");
    tr.innerHTML = `
      <div class="ee-card-head"><span class="ee-card-title"><span class="ee-card-ic" aria-hidden="true">${ICON.tariff}</span>${t.tariffTitle}</span><span class="ee-pill" data-ee="tariffPill"></span></div>
      <div class="ee-tariff-now"><span><small>${t.tariffRows.now}</small><b data-ee="rateNow"></b></span><span><small>${t.tariffRows.next}</small><b data-ee="nextChange"></b></span></div>
      <div class="ee-tariff-strip" data-ee="tariffStrip" aria-hidden="true"></div>
      <dl class="ee-rows"><div><dt>${t.tariffRows.slot}</dt><dd data-ee="slotInfo"></dd></div></dl>`;
    const strip = $("[data-ee='tariffStrip']");
    const seg = (a, b, cls) => { const s = el("i", cls); s.style.left = `${a / 14.4}%`; s.style.width = `${(b - a) / 14.4}%`; strip.appendChild(s); };
    seg(0, OFFPEAK[1], "is-cheap"); seg(OFFPEAK[0], 1440, "is-cheap"); seg(SLOT[0], SLOT[1], "is-slot");
    refs.stripNow = el("b", "ee-strip-now"); strip.appendChild(refs.stripNow);
    ["00", "06", "12", "18", "24"].forEach((hh, i) => { const s = el("em", "", hh); s.style.left = `${i * 25}%`; strip.appendChild(s); });
    // ladowarka EV
    const ev = $("[data-ee='ev']");
    ev.innerHTML = `
      <div class="ee-card-head"><span class="ee-card-title"><span class="ee-card-ic" aria-hidden="true">${ICON.ev}</span>${t.evTitle}</span><span class="ee-pill" data-ee="evPill"></span></div>
      <div class="ee-ev-main"><b data-ee="evPower"></b><span class="ee-ev-bar"><i data-ee="evBar"></i></span></div>
      <dl class="ee-rows">
        <div><dt>${t.evRows.session}</dt><dd data-ee="evSession"></dd></div>
        <div><dt>${t.evRows.source}</dt><dd data-ee="evSource"></dd></div>
        <div><dt>${t.evRows.since}</dt><dd data-ee="evSince"></dd></div>
      </dl>`;
    // bateria
    const b = $("[data-ee='battery']");
    b.innerHTML = `
      <div class="ee-card-head"><span class="ee-card-title"><span class="ee-card-ic" aria-hidden="true">${ICON.battery}</span>${t.batTitle}</span><span class="ee-pill" data-ee="batPill"></span></div>
      <div class="ee-bat-main"><b data-ee="batSoc"></b><span class="ee-bat-bar"><i data-ee="batBar"></i><em style="left:${RESERVE}%"></em></span></div>
      <dl class="ee-rows">
        <div><dt>${t.batRows.power}</dt><dd data-ee="batPow"></dd></div>
        <div><dt>${t.batRows.capacity}</dt><dd>${fmtKwh(CAP)} · ${t.batRows.reserve} ${RESERVE}%</dd></div>
        <div><dt>${t.batRows.charged}</dt><dd data-ee="batIn"></dd></div>
        <div><dt>${t.batRows.discharged}</dt><dd data-ee="batOut"></dd></div>
      </dl>`;
  }

  function buildLower() {
    const c = $("[data-ee='chart']");
    c.innerHTML = `<div class="ee-card-head"><span class="ee-card-title">${t.chartTitle}</span></div>
      <div class="ee-legend">${[["solar", "solar"], ["home", "home"], ["ev", "ev"], ["import", "import"], ["soc", "soc"]].map(([k, cls]) => `<span class="is-${cls}"><i></i>${t.chartLegend[k]}</span>`).join("")}<span class="is-band-cheap"><i></i>${t.chartBands.cheap}</span><span class="is-band-slot"><i></i>${t.chartBands.slot}</span></div>`;
    const svg = svgEl("svg", { viewBox: "0 0 720 250", class: "ee-chart-svg", preserveAspectRatio: "none", "aria-hidden": "true" });
    c.appendChild(svg);
    refs.chart = { svg, bands: svgEl("g", { class: "ee-chart-bands" }, svg), grid: svgEl("g", { class: "ee-chart-grid" }, svg), lines: {}, now: null, axis: svgEl("g", { class: "ee-chart-axis" }, svg) };
    for (let i = 0; i <= 4; i++) svgEl("line", { x1: 36, x2: 690, y1: 20 + i * 50, y2: 20 + i * 50 }, refs.chart.grid);
    [0, 2, 4, 6, 8].forEach((v, i) => { const tx = svgEl("text", { x: 30, y: 224 - i * 50, "text-anchor": "end" }, refs.chart.axis); tx.textContent = v ? `${v}` : "0"; });
    const kwLabel = svgEl("text", { x: 30, y: 12, "text-anchor": "end" }, refs.chart.axis); kwLabel.textContent = "kW";
    const socLabel = svgEl("text", { x: 694, y: 12, "text-anchor": "start" }, refs.chart.axis); socLabel.textContent = "%";
    ["solar", "home", "ev", "imp", "soc"].forEach((k) => { refs.chart.lines[k] = svgEl("polyline", { class: `ee-line ee-line--${k}`, fill: "none" }, svg); });
    refs.chart.now = svgEl("line", { class: "ee-chart-now", y1: 16, y2: 222 }, svg);
    refs.chart.ticks = svgEl("g", { class: "ee-chart-ticks" }, svg);

    const en = $("[data-ee='energy']");
    en.innerHTML = `<div class="ee-card-head"><span class="ee-card-title">${t.energyTitle}</span><span class="ee-pill ee-pill--soft" data-ee="selfSuff"></span></div>
      <dl class="ee-rows ee-rows--energy">
        ${["solar", "home", "ev", "import", "export"].map((k) => `<div class="is-${k}"><dt><i></i>${t.energyRows[k]}</dt><dd data-ee="en-${k}"></dd></div>`).join("")}
      </dl>
      <div class="ee-week"><small>${t.weekTitle}</small><div class="ee-week-bars" data-ee="week"></div>
      <div class="ee-legend ee-legend--week">${["solar", "home", "import", "export"].map((k) => `<span class="is-${k}"><i></i>${t.weekLegend[k]}</span>`).join("")}</div></div>`;

    const evs = $("[data-ee='events']");
    evs.innerHTML = `<div class="ee-card-head"><span class="ee-card-title">${t.eventsTitle}</span></div><ul class="ee-events" data-ee="eventsList"></ul>`;
  }

  function buildTimeline() {
    const tl = $("[data-ee='timeline']");
    tl.innerHTML = `<div class="ee-tl-head"><span class="ee-tl-title">${t.timelineTitle}</span>
        <button class="ee-play" type="button" data-ee="play" aria-pressed="false"><span class="ee-play-ic" data-ee="playIc" aria-hidden="true"></span><span data-ee="playLabel"></span></button></div>
      <div class="ee-tl-chips" role="group" aria-label="${t.timelineTitle}">${PHASES.map((p) => `<button type="button" class="ee-chip" data-phase="${p.id}" aria-pressed="false"><span>${t.phases[p.id]}</span><i class="ee-chip-bar"><b></b></i></button>`).join("")}</div>`;
  }

  /* ---------------- render ---------------- */
  const LINK_COLOR = {
    solar: () => "solar",
    grid: (v) => (v > 0 ? "import" : "export"),
    ev: () => "ev",
    battery: (v) => (v > 0 ? "charge" : "discharge"),
  };
  function setLink(key, powerKw, towardHome) {
    const L = refs.links[key];
    const active = Math.abs(powerKw) >= 0.05;
    L.g.classList.toggle("is-idle", !active);
    ["solar", "import", "export", "ev", "charge", "discharge"].forEach((c) => L.g.classList.remove(`is-${c}`));
    if (!active) { L.dir = 0; L.arrows.forEach((a) => a.setAttribute("opacity", "0")); return; }
    L.g.classList.add(`is-${LINK_COLOR[key](key === "grid" ? powerKw : key === "battery" ? powerKw : 1)}`);
    const dir = towardHome ? 1 : -1;
    const speed = Math.abs(powerKw) > 4 ? 3 : Math.abs(powerKw) > 1.5 ? 2 : 1;
    if (dir !== L.dir || speed !== L.speed) {
      L.dir = dir; L.speed = speed;
      const [p1, p2] = linkPoints(key, !towardHome);
      L.flow.setAttribute("d", `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
      L.g.style.setProperty("--ee-dash-dur", `${[0, 1.9, 1.3, 0.85][speed]}s`);
      L.p1 = p1; L.p2 = p2;
      L.ang = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      L.dur = [0, 3200, 2300, 1600][speed];
      L.arrows.forEach((a) => a.setAttribute("opacity", "1"));
      placeArrows(L, performance.now());
    }
  }
  /* strzalki przesuwane w petli (bez SMIL): dwie na linie, rownomiernie */
  function placeArrows(L, now) {
    if (!L.dir || !L.p1) return;
    L.arrows.forEach((a, i) => {
      let k;
      if (prefersReduced) { k = 0.5; if (i === 1) { a.setAttribute("opacity", "0"); } }
      else k = ((now / L.dur) + i * 0.5) % 1;
      const x = L.p1.x + (L.p2.x - L.p1.x) * k, y = L.p1.y + (L.p2.y - L.p1.y) * k;
      const fade = prefersReduced ? 1 : Math.min(1, k * 6, (1 - k) * 6);
      a.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${L.ang.toFixed(1)})`);
      if (!(prefersReduced && i === 1)) a.setAttribute("opacity", fade.toFixed(2));
    });
  }

  function protView() {
    if (!protectionEnabled && S.flows.b2e > 0.05) return "leak";
    if (!protectionEnabled && S.prot === "idle") return "off";
    return S.prot;
  }

  function render() {
    const f = S.flows;
    // hero
    refs.clock.textContent = fmtTime(S.m);
    refs.date.textContent = fmtDate(S.m);
    const x = tod(S.m);
    const night = x < SUNRISE || x > SUNSET;
    const cloudy = !night && S.solar < solarPowerClear(S.m) * 0.9;
    refs.wIc.innerHTML = night ? ICON.moon : cloudy ? ICON.cloud : ICON.sun;
    refs.wTemp.textContent = `${fmtNum(outsideTemp(S.m), 0)}°C`;

    // KPI
    const k = refs.kpi;
    k.solar.val.textContent = fmtPow(S.solar);
    k.solar.sub.textContent = t.kpi.today(fmtKwh(S.today.solar));
    k.home.val.textContent = fmtPow(S.home);
    k.home.sub.textContent = t.kpi.today(fmtKwh(S.today.home));
    k.battery.val.textContent = `${Math.round(S.soc)}%`;
    const batWord = S.bat > 0.05 ? t.bat.charging : S.bat < -0.05 ? t.bat.discharging : (S.mode !== "self" ? t.bat.held : S.soc > 99 ? t.bat.full : t.bat.idle);
    k.battery.sub.textContent = `${batWord} · ${fmtPow(S.bat)}`;
    k.battery.bar.style.width = `${S.soc.toFixed(1)}%`;
    k.grid.val.textContent = fmtPow(S.grid);
    k.grid.sub.textContent = S.grid > 0.05 ? t.grid.import : S.grid < -0.05 ? t.grid.export : t.grid.idle;
    k.grid.root.dataset.tone = S.grid > 0.05 ? "import" : S.grid < -0.05 ? "export" : "";
    k.ev.val.textContent = fmtPow(S.ev);
    k.ev.sub.textContent = S.evCharging ? t.ev.charging : S.evConn ? t.ev.connected : t.ev.away;
    k.ev.root.dataset.tone = S.evCharging ? "ev" : "";
    const tk = tariffAt(S.m);
    k.tariff.val.textContent = fmtRate(rateOf(tk));
    k.tariff.sub.textContent = t.tariff[tk];
    k.tariff.root.dataset.tone = tk === "slot" ? "slot" : tk === "offpeak" ? "cheap" : "";
    const pv = protView();
    k.battery.root.dataset.tone = pv === "leak" ? "warn" : (pv === "holding" || pv === "protecting") ? "ok" : "";

    // przeplyw
    setLink("solar", S.solar, true);
    setLink("grid", S.grid, S.grid > 0);
    setLink("ev", S.ev, false);
    setLink("battery", S.bat, S.bat < 0);
    const n = refs.nodes;
    n.solar.val.textContent = fmtPow(S.solar);
    n.grid.val.textContent = fmtPow(S.grid);
    n.home.val.textContent = fmtPow(S.home);
    n.ev.val.textContent = fmtPow(S.ev);
    n.battery.val.textContent = fmtPow(S.bat);
    n.battery.soc.textContent = `${Math.round(S.soc)}%`;
    n.battery.ring.setAttribute("stroke-dasharray", `${(n.battery.ring._C * S.soc / 100).toFixed(1)} ${n.battery.ring._C.toFixed(1)}`);
    BALANCE.forEach(([key]) => {
      const v = f[key];
      const r = refs.bal[key];
      r.val.textContent = fmtPow(v);
      r.root.classList.toggle("is-zero", v < 0.05);
      r.root.dataset.tone = key === "b2e" ? (v >= 0.05 ? "warn" : (S.evCharging ? "ok" : "")) : "";
    });
    panel.dataset.grid = S.grid > 0.05 ? "import" : S.grid < -0.05 ? "export" : "idle";
    panel.dataset.bat = S.bat > 0.05 ? "charge" : S.bat < -0.05 ? "discharge" : "idle";
    panel.dataset.ev = S.evCharging ? "charging" : "idle";
    panel.dataset.solar = S.solar > 0.05 ? "on" : "off";
    panel.dataset.prot = pv;

    // ochrona
    const pd = t.protect[pv];
    refs.protTitle.textContent = pd.title;
    refs.protNote.textContent = pd.note;
    refs.protIc.innerHTML = pv === "leak" ? ICON.warn : ICON.shield;
    const order = ["idle", "protecting", "holding", "restoring"];
    const cur = pv === "leak" || pv === "off" ? -1 : order.indexOf(S.prot);
    $$("li", refs.steps).forEach((li, i) => { li.classList.toggle("is-active", i === cur); li.classList.toggle("is-done", cur > 0 && i < cur); });
    refs.batToEv.textContent = fmtPow(f.b2e);
    refs.batToEv.dataset.tone = f.b2e > 0.05 ? "warn" : (S.evCharging ? "ok" : "");
    refs.invMode.textContent = t.modes[S.mode];
    refs.lastRestore.textContent = S.lastRestore == null ? t.protectRows.none : fmtTime(S.lastRestore);
    refs.toggle.setAttribute("aria-pressed", protectionEnabled ? "true" : "false");
    refs.toggleState.textContent = protectionEnabled ? t.toggleOn : t.toggleOff;

    // taryfa
    refs.tariffPill.textContent = t.tariff[tk];
    refs.tariffPill.dataset.tone = tk === "slot" ? "slot" : tk === "offpeak" ? "cheap" : "";
    refs.rateNow.textContent = fmtRate(rateOf(tk));
    refs.nextChange.textContent = fmtTime(nextTariffChange(S.m));
    refs.stripNow.style.left = `${x / 14.4}%`;
    const slotTxt = isSlot(S.m) ? t.tariffRows.active : (x >= SLOT[1] && S.flags.planned) ? t.tariffRows.done : S.flags.planned ? t.tariffRows.planned : t.tariffRows.none;
    refs.slotInfo.textContent = S.flags.planned ? `${fmtTime(SLOT[0])}–${fmtTime(SLOT[1])} · ${slotTxt}` : slotTxt;

    // EV
    refs.evPill.textContent = S.evCharging ? t.ev.charging : S.evConn ? t.ev.ready : t.ev.away;
    refs.evPill.dataset.tone = S.evCharging ? "ev" : "";
    refs.evPower.textContent = fmtPow(S.ev);
    refs.evBar.style.width = `${(S.ev / EV_KW * 100).toFixed(1)}%`;
    refs.evSession.textContent = fmtKwh(S.session);
    if (S.ev > 0.05) {
      const pct = (v) => Math.round(v / S.ev * 100);
      const parts = [[f.g2e, t.evRows.fromGrid], [f.s2e, t.evRows.fromSolar], [f.b2e, t.evRows.fromBat]].filter(([v]) => v > 0.05).map(([v, l]) => `${l} ${pct(v)}%`);
      refs.evSource.textContent = parts.join(" · ");
      refs.evSource.dataset.tone = f.b2e > 0.05 ? "warn" : "";
    } else { refs.evSource.textContent = "·"; refs.evSource.dataset.tone = ""; }
    refs.evSince.textContent = S.connSince == null ? "·" : fmtTime(S.connSince);

    // bateria
    refs.batPill.textContent = batWord;
    refs.batPill.dataset.tone = S.bat > 0.05 ? "charge" : S.bat < -0.05 ? "discharge" : "";
    refs.batSoc.textContent = `${fmtNum(S.soc, 0)}%`;
    refs.batBar.style.width = `${S.soc.toFixed(1)}%`;
    refs.batPow.textContent = `${S.bat > 0.05 ? "+" : S.bat < -0.05 ? "−" : ""}${fmtPow(S.bat)}`;
    refs.batIn.textContent = fmtKwh(S.today.batIn);
    refs.batOut.textContent = fmtKwh(S.today.batOut);

    // energia dzis
    refs.en.solar.textContent = fmtKwh(S.today.solar);
    refs.en.home.textContent = fmtKwh(S.today.home);
    refs.en.ev.textContent = fmtKwh(S.today.ev);
    refs.en.import.textContent = fmtKwh(S.today.imp);
    refs.en.export.textContent = fmtKwh(S.today.exp);
    const use = S.today.home + S.today.ev;
    refs.selfSuff.textContent = `${t.energyRows.selfSuff} ${use > 0.1 ? Math.round(clamp(1 - S.today.imp / use, 0, 1) * 100) : 0}%`;

    renderPhase();
    renderInfo(pv);
  }
  const solarPowerClear = (m) => { const x = tod(m); if (x <= SUNRISE || x >= SUNSET) return 0; const kk = (x - SUNRISE) / (SUNSET - SUNRISE); return 4.4 * Math.pow(Math.sin(Math.PI * kk), 1.6) * (0.94 + 0.06 * Math.sin(dayOf(m) * 1.9 + 0.4)); };
  function nextTariffChange(m) {
    const x = tod(m);
    const edges = [OFFPEAK[0], OFFPEAK[1], SLOT[0], SLOT[1]].sort((a, b) => a - b);
    for (const e of edges) if (e > x) return e;
    return edges[0];
  }

  let lastChartM = -1, lastChartTs = 0, lastWeekKey = "", lastEventsKey = "";
  function renderSlow() {
    // wykres 24 h (co najmniej 4 min symulacji i 150 ms czasu rzeczywistego)
    const nowTs = performance.now();
    if (lastChartM < 0 || (Math.abs(S.m - lastChartM) >= 4 && nowTs - lastChartTs > 150)) {
      lastChartM = S.m; lastChartTs = nowTs;
      const c = refs.chart;
      const X0 = 36, X1 = 690, start = S.m - 1440;
      const px = (m) => X0 + (m - start) / 1440 * (X1 - X0);
      const py = (kw) => 220 - clamp(kw, 0, 8) / 8 * 200;
      const ps = (soc) => 220 - soc / 100 * 200;
      const pts = { solar: [], home: [], ev: [], imp: [], soc: [] };
      S.hist.forEach((h) => {
        const X = px(h.m).toFixed(1);
        pts.solar.push(`${X},${py(h.solar).toFixed(1)}`);
        pts.home.push(`${X},${py(h.home).toFixed(1)}`);
        pts.ev.push(`${X},${py(h.ev).toFixed(1)}`);
        pts.imp.push(`${X},${py(h.imp).toFixed(1)}`);
        pts.soc.push(`${X},${ps(h.soc).toFixed(1)}`);
      });
      Object.keys(pts).forEach((kk) => c.lines[kk].setAttribute("points", pts[kk].join(" ")));
      c.now.setAttribute("x1", X1); c.now.setAttribute("x2", X1);
      // pasy taryfy
      c.bands.innerHTML = "";
      const band = (a, b, cls) => {
        const xa = clamp(px(a), X0, X1), xb = clamp(px(b), X0, X1);
        if (xb - xa > 0.5) svgEl("rect", { x: xa, y: 16, width: xb - xa, height: 206, class: cls }, c.bands);
      };
      const d0 = Math.floor(start / 1440) * 1440 - 1440;
      for (let d = d0; d <= S.m; d += 1440) {
        band(d + OFFPEAK[0], Math.min(d + 1440 + OFFPEAK[1], S.m), "is-cheap");
        if (d + SLOT[0] < S.m) band(d + SLOT[0], Math.min(d + SLOT[1], S.m), "is-slot");
      }
      c.ticks.innerHTML = "";
      for (let h = Math.ceil(start / 180) * 180; h <= S.m; h += 180) {
        const tx = svgEl("text", { x: px(h), y: 242, "text-anchor": "middle" }, c.ticks);
        tx.textContent = fmtTime(h);
      }
    }
    // tydzien
    const days = [...S.week.slice(-6), S.today];
    const key = days.map((d) => d.solar.toFixed(1) + d.imp.toFixed(1)).join("|");
    if (key !== lastWeekKey) {
      lastWeekKey = key;
      const wk = refs.week;
      wk.innerHTML = "";
      const max = Math.max(20, ...days.map((d) => Math.max(d.solar, d.home + d.ev, d.imp, d.exp)));
      days.forEach((d, i) => {
        const col = el("div", `ee-week-col${i === days.length - 1 ? " is-today" : ""}`);
        const bars = el("div", "ee-week-stack");
        [["solar", d.solar], ["home", d.home + d.ev], ["import", d.imp], ["export", d.exp]].forEach(([cls, v]) => {
          const b = el("i", `is-${cls}`); b.style.height = `${(v / max * 100).toFixed(1)}%`; bars.appendChild(b);
        });
        col.appendChild(bars);
        const dd = simDate(S.m - (days.length - 1 - i) * 1440);
        col.appendChild(el("small", "", t.days[dd.getDay()]));
        wk.appendChild(col);
      });
    }
    // zdarzenia
    const ek = S.events.map((e) => e.m + e.msg).join("|");
    if (ek !== lastEventsKey) {
      lastEventsKey = ek;
      refs.events.innerHTML = S.events.slice(0, 6).map((e) => `<li data-tone="${e.tone}"><i></i><time>${fmtTime(e.m)}</time><span>${e.msg}</span></li>`).join("");
    }
  }

  function renderPhase() {
    const ph = phaseAt(S.m);
    refs.chips.forEach((c) => {
      const on = c.dataset.phase === ph;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
      const i = PHASES.findIndex((p) => p.id === c.dataset.phase);
      const a = PHASES[i].start, b = i < PHASES.length - 1 ? PHASES[i + 1].start : CYCLE_START + 1440;
      let xx = tod(S.m); if (xx < CYCLE_START) xx += 1440;
      const prog = on ? clamp((xx - a) / (b - a), 0, 1) : 0;
      c.querySelector(".ee-chip-bar b").style.width = `${(prog * 100).toFixed(1)}%`;
    });
    panel.dataset.phase = ph;
  }
  function renderInfo(pv) {
    const ph = phaseAt(S.m);
    let key = ph;
    if (!playing) key = "paused";
    else if (pv === "leak") key = "leak";
    else if (ph === "slot") key = S.evCharging ? "slot" : "slotWait";
    else if (ph === "end") key = "end";
    refs.info.textContent = t.info[key];
    refs.infoWrap.dataset.tone = pv === "leak" ? "warn" : (ph === "slot" && S.evCharging) ? "ok" : "";
  }

  /* ---------------- sterowanie ---------------- */
  let playing = !prefersReduced;
  let lastTs = performance.now();
  function setPlaying(on) {
    playing = on;
    refs.play.setAttribute("aria-pressed", on ? "false" : "true");
    refs.playLabel.textContent = on ? t.pause : t.play;
    refs.playIc.innerHTML = on ? ICON.pause : ICON.play;
    panel.classList.toggle("is-ee-paused", !on);
    lastTs = performance.now();
    render();
  }
  /* skok do etapu: deterministyczne przeliczenie od poczatku z biezacym
     ustawieniem ochrony, wiec liczniki, SOC i historia pozostaja spojne */
  function jumpTo(phaseId) {
    const p = PHASES.find((q) => q.id === phaseId);
    bootState(BASE_DAY * 1440 + p.start + (p.start < CYCLE_START ? 1440 : 0));
    lastChartM = -1; lastChartTs = 0; lastWeekKey = ""; lastEventsKey = "";
    pushEvent("ready", "ok");
    lastTs = performance.now();
    render(); renderSlow();
  }

  function tick(now) {
    const dtReal = Math.min(0.25, (now - lastTs) / 1000);
    lastTs = now;
    if (!document.hidden) Object.values(refs.links).forEach((L) => placeArrows(L, now));
    if (playing && !document.hidden) {
      let left = dtReal;
      while (left > 1e-6) {
        const sp = speedAt(S.m);
        const d = Math.min(left, 0.05);
        advance(sp * d);
        left -= d;
      }
      render();
      renderSlow();
    }
    requestAnimationFrame(tick);
  }

  /* ---------------- start ---------------- */
  buildKpis();
  buildFlow();
  buildBalance();
  buildSide();
  buildLower();
  buildTimeline();
  Object.assign(refs, {
    clock: $("[data-ee='clock']"), date: $("[data-ee='date']"), wIc: $("[data-ee='wIc']"), wTemp: $("[data-ee='wTemp']"),
    protTitle: $("[data-ee='protTitle']"), protNote: $("[data-ee='protNote']"), protIc: $("[data-ee='protIc']"), steps: $("[data-ee='steps']"),
    batToEv: $("[data-ee='batToEv']"), invMode: $("[data-ee='invMode']"), lastRestore: $("[data-ee='lastRestore']"),
    toggle: $("[data-ee='toggle']"), toggleState: $("[data-ee='toggleState']"),
    tariffPill: $("[data-ee='tariffPill']"), rateNow: $("[data-ee='rateNow']"), nextChange: $("[data-ee='nextChange']"), slotInfo: $("[data-ee='slotInfo']"),
    evPill: $("[data-ee='evPill']"), evPower: $("[data-ee='evPower']"), evBar: $("[data-ee='evBar']"), evSession: $("[data-ee='evSession']"), evSource: $("[data-ee='evSource']"), evSince: $("[data-ee='evSince']"),
    batPill: $("[data-ee='batPill']"), batSoc: $("[data-ee='batSoc']"), batBar: $("[data-ee='batBar']"), batPow: $("[data-ee='batPow']"), batIn: $("[data-ee='batIn']"), batOut: $("[data-ee='batOut']"),
    en: { solar: $("[data-ee='en-solar']"), home: $("[data-ee='en-home']"), ev: $("[data-ee='en-ev']"), import: $("[data-ee='en-import']"), export: $("[data-ee='en-export']") },
    selfSuff: $("[data-ee='selfSuff']"), week: $("[data-ee='week']"), events: $("[data-ee='eventsList']"),
    info: $("[data-ee='infoText']"), infoWrap: $("[data-ee='info']"),
    play: $("[data-ee='play']"), playLabel: $("[data-ee='playLabel']"), playIc: $("[data-ee='playIc']"),
    chips: $$(".ee-chip", panel),
  });

  refs.toggle.addEventListener("click", () => {
    protectionEnabled = !protectionEnabled;
    pushEvent(protectionEnabled ? "toggleOn" : "toggleOff", protectionEnabled ? "ok" : "warn");
    render(); renderSlow();
  });
  refs.play.addEventListener("click", () => setPlaying(!playing));
  refs.chips.forEach((c) => c.addEventListener("click", () => { jumpTo(c.dataset.phase); }));

  // tlo zdjeciowe
  const bg = $("[data-ee='heroBg']");
  if (bg) bg.style.backgroundImage = 'url("/assets/demo/energia-ev/tlo-dom.webp")';

  // stan poczatkowy: przy ograniczonym ruchu pokazujemy od razu kluczowy moment (okno EV)
  bootState(BASE_DAY * 1440 + (prefersReduced ? hm(15, 50) : CYCLE_START));
  pushEvent("ready", "ok");
  setPlaying(playing);
  renderSlow();
  requestAnimationFrame(tick);

  /* ---------------- pelny ekran (ten sam mechanizm co pozostale panele) ---------------- */
  const fsButtons = $$("[data-ee-fs]", panel);
  const canNativeFs = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
  const FS_MARGIN = 26, FS_MIN_W = 900;
  function isFs() {
    return document.fullscreenElement === stage ||
      document.webkitFullscreenElement === stage ||
      stage.classList.contains("is-ee-pseudo-fs");
  }
  function fitFullscreen() {
    if (!isFs() || window.innerWidth < FS_MIN_W) { panel.style.removeProperty("--ee-fs-scale"); return; }
    panel.style.removeProperty("--ee-fs-scale");
    const s = Math.min(
      (window.innerWidth - FS_MARGIN * 2) / (panel.offsetWidth || 1),
      (window.innerHeight - FS_MARGIN * 2) / (panel.offsetHeight || 1),
      2.2
    );
    panel.style.setProperty("--ee-fs-scale", (s > 0 ? s : 1).toFixed(3));
  }
  function syncFsUi() {
    const on = isFs();
    document.body.classList.toggle("is-ee-fullscreen", on);
    stage.classList.toggle("is-ee-fullscreen", on);
    fsButtons.forEach((b) => {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      const l = b.querySelector(".ee-fs-label");
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
  function pseudoFs() { stage.classList.add("is-ee-pseudo-fs"); syncFsUi(); }
  function enterFs() {
    if (!canNativeFs) { pseudoFs(); return; }
    try {
      const req = (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      if (req && typeof req.catch === "function") req.catch(pseudoFs);
    } catch (err) { pseudoFs(); }
  }
  function exitFs() {
    if (stage.classList.contains("is-ee-pseudo-fs")) { stage.classList.remove("is-ee-pseudo-fs"); syncFsUi(); return; }
    (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
  }
  fsButtons.forEach((b) => b.addEventListener("click", () => (isFs() ? exitFs() : enterFs())));
  document.addEventListener("fullscreenchange", syncFsUi);
  document.addEventListener("webkitfullscreenchange", syncFsUi);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && stage.classList.contains("is-ee-pseudo-fs")) exitFs();
  });
  syncFsUi();

  /* hak diagnostyczny do QA (tylko odczyt stanu, bez wplywu na dzialanie) */
  window.__eeDemo = {
    state: () => S,
    advance: (min) => { advance(min); render(); renderSlow(); },
    jump: (id) => jumpTo(id),
    setProtection: (on) => { protectionEnabled = !!on; },
    speedAt,
  };
})();
