// Figures for Part 3, Design a distributed rate limiter (High-Level Design, Question by Question).
//   node _templates/sketches/hld-rate-limiter/figures.js
const { Sketch } = require('../sketch');

// Shared time axis for the two window figures: 0:00 to 2:00, 270 px a minute.
const X0 = 60, PX_MIN = 270;
const tx = sec => X0 + (sec / 60) * PX_MIN;
function axis(s, y) {
  s.line(X0 - 10, y, tx(120) + 10, y, { tone: 'soft', width: 1.4 });
  for (const [sec, l] of [[0, '0:00'], [30, '0:30'], [60, '1:00'], [90, '1:30'], [120, '2:00']]) {
    s.line(tx(sec), y - 6, tx(sec), y + 6, { tone: 'soft', width: 1.4 });
    s.text(tx(sec), y + 24, l, { size: 18, tone: 'soft' });
  }
}

// ── 1. Fixed window: the boundary burst ────────────────────────────────────
{
  const W = 640, H = 330, ay = 250;
  const s = new Sketch({
    width: W, height: H, seed: 31,
    title: 'Fixed window counter with a limit of 100 a minute lets 200 requests through in two seconds',
    desc: 'Two one-minute windows, 0:00 to 1:00 and 1:00 to 2:00. 100 requests arrive at 0:59 and 100 more at 1:00. Each window counts exactly 100, so all 200 are allowed, although they arrived within two seconds.',
  });
  s.text(20, 26, 'fixed window, limit 100 per minute', { size: 23, anchor: 'start', weight: 700 });
  s.rect(tx(0), 120, PX_MIN - 4, 110, { tone: 'blue', width: 1.6 });
  s.rect(tx(60) + 4, 120, PX_MIN - 4, 110, { tone: 'violet', width: 1.6 });
  s.text(tx(25), 142, 'window 1 counts 100', { size: 20, tone: 'blue', weight: 700 });
  s.text(tx(95), 142, 'window 2 counts 100', { size: 20, tone: 'violet', weight: 700 });
  s.text(tx(25), 170, 'allowed: 100 ≤ 100', { size: 19, tone: 'soft' });
  s.text(tx(95), 170, 'allowed: 100 ≤ 100', { size: 19, tone: 'soft' });
  // the two bursts
  s.rect(tx(59) - 14, 184, 14, 46, { tone: 'blue', fill: 'hachure', hachureGap: 2.5, width: 1.6 });
  s.rect(tx(60) + 4, 184, 14, 46, { tone: 'violet', fill: 'hachure', hachureGap: 2.5, width: 1.6 });
  s.span(tx(59) - 14, tx(60) + 18, 112, '200 requests in 2 seconds', { side: 'above', tone: 'red', size: 21 });
  s.text(tx(59) - 22, 208, '100 at 0:59', { size: 18, anchor: 'end', weight: 600 });
  s.text(tx(60) + 26, 208, '100 at 1:00', { size: 18, anchor: 'start', weight: 600 });
  axis(s, ay);
  s.text(20, 312, 'the count resets at 1:00, so a burst that straddles the reset is split in two', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'fixed-window');
}

