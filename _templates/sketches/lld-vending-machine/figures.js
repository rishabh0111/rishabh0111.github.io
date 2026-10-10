// Figures for LLD Part 6, Vending Machine.
//   node _templates/sketches/lld-vending-machine/figures.js
const { Sketch } = require('../sketch');

// A coin: a small circle with its value.
function coin(s, cx, cy, v, tone = 'amber') {
  s.circle(cx, cy, 40, { tone, fill: 'hachure', width: 1.6 });
  s.text(cx, cy + 1, v, { size: 20, weight: 700 });
}

// ── 1. Where the coins are: escrow, cash box, return tray ──────────────────
{
  const s = new Sketch({ width: 640, height: 470, seed: 21,
    title: 'Escrow, cash box and return tray during one sale',
    desc: 'The customer inserted a 20 coin to buy chips at 14. The 20 sits in escrow, apart from the cash box, which holds a 5 and three 2s. On the sale the 20 drops into the cash box and change of 2, 2 and 2 leaves the cash box for the return tray. On cancel instead, the same 20 would go from escrow straight back to the tray.' });
  s.text(20, 24, 'chips cost 14, the customer put in 20', { size: 22, anchor: 'start', weight: 700 });

  const E = s.rect(40, 80, 200, 130, { tone: 'violet', width: 1.8 });
  s.text(140, 104, 'escrow', { size: 21, weight: 700, tone: 'violet' });
  s.text(140, 130, 'inserted, not spent', { size: 18, tone: 'soft' });
  coin(s, 140, 175, 20);

  const B = s.rect(380, 80, 220, 130, { tone: 'cyan', width: 1.8 });
  s.text(490, 104, 'cash box', { size: 21, weight: 700, tone: 'cyan' });
  s.text(490, 130, "the machine's money", { size: 18, tone: 'soft' });
  [5, 2, 2, 2].forEach((v, i) => coin(s, 420 + i * 46, 175, v));

  const T = s.rect(210, 320, 220, 100, { tone: 'ink', width: 1.8 });
  s.text(320, 344, 'return tray', { size: 21, weight: 700 });
  s.text(320, 392, 'what the customer takes', { size: 18, tone: 'soft' });

  s.arrow(E.right + 8, 130, B.left - 8, 130, { tone: 'green', label: 'sale: 20 drops in', labelTone: 'green', size: 19, labelOffset: -16 });
  // Labels placed by hand beside the arrows, never on them.
  s.arrow(500, B.bottom + 8, T.right - 30, T.top - 8, { tone: 'blue' });
  s.text(472, 268, 'change 2+2+2', { size: 19, anchor: 'start', tone: 'blue', weight: 600 });
  s.arrow(110, E.bottom + 8, T.left + 30, T.top - 8, { tone: 'amber', dashed: true });
  s.text(40, 262, 'cancel:', { size: 19, anchor: 'start', tone: 'amber', weight: 600 });
  s.text(40, 286, 'the same 20', { size: 19, anchor: 'start', tone: 'amber', weight: 600 });

  s.text(20, 448, 'after the sale the box holds 20 and 5; the 2s are gone', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'escrow');
}

// ── 2. Greedy gets stuck; the search backs up ───────────────────────────────
{
  const s = new Sketch({ width: 640, height: 470, seed: 22,
    title: 'Making 6 in change from one 5 and three 2s',
    desc: 'Largest coin first takes the 5 and is left with 1, which no coin in the tray can pay: a dead end, where plain greedy gives up. The search backs up, takes no 5, and three 2s make 6 exactly.' });
  s.text(20, 24, 'change of 6 from a tray of 5 x1, 2 x3, 1 x0', { size: 22, anchor: 'start', weight: 700 });

  const root = s.box(320, 90, '6 left\ntry 5s', { size: 20 });
  const a = s.box(160, 210, 'one 5\n1 left, try 2s', { size: 19, tone: 'amber' });
  const b = s.box(480, 210, 'no 5\n6 left, try 2s', { size: 19, tone: 'blue' });
  const a2 = s.box(160, 330, 'no 2 fits in 1\n1 left, try 1s', { size: 19, tone: 'amber' });
  const dead = s.box(160, 430, 'no 1s: dead end', { size: 19, tone: 'red' });
  const b2 = s.box(480, 330, 'three 2s\n0 left', { size: 19, tone: 'green' });

  s.connect(root, a);
  s.connect(root, b, { dashed: true });
  s.text(205, 138, 'most 5s first', { size: 19, anchor: 'end' });
  s.text(435, 138, 'then back up', { size: 19, anchor: 'start' });
  s.connect(a, a2);
  s.connect(a2, dead);
  s.connect(b, b2);
  s.text(310, 430, 'plain greedy stops here', { size: 19, anchor: 'start', tone: 'red' });
  s.arrow(305, 430, 262, 430, { tone: 'red', headLen: 9 });
  s.text(480, 400, 'pay 2+2+2', { size: 21, weight: 700, tone: 'green' });
  s.save(__dirname, 'change-search');
}

// ── 3. State pattern reads by row, enum + switch reads by column ───────────
{
  const s = new Sketch({ width: 660, height: 500, seed: 23,
    title: 'Where the code for one state and for one event lives',
    desc: 'The same table of 4 states by 5 events, twice. With the State pattern each row is one class, so a new state is one new class. With an enum and a switch in each event method, each column is one method, so a new event is one new method.' });
  const states = ['Idle', 'HasMoney', 'Dispensing', 'OutOfService'];
  const events = ['coin', 'select', 'cancel', 'drop', 'service'];
  const cw = 56, ch = 34, gx = 136;
  const panel = (top, title, hl, hlTone, lines) => {
    s.text(20, top, title, { size: 21, anchor: 'start', weight: 700 });
    const y0 = top + 56;
    events.forEach((e, c) => s.text(gx + c * cw + cw / 2, y0 - 16, e, { size: 17, tone: 'soft' }));
    states.forEach((st, r) => s.text(gx - 10, y0 + r * ch + ch / 2, st, { size: 18, anchor: 'end', tone: 'soft' }));
    const tones = {};
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      if ((hl.row !== undefined && r === hl.row) || (hl.col !== undefined && c === hl.col)) tones[`${r},${c}`] = hlTone;
    }
    s.grid(gx, y0, states.map(() => events.map(() => '')), { cw, ch, tones });
    lines.forEach((l, i) => s.text(gx + 5 * cw + 22, y0 + 18 + i * 28, l, { size: 19, anchor: 'start', tone: i === 0 ? hlTone : 'ink', weight: i === 0 ? 700 : 500 }));
  };
  panel(24, 'State pattern: one class per row', { row: 1 }, 'green',
    ['HasMoney is one class', 'every event it handles', 'is in that one file;', 'a new state = a new class']);
  panel(264, 'enum + switch: one method per column', { col: 0 }, 'blue',
    ['insertCoin is one method', 'with a case per state;', 'a new event = a new', 'method, a new state =', 'a case in every method']);
  s.save(__dirname, 'rows-or-columns');
}
