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

  /* ---------- 7 · Módulo interactivo de Materialidades ---------- */
  // Cada muestra: archivo en assets/materialidades/muestras/ + nombre + frase conceptual.
  // REEMPLAZAR imágenes en esa carpeta para cambiar el muestrario.
  const MUESTRAS = [
    { id: 'reciclado',    name: 'papel reciclado',        img: 'assets/materialidades/muestras/reciclado.jpg',    line: 'sustentabilidad es pensar en lo que permanece.' },
    { id: 'hecho',        name: 'papel hecho a mano',     img: 'assets/materialidades/muestras/hecho-a-mano.jpg', line: 'cada soporte deja una marca distinta.' },
    { id: 'calco',        name: 'hoja calco · transparencia', img: 'assets/materialidades/muestras/calco.jpg',   line: 'la luz atraviesa y deja capa sobre capa.' },
    { id: 'fibra',        name: 'fibra natural',          img: 'assets/materialidades/muestras/fibra.jpg',        line: 'lo que se toca, se percibe y deja huella.' },
    { id: 'vegetal',      name: 'textura vegetal',        img: 'assets/materialidades/muestras/vegetal.jpg',      line: 'la naturaleza también es estructura.' },
    { id: 'huella',       name: 'rastro · huella',        img: 'assets/materialidades/muestras/huella.jpg',       line: 'la materia guarda el gesto que la tocó.' },
    { id: 'relieve',      name: 'relieve · impresión',    img: 'assets/materialidades/muestras/relieve.jpg',      line: 'la textura hace visible el contacto.' },
    { id: 'trama',        name: 'trama · grilla',         img: 'assets/materialidades/muestras/trama.jpg',        line: 'el orden es una forma de cuidado.' }
  ];

  const picker  = document.getElementById('materiaPicker');
  const surface = document.getElementById('materiaSurface');
  const nameEl  = document.getElementById('materiaName');
  const lineEl  = document.getElementById('materiaLine');

  if (picker && surface) {
    // Render del selector
    picker.innerHTML = MUESTRAS.map((m, i) => `
      <button class="materia__item" type="button" role="option" data-mat="${m.id}" aria-selected="false">
        <span class="materia__swatch" style="background-image:url('${m.img}')"></span>
        <span class="materia__num">${String(i + 1).padStart(2, '0')}</span>
        <span>${m.name}</span>
      </button>`).join('');

    const items = picker.querySelectorAll('.materia__item');

    function select(id) {
      const m = MUESTRAS.find(x => x.id === id);
      if (!m) return;
      // transición suave de la superficie
      surface.style.opacity = '0';
      surface.style.filter = 'blur(4px)';
      setTimeout(() => {
        surface.style.backgroundImage = `url('${m.img}')`;
        surface.style.opacity = '1';
        surface.style.filter = 'none';
      }, reduceMotion ? 0 : 220);
      nameEl.textContent = m.name;
      lineEl.textContent = m.line;
      items.forEach(b => {
        const on = b.dataset.mat === id;
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-selected', String(on));
      });
    }

    items.forEach(b => b.addEventListener('click', () => select(b.dataset.mat)));
    select(MUESTRAS[0].id); // muestra inicial
  }

})();
