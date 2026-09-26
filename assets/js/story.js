/* ============================================================
   Particle story — one point cloud that changes formation as you
   scroll: sphere (hero) → screen (showreel) → lattice (about) →
   three clusters (strengths, carried on through the case studies in work) →
   orbit rings (skills) → spine with eight nodes (experience) → the
   orange dot (contact), the same dot that ends the showreel. All formations live on the GPU; scroll only
   moves one uniform.
   ============================================================ */

import * as THREE from "three";

const canvas = document.getElementById("gl");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SECTIONS = ["hero", "showreel", "about", "strengths", "work", "skills", "experience", "contact"];
// The formation each section shows. Work keeps the three clusters from Strengths.
const FORM = [0, 1, 2, 3, 3, 4, 5, 6];
const LAST = SECTIONS.length - 1;
const BONE = new THREE.Color(0xf2ede4);
const SIGNAL = new THREE.Color(0xff4d1f);

// Where the formation sits in each section: [x, scale, y, brightness] in world units at z=0, per layout.
// Formations behind body text are pushed to the edge and dimmed so the copy stays readable.
const PLACE_WIDE = [
  [1.55, 1.0, 0.0, 1.0], // hero: sphere beside the name
  [0.0, 2.15, -0.35, 0.75], // showreel: the screen frames the video
  [2.9, 0.75, 0.9, 0.4], // about (x is worked out in layout())
  [0.3, 1.0, 0.9, 0.9], // strengths: clusters above the cards
  [3.3, 0.55, 0.3, 0.35], // work: the clusters move to the right margin (x from layout())
  [3.3, 0.85, 0.3, 0.35], // skills: orbit rings in the right margin (x from layout())
  [4.35, 0.95, 0.0, 0.4], // experience: spine along the right edge (x from layout())
  [3.1, 1.35, 0.35, 1.0], // contact: the dot, clear of the headline
];
const PLACE_NARROW = [
  [1.25, 0.7, 1.1, 0.5],
  [0.0, 0.95, 0.0, 0.35],
  [0.0, 0.6, 0.0, 0.15],
  [0.0, 0.6, 1.8, 0.5],
  [0.0, 0.5, 0.0, 0.15],
  [0.0, 0.6, 0.0, 0.15],
  [0.0, 0.7, 0.0, 0.15],
  [0.0, 1.0, 1.9, 1.0],
];
// Flat formations (screen, radar-like) would turn edge-on while spinning; hold them still.
const FLAT = [1]; // formation indices
// Wide layouts: in these sections the formation lives in the right-hand margin, worked out from
// the real layout. Value = how far it reaches sideways at scale 1 while turning (world units).
const MARGIN = { 2: 1.9, 4: 2.4, 5: 1.9, 6: 0.6 }; // about lattice, work clusters, skills rings, experience spine

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formations(n, rnd) {
  const F = Array.from({ length: 7 }, () => new Float32Array(n * 3));
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const j = i * 3;
    // 0 · sphere (fibonacci), with a slightly noisy shell
    {
      const y = 1 - 2 * (i + 0.5) / n;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const R = 2.05 + (rnd() - 0.5) * 0.12;
      F[0].set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], j);
    }
    // 1 · a 16:9 screen frame with scanlines (the showreel)
    {
      const W = 3.6, H = 2.02;
      if (u < 0.55) {
        const p = (u / 0.55) * 2 * (W + H);
        let x, y;
        if (p < W) { x = -W / 2 + p; y = H / 2; }
        else if (p < W + H) { x = W / 2; y = H / 2 - (p - W); }
        else if (p < 2 * W + H) { x = W / 2 - (p - W - H); y = -H / 2; }
        else { x = -W / 2; y = -H / 2 + (p - 2 * W - H); }
        F[1].set([x + (rnd() - 0.5) * 0.02, y + (rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.05], j);
      } else {
        const row = Math.floor(rnd() * 14);
        F[1].set([(rnd() - 0.5) * W, H / 2 - (row + 0.5) * (H / 14), -0.35 + (rnd() - 0.5) * 0.04], j);
      }
    }
    // 2 · lattice (a systems grid)
    {
      const g = 9;
      const a = Math.floor(rnd() * g), b = Math.floor(rnd() * g), c = Math.floor(rnd() * g);
      const s = 3.0 / (g - 1);
      const along = rnd();
      const axis = i % 3;
      const p = [(a - (g - 1) / 2) * s, (b - (g - 1) / 2) * s, (c - (g - 1) / 2) * s];
      p[axis] = (along - 0.5) * 3.0; // points run along grid lines
      F[2].set(p, j);
    }
    // 3 · three clusters (three strengths)
    {
      const k = i % 3;
      const y = 1 - 2 * rnd();
      const r = Math.sqrt(1 - y * y);
      const th = rnd() * Math.PI * 2;
      const R = 0.62 * Math.cbrt(0.35 + 0.65 * rnd());
      F[3].set([(k - 1) * 1.75 + Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], j);
    }
    // 4 · three tilted orbit rings around a small core (layers of the stack)
    {
      const ring = i % 4;
      if (ring === 3) {
        const y = 1 - 2 * rnd();
        const r = Math.sqrt(1 - y * y);
        const th = rnd() * Math.PI * 2;
        const R = 0.32 * Math.cbrt(rnd());
        F[4].set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], j);
      } else {
        const R = 1.05 + ring * 0.42;
        const a = rnd() * Math.PI * 2;
        const tilt = [0.35, -0.6, 1.15][ring];
        const turn = [0.0, 1.1, 2.2][ring];
        let x = Math.cos(a) * R, y = Math.sin(a) * R * 0.28, z = Math.sin(a) * R;
        const y1 = y * Math.cos(tilt) - z * Math.sin(tilt), z1 = y * Math.sin(tilt) + z * Math.cos(tilt);
        const x2 = x * Math.cos(turn) + z1 * Math.sin(turn), z2 = -x * Math.sin(turn) + z1 * Math.cos(turn);
        F[4].set([x2 + (rnd() - 0.5) * 0.04, y1 + (rnd() - 0.5) * 0.04, z2], j);
      }
    }
    // 5 · spine with eight nodes (eight projects), gently twisting
    {
      const node = i % 9;
      if (node < 8) {
        const y = 2.1 - (node / 7) * 4.2;
        const yy = 1 - 2 * rnd();
        const r = Math.sqrt(1 - yy * yy);
        const th = rnd() * Math.PI * 2;
        const R = 0.2 * Math.cbrt(rnd());
        F[5].set([Math.sin(node * 0.9) * 0.35 + Math.cos(th) * r * R, y + yy * R, Math.cos(node * 0.9) * 0.35 + Math.sin(th) * r * R], j);
      } else {
        const t = rnd();
        F[5].set([Math.sin(t * 7.2) * 0.35, 2.1 - t * 4.2, Math.cos(t * 7.2) * 0.35], j);
      }
    }
    // 6 · the dot
    {
      const y = 1 - 2 * rnd();
      const r = Math.sqrt(1 - y * y);
      const th = rnd() * Math.PI * 2;
      const R = 0.26 * Math.cbrt(rnd());
      F[6].set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], j);
    }
  }
  return F;
}

