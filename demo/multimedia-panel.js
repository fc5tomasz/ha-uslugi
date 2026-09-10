/* Panel premium "Studio i multimedia": /pl/projekty/multimedia/
   (w przygotowaniu: /dk/projekter/..., /en/projects/...).
   Salon.webp jest glowna scena. 6 trybow jednym dotknieciem ustawia caly
   zestaw (urzadzenia, zrodlo, glosnosc, temperatura sceny, ekran) z krotka
   sekwencja uruchamiania. Osobne rendery i boczny panel sluza do sterowania
   pojedynczym urzadzeniem. Nic nie jest polaczone z Home Assistant.
   PL na start; DK/EN pozniej. */
(() => {
  const stage = document.getElementById("mmStage");
  const panel = document.getElementById("mmPanel");
  if (!stage || !panel) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqMobile = window.matchMedia("(max-width: 720px)");

  const normLang = (v) => {
    const s = (v || "").toLowerCase();
    if (s === "dk" || s.startsWith("dk-") || s === "da" || s.startsWith("da-")) return "dk";
    if (s === "en" || s.startsWith("en-")) return "en";
    return "pl";
  };
  const LANG = normLang(document.body.dataset.demoLang || document.documentElement.getAttribute("lang"));

  const T = {
    pl: {
      dateLocale: "pl-PL",
      fsOpen: "Pełny ekran", fsClose: "Zamknij pełny ekran",
      sysReady: "System gotowy", sysBusy: "Uruchamianie sceny…",
      actName: { tv: "Oglądanie TV", kino: "Kino domowe", muzyka: "Muzyka", gaming: "Gaming", radio: "Radio internetowe", nocny: "Tryb nocny" },
      dayName: "Tryb dzienny",
      nightLog: "Tryb nocny: przyciemnione, ciepłe światło jak w kinie domowym.",
      dayLog: "Tryb dzienny: pełne, jasne światło w salonie.",
      nightToast: "Tryb nocny włączony.",
      dayToast: "Tryb dzienny włączony.",
      actLog: {
        tv: "Tryb Oglądanie TV: telewizor na wejściu TV, amplituner na TV Audio, głośność 35%.",
        kino: "Tryb Kino domowe: film, amplituner z głośnikiem centralnym i subwooferem, tryb dźwięku Film, głośność 48%.",
        muzyka: "Tryb Muzyka: amplituner i kolumny, streaming ze Spotify, equalizer na ekranie.",
        gaming: "Tryb Gaming: konsola włączona, telewizor na HDMI 2 w trybie gry, chłodniejszy akcent.",
        radio: "Tryb Radio internetowe: amplituner i kolumny, ostatnia stacja na żywo.",
        nocny: "Tryb nocny: telewizor pokazuje zegar, subwoofer wyłączony, głośność ograniczona do 25%.",
      },
      actToast: {
        tv: "Scena Oglądanie TV uruchomiona.",
        kino: "Scena Kino domowe uruchomiona.",
        muzyka: "Scena Muzyka uruchomiona.",
        gaming: "Scena Gaming uruchomiona.",
        radio: "Scena Radio internetowe uruchomiona.",
        nocny: "Scena Tryb nocny uruchomiona.",
      },
      runSteps: (src) => ["Telewizor", "Amplituner", "Źródło: " + src, "Oświetlenie", "Gotowe"],
      statusItems: ["TV połączony", "Amplituner online", "Sieć OK", "System gotowy"],
      devName: {
        tv: "Telewizor", amplituner: "Amplituner", kolumny: "Kolumny", "glosnik-centralny": "Głośnik centralny",
        subwoofer: "Subwoofer", playstation: "Konsola do gier", appletv: "Apple TV", gramofon: "Gramofon",
      },
      devKicker: {
        tv: "Obraz", amplituner: "Dźwięk", kolumny: "Dźwięk", "glosnik-centralny": "Dźwięk",
        subwoofer: "Dźwięk", playstation: "Rozrywka", appletv: "Źródło", gramofon: "Źródło",
      },
      on: "Włączony", off: "Wyłączony", active: "Aktywny", standby: "Czuwanie",
      devLog: (n, s) => `${n}: ${s.toLowerCase()}.`,
      srcName: { spotify: "Spotify", tidal: "TIDAL", appletv: "Apple TV", phono: "Gramofon (Phono)", hdmi1: "HDMI 1", hdmi2: "HDMI 2", radio: "Radio internetowe", tvaudio: "TV Audio", bt: "Bluetooth" },
      srcMono: { spotify: "S", tidal: "T", appletv: "", phono: "◉", hdmi1: "H1", hdmi2: "H2", radio: "R", tvaudio: "TV", bt: "B" },
      srcLog: (n) => `Źródło dźwięku: ${n}.`,
      srcNote: {
        spotify: "Streaming ze Spotify. Sterowanie działa w tym panelu, nic nie odtwarza się naprawdę.",
        tidal: "Streaming z TIDAL. Sterowanie działa w tym panelu, nic nie odtwarza się naprawdę.",
        appletv: "Sygnał z odtwarzacza streamingowego przez HDMI. Sterowanie pilotem urządzenia.",
        phono: "Gra płyta winylowa z gramofonu. Ramię opuszczone, talerz się kręci.",
        radio: "Radio internetowe na żywo. W trybie demonstracyjnym stacja nie jest naprawdę odtwarzana.",
        hdmi1: "Dźwięk z wejścia HDMI 1. Sterowanie pilotem podłączonego urządzenia.",
        hdmi2: "Dźwięk z wejścia HDMI 2, na przykład konsoli. Sterowanie pilotem urządzenia.",
        tvaudio: "Dźwięk z telewizora. Odtwarzaniem steruje aplikacja na telewizorze.",
        bt: "Dźwięk z telefonu przez Bluetooth. Sterowanie z telefonu, tutaj tylko podgląd.",
      },
      tracks: [
        { t: "Dreamer", a: "Alan Walker", al: "Walkerworld", len: 192 },
        { t: "Faded", a: "Alan Walker", al: "Different World", len: 212 },
        { t: "Blinding Lights", a: "The Weeknd", al: "After Hours", len: 200 },
        { t: "Levitating", a: "Dua Lipa", al: "Future Nostalgia", len: 203 },
      ],
      vinylTrack: "Strona A", vinylArtist: "Płyta winylowa",
      hdmiTrack: "Telewizor", hdmiArtist: "Wejście HDMI",
      btTrack: "Telefon", btArtist: "Bluetooth",
      atvTrack: "Apple TV", atvArtist: "Aplikacja / film",
      stationName: { rmf: "RMF FM", zet: "Radio ZET", eska: "ESKA", trojka: "Trójka", chillizet: "Chillizet" },
      stationNow: { rmf: "RMF FM · Najlepsza muzyka", zet: "Radio ZET · Gramy dalej", eska: "ESKA · Hity na czasie", trojka: "Trójka · Lista przebojów", chillizet: "Chillizet · Wieczorny chillout" },
      stationColor: { rmf: "#f6c500", zet: "#e2001a", eska: "#1f3fb0", trojka: "#d81e5b", chillizet: "#7c3aed" },
      stationLog: (n) => `Stacja radiowa: ${n}.`,
      volLog: (v) => `Głośność: ${v}%.`,
      volCapToast: "Tryb nocny ogranicza głośność do 25%.",
      muteOn: "Wyciszono dźwięk.", muteOff: "Dźwięk włączony.",
      playLog: (p) => p ? "Odtwarzanie wznowione." : "Odtwarzanie wstrzymane.",
      nextLog: (x) => `Następny utwór: ${x}.`, prevLog: (x) => `Poprzedni utwór: ${x}.`,
      shuffleLog: (o) => o ? "Odtwarzanie losowe włączone." : "Odtwarzanie losowe wyłączone.",
      repeatLog: (o) => o ? "Powtarzanie włączone." : "Powtarzanie wyłączone.",
      heartLog: (o) => o ? "Utwór dodany do ulubionych." : "Utwór usunięty z ulubionych.",
      streamOff: "Przy tym źródle odtwarzaniem sterujesz na urządzeniu.",
      needAmp: "Włącz amplituner, żeby sterować dźwiękiem.",
      dpZasilanie: "Zasilanie", dpZrodlo: "Źródło", dpGlosnosc: "Głośność", dpWyciszenie: "Wyciszenie",
      dpTrybDzwieku: "Tryb dźwięku", dpWejscie: "Wejście", dpTrybObrazu: "Tryb obrazu", dpJasnosc: "Jasność",
      dpPoziomBasu: "Poziom basu", dpDialogi: "Wzmocnienie dialogów",
      dpSetSource: "Ustaw jako źródło dźwięku", dpRunGaming: "Uruchom tryb Gaming", dpPhono: "Wybierz wejście Phono",
      dpKolumnyNote: "Para kolumn podłogowych, kanał lewy i prawy.",
      dpCenterNote: "Kanał centralny, odpowiada za dialogi w filmach.",
      soundModes: ["Standard", "Film", "Muzyka", "Gra"],
      picModes: ["Standard", "Film", "Żywy", "Gra"],
      tvInputs: { hdmi1: "HDMI 1", hdmi2: "HDMI 2", appletv: "Apple TV" },
      startLog: "Panel uruchomiony. Scena Muzyka aktywna.",
      tagByScreen: { tv: "Telewizja", film: "Odtwarzacz · Film", music: "Spotify · Odtwarzanie", gaming: "Konsola · HDMI 2", radio: "Radio · Na żywo", night: "Czuwanie", off: "Wyłączony" },
      seedLog: [
        { kind: "device", text: "Amplituner: włączony." },
        { kind: "source", text: "Źródło dźwięku: Spotify." },
        { kind: "pic", text: "Jasność telewizora: 70%." },
      ],
    },
    en: {
      dateLocale: "en-GB",
      fsOpen: "Fullscreen", fsClose: "Exit fullscreen",
      sysReady: "System ready", sysBusy: "Starting scene…",
      actName: { tv: "Watch TV", kino: "Home cinema", muzyka: "Music", gaming: "Gaming", radio: "Internet radio", nocny: "Night mode" },
      dayName: "Day mode",
      nightLog: "Night mode: dimmed, warm light like a home cinema.",
      dayLog: "Day mode: full, bright light in the living room.",
      nightToast: "Night mode on.",
      dayToast: "Day mode on.",
      actLog: {
        tv: "Watch TV mode: television on the TV input, receiver on TV Audio, volume 35%.",
        kino: "Home cinema mode: film, receiver with centre speaker and subwoofer, Film sound mode, volume 48%.",
        muzyka: "Music mode: receiver and speakers, streaming from Spotify.",
        gaming: "Gaming mode: console on, television on HDMI 2 in game mode, cooler accent.",
        radio: "Internet radio mode: receiver and speakers, last station live.",
        nocny: "Night mode: subwoofer off, volume limited to 25%.",
      },
      actToast: {
        tv: "Watch TV scene started.",
        kino: "Home cinema scene started.",
        muzyka: "Music scene started.",
        gaming: "Gaming scene started.",
        radio: "Internet radio scene started.",
        nocny: "Night mode scene started.",
      },
      runSteps: (src) => ["Television", "Receiver", "Source: " + src, "Lighting", "Done"],
      statusItems: ["TV connected", "Receiver online", "Network OK", "System ready"],
      devName: {
        tv: "Television", amplituner: "Receiver", kolumny: "Speakers", "glosnik-centralny": "Centre speaker",
        subwoofer: "Subwoofer", playstation: "Games console", appletv: "Apple TV", gramofon: "Turntable",
      },
      devKicker: {
        tv: "Picture", amplituner: "Sound", kolumny: "Sound", "glosnik-centralny": "Sound",
        subwoofer: "Sound", playstation: "Entertainment", appletv: "Source", gramofon: "Source",
      },
      on: "On", off: "Off", active: "Active", standby: "Standby",
      devLog: (n, s) => `${n}: ${s.toLowerCase()}.`,
      srcName: { spotify: "Spotify", tidal: "TIDAL", appletv: "Apple TV", phono: "Turntable (Phono)", hdmi1: "HDMI 1", hdmi2: "HDMI 2", radio: "Internet radio", tvaudio: "TV Audio", bt: "Bluetooth" },
      srcMono: { spotify: "S", tidal: "T", appletv: "", phono: "◉", hdmi1: "H1", hdmi2: "H2", radio: "R", tvaudio: "TV", bt: "B" },
      srcLog: (n) => `Audio source: ${n}.`,
      srcNote: {
        spotify: "Streaming from Spotify. The controls work in this panel, nothing actually plays.",
        tidal: "Streaming from TIDAL. The controls work in this panel, nothing actually plays.",
        appletv: "Signal from a streaming player over HDMI, controlled with the device remote.",
        phono: "A vinyl record is playing on the turntable. The arm is down and the platter is spinning.",
        radio: "Internet radio, live. In demonstration mode the station is not actually playing.",
        hdmi1: "Sound from the HDMI 1 input, controlled with the remote of the connected device.",
        hdmi2: "Sound from the HDMI 2 input, for example a console, controlled with the device remote.",
        tvaudio: "Sound from the television. Playback is controlled by the app on the TV.",
        bt: "Sound from a phone over Bluetooth. Controlled from the phone; this is only a preview.",
      },
      tracks: [
        { t: "Dreamer", a: "Alan Walker", al: "Walkerworld", len: 192 },
        { t: "Faded", a: "Alan Walker", al: "Different World", len: 212 },
        { t: "Blinding Lights", a: "The Weeknd", al: "After Hours", len: 200 },
        { t: "Levitating", a: "Dua Lipa", al: "Future Nostalgia", len: 203 },
      ],
      vinylTrack: "Side A", vinylArtist: "Vinyl record",
      hdmiTrack: "Television", hdmiArtist: "HDMI input",
      btTrack: "Phone", btArtist: "Bluetooth",
      atvTrack: "Apple TV", atvArtist: "App or film",
      stationName: { rmf: "Radio Nova", zet: "Hit Radio", eska: "Kiss FM", trojka: "Jazz Lounge", chillizet: "Chillout FM" },
      stationNow: { rmf: "Radio Nova · The best music", zet: "Hit Radio · Today's hits", eska: "Kiss FM · Nonstop pop", trojka: "Jazz Lounge · Evening jazz", chillizet: "Chillout FM · Easy evening chillout" },
      stationColor: { rmf: "#f6c500", zet: "#e2001a", eska: "#1f3fb0", trojka: "#d81e5b", chillizet: "#7c3aed" },
      stationLog: (n) => `Radio station: ${n}.`,
      volLog: (v) => `Volume: ${v}%.`,
      volCapToast: "Night mode limits the volume to 25%.",
      muteOn: "Sound muted.", muteOff: "Sound on.",
      playLog: (p) => p ? "Playback resumed." : "Playback paused.",
      nextLog: (x) => `Next track: ${x}.`, prevLog: (x) => `Previous track: ${x}.`,
      shuffleLog: (o) => o ? "Shuffle on." : "Shuffle off.",
      repeatLog: (o) => o ? "Repeat on." : "Repeat off.",
      heartLog: (o) => o ? "Track added to favourites." : "Track removed from favourites.",
      streamOff: "With this source, playback is controlled on the device.",
      needAmp: "Turn on the receiver to control the sound.",
      dpZasilanie: "Power", dpZrodlo: "Source", dpGlosnosc: "Volume", dpWyciszenie: "Mute",
      dpTrybDzwieku: "Sound mode", dpWejscie: "Input", dpTrybObrazu: "Picture mode", dpJasnosc: "Brightness",
      dpPoziomBasu: "Bass level", dpDialogi: "Dialogue boost",
      dpSetSource: "Set as audio source", dpRunGaming: "Start Gaming mode", dpPhono: "Select the Phono input",
      dpKolumnyNote: "A pair of floor-standing speakers, left and right channel.",
      dpCenterNote: "Centre channel, responsible for dialogue in films.",
      soundModes: ["Standard", "Film", "Music", "Game"],
      picModes: ["Standard", "Film", "Vivid", "Game"],
      tvInputs: { hdmi1: "HDMI 1", hdmi2: "HDMI 2", appletv: "Apple TV" },
      startLog: "Panel started. Music scene active.",
      tagByScreen: { tv: "Television", film: "Player · Film", music: "Spotify · Playing", gaming: "Console · HDMI 2", radio: "Radio · Live", night: "Standby", off: "Off" },
      seedLog: [
        { kind: "device", text: "Receiver: on." },
        { kind: "source", text: "Audio source: Spotify." },
        { kind: "pic", text: "TV brightness: 70%." },
      ],
    },
    dk: {
      dateLocale: "da-DK",
      fsOpen: "Fuld skærm", fsClose: "Luk fuld skærm",
      sysReady: "Systemet er klar", sysBusy: "Starter scene…",
      actName: { tv: "Se TV", kino: "Hjemmebiograf", muzyka: "Musik", gaming: "Gaming", radio: "Internetradio", nocny: "Nattilstand" },
      dayName: "Dagtilstand",
      nightLog: "Nattilstand: dæmpet, varmt lys som i en hjemmebiograf.",
      dayLog: "Dagtilstand: fuldt, lyst lys i stuen.",
      nightToast: "Nattilstand slået til.",
      dayToast: "Dagtilstand slået til.",
      actLog: {
        tv: "Se TV: fjernsynet på TV-indgangen, forstærkeren på TV Audio, lydstyrke 35%.",
        kino: "Hjemmebiograf: film, forstærker med centerhøjttaler og subwoofer, lydtilstand Film, lydstyrke 48%.",
        muzyka: "Musik: forstærker og højttalere, streaming fra Spotify.",
        gaming: "Gaming: konsollen er tændt, fjernsynet på HDMI 2 i spiltilstand, køligere accent.",
        radio: "Internetradio: forstærker og højttalere, seneste station live.",
        nocny: "Nattilstand: subwoofer slukket, lydstyrke begrænset til 25%.",
      },
      actToast: {
        tv: "Scenen Se TV er startet.",
        kino: "Scenen Hjemmebiograf er startet.",
        muzyka: "Scenen Musik er startet.",
        gaming: "Scenen Gaming er startet.",
        radio: "Scenen Internetradio er startet.",
        nocny: "Scenen Nattilstand er startet.",
      },
      runSteps: (src) => ["Fjernsyn", "Forstærker", "Kilde: " + src, "Belysning", "Klar"],
      statusItems: ["TV forbundet", "Forstærker online", "Netværk OK", "Systemet er klar"],
      devName: {
        tv: "Fjernsyn", amplituner: "Forstærker", kolumny: "Højttalere", "glosnik-centralny": "Centerhøjttaler",
        subwoofer: "Subwoofer", playstation: "Spillekonsol", appletv: "Apple TV", gramofon: "Pladespiller",
      },
      devKicker: {
        tv: "Billede", amplituner: "Lyd", kolumny: "Lyd", "glosnik-centralny": "Lyd",
        subwoofer: "Lyd", playstation: "Underholdning", appletv: "Kilde", gramofon: "Kilde",
      },
      on: "Tændt", off: "Slukket", active: "Aktiv", standby: "Standby",
      devLog: (n, s) => `${n}: ${s.toLowerCase()}.`,
      srcName: { spotify: "Spotify", tidal: "TIDAL", appletv: "Apple TV", phono: "Pladespiller (Phono)", hdmi1: "HDMI 1", hdmi2: "HDMI 2", radio: "Internetradio", tvaudio: "TV Audio", bt: "Bluetooth" },
      srcMono: { spotify: "S", tidal: "T", appletv: "", phono: "◉", hdmi1: "H1", hdmi2: "H2", radio: "R", tvaudio: "TV", bt: "B" },
      srcLog: (n) => `Lydkilde: ${n}.`,
      srcNote: {
        spotify: "Streaming fra Spotify. Betjeningen virker i dette panel, men der afspilles ikke noget.",
        tidal: "Streaming fra TIDAL. Betjeningen virker i dette panel, men der afspilles ikke noget.",
        appletv: "Signal fra en streamingafspiller via HDMI, betjenes med enhedens fjernbetjening.",
        phono: "En vinylplade spiller på pladespilleren. Armen er nede, og pladen drejer rundt.",
        radio: "Internetradio, live. I demonstrationstilstand afspilles stationen ikke rigtigt.",
        hdmi1: "Lyd fra HDMI 1-indgangen, betjenes med fjernbetjeningen til den tilsluttede enhed.",
        hdmi2: "Lyd fra HDMI 2-indgangen, for eksempel en konsol, betjenes med enhedens fjernbetjening.",
        tvaudio: "Lyd fra fjernsynet. Afspilningen styres af appen på fjernsynet.",
        bt: "Lyd fra en telefon via Bluetooth. Styres fra telefonen; her er kun et overblik.",
      },
      tracks: [
        { t: "Dreamer", a: "Alan Walker", al: "Walkerworld", len: 192 },
        { t: "Faded", a: "Alan Walker", al: "Different World", len: 212 },
        { t: "Blinding Lights", a: "The Weeknd", al: "After Hours", len: 200 },
        { t: "Levitating", a: "Dua Lipa", al: "Future Nostalgia", len: 203 },
      ],
      vinylTrack: "Side A", vinylArtist: "Vinylplade",
      hdmiTrack: "Fjernsyn", hdmiArtist: "HDMI-indgang",
      btTrack: "Telefon", btArtist: "Bluetooth",
      atvTrack: "Apple TV", atvArtist: "App eller film",
      stationName: { rmf: "Radio Nova", zet: "Hit Radio", eska: "Kiss FM", trojka: "Jazz Lounge", chillizet: "Chillout FM" },
      stationNow: { rmf: "Radio Nova · Den bedste musik", zet: "Hit Radio · Dagens hits", eska: "Kiss FM · Pop non-stop", trojka: "Jazz Lounge · Jazz om aftenen", chillizet: "Chillout FM · Rolig aften-chillout" },
      stationColor: { rmf: "#f6c500", zet: "#e2001a", eska: "#1f3fb0", trojka: "#d81e5b", chillizet: "#7c3aed" },
      stationLog: (n) => `Radiostation: ${n}.`,
      volLog: (v) => `Lydstyrke: ${v}%.`,
      volCapToast: "Nattilstand begrænser lydstyrken til 25%.",
      muteOn: "Lyden er slået fra.", muteOff: "Lyden er slået til.",
      playLog: (p) => p ? "Afspilning genoptaget." : "Afspilning sat på pause.",
      nextLog: (x) => `Næste nummer: ${x}.`, prevLog: (x) => `Forrige nummer: ${x}.`,
      shuffleLog: (o) => o ? "Bland slået til." : "Bland slået fra.",
      repeatLog: (o) => o ? "Gentag slået til." : "Gentag slået fra.",
      heartLog: (o) => o ? "Nummer tilføjet til favoritter." : "Nummer fjernet fra favoritter.",
      streamOff: "Med denne kilde styres afspilningen på selve enheden.",
      needAmp: "Tænd forstærkeren for at styre lyden.",
      dpZasilanie: "Strøm", dpZrodlo: "Kilde", dpGlosnosc: "Lydstyrke", dpWyciszenie: "Lyd fra",
      dpTrybDzwieku: "Lydtilstand", dpWejscie: "Indgang", dpTrybObrazu: "Billedtilstand", dpJasnosc: "Lysstyrke",
      dpPoziomBasu: "Basniveau", dpDialogi: "Dialogforstærkning",
      dpSetSource: "Vælg som lydkilde", dpRunGaming: "Start Gaming-tilstand", dpPhono: "Vælg Phono-indgangen",
      dpKolumnyNote: "Et par gulvhøjttalere, venstre og højre kanal.",
      dpCenterNote: "Centerkanal, som står for dialog i film.",
      soundModes: ["Standard", "Film", "Musik", "Spil"],
      picModes: ["Standard", "Film", "Livlig", "Spil"],
      tvInputs: { hdmi1: "HDMI 1", hdmi2: "HDMI 2", appletv: "Apple TV" },
      startLog: "Panelet er startet. Scenen Musik er aktiv.",
      tagByScreen: { tv: "Fjernsyn", film: "Afspiller · Film", music: "Spotify · Afspiller", gaming: "Konsol · HDMI 2", radio: "Radio · Live", night: "Standby", off: "Slukket" },
      seedLog: [
        { kind: "device", text: "Forstærker: tændt." },
        { kind: "source", text: "Lydkilde: Spotify." },
        { kind: "pic", text: "TV-lysstyrke: 70%." },
      ],
    },
  };
  const t = T[LANG] || T.pl;

  const DEV_LIST = {
    tv: { key: "tv", fig: "--mm-fig-tv" },
    amplituner: { key: "amp", fig: "--mm-fig-amp" },
    kolumny: { key: "kolumny", fig: "--mm-fig-kolumna" },
    "glosnik-centralny": { key: "center", fig: "--mm-fig-center" },
    subwoofer: { key: "sub", fig: "--mm-fig-sub" },
    playstation: { key: "ps5", fig: "--mm-fig-ps5" },
    appletv: { key: "appletv", fig: "--mm-fig-atv" },
    gramofon: { key: "gramofon", fig: "--mm-fig-gramofon" },
  };

  const SCENE = {
    tv:     { dev: { tv: 1, amp: 1, kolumny: 1, center: 0, sub: 1, ps5: 0, appletv: 0, gramofon: 0 }, ampSource: "tvaudio", volume: 35, accent: "warm", screen: "tv", soundMode: "Standard", tvInput: "hdmi1", devices: ["tv", "amplituner", "appletv"], sources: ["hdmi1", "appletv"] },
    kino:   { dev: { tv: 1, amp: 1, kolumny: 1, center: 1, sub: 1, ps5: 0, appletv: 1, gramofon: 0 }, ampSource: "appletv", volume: 48, accent: "warm", screen: "film", soundMode: "Film", tvInput: "appletv", devices: ["tv", "amplituner", "glosnik-centralny", "subwoofer"], sources: ["appletv", "hdmi1"] },
    muzyka: { dev: { tv: 1, amp: 1, kolumny: 1, center: 0, sub: 1, ps5: 0, appletv: 0, gramofon: 0 }, ampSource: "spotify", volume: 40, accent: "warm", screen: "music", soundMode: "Muzyka", devices: ["amplituner", "kolumny", "subwoofer", "gramofon"], sources: ["spotify", "tidal", "phono"] },
    gaming: { dev: { tv: 1, amp: 1, kolumny: 1, center: 0, sub: 1, ps5: 1, appletv: 0, gramofon: 0 }, ampSource: "hdmi2", volume: 44, accent: "cool", screen: "gaming", soundMode: "Gra", tvInput: "hdmi2", devices: ["tv", "playstation", "amplituner"], sources: [] },
    radio:  { dev: { tv: 1, amp: 1, kolumny: 1, center: 0, sub: 0, ps5: 0, appletv: 0, gramofon: 0 }, ampSource: "radio", volume: 38, accent: "warm", screen: "radio", soundMode: "Standard", devices: ["amplituner", "kolumny"], sources: [], stations: true },
    nocny:  { dev: { tv: 1, amp: 1, kolumny: 1, center: 0, sub: 0, ps5: 0, appletv: 0, gramofon: 0 }, ampSource: null, volume: 25, volCap: 25, accent: "warm", screen: "night", soundMode: "Standard", devices: ["amplituner", "kolumny", "subwoofer"], sources: [] },
  };
  const STREAM_SRC = new Set(["spotify", "tidal"]);
  const STATIONS = ["rmf", "zet", "eska", "trojka", "chillizet"];

  const state = {
    powered: true, scene: "muzyka",
    dev: { tv: 1, amp: 1, kolumny: 1, center: 0, sub: 1, ps5: 0, appletv: 0, gramofon: 0 },
    ampSource: "spotify", tvInput: "hdmi1", soundMode: "Muzyka", picMode: "Standard",
    tvBright: 70, bassLevel: 55, dialogBoost: 0,
    volume: 40, muted: false,
    playing: true, shuffle: false, repeat: false, hearted: false, trackIx: 0, progress: 24,
    station: "rmf",
    night: false,
  };
  const SUN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.6 3.6M20.4 20.4 19 19M5 19l-1.4 1.4M20.4 3.6 19 5"/></svg>';
  const MOON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14a8 8 0 1 1-9.9-9.9 6.5 6.5 0 0 0 9.9 9.9z"/></svg>';

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round = Math.round;
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtTime = (s) => `${Math.floor(s / 60)}:${pad2(round(s % 60))}`;
  const clockHM = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };

  const R = (s) => panel.querySelector(s);
  const D = (s) => stage.querySelector(s);
  const ref = {
    clock: R('[data-mm="clock"]'), date: R('[data-mm="date"]'),
    sysPill: R('[data-mm-ref="sysPill"]'), sysText: R('[data-mm-ref="sysText"]'),
    hero: R(".mm-hero"), screen: R('[data-mm-ref="screen"]'), screenEq: R('[data-mm-ref="screenEq"]'),
    screenTag: R('[data-mm-ref="screenTag"]'), screenRadio: R('[data-mm-ref="screenRadio"]'), screenClock: R('[data-mm-ref="screenClock"]'),
    runbar: R(".mm-runbar"),
    now: R(".mm-now"), cover: R('[data-mm-ref="cover"]'),
    track: R('[data-mm-ref="track"]'), artist: R('[data-mm-ref="artist"]'), album: R('[data-mm-ref="album"]'),
    tCur: R('[data-mm-ref="tCur"]'), tEnd: R('[data-mm-ref="tEnd"]'), barFill: R('[data-mm-ref="barFill"]'), bar: R('[data-mm-ref="bar"]'),
    nowNote: R('[data-mm-ref="nowNote"]'), heart: R("[data-mm-heart]"),
    srcRow: R('[data-mm-ref="srcRow"]'), stations: R('[data-mm-ref="stations"]'),
    volVal: R('[data-mm-ref="volVal"]'), volRange: R("[data-mm-vol]"), volCap: R('[data-mm-ref="volCap"]'), mute: R("[data-mm-mute]"),
    runStatus: R('[data-mm-ref="runStatus"]'),
    devScene: R('[data-mm-ref="devScene"]'), devRow: R('[data-mm-ref="devRow"]'),
    actBtns: Array.from(panel.querySelectorAll("[data-mm-act]")),
    log: R('[data-mm-ref="log"]'),
    toast: D("[data-mm-toast]"),
    dp: D('[data-mm-ref="devpanel"]'), dpScrim: D('[data-mm-ref="dpScrim"]'), dpClose: D('[data-mm-ref="dpClose"]'),
    dpHero: D('[data-mm-ref="dpHero"]'), dpKicker: D('[data-mm-ref="dpKicker"]'), dpName: D('[data-mm-ref="dpName"]'),
    dpState: D('[data-mm-ref="dpState"]'), dpControls: D('[data-mm-ref="dpControls"]'),
  };

  const EQ_N = 20;
  const eqBars = [];
  for (let i = 0; i < EQ_N; i++) { const b = document.createElement("i"); ref.screenEq.appendChild(b); eqBars.push({ el: b, v: 20, tgt: 20 }); }

  /* -------- dziennik + toast -------- */
  function logRow(kind, text, time) {
    if (!ref.log) return;
    const li = document.createElement("li");
    li.dataset.kind = kind;
    li.innerHTML = `<span class="mm-log-time">${time}</span><span class="mm-log-ic"></span><span class="mm-log-txt">${text}</span>`;
    ref.log.prepend(li);
    while (ref.log.children.length > 16) ref.log.lastElementChild.remove();
  }
  function logEvent(kind, text) { logRow(kind, text, clockHM()); }
  function seedLog() {
    const base = new Date(Date.now() - 9 * 60000);
    t.seedLog.forEach((row, i) => { const d = new Date(base.getTime() + i * 3 * 60000); logRow(row.kind, row.text, `${pad2(d.getHours())}:${pad2(d.getMinutes())}`); });
  }
  let toastTimer = null;
  function toast(msg) {
    if (!ref.toast) return;
    ref.toast.textContent = msg;
    ref.toast.hidden = false;
    requestAnimationFrame(() => ref.toast.classList.add("is-shown"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { ref.toast.classList.remove("is-shown"); setTimeout(() => { ref.toast.hidden = true; }, 220); }, 4200);
  }

  /* -------- pochodne -------- */
  const effSource = () => (state.dev.gramofon ? "phono" : state.ampSource);
  const isLive = () => state.powered && state.dev.amp && effSource() === "radio";
  const isVinyl = () => state.powered && state.dev.amp && effSource() === "phono";
  const audioActive = () => state.powered && state.dev.amp && !state.muted && (state.playing || isLive() || isVinyl());
  const transportEnabled = () => state.powered && state.dev.amp && (STREAM_SRC.has(effSource()) || effSource() === "radio" || isVinyl());
  const curTrack = () => t.tracks[state.trackIx % t.tracks.length];
  const screenKind = () => (!state.powered || !state.dev.tv) ? "off" : SCENE[state.scene].screen;
  const volCap = () => (SCENE[state.scene].volCap || 100);

  /* -------- render -------- */
  function renderScene() {
    ref.hero.dataset.mmScene = state.scene;
    ref.hero.dataset.mmDaynight = state.night ? "night" : "day";
    ref.hero.classList.toggle("is-night", state.night);
    ref.hero.classList.toggle("is-off", !state.powered);
    ref.hero.classList.toggle("is-tv-off", state.powered && !state.dev.tv);
    panel.dataset.mmAccent = state.powered ? SCENE[state.scene].accent : "warm";
    const k = screenKind();
    ref.screen.dataset.show = k;
    ref.screenTag.textContent = t.tagByScreen[k] || "";
    if (k === "radio") ref.screenRadio.textContent = t.stationName[state.station];
    if (k === "night") ref.screenClock.textContent = clockHM();
    const glow = (state.powered && state.dev.tv && k !== "off" && k !== "night") ? state.tvBright / 100 : (k === "night" ? 0.14 : 0);
    ref.hero.style.setProperty("--mm-tvglow", glow.toFixed(3));
  }
  function nowMeta() {
    const s = effSource();
    if (isLive()) return { t: t.stationName[state.station], a: t.stationNow[state.station], live: true, note: t.srcNote.radio, cov: t.stationColor[state.station] };
    if (isVinyl()) return { t: t.vinylTrack, a: t.vinylArtist, live: true, note: t.srcNote.phono, cov: "#2f2f2f" };
    if (s === "bt") return { t: t.btTrack, a: t.btArtist, al: "", note: t.srcNote.bt };
    if (s === "appletv") return { t: t.atvTrack, a: t.atvArtist, al: "", note: t.srcNote.appletv };
    if (s === "hdmi1" || s === "hdmi2" || s === "tvaudio") return { t: t.hdmiTrack, a: t.hdmiArtist, al: "", note: t.srcNote[s] };
    const tr = curTrack();
    return { t: tr.t, a: tr.a, al: tr.al, len: tr.len, note: t.srcNote[s] || t.srcNote.spotify };
  }
  function renderNow() {
    const m = nowMeta();
    ref.now.dataset.mmLive = m.live ? "true" : "false";
    ref.track.textContent = m.t;
    ref.artist.textContent = m.a;
    if (m.al != null) ref.album.textContent = m.al;
    if (m.cov) ref.cover.style.setProperty("--mm-st-c", m.cov);
    if (m.len) ref.tEnd.textContent = fmtTime(m.len);
    ref.nowNote.textContent = m.note;
    ref.now.classList.toggle("is-playing", (state.playing || isVinyl() || isLive()) && state.powered && state.dev.amp);
    ref.now.classList.toggle("is-disabled", !transportEnabled());
    ref.tCur.textContent = fmtTime(state.progress);
    const tr = curTrack();
    ref.barFill.style.width = `${clamp((state.progress / tr.len) * 100, 0, 100)}%`;
    ref.heart.setAttribute("aria-pressed", state.hearted ? "true" : "false");
    renderSources();
  }
  function renderSources() {
    const list = SCENE[state.scene].sources || [];
    ref.srcRow.innerHTML = "";
    list.forEach((id) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "mm-src"; b.dataset.mmSrc = id;
      const active = effSource() === id || (id === "phono" && state.dev.gramofon) || (id === "appletv" && state.ampSource === "appletv");
      if (active) b.classList.add("is-active");
      b.setAttribute("aria-pressed", active ? "true" : "false");
      const mono = t.srcMono[id];
      b.innerHTML = (mono ? `<span class="mm-src-mono" data-m="${id}">${mono}</span>` : "") + t.srcName[id];
      ref.srcRow.appendChild(b);
    });
    const showStations = !!SCENE[state.scene].stations;
    ref.stations.hidden = !showStations;
    if (showStations && !ref.stations.dataset.built) {
      STATIONS.forEach((id) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "mm-station-chip"; b.dataset.mmStation = id;
        b.innerHTML = `<span class="mm-src-mono" style="--m:${t.stationColor[id]};--mt:#fff">${t.stationName[id][0]}</span>${t.stationName[id]}`;
        ref.stations.appendChild(b);
      });
      ref.stations.dataset.built = "1";
    }
    if (showStations) ref.stations.querySelectorAll("[data-mm-station]").forEach((b) => {
      const on = b.dataset.mmStation === state.station;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function renderVolume() {
    const v = state.muted ? 0 : state.volume;
    ref.volVal.textContent = String(v);
    ref.volRange.value = String(state.volume);
    ref.volRange.style.setProperty("--mm-fill", `${state.volume}%`);
    ref.mute.setAttribute("aria-pressed", state.muted ? "true" : "false");
    ref.volCap.hidden = state.scene !== "nocny";
  }
  function renderActivities() {
    ref.actBtns.forEach((b) => {
      const isNightBtn = b.dataset.mmAct === "nocny";
      const on = isNightBtn ? state.night : (b.dataset.mmAct === state.scene);
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      if (isNightBtn) {
        const tEl = b.querySelector(".mm-act-t");
        const icEl = b.querySelector(".mm-act-ic");
        const label = state.night ? (t.dayName || "Tryb dzienny") : t.actName.nocny;
        if (tEl) tEl.textContent = label;
        if (icEl) icEl.innerHTML = state.night ? SUN_SVG : MOON_SVG;
        b.setAttribute("aria-label", label);
      }
    });
  }
  function renderClock() {
    const d = new Date();
    ref.clock.textContent = clockHM();
    ref.date.textContent = d.toLocaleDateString(t.dateLocale, { weekday: "long", day: "numeric", month: "long" });
    if (screenKind() === "night") ref.screenClock.textContent = clockHM();
  }
  const devState = (id) => {
    const k = DEV_LIST[id].key;
    if (!state.powered) return t.standby;
    if (id === "appletv" || id === "playstation" || id === "gramofon") return state.dev[k] ? t.active : t.standby;
    return state.dev[k] ? t.on : t.off;
  };
  function renderDevices() {
    ref.devScene.textContent = "· " + t.actName[state.scene];
    const list = SCENE[state.scene].devices || [];
    ref.devRow.innerHTML = "";
    list.forEach((id) => {
      const k = DEV_LIST[id].key;
      const card = document.createElement("button");
      card.type = "button"; card.className = "mm-dev-card"; card.dataset.mmDevOpen = id;
      card.dataset.on = state.dev[k] && state.powered ? "true" : "false";
      card.innerHTML = `
        <span class="mm-dev-card-fig" style="background-image:var(${DEV_LIST[id].fig})"></span>
        <span class="mm-dev-card-name">${t.devName[id]}</span>
        <span class="mm-dev-card-state">${devState(id)}</span>`;
      ref.devRow.appendChild(card);
    });
  }
  function renderAll() { renderScene(); renderNow(); renderVolume(); renderActivities(); renderDevices(); if (!ref.dp.hidden) renderDevPanel(openDevId); }

  /* -------- sekwencja uruchamiania sceny -------- */
  let runTimer = null;
  function runSceneSequence(sceneId) {
    const src = t.srcName[SCENE[sceneId].ampSource] || t.srcName[state.ampSource] || "TV Audio";
    const steps = t.runSteps(src);
    ref.sysPill.classList.add("is-busy");
    ref.sysText.textContent = t.sysBusy;
    const st = ref.runStatus;
    st.classList.add("is-running");
    st.innerHTML = steps.map((s) => `<span class="mm-run-item"><i class="mm-run-dot" aria-hidden="true"></i>${s}</span>`).join("");
    const items = Array.from(st.children);
    clearTimeout(runTimer);
    let i = 0;
    const step = () => {
      items.forEach((el, j) => { el.classList.toggle("is-active", j === i); el.classList.toggle("is-done", j < i); });
      i++;
      if (i <= items.length) runTimer = setTimeout(step, prefersReduced ? 60 : 150);
      else finish();
    };
    const finish = () => {
      st.classList.remove("is-running");
      st.innerHTML = t.statusItems.map((s) => `<span class="mm-run-item"><i class="mm-run-dot" aria-hidden="true"></i>${s}</span>`).join("");
      ref.sysPill.classList.remove("is-busy");
      ref.sysText.textContent = t.sysReady;
    };
    step();
  }

  /* -------- akcje -------- */
  function applyScene(id, opts = {}) {
    const s = SCENE[id];
    if (!s) return;
    state.scene = id;
    Object.keys(s.dev).forEach((k) => { state.dev[k] = s.dev[k] ? 1 : 0; });
    if (s.ampSource) state.ampSource = s.ampSource;
    if (id !== "muzyka" && id !== "radio") state.dev.gramofon = 0;
    if (s.tvInput) state.tvInput = s.tvInput;
    if (s.soundMode) state.soundMode = s.soundMode;
    state.volume = clamp(s.volume, 0, volCap());
    state.playing = (id === "muzyka" || id === "radio") && state.dev.amp;
    if (opts.log !== false) {
      logEvent("mode", t.actLog[id]);
      if (!prefersReduced) runSceneSequence(id);
      toast(t.actToast[id]);
    }
    renderAll();
  }
  function toggleDevPower(id) {
    if (!state.powered) return;
    const k = DEV_LIST[id].key;
    const nv = state.dev[k] ? 0 : 1;
    state.dev[k] = nv;
    if (k === "amp" && !nv) state.playing = false;
    if (k === "gramofon" && nv) { state.dev.amp = 1; state.dev.kolumny = 1; state.playing = true; }
    if (k === "ps5" && nv) { state.dev.tv = 1; state.dev.amp = 1; state.ampSource = "hdmi2"; state.tvInput = "hdmi2"; }
    if (k === "appletv" && nv) { state.dev.tv = 1; state.dev.amp = 1; }
    logEvent("device", t.devLog(t.devName[id], devState(id)));
    renderAll();
  }
  function setAmpSource(id) {
    if (!state.dev.amp) { toast(t.needAmp); return; }
    state.dev.gramofon = id === "phono" ? 1 : 0;
    if (id === "phono") { state.dev.kolumny = 1; state.playing = true; }
    else state.ampSource = id;
    if (id === "appletv") { state.dev.appletv = 1; state.tvInput = "appletv"; }
    logEvent("source", t.srcLog(t.srcName[id] || t.srcName.phono));
    renderAll();
  }
  function setStation(id) {
    if (!state.dev.amp) { toast(t.needAmp); return; }
    state.station = id; state.dev.gramofon = 0; state.ampSource = "radio"; state.playing = true;
    if (state.scene !== "radio") applyScene("radio", { log: false });
    logEvent("source", t.stationLog(t.stationName[id]));
    renderAll();
  }
  function setVolume(v, opts = {}) {
    v = clamp(round(v), 0, 100);
    if (v > volCap()) { v = volCap(); if (opts.user) toast(t.volCapToast); }
    state.volume = v;
    if (state.muted && v > 0) state.muted = false;
    if (opts.log) logEvent("pic", t.volLog(v));
    renderVolume();
  }
  function togglePlay() {
    if (!transportEnabled()) { toast(state.dev.amp ? t.streamOff : t.needAmp); return; }
    state.playing = !state.playing;
    logEvent("mode", t.playLog(state.playing));
    renderNow();
  }
  function skip(dir) {
    if (!transportEnabled() || effSource() === "radio" || isVinyl()) { toast(t.streamOff); return; }
    if (state.shuffle && dir > 0) state.trackIx = Math.floor(Math.random() * t.tracks.length);
    else state.trackIx = (state.trackIx + dir + t.tracks.length) % t.tracks.length;
    state.progress = 0; state.playing = true;
    logEvent("mode", (dir > 0 ? t.nextLog : t.prevLog)(curTrack().t));
    renderNow();
  }

  /* -------- boczny panel urzadzenia -------- */
  let openDevId = null;
  function field(lab, valHtml, ctrlHtml) {
    return `<div class="mm-dp-field"><span class="mm-dp-field-lab">${lab}${valHtml ? `<b>${valHtml}</b>` : ""}</span>${ctrlHtml}</div>`;
  }
  function seg(name, opts, cur) {
    return `<div class="mm-dp-seg" data-seg="${name}">` + opts.map((o) => `<button type="button" data-v="${o.v}" class="${o.v === cur ? "is-active" : ""}">${o.l}</button>`).join("") + `</div>`;
  }
  function toggle(name, label, on) {
    return `<button type="button" class="mm-dp-toggle" data-toggle="${name}" aria-pressed="${on ? "true" : "false"}"><b>${label}</b><span class="mm-dp-sw" aria-hidden="true"></span></button>`;
  }
  function rangeCtl(name, val) {
    return `<input type="range" class="mm-range" data-range="${name}" min="0" max="100" step="1" value="${val}" aria-label="${name}" style="--mm-fill:${val}%">`;
  }
  function buildControls(id) {
    const k = DEV_LIST[id].key;
    const onP = state.powered && state.dev[k];
    if (id === "amplituner") {
      return toggle("amp", t.dpZasilanie, onP)
        + field(t.dpZrodlo, "", seg("ampSource", [
          { v: "tvaudio", l: "TV Audio" }, { v: "hdmi1", l: "HDMI 1" }, { v: "hdmi2", l: "HDMI 2" }, { v: "bt", l: "Bluetooth" }, { v: "phono", l: "Phono" },
        ], effSource()))
        + field(t.dpGlosnosc, `${state.muted ? 0 : state.volume}%`, rangeCtl("volume", state.volume))
        + toggle("mute", t.dpWyciszenie, state.muted)
        + field(t.dpTrybDzwieku, "", seg("soundMode", t.soundModes.map((m) => ({ v: m, l: m })), state.soundMode));
    }
    if (id === "tv") {
      return toggle("tv", t.dpZasilanie, onP)
        + field(t.dpWejscie, "", seg("tvInput", Object.entries(t.tvInputs).map(([v, l]) => ({ v, l })), state.tvInput))
        + field(t.dpTrybObrazu, "", seg("picMode", t.picModes.map((m) => ({ v: m, l: m })), state.picMode))
        + field(t.dpJasnosc, `${state.tvBright}%`, rangeCtl("tvBright", state.tvBright));
    }
    if (id === "kolumny") return toggle("kolumny", t.dpZasilanie, onP) + `<p class="mm-now-note">${t.dpKolumnyNote}</p>`;
    if (id === "glosnik-centralny") return toggle("center", t.dpZasilanie, onP)
      + field(t.dpDialogi, `${state.dialogBoost > 0 ? "+" : ""}${state.dialogBoost}`, rangeCtl("dialogBoost", 50 + state.dialogBoost * 5))
      + `<p class="mm-now-note">${t.dpCenterNote}</p>`;
    if (id === "subwoofer") return toggle("sub", t.dpZasilanie, onP)
      + field(t.dpPoziomBasu, `${state.bassLevel}%`, rangeCtl("bassLevel", state.bassLevel));
    if (id === "appletv") return toggle("appletv", t.dpZasilanie, state.powered && state.dev.appletv)
      + `<button type="button" class="mm-dp-btn" data-do="setSourceAtv">${t.dpSetSource}</button>`;
    if (id === "playstation") return toggle("ps5", t.dpZasilanie, state.powered && state.dev.ps5)
      + `<button type="button" class="mm-dp-btn" data-do="runGaming">${t.dpRunGaming}</button>`;
    if (id === "gramofon") return toggle("gramofon", t.dpZasilanie, state.powered && state.dev.gramofon)
      + `<button type="button" class="mm-dp-btn" data-do="phono">${t.dpPhono}</button>`;
    return "";
  }
  function renderDevPanel(id) {
    if (!id) return;
    ref.dpHero.style.backgroundImage = `var(${DEV_LIST[id].fig})`;
    ref.dpKicker.textContent = t.devKicker[id];
    ref.dpName.textContent = t.devName[id];
    ref.dpState.textContent = devState(id);
    ref.dpControls.innerHTML = buildControls(id);
  }
  function openDev(id) {
    openDevId = id;
    ref.dp.hidden = false;
    renderDevPanel(id);
    try { ref.dpClose.focus({ preventScroll: true }); } catch (e) { ref.dpClose.focus(); }
  }
  function closeDev() { ref.dp.hidden = true; openDevId = null; }

  ref.dpControls.addEventListener("click", (ev) => {
    const tog = ev.target.closest("[data-toggle]");
    if (tog) {
      const n = tog.dataset.toggle;
      if (n === "mute") { state.muted = !state.muted; logEvent("pic", state.muted ? t.muteOn : t.muteOff); }
      else {
        const map = { amp: "amplituner", tv: "tv", kolumny: "kolumny", center: "glosnik-centralny", sub: "subwoofer", appletv: "appletv", ps5: "playstation", gramofon: "gramofon" };
        toggleDevPower(map[n]);
      }
      renderAll(); return;
    }
    const segBtn = ev.target.closest(".mm-dp-seg button");
    if (segBtn) {
      const grp = segBtn.closest("[data-seg]").dataset.seg, v = segBtn.dataset.v;
      if (grp === "ampSource") setAmpSource(v);
      else if (grp === "soundMode") { state.soundMode = v; logEvent("pic", `Tryb dźwięku: ${v}.`); renderAll(); }
      else if (grp === "tvInput") { state.tvInput = v; if (v === "appletv") state.dev.appletv = 1; logEvent("pic", `Wejście telewizora: ${t.tvInputs[v]}.`); renderAll(); }
      else if (grp === "picMode") { state.picMode = v; logEvent("pic", `Tryb obrazu: ${v}.`); renderAll(); }
      return;
    }
    const doBtn = ev.target.closest("[data-do]");
    if (doBtn) {
      const a = doBtn.dataset.do;
      if (a === "setSourceAtv") setAmpSource("appletv");
      else if (a === "runGaming") { applyScene("gaming"); }
      else if (a === "phono") setAmpSource("phono");
      renderAll();
    }
  });
  ref.dpControls.addEventListener("input", (ev) => {
    const r = ev.target.closest("[data-range]"); if (!r) return;
    const n = r.dataset.range, v = Number(r.value);
    r.style.setProperty("--mm-fill", `${v}%`);
    if (n === "volume") setVolume(v, { user: true });
    else if (n === "tvBright") { state.tvBright = v; renderScene(); }
    else if (n === "bassLevel") state.bassLevel = v;
    else if (n === "dialogBoost") state.dialogBoost = Math.round((v - 50) / 5);
    const lab = r.previousElementSibling && r.previousElementSibling.querySelector ? r.previousElementSibling.querySelector("b") : null;
    if (lab) {
      if (n === "volume") lab.textContent = `${state.muted ? 0 : state.volume}%`;
      else if (n === "tvBright") lab.textContent = `${state.tvBright}%`;
      else if (n === "bassLevel") lab.textContent = `${state.bassLevel}%`;
      else if (n === "dialogBoost") lab.textContent = `${state.dialogBoost > 0 ? "+" : ""}${state.dialogBoost}`;
    }
  });

  /* -------- eventy -------- */
  ref.actBtns.forEach((b) => b.addEventListener("click", () => {
    if (!state.powered) return;
    const act = b.dataset.mmAct;
    if (act === "nocny") {
      // przycisk dzien/noc: przelacza tylko oswietlenie sceny (2 stany), nie zmienia trybu urzadzen
      state.night = !state.night;
      logEvent("mode", state.night ? t.nightLog : t.dayLog);
      toast(state.night ? t.nightToast : t.dayToast);
      renderAll();
      return;
    }
    applyScene(act);
  }));
  panel.addEventListener("click", (ev) => {
    const dc = ev.target.closest("[data-mm-dev-open]");
    if (dc) openDev(dc.dataset.mmDevOpen);
    const sc = ev.target.closest("[data-mm-src]");
    if (sc) setAmpSource(sc.dataset.mmSrc);
    const stn = ev.target.closest("[data-mm-station]");
    if (stn) setStation(stn.dataset.mmStation);
  });
  ref.dpClose.addEventListener("click", closeDev);
  ref.dpScrim.addEventListener("click", closeDev);
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !ref.dp.hidden) closeDev(); });

  ref.volRange.addEventListener("input", () => setVolume(Number(ref.volRange.value), { user: true }));
  ref.volRange.addEventListener("change", () => setVolume(Number(ref.volRange.value), { user: true, log: true }));
  ref.mute.addEventListener("click", () => { state.muted = !state.muted; logEvent("pic", state.muted ? t.muteOn : t.muteOff); renderVolume(); });
  panel.querySelector("[data-mm-tp='play']").addEventListener("click", togglePlay);
  panel.querySelector("[data-mm-tp='next']").addEventListener("click", () => skip(1));
  panel.querySelector("[data-mm-tp='prev']").addEventListener("click", () => skip(-1));
  panel.querySelector("[data-mm-tp='shuffle']").addEventListener("click", (e) => { state.shuffle = !state.shuffle; e.currentTarget.setAttribute("aria-pressed", state.shuffle ? "true" : "false"); logEvent("mode", t.shuffleLog(state.shuffle)); });
  panel.querySelector("[data-mm-tp='repeat']").addEventListener("click", (e) => { state.repeat = !state.repeat; e.currentTarget.setAttribute("aria-pressed", state.repeat ? "true" : "false"); logEvent("mode", t.repeatLog(state.repeat)); });
  ref.heart.addEventListener("click", () => { state.hearted = !state.hearted; logEvent("mode", t.heartLog(state.hearted)); renderNow(); });
  ref.bar.addEventListener("click", (ev) => {
    if (!transportEnabled() || effSource() === "radio" || isVinyl()) return;
    const r = ref.bar.getBoundingClientRect();
    state.progress = clamp(((ev.clientX - r.left) / r.width) * curTrack().len, 0, curTrack().len);
    renderNow();
  });

  /* -------- petla symulacji -------- */
  let beat = 0, lastFrame = 0, eqT = 0;
  function loop(ts) {
    const dt = lastFrame ? Math.min(0.05, (ts - lastFrame) / 1000) : 0.016;
    lastFrame = ts;
    const active = audioActive();
    const level = active ? (0.35 + state.volume / 100 * 0.65) : 0;
    eqT += dt;
    const pulse = active ? (0.5 + 0.5 * Math.sin(eqT * 7.6)) * (0.6 + 0.4 * Math.sin(eqT * 2.3)) : 0;
    beat += ((pulse * level) - beat) * 0.25;
    panel.style.setProperty("--mm-beat", beat.toFixed(3));
    if (!prefersReduced) {
      const showEq = active && screenKind() === "music";
      eqBars.forEach((b, i) => {
        if (showEq) { const boost = 1 - Math.abs(i - EQ_N / 2) / (EQ_N / 1.4); if (Math.random() < 0.28) b.tgt = (6 + Math.random() * 96) * level * (0.35 + boost * 0.9); }
        else b.tgt = 2.5;
        b.v += (b.tgt - b.v) * 0.4;
        b.el.style.setProperty("--h", `${clamp(b.v, 2, 100).toFixed(1)}%`);
      });
    }
    if (state.powered && state.dev.amp && state.playing && !isLive() && !isVinyl() && STREAM_SRC.has(effSource())) {
      const tr = curTrack();
      state.progress += dt;
      if (state.progress >= tr.len) {
        if (state.repeat) state.progress = 0;
        else { state.trackIx = state.shuffle ? Math.floor(Math.random() * t.tracks.length) : (state.trackIx + 1) % t.tracks.length; state.progress = 0; renderNow(); }
      }
      ref.tCur.textContent = fmtTime(state.progress);
      ref.barFill.style.width = `${clamp((state.progress / tr.len) * 100, 0, 100)}%`;
    }
    requestAnimationFrame(loop);
  }

  /* -------- pelny ekran (mechanizm bez zmian) -------- */
  const fsButtons = Array.from(panel.querySelectorAll("[data-mm-fs]"));
  const canNativeFs = !!(stage.requestFullscreen || stage.webkitRequestFullscreen);
  const FS_MARGIN = 26, FS_MIN_W = 900;
  const isFs = () => document.fullscreenElement === stage || document.webkitFullscreenElement === stage || stage.classList.contains("is-mm-pseudo-fs");
  function fitFullscreen() {
    if (!isFs() || window.innerWidth < FS_MIN_W) { panel.style.removeProperty("--mm-fs-scale"); return; }
    panel.style.removeProperty("--mm-fs-scale");
    const pw = panel.offsetWidth || 1, ph = panel.offsetHeight || 1;
    const s = Math.min((window.innerWidth - FS_MARGIN * 2) / pw, (window.innerHeight - FS_MARGIN * 2) / ph, 2.2);
    panel.style.setProperty("--mm-fs-scale", (s > 0 ? s : 1).toFixed(3));
  }
  function syncFsUi() {
    const on = isFs();
    document.body.classList.toggle("is-mm-fullscreen", on);
    stage.classList.toggle("is-mm-fullscreen", on);
    fsButtons.forEach((b) => { b.setAttribute("aria-pressed", on ? "true" : "false"); const l = b.querySelector(".mm-fs-label"); if (l) l.textContent = on ? t.fsClose : t.fsOpen; });
    fitFullscreen(); requestAnimationFrame(fitFullscreen); setTimeout(fitFullscreen, 220);
  }
  let fsResizeTimer = null;
  window.addEventListener("resize", () => { if (isFs()) { clearTimeout(fsResizeTimer); fsResizeTimer = setTimeout(fitFullscreen, 120); } });
  const pseudoFs = () => { stage.classList.add("is-mm-pseudo-fs"); syncFsUi(); };
  function enterFs() {
    if (!canNativeFs) return pseudoFs();
    try { const req = (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage); if (req && typeof req.catch === "function") req.catch(pseudoFs); }
    catch (e) { pseudoFs(); }
  }
  function exitFs() {
    if (stage.classList.contains("is-mm-pseudo-fs")) { stage.classList.remove("is-mm-pseudo-fs"); syncFsUi(); return; }
    (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
  }
  fsButtons.forEach((b) => b.addEventListener("click", () => (isFs() ? exitFs() : enterFs())));
  document.addEventListener("fullscreenchange", syncFsUi);
  document.addEventListener("webkitfullscreenchange", syncFsUi);
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && stage.classList.contains("is-mm-pseudo-fs")) exitFs(); });

  /* -------- start -------- */
  renderAll();
  renderClock();
  syncFsUi();
  seedLog();
  logEvent("mode", t.startLog);
  setInterval(renderClock, 20000);
  if (!prefersReduced) requestAnimationFrame(loop);
})();
