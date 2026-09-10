(() => {
  const story = document.querySelector(".failure-story");
  const mount = document.querySelector("#failureMount");
  const cycleLabel = document.querySelector("#failureCycleLabel");
  if (!story || !mount || !cycleLabel) return;

  const normLang = (value) => {
    const v = (value || "").toLowerCase();
    if (v === "da" || v.startsWith("da-") || v === "dk" || v.startsWith("dk-")) return "dk";
    if (v === "en" || v.startsWith("en-")) return "en";
    return "pl";
  };
  const LANG = normLang((document.body && document.body.dataset.demoLang) || document.documentElement.getAttribute("lang"));

  const T = {
    pl: {
      visualAria: "Przekrój domu podczas przełączenia na zasilanie awaryjne",
      currentLabel: "Aktualny stan",
      currentInit: "Dom zasilany z sieci",
      svgTitle: "Przekrój domu i automatyczne zasilanie awaryjne",
      svgDesc: "Animacja najpierw pokazuje zasilanie domu z sieci, następnie zanik sieci i przełączenie baterii na router, alarm oraz automatykę przy wygaszeniu mniej istotnych odbiorników.",
      gridTitle: "Sieć energetyczna",
      statusNormal: "Aktywne",
      statusFailure: "Brak zasilania",
      batteryTitle: "Zasilanie awaryjne",
      statusReady: "Gotowe",
      statusActive: "Aktywne",
      deviceAutomation: "Automatyka",
      explLabel: "Co się wydarzyło?",
      explTitle: "Awaria zasilania",
      explText: "System wykrył zanik zasilania sieciowego i automatycznie przeszedł w tryb awaryjny.",
      steps: ["Wykryto brak zasilania sieciowego", "Uruchomiono tryb awaryjny", "Zachowano zasilanie kluczowych urządzeń", "Ograniczono pozostałe obciążenie"],
      resultLabel: "Efekt dla domownika",
      resultText: "Najważniejsze funkcje domu mogą nadal działać podczas zaniku zasilania.",
      phases: [
        { key: "normal", label: "Zasilanie sieciowe", current: "Dom zasilany z sieci", duration: 5000 },
        { key: "transitioning", label: "Wykryto zanik zasilania", current: "System wykrywa awarię", duration: 1350 },
        { key: "emergency", label: "Tryb awaryjny", current: "Tryb awaryjny aktywny", duration: 5200 },
        { key: "resetting", label: "Powrót zasilania", current: "Sieć wraca do pracy", duration: 1050 }
      ]
    },
    en: {
      visualAria: "Cross-section of the home during the switch to backup power",
      currentLabel: "Current state",
      currentInit: "Home powered from the grid",
      svgTitle: "Cross-section of the home and automatic backup power",
      svgDesc: "The animation first shows the home powered from the grid, then a grid outage and the battery taking over the router, alarm and automation while less important loads are switched off.",
      gridTitle: "Power grid",
      statusNormal: "Active",
      statusFailure: "No power",
      batteryTitle: "Backup power",
      statusReady: "Ready",
      statusActive: "Active",
      deviceAutomation: "Automation",
      explLabel: "What happened?",
      explTitle: "Power outage",
      explText: "The system detected a grid power outage and automatically switched to backup mode.",
      steps: ["Grid power loss detected", "Backup mode started", "Power kept for essential devices", "Remaining load reduced"],
      resultLabel: "What it means for you",
      resultText: "The home's most important functions can keep running during a power cut.",
      phases: [
        { key: "normal", label: "Grid power", current: "Home powered from the grid", duration: 5000 },
        { key: "transitioning", label: "Power loss detected", current: "System detecting the failure", duration: 1350 },
        { key: "emergency", label: "Backup mode", current: "Backup mode active", duration: 5200 },
        { key: "resetting", label: "Power returning", current: "Grid coming back", duration: 1050 }
      ]
    },
    dk: {
      visualAria: "Gennemsnit af hjemmet under skift til nødstrøm",
      currentLabel: "Aktuel tilstand",
      currentInit: "Hjemmet forsynes fra nettet",
      svgTitle: "Gennemsnit af hjemmet og automatisk nødstrøm",
      svgDesc: "Animationen viser først hjemmet forsynet fra elnettet, derefter et netsvigt og batteriet, der overtager router, alarm og automatik, mens mindre vigtige forbrugere slukkes.",
      gridTitle: "Elnet",
      statusNormal: "Aktiv",
      statusFailure: "Ingen strøm",
      batteryTitle: "Nødstrøm",
      statusReady: "Klar",
      statusActive: "Aktiv",
      deviceAutomation: "Automatik",
      explLabel: "Hvad skete der?",
      explTitle: "Strømsvigt",
      explText: "Systemet registrerede et netsvigt og skiftede automatisk til nødtilstand.",
      steps: ["Netsvigt registreret", "Nødtilstand startet", "Strøm bevaret til vigtige enheder", "Resten af forbruget reduceret"],
      resultLabel: "Hvad det betyder for dig",
      resultText: "Hjemmets vigtigste funktioner kan køre videre under et strømsvigt.",
      phases: [
        { key: "normal", label: "Netstrøm", current: "Hjemmet forsynes fra nettet", duration: 5000 },
        { key: "transitioning", label: "Netsvigt registreret", current: "Systemet registrerer fejlen", duration: 1350 },
        { key: "emergency", label: "Nødtilstand", current: "Nødtilstand aktiv", duration: 5200 },
        { key: "resetting", label: "Strømmen vender tilbage", current: "Nettet kommer tilbage", duration: 1050 }
      ]
    }
  };
  const t = T[LANG] || T.pl;

  mount.innerHTML = `<div class="failure-demo-grid"><section class="failure-visual" aria-label="${t.visualAria}"><div class="failure-visual-top"><div class="failure-current"><span class="failure-current-dot" aria-hidden="true"></span><div><small>${t.currentLabel}</small><strong id="failureCurrentState">${t.currentInit}</strong></div></div><span class="failure-time">22:48</span></div><div class="premium-power-stage"><svg class="premium-power-scene" viewBox="0 0 920 560" role="img" aria-labelledby="premium-power-title premium-power-desc"><title id="premium-power-title">${t.svgTitle}</title><desc id="premium-power-desc">${t.svgDesc}</desc><defs><linearGradient id="sourcePanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#102a2d"/><stop offset="1" stop-color="#081b1c"/></linearGradient><linearGradient id="roofGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2c31"/><stop offset="1" stop-color="#0b1d20"/></linearGradient><linearGradient id="roomNight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#142b2b"/><stop offset="1" stop-color="#0b1c1c"/></linearGradient><linearGradient id="roomWarm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a382e"/><stop offset=".55" stop-color="#1c302d"/><stop offset="1" stop-color="#0e2020"/></linearGradient><linearGradient id="roomCritical" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#123d33"/><stop offset="1" stop-color="#09221f"/></linearGradient><linearGradient id="windowNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#183745"/><stop offset="1" stop-color="#0d242b"/></linearGradient><radialGradient id="lightPool"><stop offset="0" stop-color="#ffd794" stop-opacity=".72"/><stop offset="1" stop-color="#ffd794" stop-opacity="0"/></radialGradient><filter id="houseShadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="14"/></filter></defs><path class="scene-landscape" d="M0 396 C126 330 220 386 325 348 C462 300 592 355 721 316 C808 290 866 314 920 296 V560 H0 Z"/><g class="scene-tree"><path d="M862 134 l-48 108 h31 l-45 92 h117 l-43-92 h30z"/><path d="M94 250 l-34 78 h24 l-31 65 h84 l-30-65 h22z"/></g><rect class="scene-ground" x="0" y="490" width="920" height="70"/><line class="scene-ground-line" x1="0" y1="490" x2="920" y2="490"/><path class="energy-path grid-path" d="M235 188 H239 Q257 188 257 206 V382 Q257 410 275 410 H292"/><path class="energy-path battery-path" d="M230 389 H237 Q257 389 257 409 V456 H292"/><path class="shared-bus" d="M292 410 V456 H337"/><path class="comfort-bus" d="M315 410 V185 H478 M315 244 H690 M315 365 H478 M315 365 H690"/><path class="critical-bus" d="M337 456 H590"/><circle class="power-junction" cx="292" cy="410" r="6"/><circle class="power-junction" cx="292" cy="456" r="6"/><circle class="power-change-ring" cx="292" cy="433" r="18"/><g class="source source--grid"><rect class="source-shell" x="20" y="112" width="210" height="170" rx="20"/><path class="source-icon source-icon--grid" d="M98 191 L125 135 L152 191 M110 162 H140 M105 175 H145 M125 135 V205"/><text class="source-title" x="125" y="224">${t.gridTitle}</text><rect class="source-status-shell" x="66" y="247" width="118" height="24" rx="8"/><text class="source-status source-status--normal" x="125" y="263">${t.statusNormal}</text><text class="source-status source-status--failure" x="125" y="263">${t.statusFailure}</text><circle class="source-indicator" cx="230" cy="188" r="5"/></g><g class="source source--battery"><rect class="source-shell" x="20" y="316" width="210" height="170" rx="20"/><path class="source-icon source-icon--battery" d="M99 352 H149 Q157 352 157 360 V404 Q157 412 149 412 H99 Q91 412 91 404 V360 Q91 352 99 352 Z M111 342 H137 V352 M157 373 H164 V391"/><rect class="battery-cell" x="102" y="364" width="11" height="36" rx="3"/><rect class="battery-cell" x="118" y="364" width="11" height="36" rx="3"/><rect class="battery-cell" x="134" y="364" width="11" height="36" rx="3"/><text class="source-title" x="125" y="431">${t.batteryTitle}</text><rect class="source-status-shell" x="66" y="454" width="118" height="24" rx="8"/><text class="source-status source-status--ready" x="125" y="470">${t.statusReady}</text><text class="source-status source-status--active" x="125" y="470">${t.statusActive}</text></g><g class="house-cutaway"><ellipse class="house-shadow" cx="585" cy="511" rx="325" ry="25"/><path class="house-roof" d="M246 165 L568 37 L895 165 L865 179 L568 76 L276 179 Z"/><rect class="house-shell" x="267" y="158" width="605" height="346" rx="4"/><rect class="house-floor is-warm" x="280" y="175" width="190" height="121"/><rect class="house-floor is-warm" x="476" y="175" width="150" height="121"/><rect class="house-floor" x="632" y="175" width="227" height="121"/><rect class="house-floor is-warm" x="280" y="302" width="190" height="126"/><rect class="house-floor" x="476" y="302" width="150" height="126"/><rect class="house-floor is-warm" x="632" y="302" width="227" height="126"/><rect class="house-floor is-critical" x="280" y="434" width="346" height="58"/><rect class="house-floor" x="632" y="434" width="227" height="58"/><rect class="house-beam" x="267" y="292" width="605" height="12"/><rect class="house-beam" x="267" y="424" width="605" height="12"/><line class="house-divider" x1="473" y1="167" x2="473" y2="428"/><line class="house-divider" x1="629" y1="167" x2="629" y2="496"/><g><rect class="window-pane" x="294" y="188" width="52" height="66" rx="3"/><line class="window-frame" x1="320" y1="188" x2="320" y2="254"/><rect class="interior-dark" x="305" y="247" width="139" height="37" rx="8"/><rect class="interior-soft" x="319" y="236" width="48" height="15" rx="5"/><rect class="interior-soft" x="372" y="236" width="48" height="15" rx="5"/><path class="interior-line" d="M433 244 V203 M421 203 H445"/><circle class="room-light comfort-light" cx="433" cy="200" r="6"/><ellipse class="light-pool" cx="433" cy="226" rx="42" ry="34"/></g><g><rect class="interior-dark" x="521" y="207" width="59" height="82" rx="3"/><rect class="interior-fill" x="533" y="219" width="35" height="69" rx="2"/><path class="interior-line" d="M497 257 H514 V289 H493 M594 287 V250 M586 250 H602"/><path class="plant-fill" d="M594 253 C576 242 578 227 595 241 C592 220 608 221 603 243 C619 231 624 246 603 256 Z"/><circle class="room-light critical-light" cx="551" cy="193" r="7"/><ellipse class="light-pool" cx="551" cy="221" rx="56" ry="38"/></g><g><rect class="window-pane" x="650" y="188" width="58" height="68" rx="3"/><line class="window-frame" x1="679" y1="188" x2="679" y2="256"/><path class="interior-line" d="M740 195 H823 V284 H740 Z M760 195 V284 M740 220 H823"/><rect class="interior-dark" x="734" y="269" width="94" height="19" rx="8"/><circle class="room-light comfort-light" cx="786" cy="195" r="6"/><ellipse class="light-pool" cx="786" cy="225" rx="55" ry="40"/></g><g><rect class="window-pane" x="294" y="317" width="52" height="65" rx="3"/><line class="window-frame" x1="320" y1="317" x2="320" y2="382"/><rect class="interior-dark" x="304" y="374" width="137" height="39" rx="10"/><rect class="interior-soft" x="314" y="360" width="51" height="22" rx="8"/><rect class="interior-soft" x="371" y="360" width="51" height="22" rx="8"/><path class="interior-line" d="M442 405 H457 V331 M449 331 H465"/><circle class="room-light comfort-light" cx="457" cy="328" r="6"/><ellipse class="light-pool" cx="421" cy="362" rx="70" ry="50"/></g><g><path class="interior-line" d="M492 412 H611 M497 399 H605 M502 386 H599 M507 373 H593 M512 360 H587 M517 347 H581 M522 329 H575"/><path class="interior-line" d="M492 412 L522 329 M611 412 L575 329"/><circle class="room-light critical-light" cx="551" cy="318" r="6"/><ellipse class="light-pool" cx="551" cy="348" rx="55" ry="35"/></g><g class="comfort-device"><rect class="interior-dark" x="649" y="351" width="86" height="62"/><path class="interior-line" d="M657 366 H727 M657 382 H727"/><rect class="interior-fill" x="747" y="364" width="91" height="49" rx="4"/><path class="interior-line" d="M754 378 H831 M770 364 V413 M814 364 V413"/><path class="interior-line" d="M675 337 V357 M702 337 V357 M675 337 H702"/><circle class="room-light comfort-light" cx="689" cy="328" r="6"/><ellipse class="light-pool" cx="714" cy="358" rx="78" ry="50"/></g><g><rect class="critical-strip" x="294" y="443" width="316" height="40" rx="9"/><g><rect class="critical-device-shell" x="310" y="450" width="78" height="26" rx="6"/><path class="critical-device-icon" d="M323 466 H337 M326 461 C330 457 334 457 338 461 M329 456 C332 453 335 453 338 456"/><text class="critical-device-label" x="364" y="467">Router</text><circle class="device-led" cx="378" cy="457" r="3"/></g><g><rect class="critical-device-shell" x="397" y="450" width="82" height="26" rx="6"/><path class="critical-device-icon" d="M409 456 L419 452 L429 456 V465 Q419 473 409 465 Z"/><text class="critical-device-label" x="455" y="467">Alarm</text><circle class="device-led" cx="469" cy="457" r="3"/></g><g><rect class="critical-device-shell" x="488" y="450" width="106" height="26" rx="6"/><path class="critical-device-icon" d="M501 458 H515 M501 464 H515 M505 455 V468 M511 455 V468"/><text class="critical-device-label" x="559" y="467">${t.deviceAutomation}</text><circle class="device-led" cx="584" cy="457" r="3"/></g></g><g class="comfort-device"><rect class="utility-door" x="646" y="443" width="199" height="40" rx="8"/><rect class="utility-device" x="663" y="449" width="69" height="29" rx="6"/><circle class="interior-line" cx="681" cy="463" r="9"/><rect class="utility-device" x="742" y="449" width="69" height="29" rx="6"/><circle class="interior-line" cx="760" cy="463" r="9"/></g></g></svg></div></section><aside class="failure-explanation"><span class="failure-explanation-label">${t.explLabel}</span><h3>${t.explTitle}</h3><p>${t.explText}</p><ol class="failure-steps">${t.steps.map((s) => `<li><span class="failure-step-check" aria-hidden="true">✓</span><span>${s}</span></li>`).join("")}</ol><div class="failure-result"><strong>${t.resultLabel}</strong><span>${t.resultText}</span></div></aside></div>`;

  const currentState = document.querySelector("#failureCurrentState");
  const phaseClasses = ["is-normal", "is-transitioning", "is-emergency", "is-resetting"];
  const phases = t.phases;
  let timer = null;
  let phaseIndex = 0;

  const applyPhase = (phase) => {
    story.classList.remove(...phaseClasses);
    mount.classList.remove(...phaseClasses);
    story.classList.add(`is-${phase.key}`);
    mount.classList.add(`is-${phase.key}`);
    cycleLabel.textContent = phase.label;
    currentState.textContent = phase.current;
  };

  const schedulePhase = () => {
    const phase = phases[phaseIndex];
    applyPhase(phase);
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      schedulePhase();
    }, phase.duration);
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const advancePhase = () => {
    phaseIndex = (phaseIndex + 1) % phases.length;
    if (reducedMotion) {
      window.clearTimeout(timer);
      applyPhase(phases[phaseIndex]);
      return;
    }
    schedulePhase();
  };

  mount.addEventListener("click", advancePhase);
  mount.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    advancePhase();
  });

  if (reducedMotion) {
    phaseIndex = 2;
    applyPhase(phases[2]);
  } else {
    schedulePhase();
  }
})();
