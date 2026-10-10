// Figures for Part 9, Movie ticket booking.
//   node _templates/sketches/lld-movie-ticket-booking/figures.js
const { Sketch } = require('../sketch');

// Colour key used throughout: green = available, amber = held (with an expiry),
// red = booked, or a promise that should never have been made.

function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. The seat map at 18:04 ────────────────────────────────────────────────
{
  const s = new Sketch({ width: 600, height: 400, title: 'Seat map of show s1 at 18:04', desc: 'Screen at the top. Row A is regular at Rs 200, row B premium at Rs 350. A1 and A2 are booked by alice, booking B1. A3 and A4 are held by bob, hold H3, until 18:11. Row B is all available.', seed: 91 });
  s.text(20, 24, 'show s1 at 18:04, audi-1', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['green', 'available'], ['amber', 'held'], ['red', 'booked']]);
  // screen
  s.text(330, 88, 'screen', { size: 18, tone: 'soft' });
  s.path([[160, 112], [330, 100], [500, 112]], { tone: 'soft', width: 2.2 });
  const cw = 76, ch = 58, x0 = 148;
  const seat = (row, n, y, tone, mark) => {
    const x = x0 + (n - 1) * (cw + 8);
    s.rect(x, y, cw, ch, { tone, fill: 'hachure', width: 1.6 });
    s.text(x + cw / 2, y + 20, `${row}${n}`, { size: 20, weight: 700 });
    if (mark) s.text(x + cw / 2, y + 42, mark, { size: 17 });
  };
  const yA = 160, yB = 252;
  seat('A', 1, yA, 'red', 'alice'); seat('A', 2, yA, 'red', 'alice');
  seat('A', 3, yA, 'amber', 'bob'); seat('A', 4, yA, 'amber', 'bob');
  [1, 2, 3, 4].forEach(n => seat('B', n, yB, 'green'));
  s.text(x0 - 16, yA + ch / 2, 'A', { size: 22, anchor: 'end', weight: 700 });
  s.text(x0 - 16, yB + ch / 2, 'B', { size: 22, anchor: 'end', weight: 700 });
  s.text(x0 - 40, yA + ch / 2, 'Rs 200', { size: 17, anchor: 'end', tone: 'soft' });
  s.text(x0 - 40, yB + ch / 2, 'Rs 350', { size: 17, anchor: 'end', tone: 'soft' });
  s.text(x0 - 40, yA + ch / 2 + 22, 'regular', { size: 16, anchor: 'end', tone: 'soft' });
  s.text(x0 - 40, yB + ch / 2 + 22, 'premium', { size: 16, anchor: 'end', tone: 'soft' });
  s.span(x0 + 3, x0 + 2 * cw + 8 - 3, yA - 6, 'booking B1', { side: 'above', tone: 'red', size: 17, depth: 6 });
  s.span(x0 + 2 * (cw + 8) + 3, x0 + 4 * cw + 3 * 8 - 3, yA - 6, 'hold H3, to 18:11', { side: 'above', tone: 'amber', size: 17, depth: 6 });
  s.text(300, 350, 'a held seat is shown taken until its expiry, then free', { size: 18, tone: 'soft' });
  s.text(300, 374, 'to everyone, whether or not anything cleaned it up', { size: 18, tone: 'soft' });
  s.save(__dirname, 'seat-map');
}

