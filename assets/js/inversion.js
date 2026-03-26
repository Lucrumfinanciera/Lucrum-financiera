(() => {
  const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbzzjn_B1DcjVGaeJua4e0wUtePjW_aJooZaDBwJMU8IEsh2PLFXtUIihKjpJpMOnCsGCw/exec";
  const MIN_SUBMIT_MS = 1200;
  const DEFAULT_AMOUNT = 50000000;
  const formLoadTime = Date.now();

  const dom = {};
  let counterObserver = null;
  let revealObserver = null;

  const byId = (id) => document.getElementById(id);
  const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

  const formatInputCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value);
  };

  const trackEvent = (eventName, detail = {}) => {
    const payload = {
      event: eventName,
      page: "inversion",
      ...detail
    };
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
    window.dispatchEvent(new CustomEvent("lucrum:analytics", { detail: payload }));
  };

  const getFormMessage = (key) => dom.form?.dataset[key] || "";

  const syncPlanCards = (selectedPlan) => {
    document.querySelectorAll("[data-plan-card]").forEach((card) => {
      const active = card.dataset.planCard === selectedPlan;
      card.classList.toggle("selected", active);
      const button = card.querySelector("[data-select-plan]");
      if (!button) return;
      button.textContent = active ? (button.dataset.labelSelected || "") : (button.dataset.labelDefault || "");
    });
  };

  const initCounters = () => {
    if (counterObserver) counterObserver.disconnect();
    const counters = Array.from(document.querySelectorAll("[data-counter-target]"));
    if (!counters.length) return;

    const animate = (node) => {
      const target = Number(node.dataset.counterTarget || 0);
      const prefix = node.dataset.counterPrefix || "";
      const suffix = node.dataset.counterSuffix || "";
      const duration = 1200;
      const startedAt = performance.now();

      const step = (timestamp) => {
        const progress = Math.min(1, (timestamp - startedAt) / duration);
        const current = Math.round(target * progress);
        node.textContent = `${prefix}${current}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          node.textContent = `${prefix}${target}${suffix}`;
        }
      };

      requestAnimationFrame(step);
    };

    counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.45 });

    counters.forEach((counter) => counterObserver.observe(counter));
  };

  const initRevealObserver = () => {
    if (revealObserver) revealObserver.disconnect();
    const items = Array.from(document.querySelectorAll(".reveal:not(.visible)"));
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("visible"));
      return;
    }

    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 });

    items.forEach((item) => revealObserver.observe(item));
  };

  const bindAccordion = () => {
    if (!dom.faqList) return;
    dom.faqList.addEventListener("click", (event) => {
      const trigger = event.target.closest(".accordion-trigger");
      if (!trigger) return;
      const item = trigger.closest(".accordion-item");
      const contentId = trigger.getAttribute("aria-controls");
      const content = contentId ? byId(contentId) : null;
      const open = item.classList.toggle("active");
      trigger.setAttribute("aria-expanded", String(open));
      if (content) content.setAttribute("aria-hidden", String(!open));
    });
  };

  const bindPlanSelection = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-plan]");
      if (!button) return;
      const planKey = button.dataset.selectPlan;
      syncPlanCards(planKey);
      trackEvent("investment_plan_select", { plan: planKey });
    });
  };

  const bindAnalyticsDelegation = () => {
    document.addEventListener("click", (event) => {
      const node = event.target.closest("[data-analytics-event]");
      if (!node) return;
      trackEvent(node.dataset.analyticsEvent, {
        placement: node.dataset.analyticsPlacement || "",
        href: node.getAttribute("href") || ""
      });
    });
  };

  const clearEmailError = () => {
    if (!dom.investmentEmail || !dom.emailError) return;
    dom.investmentEmail.closest(".input-group")?.classList.remove("error");
    dom.emailError.textContent = "";
  };

  const showEmailError = (message) => {
    if (!dom.investmentEmail || !dom.emailError) return;
    dom.investmentEmail.closest(".input-group")?.classList.add("error");
    dom.emailError.textContent = message;
  };

  const isSpamSubmission = () => {
    const honeypot = dom.form?.querySelector('input[name="website"]');
    const loadTs = Number(dom.form?.dataset.loadTs || formLoadTime);
    if (honeypot && honeypot.value.trim()) {
      if (dom.formStatus) dom.formStatus.textContent = getFormMessage("statusError");
      return true;
    }
    if (Date.now() - loadTs < MIN_SUBMIT_MS) {
      if (dom.formStatus) dom.formStatus.textContent = getFormMessage("statusFast");
      return true;
    }
    return false;
  };

  const postForm = async (formData) => {
    if (dom.formStatus) {
      dom.formStatus.textContent = getFormMessage("statusSending");
      dom.formStatus.style.color = "inherit";
    }

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      if (dom.formStatus) dom.formStatus.textContent = getFormMessage("statusSuccess");
      return true;
    } catch (error) {
      if (dom.formStatus) {
        dom.formStatus.textContent = getFormMessage("statusError");
        dom.formStatus.style.color = "#b00020";
      }
      return false;
    }
  };

  const bindForm = () => {
    if (!dom.form) return;

    dom.form.dataset.loadTs = String(Date.now());
    dom.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearEmailError();

      if (!dom.form.checkValidity()) {
        dom.form.reportValidity();
        return;
      }

      if (isSpamSubmission()) return;

      if (!dom.investmentEmail?.checkValidity()) {
        showEmailError(getFormMessage("statusEmail"));
        return;
      }

      const numericAmount = Number(digitsOnly(dom.investorAmount?.value)) || DEFAULT_AMOUNT;
      const amountValue = formatInputCurrency(numericAmount);
      const payload = new FormData();
      payload.append("nombre", dom.investorName?.value.trim() || "");
      payload.append("telefono", dom.investorPhone?.value.trim() || "");
      payload.append("correo", dom.investmentEmail?.value.trim() || "");
      payload.append("empresa", "");
      payload.append("correo_empresarial", "");
      payload.append("monto_estimado", amountValue);
      payload.append("website", dom.websiteField?.value || "");
      payload.append(
        "mensaje",
        `Monto estimado a invertir: ${amountValue}\nMensaje: ${dom.investorMessage?.value.trim() || ""}`
      );

      const ok = await postForm(payload);
      trackEvent("investment_form_submit", { status: ok ? "success" : "error" });
      if (!ok) return;

      dom.form.classList.add("hidden");
      dom.successBox?.classList.remove("hidden");
      dom.form.reset();
      dom.form.dataset.loadTs = String(Date.now());
    });
  };

  const bindFormAmountFormatting = () => {
    if (!dom.investorAmount) return;
    dom.investorAmount.addEventListener("input", (event) => {
      const numeric = Number(digitsOnly(event.target.value));
      if (!numeric) {
        event.target.value = "";
        return;
      }
      event.target.value = formatInputCurrency(numeric);
    });
  };

  const initDom = () => {
    dom.faqList = byId("faq-list");
    dom.form = byId("investment-form");
    dom.formStatus = byId("investment-form-status");
    dom.successBox = byId("investment-success");
    dom.investmentEmail = byId("investor-email");
    dom.emailError = byId("investment-email-error");
    dom.investorName = byId("investor-name");
    dom.investorPhone = byId("investor-phone");
    dom.investorAmount = byId("investor-amount");
    dom.investorMessage = byId("investor-message");
    dom.websiteField = byId("website-investment");
  };

  const init = () => {
    initDom();
    bindAccordion();
    bindPlanSelection();
    bindAnalyticsDelegation();
    bindForm();
    bindFormAmountFormatting();
    syncPlanCards("capital");
    initRevealObserver();
    initCounters();
  };

  document.addEventListener("DOMContentLoaded", init);
})();
