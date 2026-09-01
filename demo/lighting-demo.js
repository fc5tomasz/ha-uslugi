(() => {
  const mount = document.querySelector("#lightingMount");
  const tabs = Array.from(document.querySelectorAll("[data-lighting-scene]"));
  if (!mount || !tabs.length) return;

  const normLang = (value) => {
    const v = (value || "").toLowerCase();
    if (v === "da" || v.startsWith("da-") || v === "dk" || v.startsWith("dk-")) return "dk";
    if (v === "en" || v.startsWith("en-")) return "en";
    return "pl";
  };
  const LANG = normLang((document.body && document.body.dataset.demoLang) || document.documentElement.getAttribute("lang"));

  const UI = {
    pl: { brightness: "Jasność", current: "Aktualna sytuacja", trigger: "Co uruchomiło scenariusz?", result: "Efekt dla domownika" },
    en: { brightness: "Brightness", current: "Current situation", trigger: "What triggered the scene?", result: "What it means for you" },
    dk: { brightness: "Lysstyrke", current: "Aktuel situation", trigger: "Hvad udløste scenen?", result: "Hvad det betyder for dig" }
  };
  const t = UI[LANG] || UI.pl;

  const SCENES = {
    pl: {
      return: {
        icon: "⌂", time: "18:42", state: "Domownik wrócił do domu",
        trigger: "Po zachodzie słońca drzwi wejściowe zostały otwarte i wykryto obecność domownika.",
        steps: ["Włącza ciepłe światło w holu", "Rozjaśnia kuchnię, aby bezpiecznie wejść do domu", "Ustawia delikatne światło w salonie"],
        result: "Dom jest gotowy na spokojny wieczór, bez szukania włączników.",
        rooms: [{name:"Hol",detail:"Powitanie",level:70},{name:"Kuchnia",detail:"Światło robocze",level:55},{name:"Salon",detail:"Spokojny wieczór",level:35},{name:"Sypialnia",detail:"Bez zmian",level:0}]
      },
      evening: {
        icon: "☾", time: "20:30", state: "Czas na odpoczynek",
        trigger: "Domownik wybrał scenę „Wieczorny odpoczynek” na panelu w salonie.",
        steps: ["Przyciemnia główne światło w salonie", "Włącza ciepłą lampę przy kanapie", "Gasi światło w kuchni po pięciu minutach"],
        result: "Jedno polecenie przygotowuje salon do odpoczynku i ogranicza zbędne światło.",
        rooms: [{name:"Hol",detail:"Światło nocne",level:12},{name:"Kuchnia",detail:"Wygaszanie",level:10},{name:"Salon",detail:"Ciepłe lampy",level:28},{name:"Sypialnia",detail:"Lampka nocna",level:18}]
      },
      away: {
        icon: "✓", time: "07:35", state: "Nikogo nie ma w domu",
        trigger: "Ostatni domownik opuścił strefę domu, a system nie wykrywa już obecności.",
        steps: ["Gasi światła we wszystkich pomieszczeniach", "Sprawdza, czy żadna lampa nie pozostała włączona", "Zostawia światło zewnętrzne pod kontrolą czujnika ruchu"],
        result: "Dom nie zużywa energii na niepotrzebne oświetlenie i pozostaje gotowy na powrót.",
        rooms: [{name:"Hol",detail:"Wyłączone",level:0},{name:"Kuchnia",detail:"Wyłączone",level:0},{name:"Salon",detail:"Wyłączone",level:0},{name:"Sypialnia",detail:"Wyłączone",level:0}]
      }
    },
    en: {
      return: {
        icon: "⌂", time: "18:42", state: "Someone has come home",
        trigger: "After sunset the front door was opened and someone was detected at home.",
        steps: ["Turns on warm light in the hallway", "Brightens the kitchen for a safe walk in", "Sets gentle light in the living room"],
        result: "The home is ready for a calm evening, with no hunting for switches.",
        rooms: [{name:"Hallway",detail:"Welcome",level:70},{name:"Kitchen",detail:"Task light",level:55},{name:"Living room",detail:"Calm evening",level:35},{name:"Bedroom",detail:"Unchanged",level:0}]
      },
      evening: {
        icon: "☾", time: "20:30", state: "Time to wind down",
        trigger: "Someone picked the “Evening wind-down” scene on the living-room panel.",
        steps: ["Dims the main living-room light", "Turns on the warm lamp by the sofa", "Switches off the kitchen light after five minutes"],
        result: "One command sets the living room for rest and cuts unneeded light.",
        rooms: [{name:"Hallway",detail:"Night light",level:12},{name:"Kitchen",detail:"Fading out",level:10},{name:"Living room",detail:"Warm lamps",level:28},{name:"Bedroom",detail:"Bedside lamp",level:18}]
      },
      away: {
        icon: "✓", time: "07:35", state: "Nobody is home",
        trigger: "The last person left the home zone and presence is no longer detected.",
        steps: ["Switches off the lights in every room", "Checks that no lamp was left on", "Leaves the outdoor light under motion-sensor control"],
        result: "The home wastes no energy on needless lighting and stays ready for your return.",
        rooms: [{name:"Hallway",detail:"Off",level:0},{name:"Kitchen",detail:"Off",level:0},{name:"Living room",detail:"Off",level:0},{name:"Bedroom",detail:"Off",level:0}]
      }
    },
    dk: {
      return: {
        icon: "⌂", time: "18:42", state: "Nogen er kommet hjem",
        trigger: "Efter solnedgang blev hoveddøren åbnet, og der blev registreret nogen hjemme.",
        steps: ["Tænder varmt lys i entréen", "Lyser køkkenet op til en sikker indgang", "Sætter dæmpet lys i stuen"],
        result: "Hjemmet er klar til en rolig aften uden at lede efter kontakter.",
        rooms: [{name:"Entré",detail:"Velkomst",level:70},{name:"Køkken",detail:"Arbejdslys",level:55},{name:"Stue",detail:"Rolig aften",level:35},{name:"Soveværelse",detail:"Uændret",level:0}]
      },
      evening: {
        icon: "☾", time: "20:30", state: "Tid til at slappe af",
        trigger: "Nogen valgte scenen “Aftenro” på panelet i stuen.",
        steps: ["Dæmper hovedlyset i stuen", "Tænder den varme lampe ved sofaen", "Slukker køkkenlyset efter fem minutter"],
        result: "Én kommando gør stuen klar til afslapning og skærer unødigt lys væk.",
        rooms: [{name:"Entré",detail:"Natlys",level:12},{name:"Køkken",detail:"Toner ud",level:10},{name:"Stue",detail:"Varme lamper",level:28},{name:"Soveværelse",detail:"Sengelampe",level:18}]
      },
      away: {
        icon: "✓", time: "07:35", state: "Ingen er hjemme",
        trigger: "Den sidste person forlod hjemmezonen, og der registreres ikke længere tilstedeværelse.",
        steps: ["Slukker lyset i alle rum", "Tjekker, at ingen lampe blev efterladt tændt", "Lader udelyset styre af bevægelsessensoren"],
        result: "Hjemmet spilder ikke energi på unødigt lys og er klar til, at I kommer hjem.",
        rooms: [{name:"Entré",detail:"Slukket",level:0},{name:"Køkken",detail:"Slukket",level:0},{name:"Stue",detail:"Slukket",level:0},{name:"Soveværelse",detail:"Slukket",level:0}]
      }
    }
  };
  const scenes = SCENES[LANG] || SCENES.pl;

  const roomMarkup = (room) => {
    const active = room.level > 0;
    const glow = active ? Math.max(.05, room.level / 260).toFixed(2) : ".01";
    return `<article class="lighting-room${active ? " is-on" : ""}" style="--level:${room.level}%;--glow:${glow}"><div class="lighting-room-head"><div><h3>${room.name}</h3><small>${room.detail}</small></div><span class="lighting-bulb" aria-hidden="true">●</span></div><div class="lighting-level"><div class="lighting-level-label"><span>${t.brightness}</span><strong>${room.level}%</strong></div><div class="lighting-level-bar"><span></span></div></div></article>`;
  };

  const render = (key) => {
    const scene = scenes[key];
    mount.innerHTML = `<div class="lighting-demo-grid"><section class="lighting-home" aria-label="${t.current}"><div class="lighting-home-top"><div class="lighting-home-state"><span class="lighting-home-icon" aria-hidden="true">${scene.icon}</span><div><small>${t.current}</small><strong>${scene.state}</strong></div></div><span class="lighting-home-time">${scene.time}</span></div><div class="lighting-rooms">${scene.rooms.map(roomMarkup).join("")}</div></section><aside class="lighting-explanation"><span class="lighting-explanation-label">${t.trigger}</span><h3>${scene.state}</h3><p>${scene.trigger}</p><ol class="lighting-steps">${scene.steps.map((step) => `<li><span class="lighting-step-check" aria-hidden="true">✓</span><span>${step}</span></li>`).join("")}</ol><div class="lighting-result"><strong>${t.result}</strong><span>${scene.result}</span></div></aside></div>`;
    tabs.forEach((tab) => { const selected = tab.dataset.lightingScene === key; tab.classList.toggle("is-active", selected); tab.setAttribute("aria-selected", String(selected)); });
    mount.dataset.currentScene = key;
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => render(tab.dataset.lightingScene)));
  const showNextScene = () => {
    const order = Object.keys(scenes);
    const currentIndex = order.indexOf(mount.dataset.currentScene);
    render(order[(currentIndex + 1) % order.length]);
  };
  mount.addEventListener("click", showNextScene);
  mount.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    showNextScene();
  });
  render("return");
})();
