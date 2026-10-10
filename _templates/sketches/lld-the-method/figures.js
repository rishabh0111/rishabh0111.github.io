// Figures for Part 1, The method (Low-Level Design, Question by Question).
//   node _templates/sketches/lld-the-method/figures.js
const { Sketch } = require('../sketch');

// Colour key shared by the clock and the machine-coding bars: blue = requirements,
// violet = entities, green = class design, amber = writing code, cyan = extending
// (or the demo), soft = buffer.

// A hachure-filled ring segment between minute m0 and m1 of a `total`-minute
// clock, from radius ri to r, so the centre stays clear for the label.
function wedge(s, cx, cy, r, ri, m0, m1, total, tone) {
  const a0 = -90 + (m0 / total) * 360, a1 = -90 + (m1 / total) * 360;
  const arc = (rad, from, to, step) => {
    const out = [];
    for (let a = from; step > 0 ? a <= to + 0.01 : a >= to - 0.01; a += step) {
      const t = (a * Math.PI) / 180;
      out.push([cx + rad * Math.cos(t), cy + rad * Math.sin(t)]);
    }
    return out;
  };
  const pts = [...arc(r, a0, a1, 2), ...arc(ri, a1, a0, -2)];
  s._emit(s.gen.polygon(pts, s._opts({ fill: 'hachure', width: 1.4, hachureGap: 7 })), tone);
}
const polar = (cx, cy, r, m, total) => {
  const t = ((-90 + (m / total) * 360) * Math.PI) / 180;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
};

// ── 1. The 35-minute clock ─────────────────────────────────────────────────
{
  const stages = [
    { m0: 0, m1: 5, tone: 'blue', name: 'Requirements', sub: '0–5 min' },
    { m0: 5, m1: 8, tone: 'violet', name: 'Entities', sub: '5–8 min' },
    { m0: 8, m1: 20, tone: 'green', name: 'Class design', sub: '8–20 min' },
    { m0: 20, m1: 30, tone: 'amber', name: 'Implementation', sub: '20–30, ends in a trace' },
    { m0: 30, m1: 35, tone: 'cyan', name: 'Extensibility', sub: '30–35 min' },
  ];
  const W = 680, cx = 340, cy = 262, r = 160, T = 35;
  const s = new Sketch({
    width: W, height: 470, seed: 11,
    title: 'The 35-minute low-level design round as a clock',
    desc: 'Requirements 0 to 5 minutes, entities 5 to 8, class design 8 to 20, implementation 20 to 30 ending in a trace of one scenario, extensibility 30 to 35. Class design and implementation take two thirds of the clock.',
  });
  s.text(20, 24, 'the 35-minute LLD round, clockwise from 0', { size: 22, anchor: 'start', weight: 700 });
  for (const st of stages) wedge(s, cx, cy, r, 58, st.m0, st.m1, T, st.tone);
  s.circle(cx, cy, r * 2, { width: 1.8 });
  for (const st of stages) {
    const [x1, y1] = polar(cx, cy, r, st.m0, T);
    const [x0, y0] = polar(cx, cy, 58, st.m0, T);
    s.line(x0, y0, x1, y1, { width: 1.5 });
    const [tx, ty] = polar(cx, cy, r + 16, st.m0, T);
    s.text(tx, ty, st.m0, { size: 18, tone: 'soft' });
  }
  s.circle(cx, cy, 116, { width: 1.6 });
  // Direct labels outside the rim, at each wedge's middle minute.
  const place = { 2.5: [r + 34, 0], 6.5: [r + 34, 4], 14: [r + 30, 0], 25: [r + 30, 0], 32.5: [r + 34, -6] };
  for (const st of stages) {
    const mid = (st.m0 + st.m1) / 2;
    const [rr, dy] = place[mid];
    const [lx, ly] = polar(cx, cy, rr, mid, T);
    const anchor = lx >= cx ? 'start' : 'end';
    s.text(lx, ly + dy - 12, st.name, { size: 22, anchor, weight: 700, tone: st.tone });
    s.text(lx, ly + dy + 13, st.sub, { size: 19, anchor, tone: 'soft' });
  }
  s.text(cx, cy - 10, '35', { size: 34, weight: 700, tone: 'ink' });
  s.text(cx, cy + 18, 'minutes', { size: 19, tone: 'soft' });
  s.save(__dirname, 'interview-clock');
}

