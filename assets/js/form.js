// ==========================================
// Helpers
// ==========================================
const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const show = (el, on) => el && el.classList.toggle('hidden', !on);

// ==========================================
// Montaje del template ANTES de inicializar
// ==========================================
function mount() {
  const tpl = $('#formTemplate');
  const container = $('#formContainer');
  if (tpl && container && !container.dataset.mounted) {
    container.appendChild(tpl.content.cloneNode(true));
    container.dataset.mounted = '1';
  }
}

// ==========================================
// Inicialización (todos tus listeners)
// ==========================================
function init() {
  // --------- 1) FATCA / Transferencias a EE.UU. ---------
  const trYes = $('#fatca_transferencias_si');
  const trNo  = $('#fatca_transferencias_no');
  const secTr = $('#seccionTransferencia');
  const updTr = () => show(secTr, trYes && trYes.checked);
  [trYes, trNo].forEach(r => r && r.addEventListener('change', updTr));
  updTr();

  // --------- 2) Transacciones en moneda extranjera ---------
  const exSi = $('#transacciones_exterior_si');
  const exNo = $('#transacciones_exterior_no');
  const opciones = $('#opcionesMoneda');
  const updEx = () => {
    const on = exSi && exSi.checked;
    show(opciones, on);
    if (!on) {
      $$('#opcionesMoneda input[name="tipo_transaccion_moneda"]').forEach(i => i.checked = false);
      show($('#otroTipoInput'), false);
    }
  };
  [exSi, exNo].forEach(r => r && r.addEventListener('change', updEx));
  updEx();

  // --------- 3) “Otros” en tipo de transacción ---------
  (function () {
    const select = $('#tipoTransaccion');
    const otrosRow = $('#otroTipoInput');
    const updateOtroTipo = () => otrosRow?.classList.toggle('hidden', !(select && select.value === 'Otros'));
    select?.addEventListener('change', updateOtroTipo);
    updateOtroTipo(); // estado inicial
  })();

  // --------- 4) PEP (fila extra si relación PEP = Sí) ---------
  (function(){
    const pepYes = $('#rel_pep_si');
    const pepNo  = $('#rel_pep_no');
    const pepRow = $('#pep_info');
    const updatePep = () => pepRow?.classList.toggle('hidden', !(pepYes && pepYes.checked));
    [pepYes, pepNo].forEach(el => el && el.addEventListener('change', updatePep));
    updatePep();
  })();

  // --------- 5) Inicial fecha/hora ---------
  (function(){
    const el = $('#fecha');
    if (!el) return;
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    el.value = `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  })();

  // --------- 6) Formatos UX ---------
  // 6a) Montos: .monto-visual ↔ .monto-real
  (function(){
    const formatMoney = (val) => val ? '$' + val.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
    $$('.monto-visual').forEach((input) => {
      let hidden = null;
      if (input.id && input.id.endsWith('Visual')) hidden = document.getElementById(input.id.replace(/Visual$/, 'Real'));
      if (!hidden) hidden = input.parentElement?.querySelector('.monto-real');
      if (!hidden) return;

      if (input.value) {
        const digits = input.value.replace(/\D/g, '');
        input.value = formatMoney(digits);
        hidden.value = digits;
      }
      input.addEventListener('input', (e) => {
        const digits = e.target.value.replace(/\D/g, '');
        hidden.value = digits;
        e.target.value = digits ? formatMoney(digits) : '';
      });
    });
  })();

  // 6b) Identificación con separador visual
  (function(){
    const numIdInput = document.querySelector('input[name="numero_identificacion"]');
    if (!numIdInput) return;
    const formatNumber = (val) => val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    numIdInput.addEventListener('input', (e) => {
      const digits = e.target.value.replace(/\D/g, '');
      e.target.value = digits ? formatNumber(digits) : '';
    });
  })();

  // 6c) Teléfonos con máscara (301) 123-456
  (function(){
    const formatCelular = (val) => {
      const digits = val.replace(/\D/g, '').slice(0, 10);
      if (digits.length <= 3) return digits ? `(${digits}` : '';
      if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    };
    ['celular_1','celular_2','telefono'].forEach(name => {
      const input = document.querySelector(`input[name="${name}"]`);
      if (!input) return;
      input.addEventListener('input', () => { input.value = formatCelular(input.value); });
    });
  })();

  // 6d) Cuenta bancaria 900-150259-72
  (function(){
    const formatCuenta = (val) => {
      const digits = val.replace(/\D/g, '').slice(0, 11);
      if (digits.length <= 3) return digits;
      if (digits.length <= 9)  return `${digits.slice(0,3)}-${digits.slice(3)}`;
      return `${digits.slice(0,3)}-${digits.slice(3,9)}-${digits.slice(9)}`;
    };
    ['cuenta1','cuenta2'].forEach(name => {
      const input = document.querySelector(`input[name="${name}"]`);
      if (!input) return;
      input.addEventListener('input', () => { input.value = formatCuenta(input.value); });
    });
  })();

  // 6e) Botón custom para inputs file
  (function(){
    $$('.file-upload').forEach(wrapper => {
      const fileInput = wrapper.querySelector('input[type=file]');
      const btn = wrapper.querySelector('.file-btn');
      if (!fileInput || !btn) return;
      btn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          btn.textContent = '📄 ' + fileInput.files[0].name;
          btn.classList.add('active');
        } else {
          btn.textContent = '📂 Seleccionar archivo';
          btn.classList.remove('active');
        }
      });
    });
  })();

  // 6f) Control de frecuencia de pago para volantes
  (function(){
    const radios = Array.from(document.querySelectorAll('input[name="frecuencia_pago"]'));
    if (!radios.length) return;

    const monthColumns = $$('.documento-col');
    const mensualWrappers = [
      document.querySelector('[data-role="mes-1-a"]'),
      document.querySelector('[data-role="mes-2-a"]'),
      document.querySelector('[data-role="mes-3-a"]')
    ].filter(Boolean);
    const mensualInputs = mensualWrappers
      .map(wrapper => wrapper.querySelector('input[type="file"]'))
      .filter(Boolean);
    const quincenaWrappers = [
      document.querySelector('[data-role="mes-1-b"]'),
      document.querySelector('[data-role="mes-2-b"]'),
      document.querySelector('[data-role="mes-3-b"]')
    ].filter(Boolean);
    const quincenaInputs = quincenaWrappers
      .map(wrapper => wrapper.querySelector('input[type="file"]'))
      .filter(Boolean);
    const labelNodes = $$('label[data-label-mensual]');

    const resetInput = (input) => {
      if (!input) return;
      if (input.value) input.value = '';
      const btn = input.closest('.file-upload')?.querySelector('.file-btn');
      if (btn) {
        btn.textContent = '📂 Seleccionar archivo';
        btn.classList.remove('active');
      }
    };

    const applyMode = (mode) => {
      const showColumns = mode === 'mensual' || mode === 'quincenal';
      const isQuincenal = mode === 'quincenal';

      monthColumns.forEach(col => {
        col.classList.toggle('hidden', !showColumns);
        col.classList.toggle('quincenal-active', isQuincenal);
      });

      quincenaWrappers.forEach(wrapper => wrapper.classList.toggle('hidden', !isQuincenal));

      mensualInputs.forEach(input => {
        if (!input) return;
        if (showColumns) {
          input.setAttribute('required', 'required');
        } else {
          input.removeAttribute('required');
          resetInput(input);
        }
      });

      quincenaInputs.forEach(input => {
        if (!input) return;
        if (isQuincenal) {
          input.setAttribute('required', 'required');
        } else {
          input.removeAttribute('required');
          resetInput(input);
        }
      });

      labelNodes.forEach(label => {
        if (!label) return;
        const text = isQuincenal ? label.dataset.labelQuincenal : label.dataset.labelMensual;
        if (text) label.textContent = text;
      });
    };

    const syncMode = () => {
      const active = radios.find(radio => radio.checked);
      applyMode(active ? active.value : null);
    };

    radios.forEach(radio => radio.addEventListener('change', syncMode));
    applyMode(null);
  })();

  // --------- 7) Multipaso + Submit ---------
  (function(){
    // ⚠️ Unifica este ID con tu HTML real
    const form = document.getElementById('formulario-conocimiento'); // si tu form tiene otro id, cámbialo aquí
    if (!form) return;

    const steps = Array.from(document.querySelectorAll('.form-step'));
    const totalSteps = steps.length;
    let current = 0;
    let submitting = false;

    const progressBar = $('#progressBar');
    if (progressBar) {
      progressBar.innerHTML = '';
      for (let i = 0; i < totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'step-dot' + (i === 0 ? ' current' : '');
        dot.textContent = (i + 1);
        progressBar.appendChild(dot);
        if (i < totalSteps - 1) {
          const line = document.createElement('div');
          line.className = 'step-line' + (i === 0 ? ' active' : '');
          progressBar.appendChild(line);
        }
      }
    }

    const getStep      = (idx) => steps[idx];
    const getNextBtn   = (idx) => getStep(idx)?.querySelector('#nextBtn');   // ideal: .nextBtn
    const getPrevBtn   = (idx) => getStep(idx)?.querySelector('#prevBtn');   // ideal: .prevBtn
    const getSubmitBtn = () => document.getElementById('submitBtn');
    const requiredInStep = (idx) => Array.from(getStep(idx)?.querySelectorAll('[required]') || []);
    const loadingOverlay = $('#loadingOverlay');
    const thankyouView   = $('#thankyouView');

    function isStepValid(idx, showErr=false){
      let ok = true;
      const radiosChecked = {};
      requiredInStep(idx).forEach(el => {
        if (el.type === 'radio') {
          if (radiosChecked[el.name]) return;
          radiosChecked[el.name] = true;
          const group = getStep(idx).querySelectorAll(`input[type="radio"][name="${el.name}"]`);
          const anyChecked = Array.from(group).some(r => r.checked);
          if (!anyChecked) ok = false;
        } else if (el.type === 'checkbox') {
          if (!el.checked) ok = false;
        } else if (!el.checkValidity()) {
          ok = false;
          if (showErr) {
            el.classList.add('invalid');
            const msg = el.closest('div')?.querySelector('.help-error');
            if (msg) msg.style.display = 'block';
          }
        } else {
          el.classList.remove('invalid');
          const msg = el.closest('div')?.querySelector('.help-error');
          if (msg) msg.style.display = 'none';
        }
      });
      return ok;
    }

    function updateButtonsState() {
      const prev = getPrevBtn(current);
      if (prev) prev.disabled = (current === 0);
      const isLast = (current === totalSteps - 1);
      const next = getNextBtn(current);
      const submit = getSubmitBtn();
      const valid = isStepValid(current, false);
      if (!isLast && next) next.disabled = !valid;
      if (isLast && submit) submit.disabled = !valid || submitting;
    }

    function updateProgressBarUI() {
      if (!progressBar) return;
      const dots = progressBar.querySelectorAll('.step-dot');
      const lines = progressBar.querySelectorAll('.step-line');
      dots.forEach((d, i) => {
        d.classList.remove('current', 'done');
        if (i < current) d.classList.add('done');
        if (i === current) d.classList.add('current');
      });
      lines.forEach((l, i) => l.classList.toggle('active', i < current));
    }

    function centerCurrentDotOnMobile(){
      if (!progressBar) return;
      if (!window.matchMedia('(max-width: 600px)').matches) return;
      const currentDot = progressBar.querySelector('.step-dot.current');
      if (!currentDot) return;
      const left = currentDot.offsetLeft - (progressBar.clientWidth / 2 - currentDot.clientWidth / 2);
      progressBar.scrollTo({ left: Math.max(left, 0), behavior: 'smooth' });
    }

    function showStep(idx) {
      steps.forEach((s, i) => s.classList.toggle('hidden', i !== idx));
      current = idx;
      updateButtonsState();
      updateProgressBarUI();
      centerCurrentDotOnMobile();
      const firstReq = requiredInStep(current)[0];
      if (firstReq) firstReq.focus({ preventScroll: true });
    }

    steps.forEach((stepEl, idx) => {
      stepEl.addEventListener('input', updateButtonsState);
      stepEl.addEventListener('change', updateButtonsState);
      const next = stepEl.querySelector('#nextBtn'); // ideal .nextBtn
      next?.addEventListener('click', () => {
        if (isStepValid(idx, true)) showStep(Math.min(idx + 1, totalSteps - 1));
      });
      const prev = stepEl.querySelector('#prevBtn'); // ideal .prevBtn
      prev?.addEventListener('click', () => showStep(Math.max(idx - 1, 0)));
    });

    // Submit con FormData + archivos en base64
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitting) return;
      if (!isStepValid(current, true)) return;
      submitting = true;
      updateButtonsState();

      // Normalización antes de enviar
      ['celular_1','celular_2','telefono','cuenta1','cuenta2','numero_identificacion'].forEach(name => {
        const input = form.querySelector(`input[name="${name}"]`);
        if (input) input.value = input.value.replace(/\D/g, '');
      });
      form.querySelectorAll('.monto-real').forEach(h => {
        h.value = h.value.replace(/^0+/, '') || '0';
      });

      // 1) Campos (no file)
      const fd = new FormData();
      for (const el of Array.from(form.elements)) {
        if (!el.name) continue;
        if (el.type === 'file') continue;
        if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) continue;
        fd.append(el.name, el.value);
      }

      // 2) Archivos (IDs esperados, ajusta si cambia tu HTML)
      const fileIds = [
        'file-cedula',
        'file-cedula2',
        'file-bancaria',
        'file-laboral',
        'file-volantes',
        'file-volantes1b',
        'file-volantes2',
        'file-volantes2b',
        'file-volantes3',
        'file-volantes3b'
      ];
      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      for (const id of fileIds) {
        const inp = document.getElementById(id);
        if (inp?.files?.length) {
          const file = inp.files[0];
          const dataURL = await toBase64(file);
          const b64 = String(dataURL).split(',')[1];
          fd.append(inp.name, b64);
          fd.append(inp.name + '_filename', file.name);
          fd.append(inp.name + '_mimetype', file.type || 'application/octet-stream');
        }
      }

      // UI: spinner
      const loadingOverlay = $('#loadingOverlay');
      const thankyouView   = $('#thankyouView');
      loadingOverlay?.classList.remove('hidden');

      try {
        const response = await fetch(form.action, { method: 'POST', body: fd, mode: 'cors', redirect: 'follow' });
        const opaqueOk = response.type === 'opaque' || response.status === 0;
        if (!response.ok && !opaqueOk) {
          let msg = 'No se pudo enviar el formulario';
          try { msg = await response.text(); } catch(e){}
          throw new Error(msg);
        }
        // Ocultar formulario → mostrar gracias
        $('.subtitle')?.classList.add('hidden');
        $('#progressBar')?.classList.add('hidden');
        steps.forEach(s => s.classList.add('hidden'));
        thankyouView?.classList.remove('hidden');
      } catch (err) {
        alert('Ocurrió un problema al enviar. Intenta de nuevo.\n' + (err.message || err));
        console.error(err);
      } finally {
        loadingOverlay?.classList.add('hidden');
        submitting = false;
        updateButtonsState();
      }
    });

    // Inicio en el paso 0
    showStep(0);
  })();
}

// ==========================================
// Arranque ordenado
// ==========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { mount(); init(); });
} else {
  mount(); init();
}
