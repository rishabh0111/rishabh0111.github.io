/* ═══════════════════════════════════════════════════════════════════
   home-fx.js — the two GPU/canvas touches on the home page.

   1. particleName()  — the hero name is rasterised to an offscreen
      buffer, sampled into ~2k particles, and sprung into place from a
      scattered start. The pointer scatters them again on the way past.
      Not Canvas UI: its ParticleReveal needs the experimental
      html-in-canvas API, so real visitors would see nothing.

   2. pageBubble()     — Canvas UI's Bubble effect (vendored, see
      assets/js/vendor/canvas-ui-bubble.js) as a page-wide layer that
      trails the pointer. Runs its standalone WebGL fallback path.

   Both are progressive enhancement — with JS off, prefers-reduced-
   motion, or no WebGL, the plain page renders unchanged.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1 · Hero name particles ─────────────────────────────────── */
  function particleName() {
    var host = document.getElementById("hero-name");
    var canvas = document.getElementById("hero-name-fx");
    if (!host || !canvas || !canvas.getContext) return;
    if (reduce) return; // plain <h1> stays visible

    var first = host.getAttribute("data-first") || "";
    var accent = host.getAttribute("data-accent") || host.textContent.trim();
    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);

    var inkA = [0, 0, 0];
    var accentA = [0, 0, 0];
    var pts = [];
    var raf = 0;
    var running = false;
    var introAt = 0;
    var holdUntil = 0;
    var pointer = { x: -1e5, y: -1e5, on: 0, tx: -1e5, ty: -1e5, ton: 0 };
    var W = 0, H = 0, fontPx = 0;

    var R = 78; // pointer scatter radius (css px)

    function readColor(name, fallback) {
      var v = getComputedStyle(host).getPropertyValue(name).trim() || fallback;
      var probe = document.createElement("canvas").getContext("2d");
      probe.fillStyle = v;
      var hex = probe.fillStyle; // normalised to #rrggbb
      return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
      ];
    }

    // Internal raster resolution, independent of screen DPR: enough
    // detail that a thin serif still holds its shape as grains.
    var RS = 3;

    function build() {
      var cs = getComputedStyle(host);
      fontPx = parseFloat(cs.fontSize);
      // One line's height, from the font — not getBoundingClientRect,
      // which reads two lines tall while the live text is still wrapping.
      var lh = parseFloat(cs.lineHeight);
      H = Math.round(!lh || isNaN(lh) ? fontPx * 1.1 : Math.max(lh, fontPx * 1.02));

      inkA = readColor("--fx-ink", "#2E3440");
      accentA = readColor("--fx-accent", "#88C0D0");

      // Rasterise the name. Two runs, matching the DOM: "Rishabh "
      // upright, the surname italic (the <em>). Drawn a shade heavier
      // than the display weight so the grains read as letters.
      var off = document.createElement("canvas");
      var o = off.getContext("2d");
      var sz = fontPx * RS;
      var fam = cs.fontFamily;
      var ls = cs.letterSpacing;
      var fontFirst = ["600", sz + "px", fam].join(" ");
      var fontAcc = ["italic 600", sz + "px", fam].join(" ");
      var lsPx = ls && ls !== "normal" ? parseFloat(ls) * RS : 0;
      var canLS = "letterSpacing" in o;
      if (canLS && lsPx) o.letterSpacing = lsPx + "px";

      o.textBaseline = "middle";
      o.font = fontFirst;
      var wFirst = o.measureText(first).width + (canLS ? 0 : first.length * lsPx);
      o.font = fontAcc;
      var wAcc = o.measureText(accent).width + (canLS ? 0 : accent.length * lsPx);

      off.width = Math.ceil(wFirst + wAcc) + Math.ceil(sz * 0.14);
      off.height = Math.round(H * RS);
      // setting width/height reset the context
      if (canLS && lsPx) o.letterSpacing = lsPx + "px";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      o.strokeStyle = "#fff";
      o.lineJoin = "round";
      o.lineWidth = Math.max(1, RS * 0.5);
      var midY = off.height / 2 + sz * 0.02;
      o.font = fontFirst;
      o.fillText(first, 0, midY);
      o.strokeText(first, 0, midY);
      o.font = fontAcc;
      o.fillText(accent, wFirst, midY);
      o.strokeText(accent, wFirst, midY);
      var splitDev = wFirst;

      var img;
      try {
        img = o.getImageData(0, 0, off.width, off.height).data;
      } catch (e) { return; }

      var textW = off.width / RS;
      // On a narrow phone the one-line name is wider than its column.
      // Squeeze the whole field to fit rather than let it clip.
      var col = host.closest(".hero-text") || host.parentElement;
      var avail = col ? col.clientWidth : textW;
      var fit = Math.max(0.7, Math.min(1, avail / textW));
      var yoff = (H - H * fit) / 2;

      W = Math.ceil(textW * fit);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";

      var stride = Math.round(RS * 2.1); // ~2.1 css px between grains
      var reach = Math.max(64, W * 0.12);
      var ps = (stride / RS) * 1.15 * Math.max(fit, 0.82);
      pts.length = 0;

      for (var y = 0; y < off.height; y += stride) {
        for (var x = 0; x < off.width; x += stride) {
          if (img[(y * off.width + x) * 4 + 3] < 50) continue;
          var hx = (x / RS) * fit;
          var hy = (y / RS) * fit + yoff;
          var ang = Math.random() * 6.2832;
          var rr = 8 + Math.random() * reach;
          pts.push({
            hx: hx, hy: hy,
            x: hx + Math.cos(ang) * rr,
            y: hy + Math.sin(ang) * rr,
            vx: 0, vy: 0,
            acc: x >= splitDev,
            rel: (x / off.width) * 0.45 + Math.random() * 0.2, // stagger L → R
            s: ps
          });
        }
      }
      if (!pts.length) { canvas.style.display = "none"; return; }
      document.documentElement.classList.add("hero-fx-on");
    }

    var last = 0;

    function drawCrisp() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      for (var pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? "rgb(" + accentA.join(",") + ")" : "rgb(" + inkA.join(",") + ")";
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          if (!!p.acc !== !!pass) continue;
          p.x = p.hx; p.y = p.hy; p.vx = p.vy = 0;
          ctx.fillRect(p.hx - p.s / 2, p.hy - p.s / 2, p.s, p.s);
        }
      }
    }

    function frame(now) {
      raf = 0;
      if (!pts.length) return;
      if (!introAt) introAt = now;
      if (!last) last = now;
      var t = (now - introAt) / 1000;
      var dt = Math.min(2.4, Math.max(0.2, (now - last) / 16.667)); // 60fps steps
      last = now;

      pointer.on += (pointer.ton - pointer.on) * Math.min(1, 0.14 * dt);
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, 0.4 * dt);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, 0.4 * dt);

      // Spring stiffens over the first ~2.5s so stragglers can't dawdle.
      var SPRING = 0.10 + Math.min(0.35, Math.max(0, t - 1.4) * 0.35);
      var DAMP = 0.78;
      var maxd = 0;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var inkCss = "rgb(" + inkA.join(",") + ")";
      var accCss = "rgb(" + accentA.join(",") + ")";

      for (var pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? accCss : inkCss;
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          if (!!p.acc !== !!pass) continue;

          var released = t > p.rel;
          if (released) {
            var dx = p.x - pointer.x, dy = p.y - pointer.y;
            var d2 = dx * dx + dy * dy;
            if (pointer.on > 0.01 && d2 < R * R) {
              var d = Math.sqrt(d2) || 0.001;
              var f = (1 - d / R) * 4.6 * pointer.on * dt;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
            p.vx += (p.hx - p.x) * SPRING * dt;
            p.vy += (p.hy - p.y) * SPRING * dt;
            var damp = Math.pow(DAMP, dt);
            p.vx *= damp; p.vy *= damp;
            p.x += p.vx * dt; p.y += p.vy * dt;
          }
          var off1 = Math.abs(p.hx - p.x) + Math.abs(p.hy - p.y) + Math.abs(p.vx) + Math.abs(p.vy);
          if (released && off1 > maxd) maxd = off1;

          var home = Math.abs(p.hx - p.x) + Math.abs(p.hy - p.y);
          ctx.globalAlpha = released ? Math.max(0.1, Math.min(1, 1.15 - home / 40)) : 0;
          ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        }
      }
      ctx.globalAlpha = 1;

      var pointerIdle = pointer.on < 0.02;
      var forceSettle = t > 3 && pointerIdle;
      var busy = !forceSettle &&
        (maxd > 0.35 || t < 1.0 || !pointerIdle || now < holdUntil);
      if (busy) {
        raf = requestAnimationFrame(frame);
      } else {
        drawCrisp();
        running = false;
      }
    }

    function start() {
      if (running || !pts.length) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - r.left;
      pointer.ty = e.clientY - r.top;
      if (pointer.ton === 0) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
      pointer.ton = 1;
      holdUntil = performance.now() + 400;
      start();
    }
    function onLeave() { pointer.ton = 0; start(); }

    var host2 = canvas.parentElement || canvas;
    host2.addEventListener("pointermove", onMove, { passive: true });
    host2.addEventListener("pointerleave", onLeave, { passive: true });

    var rebuildTimer = 0;
    function rebuild() {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(function () {
        introAt = 0;
        build();
        holdUntil = performance.now() + 1200;
        start();
      }, 180);
    }
    window.addEventListener("resize", rebuild, { passive: true });

    var themeObs = new MutationObserver(function () {
      inkA = readColor("--fx-ink", "#2E3440");
      accentA = readColor("--fx-accent", "#88C0D0");
      holdUntil = performance.now() + 400;
      start();
    });
    themeObs.observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme", "data-theme-choice"]
    });

    var snap = /[?&]fxsnap\b/.test(location.search);

    function go() {
      build();
      if (!pts.length) return;
      if (snap) { drawCrisp(); return; } // screenshots: skip the intro
      holdUntil = performance.now() + 1200;
      start();
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go);
      setTimeout(function () { if (!pts.length) go(); }, 1200);
    } else {
      go();
    }
  }

  /* ── 2 · Page-wide Bubble (Canvas UI, vendored) ──────────────── */
  function pageBubble() {
    if (reduce) return;
    // It trails the pointer — there isn't one on a touch screen, and the
    // full-page blend canvas is a real cost to composite on every scroll
    // frame. Phones get the plain page.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!window.CanvasUIBubble || !window.CanvasUIBubble.createBubble) return;
    if (!window.WebGL2RenderingContext) return;

    var out = document.createElement("canvas");
    out.id = "cui-bubble";
    out.setAttribute("aria-hidden", "true");
    document.body.appendChild(out);
    var src = document.createElement("canvas");

    var inst = window.CanvasUIBubble.createBubble(
      { source: src, content: document.body, output: out },
      {
        // Visible radius is driven mostly by trail (metaball count) and
        // blend (bloom), not size — so all three come down together.
        size: 7,
        trail: 12,
        follow: 0.5,
        blend: 12,
        speed: 1.2,
        refraction: 30,
        dispersion: 1.1,
        frost: 0,
        shine: 0.28,
        rim: 0.55,
        iridescence: 0.95,
        intensity: 0.85,
        // Nord frost → blue film
        colorA: [0.533, 0.753, 0.816],
        colorB: [0.369, 0.506, 0.675],
        fallbackOpacity: 1
      }
    );
    if (!inst) out.remove();
  }

  function init() {
    particleName();
    pageBubble();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
