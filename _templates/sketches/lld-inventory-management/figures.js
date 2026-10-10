// Figures for Part 15, Inventory management.
//   node _templates/sketches/lld-inventory-management/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. The three numbers, moved by each call ────────────────────────────────
{
  // Units of MUG at BLR after each call in the verification run. r = reserved, a = available, g = gone (shipped).
  const rows = [
    { call: 'receive 10', r: 0, a: 10, g: 0, note: 'on-hand 10' },
    { call: 'o1 reserves 6', r: 6, a: 4, g: 0, note: 'available 4' },
    { call: 'o2 reserves 3', r: 9, a: 1, g: 0, note: 'available 1' },
    { call: 'o1 commits', r: 3, a: 1, g: 6, note: 'on-hand 4' },
    { call: 'o2 expires', r: 0, a: 4, g: 6, note: 'available 4' },
  ];
  const cell = 34, x0 = 186, top = 96, pitch = 66;
  const s = new Sketch({ width: 680, height: top + rows.length * pitch + 6, seed: 51,
    title: 'On-hand, reserved and available for one SKU, call by call',
    desc: 'Ten mugs at BLR. Reserving moves units from available to reserved, committing removes reserved units from the shelf, expiry moves reserved units back to available. On-hand is reserved plus available.' });
  key(s, 20, 22, [['amber', 'reserved'], ['green', 'available'], ['red', 'shipped (left on-hand)']]);
  s.text(20, 58, 'BLR, one SKU: on-hand = reserved + available', { size: 19, anchor: 'start', tone: 'soft' });
  rows.forEach((row, k) => {
    const y = top + k * pitch;
    const vals = [], tones = {};
    let i = 0;
    for (let j = 0; j < row.g; j++, i++) { vals.push(''); tones[i] = 'red'; }
    for (let j = 0; j < row.r; j++, i++) { vals.push(''); tones[i] = 'amber'; }
    for (let j = 0; j < row.a; j++, i++) { vals.push(''); tones[i] = 'green'; }
    s.array(x0, y, vals, { cell, height: 34, indices: false, tones });
    s.text(x0 - 14, y + 17, row.call, { size: 20, anchor: 'end', weight: 600 });
    s.text(x0 + 10 * cell + 14, y + 17, row.note, { size: 19, anchor: 'start', tone: 'soft' });
  });
  s.save(__dirname, 'three-numbers');
}

// ── 2. Two buyers, one mug ──────────────────────────────────────────────────
{
  const s = new Sketch({ width: 660, height: 520, seed: 52,
    title: 'Two buyers race for the last mug',
    desc: 'Without a lock, both threads read available 1 before either writes, so both sell and available ends at -1. With the lock, B waits for A to finish; B then reads 0 and is refused.' });
  const lane = (y, who, tone) => {
    s.text(22, y, who, { size: 21, anchor: 'start', weight: 700, tone });
    s.line(110, y, 640, y, { tone: 'soft', width: 1.2, dashed: true });
  };
  const step = (x, y, label, tone, up) => {
    s.circle(x, y, 16, { tone, fill: 'hachure' });
    s.text(x, up ? y - 28 : y + 28, label, { size: 18, tone, weight: 600 });
  };
  s.text(22, 30, 'no lock: check, then act', { size: 21, anchor: 'start', weight: 700 });
  s.text(640, 30, 'time →', { size: 19, anchor: 'end', tone: 'soft' });
  lane(100, 'A', 'blue'); lane(190, 'B', 'violet');
  step(170, 100, 'reads 1', 'blue', true);
  step(290, 190, 'reads 1', 'violet', false);
  step(410, 100, 'writes 0, sold', 'blue', true);
  step(540, 190, 'writes −1, sold', 'violet', false);
  s.rect(240, 66, 110, 160, { tone: 'red', dashed: true, width: 1.6 });
  s.text(295, 145, 'both saw 1', { size: 19, tone: 'red', weight: 700 });

  s.line(20, 270, 640, 270, { tone: 'soft', dashed: true, width: 1.3 });
  s.text(22, 304, 'with the lock: check and act are one step', { size: 21, anchor: 'start', weight: 700 });
  lane(380, 'A', 'blue'); lane(470, 'B', 'violet');
  s.rect(150, 362, 200, 36, { tone: 'blue', fill: 'hachure', width: 1.5 });
  s.text(250, 344, 'holds lock: reads 1, writes 0', { size: 18, tone: 'blue', weight: 600 });
  s.line(170, 470, 350, 470, { tone: 'violet', width: 3 });
  s.text(260, 496, 'waits', { size: 18, tone: 'violet', weight: 600 });
  s.rect(360, 452, 170, 36, { tone: 'violet', fill: 'hachure', width: 1.5 });
  s.text(445, 432, 'reads 0, refused', { size: 18, tone: 'violet', weight: 600 });
  s.arrow(352, 400, 362, 448, { tone: 'soft', width: 1.4 });
  s.save(__dirname, 'race-timeline');
}