// ── 2. Check, then act: two threads, one seat ───────────────────────────────
{
  const s = new Sketch({ width: 640, height: 520, title: 'Two threads holding seat B2 without and with a lock', desc: 'Left: without a lock, thread 1 checks B2 is free, thread 2 checks B2 is free, thread 1 writes its hold, thread 2 overwrites it with its own; both users are told they hold B2. Right: with the show lock, thread 2 waits until thread 1 has checked and written, then sees B2 held and is refused.', seed: 92 });
  s.text(20, 24, 'alice (T1) and bob (T2) both want B2; time runs down', { size: 21, anchor: 'start', weight: 700 });
  const panel = (x, title, steps, verdict, vTone) => {
    s.text(x + 140, 66, title, { size: 20, weight: 700, tone: vTone });
    s.text(x + 60, 98, 'T1', { size: 20, weight: 700, tone: 'soft' });
    s.text(x + 220, 98, 'T2', { size: 20, weight: 700, tone: 'soft' });
    for (const lane of [1, 2]) {
      let y = 112;
      steps.forEach(([l], i) => {
        if (l !== lane) return;
        const cy = 140 + i * 68;
        if (cy - 32 > y) s.line(x + (lane === 1 ? 60 : 220), y, x + (lane === 1 ? 60 : 220), cy - 32, { tone: 'soft', dashed: true });
        y = cy + 32;
      });
      if (y < 420) s.line(x + (lane === 1 ? 60 : 220), y, x + (lane === 1 ? 60 : 220), 420, { tone: 'soft', dashed: true });
    }
    steps.forEach(([lane, label, tone], i) => {
      const y = 140 + i * 68;
      s.box(x + (lane === 1 ? 60 : 220), y, label, { tone, size: 17, w: 132 });
    });
    s.text(x + 140, 456, verdict[0], { size: 19, weight: 700, tone: vTone });
    s.text(x + 140, 482, verdict[1], { size: 19, weight: 700, tone: vTone });
  };
  panel(10, 'no lock', [
    [1, 'B2 free?\nyes', undefined],
    [2, 'B2 free?\nyes', undefined],
    [1, 'B2 = H1', 'amber'],
    [2, 'B2 = H2', 'amber'],
  ], ['both told "held":', 'bob overwrote alice'], 'red');
  panel(330, 'show lock', [
    [1, 'lock, B2 free?\nyes', undefined],
    [2, 'waits for\nthe lock', 'soft'],
    [1, 'B2 = H1,\nunlock', 'amber'],
    [2, 'B2 free?\nno: refused', 'green'],
  ], ['one hold,', 'one clear "taken"'], 'green');
  s.save(__dirname, 'check-then-act');
}

// ── 3. A hold that runs out ─────────────────────────────────────────────────
{
  const s = new Sketch({ width: 620, height: 330, title: 'Bob hold on A3 and A4 expires at 18:11 and Carol takes A3', desc: 'Bob holds A3 and A4 from 18:01 until 18:11. At 18:11 exactly the hold has expired, so Carol holds A3 and B1. At 18:12 Bob tries to confirm his hold and is refused with HOLD_EXPIRED; his payment must be refunded.', seed: 93 });
  s.text(20, 24, 'seat A3 between 18:00 and 18:13', { size: 21, anchor: 'start', weight: 700 });
  const x = m => 70 + m * 40;                 // minutes after 18:00
  const axisY = 250;
  s.line(x(0), axisY, x(13), axisY, { tone: 'soft' });
  [[0, '18:00'], [1, ''], [4, '18:04'], [11, '18:11'], [12, '']].forEach(([m, l]) => {
    s.line(x(m), axisY - 5, x(m), axisY + 5, { tone: 'soft' });
    if (l) s.text(x(m), axisY + 24, l, { size: 17, tone: 'soft' });
  });
  s.text(x(0) - 10, 126, 'bob', { size: 20, anchor: 'end', weight: 700 });
  s.rect(x(1), 112, x(11) - x(1), 28, { tone: 'amber', fill: 'hachure', width: 1.5 });
  s.text((x(1) + x(11)) / 2, 126, 'H3 from 18:01: held 10 minutes', { size: 18, weight: 700 });
  s.text(x(0) - 10, 182, 'carol', { size: 20, anchor: 'end', weight: 700 });
  s.rect(x(11), 168, x(13) - x(11), 28, { tone: 'amber', fill: 'hachure', width: 1.5 });
  s.text(x(11) - 8, 182, 'H4 at 18:11', { size: 17, anchor: 'end' });
  s.line(x(11), 100, x(11), axisY - 8, { tone: 'red', dashed: true, width: 2 });
  s.text(x(11) - 8, 222, 'expiresAt: A3 is free from here', { size: 17, anchor: 'end', tone: 'red' });
  s.text(x(13) + 10, 62, 'bob confirms at 18:12:', { size: 17, anchor: 'end', tone: 'red' });
  s.text(x(13) + 10, 82, 'HOLD_EXPIRED, refund', { size: 17, anchor: 'end', tone: 'red', weight: 700 });
  s.circle(x(12), 126, 22, { tone: 'red' });
  s.text(x(12), 126, 'x', { size: 20, tone: 'red', weight: 700 });
  s.arrow(x(12), 92, x(12), 112, { tone: 'red' });
  s.text(20, 306, 'no timer freed A3: the check "now is not before expiresAt" did', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'hold-expiry');
}
