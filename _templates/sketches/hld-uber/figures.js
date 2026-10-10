// Figures for Part 9, Uber (HLD series).
//   node _templates/sketches/hld-uber/figures.js
const { Sketch } = require('../sketch');

function key(s, x, y, items, size = 18) {
  for (const [tone, word] of items) {
    s.circle(x + 8, y, 14, { tone, fill: 'solid' });
    s.text(x + 24, y, word, { size, anchor: 'start', tone: 'soft' });
    x += 24 + s.textWidth(word, size) + 24;
  }
}

// ── 1. Geohash cells around a rider near a cell edge ──────────────────────
{
  // Real length-5 geohashes around central Bengaluru (12.9716, 77.5946); each cell ≈ 4.89 km tall.
  const cells = [['tdr4h', 'tdr4j', 'tdr4n'], ['tdr1u', 'tdr1v', 'tdr1y'], ['tdr1s', 'tdr1t', 'tdr1w']];
  const C = 140, x0 = 30, y0 = 92, pxPerKm = C / 4.89;
  const s = new Sketch({ width: 680, height: 540, title: 'Geohash cells around a rider near the edge of cell tdr1v', desc: 'A 3 by 3 grid of length-5 geohash cells in Bengaluru, each about 4.9 km across. The rider is 0.4 km below the top edge of tdr1v. Driver A is inside tdr1v but about 3.5 km away; driver B is in tdr4j, the cell to the north, about 1 km away. Searching only the prefix tdr1v finds A; searching the cell and its 8 neighbours finds B.', seed: 91 });
  s.text(20, 24, 'length-5 geohash cells, central Bengaluru', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['violet', 'rider'], ['red', 'A: same cell'], ['green', 'B: next cell'], ['soft', 'other drivers']]);

  cells.forEach((row, r) => row.forEach((g, c) => {
    const centre = r === 1 && c === 1;
    s.rect(x0 + c * C, y0 + r * C, C, C, { tone: centre ? 'blue' : 'ink', fill: centre ? 'hachure' : undefined, hachureGap: 16, width: centre ? 2.2 : 1.4 });
    s.text(x0 + c * C + (centre ? C - 10 : 10), y0 + r * C + (centre ? C - 18 : 18), g, { size: 19, anchor: centre ? 'end' : 'start', tone: centre ? 'blue' : 'soft', weight: centre ? 700 : 500 });
  }));

  const rider = [x0 + C + 70, y0 + C + 0.4 * pxPerKm];
  const A = [x0 + C + 35, y0 + C + 104];
  const B = [x0 + C + 82, y0 + C - 0.5 * pxPerKm];
  const km = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) / pxPerKm;
  const dA = km(rider, A).toFixed(1), dB = km(rider, B).toFixed(1);
  console.log(`geohash-grid: A ${dA} km, B ${dB} km`);

  s.circle(rider[0], rider[1], 2 * 2 * pxPerKm, { tone: 'violet', dashed: true, width: 1.4 });
  [[70, 140], [390, 120], [120, 300], [400, 330], [90, 440], [300, 470], [420, 470], [190, 200]].forEach(([x, y]) => s.circle(x, y, 10, { tone: 'soft', fill: 'solid' }));
  s.circle(A[0], A[1], 16, { tone: 'red', fill: 'solid' });
  s.text(A[0] + 14, A[1] + 2, `A ${dA} km`, { size: 19, anchor: 'start', tone: 'red', weight: 700 });
  s.circle(B[0], B[1], 16, { tone: 'green', fill: 'solid' });
  s.text(B[0] + 4, B[1] - 30, `B ${dB} km`, { size: 19, anchor: 'start', tone: 'green', weight: 700 });
  s.circle(rider[0], rider[1], 16, { tone: 'violet', fill: 'solid' });
  s.text(rider[0] + 14, rider[1] + 20, 'rider', { size: 19, anchor: 'start', tone: 'violet', weight: 700 });

  const px = 474;
  const lines = [
    ['search prefix tdr1v only:', 'ink', 600], [`finds A, ${dA} km`, 'red', 700], ['', 'ink'],
    ['cell + 8 neighbours:', 'ink', 600], [`finds B, ${dB} km`, 'green', 700], ['', 'ink'],
    ['north of tdr1v is tdr4j:', 'soft'], ['they share only "tdr"', 'soft'], ['', 'ink'],
    ['each cell ≈ 4.9 × 4.8 km', 'soft'], ['dashed: 2 km radius', 'soft'],
  ];
  lines.forEach(([t, tone, w], i) => { if (t) s.text(px, 120 + i * 30, t, { size: 19, anchor: 'start', tone, weight: w ?? 500 }); });
  s.save(__dirname, 'geohash-grid');
}

