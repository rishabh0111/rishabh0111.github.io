// Figures for HLD Part 16, Design a Payment System.
//   node _templates/sketches/hld-payment-system/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items, size = 19) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, size) + 24;
  }
}

// ── 1. The processor call times out: retry as new vs retry with the same key ──
{
  const W = 680, PANEL = 262, T0 = 34;
  const X = t => 160 + 100 * t; // 1 second = 100 px
  const s = new Sketch({
    width: W, height: T0 + PANEL * 2 + 48, seed: 16,
    title: 'A processor call that times out after the card was charged, retried two ways',
    desc: 'Two timelines with lanes for our payment service and the processor. In both, we send charge $100 with key att_1 at 0 s, the processor charges the card at about 1 s, and its reply is lost. Our 3 second timeout fires with the outcome unknown. Top: we retry as a new request with key att_2 and the processor charges the card a second time, so the customer pays $200. Bottom: we retry with the same key att_1, the processor recognises it and returns the original result, so the customer is charged once.',
  });
  key(s, 20, 14, [['green', 'money moved once, as intended'], ['red', 'a second charge'], ['amber', 'we do not know']]);

  // A lane is a dashed line broken around the boxes that sit on it, so no label is struck through.
  const lane = (y, boxes) => {
    let x = 150;
    boxes.sort((a, b) => a.left - b.left).forEach(b => {
      if (b.left - 6 > x) s.line(x, y, b.left - 6, y, { tone: 'soft', dashed: true, width: 1.3 });
      x = b.right + 6;
    });
    if (x < 664) s.line(x, y, 664, y, { tone: 'soft', dashed: true, width: 1.3 });
  };
  const panel = (y0, same) => {
    const yU = y0 + 70, yP = y0 + 186, mid = (yU + yP) / 2;
    s.text(20, y0 + 28, same ? 'retry with the same key: one charge' : 'retry as a new request: two charges', { size: 21, anchor: 'start', weight: 700, tone: same ? 'green' : 'red' });
    s.text(142, yU, 'us', { size: 20, anchor: 'end', weight: 600 });
    s.text(142, yP, 'processor', { size: 20, anchor: 'end', weight: 600 });

    // first call
    s.text(X(0), yU - 18, 'charge $100, key att_1', { size: 18, anchor: 'start' });
    s.arrow(X(0) + 4, yU + 6, X(0.9), yP - 26, { width: 1.7 });
    const c1 = s.box(X(1.15), yP, 'charged', { tone: 'green', size: 19 });
    // the reply that never arrives
    const lx = X(1.75), ly = mid + 6;
    s.line(X(1.35), yP - 24, lx, ly, { tone: 'red', dashed: true, width: 1.6 });
    s.line(lx - 9, ly - 9, lx + 9, ly + 9, { tone: 'red', width: 2.2 });
    s.line(lx - 9, ly + 9, lx + 9, ly - 9, { tone: 'red', width: 2.2 });
    s.text(lx + 16, ly, 'reply lost', { size: 18, anchor: 'start', tone: 'red' });
    // our timeout
    const to = s.box(X(3), yU, 'timeout: unknown', { tone: 'amber', size: 18 });

    // the retry
    s.arrow(X(3.15), yU + 25, X(3.8), yP - 28, { width: 1.7, tone: same ? 'green' : 'red' });
    s.text(X(3.55) + 6, mid - 2, same ? 'same key att_1' : 'new key att_2', { size: 18, anchor: 'start', tone: same ? 'green' : 'red' });
    let c2;
    if (same) {
      c2 = s.box(X(4.1), yP, 'att_1 seen:\nsend old result', { tone: 'green', size: 18 });
      s.text(W - 16, yP + 54, 'customer pays $100 once', { size: 20, anchor: 'end', weight: 700, tone: 'green' });
    } else {
      c2 = s.box(X(4.1), yP, 'charged again', { tone: 'red', size: 19 });
      s.text(W - 16, yP + 48, 'customer pays $200', { size: 20, anchor: 'end', weight: 700, tone: 'red' });
    }
    lane(yU, [to]);
    lane(yP, [c1, c2]);
  };
  panel(T0, false);
  panel(T0 + PANEL, true);

  // time axis
  const ya = T0 + PANEL * 2 + 14;
  s.line(X(0), ya, X(5), ya, { tone: 'soft', width: 1.4 });
  for (let t = 0; t <= 5; t++) {
    s.line(X(t), ya - 5, X(t), ya + 5, { tone: 'soft', width: 1.4 });
    s.text(X(t), ya + 20, `${t} s`, { size: 17, tone: 'soft' });
  }
  s.text(142, ya, 'time', { size: 18, anchor: 'end', tone: 'soft' });
  s.save(__dirname, 'timeout-retry');
}

