// Figures for Part 13, Greedy (dsa-greedy).
//   node _templates/sketches/dsa-greedy/figures.js
const { Sketch } = require('../sketch');

// ── 1. Kadane's trace on pnl = [3, -5, 4, -1, 2, 6, -9, 5] ─────────────────
{
  const s = new Sketch({
    width: 680, height: 470, seed: 13,
    title: "Kadane's algorithm traced day by day",
    desc: 'For each day 0 to 7: pnl 3 -5 4 -1 2 6 -9 5; cur in 0 3 -2 4 3 5 11 2; action extend on every day except a reset on day 2; lo 0 0 2 2 2 2 2 2; cur out 3 -2 4 3 5 11 2 7; best 3 3 4 4 5 11 11 11; best range 0-0 0-0 2-2 2-2 2-4 2-5 2-5 2-5. The best stretch is days 2 to 5, total 4 - 1 + 2 + 6 = 11.',
  });
  const pnl = [3, -5, 4, -1, 2, 6, -9, 5];
  const curIn = [0, 3, -2, 4, 3, 5, 11, 2];
  const act = ['extend', 'extend', 'reset', 'extend', 'extend', 'extend', 'extend', 'extend'];
  const lo = [0, 0, 2, 2, 2, 2, 2, 2];
  const curOut = [3, -2, 4, 3, 5, 11, 2, 7];
  const best = [3, 3, 4, 4, 5, 11, 11, 11];
  const range = ['0-0', '0-0', '2-2', '2-2', '2-4', '2-5', '2-5', '2-5'];
  const rows = [pnl, curIn, act, lo, curOut, best, range].map(r => r.map(String));
  const tones = {};
  [0, 1].forEach(c => { tones[`0,${c}`] = 'red'; });            // dropped days
  [2, 3, 4, 5].forEach(c => { tones[`0,${c}`] = 'green'; });    // best stretch
  tones['1,2'] = 'amber'; tones['2,2'] = 'amber'; tones['3,2'] = 'amber'; // the reset
  [0, 2, 4, 5].forEach(c => { tones[`5,${c}`] = 'blue'; });     // best improves
  const g = s.grid(104, 50, rows, {
    cw: 70, ch: 46, size: 22, tones,
    rowLabels: ['pnl', 'cur in', 'action', 'lo', 'cur out', 'best', 'range'],
    colLabels: pnl.map((_, i) => `day ${i}`),
  });
  // the stretch that survives the -9 on day 6
  s.span(g.x + 2 * g.cw + 4, g.x + 6 * g.cw - 4, g.bottom + 8, 'best stretch: days 2..5, 4 - 1 + 2 + 6 = 11', { tone: 'green', size: 22 });
  s.text(g.x + 2 * g.cw + g.cw / 2, g.bottom + 88, 'cur in = -2 < 0: drop days 0-1', { size: 20, tone: 'amber', anchor: 'middle' });
  s.text(g.x + 6.5 * g.cw, g.bottom + 88, 'cur in = 2 >= 0: keep going', { size: 20, tone: 'soft', anchor: 'middle' });
  s.save(__dirname, 'kadane-trace');
}

