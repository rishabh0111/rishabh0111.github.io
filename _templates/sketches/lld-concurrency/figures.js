// Figures for Part 3, Concurrency for LLD interviews.
//   node _templates/sketches/lld-concurrency/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word, dashed?], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word, dashed] of items) {
    if (dashed) s.line(x, y, x + 24, y, { tone, dashed: true, width: 2 });
    else s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 32, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 32 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. count++ from two threads: the lost update ──────────────────────────
{
  const s = new Sketch({ width: 640, height: 410, title: 'Two threads run count++ at once and one increment is lost', desc: 'Time runs left to right in six steps. Thread A reads 41, thread B reads 41, both add 1 in their own registers, A writes 42, then B writes 42 over it. Two increments ran and count went from 41 to 42.', seed: 31 });
  s.text(20, 22, 'count++ is read, add, write: two threads, count starts at 41', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 56, [['blue', 'thread A'], ['violet', 'thread B'], ['red', 'the write that loses one']]);
  const xs = [0, 1, 2, 3, 4, 5].map(i => 170 + i * 82);
  xs.forEach((x, i) => s.text(x, 94, `t${i + 1}`, { size: 18, tone: 'soft' }));
  s.text(20, 94, 'time', { size: 18, tone: 'soft', anchor: 'start' });
  s.arrow(60, 94, 120, 94, { tone: 'soft', width: 1.4, headLen: 9 });

  const laneA = 146, laneB = 226, mem = 318;
  s.text(20, laneA, 'thread A', { size: 20, anchor: 'start', weight: 700, tone: 'blue' });
  s.text(20, laneB, 'thread B', { size: 20, anchor: 'start', weight: 700, tone: 'violet' });
  s.text(20, mem - 10, 'count in', { size: 20, anchor: 'start', weight: 700 });
  s.text(20, mem + 12, 'memory', { size: 20, anchor: 'start', weight: 700 });

  const step = (i, lane, label, tone) => s.box(xs[i], lane, label, { tone, w: 76, h: 50, size: 18 });
  step(0, laneA, 'read\n41', 'blue');
  step(2, laneA, '41 + 1\n= 42', 'blue');
  const wA = step(4, laneA, 'write\n42', 'blue');
  step(1, laneB, 'read\n41', 'violet');
  step(3, laneB, '41 + 1\n= 42', 'violet');
  const wB = step(5, laneB, 'write\n42', 'red');

  const vals = [41, 41, 41, 41, 42, 42];
  vals.forEach((v, i) => s.rect(xs[i] - 30, mem - 22, 60, 44, { tone: i === 5 ? 'red' : 'ink', fill: i === 5 ? 'hachure' : undefined, label: v, size: 22, width: 1.5 }));
  s.arrow(wA.cx, wA.bottom + 4, xs[4], mem - 26, { tone: 'blue', width: 1.6, headLen: 10 });
  s.arrow(wB.cx, wB.bottom + 4, xs[5], mem - 26, { tone: 'red', width: 1.6, headLen: 10 });
  s.text(xs[5], mem + 40, 'should be 43', { size: 18, tone: 'red', weight: 600 });
  s.text(320, 390, 'two increments ran, count went up by one', { size: 21, tone: 'red', weight: 700 });
  s.save(__dirname, 'lost-update');
}

