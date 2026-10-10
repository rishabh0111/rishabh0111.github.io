// Figures for Part 12, Ad Click Aggregator.
//   node _templates/sketches/hld-ad-click-aggregator/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. Checkpoint, crash, restore, replay: the count is right twice, never doubled ──
{
  const s = new Sketch({
    width: 640, height: 430, seed: 31,
    title: 'One ad\'s click count across a checkpoint, a crash and a replay',
    desc: 'Checkpoint at Kafka offset 100 records count 40. Processing offsets 100 to 130 adds 12 clicks, count 52. A crash at offset 130 loses the in-memory 52. Flink restores count 40 and rewinds to offset 100, replays the same 12 clicks and reaches 52 again. Keeping 52 and replaying would give 64.',
  });
  const X = o => 70 + (o - 90) * 10.6;
  s.text(20, 22, 'ad A\'s count across a crash (Kafka offsets 90 to 140)', { size: 21, anchor: 'start', weight: 700 });
  const ck = s.box(X(100), 82, 'checkpoint\noffset 100, A = 40', { tone: 'green', size: 19 });
  const cr = s.box(X(130), 82, 'crash at 130\nA = 52 in memory, lost', { tone: 'red', size: 19 });
  // axis
  s.line(X(90), 160, X(140), 160, { tone: 'soft', width: 1.6 });
  [90, 100, 110, 120, 130, 140].forEach(o => {
    s.line(X(o), 154, X(o), 166, { tone: 'soft', width: 1.4 });
    s.text(X(o), 182, o, { size: 17, tone: 'soft' });
  });
  s.line(X(100), ck.bottom + 4, X(100), 152, { tone: 'green', dashed: true, width: 1.4 });
  s.line(X(130), cr.bottom + 4, X(130), 152, { tone: 'red', dashed: true, width: 1.4 });
  // first pass
  s.arrow(X(100), 222, X(130), 222, { tone: 'blue', width: 2 });
  s.text(X(115), 206, '1. first pass: 12 clicks, A 40 → 52', { size: 19, tone: 'blue', weight: 600 });
  // restore
  s.arrow(X(130), 282, X(100), 282, { tone: 'red', width: 2, dashed: true });
  s.text(X(115), 266, '2. restore A = 40, rewind to 100', { size: 19, tone: 'red', weight: 600 });
  // replay
  s.arrow(X(100), 342, X(130), 342, { tone: 'green', width: 2 });
  s.text(X(115), 326, '3. replay the same 12: A = 52', { size: 19, tone: 'green', weight: 600 });
  s.text(20, 396, 'keep 52 and replay instead: 52 + 12 = 64, billed twice', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'checkpoint-replay');
}