// ── 2. The win check: only lines through the last move ─────────────────────
{
  const cw = 80, x0 = 60, y0 = 84;
  const marks = [['O', '', 'X'], ['O', 'X', ''], ['X', '', '']];
  const s = new Sketch({
    width: 660, height: 380, seed: 12,
    title: 'Tic Tac Toe win check after X plays (2,0)',
    desc: 'Board: row 0 is O, empty, X; row 1 is O, X, empty; row 2 is X, empty, empty. The last move is (2,0). Three lines pass through it and are checked: row 2 (X, empty, empty: no), column 0 (O, O, X: no), and the anti-diagonal (X, X, X: a win). The main diagonal does not pass through (2,0) and is skipped.',
  });
  s.text(20, 24, 'after X plays (2,0): check only the lines through it', { size: 22, anchor: 'start', weight: 700 });
  const g = s.grid(x0, y0, marks, {
    cw, ch: cw, size: 38,
    tones: { '2,0': 'amber' },
    colLabels: ['col 0', 'col 1', 'col 2'], rowLabels: ['row 0', 'row 1', 'row 2'],
  });
  const c = (rr, cc) => [g.cx(cc), g.cy(rr)];
  // main diagonal: does not pass through (2,0), so it is never read
  s.line(...c(0, 0).map((v, i) => v - 26), ...c(2, 2).map((v, i) => v + 26), { tone: 'soft', dashed: true, width: 1.4 });
  // row 2 and column 0: checked, not complete
  s.line(g.x + 8, g.cy(2) + 22, g.right - 8, g.cy(2) + 22, { tone: 'red', width: 2.2 });
  s.line(g.cx(0) - 24, g.y + 8, g.cx(0) - 24, g.bottom - 8, { tone: 'red', width: 2.2 });
  // anti-diagonal: complete
  s.line(g.cx(0) - 30, g.cy(2) + 30, g.cx(2) + 30, g.cy(0) - 30, { tone: 'green', width: 3 });

  const kx = 352;
  const rows = [
    ['amber', 'last move: (2,0)', 'soft'],
    ['red', 'row 2: X . .  no', 'ink'],
    ['red', 'column 0: O O X  no', 'ink'],
    ['green', 'anti-diagonal: X X X  win', 'ink'],
    ['soft', 'main diagonal: skipped,', 'soft'],
  ];
  rows.forEach(([tone, text], i) => {
    const y = 110 + i * 44;
    if (i === 0) s.rect(kx, y - 13, 26, 26, { tone, fill: 'hachure', width: 1.4 });
    else s.line(kx, y, kx + 28, y, { tone, width: tone === 'green' ? 3 : 2.2, dashed: tone === 'soft' });
    s.text(kx + 40, y, text, { size: 21, anchor: 'start', weight: tone === 'green' ? 700 : 500 });
  });
  s.text(kx + 40, 110 + 4 * 44 + 26, '(2,0) is not on it', { size: 21, anchor: 'start', tone: 'soft' });
  s.text(kx, 340, '3 of the 8 lines can count', { size: 20, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'win-check');
}

// ── 3. Whiteboard LLD vs a machine-coding round, on one minute scale ───────
{
  const W = 680, x0 = 40, px = 6.6; // 90 min * 6.6 = 594 px
  const X = m => x0 + m * px;
  const s = new Sketch({
    width: W, height: 440, seed: 13,
    title: 'A 35-minute whiteboard round and a 90-minute machine-coding round on the same minute scale',
    desc: 'Whiteboard: requirements 0 to 5, entities 5 to 8, class design 8 to 20, code 20 to 30, extensibility 30 to 35. Machine coding: requirements and questions 0 to 10, entities and class outline 10 to 20, code the happy path 20 to 50, edge cases and validation 50 to 70, run the demo and make the change they ask for 70 to 85, buffer 85 to 90. Code takes 10 of 35 minutes on the whiteboard and 50 of 90 in machine coding.',
  });
  s.text(20, 24, 'same stages, different clock: where the minutes go', { size: 22, anchor: 'start', weight: 700 });
  const bar = (y, blocks, label) => {
    s.text(x0, y - 20, label, { size: 21, anchor: 'start', weight: 700 });
    for (const [m0, m1, tone, text] of blocks) {
      s.rect(X(m0), y, (m1 - m0) * px, 58, { tone, fill: tone === 'soft' ? undefined : 'hachure', width: 1.5, hachureGap: 7 });
      if (text) s.text(X(m0) + ((m1 - m0) * px) / 2, y + 29, text, { size: 19, weight: 700 });
    }
  };
  bar(88, [[0, 5, 'blue'], [5, 8, 'violet'], [8, 20, 'green', 'design'], [20, 30, 'amber', 'code'], [30, 35, 'cyan']], 'whiteboard LLD: 35 min');
  bar(212, [[0, 10, 'blue', 'reqs'], [10, 20, 'green', 'design'], [20, 50, 'amber', 'happy path'], [50, 70, 'amber', 'edge cases'], [70, 85, 'cyan', 'demo'], [85, 90, 'soft']], 'machine coding: 90 min');
  s.text(X(87.5), 196, 'buffer', { size: 18, tone: 'soft' });
  // minute axis
  s.line(x0, 300, X(90), 300, { tone: 'soft', width: 1.4 });
  for (let m = 0; m <= 90; m += 15) {
    s.line(X(m), 294, X(m), 306, { tone: 'soft', width: 1.4 });
    s.text(X(m), 322, m, { size: 18, tone: 'soft' });
  }
  s.text(X(90), 346, 'minutes', { size: 18, tone: 'soft', anchor: 'end' });
  // key
  const key = [['blue', 'requirements'], ['violet', 'entities'], ['green', 'class design'], ['amber', 'code'], ['cyan', 'extend / demo']];
  let kx = 20;
  key.forEach(([tone, word]) => {
    s.rect(kx, 392 - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(kx + 30, 392, word, { size: 19, anchor: 'start', tone: 'soft' });
    kx += 30 + s.textWidth(word, 19) + 22;
  });
  s.text(20, 424, 'code: 10 of 35 minutes on the whiteboard, 50 of 90 in machine coding', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'machine-coding');
}
