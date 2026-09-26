// Figures for Part 2: Arrays & Hashing.
// Build: node _templates/sketches/dsa-arrays-and-hashing/figures.js
const { Sketch } = require('../sketch');

// ── Dynamic Arrays: eight appends into a doubling array ─────────────────────
{
  const rows = [
    { v: 5, size: 1, cap: 1, copy: 0 },
    { v: 8, size: 2, cap: 2, copy: 1 },
    { v: 2, size: 3, cap: 4, copy: 2 },
    { v: 9, size: 4, cap: 4, copy: 0 },
    { v: 4, size: 5, cap: 8, copy: 4 },
    { v: 7, size: 6, cap: 8, copy: 0 },
    { v: 1, size: 7, cap: 8, copy: 0 },
    { v: 6, size: 8, cap: 8, copy: 0 },
  ];
  const all = [5, 8, 2, 9, 4, 7, 1, 6];
  const top = 30, rowH = 50, cell = 38, x0 = 120;
  const s = new Sketch({
    width: 640, height: top + rows.length * rowH + 80, seed: 11,
    title: 'Eight appends into a dynamic array that doubles its capacity',
    desc: 'Appending 5, 8, 2, 9, 4, 7, 1, 6 starting at capacity 1. Resizes on the 2nd, 3rd and 5th appends copy 1, 2 and 4 elements; total copies 7.',
  });
  rows.forEach((r, k) => {
    const y = top + k * rowH;
    s.text(20, y + cell / 2, `append ${r.v}`, { anchor: 'start', size: 20, tone: r.copy ? 'amber' : 'ink', weight: 600 });
    const vals = [], dim = [];
    for (let i = 0; i < r.cap; i++) {
      if (i < r.size) vals.push(all[i]); else { vals.push(''); dim.push(i); }
    }
    const last = k === rows.length - 1;
    const a = s.array(x0, y, vals, { cell, size: 21, tones: { [r.size - 1]: 'blue' }, dim, indices: last });
    const note = r.copy ? `full → copy ${r.copy}, cap ${r.cap}` : `size ${r.size}, cap ${r.cap}`;
    s.text(x0 + 8 * cell + 22, y + cell / 2, note, { anchor: 'start', size: 20, tone: r.copy ? 'amber' : 'soft', weight: r.copy ? 700 : 500 });
    if (last) s.text(x0 - 12, a.top + cell + 16, 'index', { anchor: 'end', size: 17, tone: 'soft' });
  });
  s.text(20, top + rows.length * rowH + 48, 'total copies: 1 + 2 + 4 = 7 for 8 appends', { anchor: 'start', size: 22, weight: 700 });
  s.save(__dirname, 'dynamic-array-growth');
}

// ── Hash Usage: the counting loop ────────────────────────────────────────────
{
  const visits = ['ana', 'bo', 'ana', 'cy', 'bo', 'ana', 'dee'];
  const names = ['ana', 'bo', 'cy', 'dee'];
  const counts = {};
  const rows = [], tones = {}, dim = [];
  visits.forEach((v, i) => {
    counts[v] = (counts[v] || 0) + 1;
    rows.push(names.map((n, c) => {
      if (n === v) tones[`${i},${c}`] = 'blue';
      if (!counts[n]) { dim.push(`${i},${c}`); return ''; }
      return counts[n];
    }));
  });
  const s = new Sketch({
    width: 440, height: 380, seed: 21,
    title: 'Counting visits one step at a time',
    desc: 'counts after each of the seven visits: ana 1, then bo 1, ana 2, cy 1, bo 2, ana 3, dee 1. Final counts ana 3, bo 2, cy 1, dee 1.',
  });
  s.text(40, 26, 'step', { anchor: 'start', size: 18, tone: 'soft' });
  s.text(250, 26, 'counts after the step', { size: 18, tone: 'soft' });
  const g = s.grid(140, 70, rows, {
    cw: 64, ch: 40, tones, dim,
    rowLabels: visits.map((v, i) => `${i}  ${v}`),
    colLabels: names,
  });
  s.text(g.x, g.bottom + 28, 'blank = not yet a key', { anchor: 'start', size: 18, tone: 'soft' });
  s.save(__dirname, 'visit-counts');
}