// ── 2. Sliding window counter ──────────────────────────────────────────────
{
  const W = 640, H = 380, ay = 250, now = 75;
  const s = new Sketch({
    width: W, height: H, seed: 32,
    title: 'Sliding window counter: estimating the last 60 seconds from two fixed-window counts',
    desc: 'The previous minute, 0:00 to 1:00, counted 84 requests. The current minute has counted 36 so far, and it is now 1:15. The last 60 seconds run from 0:15 to 1:15 and cover 75 percent of the previous minute, so the estimate is 84 times 0.75 plus 36, which is 99. Below the limit of 100, so this request is allowed and counted; the next one estimates 100 and is rejected.',
  });
  s.text(20, 26, 'sliding window counter, limit 100 per minute, now = 1:15', { size: 22, anchor: 'start', weight: 700 });
  s.rect(tx(0), 150, PX_MIN - 4, 80, { tone: 'violet', width: 1.6 });
  s.rect(tx(15), 154, tx(60) - tx(15) - 8, 72, { tone: 'violet', fill: 'hachure', hachureGap: 11, width: 0.6 });
  s.text(tx(30), 178, 'previous minute: 84', { size: 20, weight: 700, tone: 'violet' });
  s.text(tx(37), 206, '75% of it is in the window', { size: 18, tone: 'soft' });
  s.rect(tx(60) + 4, 150, tx(now) - tx(60) - 4, 80, { tone: 'blue', fill: 'hachure', width: 1.6 });
  s.rect(tx(60) + 4, 150, PX_MIN - 4, 80, { tone: 'blue', dashed: true, width: 1.2 });
  s.text(tx(now) + 14, 178, 'current minute', { size: 20, anchor: 'start', weight: 700, tone: 'blue' });
  s.text(tx(now) + 14, 206, 'so far: 36', { size: 20, anchor: 'start', weight: 700, tone: 'blue' });
  s.line(tx(now), 110, tx(now), ay, { tone: 'red', width: 2.4 });
  s.text(tx(now), 98, 'now', { size: 19, tone: 'red', weight: 700 });
  s.span(tx(15), tx(now), 136, 'the last 60 seconds', { side: 'above', tone: 'green', size: 20 });
  axis(s, ay);
  s.text(20, 312, 'estimate = 84 × 0.75 + 36 = 99, below 100: allow, count it (37)', { size: 20, anchor: 'start', tone: 'green', weight: 600 });
  s.text(20, 344, 'next request: 84 × 0.75 + 37 = 100, not below 100: reject', { size: 20, anchor: 'start', tone: 'red', weight: 600 });
  s.save(__dirname, 'sliding-counter');
}

// ── 3. Token bucket over eight seconds ─────────────────────────────────────
{
  const W = 640, H = 420, px0 = 80, pxs = 62, py0 = 330, pyt = 21;
  const X = t => px0 + t * pxs, Y = k => py0 - k * pyt;
  const s = new Sketch({
    width: W, height: H, seed: 33,
    title: 'Tokens in a bucket of capacity 10 refilling at 1 token a second, over eight seconds',
    desc: 'At t = 0 the bucket is full with 10 tokens. 12 requests arrive: 10 are allowed and empty the bucket, 2 are rejected with a retry hint of about one second. The bucket refills along a straight line to 3 tokens at t = 3. 5 requests arrive: 3 are allowed, 2 rejected. By t = 8 it has refilled to 5.',
  });
  s.text(20, 26, 'token bucket: capacity 10, refill 1 token a second', { size: 22, anchor: 'start', weight: 700 });
  // axes
  s.line(px0, py0, X(8.4), py0, { tone: 'soft', width: 1.4 });
  s.line(px0, py0, px0, Y(10.8), { tone: 'soft', width: 1.4 });
  for (let t = 0; t <= 8; t++) s.text(X(t), py0 + 20, t, { size: 18, tone: 'soft' });
  s.text(X(8.4), py0 + 46, 'seconds', { size: 18, tone: 'soft', anchor: 'end' });
  for (const k of [0, 5, 10]) s.text(px0 - 12, Y(k), k, { size: 18, tone: 'soft', anchor: 'end' });
  s.text(px0 - 12, Y(10) - 26, 'tokens', { size: 18, tone: 'soft', anchor: 'start' });
  s.line(px0, Y(10), X(8.4), Y(10), { tone: 'soft', dashed: true, width: 1.2 });
  s.text(X(8.4), Y(10) - 14, 'capacity 10', { size: 18, tone: 'soft', anchor: 'end' });
  // the token level
  s.path([[X(0), Y(10)], [X(0) + 2, Y(0)], [X(3), Y(3)], [X(3) + 2, Y(0)], [X(8), Y(5)]], { smooth: false, tone: 'blue', width: 2.6 });
  s.text(X(6.3), Y(2.6) + 18, 'refill: +1 a second', { size: 19, tone: 'blue', rotate: -18 });
  // bursts
  s.text(X(0) + 14, Y(8.6), '12 arrive at t=0:', { size: 19, anchor: 'start', weight: 700 });
  s.text(X(0) + 14, Y(7.4), '10 allowed', { size: 19, anchor: 'start', tone: 'green', weight: 700 });
  s.text(X(0) + 14, Y(6.2), '2 rejected, retry ~1 s', { size: 19, anchor: 'start', tone: 'red', weight: 700 });
  s.text(X(3) + 14, Y(8.6) + 64, '5 arrive at t=3:', { size: 19, anchor: 'start', weight: 700 });
  s.text(X(3) + 14, Y(7.4) + 64, '3 allowed,', { size: 19, anchor: 'start', weight: 700, tone: 'green' });
  s.text(X(3) + 92, Y(7.4) + 64, '2 rejected', { size: 19, anchor: 'start', weight: 700, tone: 'red' });
  s.circle(X(3), Y(3), 10, { tone: 'blue', fill: 'hachure', hachureGap: 2.5 });
  s.circle(X(8), Y(5), 10, { tone: 'blue', fill: 'hachure', hachureGap: 2.5 });
  s.text(X(8) - 14, Y(5) - 20, '5', { size: 19, tone: 'blue', weight: 700 });
  s.text(X(3) - 16, Y(3) - 16, '3', { size: 19, tone: 'blue', weight: 700 });
  s.text(20, 398, 'the state is two numbers: tokens and the time they were counted', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'token-bucket');
}

