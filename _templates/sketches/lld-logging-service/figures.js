// Figures for Part 12, Logging Service (LLD series).
//   node _templates/sketches/lld-logging-service/figures.js
const { Sketch } = require('../sketch');

function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. The logger tree and where one record goes ──────────────────────────
{
  const s = new Sketch({
    width: 660, height: 580, seed: 21,
    title: 'Logger hierarchy: where refunds.debug goes',
    desc: 'Loggers root (INFO), app (unset), web (unset, effective INFO), payments (DEBUG) and refunds (unset, effective DEBUG). root has appender root-out, payments has payments-out. A debug record from refunds is accepted because its effective level is DEBUG, then delivered to payments-out and, through additivity, to root-out without checking root\'s INFO level.',
  });
  s.text(20, 24, 'refunds.debug(...) is decided once, at refunds', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['violet', 'logger'], ['cyan', 'appender'], ['blue', 'path of the record']]);

  const root = s.box(230, 130, 'root\nlevel INFO', { tone: 'violet', w: 150 });
  const app = s.box(230, 250, 'app\nunset → INFO', { tone: 'violet', w: 150 });
  const web = s.box(100, 370, 'web\nunset → INFO', { tone: 'violet', w: 150 });
  const pay = s.box(360, 370, 'payments\nlevel DEBUG', { tone: 'violet', w: 160 });
  const ref = s.box(360, 490, 'refunds\nunset → DEBUG', { tone: 'violet', w: 170 });
  const rootOut = s.box(520, 130, 'root-out', { tone: 'cyan', w: 130, h: 50 });
  const payOut = s.box(570, 470, 'payments-out', { tone: 'cyan', w: 150, h: 50 });

  // tree edges (parent links), plain
  s.line(app.cx - 20, app.bottom + 4, web.cx + 20, web.top - 4, { tone: 'soft' });
  s.line(rootOut.left - 6, rootOut.cy - 12, root.right + 6, root.cy - 12, { tone: 'soft', dashed: true });
  s.text(payOut.cx, payOut.bottom + 20, 'attached to payments', { size: 18, tone: 'soft' });
  s.text(rootOut.cx, rootOut.top - 18, 'attached to root', { size: 18, tone: 'soft' });
  // the record's path, blue, going up
  s.arrow(ref.cx, ref.top - 4, pay.cx, pay.bottom + 6, { tone: 'blue', width: 2.2 });
  s.arrow(pay.right + 4, pay.cy + 6, payOut.cx - 10, payOut.top - 6, { tone: 'blue', width: 2.2, bend: -20, label: '1', labelTone: 'blue' });
  s.arrow(pay.cx - 30, pay.top - 4, app.cx + 30, app.bottom + 6, { tone: 'blue', width: 2.2 });
  s.arrow(app.cx, app.top - 4, root.cx, root.bottom + 6, { tone: 'blue', width: 2.2 });
  s.arrow(root.right + 6, root.cy + 14, rootOut.left - 8, rootOut.cy + 14, { tone: 'blue', width: 2.2, label: '2', labelTone: 'blue', labelOffset: -16 });
  s.text(430, 200, "root's INFO is not", { size: 19, tone: 'blue', anchor: 'start' });
  s.text(430, 224, 'checked again', { size: 19, tone: 'blue', anchor: 'start' });
  s.text(100, 440, 'unset: inherits the', { size: 18, tone: 'soft' });
  s.text(100, 462, 'nearest level above', { size: 18, tone: 'soft' });
  s.save(__dirname, 'logger-tree');
}

