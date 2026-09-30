/* =========================================================
   Refugio de Barro — música ambiente generativa (Web Audio)
   Sin archivos: acordes suaves, notas tipo kalimba, viento,
   pájaros de día y grillos de noche. Arranca sólo con un clic
   (los navegadores bloquean el audio automático).
   ========================================================= */
(function () {
  "use strict";

  const btn = document.querySelector(".music");
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!btn || !Ctx) { if (btn) btn.hidden = true; return; }

  const KEY = "refugio-musica";
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sin storage */ } },
  };

  // Re mayor pentatónico: cálido y sin tensiones
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const CHORDS = [
    [50, 57, 62, 66, 69],   // Re add9
    [47, 54, 59, 62, 66],   // Si m7
    [43, 50, 55, 59, 66],   // Sol maj7
    [45, 52, 57, 61, 64],   // La sus
  ];
  const SCALE = [74, 76, 78, 81, 83, 86, 88, 90];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  let ctx, master, reverb, dry, dayBus, nightBus, windGain, noiseBuf;
  const timers = [];
  let playing = false;
  let chordIdx = 0;
  let night = 0; // 0 = día, 1 = noche

  function build() {
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    master.connect(comp).connect(ctx.destination);

    // reverb sintética: ruido con caída exponencial
    reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 3.2;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    reverb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);
    dry = ctx.createGain(); dry.gain.value = 0.6;
    dry.connect(master);

    dayBus = ctx.createGain(); dayBus.connect(dry); dayBus.connect(reverb);
    nightBus = ctx.createGain(); nightBus.gain.value = 0; nightBus.connect(dry);

    // ruido base para viento
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    wind();
  }

  const send = (node, wetAmt = 1) => {
    node.connect(dry);
    if (wetAmt) { const g = ctx.createGain(); g.gain.value = wetAmt; node.connect(g).connect(reverb); }
  };

  /* ---------- voces ---------- */
  function pad() {
    const t = ctx.currentTime;
    const dur = 9;
    const notes = CHORDS[chordIdx++ % CHORDS.length];
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700 - night * 250;
    filter.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.055, t + 3);
    g.gain.setValueAtTime(0.055, t + dur - 3);
    g.gain.linearRampToValueAtTime(0, t + dur + 1.5);
    filter.connect(g); send(g, 1);
    notes.forEach(n => {
      [-5, 5].forEach(det => {
        const o = ctx.createOscillator();
        o.type = n < 52 ? "sine" : "triangle";
        o.frequency.value = midi(n - (night > 0.5 ? 12 * (n > 60) : 0));
        o.detune.value = det + rand(-3, 3);
        o.connect(filter);
        o.start(t); o.stop(t + dur + 2);
      });
    });
  }

  function pluck() {
    const t = ctx.currentTime + 0.05;
    const f = midi(pick(SCALE) - (night > 0.6 ? 12 : 0));
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 4.02;
    const g = ctx.createGain(); const g2 = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    g2.gain.setValueAtTime(0.02, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (pan.pan) pan.pan.value = rand(-0.6, 0.6);
    o.connect(g).connect(pan); o2.connect(g2).connect(pan); send(pan, 1.2);
    o.start(t); o2.start(t); o.stop(t + 2.4); o2.stop(t + 0.3);
  }

  function bird() {
    let t = ctx.currentTime + 0.05;
    const base = rand(2600, 3800);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (pan.pan) pan.pan.value = rand(-0.9, 0.9);
    pan.connect(dayBus);
    const n = Math.floor(rand(2, 5));
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator(); o.type = "sine";
      const g = ctx.createGain();
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * rand(1.2, 1.5), t + 0.07);
      o.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.018, t + 0.02); g.gain.linearRampToValueAtTime(0, t + 0.13);
      o.connect(g).connect(pan);
      o.start(t); o.stop(t + 0.15);
      t += rand(0.14, 0.22);
    }
  }

  function crickets() {
    let t = ctx.currentTime + 0.05;
    const f = rand(4300, 4900);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (pan.pan) pan.pan.value = rand(-0.8, 0.8);
    pan.connect(nightBus);
    for (let k = 0; k < 3; k++) {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = 0;
      for (let i = 0; i < 6; i++) {
        const s = t + i * 0.045;
        g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.012, s + 0.012); g.gain.linearRampToValueAtTime(0, s + 0.035);
      }
      o.connect(g).connect(pan);
      o.start(t); o.stop(t + 0.3);
      t += rand(0.35, 0.6);
    }
  }

  function wind() {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 500; bp.Q.value = 0.7;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
    const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 250;
    lfo.connect(lfoAmt).connect(bp.frequency);
    windGain = ctx.createGain(); windGain.gain.value = 0.012;
    src.connect(bp).connect(windGain).connect(master);
    src.start(); lfo.start();
  }

  /* ---------- secuenciador (setTimeout simple, sin prisa) ---------- */
  function loop(fn, min, max, first = rand(200, min)) {
    const tick = () => { if (playing) fn(); timers.push(setTimeout(tick, rand(min, max))); };
    timers.push(setTimeout(tick, first));
  }

  function start() {
    if (!ctx) {
      build();
      loop(pad, 8000, 8000, 8000); // el primer acorde lo toca start()
      loop(() => { if (Math.random() < 0.8) pluck(); }, 900, 2600);
      loop(() => { if (Math.random() < 1 - night) bird(); }, 3500, 9000);
      loop(() => { if (Math.random() < night) crickets(); }, 900, 2200);
    }
    ctx.resume();
    playing = true;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.9, t + 2.5);
    pad();
    setUI(true);
  }

  function stop() {
    playing = false;
    setUI(false);
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 1.2);
    setTimeout(() => { if (!playing) ctx.suspend(); }, 1400);
  }

  function setUI(on) {
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Apagar música" : "Encender música");
  }

  // día → noche según cuánto se ve la sección de contacto
  function updateNight() {
    const sec = document.querySelector(".visit");
    if (!sec) return;
    const r = sec.getBoundingClientRect();
    const v = Math.min(1, Math.max(0, 1 - r.top / window.innerHeight));
    if (Math.abs(v - night) < 0.02) return;
    night = v;
    if (ctx) {
      const t = ctx.currentTime;
      dayBus.gain.setTargetAtTime(1 - night, t, 0.8);
      nightBus.gain.setTargetAtTime(night, t, 0.8);
    }
  }
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; updateNight(); });
  }, { passive: true });
  updateNight();

  btn.addEventListener("click", () => {
    const on = !playing;
    store.set(on ? "on" : "off");
    on ? start() : stop();
    const hint = document.querySelector(".music__hint");
    if (hint) hint.remove();
  });

  // si ya la había encendido antes, arranca con la primera interacción
  if (store.get() === "on") {
    const resume = e => {
      if (e.target.closest && e.target.closest(".music")) return;
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      if (!playing) start();
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
  }

  // pausa con la pestaña oculta
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !playing) return;
    document.hidden ? ctx.suspend() : ctx.resume();
  });
})();
