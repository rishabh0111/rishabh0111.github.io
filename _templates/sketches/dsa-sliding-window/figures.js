// Figures for Part 6, Sliding Window.
//   node _templates/sketches/dsa-sliding-window/figures.js
const { Sketch } = require('../sketch');

// Colour key used throughout: blue = inside the window, green = the element that
// just entered, red = the element(s) that just left, soft = outside the window.

// ── 1. Fixed window, k = 3, largest sum ────────────────────────────────────
{
  const nums = [2, 1, 5, 1, 3, 2];
  const rows = [
    { r: 2, l: 0, calc: '2 + 1 + 5 = 8', best: 8 },
    { r: 3, l: 1, calc: '8 + 1 − 2 = 7', best: 8, out: 0 },
    { r: 4, l: 2, calc: '7 + 3 − 1 = 9', best: 9, out: 1 },
    { r: 5, l: 3, calc: '9 + 2 − 5 = 6', best: 9, out: 2 },
  ];
  const cell = 44, x0 = 80, top = 58, pitch = 88;
  const s = new Sketch({ width: 620, height: top + rows.length * pitch + 4, title: 'Fixed window of size 3 sliding over [2, 1, 5, 1, 3, 2]', desc: 'Running sums 8, 7, 9, 6; best 9', seed: 6 });
  nums.forEach((_, i) => s.text(x0 + i * cell + cell / 2, 22, i, { size: 17, tone: 'soft' }));
  s.text(x0 - 14, 22, 'index', { size: 17, tone: 'soft', anchor: 'end' });
  s.text(x0 + 6 * cell + 30, 22, 'sum', { size: 18, tone: 'soft', anchor: 'start' });
  s.text(596, 22, 'best', { size: 18, tone: 'soft', anchor: 'end' });
  rows.forEach((row, k) => {
    const y = top + k * pitch;
    const tones = {}, dim = [];
    nums.forEach((_, i) => {
      if (i >= row.l && i <= row.r) tones[i] = 'blue';
      else dim.push(i);
    });
    if (row.out !== undefined) { tones[row.r] = 'green'; tones[row.out] = 'red'; }
    const a = s.array(x0, y, nums, { cell, indices: false, tones, dim: dim.filter(i => i !== row.out), size: 22 });
    s.text(x0 - 14, y + cell / 2, `r=${row.r}`, { size: 20, anchor: 'end', weight: 600 });
    s.span(a.left(row.l) + 3, a.right(row.r) - 3, y + cell + 4, undefined, { tone: 'blue', depth: 7 });
    s.text(x0 + 6 * cell + 30, y + cell / 2, row.calc, { size: 21, anchor: 'start' });
    s.text(596, y + cell / 2, row.best, { size: 22, anchor: 'end', weight: 700, tone: row.best === 9 && row.r === 4 ? 'green' : 'ink' });
  });
  s.save(__dirname, 'fixed-window');
}

// ── 2. Variable window, longest subarray with sum <= 7 ─────────────────────
{
  const nums = [2, 3, 1, 2, 4, 3];
  const rows = [
    { r: 0, l: 0, note: 'sum 2', best: 1 },
    { r: 1, l: 0, note: 'sum 5', best: 2 },
    { r: 2, l: 0, note: 'sum 6', best: 3 },
    { r: 3, l: 1, note: '8 > 7, drop 2 → 6', best: 3, out: [0] },
    { r: 4, l: 2, note: '10 > 7, drop 3 → 7', best: 3, out: [1] },
    { r: 5, l: 4, note: '10 > 7, drop 1, 2 → 7', best: 3, out: [2, 3] },
  ];
  const cell = 42, x0 = 104, top = 56, pitch = 76;
  const s = new Sketch({ width: 660, height: top + rows.length * pitch + 2, title: 'Variable window: longest subarray of [2, 3, 1, 2, 4, 3] with sum at most 7', desc: 'State after the shrink loop at each r; answer 3', seed: 7 });
  nums.forEach((_, i) => s.text(x0 + i * cell + cell / 2, 22, i, { size: 17, tone: 'soft' }));
  s.text(x0 - 14, 22, 'index', { size: 17, tone: 'soft', anchor: 'end' });
  s.text(636, 22, 'best', { size: 18, tone: 'soft', anchor: 'end' });
  rows.forEach((row, k) => {
    const y = top + k * pitch;
    const tones = {}, dim = [];
    nums.forEach((_, i) => {
      if (i >= row.l && i <= row.r) tones[i] = 'blue';
      else if (!(row.out || []).includes(i)) dim.push(i);
    });
    (row.out || []).forEach(i => { tones[i] = 'red'; });
    const a = s.array(x0, y, nums, { cell, indices: false, tones, dim, size: 22 });
    s.text(x0 - 14, y + cell / 2, `r=${row.r} l=${row.l}`, { size: 19, anchor: 'end', weight: 600 });
    s.span(a.left(row.l) + 3, a.right(row.r) - 3, y + cell + 4, undefined, { tone: 'blue', depth: 7 });
    s.text(x0 + 6 * cell + 22, y + cell / 2, row.note, { size: 20, anchor: 'start' });
    s.text(636, y + cell / 2, row.best, { size: 22, anchor: 'end', weight: 700 });
  });
  s.save(__dirname, 'variable-window');
}

