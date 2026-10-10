// Figures for Part 7, News Feed (HLD series).
//   node _templates/sketches/hld-news-feed/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items, size = 19) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, size) + 24;
  }
}

// ── 1. Where the work goes: fan-out on write vs fan-out on read ───────────
{
  const s = new Sketch({ width: 660, height: 450, title: 'Fan-out on write versus fan-out on read', desc: 'Left: one post by A is inserted into each of its 200 followers\' feeds, and a feed load reads one list. Right: a post is written once, and each feed load looks up 200 authors. Per day at this scale: 10 billion inserts plus 5 billion reads, against 50 million writes plus 1 trillion lookups.', seed: 71 });
  s.line(330, 20, 330, 360, { tone: 'soft', dashed: true, width: 1.3 });
  s.text(165, 26, 'fan-out on write', { size: 24, weight: 700, tone: 'green' });
  s.text(495, 26, 'fan-out on read', { size: 24, weight: 700, tone: 'blue' });

  // left: one post fans out to many feeds
  const A = s.box(165, 84, 'A posts', { tone: 'green', size: 21 });
  const fx = [52, 124, 196, 268];
  const feeds = fx.map((x, i) => s.box(x, 196, i < 3 ? `feed\nF${i + 1}` : '…×200', { size: 19, w: 62, h: 56, tone: i < 3 ? undefined : 'soft' }));
  feeds.forEach(f => s.arrow(A.cx, A.bottom + 4, f.cx, f.top - 6, { tone: 'green' }));
  s.text(165, 252, 'insert post ID into each', { size: 19, tone: 'green' });
  const R1 = s.box(52, 316, 'F1 loads', { tone: 'blue', size: 19 });
  s.arrow(52, feeds[0].bottom + 30, 52, R1.top - 4, { tone: 'blue', head: 'start' });
  s.text(110, 304, 'read 1 list', { size: 19, anchor: 'start', tone: 'blue' });
  s.text(110, 328, '(already built)', { size: 18, anchor: 'start', tone: 'soft' });

  // right: one load fans in from many authors
  const ax = [382, 454, 526, 598];
  const authors = ax.map((x, i) => s.box(x, 96, i < 3 ? `posts\nby A${i + 1}` : '…×200', { size: 19, w: 62, h: 56, tone: i < 3 ? undefined : 'soft' }));
  s.text(495, 146, 'each post stored once', { size: 19, tone: 'soft' });
  const R = s.box(495, 262, 'R loads feed', { tone: 'blue', size: 21 });
  authors.forEach(a => s.arrow(a.cx, a.bottom + 44, R.cx + (a.cx - R.cx) * 0.25, R.top - 6, { tone: 'blue' }));
  s.text(495, 316, '200 lookups + merge,', { size: 19, tone: 'blue' });
  s.text(495, 340, 'on every load', { size: 19, tone: 'blue' });

  // per-day totals
  s.line(20, 372, 640, 372, { tone: 'soft', width: 1.2 });
  s.text(330, 394, 'per day at 50M posts, 5B feed loads, 200 followers each', { size: 19, tone: 'soft' });
  s.text(165, 428, '10B inserts + 5B reads', { size: 22, weight: 700, tone: 'green' });
  s.text(495, 428, '50M writes + 1T lookups', { size: 22, weight: 700, tone: 'blue' });
  s.save(__dirname, 'fanout-cost');
}