// ── 2. The async appender with a full queue ───────────────────────────────
{
  const s = new Sketch({
    width: 660, height: 360, seed: 22,
    title: 'Async appender: bounded queue full, the extra records are dropped',
    desc: 'The worker thread holds r1 and is stuck in a slow target. The queue of capacity 2 holds r2 and r3. r4 and r5 arrive, offer fails, and both are counted as dropped. The caller never waits.',
  });
  s.text(20, 24, 'capacity 2, DROP policy, target stuck on r1', { size: 21, anchor: 'start', weight: 700 });
  const caller = s.box(80, 140, 'caller\nthreads', { tone: 'blue', w: 110 });
  s.text(255, 92, 'ArrayBlockingQueue', { size: 19, tone: 'cyan', weight: 700 });
  const q = s.array(205, 115, ['r3', 'r2'], { cell: 50, indices: false, tones: { 0: 'cyan', 1: 'cyan' }, size: 22 });
  s.text(255, 190, 'full', { size: 19, tone: 'soft' });
  const worker = s.node(405, 140, 'r1', { tone: 'green', r: 30 });
  s.text(405, 90, 'log-writer', { size: 19, tone: 'green', weight: 700 });
  const target = s.box(570, 140, 'slow\nappender', { tone: 'amber', w: 120 });
  s.arrow(caller.right + 6, 140, q.left(0) - 6, 140, { tone: 'blue' });
  s.arrow(q.right(1) + 6, 140, worker.cx - 34, 140, { tone: 'ink', label: 'take()', size: 18 });
  s.arrow(worker.cx + 34, 140, target.left - 6, 140, { tone: 'amber', label: 'blocked', size: 18 });

  const d1 = s.box(230, 290, 'r4', { tone: 'red', w: 60, h: 44 });
  const d2 = s.box(310, 290, 'r5', { tone: 'red', w: 60, h: 44 });
  s.arrow(caller.cx + 20, caller.bottom + 6, d1.left - 6, d1.cy, { tone: 'red', dashed: true, bend: 20 });
  s.text(420, 280, 'offer() returns false:', { size: 19, tone: 'red', anchor: 'start' });
  s.text(420, 304, 'dropped = 2, caller', { size: 19, tone: 'red', anchor: 'start' });
  s.text(420, 328, 'returns at once', { size: 19, tone: 'red', anchor: 'start' });
  s.save(__dirname, 'async-queue');
}

// ── 3. Caller time, sync vs async ─────────────────────────────────────────
{
  const X = t => 150 + t * 4.1;
  const s = new Sketch({
    width: 680, height: 380, seed: 23,
    title: 'Caller time for 100 log calls into a 1 ms appender, sync vs async',
    desc: 'Measured: synchronously the caller spends 116 ms writing. With the async appender the caller finishes in 1 ms and the log-writer thread spends the same 116 ms writing in the background.',
  });
  s.text(20, 24, '100 calls, target sleeps 1 ms per record (measured)', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 60, [['amber', 'writing records'], ['green', 'caller free to work']]);

  s.text(20, 112, 'sync', { size: 21, anchor: 'start', weight: 700 });
  s.text(136, 150, 'caller', { size: 19, anchor: 'end', tone: 'soft' });
  s.rect(X(0), 132, X(116) - X(0), 36, { tone: 'amber', fill: 'hachure' });
  for (let t = 11.6; t < 116; t += 11.6) s.line(X(t), 134, X(t), 166, { tone: 'amber', width: 1.2 });
  s.text(X(58), 188, 'caller blocked for 116 ms', { size: 19, tone: 'amber', weight: 600 });

  s.text(20, 222, 'async', { size: 21, anchor: 'start', weight: 700 });
  s.text(136, 260, 'caller', { size: 19, anchor: 'end', tone: 'soft' });
  s.rect(X(0), 242, 8, 36, { tone: 'amber', fill: 'hachure', hachureGap: 3 });
  s.rect(X(0) + 10, 242, X(116) - X(0) - 10, 36, { tone: 'green', fill: 'hachure' });
  s.text(X(58), 260, 'back to work after 1 ms', { size: 19, tone: 'ink', weight: 600 });
  s.text(136, 306, 'log-writer', { size: 19, anchor: 'end', tone: 'soft' });
  s.rect(X(0), 288, X(116) - X(0), 36, { tone: 'amber', fill: 'hachure' });
  s.text(X(58), 306, 'the same 116 ms, off the caller', { size: 19, tone: 'ink', weight: 600 });

  const ay = 346;
  s.line(X(0), ay, X(120), ay, { tone: 'soft' });
  [0, 40, 80, 120].forEach(t => {
    s.line(X(t), ay - 6, X(t), ay + 6, { tone: 'soft' });
    s.text(X(t), ay + 22, `${t}`, { size: 18, tone: 'soft' });
  });
  s.text(X(120) + 12, ay + 22, 'ms', { size: 18, tone: 'soft', anchor: 'start' });
  s.save(__dirname, 'caller-timeline');
}
