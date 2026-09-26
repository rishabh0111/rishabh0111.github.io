// Figures for Part 19, Math & Geometry.
// node _templates/sketches/dsa-math-and-geometry/figures.js
const { Sketch } = require('../sketch');

// ── Part A: flat indices, 180° partners, rings ───────────────────────────
{
  const s = new Sketch({ width: 620, height: 380, title: 'Rotating a 3 by 4 matrix by 180 degrees in place', desc: 'Values 1 to 12, their flat indices, each index partner 11 minus i, ring labels, and the rotated result.', seed: 11 });
  const vals = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
  const flat = vals.map((row, r) => row.map((_, c) => r * 4 + c));
  const partner = flat.map(row => row.map(i => 11 - i));
  const ring = vals.map((row, r) => row.map((_, c) => Math.min(r, c, 2 - r, 3 - c)));
  const after = [[12, 11, 10, 9], [8, 7, 6, 5], [4, 3, 2, 1]];
  const loopTones = {};
  flat.forEach((row, r) => row.forEach((i, c) => { loopTones[`${r},${c}`] = i < 6 ? 'blue' : 'amber'; }));
  const ringTones = { '1,1': 'green', '1,2': 'green' };
  const opt = { cw: 42, ch: 38, size: 21 };
  const xs = [30, 225, 420];
  const g = (x, y, rows, title, extra = {}) => {
    s.text(x + 84, y - 22, title, { size: 21, tone: 'soft' });
    return s.grid(x, y, rows.map(r => r.map(String)), { ...opt, ...extra });
  };
  g(xs[0], 48, vals, 'values');
  g(xs[1], 48, flat, 'flat index i', { tones: loopTones });
  g(xs[2], 48, partner, 'partner 11 - i', { tones: loopTones });
  g(xs[0], 222, ring, 'ring k', { tones: ringTones });
  g(xs[1], 222, after, 'after rotate 180°');
  s.text(xs[2] - 4, 240, 'blue: i = 0..5,', { size: 20, tone: 'blue', anchor: 'start' });
  s.text(xs[2] - 4, 266, 'the swap loop visits these', { size: 20, tone: 'blue', anchor: 'start' });
  s.text(xs[2] - 4, 300, 'amber: i = 6..11,', { size: 20, tone: 'amber', anchor: 'start' });
  s.text(xs[2] - 4, 326, 'reached only as partners', { size: 20, tone: 'amber', anchor: 'start' });
  s.text(310, 364, 'green ring 1 is a single row: (1,1) and (1,2)', { size: 20, tone: 'green' });
  s.save(__dirname, 'rotate-180-map');
}

// ── Part A: dilation with markers vs naive ───────────────────────────────
{
  const s = new Sketch({ width: 600, height: 230, title: 'Dilating a 0/1 grid: markers versus naive in-place writes', desc: 'Before, the correct result using bit markers, and the naive result where written 1s leak.', seed: 12 });
  const before = [[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1]];
  const good = [[0, 1, 0, 0], [1, 1, 1, 1], [0, 1, 1, 1]];
  const naive = [[0, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]];
  const orig = { '1,1': 'blue', '2,3': 'blue' };
  const grown = { ...orig };
  good.forEach((row, r) => row.forEach((v, c) => { if (v && !before[r][c]) grown[`${r},${c}`] = 'green'; }));
  const leak = { ...grown };
  naive.forEach((row, r) => row.forEach((v, c) => { if (v && !good[r][c]) leak[`${r},${c}`] = 'red'; }));
  const opt = { cw: 40, ch: 40, size: 22 };
  const xs = [30, 220, 410];
  const titles = ['before', 'with markers', 'naive'];
  [[before, orig], [good, grown], [naive, leak]].forEach(([rows, tones], k) => {
    s.text(xs[k] + 80, 26, titles[k], { size: 22, tone: 'soft' });
    s.grid(xs[k], 50, rows.map(r => r.map(String)), { ...opt, tones });
  });
  s.arrow(xs[0] + 170, 110, xs[1] - 12, 110, { tone: 'soft' });
  s.arrow(xs[1] + 170, 110, xs[2] - 12, 110, { tone: 'soft', dashed: true });
  s.text(110, 200, 'blue: 1 before', { size: 20, tone: 'blue' });
  s.text(300, 200, 'green: correctly turned on', { size: 20, tone: 'green' });
  s.text(490, 200, 'red: leaked', { size: 20, tone: 'red' });
  s.save(__dirname, 'dilate-markers');
}