// ── 2. Exchange argument on the jobs [4, 1, 3, 2] ──────────────────────────
{
  const s = new Sketch({
    width: 680, height: 460, seed: 7,
    title: 'Exchange argument: swapping toward shortest-first',
    desc: 'Timeline 0 to 10 minutes. Given order 4,1,3,2: starts 0,4,5,8, total 17. After swapping the first pair, order 1,4,3,2: starts 0,1,5,8, total 14, a change of 1 - 4 = -3. Sorted order 1,2,3,4: starts 0,1,3,6, total 10, the brute-force minimum.',
  });
  const X0 = 110, U = 50;                // minute 0 at X0, 44 px per minute
  const toneOf = { 1: 'blue', 2: 'violet', 3: 'cyan', 4: 'amber' };
  // time axis
  s.line(X0, 44, X0 + 10 * U, 44, { tone: 'soft', width: 1.3 });
  for (let m = 0; m <= 10; m++) {
    s.line(X0 + m * U, 38, X0 + m * U, 50, { tone: 'soft', width: 1.2 });
    s.text(X0 + m * U, 24, m, { size: 17, tone: 'soft' });
  }
  s.text(X0 - 14, 24, 'minute', { size: 18, tone: 'soft', anchor: 'end' });
  const rowsSpec = [
    { name: 'given', order: [4, 1, 3, 2], note: 'starts 0, 4, 5, 8  ·  total 17' },
    { name: 'swap 1st', order: [1, 4, 3, 2], note: 'starts 0, 1, 5, 8  ·  total 14  (1 - 4 = -3)', swapped: true },
    { name: 'sorted', order: [1, 2, 3, 4], note: 'starts 0, 1, 3, 6  ·  total 10  = brute-force minimum', done: true },
  ];
  rowsSpec.forEach((r, k) => {
    const y = 76 + [0, 120, 272][k];
    s.text(X0 - 14, y + 22, r.name, { size: 21, anchor: 'end', tone: r.done ? 'green' : 'ink', weight: 700 });
    let t = 0;
    r.order.forEach(d => {
      s.rect(X0 + t * U + 2, y, d * U - 4, 44, { tone: toneOf[d], fill: 'hachure', label: `${d} min`, size: 18 });
      t += d;
    });
    if (r.swapped) s.span(X0 + 2, X0 + 5 * U - 2, y + 50, 'the swapped pair still spans minutes 0-5', { tone: 'soft', size: 19, depth: 7 });
    s.text(X0, y + (r.swapped ? 108 : 66), r.note, { size: 21, anchor: 'start', tone: r.done ? 'green' : 'ink' });
  });
  s.save(__dirname, 'exchange-jobs');
}

// ── 3. The workflow for trusting a greedy rule ──────────────────────────────
{
  const s = new Sketch({
    width: 680, height: 560, seed: 21,
    title: 'Workflow: from a greedy rule to a proof',
    desc: 'Write the rule (which choice, in what order), then compare with brute force on every small input. If a counterexample is found, the rule is wrong: change the key, or use DP or backtracking. If none is found, pick an argument shape: exchange (move any optimal answer toward greedy, never worse), stays ahead (greedy progress is at least as good after every step), or running balance (one number certifies the prefix and kills blocks of candidates).',
  });
  const A = s.box(340, 50, 'Write the rule:\nwhich choice, in what order', { size: 21 });
  const B = s.box(340, 160, 'Compare with brute force\non every small input', { size: 21 });
  const C = s.box(150, 290, 'Rule is wrong: change the key,\nor use DP / backtracking', { tone: 'red', size: 19 });
  const D = s.box(510, 290, 'Pick an argument\nshape', { tone: 'amber', size: 21 });
  const E = s.box(115, 470, 'Exchange:\nmove any optimal\nanswer toward greedy,\nnever worse', { tone: 'green', size: 18, w: 200 });
  const F = s.box(340, 470, 'Stays ahead:\ngreedy\'s progress is\nat least as good\nafter every step', { tone: 'green', size: 18, w: 200 });
  const G = s.box(565, 470, 'Running balance:\none number certifies\nthe prefix and kills\nblocks of candidates', { tone: 'green', size: 18, w: 200 });
  s.connect(A, B);
  s.arrow(B.cx - 60, B.bottom + 4, C.cx + 30, C.top - 6, { tone: 'red' });
  s.text(B.cx - 110, B.bottom + 22, 'counterexample found', { size: 19, tone: 'red', anchor: 'end' });
  s.arrow(B.cx + 60, B.bottom + 4, D.cx - 30, D.top - 6, { tone: 'ink' });
  s.text(B.cx + 118, B.bottom + 22, 'no counterexample', { size: 19, tone: 'ink', anchor: 'start' });
  s.arrow(D.cx - 40, D.bottom + 4, E.cx + 20, E.top - 6, { tone: 'green' });
  s.arrow(D.cx - 20, D.bottom + 4, F.cx + 20, F.top - 6, { tone: 'green' });
  s.arrow(D.cx + 20, D.bottom + 4, G.cx, G.top - 6, { tone: 'green' });
  s.save(__dirname, 'greedy-workflow');
}
