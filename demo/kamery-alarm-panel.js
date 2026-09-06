/* Panel premium "Kamery i alarm":
   /pl/projekty/kamery-alarm/, /dk/projekter/kameraer-alarm/,
   /en/projects/cameras-alarm/.
   W pelni symulowana demonstracja systemu bezpieczenstwa: podglad czterech
   kamer, maszyna stanow alarmu (rozbrojony -> czas na wyjscie -> uzbrojony,
   czas na wejscie -> alarm), tryby uzbrojenia sterujace strefami, czujniki
   i strefy, dziennik zdarzen, symulacja wykrycia intruza oraz regulowana syrena
   Web Audio. Brak polaczenia z Home Assistant, stany zyja tylko w tej karcie.
   Zapamietywana lokalnie jest jedynie glosnosc syreny. Jezyk sterowany atrybutem
   data-demo-lang. Logika alarmu trzymana osobno od renderu i i18n.

   PODMIANA ASSETOW: zdjecia kamer i tlo naglowka wpiete w kamery-alarm-panel.css
   (--ka-hero-img) oraz w tablicy CAMERAS ponizej:
   assets/demo/kamery-alarm/{header,camera-gate,camera-entrance,camera-terrace,
   camera-garage,camera-gate-motion,camera-entrance-motion}.webp
*/
(() => {
  const stage = document.getElementById("kaStage");
  const panel = document.getElementById("kaPanel");
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
      eyebrow: "Projekt · Bezpieczeństwo domu",
      title: "Kamery i alarm",
      tagline: "Bezpieczeństwo, kontrola i spokój w jednym miejscu.",
      outside: "Na zewnątrz",
      demoBadge: "Tryb demonstracyjny",
      fsOpen: "Pełny ekran",
      fsClose: "Zamknij pełny ekran",

      camsTitle: "Podgląd kamer",
      camsNote: "Cztery strefy posesji, obraz na żywo.",
      live: "Na żywo",
      monitoringOn: "Monitoring aktywny",
      motionNone: "Brak ruchu",
      motionSeen: "Ruch wykryty",
      camExpand: (name) => `Powiększ podgląd: ${name}`,
      camClose: "Zamknij powiększony podgląd",
      simEvent: "Symuluj włamanie",
      cameras: {
        gate: "Brama wjazdowa",
        entrance: "Wejście główne",
        terrace: "Taras / ogród",
        garage: "Garaż",
      },

      overall: {
        ok: { title: "Wszystko w porządku", note: "System działa prawidłowo." },
        armed: { title: "Dom pod ochroną", note: "Aktywne strefy są monitorowane." },
        pendingOut: { title: "Uzbrajanie w toku", note: "Opuść dom przed końcem odliczania." },
        pendingIn: { title: "Czas na rozbrojenie", note: "Wprowadź kod, aby wyłączyć alarm." },
        alarm: { title: "Alarm", note: "Wykryto naruszenie chronionej strefy." },
      },

      alarmCard: {
        disarmed: { state: "Alarm rozbrojony", sub: "Dom jest bezpieczny." },
        armed_away: { state: "Uzbrojony: cały dom", sub: "Pełna ochrona posesji." },
        armed_home: { state: "Uzbrojony: parter", sub: "Strefa dzienna chroniona." },
        armed_night: { state: "Tryb nocny", sub: "Ochrona obwodu i parteru." },
        arming: { state: "Czas na wyjście", sub: (s) => `Uzbrojenie za ${s} s.` },
        entry: { state: "Czas na wejście", sub: (s) => `Rozbrój w ciągu ${s} s.` },
        triggered: { state: "ALARM", sub: (z) => `Naruszona strefa: ${z}.` },
      },
      lockAria: (armed) => armed ? "Rozbrój alarm" : "Uzbrój alarm (cały dom)",

      quickTitle: "Szybkie uzbrojenie",
      modes: {
        armFull: "Uzbrój cały dom",
        armGround: "Uzbrój parter",
        night: "Tryb nocny",
        disarm: "Rozbrój",
        settings: "Ustawienia",
      },
      modeDesc: {
        armFull: "Pełna ochrona posesji",
        armGround: "Strefa dzienna",
        night: "Ochrona nocą",
        disarm: "Wyłącz alarm",
        settings: "Konfiguracja systemu",
      },
      modeEvent: { armed_away: "cały dom", armed_home: "parter", armed_night: "tryb nocny" },
      info: {
        disarmed: { title: "System jest rozbrojony.", sub: "Wybierz tryb ochrony, aby rozpocząć monitorowanie." },
        armed_away: { title: "Pełna ochrona posesji jest aktywna.", sub: "System monitoruje wszystkie strefy domu." },
        armed_home: { title: "Ochrona parteru jest aktywna.", sub: "System monitoruje strefę dzienną i obwód domu." },
        armed_night: { title: "Tryb nocny jest aktywny.", sub: "System monitoruje obwód domu i parter." },
        arming: {
          armed_away: "Trwa uzbrajanie całego domu.",
          armed_home: "Trwa uzbrajanie parteru.",
          armed_night: "Trwa włączanie trybu nocnego.",
          sub: (s) => `Pozostało ${s} sekund na opuszczenie chronionej strefy.`,
        },
        entry: { title: (z) => `Wykryto ruch: ${z}.`, sub: (s) => `Rozbrój alarm w ciągu ${s} sekund.` },
        triggered: { title: "Alarm został uruchomiony.", sub: (z, audible) => `Naruszona strefa: ${z}. ${audible ? "Syrena alarmowa jest włączona." : "Syrena jest wyciszona w ustawieniach."}` },
      },

      sensorsTitle: "Czujniki i strefy",
      sensorsAll: "Wszystkie strefy",
      sensorsHide: "Zwiń strefy",
      sensors: {
        doors: "Drzwi i okna",
        motion: "Ruch",
        system: "System",
        cancel: "Odwołaj alarm",
      },
      sensorState: {
        doorsClosed: "Zamknięte",
        doorsOpen: "Otwarte",
        motionNone: "Brak ruchu",
        motionSeen: "Wykryto ruch",
        systemOnline: "Online",
        cancelReady: "Wycisz",
        cancelIdle: "Brak alarmu",
      },
      sensorHint: {
        doors: "Kliknij, aby zasymulować otwarcie drzwi.",
        motion: "Kliknij, aby zasymulować ruch wewnątrz.",
        system: "Zasilanie i łączność w normie.",
        cancel: "Wycisza i odwołuje trwający alarm. System pozostaje uzbrojony.",
      },
      zoneArmed: "chroniona",
      zoneBypass: "pominięta",

      eventsTitle: "Ostatnie zdarzenia",
      eventsAll: "Pełna historia",
      eventsLess: "Pokaż mniej",
      ev: {
        ready: "System gotowy do pracy",
        armed: (m) => `Uzbrojono: ${m}`,
        arming: (m) => `Rozpoczęto uzbrajanie: ${m}`,
        disarmed: "Rozbrojono alarm",
        motion: (z) => `Ruch: ${z}`,
        entry: (z) => `Wejście w strefę: ${z}`,
        alarm: (z) => `Alarm, naruszona strefa: ${z}`,
        doorOpen: "Otwarto: drzwi wejściowe",
        doorClose: "Zamknięto: drzwi wejściowe",
        presence: (r) => `Symulacja obecności: ${r}`,
        cleared: "Alarm skasowany",
        canceled: "Alarm odwołany, system nadal uzbrojony",
      },
      presenceRooms: ["salon", "kuchnia", "gabinet", "sypialnia", "hol"],

      settingsTitle: "Ustawienia systemu",
      settingsClose: "Zamknij ustawienia",
      setExit: "Czas na wyjście",
      setEntry: "Czas na wejście",
      setSiren: "Głośność syreny",
      testSiren: "Testuj syrenę przez 2 sekundy",
      testingSiren: "Trwa test syreny…",
      sirenActive: "Syrena alarmowa jest aktywna",
      sirenMuted: "Syrena jest wyciszona. Zwiększ jej głośność, aby uruchomić test.",
      setPresence: "Symulacja obecności",
      setPresenceNote: "Losowo włącza światła, gdy dom jest uzbrojony na wyjściu.",
      seconds: "s",

      actionNote: "Panel jest symulacją. Przyciski działają, ale nie sterują prawdziwym domem.",
      footTags: "Twój dom · Zawsze pod kontrolą",

      days: ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."],
      months: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"],
      notices: {
        armFirst: { title: "Najpierw uzbrój alarm.", sub: "Wybierz tryb ochrony, a następnie uruchom symulację włamania." },
        armBlocked: { title: "Nie można uzbroić alarmu.", sub: "Najpierw zamknij drzwi i okna." },
        canceled: { title: "Alarm został odwołany.", sub: "System nadal jest uzbrojony i monitoruje chronione strefy." },
        settings: { title: "Ustawienia zostały zastosowane.", sub: "Wybrana głośność syreny została zapamiętana w tej przeglądarce." },
        sirenMuted: { title: "Syrena jest wyciszona.", sub: "Zwiększ głośność syreny w ustawieniach, aby usłyszeć jej test." },
      },
    },
    dk: {
      decimalSep: ",",
      eyebrow: "Projekt · Sikkerhed i hjemmet",
      title: "Kameraer og alarm",
      tagline: "Sikkerhed, kontrol og tryghed samlet et sted.",
      outside: "Udendørs",
      demoBadge: "Demonstration",
      fsOpen: "Fuld skærm",
      fsClose: "Luk fuld skærm",
      camsTitle: "Kameraovervågning",
      camsNote: "Fire områder omkring boligen med livebillede.",
      live: "Live",
      monitoringOn: "Overvågning aktiv",
      motionNone: "Ingen bevægelse",
      motionSeen: "Bevægelse registreret",
      camExpand: (name) => `Forstør kameravisningen: ${name}`,
      camClose: "Luk den forstørrede kameravisning",
      simEvent: "Simuler indbrud",
      cameras: { gate: "Indkørsel", entrance: "Hovedindgang", terrace: "Terrasse og have", garage: "Garage" },
      overall: {
        ok: { title: "Alt er i orden", note: "Systemet fungerer korrekt." },
        armed: { title: "Boligen er beskyttet", note: "De aktive områder overvåges." },
        pendingOut: { title: "Alarmen tilkobles", note: "Forlad boligen, før nedtællingen slutter." },
        pendingIn: { title: "Tid til frakobling", note: "Indtast koden for at slå alarmen fra." },
        alarm: { title: "Alarm", note: "Der er registreret aktivitet i et beskyttet område." },
      },
      alarmCard: {
        disarmed: { state: "Alarmen er frakoblet", sub: "Boligen er sikker." },
        armed_away: { state: "Tilkoblet: hele boligen", sub: "Fuld beskyttelse af ejendommen." },
        armed_home: { state: "Tilkoblet: stueetagen", sub: "Opholdsområdet er beskyttet." },
        armed_night: { state: "Nattilstand", sub: "Skalsikring og stueetage er beskyttet." },
        arming: { state: "Tid til at gå ud", sub: (s) => `Alarmen tilkobles om ${s} sekunder.` },
        entry: { state: "Tid til at gå ind", sub: (s) => `Frakobl alarmen inden ${s} sekunder.` },
        triggered: { state: "ALARM", sub: (z) => `Berørt område: ${z}.` },
      },
      lockAria: (armed) => armed ? "Frakobl alarmen" : "Tilkobl alarmen i hele boligen",
      quickTitle: "Hurtig tilkobling",
      modes: { armFull: "Tilkobl hele boligen", armGround: "Tilkobl stueetagen", night: "Nattilstand", disarm: "Frakobl", settings: "Indstillinger" },
      modeDesc: { armFull: "Fuld beskyttelse", armGround: "Opholdsområde", night: "Beskyttelse om natten", disarm: "Slå alarmen fra", settings: "Systemopsætning" },
      modeEvent: { armed_away: "hele boligen", armed_home: "stueetagen", armed_night: "nattilstand" },
      info: {
        disarmed: { title: "Systemet er frakoblet.", sub: "Vælg en beskyttelsestilstand for at starte overvågningen." },
        armed_away: { title: "Fuld beskyttelse af ejendommen er aktiv.", sub: "Systemet overvåger alle områder i boligen." },
        armed_home: { title: "Beskyttelse af stueetagen er aktiv.", sub: "Systemet overvåger opholdsområdet og boligens ydre grænser." },
        armed_night: { title: "Nattilstand er aktiv.", sub: "Systemet overvåger boligens ydre grænser og stueetagen." },
        arming: {
          armed_away: "Hele boligen er ved at blive tilkoblet.",
          armed_home: "Stueetagen er ved at blive tilkoblet.",
          armed_night: "Nattilstand er ved at blive aktiveret.",
          sub: (s) => `Der er ${s} sekunder tilbage til at forlade det beskyttede område.`,
        },
        entry: { title: (z) => `Bevægelse registreret: ${z}.`, sub: (s) => `Frakobl alarmen inden ${s} sekunder.` },
        triggered: { title: "Alarmen er udløst.", sub: (z, audible) => `Berørt område: ${z}. ${audible ? "Sirenen er aktiveret." : "Sirenen er slået fra i indstillingerne."}` },
      },
      sensorsTitle: "Sensorer og områder",
      sensorsAll: "Alle områder",
      sensorsHide: "Skjul områder",
      sensors: { doors: "Døre og vinduer", motion: "Bevægelse", system: "System", cancel: "Afbryd alarmen" },
      sensorState: {
        doorsClosed: "Lukket", doorsOpen: "Åben", motionNone: "Ingen bevægelse", motionSeen: "Bevægelse registreret",
        systemOnline: "Forbundet", cancelReady: "Slå lyd fra", cancelIdle: "Ingen alarm",
      },
      sensorHint: {
        doors: "Tryk for at simulere en åben dør.",
        motion: "Tryk for at simulere bevægelse indenfor.",
        system: "Strømforsyning og forbindelse fungerer korrekt.",
        cancel: "Slår lyden fra og afbryder den aktive alarm. Systemet forbliver tilkoblet.",
      },
      zoneArmed: "beskyttet",
      zoneBypass: "ikke overvåget",
      eventsTitle: "Seneste hændelser",
      eventsAll: "Vis hele historikken",
      eventsLess: "Vis færre hændelser",
      ev: {
        ready: "Systemet er klar",
        armed: (m) => `Tilkoblet: ${m}`,
        arming: (m) => `Tilkobling startet: ${m}`,
        disarmed: "Alarmen er frakoblet",
        motion: (z) => `Bevægelse: ${z}`,
        entry: (z) => `Adgang til område: ${z}`,
        alarm: (z) => `Alarm i området: ${z}`,
        doorOpen: "Hoveddøren er åbnet",
        doorClose: "Hoveddøren er lukket",
        presence: (r) => `Tilstedeværelsessimulering: ${r}`,
        cleared: "Alarmen er nulstillet",
        canceled: "Alarmen er afbrudt, og systemet er stadig tilkoblet",
      },
      presenceRooms: ["stue", "køkken", "kontor", "soveværelse", "entre"],
      settingsTitle: "Systemindstillinger",
      settingsClose: "Luk indstillingerne",
      setExit: "Tid til at gå ud",
      setEntry: "Tid til at gå ind",
      setSiren: "Sirenens lydstyrke",
      testSiren: "Test sirenen i 2 sekunder",
      testingSiren: "Sirenen testes…",
      sirenActive: "Sirenen er aktiv",
      sirenMuted: "Sirenen er slået fra. Skru op for lydstyrken for at starte testen.",
      setPresence: "Tilstedeværelsessimulering",
      setPresenceNote: "Tænder tilfældigt lys, når hele boligen er tilkoblet.",
      seconds: "sekunder",
      actionNote: "Panelet er en demonstration. Knapperne fungerer, men styrer ikke en virkelig bolig.",
      footTags: "Dit hjem · Altid under kontrol",
      days: ["søn.", "man.", "tir.", "ons.", "tor.", "fre.", "lør."],
      months: ["jan.", "feb.", "mar.", "apr.", "maj", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "dec."],
      notices: {
        armFirst: { title: "Tilkobl alarmen først.", sub: "Vælg en beskyttelsestilstand, og start derefter simuleringen af et indbrud." },
        armBlocked: { title: "Alarmen kan ikke tilkobles.", sub: "Luk først alle døre og vinduer." },
        canceled: { title: "Alarmen er afbrudt.", sub: "Systemet er stadig tilkoblet og overvåger de beskyttede områder." },
        settings: { title: "Indstillingerne er anvendt.", sub: "Den valgte lydstyrke er gemt i denne browser." },
        sirenMuted: { title: "Sirenen er slået fra.", sub: "Skru op for sirenen i indstillingerne for at høre testen." },
      },
    },
    en: {
      decimalSep: ".",
      eyebrow: "Project · Home security",
      title: "Cameras and alarm",
      tagline: "Security, control and peace of mind in one place.",
      outside: "Outside",
      demoBadge: "Demonstration mode",
      fsOpen: "Fullscreen",
      fsClose: "Close fullscreen",
      camsTitle: "Camera views",
      camsNote: "Live views of four areas around the property.",
      live: "Live",
      monitoringOn: "Monitoring active",
      motionNone: "No motion",
      motionSeen: "Motion detected",
      camExpand: (name) => `Enlarge camera view: ${name}`,
      camClose: "Close enlarged camera view",
      simEvent: "Simulate an intrusion",
      cameras: { gate: "Driveway gate", entrance: "Main entrance", terrace: "Patio and garden", garage: "Garage" },
      overall: {
        ok: { title: "Everything is secure", note: "The system is operating correctly." },
        armed: { title: "Home protected", note: "The active areas are being monitored." },
        pendingOut: { title: "Arming in progress", note: "Leave the home before the countdown ends." },
        pendingIn: { title: "Time to disarm", note: "Enter the code to turn off the alarm." },
        alarm: { title: "Alarm", note: "Activity was detected in a protected area." },
      },
      alarmCard: {
        disarmed: { state: "Alarm disarmed", sub: "The home is secure." },
        armed_away: { state: "Armed: entire home", sub: "Full protection of the property." },
        armed_home: { state: "Armed: ground floor", sub: "The living area is protected." },
        armed_night: { state: "Night mode", sub: "The perimeter and ground floor are protected." },
        arming: { state: "Exit time", sub: (s) => `The alarm will arm in ${s} seconds.` },
        entry: { state: "Entry time", sub: (s) => `Disarm the alarm within ${s} seconds.` },
        triggered: { state: "ALARM", sub: (z) => `Affected area: ${z}.` },
      },
      lockAria: (armed) => armed ? "Disarm the alarm" : "Arm the entire home",
      quickTitle: "Quick arming",
      modes: { armFull: "Arm the entire home", armGround: "Arm the ground floor", night: "Night mode", disarm: "Disarm", settings: "Settings" },
      modeDesc: { armFull: "Full property protection", armGround: "Living area", night: "Protection at night", disarm: "Turn off the alarm", settings: "System configuration" },
      modeEvent: { armed_away: "entire home", armed_home: "ground floor", armed_night: "night mode" },
      info: {
        disarmed: { title: "The system is disarmed.", sub: "Choose a protection mode to begin monitoring." },
        armed_away: { title: "Full property protection is active.", sub: "The system is monitoring every area of the home." },
        armed_home: { title: "Ground floor protection is active.", sub: "The system is monitoring the living area and the perimeter." },
        armed_night: { title: "Night mode is active.", sub: "The system is monitoring the perimeter and the ground floor." },
        arming: {
          armed_away: "The entire home is being armed.",
          armed_home: "The ground floor is being armed.",
          armed_night: "Night mode is being activated.",
          sub: (s) => `${s} seconds remain to leave the protected area.`,
        },
        entry: { title: (z) => `Motion detected: ${z}.`, sub: (s) => `Disarm the alarm within ${s} seconds.` },
        triggered: { title: "The alarm has been triggered.", sub: (z, audible) => `Affected area: ${z}. ${audible ? "The siren is sounding." : "The siren is muted in the settings."}` },
      },
      sensorsTitle: "Sensors and areas",
      sensorsAll: "All areas",
      sensorsHide: "Hide areas",
      sensors: { doors: "Doors and windows", motion: "Motion", system: "System", cancel: "Cancel the alarm" },
      sensorState: {
        doorsClosed: "Closed", doorsOpen: "Open", motionNone: "No motion", motionSeen: "Motion detected",
        systemOnline: "Connected", cancelReady: "Silence", cancelIdle: "No alarm",
      },
      sensorHint: {
        doors: "Select to simulate an open door.",
        motion: "Select to simulate motion inside the home.",
        system: "The power supply and connection are operating correctly.",
        cancel: "Silences and cancels the active alarm. The system remains armed.",
      },
      zoneArmed: "protected",
      zoneBypass: "not monitored",
      eventsTitle: "Recent events",
      eventsAll: "View full history",
      eventsLess: "Show fewer events",
      ev: {
        ready: "System ready",
        armed: (m) => `Armed: ${m}`,
        arming: (m) => `Arming started: ${m}`,
        disarmed: "Alarm disarmed",
        motion: (z) => `Motion: ${z}`,
        entry: (z) => `Entry into area: ${z}`,
        alarm: (z) => `Alarm in area: ${z}`,
        doorOpen: "Main door opened",
        doorClose: "Main door closed",
        presence: (r) => `Presence simulation: ${r}`,
        cleared: "Alarm reset",
        canceled: "Alarm cancelled, system remains armed",
      },
      presenceRooms: ["living room", "kitchen", "office", "bedroom", "hallway"],
      settingsTitle: "System settings",
      settingsClose: "Close settings",
      setExit: "Exit time",
      setEntry: "Entry time",
      setSiren: "Siren volume",
      testSiren: "Test the siren for 2 seconds",
      testingSiren: "Testing the siren…",
      sirenActive: "The siren is active",
      sirenMuted: "The siren is muted. Increase the volume to start the test.",
      setPresence: "Presence simulation",
      setPresenceNote: "Turns lights on at random when the entire home is armed.",
      seconds: "seconds",
      actionNote: "This panel is a demonstration. The buttons work, but they do not control a real home.",
      footTags: "Your home · Always under control",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      notices: {
        armFirst: { title: "Arm the alarm first.", sub: "Choose a protection mode, then start the intrusion simulation." },
        armBlocked: { title: "The alarm cannot be armed.", sub: "Close all doors and windows first." },
        canceled: { title: "The alarm has been cancelled.", sub: "The system remains armed and continues to monitor the protected areas." },
        settings: { title: "The settings have been applied.", sub: "The selected siren volume has been saved in this browser." },
        sirenMuted: { title: "The siren is muted.", sub: "Increase the siren volume in the settings to hear the test." },
      },
    },
  };
  const t = Object.assign({}, STRINGS.pl, STRINGS[LANG] || {});

  /* ---------------- ikony ---------------- */
  const SVG = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5 15 6v11L3 14.5Z"/><path d="M15 10.5 21 8v8l-6-2.5Z"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    lockClosed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    lockOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-1.9"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 10v11h6v-6h6v6h6V10Z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-1.9"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M6 21h12M6 21H4M18 21h2M13 12h.01"/></svg>',
    motion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4.5" r="1.8"/><path d="M10 9.5 7 8 4 11M10 9.5l4 1 1.5 4M14 10.5 12 21M14 10.5l4.5 2.5M9.5 14 6.5 21"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c1.5 0 1.5-2 1.5-3.5S12 3 12 3Z"/></svg>',
    bellOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 9-5.2M18 12c0 4 2 4 2 4H7M10 20a2 2 0 0 0 4 0"/><path d="m3 3 18 18"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18Z"/></svg>',
    pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h3.5l2-5 3 9 2.5-6 1.5 3H21"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  };
  const MODE_ICON = {
    armFull: SVG.shield, armGround: SVG.home, night: SVG.moon, disarm: SVG.unlock, settings: SVG.gear,
  };
  const SENSOR_ICON = { doors: SVG.door, motion: SVG.motion, system: SVG.chip, cancel: SVG.bellOff };

  /* ---------------- definicje ---------------- */
  const BASE = "/assets/demo/kamery-alarm/";
  const CAMERAS = [
    { id: "gate", photo: BASE + "camera-gate.webp", motionPhoto: BASE + "camera-gate-motion.webp", kind: "perimeter" },
    { id: "entrance", photo: BASE + "camera-entrance.webp", motionPhoto: BASE + "camera-entrance-motion.webp", kind: "perimeter" },
    { id: "terrace", photo: BASE + "camera-terrace.webp", motionPhoto: null, kind: "motion" },
    { id: "garage", photo: BASE + "camera-garage.webp", motionPhoto: null, kind: "perimeter" },
  ];
  const CAM_BY_ID = Object.fromEntries(CAMERAS.map((c) => [c.id, c]));

  const ARMED_MODES = ["armed_away", "armed_home", "armed_night"];
  const isArmedMode = (m) => ARMED_MODES.includes(m);

  /* ktore strefy sa czynne w danym trybie */
  function perimeterArmed(mode) { return isArmedMode(mode); }
  function interiorArmed(mode) { return mode === "armed_away" || mode === "armed_night"; }

  const EXIT_MIN = 10, EXIT_MAX = 60, ENTRY_MIN = 5, ENTRY_MAX = 45;
  const SIREN_STORAGE_KEY = "ha-expert-kamery-alarm-siren-volume";

  function loadSirenVolume() {
    try {
      const stored = window.localStorage.getItem(SIREN_STORAGE_KEY);
      if (stored === null) return 70;
      const saved = Number(stored);
      return Number.isFinite(saved) ? Math.max(0, Math.min(100, saved)) : 70;
    } catch (_) {
      return 70;
    }
  }

  function saveSirenVolume(value) {
    try { window.localStorage.setItem(SIREN_STORAGE_KEY, String(value)); } catch (_) { /* zapis jest opcjonalny */ }
  }

  /* ---------------- stan runtime ---------------- */
  const state = {
    mode: "disarmed",        // disarmed | armed_away | armed_home | armed_night
    phase: "idle",           // idle | arming | entry | triggered
    targetMode: null,        // tryb docelowy podczas arming
    countdown: 0,
    breachZone: null,        // id kamery/strefy, ktora wywolala alarm
    weatherOut: 16,
    doorOpen: false,
    interiorMotion: false,
    simIdx: 0,
    cams: Object.fromEntries(CAMERAS.map((c) => [c.id, { motion: false, motionTimer: null }])),
    events: [],
    eventsExpanded: false,
    zonesExpanded: false,
    settings: { exit: 30, entry: 20, siren: loadSirenVolume(), presence: false },
    lightbox: null,
    notice: null,
  };

  /* ---------------- pomocnicze ---------------- */
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const fmtCr = (v) => `${Math.round(v)}°C`;
  const camName = (id) => (t.cameras && t.cameras[id]) || STRINGS.pl.cameras[id] || id;
  const now2 = (n) => String(n).padStart(2, "0");

  /* ---------------- referencje DOM ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const refs = {
    clock: $("[data-ka='clock']"),
    date: $("[data-ka='date']"),
    weatherOut: $("[data-ka='weatherOut']"),

    camsGrid: $("[data-ka='camsGrid']"),
    simBtn: $("[data-ka='simBtn']"),

    overall: $("[data-ka='overall']"),
    overallIc: $("[data-ka='overallIc']"),
    overallTitle: $("[data-ka='overallTitle']"),
    overallNote: $("[data-ka='overallNote']"),

    alarmCard: $("[data-ka='alarmCard']"),
    alarmState: $("[data-ka='alarmState']"),
    alarmSub: $("[data-ka='alarmSub']"),
    lock: $("[data-ka='lock']"),
    lockIc: $("[data-ka='lockIc']"),

    quickRow: $("[data-ka='quickRow']"),

    sensorsGrid: $("[data-ka='sensorsGrid']"),
    sensorsToggle: $("[data-ka='sensorsToggle']"),
    zonesDetail: $("[data-ka='zonesDetail']"),

    eventsList: $("[data-ka='eventsList']"),
    eventsToggle: $("[data-ka='eventsToggle']"),

    infoBar: $("[data-ka='infoBar']"),
    settings: $("[data-ka='settings']"),
    settingsBody: $("[data-ka='settingsBody']"),

    lightbox: $("[data-ka='lightbox']"),
    lightboxImg: $("[data-ka='lightboxImg']"),
    lightboxName: $("[data-ka='lightboxName']"),
    lightboxState: $("[data-ka='lightboxState']"),

  };

  /* ---------------- dziennik zdarzen ---------------- */
  function pushEvent(text, tone = "info") {
    const d = new Date();
    state.events.unshift({ time: `${now2(d.getHours())}:${now2(d.getMinutes())}`, text, tone });
    if (state.events.length > 24) state.events.length = 24;
    renderEvents();
  }

  function renderEvents() {
    if (!refs.eventsList) return;
    const list = state.eventsExpanded ? state.events.slice(0, 12) : state.events.slice(0, 4);
    refs.eventsList.innerHTML = list.map((e) => `
      <li class="ka-ev ka-ev--${e.tone}">
        <span class="ka-ev-dot" aria-hidden="true"></span>
        <span class="ka-ev-time">${e.time}</span>
        <span class="ka-ev-text">${e.text}</span>
      </li>`).join("");
    if (refs.eventsToggle) {
      refs.eventsToggle.textContent = state.eventsExpanded ? t.eventsLess : t.eventsAll;
      refs.eventsToggle.setAttribute("aria-expanded", state.eventsExpanded ? "true" : "false");
    }
  }

  /* ---------------- zegar + data ---------------- */
  function tickClock() {
    const d = new Date();
    if (refs.clock) refs.clock.textContent = `${now2(d.getHours())}:${now2(d.getMinutes())}`;
    if (refs.date) refs.date.textContent = `${t.days[d.getDay()]} ${d.getDate()} ${t.months[d.getMonth()]}`;
  }

  /* ---------------- kamery ---------------- */
  function camMotionActive(id) { return !!state.cams[id].motion; }

  function renderCams() {
    if (!refs.camsGrid) return;
    if (refs.camsGrid.dataset.ready !== "1") {
      refs.camsGrid.dataset.ready = "1";
      refs.camsGrid.innerHTML = CAMERAS.map((c) => `
        <figure class="ka-cam" data-ka-cam="${c.id}">
          <div class="ka-cam-media" data-ka-ref="media"></div>
          <span class="ka-cam-live"><i aria-hidden="true"></i>${t.live}</span>
          <button class="ka-cam-expand" type="button" data-ka-cam-expand="${c.id}" aria-label="${t.camExpand(camName(c.id))}">${SVG.expand}</button>
          <figcaption class="ka-cam-cap">
            <span class="ka-cam-name">${SVG.cam}<b>${camName(c.id)}</b></span>
            <span class="ka-cam-foot">
              <span class="ka-cam-mon"><i aria-hidden="true"></i>${t.monitoringOn}</span>
              <span class="ka-cam-motion" data-ka-ref="motion">${t.motionNone}</span>
            </span>
          </figcaption>
        </figure>`).join("");
    }
    $$("[data-ka-cam]", refs.camsGrid).forEach((el) => {
      const id = el.dataset.kaCam;
      const c = CAM_BY_ID[id];
      const motion = camMotionActive(id);
      const src = motion && c.motionPhoto ? c.motionPhoto : c.photo;
      const media = $("[data-ka-ref='media']", el);
      if (media.dataset.src !== src) {
        media.dataset.src = src;
        media.style.backgroundImage = `url("${src}")`;
      }
      el.classList.toggle("is-motion", motion);
      el.classList.toggle("is-breach", state.phase === "triggered" && state.breachZone === id);
      $("[data-ka-ref='motion']", el).textContent = motion ? t.motionSeen : t.motionNone;
    });
    if (state.lightbox) renderLightbox();
  }

  let camClearTimers = {};
  function setCamMotion(id, on, opts = {}) {
    state.cams[id].motion = on;
    renderCams();
    clearTimeout(camClearTimers[id]);
    if (on && opts.autoClear && state.phase !== "triggered") {
      camClearTimers[id] = setTimeout(() => {
        if (state.phase === "triggered") return;
        state.cams[id].motion = false;
        renderCams();
      }, opts.autoClear);
    }
  }

  /* ---------------- lightbox kamery ---------------- */
  function openLightbox(id) {
    state.lightbox = id;
    refs.lightbox.hidden = false;
    document.body.classList.add("ka-lightbox-open");
    renderLightbox();
    requestAnimationFrame(() => refs.lightbox.classList.add("is-shown"));
  }
  function closeLightbox() {
    state.lightbox = null;
    refs.lightbox.classList.remove("is-shown");
    document.body.classList.remove("ka-lightbox-open");
    setTimeout(() => { refs.lightbox.hidden = true; }, 200);
  }
  function renderLightbox() {
    const id = state.lightbox;
    if (!id) return;
    const c = CAM_BY_ID[id];
    const motion = camMotionActive(id);
    const src = motion && c.motionPhoto ? c.motionPhoto : c.photo;
    refs.lightboxImg.style.backgroundImage = `url("${src}")`;
    refs.lightboxImg.classList.toggle("is-breach", state.phase === "triggered" && state.breachZone === id);
    refs.lightboxName.textContent = camName(id);
    refs.lightboxState.textContent = motion ? t.motionSeen : t.motionNone;
    refs.lightboxState.classList.toggle("is-motion", motion);
  }

  /* ---------------- status ogolny ---------------- */
  function overallKey() {
    if (state.phase === "triggered") return "alarm";
    if (state.phase === "entry") return "pendingIn";
    if (state.phase === "arming") return "pendingOut";
    if (isArmedMode(state.mode)) return "armed";
    return "ok";
  }
  function renderOverall() {
    const key = overallKey();
    const o = t.overall[key];
    refs.overall.dataset.tone = key === "alarm" ? "alarm" : (key === "ok" ? "ok" : (key === "armed" ? "armed" : "pending"));
    refs.overallIc.innerHTML = key === "alarm" ? SVG.bell : (key === "ok" ? SVG.check : SVG.shield);
    refs.overallTitle.textContent = o.title;
    refs.overallNote.textContent = o.note;
  }

  /* ---------------- karta alarmu + zamek ---------------- */
  function renderAlarm() {
    const c = t.alarmCard;
    let stateTxt, subTxt, cls;
    if (state.phase === "triggered") {
      stateTxt = c.triggered.state; subTxt = c.triggered.sub(camName(state.breachZone) || t.sensors.motion); cls = "is-alarm";
    } else if (state.phase === "entry") {
      stateTxt = c.entry.state; subTxt = c.entry.sub(state.countdown); cls = "is-pending";
    } else if (state.phase === "arming") {
      stateTxt = c.arming.state; subTxt = c.arming.sub(state.countdown); cls = "is-pending";
    } else {
      stateTxt = c[state.mode].state; subTxt = c[state.mode].sub; cls = isArmedMode(state.mode) ? "is-armed" : "is-disarmed";
    }
    refs.alarmState.textContent = stateTxt;
    refs.alarmSub.textContent = subTxt;
    refs.alarmCard.className = `ka-alarm ${cls}`;

    const armedLike = isArmedMode(state.mode) || state.phase === "arming" || state.phase === "entry" || state.phase === "triggered";
    refs.lock.classList.toggle("is-armed", armedLike);
    refs.lock.classList.toggle("is-alarm", state.phase === "triggered");
    refs.lockIc.innerHTML = armedLike ? SVG.lockClosed : SVG.lockOpen;
    refs.lock.setAttribute("aria-pressed", armedLike ? "true" : "false");
    refs.lock.setAttribute("aria-label", t.lockAria(armedLike));

    panel.classList.toggle("is-ka-alarm", state.phase === "triggered");
    panel.classList.toggle("is-ka-pending", state.phase === "arming" || state.phase === "entry");
  }

  /* ---------------- szybkie uzbrojenie ---------------- */
  const QUICK = ["armFull", "armGround", "night"];
  const MODE_TO_QUICK = { armed_away: "armFull", armed_home: "armGround", armed_night: "night" };
  function renderQuick() {
    if (refs.quickRow.dataset.ready !== "1") {
      refs.quickRow.dataset.ready = "1";
      refs.quickRow.innerHTML = QUICK.map((k) => `
        <button class="ka-quick" type="button" data-ka-quick="${k}">
          <span class="ka-quick-ic" aria-hidden="true">${MODE_ICON[k]}</span>
          <span class="ka-quick-label">${t.modes[k]}</span>
        </button>`).join("");
    }
    const act = state.phase === "arming" ? MODE_TO_QUICK[state.targetMode] : MODE_TO_QUICK[state.mode];
    $$("[data-ka-quick]", refs.quickRow).forEach((b) => {
      const active = b.dataset.kaQuick === act;
      b.classList.toggle("is-active", active);
      b.classList.toggle("is-disarm", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
      b.disabled = alarmActive() && !active;
      $(".ka-quick-ic", b).innerHTML = active ? SVG.unlock : MODE_ICON[b.dataset.kaQuick];
      $(".ka-quick-label", b).textContent = active ? t.modes.disarm : t.modes[b.dataset.kaQuick];
    });
  }

  /* ---------------- czujniki i strefy ---------------- */
  const SENSOR_IDS = ["doors", "motion", "system"];
  function sensorState(id) {
    const s = t.sensorState;
    if (id === "doors") return state.doorOpen ? { txt: s.doorsOpen, tone: "warn" } : { txt: s.doorsClosed, tone: "ok" };
    if (id === "motion") return state.interiorMotion ? { txt: s.motionSeen, tone: "warn" } : { txt: s.motionNone, tone: "ok" };
    return { txt: s.systemOnline, tone: "ok" };
  }
  function alarmActive() { return state.phase === "entry" || state.phase === "triggered"; }

  function renderSensors() {
    if (refs.sensorsGrid.dataset.ready !== "1") {
      refs.sensorsGrid.dataset.ready = "1";
      const chips = SENSOR_IDS.map((id) => `
        <button class="ka-sensor" type="button" data-ka-sensor="${id}" ${id === "system" ? "disabled" : ""}>
          <span class="ka-sensor-ic" aria-hidden="true">${SENSOR_ICON[id]}</span>
          <span class="ka-sensor-name">${t.sensors[id]}</span>
          <span class="ka-sensor-state" data-ka-ref="state"><i aria-hidden="true"></i><b></b></span>
        </button>`).join("");
      refs.sensorsGrid.innerHTML = chips + `
        <button class="ka-sensor ka-sensor--cancel" type="button" data-ka-cancel>
          <span class="ka-sensor-ic" aria-hidden="true">${SENSOR_ICON.cancel}</span>
          <span class="ka-sensor-name">${t.sensors.cancel}</span>
          <span class="ka-sensor-state" data-ka-ref="state"><i aria-hidden="true"></i><b></b></span>
        </button>`;
    }
    $$("[data-ka-sensor]", refs.sensorsGrid).forEach((el) => {
      const id = el.dataset.kaSensor;
      const st = sensorState(id);
      el.dataset.tone = st.tone;
      $("[data-ka-ref='state'] b", el).textContent = st.txt;
      el.title = t.sensorHint[id];
    });
    const cancelEl = $("[data-ka-cancel]", refs.sensorsGrid);
    if (cancelEl) {
      const on = alarmActive();
      cancelEl.disabled = !on;
      cancelEl.dataset.tone = on ? "alarm" : "idle";
      cancelEl.title = t.sensorHint.cancel;
      $("[data-ka-ref='state'] b", cancelEl).textContent = on ? t.sensorState.cancelReady : t.sensorState.cancelIdle;
    }
    renderZonesDetail();
  }
  function renderZonesDetail() {
    refs.zonesDetail.hidden = !state.zonesExpanded;
    refs.sensorsToggle.textContent = state.zonesExpanded ? t.sensorsHide : t.sensorsAll;
    refs.sensorsToggle.setAttribute("aria-expanded", state.zonesExpanded ? "true" : "false");
    if (!state.zonesExpanded) return;
    const rows = [];
    CAMERAS.forEach((c) => {
      const armed = c.kind === "perimeter" ? perimeterArmed(state.mode) : (state.mode === "armed_away");
      rows.push({ name: camName(c.id), armed });
    });
    rows.push({ name: t.sensors.motion, armed: interiorArmed(state.mode) });
    refs.zonesDetail.innerHTML = rows.map((r) => `
      <li class="ka-zone ${r.armed ? "is-armed" : "is-bypass"}">
        <span>${r.name}</span>
        <span class="ka-zone-tag">${r.armed ? t.zoneArmed : t.zoneBypass}</span>
      </li>`).join("");
  }

  /* ---------------- staly panel informacji ---------------- */
  function infoContent() {
    const zone = camName(state.breachZone) || t.sensors.motion;
    if (state.phase === "triggered") return { title: t.info.triggered.title, sub: t.info.triggered.sub(zone, state.settings.siren > 0), tone: "alarm", icon: SVG.bell };
    if (state.phase === "entry") return { title: t.info.entry.title(zone), sub: t.info.entry.sub(state.countdown), tone: "pending", icon: SVG.motion };
    if (state.phase === "arming") return { title: t.info.arming[state.targetMode], sub: t.info.arming.sub(state.countdown), tone: "pending", icon: SVG.shield };
    if (state.notice) {
      const tone = state.notice === "armBlocked" || state.notice === "armFirst" || state.notice === "sirenMuted" ? "warn" : (state.notice === "canceled" ? "armed" : "info");
      const icon = state.notice === "settings" ? SVG.gear : (state.notice === "canceled" ? SVG.bellOff : (state.notice === "sirenMuted" ? SVG.bellOff : SVG.shield));
      return { ...t.notices[state.notice], tone, icon };
    }
    const normal = t.info[state.mode];
    return { ...normal, tone: isArmedMode(state.mode) ? "armed" : "ok", icon: isArmedMode(state.mode) ? SVG.lockClosed : SVG.shield };
  }

  function renderInfo() {
    if (refs.infoBar.dataset.ready !== "1") {
      refs.infoBar.dataset.ready = "1";
      refs.infoBar.innerHTML = `
        <span class="ka-info-ic" data-ka-ref="icon" aria-hidden="true"></span>
        <span class="ka-info-body">
          <b data-ka-ref="title"></b>
          <small data-ka-ref="sub"></small>
        </span>
        <button class="ka-info-settings" type="button" data-ka-settings-open>
          <span aria-hidden="true">${SVG.gear}</span>
          <span>${t.modes.settings}</span>
        </button>`;
    }
    const content = infoContent();
    refs.infoBar.dataset.tone = content.tone;
    $("[data-ka-ref='icon']", refs.infoBar).innerHTML = content.icon;
    $("[data-ka-ref='title']", refs.infoBar).textContent = content.title;
    $("[data-ka-ref='sub']", refs.infoBar).textContent = content.sub;
  }

  /* ---------------- ustawienia ---------------- */
  let settingsDirty = false;
  function renderSettingsBody() {
    const s = state.settings;
    refs.settingsBody.innerHTML = `
      <label class="ka-set-row">
        <span class="ka-set-label">${t.setExit}</span>
        <span class="ka-set-control">
          <input type="range" class="ka-range" data-ka-set="exit" min="${EXIT_MIN}" max="${EXIT_MAX}" step="5" value="${s.exit}" aria-label="${t.setExit}">
          <b data-ka-set-val="exit">${s.exit} ${t.seconds}</b>
        </span>
      </label>
      <label class="ka-set-row">
        <span class="ka-set-label">${t.setEntry}</span>
        <span class="ka-set-control">
          <input type="range" class="ka-range" data-ka-set="entry" min="${ENTRY_MIN}" max="${ENTRY_MAX}" step="5" value="${s.entry}" aria-label="${t.setEntry}">
          <b data-ka-set-val="entry">${s.entry} ${t.seconds}</b>
        </span>
      </label>
      <label class="ka-set-row">
        <span class="ka-set-label">${t.setSiren}</span>
        <span class="ka-set-control">
          <input type="range" class="ka-range" data-ka-set="siren" min="0" max="100" step="5" value="${s.siren}" aria-label="${t.setSiren}">
          <b data-ka-set-val="siren">${s.siren}%</b>
        </span>
      </label>
      <button class="ka-siren-test" type="button" data-ka-siren-test ${state.phase === "triggered" ? "disabled" : ""}>
        <span aria-hidden="true">${SVG.bell}</span>
        <span data-ka-siren-test-label>${state.phase === "triggered" ? t.sirenActive : t.testSiren}</span>
      </button>
      <button class="ka-set-toggle ${s.presence ? "is-on" : ""}" type="button" data-ka-set="presence" aria-pressed="${s.presence ? "true" : "false"}">
        <span class="ka-set-toggle-body"><b>${t.setPresence}</b><small>${t.setPresenceNote}</small></span>
        <span class="ka-set-toggle-track" aria-hidden="true"><span class="ka-set-toggle-knob"></span></span>
      </button>`;
    $$("[data-ka-set]", refs.settingsBody).forEach((el) => {
      if (el.tagName === "INPUT") {
        el.style.setProperty("--ka-fill", `${((el.value - el.min) / (el.max - el.min)) * 100}%`);
      }
    });
  }
  function openSettings() {
    settingsDirty = false;
    renderSettingsBody();
    refs.settings.hidden = false;
    requestAnimationFrame(() => refs.settings.classList.add("is-shown"));
  }
  function closeSettings() {
    refs.settings.classList.remove("is-shown");
    setTimeout(() => { refs.settings.hidden = true; }, 200);
    if (settingsDirty) showInfoNotice("settings");
    settingsDirty = false;
  }

  /* ---------------- render zbiorczy ---------------- */
  function renderAll() {
    renderCams();
    renderOverall();
    renderAlarm();
    renderQuick();
    renderSensors();
    renderInfo();
  }

  /* ---------------- logika alarmu ---------------- */
  let countdownTimer = null;
  let noticeTimer = null;
  let audioContext = null;
  let sirenNodes = null;
  let sirenTestTimer = null;

  function ensureAudioContext() {
    if (!audioContext) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return null;
      audioContext = new AudioContextCtor();
    }
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  }

  function sirenGain(testing) {
    return (state.settings.siren / 100) * (testing ? 0.1 : 0.18);
  }

  function setSirenVolume() {
    if (!sirenNodes || !audioContext) return;
    sirenNodes.master.gain.setTargetAtTime(sirenGain(sirenNodes.testing), audioContext.currentTime, 0.025);
  }

  function stopSiren() {
    clearTimeout(sirenTestTimer);
    sirenTestTimer = null;
    if (!sirenNodes || !audioContext) return;
    const nodes = sirenNodes;
    sirenNodes = null;
    const now = audioContext.currentTime;
    nodes.master.gain.cancelScheduledValues(now);
    nodes.master.gain.setTargetAtTime(0, now, 0.035);
    setTimeout(() => {
      [nodes.toneA, nodes.toneB, nodes.sweep].forEach((node) => {
        try { node.stop(); } catch (_) { /* węzeł mógł już zostać zatrzymany */ }
      });
      try { nodes.master.disconnect(); } catch (_) { /* bezpieczne sprzątanie */ }
    }, 180);
    const testButton = refs.settingsBody && $("[data-ka-siren-test]", refs.settingsBody);
    if (testButton) {
      testButton.disabled = false;
      const label = $("[data-ka-siren-test-label]", testButton);
      if (label) label.textContent = t.testSiren;
    }
  }

  function startSiren({ testing = false } = {}) {
    if (state.settings.siren <= 0) return false;
    const ctx = ensureAudioContext();
    if (!ctx) return false;
    stopSiren();

    const master = ctx.createGain();
    const toneA = ctx.createOscillator();
    const toneB = ctx.createOscillator();
    const sweep = ctx.createOscillator();
    const sweepDepth = ctx.createGain();
    const toneAGain = ctx.createGain();
    const toneBGain = ctx.createGain();
    const now = ctx.currentTime;

    toneA.type = "sawtooth";
    toneB.type = "triangle";
    toneA.frequency.value = 690;
    toneB.frequency.value = 920;
    toneAGain.gain.value = 0.58;
    toneBGain.gain.value = 0.42;
    sweep.type = "sine";
    sweep.frequency.value = 0.62;
    sweepDepth.gain.value = 190;

    sweep.connect(sweepDepth);
    sweepDepth.connect(toneA.frequency);
    sweepDepth.connect(toneB.frequency);
    toneA.connect(toneAGain).connect(master);
    toneB.connect(toneBGain).connect(master);
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(sirenGain(testing), now + 0.08);
    [toneA, toneB, sweep].forEach((node) => node.start(now));
    sirenNodes = { master, toneA, toneB, sweep, testing };
    return true;
  }

  function testSiren() {
    if (state.phase === "triggered") return;
    if (!startSiren({ testing: true })) {
      closeSettings();
      showInfoNotice("sirenMuted");
      return;
    }
    const testButton = $("[data-ka-siren-test]", refs.settingsBody);
    if (testButton) {
      testButton.disabled = true;
      $("[data-ka-siren-test-label]", testButton).textContent = t.testingSiren;
    }
    sirenTestTimer = setTimeout(stopSiren, 2000);
  }

  function clearInfoNotice() {
    clearTimeout(noticeTimer);
    noticeTimer = null;
    state.notice = null;
  }

  function showInfoNotice(key) {
    clearInfoNotice();
    state.notice = key;
    renderInfo();
    noticeTimer = setTimeout(() => {
      state.notice = null;
      noticeTimer = null;
      renderInfo();
    }, 4500);
  }

  function anyArmedPerimeterOpen(mode) {
    return state.doorOpen && perimeterArmed(mode);
  }

  function startArming(targetMode) {
    if (anyArmedPerimeterOpen(targetMode)) {
      showInfoNotice("armBlocked");
      return;
    }
    clearAllTimers();
    clearInfoNotice();
    state.phase = "arming";
    state.targetMode = targetMode;
    state.countdown = state.settings.exit;
    const label = t.modeEvent[targetMode];
    pushEvent(t.ev.arming(label), "info");
    renderAll();
    countdownTimer = setInterval(() => {
      state.countdown -= 1;
      if (state.countdown <= 0) {
        finishArming();
      } else {
        renderAlarm();
        renderOverall();
        renderInfo();
      }
    }, 1000);
  }

  function finishArming() {
    clearInterval(countdownTimer); countdownTimer = null;
    state.mode = state.targetMode;
    state.phase = "idle";
    state.targetMode = null;
    // czyszczenie ambientowego ruchu przy uzbrajaniu
    Object.keys(state.cams).forEach((id) => { state.cams[id].motion = false; });
    state.interiorMotion = false;
    pushEvent(t.ev.armed(t.modeEvent[state.mode]), "armed");
    renderAll();
  }

  function directArm(targetMode) {
    // zmiana trybu miedzy uzbrojonymi bez odliczania
    if (isArmedMode(state.mode) && state.phase === "idle") {
      if (anyArmedPerimeterOpen(targetMode)) { showInfoNotice("armBlocked"); return; }
      state.mode = targetMode;
      pushEvent(t.ev.armed(t.modeEvent[targetMode]), "armed");
      renderAll();
      return;
    }
    startArming(targetMode);
  }

  function disarm(reason) {
    const wasAlarm = state.phase === "triggered";
    stopSiren();
    clearAllTimers();
    clearInfoNotice();
    state.mode = "disarmed";
    state.phase = "idle";
    state.targetMode = null;
    state.breachZone = null;
    state.interiorMotion = false;
    Object.keys(state.cams).forEach((id) => { state.cams[id].motion = false; });
    pushEvent(wasAlarm ? t.ev.cleared : t.ev.disarmed, "ok");
    renderAll();
  }

  function triggerBreach(zoneId) {
    if (state.phase === "triggered") return;
    ensureAudioContext();
    clearInterval(countdownTimer); countdownTimer = null;
    state.phase = "entry";
    state.breachZone = zoneId;
    state.countdown = state.settings.entry;
    pushEvent(t.ev.entry(camName(zoneId) || t.sensors.motion), "warn");
    renderAll();
    countdownTimer = setInterval(() => {
      state.countdown -= 1;
      if (state.countdown <= 0) {
        clearInterval(countdownTimer); countdownTimer = null;
        state.phase = "triggered";
        startSiren();
        pushEvent(t.ev.alarm(camName(zoneId) || t.sensors.motion), "alarm");
        renderAll();
      } else {
        renderAlarm();
        renderOverall();
        renderInfo();
      }
    }, 1000);
  }

  function cancelAlarm() {
    if (!alarmActive()) return;
    stopSiren();
    clearInterval(countdownTimer); countdownTimer = null;
    state.phase = "idle";
    state.breachZone = null;
    Object.keys(state.cams).forEach((id) => { state.cams[id].motion = false; });
    pushEvent(t.ev.canceled, "armed");
    renderAll();
    showInfoNotice("canceled");
  }

  function clearAllTimers() {
    clearInterval(countdownTimer); countdownTimer = null;
    Object.values(camClearTimers).forEach(clearTimeout);
    camClearTimers = {};
  }

  /* zdarzenie ruchu na strefie: decyduje czy to alarm, czas na wejscie czy log */
  function zoneMotionEvent(zoneId, kind) {
    const armed = isArmedMode(state.mode);
    const zoneArmedNow = kind === "perimeter" ? perimeterArmed(state.mode) : interiorArmed(state.mode);
    if (state.phase === "arming") {
      // ruch w czasie na wyjscie jest ignorowany (wychodzisz)
      pushEvent(t.ev.motion(camName(zoneId)), "info");
      return;
    }
    if (armed && zoneArmedNow && state.phase === "idle") {
      triggerBreach(zoneId);
    } else if (armed && state.phase === "entry") {
      // kolejny czujnik w trakcie wejscia, bez zmiany
      pushEvent(t.ev.motion(camName(zoneId)), "warn");
    } else {
      pushEvent(t.ev.motion(camName(zoneId)), armed ? "info" : "info");
    }
  }

  /* ---------------- interakcje ---------------- */
  refs.lock.addEventListener("click", () => {
    const armedLike = isArmedMode(state.mode) || state.phase !== "idle";
    if (armedLike) disarm("lock");
    else directArm("armed_away");
  });

  refs.quickRow.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ka-quick]");
    if (!b || b.disabled) return;
    const map = { armFull: "armed_away", armGround: "armed_home", night: "armed_night" };
    const targetMode = map[b.dataset.kaQuick];
    const selectedMode = state.phase === "arming" ? state.targetMode : state.mode;
    if (selectedMode === targetMode) disarm("quick-toggle");
    else directArm(targetMode);
  });

  refs.infoBar.addEventListener("click", (e) => {
    if (e.target.closest("[data-ka-settings-open]")) openSettings();
  });

  refs.sensorsGrid.addEventListener("click", (e) => {
    if (e.target.closest("[data-ka-cancel]")) { cancelAlarm(); return; }
    const b = e.target.closest("[data-ka-sensor]");
    if (!b || b.disabled) return;
    const id = b.dataset.kaSensor;
    if (id === "doors") {
      state.doorOpen = !state.doorOpen;
      pushEvent(state.doorOpen ? t.ev.doorOpen : t.ev.doorClose, state.doorOpen ? "warn" : "ok");
      if (state.doorOpen) {
        setCamMotion("entrance", true, { autoClear: 9000 });
        zoneMotionEvent("entrance", "perimeter");
      }
    } else if (id === "motion") {
      state.interiorMotion = !state.interiorMotion;
      if (state.interiorMotion) {
        pushEvent(t.ev.motion(t.sensors.motion), "warn");
        zoneMotionEvent("motion", "interior");
        setTimeout(() => { state.interiorMotion = false; renderSensors(); }, 8000);
      }
    }
    renderSensors();
    renderAlarm();
    renderOverall();
  });

  refs.sensorsToggle.addEventListener("click", () => {
    state.zonesExpanded = !state.zonesExpanded;
    renderZonesDetail();
  });

  refs.eventsToggle.addEventListener("click", () => {
    state.eventsExpanded = !state.eventsExpanded;
    renderEvents();
  });

  /* kolejnosc podgladu przy kolejnych kliknieciach: brama, wejscie, taras, garaz */
  const SIM_ORDER = ["gate", "entrance", "terrace", "garage"];
  let simCooldown = false;
  refs.simBtn.addEventListener("click", () => {
    if (state.phase === "arming") {
      return;
    }
    if (!isArmedMode(state.mode)) {
      showInfoNotice("armFirst");
      return;
    }
    if (simCooldown) return;
    simCooldown = true;
    refs.simBtn.classList.add("is-firing");
    setTimeout(() => { simCooldown = false; refs.simBtn.classList.remove("is-firing"); }, 700);

    const targetId = SIM_ORDER[state.simIdx % SIM_ORDER.length];
    state.simIdx += 1;
    const kind = CAM_BY_ID[targetId].kind === "motion" ? "motion" : "perimeter";
    const armedNow = isArmedMode(state.mode) && state.phase === "idle";

    setCamMotion(targetId, true, armedNow || state.phase === "entry" || state.phase === "triggered" ? {} : { autoClear: 9000 });
    if (armedNow || state.phase === "entry") {
      zoneMotionEvent(targetId, kind);
    } else {
      pushEvent(t.ev.motion(camName(targetId)), state.phase === "triggered" ? "warn" : "info");
    }
  });

  refs.camsGrid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ka-cam-expand]");
    if (b) openLightbox(b.dataset.kaCamExpand);
  });
  $("[data-ka='lightboxClose']").addEventListener("click", closeLightbox);
  refs.lightbox.addEventListener("click", (e) => {
    if (e.target === refs.lightbox || e.target.classList.contains("ka-lightbox-backdrop")) closeLightbox();
  });

  $("[data-ka='settingsClose']").addEventListener("click", closeSettings);
  refs.settingsBody.addEventListener("input", (e) => {
    const el = e.target.closest("[data-ka-set]");
    if (!el || el.tagName !== "INPUT") return;
    const key = el.dataset.kaSet;
    state.settings[key] = Number(el.value);
    if (key === "siren") {
      saveSirenVolume(state.settings.siren);
      setSirenVolume();
    }
    settingsDirty = true;
    el.style.setProperty("--ka-fill", `${((el.value - el.min) / (el.max - el.min)) * 100}%`);
    const out = $(`[data-ka-set-val='${key}']`, refs.settingsBody);
    if (out) out.textContent = key === "siren" ? `${el.value}%` : `${el.value} ${t.seconds}`;
  });
  refs.settingsBody.addEventListener("click", (e) => {
    if (e.target.closest("[data-ka-siren-test]")) { testSiren(); return; }
    const b = e.target.closest("[data-ka-set='presence']");
    if (!b) return;
    state.settings.presence = !state.settings.presence;
    settingsDirty = true;
    b.classList.toggle("is-on", state.settings.presence);
    b.setAttribute("aria-pressed", state.settings.presence ? "true" : "false");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (state.lightbox) closeLightbox();
    else if (!refs.settings.hidden) closeSettings();
    else if (stage.classList.contains("is-ka-pseudo-fs")) exitFs();
  });
  window.addEventListener("pagehide", stopSiren);

  /* ---------------- pelny ekran ---------------- */
  const fsButtons = $$("[data-ka-fs]");
  const canNativeFs = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
  const FS_MARGIN = 26, FS_MIN_W = 900;

  function isFs() {
    return document.fullscreenElement === stage ||
      document.webkitFullscreenElement === stage ||
      stage.classList.contains("is-ka-pseudo-fs");
  }
  function fitFullscreen() {
    if (!isFs() || window.innerWidth < FS_MIN_W) { panel.style.removeProperty("--ka-fs-scale"); return; }
    panel.style.removeProperty("--ka-fs-scale");
    const s = Math.min(
      (window.innerWidth - FS_MARGIN * 2) / (panel.offsetWidth || 1),
      (window.innerHeight - FS_MARGIN * 2) / (panel.offsetHeight || 1),
      2.2
    );
    panel.style.setProperty("--ka-fs-scale", (s > 0 ? s : 1).toFixed(3));
  }
  function syncFsUi() {
    const on = isFs();
    document.body.classList.toggle("is-ka-fullscreen", on);
    stage.classList.toggle("is-ka-fullscreen", on);
    fsButtons.forEach((b) => {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      const l = b.querySelector(".ka-fs-label");
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
  function pseudoFs() { stage.classList.add("is-ka-pseudo-fs"); syncFsUi(); }
  function enterFs() {
    if (!canNativeFs) { pseudoFs(); return; }
    try {
      const req = (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      if (req && typeof req.catch === "function") req.catch(pseudoFs);
    } catch (err) { pseudoFs(); }
  }
  function exitFs() {
    if (stage.classList.contains("is-ka-pseudo-fs")) { stage.classList.remove("is-ka-pseudo-fs"); syncFsUi(); return; }
    (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
  }
  fsButtons.forEach((b) => b.addEventListener("click", () => (isFs() ? exitFs() : enterFs())));
  document.addEventListener("fullscreenchange", syncFsUi);
  document.addEventListener("webkitfullscreenchange", syncFsUi);

  /* ---------------- symulacja ambientowa ---------------- */
  let presenceIdx = 0;
  function simTick() {
    state.weatherOut = clamp(state.weatherOut + (Math.random() - 0.5) * 0.2, 11, 19);
    if (refs.weatherOut) refs.weatherOut.textContent = fmtCr(state.weatherOut);

    // spokojne zycie posesji tylko gdy rozbrojony: rzadki ruch na tarasie/garazu
    if (state.mode === "disarmed" && state.phase === "idle" && Math.random() < 0.16) {
      const id = Math.random() < 0.6 ? "terrace" : "garage";
      if (!state.cams[id].motion) {
        setCamMotion(id, true, { autoClear: 6000 });
        pushEvent(t.ev.motion(camName(id)), "info");
      }
    }

    // symulacja obecnosci gdy uzbrojony na wyjscie
    if (state.settings.presence && state.mode === "armed_away" && state.phase === "idle" && Math.random() < 0.22) {
      const room = t.presenceRooms[presenceIdx % t.presenceRooms.length];
      presenceIdx += 1;
      pushEvent(t.ev.presence(room), "info");
    }
  }

  /* ---------------- start ---------------- */
  const heroBg = $("[data-ka='heroBg']");
  if (heroBg) heroBg.style.backgroundImage = `url("${BASE}header.webp")`;

  renderAll();
  renderEvents();
  tickClock();
  setInterval(tickClock, 20000);
  if (refs.weatherOut) refs.weatherOut.textContent = fmtCr(state.weatherOut);
  pushEvent(t.ev.ready, "ok");
  syncFsUi();
  if (!prefersReduced) setInterval(simTick, 3600);
})();
