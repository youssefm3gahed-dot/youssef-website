/* ══════════════════════════════════════════════════════════
   YOUSSEF MOGAHED — Personal Identity Page
   Vanilla JS • theme handling • contact menu • micro-interactions
   ══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var root = document.documentElement;
  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ────────────────────────────────────────────────────────
     1. THEME  (dark / light, persisted, system-aware)
     ──────────────────────────────────────────────────────── */

  var themeToggle = document.getElementById("themeToggle");
  var themeMeta = document.getElementById("themeMeta");
  var metaColors = { dark: "#08080e", light: "#f3f0e9" };

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", metaColors[theme]);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
    if (persist) {
      try { localStorage.setItem("ym-theme", theme); } catch (e) { /* private mode */ }
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  }

  /* Keep the toggle label + meta in sync on load, and follow the
     system theme live UNTIL the user makes an explicit choice. */
  applyTheme(currentTheme(), false);

  var schemeQuery = window.matchMedia("(prefers-color-scheme: light)");
  function onSchemeChange(e) {
    var saved = null;
    try { saved = localStorage.getItem("ym-theme"); } catch (err) { /* ignore */ }
    if (saved !== "dark" && saved !== "light") {
      applyTheme(e.matches ? "light" : "dark", false);
    }
  }
  if (schemeQuery.addEventListener) schemeQuery.addEventListener("change", onSchemeChange);
  else if (schemeQuery.addListener) schemeQuery.addListener(onSchemeChange);

  /* ────────────────────────────────────────────────────────
     2. PROFILE PHOTO  → graceful fallback to "YM" monogram
     ──────────────────────────────────────────────────────── */

  var photo = document.getElementById("profilePhoto");
  var frame = document.getElementById("portraitFrame");

  function showPhotoFallback() {
    if (frame) frame.classList.add("no-photo");
  }

  if (photo && frame) {
    photo.addEventListener("error", showPhotoFallback);
    photo.addEventListener("load", function () {
      if (photo.naturalWidth === 0) showPhotoFallback();
    });
    /* covers cached / already-failed loads when script runs */
    if (photo.complete && photo.naturalWidth === 0) showPhotoFallback();
  }

  /* ────────────────────────────────────────────────────────
     3. GET IN TOUCH  → animated contact menu
     ──────────────────────────────────────────────────────── */

  var zone = document.getElementById("contactZone");
  var toggle = document.getElementById("contactToggle");
  var panel = document.getElementById("contactPanel");
  var closeBtn = document.getElementById("contactClose");

  function setMenuOpen(open) {
    if (!zone || !toggle || !panel) return;
    zone.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
  }

  function isMenuOpen() {
    return zone ? zone.classList.contains("is-open") : false;
  }

  if (zone && toggle && panel) {
    toggle.addEventListener("click", function () {
      setMenuOpen(!isMenuOpen());
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setMenuOpen(false);
        toggle.focus({ preventScroll: true });
      });
    }

    /* Escape closes */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMenuOpen()) {
        setMenuOpen(false);
        toggle.focus({ preventScroll: true });
      }
    });

    /* Click / tap outside closes */
    document.addEventListener("pointerdown", function (e) {
      if (isMenuOpen() && !zone.contains(e.target)) {
        setMenuOpen(false);
      }
    });
  }

  /* ────────────────────────────────────────────────────────
     4. PORTRAIT TILT  (desktop, pointer devices only)
     ──────────────────────────────────────────────────────── */

  var portrait = document.getElementById("portrait");
  var tilt = document.getElementById("portraitTilt");

  if (portrait && tilt && motionOK && finePointer) {
    var MAX_TILT = 7; /* degrees */

    portrait.addEventListener("mousemove", function (e) {
      var r = portrait.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.setProperty("--ry", (px * MAX_TILT).toFixed(2) + "deg");
      tilt.style.setProperty("--rx", (-py * MAX_TILT).toFixed(2) + "deg");
    });

    portrait.addEventListener("mouseleave", function () {
      tilt.style.setProperty("--rx", "0deg");
      tilt.style.setProperty("--ry", "0deg");
    });
  }

  /* ────────────────────────────────────────────────────────
     5. CURSOR SPOTLIGHT  (subtle ambient glow, desktop only)
     ──────────────────────────────────────────────────────── */

  var spot = document.getElementById("spotlight");

  if (spot && motionOK && finePointer) {
    var pendingX = null;
    var pendingY = null;
    var rafId = 0;

    document.body.classList.add("spot-on");

    window.addEventListener("pointermove", function (e) {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!rafId) {
        rafId = window.requestAnimationFrame(function () {
          rafId = 0;
          if (pendingX !== null) {
            spot.style.setProperty("--mx", pendingX + "px");
            spot.style.setProperty("--my", pendingY + "px");
          }
        });
      }
    }, { passive: true });
  }

  /* ────────────────────────────────────────────────────────
     6. FOOTER YEAR
     ──────────────────────────────────────────────────────── */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

})();
