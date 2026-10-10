// Figures for Part 10, In-process rate limiter.
//   node _templates/sketches/lld-rate-limiter/figures.js
const { Sketch } = require('../sketch');

// Colour key used throughout: green = request allowed, red = request denied,
// blue = tokens in the bucket or requests counted in a window.

function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. Token bucket over time ───────────────────────────────────────────────
{
  const s = new Sketch({ width: 660, height: 460, title: 'Token bucket of capacity 5 refilling one token every 200 ms', desc: 'Tokens in the bucket over 1.5 seconds for key alice. At 0 ms five requests take all five tokens and the sixth is denied. The bucket refills at one token per 200 ms: at 100 ms it holds half a token and request 7 is denied; at 300 ms it holds 1.5, request 8 is allowed and request 9 denied. It is full again by 1200 ms; request 10 at 1300 ms is allowed and leaves 4.', seed: 101 });
  s.text(20, 24, 'alice, capacity 5, one token every 200 ms', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['blue', 'tokens'], ['green', 'allowed'], ['red', 'denied']]);
  const X = ms => 90 + ms * 0.36, Y = t => 320 - t * 40;        // 0..1500 ms, 0..5 tokens
  // axes
  s.line(X(0), Y(0), X(1500), Y(0), { tone: 'soft' });
  s.line(X(0), Y(0), X(0), Y(5.4), { tone: 'soft' });
  [0, 1, 2, 3, 4, 5].forEach(t => s.text(X(0) - 12, Y(t), t, { size: 17, tone: 'soft', anchor: 'end' }));
  s.text(X(0) - 12, Y(5.4) - 16, 'tokens', { size: 17, tone: 'soft', anchor: 'end' });
  [0, 300, 600, 900, 1200, 1500].forEach(ms => { s.line(X(ms), Y(0) - 4, X(ms), Y(0) + 4, { tone: 'soft' }); s.text(X(ms), Y(0) + 20, `${ms}`, { size: 16, tone: 'soft' }); });
  s.text(X(1500), Y(0) + 40, 'ms', { size: 16, tone: 'soft', anchor: 'end' });
  s.line(X(0), Y(5), X(1500), Y(5), { tone: 'soft', dashed: true, width: 1.2 });
  s.text(X(1500), Y(5) - 14, 'capacity', { size: 16, tone: 'soft', anchor: 'end' });
  // the level: 5 -> 0 at t=0, ramp to 1.5 at 300, drop to 0.5, ramp to 5 at 1200, flat, drop to 4 at 1300, ramp to 5 at 1500
  s.path([[X(0), Y(5)], [X(0), Y(0)], [X(300), Y(1.5)], [X(300), Y(0.5)], [X(1200), Y(5)], [X(1300), Y(5)], [X(1300), Y(4)], [X(1500), Y(5)]], { smooth: false, tone: 'blue', width: 2.4 });
  // requests under the axis
  const req = (ms, row, label, ok) => {
    const y = Y(0) + 48 + row * 26;
    s.circle(X(ms), y, 16, { tone: ok ? 'green' : 'red', fill: 'hachure', hachureGap: 3 });
    s.text(X(ms) + 12, y, label, { size: 16, anchor: 'start', tone: ok ? 'green' : 'red' });
  };
  req(0, 0, '#1-5', true); req(0, 1, '#6', false);
  req(100, 2, '#7', false);
  req(300, 0, '#8', true); req(300, 1, '#9', false);
  req(1300, 0, '#10', true);
  s.text(X(10), Y(3.4), '#7 at 100 ms: 0.5 token,', { size: 16, anchor: 'start' });
  s.text(X(10), Y(3.4) + 20, 'denied, retry in 100 ms', { size: 16, anchor: 'start' });
  s.arrow(X(100), Y(3.4) + 32, X(100), Y(0.5) - 8, { tone: 'ink', width: 1.4 });
  s.text(X(430), Y(0.35), '#8 at 300 ms: 1.5, takes one', { size: 16, anchor: 'start' });
  s.arrow(X(425), Y(0.35), X(312), Y(0.45), { tone: 'ink', width: 1.4 });
  s.text(X(1300) - 8, Y(4) + 18, '#10 leaves 4', { size: 16, anchor: 'end' });
  s.save(__dirname, 'token-bucket');
}

