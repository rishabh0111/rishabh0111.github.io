// Figures for HLD Part 13, Design a web crawler.
//   node _templates/sketches/hld-web-crawler/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. Politeness: per-host spacing and the heap of next-allowed times ────
{
  const x0 = 150, pxs = 92;               // t = 0 s at x0, 92 px per second
  const X = t => x0 + t * pxs;
  const rows = [
    { host: 'a.com', note: 'delay 1 s', y: 128, tone: 'blue', at: [0, 1, 2, 3, 4, 5] },
    { host: 'b.org', note: 'robots: 2 s', y: 196, tone: 'violet', at: [0.3, 2.3, 4.3] },
    { host: 'c.net', note: 'got a 503', y: 264, tone: 'amber', at: [0.6, 1.6] },
  ];
  const s = new Sketch({ width: 660, height: 470, title: 'One fetcher spacing requests to the three hosts it owns', desc: 'Timeline from 0 to 5 seconds. a.com is fetched every second, b.org every 2 seconds because its robots.txt asks for it, c.net answered 503 at 1.6 s and must wait 4 s. At t = 2 s the heap of next-allowed times holds a.com at 2.0 s, b.org at 2.3 s and c.net at 5.6 s, so a.com is fetched next.', seed: 13 });
  s.text(20, 24, 'one fetcher, three hosts it owns: fetch only from a host that is due', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 62, [['blue', 'a fetch'], ['red', '503: back off'], ['green', 'due now']]);
  // rows
  rows.forEach(r => {
    s.text(x0 - 22, r.y - 9, r.host, { size: 21, anchor: 'end', weight: 600 });
    s.text(x0 - 22, r.y + 14, r.note, { size: 17, anchor: 'end', tone: 'soft' });
    s.line(x0, r.y, X(5.2), r.y, { tone: 'soft', width: 1.2 });
    r.at.forEach(t => {
      const bad = r.host === 'c.net' && t === 1.6;
      const due = r.host === 'a.com' && t === 2;
      s.circle(X(t), r.y, 20, { tone: bad ? 'red' : (due ? 'green' : 'blue'), fill: 'hachure', hachureGap: 4, width: 1.6 });
    });
  });
  s.span(X(3) + 4, X(4) - 4, 128 - 14, '1 s', { side: 'above', tone: 'blue', depth: 7 });
  s.span(X(2.3) + 4, X(4.3) - 4, 196 - 14, '2 s', { side: 'above', tone: 'violet', depth: 7 });
  s.arrow(X(1.6) + 12, 264, X(5.3), 264, { tone: 'red', width: 1.6, dashed: true });
  s.text(X(3.6), 240, 'wait 4 s, next at 5.6 s', { size: 19, tone: 'red' });
  // now line
  s.line(X(2), 92, X(2), 300, { tone: 'green', dashed: true, width: 1.6 });
  s.text(X(2) + 8, 98, 'now, t = 2 s', { size: 18, tone: 'green', weight: 600, anchor: 'start' });
  // axis
  s.line(x0, 318, X(5.2), 318, { tone: 'ink', width: 1.4 });
  for (let t = 0; t <= 5; t++) {
    s.line(X(t), 312, X(t), 324, { tone: 'ink', width: 1.3 });
    s.text(X(t), 340, `${t} s`, { size: 17, tone: 'soft' });
  }
  // heap snapshot
  s.text(20, 384, 'its heap at t = 2 s, earliest first:', { size: 20, anchor: 'start', weight: 600 });
  const heap = [['a.com  2.0 s', 'green'], ['b.org  2.3 s', 'ink'], ['c.net  5.6 s', 'ink']];
  heap.forEach(([l, t], i) => s.rect(330 + i * 108, 366, 102, 38, { tone: t, fill: t === 'green' ? 'hachure' : undefined, label: l, size: 18, width: 1.5 }));
  s.text(381, 428, 'top is due: fetch it,', { size: 18, tone: 'green' });
  s.text(381, 450, 'push back at 3.0 s', { size: 18, tone: 'green' });
  s.save(__dirname, 'politeness-heap');
}

