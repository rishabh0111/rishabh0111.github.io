// Figures for Part 11, Top-K Trending Videos.
//   node _templates/sketches/hld-top-k/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. Merging local top-2 lists: wrong when a video is split, right when it is not ──
{
  const s = new Sketch({
    width: 640, height: 570, seed: 21,
    title: 'Merging per-worker top 2 lists, with video X split across workers and with X on one worker',
    desc: 'Top: partitioned at random, worker 1 has A 50, B 45, X 40 and worker 2 has C 60, D 45, X 40; local top 2 are A, B and C, D; the merge gives C 60, A 50, but the true top 2 is X 80, C 60. Bottom: partitioned by video, worker 1 has X 80, A 50, B 45 and worker 2 has C 60, D 45; the merge gives X 80, C 60, which is correct.',
  });
  key(s, 20, 22, [['blue', 'in its worker\'s local top 2']]);
  s.rect(330, 11, 22, 22, { tone: 'amber', width: 2.4 });
  s.text(360, 22, 'video X', { size: 19, anchor: 'start', tone: 'soft' });

  const column = (x, y, title, entries, top) => {
    s.text(x + 60, y, title, { size: 20, weight: 700 });
    entries.forEach((e, i) => {
      const yy = y + 20 + i * 40;
      s.rect(x, yy, 120, 36, { tone: i < top ? 'blue' : 'ink', fill: i < top ? 'hachure' : undefined, width: 1.5 });
      if (e.startsWith('X')) s.rect(x - 5, yy - 3, 130, 42, { tone: 'amber', width: 2.4 });
      s.text(x + 60, yy + 18, e, { size: 21, weight: 600 });
    });
    return { right: x + 120, cx: x + 60, top: y + 20, bottom: y + 20 + entries.length * 40 };
  };

  const panel = (y0, heading, w1, w2, merged, verdict, good) => {
    s.text(20, y0, heading, { size: 21, anchor: 'start', weight: 700 });
    const a = column(30, y0 + 36, 'worker 1', w1, 2);
    const b = column(190, y0 + 36, 'worker 2', w2, 2);
    const M = s.box(510, y0 + 116, 'merge, top 2\n' + merged.join('\n'), { tone: good ? 'green' : 'red', size: 20, w: 150 });
    s.arrow(a.cx, a.bottom + 10, M.left - 8, M.cy + 30, { bend: 36, tone: 'soft' });
    s.arrow(b.right + 8, b.top + 38, M.left - 8, M.cy - 18, { tone: 'soft' });
    s.text(510, M.bottom + 22, verdict, { size: 19, tone: good ? 'green' : 'red', weight: 700 });
  };

  panel(66, 'random partitions: X\'s 80 views split 40 + 40', ['A 50', 'B 45', 'X 40'], ['C 60', 'D 45', 'X 40'], ['C 60', 'A 50'], 'wrong: true top is X 80', false);
  s.line(20, 306, 620, 306, { tone: 'soft', width: 1 });
  panel(336, 'partitioned by video: all 80 of X on worker 1', ['X 80', 'A 50', 'B 45'], ['C 60', 'D 45'], ['X 80', 'C 60'], 'right: X 80, C 60', true);
  s.save(__dirname, 'heap-merge');
}

