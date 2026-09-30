/* =========================================================
   Refugio de Barro — animaciones
   GSAP + ScrollTrigger + DrawSVG + SplitText (vendorizados)
   Reglas de rendimiento:
   - sólo se animan transform / opacity (y atributos SVG baratos)
   - los loops infinitos se pausan cuando su sección no está en pantalla
   - todo lo ligado al scroll usa scrub, así que se "des-anima" al volver
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const year = document.querySelector(".year");
  if (year) year.textContent = new Date().getFullYear();

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("js-motion");
    return;
  }

  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText);
  const R = gsap.utils.random;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const SVG_NS = "http://www.w3.org/2000/svg";

  /* ---------- generadores de escena (siempre, también sin movimiento) ---------- */

  // Adobes: hiladas de abajo hacia arriba dejando huecos para puerta y ventana
  function buildBricks() {
    const g = $(".b-bricks");
    if (!g || g.childElementCount) return $$("rect", g);
    const W = 40, H = 19, gap = 2, x0 = 130, x1 = 470, yBase = 462, rows = 11;
    const holes = [
      { x: 266, y: 330, w: 68, h: 140 },  // puerta
      { x: 376, y: 316, w: 64, h: 58 },   // ventana
    ];
    const hit = (x, y, w) => holes.some(h => x < h.x + h.w && x + w > h.x && y < h.y + h.h && y + H > h.y);
    for (let r = 0; r < rows; r++) {
      const y = yBase - (r + 1) * (H + gap);
      let x = x0 - (r % 2 ? W / 2 : 0);
      while (x < x1) {
        const bx = Math.max(x, x0), bw = Math.min(x + W, x1) - bx;
        if (bw > 8 && !hit(bx, y, bw)) {
          const rect = document.createElementNS(SVG_NS, "rect");
          rect.setAttribute("x", bx); rect.setAttribute("y", y);
          rect.setAttribute("width", bw - gap); rect.setAttribute("height", H);
          rect.setAttribute("rx", 3);
          g.appendChild(rect);
        }
        x += W + gap;
      }
    }
    return $$("rect", g);
  }

  function scatter(sel, n, make) {
    const g = $(sel);
    if (!g || g.childElementCount) return $$("*", g);
    for (let i = 0; i < n; i++) g.appendChild(make(i));
    return $$("*", g);
  }

  const circle = (cx, cy, r) => {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("cx", cx.toFixed(1)); c.setAttribute("cy", cy.toFixed(1)); c.setAttribute("r", r.toFixed(2));
    return c;
  };

  const bricks = buildBricks();
  const stars = scatter(".stars", 70, () => circle(R(0, 1440), R(0, 520), R(0.8, 2.4)));
  const flies = scatter(".fireflies", 14, () => circle(R(80, 1360), R(560, 760), R(2, 3.6)));

  // Loops que sólo corren mientras su sección se ve
  function loopWhileVisible(trigger, tweens) {
    tweens.forEach(t => t.pause());
    ScrollTrigger.create({
      trigger,
      start: "top bottom",
      end: "bottom top",
      onToggle: self => tweens.forEach(t => (self.isActive ? t.resume() : t.pause())),
    });
  }

  /* =========================================================
     HERO
     ========================================================= */
  function hero() {
    const content = $(".hero__content");
    const split = SplitText.create(".hero__line", { type: "chars", charsClass: "char" });
    gsap.set([content, ".scroll-hint"], { visibility: "visible" });

    // Aparición progresiva del título
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(".hero__eyebrow", { y: 20, autoAlpha: 0, duration: 0.8 })
      .from(split.chars, {
        yPercent: 110,
        autoAlpha: 0,
        rotate: () => R(-25, 25),
        scale: 0.7,
        transformOrigin: "50% 100%",
        duration: 1.1,
        ease: "back.out(1.7)",
        stagger: 0.055,
      }, "-=0.4")
      .from(".hero__underline .doodle", { drawSVG: 0, duration: 1.1, ease: "power2.inOut" }, "-=0.5")
      .from(".hero__lead", { y: 24, autoAlpha: 0, duration: 0.9 }, "-=0.8")
      .from(".hero__btn", { y: 20, autoAlpha: 0, duration: 0.7 }, "-=0.6")
      .from(".hero__note", { autoAlpha: 0, scale: 0.5, rotate: -30, duration: 0.9, ease: "back.out(2.2)" }, "-=0.3")
      .from(".scroll-hint", { autoAlpha: 0, y: 12, duration: 0.6 }, "-=0.4");

    // Garabatos: trazo manuscrito con retraso aleatorio + vaivén ocioso
    const idle = [];
    $$(".hero .doodle-svg").forEach(svg => {
      const delay = R(0.5, 2.6);
      gsap.from(svg.querySelectorAll(".doodle"), {
        drawSVG: 0, duration: R(0.8, 1.6), delay, stagger: 0.3, ease: "power1.inOut",
      });
      gsap.from(svg, { scale: 0.6, rotate: R(-35, 35), duration: 1.4, delay, ease: "elastic.out(1, 0.55)" });
      idle.push(gsap.to(svg, {
        rotate: `+=${R(-9, 9)}`, y: R(-10, 10), duration: R(2.4, 4), delay: delay + 1.4,
        repeat: -1, yoyo: true, ease: "sine.inOut",
      }));
    });

    // Ambiente vivo: nubes, pájaros, punto del scroll
    idle.push(
      gsap.to(".cloud", { x: () => R(60, 180), duration: () => R(18, 32), repeat: -1, yoyo: true, ease: "sine.inOut" }),
      gsap.to(".bird", { scaleY: 0.4, transformOrigin: "50% 50%", duration: 0.35, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.12 }),
      gsap.to(".birds", { x: 90, y: -30, duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut" }),
      gsap.to(".scroll-dot", { attr: { cy: 26 }, duration: 1.1, repeat: -1, ease: "power2.in", yoyo: true }),
    );
    loopWhileVisible(".hero", idle);

    // El paisaje se transforma con el scroll (atardece) y vuelve al subir
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
    })
      .to(".sky-dusk", { opacity: 1 }, 0)
      .to(".sun", { y: 330, scale: 1.15, transformOrigin: "50% 50%" }, 0)
      .to(".clouds", { x: -160 }, 0)
      .to(".hill--far", { y: 190 }, 0)
      .to(".hill--mid", { y: 120 }, 0)
      .to(".hill--near", { y: 55 }, 0)
      .to(".hero-window", { opacity: 1 }, 0.3)
      .to(split.chars, { y: () => R(-160, -60), stagger: { each: 0.02, from: "random" } }, 0)
      .to(content, { y: -90, autoAlpha: 0 }, 0.15)
      .to(".hero .doodle-svg", { x: () => R(-140, 140), scale: 0.4, autoAlpha: 0, stagger: 0.03 }, 0)
      .to(".scroll-hint", { autoAlpha: 0 }, 0);
  }

  /* =========================================================
     MANIFIESTO — las palabras se encienden al leer
     ========================================================= */
  function manifesto() {
    const split = SplitText.create(".manifesto__text", { type: "words" });
    gsap.fromTo(split.words, { opacity: 0.14 }, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: ".manifesto__text", start: "top 78%", end: "bottom 45%", scrub: true },
    });
    gsap.from(".manifesto__scribble .doodle", {
      drawSVG: 0, ease: "none",
      scrollTrigger: { trigger: ".manifesto__scribble", start: "top 90%", end: "top 55%", scrub: true },
    });
    $$(".manifesto__doodle").forEach((d, i) => {
      gsap.fromTo(d, { rotate: i ? 40 : -40, y: 80 }, {
        rotate: i ? -20 : 20, y: -80, ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.from(d.querySelectorAll(".doodle"), {
        drawSVG: 0, ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top 70%", end: "center center", scrub: true },
      });
    });
  }

  /* =========================================================
     CONSTRUCCIÓN — escena fijada, se arma la casa con el scroll
     ========================================================= */
  function build(isMobile) {
    const section = $(".build");
    section.classList.add("is-live");
    const steps = $$(".step");
    const count = $(".build__count");
    const marks = [0, 1, 2, 3.4, 4.4, 5.4];

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: isMobile ? "+=320%" : "+=420%",
        pin: true,
        scrub: 1,
      },
    });
    // el contador sigue al timeline suavizado (no al scroll crudo)
    tl.eventCallback("onUpdate", () => {
      const t = tl.time();
      let i = 0;
      while (i < marks.length - 1 && t >= marks[i + 1] + 0.15) i++;
      const txt = String(i + 1).padStart(2, "0");
      if (count.textContent !== txt) count.textContent = txt;
    });

    const swap = (i, at) => {
      tl.to(steps[i - 1], { autoAlpha: 0, y: -30, duration: 0.18 }, at)
        .fromTo(steps[i], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.3, immediateRender: false }, at + 0.2);
    };

    // 01 tierra
    tl.from(".b-mound", { scale: 0, y: 40, transformOrigin: "50% 100%", duration: 0.8, ease: "back.out(1.6)" }, 0);
    // 02 agua y paja
    swap(1, 1);
    tl.fromTo(".b-water .drop", { y: -260, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.12 }, 1)
      .to(".b-water .drop", { y: 130, scale: 0.3, autoAlpha: 0, transformOrigin: "50% 50%", duration: 0.3, stagger: 0.12 }, 1.35)
      .to(".b-mound", { scaleY: 0.86, scaleX: 1.08, duration: 0.2, yoyo: true, repeat: 1 }, 1.5)
      .from(".b-straw path", { drawSVG: 0, duration: 0.4, stagger: 0.05 }, 1.45);
    // 03 adobes
    swap(2, 2);
    tl.to([".b-mound", ".b-straw"], { scale: 0, autoAlpha: 0, transformOrigin: "50% 100%", duration: 0.4 }, 2)
      .from(bricks, {
        y: -420, autoAlpha: 0, rotate: () => R(-40, 40), transformOrigin: "50% 50%",
        duration: 0.3, stagger: 1.0 / bricks.length, ease: "power2.in",
      }, 2.1);
    // 04 revoque
    swap(3, 3.4);
    tl.from(".b-plaster", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.7 }, 3.45)
      .from(".b-texture path", { drawSVG: 0, duration: 0.4, stagger: 0.08 }, 3.9);
    // 05 techo vivo
    swap(4, 4.4);
    tl.from(".b-roof", { y: -300, autoAlpha: 0, duration: 0.45, ease: "bounce.out" }, 4.4)
      .from(".b-plants circle", { scale: 0, transformOrigin: "50% 50%", duration: 0.35, stagger: 0.04, ease: "back.out(3)" }, 4.8);
    // 06 refugio
    swap(5, 5.4);
    tl.from(".b-home > path:first-child, .b-home > circle:nth-child(2)", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.35 }, 5.4)
      .from(".b-window", { scale: 0, transformOrigin: "50% 50%", duration: 0.3, ease: "back.out(2)" }, 5.5)
      .from(".b-home > path:nth-of-type(2)", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.25 }, 5.5)
      .to(".b-glow", { opacity: 1, duration: 0.4 }, 5.7)
      .from(".b-smoke path", { drawSVG: 0, duration: 0.5 }, 5.8)
      .to(".b-sun", { y: 140, fill: "#e98a4a", duration: 1 }, 5.2)
      .to(section, { backgroundColor: "#f1d3ad", duration: 1 }, 5.2)
      .to(".build__bar i", { scaleX: 1, duration: tl.duration() }, 0)
      .to({}, { duration: 0.4 }); // respiro final antes de soltar el pin

    // humo vivo cuando la casa está terminada
    const smoke = gsap.to(".b-smoke", { x: 8, y: -6, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    loopWhileVisible(section, [smoke]);
  }

  /* =========================================================
     CAPÍTULOS — tarjetas flotantes
     ========================================================= */
  function chapters() {
    const cards = $$(".card");
    gsap.set(cards, { autoAlpha: 0, y: 110, rotate: () => R(-7, 7) });

    const drawIcons = batch => gsap.fromTo(
      batch.flatMap(c => $$(".card__icon .doodle", c)),
      { drawSVG: 0 }, { drawSVG: "100%", duration: 1.1, stagger: 0.12, delay: 0.25, ease: "power2.inOut", overwrite: true },
    );

    ScrollTrigger.batch(cards, {
      start: "top 88%",
      onEnter: batch => {
        gsap.to(batch, { autoAlpha: 1, y: 0, rotate: () => R(-1.6, 1.6), duration: 1.1, ease: "back.out(1.5)", stagger: 0.14, overwrite: true });
        drawIcons(batch);
      },
      onLeaveBack: batch => gsap.to(batch, { autoAlpha: 0, y: 110, rotate: () => R(-7, 7), duration: 0.6, ease: "power2.in", stagger: 0.06, overwrite: true }),
    });

    // flotación suave (distinta en cada tarjeta)
    const floats = cards.map(c => gsap.to($(".card__inner", c), {
      y: R(-12, -6), duration: R(2.4, 3.8), repeat: -1, yoyo: true, ease: "sine.inOut", delay: R(0, 1.5),
    }));
    loopWhileVisible(".chapters", floats);

    // inclinación 3D con el puntero (sólo dispositivos con hover real)
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    cards.forEach(card => {
      const inner = $(".card__inner", card);
      const rx = gsap.quickTo(inner, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(inner, "rotationY", { duration: 0.6, ease: "power3" });
      const sc = gsap.quickTo(inner, "scale", { duration: 0.5, ease: "power3" });
      let box;
      card.addEventListener("pointerenter", () => {
        box = card.getBoundingClientRect();
        sc(1.03);
        gsap.fromTo($$(".card__icon .doodle", card), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, stagger: 0.1, ease: "power2.out", overwrite: true });
      });
      card.addEventListener("pointermove", e => {
        if (!box) return;
        const px = (e.clientX - box.left) / box.width - 0.5;
        const py = (e.clientY - box.top) / box.height - 0.5;
        ry(px * 14); rx(-py * 14);
      });
      card.addEventListener("pointerleave", () => { rx(0); ry(0); sc(1); box = null; });
    });
  }

  /* =========================================================
     MATERIALES — recorrido horizontal
     ========================================================= */
  function materials() {
    const section = $(".materials");
    const track = $(".materials__track");
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const h = gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + dist(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    const inView = (panel, extra = {}) => ({
      trigger: panel, containerAnimation: h, start: "left 95%", end: "center 55%", scrub: true, ...extra,
    });

    $$(".panel").forEach(panel => {
      gsap.from(panel, { rotate: R(-10, 10), scale: 0.86, autoAlpha: 0.3, ease: "none", scrollTrigger: inView(panel) });
      gsap.from($$("h3, p", panel), { y: 40, autoAlpha: 0, stagger: 0.1, ease: "none", scrollTrigger: inView(panel) });
    });

    // cada material con su propia animación
    gsap.from(".art-earth .layer", { x: i => (i % 2 ? 200 : -200), stagger: 0.15, ease: "none", scrollTrigger: inView(".art-earth") });
    gsap.from(".art-earth .pebble", { scale: 0, transformOrigin: "50% 50%", stagger: 0.1, ease: "none", scrollTrigger: inView(".art-earth") });
    gsap.from(".art-straw .stalk", { drawSVG: 0, stagger: 0.12, ease: "none", scrollTrigger: inView(".art-straw") });
    gsap.from(".art-wood .ring", { drawSVG: 0, stagger: 0.12, ease: "none", scrollTrigger: inView(".art-wood") });
    gsap.from(".art-lime .stroke", { drawSVG: 0, stagger: 0.2, ease: "none", scrollTrigger: inView(".art-lime") });
    gsap.to(".art-sun .rays", { rotate: 180, transformOrigin: "50% 50%", ease: "none", scrollTrigger: inView(".art-sun", { end: "right left" }) });

    const sway = gsap.to(".art-straw .stalk", { rotate: 5, transformOrigin: "50% 100%", duration: 1.8, stagger: 0.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
    const water = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
      .fromTo(".w-drop", { y: -30, autoAlpha: 0 }, { y: 50, autoAlpha: 1, duration: 0.8, ease: "power2.in" })
      .to(".w-drop", { autoAlpha: 0, scaleY: 0.5, transformOrigin: "50% 100%", duration: 0.15 })
      .fromTo(".ripple", { scale: 0.2, autoAlpha: 1, transformOrigin: "50% 50%" }, { scale: 2.2, autoAlpha: 0, duration: 1.4, stagger: 0.35, ease: "power1.out" }, "<");
    loopWhileVisible(section, [sway, water]);
  }

  /* =========================================================
     VISITA — cae la noche
     ========================================================= */
  function visit() {
    const section = $(".visit");

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section, start: "top bottom", end: "top 15%", scrub: 1 },
    })
      .fromTo(section, { backgroundColor: "#3b2418" }, { backgroundColor: "#1c1a2b" }, 0)
      .from(".moon", { y: 260, autoAlpha: 0 }, 0)
      .fromTo(stars, { opacity: 0 }, { opacity: () => R(0.4, 1), stagger: { each: 0.01, from: "random" } }, 0.2)
      .to(".visit__window", { opacity: 1 }, 0.6)
      .to(".visit__glow", { opacity: 1 }, 0.7);

    const split = SplitText.create(".visit__title", { type: "chars" });
    const reveal = gsap.timeline({
      scrollTrigger: { trigger: ".visit__content", start: "top 70%", toggleActions: "play none none reverse" },
    });
    reveal
      .from(".visit .eyebrow", { y: 20, autoAlpha: 0, duration: 0.6 })
      .from(split.chars, { yPercent: 90, autoAlpha: 0, rotate: () => R(-20, 20), duration: 0.8, stagger: 0.035, ease: "back.out(1.8)" }, "-=0.3")
      .from(".visit__scribble .doodle", { drawSVG: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.4")
      .from(".visit__card", { y: 80, rotate: -3, autoAlpha: 0, duration: 1, ease: "power3.out" }, "-=0.6")
      .from(".visit__actions .btn", { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.5 }, "-=0.5")
      .from(".visit .hand-note", { autoAlpha: 0, x: -20, duration: 0.6 }, "-=0.2");

    const loops = [
      gsap.to(".visit__card", { y: -10, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" }),
      gsap.to(stars.filter((_, i) => i % 3 === 0), { scale: 0.3, transformOrigin: "50% 50%", duration: () => R(0.8, 2), repeat: -1, yoyo: true, stagger: { each: 0.2, from: "random" } }),
      ...flies.map(f => gsap.to(f, {
        x: () => R(-90, 90), y: () => R(-60, 40), opacity: () => R(0.15, 1),
        duration: () => R(2.5, 5), repeat: -1, repeatRefresh: true, ease: "sine.inOut",
      })),
    ];
    loopWhileVisible(section, loops);
  }

  /* =========================================================
     NAV + progreso
     ========================================================= */
  function chrome() {
    const nav = $(".nav");
    gsap.to(".progress span", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: self => {
        const y = self.scroll();
        nav.classList.toggle("is-scrolled", y > 40);
        nav.classList.toggle("is-hidden", self.direction === 1 && y > 300);
      },
    });
    gsap.from(".nav__logo path", { drawSVG: 0, duration: 1.6, ease: "power2.inOut", delay: 0.2 });
    gsap.from(".nav__links a", { y: -20, autoAlpha: 0, stagger: 0.06, duration: 0.6, delay: 0.3, ease: "power2.out" });
  }

  /* ---------- arranque ---------- */
  function init() {
    const mm = gsap.matchMedia();
    mm.add({
      motion: "(prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 820px)",
    }, ctx => {
      if (!ctx.conditions.motion) {
        root.classList.remove("js-motion");
        return;
      }
      root.classList.add("js-motion");
      hero();
      manifesto();
      build(ctx.conditions.mobile);
      chapters();
      materials();
      visit();
      chrome();
      return () => {
        $(".build").classList.remove("is-live");
        $$(".nav").forEach(n => n.classList.remove("is-scrolled", "is-hidden"));
      };
    });
    // recalcular al terminar de cargar fuentes / layout
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  // Esperamos las fuentes para que SplitText corte bien (con tope de tiempo)
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(init);
})();
