// Procedural soundtrack for the showreel — every sound is synthesized here.
// 120 BPM, so one beat = 0.5s and one bar = 2s; scene cuts land on bar lines
// (2, 4, 6, 8, 10, 12s). Deterministic: seeded noise, no external samples.
//
//   node audio/synth.mjs            -> audio/soundtrack.wav
//   ffmpeg -i audio/soundtrack.wav -c:a aac -b:a 192k audio/soundtrack.m4a

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SR = 48000;
const DUR = 15;
const N = SR * DUR;
const BEAT = 0.5;

const L = new Float32Array(N);
const R = new Float32Array(N);
const verbL = new Float32Array(N); // reverb send bus
const verbR = new Float32Array(N);

// ---------- utilities ----------
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260926);
const noise = () => rand() * 2 - 1;
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

function add(i, l, r, send = 0) {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
  if (send) {
    verbL[i] += l * send;
    verbR[i] += r * send;
  }
}
const pan = (x, p) => [x * Math.cos(((p + 1) * Math.PI) / 4), x * Math.sin(((p + 1) * Math.PI) / 4)];

// RBJ biquad, coefficients recomputed on demand (for sweeps)
function biquad() {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  return {
    set(type, f, q) {
      const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR;
      const cs = Math.cos(w), al = Math.sin(w) / (2 * q);
      const a0 = 1 + al;
      if (type === "lp") { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = (1 - cs) / 2; }
      else if (type === "hp") { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = (1 + cs) / 2; }
      else { b0 = al; b1 = 0; b2 = -al; } // band-pass (0 dB peak)
      a1 = -2 * cs; a2 = 1 - al;
      b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
    },
    run(x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    },
  };
}

// ---------- instruments ----------
function kick(t0, g = 1) {
  const s = Math.round(t0 * SR);
  let ph = 0;
  for (let k = 0; k < SR * 0.45; k++) {
    const t = k / SR;
    const f = 44 + 150 * Math.exp(-t * 32);
    ph += (2 * Math.PI * f) / SR;
    const env = Math.exp(-t * 9.5) * Math.min(1, t * 2000);
    const click = Math.exp(-t * 900) * noise() * 0.35;
    const x = (Math.sin(ph) * env + click) * g * 0.95;
    add(s + k, x, x);
  }
}

function boom(t0, g = 1) {
  const s = Math.round(t0 * SR);
  let ph = 0;
  for (let k = 0; k < SR * 2.2; k++) {
    const t = k / SR;
    const f = 36 + 60 * Math.exp(-t * 9);
    ph += (2 * Math.PI * f) / SR;
    const x = Math.tanh(Math.sin(ph) * 1.6) * Math.exp(-t * 2.1) * Math.min(1, t * 800) * g * 0.8;
    add(s + k, x, x);
  }
}

function clap(t0, g = 1) {
  const s = Math.round(t0 * SR);
  const bp = biquad();
  bp.set("bp", 1400, 0.9);
  for (let k = 0; k < SR * 0.28; k++) {
    const t = k / SR;
    // three quick "hands" then the tail
    let env = Math.exp(-t * 18);
    for (const o of [0, 0.011, 0.022]) if (t >= o) env += Math.exp(-(t - o) * 180) * 0.8;
    const x = bp.run(noise()) * env * g * 1.1;
    add(s + k, x * 0.9, x, 0.35);
  }
}

function hat(t0, g = 1, open = false) {
  const s = Math.round(t0 * SR);
  const hp = biquad();
  hp.set("hp", 7500, 0.7);
  const dec = open ? 14 : 70;
  for (let k = 0; k < SR * (open ? 0.3 : 0.08); k++) {
    const t = k / SR;
    const x = hp.run(noise()) * Math.exp(-t * dec) * g * 0.32;
    const [l, r] = pan(x, 0.25);
    add(s + k, l, r);
  }
}

function tok(t0, pitch = 1, g = 1) {
  // woody bounce — the ball hitting the floor
  const s = Math.round(t0 * SR);
  let ph = 0, ph2 = 0;
  for (let k = 0; k < SR * 0.18; k++) {
    const t = k / SR;
    const f = 620 * pitch * (1 + 0.6 * Math.exp(-t * 60));
    ph += (2 * Math.PI * f) / SR;
    ph2 += (2 * Math.PI * f * 2.43) / SR;
    const env = Math.exp(-t * 34);
    const x = (Math.sin(ph) + Math.sin(ph2) * 0.35 * Math.exp(-t * 90)) * env * g * 0.5;
    const [l, r] = pan(x, -0.15 + 0.15 * pitch);
    add(s + k, l, r, 0.25);
  }
  // low thump under it
  let p3 = 0;
  for (let k = 0; k < SR * 0.12; k++) {
    const t = k / SR;
    p3 += (2 * Math.PI * (90 + 80 * Math.exp(-t * 40))) / SR;
    const x = Math.sin(p3) * Math.exp(-t * 30) * g * 0.45;
    add(s + k, x, x);
  }
}