// ── 4. Two gateways racing on one token ────────────────────────────────────
{
  const W = 620, H = 440, g1 = 90, rd = 310, g2 = 530;
  const s = new Sketch({
    width: W, height: H, seed: 34,
    title: 'Two gateways read the same token count before either writes, and both admit a request',
    desc: 'Redis holds 1 token. Gateway 1 reads 1. Gateway 2 reads 1. Gateway 1 writes 0 and allows its request. Gateway 2 writes 0 and allows its request. Two requests were admitted on one token, and the stored count is still 0.',
  });
  s.text(20, 26, 'read, then write: two gateways, one token', { size: 22, anchor: 'start', weight: 700 });
  const lanes = [[g1, 'gateway 1', 'blue'], [rd, 'Redis: tokens', 'cyan'], [g2, 'gateway 2', 'violet']];
  for (const [x, l, t] of lanes) {
    s.text(x, 70, l, { size: 20, weight: 700, tone: t });
    s.line(x, 86, x, 372, { tone: 'soft', dashed: true, width: 1.2 });
  }
  const step = (y, from, label, tone, value) => {
    s.arrow(from === 1 ? g1 + 6 : g2 - 6, y, from === 1 ? rd - 40 : rd + 40, y, { tone, width: 1.8, label, size: 19, labelOffset: -16 });
    s.box(rd, y, value, { size: 20, w: 56, h: 36, tone: 'cyan' });
  };
  step(124, 1, 'GET: 1 left', 'blue', '1');
  step(184, 2, 'GET: 1 left', 'violet', '1');
  step(254, 1, 'SET 0, allow', 'blue', '0');
  step(314, 2, 'SET 0, allow', 'violet', '0');
  s.text(g1 - 8, 290, 'allowed', { size: 19, tone: 'green', weight: 700 });
  s.text(g2 + 8, 350, 'allowed', { size: 19, tone: 'green', weight: 700 });
  s.text(W / 2, 400, '2 requests admitted on 1 token', { size: 22, tone: 'red', weight: 700 });
  s.text(W / 2, 428, 'time runs downwards; nothing stops step 2 landing between 1 and 3', { size: 18, tone: 'soft' });
  s.save(__dirname, 'race');
}
