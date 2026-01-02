(() => {
  const PARTNERS_URL = "../data/partners.json";
  const WHATSAPP_BASE = "https://wa.me/573007807831";
  const searchInput = document.getElementById("partner-search");
  const chipsContainer = document.getElementById("partner-chips");
  const partnersGrid = document.getElementById("partners-grid");
  const emptyState = document.getElementById("partners-empty");
  const detailContainer = document.getElementById("partners-detail-content");
  const modal = document.getElementById("ally-modal");
  const modalContent = document.getElementById("ally-modal-content");
  let revealObserver = null;
  let partners = [];
  let partnerMap = {};
  let activeCategory = "";
  let searchTerm = "";
  let previousFocus = null;
  const metaDescriptionTag = document.querySelector('meta[name="description"]');
  const originalTitle = document.title;
  const originalDescription = metaDescriptionTag ? metaDescriptionTag.getAttribute("content") : "";
  const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const normalize = (value) => value?.toLowerCase().trim() || "";
  const getPartnerFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("partner");
    if (fromQuery) return fromQuery;
    const hash = window.location.hash.replace("#", "");
    return hash || "";
  };
  const updateUrl = (slug, { replace } = {}) => {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set("partner", slug);
    } else {
      url.searchParams.delete("partner");
      url.hash = "";
    }
    const method = replace ? "replaceState" : "pushState";
    history[method](slug ? { partner: slug } : {}, "", url);
  };
  const setMetaForPartner = (partner) => {
    const title = `${partner.name} | Aliados Lucrum – Financia tu compra`;
    const desc = `Compra y financia ${partner.category.toLowerCase()} en ${partner.name} con Lucrum. Paga a cuotas y recibe respuesta rápida.`;
    document.title = title;
    if (metaDescriptionTag) {
      metaDescriptionTag.setAttribute("content", desc);
    }
  };
  const resetMeta = () => {
    document.title = originalTitle;
    if (metaDescriptionTag) {
      metaDescriptionTag.setAttribute("content", originalDescription);
    }
  };
  const buildLogo = (logo, name) => {
    const wrapper = document.createElement("div");
    wrapper.className = "ally-logo";
    if (logo) {
      const img = document.createElement("img");
      img.src = logo;
      img.alt = `${name} logo`;
      img.loading = "lazy";
      wrapper.appendChild(img);
    } else {
      wrapper.classList.add("placeholder");
      wrapper.textContent = name.slice(0, 2).toUpperCase();
    }
    return wrapper;
  };
  const buildCard = (partner) => {
    const card = document.createElement("article");
    card.className = "card ally-card reveal";
    card.setAttribute("role", "listitem");
    const logoRow = document.createElement("div");
    logoRow.className = "logo-row";
    logoRow.appendChild(buildLogo(partner.logo, partner.name));
    const textWrap = document.createElement("div");
    const nameEl = document.createElement("h3");
    nameEl.textContent = partner.name;
    const meta = document.createElement("div");
    meta.className = "partner-meta";
    meta.innerHTML = `<span>${partner.category}</span>`;
    textWrap.appendChild(nameEl);
    textWrap.appendChild(meta);
    logoRow.appendChild(textWrap);
    const figure = document.createElement("div");
    figure.className = "ally-image";
    const img = document.createElement("img");
    img.src = partner.images?.[0] || partner.logo || "../assets/img/logo.webp";
    img.alt = `${partner.name} aliado Lucrum`;
    img.loading = "lazy";
    figure.appendChild(img);
    const desc = document.createElement("p");
    desc.textContent = partner.shortDescription;
    const tags = document.createElement("div");
    tags.className = "ally-tags";
    partner.tags?.forEach((tag) => {
      const pill = document.createElement("span");
      pill.textContent = tag;
      tags.appendChild(pill);
    });
    const footer = document.createElement("div");
    footer.className = "card-footer";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-secondary";
    btn.textContent = "Ver aliado";
    btn.addEventListener("click", () => openModal(partner.slug));
    const city = document.createElement("small");
    city.textContent = partner.cities?.join(", ") || "Cobertura nacional";
    footer.appendChild(city);
    footer.appendChild(btn);
    card.appendChild(logoRow);
    card.appendChild(figure);
    card.appendChild(desc);
    card.appendChild(tags);
    card.appendChild(footer);
    return card;
  };
  const renderDetailContent = (partner) => {
    if (!detailContainer) return;
    const article = document.createElement("article");
    article.id = `partner-${partner.slug}`;
    article.innerHTML = `
      <h3>${partner.name}</h3>
      <p>${partner.longDescription}</p>
      <ul>
        ${(partner.services || []).map((service) => `<li>${service}</li>`).join("")}
      </ul>
    `;
    detailContainer.appendChild(article);
  };
  const renderGrid = () => {
    if (!partnersGrid) return;
    partnersGrid.innerHTML = "";
    if ("IntersectionObserver" in window && !revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.18
      });
    }
    const filtered = partners.filter((partner) => {
      const matchesCategory = !activeCategory || partner.category === activeCategory;
      if (!matchesCategory) return false;
      if (!searchTerm) return true;
      const haystack = [
        partner.name,
        partner.category,
        ...(partner.tags || []),
        partner.shortDescription,
        partner.longDescription,
        ...(partner.services || [])
      ].map(normalize).join(" ");
      return haystack.includes(searchTerm);
    });
    emptyState?.classList.toggle("visible", filtered.length === 0);
    filtered.forEach((partner) => {
      const card = buildCard(partner);
      partnersGrid.appendChild(card);
      if (revealObserver) {
        revealObserver.observe(card);
      } else {
        card.classList.add("visible");
      }
    });
  };
  const renderChips = () => {
    if (!chipsContainer) return;
    const categories = Array.from(new Set(partners.map((p) => p.category))).sort();
    chipsContainer.innerHTML = "";
    const addChip = (label, value = "") => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.type = "button";
      chip.textContent = label;
      chip.setAttribute("role", "listitem");
      if (value === activeCategory) chip.classList.add("active");
      chip.addEventListener("click", () => {
        activeCategory = value;
        renderChips();
        renderGrid();
      });
      chipsContainer.appendChild(chip);
    };
    addChip("Todos");
    categories.forEach((cat) => addChip(cat, cat));
  };
  const closeModal = ({ skipHistory } = {}) => {
    if (!modal) return;
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modalContent.innerHTML = "";
    if (!skipHistory) {
      updateUrl("", { replace: true });
      resetMeta();
    }
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  };
  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
    if (event.key === "Tab" && modal?.classList.contains("is-visible")) {
      const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }
  };
  const buildModal = (partner) => {
    const wrapper = document.createElement("div");
    wrapper.className = "ally-modal-body";
    const header = document.createElement("div");
    header.className = "ally-header";
    header.appendChild(buildLogo(partner.logo, partner.name));
    const text = document.createElement("div");
    const title = document.createElement("h3");
    title.id = "ally-modal-title";
    title.textContent = partner.name;
    const meta = document.createElement("div");
    meta.className = "partner-meta";
    meta.innerHTML = `<span class="partner-pill">${partner.category}</span>`;
    text.appendChild(title);
    text.appendChild(meta);
    header.appendChild(text);
    const description = document.createElement("p");
    description.textContent = partner.longDescription;
    const gallery = document.createElement("div");
    gallery.className = "ally-gallery";
    (partner.images || []).forEach((src, index) => {
      const imgWrap = document.createElement("div");
      imgWrap.className = "ally-image";
      const img = document.createElement("img");
      img.src = src;
      img.loading = index === 0 ? "eager" : "lazy";
      img.alt = `${partner.name} imagen ${index + 1}`;
      imgWrap.appendChild(img);
      gallery.appendChild(imgWrap);
    });
    if (!partner.images || partner.images.length === 0) {
      gallery.appendChild(buildLogo(partner.logo, partner.name));
    }
    const servicesTitle = document.createElement("h4");
    servicesTitle.className = "inline-label";
    servicesTitle.textContent = "Servicios";
    const services = document.createElement("ul");
    services.className = "ally-services";
    (partner.services || []).forEach((service) => {
      const li = document.createElement("li");
      li.textContent = service;
      services.appendChild(li);
    });
    const cityLabel = document.createElement("label");
    cityLabel.className = "inline-label";
    cityLabel.htmlFor = "city-select";
    cityLabel.textContent = "Selecciona tu ciudad";
    const citySelect = document.createElement("select");
    citySelect.id = "city-select";
    citySelect.className = "city-select";
    (partner.cities && partner.cities.length ? partner.cities : ["Medellín", "Bucaramanga", "Pereira"]).forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
    const ctaRow = document.createElement("div");
    ctaRow.className = "ally-cta-row";
    const waBtn = document.createElement("a");
    waBtn.className = "btn btn-primary whatsapp-btn";
    waBtn.target = "_blank";
    waBtn.rel = "noopener";
    const buildWaHref = (city) => `${WHATSAPP_BASE}?text=${encodeURIComponent(`Hola Lucrum, quiero financiar una compra con el aliado: ${partner.name}. Estoy en ${city}.`)}`;
    waBtn.href = buildWaHref(citySelect.value);
    waBtn.innerHTML = `
      <span class="whatsapp-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.77 14.89L2 22l5.27-1.37A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.09-1.12l-.29-.17-2.5.65.66-2.44-.18-.3A8 8 0 1 1 12 20Zm3.86-5.57c-.21-.1-1.25-.62-1.44-.68-.19-.07-.33-.1-.47.1-.14.19-.55.68-.68.82-.12.14-.25.15-.46.05-.21-.1-.9-.33-1.71-1.05-.63-.56-1.05-1.26-1.18-1.47-.12-.21-.01-.32.09-.42.09-.09.21-.25.32-.37.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.37-.05-.1-.47-1.13-.64-1.55-.17-.41-.34-.35-.47-.36h-.4c-.14 0-.37.05-.57.26-.19.21-.75.73-.75 1.77 0 1.04.77 2.04.88 2.18.11.14 1.52 2.32 3.67 3.26 2.15.94 2.15.63 2.54.6.39-.04 1.25-.51 1.43-1 .18-.49.18-.9.12-.99-.05-.09-.19-.14-.4-.24Z"/></svg>
      </span>
      QUIERO FINANCIAR
    `;
    citySelect.addEventListener("change", () => {
      waBtn.href = buildWaHref(citySelect.value);
    });
    const igBtn = document.createElement("a");
    igBtn.className = "btn btn-secondary";
    igBtn.target = "_blank";
    igBtn.rel = "noopener";
    igBtn.textContent = "Instagram del aliado";
    igBtn.href = partner.ctas?.instagram || "#";
    const fbBtn = document.createElement("a");
    fbBtn.className = "btn btn-secondary";
    fbBtn.target = "_blank";
    fbBtn.rel = "noopener";
    fbBtn.textContent = "Facebook del aliado";
    fbBtn.href = partner.ctas?.facebook || "#";
    ctaRow.appendChild(waBtn);
    ctaRow.appendChild(igBtn);
    ctaRow.appendChild(fbBtn);
    const ctaNote = document.createElement("p");
    ctaNote.className = "cta-note";
    ctaNote.textContent = "Respuesta rápida por WhatsApp. Pagas a cuotas, el aliado recibe el pago de inmediato.";
    wrapper.appendChild(header);
    wrapper.appendChild(description);
    wrapper.appendChild(gallery);
    wrapper.appendChild(servicesTitle);
    wrapper.appendChild(services);
    wrapper.appendChild(cityLabel);
    wrapper.appendChild(citySelect);
    wrapper.appendChild(ctaRow);
    wrapper.appendChild(ctaNote);
    return wrapper;
  };
  const openModal = (slug, { skipPush } = {}) => {
    const partner = partnerMap[slug];
    if (!partner || !modal || !modalContent) return;
    modalContent.innerHTML = "";
    modalContent.appendChild(buildModal(partner));
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    previousFocus = document.activeElement;
    const closeBtn = modal.querySelector(".ally-modal__close");
    closeBtn?.focus();
    setMetaForPartner(partner);
    if (!skipPush) updateUrl(slug);
  };
  const attachModalListeners = () => {
    modal?.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.dataset.close === "true") {
        closeModal();
      }
    });
    modal?.querySelector(".ally-modal__close")?.addEventListener("click", () => closeModal());
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("popstate", () => {
      const slug = getPartnerFromUrl();
      if (slug && partnerMap[slug]) {
        openModal(slug, { skipPush: true });
      } else {
        closeModal({ skipHistory: true });
        resetMeta();
      }
    });
  };
  const initSearch = () => {
    if (!searchInput) return;
    searchInput.addEventListener("input", (event) => {
      const target = event.target;
      searchTerm = normalize(target.value);
      renderGrid();
    });
  };
  const init = async () => {
    if (!partnersGrid) return;
    partnersGrid.setAttribute("aria-busy", "true");
    try {
      const res = await fetch(PARTNERS_URL);
      partners = await res.json();
      partnerMap = partners.reduce((acc, partner) => {
        acc[partner.slug] = partner;
        return acc;
      }, {});
      partners.forEach(renderDetailContent);
      renderChips();
      renderGrid();
      const initialSlug = getPartnerFromUrl();
      if (initialSlug && partnerMap[initialSlug]) {
        openModal(initialSlug, { skipPush: true });
      }
    } catch (error) {
      console.error("No se pudieron cargar los aliados", error);
      emptyState?.classList.add("visible");
    } finally {
      partnersGrid.removeAttribute("aria-busy");
    }
    initSearch();
    attachModalListeners();
  };
  document.addEventListener("DOMContentLoaded", init);
})();
