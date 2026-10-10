// Figures for LLD Part 7, Elevator System.
//   node _templates/sketches/lld-elevator/figures.js
const { Sketch } = require('../sketch');

// ── 1. One car, three ordering rules: FCFS, SCAN, LOOK ─────────────────────
{
  const s = new Sketch({ width: 680, height: 450, seed: 31,
    title: 'First come first served, SCAN and LOOK for the same three requests',
    desc: 'A car at floor 4 heading up has requests for floors 8, 2 and 6, pressed in that order. First come first served goes 4, 8, 2, 6: 14 floors. SCAN goes up to the top floor 9 serving 6 and 8, then down to 2: 12 floors. LOOK turns at the last request, 8, instead of the top: 4 to 8 then 2, 10 floors.' });
  s.text(20, 24, 'car at 4 going up; requests 8, 2, 6 (pressed in that order)', { size: 21, anchor: 'start', weight: 700 });
  const fy = f => 330 - f * 24;               // floor -> y
  const panels = [
    { name: 'first come, first served', stops: [4, 8, 2, 6], total: '14 floors', tone: 'red' },
    { name: 'SCAN: to the end', stops: [4, 6, 8, 9, 2], total: '12 floors', tone: 'amber', served: [6, 8, 2] },
    { name: 'LOOK: to the last stop', stops: [4, 6, 8, 2], total: '10 floors', tone: 'green', served: [6, 8, 2] },
  ];
  const pw = 180, gap = 32, x0 = 70;
  for (let f = 0; f <= 9; f++) s.text(x0 - 14, fy(f), f, { size: 17, tone: 'soft', anchor: 'end' });
  s.text(x0 - 14, fy(9) - 26, 'floor', { size: 17, tone: 'soft', anchor: 'end' });
  panels.forEach((p, k) => {
    const left = x0 + k * (pw + gap);
    s.text(left + pw / 2, 62, p.name, { size: 19, weight: 700, tone: p.tone });
    s.rect(left, fy(9) - 12, pw, fy(0) - fy(9) + 24, { tone: 'soft', width: 1.1 });
    // x advances with floors travelled, so the length of the line is the cost
    let travelled = 0, prev = p.stops[0];
    const pts = [[left + 10, fy(prev)]];
    for (const f of p.stops.slice(1)) { travelled += Math.abs(f - prev); prev = f; pts.push([left + 10 + travelled * 11.5, fy(f)]); }
    s.path(pts, { smooth: false, tone: p.tone, width: 2.2 });
    pts.forEach(([x, y], i) => {
      const f = p.stops[i];
      const isRequest = i > 0 && [8, 2, 6].includes(f);
      if (i === 0) s.circle(x, y, 14, { tone: 'ink', fill: 'hachure' });
      else if (isRequest) { s.circle(x, y, 16, { tone: p.tone, fill: 'hachure' }); s.text(x + (f === 2 ? 0 : 0), y + (f === 2 ? 20 : -18), f, { size: 18, weight: 700 }); }
      else { s.text(x + 8, y + 4, 'top', { size: 17, tone: 'red', anchor: 'start' }); }
    });
    s.text(left + pw / 2, fy(0) + 40, p.total, { size: 22, weight: 700, tone: p.tone });
  });
  s.text(20, 420, 'across: floors travelled; dots: requests served; SCAN wastes the trip from 8 to the top', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'scan-vs-look');
}

