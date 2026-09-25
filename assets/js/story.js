/* ============================================================
   Particle story — one point cloud that changes formation as you
   scroll: sphere (hero) → screen (showreel) → lattice (about) →
   three clusters (strengths) → radar (skills) → spine with eight
   nodes (experience) → the orange dot (contact), the same dot that
   ends the showreel. All formations live on the GPU; scroll only
   moves one uniform.
   ============================================================ */

import * as THREE from "three";

const canvas = document.getElementById("gl");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SECTIONS = ["hero", "showreel", "about", "strengths", "skills", "experience", "contact"];
const BONE = new THREE.Color(0xf2ede4);
const SIGNAL = new THREE.Color(0xff4d1f);

// Where each formation sits: [x, scale, y, brightness] in world units at z=0, per layout.
// Formations behind body text are pushed to the edge and dimmed so the copy stays readable.
const PLACE_WIDE = [
  [1.55, 1.0, 0.0, 1.0], // hero: sphere beside the name
  [0.0, 2.15, -0.35, 0.75], // showreel: the screen frames the video
  [2.9, 0.75, 0.9, 0.45], // about
  [0.3, 1.0, 0.9, 0.9], // strengths: clusters above the cards
  [2.9, 0.9, 0.2, 0.45], // skills
  [3.75, 0.95, 0.0, 0.5], // experience: spine along the right edge
  [3.1, 1.35, 0.35, 1.0], // contact: the dot, clear of the headline
];
const PLACE_NARROW = [
  [0.0, 0.55, 2.05, 0.7],
  [0.0, 0.95, 0.0, 0.5],
  [0.0, 0.6, 0.0, 0.3],
  [0.0, 0.6, 1.8, 0.6],
  [0.0, 0.6, 0.0, 0.3],
  [0.0, 0.7, 0.0, 0.3],
  [0.0, 1.0, 1.9, 1.0],
];

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
    // 4 · radar: six axes, concentric hexagons, and the skill polygon
    {
      const kind = rnd();
      const ang = (a) => -Math.PI / 2 + (a * Math.PI) / 3;
      if (kind < 0.45) {
        const ring = 1 + Math.floor(rnd() * 5);
        const side = Math.floor(rnd() * 6);
        const t = rnd();
        const R = ring * 0.36;
        const x = Math.cos(ang(side)) * (1 - t) + Math.cos(ang(side + 1)) * t;
        const y = Math.sin(ang(side)) * (1 - t) + Math.sin(ang(side + 1)) * t;
        F[4].set([x * R, -y * R, (rnd() - 0.5) * 0.05], j);
      } else if (kind < 0.62) {
        const side = Math.floor(rnd() * 6);
        const t = rnd() * 1.8;
        F[4].set([Math.cos(ang(side)) * t, -Math.sin(ang(side)) * t, 0], j);
      } else {
        const lv = [1.0, 0.96, 1.0, 0.92, 0.9, 0.98]; // mirrors the skill radar
        const side = Math.floor(rnd() * 6);
        const t = rnd();
        const r0 = lv[side] * 1.8, r1 = lv[(side + 1) % 6] * 1.8;
        const x = Math.cos(ang(side)) * r0 * (1 - t) + Math.cos(ang(side + 1)) * r1 * t;
        const y = Math.sin(ang(side)) * r0 * (1 - t) + Math.sin(ang(side + 1)) * r1 * t;
        F[4].set([x + (rnd() - 0.5) * 0.03, -y + (rnd() - 0.5) * 0.03, 0.02], j);
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
  }
`;

function start() {
  const narrow = () => window.innerWidth < 860;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 60);
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

  // scroll → formation index (0..6), measured from each section's position
  let anchors = [];
  function measure() {
    anchors = SECTIONS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + Math.min(r.height, window.innerHeight) * 0.35;
    });
  }
  function target() {
    const y = window.scrollY + window.innerHeight * 0.5;
    const a = anchors;
    if (!a.length || a.some((v) => v == null)) return 0;
    if (y <= a[0]) return 0;
    for (let k = 0; k < a.length - 1; k++) {
      if (y < a[k + 1]) return k + (y - a[k]) / (a[k + 1] - a[k]);
    }
    return a.length - 1;
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

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = narrow() ? 26 : 30;
  });

  let p = target();
  let px = 0, ps = 1, py = 0, pa = 1;
  const clock = new THREE.Clock();
  const introStart = performance.now();
  let running = true;

  function place(pp) {
    const P = narrow() ? PLACE_NARROW : PLACE_WIDE;
    const k = Math.min(5, Math.floor(pp));
    const f = pp - k;
    const e = f * f * (3 - 2 * f);
    return P[k].map((v, i) => v + (P[k + 1][i] - v) * e);
  }

  function frame() {
    if (!running) return;
    const t = clock.getElapsedTime();
    const goal = target();
    p += (goal - p) * (reduced ? 1 : 0.07);
    uniforms.uP.value = p;
    uniforms.uTime.value = reduced ? 0 : t;
    if (!reduced) {
      const k = Math.min(1, (performance.now() - introStart) / 2200);
      uniforms.uIntro.value = 1 - Math.pow(1 - k, 3);
    }
    const [tx, ts, ty, ta] = place(p);
    const ease = reduced ? 1 : 0.08;
    px += (tx - px) * ease;
    ps += (ts - ps) * ease;
    py += (ty - py) * ease;
    pa += (ta - pa) * ease;
    uniforms.uFade.value = pa;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    const spin = reduced ? 0 : t * 0.08;
    const settle = Math.min(1, Math.max(0, p - 5)); // the dot stops spinning
    group.rotation.y = (spin + mouse.x * 0.5 + p * 0.55) * (1 - settle);
    group.rotation.x = (mouse.y * 0.3 + Math.sin(p * 1.3) * 0.12) * (1 - settle);
    group.position.set(px, py, 0);
    group.scale.setScalar(ps);
    renderer.render(scene, camera);
    if (!reduced) requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    const vis = document.visibilityState === "visible";
    if (vis && !running && !reduced) {
      running = true;
      requestAnimationFrame(frame);
    } else if (!vis) running = false;
  });
  if (reduced) {
    // still image: redraw only when the section changes
    frame();
    window.addEventListener("scroll", () => requestAnimationFrame(frame), { passive: true });
  } else {
    requestAnimationFrame(frame);
  }
  document.documentElement.classList.add("gl-ready");
}

try {
  if (canvas) start();
} catch (e) {
  // WebGL unavailable: the page stays fully readable without the particles.
  console.warn("particle story disabled:", e);
}
