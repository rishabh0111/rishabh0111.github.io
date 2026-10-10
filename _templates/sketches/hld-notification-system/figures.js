// Figures for HLD Part 14, Design a notification system.
//   node _templates/sketches/hld-notification-system/figures.js
const { Sketch } = require('../sketch');

// ── 1. Priority lanes sharing one provider quota ──────────────────────────
{
  const s = new Sketch({ width: 660, height: 440, title: 'Three priority lanes feeding one push provider quota of 10,000 a second', desc: 'Critical, transactional and bulk queues each have their own workers. The provider quota of 10,000 messages a second is split: bulk may use at most 8,000 a second, and 2,000 a second is held back for critical and transactional sends. With 49 million bulk messages waiting, an OTP waits only behind other OTPs.', seed: 21 });
  s.text(20, 24, 'three lanes, one provider quota: bulk can never take all of it', { size: 21, anchor: 'start', weight: 700 });
  const lanes = [
    { y: 92, name: 'bulk', sub: 'campaigns', tone: 'amber', cells: 8, depth: '49,000,000 waiting' },
    { y: 192, name: 'transactional', sub: 'order shipped', tone: 'blue', cells: 4, depth: '1,200 waiting' },
    { y: 292, name: 'critical', sub: 'OTP, security', tone: 'green', cells: 2, depth: '3 waiting' },
  ];
  const qx = 170, cw = 26, ch = 40;
  lanes.forEach(l => {
    s.text(qx - 16, l.y + ch / 2 - 10, l.name, { size: 21, anchor: 'end', weight: 600, tone: l.tone });
    s.text(qx - 16, l.y + ch / 2 + 13, l.sub, { size: 17, anchor: 'end', tone: 'soft' });
    // queue outline: 8 slots, the first `cells` filled from the right (the head)
    for (let i = 0; i < 8; i++) {
      const filled = i >= 8 - l.cells;
      s.rect(qx + i * cw, l.y, cw, ch, { tone: filled ? l.tone : 'soft', fill: filled ? 'hachure' : undefined, width: 1.3 });
    }
    s.text(qx + 4 * cw, l.y + ch + 18, l.depth, { size: 18, tone: l.tone });
  });
  // the provider quota bar
  const bx = 520, bw = 100, top = 84, bot = 344, split = top + (bot - top) * 0.8;
  s.rect(bx, top, bw, split - top, { tone: 'amber', fill: 'hachure', width: 1.6 });
  s.rect(bx, split, bw, bot - split, { tone: 'green', fill: 'hachure', width: 1.6 });
  s.text(bx + bw / 2, top + 70, 'bulk', { size: 20, weight: 700 });
  s.text(bx + bw / 2, top + 96, 'at most', { size: 18 });
  s.text(bx + bw / 2, top + 120, '8,000 / s', { size: 19, weight: 600 });
  s.text(bx + bw / 2, split + 16, 'held back', { size: 17, weight: 600 });
  s.text(bx + bw / 2, split + 38, '2,000 / s', { size: 17, weight: 600 });
  s.text(bx + bw / 2, top - 22, 'FCM: 10,000 / s', { size: 19, weight: 700 });
  // arrows from lane heads to the bar
  const hx = qx + 8 * cw + 8;
  s.arrow(hx, lanes[0].y + ch / 2, bx - 8, top + 120, { tone: 'amber', width: 1.7 });
  s.arrow(hx, lanes[1].y + ch / 2, bx - 8, split + 14, { tone: 'blue', width: 1.7 });
  s.arrow(hx, lanes[2].y + ch / 2, bx - 8, split + 36, { tone: 'green', width: 1.7 });
  s.text(20, 396, 'one shared FIFO: an OTP behind 49 million pushes waits 49,000,000 ÷ 10,000 ≈ 82 min', { size: 19, anchor: 'start', tone: 'red' });
  s.text(20, 424, 'lanes + a held-back share: it waits only behind other critical sends', { size: 19, anchor: 'start', tone: 'green' });
  s.save(__dirname, 'priority-lanes');
}

