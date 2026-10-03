(() => {
  const trigger = document.querySelector("[data-guide-topic]");
  if (!trigger || typeof HTMLDialogElement !== "function") return;

  const COPY = {
    pl: {
      lang: "pl",
      title: "Zaproponuj temat poradnika",
      intro: "Napisz, o\u00a0czym ma być poradnik. Jeśli temat może być przydatny także dla innych użytkowników, wezmę go pod uwagę przy kolejnych publikacjach.",
      topic: "Temat poradnika",
      topicPlaceholder: "np. KNX i\u00a0rolety",
      details: "Dodatkowe informacje",
      detailsPlaceholder: "Możesz dopisać, czego dokładnie chciałbyś się dowiedzieć.",
      submit: "Wyślij propozycję",
      sending: "Wysyłanie...",
      close: "Zamknij",
      ok: "Dziękuję! Propozycja tematu dotarła.",
      dryRun: "Test zakończony poprawnie. E-mail i\u00a0Telegram nie zostały wysłane.",
      error: "Nie udało się wysłać propozycji. Spróbuj ponownie lub napisz na kontakt@ha-expert.com.",
    },
    en: {
      lang: "en",
      title: "Suggest a guide topic",
      intro: "Tell me what you would like a guide on. If the topic could help other users too, I will keep it in mind when planning upcoming guides.",
      topic: "Guide topic",
      topicPlaceholder: "e.g. KNX and blinds",
      details: "Additional details",
      detailsPlaceholder: "Feel free to add what exactly you would like to learn.",
      submit: "Send suggestion",
      sending: "Sending...",
      close: "Close",
      ok: "Thank you! Your topic suggestion has been received.",
      dryRun: "Test completed. No email or Telegram message was sent.",
      error: "The suggestion could not be sent. Please try again or write to kontakt@ha-expert.com.",
    },
    da: {
      lang: "dk",
      title: "Foreslå et emne til en guide",
      intro: "Skriv, hvad guiden skal handle om. Hvis emnet også kan være nyttigt for andre brugere, tager jeg det med i overvejelserne, når jeg planlægger nye guides.",
      topic: "Emne til guiden",
      topicPlaceholder: "f.eks. KNX og persienner",
      details: "Yderligere oplysninger",
      detailsPlaceholder: "Skriv gerne, hvad du helt præcist vil vide mere om.",
      submit: "Send forslag",
      sending: "Sender...",
      close: "Luk",
      ok: "Tak! Dit forslag til et emne er modtaget.",
      dryRun: "Testen gennemført. Der blev ikke sendt e-mail eller Telegram.",
      error: "Forslaget kunne ikke sendes. Prøv igen, eller skriv til kontakt@ha-expert.com.",
    },
  };
  const t = COPY[document.documentElement.lang] || COPY.pl;
  const ENDPOINT = "https://formularz.ha-expert.com/api/contact";

  const dialog = document.createElement("dialog");
  dialog.className = "guide-topic-dialog";
  dialog.setAttribute("aria-labelledby", "guideTopicTitle");
  dialog.innerHTML = `
    <div class="card guide-topic-box">
      <button class="guide-topic-close" type="button" aria-label="${t.close}">×</button>
      <h2 id="guideTopicTitle" class="guide-topic-title">${t.title}</h2>
      <form class="guide-topic-form" novalidate>
        <p class="guide-topic-intro">${t.intro}</p>
        <div class="contact-honeypot" aria-hidden="true">
          <label for="guideTopicWebsite">Website</label>
          <input id="guideTopicWebsite" name="website" type="text" tabindex="-1" autocomplete="off" />
        </div>
        <div class="form-group">
          <label for="guideTopicTopic">${t.topic}<span>*</span></label>
          <input id="guideTopicTopic" name="topic" type="text" maxlength="200" required placeholder="${t.topicPlaceholder}" autofocus />
        </div>
        <div class="form-group">
          <label for="guideTopicDetails">${t.details}</label>
          <textarea id="guideTopicDetails" name="details" rows="3" maxlength="4000" placeholder="${t.detailsPlaceholder}"></textarea>
        </div>
        <button class="btn-primary guide-topic-submit" type="submit">${t.submit}</button>
        <div class="form-status" role="status" aria-live="polite"></div>
      </form>
      <div class="guide-topic-done" hidden>
        <p class="guide-topic-done-text" role="status"></p>
        <button class="btn-ghost guide-topic-done-close" type="button">${t.close}</button>
      </div>
    </div>`;
  document.body.append(dialog);

  const form = dialog.querySelector("form");
  const statusEl = form.querySelector(".form-status");
  const submitButton = form.querySelector(".guide-topic-submit");
  const done = dialog.querySelector(".guide-topic-done");
  const doneText = done.querySelector(".guide-topic-done-text");
  let submissionId = "";
  let isSubmitting = false;

  const newSubmissionId = () => (window.crypto && typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-guide-topic`);

  const getEndpoint = () => {
    const isLocalPreview = /^(localhost|127\.0\.0\.1|192\.168\.2\.149|100\.109\.244\.70)$/.test(window.location.hostname);
    return isLocalPreview ? `http://${window.location.hostname}:8092/api/contact` : ENDPOINT;
  };

  const leadContext = () => {
    let firstTouch = {};
    try {
      firstTouch = JSON.parse(window.sessionStorage.getItem("ha_first_touch") || "{}") || {};
    } catch (error) {
      firstTouch = {};
    }
    return {
      page_path: window.location.pathname,
      landing_page: firstTouch.landing || window.location.pathname,
      referrer: firstTouch.referrer || document.referrer || "",
      utm: String(firstTouch.query || window.location.search || "").replace(/^\?/, ""),
    };
  };

  const open = () => {
    if (dialog.open) return;
    form.hidden = false;
    done.hidden = true;
    statusEl.className = "form-status";
    statusEl.textContent = "";
    dialog.showModal();
  };

  // Własny adres zamiast /#kontakt: kliknięcie nie jest liczone jako przejście do formularza klienta.
  trigger.setAttribute("href", "#zaproponuj-temat");
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    open();
  });

  dialog.querySelector(".guide-topic-close").addEventListener("click", () => dialog.close());
  done.querySelector(".guide-topic-done-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => trigger.focus());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    form.querySelectorAll("input:not([name=website]), textarea").forEach((field) => {
      field.value = field.value.trim();
    });
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = t.sending;
    statusEl.className = "form-status";
    statusEl.textContent = "";

    const values = new FormData(form);
    submissionId = submissionId || newSubmissionId();
    const payload = new FormData();
    payload.append("form_type", "guide_topic");
    payload.append("lang", t.lang);
    payload.append("submission_id", submissionId);
    ["website", "topic", "details"].forEach((key) => payload.append(key, String(values.get(key) || "")));
    Object.entries(leadContext()).forEach(([key, value]) => payload.append(key, String(value).slice(0, 500)));

    try {
      const response = await fetch(getEndpoint(), {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || result.ok !== true) {
        throw new Error(`Guide topic rejected (${response.status})`);
      }
      // Celowo bez gtag: propozycja tematu nie jest konwersją kontaktu klienta w Google Ads.
      doneText.textContent = result.dry_run === true ? t.dryRun : t.ok;
      form.reset();
      submissionId = "";
      form.hidden = true;
      done.hidden = false;
      done.querySelector(".guide-topic-done-close").focus();
    } catch (error) {
      console.error("Guide topic submit failed:", error);
      statusEl.className = "form-status err";
      statusEl.textContent = t.error;
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = t.submit;
    }
  });
})();
