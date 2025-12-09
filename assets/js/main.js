const restrictedDomains=["gmail.com", "hotmail.com", "outlook.com", "yahoo.com"];
const FORM_ENDPOINT="https://script.google.com/macros/s/AKfycbxnXG9WuLzFjSLOR0tJenPlna_TqyqAAn1XrXI04_bq7V2WQ-s2JrDgxmKsGH_W2_GFZw/exec";
const MIN_SUBMIT_MS=1200;
const formLoadTime=Date.now();
let headerInitialized=false;
let currentMode="persona";
const loadHeader=async()=>{
  const placeholder=document.getElementById("header-placeholder");
  if(!placeholder)return;
  const src=placeholder.getAttribute("data-src")||"header.html";
  try{
    const res=await fetch(src);
    const html=await res.text();
    placeholder.outerHTML=html;
    window.dispatchEvent(new Event("headerLoaded"));
  }
  catch(error){
    console.error("No se pudo cargar el encabezado", error);
  }
};
const FOOTER_FALLBACK=`
<footer class="site-footer" id="footer">
  <div class="container footer-grid premium-footer">
    <div class="footer-brand">
      <img class="footer-logo" src="img/logo2.webp" alt="Logo Lucrum Financiera" width="180" height="48" loading="lazy" decoding="async">
      <div class="social-row" aria-label="Redes sociales">
        <a href="https://www.facebook.com/share/162QvEmgM2/?mibextid=wwXIfr" aria-label="Facebook" target="_blank" rel="noopener" class="social-button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.57 9.88v-7h-2.2V12h2.2V9.8c0-2.17 1.29-3.37 3.27-3.37.95 0 1.94.17 1.94.17v2.14h-1.09c-1.07 0-1.41.66-1.41 1.34V12h2.4l-.38 2.88h-2.02v7A10 10 0 0 0 22 12Z" fill="currentColor"/></svg>
        </a>
        <a href="https://www.instagram.com/lucrum.financiera?igsh=MTkxM2diN3owY3B6ag%3D%3D&utm_source=qr" aria-label="Instagram" target="_blank" rel="noopener" class="social-button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 3.2A3.8 3.8 0 1 1 8.2 10 3.8 3.8 0 0 1 12 8.2Zm0 6.09A2.29 2.29 0 1 0 9.71 12 2.29 2.29 0 0 0 12 14.29Zm4.35-6.89a1.02 1.02 0 1 1 1.02-1.02 1.02 1.02 0 0 1-1.02 1.02Z" fill="currentColor"/></svg>
        </a>
        <a href="https://www.tiktok.com/@lucrum.financiera?_r=1&_t=ZS-91v49h4vz3E" aria-label="TikTok" target="_blank" rel="noopener" class="social-button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 9.86a5.83 5.83 0 0 1-3.53-1.18v5.56a5.91 5.91 0 1 1-5.9-5.91h.43v2.26h-.43a3.65 3.65 0 1 0 3.65 3.65V3h2.25a3.58 3.58 0 0 0 3.53 3.26Z" fill="currentColor"/></svg>
        </a>
        <a href="https://www.linkedin.com/company/lucrum-financiera" aria-label="LinkedIn" target="_blank" rel="noopener" class="social-button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.16 8.63V19H2.08V8.63h3.08ZM3.62 7.27a1.79 1.79 0 1 1 1.8-1.8 1.79 1.79 0 0 1-1.8 1.8ZM21.92 19h-3.08v-5.16c0-1.23-.02-2.8-1.71-2.8-1.71 0-1.97 1.34-1.97 2.72V19h-3.08V8.63h2.96v1.43h.04a3.25 3.25 0 0 1 2.93-1.61c3.13 0 3.71 2.06 3.71 4.75V19Z" fill="currentColor"/></svg>
        </a>
      </div>
    </div>
    <div class="footer-contact">
      <h3>Contáctanos</h3>
      <p>WhatsApp: +57 300 863 3225</p>
      <p>Correo: contacto@lucrumfinanciera.com</p>
    </div>
    <div class="footer-legal">
      <h3>Legal y programa</h3>
      <a href="legal.html#terminos-condiciones">Términos</a>
      <a href="legal.html#politica-privacidad">Políticas de privacidad</a>
      <p>Conecta con nuestro equipo y crea beneficios de crédito por nómina.</p>
      <a class="btn btn-primary btn-pay" href="https://checkout.wompi.co/l/qQpQfA" target="_blank" rel="noopener">Quiero Pagar</a>
      <a class="btn btn-primary" href="index.html#lead-form">Ir a aliados</a>
      <a class="btn btn-primary" href="mailto:gestionhumana@lucrumfinanciera.com?subject=Hoja%20de%20vida%20-%20Lucrum%20Financiera&body=Adjunta%20tu%20hoja%20de%20vida%20para%20revisi%C3%B3n.">Trabaja con Nosotros</a>
    </div>
  </div>
  <div class="footer-separator"></div>
  <div class="copyright">© 2025 | Lucrum Financiera S.A.S. | Todos los derechos reservados.</div>
</footer>
<a class="whatsapp-bubble" href="https://wa.me/573008633225" target="_blank" rel="noopener" aria-label="WhatsApp Lucrum">
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path fill="#fff" d="M12 2a10 10 0 0 0-8.77 14.89L2 22l5.27-1.37A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.09-1.12l-.29-.17-2.5.65.66-2.44-.18-.3A8 8 0 1 1 12 20Zm3.86-5.57c-.21-.1-1.25-.62-1.44-.68-.19-.07-.33-.1-.47.1-.14.19-.55.68-.68.82-.12.14-.25.15-.46.05-.21-.1-.9-.33-1.71-1.05-.63-.56-1.05-1.26-1.18-1.47-.12-.21-.01-.32.09-.42.09-.09.21-.25.32-.37.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.37-.05-.1-.47-1.13-.64-1.55-.17-.41-.34-.35-.47-.36h-.4c-.14 0-.37.05-.57.26-.19.21-.75.73-.75 1.77 0 1.04.77 2.04.88 2.18.11.14 1.52 2.32 3.67 3.26 2.15.94 2.15.63 2.54.6.39-.04 1.25-.51 1.43-1 .18-.49.18-.9.12-.99-.05-.09-.19-.14-.4-.24Z"/>
  </svg>
</a>
`;
const loadFooter=async()=>{
  const placeholder=document.getElementById("footer-placeholder");
  if(!placeholder)return;
  const base=placeholder.getAttribute("data-src")||"footer.html";
  const src=base.includes("?")?`${base}&v=2`:`${base}?v=2`;
  try{
    const res=await fetch(src);
    if(!res.ok)throw new Error(`Status ${res.status}`);
    const html=await res.text();
    if(!html.trim())throw new Error("Footer vacío");
    placeholder.outerHTML=html;
  }
  catch(error){
    console.error("No se pudo cargar el pie de página", error);
    placeholder.outerHTML=FOOTER_FALLBACK;
  }
};
const initHeader=()=>{
  if(headerInitialized)return;
  const menuToggle=document.querySelector(".menu-toggle");
  const mainNav=document.getElementById("main-menu");
  const navOverlay=document.querySelector(".nav-overlay");
  const header=document.querySelector(".site-header");
  if(!menuToggle||!mainNav||!header)return;
  headerInitialized=true;
  const closeNav=()=>{
    document.body.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };
  const toggleNav=()=>{
    const isOpen=document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  };
  menuToggle.addEventListener("click", toggleNav);
  if(navOverlay)navOverlay.addEventListener("click", closeNav);
  mainNav.querySelectorAll("a").forEach((link)=>link.addEventListener("click", closeNav));
  const highlightActiveLink=()=>{
    const path=window.location.pathname.split("/").pop()||"index.html";
    const currentPage=path===""?"index.html":path;
    mainNav.querySelectorAll("a").forEach((link)=>{
      const href=link.getAttribute("href")||"";
      const linkPage=href.split("/").pop();
      const isActive=(currentPage==="index.html"&&(linkPage==="index.html"||linkPage===""))||linkPage===currentPage;
      link.classList.toggle("active", isActive);
    }
    );
  };
  highlightActiveLink();
  const handleScrollHeader=()=>{
    const scrolled=window.scrollY>10;
    header.classList.toggle("header-transparent", !scrolled);
  };
  window.addEventListener("scroll", handleScrollHeader, {
    passive:true
  }
  );
  handleScrollHeader();
};
const modeData={
  persona:{
    title:"Créditos por nómina incluso si estás reportado.", subtitle:"Accede a financiación justa, rápida y digital, incluso si tu historial no es perfecto.", bullets:["Aprobación en máximo 24 horas", "Aplica para reportados", "Sin codeudor y compra de cartera"], ctaText:"Solicita tu crédito", ctaLink:"form.html", note:"Nos comunicaremos contigo en menos de 24 horas hábiles.", messageLabel:"Mensaje", messagePlaceholder:"Cuéntanos qué necesitas", 
  }
  , empresa:{
    title:"Financia a tu equipo y genera ingresos adicionales para tu empresa.", subtitle:"Ofrece créditos por nómina a tus empleados y recibe comisiones mensuales del 1% sobre la cartera.", bullets:["1% de comisión mensual", "Sin riesgo operativo", "Mejora clima laboral"], ctaText:"Programa corporativo", ctaLink:"index.html#lead-form", note:"Te contactamos para alinear el programa corporativo.", messageLabel:"Mensaje para empresas", messagePlaceholder:"Cuéntanos sobre tu empresa y el tamaño del equipo", 
  }
  , 
};
const setToggleState=(mode)=>{
  document.querySelectorAll(".toggle-btn").forEach((btn)=>{
    const isActive=btn.dataset.mode===mode;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  }
  );
};
const setGroupError=(inputEl, errorEl, message)=>{
  const group=inputEl?.closest(".input-group");
  if(group)group.classList.add("error");
  if(errorEl)errorEl.textContent=message||"";
};
const clearGroupError=(inputEl, errorEl)=>{
  const group=inputEl?.closest(".input-group");
  if(group)group.classList.remove("error");
  if(errorEl)errorEl.textContent="";
};
const applyMode=(mode)=>{
  const heroTitle=document.getElementById("hero-title");
  const heroSubtitle=document.getElementById("hero-subtitle");
  const heroBullets=document.getElementById("hero-bullets");
  const heroCta=document.getElementById("hero-cta");
  const formNote=document.getElementById("form-note");
  const mensajeLabel=document.getElementById("mensaje-label");
  const mensajeField=document.getElementById("mensaje");
  const empresaFields=document.querySelectorAll(".empresa-only");
  const personaFields=document.querySelectorAll(".persona-only");
  const data=modeData[mode];
  if(!data||!heroTitle||!heroSubtitle||!heroBullets||!heroCta||!formNote||!mensajeLabel||!mensajeField){
    return;
  }
  heroTitle.textContent=data.title;
  heroSubtitle.textContent=data.subtitle;
  heroBullets.innerHTML=data.bullets.map((item)=>`<li>${item}</li>`).join("");
  heroCta.textContent=data.ctaText;
  heroCta.href=data.ctaLink;
  formNote.textContent=data.note;
  mensajeLabel.textContent=data.messageLabel;
  mensajeField.placeholder=data.messagePlaceholder;
  currentMode=mode;
  setToggleState(mode);
  const isEmpresa=mode==="empresa";
  empresaFields.forEach((field)=>{
    field.classList.toggle("hidden", !isEmpresa);
    const input=field.querySelector("input");
    if(input){
      input.required=isEmpresa;
      if(!isEmpresa)input.value="";
    }
  }
  );
  personaFields.forEach((field)=>{
    const input=field.querySelector("input");
    field.classList.toggle("hidden", isEmpresa);
    if(input){
      input.required=!isEmpresa;
      if(isEmpresa)input.value="";
    }
  }
  );
};
const initModeToggle=()=>{
  document.querySelectorAll(".toggle-btn").forEach((btn)=>{
    btn.addEventListener("click", ()=>applyMode(btn.dataset.mode));
  }
  );
  applyMode(currentMode);
};
const initContactoToggle=()=>{
  const buttons=document.querySelectorAll(".contact-toggle-btn");
  const hiddenField=document.getElementById("contacto-tipo");
  const contactForm=document.getElementById("form-contacto");
  const companyGroup=document.querySelectorAll(".contact-empresa-only");
  const personaEmailGroup=document.querySelectorAll(".contact-persona-only");
  const companyInput=document.getElementById("empresa-contacto");
  const corpEmailInput=document.getElementById("correo-emp-contacto");
  const corpEmailError=document.getElementById("contacto-corp-email-error");
  const emailError=document.getElementById("contacto-email-error");
  if(!buttons.length||!hiddenField)return;
  const setMode=(mode)=>{
    hiddenField.value=mode;
    const isEmpresa=mode==="empresa";
    companyGroup.forEach((field)=>{
      field.classList.toggle("hidden", !isEmpresa);
      const input=field.querySelector("input");
      if(input){
        input.required=isEmpresa;
        if(!isEmpresa){
          input.value="";
          clearGroupError(input, field.querySelector(".input-error"));
        }
      }
    }
    );
    personaEmailGroup.forEach((field)=>{
      field.classList.toggle("hidden", isEmpresa);
      const input=field.querySelector("input");
      if(input){
        input.required=!isEmpresa;
        if(isEmpresa){
          input.value="";
          clearGroupError(input, field.querySelector(".input-error"));
        }
      }
    }
    );
    if(!isEmpresa){
      clearGroupError(corpEmailInput, corpEmailError);
    }
    clearGroupError(document.getElementById("correo-contacto"), emailError);
    buttons.forEach((btn)=>{
      const isActive=btn.dataset.contactMode===mode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    }
    );
  };
  buttons.forEach((btn)=>btn.addEventListener("click", ()=>{
    setMode(btn.dataset.contactMode||"persona");
  }
  ));
  setMode(hiddenField.value||"persona");
};
const initAccordions=()=>{
  document.querySelectorAll(".accordion-trigger").forEach((trigger)=>{
    const contentId=trigger.getAttribute("aria-controls");
    const content=contentId?document.getElementById(contentId):null;
    if(content&&!content.classList.contains("active")){
      content.setAttribute("aria-hidden", "true");
    }
    trigger.addEventListener("click", ()=>{
      const item=trigger.closest(".accordion-item");
      const isOpen=item?.classList.toggle("active");
      trigger.setAttribute("aria-expanded", String(Boolean(isOpen)));
      if(content)content.setAttribute("aria-hidden", String(!isOpen));
    }
    );
  }
  );
};
const initObserver=()=>{
  const reveals=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver"in window)||!reveals.length)return;
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
    );
  }
  , {
    threshold:0.18
  }
  );
  reveals.forEach((el)=>observer.observe(el));
};
const initSmoothScroll=()=>{
  document.querySelectorAll('a[href^="#"]').forEach((anchor)=>{
    anchor.addEventListener("click", (e)=>{
      const targetId=anchor.getAttribute("href");
      if(!targetId||targetId==="#")return;
      const target=document.querySelector(targetId);
      if(target){
        e.preventDefault();
        target.scrollIntoView({
          behavior:"smooth"
        }
        );
      }
    }
    );
  }
  );
};
const isSpamSubmission=(form, statusEl)=>{
  const honeypot=form.querySelector('input[name="website"]');
  const loadTs=Number(form.dataset.loadTs||formLoadTime);
  if(honeypot&&honeypot.value.trim()){
    if(statusEl)statusEl.textContent="No pudimos enviar tu solicitud. Intenta de nuevo.";
    return true;
  }
  if(Date.now()-loadTs<MIN_SUBMIT_MS){
    if(statusEl)statusEl.textContent="Envío demasiado rápido. Intenta de nuevo.";
    return true;
  }
  return false;
};
const postForm=async(form, statusEl)=>{
  const endpoint=form.getAttribute("action")||FORM_ENDPOINT;
  const formData=new FormData(form);
  formData.delete("website");
  if(statusEl)statusEl.textContent="Enviando...";
  try{
    const res=await fetch(endpoint, {
      method:"POST", body:formData, 
    }
    );
    if(!res.ok)throw new Error(`Error ${res.status}`);
    if(statusEl){
      statusEl.textContent="Recibimos tu información. Te contactaremos pronto.";
      statusEl.style.color="inherit";
    }
    form.reset();
    form.dataset.loadTs=String(Date.now());
    return true;
  }
  catch(error){
    if(statusEl){
      statusEl.textContent="No pudimos enviar tu solicitud. Intenta de nuevo.";
      statusEl.style.color="#b00020";
    }
    return false;
  }
};
const validateCorporateEmail=(email)=>{
  const domain=(email.split("@")[1]||"").toLowerCase();
  return Boolean(domain)&&!restrictedDomains.includes(domain);
};
const handleLeadForm=()=>{
  const leadForm=document.getElementById("lead-form");
  if(!leadForm)return;
  leadForm.dataset.loadTs=String(Date.now());
  const statusEl=document.getElementById("form-status");
  const emailInput=document.getElementById("correo");
  const emailError=document.getElementById("lead-email-error");
  const corpEmailInput=document.getElementById("correo-emp-lead");
  const corpEmailError=document.getElementById("lead-corp-email-error");
  const successBox=document.getElementById("lead-success");
  const resetErrors=()=>{
    clearGroupError(emailInput, emailError);
    clearGroupError(corpEmailInput, corpEmailError);
  };
  leadForm.addEventListener("submit", async(e)=>{
    e.preventDefault();
    if(!leadForm.checkValidity()){
      leadForm.reportValidity();
      return;
    }
    leadForm.dataset.loadTs=leadForm.dataset.loadTs||String(Date.now());
    if(isSpamSubmission(leadForm, statusEl))return;
    resetErrors();
    if(emailInput&&!emailInput.checkValidity()){
      setGroupError(emailInput, emailError, "Escribe un correo válido.");
      return;
    }
    if(currentMode==="empresa"){
      const primaryEmailValid=emailInput&&validateCorporateEmail(emailInput.value.trim());
      const corpEmailValid=corpEmailInput&&validateCorporateEmail(corpEmailInput.value.trim());
      if(!primaryEmailValid){
        setGroupError(emailInput, emailError, "Usa tu correo corporativo para este programa.");
      }
      if(!corpEmailValid){
        setGroupError(corpEmailInput, corpEmailError, "Solo aceptamos correos empresariales (no Gmail/Hotmail/Outlook/Yahoo).");
      }
      if(!primaryEmailValid||!corpEmailValid)return;
    }
    const ok=await postForm(leadForm, statusEl);
    if(ok){
      leadForm.classList.add("hidden");
      if(successBox)successBox.classList.remove("hidden");
    }
  }
  );
};
const handleContactoForm=()=>{
  const contactForm=document.getElementById("form-contacto");
  if(!contactForm)return;
  contactForm.dataset.loadTs=String(Date.now());
  const statusEl=document.getElementById("form-contacto-status");
  const successBox=document.getElementById("contacto-success");
  const emailField=document.getElementById("correo-contacto");
  const emailError=document.getElementById("contacto-email-error");
  const corpEmailField=document.getElementById("correo-emp-contacto");
  const corpEmailError=document.getElementById("contacto-corp-email-error");
  const tipoField=document.getElementById("contacto-tipo");
  const resetError=()=>{
    clearGroupError(emailField, emailError);
    clearGroupError(corpEmailField, corpEmailError);
  };
  contactForm.addEventListener("submit", async(e)=>{
    e.preventDefault();
    if(!contactForm.checkValidity()){
      contactForm.reportValidity();
      return;
    }
    contactForm.dataset.loadTs=contactForm.dataset.loadTs||String(Date.now());
    if(isSpamSubmission(contactForm, statusEl))return;
    resetError();
    if(emailField&&!emailField.checkValidity()){
      setGroupError(emailField, emailError, "Escribe un correo válido.");
      return;
    }
    const mode=tipoField?.value||"persona";
    if(mode==="empresa"){
      const corpOk=corpEmailField&&validateCorporateEmail(corpEmailField.value.trim());
      if(!corpOk){
        setGroupError(corpEmailField, corpEmailError, "Usa tu correo corporativo para este programa.");
        return;
      }
      const emailOk=emailField&&validateCorporateEmail(emailField.value.trim());
      if(!emailOk){
        setGroupError(emailField, emailError, "Usa tu correo corporativo para este programa.");
        return;
      }
    }
    const ok=await postForm(contactForm, statusEl);
    if(ok){
      contactForm.classList.add("hidden");
      if(successBox)successBox.classList.remove("hidden");
    }
  }
  );
};
const handleAliadosForm=()=>{
  const aliadosForm=document.getElementById("form-aliados");
  if(!aliadosForm)return;
  aliadosForm.dataset.loadTs=String(Date.now());
  const statusEl=document.getElementById("form-aliados-status");
  const emailField=document.getElementById("correo-emp");
  const emailError=document.getElementById("aliados-email-error");
  const resetError=()=>{
    clearGroupError(emailField, emailError);
    if(statusEl)statusEl.style.color="inherit";
  };
  aliadosForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    if(!aliadosForm.checkValidity()){
      aliadosForm.reportValidity();
      return;
    }
    aliadosForm.dataset.loadTs=aliadosForm.dataset.loadTs||String(Date.now());
    if(isSpamSubmission(aliadosForm, statusEl))return;
    resetError();
    if(emailField&&!emailField.checkValidity()){
      setGroupError(emailField, emailError, "Escribe un correo válido.");
      return;
    }
    const email=emailField?.value.trim().toLowerCase()||"";
    if(!validateCorporateEmail(email)){
      setGroupError(emailField, emailError, "Necesitamos un correo empresarial para avanzar con el programa corporativo.");
      if(statusEl)statusEl.style.color="#b00020";
      return;
    }
    postForm(aliadosForm, statusEl);
  }
  );
};
const initSimulador=()=>{
  const montoInput=document.getElementById("monto");
  const plazoInput=document.getElementById("plazo");
  const valorMonto=document.getElementById("valorMonto");
  const valorPlazo=document.getElementById("valorPlazo");
  const resMonto=document.getElementById("resMonto");
  const resPlazo=document.getElementById("resPlazo");
  const resCuota=document.getElementById("resCuota");
  const updateRangeTrack=(input)=>{
    if(!input)return;
    const min=Number(input.min)||0;
    const max=Number(input.max)||100;
    const val=Number(input.value)||min;
    const percent=Math.min(100, Math.max(0, ((val-min)/(max-min))*100));
    input.style.setProperty("--fill", `${percent}%`);
  };
  const mostrarValores=()=>{
    if(!montoInput||!plazoInput||!valorMonto||!valorPlazo||!resMonto||!resPlazo)return;
    const monto=parseInt(montoInput.value, 10);
    const plazo=parseInt(plazoInput.value, 10);
    valorMonto.textContent=`$${monto.toLocaleString("es-CO")}`;
    valorPlazo.textContent=`${plazo} mes${plazo > 1 ? "es" : ""}`;
    resMonto.textContent=`$${monto.toLocaleString("es-CO")}`;
    resPlazo.textContent=`${plazo} mes${plazo > 1 ? "es" : ""}`;
  };
  const calcular=()=>{
    if(!montoInput||!plazoInput||!resCuota)return;
    const montoBase=parseInt(montoInput.value, 10);
    const monto=Math.round(montoBase*1.5532606667);
    const plazo=parseInt(plazoInput.value, 10);
    const tasa=2.08/100;
    const cuota=(monto*tasa*Math.pow(1+tasa, plazo))/(Math.pow(1+tasa, plazo)-1);
    resCuota.textContent=`$${Math.round(cuota).toLocaleString("es-CO")}`;
  };
  if(montoInput&&plazoInput&&valorMonto&&valorPlazo&&resMonto&&resPlazo&&resCuota){
    montoInput.addEventListener("input", ()=>{
      mostrarValores();
      calcular();
      updateRangeTrack(montoInput);
    }
    );
    plazoInput.addEventListener("input", ()=>{
      mostrarValores();
      calcular();
      updateRangeTrack(plazoInput);
    }
    );
    updateRangeTrack(montoInput);
    updateRangeTrack(plazoInput);
    mostrarValores();
    calcular();
  }
};
const initPage=()=>{
  initModeToggle();
  initContactoToggle();
  initAccordions();
  initObserver();
  initSmoothScroll();
  handleLeadForm();
  handleContactoForm();
  handleAliadosForm();
  initSimulador();
};
window.addEventListener("headerLoaded", initHeader);
document.addEventListener("DOMContentLoaded", ()=>{
  loadHeader().then(()=>{
    initHeader();
    initPage();
  }
  );
  loadFooter();
}
);