function sweepNoise(t0, dur, f0, f1, g, { q = 1.2, shape = "swell", panFrom = -0.6, panTo = 0.6, send = 0.15 } = {}) {
  const s = Math.round(t0 * SR);
  const bp = biquad();
  const n = Math.round(dur * SR);
  for (let k = 0; k < n; k++) {
    const u = k / n;
    if (k % 32 === 0) bp.set("bp", f0 * Math.pow(f1 / f0, u), q);
    const env = shape === "swell" ? Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 1.5) : Math.pow(u, 2.2);
    const x = bp.run(noise()) * env * g;
    const [l, r] = pan(x, panFrom + (panTo - panFrom) * u);
    add(s + k, l, r, send);
  }
}
const whoosh = (t0, dur = 0.32, g = 0.9, dir = 1) =>
  sweepNoise(t0, dur, 350, 5200, g, { panFrom: -0.7 * dir, panTo: 0.7 * dir });

function riser(t0, dur, g = 0.5) {
  sweepNoise(t0, dur, 400, 7000, g * 0.9, { q: 2, shape: "ramp", panFrom: 0, panTo: 0, send: 0.2 });
  const s = Math.round(t0 * SR);
  let ph = 0;
  const n = Math.round(dur * SR);
  for (let k = 0; k < n; k++) {
    const u = k / n;
    ph += (2 * Math.PI * (220 * Math.pow(6, u * u))) / SR;
    const x = Math.sin(ph) * Math.pow(u, 3) * g * 0.22;
    add(s + k, x, x);
  }
}

function crash(t0, g = 1, len = 2.2) {
  const s = Math.round(t0 * SR);
  const hpL = biquad(), hpR = biquad();
  hpL.set("hp", 4200, 0.6);
  hpR.set("hp", 4000, 0.6);
  for (let k = 0; k < SR * len; k++) {
    const t = k / SR;
    const env = Math.exp(-t * 2.4) * Math.min(1, t * 600);
    add(s + k, hpL.run(noise()) * env * g * 0.42, hpR.run(noise()) * env * g * 0.42, 0.3);
  }
}

function saw(ph) {
  const x = (ph / (2 * Math.PI)) % 1;
  return 2 * x - 1;
}

function stab(t0, notes, g = 1, len = 0.42) {
  const s = Math.round(t0 * SR);
  const lpL = biquad(), lpR = biquad();
  const voices = [];
  notes.forEach((m, i) => {
    for (const d of [-0.11, 0, 0.12]) voices.push({ f: midi(m + d), ph: rand() * 6.28, p: ((i % 2) * 2 - 1) * 0.5 + d * 3 });
  });
  for (let k = 0; k < SR * len; k++) {
    const t = k / SR;
    if (k % 32 === 0) {
      const fc = 500 + 5200 * Math.exp(-t * 11);
      lpL.set("lp", fc, 2.2);
      lpR.set("lp", fc, 2.2);
    }
    let l = 0, r = 0;
    for (const v of voices) {
      v.ph += (2 * Math.PI * v.f) / SR;
      const [a, b] = pan(saw(v.ph), v.p);
      l += a;
      r += b;
    }
    const env = Math.exp(-t * 7) * Math.min(1, t * 400) * g * (0.5 / voices.length) * 2.4;
    add(s + k, lpL.run(l) * env, lpR.run(r) * env, 0.4);
  }
}

function bell(t0, f, g = 1, len = 3) {
  const s = Math.round(t0 * SR);
  const partials = [
    [1, 1, 1.4],
    [2.76, 0.45, 2.6],
    [5.4, 0.22, 4.5],
    [8.93, 0.1, 7],
  ];
  const phs = partials.map(() => 0);
  for (let k = 0; k < SR * len; k++) {
    const t = k / SR;
    let x = 0;
    partials.forEach(([m, a, d], i) => {
      phs[i] += (2 * Math.PI * f * m) / SR;
      x += Math.sin(phs[i]) * a * Math.exp(-t * d);
    });
    x *= g * 0.28 * Math.min(1, t * 900);
    const vib = 0.18 * Math.sin(t * 9);
    const [l, r] = pan(x, vib);
    add(s + k, l, r, 0.55);
  }
}

