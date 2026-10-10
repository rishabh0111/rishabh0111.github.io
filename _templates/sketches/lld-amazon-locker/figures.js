// Figures for Part 8, Amazon Locker.
//   node _templates/sketches/lld-amazon-locker/figures.js
const { Sketch } = require('../sketch');

// Colour key used throughout: green = the smallest size that fits (or a code that works),
// amber = upgraded one size up (or overdue but not yet noticed), red = refused.

function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. Best fit and the upgrade cascade ─────────────────────────────────────
{
  const s = new Sketch({ width: 640, height: 520, title: 'Best-fit allocation filling a four-compartment locker', desc: 'Compartments S1 and S2 are small, M1 medium, L1 large. P1 and P2 are small and take S1 and S2. P3 is small but both smalls are taken, so it goes one size up into M1. P4 is medium, M1 is taken, so it goes into L1. P5 is 70 cm long, longer than any compartment, and is refused. P6 is small but nothing is free, so it is refused.', seed: 81 });
  s.text(20, 24, 'deposits in order P1 .. P6, smallest free size that fits', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['green', 'smallest size that fits'], ['amber', 'one size up'], ['red', 'refused']]);

  // the wall; each amber box says why it was chosen, so no arrow has to cross another box
  s.rect(30, 92, 580, 312, { tone: 'soft', width: 2 });
  const S1 = s.rect(46, 108, 250, 84, { tone: 'green', fill: 'hachure' });
  const S2 = s.rect(46, 202, 250, 84, { tone: 'green', fill: 'hachure' });
  const M1 = s.rect(46, 296, 250, 92, { tone: 'amber', fill: 'hachure' });
  const L1 = s.rect(312, 108, 282, 280, { tone: 'amber', fill: 'hachure' });
  const lab = (b, id, size, who, dims, why) => {
    s.text(b.left + 12, b.top + 18, `${id}  ${size}`, { size: 18, anchor: 'start', tone: 'soft', weight: 700 });
    s.text(b.cx, b.top + 44, `${who}  ${dims}`, { size: 21, weight: 700 });
    if (why) s.text(b.cx, b.top + 72, why, { size: 19 });
  };
  lab(S1, 'S1', 'small', 'P1', '25x15x8');
  lab(S2, 'S2', 'small', 'P2', '28x18x9');
  lab(M1, 'M1', 'medium', 'P3', '20x10x5', 'small, but S1, S2 taken');
  lab(L1, 'L1', 'large', 'P4', '40x30x20', 'medium, but P3 holds M1');
  s.text(L1.cx, L1.top + 130, 'a small parcel in M1', { size: 19, tone: 'soft' });
  s.text(L1.cx, L1.top + 154, 'pushed a medium into L1', { size: 19, tone: 'soft' });

  // the refusals
  s.rect(30, 420, 280, 80, { tone: 'red', fill: 'hachure', hachureGap: 9 });
  s.text(46, 444, 'P5 70x20x20', { size: 20, anchor: 'start', weight: 700 });
  s.text(46, 474, '70 cm, but L is only 60 long', { size: 18, anchor: 'start' });
  s.rect(330, 420, 280, 80, { tone: 'red', fill: 'hachure', hachureGap: 9 });
  s.text(346, 444, 'P6 10x10x10', { size: 20, anchor: 'start', weight: 700 });
  s.text(346, 474, 'fits small, nothing free', { size: 18, anchor: 'start' });
  s.save(__dirname, 'best-fit-cascade');
}

// ── 2. Does it fit? Sort both sides first ───────────────────────────────────
{
  const s = new Sketch({ width: 600, height: 380, title: 'Comparing a parcel with a compartment after sorting both sets of sides', desc: 'Parcel 20x40x30 against a medium compartment 45x35x20. Compared in the order given, 30 is more than 20 and it looks too big. Sorted longest first, 40, 30, 20 against 45, 35, 20, every side fits.', seed: 82 });
  s.text(20, 24, 'parcel 20x40x30 into a medium compartment 45x35x20', { size: 21, anchor: 'start', weight: 700 });
  const cell = 64, x0 = 200;
  const row = (y, title, parcel, comp, verdicts) => {
    s.text(20, y - 26, title, { size: 19, anchor: 'start', tone: 'soft', weight: 700 });
    s.array(x0, y, parcel, { cell, height: 42, indices: false, size: 22 });
    s.text(x0 - 14, y + 21, 'parcel', { size: 19, anchor: 'end', tone: 'soft' });
    s.array(x0, y + 50, comp, { cell, height: 42, indices: false, size: 22 });
    s.text(x0 - 14, y + 71, 'compartment', { size: 19, anchor: 'end', tone: 'soft' });
    verdicts.forEach((v, i) => {
      const ok = v === 'ok';
      s.text(x0 + i * cell + cell / 2, y + 116, ok ? 'fits' : 'too big', { size: 19, tone: ok ? 'green' : 'red', weight: 700 });
    });
  };
  row(78, 'as given', [20, 40, 30], [45, 35, 20], ['ok', 'bad', 'bad']);
  row(240, 'sorted, longest first', [40, 30, 20], [45, 35, 20], ['ok', 'ok', 'ok']);
  s.text(x0 + 3 * cell + 24, 136, 'looks too big', { size: 20, anchor: 'start', tone: 'red' });
  s.text(x0 + 3 * cell + 24, 298, 'fits: lay it flat', { size: 20, anchor: 'start', tone: 'green' });
  s.save(__dirname, 'fit-by-sorting');
}

