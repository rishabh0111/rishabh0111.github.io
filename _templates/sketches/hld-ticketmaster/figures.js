// Figures for Part 6, Design Ticketmaster.
//   node _templates/sketches/hld-ticketmaster/figures.js
const { Sketch } = require('../sketch');

function key(s, x, y, items, size = 18) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: tone === 'ink' ? undefined : 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, size) + 22;
  }
}

// ── 1. One section of the seat map, a few minutes into the on-sale ─────────
{
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  // s = sold, number = held with that many minutes left, y = your pick, '' = available
  const plan = [
    ['s', 's', 's', 's', 's', '8', '8', 's', 's', 's', 's', 's'],
    ['s', 's', '3', '3', 's', 's', 's', 's', '6', '6', '6', 's'],
    ['s', '', '', 's', 's', '9', '9', '9', '9', 's', '', 's'],
    ['5', '5', 's', 's', '', '', 'y', 'y', '', '0', 's', 's'],
    ['', '', '', '2', '2', '', '', '', 's', 's', '', ''],
    ['', '', '', '', '', '', '7', '7', '7', '7', '', ''],
  ];
  const s = new Sketch({
    width: 640, height: 490, seed: 61,
    title: 'One section of a stadium seat map during an on-sale',
    desc: 'Six rows of twelve seats. Red seats are sold, amber seats are held with the minutes left on each hold, blue seats are the ones you are picking, empty seats are available. One amber seat in row D shows 0 minutes left: the hold has expired, so the next hold UPDATE will take it even before the cleanup job resets it.',
  });
  s.text(20, 24, 'section 112, about four minutes into the on-sale', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['ink', 'available'], ['amber', 'held, minutes left'], ['red', 'sold'], ['blue', 'your pick']]);
  s.rect(150, 86, 340, 40, { tone: 'violet', fill: 'hachure', label: 'stage', size: 20 });
  const x0 = 70, y0 = 150, c = 44;
  const tones = {}, cells = plan.map(r => r.map(() => ''));
  plan.forEach((r, i) => r.forEach((v, j) => {
    if (v === 's') tones[`${i},${j}`] = 'red';
    else if (v === 'y') tones[`${i},${j}`] = 'blue';
    else if (v !== '') { tones[`${i},${j}`] = 'amber'; cells[i][j] = v; }
  }));
  s.grid(x0, y0, cells, { cw: c, ch: c, tones, rowLabels: rows, size: 20 });
  const ty = y0 + 6 * c + 44;
  s.text(20, ty, 'the 0 in row D has expired: it still looks held, but the', { size: 19, anchor: 'start' });
  s.text(20, ty + 26, 'next UPDATE sees hold_expires_at < now() and takes it', { size: 19, anchor: 'start' });
  s.save(__dirname, 'seat-map');
}

// ── 2. Two racing requests: check-then-act versus one conditional UPDATE ───
{
  const s = new Sketch({
    width: 660, height: 500, seed: 62,
    title: 'Two requests for seat 14C at the same instant',
    desc: 'Top: check-then-act in the application. Both requests read available before either writes, both write held, and both users are told the seat is theirs. Bottom: one conditional UPDATE each. Request 1 takes the row lock and commits; request 2 waits for the lock, re-checks its WHERE clause against the new row, matches nothing, updates zero rows and returns 409.',
  });
  const L = 150, R = 640;
  const tick = t => L + t * 70;              // t in milliseconds, 0..7
  const lanes = (y, title, end = R) => {
    s.text(20, y - 40, title, { size: 20, anchor: 'start', weight: 700 });
    s.text(L - 14, y, 'request 1', { size: 19, anchor: 'end' });
    s.text(L - 14, y + 60, 'request 2', { size: 19, anchor: 'end' });
    s.line(L, y, end, y, { tone: 'soft' });
    s.line(L, y + 60, end, y + 60, { tone: 'soft' });
  };
  const ev = (t, y, label, tone, above = true) => {
    s.circle(tick(t), y, 14, { tone, fill: 'solid' });
    s.text(tick(t), y + (above ? -20 : 22), label, { size: 18, tone });
  };
  // top: check-then-act
  const y1 = 90;
  lanes(y1, 'check, then write (two statements)', tick(5.1));
  ev(0.5, y1, 'read: free', 'ink');
  ev(1.5, y1 + 60, 'read: free', 'ink', false);
  ev(3, y1, 'write HELD', 'amber');
  ev(4.5, y1 + 60, 'write HELD', 'amber', false);
  s.box(tick(6.2), y1 + 30, 'both told\n"yours"', { tone: 'red', size: 18 });
  // bottom: conditional update
  const y2 = 300;
  lanes(y2, 'one conditional UPDATE each', tick(4.9));
  ev(0.5, y2, 'UPDATE', 'ink');
  s.rect(tick(0.5), y2 - 9, tick(3) - tick(0.5), 18, { tone: 'green', fill: 'hachure', width: 1.2 });
  ev(3, y2, 'commit: 1 row', 'green');
  ev(1.5, y2 + 60, 'UPDATE', 'ink', true);
  s.rect(tick(1.5), y2 + 51, tick(3) - tick(1.5), 18, { tone: 'soft', dashed: true, width: 1.4 });
  s.text((tick(1.5) + tick(3)) / 2 - 10, y2 + 86, 'waits for row lock', { size: 17, tone: 'soft' });
  ev(3.6, y2 + 60, '', 'violet', false);
  s.text(tick(3.6) + 6, y2 + 36, 're-checks WHERE', { size: 18, tone: 'violet' });
  s.box(tick(5.8), y2 + 60, '0 rows: 409', { tone: 'red', size: 18 });
  // time axis
  const ax = 440;
  s.arrow(L, ax, R, ax, { tone: 'soft', headLen: 10 });
  [0, 1, 2, 3, 4, 5, 6].forEach(t => s.text(tick(t), ax + 20, `${t}`, { size: 17, tone: 'soft' }));
  s.text(R, ax + 44, 'milliseconds', { size: 17, tone: 'soft', anchor: 'end' });
  s.text(20, ax + 44, 'one winner, decided by the row lock', { size: 19, anchor: 'start', tone: 'green', weight: 700 });
  s.save(__dirname, 'race-timeline');
}