function blip(t0, f, g = 0.3, len = 0.05) {
  const s = Math.round(t0 * SR);
  let ph = 0;
  for (let k = 0; k < SR * len; k++) {
    const t = k / SR;
    ph += (2 * Math.PI * f) / SR;
    const x = Math.sin(ph) * Math.exp(-t * (6 / len)) * Math.min(1, t * 3000) * g;
    add(s + k, x, x, 0.2);
  }
}

function snare(t0, g = 1) {
  const s = Math.round(t0 * SR);
  const bp = biquad();
  bp.set("bp", 2600, 0.7);
  let ph = 0;
  for (let k = 0; k < SR * 0.16; k++) {
    const t = k / SR;
    ph += (2 * Math.PI * (210 + 60 * Math.exp(-t * 50))) / SR;
    const x = (bp.run(noise()) * 0.9 + Math.sin(ph) * 0.5) * Math.exp(-t * 26) * g * 0.6;
    add(s + k, x, x * 0.95, 0.2);
  }
}

// ---------- arrangement ----------
// 0.00–2.00  intro: REC blip, three bounces (0.5 / 1.0 / 1.5), launch riser
blip(0.1, 1976, 0.22, 0.07);
blip(0.18, 2637, 0.16, 0.06);
tok(0.5, 1.0, 1.0);
tok(1.0, 1.12, 0.8);
tok(1.5, 1.26, 0.9);
riser(1.0, 1.0, 0.55);
whoosh(1.6, 0.4, 0.9);

// 2.00 — the drop
boom(2.0, 1.0);
crash(2.0, 1.0, 2.4);

// 2.00–12.00: four-on-the-floor groove, bass on the off-beats
const bassRoots = { 2: 45, 4: 45, 6: 41, 8: 43, 10: 40 }; // A1 A1 F1 G1 E1
const kickEnv = new Float32Array(N); // for sidechain ducking
for (let t = 2.0; t < 12.0 - 1e-6; t += BEAT) {
  kick(t, t === 2.0 ? 1.1 : 0.95);
  const s = Math.round(t * SR);
  for (let k = 0; k < SR * 0.3; k++) if (s + k < N) kickEnv[s + k] = Math.max(kickEnv[s + k], Math.exp(-(k / SR) * 12));
}
for (let t = 2.0; t < 12.0 - 1e-6; t += BEAT * 2) clap(t + BEAT, 0.85); // beats 2 and 4
for (let t = 2.0; t < 11.0 - 1e-6; t += BEAT / 2) {
  const off = Math.abs(((t - 2) / BEAT) % 1 - 0.5) < 1e-6;
  hat(t, off ? 1.0 : 0.45, off && Math.round((t - 2) / BEAT) % 4 === 3);
}

// bass: sub + filtered saw, off-beat 8ths, ducked by the kick
{
  const lp = biquad();
  let ph = 0;
  for (let i = Math.round(2 * SR); i < Math.round(12 * SR); i++) {
    const t = i / SR;
    const bar = 2 * Math.floor(t / 2);
    const root = bassRoots[bar] ?? 45;
    const inBeat = (t - 2) % BEAT;
    const gate = inBeat >= BEAT / 2 ? Math.exp(-(inBeat - BEAT / 2) * 7) : 0;
    const f = midi(root + (Math.floor((t - 2) / BEAT) % 4 === 3 ? 12 : 0));
    ph += (2 * Math.PI * f) / SR;
    if (i % 32 === 0) lp.set("lp", 180 + 900 * gate, 1.4);
    const x = (Math.sin(ph) * 0.8 + lp.run(saw(ph)) * 0.45) * gate * (1 - 0.8 * kickEnv[i]) * 0.55;
    add(i, x, x);
  }
}

// chord stabs on every scene cut
stab(2.0, [57, 60, 64, 69], 1.0); // Am
stab(4.0, [57, 60, 64, 67], 0.85); // Am7
stab(6.0, [53, 57, 60, 64], 0.85); // Fmaj7
stab(8.0, [55, 59, 62, 67], 0.9); // G
stab(10.0, [52, 55, 59, 64], 0.85); // Em
stab(3.0, [69, 72, 76], 0.35, 0.18); // small echo stab on the type wave
// letters landing in the type scene (16ths)
[2.125, 2.25, 2.375, 2.5, 2.625, 2.75].forEach((t, i) => blip(t, midi(81 + [0, 3, 7, 10, 12, 15][i]), 0.12, 0.06));

