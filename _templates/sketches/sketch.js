// Hand-drawn, theme-aware SVG figures for blog posts.
//
// rough.js supplies the wobble (the same engine Excalidraw uses); this file turns
// its paths into an inline <svg> whose colours are CSS classes, not hex values, so
// the figure follows the site's light/dark toggle (see `.sketch-svg` in
// assets/css/style.css). Text is set in Caveat, loaded only on pages that carry a
// sketch (see _layouts/default.html).
//
// Usage (see README.md for the full vocabulary):
//   const { Sketch } = require('../sketch');
//   const s = new Sketch({ width: 560, height: 200, title: '…', desc: '…' });
//   const a = s.array(40, 60, [2, 7, 11, 15], { tones: { 1: 'blue' } });
//   s.pointer(a.cx(1), a.bottom, 'left', { tone: 'blue' });
//   s.save(__dirname, 'name');   // → _includes/sketches/<folder>/name.svg

const fs = require('fs');
const path = require('path');
const rough = require('roughjs');

const TONES = ['ink', 'soft', 'blue', 'violet', 'green', 'cyan', 'amber', 'red'];
const FONT_W = 0.46; // Caveat average advance, as a fraction of font size

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function tone(t) {
  if (!t) return 'ink';
  if (!TONES.includes(t)) throw new Error(`unknown tone "${t}" (use ${TONES.join(', ')})`);
  return t;
}
function r1(n) { return Math.round(n * 10) / 10; }

class Sketch {
  constructor({ width, height, title, desc = '', seed = 1, roughness = 1.1 }) {
    if (!width || !height || !title) throw new Error('Sketch needs width, height and title');
    this.w = width; this.h = height; this.title = title; this.desc = desc;
    this.seed = seed; this.roughness = roughness;
    this.gen = rough.generator();
    this.parts = [];
    this._n = 0;
  }

  _opts(o = {}) {
    // A fresh seed per shape keeps the output stable between builds but lets
    // neighbouring shapes wobble differently.
    this._n += 1;
    return {
      seed: this.seed * 1000 + this._n,
      roughness: o.roughness ?? this.roughness,
      bowing: o.bowing ?? 1,
      strokeWidth: o.width ?? 1.7,
      stroke: 'STROKE',
      fill: o.fill && o.fill !== 'none' ? 'FILL' : undefined,
      fillStyle: o.fill === 'solid' ? 'solid' : (o.fill === 'dots' ? 'dots' : (o.fill === 'cross' ? 'cross-hatch' : 'hachure')),
      hachureGap: o.hachureGap ?? 6,
      hachureAngle: o.hachureAngle ?? -41,
      fillWeight: o.fillWeight ?? 1.1,
      strokeLineDash: o.dashed ? [6, 7] : undefined,
      disableMultiStroke: !!o.single,
    };
  }

  _emit(drawable, t, extra = '') {
    t = tone(t);
    for (const p of this.gen.toPaths(drawable)) {
      let cls;
      if (p.fill === 'FILL') cls = `f-${t}`;           // solid fill
      else if (p.stroke === 'FILL') cls = `h-${t}`;     // hachure/dots lines
      else cls = `s-${t}`;                              // outline
      const dash = drawable.options.strokeLineDash && cls.startsWith('s-') ? ' stroke-dasharray="6 7"' : '';
      const sw = cls.startsWith('h-') ? drawable.options.fillWeight : drawable.options.strokeWidth;
      // rough.js writes ~14 decimals; a tenth of a pixel is invisible and cuts the file by two thirds.
      const d = p.d.replace(/-?\d+\.\d+/g, n => String(Math.round(n * 10) / 10));
      this.parts.push(`<path class="${cls}"${extra} d="${d}" stroke-width="${r1(sw)}"${dash}/>`);
    }
  }

  // ── primitives ──────────────────────────────────────────────────────────

  /** Text. size ≈ 20–26 reads well; anchor: start | middle | end. */
  text(x, y, str, { size = 22, tone: t = 'ink', anchor = 'middle', weight = 500, rotate = 0 } = {}) {
    const rot = rotate ? ` transform="rotate(${rotate} ${r1(x)} ${r1(y)})"` : '';
    this.parts.push(`<text class="t-${tone(t)}" x="${r1(x)}" y="${r1(y)}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" dominant-baseline="middle"${rot}>${esc(str)}</text>`);
    return { width: String(str).length * size * FONT_W };
  }

