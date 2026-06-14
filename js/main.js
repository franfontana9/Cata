/* ============================================================
   CDV — interacciones editoriales
   Cursor cuadrado · reveals · nav activa · menú mobile · módulo de materialidades
   ============================================================ */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1 · Topbar: estado al hacer scroll ---------- */
  const topbar = document.querySelector('.topbar');
  const onScroll = () => {
    topbar.classList.toggle('topbar--scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2 · Reveal: aparición gradual al entrar en viewport ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.setProperty('--reveal-delay', `${Math.min(i * 60, 300)}ms`);
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- 3 · Nav: marcar sección activa ---------- */
  const navLinks = document.querySelectorAll('.topbar__nav a');
  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => navIo.observe(s));

  /* ---------- 4 · Menú mobile (burger) ---------- */
  const burger = document.querySelector('.topbar__burger');
  const nav = document.querySelector('.topbar__nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  navLinks.forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- 5 · Smooth scroll con offset para el header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', href);
    });
  });

  /* ---------- 6 · Cursor cuadrado personalizado (solo puntero fino) ---------- */
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const cursor = document.querySelector('.cursor');
  if (finePointer && !reduceMotion) {
    document.body.classList.add('has-cursor');
    cursor.style.display = 'block';

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;  // posición real del mouse
    let cx = mx, cy = my;                                          // posición suavizada del cursor
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const render = () => {
      // lerp para movimiento suave
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };
    render();

    // crece sobre links, botones, proyectos, imágenes
    const hoverSel = 'a, button, [data-cursor], .case, .feature, .media';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel) && !e.relatedTarget?.closest?.(hoverSel)) {
        cursor.classList.remove('is-hover');
      }
    });
    document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    document.addEventListener('mouseup', () => cursor.classList.remove('is-down'));
    // ocultar cuando el mouse sale de la ventana
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  }

  /* ---------- 7 · Materialidades: configurador por capas ----------
     Inspirado en la interacción "imaginate una piscina... y ahora hazla":
     el usuario compone una muestra eligiendo materia + textura + tinta,
     las capas se superponen en vivo y "hacela" cierra la composición.
     REEMPLAZAR imágenes en assets/materialidades/muestras/ para cambiar el muestrario. */
  const M_BASE = [
    { id: 'reciclado', name: 'papel reciclado',    img: 'assets/materialidades/muestras/reciclado.jpg' },
    { id: 'hecho',     name: 'hecho a mano',       img: 'assets/materialidades/muestras/hecho-a-mano.jpg' },
    { id: 'fibra',     name: 'fibra natural',      img: 'assets/materialidades/muestras/fibra.jpg' },
    { id: 'calco',     name: 'hoja calco',         img: 'assets/materialidades/muestras/calco.jpg' }
  ];
  const M_TEX = [
    { id: 'relieve',   name: 'relieve',            img: 'assets/materialidades/muestras/relieve.jpg' },
    { id: 'vegetal',   name: 'vegetal',            img: 'assets/materialidades/muestras/vegetal.jpg' },
    { id: 'trama',     name: 'trama · grilla',     img: 'assets/materialidades/muestras/trama.jpg' },
    { id: 'huella',    name: 'huella',             img: 'assets/materialidades/muestras/huella.jpg' },
    { id: 'lisa',      name: 'sin textura',        img: '' }
  ];
  const M_TINT = [
    { id: 'natural',   name: 'natural',            color: '' },
    { id: 'naranja',   name: 'naranja',            color: '#eb5a35' },
    { id: 'verde',     name: 'verde',              color: '#17391f' },
    { id: 'crema',     name: 'crema',              color: '#f4e9cd' }
  ];
  const GROUPS = { base: M_BASE, tex: M_TEX, tint: M_TINT };

  // Frases que cierran al "hacer" la muestra (rotan según textura elegida)
  const M_LINES = {
    relieve: 'la textura hace visible el contacto.',
    vegetal: 'la naturaleza también es estructura.',
    trama:   'el orden es una forma de cuidado.',
    huella:  'lo que se toca, se percibe y deja huella.',
    lisa:    'sustentabilidad es pensar en lo que permanece.'
  };

  const build   = document.getElementById('materiaBuild');
  const layerB  = document.getElementById('layerBase');
  const layerT  = document.getElementById('layerTex');
  const layerTi = document.getElementById('layerTint');
  const nameEl  = document.getElementById('materiaName');
  const lineEl  = document.getElementById('materiaLine');
  const makeBtn = document.getElementById('materiaMake');

  if (build && layerB) {
    const sel = { base: M_BASE[0], tex: M_TEX[0], tint: M_TINT[0] };

    // Render de cada grupo de opciones
    document.querySelectorAll('.materia__opts').forEach(group => {
      const key = group.dataset.group;
      group.innerHTML = GROUPS[key].map(o => {
        const sw = o.img ? `background-image:url('${o.img}')`
                         : (o.color ? `background-color:${o.color}` : '');
        const empty = (!o.img && !o.color) ? ' materia__opt-sw--empty' : '';
        return `<button class="materia__opt" type="button" data-id="${o.id}" title="${o.name}" aria-pressed="false" data-cursor>
                  <span class="materia__opt-sw${empty}" style="${sw}"></span>
                  <span class="materia__opt-name">${o.name}</span>
                </button>`;
      }).join('');
    });

    function paint() {
      // base
      layerB.style.backgroundImage = sel.base.img ? `url('${sel.base.img}')` : 'none';
      // textura (multiply encima)
      layerT.style.backgroundImage = sel.tex.img ? `url('${sel.tex.img}')` : 'none';
      layerT.style.opacity = sel.tex.img ? '0.5' : '0';
      // tinta (color con blend)
      layerTi.style.backgroundColor = sel.tint.color || 'transparent';
      layerTi.style.opacity = sel.tint.color ? '0.32' : '0';
      // caption
      nameEl.textContent = `${sel.base.name} · ${sel.tex.name} · tinta ${sel.tint.name}`;
    }

    function choose(key, id) {
      const opt = GROUPS[key].find(o => o.id === id);
      if (!opt) return;
      sel[key] = opt;
      // marcar activo dentro del grupo
      document.querySelector(`.materia__opts[data-group="${key}"]`)
        .querySelectorAll('.materia__opt').forEach(b => {
          const on = b.dataset.id === id;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', String(on));
        });
      paint();
    }

    document.querySelectorAll('.materia__opts').forEach(group => {
      const key = group.dataset.group;
      group.addEventListener('click', e => {
        const btn = e.target.closest('.materia__opt');
        if (btn) choose(key, btn.dataset.id);
      });
    });

    // "y ahora, hacela" → gesto de cierre: pulso + frase conceptual
    makeBtn.addEventListener('click', () => {
      if (!reduceMotion) {
        build.classList.remove('is-made');
        void build.offsetWidth;        // reinicia la animación
        build.classList.add('is-made');
      }
      lineEl.textContent = M_LINES[sel.tex.id] || 'la materia también comunica.';
      makeBtn.textContent = 'hecha. ✦ otra vez →';
      setTimeout(() => { makeBtn.textContent = 'y ahora, hacela →'; }, 2600);
    });

    // Estado inicial: marcar la primera opción de cada grupo y pintar
    choose('base', sel.base.id);
    choose('tex',  sel.tex.id);
    choose('tint', sel.tint.id);
  }

  /* ---------- 8 · Escenarios que entran al scroll (Pingüino escalera + Casa tomada collage) ---------- */
  const stages = document.querySelectorAll('[data-stage], [data-pinguino]');
  stages.forEach(stage => {
    if (reduceMotion) { stage.classList.add('is-in'); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stage.classList.add('is-in');   // dispara entrada escalonada + flotación
          io.unobserve(stage);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
    io.observe(stage);
  });

})();
