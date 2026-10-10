// Figures for Part 2, Design a URL shortener (High-Level Design, Question by Question).
//   node _templates/sketches/hld-url-shortener/figures.js
const { Sketch } = require('../sketch');

// ── 1. Counter ranges leased 1,000 at a time ───────────────────────────────
{
  const W = 660, H = 400;
  const s = new Sketch({
    width: W, height: H, seed: 21,
    title: 'Link service instances lease blocks of 1,000 IDs from one counter and hand them out locally',
    desc: 'A number line of IDs split into blocks of 1,000. Server A holds 1,000,000 to 1,000,999 and has used 417 of them. Server B holds the next block and has used 680. Server C held the third block and crashed; its unused IDs are lost, which is harmless with 3.5 trillion codes. After restarting, C leased the fourth block. The durable counter stands at 1,004,000, where the next lease starts. One counter call per 1,000 links is 3.5 calls a second at the 3,500 a second peak.',
  });
  s.text(20, 26, 'one counter, leased in blocks of 1,000', { size: 23, anchor: 'start', weight: 700 });
  const x0 = 34, bw = 118, top = 112, bh = 56;
  const blocks = [
    { owner: 'server A', tone: 'blue', used: 0.417, from: '1,000,000', note: 'next: 1,000,417' },
    { owner: 'server B', tone: 'green', used: 0.68, from: '1,001,000', note: 'next: 1,001,680' },
    { owner: 'server C', tone: 'red', used: 0.3, from: '1,002,000', note: 'C crashed', dashed: true },
    { owner: 'C, restarted', tone: 'violet', used: 0.05, from: '1,003,000', note: 'next: 1,003,050' },
    { owner: 'not leased', tone: 'soft', used: 0, from: '1,004,000', note: '', dashed: true },
  ];
  blocks.forEach((b, i) => {
    const x = x0 + i * bw;
    s.rect(x, top, bw - 6, bh, { tone: b.tone === 'soft' ? 'soft' : b.tone, dashed: b.dashed, width: 1.6 });
    if (b.used) s.rect(x + 3, top + 3, (bw - 12) * b.used, bh - 6, { tone: b.tone, fill: 'hachure', width: 0.8, hachureGap: 5 });
    s.text(x + (bw - 6) / 2, top - 20, b.owner, { size: 20, tone: b.tone === 'soft' ? 'soft' : b.tone, weight: 700 });
    s.text(x + (bw - 6) / 2, top + bh + 20, b.from, { size: 19, tone: 'soft' });
    if (b.note) s.text(x + (bw - 6) / 2, top + bh + 44, b.note, { size: 18, tone: b.tone === 'red' ? 'red' : 'ink' });
  });
  s.text(x0, top + bh + 76, 'each block is 1,000 IDs; hatched = already handed out', { size: 19, anchor: 'start', tone: 'soft' });

  // the counter
  const cx = x0 + 4 * bw - 3;
  const box = s.box(cx, 318, 'durable counter\nnext += 1000 -> 1,004,000', { tone: 'cyan', size: 20 });
  s.arrow(cx + 50, box.top - 6, x0 + 4 * bw + (bw - 6) / 2, top + bh + 36, { tone: 'cyan', width: 1.8 });
  s.text(20, 300, 'C\'s unused IDs are lost:', { size: 20, anchor: 'start', tone: 'red' });
  s.text(20, 326, 'harmless with 3.5 trillion codes', { size: 20, anchor: 'start', tone: 'red' });
  s.text(20, 372, 'one counter call per 1,000 links = 3.5 calls/s at peak', { size: 20, anchor: 'start', weight: 600 });
  s.save(__dirname, 'counter-ranges');
}

