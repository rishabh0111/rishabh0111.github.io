/* ═══════════════════════════════════════════════════════════════════
   home-fx.js: the home page's motion, after React Bits.

   Every piece here is a plain-JS port of a React Bits component,
   fetched from its shadcn registry (reactbits.dev/r/<Name>-JS-CSS)
   and rewritten without React, GSAP, motion or ogl:

     topoScene()     Topography      the contour scene, alive (WebGL2)
     warpName()      Warp Text       the hero name as glass, bending under the pointer
     splitName()     Split Text      the hero name, letter by letter (when Warp can't run)
     blurText()      Blur Text       "Hi, I'm", word by word
     rotatingRole()  Rotating Text   the role eyebrow, one word at a time
     profileCard()   Profile Card    the portrait card: tilt, glare, sheen
     magnet()        Magnet          link pills pull toward the pointer
     clickSpark()    Click Spark     a burst of lines on every click
     gridSpotlight() Magic Bento     a soft light over the project grid

   All progressive: with JS off, prefers-reduced-motion, a coarse
   pointer, or no WebGL, the plain page renders as it is.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;

  function cssVar(name, el) {
    return getComputedStyle(el || root).getPropertyValue(name).trim();
  }
  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return [1, 1, 1];
    return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
  }
  function isLight() {
    var t = root.getAttribute("data-theme");
    if (t === "light") return true;
    if (t === "dark") return false;
    return !window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  // The theme toggle sets data-theme; the OS can flip the system one.
  function onThemeChange(fn) {
    new MutationObserver(fn).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fn);
  }

  // A full-screen triangle and a compiled program: what every shader
  // here starts from.
  function glProgram(gl, vert, frag) {
    function shader(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn("shader:", gl.getShaderInfoLog(sh)); return null; }
      return sh;
    }
    var vs = shader(gl.VERTEX_SHADER, vert), fs = shader(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return prog;
  }

  /* ── 1 · Topography: the living contour map ─────────────────────
     React Bits' shader, verbatim, on a raw WebGL2 full-screen
     triangle. Mounted inside the fixed .px scene in place of the
     static contour layer; colours come from --topo-low/mid/high so
     both themes draw their own survey. The pointer raises the ground
     under it. Pauses when the tab is hidden. */
  function topoScene() {
    var px = document.querySelector(".px");
    if (!px || reduce || !fine) return;
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    var VERT = "#version 300 es\nin vec2 position;\nvoid main(){ gl_Position = vec4(position, 0.0, 1.0); }";
    var FRAG = [
      "#version 300 es", "precision highp float;",
      "uniform vec2 iResolution; uniform float iTime;",
      "uniform float uMorphAmount, uBands, uThickness, uScale, uPixelSize, uGlow, uColorMode, uContrast, uBrightness, uFillBands, uOpacity, uLightMode;",
      "uniform vec3 uLow, uMid, uHigh;",
      "uniform vec2 uMouse; uniform float uMouseEnabled, uMouseRadius, uMouseStrength, uMouseActive, uGrain, uGrainIntensity;",
      "uniform vec4 uCtrlA, uCtrlB, uCtrlC, uCtrlD;",
      "out vec4 fragColor;",
      "float bez(float t, vec4 c){ float w = 6.2831853 * t; return 0.5 * (c.x * sin(w) + c.y * cos(w) + c.z * sin(2.0 * w) + c.w * cos(2.0 * w)); }",
      "float field(vec2 uv){ vec2 a = vec2(bez(uv.x, uCtrlA), bez(uv.x, uCtrlB)); vec2 b = vec2(bez(uv.y, uCtrlC), bez(uv.y, uCtrlD)); return distance(a, b); }",
      "vec3 elevationColor(float e){ vec3 c = mix(uLow, uMid, smoothstep(0.0, 0.5, e)); c = mix(c, uHigh, smoothstep(0.5, 1.0, e)); return c; }",
      "void main(){",
      "  vec2 res = iResolution.xy; vec2 uv = gl_FragCoord.xy / res;",
      "  vec2 suv = (uv - 0.5) / max(uScale, 0.001) + 0.5;",
      "  vec2 sampleUv = suv;",
      "  if (uPixelSize > 1.0) { vec2 pxs = res / uPixelSize; sampleUv = (floor(suv * pxs) + 0.5) / pxs; }",
      "  float fv = field(sampleUv);",
      "  if (uMouseEnabled > 0.5) { vec2 d = uv - uMouse; d.x *= res.x / max(res.y, 1.0); float r = max(uMouseRadius, 0.001); fv += exp(-dot(d, d) / (r * r)) * uMouseStrength * uMouseActive; }",
      "  float f = fv * uBands; float fr = fract(f); float lineDist = min(fr, 1.0 - fr);",
      "  float aa = fwidth(f) + 0.0001;",
      "  float mask = 1.0 - smoothstep(uThickness - aa, uThickness + aa, lineDist);",
      "  float glowR = uThickness + uGlow * 0.5 + aa;",
      "  float glow = (1.0 - smoothstep(uThickness, glowR, lineDist)) * step(0.0001, uGlow);",
      "  float elev = clamp(fv / (uMorphAmount * 2.5 + 0.001), 0.0, 1.0);",
      "  vec3 lineCol;",
      "  if (uColorMode < 0.5) lineCol = elevationColor(elev); else if (uColorMode < 1.5) lineCol = uMid; else { float parity = mod(floor(f), 2.0); lineCol = mix(uMid, uHigh, parity); }",
      "  float coverage = clamp(mask + glow * 0.55, 0.0, 1.0); coverage = pow(coverage, max(uContrast, 0.001));",
      "  vec3 outColor = lineCol; float outAlpha = coverage;",
      "  if (uFillBands > 0.5) { vec3 fillCol = elevationColor(elev); float fillA = 0.1 * elev; outColor = mix(fillCol, lineCol, coverage); outAlpha = clamp(coverage + fillA, 0.0, 1.0); }",
      "  if (uGrain > 0.5) { float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453); outAlpha += (g - 0.5) * uGrainIntensity; }",
      "  outColor = clamp(outColor * uBrightness, 0.0, 1.0);",
      "  float a = clamp(outAlpha, 0.0, 1.0) * uOpacity;",
      "  if (uLightMode > 0.5) { float peak = max(outColor.r, max(outColor.g, outColor.b)); vec3 chroma = pow(clamp(outColor / max(peak, 0.0001), 0.0, 1.0), vec3(1.18)); fragColor = vec4(mix(vec3(1.0), chroma, a * 0.94), 1.0); }",
      "  else fragColor = vec4(outColor * a, a);",
      "}"
    ].join("\n");

    function shader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn("topo:", gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    var vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    // One triangle that covers the clip space; three vertices, no index.
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var U = {};
    ["iResolution", "iTime", "uMorphAmount", "uBands", "uThickness", "uScale", "uPixelSize", "uGlow",
     "uColorMode", "uContrast", "uBrightness", "uFillBands", "uOpacity", "uLightMode", "uLow", "uMid",
     "uHigh", "uMouse", "uMouseEnabled", "uMouseRadius", "uMouseStrength", "uMouseActive", "uGrain",
     "uGrainIntensity", "uCtrlA", "uCtrlB", "uCtrlC", "uCtrlD"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    // The look: fewer, thinner lines than the demo, a little glow,
    // grain on, and the ground rising gently under the pointer.
    var P = { speed: 0.22, morphAmount: 3, morphSpeed: 0.05, bands: 2, thickness: 0.006, scale: 1.7,
              pixelSize: 1, glow: 0.3, contrast: 2.6, brightness: 1, mouseRadius: 0.32, mouseStrength: 0.35,
              grain: 1, grainIntensity: 0.035 };
    function applyTheme() {
      var light = isLight();
      gl.uniform3fv(U.uLow,  hexToRgb(cssVar("--topo-low")  || "#3B4252"));
      gl.uniform3fv(U.uMid,  hexToRgb(cssVar("--topo-mid")  || "#5E81AC"));
      gl.uniform3fv(U.uHigh, hexToRgb(cssVar("--topo-high") || "#88C0D0"));
      // The shader's own light mode paints an opaque white ground; the
      // scene has its own paper, so both themes use the alpha path and
      // differ only in the line colours.
      gl.uniform1f(U.uLightMode, 0);
      gl.uniform1f(U.uOpacity, parseFloat(cssVar("--topo-opacity")) || (light ? 0.55 : 0.6));
    }
    gl.uniform1f(U.uMorphAmount, P.morphAmount); gl.uniform1f(U.uBands, P.bands);
    gl.uniform1f(U.uThickness, P.thickness); gl.uniform1f(U.uScale, P.scale);
    gl.uniform1f(U.uPixelSize, P.pixelSize); gl.uniform1f(U.uGlow, P.glow);
    gl.uniform1f(U.uColorMode, 0); gl.uniform1f(U.uContrast, P.contrast);
    gl.uniform1f(U.uBrightness, P.brightness); gl.uniform1f(U.uFillBands, 0);
    gl.uniform1f(U.uMouseEnabled, 1); gl.uniform1f(U.uMouseRadius, P.mouseRadius);
    gl.uniform1f(U.uMouseStrength, P.mouseStrength); gl.uniform1f(U.uGrain, P.grain);
    gl.uniform1f(U.uGrainIntensity, P.grainIntensity);
    applyTheme();
    onThemeChange(applyTheme);

    canvas.className = "px-topo";
    px.appendChild(canvas);
    px.classList.add("has-topo");

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function size() {
      var w = Math.max(1, Math.floor(px.clientWidth * dpr)), h = Math.max(1, Math.floor(px.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.iResolution, w, h);
    }
    size();
    window.addEventListener("resize", size, { passive: true });

    var CTRL = [[1, -2, 3, -4], [9, -8, 7, -6], [5, 2, 5, -5], [-1, -3, 8, 9]];
    var ctrlU = [U.uCtrlA, U.uCtrlB, U.uCtrlC, U.uCtrlD];
    var arr = [new Float32Array(4), new Float32Array(4), new Float32Array(4), new Float32Array(4)];
    var mouse = [0.5, 0.5], target = [0.5, 0.5], active = 0, activeTarget = 0;
    window.addEventListener("pointermove", function (e) {
      target[0] = e.clientX / window.innerWidth;
      target[1] = 1 - e.clientY / window.innerHeight;
      activeTarget = 1;
    }, { passive: true });
    document.addEventListener("pointerleave", function () { activeTarget = 0; });

    var raf = 0, t0 = performance.now();
    function loop(t) {
      var time = (t - t0) * 0.001;
      gl.uniform1f(U.iTime, time);
      for (var g = 0; g < 4; g++) {
        for (var j = 0; j < 4; j++) {
          var i = CTRL[g][j];
          arr[g][j] = P.morphAmount * Math.sin(time * P.speed * Math.sin(i * P.morphSpeed) + i);
        }
        gl.uniform4fv(ctrlU[g], arr[g]);
      }
      mouse[0] += 0.05 * (target[0] - mouse[0]);
      mouse[1] += 0.05 * (target[1] - mouse[1]);
      active += 0.05 * (activeTarget - active);
      gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform1f(U.uMouseActive, active);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    start();
  }

  /* ── 2a · Warp Text: the name as a pane of glass ─────────────────
     After React Bits WarpText: the name is drawn into a 2D canvas in
     the h1's own face (the first name in ink, the surname italic in
     the accent), uploaded as a texture, and bent by the component's
     shader: a slow ambient undulation, a lens that follows the
     pointer with a soft ripple, and a hair of RGB split at the
     glass's edge. The h1 stays in the page (transparent) for layout,
     readers and search. Returns false where it cannot run, and Split
     Text takes over. */
  function warpName() {
    var wrap = document.querySelector(".hero-name-wrap");
    var h1 = document.getElementById("hero-name");
    if (!wrap || !h1 || reduce || !fine) return false;
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) return false;

    var VERT = "#version 300 es\nin vec2 position; out vec2 vUv;\nvoid main(){ vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }";
    var FRAG = [
      "#version 300 es", "precision highp float;",
      "uniform sampler2D uTextTexture; uniform vec2 uResolution; uniform vec2 uPointer;",
      "uniform float uPointerActive, uTime, uWarpStrength, uWarpScale, uSpeed, uPointerInfluence, uPointerStrength, uRefraction, uRipple, uMotion;",
      "in vec2 vUv; out vec4 fragColor;",
      "float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
      "float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);",
      "  float a = hash(i); float b = hash(i + vec2(1.0, 0.0)); float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));",
      "  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y); }",
      "float fbm(vec2 p){ float v = 0.0; float amp = 0.5; for (int i = 0; i < 4; i++) { v += amp * noise(p); p *= 2.02; amp *= 0.5; } return v; }",
      "vec4 sampleText(vec2 uv){ if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0); return texture(uTextTexture, uv); }",
      "void main(){",
      "  vec2 uv = vUv; float aspect = uResolution.x / max(uResolution.y, 1.0); float time = uTime * uSpeed; float scale = max(uWarpScale, 0.001);",
      "  vec2 drift = vec2(time * 0.055, -time * 0.045);",
      "  float n1 = fbm(uv * scale * 3.1 + drift); float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);",
      "  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;",
      "  vec2 pd = uv - uPointer; vec2 ad = vec2(pd.x * aspect, pd.y); float dist = length(ad);",
      "  float radius = max(uPointerInfluence, 0.001); float t = clamp(dist / radius, 0.0, 1.0);",
      "  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;",
      "  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;",
      "  vec2 dir = dist > 0.0001 ? vec2(ad.x / aspect, ad.y) / dist : vec2(0.0);",
      "  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5; float rippleRing = (rippleWave - 0.5) * uRipple;",
      "  vec2 pw = -dir * bulge * uPointerStrength * 0.045; pw += dir * rippleRing * bulge * uPointerStrength * 0.016;",
      "  vec2 displaced = uv + ambient + pw;",
      "  vec2 sd = ambient + pw; float sl = length(sd); sd = sl > 0.00001 ? sd / sl : vec2(0.7071, 0.7071);",
      "  vec2 split = sd * uRefraction * 0.16 * (0.35 + lens * 1.65);",
      "  vec4 base = sampleText(displaced);",
      "  vec4 sp = sampleText(displaced + split); vec4 sm = sampleText(displaced - split);",
      "  float a = max(max(sp.a, base.a), sm.a);",
      "  vec3 color = vec3(sp.r, base.g, sm.b) + lens * base.a * 0.055;",
      "  fragColor = vec4(color, a);",
      "}"
    ].join("\n");
    var prog = glProgram(gl, VERT, FRAG);
    if (!prog) return false;
    var U = {};
    ["uTextTexture", "uResolution", "uPointer", "uPointerActive", "uTime", "uWarpStrength", "uWarpScale", "uSpeed",
     "uPointerInfluence", "uPointerStrength", "uRefraction", "uRipple", "uMotion"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.uniform1i(U.uTextTexture, 0);

    // Gentler than the demo: a serif at this size wants a slow
    // undulation and a soft lens, not a funhouse.
    gl.uniform1f(U.uWarpStrength, 0.06); gl.uniform1f(U.uWarpScale, 1.7);
    gl.uniform1f(U.uSpeed, 0.45); gl.uniform1f(U.uPointerInfluence, 0.42);
    gl.uniform1f(U.uPointerStrength, 0.34); gl.uniform1f(U.uRefraction, 0.014);
    gl.uniform1f(U.uRipple, 1); gl.uniform1f(U.uMotion, 1);

    canvas.className = "hero-name-warp";
    canvas.setAttribute("aria-hidden", "true");
    wrap.appendChild(canvas);

    // The canvas is the h1's box grown by a margin on every side, so
    // glyphs bent past their own edge still have somewhere to go.
    var PAD = 0.18;
    var box = { w: 0, h: 0, padX: 0, padY: 0 };

    function rasterize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = h1.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      // The h1 is transparent while the glass is up; lift that for
      // the measurement so its real ink and accent are read.
      var wasWarp = wrap.classList.contains("is-warp");
      wrap.classList.remove("is-warp");
      box.padX = r.width * PAD; box.padY = r.height * PAD;
      box.w = r.width + box.padX * 2; box.h = r.height + box.padY * 2;
      canvas.style.width = box.w + "px"; canvas.style.height = box.h + "px";
      canvas.style.left = -box.padX + "px"; canvas.style.top = -box.padY + "px";
      canvas.width = Math.max(1, Math.floor(box.w * dpr)); canvas.height = Math.max(1, Math.floor(box.h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uResolution, canvas.width, canvas.height);

      var src = document.createElement("canvas");
      src.width = canvas.width; src.height = canvas.height;
      var ctx = src.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = "alphabetic";
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";

      // Each run of the name in its own face and colour, laid where
      // the h1 laid it: the run's own box gives x and the baseline.
      var runs = [];
      Array.prototype.forEach.call(h1.childNodes, function (node) {
        var text, el;
        if (node.nodeType === 3) { text = node.nodeValue; el = h1; }
        else if (node.nodeType === 1) { text = node.textContent; el = node; }
        else return;
        if (!text.trim()) return;
        var range = document.createRange(); range.selectNodeContents(node);
        var rects = range.getClientRects();
        if (!rects.length) return;
        var rr = rects[0];
        var cs = getComputedStyle(el);
        runs.push({ text: text.replace(/\s+$/, ""), x: rr.left - r.left, top: rr.top - r.top, h: rr.height, cs: cs });
      });
      runs.forEach(function (run) {
        var cs = run.cs;
        ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
        ctx.fillStyle = cs.color;
        var ls = parseFloat(cs.letterSpacing) || 0;
        // The baseline sits at ~80% of the line box for this face.
        var fontPx = parseFloat(cs.fontSize);
        var baseline = run.top + run.h / 2 + fontPx * 0.33;
        var x = run.x + box.padX, y = baseline + box.padY;
        Array.from(run.text).forEach(function (ch) {
          ctx.fillText(ch, x, y);
          x += ctx.measureText(ch).width + ls;
        });
      });
      if (wasWarp) wrap.classList.add("is-warp");
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      draw();
    }

    var pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
    var raf = 0, t0 = performance.now(), visible = true;
    function draw() {
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop(now) {
      var t = (now - t0) * 0.001;
      var idleX = 0.5 + Math.sin(t * 0.33) * 0.12, idleY = 0.5 + Math.cos(t * 0.27) * 0.1;
      var on = pointer.activeTarget > 0;
      var tx = on ? pointer.tx : idleX, ty = on ? pointer.ty : idleY, damp = on ? 0.12 : 0.035;
      pointer.x += (tx - pointer.x) * damp; pointer.y += (ty - pointer.y) * damp;
      pointer.active += ((on ? 1 : 0.18) - pointer.active) * 0.06;
      gl.uniform2f(U.uPointer, pointer.x, pointer.y);
      gl.uniform1f(U.uPointerActive, pointer.active);
      gl.uniform1f(U.uTime, t);
      draw();
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = canvas.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) {
        pointer.tx = (e.clientX - r.left) / r.width;
        pointer.ty = 1 - (e.clientY - r.top) / r.height;
        pointer.activeTarget = 1;
      } else pointer.activeTarget = 0;
    }, { passive: true });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(wrap);
    var rt = 0;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(rasterize, 120); }, { passive: true });
    onThemeChange(function () { setTimeout(rasterize, 60); });

    wrap.classList.add("is-warp");
    var go = function () { rasterize(); start(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
    return true;
  }

  /* ── 2b · Split Text: the hero name, one letter at a time ────────
     Each character becomes a span with its own delay; the CSS does
     the rise-and-focus. The <em> (surname) keeps its accent. Runs
     only where Warp Text cannot. */
  function splitName() {
    var h1 = document.getElementById("hero-name");
    if (!h1 || reduce) return;
    // Letters in their own spans would be read one at a time; the
    // label keeps the name whole for a screen reader.
    h1.setAttribute("aria-label", h1.textContent.replace(/\s+/g, " ").trim());
    var k = 0;
    function split(node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split("").forEach(function (ch) {
        if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
        var s = document.createElement("span");
        s.className = "st-ch"; s.textContent = ch; s.style.setProperty("--i", k++);
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    }
    var walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT), texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(split);
    h1.classList.add("is-split");
  }

  /* ── 3 · Blur Text: "Hi, I'm", word by word ───────────────────── */
  function blurText() {
    var el = document.querySelector(".hero-hi");
    if (!el || reduce) return;
    var k = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement("span");
        s.className = "bt-w"; s.textContent = part; s.style.setProperty("--i", k++);
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.classList.add("is-blur");
  }

  /* ── 4 · Rotating Text: the role, one word at a time ─────────────
     "AI · Backend · Security" becomes three words that take turns,
     each sliding up into place. The full label stays for readers
     of the DOM. */
  function rotatingRole() {
    var el = document.querySelector(".hero .page-label");
    if (!el || reduce) return;
    var words = el.textContent.split("·").map(function (w) { return w.trim(); }).filter(Boolean);
    if (words.length < 2) return;
    var sr = document.createElement("span");
    sr.className = "sr-only"; sr.textContent = words.join(" · ");
    var stage = document.createElement("span");
    stage.className = "rt"; stage.setAttribute("aria-hidden", "true");
    var cur = document.createElement("span"); cur.className = "rt-w is-in"; cur.textContent = words[0];
    stage.appendChild(cur);
    el.textContent = ""; el.appendChild(sr); el.appendChild(stage);
    el.classList.add("has-rt");
    var i = 0;
    setInterval(function () {
      i = (i + 1) % words.length;
      var next = document.createElement("span");
      next.className = "rt-w"; next.textContent = words[i];
      stage.appendChild(next);
      var old = cur; cur = next;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        old.classList.remove("is-in"); old.classList.add("is-out");
        next.classList.add("is-in");
        setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 500);
      }); });
    }, 2600);
  }

  /* ── 5 · Profile Card: the portrait card follows the pointer ─────
     After React Bits ProfileCard's tilt engine: the pointer's place
     on the card becomes a set of custom properties (--pointer-x/y,
     --rotate-x/y, --background-x/y, --pointer-from-*) that the CSS
     turns into tilt, glare, sheen and the avatar's parallax. The
     values ease toward the pointer (tau 0.14s) and back to centre on
     leave. Fine pointers only; the still card is what touch gets. */
  function profileCard() {
    var wrap = document.getElementById("portrait");
    var shell = document.getElementById("pcard");
    if (!wrap || !shell || reduce || !fine) return;
    wrap.classList.add("is-live");
    var cur = [0, 0], tgt = [0, 0], raf = 0, last = 0, running = false;
    var TAU = 0.14;
    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
    function adjust(v, fMin, fMax, tMin, tMax) { return tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin); }
    function setVars(x, y) {
      var w = shell.clientWidth || 1, h = shell.clientHeight || 1;
      var px = clamp((100 / w) * x, 0, 100), py = clamp((100 / h) * y, 0, 100);
      var cx = px - 50, cy = py - 50;
      var st = wrap.style;
      st.setProperty("--pointer-x", px.toFixed(2) + "%");
      st.setProperty("--pointer-y", py.toFixed(2) + "%");
      st.setProperty("--background-x", adjust(px, 0, 100, 35, 65).toFixed(2) + "%");
      st.setProperty("--background-y", adjust(py, 0, 100, 35, 65).toFixed(2) + "%");
      st.setProperty("--pointer-from-center", clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1).toFixed(3));
      st.setProperty("--pointer-from-top", (py / 100).toFixed(3));
      st.setProperty("--pointer-from-left", (px / 100).toFixed(3));
      st.setProperty("--rotate-x", (-(cx / 5)).toFixed(2) + "deg");
      st.setProperty("--rotate-y", (cy / 4).toFixed(2) + "deg");
    }
    function step(ts) {
      if (!running) return;
      if (!last) last = ts;
      var dt = (ts - last) / 1000; last = ts;
      var k = 1 - Math.exp(-dt / TAU);
      cur[0] += (tgt[0] - cur[0]) * k;
      cur[1] += (tgt[1] - cur[1]) * k;
      setVars(cur[0], cur[1]);
      if (Math.abs(tgt[0] - cur[0]) > 0.05 || Math.abs(tgt[1] - cur[1]) > 0.05) raf = requestAnimationFrame(step);
      else { running = false; last = 0; raf = 0; }
    }
    function target(x, y) { tgt = [x, y]; if (!running) { running = true; last = 0; raf = requestAnimationFrame(step); } }
    function toCenter() { target(shell.clientWidth / 2, shell.clientHeight / 2); }
    shell.addEventListener("pointerenter", function () { wrap.classList.add("active"); });
    shell.addEventListener("pointermove", function (e) {
      var r = shell.getBoundingClientRect();
      target(e.clientX - r.left, e.clientY - r.top);
    });
    shell.addEventListener("pointerleave", function () { wrap.classList.remove("active"); toCenter(); });
    cur = [shell.clientWidth / 2, shell.clientHeight / 2];
    setVars(cur[0], cur[1]);
  }

  /* ── 6 · Magnet: pills pull toward a pointer that comes near ────── */
  function magnet() {
    if (reduce || !fine) return;
    var els = Array.prototype.slice.call(document.querySelectorAll(".hero-links a, .proj-grid-btn"));
    if (!els.length) return;
    var PAD = 40, STRENGTH = 3;
    els.forEach(function (el) { el.classList.add("magnet"); });
    var tick = false, last = null;
    window.addEventListener("mousemove", function (e) {
      last = e;
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false;
        els.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var dx = last.clientX - cx, dy = last.clientY - cy;
          if (Math.abs(dx) < r.width / 2 + PAD && Math.abs(dy) < r.height / 2 + PAD) {
            el.classList.add("is-near");
            el.style.setProperty("--mx", (dx / STRENGTH).toFixed(1) + "px");
            el.style.setProperty("--my", (dy / STRENGTH).toFixed(1) + "px");
          } else if (el.classList.contains("is-near")) {
            el.classList.remove("is-near");
            el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px");
          }
        });
      });
    }, { passive: true });
  }

  /* ── 7 · Click Spark: a burst of short lines at every click ─────── */
  function clickSpark() {
    if (reduce || !fine) return;
    var canvas = document.createElement("canvas");
    canvas.className = "click-spark"; canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var sparks = [], raf = 0;
    var SIZE = 10, RADIUS = 18, COUNT = 8, DUR = 420;
    function size() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    size(); window.addEventListener("resize", size, { passive: true });
    function color() { return cssVar("--accent") || "#88C0D0"; }
    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color(); ctx.lineWidth = 2;
      sparks = sparks.filter(function (s) {
        var p = (t - s.t) / DUR;
        if (p >= 1) return false;
        var e = p * (2 - p), d = e * RADIUS, len = SIZE * (1 - e);
        ctx.beginPath();
        ctx.moveTo(s.x + d * Math.cos(s.a), s.y + d * Math.sin(s.a));
        ctx.lineTo(s.x + (d + len) * Math.cos(s.a), s.y + (d + len) * Math.sin(s.a));
        ctx.stroke();
        return true;
      });
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    }
    window.addEventListener("click", function (e) {
      var now = performance.now();
      for (var i = 0; i < COUNT; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (2 * Math.PI * i) / COUNT, t: now });
      if (!raf) raf = requestAnimationFrame(draw);
    });
  }

  /* ── 8 · Magic Bento: one soft light over the whole project grid ──
     The cards already glow at their borders; this is the second half
     of the component: a large blurred disc that follows the pointer
     across the band, brightening as it nears a card. */
  function gridSpotlight() {
    var band = document.getElementById("projects");
    var grid = band && band.querySelector(".proj-grid");
    if (!grid || reduce || !fine) return;
    var light = document.createElement("div");
    light.className = "grid-spotlight"; light.setAttribute("aria-hidden", "true");
    band.appendChild(light);
    band.addEventListener("mousemove", function (e) {
      var r = band.getBoundingClientRect();
      light.style.setProperty("--x", (e.clientX - r.left) + "px");
      light.style.setProperty("--y", (e.clientY - r.top) + "px");
      light.classList.add("is-on");
    });
    band.addEventListener("mouseleave", function () { light.classList.remove("is-on"); });
  }

  topoScene();
  if (!warpName()) splitName();
  blurText();
  rotatingRole();
  profileCard();
  magnet();
  clickSpark();
  gridSpotlight();
})();
