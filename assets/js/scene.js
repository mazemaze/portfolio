/* ============================================================
   WebGL scene — particle monolith with simplex-noise breathing,
   inner wireframe, starfield. Mouse parallax + scroll drift.
   ============================================================ */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const canvas = document.getElementById("gl");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !reducedMotion) {
  try {
    init(canvas);
  } catch (e) {
    // WebGL unavailable — CSS background takes over
    canvas.style.display = "none";
    document.body.style.background =
      "radial-gradient(ellipse 80% 60% at 70% 10%, rgba(211,162,79,0.08), transparent 60%), #0a0a0f";
  }
}

function init(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  // Opaque page-colored background: bloom compositing replaces the alpha canvas
  scene.background = new THREE.Color(0x0a0a0f);
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 5);

  /* Bloom pipeline — subtle glow on the gold particles */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.55,
    0.7,
    0.65
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const group = new THREE.Group();
  scene.add(group);

  /* ---------- Particle monolith ---------- */

  const SIMPLEX = /* glsl */ `
    vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
  `;

  const particleUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColorA: { value: new THREE.Color(0xd3a24f) }, // gold
    uColorB: { value: new THREE.Color(0x8a7a5c) }, // dim bronze
  };

  const baseGeo = new THREE.IcosahedronGeometry(1.6, 12);
  const particleCount = baseGeo.attributes.position.count;
  const positions = new Float32Array(baseGeo.attributes.position.array);
  const seeds = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) seeds[i] = Math.random();
  baseGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      ${SIMPLEX}
      uniform float uTime;
      uniform float uScroll;
      uniform float uPixelRatio;
      attribute float aSeed;
      varying float vNoise;
      varying float vSeed;
      void main() {
        vSeed = aSeed;
        vec3 dir = normalize(position);
        float n = snoise(dir * 2.2 + uTime * 0.18);
        float n2 = snoise(dir * 5.0 - uTime * 0.1) * 0.35;
        vNoise = n;
        float amp = 0.14 + uScroll * 0.1;
        vec3 displaced = position + dir * (n + n2) * amp;
        vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = (1.1 + aSeed * 1.6) * uPixelRatio;
        gl_PointSize = size * (3.4 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vNoise;
      varying float vSeed;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.05, d);
        vec3 color = mix(uColorB, uColorA, smoothstep(-0.4, 0.9, vNoise) * (0.4 + vSeed * 0.6));
        gl_FragColor = vec4(color, alpha * 0.85);
      }
    `,
  });

  const particles = new THREE.Points(baseGeo, particleMat);
  group.add(particles);

  /* ---------- Inner wireframe ---------- */

  const wireGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.15, 1));
  const wireMat = new THREE.LineBasicMaterial({
    color: 0xd3a24f,
    transparent: true,
    opacity: 0.14,
  });
  const wire = new THREE.LineSegments(wireGeo, wireMat);
  group.add(wire);

  const wire2Geo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.1, 1));
  const wire2Mat = new THREE.LineBasicMaterial({
    color: 0xd3a24f,
    transparent: true,
    opacity: 0.05,
  });
  const wire2 = new THREE.LineSegments(wire2Geo, wire2Mat);
  group.add(wire2);

  /* ---------- Starfield ---------- */

  const starCount = 900;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 8 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i * 3 + 2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xbfb49a,
    size: 0.035,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---------- Interaction state ---------- */

  const mouse = { x: 0, y: 0 };
  const mouseTarget = { x: 0, y: 0 };
  let scrollProgress = 0;
  let scrollTarget = 0;

  window.addEventListener(
    "pointermove",
    (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    const pr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    composer.setPixelRatio(pr);
    particleUniforms.uPixelRatio.value = pr;
  });

  /* ---------- Render loop (pauses when tab hidden) ---------- */

  const clock = new THREE.Clock();
  let rafId = null;

  function tick() {
    rafId = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    mouse.x += (mouseTarget.x - mouse.x) * 0.045;
    mouse.y += (mouseTarget.y - mouse.y) * 0.045;
    scrollProgress += (scrollTarget - scrollProgress) * 0.06;

    particleUniforms.uTime.value = t;
    particleUniforms.uScroll.value = scrollProgress;

    group.rotation.y = t * 0.12 + mouse.x * 0.35 + scrollProgress * Math.PI * 0.6;
    group.rotation.x = Math.sin(t * 0.15) * 0.08 + mouse.y * 0.22 + scrollProgress * 0.4;
    wire.rotation.y = -t * 0.06;
    wire2.rotation.y = t * 0.04;
    wire2.rotation.x = t * 0.02;

    stars.rotation.y = t * 0.008;

    // Scroll-driven drift: push form off-center and pull camera back slightly
    group.position.y = scrollProgress * 1.2;
    group.position.x = -scrollProgress * 1.6;
    camera.position.z = 5 + scrollProgress * 1.4;
    camera.position.x = mouse.x * 0.25;
    camera.position.y = -mouse.y * 0.2 - scrollProgress * 0.6;
    camera.lookAt(group.position.x * 0.4, group.position.y * 0.4, 0);

    // Fade the form out as the user reaches the end
    const fade = 1 - Math.max(0, scrollProgress - 0.75) * 3.2;
    particleMat.opacity = Math.max(0, fade);
    wireMat.opacity = 0.14 * Math.max(0, fade);
    wire2Mat.opacity = 0.05 * Math.max(0, fade);

    composer.render();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (rafId == null) {
      clock.getDelta();
      tick();
    }
  });

  tick();
}


/* ============================================================
   Mini 3D visuals for the strength cards.
   One shared render loop, per-card scenes, hover-reactive speed,
   rendered only while visible on screen.
   ============================================================ */

if (!reducedMotion) {
  try {
    initMinis();
  } catch (e) {
    document.querySelectorAll(".mini-gl").forEach((c) => (c.style.display = "none"));
  }
}

function initMinis() {
  const GOLD = 0xd3a24f;
  const minis = [];

  document.querySelectorAll(".mini-gl").forEach((canvas) => {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.z = 2.8;
    const group = new THREE.Group();
    scene.add(group);

    const shape = canvas.dataset.shape;

    if (shape === "layers") {
      // Full-cycle: nested solid + wireframes, layer upon layer
      const outer = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1, 1)),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.3 })
      );
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.42, 0),
        new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.14 })
      );
      const coreWire = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.42, 0)),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 })
      );
      group.add(outer, core, coreWire);
      group.userData.animate = (t, s) => {
        outer.rotation.y = t * 0.5 * s;
        outer.rotation.x = t * 0.22 * s;
        coreWire.rotation.y = -t * 0.9 * s;
        core.rotation.y = -t * 0.9 * s;
      };
    } else if (shape === "orbit") {
      // 0→1: torus knot trajectory around a bright core
      const knot = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.TorusKnotGeometry(0.62, 0.2, 110, 12)),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.28 })
      );
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.5 })
      );
      group.add(knot, glow);
      group.userData.animate = (t, s) => {
        knot.rotation.y = t * 0.6 * s;
        knot.rotation.z = t * 0.18 * s;
        glow.scale.setScalar(1 + Math.sin(t * 2.4) * 0.18);
      };
    } else {
      // neural — AI: point cloud sphere with near-neighbor connections
      const N = 150;
      const verts = [];
      for (let i = 0; i < N; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        verts.push(
          new THREE.Vector3(
            0.92 * Math.sin(phi) * Math.cos(theta),
            0.92 * Math.sin(phi) * Math.sin(theta),
            0.92 * Math.cos(phi)
          )
        );
      }
      const pos = new Float32Array(N * 3);
      verts.forEach((v, i) => v.toArray(pos, i * 3));
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const points = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: GOLD, size: 0.05, transparent: true, opacity: 0.9 })
      );

      const lineVerts = [];
      outer: for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          if (verts[i].distanceTo(verts[j]) < 0.6) {
            lineVerts.push(verts[i].x, verts[i].y, verts[i].z, verts[j].x, verts[j].y, verts[j].z);
            if (lineVerts.length > 2400) break outer;
          }
        }
      }
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
      const lines = new THREE.LineSegments(
        lGeo,
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.13 })
      );
      group.add(points, lines);
      group.userData.animate = (t, s) => {
        group.rotation.y = t * 0.4 * s;
        group.rotation.x = Math.sin(t * 0.3) * 0.25;
      };
    }

    const mini = { canvas, renderer, scene, camera, group, visible: false, speed: 0.7, targetSpeed: 0.7 };
    minis.push(mini);

    const card = canvas.closest(".strength-card");
    if (card) {
      card.addEventListener("pointerenter", () => (mini.targetSpeed = 2.6));
      card.addEventListener("pointerleave", () => (mini.targetSpeed = 0.7));
    }
  });

  if (!minis.length) return;

  function sizeAll() {
    minis.forEach((m) => {
      const w = m.canvas.clientWidth || 1;
      const h = m.canvas.clientHeight || 1;
      m.renderer.setSize(w, h, false);
      m.camera.aspect = w / h;
      m.camera.updateProjectionMatrix();
    });
  }
  window.addEventListener("resize", sizeAll);
  sizeAll();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const m = minis.find((x) => x.canvas === e.target);
        if (m) m.visible = e.isIntersecting;
      });
    },
    { rootMargin: "80px" }
  );
  minis.forEach((m) => io.observe(m.canvas));

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    const t = clock.getElapsedTime();
    minis.forEach((m) => {
      if (!m.visible) return;
      m.speed += (m.targetSpeed - m.speed) * 0.06;
      if (m.group.userData.animate) m.group.userData.animate(t, m.speed);
      m.renderer.render(m.scene, m.camera);
    });
  }
  tick();
}
