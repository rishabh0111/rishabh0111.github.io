// Figures for Part 8, WhatsApp (HLD series).
//   node _templates/sketches/hld-whatsapp/figures.js
const { Sketch } = require('../sketch');

function key(s, x, y, items, size = 19) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, size) + 24;
  }
}
// A small hand-drawn cross marking a failure point.
function cross(s, x, y, r = 9) {
  s.line(x - r, y - r, x + r, y + r, { tone: 'red', width: 2.2 });
  s.line(x - r, y + r, x + r, y - r, { tone: 'red', width: 2.2 });
}

// ── 1. One message's life, and what a crash at each point costs ───────────
{
  const s = new Sketch({ width: 680, height: 440, title: 'One message from send to delivered, and what a failure at each point costs', desc: 'A timeline with six events: Alice taps send, the server stores the message, Alice sees one tick, the server pushes to Bob, Bob acknowledges, Alice sees two ticks. Amber: the message exists only on Alice\'s phone. Blue: it is in Bob\'s inbox on the server. Green: it is on Bob\'s phone. Three red crosses mark failures and their outcomes.', seed: 81 });
  s.text(20, 24, 'one message, and what each failure costs', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['amber', 'only on Alice\'s phone'], ['blue', 'in Bob\'s inbox'], ['green', 'on Bob\'s phone']], 18);

  const ay = 190;
  const ev = [
    [60, 'tap send', 0], [175, 'stored', 1], [270, '1 tick', 0],
    [390, 'pushed', 1], [500, 'Bob acks', 0], [615, '2 ticks', 1],
  ];
  s.rect(60, ay - 9, 115, 18, { tone: 'amber', fill: 'hachure', width: 1.3 });
  s.rect(175, ay - 9, 325, 18, { tone: 'blue', fill: 'hachure', width: 1.3 });
  s.rect(500, ay - 9, 115, 18, { tone: 'green', fill: 'hachure', width: 1.3 });
  ev.forEach(([x, label, up]) => {
    s.circle(x, ay, 14, { tone: 'ink', fill: 'solid' });
    s.line(x, ay - 12, x, up ? 120 : 146, { tone: 'soft', width: 1.2 });
    s.text(x, up ? 108 : 134, label, { size: 20, weight: 700 });
  });

  const fails = [
    [117, ['crash before', 'the write'], ['no "sent" reply,', 'phone resends;', 'same client_msg_id', 'so no duplicate']],
    [330, ['crash after', '"sent"'], ['inbox row', 'survives;', 'next sync', 'delivers it']],
    [557, ['ack lost', 'on the way'], ['pushed again;', 'Bob\'s phone drops', 'it by message_id,', 're-sends ack']],
  ];
  fails.forEach(([x, head, body]) => {
    cross(s, x, ay + 40);
    head.forEach((l, i) => s.text(x, ay + 74 + i * 24, l, { size: 19, tone: 'red', weight: 700 }));
    body.forEach((l, i) => s.text(x, ay + 132 + i * 24, l, { size: 18 }));
  });
  s.save(__dirname, 'receipt-timeline');
}

