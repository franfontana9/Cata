/* CDV — interacciones mínimas, editoriales */

(() => {
  'use strict';

  /* ---------- Topbar: estado al hacer scroll ---------- */
  const topbar = document.querySelector('.topbar');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > 40) topbar.classList.add('topbar--scrolled');
    else topbar.classList.remove('topbar--scrolled');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal: fade-in elegante al entrar en viewport ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Pequeño stagger según el orden en que entran
        entry.target.style.setProperty('--reveal-delay', `${Math.min(i * 60, 300)}ms`);
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.08
  });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Nav: marcar sección activa ---------- */
  const navLinks = document.querySelectorAll('.topbar__nav a');
  const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href')));
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sections.forEach(s => s && navIo.observe(s));

  /* ---------- Smooth scroll para anclas (con offset para topbar) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', href);
    });
  });

  /* ---------- Parallax sutil en placeholders y media (capas) ---------- */
  const phs = document.querySelectorAll('.ph, .media');
  const parallaxIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.dataset.inview = entry.isIntersecting ? '1' : '0';
    });
  }, { threshold: 0 });
  phs.forEach(p => parallaxIo.observe(p));

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      phs.forEach(ph => {
        if (ph.dataset.inview !== '1') return;
        const rect = ph.getBoundingClientRect();
        const center = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        // Movimiento muy chico, casi imperceptible — sensación de "capa"
        ph.style.transform = `translateY(${(-center * 8).toFixed(2)}px)`;
      });
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Accesibilidad: si el usuario prefiere menos movimiento ---------- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('is-in'));
    phs.forEach(p => p.style.transform = '');
  }

  /* ---------- Picker de texturas (provisional) ---------- */
  const wood = document.querySelector('.wood');
  const picker = document.querySelector('.textura-picker');
  const toggle = picker.querySelector('[data-toggle]');
  const panel  = picker.querySelector('.textura-picker__panel');
  const list   = picker.querySelector('.textura-picker__list');

  // Helper para armar el data-url SVG de cada textura
  const svg = (w, h, filterBody) =>
    `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><filter id='w'>${filterBody}</filter><rect width='100%' height='100%' filter='url(%23w)'/></svg>`;

  // Cada textura: { name, url, opacity, size }
  // El color crema base #f4e9cd queda SIEMPRE igual; estas texturas se aplican multiplicadas encima.
  // Selección curada: 6 texturas + sin textura.
  const TEXTURES = [
    { id: 0, name: 'sin textura',         url: '', opacity: 0, size: '0px' },
    { id: 1, name: 'madera vertical',     opacity: 0.40, size: '900px 1600px',
      url: svg(900,1600, "<feTurbulence type='fractalNoise' baseFrequency='1.1 0.008' numOctaves='3' seed='9'/><feColorMatrix values='0 0 0 0 0.50  0 0 0 0 0.32  0 0 0 0 0.16  0 0 0 0.7 0'/>") },
    { id: 2, name: 'bambú',               opacity: 0.42, size: '700px 1400px',
      url: svg(700,1400, "<feTurbulence type='fractalNoise' baseFrequency='4.5 0.02' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.18  0 0 0 0.75 0'/><feComponentTransfer><feFuncA type='linear' slope='1.6' intercept='-0.4'/></feComponentTransfer>") },
    { id: 3, name: 'fibras horizontales', opacity: 0.45, size: '1400px 900px',
      url: svg(1400,900, "<feTurbulence type='fractalNoise' baseFrequency='0.012 1.4' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.40  0 0 0 0 0.22  0 0 0 0.55 0'/>") },
    { id: 4, name: 'lino · cruzada',      opacity: 0.42, size: '1000px 1000px',
      url: svg(1000,1000,"<feTurbulence type='fractalNoise' baseFrequency='0.9 0.9' numOctaves='2' seed='6' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.50  0 0 0 0 0.34  0 0 0 0 0.18  0 0 0 0.55 0'/>") },
    { id: 5, name: 'papel artesanal',     opacity: 0.42, size: '900px 900px',
      url: svg(900,900,  "<feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' seed='21' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.50  0 0 0 0 0.34  0 0 0 0 0.16  0 0 0 0.55 0'/><feComponentTransfer><feFuncA type='gamma' amplitude='1.4' exponent='0.9'/></feComponentTransfer>") },
    { id: 6, name: 'pergamino',           opacity: 0.34, size: '1200px 1200px',
      url: svg(1200,1200,"<feTurbulence type='fractalNoise' baseFrequency='0.015 0.95' numOctaves='3' seed='17'/><feColorMatrix values='0 0 0 0 0.62  0 0 0 0 0.42  0 0 0 0 0.22  0 0 0 0.5 0'/>") }
  ];

  // Renderiza los items del dropdown
  list.innerHTML = TEXTURES.map(t => {
    const num = String(t.id).padStart(2, '0');
    return `
      <li>
        <button data-texture="${t.id}" type="button">
          <span class="textura-picker__preview"></span>
          <span class="textura-picker__name">
            <span class="textura-picker__num">${num}</span>
            <span>${t.name}</span>
          </span>
        </button>
      </li>`;
  }).join('');

  const buttons = list.querySelectorAll('[data-texture]');

  // Aplica el background a cada preview directamente por JS — evita el bug de comillas en style inline
  buttons.forEach((btn) => {
    const id = btn.dataset.texture;
    const t = TEXTURES.find(x => String(x.id) === String(id));
    const preview = btn.querySelector('.textura-picker__preview');
    if (t && t.url) {
      preview.style.backgroundImage = `url("${t.url}")`;
      preview.style.backgroundSize = '60px 60px';
    } else {
      preview.classList.add('textura-picker__preview--empty');
    }
  });

  function applyTexture(id) {
    const t = TEXTURES.find(x => String(x.id) === String(id));
    if (!t) return;
    if (t.url === '') {
      wood.style.backgroundImage = 'none';
      wood.style.opacity = '0';
    } else {
      wood.style.backgroundImage = `url("${t.url}")`;
      wood.style.opacity = t.opacity;
      wood.style.backgroundSize = t.size;
    }
    buttons.forEach(b => b.classList.toggle('is-selected', b.dataset.texture === String(id)));
    try { localStorage.setItem('cdv-texture', String(id)); } catch (_) {}
  }

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(panel.hidden); // si está hidden → abrir, si está visible → cerrar
  });

  buttons.forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    applyTexture(b.dataset.texture);
  }));

  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (panel.hidden) return;
    if (picker.contains(e.target)) return;
    setOpen(false);
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  // Restaurar la última elegida (o default = 1)
  const saved = (() => { try { return localStorage.getItem('cdv-texture'); } catch (_) { return null; }})();
  applyTexture(saved ?? '1');
})();