// ── 3. The parcel outlives its code ─────────────────────────────────────────
{
  const W = 660;
  const s = new Sketch({ width: W, height: 380, title: 'Three parcels whose codes expire on day 3, noticed lazily and by the sweep', desc: 'P2, P3 and P4 were deposited on day 0 at 09:05, 09:10 and 09:15 with a three-day window. Their codes stop working on day 3 at the same times. Between expiry and 11:01 they are overdue but nothing has recorded it; enterCode would still refuse the code because it compares with the clock. At 11:01 the customer types P2 code and it is refused, which records P2 as expired; the sweep then records P3 and P4; the carrier takes all three.', seed: 83 });
  s.text(20, 24, 'P2, P3, P4: deposited day 0, three-day codes', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['green', 'code works'], ['amber', 'overdue, not yet recorded']]);

  // broken axis: [D0 09:00, D0 09:30] then [D3 09:00, D3 11:30]
  const A0 = 100, A1 = 190, B0 = 290, B1 = 530, axisY = 300;
  const left = m => A0 + (m / 30) * (A1 - A0);                  // minutes after D0 09:00
  const right = m => B0 + (m / 150) * (B1 - B0);                // minutes after D3 09:00
  s.line(A0, axisY, A1, axisY, { tone: 'soft' });
  s.line(B0, axisY, B1, axisY, { tone: 'soft' });
  s.text((A1 + B0) / 2, axisY, '≈', { size: 26, tone: 'soft' });
  [[0, 'D0 09:00'], [30, '09:30']].forEach(([m, l]) => { s.line(left(m), axisY - 5, left(m), axisY + 5, { tone: 'soft' }); s.text(left(m), axisY + 24, l, { size: 17, tone: 'soft' }); });
  [[0, 'D3 09:00'], [61, '10:01'], [121, '11:01']].forEach(([m, l]) => { s.line(right(m), axisY - 5, right(m), axisY + 5, { tone: 'soft' }); s.text(right(m), axisY + 24, l, { size: 17, tone: 'soft' }); });

  const lanes = [['P2', 5], ['P3', 10], ['P4', 15]];
  lanes.forEach(([id, m], i) => {
    const y = 104 + i * 52;
    s.text(A0 - 16, y + 12, id, { size: 21, anchor: 'end', weight: 700 });
    s.rect(left(m), y, A1 - left(m), 24, { tone: 'green', fill: 'hachure', width: 1.4 });
    s.rect(B0, y, right(m) - B0, 24, { tone: 'green', fill: 'hachure', width: 1.4 });
    s.rect(right(m), y, right(121) - right(m), 24, { tone: 'amber', fill: 'hachure', width: 1.4 });
  });
  s.line(right(121), 92, right(121), axisY - 8, { tone: 'red', dashed: true, width: 2 });
  s.text(right(121) + 8, 116, 'P2 code typed:', { size: 18, anchor: 'start', tone: 'red' });
  s.text(right(121) + 8, 138, 'refused', { size: 18, anchor: 'start', tone: 'red' });
  s.text(right(121) + 8, 168, 'then sweep:', { size: 18, anchor: 'start', tone: 'red' });
  s.text(right(121) + 8, 190, 'P3, P4', { size: 18, anchor: 'start', tone: 'red' });
  s.text(right(121) + 8, 226, 'carrier', { size: 18, anchor: 'start', tone: 'red' });
  s.text(right(121) + 8, 248, 'takes all 3', { size: 18, anchor: 'start', tone: 'red' });
  s.text(20, 352, 'the code check reads the clock, so amber codes are refused even before the sweep runs', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'code-outlives');
}
