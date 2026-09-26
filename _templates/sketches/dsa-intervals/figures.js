const { Sketch } = require('../sketch');

// 1. The studio day: seven half-open bookings on an 8-to-20 axis, with the live count
//    per one-hour slot and the busy / free rows underneath.
{
  const s = new Sketch({
    width: 680, height: 470, seed: 12,
    title: 'Seven studio bookings on a timeline from 8 to 20',
    desc: 'A (9,13), B (10,11), C (12,13), D (12,14), E (15,17), F (16,17), G (17,18) as half-open bars. Live count per hour slot from 8: 0 1 2 1 3 1 0 1 2 1 0 0. Busy blocks [9,14) and [15,18); free gaps (8,9), (14,15), (18,20).',
  });
  const X0 = 140, PX = 41.5;
  const X = h => X0 + (h - 8) * PX;
  // axis with tick labels
  const AY = 46;
  s.line(X(8) - 6, AY, X(20) + 6, AY, { tone: 'ink', width: 1.6 });
  for (let h = 8; h <= 20; h++) {
    s.line(X(h), AY - 6, X(h), AY + 6, { tone: 'ink', width: 1.4 });
    s.text(X(h), AY - 22, h, { size: 19, tone: 'soft' });
  }
  // the handover instant at 17
  s.line(X(17), AY + 10, X(17), 322, { tone: 'red', dashed: true, width: 1.4 });
  const bookings = [
    ['A', 9, 13, 'blue'], ['B', 10, 11, 'amber'], ['C', 12, 13, 'blue'], ['D', 12, 14, 'blue'],
    ['E', 15, 17, 'blue'], ['F', 16, 17, 'blue'], ['G', 17, 18, 'blue'],
  ];
  bookings.forEach(([name, a, b, t], i) => {
    const cy = 82 + i * 34;
    s.text(X0 - 18, cy, `${name} (${a}, ${b})`, { size: 20, anchor: 'end' });
    s.rect(X(a) + 2, cy - 11, X(b) - X(a) - 4, 22, { tone: t, fill: 'hachure', width: 1.5 });
  });
  // live count per slot [h, h+1)
  const live = [0, 1, 2, 1, 3, 1, 0, 1, 2, 1, 0, 0];
  const LY = 346;
  s.text(X0 - 18, LY, 'live', { size: 20, anchor: 'end', tone: 'soft' });
  live.forEach((n, k) => s.text(X(8 + k) + PX / 2, LY, n, { size: 22, weight: 700, tone: n === 0 ? 'soft' : 'ink' }));
  // busy blocks and free gaps
  const BY = 390, FY = 432;
  s.text(X0 - 18, BY, 'busy', { size: 20, anchor: 'end', tone: 'green' });
  [[9, 14], [15, 18]].forEach(([a, b]) => s.rect(X(a) + 2, BY - 12, X(b) - X(a) - 4, 24, { tone: 'green', fill: 'hachure', width: 1.5 }));
  s.text(X0 - 18, FY, 'free', { size: 20, anchor: 'end', tone: 'soft' });
  [[8, 9], [14, 15], [18, 20]].forEach(([a, b]) => s.rect(X(a) + 2, FY - 12, X(b) - X(a) - 4, 24, { tone: 'soft', fill: 'dots', width: 1.4, dashed: true }));
  s.save(__dirname, 'studio-timeline');
}

// 2. Choosing the sweep: the decision flow from the Integration section.
{
  const s = new Sketch({
    width: 680, height: 500, seed: 7,
    title: 'Which interval sweep to use',
    desc: 'List of (start, end) pairs, then fix the convention, then sort by start unless already sorted, then ask what is asked: coverage leads to the merge sweep, count at each instant to the event sweep, what is live at each arrival to a min-heap of ends, which to keep or drop to greedy.',
  });
  const a = s.box(300, 36, 'list of (start, end) pairs', { size: 20 });
  const b = s.box(300, 110, 'convention: half-open or closed?', { size: 20 });
  const c = s.box(300, 184, 'already sorted?', { size: 20 });
  const d = s.box(560, 184, 'sort by start', { size: 20, tone: 'cyan' });
  const e = s.box(300, 268, 'what is asked?', { size: 20, w: 200 });
  s.connect(a, b); s.connect(b, c);
  s.connect(c, d, { label: 'no', labelOffset: 14 });
  s.connect(c, e, { label: 'yes', labelOffset: 24 });
  s.arrow(d.cx, d.bottom + 4, e.right + 6, e.cy, { bend: -40 });
  const cols = [88, 256, 424, 592];
  const qs = ['busy / free /\nmerged coverage', 'how many at\neach instant', 'what is live when\neach one starts', 'which intervals\nto keep or drop'];
  const leaves = [
    ['merge sweep:\nkeep max end', 'green'],
    ['event sweep:\n+1 / -1, ties\nby convention', 'blue'],
    ['min-heap of\nend times', 'violet'],
    ['greedy: justify\nthe sort key first', 'amber'],
  ];
  cols.forEach((x, i) => {
    s.arrow(e.cx - 75 + i * 50, e.bottom + 4, x, 322, { tone: 'ink' });
    qs[i].split('\n').forEach((l, k) => s.text(x, 340 + k * 19, l, { size: 17, tone: 'soft' }));
    s.box(x, 432, leaves[i][0], { size: 19, w: 156, h: 88, tone: leaves[i][1] });
  });
  s.save(__dirname, 'which-sweep');
}