// ── 3. Two monotonic deques, longest subarray with max − min <= 5 ──────────
{
  const nums = [10, 1, 2, 4, 7, 2];
  const rows = [
    { r: 0, l: 0, max: [0], min: [0], diff: '10 − 10 = 0', best: 1 },
    { r: 1, l: 1, max: [1], min: [1], diff: '1 − 1 = 0', best: 1 },
    { r: 2, l: 1, max: [2], min: [1, 2], diff: '2 − 1 = 1', best: 2 },
    { r: 3, l: 1, max: [3], min: [1, 2, 3], diff: '4 − 1 = 3', best: 3 },
    { r: 4, l: 2, max: [4], min: [2, 3, 4], diff: '7 − 2 = 5', best: 3 },
    { r: 5, l: 2, max: [4, 5], min: [5], diff: '7 − 2 = 5', best: 4 },
  ];
  const cell = 40, x0 = 62, top = 56, pitch = 104, dqx = 386, bw = 50, bh = 32;
  const s = new Sketch({ width: 680, height: top + rows.length * pitch - 6, title: 'Max and min deques for [10, 1, 2, 4, 7, 2] with limit 5', desc: 'Window, max deque and min deque after each step; answer 4', seed: 8 });
  nums.forEach((_, i) => s.text(x0 + i * cell + cell / 2, 22, i, { size: 17, tone: 'soft' }));
  s.text(dqx - 12, 22, 'deques (i:val), front on the left', { size: 18, tone: 'soft', anchor: 'start' });
  s.text(660, 22, 'best', { size: 18, tone: 'soft', anchor: 'end' });
  rows.forEach((row, k) => {
    const y = top + k * pitch;
    const tones = {}, dim = [];
    nums.forEach((_, i) => {
      if (i >= row.l && i <= row.r) tones[i] = 'blue';
      else dim.push(i);
    });
    const a = s.array(x0, y, nums, { cell, indices: false, tones, dim, size: 21 });
    s.text(x0 - 12, y + cell / 2, `r=${row.r}`, { size: 19, anchor: 'end', weight: 600 });
    s.span(a.left(row.l) + 3, a.right(row.r) - 3, y + cell + 4, undefined, { tone: 'blue', depth: 7 });
    s.text(x0 + 3 * cell, y + cell + 34, `l=${row.l}    max − min = ${row.diff}`, { size: 18, tone: 'soft' });
    const dq = (items, yy, lab, t) => {
      s.text(dqx - 10, yy + bh / 2, lab, { size: 18, anchor: 'end', tone: t, weight: 600 });
      items.forEach((idx, j) => s.rect(dqx + j * (bw + 6), yy, bw, bh, {
        tone: j === 0 ? t : 'ink', fill: j === 0 ? 'hachure' : undefined, label: `${idx}:${nums[idx]}`, size: 18, width: 1.5,
      }));
    };
    dq(row.max, y - 6, 'max', 'amber');
    dq(row.min, y + bh + 2, 'min', 'violet');
    s.text(660, y + cell / 2 + 4, row.best, { size: 22, anchor: 'end', weight: 700 });
  });
  s.save(__dirname, 'monotonic-deques');
}

// ── 4. Which window, if any ────────────────────────────────────────────────
{
  const s = new Sketch({ width: 680, height: 640, title: 'Choosing a sliding window approach', desc: 'Decision flow: contiguous, fixed length, monotone rule, max or min state', seed: 9 });
  const A = s.box(230, 44, 'contiguous subarray\nor substring?', { size: 20 });
  const X = s.box(540, 44, 'not a window: hashing,\nDP, sorting', { tone: 'violet', size: 19 });
  const B = s.box(230, 150, 'window length fixed?', { size: 20 });
  const C = s.box(110, 262, 'fixed window\nl = r − k + 1', { tone: 'blue', size: 20 });
  const D = s.box(450, 262, 'validity rule monotone?\n(no negatives in sums)', { size: 20 });
  const P = s.box(580, 384, 'prefix sums\n+ hash map', { tone: 'violet', size: 19 });
  const E = s.box(340, 384, 'variable window:\ngrow r, shrink l\nwith while', { tone: 'blue', size: 19 });
  const F = s.box(230, 500, 'state needs max or min?', { size: 20 });
  const G = s.box(120, 600, 'monotonic deque\nof indices', { tone: 'green', size: 19 });
  const H = s.box(430, 600, 'running sum, count\nor frequency map', { tone: 'green', size: 19 });
  s.connect(A, X, { label: 'no', labelOffset: 14 });
  s.connect(A, B, { label: 'yes', labelOffset: 20 });
  s.arrow(B.left + 30, B.bottom + 4, C.cx + 10, C.top - 6, { label: 'yes', labelOffset: 16, bend: 0 });
  s.arrow(B.right - 30, B.bottom + 4, D.cx - 20, D.top - 6, { label: 'no', labelOffset: -16 });
  s.arrow(D.right - 40, D.bottom + 4, P.cx + 10, P.top - 6, { label: 'no', labelOffset: -16 });
  s.arrow(D.left + 60, D.bottom + 4, E.cx + 10, E.top - 6, { label: 'yes', labelOffset: 16 });
  s.arrow(C.cx, C.bottom + 4, F.left + 50, F.top - 6);
  s.arrow(E.cx - 20, E.bottom + 4, F.right - 60, F.top - 6);
  s.arrow(F.left + 40, F.bottom + 4, G.cx + 10, G.top - 6, { label: 'yes', labelOffset: 16 });
  s.arrow(F.right - 40, F.bottom + 4, H.cx - 20, H.top - 6, { label: 'no', labelOffset: -16 });
  s.save(__dirname, 'which-window');
}