// ── 2. Fixed window: the boundary burst ─────────────────────────────────────
{
  const s = new Sketch({ width: 620, height: 310, title: 'Fixed windows let twice the limit through around a boundary', desc: 'Limit 5 per second with fixed windows starting at 0 s and 1 s. Five requests arrive between 0.8 and 1.0 seconds, the last five allowed in the first window, and five more between 1.0 and 1.2 seconds, the first five of the second window. Each window counts 5 and allows them all, but 10 requests passed within 0.4 seconds.', seed: 102 });
  s.text(20, 24, 'limit 5 per second, fixed windows', { size: 21, anchor: 'start', weight: 700 });
  const X = sec => 50 + (sec - 0.5) * 520;                   // zoomed: 0.5 s .. 1.5 s
  const top = 80, h = 90;
  s.rect(X(0.5), top, X(1) - X(0.5), h, { tone: 'soft', width: 1.6 });
  s.rect(X(1), top, X(1.5) - X(1), h, { tone: 'soft', width: 1.6 });
  s.text(X(0.55), top + 20, 'window [0 s, 1 s): 5', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(X(1.05), top + 20, 'window [1 s, 2 s): 5', { size: 18, anchor: 'start', tone: 'soft' });
  [0.81, 0.85, 0.89, 0.93, 0.97, 1.02, 1.06, 1.1, 1.14, 1.18].forEach(t => s.circle(X(t), top + 60, 16, { tone: 'green', fill: 'hachure', hachureGap: 3 }));
  s.line(X(0.5), top + h + 10, X(1.5), top + h + 10, { tone: 'soft' });
  [0.5, 0.8, 1, 1.2, 1.5].forEach(t => { s.line(X(t), top + h + 6, X(t), top + h + 14, { tone: 'soft' }); s.text(X(t), top + h + 30, `${t} s`, { size: 16, tone: 'soft' }); });
  s.span(X(0.8), X(1.2), top + h + 46, '10 allowed in 0.4 s: twice the limit', { tone: 'red', size: 19 });
  s.text(20, 284, 'each window counts only its own 5, so neither refuses anything', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'fixed-window-burst');
}

// ── 3. Sliding window counter: the weighted estimate ────────────────────────
{
  const s = new Sketch({ width: 640, height: 330, title: 'Sliding window counter estimate at t = 69 s with a limit of 10 per minute', desc: 'The previous fixed window, 0 to 60 s, counted 8 requests. The current window, 60 to 120 s, has counted 4 so far at t = 69 s. The sliding window, 9 to 69 s, covers 51 of the previous window 60 seconds, 85 percent. Estimate 8 x 0.85 + 4 = 10.8, which is not below 10, so the request is denied; at 75 s the share drops to 75 percent and the estimate to 10 minus a hair, so a request passes.', seed: 103 });
  s.text(20, 24, 'limit 10 per minute, a request at t = 69 s', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['blue', 'counted'], ['amber', 'share of previous still in the sliding minute']]);
  const X = sec => 40 + sec * 4.4;                            // 0..130 s
  const top = 108, h = 70;
  s.rect(X(0), top, X(60) - X(0), h, { tone: 'soft', width: 1.6 });
  s.rect(X(9), top + 4, X(60) - X(9), h - 8, { tone: 'amber', fill: 'hachure', width: 1.2 });
  s.rect(X(60), top, X(120) - X(60), h, { tone: 'soft', width: 1.6 });
  s.rect(X(60), top + 4, X(69) - X(60), h - 8, { tone: 'blue', fill: 'hachure', width: 1.2 });
  s.text(X(30), top + h / 2 - 12, 'previous: 8', { size: 21, weight: 700 });
  s.text(X(34.5), top + h / 2 + 14, '51 s of 60 = 0.85', { size: 18 });
  s.text(X(72), top + h / 2, 'current: 4', { size: 21, weight: 700, anchor: 'start' });
  s.line(X(69), top - 18, X(69), top + h + 12, { tone: 'red', dashed: true, width: 2 });
  s.text(X(69), top - 28, 'now = 69 s', { size: 17, tone: 'red' });
  s.line(X(0), top + h + 12, X(120), top + h + 12, { tone: 'soft' });
  [0, 60, 120].forEach(t => { s.line(X(t), top + h + 8, X(t), top + h + 16, { tone: 'soft' }); s.text(X(t), top + h + 32, `${t} s`, { size: 16, tone: 'soft' }); });
  s.span(X(9), X(69), top + h + 44, 'the sliding minute, 9 s to 69 s', { tone: 'ink', size: 18 });
  s.text(20, 312, '8 x 0.85 + 4 = 10.8, not below 10: denied, retry after 6 s', { size: 20, anchor: 'start', tone: 'red', weight: 700 });
  s.save(__dirname, 'sliding-counter');
}