// ── 2. Deadlock: a cycle of waits, and lock ordering breaking it ──────────
{
  const s = new Sketch({ width: 660, height: 400, title: 'Two transfers deadlock when each locks its own source account first; lock ordering removes the cycle', desc: 'Left: thread 1 to 2 holds lock 1 and waits for lock 2, thread 2 to 1 holds lock 2 and waits for lock 1, a cycle. Right: both threads lock account 1 first, so thread 2 to 1 waits while holding nothing, and thread 1 to 2 can take lock 2 and finish.', seed: 32 });
  s.text(165, 24, 'lock in call order', { size: 21, weight: 700 });
  s.text(495, 24, 'lock lower id first', { size: 21, weight: 700 });
  s.line(330, 14, 330, 330, { tone: 'soft', dashed: true, width: 1.2 });

  // left panel: the cycle
  {
    const L1 = s.box(165, 92, 'lock 1', { tone: 'amber', w: 96, size: 20 });
    const L2 = s.box(165, 272, 'lock 2', { tone: 'amber', w: 96, size: 20 });
    const T1 = s.box(70, 182, 'thread\n1 → 2', { w: 96, size: 19 });
    const T2 = s.box(260, 182, 'thread\n2 → 1', { w: 96, size: 19 });
    s.arrow(L1.left - 4, L1.cy + 6, T1.cx - 6, T1.top - 6, { tone: 'green', label: 'held by', labelOffset: 30, size: 18 });
    s.arrow(T1.cx - 6, T1.bottom + 4, L2.left - 6, L2.cy - 4, { tone: 'red', dashed: true, label: 'waits', labelOffset: -30, size: 18 });
    s.arrow(L2.right + 4, L2.cy - 6, T2.cx + 6, T2.bottom + 6, { tone: 'green', label: 'held by', labelOffset: 30, size: 18 });
    s.arrow(T2.cx + 6, T2.top - 4, L1.right + 6, L1.cy + 4, { tone: 'red', dashed: true, label: 'waits', labelOffset: -30, size: 18 });
    s.text(165, 182, 'a cycle', { size: 20, tone: 'red', weight: 700 });
    s.text(165, 324, 'nobody can move, forever', { size: 19, tone: 'red', weight: 600 });
  }
  // right panel: ordered
  {
    const L1 = s.box(495, 92, 'lock 1', { tone: 'amber', w: 96, size: 20 });
    const L2 = s.box(495, 272, 'lock 2', { tone: 'amber', w: 96, size: 20 });
    const T1 = s.box(400, 182, 'thread\n1 → 2', { w: 96, size: 19 });
    const T2 = s.box(590, 182, 'thread\n2 → 1', { w: 96, size: 19 });
    s.arrow(L1.left - 4, L1.cy + 6, T1.cx - 6, T1.top - 6, { tone: 'green', label: 'held by', labelOffset: 30, size: 18 });
    s.arrow(T1.cx - 6, T1.bottom + 4, L2.left - 6, L2.cy - 4, { tone: 'green', label: 'takes', labelOffset: -30, size: 18 });
    s.arrow(T2.cx + 6, T2.top - 4, L1.right + 6, L1.cy + 4, { tone: 'red', dashed: true, label: 'waits', labelOffset: -30, size: 18 });
    s.text(495, 324, 'thread 2 → 1 holds nothing', { size: 19, tone: 'green', weight: 600 });
  }
  key(s, 120, 372, [['green', 'holds or takes'], ['red', 'waits for', true], ['amber', 'a lock']]);
  s.save(__dirname, 'deadlock');
}

// ── 3. Semaphore(3): ten threads, each holding a connection for 50 ms ─────
{
  const x0 = 130, px = 1.9, rowH = 28, top = 104;
  const s = new Sketch({ width: 620, height: 470, title: 'A Semaphore with 3 permits lets 10 threads through three at a time', desc: 'Ten threads each hold a connection for 50 ms. Green bars are time holding a connection, dashed lines are time blocked in acquire. At most three bars overlap; the last thread starts at 150 ms and the run ends at about 200 ms.', seed: 33 });
  s.text(20, 22, 'pool of 3 connections, 10 threads, each holds one for 50 ms', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 56, [['green', 'holding a connection'], ['soft', 'blocked in acquire()', true]]);
  s.text(x0 - 16, top - 20, 'arrival', { size: 18, tone: 'soft', anchor: 'end' });
  const ord = n => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
  for (let i = 0; i < 10; i++) {
    const y = top + i * rowH, wave = Math.floor(i / 3), start = x0 + wave * 50 * px;
    s.text(x0 - 16, y, ord(i + 1), { size: 18, anchor: 'end', tone: 'soft' });
    if (wave > 0) s.line(x0, y, start - 4, y, { tone: 'soft', dashed: true, width: 1.6 });
    s.rect(start, y - 10, 50 * px - 4, 20, { tone: 'green', fill: 'hachure', width: 1.4 });
  }
  const axisY = top + 10 * rowH + 8;
  s.line(x0, axisY, x0 + 210 * px, axisY, { tone: 'soft', width: 1.4 });
  [0, 50, 100, 150, 200].forEach(t => {
    s.line(x0 + t * px, axisY - 5, x0 + t * px, axisY + 5, { tone: 'soft', width: 1.4 });
    s.text(x0 + t * px, axisY + 20, `${t} ms`, { size: 17, tone: 'soft' });
  });
  const cntY = axisY + 58;
  s.text(x0 - 16, cntY, 'in use', { size: 18, anchor: 'end', tone: 'soft' });
  [3, 3, 3, 1].forEach((n, k) => s.text(x0 + (k * 50 + 25) * px, cntY, n, { size: 22, weight: 700, tone: 'green' }));
  s.text(x0 + 222 * px, top + 2 * rowH, 'never', { size: 19, anchor: 'start', tone: 'green', weight: 600 });
  s.text(x0 + 222 * px, top + 3 * rowH, 'more', { size: 19, anchor: 'start', tone: 'green', weight: 600 });
  s.text(x0 + 222 * px, top + 4 * rowH, 'than 3', { size: 19, anchor: 'start', tone: 'green', weight: 600 });
  s.save(__dirname, 'semaphore-pool');
}