// ── 2. A quadtree built from real points, leaf capacity 4 ─────────────────
{
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const pts = [];
  while (pts.length < 45) { const p = [0.64 + 0.07 * gauss(), 0.38 + 0.07 * gauss()]; if (p[0] > 0 && p[0] < 1 && p[1] > 0 && p[1] < 1) pts.push(p); }
  while (pts.length < 70) pts.push([rnd(), rnd()]);

  const CAP = 4, MAXD = 6;
  const leaves = [];
  (function split(x, y, w, ps, d) {
    if (ps.length <= CAP || d === MAXD) { leaves.push({ x, y, w, n: ps.length, d }); return; }
    const h = w / 2;
    [[x, y], [x + h, y], [x, y + h], [x + h, y + h]].forEach(([cx, cy]) =>
      split(cx, cy, h, ps.filter(p => p[0] >= cx && p[0] < cx + h && p[1] >= cy && p[1] < cy + h), d + 1));
  })(0, 0, 1, pts, 0);
  const maxD = Math.max(...leaves.map(l => l.d));
  console.log(`quadtree: ${leaves.length} leaves, max depth ${maxD}`);

  const S = 420, X0 = 30, Y0 = 80;
  const s = new Sketch({ width: 680, height: 530, title: 'A quadtree over 70 drivers with at most 4 per leaf', desc: `70 points, 45 of them clustered downtown. Each cell splits into four when it holds more than 4 points, giving ${leaves.length} leaf cells: depth ${maxD} in the dense centre, depth 1 or 2 in the outskirts.`, seed: 92 });
  s.text(20, 24, 'quadtree: split any cell holding more than 4 drivers', { size: 21, anchor: 'start', weight: 700 });
  s.rect(X0, Y0, S, S, { width: 1.8 });
  leaves.forEach(l => {
    const tone = l.d >= 4 ? 'amber' : (l.d <= 2 ? 'cyan' : undefined);
    if (tone) s.rect(X0 + l.x * S, Y0 + l.y * S, l.w * S, l.w * S, { tone, fill: 'hachure', hachureGap: l.d >= 4 ? 7 : 18, width: 1.1 });
    else s.rect(X0 + l.x * S, Y0 + l.y * S, l.w * S, l.w * S, { width: 1.1 });
  });
  pts.forEach(([x, y]) => s.circle(X0 + x * S, Y0 + y * S, 7, { tone: 'ink', fill: 'solid', width: 1 }));

  const px = 474;
  s.rect(px, 110, 22, 22, { tone: 'amber', fill: 'hachure', width: 1.3 });
  s.text(px + 30, 121, 'depth 4+: small cells', { size: 19, anchor: 'start', tone: 'soft' });
  s.rect(px, 146, 22, 22, { tone: 'cyan', fill: 'hachure', width: 1.3 });
  s.text(px + 30, 157, 'depth 1-2: big cells', { size: 19, anchor: 'start', tone: 'soft' });
  [
    [`${leaves.length} leaf cells`, 'ink', 700], ['for 70 drivers', 'ink', 500], ['', ''],
    [`deepest: depth ${maxD}, cell`, 'ink', 500], [`1/${2 ** maxD} of the map wide`, 'ink', 500], ['', ''],
    ['adapts to density,', 'soft', 500], ['but every move is a', 'soft', 500], ['delete + insert, and', 'soft', 500], ['cells split and merge', 'soft', 500],
  ].forEach(([t, tone, w], i) => { if (t) s.text(px, 210 + i * 28, t, { size: 19, anchor: 'start', tone, weight: w }); });
  s.save(__dirname, 'quadtree');
}