// transition whooshes
whoosh(3.68, 0.34, 0.8, 1);
whoosh(5.7, 0.3, 0.75, -1);
riser(7.2, 0.8, 0.45);
whoosh(7.6, 0.4, 1.0, 1);
whoosh(9.72, 0.28, 0.85, -1);
whoosh(11.62, 0.38, 0.85, 1);

// particles assembling: granular shimmer, seeded
for (let k = 0; k < 140; k++) {
  const u = rand();
  const t = 8.0 + Math.pow(u, 0.8) * 1.2;
  blip(t, 2200 + rand() * 4200, 0.03 + 0.03 * (1 - u), 0.03 + rand() * 0.04);
}
// grid wave ticks
for (let k = 0; k < 8; k++) blip(4.55 + k * 0.03, 3100 - k * 120, 0.05, 0.03);
for (let k = 0; k < 8; k++) blip(5.05 + k * 0.03, 2400 + k * 140, 0.05, 0.03);
// UI click
blip(11.0, 3800, 0.18, 0.02);
blip(11.01, 1400, 0.12, 0.03);

// build into the end card: accelerating snare roll
{
  let t = 11.0;
  let step = 0.125;
  let g = 0.25;
  while (t < 11.95) {
    snare(t, g);
    t += step;
    step = Math.max(0.045, step * 0.86);
    g = Math.min(0.85, g + 0.05);
  }
}

// 12.00 — end card: impact, bell on the logo dot, long chord tail
boom(12.0, 1.0);
crash(12.0, 0.8, 3);
kick(12.0, 1.1);
bell(12.52, midi(88), 1.0, 2.6);
bell(12.9, midi(95), 0.3, 2.0);
boom(9.5, 0.45); // particle shockwave
crash(8.0, 0.55, 1.6); // overexposure flash
blip(14.8, 1568, 0.3, 0.09); // the dot closes the reel
{
  // warm pad Am(add9), fades out by 15s
  const notes = [45, 57, 64, 71, 72];
  const phs = notes.map(() => 0);
  const lp = biquad();
  lp.set("lp", 1600, 0.8);
  for (let i = Math.round(12 * SR); i < N; i++) {
    const t = i / SR - 12;
    let x = 0;
    notes.forEach((m, j) => {
      phs[j] += (2 * Math.PI * midi(m) * (1 + 0.002 * Math.sin(t * 3 + j))) / SR;
      x += (Math.sin(phs[j]) + 0.3 * Math.sin(phs[j] * 2)) / notes.length;
    });
    const env = Math.min(1, t * 3) * Math.pow(Math.max(0, 1 - t / 3), 1.6);
    const y = lp.run(x) * env * 0.45;
    add(i, y, y, 0.3);
  }
}

// ---------- reverb (Schroeder/Freeverb-style) on the send bus ----------
function reverb(inp, seedOffset) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => ({ buf: new Float32Array(d + seedOffset), i: 0, s: 0 }));
  const aps = [556, 441, 341].map((d) => ({ buf: new Float32Array(d + seedOffset), i: 0 }));
  for (let n = 0; n < N; n++) {
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.s = y * 0.72 + c.s * 0.28; // damping
      c.buf[c.i] = inp[n] + c.s * 0.84;
      c.i = (c.i + 1) % c.buf.length;
      acc += y;
    }
    acc /= combs.length;
    for (const a of aps) {
      const b = a.buf[a.i];
      const y = -acc + b;
      a.buf[a.i] = acc + b * 0.5;
      a.i = (a.i + 1) % a.buf.length;
      acc = y;
    }
    out[n] = acc;
  }
  return out;
}
const wl = reverb(verbL, 0);
const wr = reverb(verbR, 23);

// ---------- master: reverb return, glue, fades, limiter ----------
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] += wl[i] * 1.6;
  R[i] += wr[i] * 1.6;
  const t = i / SR;
  const fadeOut = t > 14.45 ? Math.max(0, 1 - (t - 14.45) / 0.55) : 1;
  L[i] = Math.tanh(L[i] * 0.85) * fadeOut;
  R[i] = Math.tanh(R[i] * 0.85) * fadeOut;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.84 / peak;

// ---------- write 16-bit stereo WAV ----------
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
const out = fileURLToPath(new URL("./soundtrack.wav", import.meta.url));
writeFileSync(out, buf);
console.log(`wrote ${out} (${DUR}s, peak normalised from ${peak.toFixed(3)})`);
