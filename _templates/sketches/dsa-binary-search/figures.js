// Figures for Part 5, Binary Search.
//   node _templates/sketches/dsa-binary-search/figures.js
const { Sketch } = require('../sketch');

// Colour key used throughout: red = ruled out (too small / predicate false),
// green = known to satisfy the question (>= target / predicate true),
// violet = mid (the cell being checked), blue = lo, amber = hi, soft = the "none" slot.

// Draw marker labels (lo / mid / hi) stacked under the cells of an array row.
function markers(s, a, marks, y0) {
  const byIdx = {};
  for (const [i, label, tone] of marks) (byIdx[i] = byIdx[i] || []).push([label, tone]);
  for (const i of Object.keys(byIdx)) {
    byIdx[i].forEach(([label, tone], k) => s.text(a.cx(+i), y0 + 14 + k * 22, label, { size: 21, tone, weight: 700 }));
  }
}

// ── 1. Lower bound trace on nums = [1, 3, 5, 5, 8, 12, 15], target = 5 ──────
{
  const s = new Sketch({
    width: 560, height: 600, seed: 11,
    title: 'Lower bound trace for target 5 on [1, 3, 5, 5, 8, 12, 15]',
    desc: 'Step 1: lo 0, mid 3, hi 7; nums[3]=5 >= 5 so hi = 3. Step 2: lo 0, mid 1, hi 3; nums[1]=3 < 5 so lo = 2. ' +
      'Step 3: lo 2, mid 2, hi 3; nums[2]=5 >= 5 so hi = 2. Done: lo = hi = 2; indices 0..1 hold values below 5, indices 2..6 hold values at least 5.',
  });
  const vals = [1, 3, 5, 5, 8, 12, 15, 'end'];
  const X = 90, C = 52;
  // index header
  s.text(X - 14, 28, 'index', { size: 18, tone: 'soft', anchor: 'end' });
  vals.forEach((_, i) => s.text(X + i * C + C / 2, 28, i, { size: 19, tone: 'soft' }));

  const rows = [
    { name: 'step 1', note: 'nums[3] = 5 ≥ 5  →  hi = 3', red: [], green: [], mid: 3, marks: [[0, 'lo', 'blue'], [3, 'mid', 'violet'], [7, 'hi', 'amber']] },
    { name: 'step 2', note: 'nums[1] = 3 < 5  →  lo = 2', red: [], green: [3, 4, 5, 6], mid: 1, marks: [[0, 'lo', 'blue'], [1, 'mid', 'violet'], [3, 'hi', 'amber']] },
    { name: 'step 3', note: 'nums[2] = 5 ≥ 5  →  hi = 2', red: [0, 1], green: [3, 4, 5, 6], mid: 2, marks: [[2, 'lo', 'blue'], [2, 'mid', 'violet'], [3, 'hi', 'amber']] },
    { name: 'done', note: 'lo = hi = 2  →  answer 2', red: [0, 1], green: [2, 3, 4, 5, 6], mid: null, marks: [] },
  ];
  let y = 62;
  rows.forEach((r, k) => {
    s.text(X - 14, y + 12, r.name, { size: 21, anchor: 'end', tone: 'ink', weight: 700 });
    s.text(X, y + 12, r.note, { size: 21, anchor: 'start', tone: 'ink' });
    const tones = {};
    r.red.forEach(i => { tones[i] = 'red'; });
    r.green.forEach(i => { tones[i] = 'green'; });
    if (r.mid !== null) tones[r.mid] = 'violet';
    const a = s.array(X, y + 32, vals, { cell: C, height: 46, indices: false, tones, dim: [7], size: 22 });
    markers(s, a, r.marks, a.top + a.height);
    if (k === 3) {
      // the wall between "too small" and "big enough"
      const wx = a.left(2);
      s.line(wx, a.top - 10, wx, a.top + a.height + 2, { tone: 'ink', width: 3.2 });
      s.text(a.cx(2) + 12, a.top + a.height + 16, 'lo = hi', { size: 21, tone: 'blue', weight: 700 });
      s.text((a.left(0) + a.right(1)) / 2, a.top + a.height + 48, 'nums < 5', { size: 20, tone: 'red', weight: 700 });
      s.text((a.left(2) + a.right(6)) / 2 + 20, a.top + a.height + 48, 'nums ≥ 5', { size: 20, tone: 'green', weight: 700 });
    }
    y += 132;
  });
  s.save(__dirname, 'lower-bound-trace');
}

