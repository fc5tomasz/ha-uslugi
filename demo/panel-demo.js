(() => {
  const DICT = {
    pl: {
      title_page: "Demonstracja możliwości Home Assistant | Tomasz Furdal",
      meta_desc: "Live demonstracja animowanego panelu Home Assistant: energia, ogrzewanie, pogoda, rekuperacja i stany domu w jednej wizualizacji.",
      kicker: "Demonstracja sterowania automatyką",
      title: "Demonstracja możliwości Home Assistant",
      subtitle: "To jest osobna podstrona pokazująca działający panel animowany oparty na logice instalacji Home Assistant. Widzisz wyłącznie panel demonstracyjny.",
      back_btn: "Wróć do strony głównej",
      what_label: "Co pokazuje panel",
      metric1_t: "Energia i PV",
      metric1_p: "Produkcję fotowoltaiki, przepływy energii i aktywne obiegi.",
      metric2_t: "Dom i ogrzewanie",
      metric2_p: "Bufor, pompy, piec, grzałki, światła i obecność jako część jednej animacji.",
      metric3_t: "Pogoda i rekuperacja",
      metric3_p: "Pogodę live, fazę dnia i pracę rekuperacji z animowanymi wirnikami.",
      sim_button: "🎲 Symuluj nową porę dnia",
      sim_button_mobile: "🎲 Symuluj porę dnia",
      sim_prompt: "Kliknij przycisk, aby rozpocząć symulację...",
      panel_online: "Panel online",
      panel_title: "Panel procesów instalacji",
      panel_subtitle: "Obecne oświetlenie",
      panel_panels: "Panele",
      panel_inv_dom: "Off-grid 2",
      panel_inv_taras: "Off-grid 1",
      panel_inv_hybrid: "Inwerter hybrydowy",
      panel_on: "Włączony",
      panel_off: "Wyłączony",
      panel_buffer: "Bufor",
      panel_heater_1: "Grzałka 1",
      panel_heater_2: "Grzałka 2",
      panel_mix_pump: "Pompa mieszacza",
      panel_main_pump: "Pompa obiegowa",
      panel_house: "Dom",
      panel_owner_home: "Właściciel w domu",
      panel_owner_away: "Właściciel poza domem",
      panel_reku: "Rekuperacja",
      panel_boiler: "Piec gazowy",
      panel_radiator: "Grzejnik elektryczny",
      panel_wind: "Wiatr",
      panel_humidity: "Wilg.",
      weather_sunny: "Słonecznie",
      weather_clear_night: "Bezchmurnie",
      weather_partlycloudy: "Częściowe chmury",
      weather_cloudy: "Pochmurno",
      weather_rainy: "Deszcz",
      weather_pouring: "Ulewa",
      weather_snowy: "Śnieg",
      weather_snowy_rainy: "Deszcz ze śniegiem",
      weather_hail: "Grad",
      weather_lightning: "Burza",
      weather_lightning_rainy: "Burza z deszczem",
      weather_windy: "Wietrznie",
      weather_windy_variant: "Wietrznie",
      weather_fog: "Mgła",
      weather_exceptional: "Pogoda",
      weather_sunrise: "Wschód słońca",
      weather_sunset: "Zachód słońca",
      weather_clear_night_sunny: "Bezchmurna noc",
      weather_clear_night_partlycloudy: "Pogodna noc",
      scenario_night:
        "🌙 Nocne podtrzymanie: Słońce zaszło. System optymalizuje zużycie energii. Piec gazowy i światła zarządzane są dynamicznie według potrzeb.",
      scenario_morning:
        "⛅ Poranek: Inwerter hybrydowy zasila dom. Off-grid 2 ładuje bufor, zapewniając ciepłą wodę użytkową (CWU), a Off-grid 1 zasila grzejnik dla szybkiego komfortu. Bufor nagrzewa wodę, ale nie ma jeszcze mocy do wsparcia ogrzewania domu (CO). System rekuperacji wietrzy pomieszczenia.",
      scenario_noon:
        "☀️ Południe: Inteligentne zarządzanie nadprodukcją. Bufor osiągnął temperaturę docelową – Off-grid 1 wyłącza grzejnik i zasila drugą grzałkę. Off-grid 2 nadal ładuje bufor, a pompy obiegowe uruchamiają darmowe ogrzewanie domu (CO).",
      scenario_sunset:
        "🌇 Zachód: Inwerter hybrydowy oraz inwertery Off-grid kończą produkcję. Pompy kontynuują dystrybucję energii z bufora do ogrzewania domu (CO). Sam bufor, poprzez wbudowane wężownice, zapewnia również stały dostęp do ciepłej wody użytkowej (CWU).",
      scenario_night_final:
        "🌙 Noc: Inwertery są uśpione. Ogrzewanie domu (CO) zabezpiecza piec gazowy – w zależności od temperatury we wnętrzu, system decyduje, czy musi go uruchomić, czy może on pozostać wyłączony. Wężownica w buforze utrzymuje dostęp do ciepłej wody (CWU). System inteligentnie zarządza oświetleniem (symulacja obecności) oraz optymalizuje pracę rekuperacji."
    },
    dk: {
      title_page: "Demonstration af Home Assistant muligheder | Tomasz Furdal",
      meta_desc: "Live demonstration af et animeret Home Assistant panel: energi, varme, vejr, varmegenvinding og hjemmets tilstand i én visualisering.",
      kicker: "Demo af automatiseringsstyring",
      title: "Demonstration af Home Assistant muligheder",
      subtitle: "Dette er en separat underside, der viser et fungerende animeret panel baseret på logikken i en Home Assistant-installation. Du ser kun et demonstrationspanel.",
      back_btn: "Tilbage til forsiden",
      what_label: "Hvad panelet viser",
      metric1_t: "Energi og PV",
      metric1_p: "Solproduktion, energiflow og aktive kredse.",
      metric2_t: "Hus og varme",
      metric2_p: "Buffer, pumper, kedel, varmelegemer, lys og tilstedeværelse som en del af en samlet animation.",
      metric3_t: "Vejr og ventilation",
      metric3_p: "Live vejr, tid på dagen og varmegenvinding med animerede blæsere.",
      sim_button: "🎲 Simuler ny tid på dagen",
      sim_button_mobile: "🎲 Simuler tid på dagen",
      sim_prompt: "Klik på knappen for at starte simuleringen...",
      panel_online: "Panel online",
      panel_title: "Installationsprocespanel",
      panel_subtitle: "Nuværende belysning",
      panel_panels: "Paneler",
      panel_inv_dom: "Off-grid 2",
      panel_inv_taras: "Off-grid 1",
      panel_inv_hybrid: "Hybrid inverter",
      panel_on: "TÆNDT",
      panel_off: "Slukket",
      panel_buffer: "Buffer",
      panel_heater_1: "Varmelegeme 1",
      panel_heater_2: "Varmelegeme 2",
      panel_mix_pump: "Blandepumpe",
      panel_main_pump: "Cirkulationspumpe",
      panel_house: "Hjem",
      panel_owner_home: "Ejer hjemme",
      panel_owner_away: "Ejer ude",
      panel_reku: "Varmegenvinding",
      panel_boiler: "Gaskedel",
      panel_radiator: "El-radiator",
      panel_wind: "Vind",
      panel_humidity: "Luftfugt.",
      weather_sunny: "Solrigt",
      weather_clear_night: "Skyfrit",
      weather_partlycloudy: "Delvist overskyet",
      weather_cloudy: "Overskyet",
      weather_rainy: "Regn",
      weather_pouring: "Kraftig regn",
      weather_snowy: "Sne",
      weather_snowy_rainy: "Slud",
      weather_hail: "Hagl",
      weather_lightning: "Tordenvejr",
      weather_lightning_rainy: "Tordenvejr med regn",
      weather_windy: "Blæsende",
      weather_windy_variant: "Blæsende",
      weather_fog: "Tåge",
      weather_exceptional: "Vejr",
      weather_sunrise: "Solopgang",
      weather_sunset: "Solnedgang",
      weather_clear_night_sunny: "Klar nat",
      weather_clear_night_partlycloudy: "Skyfri nat",
      scenario_night:
        "🌙 Natlig vedligeholdelse: Solen er gået ned. Systemet optimerer energiforbruget. Gaskedlen og lyset styres dynamisk efter behov.",
      scenario_morning:
        "⛅ Morgen: Hybridinverteren forsyner hjemmet med strøm. Off-grid 2 oplader bufferen og leverer varmt brugsvand (Brugsvand), mens Off-grid 1 forsyner el-radiatoren for hurtig komfort. Bufferen opvarmer vandet, men har endnu ikke kraft nok til at understøtte centralvarmen (Varme). Varmegenvindingssystemet ventilerer rummene.",
      scenario_noon:
        "☀️ Middag: Intelligent styring af overproduktion. Bufferen har nået sin måltemperatur – Off-grid 1 slukker for radiatoren og forsyner det andet varmelegeme. Off-grid 2 fortsætter med at oplade bufferen, og cirkulationspumperne starter den gratis centralvarme (Varme) til hjemmet.",
      scenario_sunset:
        "🌇 Solnedgang: Hybridinverteren og Off-grid inverterne afslutter produktionen. Pumperne fortsætter med at distribuere energi fra bufferen til centralvarmen (Varme). Selve bufferen sikrer, via indbyggede rørslanger, også konstant adgang til varmt brugsvand (Brugsvand).",
      scenario_night_final:
        "🌙 Nat: Inverterne er i dvale. Hjemmets centralvarme (Varme) understøttes af gaskedlen – afhængigt af indendørstemperaturen beslutter systemet, om den skal startes, eller om den kan forblive slukket. Rørslangen i bufferen opretholder adgangen til varmt vand (Brugsvand). Systemet styrer belysningen intelligent (tilstedeværelsessimulering) og optimerer varmegenvindingens drift."
    },
    en: {
      title_page: "Home Assistant Capabilities Demo | Tomasz Furdal",
      meta_desc: "Live demonstration of an animated Home Assistant panel: energy, heating, weather, heat recovery, and home states in a single visualization.",
      kicker: "Automation Control Demo",
      title: "Home Assistant Capabilities Demo",
      subtitle: "This is a separate subpage showing a working animated panel based on the logic of a Home Assistant installation. You are viewing a demonstration panel only.",
      back_btn: "Return to homepage",
      what_label: "What the panel shows",
      metric1_t: "Energy and PV",
      metric1_p: "Solar production, energy flows and active circuits.",
      metric2_t: "House and heating",
      metric2_p: "Buffer tank, pumps, boiler, heaters, lights and presence as part of one animation.",
      metric3_t: "Weather and ventilation",
      metric3_p: "Live weather, time of day, and ventilation with animated fans.",
      sim_button: "🎲 Simulate a new time of day",
      sim_button_mobile: "🎲 Simulate time of day",
      sim_prompt: "Click the button to start the simulation...",
      panel_online: "Panel online",
      panel_title: "Installation Processes Panel",
      panel_subtitle: "Current lighting",
      panel_panels: "Panels",
      panel_inv_dom: "Off-grid 2",
      panel_inv_taras: "Off-grid 1",
      panel_inv_hybrid: "Hybrid inverter",
      panel_on: "ON",
      panel_off: "OFF",
      panel_buffer: "Thermal buffer",
      panel_heater_1: "Heater 1",
      panel_heater_2: "Heater 2",
      panel_mix_pump: "Mixer pump",
      panel_main_pump: "Circulation pump",
      panel_house: "Home",
      panel_owner_home: "Owner at home",
      panel_owner_away: "Owner away",
      panel_reku: "Heat recovery",
      panel_boiler: "Gas boiler",
      panel_radiator: "Electric heater",
      panel_wind: "Wind",
      panel_humidity: "Humidity",
      weather_sunny: "Sunny",
      weather_clear_night: "Clear",
      weather_partlycloudy: "Partly cloudy",
      weather_cloudy: "Cloudy",
      weather_rainy: "Rain",
      weather_pouring: "Heavy rain",
      weather_snowy: "Snow",
      weather_snowy_rainy: "Sleet",
      weather_hail: "Hail",
      weather_lightning: "Thunderstorm",
      weather_lightning_rainy: "Thunderstorm with rain",
      weather_windy: "Windy",
      weather_windy_variant: "Windy",
      weather_fog: "Fog",
      weather_exceptional: "Weather",
      weather_sunrise: "Sunrise",
      weather_sunset: "Sunset",
      weather_clear_night_sunny: "Clear night",
      weather_clear_night_partlycloudy: "Fair night",
      scenario_night:
        "🌙 Night maintenance: The sun has set. The system optimizes energy usage. The gas boiler and lights are managed dynamically according to demand.",
      scenario_morning:
        "⛅ Morning: The hybrid inverter powers the home. Off-grid 2 charges the thermal buffer, providing domestic hot water (DHW), while Off-grid 1 powers the electric heater for quick comfort. The buffer heats the water but does not yet have the power to support central heating (CH). The heat recovery system ventilates the rooms.",
      scenario_noon:
        "☀️ Noon: Smart overproduction management. The buffer has reached its target temperature – Off-grid 1 turns off the heater and powers the second heater element. Off-grid 2 continues to charge the buffer, and the circulation pumps start the free central heating (CH) for the home.",
      scenario_sunset:
        "🌇 Sunset: The hybrid inverter and Off-grid inverters finish production. The pumps continue to distribute energy from the buffer for central heating (CH). The buffer itself, through built-in coils, also ensures constant access to domestic hot water (DHW).",
      scenario_night_final:
        "🌙 Night: The inverters are asleep. The home's central heating (CH) is backed up by the gas boiler – depending on the indoor temperature, the system decides whether it needs to be turned on or can remain off. The coil in the buffer maintains access to hot water (DHW). The system intelligently manages lighting (presence simulation) and optimizes the heat recovery operation."
    }
  };

  function getLang() {
    const p = new URLSearchParams(window.location.search);
    const lang = (p.get("lang") || "pl").toLowerCase();
    const normalizedLang = lang === "da" ? "dk" : lang;
    return DICT[normalizedLang] ? normalizedLang : "pl";
  }

  function qs(sel) {
    return document.querySelector(sel);
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randFloat(min, max, precision = 1) {
    const value = min + Math.random() * (max - min);
    return Number(value.toFixed(precision));
  }

  function pickFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function applyI18n(lang) {
    const dict = DICT[lang];
    document.documentElement.lang = lang;
    document.title = dict.title_page;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && dict.meta_desc) {
      desc.setAttribute("content", dict.meta_desc);
    }
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    const back = qs("#backLink");
    if (back) {
      back.href = lang === "pl" ? "../index.html" : lang === "dk" ? "../dk/index.html" : "../en/index.html";
    }
    const buttonFull = qs("#btn-simulate .sim-label-full");
    const buttonMobile = qs("#btn-simulate .sim-label-mobile");
    if (buttonFull) {
      buttonFull.textContent = dict.sim_button;
    }
    if (buttonMobile) {
      buttonMobile.textContent = dict.sim_button_mobile || dict.sim_button;
    }
    const status = qs("#simulation-status");
    if (status) {
      status.textContent = dict.sim_prompt;
    }
  }

  class PanelDemoRenderer {
    constructor(root, dict) {
      this.root = root;
      this.dict = dict;
    }

    _num(v, fallback = 0) {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    }

    _rotor(cx, cy, color, active, dur) {
      return `
        <g transform="translate(${cx} ${cy})">
          <circle cx="0" cy="0" r="16" fill="rgba(255,255,255,0.07)" />
          <g class="rotor-blades ${active ? "rotor-active" : ""}" style="--rotor-dur:${dur};">
            <path d="M 0 -22 C 8 -14, 8 -5, 0 0 C -8 -5, -8 -14, 0 -22 Z" fill="${color}" />
            <path d="M 22 0 C 14 8, 5 8, 0 0 C 5 -8, 14 -8, 22 0 Z" fill="${color}" />
            <path d="M 0 22 C -8 14, -8 5, 0 0 C 8 5, 8 14, 0 22 Z" fill="${color}" />
            <path d="M -22 0 C -14 -8, -5 -8, 0 0 C -5 8, -14 8, -22 0 Z" fill="${color}" />
          </g>
        </g>
      `;
    }

    _rekuDur(percentage, isOn) {
      if (!isOn) return "0s";
      if (percentage >= 100) return "0.8s";
      if (percentage >= 75) return "1.1s";
      if (percentage >= 50) return "1.6s";
      if (percentage >= 25) return "2.3s";
      return "3.2s";
    }

    _weatherText(state, phase) {
      const map = {
        sunny: this.dict.weather_sunny,
        "clear-night": this.dict.weather_clear_night,
        partlycloudy: this.dict.weather_partlycloudy,
        cloudy: this.dict.weather_cloudy,
        rainy: this.dict.weather_rainy,
        pouring: this.dict.weather_pouring,
        snowy: this.dict.weather_snowy,
        "snowy-rainy": this.dict.weather_snowy_rainy,
        hail: this.dict.weather_hail,
        lightning: this.dict.weather_lightning,
        "lightning-rainy": this.dict.weather_lightning_rainy,
        windy: this.dict.weather_windy,
        "windy-variant": this.dict.weather_windy_variant,
        fog: this.dict.weather_fog,
        exceptional: this.dict.weather_exceptional
      };
      if (phase === "sunrise") return this.dict.weather_sunrise;
      if (phase === "sunset") return this.dict.weather_sunset;
      if (phase === "night" && state === "sunny") return this.dict.weather_clear_night_sunny;
      if (phase === "night" && state === "partlycloudy") return this.dict.weather_clear_night_partlycloudy;
      return map[state] || this.dict.weather_exceptional;
    }

    _weatherIcon(x, y, state, phase) {
      const sun = `
        <g transform="translate(${x} ${y})">
          <circle cx="0" cy="0" r="18" fill="#ffd666"/>
          <g stroke="#ffd666" stroke-width="4" stroke-linecap="round" opacity="0.95">
            <line x1="0" y1="-32" x2="0" y2="-24"/>
            <line x1="0" y1="24" x2="0" y2="32"/>
            <line x1="-32" y1="0" x2="-24" y2="0"/>
            <line x1="24" y1="0" x2="32" y2="0"/>
            <line x1="-23" y1="-23" x2="-17" y2="-17"/>
            <line x1="17" y1="17" x2="23" y2="23"/>
            <line x1="17" y1="-17" x2="23" y2="-23"/>
            <line x1="-23" y1="23" x2="-17" y2="17"/>
          </g>
        </g>
      `;
      const horizon = `
        <g transform="translate(${x} ${y})">
          <line x1="-34" y1="20" x2="34" y2="20" stroke="#c7925c" stroke-width="4" stroke-linecap="round"/>
        </g>
      `;
      const sunriseSun = `
        <g transform="translate(${x} ${y})">
          <path d="M -20 20 A 20 20 0 0 1 20 20" fill="#ffb157" opacity="0.95"/>
          <g stroke="#ffb157" stroke-width="4" stroke-linecap="round">
            <line x1="0" y1="-12" x2="0" y2="-22"/>
            <line x1="-15" y1="-6" x2="-22" y2="-12"/>
            <line x1="15" y1="-6" x2="22" y2="-12"/>
          </g>
        </g>
      `;
      const sunsetSun = `
        <g transform="translate(${x} ${y})">
          <path d="M -20 20 A 20 20 0 0 1 20 20" fill="#ff9960" opacity="0.95"/>
          <g stroke="#ff9960" stroke-width="4" stroke-linecap="round">
            <line x1="0" y1="-18" x2="0" y2="-28"/>
            <line x1="-15" y1="-10" x2="-22" y2="-16"/>
            <line x1="15" y1="-10" x2="22" y2="-16"/>
          </g>
        </g>
      `;
      const moon = `
        <g transform="translate(${x} ${y})">
          <circle cx="0" cy="0" r="19" fill="#dce8ff"/>
          <circle cx="8" cy="-5" r="17" fill="rgba(19,26,36,.96)"/>
          <circle cx="-16" cy="-12" r="2.4" fill="#dce8ff"/>
          <circle cx="-8" cy="-22" r="1.8" fill="#dce8ff"/>
          <circle cx="-20" cy="-2" r="1.6" fill="#dce8ff"/>
        </g>
      `;
      const cloud = `
        <g transform="translate(${x} ${y})">
          <circle cx="-10" cy="0" r="14" fill="#c7d7e7"/>
          <circle cx="8" cy="-6" r="18" fill="#d7e4f0"/>
          <circle cx="26" cy="2" r="13" fill="#c7d7e7"/>
          <rect x="-24" y="0" width="62" height="20" rx="10" fill="#d7e4f0"/>
        </g>
      `;
      const rain = `
        <g transform="translate(${x} ${y})" stroke="#6fd5ff" stroke-width="4" stroke-linecap="round">
          <line x1="-16" y1="24" x2="-22" y2="36"/>
          <line x1="0" y1="24" x2="-6" y2="36"/>
          <line x1="16" y1="24" x2="10" y2="36"/>
        </g>
      `;
      const wind = `
        <g transform="translate(${x} ${y})" fill="none" stroke="#9fe3ff" stroke-width="4" stroke-linecap="round">
          <path d="M -30 -4 H 8 C 20 -4 22 -18 12 -22" />
          <path d="M -16 10 H 24 C 34 10 36 0 30 -4" />
          <path d="M -26 24 H 2 C 12 24 16 16 12 10" />
        </g>
      `;

      if (phase === "sunrise") return `${horizon}${sunriseSun}`;
      if (phase === "sunset") return `${horizon}${sunsetSun}`;
      if (state === "clear-night") return moon;
      if (state === "sunny") return phase === "night" ? moon : sun;
      if (state === "partlycloudy") return phase === "night" ? `${moon}${cloud}` : `${sun}${cloud}`;
      if (state === "cloudy" || state === "fog") return cloud;
      if (state === "rainy" || state === "pouring") return `${cloud}${rain}`;
      if (state === "windy" || state === "windy-variant") return wind;
      return cloud;
    }

    render(state) {
      const pos = {
        panels: { x: 74, y: 286, w: 260, h: 138 },
        invDom: { x: 192, y: 563, w: 136, h: 72 },
        invTaras: { x: 192, y: 700, w: 136, h: 72 },
        invHybrid: { x: 492, y: 296, w: 152, h: 72 },
        mixPump: { x: 402, y: 500, w: 50, h: 50 },
        buffer: { x: 505, y: 420, w: 142, h: 238 },
        mainPump: { x: 710, y: 500, w: 50, h: 50 },
        house: { x: 848, y: 334, w: 222, h: 286 },
        weather: { x: 838, y: 164, w: 280, h: 102 },
        reku: { x: 1162, y: 265, w: 114, h: 74 },
        boiler: { x: 1174, y: 404, w: 162, h: 72 },
        radiator: { x: 1174, y: 528, w: 162, h: 72 }
      };
      const heater1 = { x: pos.buffer.x + 22, y: pos.buffer.y + 166, w: 96, h: 26 };
      const heater2 = { x: pos.buffer.x + 22, y: pos.buffer.y + 204, w: 96, h: 26 };
      const splitY = pos.invTaras.y + 36;
      const splitX = heater2.x + heater2.w / 2;
      const sunRadius = state.sunActive ? 38 : 28;
      const sunOpacity = state.sunActive ? 1 : 0.25;
      const rayOpacity = state.sunActive ? 1 : 0.18;
      const hybridToHouse = Boolean(state.hybridToHouse);
      const offgrid2ToHeater1 = Boolean(state.offgrid2ToHeater1);
      const offgrid1ToRadiator = Boolean(state.offgrid1ToRadiator);
      const offgrid1ToHeater2 = Boolean(state.offgrid1ToHeater2);
      const on = (v) => (v ? "active" : "");
      const stateBox = (active, warm = false) => active ? (warm ? "box box-warm" : "box box-on") : "box";
      const bulb = (x, y, onState) => `
        <g transform="translate(${x} ${y})">
          <circle cx="0" cy="-4" r="9" fill="${onState ? "rgba(255,214,94,0.95)" : "rgba(164,184,205,0.18)"}" stroke="${onState ? "#ffd85f" : "rgba(164,184,205,0.42)"}" stroke-width="2"/>
          <rect x="-4" y="4" width="8" height="6" rx="2" fill="${onState ? "#ffd85f" : "rgba(164,184,205,0.35)"}"/>
          <line x1="-4" y1="12" x2="4" y2="12" stroke="${onState ? "#ffd85f" : "rgba(164,184,205,0.35)"}" stroke-width="2" stroke-linecap="round"/>
        </g>
      `;
      const haLogo = `
        <g transform="translate(${pos.house.x + pos.house.w / 2} ${pos.house.y + 70})">
          <path d="M -16 14 L -16 -2 L 0 -18 L 16 -2 L 16 14 L 5 14 L 5 0 L -5 0 L -5 14 Z" fill="none" stroke="#86baf0" stroke-width="3" stroke-linejoin="round"/>
        </g>
      `;
      const phoneBadge = `
        <g transform="translate(${pos.house.x + 44} ${pos.house.y + 237})">
          <circle cx="0" cy="-15" r="9" fill="${state.phoneHome ? "rgba(91,221,148,0.18)" : "rgba(164,184,205,0.10)"}" stroke="${state.phoneHome ? "#5bdd94" : "rgba(164,184,205,0.34)"}" stroke-width="2.2"/>
          <path d="M -14 12 C -14 -2, 14 -2, 14 12 L 14 20 L -14 20 Z" fill="${state.phoneHome ? "rgba(91,221,148,0.16)" : "rgba(164,184,205,0.10)"}" stroke="${state.phoneHome ? "#5bdd94" : "rgba(164,184,205,0.34)"}" stroke-width="2.2" stroke-linejoin="round"/>
        </g>
      `;

      this.root.innerHTML = `
        <div class="panel-card">
          <div class="panel-online-indicator">
            <span class="panel-online-dot"></span>
            <span>${this.dict.panel_online}</span>
          </div>
          <div class="panel-wrap">
            <svg class="panel-svg" viewBox="0 0 1440 860" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sunFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#ffe27a"/>
                  <stop offset="100%" stop-color="#ffad48"/>
                </linearGradient>
                <linearGradient id="pvFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#244867"/>
                  <stop offset="100%" stop-color="#2e608c"/>
                </linearGradient>
                <linearGradient id="houseFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#24374d"/>
                  <stop offset="100%" stop-color="#182636"/>
                </linearGradient>
              </defs>
              <text x="44" y="52" class="title">${this.dict.panel_title}</text>
              <text x="44" y="78" class="subtitle">${this.dict.panel_subtitle}: ${this._num(state.lux).toFixed(0)} lx</text>

              <g transform="translate(74 108)">
                <circle cx="72" cy="72" r="${sunRadius}" fill="url(#sunFill)" opacity="${sunOpacity}" class="${state.sunActive ? "sun-core-pulse" : ""}" />
                <g class="${state.sunActive ? "sun-ray-spin" : ""}" opacity="${rayOpacity}">
                  <line x1="72" y1="2" x2="72" y2="22" stroke="#ffd458" stroke-width="6" stroke-linecap="round" />
                  <line x1="72" y1="122" x2="72" y2="142" stroke="#ffd458" stroke-width="6" stroke-linecap="round" />
                  <line x1="2" y1="72" x2="22" y2="72" stroke="#ffd458" stroke-width="6" stroke-linecap="round" />
                  <line x1="122" y1="72" x2="142" y2="72" stroke="#ffd458" stroke-width="6" stroke-linecap="round" />
                  <line x1="21" y1="21" x2="37" y2="37" stroke="#ffd458" stroke-width="6" stroke-linecap="round" />
                  <line x1="107" y1="107" x2="123" y2="123" stroke="#ffd458" stroke-width="6" stroke-linecap="round" />
                  <line x1="107" y1="37" x2="123" y2="21" stroke="#ffd458" stroke-width="6" stroke-linecap="round" />
                  <line x1="21" y1="123" x2="37" y2="107" stroke="#ffd458" stroke-width="6" stroke-linecap="round" />
                </g>
              </g>

              <g transform="translate(${pos.panels.x} ${pos.panels.y})">
                <polygon points="0,${pos.panels.h} 18,0 ${pos.panels.w},0 ${pos.panels.w - 18},${pos.panels.h}" fill="url(#pvFill)" stroke="#7eb3e7" stroke-width="3"/>
                <line x1="32" y1="8" x2="14" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="58" y1="8" x2="40" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="84" y1="8" x2="66" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="110" y1="8" x2="92" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="136" y1="8" x2="118" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="162" y1="8" x2="144" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="188" y1="8" x2="170" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="214" y1="8" x2="196" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="240" y1="8" x2="222" y2="${pos.panels.h - 8}" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="10" y1="38" x2="${pos.panels.w - 8}" y2="38" stroke="#9ac8f2" stroke-width="2"/>
                <line x1="6" y1="76" x2="${pos.panels.w - 12}" y2="76" stroke="#9ac8f2" stroke-width="2"/>
                <text x="116" y="${pos.panels.h + 24}" class="label">${this.dict.panel_panels}</text>
              </g>

              <rect x="${pos.invDom.x}" y="${pos.invDom.y}" rx="16" ry="16" width="${pos.invDom.w}" height="${pos.invDom.h}" class="${stateBox(state.inverterDomProducing)}"/>
              <text x="${pos.invDom.x + 14}" y="${pos.invDom.y + 27}" class="label">${this.dict.panel_inv_dom}</text>
              <text x="${pos.invDom.x + 14}" y="${pos.invDom.y + 49}" class="small">${state.inverterDomProducing ? this.dict.panel_on : this.dict.panel_off}</text>

              <rect x="${pos.invTaras.x}" y="${pos.invTaras.y}" rx="16" ry="16" width="${pos.invTaras.w}" height="${pos.invTaras.h}" class="${stateBox(state.inverterTarasProducing)}"/>
              <text x="${pos.invTaras.x + 14}" y="${pos.invTaras.y + 27}" class="label">${this.dict.panel_inv_taras}</text>
              <text x="${pos.invTaras.x + 14}" y="${pos.invTaras.y + 49}" class="small">${state.inverterTarasProducing ? this.dict.panel_on : this.dict.panel_off}</text>

              <rect x="${pos.invHybrid.x}" y="${pos.invHybrid.y}" rx="16" ry="16" width="${pos.invHybrid.w}" height="${pos.invHybrid.h}" class="${stateBox(state.inverterHybridProducing)}"/>
              <text x="${pos.invHybrid.x + 14}" y="${pos.invHybrid.y + 27}" class="label">${this.dict.panel_inv_hybrid}</text>
              <text x="${pos.invHybrid.x + 14}" y="${pos.invHybrid.y + 49}" class="small">${state.inverterHybridProducing ? this.dict.panel_on : this.dict.panel_off}</text>

              <rect x="${pos.buffer.x}" y="${pos.buffer.y}" rx="24" ry="24" width="${pos.buffer.w}" height="${pos.buffer.h}" class="${stateBox(true, true)}"/>
              <text x="${pos.buffer.x + 42}" y="${pos.buffer.y + 34}" class="label">${this.dict.panel_buffer}</text>
              <rect x="${heater1.x}" y="${heater1.y}" rx="10" ry="10" width="${heater1.w}" height="${heater1.h}" class="${stateBox(offgrid2ToHeater1, true)}"/>
              <text x="${heater1.x + 18}" y="${heater1.y + 17}" class="tiny">${this.dict.panel_heater_1}</text>
              <rect x="${heater2.x}" y="${heater2.y}" rx="10" ry="10" width="${heater2.w}" height="${heater2.h}" class="${stateBox(offgrid1ToHeater2, true)}"/>
              <text x="${heater2.x + 18}" y="${heater2.y + 17}" class="tiny">${this.dict.panel_heater_2}</text>

              <circle cx="${pos.mixPump.x + pos.mixPump.w/2}" cy="${pos.mixPump.y + pos.mixPump.h/2}" r="25" class="${stateBox(state.pumpMixOn)}"/>
              ${this._rotor(pos.mixPump.x + pos.mixPump.w/2, pos.mixPump.y + pos.mixPump.h/2, "#72efab", state.pumpMixOn, "1.7s")}
              <text x="${pos.mixPump.x - 26}" y="${pos.mixPump.y + pos.mixPump.h + 20}" class="small">${this.dict.panel_mix_pump}</text>

              <circle cx="${pos.mainPump.x + pos.mainPump.w/2}" cy="${pos.mainPump.y + pos.mainPump.h/2}" r="25" class="${stateBox(state.pumpMainOn)}"/>
              ${this._rotor(pos.mainPump.x + pos.mainPump.w/2, pos.mainPump.y + pos.mainPump.h/2, "#69d8ff", state.pumpMainOn, "1.0s")}
              <text x="${pos.mainPump.x - 24}" y="${pos.mainPump.y + pos.mainPump.h + 20}" class="small">${this.dict.panel_main_pump}</text>

              <rect x="${pos.weather.x}" y="${pos.weather.y}" rx="22" ry="22" width="${pos.weather.w}" height="${pos.weather.h}" fill="rgba(255,255,255,0.04)" stroke="rgba(164,199,236,0.18)" stroke-width="2"/>
              ${this._weatherIcon(pos.weather.x + 54, pos.weather.y + 42, state.weatherState, state.weatherPhase)}
              <text x="${pos.weather.x + 108}" y="${pos.weather.y + 34}" class="label">${this._weatherText(state.weatherState, state.weatherPhase)}</text>
              <text x="${pos.weather.x + 108}" y="${pos.weather.y + 62}" style="font-size:28px;font-weight:700;fill:#edf4ff;">${this._num(state.weatherTemperature).toFixed(1)} C</text>
              <text x="${pos.weather.x + 108}" y="${pos.weather.y + 84}" class="small">${this.dict.panel_wind} ${this._num(state.weatherWind).toFixed(1)} km/h  |  ${this.dict.panel_humidity} ${this._num(state.weatherHumidity).toFixed(0)}%</text>

              <path d="M ${pos.house.x} ${pos.house.y + 74} L ${pos.house.x + pos.house.w/2} ${pos.house.y} L ${pos.house.x + pos.house.w} ${pos.house.y + 74} L ${pos.house.x + pos.house.w} ${pos.house.y + pos.house.h} L ${pos.house.x} ${pos.house.y + pos.house.h} Z" fill="url(#houseFill)" stroke="rgba(130,175,220,0.35)" stroke-width="3"/>
              <rect x="${pos.house.x + 88}" y="${pos.house.y + 190}" width="42" height="96" fill="rgba(255,255,255,0.1)" />
              <rect x="${pos.house.x + 24}" y="${pos.house.y + 136}" width="44" height="42" fill="rgba(140,204,255,0.08)" />
              <rect x="${pos.house.x + 154}" y="${pos.house.y + 136}" width="44" height="42" fill="rgba(140,204,255,0.08)" />
              ${haLogo}
              ${bulb(pos.house.x + 46, pos.house.y + 160, state.salonLightOn)}
              ${bulb(pos.house.x + 176, pos.house.y + 160, state.kitchenLightOn)}
              ${phoneBadge}
              <text x="${pos.house.x + 92}" y="${pos.house.y + 164}" class="label">${this.dict.panel_house}</text>
              <text x="${pos.house.x + pos.house.w/2}" y="${pos.house.y + pos.house.h + 26}" class="small" text-anchor="middle">${state.phoneHome ? this.dict.panel_owner_home : this.dict.panel_owner_away}</text>

              <circle cx="${pos.reku.x + pos.reku.w/2}" cy="${pos.reku.y + pos.reku.h/2}" r="29" class="${stateBox(state.rekuOn)}"/>
              ${this._rotor(pos.reku.x + pos.reku.w/2, pos.reku.y + pos.reku.h/2, "#66d9ff", state.rekuOn, this._rekuDur(this._num(state.rekuPercentage), state.rekuOn))}
              <text x="${pos.reku.x + pos.reku.w/2}" y="${pos.reku.y + pos.reku.h + 22}" class="small" text-anchor="middle">${this.dict.panel_reku}</text>

              <rect x="${pos.boiler.x}" y="${pos.boiler.y}" rx="16" ry="16" width="${pos.boiler.w}" height="${pos.boiler.h}" class="${stateBox(state.boilerOn, true)}"/>
              <text x="${pos.boiler.x + 16}" y="${pos.boiler.y + 27}" class="label">${this.dict.panel_boiler}</text>
              <g transform="translate(${pos.boiler.x + pos.boiler.w - 38} ${pos.boiler.y + 45})">
                <rect x="-16" y="-18" width="30" height="38" rx="8" fill="${state.boilerOn ? "rgba(235,244,255,0.16)" : "rgba(160,176,196,0.12)"}" stroke="${state.boilerOn ? "rgba(235,244,255,0.55)" : "rgba(160,176,196,0.30)"}" stroke-width="2"/>
                <circle cx="-6" cy="-6" r="2.3" fill="${state.boilerOn ? "#86baf0" : "rgba(160,176,196,0.4)"}"/>
                <circle cx="5" cy="-6" r="2.3" fill="${state.boilerOn ? "#86baf0" : "rgba(160,176,196,0.4)"}"/>
                <rect x="-8" y="2" width="14" height="10" rx="3" fill="rgba(15,23,34,0.55)" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
                <path d="M -1 8 C -8 3, -6 -6, 0 -10 C 6 -6, 8 3, 1 8 Z" class="${state.boilerOn ? "boiler-flame boiler-flame-active" : "boiler-flame"}" fill="${state.boilerOn ? "#ff9d5c" : "rgba(160,176,196,0.28)"}"></path>
              </g>

              <rect x="${pos.radiator.x}" y="${pos.radiator.y}" rx="16" ry="16" width="${pos.radiator.w}" height="${pos.radiator.h}" class="${stateBox(offgrid1ToRadiator, true)}"/>
              <text x="${pos.radiator.x + 12}" y="${pos.radiator.y + 23}" class="label">${this.dict.panel_radiator}</text>
              <g stroke="${offgrid1ToRadiator ? "#ff9a60" : "rgba(255,255,255,0.22)"}" stroke-width="6" stroke-linecap="round">
                <line x1="${pos.radiator.x + 38}" y1="${pos.radiator.y + 36}" x2="${pos.radiator.x + 38}" y2="${pos.radiator.y + 56}" />
                <line x1="${pos.radiator.x + 60}" y1="${pos.radiator.y + 36}" x2="${pos.radiator.x + 60}" y2="${pos.radiator.y + 56}" />
                <line x1="${pos.radiator.x + 82}" y1="${pos.radiator.y + 36}" x2="${pos.radiator.x + 82}" y2="${pos.radiator.y + 56}" />
                <line x1="${pos.radiator.x + 104}" y1="${pos.radiator.y + 36}" x2="${pos.radiator.x + 104}" y2="${pos.radiator.y + 56}" />
                <line x1="${pos.radiator.x + 126}" y1="${pos.radiator.y + 36}" x2="${pos.radiator.x + 126}" y2="${pos.radiator.y + 56}" />
              </g>

              <path d="M ${pos.panels.x + 72} ${pos.panels.y + pos.panels.h} L ${pos.panels.x + 72} ${pos.invDom.y + 36} L ${pos.invDom.x} ${pos.invDom.y + 36}" class="pipe"/>
              <path d="M ${pos.panels.x + 72} ${pos.panels.y + pos.panels.h} L ${pos.panels.x + 72} ${pos.invDom.y + 36} L ${pos.invDom.x} ${pos.invDom.y + 36}" class="flow power ${on(state.inverterDomProducing)}"/>
              <path d="M ${pos.panels.x + 96} ${pos.panels.y + pos.panels.h} L ${pos.panels.x + 96} ${pos.invTaras.y + 36} L ${pos.invTaras.x} ${pos.invTaras.y + 36}" class="pipe"/>
              <path d="M ${pos.panels.x + 96} ${pos.panels.y + pos.panels.h} L ${pos.panels.x + 96} ${pos.invTaras.y + 36} L ${pos.invTaras.x} ${pos.invTaras.y + 36}" class="flow power ${on(state.inverterTarasProducing)}"/>
              <path d="M ${pos.panels.x + pos.panels.w} ${pos.invHybrid.y + 36} L ${pos.invHybrid.x} ${pos.invHybrid.y + 36}" class="pipe"/>
              <path d="M ${pos.panels.x + pos.panels.w} ${pos.invHybrid.y + 36} L ${pos.invHybrid.x} ${pos.invHybrid.y + 36}" class="flow power ${on(state.inverterHybridProducing)}"/>

              <path d="M ${pos.invDom.x + pos.invDom.w} ${pos.invDom.y + 36} L ${heater1.x} ${pos.invDom.y + 36}" class="pipe"/>
              <path d="M ${pos.invDom.x + pos.invDom.w} ${pos.invDom.y + 36} L ${heater1.x} ${pos.invDom.y + 36}" class="flow power ${on(offgrid2ToHeater1)}"/>

              <path d="M ${pos.invTaras.x + pos.invTaras.w} ${pos.invTaras.y + 36} L ${splitX} ${pos.invTaras.y + 36} L ${splitX} ${splitY}" class="pipe"/>
              <path d="M ${pos.invTaras.x + pos.invTaras.w} ${pos.invTaras.y + 36} L ${splitX} ${pos.invTaras.y + 36} L ${splitX} ${splitY}" class="flow power ${on(state.inverterTarasProducing)}"/>
              <path d="M ${splitX} ${splitY} L ${splitX} ${heater2.y + heater2.h}" class="pipe"/>
              <path d="M ${splitX} ${splitY} L ${splitX} ${heater2.y + heater2.h}" class="flow power ${on(offgrid1ToHeater2)}"/>
              <path d="M ${splitX} ${splitY} L ${pos.radiator.x + pos.radiator.w/2} ${splitY} L ${pos.radiator.x + pos.radiator.w/2} ${pos.radiator.y + pos.radiator.h}" class="pipe"/>
              <path d="M ${splitX} ${splitY} L ${pos.radiator.x + pos.radiator.w/2} ${splitY} L ${pos.radiator.x + pos.radiator.w/2} ${pos.radiator.y + pos.radiator.h}" class="flow power ${on(offgrid1ToRadiator)}"/>

              <path d="M ${pos.invHybrid.x + pos.invHybrid.w} ${pos.invHybrid.y + 36} L ${pos.mainPump.x + pos.mainPump.w/2} ${pos.invHybrid.y + 36} L ${pos.mainPump.x + pos.mainPump.w/2} ${pos.house.y + 92} L ${pos.house.x} ${pos.house.y + 92}" class="pipe"/>
              <path d="M ${pos.invHybrid.x + pos.invHybrid.w} ${pos.invHybrid.y + 36} L ${pos.mainPump.x + pos.mainPump.w/2} ${pos.invHybrid.y + 36} L ${pos.mainPump.x + pos.mainPump.w/2} ${pos.house.y + 92} L ${pos.house.x} ${pos.house.y + 92}" class="flow power ${on(hybridToHouse)}"/>

              <path d="M ${pos.buffer.x} ${pos.buffer.y + 76} L ${pos.mixPump.x + pos.mixPump.w/2} ${pos.buffer.y + 76} L ${pos.mixPump.x + pos.mixPump.w/2} ${pos.mixPump.y}" class="pipe"/>
              <path d="M ${pos.buffer.x} ${pos.buffer.y + 76} L ${pos.mixPump.x + pos.mixPump.w/2} ${pos.buffer.y + 76} L ${pos.mixPump.x + pos.mixPump.w/2} ${pos.mixPump.y}" class="flow heat ${on(state.pumpMixOn)}"/>
              <path d="M ${pos.mixPump.x + pos.mixPump.w/2} ${pos.mixPump.y + pos.mixPump.h} L ${pos.mixPump.x + pos.mixPump.w/2} ${pos.buffer.y + pos.buffer.h - 24} L ${pos.buffer.x} ${pos.buffer.y + pos.buffer.h - 24}" class="pipe"/>
              <path d="M ${pos.mixPump.x + pos.mixPump.w/2} ${pos.mixPump.y + pos.mixPump.h} L ${pos.mixPump.x + pos.mixPump.w/2} ${pos.buffer.y + pos.buffer.h - 24} L ${pos.buffer.x} ${pos.buffer.y + pos.buffer.h - 24}" class="flow heat ${on(state.pumpMixOn)}"/>

              <path d="M ${pos.buffer.x + pos.buffer.w} ${pos.mainPump.y + pos.mainPump.h/2} L ${pos.mainPump.x} ${pos.mainPump.y + pos.mainPump.h/2}" class="pipe"/>
              <path d="M ${pos.buffer.x + pos.buffer.w} ${pos.mainPump.y + pos.mainPump.h/2} L ${pos.mainPump.x} ${pos.mainPump.y + pos.mainPump.h/2}" class="flow heat ${on(state.pumpMainOn)}"/>
              <path d="M ${pos.mainPump.x + pos.mainPump.w} ${pos.mainPump.y + pos.mainPump.h/2} L ${pos.house.x} ${pos.mainPump.y + pos.mainPump.h/2}" class="pipe"/>
              <path d="M ${pos.mainPump.x + pos.mainPump.w} ${pos.mainPump.y + pos.mainPump.h/2} L ${pos.house.x} ${pos.mainPump.y + pos.mainPump.h/2}" class="flow heat ${on(state.pumpMainOn)}"/>

              <path d="M ${pos.boiler.x} ${pos.boiler.y + pos.boiler.h/2} L ${pos.house.x + pos.house.w} ${pos.boiler.y + pos.boiler.h/2}" class="pipe"/>
              <path d="M ${pos.boiler.x} ${pos.boiler.y + pos.boiler.h/2} L ${pos.house.x + pos.house.w} ${pos.boiler.y + pos.boiler.h/2}" class="flow heat ${on(state.boilerOn)}"/>
              <path d="M ${pos.radiator.x} ${pos.radiator.y + pos.radiator.h/2} L ${pos.house.x + pos.house.w} ${pos.radiator.y + pos.radiator.h/2}" class="pipe"/>
              <path d="M ${pos.radiator.x} ${pos.radiator.y + pos.radiator.h/2} L ${pos.house.x + pos.house.w} ${pos.radiator.y + pos.radiator.h/2}" class="flow heat ${on(offgrid1ToRadiator)}"/>
            </svg>
          </div>
        </div>
      `;
    }
  }

  function createRandomPresenceAndReku() {
    const rekuOn = Math.random() > 0.28;
    return {
      phoneHome: Math.random() > 0.5,
      rekuOn,
      rekuPercentage: rekuOn ? randInt(24, 78) : 0
    };
  }

  function createNightScenario(dict) {
    const randomLayer = createRandomPresenceAndReku();
    return {
      statusIcon: "🌙",
      lux: 0,
      sunActive: false,
      weatherPhase: "night",
      weatherState: "clear-night",
      weatherTemperature: randFloat(8, 14),
      weatherWind: randFloat(3, 10),
      weatherHumidity: randInt(68, 90),
      inverterDomProducing: false,
      inverterTarasProducing: false,
      inverterHybridProducing: false,
      hybridToHouse: false,
      offgrid2ToHeater1: false,
      offgrid1ToRadiator: false,
      offgrid1ToHeater2: false,
      pumpMixOn: false,
      pumpMainOn: false,
      boilerOn: Math.random() > 0.5,
      kitchenLightOn: Math.random() > 0.5,
      salonLightOn: Math.random() > 0.5,
      ...randomLayer,
      message: dict.scenario_night_final
    };
  }

  function createMorningScenario(dict) {
    const randomLayer = createRandomPresenceAndReku();
    return {
      statusIcon: "⛅",
      lux: randInt(1000, 3000),
      sunActive: true,
      weatherPhase: "sunrise",
      weatherState: "partlycloudy",
      weatherTemperature: randFloat(12, 16),
      weatherWind: randFloat(5, 13),
      weatherHumidity: randInt(44, 62),
      inverterDomProducing: true,
      inverterTarasProducing: true,
      inverterHybridProducing: true,
      hybridToHouse: true,
      offgrid2ToHeater1: true,
      offgrid1ToRadiator: true,
      offgrid1ToHeater2: false,
      pumpMixOn: false,
      pumpMainOn: false,
      boilerOn: false,
      kitchenLightOn: false,
      salonLightOn: false,
      ...randomLayer,
      message: dict.scenario_morning
    };
  }

  function createNoonScenario(dict) {
    const randomLayer = createRandomPresenceAndReku();
    return {
      statusIcon: "☀️",
      lux: randInt(8000, 16000),
      sunActive: true,
      weatherPhase: "day",
      weatherState: "sunny",
      weatherTemperature: randFloat(20, 26),
      weatherWind: randFloat(7, 16),
      weatherHumidity: randInt(30, 48),
      inverterDomProducing: true,
      inverterTarasProducing: true,
      inverterHybridProducing: true,
      hybridToHouse: true,
      offgrid2ToHeater1: true,
      offgrid1ToRadiator: false,
      offgrid1ToHeater2: true,
      pumpMixOn: true,
      pumpMainOn: true,
      boilerOn: false,
      kitchenLightOn: false,
      salonLightOn: false,
      ...randomLayer,
      message: dict.scenario_noon
    };
  }

  function createSunsetScenario(dict) {
    const randomLayer = createRandomPresenceAndReku();
    return {
      statusIcon: "sunset",
      lux: randInt(100, 500),
      sunActive: false,
      weatherPhase: "sunset",
      weatherState: pickFrom(["partlycloudy", "cloudy"]),
      weatherTemperature: randFloat(11, 17),
      weatherWind: randFloat(4, 12),
      weatherHumidity: randInt(48, 70),
      inverterDomProducing: false,
      inverterTarasProducing: false,
      inverterHybridProducing: false,
      hybridToHouse: false,
      offgrid2ToHeater1: false,
      offgrid1ToRadiator: false,
      offgrid1ToHeater2: false,
      pumpMixOn: true,
      pumpMainOn: true,
      boilerOn: false,
      kitchenLightOn: false,
      salonLightOn: false,
      ...randomLayer,
      message: dict.scenario_sunset
    };
  }

  function createInitialState() {
    return {
      statusIcon: "",
      lux: 1840,
      sunActive: true,
      weatherPhase: "day",
      weatherState: "partlycloudy",
      weatherTemperature: 15.2,
      weatherWind: 11.3,
      weatherHumidity: 54,
      inverterDomProducing: true,
      inverterTarasProducing: true,
      inverterHybridProducing: true,
      hybridToHouse: true,
      offgrid2ToHeater1: true,
      offgrid1ToRadiator: true,
      offgrid1ToHeater2: false,
      pumpMixOn: false,
      pumpMainOn: false,
      rekuOn: true,
      rekuPercentage: 52,
      boilerOn: false,
      kitchenLightOn: false,
      salonLightOn: false,
      phoneHome: true,
      message: ""
    };
  }

  const lang = getLang();
  applyI18n(lang);
  const dict = DICT[lang];
  const renderer = new PanelDemoRenderer(qs("#panelMount"), dict);

  renderer.render(createInitialState());

  const simulationStatus = qs("#simulation-status");
  const btnSimulate = qs("#btn-simulate");
  const scenarioSequence = [
    () => createMorningScenario(dict),
    () => createNoonScenario(dict),
    () => createSunsetScenario(dict),
    () => createNightScenario(dict)
  ];
  let scenarioIndex = -1;
  let touchHandled = false;

  const renderSimulationStatus = (scenario) => {
    if (!simulationStatus) {
      return;
    }

    if (!scenario || !scenario.message) {
      simulationStatus.textContent = dict.sim_prompt;
      return;
    }

    const iconMarkup = scenario.statusIcon === "sunset"
      ? '<span class="sim-status-icon sim-status-icon--sunset" aria-hidden="true"></span>'
      : `<span class="sim-status-icon" aria-hidden="true">${scenario.statusIcon || ""}</span>`;

    const message = scenario.message.replace(/^[^\s]+\s/, "");
    simulationStatus.innerHTML = `<span class="sim-status-content">${iconMarkup}<span>${message}</span></span>`;
  };

  const runNextScenario = () => {
    scenarioIndex = (scenarioIndex + 1) % scenarioSequence.length;
    const scenarioFactory = scenarioSequence[scenarioIndex];
    const scenario = scenarioFactory();
    renderer.render(scenario);
    renderSimulationStatus(scenario);
  };

  if (btnSimulate) {
    btnSimulate.addEventListener("click", () => {
      if (touchHandled) {
        touchHandled = false;
        return;
      }
      runNextScenario();
    });

    btnSimulate.addEventListener("touchend", (event) => {
      touchHandled = true;
      event.preventDefault();
      runNextScenario();
    });
  }
})();
