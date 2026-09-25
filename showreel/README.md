# Showreel ’26 — 15-second motion reel

A 15-second, 1920×1080 / 30 fps motion-design showreel built entirely in code:
[HyperFrames](https://hyperframes.heygen.com) HTML + GSAP for picture, and a
procedural Node synth for the soundtrack. No stock footage, samples, or
plugins — every frame is a pure function of time, so renders are repeatable.

![Contact sheet](docs/contact-sheet.jpg)

## What’s in it

| Time | Chapter | Technique on show |
| --- | --- | --- |
| 0–2 s | 01 Squash & stretch | Physics-driven bounce with squash/stretch, onion skins, arc trace, annotated principles; the ball launches into an iris |
| 2–4 s | 02 Kinetic type | Letters drop on 16th notes and squash via the variable-font width axis (`wdth` 50–150), marquee, rotating badge; staggered-block wipe out |
| 4–6 s | 03 Systems & rhythm | 48-cell Bauhaus grid: grid-staggered waves, shape morphs, ripple on the beat; zoom-through into one cell |
| 6–8 s | 04 Depth & camera | CSS 3D tunnel of frames + 18-layer extruded type, axis gizmo; flies through the lens into an overexposure flash |
| 8–10 s | 05 Generative | 4,200 seeded canvas particles burst, assemble into “ALIVE”, shockwave, whip-pan out |
| 10–12 s | 06 Product UI | Micro-interactions: count-ups, chart draw, toggle, progress ring, cursor press + ripple; the click blooms into an iris |
| 12–15 s | 07 Sign-off | The iris lands as the full stop after the name; end card and fade |

The soundtrack (`audio/synth.mjs`) runs at 120 BPM, so every cut sits on a bar
line (2, 4, 6, 8, 10, 12 s) and the ball’s three bounces land on beats
(0.5 / 1.0 / 1.5 s).

## Files

```
index.html          # the whole composition (one timeline; transitions cross scene boundaries)
audio/synth.mjs     # procedural soundtrack -> audio/soundtrack.wav -> soundtrack.m4a
fonts/              # Anybody (variable) + IBM Plex Mono, both SIL OFL (licenses included)
showreel.mp4        # the rendered reel (H.264 CRF 18, AAC, faststart)
docs/               # contact sheet + preview GIF
```

## Preview and render

Requires Node 22+ and FFmpeg.

```sh
cd showreel
npm run dev      # live preview in HyperFrames Studio
npm run check    # lint + runtime + layout + motion + contrast
npm run render   # renders/master.mp4 -> showreel.mp4
npm run audio    # re-synthesise the soundtrack
```

### Put your own name on the end card

The end card’s name and role are composition variables (long names auto-fit):

```sh
npx --yes hyperframes@0.8.77 render --quality high \
  --variables '{"name":"Your Name","role":"Motion Designer"}' \
  --output renders/your-name.mp4
```
