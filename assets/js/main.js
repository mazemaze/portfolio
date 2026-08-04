/* ============================================================
   UI interactions — intro, reveals, scrollspy, mobile menu,
   header, progress bar, spotlight, tilt
   ============================================================ */

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Cinematic intro: veil lift + hero stagger ---------- */

  const veil = document.getElementById("veil");
  const heroReveals = document.querySelectorAll(".hero .reveal");

  function startIntro() {
    if (veil) {
      veil.classList.add("lifted");
      veil.addEventListener("transitionend", () => veil.remove(), { once: true });
    }
    heroReveals.forEach((el, i) => {
      el.style.transitionDelay = `${250 + i * 140}ms`;
      el.classList.add("in");
    });
  }

  if (reduced) {
    if (veil) veil.remove();
    heroReveals.forEach((el) => el.classList.add("in"));
  } else if (document.readyState === "complete") {
    startIntro();
  } else {
    window.addEventListener("load", startIntro, { once: true });
  }

  /* ---------- Reveal on scroll (everything below the hero) ---------- */

  const scrollReveals = document.querySelectorAll("main > .section .reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const siblings = Array.from(el.parentElement.querySelectorAll(":scope > .reveal"));
            const idx = Math.max(0, siblings.indexOf(el));
            el.style.transitionDelay = `${Math.min(idx * 90, 450)}ms`;
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    scrollReveals.forEach((el) => io.observe(el));
  } else {
    scrollReveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Header state + scroll progress ---------- */

  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
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
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        mobileMenu.hidden = false;
        requestAnimationFrame(() => mobileMenu.classList.add("open"));
      } else {
        mobileMenu.classList.remove("open");
        setTimeout(() => (mobileMenu.hidden = true), 300);
      }
    }
    menuBtn.addEventListener("click", () =>
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true")
    );
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setMenu(false))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false);
    });
  }

  /* ---------- Footer year ---------- */

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  if (!fine || reduced) return;

  /* ---------- Spotlight glow position ---------- */

  document.addEventListener(
    "pointermove",
    (e) => {
      const card = e.target.closest(".skill-card, .strength-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    },
    { passive: true }
  );

  /* ---------- 3D tilt on strength cards ---------- */

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
})();