  textWidth(str, size = 22) { return String(str).length * size * FONT_W; }

  rect(x, y, w, h, o = {}) {
    this._emit(this.gen.rectangle(x, y, w, h, this._opts(o)), o.tone);
    if (o.label !== undefined) this.text(x + w / 2, y + h / 2, o.label, { size: o.size ?? 22, tone: o.textTone ?? 'ink' });
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, top: y, bottom: y + h, left: x, right: x + w };
  }

  circle(cx, cy, d, o = {}) {
    this._emit(this.gen.ellipse(cx, cy, d, d * (o.squash ?? 0.96), this._opts(o)), o.tone);
    if (o.label !== undefined) this.text(cx, cy, o.label, { size: o.size ?? 22, tone: o.textTone ?? 'ink' });
    return { cx, cy, r: d / 2 };
  }

  ellipse(cx, cy, w, h, o = {}) {
    this._emit(this.gen.ellipse(cx, cy, w, h, this._opts(o)), o.tone);
    if (o.label !== undefined) this.text(cx, cy, o.label, { size: o.size ?? 22, tone: o.textTone ?? 'ink' });
    return { cx, cy, w, h };
  }

  line(x1, y1, x2, y2, o = {}) {
    this._emit(this.gen.line(x1, y1, x2, y2, this._opts(o)), o.tone);
  }

  /** Freehand polyline or smooth curve through points [[x,y],…]. */
  path(points, o = {}) {
    const d = o.smooth === false ? this.gen.linearPath(points, this._opts(o)) : this.gen.curve(points, this._opts(o));
    this._emit(d, o.tone);
  }

  /** Arrow from (x1,y1) to (x2,y2). bend > 0 curves it to the left of travel. */
  arrow(x1, y1, x2, y2, o = {}) {
    const { bend = 0, head = 'end', label, labelTone, size = 20, labelOffset = 14 } = o;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    const cx = mx + nx * bend, cy = my + ny * bend;
    if (bend) this._emit(this.gen.curve([[x1, y1], [cx, cy], [x2, y2]], this._opts(o)), o.tone);
    else this._emit(this.gen.line(x1, y1, x2, y2, this._opts(o)), o.tone);
    const headAt = (hx, hy, fx, fy) => {
      const a = Math.atan2(hy - fy, hx - fx), L = o.headLen ?? 12, s = 0.45;
      this._emit(this.gen.linearPath([
        [hx - L * Math.cos(a - s), hy - L * Math.sin(a - s)], [hx, hy],
        [hx - L * Math.cos(a + s), hy - L * Math.sin(a + s)],
      ], this._opts({ ...o, dashed: false, single: true })), o.tone);
    };
    if (head === 'end' || head === 'both') headAt(x2, y2, bend ? cx : x1, bend ? cy : y1);
    if (head === 'start' || head === 'both') headAt(x1, y1, bend ? cx : x2, bend ? cy : y2);
    if (label !== undefined) {
      const side = bend >= 0 ? 1 : -1;
      const lx = (bend ? (mx + cx) / 2 + (cx - mx) / 2 : mx) + nx * labelOffset * side;
      const ly = (bend ? (my + cy) / 2 + (cy - my) / 2 : my) + ny * labelOffset * side;
      this.text(lx, ly, label, { size, tone: labelTone ?? o.tone ?? 'ink' });
    }
  }

  /** Translucent highlighter swipe behind something. */
  highlight(x, y, w, h, o = {}) {
    this._emit(this.gen.rectangle(x, y, w, h, this._opts({ fill: 'solid', roughness: 2.2, width: 0.01, ...o })), o.tone ?? 'amber', ' opacity="0.45"');
  }

  /** Curly-ish span under/over a range, e.g. a window. side: below | above */
  span(x1, x2, y, label, o = {}) {
    const d = o.side === 'above' ? -1 : 1, k = o.depth ?? 10;
    this.path([[x1, y], [x1 + 4, y + k * d], [(x1 + x2) / 2 - 6, y + k * d], [(x1 + x2) / 2, y + k * 1.8 * d], [(x1 + x2) / 2 + 6, y + k * d], [x2 - 4, y + k * d], [x2, y]], { tone: o.tone, width: 1.6 });
    if (label !== undefined) this.text((x1 + x2) / 2, y + (k * 1.8 + 16) * d, label, { size: o.size ?? 20, tone: o.tone ?? 'ink' });
  }

  // ── composites ──────────────────────────────────────────────────────────

  /**
   * A row of cells with values, indices underneath (optional).
   * tones: { index: tone }  fills those cells; dim: [indices] greys them out.
   * Returns helpers: cx(i), left(i), right(i), top, bottom (below the indices).
   */
  array(x, y, values, o = {}) {
    const { cell = 50, height = cell, indices = true, startIndex = 0, tones = {}, dim = [], size = 24, gap = 0, fill = 'hachure', label, labelSize = 20 } = o;
    const step = cell + gap;
    values.forEach((v, i) => {
      const t = tones[i];
      const dimmed = dim.includes(i);
      this.rect(x + i * step, y, cell, height, {
        tone: t ?? (dimmed ? 'soft' : 'ink'),
        fill: t ? fill : undefined,
        width: 1.6,
      });
      if (v !== null && v !== undefined && v !== '') this.text(x + i * step + cell / 2, y + height / 2 + 1, v, { size, tone: dimmed ? 'soft' : 'ink', weight: 600 });
      if (indices) this.text(x + i * step + cell / 2, y + height + 16, i + startIndex, { size: 17, tone: 'soft' });
    });
    if (label) this.text(x - 12, y + height / 2, label, { size: labelSize, anchor: 'end', tone: 'soft' });
    const bottom = y + height + (indices ? 30 : 6);
    return {
      cx: i => x + i * step + cell / 2, left: i => x + i * step, right: i => x + i * step + cell,
      top: y, bottom, mid: y + height / 2, cell, step, x, y, height,
      width: values.length * step - gap,
    };
  }

  /** Arrow pointing at (x, y) from below (dir 'up') or above ('down'), with a label at its tail. */
  pointer(x, y, label, o = {}) {
    const { dir = 'up', len = 34, tone: t = 'blue', size = 21 } = o;
    const s = dir === 'up' ? 1 : -1;
    this.arrow(x, y + s * (len + 4), x, y + s * 4, { tone: t, width: 1.8, headLen: 10 });
    if (label !== undefined) this.text(x, y + s * (len + 18), label, { size, tone: t, weight: 700 });
  }

  /** A graph/tree node. Returns {cx, cy, r} for edge(). */
  node(cx, cy, label, o = {}) {
    const d = (o.r ?? 22) * 2;
    return this.circle(cx, cy, d, { tone: o.tone ?? 'ink', fill: o.fill ?? (o.tone ? 'hachure' : undefined), label, size: o.size ?? 22, width: 1.7 });
  }

  /** Edge between two nodes (circle-aware). directed adds a head; bend curves it. */
  edge(a, b, o = {}) {
    const dx = b.cx - a.cx, dy = b.cy - a.cy, L = Math.hypot(dx, dy) || 1;
    const ra = (a.r ?? 22) + 3, rb = (b.r ?? 22) + 5;
    this.arrow(a.cx + dx / L * ra, a.cy + dy / L * ra, b.cx - dx / L * rb, b.cy - dy / L * rb, {
      head: o.directed ? 'end' : 'none', bend: o.bend ?? 0, tone: o.tone ?? 'ink', label: o.label, labelTone: o.labelTone, size: o.size ?? 19, dashed: o.dashed, width: o.width ?? 1.6,
    });
  }

  /** A labelled box (process step / state), rounded-ish by the wobble. */
  box(cx, cy, label, o = {}) {
    const size = o.size ?? 21;
    const lines = String(label).split('\n');
    const w = o.w ?? Math.max(...lines.map(l => this.textWidth(l, size))) + 30;
    const h = o.h ?? lines.length * size * 1.15 + 20;
    this.rect(cx - w / 2, cy - h / 2, w, h, { tone: o.tone ?? 'ink', fill: o.fill ?? (o.tone ? 'hachure' : undefined), width: 1.7, dashed: o.dashed });
    lines.forEach((l, i) => this.text(cx, cy + (i - (lines.length - 1) / 2) * size * 1.15, l, { size, tone: o.textTone ?? 'ink', weight: o.weight ?? 600 }));
    return { cx, cy, w, h, top: cy - h / 2, bottom: cy + h / 2, left: cx - w / 2, right: cx + w / 2, r: Math.min(w, h) / 2 };
  }

  /** Connect two boxes edge-to-edge (picks the facing sides). */
  connect(a, b, o = {}) {
    const dx = b.cx - a.cx, dy = b.cy - a.cy;
    let p, q;
    if (Math.abs(dx) * (a.h + b.h) > Math.abs(dy) * (a.w + b.w)) {
      p = [dx > 0 ? a.right + 4 : a.left - 4, a.cy]; q = [dx > 0 ? b.left - 6 : b.right + 6, b.cy];
    } else {
      p = [a.cx, dy > 0 ? a.bottom + 4 : a.top - 4]; q = [b.cx, dy > 0 ? b.top - 6 : b.bottom + 6];
    }
    this.arrow(p[0], p[1], q[0], q[1], { head: o.head ?? 'end', bend: o.bend ?? 0, tone: o.tone ?? 'ink', label: o.label, labelTone: o.labelTone, size: o.size ?? 19, dashed: o.dashed, labelOffset: o.labelOffset });
  }

  /** A grid/table of cells. rows: 2-D array of strings. tones: {"r,c": tone}. */
  grid(x, y, rows, o = {}) {
    const { cw = 52, ch = 44, tones = {}, size = 22, header = false, rowLabels, colLabels, dim = [] } = o;
    rows.forEach((row, r) => row.forEach((v, c) => {
      const t = tones[`${r},${c}`] ?? (header && r === 0 ? 'soft' : undefined);
      const dimmed = dim.includes(`${r},${c}`);
      this.rect(x + c * cw, y + r * ch, cw, ch, { tone: t ?? (dimmed ? 'soft' : 'ink'), fill: t ? 'hachure' : undefined, width: 1.4, hachureGap: 7 });
      if (v !== null && v !== undefined && v !== '') this.text(x + c * cw + cw / 2, y + r * ch + ch / 2 + 1, v, { size, tone: dimmed ? 'soft' : 'ink', weight: 600 });
    }));
    if (rowLabels) rowLabels.forEach((l, r) => this.text(x - 10, y + r * ch + ch / 2, l, { size: 18, tone: 'soft', anchor: 'end' }));
    if (colLabels) colLabels.forEach((l, c) => this.text(x + c * cw + cw / 2, y - 14, l, { size: 18, tone: 'soft' }));
    return { cx: c => x + c * cw + cw / 2, cy: r => y + r * ch + ch / 2, x, y, cw, ch, right: x + (rows[0]?.length ?? 0) * cw, bottom: y + rows.length * ch };
  }

  /** Vertical stack (bottom → top), e.g. a call stack or LIFO stack. items[0] is the bottom. */
  stack(x, yBottom, items, o = {}) {
    const { w = 90, h = 40, tones = {}, size = 21, label } = o;
    items.forEach((v, i) => this.rect(x, yBottom - (i + 1) * h, w, h, { tone: tones[i] ?? 'ink', fill: tones[i] ? 'hachure' : undefined, label: v, size, width: 1.5 }));
    this.path([[x - 8, yBottom - items.length * h - 18], [x - 8, yBottom + 4], [x + w + 8, yBottom + 4], [x + w + 8, yBottom - items.length * h - 18]], { smooth: false, tone: 'soft', width: 1.5 });
    if (label) this.text(x + w / 2, yBottom + 24, label, { size: 19, tone: 'soft' });
    return { top: yBottom - items.length * h, cx: x + w / 2 };
  }

  // ── output ──────────────────────────────────────────────────────────────

  toString() {
    const id = 'sk' + Math.abs([...this.title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36);
    const desc = this.desc ? `<desc id="${id}d">${esc(this.desc)}</desc>` : '';
    return `<svg class="sketch-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" role="img" aria-labelledby="${id}t${this.desc ? ` ${id}d` : ''}"><title id="${id}t">${esc(this.title)}</title>${desc}${this.parts.join('')}</svg>`;
  }

  /** Write to _includes/sketches/<folder>/<name>.svg, where <folder> is the spec file's folder name. */
  save(specDir, name) {
    const folder = path.basename(specDir);
    const out = path.resolve(__dirname, '..', '..', '_includes', 'sketches', folder);
    fs.mkdirSync(out, { recursive: true });
    const file = path.join(out, `${name}.svg`);
    fs.writeFileSync(file, this.toString() + '\n');
    return file;
  }
}

module.exports = { Sketch, TONES };
