/* ═══════════════════════════════════════════════════════════════════
   home-bits.js — the rest of the React Bits on the home page.

   Companion to home-fx.js (which carries the scene, the hero and the
   pointer effects). Every piece here is a plain-JS port of a React
   Bits component fetched from its shadcn registry and rewritten
   without React, GSAP or motion:

     lineSidebar()      Line Sidebar       the rail's beads and labels reach for the pointer
     targetCursor()     Target Cursor      corner brackets that snap around targets
     counters()         Counter            the metrics as rolling digits
     decrypt()          Decrypted Text     mono labels scramble into place
     typewrite()        Text Type          the "now" line types itself
     dock()             Dock               hero pills magnify near the pointer
     accordion()        Accordion Gallery  project shots as expanding panels
     pixelPlates()      Pixel Card         a pixel field on the cover plates
     dotGrid()          Dot Grid           the projects band's dots, pushed by the pointer
     electricBorder()   Electric Border    the current job's live edge
     magnetLines()      Magnet Lines       needles pointing at the pointer, behind Contact
     specular()         Specular Button    a highlight that follows the pointer on buttons
     trueFocus()        True Focus         a frame hopping between the off-hours words
     scrollVelocity()   Scroll Velocity    the toolkit loops speed up with the scroll
     gradualBlur()      Gradual Blur       the page dissolves at the bottom edge

   All progressive; with reduced motion, a coarse pointer or no JS the
   page is simply still.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;
  var canIO = "IntersectionObserver" in window;
  function cssVar(name, el) { return getComputedStyle(el || root).getPropertyValue(name).trim(); }
  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
  function onEnter(el, fn, threshold) {
    if (!canIO) { fn(); return; }
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: threshold || 0.3 });
    io.observe(el);
  }

  /* ── Line Sidebar — the rail's beads reach for the pointer ─────────
     The rail keeps its beads, thread and label pills; from Line
     Sidebar it takes --effect (0..1) per item — 1 for the active
     section, otherwise how near the pointer is — eased every frame,
     so a bead swells and its label slides out as the pointer nears. */
  function lineSidebar() {
    var rail = document.getElementById("drail");
    if (!rail) return;
    var links = Array.prototype.slice.call(rail.querySelectorAll("a[data-drail]"));
    if (!fine || reduce) return;
    rail.classList.add("is-near");
    var target = links.map(function () { return 0; }), cur = links.map(function () { return 0; });
    var raf = 0;
    function tick() {
      var moving = false;
      links.forEach(function (a, i) {
        var t = a.classList.contains("is-active") ? 1 : target[i];
        cur[i] += (t - cur[i]) * 0.18;
        if (Math.abs(t - cur[i]) > 0.002) moving = true;
        a.style.setProperty("--effect", cur[i].toFixed(3));
      });
      raf = moving ? requestAnimationFrame(tick) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    rail.addEventListener("mousemove", function (e) {
      links.forEach(function (a, i) {
        var r = a.getBoundingClientRect();
        var d = Math.abs(e.clientY - (r.top + r.height / 2));
        target[i] = clamp(1 - d / 110, 0, 1);
      });
      kick();
    });
    rail.addEventListener("mouseleave", function () { target = target.map(function () { return 0; }); kick(); });
    new MutationObserver(kick).observe(rail, { attributes: true, subtree: true, attributeFilter: ["class"] });
    kick();
  }

  /* ── Target Cursor ────────────────────────────────────────────────
     The native cursor gives way to a dot with four corner brackets
     that turn slowly; over a target the brackets fly to its corners
     and hold there until the pointer leaves. Drawn in difference
     blend, so it reads on both themes. */
  function targetCursor() {
    if (!fine || reduce) return;
    var wrap = document.createElement("div");
    wrap.className = "tc"; wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = '<i class="tc-dot"></i><i class="tc-c tc-tl"></i><i class="tc-c tc-tr"></i><i class="tc-c tc-br"></i><i class="tc-c tc-bl"></i>';
    document.body.appendChild(wrap);
    document.body.classList.add("has-tc");
    var corners = Array.prototype.slice.call(wrap.querySelectorAll(".tc-c"));
    var SEL = "a, button, summary, .tile, .proj, .pcard, .tool, .chips li, .drail a";
    var x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;
    var active = null, raf = 0;
    var HOME = [[-18, -18], [6, -18], [6, 6], [-18, 6]];
    function place() {
      x += (tx - x) * 0.35; y += (ty - y) * 0.35;
      wrap.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      if (active) {
        var r = active.getBoundingClientRect(), b = 3, pad = 4;
        var pts = [[r.left - pad, r.top - pad], [r.right + pad - 12, r.top - pad], [r.right + pad - 12, r.bottom + pad - 12], [r.left - pad, r.bottom + pad - 12]];
        corners.forEach(function (c, i) {
          c.style.transform = "translate3d(" + (pts[i][0] - x).toFixed(1) + "px," + (pts[i][1] - y).toFixed(1) + "px,0)";
        });
        void b;
      }
      raf = requestAnimationFrame(place);
    }
    function home() {
      corners.forEach(function (c, i) { c.style.transform = "translate3d(" + HOME[i][0] + "px," + HOME[i][1] + "px,0)"; });
    }
    home();
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      var t = e.target.closest ? e.target.closest(SEL) : null;
      if (t !== active) {
        active = t;
        wrap.classList.toggle("is-on", !!active);
        if (!active) home();
      }
    }, { passive: true });
    window.addEventListener("scroll", function () { if (active && !document.elementFromPoint(tx, ty)) { active = null; wrap.classList.remove("is-on"); home(); } }, { passive: true });
    document.addEventListener("mouseleave", function () { wrap.classList.add("is-away"); });
    document.addEventListener("mouseenter", function () { wrap.classList.remove("is-away"); });
    window.addEventListener("mousedown", function () { wrap.classList.add("is-down"); });
    window.addEventListener("mouseup", function () { wrap.classList.remove("is-down"); });
    raf = requestAnimationFrame(place);
  }

  /* ── Counter — the metrics as rolling digits ───────────────────────
     Each digit is a column of 0–9 that slides to its value, the units
     first, the higher places after; the prefix and suffix ("+", "%")
     stay put. Replaces the count-up. */
  function counters() {
    var figs = document.querySelectorAll(".metric-figure[data-count]");
    Array.prototype.forEach.call(figs, function (el) {
      var raw = el.getAttribute("data-count");
      var m = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
      if (!m) return;
      var num = m[2];
      el.textContent = "";
      el.classList.add("odo");
      if (m[1]) el.appendChild(document.createTextNode(m[1]));
      var cols = [];
      Array.from(num).forEach(function (ch) {
        if (ch === "." || ch === ",") { var d = document.createElement("span"); d.className = "odo-sep"; d.textContent = ch; el.appendChild(d); return; }
        var col = document.createElement("span"); col.className = "odo-col";
        var strip = document.createElement("span"); strip.className = "odo-strip";
        for (var i = 0; i < 10; i++) { var n = document.createElement("i"); n.textContent = i; strip.appendChild(n); }
        col.appendChild(strip); el.appendChild(col);
        cols.push({ strip: strip, v: parseInt(ch, 10) });
      });
      if (m[3]) el.appendChild(document.createTextNode(m[3]));
      if (reduce) { cols.forEach(function (c) { c.strip.style.transform = "translateY(" + (-c.v * 10) + "%)"; }); return; }
      onEnter(el, function () {
        cols.forEach(function (c, i) {
          c.strip.style.transitionDelay = ((cols.length - 1 - i) * 90) + "ms";
          requestAnimationFrame(function () { c.strip.style.transform = "translateY(" + (-c.v * 10) + "%)"; });
        });
      }, 0.5);
    });
  }

  /* ── Decrypted Text — mono labels scramble into place ─────────────
     On arrival each label shows random characters that resolve into
     the real ones from the start, a few at a time. */
  function decrypt() {
    var els = document.querySelectorAll("[data-decrypt]");
    if (!els.length || reduce) return;
    var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&";
    Array.prototype.forEach.call(els, function (el) {
      var text = el.textContent;
      onEnter(el, function () {
        var revealed = 0, ticks = 0;
        var iv = setInterval(function () {
          ticks++;
          if (ticks % 2 === 0) revealed++;
          var out = "";
          for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (i < revealed || ch === " " || ch === "·" || ch === "—" || ch === "&") out += ch;
            else out += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          el.textContent = out;
          if (revealed >= text.length) { clearInterval(iv); el.textContent = text; }
        }, 28);
      }, 0.6);
    });
  }

  /* ── Text Type — the "now" line types itself out ──────────────────*/
  function typewrite() {
    var el = document.querySelector("[data-typewrite]");
    if (!el || reduce) return;
    var dot = el.querySelector(".status-dot");
    var text = el.textContent.trim();
    el.textContent = "";
    if (dot) el.appendChild(dot);
    var out = document.createElement("span"); out.className = "tt";
    var cur = document.createElement("span"); cur.className = "tt-cursor"; cur.textContent = "▍";
    el.appendChild(out); el.appendChild(cur);
    el.setAttribute("aria-label", text);
    onEnter(el, function () {
      var i = 0;
      var iv = setInterval(function () {
        out.textContent = text.slice(0, ++i);
        if (i >= text.length) { clearInterval(iv); setTimeout(function () { cur.classList.add("is-done"); }, 1800); }
      }, 34);
    }, 0.6);
  }

  /* ── Dock — the hero pills magnify near the pointer ───────────────*/
  function dock() {
    var nav = document.querySelector(".hero .hero-links");
    if (!nav || !fine || reduce) return;
    var items = Array.prototype.slice.call(nav.querySelectorAll("a"));
    var R = 130, MAX = 0.28;
    nav.classList.add("is-dock");
    function set(e) {
      items.forEach(function (a) {
        var r = a.getBoundingClientRect();
        var d = Math.abs(e.clientX - (r.left + r.width / 2));
        var s = 1 + MAX * Math.max(0, 1 - d / R);
        a.style.setProperty("--dock-s", s.toFixed(3));
      });
    }
    nav.addEventListener("mousemove", set);
    nav.addEventListener("mouseleave", function () { items.forEach(function (a) { a.style.setProperty("--dock-s", "1"); }); });
  }

  /* ── Accordion Gallery — project shots as expanding panels ────────
     The hovered (or tapped) shot grows, the rest narrow and grey. */
  function accordion() {
    Array.prototype.forEach.call(document.querySelectorAll(".proj-carousel.ag"), function (gal) {
      var panels = Array.prototype.slice.call(gal.querySelectorAll(".shot"));
      if (panels.length < 2) { gal.classList.add("ag-single"); return; }
      function activate(p) { panels.forEach(function (q) { q.classList.toggle("is-active", q === p); }); }
      activate(panels[0]);
      panels.forEach(function (p) {
        p.setAttribute("tabindex", "0");
        if (fine) p.addEventListener("mouseenter", function () { activate(p); });
        p.addEventListener("click", function () { activate(p); });
        p.addEventListener("focus", function () { activate(p); });
      });
    });
  }

  /* ── Pixel Card — a field of pixels on the cover plates ───────────
     Pixels grow in from a random delay and shimmer while the pointer
     is over the plate, then shrink away. */
  function pixelPlates() {
    if (reduce) return;
    Array.prototype.forEach.call(document.querySelectorAll(".proj-plate"), function (plate) {
      var canvas = document.createElement("canvas");
      canvas.className = "pixel-canvas"; canvas.setAttribute("aria-hidden", "true");
      plate.insertBefore(canvas, plate.firstChild);
      var ctx = canvas.getContext("2d"), pixels = [], raf = 0, mode = "";
      var GAP = 7, SPEED = 0.03;
      function colors() {
        var a = cssVar("--accent") || "#88C0D0";
        return [a, "color-mix(in srgb, " + a + " 60%, transparent)", "color-mix(in srgb, " + a + " 30%, transparent)"];
      }
      function build() {
        var r = plate.getBoundingClientRect();
        canvas.width = r.width; canvas.height = r.height;
        pixels = [];
        var cs = colors();
        for (var x = 0; x < r.width; x += GAP) for (var y = 0; y < r.height; y += GAP) {
          var dist = Math.hypot(x - r.width / 2, y - r.height / 2);
          pixels.push({ x: x, y: y, color: cs[Math.floor(Math.random() * cs.length)], size: 0,
                        max: 0.5 + Math.random() * 1.5, step: Math.random() * 0.4, speed: (0.1 + Math.random() * 0.8) * SPEED,
                        delay: dist * 0.9, counter: 0, counterStep: Math.random() * 4 + (r.width + r.height) * 0.01, shimmer: false, rev: false, idle: false });
        }
      }
      function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var allIdle = true;
        pixels.forEach(function (p) {
          if (mode === "appear") {
            p.idle = false;
            if (p.counter <= p.delay) { p.counter += p.counterStep; allIdle = false; return; }
            if (p.size >= p.max) p.shimmer = true;
            if (p.shimmer) { if (p.size >= p.max) p.rev = true; else if (p.size <= 0.5) p.rev = false; p.size += p.rev ? -p.speed : p.speed; }
            else p.size += p.step;
            allIdle = false;
          } else {
            p.shimmer = false; p.counter = 0;
            if (p.size <= 0) { p.idle = true; return; }
            p.size -= 0.1;
            allIdle = false;
          }
          var off = 1 - p.size / 2;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x + off, p.y + off, p.size, p.size);
        });
        raf = allIdle ? 0 : requestAnimationFrame(frame);
      }
      function go(m) { mode = m; if (!raf) raf = requestAnimationFrame(frame); }
      build();
      window.addEventListener("resize", build, { passive: true });
      var card = plate.closest(".proj") || plate;
      card.addEventListener("mouseenter", function () { go("appear"); });
      card.addEventListener("mouseleave", function () { go("disappear"); });
    });
  }

  /* ── Dot Grid — the projects band's dots ──────────────────────────
     A grid of small dots; near the pointer they take the accent, and
     a fast pointer shoves them aside, after which they spring back. */
  function dotGrid() {
    var band = document.getElementById("projects");
    if (!band || reduce) return;
    var canvas = document.createElement("canvas");
    canvas.className = "dot-grid"; canvas.setAttribute("aria-hidden", "true");
    band.insertBefore(canvas, band.firstChild);
    var ctx = canvas.getContext("2d"), dots = [], raf = 0;
    var SIZE = 2.2, GAP = 26, PROX = 140, SHOCK = 220, STRENGTH = 4, SPEED_TRIGGER = 120;
    var p = { x: -1e4, y: -1e4, lx: 0, ly: 0, lt: 0, speed: 0, vx: 0, vy: 0 };
    var base = [0, 0, 0], accent = [0, 0, 0];
    function rgb(str) { var c = document.createElement("canvas").getContext("2d"); c.fillStyle = str; var h = c.fillStyle; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
    function theme() { base = rgb(cssVar("--text-3") || "#5E6A83"); accent = rgb(cssVar("--accent") || "#88C0D0"); }
    theme();
    new MutationObserver(theme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    function build() {
      var r = band.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var cell = SIZE + GAP, cols = Math.floor((r.width + GAP) / cell), rows = Math.floor((r.height + GAP) / cell);
      var sx = (r.width - (cell * cols - GAP)) / 2 + SIZE / 2, sy = (r.height - (cell * rows - GAP)) / 2 + SIZE / 2;
      dots = [];
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) dots.push({ cx: sx + x * cell, cy: sy + y * cell, ox: 0, oy: 0, vx: 0, vy: 0 });
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var moving = false;
      dots.forEach(function (d) {
        // spring back
        d.vx += -d.ox * 0.04; d.vy += -d.oy * 0.04;
        d.vx *= 0.88; d.vy *= 0.88;
        d.ox += d.vx; d.oy += d.vy;
        if (Math.abs(d.vx) + Math.abs(d.vy) > 0.02) moving = true;
        var dx = d.cx - p.x, dy = d.cy - p.y, dist = Math.hypot(dx, dy);
        var t = dist < PROX ? 1 - dist / PROX : 0;
        var r = Math.round(base[0] + (accent[0] - base[0]) * t), g = Math.round(base[1] + (accent[1] - base[1]) * t), b = Math.round(base[2] + (accent[2] - base[2]) * t);
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (0.28 + t * 0.6).toFixed(2) + ")";
        ctx.beginPath(); ctx.arc(d.cx + d.ox, d.cy + d.oy, SIZE / 2 + t * 0.8, 0, Math.PI * 2); ctx.fill();
      });
      raf = (moving || p.x > -1e3) ? requestAnimationFrame(draw) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }
    band.addEventListener("mousemove", function (e) {
      var now = performance.now(), dt = p.lt ? now - p.lt : 16;
      var r = canvas.getBoundingClientRect();
      var nx = e.clientX - r.left, ny = e.clientY - r.top;
      p.vx = (nx - p.lx) / dt * 1000; p.vy = (ny - p.ly) / dt * 1000;
      p.speed = Math.hypot(p.vx, p.vy);
      p.lt = now; p.lx = nx; p.ly = ny; p.x = nx; p.y = ny;
      if (p.speed > SPEED_TRIGGER) {
        dots.forEach(function (d) {
          var dist = Math.hypot(d.cx - p.x, d.cy - p.y);
          if (dist < PROX) {
            var push = (1 - dist / PROX) * STRENGTH * 0.004;
            d.vx += p.vx * push; d.vy += p.vy * push;
          }
        });
      }
      kick();
    });
    band.addEventListener("mouseleave", function () { p.x = -1e4; p.y = -1e4; kick(); });
    band.addEventListener("click", function (e) {
      var r = canvas.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
      dots.forEach(function (d) {
        var dist = Math.hypot(d.cx - cx, d.cy - cy);
        if (dist < SHOCK) { var f = (1 - dist / SHOCK) * 9; d.vx += (d.cx - cx) / (dist || 1) * f; d.vy += (d.cy - cy) / (dist || 1) * f; }
      });
      kick();
    });
    build();
    window.addEventListener("resize", function () { build(); draw(); }, { passive: true });
    if (canIO) new IntersectionObserver(function (en) { if (en[0].isIntersecting) kick(); }).observe(band);
    draw();
  }

  /* ── Electric Border — the current job's live edge ────────────────
     The card's outline traced as a rounded rectangle whose points are
     pushed by layered noise that drifts with time, stroked in the
     accent on a canvas that reaches past the card; two blurred
     copies behind it are the glow. */
  function electricBorder() {
    var card = document.querySelector(".tl-card.electric");
    if (!card || reduce) return;
    var canvas = card.querySelector(".eb-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d"), OFF = 40, raf = 0, t0 = performance.now();
    function rnd(x) { return (Math.sin(x * 12.9898) * 43758.5453) % 1 * 0.5 + 0.5; }
    function noise(x, y) {
      var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
      var a = rnd(i + j * 57), b = rnd(i + 1 + j * 57), c = rnd(i + (j + 1) * 57), d = rnd(i + 1 + (j + 1) * 57);
      var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
    }
    function octaved(x, time, seed) {
      var y = 0, amp = 1, freq = 6, norm = 0;
      for (var o = 0; o < 5; o++) { y += amp * (noise(freq * x + seed * 100, time * freq * 0.3) - 0.5); norm += amp; amp *= 0.6; freq *= 1.7; }
      return y / norm;
    }
    function point(w, h, r, t) {
      // t in [0,1) along the rounded rect's perimeter
      var sw = w - 2 * r, sh = h - 2 * r, arc = Math.PI * r / 2, per = 2 * sw + 2 * sh + 4 * arc, d = t * per;
      var segs = [[sw, 0], [arc, 1], [sh, 2], [arc, 3], [sw, 4], [arc, 5], [sh, 6], [arc, 7]], acc = 0;
      for (var i = 0; i < segs.length; i++) {
        var len = segs[i][0], k = segs[i][1];
        if (d <= acc + len || i === segs.length - 1) {
          var p = (d - acc) / len;
          switch (k) {
            case 0: return [r + p * sw, 0];
            case 1: return [w - r + Math.cos(-Math.PI / 2 + p * Math.PI / 2) * r, r + Math.sin(-Math.PI / 2 + p * Math.PI / 2) * r];
            case 2: return [w, r + p * sh];
            case 3: return [w - r + Math.cos(p * Math.PI / 2) * r, h - r + Math.sin(p * Math.PI / 2) * r];
            case 4: return [w - r - p * sw, h];
            case 5: return [r + Math.cos(Math.PI / 2 + p * Math.PI / 2) * r, h - r + Math.sin(Math.PI / 2 + p * Math.PI / 2) * r];
            case 6: return [0, h - r - p * sh];
            case 7: return [r + Math.cos(Math.PI + p * Math.PI / 2) * r, r + Math.sin(Math.PI + p * Math.PI / 2) * r];
          }
        }
        acc += len;
      }
      return [0, 0];
    }
    function size() {
      var r = card.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = (r.width + OFF * 2) * dpr; canvas.height = (r.height + OFF * 2) * dpr;
      canvas.style.width = (r.width + OFF * 2) + "px"; canvas.style.height = (r.height + OFF * 2) + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return r;
    }
    var rect = size();
    window.addEventListener("resize", function () { rect = size(); }, { passive: true });
    function frame(now) {
      var time = (now - t0) * 0.001;
      var w = rect.width, h = rect.height, rad = 12, N = 360;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = cssVar("--accent") || "#88C0D0";
      ctx.lineWidth = 1.6; ctx.lineJoin = "round";
      ctx.beginPath();
      for (var i = 0; i <= N; i++) {
        var t = (i % N) / N, p = point(w, h, rad, t);
        var n = octaved(t * 8, time * 0.9, 1) * 9, n2 = octaved(t * 8 + 3.7, time * 0.9, 2) * 9;
        var x = p[0] + OFF + n, y = p[1] + OFF + n2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    if (canIO) new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(card); else start();
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }

  /* ── Magnet Lines — needles behind the closing plane ──────────────*/
  function magnetLines() {
    var host = document.querySelector(".magnet-lines");
    if (!host) return;
    var COLS = 22, ROWS = 8;
    host.style.setProperty("--columns", COLS); host.style.setProperty("--rows", ROWS);
    var spans = [];
    for (var i = 0; i < COLS * ROWS; i++) { var s = document.createElement("span"); host.appendChild(s); spans.push(s); }
    function point(px, py) {
      spans.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var cx = r.x + r.width / 2, cy = r.y + r.height / 2;
        var b = px - cx, a = py - cy, c = Math.sqrt(a * a + b * b) || 1;
        var ang = (Math.acos(b / c) * 180 / Math.PI) * (py > cy ? 1 : -1);
        s.style.setProperty("--rotate", ang.toFixed(1) + "deg");
      });
    }
    if (fine && !reduce) {
      var tick = false, last = null;
      window.addEventListener("pointermove", function (e) {
        last = e; if (tick) return; tick = true;
        requestAnimationFrame(function () { tick = false; point(last.clientX, last.clientY); });
      }, { passive: true });
    }
    // Until a pointer arrives, every needle points at the centre.
    var r = host.getBoundingClientRect(); point(r.left + r.width / 2, r.top + r.height / 2);
  }

  /* ── Specular Button — a highlight that follows the pointer ───────*/
  function specular() {
    if (!fine) return;
    Array.prototype.forEach.call(document.querySelectorAll(".specular"), function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--sx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        b.style.setProperty("--sy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
  }

  /* ── True Focus — a frame hopping between the off-hours words ─────*/
  function trueFocus() {
    var el = document.querySelector("[data-truefocus]");
    if (!el || reduce) return;
    var label = el.querySelector(".interests-label");
    var words = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3 && n.nodeValue.trim()) {
        var w = document.createElement("span"); w.className = "focus-word"; w.textContent = n.nodeValue.trim();
        n.parentNode.replaceChild(w, n); words.push(w);
      }
    });
    if (words.length < 2) return;
    var frame = document.createElement("span"); frame.className = "focus-frame"; frame.setAttribute("aria-hidden", "true");
    frame.innerHTML = '<i class="fc fc-tl"></i><i class="fc fc-tr"></i><i class="fc fc-bl"></i><i class="fc fc-br"></i>';
    el.appendChild(frame); el.classList.add("is-focus");
    var i = 0, timer = 0, manual = false;
    function go(k) {
      i = k;
      words.forEach(function (w, j) { w.classList.toggle("is-active", j === k); });
      var r = words[k].getBoundingClientRect(), pr = el.getBoundingClientRect();
      frame.style.transform = "translate(" + (r.left - pr.left) + "px," + (r.top - pr.top) + "px)";
      frame.style.width = r.width + "px"; frame.style.height = r.height + "px";
    }
    function auto() { timer = setInterval(function () { if (!manual) go((i + 1) % words.length); }, 2200); }
    words.forEach(function (w, k) {
      w.addEventListener("mouseenter", function () { manual = true; go(k); });
      w.addEventListener("mouseleave", function () { manual = false; });
    });
    onEnter(el, function () { go(0); auto(); }, 0.5);
    window.addEventListener("resize", function () { go(i); }, { passive: true });
    void label;
  }

  /* ── Scroll Velocity — the toolkit loops follow the scroll ─────────
     The loops are moved by script instead of a CSS animation: a base
     drift, plus the scroll's speed on top, and a slight skew while
     the page is moving. Rows alternate direction as before. */
  function scrollVelocity() {
    var ribbons = Array.prototype.slice.call(document.querySelectorAll(".ribbon"));
    if (!ribbons.length || reduce) return;
    var rows = ribbons.map(function (r) {
      var track = r.querySelector(".ribbon-track"), run = r.querySelector(".ribbon-run");
      return { el: r, track: track, run: run, x: 0, dir: r.classList.contains("ribbon-rev") ? 1 : -1, half: 0 };
    });
    rows.forEach(function (r) { r.el.classList.add("is-jsloop"); });
    function measure() { rows.forEach(function (r) { r.half = r.run ? r.run.getBoundingClientRect().width : 0; }); }
    measure();
    window.addEventListener("resize", measure, { passive: true });
    var lastY = window.scrollY, vel = 0, last = performance.now();
    window.addEventListener("scroll", function () {
      var y = window.scrollY, now = performance.now(), dt = Math.max(1, now - last);
      vel = vel * 0.5 + ((y - lastY) / dt * 1000) * 0.5;   // px/s, smoothed
      lastY = y; last = now;
    }, { passive: true });
    var BASE = 28; // px/s
    var prev = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      vel *= 0.92;
      var boost = clamp(Math.abs(vel) / 900, 0, 4);
      var skew = clamp(vel / 3000, -1, 1) * 6;
      rows.forEach(function (r) {
        if (!r.half || r.el.classList.contains("is-offscreen")) return;
        r.x += r.dir * BASE * (1 + boost) * dt;
        // keep within one run's width so the loop is seamless
        if (r.x <= -r.half) r.x += r.half;
        if (r.x > 0) r.x -= r.half;
        r.track.style.transform = "translate3d(" + r.x.toFixed(2) + "px,0,0) skewX(" + (-skew * r.dir).toFixed(2) + "deg)";
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ── Gradual Blur — the page dissolves at the bottom edge ─────────*/
  function gradualBlur() {
    if (!fine || reduce) return;
    var el = document.createElement("div");
    el.className = "gradual-blur"; el.setAttribute("aria-hidden", "true");
    var n = 5;
    for (var i = 0; i < n; i++) {
      var layer = document.createElement("i");
      var blur = Math.pow(2, i) * 0.5;      // 0.5, 1, 2, 4, 8
      var a = (i / n) * 100, b = ((i + 1) / n) * 100, c = ((i + 2) / n) * 100;
      layer.style.backdropFilter = "blur(" + blur + "px)";
      layer.style.webkitBackdropFilter = "blur(" + blur + "px)";
      layer.style.maskImage = "linear-gradient(to bottom, transparent " + a + "%, black " + b + "%, black " + Math.min(100, c) + "%, transparent " + Math.min(100, c + 20) + "%)";
      layer.style.webkitMaskImage = layer.style.maskImage;
      el.appendChild(layer);
    }
    document.body.appendChild(el);
  }

  lineSidebar();
  targetCursor();
  counters();
  decrypt();
  typewrite();
  dock();
  accordion();
  pixelPlates();
  dotGrid();
  electricBorder();
  magnetLines();
  specular();
  trueFocus();
  scrollVelocity();
  gradualBlur();
})();