// ── 2. Event-time window, watermark, and a late click ─────────────────────
{
  const times = ['0:52', '0:58', '1:03', '0:57', '1:08', '1:12', '0:59'];
  const marks = ['0:42', '0:48', '0:53', '0:53', '0:58', '1:02', '1:02'];
  const s = new Sketch({
    width: 660, height: 440, seed: 32,
    title: 'Clicks arriving out of order, the watermark, and the 10:00 window firing',
    desc: 'Seven clicks in arrival order with click times 0:52, 0:58, 1:03, 0:57, 1:08, 1:12, 0:59 seconds past 10:00. Watermark is the latest click time minus 10 seconds: 0:42, 0:48, 0:53, 0:53, 0:58, 1:02, 1:02. The 10:00 window fires after the sixth click with 3 clicks; the seventh click, 0:59, is late.',
  });
  s.text(20, 22, 'the 10:00 window: when is it safe to count?', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 56, [['blue', 'belongs to 10:00'], ['green', 'window fires'], ['red', 'late']]);
  s.text(20, 88, 'times are past 10:00; watermark = latest click time − 10 s', { size: 18, anchor: 'start', tone: 'soft' });
  const tones = { '0,0': 'blue', '0,1': 'blue', '0,3': 'blue', '0,6': 'red', '1,5': 'green' };
  const g = s.grid(150, 170, [times, marks], { cw: 70, ch: 48, tones, rowLabels: ['click time', 'watermark'], colLabels: ['#1', '#2', '#3', '#4', '#5', '#6', '#7'] });
  s.arrow(g.x, 132, g.right - 10, 132, { tone: 'soft' });
  s.text(g.right - 10, 114, 'arrival order', { size: 18, tone: 'soft', anchor: 'end' });
  s.pointer(g.cx(5), g.bottom + 4, '1:02 ≥ 1:00: fires, 3 clicks', { tone: 'green', len: 40, size: 19 });
  s.pointer(g.cx(3), g.bottom + 4, undefined, { tone: 'blue', len: 40 });
  s.text(g.cx(3) - 10, g.bottom + 92, '0:57 after 1:03: out of order,', { size: 18, tone: 'blue', anchor: 'middle' });
  s.text(g.cx(3) - 10, g.bottom + 114, 'but watermark 0:53, still counted', { size: 18, tone: 'blue', anchor: 'middle' });
  s.text(g.right, g.bottom + 150, '#7 at 0:59 arrives after the window was written: late', { size: 18, tone: 'red', anchor: 'end', weight: 600 });
  s.save(__dirname, 'watermark');
}

// ── 3. Hot ad: load per task before and after salting ─────────────────────
{
  const s = new Sketch({
    width: 640, height: 620, seed: 33,
    title: 'Load per Flink task for a 30,000 clicks a second ad, keyed by ad and salted 8 ways',
    desc: 'Keyed by ad_id, task 1 carries 32,200 clicks a second (the hot ad plus its 2,200 share), above a rough per-task limit, while tasks 2 to 8 carry 2,200 each. Salted 8 ways, tasks 1 to 8 each carry 5,950: 3,750 of the hot ad plus 2,200.',
  });
  const px = 180 / 32200, bw = 46, pitch = 68, x0 = 80;
  const bars = (base, values, toneOf, heading) => {
    s.text(20, base - 214, heading, { size: 21, anchor: 'start', weight: 700 });
    const limY = base - 20000 * px;
    s.line(x0 - 20, limY, x0 + 8 * pitch, limY, { tone: 'amber', dashed: true, width: 1.6 });
    s.text(x0 + 8 * pitch - 6, limY - 14, 'rough task limit', { size: 17, tone: 'amber', anchor: 'end' });
    values.forEach((v, i) => {
      const h = Math.max(4, v * px), x = x0 + i * pitch;
      s.rect(x, base - h, bw, h, { tone: toneOf(i), fill: 'hachure', width: 1.5 });
      s.text(x + bw / 2, base - h - 14, v.toLocaleString('en-US'), { size: 17, weight: 600 });
      s.text(x + bw / 2, base + 16, i + 1, { size: 17, tone: 'soft' });
    });
    s.line(x0 - 20, base, x0 + 8 * pitch, base, { tone: 'soft', width: 1.4 });
    s.text(x0 + 4 * pitch - 10, base + 40, 'clicks a second on tasks 1 to 8 (of 32)', { size: 18, tone: 'soft' });
  };
  bars(262, [32200, 2200, 2200, 2200, 2200, 2200, 2200, 2200], i => (i === 0 ? 'red' : 'blue'), 'keyed by ad_id: task 1 owns the hot ad');
  s.line(20, 330, 620, 330, { tone: 'soft', width: 1 });
  bars(556, Array(8).fill(5950), () => 'green', 'keyed by (ad_id, salt 0..7): 3,750 + 2,200 each');
  s.text(20, 380, 'then a merge stage adds the 8 partial counts:', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(20, 404, '8 rows per ad per minute in, 1 row out', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(x0 + bw + 14, 100, 'hot ad 30,000 + its share 2,200', { size: 18, anchor: 'start', tone: 'red' });
  s.save(__dirname, 'salting');
}