// ── 2. Where a crash causes a duplicate send ──────────────────────────────
{
  const s = new Sketch({ width: 660, height: 450, title: 'Where a worker crash leads to a duplicate send', desc: 'A worker claims the delivery, calls the provider, records sent, then acknowledges the queue. A crash before the provider call is safe to retry. A crash after the provider accepted but before sent is recorded is the duplicate window. A crash after sent is recorded is skipped on redelivery.', seed: 22 });
  s.text(20, 24, 'one delivery, four steps, three places to crash', { size: 21, anchor: 'start', weight: 700 });
  const steps = [
    { x: 90, l: 'claim\npending → sending' },
    { x: 250, l: 'call the\nprovider' },
    { x: 410, l: 'record\nsent + provider id' },
    { x: 570, l: 'ack the\nqueue message' },
  ];
  const y = 140;
  const boxes = steps.map(st => s.box(st.x, y, st.l, { size: 18, w: 142, h: 62 }));
  for (let i = 0; i < 3; i++) s.connect(boxes[i], boxes[i + 1], {});
  // duplicate window
  s.span(boxes[1].cx, boxes[2].cx, y - 36, 'duplicate window', { tone: 'red', size: 19, side: 'above' });
  // crash markers
  const crash = [
    { x: (boxes[0].cx + boxes[1].cx) / 2, t: 'A', tone: 'green', a: 'A: provider never saw it.', b: 'Lease expires, another worker sends. Safe.' },
    { x: (boxes[1].cx + boxes[2].cx) / 2, t: 'B', tone: 'red', a: 'B: provider sent it, we never wrote "sent".', b: 'Retry sends again. Keep this gap to milliseconds.' },
    { x: (boxes[2].cx + boxes[3].cx) / 2, t: 'C', tone: 'blue', a: 'C: "sent" is recorded, the ack is lost.', b: 'Redelivered, sees "sent", skips. Safe.' },
  ];
  crash.forEach((c, i) => {
    const cy = 246;
    s.line(c.x, y + 38, c.x, cy - 20, { tone: c.tone, dashed: true, width: 1.4 });
    s.text(c.x, cy, '✕', { size: 26, tone: c.tone, weight: 700 });
    s.text(c.x, cy + 26, c.t, { size: 20, tone: c.tone, weight: 700 });
    s.text(30, 312 + i * 44, c.a, { size: 19, anchor: 'start', tone: c.tone, weight: 600 });
    s.text(30, 334 + i * 44, c.b, { size: 18, anchor: 'start', tone: 'soft' });
  });
  s.save(__dirname, 'duplicate-window');
}

// ── 3. Quiet hours across time zones for one campaign ────────────────────
{
  const x0 = 170, pph = 38;               // 18:00 UTC at x0, 38 px per hour, 12 hours
  const X = h => x0 + (h - 18) * pph;     // h in UTC hours, 18..30 (30 = 06:00 next day)
  const rows = [
    { name: 'Mumbai', tz: 'UTC+5:30', y: 130, quiet: [[18, 26.5]], send: 26.5, tone: 'amber', note: 'deferred to 08:00 IST' },
    { name: 'London', tz: 'UTC+0', y: 210, quiet: [[22, 30]], send: 20, tone: 'green', note: 'sent at 20:00 local' },
    { name: 'Sydney', tz: 'UTC+11', y: 290, quiet: [[18, 21]], send: 21, tone: 'amber', note: 'deferred to 08:00 AEDT' },
  ];
  const s = new Sketch({ width: 660, height: 420, title: 'One campaign launched at 20:00 UTC meets three users in different time zones', desc: 'Quiet hours are 22:00 to 08:00 local time. At 20:00 UTC it is 01:30 in Mumbai, so the send waits until 02:30 UTC; 20:00 in London, so it is sent now; 07:00 in Sydney, so it waits until 21:00 UTC.', seed: 23 });
  s.text(20, 24, 'campaign at 20:00 UTC, quiet hours 22:00–08:00 local', { size: 21, anchor: 'start', weight: 700 });
  s.rect(20, 56, 40, 20, { tone: 'soft', fill: 'cross', width: 1.2 });
  s.text(68, 66, 'quiet hours', { size: 19, anchor: 'start', tone: 'soft' });
  s.circle(200, 66, 18, { tone: 'green', fill: 'hachure', width: 1.5 });
  s.text(216, 66, 'sent', { size: 19, anchor: 'start', tone: 'soft' });
  s.circle(290, 66, 18, { tone: 'amber', fill: 'hachure', width: 1.5 });
  s.text(306, 66, 'deferred send', { size: 19, anchor: 'start', tone: 'soft' });
  rows.forEach(r => {
    s.text(x0 - 18, r.y - 10, r.name, { size: 21, anchor: 'end', weight: 600 });
    s.text(x0 - 18, r.y + 13, r.tz, { size: 17, anchor: 'end', tone: 'soft' });
    s.line(x0, r.y, X(30), r.y, { tone: 'soft', width: 1.2 });
    r.quiet.forEach(([a, b]) => s.rect(X(a), r.y - 14, X(b) - X(a), 28, { tone: 'soft', fill: 'cross', width: 1.1, hachureGap: 8 }));
    s.circle(X(r.send), r.y, 20, { tone: r.tone, fill: 'hachure', hachureGap: 4, width: 1.7 });
    if (r.send !== 20) s.arrow(X(20) + 4, r.y + 22, X(r.send) - 4, r.y + 22, { tone: 'amber', width: 1.5, headLen: 9 });
    s.text(X(r.send) + (r.send > 25 ? -14 : 16), r.y - 26, r.note, { size: 18, tone: r.tone, anchor: r.send > 25 ? 'end' : 'start' });
  });
  // launch line
  s.line(X(20), 96, X(20), 320, { tone: 'violet', dashed: true, width: 1.6 });
  s.text(X(20), 90, 'launch', { size: 18, tone: 'violet', weight: 600 });
  // axis
  s.line(x0, 344, X(30), 344, { tone: 'ink', width: 1.4 });
  for (let h = 18; h <= 30; h += 2) {
    s.line(X(h), 338, X(h), 350, { tone: 'ink', width: 1.3 });
    s.text(X(h), 366, `${String(h % 24).padStart(2, '0')}:00`, { size: 17, tone: 'soft' });
  }
  s.text(X(24), 392, 'UTC, overnight into the next day', { size: 18, tone: 'soft' });
  s.save(__dirname, 'quiet-hours');
}
