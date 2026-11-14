/* ═══════════════════════════════════════════════════════════════════
   home-bits.js: the rest of the React Bits on the home page.

   Companion to home-fx.js (which carries the scene, the hero and the
   pointer effects). Every piece here is a plain-JS port of a React
   Bits component fetched from its shadcn registry and rewritten
   without React, GSAP or motion:

     lineSidebar()      Line Sidebar       the rail's beads and labels reach for the pointer
     targetCursor()     Target Cursor      theme-coloured ring cursor; brackets snap around targets
     decrypt()          Decrypted Text     mono labels scramble into place
     dock()             Dock               hero pills magnify near the pointer
     accordion()        Accordion Gallery  project shots as expanding panels
     pixelPlates()      Pixel Card         a pixel field on the cover plates
     magnetLines()      Magnet Lines       needles pointing at the pointer, behind Contact
     specular()         Specular Button    a highlight that follows the pointer on buttons
     trueFocus()        True Focus         a frame hopping between the off-hours words
     scrollVelocity()   Scroll Velocity    the toolkit loops drift, and hold when read

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

  /* ── Line Sidebar: the rail's beads reach for the pointer ─────────
     The rail keeps its beads, thread and label pills; from Line
     Sidebar it takes --effect (0..1) per item (1 for the active
     section, otherwise how near the pointer is), eased every frame,
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
     The native pointer gives way to a theme-coloured ring: a dot
     sits exactly on the pointer, the ring trails it a touch, and
     over a target four corner brackets fly to its corners and hold
     there until the pointer leaves. Hidden until the first move and
     while the pointer is off the page, so nothing sits in the middle
     of the viewport on load. */
  function targetCursor() {
    if (!fine || reduce) return;
    var wrap = document.createElement("div");
    wrap.className = "tc is-away"; wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = '<i class="tc-ring"></i><i class="tc-dot"></i><i class="tc-c tc-tl"></i><i class="tc-c tc-tr"></i><i class="tc-c tc-br"></i><i class="tc-c tc-bl"></i>';
    document.body.appendChild(wrap);
    document.body.classList.add("has-tc");
    var dot = wrap.querySelector(".tc-dot");
    var corners = Array.prototype.slice.call(wrap.querySelectorAll(".tc-c"));
    var SEL = "a, button, summary, .tile, .proj, .tool, .chips li, .drail a";
    var x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;
    var active = null, raf = 0;
    var HOME = [[-18, -18], [6, -18], [6, 6], [-18, 6]];
    function place() {
      x += (tx - x) * 0.35; y += (ty - y) * 0.35;
      wrap.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      dot.style.transform = "translate3d(" + (tx - x).toFixed(1) + "px," + (ty - y).toFixed(1) + "px,0)";
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
      wrap.classList.remove("is-away");
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

  /* ── Decrypted Text: mono labels scramble into place ─────────────
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
            if (i < revealed || ch === " " || ch === "·" || ch === "&") out += ch;
            else out += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          el.textContent = out;
          if (revealed >= text.length) { clearInterval(iv); el.textContent = text; }
        }, 28);
      }, 0.6);
    });
  }

  /* ── Dock: the hero pills magnify near the pointer ───────────────*/
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

  /* ── Accordion Gallery: project shots as expanding panels ────────
     The hovered (or tapped) shot grows, the rest narrow and grey. */
  function accordion() {
    Array.prototype.forEach.call(document.querySelectorAll(".proj-carousel.ag"), function (gal) {
      var panels = Array.prototype.slice.call(gal.querySelectorAll(".shot"));
      // One shot: nothing to switch, so show it in colour with its caption.
      if (panels.length < 2) { gal.classList.add("ag-single"); panels.forEach(function (p) { p.classList.add("is-active"); }); return; }
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

  /* ── Pixel Card: a field of pixels on the cover plates ───────────
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

  /* ── Magnet Lines: needles behind the closing plane ──────────────*/
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

  /* ── Specular Button: a highlight that follows the pointer ───────*/
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

  /* ── True Focus: a frame hopping between the off-hours words ─────*/
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

  /* ── Scroll Velocity: the toolkit loops, calm and holdable ───────
     The loops are moved by script instead of a CSS animation: a slow
     base drift, nudged a little by the scroll's speed. A row holds
     still while the pointer or keyboard focus is in it (so a tool can
     be read and picked), and every row holds while a tool is picked
     (.is-held on the section) or the grid is shown (.is-grid). A
     focused tool that has drifted out of view is brought back in. */
  function scrollVelocity() {
    var ribbons = Array.prototype.slice.call(document.querySelectorAll(".ribbon"));
    if (!ribbons.length || reduce) return;
    var sec = document.getElementById("toolkit");
    var rows = ribbons.map(function (r) {
      var track = r.querySelector(".ribbon-track"), run = r.querySelector(".ribbon-run");
      var row = { el: r, track: track, run: run, view: r.querySelector(".ribbon-view"), x: 0, dir: r.classList.contains("ribbon-rev") ? 1 : -1, half: 0, hover: false, focus: false };
      r.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") row.hover = true; });
      r.addEventListener("pointerleave", function () { row.hover = false; });
      r.addEventListener("focusin", function (e) {
        row.focus = true;
        // Keep the focused tool inside the visible part of the row.
        var v = row.view.getBoundingClientRect(), t = e.target.getBoundingClientRect();
        var pad = Math.min(160, v.width * 0.2);
        if (t.left < v.left + pad) row.x += (v.left + pad) - t.left;
        else if (t.right > v.right - pad) row.x -= t.right - (v.right - pad);
        wrap(row); paint(row);
      });
      r.addEventListener("focusout", function () { row.focus = false; });
      return row;
    });
    rows.forEach(function (r) { r.el.classList.add("is-jsloop"); });
    function measure() { rows.forEach(function (r) { r.half = r.run ? r.run.getBoundingClientRect().width : 0; }); }
    function wrap(r) {
      // keep within one run's width so the loop is seamless
      if (!r.half) return;
      while (r.x <= -r.half) r.x += r.half;
      while (r.x > 0) r.x -= r.half;
    }
    function paint(r) { r.track.style.transform = "translate3d(" + r.x.toFixed(2) + "px,0,0)"; }
    measure();
    window.addEventListener("resize", measure, { passive: true });
    var lastY = window.scrollY, vel = 0, last = performance.now();
    window.addEventListener("scroll", function () {
      var y = window.scrollY, now = performance.now(), dt = Math.max(1, now - last);
      vel = vel * 0.5 + ((y - lastY) / dt * 1000) * 0.5;   // px/s, smoothed
      lastY = y; last = now;
    }, { passive: true });
    var BASE = 16; // px/s: slow enough to read a name as it passes
    var prev = performance.now();
    var wasGrid = false;
    function frame(now) {
      var dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      vel *= 0.92;
      var boost = clamp(Math.abs(vel) / 1800, 0, 1);
      var grid = sec && sec.classList.contains("is-grid");
      if (grid !== wasGrid) {
        // The grid lays the runs out flat; leaving it, resume from 0.
        rows.forEach(function (r) { r.track.style.transform = grid ? "none" : ""; if (!grid) { r.x = 0; } });
        if (!grid) measure();
        wasGrid = grid;
      }
      var held = grid || (sec && sec.classList.contains("is-held"));
      if (!held) {
        rows.forEach(function (r) {
          if (!r.half || r.hover || r.focus || r.el.classList.contains("is-offscreen")) return;
          r.x += r.dir * BASE * (1 + boost) * dt;
          wrap(r); paint(r);
        });
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  lineSidebar();
  targetCursor();
  decrypt();
  dock();
  accordion();
  pixelPlates();
  magnetLines();
  specular();
  trueFocus();
  scrollVelocity();
})();