// ── Hash Usage: which container ─────────────────────────────────────────────
{
  const s = new Sketch({
    width: 680, height: 330, seed: 31,
    title: 'Picking the container for what you remember about past elements',
    desc: 'Only whether x appeared: set. How many times: dict of counts or Counter. Which elements share a property: defaultdict(list) keyed by f(x). Where x appeared: dict from x to index.',
  });
  const q = s.box(340, 48, 'What do I need to remember\nabout past elements?', { size: 20 });
  const xs = [90, 255, 425, 590];
  const mid = ['only whether\nx appeared', 'how many times\nx appeared', 'which elements\nshare a property', 'where x\nappeared'];
  const out = ['set', 'dict of counts\n/ Counter', 'defaultdict(list)\nkeyed by f(x)', 'dict\nx → index'];
  xs.forEach((x, i) => {
    const m = s.box(x, 168, mid[i], { size: 18, w: 150, h: 60 });
    const o = s.box(x, 272, out[i], { size: 18, tone: 'green', w: i === 2 ? 162 : 150, h: 60 });
    s.arrow(q.cx + (x - q.cx) * 0.35, q.bottom + 4, x, m.top - 6, { width: 1.6 });
    s.arrow(x, m.bottom + 4, x, o.top - 6, { width: 1.6, tone: 'green' });
  });
  s.save(__dirname, 'container-choice');
}

// ── Hash Implementation: resize from 4 to 8 buckets ─────────────────────────
{
  const s = new Sketch({
    width: 660, height: 420, seed: 41,
    title: 'Hash table resize from 4 buckets to 8',
    desc: 'Before: bucket 2 holds 10 and 14, bucket 3 holds 3 and 7. After resizing to 8 and re-inserting with key % 8: 10 in bucket 2, 3 in bucket 3, 14 in bucket 6, 7 in bucket 7.',
  });
  const c = 44, top = 96, rh = 38;
  s.text(40, 24, 'capacity 4, index = key % 4', { anchor: 'start', size: 20, weight: 700 });
  s.text(40, 50, 'after put 7, before resize', { anchor: 'start', size: 18, tone: 'soft' });
  s.text(370, 24, 'capacity 8, index = key % 8', { anchor: 'start', size: 20, weight: 700 });
  s.text(370, 50, 'every key re-inserted', { anchor: 'start', size: 18, tone: 'soft' });

  const L = { 2: [10, 14], 3: [3, 7] };
  const R = { 2: [10], 3: [3], 6: [14], 7: [7] };
  const moved = { 14: true, 7: true };
  const lx = 90, rx = 410;
  const pos = { L: {}, R: {} };
  for (let b = 0; b < 4; b++) {
    const y = top + b * rh;
    s.text(lx - 12, y + c / 2 - 3, `bucket ${b}`, { anchor: 'end', size: 17, tone: 'soft' });
    const keys = L[b] || [];
    if (!keys.length) s.rect(lx, y + 6, c, rh - 16, { tone: 'soft', dashed: true, width: 1.2 });
    keys.forEach((k, j) => {
      s.rect(lx + j * c, y, c, rh - 4, { tone: moved[k] ? 'amber' : 'blue', fill: 'hachure', label: k, size: 20 });
      pos.L[k] = { x: lx + 2 * c, y: y + (j === 0 ? 10 : rh - 14) };
    });
  }
  for (let b = 0; b < 8; b++) {
    const y = top + b * rh;
    s.text(rx - 12, y + c / 2 - 3, `bucket ${b}`, { anchor: 'end', size: 17, tone: 'soft' });
    const keys = R[b] || [];
    if (!keys.length) s.rect(rx, y + 6, c, rh - 16, { tone: 'soft', dashed: true, width: 1.2 });
    keys.forEach(k => {
      s.rect(rx, y, c, rh - 4, { tone: moved[k] ? 'amber' : 'blue', fill: 'hachure', label: k, size: 20 });
      s.text(rx + c + 14, y + (rh - 4) / 2, `${k} % 8 = ${b}`, { anchor: 'start', size: 18, tone: 'soft' });
      pos.R[k] = { x: rx - 80, y: y + (rh - 4) / 2 };
    });
  }
  for (const k of [10, 14, 3, 7]) {
    const a = pos.L[k], b = pos.R[k];
    s.arrow(a.x + 10, a.y, b.x - 4, b.y, { tone: moved[k] ? 'amber' : 'blue', width: 1.5, dashed: !moved[k] });
  }
  s.text(40, top + 4 * rh + 40, 'load 4 / 4 = 1.00 > 0.75', { anchor: 'start', size: 20, weight: 700, tone: 'red' });
  s.text(40, top + 4 * rh + 68, '→ double to 8 and re-bucket', { anchor: 'start', size: 20, tone: 'red' });
  s.save(__dirname, 'hash-resize');
}