// ── 2. Double-entry: a $100 payment, a $25 refund, a $75 settlement ────────
{
  const W = 640, AX = 24, DX = 360, CX = 500, RIGHT = 616, RH = 36;
  const entries = [
    { head: '1. pay_123 captured: $100.00, fee 2.9% + $0.30 = $3.20', rows: [
      ['processor receivable', '100.00', ''],
      ['owed to merchant', '', '96.80'],
      ['fee revenue', '', '3.20'],
    ], sum: '100.00' },
    { head: '2. refund re_9: $25.00 back to the customer', rows: [
      ['owed to merchant', '25.00', ''],
      ['processor receivable', '', '25.00'],
    ], sum: '25.00' },
    { head: '3. processor settles: deposits $75.00 (100 − 25)', rows: [
      ['bank cash', '75.00', ''],
      ['processor receivable', '', '75.00'],
    ], sum: '75.00' },
  ];
  let H = 92;
  entries.forEach(e => { H += 40 + e.rows.length * RH + 40; });
  H += 196;
  const s = new Sketch({
    width: W, height: H, seed: 26,
    title: 'Three double-entry ledger entries for one payment: capture, partial refund, settlement',
    desc: 'Entry 1, payment captured: debit processor receivable 100.00, credit owed to merchant 96.80, credit fee revenue 3.20. Entry 2, refund of 25.00: debit owed to merchant 25.00, credit processor receivable 25.00. Entry 3, settlement: debit bank cash 75.00, credit processor receivable 75.00. In every entry debits equal credits. Balances after: processor receivable 0.00, bank cash 75.00, owed to merchant 71.80, fee revenue 3.20, and 75.00 held equals 71.80 owed plus 3.20 earned.',
  });
  s.text(AX, 20, 'every entry: total debits = total credits', { size: 21, anchor: 'start', weight: 700 });
  s.text(AX, 50, 'debit (blue): value we hold or are owed arrives, or what we owe shrinks', { size: 18, anchor: 'start', tone: 'blue' });
  s.text(AX, 74, 'credit (violet): an obligation or earnings arise, or held value leaves', { size: 18, anchor: 'start', tone: 'violet' });
  let y = 100;
  s.text(DX + 70, y, 'debit', { size: 18, tone: 'soft' });
  s.text(CX + 58, y, 'credit', { size: 18, tone: 'soft' });
  y += 14;
  entries.forEach(e => {
    s.text(AX, y + 18, e.head, { size: 19, anchor: 'start', weight: 700 });
    y += 38;
    e.rows.forEach(([acct, dr, cr]) => {
      s.rect(AX, y, DX - AX, RH, { width: 1.3 });
      s.rect(DX, y, CX - DX, RH, { width: 1.3 });
      s.rect(CX, y, RIGHT - CX, RH, { width: 1.3 });
      s.text(AX + 12, y + RH / 2 + 1, acct, { size: 19, anchor: 'start' });
      if (dr) s.text(CX - 14, y + RH / 2 + 1, dr, { size: 20, anchor: 'end', tone: 'blue', weight: 700 });
      if (cr) s.text(RIGHT - 14, y + RH / 2 + 1, cr, { size: 20, anchor: 'end', tone: 'violet', weight: 700 });
      y += RH;
    });
    s.text(RIGHT, y + 20, `debits ${e.sum} = credits ${e.sum}`, { size: 18, anchor: 'end', tone: 'green', weight: 600 });
    y += 42;
  });
  // balances
  y += 6;
  s.line(AX, y, RIGHT, y, { tone: 'soft', width: 1.3 });
  s.text(AX, y + 24, 'balances after all three entries', { size: 20, anchor: 'start', weight: 700 });
  const bal = [
    ['processor receivable', '100 − 25 − 75 = 0.00 (settled)'],
    ['bank cash', '75.00'],
    ['owed to merchant', '96.80 − 25 = 71.80'],
    ['fee revenue', '3.20'],
  ];
  bal.forEach(([a, v], i) => {
    s.text(AX + 12, y + 56 + i * 24, a, { size: 18, anchor: 'start', tone: 'soft' });
    s.text(DX - 70, y + 56 + i * 24, v, { size: 18, anchor: 'start' });
  });
  s.rect(AX + 2, y + 143, 372, 32, { tone: 'green', width: 1.8 });
  s.text(AX + 12, y + 159, '75.00 held = 71.80 owed + 3.20 earned', { size: 20, anchor: 'start', weight: 700, tone: 'green' });
  s.save(__dirname, 'ledger-entries');
}

