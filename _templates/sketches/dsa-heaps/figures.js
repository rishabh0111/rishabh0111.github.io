// Figures for Part 10: Heaps (dsa-heaps).
// Build: node _templates/sketches/dsa-heaps/figures.js
const { Sketch } = require('../sketch');

// Position of heap index i in a tree drawn inside [x0, x0 + w], top row at y0.
function pos(i, x0, w, y0, dy) {
  const d = Math.floor(Math.log2(i + 1));
  const p = i - (2 ** d - 1);
  return { x: x0 + (w * (p + 0.5)) / 2 ** d, y: y0 + d * dy };
}

// Draw a heap (array vals) as a tree. tones: {i: tone}. skipEdges: set of child
// indices whose parent edge is drawn by the caller. Returns node handles.
function tree(s, vals, { x0, w, y0, dy = 76, r = 21, tones = {}, idx = true, skipEdges = [] }) {
  const nodes = vals.map((v, i) => {
    const { x, y } = pos(i, x0, w, y0, dy);
    const n = s.node(x, y, v, { r, tone: tones[i] });
    if (idx) s.text(x + r + 3, y - r + 2, i, { size: 16, tone: 'soft', anchor: 'start' });
    return n;
  });
  for (let i = 1; i < vals.length; i++) {
    if (!skipEdges.includes(i)) s.edge(nodes[Math.floor((i - 1) / 2)], nodes[i]);
  }
  return nodes;
}


// A path edge drawn as an arrow with its label pushed clear of the line.
function step(s, a, b, label, side) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy, L = Math.hypot(dx, dy);
  s.arrow(a.cx + dx / L * 24, a.cy + dy / L * 24, b.cx - dx / L * 27, b.cy - dy / L * 27, { tone: 'amber', width: 2, headLen: 11 });
  s.text((a.cx + b.cx) / 2 + side * 34, (a.cy + b.cy) / 2, label, { size: 18, tone: 'amber' });
}

// 1. Tree view and array view of h = [2, 5, 3, 9, 6, 4, 8]
{
  const s = new Sketch({
    width: 680, height: 340, seed: 2,
    title: 'The same min-heap as a tree and as an array',
    desc: 'h = [2, 5, 3, 9, 6, 4, 8]. Root 2 at index 0; 5 and 3 at indices 1 and 2; leaves 9, 6, 4, 8 at indices 3 to 6. Children of index 1 are indices 3 and 4 (values 9 and 6); the parent of index 5 is index 2 (value 3).',
  });
  const h = [2, 5, 3, 9, 6, 4, 8];
  const tones = { 0: 'amber', 1: 'blue', 2: 'blue', 3: 'green', 4: 'green', 5: 'green', 6: 'green' };
  s.text(160, 22, 'tree view', { size: 21, tone: 'soft' });
  tree(s, h, { x0: 10, w: 300, y0: 70, dy: 82, tones });
  s.text(496, 22, 'array view', { size: 21, tone: 'soft' });
  const a = s.array(348, 110, h, { cell: 42, tones });
  // children of 1 -> 3, 4 (arcs above), parent of 5 -> 2 (arc below indices)
  s.arrow(a.cx(1), a.top - 4, a.cx(3) - 4, a.top - 4, { bend: -26, tone: 'blue', width: 1.5, headLen: 9 });
  s.arrow(a.cx(1), a.top - 4, a.cx(4), a.top - 4, { bend: -46, tone: 'blue', width: 1.5, headLen: 9 });
  s.text(a.cx(4) + 26, 80, 'kids of 1', { size: 18, tone: 'blue', anchor: 'start' });
  s.arrow(a.cx(5), a.bottom + 2, a.cx(2) + 4, a.bottom + 2, { bend: -30, tone: 'violet', width: 1.5, headLen: 9 });
  s.text(a.cx(3) + 20, a.bottom + 44, 'parent of 5', { size: 18, tone: 'violet' });
  s.span(a.left(0) + 3, a.right(0) - 3, 250, 'root', { tone: 'amber', size: 18 });
  s.span(a.left(1) + 3, a.right(2) - 3, 250, 'depth 1', { tone: 'blue', size: 18 });
  s.span(a.left(3) + 3, a.right(6) - 3, 250, 'depth 2: leaves 3..6', { tone: 'green', size: 18 });
  s.text(20, 318, 'children of i = 1: 2·1+1 = 3 → 9, 2·1+2 = 4 → 6', { size: 18, tone: 'blue', anchor: 'start' });
  s.text(660, 318, 'parent of i = 5: (5-1)//2 = 2 → 3', { size: 18, tone: 'violet', anchor: 'end' });
  s.save(__dirname, 'layout');
}