// ── 2. One celebrity post blocks the shared fan-out queue ──────────────────
{
  const W = 660, x0 = 70, x1 = 630, T = 300; // 0..300 s
  const X = t => x0 + (x1 - x0) * t / T;
  const s = new Sketch({ width: W, height: 330, title: 'A celebrity post in a pure fan-out-on-write queue', desc: 'Time axis 0 to 300 seconds. The fleet does 350,000 inserts a second. One post to 100 million followers occupies it from about second 5 to second 291. An ordinary post queued at second 6 reaches feeds at about second 292, against a 10-second target.', seed: 72 });
  s.text(20, 24, 'fan-out fleet at peak: 350,000 inserts a second', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['green', 'ordinary posts'], ['red', '1 post, 100M followers'], ['amber', '10 s target']]);

  const qy = 112, qh = 46;
  s.text(x0 - 10, qy + qh / 2, 'queue', { size: 19, anchor: 'end', tone: 'soft' });
  // ordinary posts before and after
  [[0, 2], [2.5, 4.5]].forEach(([a, b]) => s.rect(X(a), qy, X(b) - X(a), qh, { tone: 'green', fill: 'solid', width: 1.2 }));
  s.rect(X(5), qy, X(291) - X(5), qh, { tone: 'red', fill: 'hachure', width: 1.6 });
  s.text((X(5) + X(291)) / 2, qy + qh / 2, '100M inserts ÷ 350k/s ≈ 286 s', { size: 21, weight: 700 });
  [[291, 293.5], [294, 297]].forEach(([a, b]) => s.rect(X(a), qy, X(b) - X(a), qh, { tone: 'green', fill: 'solid', width: 1.2 }));

  // axis
  const ay = 196;
  s.line(x0, ay, x1, ay, { tone: 'ink', width: 1.5 });
  [0, 60, 120, 180, 240, 300].forEach(t => {
    s.line(X(t), ay - 6, X(t), ay + 6, { width: 1.3 });
    s.text(X(t), ay + 22, `${t} s`, { size: 18, tone: 'soft' });
  });

  // freshness target
  s.line(X(16), qy - 18, X(16), ay, { tone: 'amber', dashed: true, width: 2 });
  s.text(X(16) + 6, qy - 24, 'target: seen by 6 + 10 s', { size: 18, anchor: 'start', tone: 'amber' });

  // a friend's post
  s.text(X(297), qy - 24, "friend's post", { size: 18, anchor: 'end', tone: 'green', weight: 700 });
  s.arrow(X(285), qy - 14, X(292), qy - 4, { tone: 'green', headLen: 9 });
  s.text(X(2), 262, 'a friend posts', { size: 19, anchor: 'start', tone: 'green' });
  s.text(X(2), 286, 'at t = 6 s', { size: 19, anchor: 'start', tone: 'green' });
  s.arrow(X(40), 274, X(286), 274, { tone: 'red', dashed: true });
  s.text(X(292), 262, 'followers see it', { size: 19, anchor: 'end', tone: 'red', weight: 700 });
  s.text(X(292), 300, 'at t ≈ 292 s', { size: 19, anchor: 'end', tone: 'red', weight: 700 });
  s.save(__dirname, 'celebrity-backlog');
}

// ── 3. Hybrid read: precomputed feed merged with pulled celebrity posts ────
{
  const s = new Sketch({ width: 640, height: 500, title: 'Hybrid feed read: merge the precomputed feed with celebrity posts', desc: 'The reader\'s precomputed feed (green, filled by fan-out on write) and the recent posts of two followed celebrities (amber, pulled at read time) are merged by time into one page, newest first.', seed: 73 });
  s.text(20, 24, 'one feed load, page size 5', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['green', 'fanned out at post time'], ['amber', 'pulled at read time']]);

  const cw = 118, ch = 38;
  const col = (x, y, head, rows, tone) => {
    s.text(x + cw / 2, y, head, { size: 19, tone: 'soft' });
    rows.forEach((r, i) => s.rect(x, y + 18 + i * ch, cw, ch, { tone, fill: 'hachure', width: 1.4, label: r, size: 20 }));
    return { cx: x + cw / 2, bottom: y + 18 + rows.length * ch };
  };
  const F = col(40, 102, 'your feed (Redis)', ['10:58 p91', '10:41 p88', '10:20 p85', '09:55 p80'], 'green');
  const A = col(270, 102, 'celebrity A', ['10:50 a7', '09:30 a6'], 'amber');
  const B = col(470, 102, 'celebrity B', ['10:45 b3', '08:12 b2'], 'amber');

  const M = s.box(320, 342, 'merge by time, take 5', { size: 21 });
  s.arrow(F.cx, F.bottom + 6, M.left + 40, M.top - 6, { tone: 'green' });
  s.arrow(A.cx, A.bottom + 6, M.cx + 10, M.top - 6, { tone: 'amber' });
  s.arrow(B.cx, B.bottom + 6, M.right - 30, M.top - 6, { tone: 'amber' });

  const page = [['10:58 p91', 'green'], ['10:50 a7', 'amber'], ['10:45 b3', 'amber'], ['10:41 p88', 'green'], ['10:20 p85', 'green']];
  const pw = 112, px = 320 - (page.length * pw) / 2;
  page.forEach(([l, t], i) => s.rect(px + i * pw, 414, pw, 40, { tone: t, fill: 'hachure', width: 1.5, label: l, size: 20 }));
  s.arrow(M.cx, M.bottom + 4, M.cx, 408, {});
  s.text(320, 478, 'the page, newest first; the cursor is "older than 10:20 p85"', { size: 19, tone: 'soft' });
  s.save(__dirname, 'hybrid-merge');
}