// ── 3. Two rides race for one driver; the hold expires ────────────────────
{
  const X = t => 170 + t * 29; // seconds → px
  const s = new Sketch({ width: 680, height: 470, title: 'Two rides race for driver D with an expiring lock', desc: 'At 0 s ride R1 sets lock:driver:D with NX and a 10-second expiry and wins; ride R2 gets nil and offers driver D2 instead. D ignores the offer; the lock expires at 10 s and R1 offers driver E, who accepts at 13 s, and the assignment is committed in the database. D taps accept at 11 s, after the lock expired, and is rejected.', seed: 93 });
  s.text(20, 24, 'two rides want driver D; D ignores the offer', { size: 21, anchor: 'start', weight: 700 });

  const lane = (y, name, sub, noLine) => {
    if (!noLine) s.line(X(0) - 6, y, X(16), y, { tone: 'soft', width: 1.1, dashed: true });
    s.text(X(0) - 18, y - (sub ? 10 : 0), name, { size: 19, anchor: 'end', weight: 700 });
    if (sub) s.text(X(0) - 18, y + 14, sub, { size: 17, anchor: 'end', tone: 'soft' });
  };
  const dot = (t, y, tone) => s.circle(X(t), y, 14, { tone, fill: 'solid' });

  const y1 = 100, y2 = 190, y3 = 280, y4 = 360;
  lane(y1, 'ride R1', 'matcher 1');
  lane(y2, 'ride R2', 'matcher 2');
  lane(y3, 'lock:driver:D', undefined, true);
  lane(y4, 'driver D');

  dot(0, y1, 'green'); s.text(X(0) + 14, y1 - 22, 'SET NX: OK, offer D', { size: 19, anchor: 'start', tone: 'green', weight: 700 });
  dot(10, y1, 'amber'); s.text(X(10) - 8, y1 + 26, 'no answer: offer E', { size: 18, anchor: 'end', tone: 'amber', weight: 700 });
  dot(13, y1, 'green'); s.text(X(13) + 2, y1 - 22, 'E accepts: commit', { size: 18, anchor: 'middle', tone: 'green', weight: 700 });

  dot(0.15, y2, 'red'); s.text(X(0) + 14, y2 - 22, 'SET NX: nil (R1 holds D)', { size: 19, anchor: 'start', tone: 'red', weight: 700 });
  s.text(X(0) + 14, y2 + 24, 'offers driver D2 instead, ms later', { size: 18, anchor: 'start' });

  s.rect(X(0), y3 - 16, X(10) - X(0), 32, { tone: 'blue', fill: 'hachure', width: 1.5 });
  s.text((X(0) + X(10)) / 2, y3, 'value R1, PX 10000', { size: 19, weight: 700 });
  s.text(X(10) + 10, y3, 'expired: D is free', { size: 18, anchor: 'start', tone: 'soft' });

  dot(11, y4, 'red'); s.text(X(11) + 14, y4 - 22, 'taps accept at 11 s:', { size: 18, anchor: 'start', tone: 'red', weight: 700 });
  s.text(X(11) + 14, y4 + 22, 'lock gone, rejected', { size: 18, anchor: 'start', tone: 'red' });
  s.text(X(0) + 14, y4 - 22, 'offer on screen, no tap', { size: 18, anchor: 'start', tone: 'soft' });

  const ay = 420;
  s.line(X(0), ay, X(16), ay, { width: 1.5 });
  [0, 2, 4, 6, 8, 10, 12, 14, 16].forEach(t => { s.line(X(t), ay - 5, X(t), ay + 5, { width: 1.2 }); s.text(X(t), ay + 22, `${t}`, { size: 17, tone: 'soft' }); });
  s.text(X(16) + 10, ay, 's', { size: 18, anchor: 'start', tone: 'soft' });
  s.line(X(10), y3 + 20, X(10), ay, { tone: 'amber', dashed: true, width: 1.6 });
  s.save(__dirname, 'lock-race');
}
