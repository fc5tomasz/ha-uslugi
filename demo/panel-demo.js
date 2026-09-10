(() => {
  const DICT = {
    pl: {
      title_page: "Demo Home Assistant – symulacja panelu automatyki | HA Expert",
      meta_desc: "Live demonstracja animowanego panelu Home Assistant: energia, ogrzewanie, pogoda, rekuperacja i stany domu w jednej wizualizacji.",
      kicker: "Demonstracja sterowania automatyką",
      title: "Symulacja panelu automatyki Home Assistant",
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
      mobile_intro:
        "Kliknij schemat, aby zmienić porę dnia i zobaczyć reakcję instalacji.",
      mobile_intro_action: "Kliknij schemat",
      mobile_intro_detail: ", aby zmienić porę dnia i zobaczyć reakcję instalacji.",
      nav_services: "Usługi",
      nav_who: "Dla kogo",
      nav_process: "Jak pracuję",
      nav_pricing: "Cennik",
      nav_about: "O mnie",
      nav_contact: "Kontakt",
      nav_cta: "Bezpłatna ocena",
      panel_title: "Stan instalacji",
      panel_subtitle: "Natężenie oświetlenia",
      panel_panels: "Fotowoltaika",
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
      panel_reku: "Rekuperacja",
      panel_boiler: "Piec gazowy",
      panel_radiator: "Grzejnik elektryczny",
      panel_energy_bank: "Bank energii",
      panel_grid: "Sieć energetyczna",
      panel_charging: "Ładowanie",
      panel_discharging: "Oddawanie energii",
      panel_full: "Pełny",
      panel_importing: "Pobór z sieci",
      panel_exporting: "Oddawanie do sieci",
      panel_no_exchange: "Brak wymiany",
      panel_standby: "Czuwanie",
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
        "⛅️ Poranek: Produkcja PV rozpoczyna się wraz ze wschodem słońca. Inwerter hybrydowy zasila dom i ładuje bank energii, Off-grid 2 rozpoczyna grzanie bufora, a Off-grid 1 zasila grzejnik elektryczny, zapewniając ogrzewanie do czasu nagrzania bufora.",
      scenario_noon:
        "☀️ Południe: Bufor osiąga temperaturę wystarczającą do ogrzewania CO, dlatego uruchamia się pompa obiegowa i ciepło trafia do instalacji grzewczej. Pompa mieszająca wyrównuje temperaturę wody w buforze, zwiększając skuteczność wymiany ciepła. Grzejnik elektryczny wyłącza się, a Off-grid 1 przełącza energię na grzałkę w buforze i wspiera Off-grid 2 w jego dalszym nagrzewaniu. Bank energii jest już naładowany, więc inwerter hybrydowy zasila dom, a nadwyżkę energii oddaje do sieci.",
      scenario_sunset:
        "🌤️ Zachód: Produkcja z paneli zasilających inwertery Off-grid jest już zbyt mała do dalszego grzania, dlatego oba zostają wyłączone. Panele skierowane na zachód nadal dostarczają energię do inwertera hybrydowego, a brakującą moc dla domu uzupełnia bank energii. Nagrzany wcześniej bufor nadal dostarcza ciepło do ogrzewania CO.",
      scenario_night_final:
        "🌙 Noc: Fotowoltaika nie produkuje energii, dlatego dom jest zasilany z banku energii przez inwerter hybrydowy. Temperatura bufora spadła poniżej poziomu wymaganego do zasilania CO, a dom nadal potrzebuje ciepła, dlatego ogrzewanie przejmuje piec gazowy. System nadal steruje oświetleniem i rekuperacją."
    },
    dk: {
      title_page: "Home Assistant-demo – simulering af automationspanel | HA Expert",
      meta_desc: "Live demonstration af et animeret Home Assistant panel: energi, varme, vejr, varmegenvinding og hjemmets tilstand i én visualisering.",
      kicker: "Demo af automatikstyring",
      title: "Simulering af Home Assistant-automationspanel",
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
      mobile_intro:
        "Klik på diagrammet for at ændre tidspunktet på dagen og se installationens reaktion.",
      mobile_intro_action: "Klik på diagrammet",
      mobile_intro_detail: " for at ændre tidspunktet på dagen og se installationens reaktion.",
      nav_services: "Ydelser",
      nav_who: "For hvem",
      nav_process: "Sådan arbejder jeg",
      nav_pricing: "Priser",
      nav_about: "Om mig",
      nav_contact: "Kontakt",
      nav_cta: "Gratis vurdering",
      panel_title: "Anlæggets status",
      panel_subtitle: "Belysningsstyrke",
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
      panel_reku: "Varmegenvinding",
      panel_boiler: "Gaskedel",
      panel_radiator: "El-radiator",
      panel_energy_bank: "Energibank",
      panel_grid: "Elnet",
      panel_charging: "Opladning",
      panel_discharging: "Afladning",
      panel_full: "Fuld",
      panel_importing: "Import fra nettet",
      panel_exporting: "Eksport til nettet",
      panel_no_exchange: "Ingen udveksling",
      panel_standby: "Standby",
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
        "⛅️ Morgen: PV-produktionen begynder, når solen står op. Hybridinverteren forsyner hjemmet og oplader energibanken, Off-grid 2 begynder at opvarme bufferen, og Off-grid 1 forsyner el-radiatoren og sikrer varme, indtil bufferen er varm.",
      scenario_noon:
        "☀️ Middag: Bufferen når en temperatur, der er høj nok til centralvarme, så cirkulationspumpen starter, og varmen sendes ud i varmeanlægget. Blandepumpen udligner vandtemperaturen i bufferen og øger effektiviteten af varmeudvekslingen. El-radiatoren slukker, og Off-grid 1 flytter sin effekt over på et varmelegeme i bufferen og hjælper Off-grid 2 med at varme den yderligere op. Energibanken er nu fuld, så hybridinverteren forsyner hjemmet og sender overskuddet ud på nettet.",
      scenario_sunset:
        "🌤️ Solnedgang: Panelerne, der forsyner Off-grid inverterne, producerer ikke længere nok til yderligere opvarmning, så begge slukker. De vestvendte paneler forsyner stadig hybridinverteren, og energibanken dækker den effekt, hjemmet mangler. Bufferen, der blev varmet op tidligere, leverer fortsat varme til centralvarmen.",
      scenario_night_final:
        "🌙 Nat: Solcellerne producerer ingen energi, så hjemmet forsynes fra energibanken via hybridinverteren. Bufferens temperatur er faldet under det niveau, der kræves for at forsyne centralvarmen, og hjemmet har stadig brug for varme, så gaskedlen overtager opvarmningen. Systemet styrer fortsat belysningen og varmegenvindingen."
    },
    en: {
      title_page: "Home Assistant Demo – Automation Dashboard Simulation | HA Expert",
      meta_desc: "Live demonstration of an animated Home Assistant panel: energy, heating, weather, heat recovery, and home states in a single visualization.",
      kicker: "Automation Control Demo",
      title: "Home Assistant Automation Dashboard Simulation",
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
      mobile_intro:
        "Click the diagram to change the time of day and see the installation's reaction.",
      mobile_intro_action: "Click the diagram",
      mobile_intro_detail: " to change the time of day and see the installation's reaction.",
      nav_services: "Services",
      nav_who: "Who it’s for",
      nav_process: "How I work",
      nav_pricing: "Pricing",
      nav_about: "About me",
      nav_contact: "Contact",
      nav_cta: "Free assessment",
      panel_title: "Installation status",
      panel_subtitle: "Illuminance",
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
      panel_reku: "Heat recovery",
      panel_boiler: "Gas boiler",
      panel_radiator: "Electric heater",
      panel_energy_bank: "Energy bank",
      panel_grid: "Power grid",
      panel_charging: "Charging",
      panel_discharging: "Discharging",
      panel_full: "Full",
      panel_importing: "Grid import",
      panel_exporting: "Grid export",
      panel_no_exchange: "No grid exchange",
      panel_standby: "Standby",
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
        "⛅️ Morning: PV production begins as the sun rises. The hybrid inverter powers the home and charges the energy bank, Off-grid 2 starts heating the thermal buffer, and Off-grid 1 powers the electric heater, providing warmth until the buffer heats up.",
      scenario_noon:
        "☀️ Noon: The buffer reaches a temperature high enough for central heating, so the circulation pump starts and heat flows into the heating system. The mixer pump evens out the water temperature in the buffer, improving the efficiency of heat exchange. The electric heater switches off, and Off-grid 1 redirects its power to a heating element in the buffer, supporting Off-grid 2 in heating it further. The energy bank is now full, so the hybrid inverter powers the home and exports the surplus to the grid.",
      scenario_sunset:
        "🌤️ Sunset: The panels feeding the Off-grid inverters no longer produce enough for further heating, so both switch off. The west-facing panels still supply the hybrid inverter, and the energy bank makes up the power the home is missing. The buffer, heated earlier, keeps supplying heat for central heating.",
      scenario_night_final:
        "🌙 Night: The PV array produces no energy, so the home is powered from the energy bank through the hybrid inverter. The buffer temperature has dropped below the level needed to feed central heating, and the home still needs warmth, so the gas boiler takes over heating. The system keeps managing the lighting and the heat recovery."
    }
  };

  function normalizeDemoLang(lang) {
    const value = (lang || "").toLowerCase();
    if (value === "dk" || value.startsWith("dk-") || value === "da" || value.startsWith("da-")) {
      return "dk";
    }
    if (value === "pl" || value.startsWith("pl-")) {
      return "pl";
    }
    if (value === "en" || value.startsWith("en-")) {
      return "en";
    }
    return "";
  }

  function getLangFromPath(pathname) {
    const path = (pathname || "").toLowerCase();
    if (/\/pl\/demo(\/|$)/.test(path)) {
      return "pl";
    }
    if (/\/en\/demo(\/|$)/.test(path)) {
      return "en";
    }
    if (/\/dk\/demo(\/|$)/.test(path)) {
      return "dk";
    }
    return "";
  }

  function getLangFromHref(href) {
    const url = new URL(href, window.location.href);
    return getLangFromPath(url.pathname) || normalizeDemoLang(url.searchParams.get("lang"));
  }

  function getLang() {
    const bodyLang = document.body ? normalizeDemoLang(document.body.dataset.demoLang) : "";
    const pathLang = getLangFromPath(window.location.pathname);
    const htmlLang = normalizeDemoLang(document.documentElement.getAttribute("lang"));
    return bodyLang || pathLang || htmlLang || "pl";
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
    document.documentElement.lang = lang === "dk" ? "da" : lang;
    if (document.body) {
      document.body.dataset.demoLang = lang;
    }
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
      back.href = lang === "pl" ? "/pl/" : lang === "dk" ? "/dk/" : "/en/";
    }
    const buttonFull = qs("#btn-simulate .sim-label-full");
    const buttonMobile = qs("#btn-simulate .sim-label-mobile");
    if (buttonFull) {
      buttonFull.textContent = dict.sim_button;
    }
    if (buttonMobile) {
      buttonMobile.textContent = dict.sim_button_mobile || dict.sim_button;
    }
    document.querySelectorAll(".js-simulation-status").forEach((status) => {
      status.textContent = dict.sim_prompt;
    });
    const panelTrigger = qs("#demo-panel-trigger");
    if (panelTrigger) {
      panelTrigger.setAttribute("aria-label", dict.sim_button_mobile || dict.sim_button);
    }
    const linkMap = {
      pl: {
        home: "/pl/",
        services: "/pl/#uslugi",
        who: "/pl/#dla-kogo",
        process: "/pl/#jak-pracuje",
        pricing: "/pl/#cennik",
        about: "/pl/#o-mnie",
        contact: "/pl/#kontakt",
        cta: "/pl/#kontakt"
      },
      en: {
        home: "/en/",
        services: "/en/#services",
        who: "/en/#who-its-for",
        process: "/en/#how-i-work",
        pricing: "/en/#pricing",
        about: "/en/#about-me",
        contact: "/en/#contact",
        cta: "/en/#contact"
      },
      dk: {
        home: "/dk/",
        services: "/dk/#ydelser",
        who: "/dk/#for-hvem",
        process: "/dk/#saadan-arbejder-jeg",
        pricing: "/dk/#priser",
        about: "/dk/#om-mig",
        contact: "/dk/#kontakt",
        cta: "/dk/#kontakt"
      }
    };
    const links = linkMap[lang] || linkMap.pl;
    const navHrefMap = {
      "#demo-home-link": links.home,
      "#demo-nav-services": links.services,
      "#demo-nav-who": links.who,
      "#demo-nav-process": links.process,
      "#demo-nav-pricing": links.pricing,
      "#demo-nav-about": links.about,
      "#demo-nav-contact": links.contact,
      "#demo-nav-cta": links.cta
    };
    Object.entries(navHrefMap).forEach(([selector, href]) => {
      const element = qs(selector);
      if (element) {
        element.setAttribute("href", href);
      }
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const btnLang = getLangFromHref(btn.href) || "pl";
      const isActive = btnLang === lang;
      btn.classList.toggle("active", isActive);
      if (isActive) {
        btn.setAttribute("aria-current", "page");
      } else {
        btn.removeAttribute("aria-current");
      }
    });
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

    _movingArrow(path, active, tone = "home", duration = "2.8s") {
      if (!active) return "";
      return `
        <path class="relation-arrow relation-arrow-${tone}" data-relation-tone="${tone}" d="M -8 -5 L 5 0 L -8 5 Z" style="--relation-arrow-duration:${duration};offset-path:path('${path}')" aria-hidden="true" />
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
      const partlyCloudy = `
        <g transform="translate(${x} ${y})">
          <circle cx="-13" cy="-12" r="8" fill="#f7c948"/>
          <g fill="none" stroke="#f7c948" stroke-width="2.5" stroke-linecap="round">
            <line x1="-13" y1="-25" x2="-13" y2="-21"/>
            <line x1="-26" y1="-12" x2="-22" y2="-12"/>
            <line x1="-22" y1="-21" x2="-19" y2="-18"/>
            <line x1="-4" y1="-21" x2="-7" y2="-18"/>
          </g>
          <path d="M -18 18 C -24 18 -28 14 -28 9 C -28 4 -24 0 -19 -1 C -18 -9 -12 -14 -4 -14 C 3 -14 9 -10 11 -3 C 14 -5 17 -6 20 -6 C 26 -6 31 -1 31 5 C 31 12 26 18 19 18 Z"
            fill="#dce5ec" stroke="#f4f7fa" stroke-width="2.5" stroke-linejoin="round"/>
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
      if (state === "partlycloudy") return phase === "night" ? `${moon}${cloud}` : partlyCloudy;
      if (state === "cloudy" || state === "fog") return cloud;
      if (state === "rainy" || state === "pouring") return `${cloud}${rain}`;
      if (state === "windy" || state === "windy-variant") return wind;
      return cloud;
    }

    render(state) {
      const pos = {
        panels: { x: 74, y: 286, w: 260, h: 138 },
        invDom: { x: 217, y: 547, w: 86, h: 108 },
        invTaras: { x: 217, y: 705, w: 86, h: 108 },
        invHybrid: { x: 524, y: 277, w: 88, h: 110 },
        battery: { x: 523, y: 108, w: 90, h: 135 },
        grid: { x: 695, y: 102, w: 80, h: 150 },
        mixPump: { x: 393, y: 511, w: 68, h: 68 },
        buffer: { x: 505, y: 430, w: 142, h: 238 },
        mainPump: { x: 701, y: 491, w: 68, h: 68 },
        house: { x: 841, y: 360, w: 236, h: 234 },
        weather: { x: 1116, y: 28, w: 280, h: 102 },
        reku: { x: 790, y: 318, w: 114, h: 74 },
        boiler: { x: 1202, y: 307, w: 96, h: 134 },
        radiator: { x: 1180, y: 524, w: 140, h: 78 }
      };
      // Głowice są osadzone na dwóch frontowych portach zapisanych w rastrze bufora.
      // Maska poniżej pilnuje, aby część grzejna nigdy nie wyszła poza komorę zbiornika.
      const heater1 = { x: pos.buffer.x + 29, y: pos.buffer.y + 157, w: 72, h: 24 };
      const heater2 = { x: pos.buffer.x + 39, y: pos.buffer.y + 178, w: 72, h: 24 };
      const splitY = pos.invTaras.y + pos.invTaras.h / 2;
      const heater1CenterY = pos.buffer.y + 171;
      const heater2CenterY = pos.buffer.y + 192;
      const heater1ConnectorX = heater1.x + 2;
      const heater2ConnectorX = heater2.x + heater2.w - 2;
      const heater2RouteX = pos.buffer.x + pos.buffer.w + 14;
      const splitX = heater2RouteX;
      const hybridToHouse = Boolean(state.hybridToHouse);
      const batteryMode = state.batteryMode || "standby";
      const gridMode = state.gridMode || "idle";
      const batteryCharging = batteryMode === "charging";
      const batteryDischarging = batteryMode === "discharging";
      const gridImporting = gridMode === "importing";
      const gridExporting = gridMode === "exporting";
      const gridActive = gridImporting || gridExporting;
      const inverterHybridOn = Boolean(state.inverterHybridProducing || batteryDischarging || gridImporting);
      const offgrid2ToHeater1 = Boolean(state.offgrid2ToHeater1);
      const offgrid1ToRadiator = Boolean(state.offgrid1ToRadiator);
      const offgrid1ToHeater2 = Boolean(state.offgrid1ToHeater2);
      const bufferHot = typeof state.bufferHot === "boolean"
        ? state.bufferHot
        : Boolean(offgrid2ToHeater1 || offgrid1ToHeater2 || state.pumpMixOn || state.pumpMainOn);
      const on = (v) => (v ? "active" : "");
      const houseLeftRoofX = pos.house.x + 2;
      const houseLeftWallX = pos.house.x + 15;
      const houseRightX = pos.house.x + pos.house.w - 2;
      const housePowerY = pos.house.y + 92;
      const invDomLeftX = pos.invDom.x + 5;
      const invDomRightX = pos.invDom.x + pos.invDom.w - 5;
      const invDomCenterY = pos.invDom.y + pos.invDom.h / 2;
      const invTarasLeftX = pos.invTaras.x + 5;
      const invTarasRightX = pos.invTaras.x + pos.invTaras.w - 5;
      const invTarasCenterY = pos.invTaras.y + pos.invTaras.h / 2;
      const invHybridLeftX = pos.invHybrid.x + 5;
      const invHybridRightX = pos.invHybrid.x + pos.invHybrid.w - 5;
      const invHybridCenterY = pos.invHybrid.y + pos.invHybrid.h / 2;
      const invHybridCenterX = pos.invHybrid.x + pos.invHybrid.w / 2;
      const invHybridTopY = pos.invHybrid.y + 5;
      const batteryCenterX = pos.battery.x + pos.battery.w / 2;
      const batteryBottomY = pos.battery.y + pos.battery.h - 4;
      const gridCenterX = pos.grid.x + pos.grid.w / 2;
      const gridBottomY = pos.grid.y + pos.grid.h - 4;
      const gridLinkY = invHybridCenterY - 24;
      const relationJunctionX = pos.mainPump.x + pos.mainPump.w / 2;
      const mixPumpCenterX = pos.mixPump.x + pos.mixPump.w / 2;
      const mixPumpCenterY = pos.mixPump.y + pos.mixPump.h / 2;
      const mainPumpCenterX = pos.mainPump.x + pos.mainPump.w / 2;
      const mainPumpCenterY = pos.mainPump.y + pos.mainPump.h / 2;
      const mixPumpRotorX = pos.mixPump.x + pos.mixPump.w * 0.5;
      const mixPumpRotorY = pos.mixPump.y + pos.mixPump.h * 0.52;
      const mainPumpRotorX = pos.mainPump.x + pos.mainPump.w * 0.5;
      const mainPumpRotorY = pos.mainPump.y + pos.mainPump.h * 0.536;
      const rekuCenterX = pos.reku.x + pos.reku.w / 2;
      const rekuCenterY = pos.reku.y + pos.reku.h / 2;
      const bufferLeftX = pos.buffer.x + 2;
      const bufferRightX = pos.buffer.x + pos.buffer.w - 2;
      const bufferUpperLeftY = pos.buffer.y + 66;
      const bufferLowerLeftY = pos.buffer.y + 188;
      const bufferUpperRightY = pos.buffer.y + 98;
      const bufferLowerRightY = pos.buffer.y + 172;
      const houseReturnY = pos.house.y + pos.house.h - 18;
      const panelsOffgrid1RouteX = 96;
      const panelsVisibleRightX = pos.panels.w - 5;
      const panelsLabelX = (panelsOffgrid1RouteX + panelsVisibleRightX) / 2;
      const panelsToHybridPath = `M ${pos.panels.x + pos.panels.w - 6} ${invHybridCenterY} L ${invHybridLeftX} ${invHybridCenterY}`;
      const batteryRelationPath = `M ${batteryCenterX} ${batteryBottomY} L ${invHybridCenterX} ${invHybridTopY}`;
      const inverterToBatteryPath = `M ${invHybridCenterX} ${invHybridTopY} L ${batteryCenterX} ${batteryBottomY}`;
      const gridRelationPath = `M ${invHybridRightX} ${gridLinkY} L ${gridCenterX} ${gridLinkY} L ${gridCenterX} ${gridBottomY}`;
      const gridToInverterPath = `M ${gridCenterX} ${gridBottomY} L ${gridCenterX} ${gridLinkY} L ${invHybridRightX} ${gridLinkY}`;
      const inverterToHousePath = `M ${invHybridRightX} ${invHybridCenterY} L ${relationJunctionX} ${invHybridCenterY} L ${relationJunctionX} ${housePowerY} L ${houseLeftRoofX} ${housePowerY}`;
      const panelsBottomY = pos.panels.y + pos.panels.h - 6;
      const panelsAsset = state.weatherPhase === "night" || state.weatherPhase === "sunset"
        ? "/assets/demo/energy/solar-panels-off.webp"
        : state.weatherPhase === "day" && state.weatherState === "sunny"
          ? "/assets/demo/energy/solar-panels-active.webp"
          : "/assets/demo/energy/solar-panels-low.webp";
      const skyAsset = state.weatherPhase === "night"
        ? "/assets/demo/energy/sky-moon.webp"
        : state.weatherPhase === "day" && state.weatherState === "sunny"
          ? "/assets/demo/energy/sky-sun-bright.webp"
          : "/assets/demo/energy/sky-sun-soft.webp";
      const batteryAsset = batteryCharging
        ? "/assets/demo/energy/energy-bank-charging.webp"
        : batteryDischarging
          ? "/assets/demo/energy/energy-bank-discharging.webp"
          : "/assets/demo/energy/energy-bank-standby.webp";
      const batteryStateLabel = batteryCharging
        ? this.dict.panel_charging
        : batteryDischarging
          ? this.dict.panel_discharging
          : batteryMode === "full"
            ? this.dict.panel_full
            : this.dict.panel_standby;
      const gridStateLabel = gridImporting
        ? this.dict.panel_importing
        : gridExporting
          ? this.dict.panel_exporting
          : this.dict.panel_no_exchange;

      this.root.innerHTML = `
        <div class="panel-wrap">
          <svg class="panel-svg" viewBox="0 0 1440 860" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="mix-pump-rotor-clip" clipPathUnits="userSpaceOnUse">
                  <circle cx="${mixPumpRotorX}" cy="${mixPumpRotorY}" r="15" />
                </clipPath>
                <clipPath id="main-pump-rotor-clip" clipPathUnits="userSpaceOnUse">
                  <circle cx="${mainPumpRotorX}" cy="${mainPumpRotorY}" r="15" />
                </clipPath>
                <clipPath id="reku-rotor-clip" clipPathUnits="userSpaceOnUse">
                  <circle cx="${rekuCenterX}" cy="${rekuCenterY}" r="15" />
                </clipPath>
                <clipPath id="buffer-heater-chamber-clip" clipPathUnits="userSpaceOnUse">
                  <rect x="${pos.buffer.x + 29}" y="${pos.buffer.y + 150}" width="82" height="66" rx="5" />
                </clipPath>
              </defs>
              <text x="44" y="52" class="title">${this.dict.panel_title}</text>
              <text x="44" y="78" class="subtitle">${this.dict.panel_subtitle}: ${this._num(state.lux).toFixed(0)} lx</text>

              <image href="${skyAsset}" x="74" y="108" width="144" height="144" preserveAspectRatio="xMidYMid meet" aria-hidden="true" />

              <g transform="translate(${pos.panels.x} ${pos.panels.y})">
                <image
                  href="${panelsAsset}"
                  x="0"
                  y="0"
                  width="${pos.panels.w}"
                  height="${pos.panels.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_panels}"
                />
                <text x="${panelsLabelX}" y="${pos.panels.h + 24}" class="small object-label" text-anchor="middle">${this.dict.panel_panels}</text>
              </g>

              <g class="energy-bank-system">
                <image
                  href="${batteryAsset}"
                  x="${pos.battery.x}"
                  y="${pos.battery.y}"
                  width="${pos.battery.w}"
                  height="${pos.battery.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_energy_bank}: ${batteryStateLabel}, ${state.batteryLevel}%"
                />
                <text x="${batteryCenterX}" y="${pos.battery.y - 30}" class="small object-label" data-bank-label>${this.dict.panel_energy_bank}</text>
                <text x="${batteryCenterX}" y="${pos.battery.y - 10}" class="small object-label" data-bank-label>${batteryStateLabel} · ${state.batteryLevel}%</text>
              </g>

              <g class="grid-system">
                <ellipse cx="${gridCenterX}" cy="${pos.grid.y + 58}" rx="30" ry="38" class="grid-aura ${on(gridActive)}" aria-hidden="true" />
                <image
                  href="/assets/demo/energy/grid-pole.webp"
                  x="${pos.grid.x}"
                  y="${pos.grid.y}"
                  width="${pos.grid.w}"
                  height="${pos.grid.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_grid}: ${gridStateLabel}"
                />
                <path d="M ${pos.grid.x + 66} ${pos.grid.y + 42} l 3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" class="grid-spark ${on(gridActive)}" aria-hidden="true" />
                <text x="${gridCenterX}" y="${pos.grid.y - 10}" class="small object-label" text-anchor="middle">${this.dict.panel_grid}</text>
              </g>

              <g class="inverter-system inverter-offgrid2-system">
                <image
                  href="${state.inverterDomProducing ? "/assets/demo/energy/inverter-offgrid-on.webp" : "/assets/demo/energy/inverter-offgrid-off.webp"}"
                  x="${pos.invDom.x}"
                  y="${pos.invDom.y}"
                  width="${pos.invDom.w}"
                  height="${pos.invDom.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_inv_dom}: ${state.inverterDomProducing ? this.dict.panel_on : this.dict.panel_off}"
                />
                <text x="${pos.invDom.x + pos.invDom.w / 2}" y="${pos.invDom.y + pos.invDom.h + 15}" class="small object-label" text-anchor="middle">${this.dict.panel_inv_dom} · ${state.inverterDomProducing ? this.dict.panel_on : this.dict.panel_off}</text>
              </g>

              <g class="inverter-system inverter-offgrid1-system">
                <image
                  href="${state.inverterTarasProducing ? "/assets/demo/energy/inverter-offgrid-on.webp" : "/assets/demo/energy/inverter-offgrid-off.webp"}"
                  x="${pos.invTaras.x}"
                  y="${pos.invTaras.y}"
                  width="${pos.invTaras.w}"
                  height="${pos.invTaras.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_inv_taras}: ${state.inverterTarasProducing ? this.dict.panel_on : this.dict.panel_off}"
                />
                <text x="${pos.invTaras.x + pos.invTaras.w / 2}" y="${pos.invTaras.y + pos.invTaras.h + 15}" class="small object-label" text-anchor="middle">${this.dict.panel_inv_taras} · ${state.inverterTarasProducing ? this.dict.panel_on : this.dict.panel_off}</text>
              </g>

              <g class="inverter-system inverter-hybrid-system">
                <image
                  href="${inverterHybridOn ? "/assets/demo/energy/inverter-hybrid-on.webp" : "/assets/demo/energy/inverter-hybrid-off.webp"}"
                  x="${pos.invHybrid.x}"
                  y="${pos.invHybrid.y}"
                  width="${pos.invHybrid.w}"
                  height="${pos.invHybrid.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_inv_hybrid}: ${inverterHybridOn ? this.dict.panel_on : this.dict.panel_off}"
                />
                <text x="${pos.invHybrid.x + pos.invHybrid.w / 2}" y="${pos.invHybrid.y + pos.invHybrid.h + 15}" class="small object-label" text-anchor="middle">${this.dict.panel_inv_hybrid}</text>
              </g>

              <g class="hydraulic-routes">
                <path d="M ${bufferLeftX} ${bufferUpperLeftY} L ${mixPumpCenterX} ${bufferUpperLeftY} L ${mixPumpCenterX} ${pos.mixPump.y + 6}" class="pipe"/>
                <path d="M ${bufferLeftX} ${bufferUpperLeftY} L ${mixPumpCenterX} ${bufferUpperLeftY} L ${mixPumpCenterX} ${pos.mixPump.y + 6}" class="flow heat ${on(state.pumpMixOn)}"/>
                <path d="M ${mixPumpCenterX} ${pos.mixPump.y + pos.mixPump.h - 6} L ${mixPumpCenterX} ${bufferLowerLeftY} L ${bufferLeftX} ${bufferLowerLeftY}" class="pipe"/>
                <path d="M ${mixPumpCenterX} ${pos.mixPump.y + pos.mixPump.h - 6} L ${mixPumpCenterX} ${bufferLowerLeftY} L ${bufferLeftX} ${bufferLowerLeftY}" class="flow heat ${on(state.pumpMixOn)}"/>

                <path d="M ${bufferRightX} ${bufferUpperRightY} L ${pos.mainPump.x} ${bufferUpperRightY} L ${pos.mainPump.x} ${mainPumpCenterY}" class="pipe"/>
                <path d="M ${bufferRightX} ${bufferUpperRightY} L ${pos.mainPump.x} ${bufferUpperRightY} L ${pos.mainPump.x} ${mainPumpCenterY}" class="flow heat ${on(state.pumpMainOn)}"/>
                <path d="M ${pos.mainPump.x + pos.mainPump.w} ${mainPumpCenterY} L ${houseLeftWallX} ${mainPumpCenterY}" class="pipe"/>
                <path d="M ${pos.mainPump.x + pos.mainPump.w} ${mainPumpCenterY} L ${houseLeftWallX} ${mainPumpCenterY}" class="flow heat ${on(state.pumpMainOn)}"/>
                <path d="M ${houseLeftWallX} ${houseReturnY} L ${pos.mainPump.x + pos.mainPump.w + 28} ${houseReturnY} L ${pos.mainPump.x + pos.mainPump.w + 28} ${bufferLowerRightY} L ${bufferRightX} ${bufferLowerRightY}" class="pipe"/>
                <path d="M ${houseLeftWallX} ${houseReturnY} L ${pos.mainPump.x + pos.mainPump.w + 28} ${houseReturnY} L ${pos.mainPump.x + pos.mainPump.w + 28} ${bufferLowerRightY} L ${bufferRightX} ${bufferLowerRightY}" class="flow hydraulic-return ${on(state.pumpMainOn)}"/>
              </g>

              <g class="buffer-system">
                <image
                  href="${bufferHot ? "/assets/demo/energy/buffer-hot.webp" : "/assets/demo/energy/buffer-cool.webp"}"
                  x="${pos.buffer.x}"
                  y="${pos.buffer.y}"
                  width="${pos.buffer.w}"
                  height="${pos.buffer.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_buffer}: ${bufferHot ? this.dict.panel_on : this.dict.panel_standby}"
                />
                <text x="${pos.buffer.x + pos.buffer.w / 2}" y="${pos.buffer.y + pos.buffer.h + 19}" class="small object-label" text-anchor="middle">${this.dict.panel_buffer}</text>
              </g>
              <g class="power-routes-to-heaters">
                <path d="M ${invDomRightX} ${invDomCenterY} L ${heater1ConnectorX} ${heater1CenterY}" class="pipe"/>
                <path id="heater-1-power-route" d="M ${invDomRightX} ${invDomCenterY} L ${heater1ConnectorX} ${heater1CenterY}" class="flow power ${on(offgrid2ToHeater1)}"/>

                <path d="M ${invTarasRightX} ${invTarasCenterY} L ${splitX} ${splitY}" class="pipe"/>
                <path d="M ${invTarasRightX} ${invTarasCenterY} L ${splitX} ${splitY}" class="flow power ${on(state.inverterTarasProducing)}"/>
                <path d="M ${splitX} ${splitY} L ${splitX} ${heater2CenterY} L ${heater2ConnectorX} ${heater2CenterY}" class="pipe"/>
                <path id="heater-2-power-route" d="M ${splitX} ${splitY} L ${splitX} ${heater2CenterY} L ${heater2ConnectorX} ${heater2CenterY}" class="flow power ${on(offgrid1ToHeater2)}"/>
              </g>

              <g class="heater-system heater-1-system">
                <circle id="heater-1-power-port" data-qa-anchor="heater-1-power" cx="${heater1ConnectorX}" cy="${heater1CenterY}" r="1" fill="transparent" aria-hidden="true" />
                <image
                  href="${offgrid2ToHeater1 ? "/assets/demo/energy/buffer-heater-on.webp" : "/assets/demo/energy/buffer-heater-off.webp"}"
                  x="${heater1.x}"
                  y="${heater1.y}"
                  width="${heater1.w}"
                  height="${heater1.h}"
                  preserveAspectRatio="xMidYMid meet"
                  clip-path="url(#buffer-heater-chamber-clip)"
                  aria-label="${this.dict.panel_heater_1}: ${offgrid2ToHeater1 ? this.dict.panel_on : this.dict.panel_off}"
                />
              </g>
              <g class="heater-system heater-2-system">
                <circle id="heater-2-power-port" data-qa-anchor="heater-2-power" cx="${heater2ConnectorX}" cy="${heater2CenterY}" r="1" fill="transparent" aria-hidden="true" />
                <image
                  href="${offgrid1ToHeater2 ? "/assets/demo/energy/buffer-heater-on.webp" : "/assets/demo/energy/buffer-heater-off.webp"}"
                  x="${heater2.x}"
                  y="${heater2.y}"
                  width="${heater2.w}"
                  height="${heater2.h}"
                  preserveAspectRatio="xMidYMid meet"
                  clip-path="url(#buffer-heater-chamber-clip)"
                  transform="translate(${heater2.x * 2 + heater2.w} 0) scale(-1 1)"
                  aria-label="${this.dict.panel_heater_2}: ${offgrid1ToHeater2 ? this.dict.panel_on : this.dict.panel_off}"
                />
              </g>

              <g class="pump-system pump-mixing-system">
                <g class="pump-mixing-visual" transform="rotate(-90 ${mixPumpCenterX} ${mixPumpCenterY})">
                  <image
                    href="${state.pumpMixOn ? "/assets/demo/energy/pump-mixing-on.webp" : "/assets/demo/energy/pump-mixing-off.webp"}"
                    x="${pos.mixPump.x}"
                    y="${pos.mixPump.y}"
                    width="${pos.mixPump.w}"
                    height="${pos.mixPump.h}"
                    preserveAspectRatio="xMidYMid meet"
                    aria-label="${this.dict.panel_mix_pump}: ${state.pumpMixOn ? this.dict.panel_on : this.dict.panel_off}"
                  />
                  ${state.pumpMixOn ? `
                    <g clip-path="url(#mix-pump-rotor-clip)">
                      <image href="/assets/demo/energy/pump-mixing-on.webp" x="${pos.mixPump.x}" y="${pos.mixPump.y}" width="${pos.mixPump.w}" height="${pos.mixPump.h}" preserveAspectRatio="xMidYMid meet" class="device-rotor active" style="--device-rotor-dur:1.7s;--device-rotor-origin:50% 52%" aria-hidden="true" />
                    </g>
                  ` : ""}
                </g>
                <text x="${mixPumpCenterX}" y="${bufferUpperLeftY - 12}" class="small object-label" text-anchor="middle">${this.dict.panel_mix_pump}</text>
              </g>

              <g class="pump-system pump-circulation-system">
                <image
                  href="${state.pumpMainOn ? "/assets/demo/energy/pump-circulation-on.webp" : "/assets/demo/energy/pump-circulation-off.webp"}"
                  x="${pos.mainPump.x}"
                  y="${pos.mainPump.y}"
                  width="${pos.mainPump.w}"
                  height="${pos.mainPump.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_main_pump}: ${state.pumpMainOn ? this.dict.panel_on : this.dict.panel_off}"
                />
                ${state.pumpMainOn ? `
                  <g clip-path="url(#main-pump-rotor-clip)">
                    <image href="/assets/demo/energy/pump-circulation-on.webp" x="${pos.mainPump.x}" y="${pos.mainPump.y}" width="${pos.mainPump.w}" height="${pos.mainPump.h}" preserveAspectRatio="xMidYMid meet" class="device-rotor active" style="--device-rotor-dur:1s;--device-rotor-origin:50% 53.6%" aria-hidden="true" />
                  </g>
                ` : ""}
                <text x="${mainPumpCenterX}" y="${pos.mainPump.y + pos.mainPump.h + 15}" class="small object-label" text-anchor="middle">${this.dict.panel_main_pump}</text>
              </g>

              <rect x="${pos.weather.x}" y="${pos.weather.y}" rx="22" ry="22" width="${pos.weather.w}" height="${pos.weather.h}" fill="rgba(255,255,255,0.04)" stroke="rgba(164,199,236,0.18)" stroke-width="2"/>
              ${this._weatherIcon(pos.weather.x + 54, pos.weather.y + 42, state.weatherState, state.weatherPhase)}
              <text x="${pos.weather.x + 108}" y="${pos.weather.y + 34}" class="label">${this._weatherText(state.weatherState, state.weatherPhase)}</text>
              <text x="${pos.weather.x + 108}" y="${pos.weather.y + 62}" style="font-size:28px;font-weight:700;fill:#edf4ff;">${this._num(state.weatherTemperature).toFixed(1)} C</text>
              <text x="${pos.weather.x + 108}" y="${pos.weather.y + 84}" class="small">${this.dict.panel_wind} ${this._num(state.weatherWind).toFixed(1)} km/h  |  ${this.dict.panel_humidity} ${this._num(state.weatherHumidity).toFixed(0)}%</text>

              <g class="house-system">
                <image
                  href="${state.phoneHome ? "/assets/demo/energy/house-presence.webp?v=20260904-house-source-2" : "/assets/demo/energy/house-base.webp?v=20260904-house-source-2"}"
                  x="${pos.house.x}"
                  y="${pos.house.y}"
                  width="${pos.house.w}"
                  height="${pos.house.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_house}"
                />
                ${state.kitchenLightOn ? `
                  <image href="/assets/demo/energy/house-window-right-on.webp" x="${pos.house.x}" y="${pos.house.y}" width="${pos.house.w}" height="${pos.house.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" />
                ` : ""}
                ${state.salonLightOn ? `
                  <image href="/assets/demo/energy/house-door-open.webp" x="${pos.house.x}" y="${pos.house.y}" width="${pos.house.w}" height="${pos.house.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" />
                ` : ""}
                ${(state.salonLightOn || state.kitchenLightOn) ? `
                  <image href="/assets/demo/energy/house-entry-light-on.webp" x="${pos.house.x}" y="${pos.house.y}" width="${pos.house.w}" height="${pos.house.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" />
                ` : ""}
              </g>
              <text x="${pos.house.x + pos.house.w / 2}" y="${pos.house.y + pos.house.h + 16}" class="small object-label" text-anchor="middle">${this.dict.panel_house}</text>

              <g class="rekuperacja-system">
                <image
                  href="${state.rekuOn ? "/assets/demo/energy/rekuperacja-on.webp" : "/assets/demo/energy/rekuperacja-off.webp"}"
                  x="${pos.reku.x}"
                  y="${pos.reku.y}"
                  width="${pos.reku.w}"
                  height="${pos.reku.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_reku}: ${state.rekuOn ? `${this.dict.panel_on}, ${this._num(state.rekuPercentage).toFixed(0)}%` : this.dict.panel_off}"
                />
                ${state.rekuOn ? `
                  <g clip-path="url(#reku-rotor-clip)">
                    <image href="/assets/demo/energy/rekuperacja-on.webp" x="${pos.reku.x}" y="${pos.reku.y}" width="${pos.reku.w}" height="${pos.reku.h}" preserveAspectRatio="xMidYMid meet" class="device-rotor active" style="--device-rotor-dur:${this._rekuDur(this._num(state.rekuPercentage), state.rekuOn)}" aria-hidden="true" />
                  </g>
                ` : ""}
                <text x="${pos.reku.x + pos.reku.w/2}" y="${pos.reku.y - 8}" class="small object-label" text-anchor="middle">${this.dict.panel_reku}</text>
              </g>

              <g class="boiler-system">
                <path d="M ${pos.boiler.x + pos.boiler.w / 2} ${pos.boiler.y + pos.boiler.h - 18} L ${pos.boiler.x + pos.boiler.w / 2} ${pos.boiler.y + pos.boiler.h + 29} L ${houseRightX} ${pos.boiler.y + pos.boiler.h + 29}" class="pipe"/>
                <path d="M ${pos.boiler.x + pos.boiler.w / 2} ${pos.boiler.y + pos.boiler.h - 18} L ${pos.boiler.x + pos.boiler.w / 2} ${pos.boiler.y + pos.boiler.h + 29} L ${houseRightX} ${pos.boiler.y + pos.boiler.h + 29}" class="flow heat ${on(state.boilerOn)}"/>
                <image
                  href="${state.boilerOn ? "/assets/demo/energy/gas-boiler-on.webp" : "/assets/demo/energy/gas-boiler-off.webp"}"
                  x="${pos.boiler.x}"
                  y="${pos.boiler.y}"
                  width="${pos.boiler.w}"
                  height="${pos.boiler.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_boiler}"
                />
                <text x="${pos.boiler.x + pos.boiler.w / 2}" y="${pos.boiler.y - 8}" class="small object-label" text-anchor="middle">${this.dict.panel_boiler}</text>
              </g>

              <g class="radiator-system">
                <path d="M ${houseRightX} ${pos.radiator.y + pos.radiator.h / 2} L ${pos.radiator.x + 10} ${pos.radiator.y + pos.radiator.h / 2}" class="pipe"/>
                <path d="M ${pos.radiator.x + 10} ${pos.radiator.y + pos.radiator.h / 2} L ${houseRightX} ${pos.radiator.y + pos.radiator.h / 2}" class="flow heat ${on(offgrid1ToRadiator)}"/>
                <path d="M ${splitX} ${splitY} L ${pos.radiator.x + pos.radiator.w / 2} ${splitY} L ${pos.radiator.x + pos.radiator.w / 2} ${pos.radiator.y + pos.radiator.h - 8}" class="pipe"/>
                <path d="M ${splitX} ${splitY} L ${pos.radiator.x + pos.radiator.w / 2} ${splitY} L ${pos.radiator.x + pos.radiator.w / 2} ${pos.radiator.y + pos.radiator.h - 8}" class="flow power ${on(offgrid1ToRadiator)}"/>
                <image
                  href="${offgrid1ToRadiator ? "/assets/demo/energy/electric-radiator-on.webp" : "/assets/demo/energy/electric-radiator-off.webp"}"
                  x="${pos.radiator.x}"
                  y="${pos.radiator.y}"
                  width="${pos.radiator.w}"
                  height="${pos.radiator.h}"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="${this.dict.panel_radiator}"
                />
                <text x="${pos.radiator.x + pos.radiator.w / 2}" y="${pos.radiator.y - 8}" class="small object-label" text-anchor="middle">${this.dict.panel_radiator}</text>
              </g>

              <path d="M ${pos.panels.x + 72} ${panelsBottomY} L ${pos.panels.x + 72} ${invDomCenterY} L ${invDomLeftX} ${invDomCenterY}" class="pipe"/>
              <path d="M ${pos.panels.x + 72} ${panelsBottomY} L ${pos.panels.x + 72} ${invDomCenterY} L ${invDomLeftX} ${invDomCenterY}" class="flow power ${on(state.inverterDomProducing)}"/>
              <path d="M ${pos.panels.x + panelsOffgrid1RouteX} ${panelsBottomY} L ${pos.panels.x + panelsOffgrid1RouteX} ${invTarasCenterY} L ${invTarasLeftX} ${invTarasCenterY}" class="pipe"/>
              <path d="M ${pos.panels.x + panelsOffgrid1RouteX} ${panelsBottomY} L ${pos.panels.x + panelsOffgrid1RouteX} ${invTarasCenterY} L ${invTarasLeftX} ${invTarasCenterY}" class="flow power ${on(state.inverterTarasProducing)}"/>
              <path id="panels-hybrid-route" d="${panelsToHybridPath}" class="relation-line relation-solar ${on(state.inverterHybridProducing)}"/>
              ${this._movingArrow(panelsToHybridPath, state.inverterHybridProducing, "solar", "2.8s")}

              <path id="hybrid-bank-route" d="${batteryRelationPath}" class="relation-line relation-bank ${on(batteryCharging || batteryDischarging)}"/>
              ${this._movingArrow(
                batteryCharging ? inverterToBatteryPath : batteryRelationPath,
                batteryCharging || batteryDischarging,
                batteryCharging ? "charge" : "discharge",
                "2.4s"
              )}

              <path id="hybrid-grid-route" d="${gridRelationPath}" class="relation-line relation-grid ${on(gridActive)}"/>
              ${this._movingArrow(
                gridImporting ? gridToInverterPath : gridRelationPath,
                gridActive,
                gridImporting ? "grid-import" : "grid-export",
                "3.2s"
              )}

              <path id="hybrid-house-route" d="${inverterToHousePath}" class="relation-line relation-home ${on(hybridToHouse)}"/>
              ${this._movingArrow(inverterToHousePath, hybridToHouse, "home", "3.6s")}

          </svg>
        </div>
        <div class="energy-mobile-status" aria-hidden="true">
            <strong class="energy-mobile-status-title">${this.dict.panel_title}</strong>
            <div class="energy-mobile-status-grid">
              <span class="energy-mobile-status-item ${on(batteryCharging || batteryDischarging || batteryMode === "full")}"><small>${this.dict.panel_energy_bank}</small><b>${batteryStateLabel} · ${state.batteryLevel}%</b></span>
              <span class="energy-mobile-status-item ${on(gridActive)}"><small>${this.dict.panel_grid}</small><b>${gridStateLabel}</b></span>
              <span class="energy-mobile-status-item ${on(state.inverterDomProducing)}"><small>${this.dict.panel_inv_dom}</small><b>${state.inverterDomProducing ? this.dict.panel_on : this.dict.panel_off}</b></span>
              <span class="energy-mobile-status-item ${on(state.inverterTarasProducing)}"><small>${this.dict.panel_inv_taras}</small><b>${state.inverterTarasProducing ? this.dict.panel_on : this.dict.panel_off}</b></span>
              <span class="energy-mobile-status-item ${on(inverterHybridOn)}"><small>${this.dict.panel_inv_hybrid}</small><b>${inverterHybridOn ? this.dict.panel_on : this.dict.panel_off}</b></span>
              <span class="energy-mobile-status-item ${on(bufferHot)}"><small>${this.dict.panel_buffer}</small><b>${bufferHot ? this.dict.panel_on : this.dict.panel_standby}</b></span>
              <span class="energy-mobile-status-item ${on(state.pumpMixOn)}"><small>${this.dict.panel_mix_pump}</small><b>${state.pumpMixOn ? this.dict.panel_on : this.dict.panel_off}</b></span>
              <span class="energy-mobile-status-item ${on(state.pumpMainOn)}"><small>${this.dict.panel_main_pump}</small><b>${state.pumpMainOn ? this.dict.panel_on : this.dict.panel_off}</b></span>
              <span class="energy-mobile-status-item ${on(state.rekuOn)}"><small>${this.dict.panel_reku}</small><b>${state.rekuOn ? `${this.dict.panel_on} · ${this._num(state.rekuPercentage).toFixed(0)}%` : this.dict.panel_off}</b></span>
              <span class="energy-mobile-status-item ${on(state.boilerOn)}"><small>${this.dict.panel_boiler}</small><b>${state.boilerOn ? this.dict.panel_on : this.dict.panel_off}</b></span>
              <span class="energy-mobile-status-item ${on(offgrid1ToRadiator)}"><small>${this.dict.panel_radiator}</small><b>${offgrid1ToRadiator ? this.dict.panel_on : this.dict.panel_off}</b></span>
            </div>
          </div>
      `;

      const batteryLabels = [...this.root.querySelectorAll("[data-bank-label]")];
      const batteryLabelWidth = Math.max(...batteryLabels.map((label) => label.getComputedTextLength()));
      const batteryLabelStartX = batteryCenterX - batteryLabelWidth / 2;
      batteryLabels.forEach((label) => label.setAttribute("x", batteryLabelStartX.toFixed(1)));
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
      hybridToHouse: true,
      batteryMode: "discharging",
      batteryLevel: 58,
      gridMode: "idle",
      offgrid2ToHeater1: false,
      offgrid1ToRadiator: false,
      offgrid1ToHeater2: false,
      pumpMixOn: false,
      pumpMainOn: false,
      boilerOn: true,
      kitchenLightOn: Math.random() > 0.5,
      salonLightOn: Math.random() > 0.5,
      ...randomLayer,
      message: dict.scenario_night_final
    };
  }

  function createMorningScenario(dict) {
    const randomLayer = createRandomPresenceAndReku();
    return {
      statusIcon: "⛅️",
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
      batteryMode: "charging",
      batteryLevel: 42,
      gridMode: "importing",
      offgrid2ToHeater1: true,
      offgrid1ToRadiator: true,
      offgrid1ToHeater2: false,
      bufferHot: false,
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
      batteryMode: "full",
      batteryLevel: 100,
      gridMode: "exporting",
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
      statusIcon: "🌤️",
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
      hybridToHouse: true,
      batteryMode: "discharging",
      batteryLevel: 84,
      gridMode: "idle",
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

  const lang = getLang();
  applyI18n(lang);
  const dict = DICT[lang];
  const panelTrigger = qs("#demo-panel-trigger");
  const instructionTrigger = qs("#demo-instruction-trigger");
  const initialState = createMorningScenario(dict);
  const renderer = new PanelDemoRenderer(qs("#panelMount"), dict);

  renderer.render(initialState);

  const simulationStatusTargets = Array.from(document.querySelectorAll(".js-simulation-status"));
  const btnSimulate = qs("#btn-simulate");
  const scenarioSequence = [
    () => createMorningScenario(dict),
    () => createNoonScenario(dict),
    () => createSunsetScenario(dict),
    () => createNightScenario(dict)
  ];
  let scenarioIndex = 0;
  let touchHandled = false;

  const renderSingleSimulationStatus = (target, scenario) => {
    if (!target) {
      return;
    }
    if (!scenario || !scenario.message) {
      target.textContent = dict.sim_prompt;
      return;
    }

    const iconMarkup = scenario.statusIcon === "sunset"
      ? '<span class="sim-status-icon sim-status-icon--sunset" aria-hidden="true"></span>'
      : `<span class="sim-status-icon" aria-hidden="true">${scenario.statusIcon || ""}</span>`;

    const message = scenario.message.replace(/^(🌙|⛅️?|☀️?|🌤️?|🌇)\s*/u, "");
    target.innerHTML = `<span class="sim-status-content">${iconMarkup}<span>${message}</span></span>`;
  };

  const renderSimulationStatus = (scenario) => {
    simulationStatusTargets.forEach((target) => {
      renderSingleSimulationStatus(target, scenario);
    });
  };

  const runNextScenario = () => {
    scenarioIndex = (scenarioIndex + 1) % scenarioSequence.length;
    const scenarioFactory = scenarioSequence[scenarioIndex];
    const scenario = scenarioFactory();
    renderer.render(scenario);
    renderSimulationStatus(scenario);
  };

  const canUsePanelTrigger = () => true;

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

  if (panelTrigger) {
    panelTrigger.addEventListener("click", () => {
      if (!canUsePanelTrigger()) {
        return;
      }
      runNextScenario();
    });
  }

  if (instructionTrigger) {
    instructionTrigger.addEventListener("click", runNextScenario);
  }

  renderSimulationStatus(initialState);
})();
