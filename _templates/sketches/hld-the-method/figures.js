// Figures for Part 1, The method (High-Level Design, Question by Question).
//   node _templates/sketches/hld-the-method/figures.js
const { Sketch } = require('../sketch');

// ── 1. The 45-minute clock ─────────────────────────────────────────────────
{
  // [first minute, last minute, tone, label]. 8 degrees of the face per minute.
  const stages = [
    [0, 3, 'soft', 'Hello, the question', 3],
    [3, 8, 'blue', 'Requirements', 5],
    [8, 10, 'violet', 'Core entities', 2],
    [10, 15, 'cyan', 'API', 5],
    [15, 30, 'green', 'High-level design', 15],
    [30, 40, 'amber', 'Deep dives', 10],
    [40, 45, 'soft', 'Your questions', 5],
  ];
  const W = 660, H = 470, cx = 196, cy = 250, d = 300, r = d / 2;
  const s = new Sketch({
    width: W, height: H, seed: 11,
    title: 'The 45-minute system design round as a clock face, with a time box for each stage',
    desc: 'Minutes 0 to 3 hello and the question; 3 to 8 requirements; 8 to 10 core entities; 10 to 15 API; 15 to 30 high-level design, with data flow folded in when the question is a pipeline; 30 to 40 deep dives; 40 to 45 your questions. A marker at minute 30 says an end-to-end design must exist by then.',
  });
  const ang = m => -Math.PI / 2 + m * (2 * Math.PI / 45);
  s.text(20, 26, 'the 45-minute round, one stage at a time', { size: 23, anchor: 'start', weight: 700 });

  for (const [a, b, tone] of stages) {
    s._emit(s.gen.arc(cx, cy, d, d, ang(a), ang(b), true, s._opts({ fill: 'hachure', hachureGap: 7 })), tone);
  }
  // boundary minutes around the rim
  for (const m of [0, 3, 8, 10, 15, 30, 40]) {
    const a = ang(m), rr = r + 22;
    s.text(cx + rr * Math.cos(a), cy + rr * Math.sin(a), m === 0 ? '0 / 45' : m, { size: 20, tone: 'soft', weight: 600 });
  }
  // the minute-30 line, drawn heavier
  s.line(cx, cy, cx + (r + 4) * Math.cos(ang(30)), cy + (r + 4) * Math.sin(ang(30)), { tone: 'red', width: 3 });
  s.circle(cx, cy, 10, { tone: 'ink', fill: 'hachure', hachureGap: 2.5 });

  // key on the right: swatch, stage, minutes
  const kx = 392, ky = 92, pitch = 40;
  stages.forEach(([, , tone, label, mins], i) => {
    const y = ky + i * pitch + (i > 4 ? 22 : 0);
    s.rect(kx, y - 12, 24, 24, { tone, fill: 'hachure', width: 1.4 });
    s.text(kx + 34, y, label, { size: 21, anchor: 'start' });
    s.text(W - 14, y, `${mins} min`, { size: 20, anchor: 'end', tone: 'soft' });
  });
  s.text(kx + 34, ky + 4 * pitch + 28, 'data flow fits in here when needed', { size: 18, anchor: 'start', tone: 'soft' });

  // the callout for minute 30
  const ly = ky + 7 * pitch + 46;
  s.line(kx, ly - 4, kx + 26, ly - 4, { tone: 'red', width: 3 });
  s.text(kx + 34, ly - 4, 'by minute 30 every', { size: 21, anchor: 'start', tone: 'red', weight: 700 });
  s.text(kx + 34, ly + 22, 'requirement has a path', { size: 21, anchor: 'start', tone: 'red', weight: 700 });
  s.save(__dirname, 'clock');
}

// ── 2. Patterns x parts ────────────────────────────────────────────────────
{
  const patterns = ['Scaling reads', 'Scaling writes', 'Large blobs', 'Contention', 'Real-time updates', 'Long-running tasks', 'Multi-step processes', 'Proximity & search'];
  const parts = [
    [2, 'url shortener'], [3, 'rate limiter'], [4, 'dropbox'], [5, 'youtube'], [6, 'ticketmaster'],
    [7, 'news feed'], [8, 'whatsapp'], [9, 'uber'], [10, 'post search'], [11, 'top-k'],
    [12, 'ad clicks'], [13, 'web crawler'], [14, 'notifications'], [15, 'job scheduler'],
    [16, 'payments'], [17, 'google docs'],
  ];
  // [pattern index, part number]
  const main = [[0, 2], [1, 3], [3, 3], [2, 4], [2, 5], [5, 5], [3, 6], [0, 7], [4, 8], [7, 9], [7, 10], [1, 11], [1, 12], [5, 13], [5, 14], [5, 15], [6, 16], [4, 17]];
  const also = [[0, 5], [4, 4], [0, 6], [6, 6], [7, 6], [1, 7], [1, 9], [3, 9], [4, 9], [1, 10], [0, 10], [0, 11], [6, 12], [6, 14], [3, 15], [3, 16], [3, 17], [1, 2]];
  const cw = 28, ch = 34, x0 = 196, y0 = 170;
  const W = 680, H = y0 + patterns.length * ch + 70;
  const s = new Sketch({
    width: W, height: H, seed: 12,
    title: 'Which of the eight recurring patterns each part of the series teaches',
    desc: 'A grid with the eight patterns as rows and parts 2 to 17 as columns. A filled cell is the part\'s main pattern, a dot is a pattern the part also uses. Scaling reads: main in 2 and 7. Scaling writes: main in 3, 11 and 12. Large blobs: 4 and 5. Contention: 3 and 6. Real-time updates: 8 and 17. Long-running tasks: 5, 13, 14 and 15. Multi-step processes: 16. Proximity and search: 9 and 10.',
  });
  s.text(20, 24, 'eight patterns, sixteen questions', { size: 23, anchor: 'start', weight: 700 });
  const tones = {};
  for (const [p, n] of main) tones[`${p},${n - 2}`] = 'blue';
  const rows = patterns.map(() => parts.map(() => ''));
  const g = s.grid(x0, y0, rows, { cw, ch, tones, rowLabels: patterns });
  parts.forEach(([n, name], c) => {
    s.text(g.cx(c), y0 - 14, n, { size: 17, tone: 'soft', weight: 600 });
    s.text(g.cx(c) - 4, y0 - 32, name, { size: 17, anchor: 'start', rotate: -62, tone: 'soft' });
  });
  for (const [p, n] of also) s.circle(g.cx(n - 2), g.cy(p), 12, { tone: 'ink', fill: 'hachure', hachureGap: 2.5 });
  s.text(x0 - 10, y0 - 14, 'part', { size: 17, tone: 'soft', anchor: 'end' });
  // key
  const ky = g.bottom + 34;
  s.rect(x0, ky - 12, 24, 24, { tone: 'blue', fill: 'hachure', width: 1.4 });
  s.text(x0 + 32, ky, 'the part\'s main pattern', { size: 19, anchor: 'start', tone: 'soft' });
  s.circle(x0 + 252, ky, 12, { tone: 'ink', fill: 'hachure', hachureGap: 2.5 });
  s.text(x0 + 266, ky, 'also used there', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'patterns');
}