const vertex = /* glsl */ `
  attribute vec3 aF0; attribute vec3 aF1; attribute vec3 aF2; attribute vec3 aF3;
  attribute vec3 aF4; attribute vec3 aF5; attribute vec3 aF6;
  attribute float aSeed; attribute float aHot;
  uniform float uP; uniform float uTime; uniform float uIntro; uniform float uPixel; uniform float uSize; uniform float uFade;
  varying float vHot; varying float vAlpha;
  float step01(float x) { x = clamp(x, 0.0, 1.0); return x * x * (3.0 - 2.0 * x); }
  void main() {
    vec3 p = aF0;
    p = mix(p, aF1, step01(uP - 0.0));
    p = mix(p, aF2, step01(uP - 1.0));
    p = mix(p, aF3, step01(uP - 2.0));
    p = mix(p, aF4, step01(uP - 3.0));
    p = mix(p, aF5, step01(uP - 4.0));
    p = mix(p, aF6, step01(uP - 5.0));
    // mid-morph particles swirl outward a little, so transitions read as motion
    float between = abs(fract(uP) - 0.5) < 0.499 ? sin(fract(uP) * 3.14159) : 0.0;
    p += normalize(p + 0.0001) * between * 0.25 * (0.4 + aSeed);
    // breathing
    p += 0.018 * vec3(sin(uTime * 0.9 + aSeed * 40.0), cos(uTime * 0.7 + aSeed * 31.0), sin(uTime * 0.8 + aSeed * 23.0));
    // intro: particles arrive from a wide scatter
    vec3 scatter = normalize(vec3(sin(aSeed * 91.0), cos(aSeed * 57.0), sin(aSeed * 13.0))) * (6.0 + aSeed * 6.0);
    p = mix(scatter, p, uIntro);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float toDot = step01(uP - 5.0);
    gl_PointSize = uSize * uPixel * (0.6 + aSeed * 0.8) * (1.0 + toDot * 1.2) / -mv.z;
    vHot = max(aHot, toDot);
    vAlpha = mix(0.35 + 0.65 * aSeed, 1.0, toDot) * uIntro * uFade;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uBone; uniform vec3 uSignal;
  varying float vHot; varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.15, d) * vAlpha;
    gl_FragColor = vec4(mix(uBone, uSignal, vHot), a);
    #include <colorspace_fragment>
  }
`;