// Rows of array states for a trace. Each row: note line, then the array.
function rows(s, list, { x, y, cell, gap }) {
  let yy = y;
  list.forEach((r, k) => {
    s.text(x, yy, r.note, { size: 19, tone: r.noteTone ?? 'ink', anchor: 'start' });
    const a = s.array(x, yy + 16, r.vals, { cell, tones: r.tones, indices: k === 0, size: 21 });
    yy = a.bottom + gap;
  });
  return yy;
}

// 2. Push 1 (sift up)
{
  const s = new Sketch({
    width: 680, height: 380, seed: 4,
    title: 'Pushing 1 into the heap: sift up',
    desc: '1 is appended at index 7 and climbs 7 to 3 to 1 to 0, swapping with 9, 5 and 2. Result [1, 2, 3, 5, 6, 4, 8, 9], three swaps.',
  });
  rows(s, [
    { note: 'append 1 at idx 7 · 1 < 9 (parent idx 3): swap', vals: [2, 5, 3, 9, 6, 4, 8, 1], tones: { 7: 'amber', 3: 'blue' } },
    { note: '1 < 5 (parent idx 1): swap', vals: [2, 5, 3, 1, 6, 4, 8, 9], tones: { 3: 'amber', 1: 'blue' } },
    { note: '1 < 2 (parent idx 0): swap', vals: [2, 1, 3, 5, 6, 4, 8, 9], tones: { 1: 'amber', 0: 'blue' } },
    { note: 'done, 3 swaps', noteTone: 'green', vals: [1, 2, 3, 5, 6, 4, 8, 9], tones: { 0: 'green' } },
  ], { x: 16, y: 24, cell: 36, gap: 26 });
  // Tree on the right: the state just after appending, with the climb drawn in.
  const v = [2, 5, 3, 9, 6, 4, 8, 1];
  s.text(520, 24, 'path 1 climbs', { size: 20, tone: 'soft' });
  const n = tree(s, v, { x0: 380, w: 290, y0: 72, dy: 92, tones: { 7: 'amber', 3: 'blue', 1: 'blue', 0: 'blue' }, skipEdges: [7, 3, 1] });
  step(s, n[7], n[3], 'swap 1', -1);
  step(s, n[3], n[1], 'swap 2', -1);
  step(s, n[1], n[0], 'swap 3', -1);
  s.save(__dirname, 'push');
}

// 3. Pop (sift down)
{
  const s = new Sketch({
    width: 680, height: 330, seed: 6,
    title: 'Popping from the heap: sift down',
    desc: 'Pop returns 1. The last value 9 moves to the root and sinks 0 to 1 to 3, swapping with the smaller child each time (2, then 5). Result [2, 5, 3, 9, 6, 4, 8], two swaps.',
  });
  rows(s, [
    { note: 'pop returns 1 · 9 moved to root · kids 2, 3; 9 > 2: swap', vals: [9, 2, 3, 5, 6, 4, 8], tones: { 0: 'amber', 1: 'blue' } },
    { note: 'kids 5 (idx 3), 6 (idx 4); 9 > 5: swap', vals: [2, 9, 3, 5, 6, 4, 8], tones: { 1: 'amber', 3: 'blue' } },
    { note: 'idx 3 has no children (7 > 6): done, 2 swaps', noteTone: 'green', vals: [2, 5, 3, 9, 6, 4, 8], tones: { 3: 'green' } },
  ], { x: 16, y: 24, cell: 38, gap: 26 });
  const v = [9, 2, 3, 5, 6, 4, 8];
  s.text(530, 24, 'path 9 sinks', { size: 20, tone: 'soft' });
  const n = tree(s, v, { x0: 400, w: 270, y0: 80, dy: 100, tones: { 0: 'amber', 1: 'blue', 3: 'blue' }, skipEdges: [1, 3] });
  step(s, n[0], n[1], 'swap 1', -1);
  step(s, n[1], n[3], 'swap 2', -1);
  s.save(__dirname, 'pop');
}

