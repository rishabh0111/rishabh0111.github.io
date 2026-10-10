// Figures for Part 14, Splitwise.
//   node _templates/sketches/lld-splitwise/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// Arrow from node a to node b (circle-aware), with its label placed at fraction f of the way.
function pay(s, a, b, label, { f = 0.5, off = 16, tone = 'ink', bend = 0 } = {}) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy, L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;
  s.arrow(a.cx + ux * (a.r + 4), a.cy + uy * (a.r + 4), b.cx - ux * (b.r + 6), b.cy - uy * (b.r + 6), { tone, width: 1.7, bend });
  const px = a.cx + dx * f, py = a.cy + dy * f;
  s.text(px - uy * off, py + ux * off, label, { size: 19, tone, weight: 700 });
}

// ── 1. Where the leftover paise go ──────────────────────────────────────────
{
  const s = new Sketch({ width: 640, height: 556, seed: 41,
    title: 'Rounding rule: the leftover paise of a split',
    desc: 'Rs 1000.00 split equally three ways is 33333 paise each with 1 paisa left, which goes to the first person listed. Rs 10.00 at 33.33, 33.33 and 33.34 percent is 333.3, 333.3 and 333.4 paise, floored to 333 each with 1 paisa left, which goes to the largest remainder. Both splits add up to the total exactly.' });
  key(s, 20, 22, [['amber', 'leftover paisa'], ['green', 'final share']]);

  const row = (y0, head, sub, names, inside, finals, target, coinSide, why, sum) => {
    s.text(20, y0, head, { size: 21, anchor: 'start', weight: 700 });
    s.text(20, y0 + 28, sub, { size: 19, anchor: 'start', tone: 'soft' });
    const cw = 130, x0 = 140, gap = 14, cy = y0 + 92;
    const cells = names.map((n, i) => {
      const x = x0 + i * (cw + gap);
      s.text(x + cw / 2, y0 + 58, n, { size: 19, tone: 'soft', weight: 600 });
      return s.rect(x, cy - 24, cw, 48, { label: inside[i], size: 21, width: 1.6 });
    });
    const t = cells[target];
    const coinX = coinSide === 'left' ? 72 : 600;
    s.circle(coinX, cy, 46, { tone: 'amber', fill: 'hachure', label: '+1', size: 21 });
    s.text(coinX, cy + 40, why, { size: 18, tone: 'amber', weight: 700 });
    if (coinSide === 'left') s.arrow(coinX + 26, cy, t.left - 6, cy, { tone: 'amber', width: 1.8 });
    else s.arrow(coinX - 26, cy, t.right + 6, cy, { tone: 'amber', width: 1.8 });
    finals.forEach((v, i) => {
      const c = cells[i];
      s.rect(c.left + 15, cy + 50, cw - 30, 40, { tone: 'green', fill: 'hachure', label: v, size: 21, width: 1.5 });
    });
    s.text(20, cy + 70, 'shares', { size: 19, anchor: 'start', tone: 'green', weight: 700 });
    s.text(140, cy + 116, sum, { size: 19, anchor: 'start', tone: 'green', weight: 700 });
  };

  row(70, 'Rs 1000.00, equal over asha, bala, chetan', '100000 paise ÷ 3 = 33333 each, 1 paisa left over',
    ['asha', 'bala', 'chetan'], ['33333', '33333', '33333'], ['33334', '33333', '33333'], 0, 'left', 'first listed',
    'sum 100000 paise, exactly the total');
  row(330, 'Rs 10.00 at 33.33% / 33.33% / 33.34%', '1000 paise × percent, floored: 999 paise, 1 left over',
    ['bala', 'dev', 'asha'], ['333.3 → 333', '333.3 → 333', '333.4 → 333'], ['333', '333', '334'], 2, 'right', 'largest .4',
    'sum 1000 paise, exactly the total');
  s.save(__dirname, 'leftover-paise');
}