// ── 2. The read path as a funnel ───────────────────────────────────────────
{
  const W = 620, H = 430;
  const s = new Sketch({
    width: W, height: H, seed: 22,
    title: 'How 347,000 redirects a second at peak shrink to about 1,700 database reads',
    desc: 'A funnel of three bars. 347,000 redirects a second arrive. The CDN answers half (an assumed hit rate), so 174,000 a second reach the redirect servers. Redis answers 99 percent of those (assumed), so about 1,700 a second reach the database.',
  });
  s.text(20, 26, 'peak redirects, layer by layer', { size: 23, anchor: 'start', weight: 700 });
  const cx = 310, full = 540;
  const rows = [
    { y: 84, w: full, tone: 'blue', label: '347,000 / s arrive' },
    { y: 214, w: full / 2, tone: 'blue', label: '174,000 / s' },
    { y: 344, w: 26, tone: 'red', label: '~1,700 / s reach the database', outside: true },
  ];
  rows.forEach(r => {
    s.rect(cx - r.w / 2, r.y - 22, r.w, 44, { tone: r.tone, fill: 'hachure', width: 1.6 });
    if (r.outside) s.text(cx + r.w / 2 + 14, r.y, r.label, { size: 21, anchor: 'start', weight: 700, tone: 'red' });
    else s.text(cx, r.y, r.label, { size: 22, weight: 700 });
  });
  const layer = (y, name, hit, answered) => {
    s.arrow(cx, y - 36, cx, y + 36, { tone: 'ink', width: 1.6 });
    s.text(cx - 22, y - 10, name, { size: 21, anchor: 'end', weight: 700, tone: 'green' });
    s.text(cx - 22, y + 16, hit, { size: 19, anchor: 'end', tone: 'soft' });
    s.text(cx + 22, y, answered, { size: 20, anchor: 'start', tone: 'green' });
  };
  layer(149, 'CDN edge cache', '50% hit (assumed)', 'answers 173,000 / s');
  layer(279, 'Redis cluster', '99% hit (assumed)', 'answers 172,000 / s');
  s.text(20, 404, 'green = answered by a cache; red = what the store must serve', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'read-funnel');
}

// ── 3. 301 versus 302 over two clicks ──────────────────────────────────────
{
  const W = 660, H = 456;
  const s = new Sketch({
    width: W, height: H, seed: 23,
    title: 'Two clicks on the same short link with a 301 and with a 302',
    desc: 'With 301 Moved Permanently, the first click goes browser to shortener to site; the browser caches the redirect, so the second click goes straight to the site and the shortener never sees it: 1 of 2 clicks counted. With 302 Found, both clicks go through the shortener: 2 of 2 counted.',
  });
  const panel = (px, title, cached) => {
    const xb = px + 30, xs = px + 150, xd = px + 270;
    s.text(px + 150, 28, title, { size: 22, weight: 700 });
    [[xb, 'browser'], [xs, 'shortener'], [xd, 'site']].forEach(([x, l]) => {
      s.text(x, 66, l, { size: 19, tone: 'soft', weight: 600 });
      s.line(x, 82, x, 380, { tone: 'soft', dashed: true, width: 1.2 });
    });
    const click = (y0, n, viaShortener) => {
      s.text(px + 4, y0 - 24, `click ${n}`, { size: 19, anchor: 'start', weight: 700 });
      if (viaShortener) {
        s.arrow(xb + 4, y0, xs - 6, y0, { tone: 'blue', width: 1.8 });
        s.arrow(xs - 4, y0 + 34, xb + 6, y0 + 34, { tone: 'blue', width: 1.8, label: cached ? '301' : '302', size: 19 });
        s.circle(xs, y0, 18, { tone: 'green', fill: 'hachure', hachureGap: 3 });
        s.arrow(xb + 4, y0 + 72, xd - 6, y0 + 72, { tone: 'ink', width: 1.6 });
      } else {
        s.text(xb + 8, y0 + 18, 'cached 301', { size: 18, anchor: 'start', tone: 'amber', weight: 700 });
        s.arrow(xb + 4, y0 + 72, xd - 6, y0 + 72, { tone: 'ink', width: 1.6 });
        s.text(xs + 16, y0 + 18, 'never sees it', { size: 18, anchor: 'start', tone: 'red', weight: 700 });
      }
    };
    click(126, 1, true);
    click(266, 2, !cached);
    s.text(px + 150, 404, cached ? 'counts 1 of 2 clicks' : 'counts 2 of 2 clicks', { size: 21, weight: 700, tone: cached ? 'red' : 'green' });
  };
  panel(10, '301 Moved Permanently', true);
  panel(340, '302 Found', false);
  s.line(330, 50, 330, 420, { tone: 'soft', width: 1.2 });
  s.circle(24, 432, 14, { tone: 'green', fill: 'hachure', hachureGap: 3 });
  s.text(38, 432, '= click counted by the shortener', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'redirect-301-302');
}
