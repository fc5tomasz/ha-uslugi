(() => {
  const story = document.querySelector(".water-story");
  const mount = document.querySelector("#waterMount");
  const cycleLabel = document.querySelector("#waterCycleLabel");
  const currentState = document.querySelector("#waterCurrentState");
  const time = document.querySelector("#waterTime");
  const explanationLabel = document.querySelector("#waterExplanationLabel");
  const explanationTitle = document.querySelector("#waterExplanationTitle");
  const explanationText = document.querySelector("#waterExplanationText");
  const steps = document.querySelector("#waterSteps");
  const resultText = document.querySelector("#waterResultText");
  const sensorStatus = document.querySelector("#waterSensorStatus");
  const valveStatus = document.querySelector("#waterValveStatus");
  const valveChipStatus = document.querySelector("#waterValveChipStatus");
  const washerStatus = document.querySelector("#waterWasherStatus");
  const messageStatus = document.querySelector("#waterMessageStatus");
  if (!story || !mount || !cycleLabel || !currentState || !time || !explanationLabel || !explanationTitle || !explanationText || !steps || !resultText || !sensorStatus || !valveStatus || !valveChipStatus || !washerStatus || !messageStatus) return;

  const normLang = (value) => {
    const v = (value || "").toLowerCase();
    if (v === "da" || v.startsWith("da-") || v === "dk" || v.startsWith("dk-")) return "dk";
    if (v === "en" || v.startsWith("en-")) return "en";
    return "pl";
  };
  const LANG = normLang((document.body && document.body.dataset.demoLang) || document.documentElement.getAttribute("lang"));
  const LOCALE = { pl: "pl-PL", en: "en-GB", dk: "da-DK" }[LANG] || "pl-PL";

  const T = {
    pl: {
      copy: {
        normal: { label: "System czuwa", title: "Pralnia działa normalnie", text: "Czujnik zalania monitoruje podłogę przy pralce. Zawór wody pozostaje otwarty, a Home Assistant czeka na sygnał z czujnika.", steps: ["Brak wody na podłodze", "Czujnik pracuje w stanie normalnym", "Główny zawór wody jest otwarty", "Pralka pracuje bez zakłóceń"], result: "Pranie przebiega normalnie, a system pozostaje gotowy do reakcji po sygnale z czujnika." },
        leak: { label: "Początek awarii", title: "Pojawia się wyciek", text: "Przy dolnej części pralki pojawia się woda. Kałuża stopniowo powiększa się w kierunku czujnika zalania.", steps: ["Woda wypływa spod pralki", "Kałuża spokojnie się powiększa", "Czujnik nadal obserwuje podłogę", "Home Assistant czeka na sygnał alarmowy"], result: "System nie reaguje na samo przypuszczenie. Działania uruchamia po potwierdzonym sygnale z czujnika." },
        alarm: { label: "Co się wydarzyło?", title: "Wyciek wody", text: "Czujnik wykrył wodę przy pralce i przekazał sygnał do Home Assistant. System uruchomił wcześniej ustalone działania, aby ograniczyć skutki awarii.", steps: ["Wykryto wodę przy pralce", "Przekazano sygnał do Home Assistant", "Zamknięto główny zawór wody", "Wysłano powiadomienie do domownika"], result: "System szybko wykrywa problem i automatycznie odcina dopływ wody, dzięki czemu skutki zalania mogą być mniejsze." }
      },
      ariaToDetect: "Przejdź do stanu wykrycia wycieku",
      ariaToNormal: "Wróć do stanu normalnego",
      p: {
        normal: { cycle: "Pralka pracuje", current: "Pranie w toku", sensor: "Normalny", valve: "Otwarty", washer: "Pracuje", message: "Brak" },
        leak: { cycle: "Pojawia się woda", current: "Wyciek narasta", sensor: "Normalny", valve: "Otwarty", washer: "Pracuje", message: "Brak" },
        detecting: { cycle: "Czujnik wykrył wodę", current: "Wykryto wodę", sensor: "Woda wykryta", valve: "Zamykanie", washer: "Zatrzymywanie", message: "Wysyłanie" },
        alarm: { cycle: "Dopływ wody odcięty", current: "Dopływ wody odcięty", sensor: "Woda wykryta", valve: "Zamknięty", washer: "Zatrzymana", message: "Wysłana" },
        resetting: { cycle: "Powrót do czuwania", current: "System wraca do stanu normalnego", sensor: "Normalizacja", valve: "Otwieranie", washer: "Uruchamianie", message: "Gotowa" }
      }
    },
    en: {
      copy: {
        normal: { label: "System on watch", title: "The laundry room is running normally", text: "The leak sensor monitors the floor by the washing machine. The water valve stays open and Home Assistant waits for a sensor signal.", steps: ["No water on the floor", "Sensor working normally", "The main water valve is open", "The washing machine runs without trouble"], result: "The wash runs as usual and the system stays ready to react to a sensor signal." },
        leak: { label: "Start of the failure", title: "A leak appears", text: "Water appears at the bottom of the washing machine. The puddle slowly spreads towards the leak sensor.", steps: ["Water runs out from under the washing machine", "The puddle spreads calmly", "The sensor keeps watching the floor", "Home Assistant waits for the alarm signal"], result: "The system does not react to a guess. It runs the actions after a confirmed sensor signal." },
        alarm: { label: "What happened?", title: "Water leak", text: "The sensor detected water by the washing machine and passed a signal to Home Assistant. The system ran the actions set up in advance to limit the damage.", steps: ["Water detected by the washing machine", "Signal passed to Home Assistant", "The main water valve was shut", "A notification was sent to you"], result: "The system detects the problem quickly and automatically shuts off the water supply, so the flood damage can be smaller." }
      },
      ariaToDetect: "Switch to the leak-detected state",
      ariaToNormal: "Return to the normal state",
      p: {
        normal: { cycle: "Washer running", current: "Wash in progress", sensor: "Normal", valve: "Open", washer: "Running", message: "None" },
        leak: { cycle: "Water appears", current: "Leak growing", sensor: "Normal", valve: "Open", washer: "Running", message: "None" },
        detecting: { cycle: "Sensor detected water", current: "Water detected", sensor: "Water detected", valve: "Closing", washer: "Stopping", message: "Sending" },
        alarm: { cycle: "Water supply shut off", current: "Water supply shut off", sensor: "Water detected", valve: "Closed", washer: "Stopped", message: "Sent" },
        resetting: { cycle: "Returning to standby", current: "System returning to normal", sensor: "Normalising", valve: "Opening", washer: "Starting", message: "Ready" }
      }
    },
    dk: {
      copy: {
        normal: { label: "Systemet holder vagt", title: "Vaskerummet kører normalt", text: "Lækagesensoren overvåger gulvet ved vaskemaskinen. Vandventilen er åben, og Home Assistant venter på et signal fra sensoren.", steps: ["Ingen vand på gulvet", "Sensoren fungerer normalt", "Hovedvandventilen er åben", "Vaskemaskinen kører uden problemer"], result: "Vasken kører som normalt, og systemet er klar til at reagere på et signal fra sensoren." },
        leak: { label: "Fejlen begynder", title: "Der opstår et udslip", text: "Der kommer vand ved bunden af vaskemaskinen. Vandpølen breder sig langsomt mod lækagesensoren.", steps: ["Vand løber ud under vaskemaskinen", "Pølen breder sig roligt", "Sensoren holder øje med gulvet", "Home Assistant venter på alarmsignalet"], result: "Systemet reagerer ikke på en formodning. Det kører handlingerne efter et bekræftet signal fra sensoren." },
        alarm: { label: "Hvad skete der?", title: "Vandudslip", text: "Sensoren registrerede vand ved vaskemaskinen og sendte et signal til Home Assistant. Systemet kørte de handlinger, der var aftalt på forhånd, for at begrænse skaden.", steps: ["Vand registreret ved vaskemaskinen", "Signal sendt til Home Assistant", "Hovedvandventilen blev lukket", "Der blev sendt en notifikation til dig"], result: "Systemet opdager problemet hurtigt og lukker automatisk for vandet, så vandskaden kan blive mindre." }
      },
      ariaToDetect: "Skift til tilstanden udslip registreret",
      ariaToNormal: "Vend tilbage til normaltilstand",
      p: {
        normal: { cycle: "Vaskemaskinen kører", current: "Vask i gang", sensor: "Normal", valve: "Åben", washer: "Kører", message: "Ingen" },
        leak: { cycle: "Der kommer vand", current: "Udslippet vokser", sensor: "Normal", valve: "Åben", washer: "Kører", message: "Ingen" },
        detecting: { cycle: "Sensoren registrerede vand", current: "Vand registreret", sensor: "Vand registreret", valve: "Lukker", washer: "Stopper", message: "Sender" },
        alarm: { cycle: "Vandtilførsel lukket", current: "Vandtilførsel lukket", sensor: "Vand registreret", valve: "Lukket", washer: "Stoppet", message: "Sendt" },
        resetting: { cycle: "Vender tilbage til standby", current: "Systemet vender tilbage til normal", sensor: "Normaliserer", valve: "Åbner", washer: "Starter", message: "Klar" }
      }
    }
  };
  const L = T[LANG] || T.pl;
  const copy = L.copy;

  const phaseClasses = ["is-normal", "is-leak", "is-detecting", "is-alarm", "is-resetting"];
  let phase = "normal";
  let target = "normal";
  let timer = null;

  const setTime = () => {
    time.textContent = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" }).format(new Date());
  };

  const updateCopy = (key) => {
    const state = copy[key];
    explanationLabel.textContent = state.label;
    explanationTitle.textContent = state.title;
    explanationText.textContent = state.text;
    steps.innerHTML = state.steps.map((item) => `<li><span class="water-step-check" aria-hidden="true">✓</span><span>${item}</span></li>`).join("");
    resultText.textContent = state.result;
  };

  const applyStatus = (p) => {
    sensorStatus.textContent = p.sensor;
    valveStatus.textContent = p.valve;
    valveChipStatus.textContent = p.valve;
    washerStatus.textContent = p.washer;
    messageStatus.textContent = p.message;
    cycleLabel.textContent = p.cycle;
    currentState.textContent = p.current;
  };

  const applyPhase = (nextPhase) => {
    phase = nextPhase;
    story.classList.remove(...phaseClasses);
    story.classList.add(`is-${nextPhase}`);
  };

  const schedule = (callback, duration) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(callback, duration);
  };

  const showNormal = () => {
    target = "normal";
    applyPhase("normal");
    applyStatus(L.p.normal);
    mount.setAttribute("aria-label", L.ariaToDetect);
    mount.setAttribute("aria-pressed", "false");
    updateCopy("normal");
    schedule(startLeak, 5000);
  };

  const showAlarm = () => {
    target = "alarm";
    applyPhase("alarm");
    applyStatus(L.p.alarm);
    mount.setAttribute("aria-label", L.ariaToNormal);
    mount.setAttribute("aria-pressed", "true");
    updateCopy("alarm");
    schedule(startNormal, 5800);
  };

  const startDetection = () => {
    target = "alarm";
    applyPhase("detecting");
    applyStatus(L.p.detecting);
    updateCopy("alarm");
    schedule(showAlarm, 850);
  };

  const startLeak = () => {
    target = "alarm";
    applyPhase("leak");
    applyStatus(L.p.leak);
    updateCopy("leak");
    schedule(startDetection, 2300);
  };

  const startNormal = () => {
    target = "normal";
    applyPhase("resetting");
    applyStatus(L.p.resetting);
    schedule(showNormal, 900);
  };

  const toggleState = () => {
    window.clearTimeout(timer);
    if (target === "alarm" || phase === "leak" || phase === "detecting" || phase === "alarm") startNormal();
    else startLeak();
  };

  mount.addEventListener("click", toggleState);
  mount.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleState();
  });

  setTime();
  window.setInterval(setTime, 30000);
  showNormal();
})();
