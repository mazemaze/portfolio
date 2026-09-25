/* ============================================================
   UI interactions — boot, kinetic type, reveals, counters,
   camera HUD, scrollspy, mobile menu, showreel play
   ============================================================ */

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const body = document.body;

  /* ---------- Kinetic type: split headings into letters ---------- */

  const splitter =
    typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  function split(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    let i = 0;
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(" "));
        return;
      }
      const word = document.createElement("span");
      word.className = "w";
      word.setAttribute("aria-hidden", "true");
      const chars = splitter ? Array.from(splitter.segment(part), (s) => s.segment) : Array.from(part);
      chars.forEach((c) => {
        const ch = document.createElement("span");
        ch.className = "ch";
        ch.style.setProperty("--i", i++);
        ch.textContent = c;
        word.appendChild(ch);
      });
      el.appendChild(word);
    });
  }
  const splitAll = () => document.querySelectorAll("[data-split]").forEach(split);
  splitAll();
  document.addEventListener("i18n:change", () => {
    splitAll();
    hudLabels();
    onScroll();
  });

  /* ---------- Boot: wait for fonts, then play the entrance ---------- */

  function boot() {
    body.classList.remove("is-booting");
    body.classList.add("is-live");
  }
  if (reduced) boot();
  else {
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1600))]).then(() => requestAnimationFrame(boot));
  }

  /* ---------- Reveal on scroll ---------- */

  const reveals = document.querySelectorAll("main .reveal, .contact-line");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = Array.from(el.parentElement.querySelectorAll(":scope > .reveal"));
          const idx = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
          el.classList.add("in");
          el.querySelectorAll("[data-count]").forEach(count);
          io.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Counters (5+, 15+, 10+, 10k+) ---------- */

  function count(el) {
    const to = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const t0 = performance.now();
    const dur = 400; // ui-baseline: large movement
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.innerHTML = Math.round(to * e) + "<em>" + suffix + "</em>";
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }
  if (reduced) document.querySelectorAll("[data-count]").forEach((el) => (el.innerHTML = el.dataset.count + "<em>" + (el.dataset.suffix || "") + "</em>"));

  /* ---------- Camera HUD: chapter label, scroll %, progress, header ---------- */

  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const chapterEl = document.getElementById("hudChapter");
  const pctEl = document.getElementById("hudPct");
  const chapterIds = ["hero", "showreel", "about", "strengths", "skills", "experience", "contact"];
  let chapters = [];
  function hudLabels() {
    const lang = document.documentElement.lang === "ja" ? "ja" : "en";
    const dict = (typeof I18N !== "undefined" ? I18N : {})[lang] || {};
    const reel = dict["reel.title"] || "Showreel";
    const names = {
      hero: dict["hud.top"] || "Top",
      showreel: reel,
      about: dict["nav.about"],
      strengths: dict["nav.strengths"],
      skills: dict["nav.skills"],
      experience: dict["nav.experience"],
      contact: dict["nav.contact"],
    };
    chapters = chapterIds.map((id, i) => ({ el: document.getElementById(id), label: `${String(Math.max(0, i - 1)).padStart(2, "0")} · ${names[id]}` }));
    chapters[0].label = names.hero;
  }
  hudLabels();
  let lastLabel = "";
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const k = max > 0 ? y / max : 0;
    if (progress) progress.style.transform = `scaleX(${k})`;
    if (pctEl) pctEl.textContent = String(Math.round(k * 100)).padStart(3, "0");
    const mid = y + window.innerHeight * 0.45;
    let label = chapters[0] && chapters[0].label;
    chapters.forEach((c) => {
      if (c.el && c.el.offsetTop <= mid) label = c.label;
    });
    if (chapterEl && label !== lastLabel) {
      lastLabel = label;
      chapterEl.textContent = label;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Scrollspy ---------- */

  const navLinks = document.querySelectorAll(".site-nav a");
  const spyTargets = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && spyTargets.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => {
            const active = a.getAttribute("href") === "#" + entry.target.id;
            a.classList.toggle("active", active);
            if (active) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    spyTargets.forEach((s) => spy.observe(s));
  }

  /* ---------- Mobile menu ---------- */

  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    function setMenu(open) {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.classList.toggle("open", open);
      body.style.overflow = open ? "hidden" : "";
      if (open) {
        mobileMenu.hidden = false;
        requestAnimationFrame(() => mobileMenu.classList.add("open"));
      } else {
        mobileMenu.classList.remove("open");
        setTimeout(() => (mobileMenu.hidden = true), 300);
      }
    }
    menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false);
    });
  }

  /* ---------- Showreel: silent loops on the devices + full player ---------- */

  const saveData = navigator.connection && navigator.connection.saveData;
  const devices = document.getElementById("reelDevices");
  const pauseBtn = document.getElementById("reelPause");
  const dialog = document.getElementById("reelDialog");
  const errorEl = document.getElementById("reelError");
  const shown = (v) => getComputedStyle(v).display !== "none";
  let loopsVisible = false;
  let userPaused = false;
  const autoplayAllowed = !reduced && !saveData;

  function syncLoops() {
    const run = autoplayAllowed && loopsVisible && !userPaused && !(dialog && dialog.open);
    document.querySelectorAll(".loop").forEach((v) => {
      if (run && shown(v)) v.play().catch(() => {});
      else v.pause();
    });
    if (pauseBtn) {
      const dict = (typeof I18N !== "undefined" ? I18N : {})[document.documentElement.lang === "ja" ? "ja" : "en"] || {};
      pauseBtn.setAttribute("aria-pressed", String(userPaused));
      pauseBtn.classList.toggle("paused", userPaused || !autoplayAllowed);
      pauseBtn.querySelector("span").textContent = userPaused || !autoplayAllowed ? dict["reel.play"] : dict["reel.pause"];
    }
  }
  if (devices && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      loopsVisible = entries[0].isIntersecting;
      syncLoops();
    }, { threshold: 0.25 }).observe(devices);
  }
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      if (!autoplayAllowed) {
        // reduced motion / data saver: the button starts the loops on request
        document.querySelectorAll(".loop").forEach((v) => shown(v) && (v.paused ? v.play().catch(() => {}) : v.pause()));
        return;
      }
      userPaused = !userPaused;
      syncLoops();
    });
  }
  document.addEventListener("i18n:change", syncLoops);
  syncLoops();

  function currentFull() {
    return Array.from(document.querySelectorAll(".reel-video")).find(shown);
  }
  function openReel() {
    if (!dialog || typeof dialog.showModal !== "function") {
      const v = currentFull();
      if (v) v.play().catch(() => {});
      return;
    }
    if (errorEl) errorEl.hidden = true;
    dialog.showModal();
    syncLoops();
    const v = currentFull();
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }
  if (dialog) {
    document.getElementById("reelClose").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => e.target === dialog && dialog.close()); // backdrop
    dialog.addEventListener("close", () => {
      document.querySelectorAll(".reel-video").forEach((v) => v.pause());
      syncLoops();
    });
    document.querySelectorAll(".reel-video").forEach((v) =>
      v.addEventListener("error", () => {
        if (errorEl) {
          errorEl.querySelector("a").setAttribute("href", v.getAttribute("src"));
          errorEl.hidden = false;
        }
      })
    );
  }
  document.querySelectorAll("[data-play-reel]").forEach((btn) => btn.addEventListener("click", openReel));

  /* ---------- Footer year ---------- */

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  if (!fine || reduced) return;

  /* ---------- Pointer light on panels ---------- */

  document.addEventListener(
    "pointermove",
    (e) => {
      const card = e.target.closest(".skill, .strength, .job");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    },
    { passive: true }
  );

  /* ---------- Magnetic buttons ---------- */

  document.querySelectorAll(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
})();
