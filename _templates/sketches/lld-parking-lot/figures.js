// Figures for LLD Part 5, Parking Lot.
//   node _templates/sketches/lld-parking-lot/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word, opts], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word, o = {}] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: o.fill ?? 'hachure', width: 1.4, dashed: o.dashed });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. Where does the second car go? Best fit beats nearest floor ──────────
{
  const s = new Sketch({ width: 620, height: 400, seed: 11,
    title: 'Ranking free spots for car KA02 at 09:05',
    desc: 'Two floors. Floor 0 has a motorcycle spot, a compact spot taken by KA01 and a large spot; floor 1 has a compact and a large spot. For a car, the strategy ranks the free compact on floor 1 first, then the large spot on floor 0, then the large on floor 1. The motorcycle spot is too small.' });
  s.text(20, 24, 'car KA02 arrives at 09:05: which spot?', { size: 22, anchor: 'start', weight: 700 });
  s.text(20, 54, 'rank = smallest type that fits, then lowest floor', { size: 19, anchor: 'start', tone: 'soft' });

  const W = { M: 80, C: 120, L: 160 }, H = 76, gap = 14, x0 = 130;
  const floors = [
    { y: 120, label: 'floor 1', spots: [['1-C1', 'C', 'free', 1], ['1-L1', 'L', 'free', 3]] },
    { y: 250, label: 'floor 0', spots: [['0-M1', 'M', 'small'], ['0-C1', 'C', 'KA01'], ['0-L1', 'L', 'free', 2]] },
  ];
  for (const f of floors) {
    s.text(x0 - 18, f.y + H / 2, f.label, { size: 20, anchor: 'end', weight: 600 });
    s.line(x0 - 6, f.y + H + 10, 600, f.y + H + 10, { tone: 'soft', width: 1.4 });
    let x = x0;
    for (const [id, type, what, rank] of f.spots) {
      const w = W[type];
      const tone = rank === 1 ? 'green' : what === 'KA01' ? 'soft' : what === 'small' ? 'red' : 'ink';
      s.rect(x, f.y, w, H, { tone, fill: rank === 1 || what === 'KA01' ? 'hachure' : undefined, width: 1.7, dashed: what === 'small' });
      s.text(x + w / 2 - (rank ? 10 : 0), f.y + 24, id, { size: 20, weight: 700 });
      const sub = what === 'KA01' ? 'taken: KA01' : what === 'small' ? 'too small' : type === 'C' ? 'compact' : 'large';
      s.text(x + w / 2, f.y + 52, sub, { size: 18, tone: what === 'small' ? 'red' : 'soft' });
      if (rank) {
        s.circle(x + w - 20, f.y + 22, 30, { tone: rank === 1 ? 'green' : 'blue', width: 1.8 });
        s.text(x + w - 20, f.y + 23, rank, { size: 21, weight: 700, tone: rank === 1 ? 'green' : 'blue' });
      }
      x += w + gap;
    }
  }
  s.text(190, 90, 'KA02 goes here', { size: 20, tone: 'green', weight: 700 });
  s.arrow(190, 100, 190, 116, { tone: 'green', headLen: 9 });
  key(s, 20, 372, [['green', 'chosen'], ['blue', 'ranked'], ['soft', 'taken'], ['red', 'does not fit', { fill: 'none', dashed: true }]]);
  s.save(__dirname, 'spot-ranking');
}