// 4. Heapify [8, 6, 7, 2, 5, 1, 3]
{
  const s = new Sketch({
    width: 680, height: 600, seed: 8,
    title: 'Bottom-up heapify of [8, 6, 7, 2, 5, 1, 3]',
    desc: 'Leaves 3..6 are skipped. i = 2 swaps 7 with 1; i = 1 swaps 6 with 2; i = 0 swaps 8 with 1, then 8 with 3. Result [1, 2, 3, 6, 5, 7, 8], four swaps.',
  });
  const x = 300, cell = 42;
  const R = [
    { a: 'start', b: 'leaves 3..6 skipped', vals: [8, 6, 7, 2, 5, 1, 3], tones: {}, dim: [3, 4, 5, 6] },
    { a: 'i = 2', b: '7 vs kids 1, 3 · swap 2 ↔ 5', vals: [8, 6, 1, 2, 5, 7, 3], tones: { 2: 'blue', 5: 'amber' } },
    { a: 'i = 1', b: '6 vs kids 2, 5 · swap 1 ↔ 3', vals: [8, 2, 1, 6, 5, 7, 3], tones: { 1: 'blue', 3: 'amber' } },
    { a: 'i = 0', b: '8 vs kids 2, 1 · swap 0 ↔ 2', vals: [1, 2, 8, 6, 5, 7, 3], tones: { 0: 'blue', 2: 'amber' } },
    { a: '', b: '8 vs kids 7, 3 · swap 2 ↔ 6', vals: [1, 2, 3, 6, 5, 7, 8], tones: { 2: 'blue', 6: 'amber' } },
  ];
  let y = 20;
  R.forEach((r, k) => {
    const arr = s.array(x, y, r.vals, { cell, tones: r.tones, dim: r.dim ?? [], indices: k === 0, size: 21 });
    if (r.a) s.text(20, arr.mid - 11, r.a, { size: 21, anchor: 'start', weight: 700 });
    s.text(20, arr.mid + 13, r.b, { size: 18, anchor: 'start', tone: 'soft' });
    y = arr.bottom + (k === 0 ? 12 : 16);
  });
  // before and after trees
  const top = 420;
  s.text(145, top - 30, 'before', { size: 20, tone: 'soft' });
  tree(s, [8, 6, 7, 2, 5, 1, 3], { x0: 20, w: 250, y0: top, dy: 72, r: 20, idx: false });
  s.arrow(292, top + 72, 378, top + 72, { tone: 'green', label: 'heapify', width: 2 });
  s.text(525, top - 30, 'after', { size: 20, tone: 'soft' });
  tree(s, [1, 2, 3, 6, 5, 7, 8], { x0: 400, w: 250, y0: top, dy: 72, r: 20, idx: false, tones: { 0: 'green' } });
  s.save(__dirname, 'heapify');
}

// 5. Two heaps: add(x) flow
{
  const s = new Sketch({
    width: 620, height: 600, seed: 10,
    title: 'add(x) for the top-quarter cutoff: route, then rebalance',
    desc: 'add(x), n += 1. If high is non-empty and x > high[0], push x to high, else push x to low. target = (n + 3) // 4. Compare len(high) with target: too big moves the min of high to low, too small moves the max of low to high, equal does nothing. The cutoff is high[0].',
  });
  const A = s.box(310, 40, 'add(x),  n += 1');
  const B = s.box(310, 125, 'high non-empty and x > high[0]?', { tone: 'amber' });
  const C = s.box(150, 215, 'push x to high', { tone: 'violet' });
  const D = s.box(470, 215, 'push x to low', { tone: 'blue' });
  const E = s.box(310, 300, 'target = (n + 3) // 4');
  const F = s.box(310, 385, 'len(high) vs target', { tone: 'amber' });
  const G = s.box(120, 470, 'move min of\nhigh to low', { tone: 'blue' });
  const H = s.box(500, 470, 'move max of\nlow to high', { tone: 'violet' });
  const I = s.box(310, 560, 'cutoff = high[0]', { tone: 'green' });
  s.connect(A, B);
  s.arrow(B.left + 40, B.bottom + 3, C.cx, C.top - 6, { label: 'yes', size: 19 });
  s.arrow(B.right - 40, B.bottom + 3, D.cx, D.top - 6, { label: 'no', size: 19, labelOffset: -14 });
  s.arrow(C.cx, C.bottom + 3, E.left + 30, E.top - 6);
  s.arrow(D.cx, D.bottom + 3, E.right - 30, E.top - 6);
  s.connect(E, F);
  s.arrow(F.left + 20, F.bottom + 3, G.cx, G.top - 6, { label: 'too big', size: 19 });
  s.arrow(F.right - 20, F.bottom + 3, H.cx, H.top - 6, { label: 'too small', size: 19, labelOffset: -14 });
  s.arrow(F.cx, F.bottom + 4, I.cx, I.top - 6, { label: 'equal', size: 19, labelOffset: -26 });
  s.arrow(G.cx, G.bottom + 3, I.left - 6, I.cy);
  s.arrow(H.cx, H.bottom + 3, I.right + 6, I.cy);
  s.save(__dirname, 'two-heaps-flow');
}