// ── 2. Bloom filter: two adds, one false positive, one definite miss ─────
{
  const cell = 34, x = 48, y = 128;
  const set = [2, 4, 7, 11, 13];
  const bits = Array.from({ length: 16 }, (_, i) => (set.includes(i) ? 1 : 0));
  const tones = {}; set.forEach(i => { tones[i] = 'blue'; });
  const s = new Sketch({ width: 640, height: 420, title: 'A 16-bit Bloom filter with three hash functions per URL', desc: 'a.com/x set bits 2, 7 and 11; b.org/y set bits 4, 7 and 13. Checking c.net/z hits bits 2, 4 and 13, all set, so it reads as probably seen although it was never added: a false positive. Checking d.io/w hits bits 1, 7 and 9; bit 1 is 0, so it is definitely new.', seed: 14 });
  s.text(20, 24, 'Bloom filter: 16 bits, 3 hashes per URL', { size: 21, anchor: 'start', weight: 700 });
  s.text(20, 58, 'added a.com/x  →  bits 2, 7, 11', { size: 19, anchor: 'start' });
  s.text(20, 84, 'added b.org/y  →  bits 4, 7, 13', { size: 19, anchor: 'start' });
  s.rect(400, 60, 22, 22, { tone: 'blue', fill: 'hachure', width: 1.4 });
  s.text(430, 71, 'bit set to 1', { size: 19, anchor: 'start', tone: 'soft' });
  const a = s.array(x, y, bits, { cell, tones, size: 21 });
  // queries from below
  const q = (idx, tone) => idx.forEach(i => s.arrow(a.cx(i), 250, a.cx(i), a.bottom + 4, { tone, width: 1.6, headLen: 9 }));
  q([2, 4, 13], 'amber');
  q([1, 7, 9], 'violet');
  s.text(a.cx(2), 266, 'c', { size: 19, tone: 'amber', weight: 700 });
  s.text(a.cx(4), 266, 'c', { size: 19, tone: 'amber', weight: 700 });
  s.text(a.cx(13), 266, 'c', { size: 19, tone: 'amber', weight: 700 });
  s.text(a.cx(1), 266, 'd', { size: 19, tone: 'violet', weight: 700 });
  s.text(a.cx(7), 266, 'd', { size: 19, tone: 'violet', weight: 700 });
  s.text(a.cx(9), 266, 'd', { size: 19, tone: 'violet', weight: 700 });
  s.rect(a.left(1) - 4, y - 4, cell + 8, cell + 8, { tone: 'red', width: 2.2 });
  s.text(20, 310, 'c = c.net/z hits 2, 4, 13: all 1, so "probably seen".', { size: 19, anchor: 'start', tone: 'amber' });
  s.text(20, 336, 'It was never added. That is a false positive.', { size: 19, anchor: 'start', tone: 'amber' });
  s.text(20, 374, 'd = d.io/w hits 1, 7, 9: bit 1 is 0, so "definitely new".', { size: 19, anchor: 'start', tone: 'violet' });
  s.text(20, 400, 'A Bloom filter can be wrong about "seen", never about "new".', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'bloom-filter');
}

// ── 3. Retries with exponential backoff, then the dead-letter queue ──────
{
  const x0 = 50, ppm = 34;                // 34 px per minute, 0..16 min
  const X = m => x0 + m * ppm;
  const tries = [0, 1, 3, 7, 15];
  const s = new Sketch({ width: 660, height: 330, title: 'One URL retried with exponential backoff, then parked in a dead-letter queue', desc: 'Attempts at 0, 1, 3, 7 and 15 minutes, the gaps doubling 1, 2, 4, 8 minutes. All five fail, so the URL moves to the dead-letter queue instead of retrying forever.', seed: 15 });
  s.text(20, 24, 'a URL that keeps timing out: wait longer each time, then park it', { size: 21, anchor: 'start', weight: 700 });
  s.text(20, 56, 'wait = 1 min × 2^(attempt − 1), plus a little random jitter; give up after 5', { size: 19, anchor: 'start', tone: 'soft' });
  const yA = 150;
  s.line(x0, yA, X(16), yA, { tone: 'soft', width: 1.2 });
  tries.forEach((m, i) => {
    s.circle(X(m), yA, 20, { tone: 'red', fill: 'hachure', hachureGap: 4, width: 1.6 });
    s.text(X(m), yA + 26, `#${i + 1}`, { size: 18, tone: 'red', weight: 700 });
  });
  const gaps = ['1', '2 min', '4 min', '8 min'];
  s.text((X(0) + X(1)) / 2, yA - 30, '1 min', { size: 18 });
  for (let i = 1; i < 4; i++) s.span(X(tries[i]) + 10, X(tries[i + 1]) - 10, yA - 16, gaps[i], { side: 'above', tone: 'ink', depth: 7 });
  // axis
  s.line(x0, 204, X(16), 204, { tone: 'ink', width: 1.4 });
  for (let m = 0; m <= 16; m += 2) {
    s.line(X(m), 198, X(m), 210, { tone: 'ink', width: 1.3 });
    s.text(X(m), 226, m === 16 ? '16 min' : `${m}`, { size: 17, tone: 'soft' });
  }
  const dlq = s.box(X(15) - 80, 290, 'dead-letter queue:\na person looks at it', { tone: 'amber', size: 19 });
  s.arrow(X(15), yA + 42, X(15), dlq.top - 6, { tone: 'amber', width: 1.7 });
  s.text(X(15) + 10, 250, '5th failure', { size: 18, tone: 'amber', anchor: 'start', weight: 600 });
  s.save(__dirname, 'retry-backoff');
}