// ── 3. Low-stock alerts fire on the crossing, not on every sale ─────────────
{
  const pts = [
    ['receive', 10], ['o1 6', 4], ['o2 3', 1], ['o1 pays', 1], ['o2 exp.', 4], ['+10', 14], ['o4 10', 4], ['o4 cancel', 14],
  ];
  const alerts = new Set([1, 6]);
  const s = new Sketch({ width: 660, height: 410, seed: 53,
    title: 'BLR available over the run, against the low-stock line at 5',
    desc: 'Available goes 10, 4, 1, 1, 4, 14, 4, 14. Alerts fire at the two moments it drops below 5 from above; staying below 5 does not alert again, and the restock to 14 re-arms the alert.' });
  key(s, 20, 22, [['red', 'alert fired'], ['soft', 'below the line, quiet']]);
  const X0 = 90, X1 = 620, Y0 = 360, Y1 = 100, max = 15;
  const xs = i => X0 + 20 + i * ((X1 - X0 - 40) / (pts.length - 1));
  const ys = v => Y0 - (v / max) * (Y0 - Y1);
  s.line(X0, Y0, X1, Y0, { tone: 'ink', width: 1.5 });
  s.line(X0, Y0, X0, Y1 - 10, { tone: 'ink', width: 1.5 });
  [0, 5, 10, 15].forEach(v => s.text(X0 - 10, ys(v), v, { size: 18, anchor: 'end', tone: 'soft' }));
  s.text(X0 - 10, Y1 - 26, 'available', { size: 18, anchor: 'start', tone: 'soft' });
  s.line(X0, ys(5), X1, ys(5), { tone: 'amber', dashed: true, width: 1.8 });
  s.text((xs(2) + xs(3)) / 2, ys(5) + 18, 'alert when below 5', { size: 19, tone: 'amber', weight: 700 });
  s.path(pts.map(([, v], i) => [xs(i), ys(v)]), { smooth: false, tone: 'blue', width: 2 });
  pts.forEach(([label, v], i) => {
    const t = alerts.has(i) ? 'red' : (v < 5 ? 'soft' : 'blue');
    s.circle(xs(i), ys(v), alerts.has(i) ? 24 : 14, { tone: t, fill: 'hachure', width: alerts.has(i) ? 2.2 : 1.7 });
    s.text(xs(i), ys(v) - (alerts.has(i) ? 26 : 20), v, { size: 18, weight: 700, tone: t === 'soft' ? 'ink' : t });
    s.text(xs(i), Y0 + 24, label, { size: 17, tone: 'soft' });
  });
  s.text(xs(5) - 18, ys(14), 're-armed', { size: 18, anchor: 'end', tone: 'blue', weight: 700 });
  s.save(__dirname, 'low-stock-edge');
}