// ── 2. Clock skew reorders close messages; a per-chat counter does not ─────
{
  const X = t => 170 + t * 2.6; // ms → px
  const s = new Sketch({ width: 680, height: 420, title: 'Two group messages 50 ms apart, ordered by server clock and by sequence number', desc: 'Ana sends at 0 ms through server 1, whose clock runs 80 ms fast, so it is stamped 80 ms. Raj sends at 50 ms through an accurate server, stamped 50 ms. Sorting by stamp puts Raj first, which is wrong. A per-chat counter gives Ana 41 and Raj 42 in the order the counter received them, and every member sees that order.', seed: 82 });
  s.text(20, 24, 'two messages to one group, 50 ms apart', { size: 21, anchor: 'start', weight: 700 });

  const row = (y, label, sub) => {
    s.text(150, y, label, { size: 20, anchor: 'end', weight: 600 });
    if (sub) s.text(150, y + 30, sub, { size: 17, anchor: 'end', tone: 'soft' });
  };
  // real time
  const y1 = 96;
  row(y1, 'real time');
  s.line(X(0) - 10, y1, X(140), y1, { width: 1.5 });
  [0, 50, 100].forEach(t => { s.line(X(t), y1 - 5, X(t), y1 + 5, { width: 1.2 }); s.text(X(t), y1 + 22, `${t} ms`, { size: 17, tone: 'soft' }); });
  s.circle(X(0), y1, 16, { tone: 'blue', fill: 'solid' });
  s.circle(X(50), y1, 16, { tone: 'violet', fill: 'solid' });
  s.text(X(0), y1 - 26, 'Ana sends', { size: 19, tone: 'blue', weight: 700 });
  s.text(X(50), y1 - 26, 'Raj sends', { size: 19, tone: 'violet', weight: 700 });

  // server stamps
  const y2 = 214;
  row(y2, 'server stamp', '(server 1 is 80 ms fast)');
  s.line(X(0) - 10, y2, X(140), y2, { width: 1.5 });
  [0, 50, 100].forEach(t => { s.line(X(t), y2 - 5, X(t), y2 + 5, { width: 1.2 }); s.text(X(t), y2 + 22, `${t} ms`, { size: 17, tone: 'soft' }); });
  s.arrow(X(0), y1 + 34, X(80) - 4, y2 - 12, { tone: 'blue' });
  s.arrow(X(50), y1 + 34, X(50), y2 - 12, { tone: 'violet' });
  s.circle(X(80), y2, 16, { tone: 'blue', fill: 'solid' });
  s.circle(X(50), y2, 16, { tone: 'violet', fill: 'solid' });
  s.text(X(80) + 14, y2 - 22, '80', { size: 18, tone: 'blue', anchor: 'start' });
  s.text(X(50) - 14, y2 - 22, '50', { size: 18, tone: 'violet', anchor: 'end' });
  s.text(560, y2 - 12, 'sorted by stamp:', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(560, y2 + 14, 'Raj, then Ana', { size: 20, anchor: 'start', tone: 'red', weight: 700 });

  // sequence
  const y3 = 330;
  row(y3, 'per-chat seq', '(INCR seq:{chat})');
  const a = s.array(X(0) - 10, y3 - 24, ['41 Ana', '42 Raj'], { cell: 104, height: 48, indices: false, tones: { 0: 'blue', 1: 'violet' }, size: 20 });
  s.text(a.x + a.width + 20, y3 - 10, 'the order the counter', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(a.x + a.width + 20, y3 + 14, 'saw; everyone shows it', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(560, y3 - 12, 'sorted by seq:', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(560, y3 + 14, 'Ana, then Raj', { size: 20, anchor: 'start', tone: 'green', weight: 700 });
  s.text(20, 398, 'timestamps are for display ("10:00"); seq decides the order', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'clock-skew');
}

// ── 3. A group log with one cursor per member device ──────────────────────
{
  const log = [37, 38, 39, 40, 41, 42, 43, 44];
  const s = new Sketch({ width: 660, height: 400, title: 'A group message log with a cursor per member device', desc: 'The group log holds messages 37 to 44, one row each. Each member device has a cursor: Sam at 38, Raj (offline) at 40, Mei\'s laptop at 42, Ana (online) at 44. Messages 37 and 38 are behind every cursor and can be deleted. On reconnect Raj reads 41 to 44.', seed: 83 });
  s.text(20, 24, 'one row per message, one cursor per device', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['soft', 'every cursor past it: delete'], ['amber', 'Raj will sync these']], 18);

  const tones = { 0: 'soft', 1: 'soft', 4: 'amber', 5: 'amber', 6: 'amber', 7: 'amber' };
  const a = s.array(120, 140, log, { cell: 56, height: 52, indices: false, tones, size: 22, label: 'seq' });
  s.span(a.left(4) + 3, a.right(7) - 3, a.top - 6, 'Raj\'s sync: after 40', { side: 'above', tone: 'amber', size: 18 });
  s.span(a.left(0) + 3, a.right(1) - 3, a.top - 6, 'deletable', { side: 'above', tone: 'soft', size: 18 });

  const cur = [[1, 'Sam', 34, 'ink'], [3, 'Raj (offline)', 78, 'amber'], [5, 'Mei\'s laptop', 34, 'violet'], [7, 'Ana (online)', 78, 'green']];
  cur.forEach(([i, who, len, tone]) => s.pointer(a.cx(i), a.top + a.height, who, { dir: 'up', tone, len }));
  s.text(20, 352, 'a new message: 1 row + pushes to online devices, no per-member rows', { size: 19, anchor: 'start' });
  s.text(20, 380, '"delivered to all" fires when the lowest cursor passes it', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'group-log');
}