// ── 3. The waiting room: arrivals versus admissions, log scale ─────────────
{
  const s = new Sketch({
    width: 660, height: 500, seed: 63,
    title: 'People who joined the queue versus people admitted, over the first 15 minutes',
    desc: 'Log-scale chart. Assumed arrivals: 3 million already waiting at 10:00, rising to 10 million by minute 10. Admissions run at 2,000 a minute, reaching about 21,000 at minute 10.5, when the 50,000 seats sell out and admission stops. Everyone else in the queue is told early.',
  });
  s.text(20, 24, 'joined the queue vs let in, log scale', { size: 21, anchor: 'start', weight: 700 });
  const X0 = 110, X1 = 620, Y0 = 400, Y1 = 70;
  const lx = m => X0 + (m / 15) * (X1 - X0);
  const ly = v => Y0 - ((Math.log10(v) - 3) / 4) * (Y0 - Y1);   // 1e3 .. 1e7
  s.arrow(X0, Y0, X1 + 12, Y0, { tone: 'soft', headLen: 10 });
  s.line(X0, Y0, X0, Y1 - 6, { tone: 'soft' });
  [[1e3, '1k'], [1e4, '10k'], [1e5, '100k'], [1e6, '1M'], [1e7, '10M']].forEach(([v, t]) => {
    s.line(X0 - 5, ly(v), X0 + 5, ly(v), { tone: 'soft' });
    s.text(X0 - 12, ly(v), t, { size: 17, tone: 'soft', anchor: 'end' });
  });
  [0, 5, 10, 15].forEach(m => s.text(lx(m), Y0 + 20, `${m}`, { size: 17, tone: 'soft' }));
  s.text(X1, Y0 + 44, 'minutes after 10:00', { size: 17, tone: 'soft', anchor: 'end' });
  s.text(30, (Y0 + Y1) / 2, 'people', { size: 18, tone: 'soft', rotate: -90 });
  // arrivals (assumed)
  const arr = [[0, 3e6], [1, 5e6], [2, 6.5e6], [3, 7.5e6], [5, 8.7e6], [7.5, 9.5e6], [10, 1e7], [15, 1.03e7]];
  s.path(arr.map(([m, v]) => [lx(m), ly(v)]), { tone: 'amber', width: 2.6 });
  s.text(lx(9), ly(1e7) - 22, 'joined the queue (assumed)', { size: 19, tone: 'amber', weight: 700 });
  // admissions: 2,000 a minute until sold out at 10.5 min
  const adm = []; for (let m = 0.5; m <= 10.5; m += 0.5) adm.push([lx(m), ly(2000 * m)]);
  s.path(adm, { tone: 'green', width: 2.6 });
  s.line(lx(10.5), ly(21000), lx(15), ly(21000), { tone: 'green', dashed: true });
  s.text(lx(5.2), ly(9000) + 26, 'let in: 2,000 a minute', { size: 19, tone: 'green', weight: 700, anchor: 'start' });
  // sell-out marker
  s.circle(lx(10.5), ly(21000), 14, { tone: 'red', fill: 'solid' });
  s.text(lx(10.5) - 20, ly(21000) + 30, 'sold out at ~21k', { size: 19, tone: 'red', weight: 700, anchor: 'start' });
  s.text(lx(10.5) - 20, ly(21000) + 54, 'admitted, 10.5 min', { size: 18, tone: 'red', anchor: 'start' });
  // the gap
  s.arrow(lx(12.5), ly(9.9e6) + 6, lx(12.5), ly(23000) - 8, { tone: 'soft', head: 'both', headLen: 9 });
  s.text(lx(12.5) - 10, ly(4.8e5), 'the queue absorbs', { size: 18, tone: 'soft', anchor: 'end' });
  s.text(lx(12.5) - 10, ly(4.8e5) + 24, 'the difference', { size: 18, tone: 'soft', anchor: 'end' });
  s.text(20, 468, 'everyone far behind position ~21,000 can be told early', { size: 19, anchor: 'start' });
  s.save(__dirname, 'waiting-room');
}
