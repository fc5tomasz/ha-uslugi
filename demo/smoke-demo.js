(() => {
  const story = document.querySelector(".smoke-story");
  const mount = document.querySelector("#smokeMount");
  const cycleLabel = document.querySelector("#smokeCycleLabel");
  const currentState = document.querySelector("#smokeCurrentState");
  const time = document.querySelector("#smokeTime");
  const explanationLabel = document.querySelector("#smokeExplanationLabel");
  const explanationTitle = document.querySelector("#smokeExplanationTitle");
  const explanationText = document.querySelector("#smokeExplanationText");
  const steps = document.querySelector("#smokeSteps");
  const resultText = document.querySelector("#smokeResultText");
  const sensorStatus = document.querySelector("#smokeSensorStatus");
  const alarmStatus = document.querySelector("#smokeAlarmStatus");
  const ventilationStatus = document.querySelector("#smokeVentilationStatus");
  const circuitsStatus = document.querySelector("#smokeCircuitsStatus");
  if (!story || !mount || !cycleLabel || !currentState || !time || !explanationLabel || !explanationTitle || !explanationText || !steps || !resultText || !sensorStatus || !alarmStatus || !ventilationStatus || !circuitsStatus) return;

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
        normal: { label: "System czuwa", title: "Wszystko w porządku", text: "Czujnik dymu monitoruje kotłownię. Home Assistant pozostaje gotowy do uruchomienia ustalonych reakcji.", steps: ["Kotłownia bez oznak dymu", "Czujnik pracuje w stanie normalnym", "Wentylacja i urządzenia działają normalnie", "Powiadomienia i alarm pozostają nieaktywne"], result: "System dyskretnie czuwa i pozostaje gotowy do reakcji po sygnale z czujnika." },
        smoke: { label: "Wczesne zagrożenie", title: "Pojawia się dym", text: "Przy rozdzielni pojawia się dym. Czujnik analizuje zmianę warunków w kotłowni.", steps: ["Dym stopniowo narasta przy rozdzielni", "Czujnik analizuje powietrze", "Home Assistant oczekuje na sygnał alarmowy", "Dodatkowe reakcje nie zostały jeszcze uruchomione"], result: "System czeka na potwierdzony sygnał z czujnika, zanim uruchomi ustalone działania." },
        alarm: { label: "Co się wydarzyło?", title: "Wykrycie dymu", text: "Czujnik wykrył dym w kotłowni, a Home Assistant automatycznie uruchomił wcześniej ustalone reakcje.", steps: ["Wykryto dym w kotłowni", "Wysłano powiadomienie i uruchomiono alarm", "Wyłączono wybrane urządzenia i zatrzymano wentylację", "Włączono oświetlenie pomocnicze"], result: "Domownik otrzymuje informację także poza domem, a system automatycznie wykonuje wcześniej ustalone działania ograniczające ryzyko." }
      },
      ariaToDetect: "Przejdź do stanu wykrycia dymu",
      ariaToNormal: "Wróć do stanu normalnego",
      p: {
        normal: { cycle: "Czuwanie", current: "Wszystko w porządku", sensor: "Normalny", alarm: "Nieaktywny", ventilation: "Działa", circuits: "Aktywne" },
        smoke: { cycle: "Pojawia się dym", current: "Czujnik analizuje powietrze", sensor: "Analiza", alarm: "Nieaktywny", ventilation: "Działa", circuits: "Aktywne" },
        detecting: { cycle: "Czujnik wykrył dym", current: "Wykrycie dymu", sensor: "Dym wykryty", alarm: "Uruchamianie", ventilation: "Zatrzymywanie", circuits: "Ograniczanie" },
        alarm: { cycle: "Tryb alarmowy", current: "Wykrycie dymu", sensor: "Dym wykryty", alarm: "Aktywny", ventilation: "Zatrzymana", circuits: "Ograniczone" },
        resetting: { cycle: "Powrót do czuwania", current: "System wraca do stanu normalnego", sensor: "Normalizacja", alarm: "Wyłączanie", ventilation: "Uruchamianie", circuits: "Przywracanie" }
      }
    },
    en: {
      copy: {
        normal: { label: "System on watch", title: "All clear", text: "The smoke sensor monitors the boiler room. Home Assistant stays ready to run the agreed responses.", steps: ["No sign of smoke in the boiler room", "Sensor working normally", "Ventilation and devices running normally", "Notifications and alarm stay inactive"], result: "The system quietly stands guard and stays ready to react to a sensor signal." },
        smoke: { label: "Early warning", title: "Smoke appears", text: "Smoke appears near the switchboard. The sensor analyses the change of conditions in the boiler room.", steps: ["Smoke slowly builds up near the switchboard", "The sensor analyses the air", "Home Assistant waits for the alarm signal", "No further responses have started yet"], result: "The system waits for a confirmed sensor signal before it runs the agreed actions." },
        alarm: { label: "What happened?", title: "Smoke detection", text: "The sensor detected smoke in the boiler room and Home Assistant automatically ran the responses set up in advance.", steps: ["Smoke detected in the boiler room", "Notification sent and alarm triggered", "Selected devices switched off and ventilation stopped", "Backup lighting switched on"], result: "You get the alert even away from home, and the system automatically carries out the agreed actions that reduce the risk." }
      },
      ariaToDetect: "Switch to the smoke-detected state",
      ariaToNormal: "Return to the normal state",
      p: {
        normal: { cycle: "Standing by", current: "All clear", sensor: "Normal", alarm: "Inactive", ventilation: "Running", circuits: "Active" },
        smoke: { cycle: "Smoke appears", current: "Sensor analysing the air", sensor: "Analysing", alarm: "Inactive", ventilation: "Running", circuits: "Active" },
        detecting: { cycle: "Sensor detected smoke", current: "Smoke detected", sensor: "Smoke detected", alarm: "Starting", ventilation: "Stopping", circuits: "Limiting" },
        alarm: { cycle: "Alarm mode", current: "Smoke detected", sensor: "Smoke detected", alarm: "Active", ventilation: "Stopped", circuits: "Limited" },
        resetting: { cycle: "Returning to standby", current: "System returning to normal", sensor: "Normalising", alarm: "Switching off", ventilation: "Starting", circuits: "Restoring" }
      }
    },
    dk: {
      copy: {
        normal: { label: "Systemet holder vagt", title: "Alt i orden", text: "Røgsensoren overvåger fyrrummet. Home Assistant er klar til at køre de aftalte reaktioner.", steps: ["Ingen tegn på røg i fyrrummet", "Sensoren fungerer normalt", "Ventilation og enheder kører normalt", "Notifikationer og alarm forbliver inaktive"], result: "Systemet holder diskret vagt og er klar til at reagere på et signal fra sensoren." },
        smoke: { label: "Tidlig fare", title: "Røg opstår", text: "Der opstår røg ved eltavlen. Sensoren analyserer ændringen i fyrrummet.", steps: ["Røgen bygger langsomt op ved eltavlen", "Sensoren analyserer luften", "Home Assistant venter på alarmsignalet", "Ingen yderligere reaktioner er startet endnu"], result: "Systemet venter på et bekræftet signal fra sensoren, før det kører de aftalte handlinger." },
        alarm: { label: "Hvad skete der?", title: "Røgdetektering", text: "Sensoren registrerede røg i fyrrummet, og Home Assistant kørte automatisk de reaktioner, der var aftalt på forhånd.", steps: ["Røg registreret i fyrrummet", "Notifikation sendt og alarm udløst", "Udvalgte enheder slukket og ventilation stoppet", "Nødbelysning tændt"], result: "Du får beskeden også væk fra hjemmet, og systemet udfører automatisk de aftalte handlinger, der mindsker risikoen." }
      },
      ariaToDetect: "Skift til tilstanden røg registreret",
      ariaToNormal: "Vend tilbage til normaltilstand",
      p: {
        normal: { cycle: "Standby", current: "Alt i orden", sensor: "Normal", alarm: "Inaktiv", ventilation: "Kører", circuits: "Aktive" },
        smoke: { cycle: "Røg opstår", current: "Sensoren analyserer luften", sensor: "Analyse", alarm: "Inaktiv", ventilation: "Kører", circuits: "Aktive" },
        detecting: { cycle: "Sensoren registrerede røg", current: "Røg registreret", sensor: "Røg registreret", alarm: "Starter", ventilation: "Stopper", circuits: "Begrænser" },
        alarm: { cycle: "Alarmtilstand", current: "Røg registreret", sensor: "Røg registreret", alarm: "Aktiv", ventilation: "Stoppet", circuits: "Begrænset" },
        resetting: { cycle: "Vender tilbage til standby", current: "Systemet vender tilbage til normal", sensor: "Normaliserer", alarm: "Slukker", ventilation: "Starter", circuits: "Genopretter" }
      }
    }
  };
  const L = T[LANG] || T.pl;
  const copy = L.copy;

  const phaseClasses = ["is-normal", "is-smoke", "is-detecting", "is-alarm", "is-resetting"];
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
    steps.innerHTML = state.steps.map((item) => `<li><span class="smoke-step-check" aria-hidden="true">✓</span><span>${item}</span></li>`).join("");
    resultText.textContent = state.result;
  };

  const applyStatus = (p) => {
    sensorStatus.textContent = p.sensor;
    alarmStatus.textContent = p.alarm;
    ventilationStatus.textContent = p.ventilation;
    circuitsStatus.textContent = p.circuits;
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
    schedule(startSmoke, 5000);
  };

  const showAlarm = () => {
    target = "alarm";
    applyPhase("alarm");
    applyStatus(L.p.alarm);
    mount.setAttribute("aria-label", L.ariaToNormal);
    mount.setAttribute("aria-pressed", "true");
    updateCopy("alarm");
    schedule(startNormal, 5600);
  };

  const startDetection = () => {
    target = "alarm";
    applyPhase("detecting");
    applyStatus(L.p.detecting);
    updateCopy("alarm");
    schedule(showAlarm, 950);
  };

  const startSmoke = () => {
    target = "alarm";
    applyPhase("smoke");
    applyStatus(L.p.smoke);
    updateCopy("smoke");
    schedule(startDetection, 1650);
  };

  const startNormal = () => {
    target = "normal";
    applyPhase("resetting");
    applyStatus(L.p.resetting);
    schedule(showNormal, 900);
  };

  const toggleState = () => {
    window.clearTimeout(timer);
    if (target === "alarm" || phase === "smoke" || phase === "detecting" || phase === "alarm") startNormal();
    else startSmoke();
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