// ── Part B: column addition with carry ───────────────────────────────────
{
  const s = new Sketch({ width: 600, height: 330, title: 'Adding 987 and 2345 column by column', desc: 'Digits aligned at the ones place, carries of 1 into tens, hundreds and thousands, sum 3332.', seed: 13 });
  const x0 = 110, cell = 50;
  s.text(x0 - 14, 36, 'carry', { size: 20, tone: 'amber', anchor: 'end' });
  [0, 1, 2].forEach(c => s.text(x0 + c * cell + cell / 2, 36, '1', { size: 24, tone: 'amber', weight: 700 }));
  const a = s.array(x0 + cell, 60, [9, 8, 7], { cell, tones: { 2: 'blue' }, label: 'a' });
  const b = s.array(x0, 150, [2, 3, 4, 5], { cell, tones: { 3: 'amber' }, label: '+ b' });
  s.line(x0 - 10, 244, x0 + 4 * cell + 10, 244, { width: 2 });
  s.array(x0, 256, [3, 3, 3, 2], { cell, tones: { 0: 'green', 1: 'green', 2: 'green', 3: 'green' }, indices: false, label: 'sum' });
  s.text(x0 + 4 * cell + 26, a.mid, 'i starts at 2, moves left', { size: 21, tone: 'blue', anchor: 'start' });
  s.text(x0 + 4 * cell + 26, b.mid, 'j starts at 3, moves left', { size: 21, tone: 'amber', anchor: 'start' });
  s.text(x0 + 4 * cell + 26, 281, '987 + 2345 = 3332', { size: 21, tone: 'green', anchor: 'start' });
  s.save(__dirname, 'carry-addition');
}

// ── Part C: exponent bits ────────────────────────────────────────────────
{
  const s = new Sketch({ width: 600, height: 310, title: 'Exponentiation by squaring: 3 to the 13 from the bits of 13', desc: '13 is 1101 in binary; bits 0, 2 and 3 multiply 3, 3 to the 4 and 3 to the 8 into the result.', seed: 14 });
  const x0 = 190, cell = 62;
  s.arrow(x0 + 4 * cell, 44, x0, 44, { tone: 'soft', label: 'one bit per iteration, right to left', size: 19, labelOffset: 16 });
  const bits = [1, 1, 0, 1];
  const a = s.array(x0, 90, bits, { cell, height: 54, indices: false, tones: { 0: 'green', 1: 'green', 3: 'green' }, dim: [2], label: 'exp = 13' });
  const pw = ['3⁸', '3⁴', '3²', '3¹'];
  bits.forEach((bit, k) => {
    s.text(a.cx(k), 72, `bit ${3 - k}`, { size: 18, tone: 'soft' });
    s.text(a.cx(k), 166, pw[k], { size: 24, tone: bit ? 'green' : 'soft', weight: 700 });
    s.text(a.cx(k), 194, bit ? 'multiply' : 'skip', { size: 19, tone: bit ? 'green' : 'soft' });
  });
  s.text(300, 240, 'base squares each step:  3¹ → 3² → 3⁴ → 3⁸', { size: 22 });
  s.text(300, 278, '3¹³ = 3⁸ · 3⁴ · 3¹   (3 multiplies into result, 4 squarings)', { size: 21, tone: 'green' });
  s.save(__dirname, 'pow-bits');
}