// ── 2. The Goa trip ledger before and after simplification ──────────────────
{
  const s = new Sketch({ width: 680, height: 450, seed: 42,
    title: 'Goa trip debts before and after simplify',
    desc: 'Left: five pairwise debts as recorded. Right: three transfers after greedy simplification. Each person\'s net position is the same in both: asha +363.32, bala +363.34, chetan -523.33, dev -203.33.' });
  key(s, 20, 22, [['green', 'is owed (net)'], ['red', 'owes (net)']]);
  s.text(660, 22, 'arrow = who pays whom, Rs', { size: 19, anchor: 'end', tone: 'soft' });

  const people = { asha: '+363.32', bala: '+363.34', chetan: '−523.33', dev: '−203.33' };
  const tones = { asha: 'green', bala: 'green', chetan: 'red', dev: 'red' };
  const panel = (ox, head, edges) => {
    s.text(ox + 160, 70, head, { size: 21, weight: 700 });
    const at = { asha: [ox + 60, 150], bala: [ox + 260, 150], chetan: [ox + 60, 340], dev: [ox + 260, 340] };
    const n = {};
    for (const [name, [x, y]] of Object.entries(at)) {
      n[name] = s.node(x, y, name, { r: 38, tone: tones[name], size: 20 });
      const below = y > 200;
      s.text(x, below ? y + 58 : y - 56, people[name], { size: 19, tone: tones[name], weight: 700 });
    }
    edges.forEach(([a, b, amt, o]) => pay(s, n[a], n[b], amt, o));
  };
  panel(0, '5 debts, as recorded', [
    ['bala', 'asha', '33.33', { off: -16 }],
    ['chetan', 'asha', '329.99', { off: -38 }],
    ['chetan', 'bala', '196.67', { f: 0.55, off: -24 }],
    ['dev', 'bala', '200.00', { off: 38 }],
    ['dev', 'chetan', '3.33', { off: -18 }],
  ]);
  s.line(340, 60, 340, 430, { tone: 'soft', dashed: true, width: 1.3 });
  panel(360, '3 transfers, after simplify', [
    ['chetan', 'bala', '363.34', { f: 0.25, off: -22 }],
    ['dev', 'asha', '203.33', { f: 0.25, off: 22 }],
    ['chetan', 'asha', '159.99', { off: -38 }],
  ]);
  s.save(__dirname, 'debts-before-after');
}

// ── 3. Greedy is not always minimal ─────────────────────────────────────────
{
  const s = new Sketch({ width: 640, height: 670, seed: 43,
    title: 'Greedy simplification is not always minimal',
    desc: 'Net positions p +400, q +300, r +300, s -600, t -400. Greedy pairs the biggest creditor with the biggest debtor and needs 4 transfers. Splitting the people into zero-sum groups {p, t} and {q, r, s} needs only 3.' });
  key(s, 20, 22, [['green', 'is owed'], ['red', 'owes'], ['violet', 'zero-sum group']]);
  const panel = (y0, head, edges, groups) => {
    s.text(20, y0 - 12, head, { size: 21, anchor: 'start', weight: 700 });
    const top = y0 + 70, bot = y0 + 210;
    const n = {
      p: s.node(130, top, 'p', { r: 30, tone: 'green' }), q: s.node(320, top, 'q', { r: 30, tone: 'green' }),
      r: s.node(510, top, 'r', { r: 30, tone: 'green' }),
      t: s.node(130, bot, 't', { r: 30, tone: 'red' }), s: s.node(415, bot, 's', { r: 30, tone: 'red' }),
    };
    s.text(130 + (groups ? 42 : 36), top - (groups ? 0 : 32), '+400', { size: 19, anchor: 'start', tone: 'green', weight: 700 });
    s.text(320 + 42, top - 22, '+300', { size: 19, anchor: 'start', tone: 'green', weight: 700 });
    s.text(510 - 42, top - 22, '+300', { size: 19, anchor: 'end', tone: 'green', weight: 700 });
    s.text(130 + (groups ? 42 : 36), bot + (groups ? 0 : 32), '−400', { size: 19, anchor: 'start', tone: 'red', weight: 700 });
    s.text(415 + 36, bot + 32, '−600', { size: 19, anchor: 'start', tone: 'red', weight: 700 });
    (groups || []).forEach(([x, y, w, h]) => s.rect(x, y, w, h, { tone: 'violet', dashed: true, width: 1.5 }));
    edges.forEach(([a, b, amt, o]) => pay(s, n[a], n[b], amt, o));
  };
  panel(70, 'greedy: biggest with biggest, 4 transfers', [
    ['s', 'p', '400', { f: 0.25, off: -18 }],
    ['t', 'q', '300', { f: 0.78, off: -22 }],
    ['s', 'r', '200', { f: 0.35, off: 20 }],
    ['t', 'r', '100', { f: 0.7, off: -18 }],
  ]);
  s.line(20, 340, 600, 340, { tone: 'soft', dashed: true, width: 1.3 });
  panel(372, 'best: two zero-sum groups, 3 transfers', [
    ['t', 'p', '400', { off: 22 }],
    ['s', 'q', '300', { off: 20 }],
    ['s', 'r', '300', { off: -20 }],
  ], [[40, 397, 196, 250], [262, 397, 350, 250]]);
  s.save(__dirname, 'greedy-not-minimal');
}