// ── 4. Offset pagination duplicates; a cursor does not ────────────────────
{
  const before = [40, 39, 38, 37, 36, 35, 34, 33, 32, 31];
  const after = [43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31];
  const cell = 40, x0 = 136;
  const s = new Sketch({ width: 680, height: 470, title: 'Offset pagination versus cursor pagination', desc: 'Page size 5. Page one shows posts 40 to 36. Three new posts arrive. Asking for offset 5 returns 38, 37, 36 again plus 35 and 34. Asking for posts older than 36 returns 35 to 31 with no repeats.', seed: 74 });
  s.text(20, 24, 'page size 5; 3 new posts arrive before page 2', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['blue', 'page 1'], ['violet', 'new'], ['red', 'shown again'], ['green', 'correct page 2']], 18);

  // feed when page 1 was served
  const tb = {}; [0, 1, 2, 3, 4].forEach(i => { tb[i] = 'blue'; });
  s.array(x0, 102, before, { cell, tones: tb, indices: false, size: 20 });
  s.text(x0 - 12, 122, 'page 1', { size: 19, anchor: 'end', weight: 600 });
  s.span(x0 + 3, x0 + 5 * cell - 3, 146, 'newest first: 40 … 36', { tone: 'blue', size: 18 });

  // offset page 2
  const to = { 0: 'violet', 1: 'violet', 2: 'violet', 5: 'red', 6: 'red', 7: 'red' };
  const a = s.array(x0, 222, after, { cell, tones: to, indices: true, size: 20 });
  s.text(x0 - 12, 234, 'offset=5', { size: 19, anchor: 'end', weight: 600, tone: 'red' });
  s.text(x0 - 12, 256, 'limit=5', { size: 18, anchor: 'end', tone: 'soft' });
  s.span(a.left(5) + 3, a.right(9) - 3, a.bottom - 2, 'returns 38 37 36 35 34', { tone: 'red', size: 18 });

  // cursor page 2
  const tc = { 0: 'violet', 1: 'violet', 2: 'violet', 8: 'green', 9: 'green', 10: 'green', 11: 'green', 12: 'green' };
  const c = s.array(x0, 352, after, { cell, tones: tc, indices: false, size: 20 });
  s.text(x0 - 12, 364, 'older', { size: 19, anchor: 'end', weight: 600, tone: 'green' });
  s.text(x0 - 12, 386, 'than 36', { size: 19, anchor: 'end', weight: 600, tone: 'green' });
  s.span(c.left(8) + 3, c.right(12) - 3, c.bottom + 2, 'returns 35 34 33 32 31', { tone: 'green', size: 18 });
  s.save(__dirname, 'offset-vs-cursor');
}