// ── Part D: the sequence, the rho, Floyd ────────────────────────────────
{
  const s = new Sketch({ width: 600, height: 210, title: 'Sum of cubes of digits, starting from 4', desc: 'x0 to x9: 4, 64, 280, 520, 133, 55, 250, 133, 55, 250. Tail length 4, cycle length 3.', seed: 15 });
  const xs = [4, 64, 280, 520, 133, 55, 250, 133, 55, 250];
  const tones = {};
  xs.forEach((_, i) => { tones[`1,${i}`] = i < 4 ? 'blue' : (i < 7 ? 'green' : 'amber'); });
  const g = s.grid(80, 30, [xs.map((_, i) => String(i)), xs.map(String)], { cw: 51, ch: 44, size: 21, tones, rowLabels: ['i', 'x[i]'] });
  s.span(g.cx(0) - 22, g.cx(3) + 22, g.bottom + 8, 'tail, μ = 4', { tone: 'blue' });
  s.span(g.cx(4) - 22, g.cx(6) + 22, g.bottom + 8, 'cycle, λ = 3', { tone: 'green' });
  s.span(g.cx(7) - 22, g.cx(9) + 22, g.bottom + 8, 'repeats', { tone: 'amber' });
  s.save(__dirname, 'cube-sequence');
}
{
  const s = new Sketch({ width: 620, height: 250, title: 'The rho shape of the sequence from 4', desc: 'Tail 4, 64, 280, 520 leads into the cycle 133, 55, 250, back to 133.', seed: 16 });
  const y = 125, r = 27;
  const tail = [4, 64, 280, 520].map((v, i) => s.node(50 + i * 95, y, v, { r, tone: 'blue', size: 21 }));
  const start = s.node(450, y, 133, { r, tone: 'green', size: 21 });
  const n55 = s.node(565, 55, 55, { r, tone: 'green', size: 21 });
  const n250 = s.node(565, 195, 250, { r, tone: 'green', size: 21 });
  [...tail, start].reduce((p, q) => { s.edge(p, q, { directed: true }); return q; });
  s.edge(start, n55, { directed: true });
  s.edge(n55, n250, { directed: true, bend: -18 });
  s.edge(n250, start, { directed: true });
  tail.forEach((n, i) => s.text(n.cx, y + 44, `i=${i}`, { size: 18, tone: 'soft' }));
  s.text(start.cx - 10, y + 48, 'i=4, cycle start', { size: 18, tone: 'green' });
  s.text(200, 50, 'tail, μ = 4', { size: 22, tone: 'blue' });
  s.text(520, 125, 'λ = 3', { size: 21, tone: 'green', anchor: 'start' });
  s.save(__dirname, 'rho');
}
{
  const s = new Sketch({ width: 500, height: 370, title: 'Floyd tortoise and hare on the sequence from 4', desc: 'Phase 1 meets at t = 6 on 250. Phase 2 meets after 4 steps on 133, so mu is 4.', seed: 17 });
  const opt = { cw: 56, ch: 40, size: 21 };
  s.text(250, 18, 'phase 1: slow = x[t], fast = x[2t]', { size: 21, tone: 'soft' });
  const p1 = [['1', '2', '3', '4', '5', '6'], ['64', '280', '520', '133', '55', '250'], ['280', '133', '250', '55', '133', '250']];
  s.grid(90, 40, p1, { ...opt, tones: { '1,5': 'green', '2,5': 'green' }, rowLabels: ['t', 'slow', 'fast'] });
  s.text(90 + 6 * 56 + 14, 120, 'meet', { size: 20, tone: 'green', anchor: 'start' });
  s.text(250, 196, 'phase 2: slow from x[0], fast from x[6], one step each', { size: 21, tone: 'soft' });
  const p2 = [['0', '1', '2', '3', '4'], ['4', '64', '280', '520', '133'], ['250', '133', '55', '250', '133']];
  s.grid(90, 218, p2, { ...opt, tones: { '1,4': 'green', '2,4': 'green' }, rowLabels: ['step', 'slow', 'fast'] });
  s.text(90 + 5 * 56 + 14, 278, 'meet: μ = 4', { size: 20, tone: 'green', anchor: 'start' });
  s.save(__dirname, 'floyd-trace');
}

// ── Part E: points on a grid ─────────────────────────────────────────────
{
  const s = new Sketch({ width: 640, height: 380, title: 'Counting right triangles with the right angle at Q = (1, 1)', desc: 'Stored points (1,1), (1,4) twice, (5,1), (3,1), (1,7), (3,3). Three choices up the column x = 1, two along the row y = 1.', seed: 18 });
  const px = x => 70 + x * 58, py = y => 330 - y * 40;
  s.line(px(0) - 10, py(0), px(5) + 30, py(0), { tone: 'soft' });
  s.line(px(0), py(0) + 10, px(0), py(7) - 25, { tone: 'soft' });
  for (let x = 0; x <= 5; x++) s.text(px(x), py(0) + 22, x, { size: 18, tone: 'soft' });
  for (let y = 1; y <= 7; y++) s.text(px(0) - 18, py(y), y, { size: 18, tone: 'soft' });
  s.text(px(5) + 42, py(0), 'x', { size: 20, tone: 'soft' });
  s.text(px(0), py(7) - 38, 'y', { size: 20, tone: 'soft' });
  s.line(px(1), py(1) - 18, px(1), py(7) + 18, { tone: 'amber', dashed: true, width: 2 });
  s.line(px(1) + 18, py(1), px(5) - 18, py(1), { tone: 'violet', dashed: true, width: 2 });
  const r = 16;
  s.node(px(1), py(1), 'Q', { r, tone: 'blue', size: 20 });
  s.node(px(1), py(4), '×2', { r, tone: 'amber', size: 18 });
  s.node(px(1), py(7), '', { r, tone: 'amber' });
  s.node(px(3), py(1), '', { r, tone: 'violet' });
  s.node(px(5), py(1), '', { r, tone: 'violet' });
  s.node(px(3), py(3), '', { r, tone: 'soft' });
  const tx = 420;
  s.text(tx, 70, 'Q = (1,1), stored once', { size: 21, tone: 'blue', anchor: 'start' });
  s.text(tx, 115, 'column x = 1 above Q:', { size: 21, tone: 'amber', anchor: 'start' });
  s.text(tx, 142, '(1,4) ×2, (1,7) → 3', { size: 21, tone: 'amber', anchor: 'start' });
  s.text(tx, 187, 'row y = 1 right of Q:', { size: 21, tone: 'violet', anchor: 'start' });
  s.text(tx, 214, '(3,1), (5,1) → 2', { size: 21, tone: 'violet', anchor: 'start' });
  s.text(tx, 262, 'triangles = 3 × 2 = 6', { size: 23, weight: 700, anchor: 'start' });
  s.text(tx, 300, '(3,3) is on neither line', { size: 19, tone: 'soft', anchor: 'start' });
  s.save(__dirname, 'points-triangles');
}
