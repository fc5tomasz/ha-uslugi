(() => {
  const mount = document.querySelector("#blindsMount");
  const tabs = Array.from(document.querySelectorAll("[data-blinds-scene]"));
  if (!mount || !tabs.length) return;

  const normLang = (value) => {
    const v = (value || "").toLowerCase();
    if (v === "da" || v.startsWith("da-") || v === "dk" || v.startsWith("dk-")) return "dk";
    if (v === "en" || v.startsWith("en-")) return "en";
    return "pl";
  };
  const LANG = normLang((document.body && document.body.dataset.demoLang) || document.documentElement.getAttribute("lang"));

  const UI = {
    pl: { current: "Aktualna sytuacja", trigger: "Dlaczego rolety zareagowały?", result: "Efekt dla domownika", visual: "Elewacja domu i pozycje rolet" },
    en: { current: "Current situation", trigger: "Why did the blinds react?", result: "What it means for you", visual: "House facade and blind positions" },
    dk: { current: "Aktuel situation", trigger: "Hvorfor reagerede rullegardinerne?", result: "Hvad det betyder for dig", visual: "Husets facade og rullegardinernes positioner" }
  };
  const t = UI[LANG] || UI.pl;

  const SCENES = {
    pl: {
      morning: {
        icon: "☀", time: "08:10", state: "Poranne słońce od wschodu", skyTop: "#315f78", skyBottom: "#d9a96d", sunX: "14%", sunY: "66px",
        conditions: ["21°C w domu", "domownicy obecni", "wschód"],
        trigger: "Słońce oświetla wschodnią elewację, ale temperatura w domu jest nadal komfortowa.",
        steps: ["Przysłania okno kuchenne do połowy", "Pozostawia salon całkowicie otwarty", "Nie zasłania pomieszczeń, które są jeszcze w cieniu"],
        result: "Dom korzysta z naturalnego światła, bez niepotrzebnego nagrzewania kuchni.",
        windows: [{name:"Salon",side:"południe",closed:0},{name:"Kuchnia",side:"wschód",closed:48},{name:"Biuro",side:"zachód",closed:0},{name:"Sypialnia",side:"północ",closed:0}]
      },
      afternoon: {
        icon: "◉", time: "15:20", state: "Mocne słońce i wysoka temperatura", skyTop: "#287ba0", skyBottom: "#8fc7c9", sunX: "68%", sunY: "34px",
        conditions: ["27°C w domu", "29°C na zewnątrz", "południe i zachód"],
        trigger: "Temperatura rośnie, a słońce pada bezpośrednio na salon i biuro od południa oraz zachodu.",
        steps: ["Opuszcza rolety w salonie do 70%", "Chroni biuro przed ostrym światłem na monitorze", "Pozostawia szczelinę, aby zachować widok na zewnątrz"],
        result: "Wnętrze nagrzewa się wolniej, a klimatyzacja ma mniej pracy.",
        windows: [{name:"Salon",side:"południe",closed:70},{name:"Kuchnia",side:"wschód",closed:15},{name:"Biuro",side:"zachód",closed:82},{name:"Sypialnia",side:"północ",closed:0}]
      },
      evening: {
        icon: "☾", time: "21:35", state: "Wieczorna prywatność", skyTop: "#14233f", skyBottom: "#5c5265", sunX: "87%", sunY: "118px",
        conditions: ["po zachodzie słońca", "domownicy obecni", "tryb wieczór"],
        trigger: "Słońce zaszło, światła wewnątrz są włączone, a dom przechodzi w spokojny tryb wieczorny.",
        steps: ["Zamyka wszystkie rolety w domu", "Osłania pomieszczenia od strony ulicy i ogrodu", "Zapewnia prywatność po włączeniu światła wewnątrz"],
        result: "Wszystkie rolety są zamknięte, a domownicy zyskują pełną prywatność.",
        windows: [{name:"Salon",side:"ogród",closed:100},{name:"Kuchnia",side:"ulica",closed:100},{name:"Biuro",side:"ulica",closed:100},{name:"Sypialnia",side:"ogród",closed:100}]
      },
      presence: {
        icon: "⌂", time: "20:15", state: "Symulacja obecności", skyTop: "#172945", skyBottom: "#5c6770", sunX: "86%", sunY: "108px",
        conditions: ["nikogo nie ma w domu", "symulacja aktywna", "wieczór"],
        trigger: "Domownicy są poza domem, a Home Assistant automatycznie uruchamia spokojną symulację ich zwykłej obecności.",
        steps: ["Ustawia rolety w naturalnie różnych pozycjach", "Włącza światło w salonie i sypialni", "Zmienia ustawienia w czasie, aby dom wyglądał na zamieszkany"],
        result: "Rolety i wybrane światła pracują razem, dzięki czemu dom nie wygląda na całkowicie pusty.",
        windows: [{name:"Salon",side:"południe",closed:62,light:true},{name:"Kuchnia",side:"wschód",closed:38,light:false},{name:"Biuro",side:"zachód",closed:76,light:false},{name:"Sypialnia",side:"północ",closed:48,light:true}]
      }
    },
    en: {
      morning: {
        icon: "☀", time: "08:10", state: "Morning sun from the east", skyTop: "#315f78", skyBottom: "#d9a96d", sunX: "14%", sunY: "66px",
        conditions: ["21°C indoors", "someone home", "sunrise"],
        trigger: "The sun lights up the east wall, but the indoor temperature is still comfortable.",
        steps: ["Half-closes the kitchen window", "Leaves the living room fully open", "Leaves rooms still in shade uncovered"],
        result: "The home uses natural light without needlessly heating the kitchen.",
        windows: [{name:"Living room",side:"south",closed:0},{name:"Kitchen",side:"east",closed:48},{name:"Office",side:"west",closed:0},{name:"Bedroom",side:"north",closed:0}]
      },
      afternoon: {
        icon: "◉", time: "15:20", state: "Strong sun and high temperature", skyTop: "#287ba0", skyBottom: "#8fc7c9", sunX: "68%", sunY: "34px",
        conditions: ["27°C indoors", "29°C outside", "south and west"],
        trigger: "The temperature is rising and the sun hits the living room and office directly from the south and west.",
        steps: ["Lowers the living-room blinds to 70%", "Shields the office from glare on the screen", "Keeps a gap to preserve the view outside"],
        result: "The interior heats up more slowly and the air conditioning has less to do.",
        windows: [{name:"Living room",side:"south",closed:70},{name:"Kitchen",side:"east",closed:15},{name:"Office",side:"west",closed:82},{name:"Bedroom",side:"north",closed:0}]
      },
      evening: {
        icon: "☾", time: "21:35", state: "Evening privacy", skyTop: "#14233f", skyBottom: "#5c5265", sunX: "87%", sunY: "118px",
        conditions: ["after sunset", "someone home", "evening mode"],
        trigger: "The sun has set, the indoor lights are on, and the home moves into a calm evening mode.",
        steps: ["Closes every blind in the house", "Covers the rooms facing the street and the garden", "Keeps privacy once the indoor lights are on"],
        result: "Every blind is closed and the household has full privacy.",
        windows: [{name:"Living room",side:"garden",closed:100},{name:"Kitchen",side:"street",closed:100},{name:"Office",side:"street",closed:100},{name:"Bedroom",side:"garden",closed:100}]
      },
      presence: {
        icon: "⌂", time: "20:15", state: "Presence simulation", skyTop: "#172945", skyBottom: "#5c6770", sunX: "86%", sunY: "108px",
        conditions: ["nobody home", "simulation active", "evening"],
        trigger: "The household is away and Home Assistant automatically runs a calm simulation of their usual presence.",
        steps: ["Sets the blinds to naturally varied positions", "Turns on light in the living room and bedroom", "Changes the settings over time so the home looks lived in"],
        result: "The blinds and selected lights work together so the home does not look completely empty.",
        windows: [{name:"Living room",side:"south",closed:62,light:true},{name:"Kitchen",side:"east",closed:38,light:false},{name:"Office",side:"west",closed:76,light:false},{name:"Bedroom",side:"north",closed:48,light:true}]
      }
    },
    dk: {
      morning: {
        icon: "☀", time: "08:10", state: "Morgensol fra øst", skyTop: "#315f78", skyBottom: "#d9a96d", sunX: "14%", sunY: "66px",
        conditions: ["21°C indendørs", "nogen hjemme", "solopgang"],
        trigger: "Solen lyser den østlige facade op, men indetemperaturen er stadig behagelig.",
        steps: ["Trækker køkkenvinduet halvt for", "Lader stuen stå helt åben", "Lader rum, der stadig er i skygge, være udækkede"],
        result: "Hjemmet bruger naturligt lys uden at varme køkkenet unødigt op.",
        windows: [{name:"Stue",side:"syd",closed:0},{name:"Køkken",side:"øst",closed:48},{name:"Kontor",side:"vest",closed:0},{name:"Soveværelse",side:"nord",closed:0}]
      },
      afternoon: {
        icon: "◉", time: "15:20", state: "Kraftig sol og høj temperatur", skyTop: "#287ba0", skyBottom: "#8fc7c9", sunX: "68%", sunY: "34px",
        conditions: ["27°C indendørs", "29°C udenfor", "syd og vest"],
        trigger: "Temperaturen stiger, og solen rammer stuen og kontoret direkte fra syd og vest.",
        steps: ["Sænker rullegardinerne i stuen til 70%", "Skærmer kontoret mod genskin på skærmen", "Holder en sprække for at bevare udsigten"],
        result: "Boligen varmes langsommere op, og klimaanlægget har mindre at lave.",
        windows: [{name:"Stue",side:"syd",closed:70},{name:"Køkken",side:"øst",closed:15},{name:"Kontor",side:"vest",closed:82},{name:"Soveværelse",side:"nord",closed:0}]
      },
      evening: {
        icon: "☾", time: "21:35", state: "Aftenprivatliv", skyTop: "#14233f", skyBottom: "#5c5265", sunX: "87%", sunY: "118px",
        conditions: ["efter solnedgang", "nogen hjemme", "aftentilstand"],
        trigger: "Solen er gået ned, lyset indenfor er tændt, og hjemmet skifter til en rolig aftentilstand.",
        steps: ["Lukker alle rullegardiner i huset", "Dækker rummene mod gaden og haven", "Bevarer privatliv, når lyset indenfor er tændt"],
        result: "Alle rullegardiner er lukket, og familien har fuldt privatliv.",
        windows: [{name:"Stue",side:"have",closed:100},{name:"Køkken",side:"gade",closed:100},{name:"Kontor",side:"gade",closed:100},{name:"Soveværelse",side:"have",closed:100}]
      },
      presence: {
        icon: "⌂", time: "20:15", state: "Tilstedeværelsessimulering", skyTop: "#172945", skyBottom: "#5c6770", sunX: "86%", sunY: "108px",
        conditions: ["ingen hjemme", "simulering aktiv", "aften"],
        trigger: "Familien er ude, og Home Assistant kører automatisk en rolig simulering af deres normale tilstedeværelse.",
        steps: ["Sætter rullegardinerne i naturligt varierede positioner", "Tænder lys i stuen og soveværelset", "Ændrer indstillingerne over tid, så hjemmet ser beboet ud"],
        result: "Rullegardiner og udvalgte lys arbejder sammen, så hjemmet ikke ser helt tomt ud.",
        windows: [{name:"Stue",side:"syd",closed:62,light:true},{name:"Køkken",side:"øst",closed:38,light:false},{name:"Kontor",side:"vest",closed:76,light:false},{name:"Soveværelse",side:"nord",closed:48,light:true}]
      }
    }
  };
  const scenes = SCENES[LANG] || SCENES.pl;

  const windowMarkup = (item) => `<div class="blinds-window-wrap"><div class="blinds-window${item.light ? " has-light" : ""}">${item.light ? '<span class="blinds-room-light" aria-hidden="true"></span>' : ""}<span class="blinds-cover" style="--closed:${item.closed}%"></span></div><div class="blinds-window-label"><strong>${item.name}</strong><span><span class="blinds-orientation">${item.side}</span> · ${item.closed}%</span></div></div>`;

  const render = (key) => {
    const scene = scenes[key];
    mount.innerHTML = `<div class="blinds-demo-grid"><section class="blinds-visual" aria-label="${t.visual}"><div class="blinds-visual-top"><div class="blinds-current"><span class="blinds-current-icon" aria-hidden="true">${scene.icon}</span><div><small>${t.current}</small><strong>${scene.state}</strong></div></div><span class="blinds-time">${scene.time}</span></div><div class="blinds-canvas" style="--sky-top:${scene.skyTop};--sky-bottom:${scene.skyBottom};--sun-x:${scene.sunX};--sun-y:${scene.sunY}"><span class="blinds-sun" aria-hidden="true"></span><div class="blinds-house"><div class="blinds-windows">${scene.windows.map(windowMarkup).join("")}</div></div></div></section><aside class="blinds-explanation"><span class="blinds-explanation-label">${t.trigger}</span><h3>${scene.state}</h3><p>${scene.trigger}</p><div class="blinds-context">${scene.conditions.map((item) => `<span>${item}</span>`).join("")}</div><ol class="blinds-steps">${scene.steps.map((step) => `<li><span class="blinds-step-check" aria-hidden="true">✓</span><span>${step}</span></li>`).join("")}</ol><div class="blinds-result"><strong>${t.result}</strong><span>${scene.result}</span></div></aside></div>`;
    mount.dataset.currentScene = key;
    tabs.forEach((tab) => { const selected = tab.dataset.blindsScene === key; tab.classList.toggle("is-active", selected); tab.setAttribute("aria-selected", String(selected)); });
  };

  const showNextScene = () => { const order = Object.keys(scenes); const currentIndex = order.indexOf(mount.dataset.currentScene); render(order[(currentIndex + 1) % order.length]); };
  tabs.forEach((tab) => tab.addEventListener("click", () => render(tab.dataset.blindsScene)));
  mount.addEventListener("click", showNextScene);
  mount.addEventListener("keydown", (event) => { if (event.key !== "Enter" && event.key !== " ") return; event.preventDefault(); showNextScene(); });
  render("morning");
})();