// ── 2. Sliding window from minute buckets: add the new minute, subtract the expired one ──
{
  const counts = [3, 5, 2, 7, 4, 6, 1];
  const rows = [
    { l: 0, r: 4, calc: '3+5+2+7+4 = 21' },
    { l: 1, r: 5, calc: '21 + 6 − 3 = 24', inn: 5, out: 0 },
    { l: 2, r: 6, calc: '24 + 1 − 5 = 20', inn: 6, out: 1 },
  ];
  const cell = 46, x0 = 120, T = 76, top = T + 44, pitch = 92;
  const s = new Sketch({
    width: 640, height: top + rows.length * pitch - 6, seed: 22,
    title: 'A 5-minute sliding window over one video\'s per-minute view counts',
    desc: 'Per-minute counts 3, 5, 2, 7, 4, 6, 1 for minutes 1 to 7. Window minutes 1 to 5 totals 21; sliding to 2 to 6 adds 6 and subtracts 3 for 24; sliding to 3 to 7 adds 1 and subtracts 5 for 20.',
  });
  s.text(20, 22, 'one video\'s views per minute, 5-minute window', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 54, [['blue', 'in the window'], ['green', 'minute added'], ['red', 'minute subtracted']]);
  counts.forEach((_, i) => s.text(x0 + i * cell + cell / 2, T + 24, i + 1, { size: 17, tone: 'soft' }));
  s.text(x0 - 14, T + 24, 'minute', { size: 17, tone: 'soft', anchor: 'end' });
  s.text(x0 + 7 * cell + 24, T + 24, 'window total', { size: 18, tone: 'soft', anchor: 'start' });
  rows.forEach((row, k) => {
    const y = top + k * pitch;
    const tones = {}, dim = [];
    counts.forEach((_, i) => {
      if (i >= row.l && i <= row.r) tones[i] = 'blue';
      else dim.push(i);
    });
    if (row.inn !== undefined) { tones[row.inn] = 'green'; tones[row.out] = 'red'; }
    const a = s.array(x0, y, counts, { cell, indices: false, tones, dim: dim.filter(i => i !== row.out), size: 22 });
    s.text(x0 - 14, y + cell / 2, `ends ${row.r + 1}`, { size: 19, anchor: 'end', weight: 600 });
    s.span(a.left(row.l) + 3, a.right(row.r) - 3, y + cell + 4, undefined, { tone: 'blue', depth: 7 });
    s.text(x0 + 7 * cell + 24, y + cell / 2, row.calc, { size: 21, anchor: 'start', weight: k ? 600 : 500 });
  });
  s.save(__dirname, 'sliding-buckets');
}

// ── 3. Count-min sketch: three rows, the minimum survives collisions ──────
{
  const rows = [
    ['2', '0', '9', '1', '3', '0', '4', '1'],
    ['1', '3', '0', '0', '2', '5', '3', '6'],
    ['7', '1', '0', '4', '3', '2', '3', '0'],
  ];
  const cats = { '0,2': 'green', '1,5': 'green', '2,0': 'green' };
  const s = new Sketch({
    width: 600, height: 430, seed: 23,
    title: 'Estimating a count from a count-min sketch with three rows',
    desc: 'A 3 by 8 grid of counters, each row with its own hash function and each row summing to 20 events. The key cats hashes to a cell holding 9 in row 1 (cats 5 plus dogs 4), 5 in row 2 (no collision) and 7 in row 3 (cats 5 plus tea 2). The estimate is the minimum, 5, the true count.',
  });
  s.text(20, 22, 'count-min sketch: 3 rows × 8 columns, N = 20 events', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 54, [['green', 'the cell each row\'s hash picks for "cats"']]);
  const g = s.grid(110, 104, rows, { cw: 56, ch: 48, tones: cats, rowLabels: ['row 1, h1', 'row 2, h2', 'row 3, h3'], colLabels: ['0', '1', '2', '3', '4', '5', '6', '7'] });
  s.text(g.right + 14, g.cy(0), 'sum 20', { size: 17, tone: 'soft', anchor: 'start' });
  s.text(g.right + 14, g.cy(1), 'sum 20', { size: 17, tone: 'soft', anchor: 'start' });
  s.text(g.right + 14, g.cy(2), 'sum 20', { size: 17, tone: 'soft', anchor: 'start' });
  const lines = [
    ['row 1: 9 = cats 5 + dogs 4 (a collision)', 'ink'],
    ['row 2: 5 = cats alone', 'ink'],
    ['row 3: 7 = cats 5 + tea 2 (a collision)', 'ink'],
  ];
  lines.forEach(([t, tone], i) => s.text(30, g.bottom + 34 + i * 30, t, { size: 20, anchor: 'start', tone }));
  s.text(30, g.bottom + 136, 'estimate("cats") = min(9, 5, 7) = 5', { size: 22, anchor: 'start', weight: 700, tone: 'green' });
  s.text(30, g.bottom + 166, 'collisions only add, so the minimum is never below the truth', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'count-min');
}
