// Figures for Part 16, In-memory pub-sub message queue.
//   node _templates/sketches/lld-pub-sub-queue/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. One partition: the log and a cursor per group ────────────────────────
{
  const s = new Sketch({ width: 640, height: 400, seed: 61,
    title: 'A partition log with one cursor per consumer group',
    desc: 'Partition 1 after step 5 of the verification run: offset 0 is trimmed, offsets 1 to 3 are retained. Billing has committed up to 1 and has offset 1 in flight; email has committed up to 3. The backlog, from the slowest committed offset to the end, is 3, equal to the capacity, so the next publish waits.' });
  key(s, 20, 22, [['soft', 'trimmed'], ['amber', 'in flight (billing)'], ['cyan', 'retained']]);
  const vals = ['o-1', 'o-2', 'o-3', 'o-5', ''];
  const a = s.array(110, 150, vals, { cell: 84, height: 54, tones: { 0: 'soft', 1: 'amber', 2: 'cyan', 3: 'cyan' }, dim: [4], size: 21 });
  s.text(96, 177, 'offset', { size: 18, anchor: 'end', tone: 'soft' });
  s.rect(a.left(4) + 4, a.top + 4, a.cell - 8, 46, { tone: 'soft', dashed: true, width: 1.3 });
  s.text(a.cx(4), a.mid, 'next', { size: 19, tone: 'soft' });
  // cursors above
  s.pointer(a.left(1) + 4, a.top - 2, 'billing committed 1', { dir: 'down', tone: 'violet', len: 46, size: 19 });
  s.pointer(a.left(2) + 4, a.top - 2, '', { dir: 'down', tone: 'amber', len: 22 });
  s.text(a.left(2) + 10, a.top - 34, 'next 2', { size: 19, tone: 'amber', weight: 700, anchor: 'start' });
  s.pointer(a.left(3) + 4, a.top - 2, 'email committed 3', { dir: 'down', tone: 'green', len: 46, size: 19 });
  // the end and the backlog
  s.arrow(a.left(4) + 50, a.bottom + 30, a.left(4) + 6, a.top + 58, { tone: 'blue', width: 1.8 });
  s.text(a.left(4) + 56, a.bottom + 34, 'end 4', { size: 19, tone: 'blue', weight: 700, anchor: 'start' });
  s.span(a.left(1) + 4, a.left(4) - 2, a.bottom + 2, 'backlog = end − slowest committed = 3', { tone: 'red', size: 19 });
  s.text(320, 330, 'capacity 3: the next publish waits until billing acks', { size: 20, tone: 'red', weight: 700 });
  s.text(320, 362, 'trim drops what every group has committed (offset 0)', { size: 19, tone: 'soft' });
  s.save(__dirname, 'log-and-offsets');
}

// ── 2. At-least-once: the lease runs out and offset 1 comes back ────────────
{
  const s = new Sketch({ width: 660, height: 330, seed: 62,
    title: 'Billing loses its lease and offset 1 is delivered again',
    desc: 'At 09:00:00 billing polls offsets 0 and 1 and acks 0. Its lease on the in-flight offset 1 lasts until 09:00:30. No ack arrives. At 09:00:31 the next poll rewinds to the committed offset and delivers 1, 2 and 3. Offset 1 has been delivered twice, so the handler must be idempotent.' });
  const X = t => 70 + t * 16;          // seconds to x
  s.line(X(0), 200, X(34), 200, { tone: 'ink', width: 1.6 });
  [0, 10, 20, 30].forEach(t => { s.line(X(t), 194, X(t), 206, { tone: 'ink', width: 1.4 }); s.text(X(t), 226, `:${String(t).padStart(2, '0')}`, { size: 18, tone: 'soft' }); });
  s.text(X(34) + 4, 226, 's', { size: 18, tone: 'soft', anchor: 'start' });
  s.rect(X(0), 150, X(30) - X(0), 30, { tone: 'amber', fill: 'hachure', width: 1.5 });
  s.text((X(0) + X(30)) / 2, 165, 'lease on offset 1: 30 s', { size: 19, weight: 700 });
  s.circle(X(0), 200, 16, { tone: 'blue', fill: 'hachure' });
  s.text(X(0) + 6, 82, 'poll -> 0, 1', { size: 19, tone: 'blue', weight: 700, anchor: 'start' });
  s.text(X(0) + 6, 110, 'ack 0', { size: 19, tone: 'green', weight: 700, anchor: 'start' });
  s.line(X(30), 140, X(30), 212, { tone: 'red', dashed: true, width: 1.6 });
  s.text(X(30) - 4, 60, 'lease expires,', { size: 19, tone: 'red', weight: 700, anchor: 'end' });
  s.text(X(30) - 4, 84, 'no ack for 1', { size: 19, tone: 'red', weight: 700, anchor: 'end' });
  s.circle(X(31), 200, 16, { tone: 'blue', fill: 'hachure' });
  s.text(X(31) + 14, 110, 'poll -> 1, 2, 3', { size: 19, tone: 'blue', weight: 700, anchor: 'end' });
  s.text(X(31) + 14, 136, 'rewound to committed 1', { size: 18, tone: 'soft', anchor: 'end' });
  s.text(20, 270, 'offset 1 reached billing twice: at-least-once, never at-most-once.', { size: 20, anchor: 'start', weight: 600 });
  s.text(20, 302, 'the handler must be idempotent (dedupe by order id or offset).', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'redelivery-timeline');
}

// ── 3. Consumer groups: every group gets every message, split by partition ──
{
  const s = new Sketch({ width: 620, height: 470, seed: 63,
    title: 'Two consumer groups reading four partitions',
    desc: 'Topic orders has partitions p0 to p3. Group billing has consumers c1 and c2: c1 owns p0 and p2, c2 owns p1 and p3. Group email has its own c1 and c2 with the same round-robin split. Each group reads every message once; within a group each partition has exactly one owner.' });
  key(s, 20, 22, [['violet', 'billing'], ['green', 'email']]);
  const px = [130, 250, 370, 490];
  s.text(310, 70, 'topic orders', { size: 20, tone: 'soft' });
  const parts = px.map((x, i) => s.box(x, 120, `p${i}`, { tone: 'cyan', w: 86, h: 52, size: 22 }));
  const consumers = (y, tone, label) => {
    s.text(20, y, label, { size: 20, anchor: 'start', weight: 700, tone });
    const c1 = s.box(200, y, 'c1: p0, p2', { tone, w: 150, h: 48, size: 20 });
    const c2 = s.box(420, y, 'c2: p1, p3', { tone, w: 150, h: 48, size: 20 });
    return [c1, c2];
  };
  const [b1, b2] = consumers(270, 'violet', 'billing');
  const [e1, e2] = consumers(410, 'green', 'email');
  const link = (p, c, tone, dashed) => s.arrow(p.cx + (c.cx < p.cx ? -10 : 10), p.bottom + 4, c.cx + (p.cx < c.cx ? -30 : 30), c.top - 6, { tone, width: 1.5, dashed });
  link(parts[0], b1, 'violet'); link(parts[2], b1, 'violet');
  link(parts[1], b2, 'violet'); link(parts[3], b2, 'violet');
  s.text(310, 340, 'email reads the same messages with its own cursors', { size: 18, tone: 'soft' });
  s.save(__dirname, 'consumer-groups');
}