// ── 4. The lock-granularity ladder on a row of seats ───────────────────────
{
  const s = new Sketch({ width: 660, height: 660, title: 'Three lock granularities for booking seats: one lock, a lock per seat, lock-free compare-and-set', desc: 'Three threads: T1 and T3 want seat 1, T2 wants seat 4. With one lock for all seats, T2 and T3 both wait. With a lock per seat, only T3 waits, behind T1. With compare-and-set, nobody waits: T3 fails at once and can pick another seat.', seed: 34 });
  key(s, 20, 22, [['green', 'proceeds'], ['red', 'waits', true], ['amber', 'a lock']]);
  const x0 = 70, w = 72, step = 88, seatH = 44;
  const seatX = i => x0 + i * step;
  const cx = i => seatX(i) + w / 2;
  const rung = (y, title, kind) => {
    s.text(20, y, title, { size: 21, anchor: 'start', weight: 700 });
    const tY = y + 40, sTop = y + 92;
    if (kind === 'global') s.rect(x0 - 12, sTop - 12, 5 * step + w + 24, seatH + 24, { tone: 'amber', fill: 'hachure', hachureGap: 11, width: 1.6 });
    for (let i = 0; i < 6; i++) {
      const perSeat = kind === 'seat';
      s.rect(seatX(i), sTop, w, seatH, { tone: perSeat ? 'amber' : 'ink', fill: perSeat ? 'hachure' : undefined, hachureGap: 11, label: `seat ${i}`, size: 18, width: 1.5 });
    }
    const t = (x, label) => s.circle(x, tY, 38, { label, size: 18, width: 1.5 });
    t(cx(1) - 24, 'T1'); t(cx(1) + 24, 'T3'); t(cx(4), 'T2');
    const stopAt = kind === 'global' ? sTop - 16 : sTop - 4;
    s.arrow(cx(1) - 24, tY + 22, cx(1) - 12, sTop - 4, { tone: 'green', width: 1.8, headLen: 10 });
    if (kind === 'cas') {
      s.arrow(cx(1) + 24, tY + 22, cx(1) + 12, sTop - 4, { tone: 'red', width: 1.8, headLen: 10 });
      s.arrow(cx(4), tY + 22, cx(4), sTop - 4, { tone: 'green', width: 1.8, headLen: 10 });
    } else {
      s.arrow(cx(1) + 24, tY + 22, cx(1) + 18, stopAt, { tone: 'red', width: 1.8, dashed: true, headLen: 10 });
      s.arrow(cx(4), tY + 22, cx(4), kind === 'global' ? stopAt : sTop - 4, { tone: kind === 'global' ? 'red' : 'green', dashed: kind === 'global', width: 1.8, headLen: 10 });
    }
    return sTop + seatH;
  };
  let b = rung(64, '1. one lock for all seats', 'global');
  s.text(20, b + 28, 'T2 waits for T1 though seat 4 is free', { size: 19, anchor: 'start', tone: 'red', weight: 600 });
  b = rung(266, '2. a lock per seat', 'seat');
  s.text(20, b + 28, 'only T3 waits: it wants the seat T1 is booking', { size: 19, anchor: 'start', tone: 'red', weight: 600 });
  b = rung(468, '3. lock-free: compare-and-set per seat', 'cas');
  s.text(cx(1) + 64, b - 70, 'CAS fails', { size: 18, anchor: 'start', tone: 'red', weight: 600 });
  s.text(20, b + 28, 'nobody waits: T3 gets "taken" at once and picks another', { size: 19, anchor: 'start', tone: 'green', weight: 600 });
  s.save(__dirname, 'lock-granularity');
}