function start() {
  const narrow = () => window.innerWidth < 860;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(0, 0, 8.5);

  const n = narrow() ? 3600 : 7200;
  const rnd = mulberry32(2026);
  const F = formations(n, rnd);
  const geo = new THREE.BufferGeometry();
  F.forEach((f, k) => geo.setAttribute("aF" + k, new THREE.BufferAttribute(f, 3)));
  geo.setAttribute("position", new THREE.BufferAttribute(F[0], 3));
  const seed = new Float32Array(n), hot = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    seed[i] = rnd();
    hot[i] = rnd() < 0.09 ? 1 : 0;
  }
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aHot", new THREE.BufferAttribute(hot, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const uniforms = {
    uP: { value: 0 },
    uTime: { value: 0 },
    uIntro: { value: reduced ? 1 : 0 },
    uPixel: { value: dpr },
    uSize: { value: narrow() ? 26 : 30 },
    uFade: { value: 1 },
    uBone: { value: BONE },
    uSignal: { value: SIGNAL },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  // scroll → formation index (0..6), measured from each section's position. Each formation
  // holds while its section fills the screen and morphs only in the hand-over to the next one,
  // so a formation never drifts across the middle of a long section.
  let spans = [];
  function measure() {
    const vh = window.innerHeight;
    spans = SECTIONS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const settled = top + Math.min(r.height, vh) * (id === "hero" ? 0.5 : 0.35);
      return [settled, Math.max(settled, top + r.height - vh * 0.25)];
    });
  }
  function target() {
    const y = window.scrollY + window.innerHeight * 0.5;
    const s = spans;
    if (!s.length || s.some((v) => v == null)) return 0;
    for (let k = 0; k < s.length; k++) {
      if (y > s[k][1]) continue;
      if (k === 0 || y >= s[k][0]) return k;
      return k - 1 + (y - s[k - 1][1]) / (s[k][0] - s[k - 1][1]);
    }
    return s.length - 1;
  }
  measure();
  window.addEventListener("load", measure);
  document.fonts && document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(document.body);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = e.clientX / window.innerWidth - 0.5;
    mouse.ty = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  let q = target();
  let px = 0, ps = 1, py = 0, pa = 1;
  const clock = new THREE.Clock();
  const introStart = performance.now();
  // Fit the margin formations to the gap between the content column and the screen edge:
  // shrink to fit (to 70% at most), then slide up to half off-screen, and if they still reach
  // the content, dim them right down so the copy stays readable.
  let drawnW = 0, drawnH = 0;
  let placeTable = PLACE_WIDE;
  function layout() {
    if (narrow()) return (placeTable = PLACE_NARROW);
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
    const about = document.getElementById("about");
    const edge = about ? about.getBoundingClientRect().right - parseFloat(getComputedStyle(about).paddingRight) : drawnW;
    const content = (edge / drawnW - 0.5) * 2 * halfW + 0.15; // content column's right edge plus a small gap, world x
    const room = Math.max(0, halfW - content) / 2; // half the margin's width
    placeTable = PLACE_WIDE.map((v, k) => {
      // the contact dot: on wide screens, a little further from the headline's final "." / 「。」
      if (k === LAST) return [Math.max(v[0], Math.min(3.45, halfW - 1.3)), v[1], v[2], v[3]];
      if (!(k in MARGIN)) return v;
      const [, s0, y, a] = v;
      const s = Math.max(s0 * 0.7, Math.min(s0, room / MARGIN[k]));
      const r = MARGIN[k] * s;
      const x = halfW - room + Math.max(0, Math.min(r - room, r * 0.5));
      return [x, s, y, x - r < content - 0.1 ? Math.min(a, 0.1) : a]; // dense rings add up, so 0.1
    });
  }

  // Phones have no free column at Contact, so the dot lands at the empty end of the copy
  // button's row instead of on the address, and moves with it.
  const copyBtn = document.querySelector(".copy-btn");
  function contactSpot() {
    const r = copyBtn.getBoundingClientRect();
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const sx = Math.min(r.right + 64, drawnW - 48), sy = r.top + r.height / 2;
    return [(sx / drawnW - 0.5) * 2 * halfH * camera.aspect, 0.8, (0.5 - sy / drawnH) * 2 * halfH, 1.0];
  }

  // q is the scroll position in sections (0 = hero … LAST = contact); p is the formation it shows.
  function formation(qq) {
    const k = Math.min(LAST - 1, Math.floor(qq));
    return FORM[k] + (FORM[k + 1] - FORM[k]) * (qq - k);
  }
  function place(qq) {
    const P = placeTable;
    const k = Math.min(LAST - 1, Math.floor(qq));
    const f = qq - k;
    const e = f * f * (3 - 2 * f);
    const to = k === LAST - 1 && copyBtn && narrow() ? contactSpot() : P[k + 1];
    return P[k].map((v, i) => v + (to[i] - v) * e);
  }

  const shade = document.querySelector(".shade");
  function frame() {
    const t = clock.getElapsedTime();
    const goal = target();
    q += (goal - q) * (reduced ? 1 : 0.07);
    const p = formation(q);
    uniforms.uP.value = p;
    uniforms.uTime.value = reduced ? 0 : t;
    if (!reduced) {
      const k = Math.min(1, (performance.now() - introStart) / 2200);
      uniforms.uIntro.value = 1 - Math.pow(1 - k, 3);
    }
    const [tx, ts, ty, ta] = place(q);
    const ease = reduced ? 1 : 0.08;
    px += (tx - px) * ease;
    ps += (ts - ps) * ease;
    py += (ty - py) * ease;
    pa += (ta - pa) * ease;
    // dissolve between sections: a formation on the move dims rather than streaking over text
    uniforms.uFade.value = pa * (1 - 0.8 * Math.sin(Math.PI * (q % 1)));
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    const spin = reduced ? 0 : t * 0.08;
    const settle = Math.min(1, Math.max(0, p - 5)); // the dot stops spinning
    const flat = FLAT.reduce((m, k) => Math.max(m, 1 - Math.min(1, Math.abs(p - k))), 0); // hold flat shapes face-on
    const hold = Math.max(settle, flat);
    group.rotation.y = (spin + mouse.x * 0.5 + p * 0.55) * (1 - hold) + mouse.x * 0.15 * flat;
    group.rotation.x = (mouse.y * 0.3 + Math.sin(p * 1.3) * 0.12) * (1 - hold);
    group.position.set(px, py, 0);
    // At Contact every particle has gathered into the dot, so the readability shade can
    // lift and the dot shows in true signal orange.
    if (shade) shade.style.opacity = String(1 - settle * 0.9);
    group.scale.setScalar(ps);
    renderer.render(scene, camera);
  }

  // At most one animation loop: every start goes through schedule(), every stop through stop().
  // Reduced motion draws a single still frame per schedule() instead of looping.
  let rafId = 0;
  let paused = false;
  function tick() {
    rafId = 0;
    frame();
    if (!reduced) schedule();
  }
  function schedule() {
    if (!rafId && !paused && !document.hidden) rafId = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  document.addEventListener("story:pause", () => {
    paused = true;
    stop();
  });
  document.addEventListener("story:resume", () => {
    paused = false;
    schedule();
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : schedule()));

  // The canvas is sized in CSS (full width x large-viewport height), so a phone's address bar
  // sliding in and out leaves it alone while every real resize, height-only included, is followed.
  function fit() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || (w === drawnW && h === drawnH)) return;
    drawnW = w;
    drawnH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = narrow() ? 26 : 30;
    layout();
    if (reduced) schedule(); // setSize clears the canvas
  }
  fit();
  window.addEventListener("resize", fit);
  if (reduced) window.addEventListener("scroll", schedule, { passive: true }); // redraw the still for the new section
  schedule();
  document.documentElement.classList.add("gl-ready");
}

try {
  if (canvas) start();
} catch (e) {
  // WebGL unavailable: the page stays fully readable without the particles.
  console.warn("particle story disabled:", e);
}