// ── 2. The nearest car is the wrong car ─────────────────────────────────────
{
  const s = new Sketch({ width: 600, height: 470, seed: 32,
    title: 'Why the nearest car is not the fastest one',
    desc: 'Car A is at floor 3 heading up to 7; car B is idle at 9. Someone at floor 2 presses down. A is one floor away, but it must go up to 7 and back down: 9 floors. B is seven floors away and comes straight down: 7 floors.' });
  s.text(20, 24, 'floor 2 presses DOWN: which car?', { size: 22, anchor: 'start', weight: 700 });
  const fy = f => 410 - f * 34;
  const shaft = (cx, name) => {
    s.rect(cx - 30, fy(9) - 17, 60, fy(0) - fy(9) + 34, { tone: 'soft', width: 1.2 });
    s.text(cx, fy(0) + 40, name, { size: 21, weight: 700 });
  };
  for (let f = 0; f <= 9; f++) s.text(60, fy(f), f, { size: 17, tone: 'soft', anchor: 'end' });
  const AX = 150, BX = 330;
  shaft(AX, 'car A'); shaft(BX, 'car B');
  // the call
  s.text(240, fy(2) - 14, 'call:', { size: 18, tone: 'red', weight: 700 });
  s.text(240, fy(2) + 10, '2 DOWN', { size: 19, tone: 'red', weight: 700 });
  s.arrow(205, fy(2), AX + 34, fy(2), { tone: 'red', dashed: true, headLen: 9 });
  // car A at 3, going to 7 then back to 2
  s.rect(AX - 26, fy(3) - 14, 28, 28, { tone: 'blue', fill: 'hachure' });
  s.text(AX + 40, fy(7), 'stop 7', { size: 18, anchor: 'start', tone: 'blue' });
  s.arrow(AX - 12, fy(3) - 18, AX - 12, fy(7) + 4, { tone: 'blue', width: 2 });
  s.arrow(AX + 14, fy(7) + 4, AX + 14, fy(2) - 4, { tone: 'blue', width: 2, dashed: true });
  // car B idle at 9, straight down
  s.rect(BX - 24, fy(9) - 14, 48, 28, { tone: 'violet', fill: 'hachure' });
  s.arrow(BX, fy(9) + 18, BX, fy(2) - 4, { tone: 'violet', width: 2 });
  // verdicts
  s.text(390, 120, 'nearest car: A', { size: 20, anchor: 'start', weight: 700, tone: 'red' });
  s.text(390, 148, '1 floor away, but', { size: 19, anchor: 'start' });
  s.text(390, 174, '3 to 7 to 2 = 9 floors', { size: 19, anchor: 'start', tone: 'blue' });
  s.text(390, 250, 'by arrival: B', { size: 20, anchor: 'start', weight: 700, tone: 'green' });
  s.text(390, 278, '9 to 2 = 7 floors', { size: 19, anchor: 'start', tone: 'violet' });
  s.text(390, 330, 'in the simulation:', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(390, 356, 'waits 16 ticks vs 7', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'nearest-trap');
}

// ── 3. The verification run, floor by tick ──────────────────────────────────
{
  const A = [0, 1, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 9, 8, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1];
  const Aopen = [5, 6, 8, 9, 11, 12, 13, 14, 21, 22];
  const B = [9, 9, 9, 9, 8, 7, 6, 5, 4, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const Bopen = [10, 11, 13, 14];
  const s = new Sketch({ width: 680, height: 470, seed: 33,
    title: 'Two cars, floor by tick, in the verification run',
    desc: 'Car A, in blue, rises from 0 stopping at 5 and 7, passes 8 without stopping, stops at 9, comes back down to 8 for the down call, then descends to 1. Car B, in violet, comes down from 9 to answer the floor-2 down call and takes that passenger to 0. Thick dots are ticks with the doors open; flags mark when each hall call was pressed.' });
  s.text(20, 24, 'floor by tick: A blue, B violet, dots = doors open', { size: 21, anchor: 'start', weight: 700 });
  const tx = t => 70 + t * 25, fy = f => 380 - f * 30;
  for (let f = 0; f <= 9; f++) {
    s.text(54, fy(f), f, { size: 17, tone: 'soft', anchor: 'end' });
    s.line(62, fy(f), tx(23) + 8, fy(f), { tone: 'soft', width: 0.6, roughness: 0.4 });
  }
  [0, 5, 10, 15, 20].forEach(t => s.text(tx(t), fy(0) + 26, t, { size: 17, tone: 'soft' }));
  s.text(tx(23), fy(0) + 26, 'tick', { size: 17, tone: 'soft', anchor: 'end' });
  const draw = (pos, open, tone) => {
    s.path(pos.map((f, t) => [tx(t), fy(f)]), { smooth: false, tone, width: 2.2, roughness: 0.6 });
    open.forEach(t => s.circle(tx(t), fy(pos[t]), 13, { tone, fill: 'hachure', hachureGap: 2.5 }));
  };
  draw(B, Bopen, 'violet');
  draw(A, Aopen, 'blue');
  // hall-call flags at the tick they were pressed
  const flag = (t, f, label) => {
    s.line(tx(t), fy(f), tx(t), fy(f) - 26, { tone: 'red', width: 1.5 });
    s.text(tx(t) + 4, fy(f) - 32, label, { size: 17, tone: 'red', anchor: 'start', weight: 700 });
  };
  flag(3, 5, '5 up');
  flag(4, 2, '2 down');
  flag(8, 8, '8 down');
  s.text(tx(10) + 6, fy(8) + 18, 'passes 8', { size: 17, tone: 'blue', anchor: 'start' });
  s.text(tx(14) + 6, fy(8) - 14, 'back for it', { size: 17, tone: 'blue', anchor: 'start' });
  s.save(__dirname, 'trace');
}