// ── Prefix Sums: P on the fences between elements ───────────────────────────
{
  const nums = [3, -1, 4, 1, -5, 9, 2];
  const P = [0, 3, 2, 6, 7, 2, 11, 13];
  const s = new Sketch({
    width: 620, height: 330, seed: 51,
    title: 'Prefix sums sit on the fences between elements',
    desc: 'nums = 3, -1, 4, 1, -5, 9, 2. P = 0, 3, 2, 6, 7, 2, 11, 13, where P[j] sits just before nums[j]. sum(nums[2..4]) = P[5] - P[2] = 2 - 2 = 0.',
  });
  const x0 = 110, cell = 62;
  const a = s.array(x0, 40, nums, { cell, tones: { 2: 'blue', 3: 'blue', 4: 'blue' }, label: 'nums' });
  const py = 150;
  s.text(x0 - 40, py, 'P', { anchor: 'end', size: 20, tone: 'soft' });
  P.forEach((p, j) => {
    const fx = x0 + j * cell;
    const hot = j === 2 || j === 5;
    s.line(fx, a.top + cell + 26, fx, py - 22, { tone: hot ? 'amber' : 'soft', width: 1.3, dashed: !hot });
    s.node(fx, py, p, { r: 19, tone: hot ? 'amber' : undefined, size: 20 });
    s.text(fx, py + 34, j, { size: 16, tone: 'soft' });
  });
  s.span(a.left(2) + 4, a.right(4) - 4, py + 52, 'nums[2..4]', { tone: 'blue' });
  s.text(20, 268, 'sum(nums[2..4]) = P[5] − P[2] = 2 − 2 = 0', { anchor: 'start', size: 22, weight: 700 });
  s.text(20, 300, 'P[5] covers nums[0..4], P[2] covers nums[0..1]', { anchor: 'start', size: 19, tone: 'soft' });
  s.save(__dirname, 'prefix-fence');
}

// ── Prefix Sums + hash map: the sweep for k = 4 ─────────────────────────────
{
  const nums = [3, -1, 4, 1, -5, 9, 2];
  const k = 4;
  const seen = { 0: 1 };
  let running = 0, total = 0;
  const rows = [['i', 'x', 'running', 'need', 'found', 'total']];
  const tones = {}, notes = {};
  const hits = { 2: 'nums[2..2]', 3: 'nums[1..3]', 5: 'nums[4..5]' };
  nums.forEach((x, i) => {
    running += x;
    const need = running - k;
    const found = seen[need] || 0;
    total += found;
    seen[running] = (seen[running] || 0) + 1;
    rows.push([i, x, running, need, found, total]);
    if (found) { tones[`${i + 1},4`] = 'green'; tones[`${i + 1},5`] = 'green'; }
    if (seen[running] > 1) tones[`${i + 1},2`] = 'amber';
  });
  const s = new Sketch({
    width: 660, height: 450, seed: 61,
    title: 'Prefix sum plus hash map sweep for k = 4',
    desc: 'running totals 3, 2, 6, 7, 2, 11, 13; need = running - 4; matches at i = 2, 3 and 5 give total 3. The running total 2 repeats at i = 4, so seen[2] becomes 2. Final seen: 0:1, 3:1, 2:2, 6:1, 7:1, 11:1, 13:1.',
  });
  const g = s.grid(24, 20, rows, { cw: 72, ch: 40, tones, header: true, size: 20 });
  Object.entries(hits).forEach(([i, t]) => s.text(g.right + 16, g.cy(+i + 1), `← ${t}`, { anchor: 'start', size: 20, tone: 'green', weight: 700 }));
  s.text(g.right + 16, g.cy(5), '← 2 again: seen[2] = 2', { anchor: 'start', size: 19, tone: 'amber', weight: 700 });
  const final = '0:1, 3:1, 2:2, 6:1, 7:1, 11:1, 13:1'; // insertion order, as the dict prints it
  s.text(24, g.bottom + 34, `seen starts {0:1}; after the sweep {${final}}`, { anchor: 'start', size: 19 });
  s.text(24, g.bottom + 64, 'found = seen[need], read before running is inserted', { anchor: 'start', size: 19, tone: 'soft' });
  s.save(__dirname, 'prefix-hash-sweep');
}