// 6. Two heaps: state after each add
{
  const s = new Sketch({
    width: 680, height: 500, seed: 12,
    title: 'Two heaps after each score arrives',
    desc: 'Stream 40, 10, 90, 70, 20, 60, 80, 30. Final low = 10, 20, 30, 40, 60, 70 and high = 80, 90, cutoff 80.',
  });
  const cell = 32, B = 392;  // boundary x
  const cols = { add: 34, routed: 88, nt: 150, cut: 500, move: 548 };
  const hy = 26;
  s.text(cols.add, hy, 'add', { size: 18, tone: 'soft' });
  s.text(cols.routed, hy, 'routed', { size: 18, tone: 'soft' });
  s.text(cols.nt, hy, 'n, target', { size: 18, tone: 'soft' });
  s.text(B - 100, hy, 'low (max-heap)', { size: 18, tone: 'blue' });
  s.text(B + 42, hy, 'high (min)', { size: 18, tone: 'violet' });
  s.text(cols.cut, hy, 'cutoff', { size: 18, tone: 'soft' });
  s.text(cols.move, hy, 'move', { size: 18, tone: 'soft', anchor: 'start' });
  // [add, routed, n, target, low (sorted), high (sorted), cutoff, move, moved value]
  const T = [
    [40, 'low', 1, 1, [], [40], 40, '40 low → high', 40],
    [10, 'low', 2, 1, [10], [40], 40, '-', null],
    [90, 'high', 3, 1, [10, 40], [90], 90, '40 high → low', 40],
    [70, 'low', 4, 1, [10, 40, 70], [90], 90, '-', null],
    [20, 'low', 5, 2, [10, 20, 40], [70, 90], 70, '70 low → high', 70],
    [60, 'low', 6, 2, [10, 20, 40, 60], [70, 90], 70, '-', null],
    [80, 'high', 7, 2, [10, 20, 40, 60, 70], [80, 90], 80, '70 high → low', 70],
    [30, 'low', 8, 2, [10, 20, 30, 40, 60, 70], [80, 90], 80, '-', null],
  ];
  const rowH = 50, y0 = 50;
  T.forEach(([x, routed, n, t, low, high, cut, move, mv], k) => {
    const y = y0 + k * rowH, mid = y + cell / 2;
    s.text(cols.add, mid, x, { size: 22, weight: 700 });
    s.text(cols.routed, mid, routed, { size: 19, tone: routed === 'low' ? 'blue' : 'violet' });
    s.text(cols.nt, mid, `${n}, ${t}`, { size: 19, tone: 'soft' });
    const toneOf = arr => { const o = {}; arr.forEach((v, i) => { if (v === mv) o[i] = 'green'; else if (v === x) o[i] = 'amber'; }); return o; };
    if (low.length) s.array(B - 8 - low.length * cell, y, low, { cell, indices: false, size: 19, tones: toneOf(low) });
    s.array(B + 8, y, high, { cell, indices: false, size: 19, tones: toneOf(high) });
    s.text(cols.cut, mid, cut, { size: 22, weight: 700, tone: 'violet' });
    s.text(cols.move, mid, move, { size: 18, anchor: 'start', tone: mv ? 'green' : 'soft' });
  });
  const yEnd = y0 + T.length * rowH;
  s.line(B, 12, B, yEnd - 8, { dashed: true, tone: 'soft', width: 1.5 });
  s.text(B, yEnd + 14, 'max(low) = 70  ≤  min(high) = 80', { size: 20, tone: 'ink' });
  s.text(340, yEnd + 44, 'amber = the score just added · green = the score that crossed the boundary', { size: 17, tone: 'soft' });
  s.save(__dirname, 'two-heaps-trace');
}