// ── 3. Reconciliation: our ledger against the processor's settlement file ──
{
  const W = 660, top = 118, pitch = 76, OX = 116, TX = 346, BW = 196;
  const rows = [
    { ours: 'att_101  $100.00\nsucceeded', theirs: 'att_101  $100.00\ncaptured', v: ['match'], t: 'green' },
    { ours: 'att_102  $40.00\nsucceeded', theirs: 'att_102  $40.00\ncaptured', v: ['match'], t: 'green' },
    { ours: 'att_103  $55.00\nprocessing', theirs: 'att_103  $55.00\ncaptured', v: ['they charged it:', 'mark succeeded'], t: 'amber' },
    { ours: 'att_104  $12.00\nsucceeded', theirs: null, v: ['break: missing', 'at processor'], t: 'red' },
    { ours: null, theirs: 'att_105  $9.99\ncaptured', v: ['break: missing', 'in our ledger'], t: 'red' },
    { ours: 'att_106  $30.00\nsucceeded', theirs: 'att_106  $3.00\ncaptured', v: ['break: amount', '$30.00 vs $3.00'], t: 'red' },
  ];
  const s = new Sketch({
    width: W, height: top + rows.length * pitch - 4, seed: 36,
    title: 'Reconciliation: matching our ledger to the processor settlement file by attempt id',
    desc: 'Six rows. att_101 and att_102 match on amount and status. att_103 is processing on our side and captured in the file, so it is auto-resolved to succeeded. att_104 is in our ledger but missing from the file, att_105 is in the file but missing from our ledger, and att_106 differs in amount, 30.00 against 3.00; these three are breaks for a person to investigate.',
  });
  s.text(20, 20, 'nightly match, joined on attempt id', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 52, [['green', 'matched'], ['amber', 'auto-resolved'], ['red', 'break: to a person']]);
  s.text(OX, 92, 'our ledger', { size: 19, tone: 'soft', weight: 600 });
  s.text(TX, 92, "processor's file", { size: 19, tone: 'soft', weight: 600 });
  s.text(476, 92, 'verdict', { size: 19, tone: 'soft', weight: 600, anchor: 'start' });
  rows.forEach((r, i) => {
    const cy = top + i * pitch + 30;
    const o = r.ours ? s.box(OX, cy, r.ours, { size: 18, w: BW, h: 60, tone: r.t === 'green' ? undefined : r.t, fill: r.t === 'green' ? undefined : 'hachure' }) : null;
    const t = r.theirs ? s.box(TX, cy, r.theirs, { size: 18, w: BW, h: 60, tone: r.t === 'green' ? undefined : r.t, fill: r.t === 'green' ? undefined : 'hachure' }) : null;
    if (!o) s.text(OX, cy, '(no record)', { size: 19, tone: 'soft' });
    if (!t) s.text(TX, cy, '(no line)', { size: 19, tone: 'soft' });
    if (o && t) s.line(o.right + 3, cy, t.left - 3, cy, { tone: r.t, width: 2.2 });
    r.v.forEach((line, j) => s.text(476, cy + (j - (r.v.length - 1) / 2) * 24, line, { size: 19, anchor: 'start', tone: r.t, weight: 700 }));
  });
  s.save(__dirname, 'reconciliation');
}
