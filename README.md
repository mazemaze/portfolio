# Yujiro Hikawa — Portfolio

A bilingual (Japanese / English) single-page portfolio in the showreel's visual
language, with a scroll-driven Three.js particle story behind it. Zero build step — plain HTML/CSS/JS, libraries loaded from pinned CDNs.

## Structure

```
index.html                 # all sections, data-i18n attributes ("Signal" design)
skill-match.html           # ◯/△/× skill-match sheet for recruiting agents (JA-only, self-contained JS)
showreel/                  # 15s showreel, English + Japanese (HyperFrames source, videos, silent loops; see showreel/README.md)
assets/css/signal.css      # home page design: ink / bone / signal orange, HUD details, motion
assets/css/style.css       # previous theme, still used by skill-match.html
assets/css/skill-match.css # skill-match page tables/FAQ styles
assets/js/i18n.js          # JA/EN dictionary + language toggle
assets/js/story.js         # Three.js particle story: one point cloud, a formation per section
assets/js/main.js          # boot, kinetic type, reveals, counters, HUD, menu, showreel loops/player
.nojekyll                  # serve as plain static files on GitHub Pages
```

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly via `file://` won't work — ES modules require HTTP.)

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `portfolio`).
2. Push this directory:
   ```sh
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin git@github.com:mazemaze/portfolio.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Source: Deploy from a branch →
   Branch: `main`, folder: `/ (root)` → Save.**
4. The site goes live at `https://mazemaze.github.io/portfolio/`
   within a minute or two.

To use the root domain (`https://mazemaze.github.io/`), name the repo
`mazemaze.github.io` instead.

## Contact links

GitHub (`mazemaze`), email, and LinkedIn are already wired up in the Contact
section of `index.html`.