// ── 2. Two gates, one spot: check-then-act vs compare-and-set ──────────────
{
  const s = new Sketch({ width: 640, height: 520, seed: 12,
    title: 'Two entry gates racing for the last free spot',
    desc: 'Top: with check-then-act, gate 1 and gate 2 both read the spot as free, then both write, and two tickets name one spot. Bottom: with compare-and-set, gate 1 swaps null for its ticket and wins; gate 2 finds the spot no longer null, fails, and moves to the next candidate.' });
  const lanes = (top, title) => {
    s.text(20, top, title, { size: 21, anchor: 'start', weight: 700 });
    s.text(96, top + 66, 'gate 1', { size: 20, anchor: 'end', weight: 600, tone: 'blue' });
    s.text(96, top + 130, 'gate 2', { size: 20, anchor: 'end', weight: 600, tone: 'violet' });
    s.line(110, top + 66, 600, top + 66, { tone: 'soft', width: 1.2 });
    s.line(110, top + 130, 600, top + 130, { tone: 'soft', width: 1.2 });
    s.arrow(110, top + 170, 600, top + 170, { tone: 'soft', width: 1.3 });
    s.text(600, top + 190, 'time', { size: 18, anchor: 'end', tone: 'soft' });
  };
  // Events sit on their lane line, so the line never runs through the text.
  const ev = (x, y, label, tone) => s.box(x, y - 22, label, { tone, size: 18, h: 40 });

  // top: the broken version
  lanes(24, 'check, then act');
  ev(190, 90, 'free? yes', 'blue');
  ev(300, 154, 'free? yes', 'violet');
  ev(410, 90, 'take: T7', 'blue');
  ev(520, 154, 'take: T8', 'violet');
  s.text(330, 222, 'two tickets, one spot', { size: 21, tone: 'red', weight: 700 });

  // bottom: the atomic version
  const T = 270;
  lanes(T, 'compare-and-set (null to ticket, in one step)');
  ev(220, T + 66, 'CAS(null, T7): won', 'green');
  ev(410, T + 130, 'CAS(null, T8): lost', 'red');
  s.arrow(505, T + 108, 535, T + 108, { tone: 'red', headLen: 9 });
  s.text(542, T + 108, 'next spot', { size: 18, anchor: 'start', tone: 'red' });
  s.text(330, T + 222, 'gate 2 tries the next spot instead', { size: 21, tone: 'green', weight: 700 });
  s.save(__dirname, 'gate-race');
}

// ── 3. Billing: started hours and the grace period ─────────────────────────
{
  const s = new Sketch({ width: 640, height: 330, seed: 13,
    title: 'How the hourly tariff bills two stays',
    desc: 'KA01 stays 09:00 to 11:30, which touches three started hours, so the car rate of 40 is billed three times: 120. BIKE1 stays 09:20 to 09:28, eight minutes, inside the ten-minute grace period, so it pays 0.' });
  s.text(20, 24, 'every started hour is billed; 10 minutes of grace', { size: 22, anchor: 'start', weight: 700 });
  const x0 = 90, px = 150; // px per hour, axis starts at 09:00
  const X = (h, m = 0) => x0 + (h - 9 + m / 60) * px;
  // axis
  s.line(x0, 250, X(12, 15), 250, { tone: 'soft', width: 1.4 });
  [9, 10, 11, 12].forEach(h => {
    s.line(X(h), 244, X(h), 256, { tone: 'soft', width: 1.4 });
    s.text(X(h), 274, `${String(h).padStart(2, '0')}:00`, { size: 18, tone: 'soft' });
  });
  // KA01: three hour blocks, the last only partly used
  s.text(x0 - 12, 110, 'KA01', { size: 20, anchor: 'end', weight: 700 });
  [[9, 'hour 1'], [10, 'hour 2'], [11, 'hour 3']].forEach(([h, l]) => {
    s.rect(X(h) + 3, 84, px - 6, 52, { tone: 'blue', fill: h === 11 ? 'dots' : 'hachure', width: 1.5 });
    s.text(X(h) + px / 2, 110, `${l}: 40`, { size: 19, weight: 600 });
    if (h === 11) s.line(X(11, 30), 88, X(11, 30), 98, { tone: 'red', width: 1.4 });
  });
  // Marks above and below the block, so the line never crosses the label inside it.
  s.line(X(11, 30), 72, X(11, 30), 88, { tone: 'red', width: 2 });
  s.line(X(11, 30), 132, X(11, 30), 146, { tone: 'red', width: 2 });
  s.text(X(11, 30) + 8, 62, 'exit 11:30', { size: 18, anchor: 'start', tone: 'red' });
  s.text(X(12) + 12, 110, '= 120', { size: 22, anchor: 'start', weight: 700, tone: 'blue' });
  s.text(X(11) + px / 2, 160, 'started, so billed in full', { size: 18, tone: 'soft' });
  // BIKE1: eight minutes, inside grace
  s.text(x0 - 12, 206, 'BIKE1', { size: 20, anchor: 'end', weight: 700 });
  s.rect(X(9, 20), 190, X(9, 30) - X(9, 20), 32, { tone: 'green', fill: 'hachure', width: 1.5, dashed: true });
  s.rect(X(9, 20), 190, X(9, 28) - X(9, 20), 32, { tone: 'green', fill: 'cross', width: 1.5, hachureGap: 4 });
  s.text(X(9, 30) + 12, 206, '8 min, under 10 min grace = 0', { size: 19, anchor: 'start', tone: 'green', weight: 600 });
  s.text(20, 312, 'car rate 40 an hour; motorcycle 20; truck 80', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'billing');
}