// ── 2. The predicate row for isqrt(40): x*x > 40, and the probe order ────────
{
  const s = new Sketch({
    width: 660, height: 300, seed: 23,
    title: 'Predicate x*x > 40 over x = 0..41',
    desc: 'False for x = 0..6, true for x = 7 and above (shown up to 10, then 20 and 41). The answer is 6, the first true is 7. ' +
      'Probes in order: 20 (T), 10 (T), 5 (F), 8 (T), 7 (T), 6 (F).',
  });
  // x = 0..10 as a row of cells, then "…", 20, "…", 41 (the rest of the range, all true)
  const X = 96, C = 36, Y = 120, H = 42;
  const cols = [];
  for (let x = 0; x <= 10; x++) cols.push({ x: String(x), v: x * x > 40 ? 'T' : 'F', px: X + x * C });
  const after = X + 11 * C;
  cols.push({ x: '20', v: 'T', px: after + 30 });
  cols.push({ x: '41', v: 'T', px: after + 30 + C + 30 });
  const cx = i => cols[i].px + C / 2;
  s.text(X - 10, Y - 26, 'x', { size: 21, tone: 'soft', anchor: 'end' });
  s.text(X - 10, Y + H / 2, 'x*x > 40', { size: 18, tone: 'soft', anchor: 'end' });
  cols.forEach(c => {
    s.text(c.px + C / 2, Y - 26, c.x, { size: 19, tone: 'soft' });
    s.rect(c.px, Y, C, H, { tone: c.v === 'T' ? 'green' : 'red', fill: 'hachure', width: 1.6 });
    s.text(c.px + C / 2, Y + H / 2 + 1, c.v, { size: 21, weight: 600 });
  });
  s.text(after + 15, Y + H / 2, '…', { size: 22, tone: 'soft' });
  s.text(after + 30 + C + 15, Y + H / 2, '…', { size: 22, tone: 'soft' });
  // probe order: numbered circles above the probed cells (x = 20, 10, 5, 8, 7, 6)
  [11, 10, 5, 8, 7, 6].forEach((ci, k) => s.node(cx(ci), Y - 62, k + 1, { r: 13, tone: 'violet', size: 18 }));
  s.text(X - 10, Y - 62, 'probe', { size: 18, tone: 'violet', anchor: 'end' });
  // answer (last false) and first true, pointed at from either side
  const b = Y + H;
  s.arrow(cx(6) - 56, b + 52, cx(6) - 2, b + 6, { tone: 'amber', width: 1.8, headLen: 10 });
  s.text(cx(6) - 60, b + 62, 'answer = 6', { size: 21, tone: 'amber', weight: 700, anchor: 'end' });
  s.arrow(cx(7) + 56, b + 52, cx(7) + 2, b + 6, { tone: 'green', width: 1.8, headLen: 10 });
  s.text(cx(7) + 60, b + 62, 'first true = 7', { size: 21, tone: 'green', weight: 700, anchor: 'start' });
  s.text(330, 272, 'probes: 20 (T) → 10 (T) → 5 (F) → 8 (T) → 7 (T) → 6 (F)', { size: 21, tone: 'violet' });
  s.save(__dirname, 'isqrt-predicate');
}

// ── 3. isqrt(40): the candidate range after step 3 and after step 6 ──────────
{
  const s = new Sketch({
    width: 600, height: 390, seed: 37,
    title: 'Candidates for isqrt(40) after step 3 and after step 6',
    desc: 'After step 3: x = 0..5 known false, candidates 6..9 unknown, hi = 10 known true, lo = 6. ' +
      'After step 6: x = 0..6 false, 7..10 true, lo = hi = 7.',
  });
  const X = 60, C = 46;
  const xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  function row(y, title, vals, tones, marks, wallAt) {
    s.text(X, y, title, { size: 21, anchor: 'start', tone: 'ink', weight: 700 });
    s.text(X - 10, y + 36, 'x', { size: 19, tone: 'soft', anchor: 'end' });
    xs.forEach((v, i) => s.text(X + i * C + C / 2, y + 36, v, { size: 18, tone: 'soft' }));
    const a = s.array(X, y + 54, vals, { cell: C, height: 44, indices: false, tones, size: 22 });
    if (wallAt !== undefined) {
      const wx = a.left(wallAt);
      s.line(wx, a.top - 10, wx, a.top + a.height + 10, { tone: 'ink', width: 3.2 });
    }
    marks.forEach(([i, label, tone]) => s.pointer(a.cx(i), a.top + a.height + 2, label, { tone, len: 28 }));
    return a;
  }
  const t1 = {}; [0, 1, 2, 3, 4, 5].forEach(i => { t1[i] = 'red'; }); t1[10] = 'green';
  row(24, 'after step 3: candidates 6..9, hi = 10 known true',
    ['F', 'F', 'F', 'F', 'F', 'F', '?', '?', '?', '?', 'T'], t1, [[6, 'lo', 'blue'], [10, 'hi', 'amber']]);
  const t2 = {}; [0, 1, 2, 3, 4, 5, 6].forEach(i => { t2[i] = 'red'; }); [7, 8, 9, 10].forEach(i => { t2[i] = 'green'; });
  row(214, 'after step 6: no candidates left, lo = hi = 7',
    ['F', 'F', 'F', 'F', 'F', 'F', 'F', 'T', 'T', 'T', 'T'], t2, [[7, 'lo = hi', 'blue']], 7);
  s.save(__dirname, 'isqrt-candidates');
}
