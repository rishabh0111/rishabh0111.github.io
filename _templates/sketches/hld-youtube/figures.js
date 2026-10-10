// Figures for Part 5, Design YouTube.
//   node _templates/sketches/hld-youtube/figures.js
const { Sketch } = require('../sketch');

function key(s, x, y, items, size = 18) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, size) + 24;
  }
}

// ── 1. One worker versus 600 tasks, on one time axis and then zoomed ───────
{
  const s = new Sketch({
    width: 660, height: 560, seed: 51,
    title: 'Transcoding a 2-hour film: one worker versus 600 parallel tasks',
    desc: 'Top: on a 0 to 40 minute axis, one 16-core worker takes about 37 minutes while the parallel pipeline takes about 2.5. Bottom, zoomed to 3 minutes: the split takes 30 seconds, 600 encode tasks of about a minute each run side by side, one task fails and is retried on its own, then packaging writes the manifests and the video is ready.',
  });
  s.text(20, 24, 'one 2-hour film, 5 renditions = 36,000 core-seconds of work', { size: 21, anchor: 'start', weight: 700 });
  // full axis 0..40 min
  const X0 = 150, X1 = 630, px = (X1 - X0) / 40;
  const ax = 170;
  s.line(X0, ax, X1, ax, { tone: 'soft' });
  [0, 10, 20, 30, 40].forEach(m => { s.line(X0 + m * px, ax - 5, X0 + m * px, ax + 5, { tone: 'soft' }); s.text(X0 + m * px, ax + 20, `${m}`, { size: 17, tone: 'soft' }); });
  s.text(X1, ax + 42, 'minutes', { size: 17, tone: 'soft', anchor: 'end' });
  s.text(X0 - 12, 80, 'one worker', { size: 19, anchor: 'end', weight: 600 });
  s.rect(X0, 66, 37.5 * px, 28, { tone: 'amber', fill: 'hachure' });
  s.text(X0 + 18.75 * px, 80, 'all 5 renditions, in turn: ~37 min', { size: 18 });
  s.text(X0 - 12, 128, '600 tasks', { size: 19, anchor: 'end', weight: 600 });
  s.rect(X0, 114, 2.5 * px, 28, { tone: 'green', fill: 'hachure', hachureGap: 3 });
  s.text(X0 + 2.5 * px + 10, 128, '~2.5 min, zoomed below', { size: 18, anchor: 'start', tone: 'green' });

  // zoom 0..3 min
  const Z0 = 150, Z1 = 630, zp = (Z1 - Z0) / 3;
  const top = 250, lane = 34;
  s.text(20, 222, 'the 600-task run, zoomed to 3 minutes', { size: 20, anchor: 'start', weight: 700, tone: 'soft' });
  const lanes = [
    { label: 'split', bars: [[0, 0.5, 'blue']] },
    { label: 'worker 1', bars: [[0.5, 1.5, 'green']] },
    { label: 'worker 2', bars: [[0.52, 1.55, 'green']] },
    { label: 'worker 3', bars: [[0.55, 1.0, 'red'], [1.05, 2.05, 'green']] },
    { label: '…', bars: [] },
    { label: 'worker 600', bars: [[0.6, 1.62, 'green']] },
    { label: 'package', bars: [[2.05, 2.45, 'violet']] },
  ];
  lanes.forEach((l, i) => {
    const y = top + i * lane;
    s.text(Z0 - 12, y + 13, l.label, { size: 18, anchor: 'end', tone: l.label === '…' ? 'soft' : 'ink' });
    l.bars.forEach(([a, b, t]) => s.rect(Z0 + a * zp, y, (b - a) * zp, 26, { tone: t, fill: 'hachure', width: 1.5 }));
  });
  s.text(Z0 + 0.55 * zp, top + 4 * lane + 13, '↑ crash: only this task re-runs', { size: 18, tone: 'red', anchor: 'start' });
  const zax = top + lanes.length * lane + 12;
  s.line(Z0, zax, Z1, zax, { tone: 'soft' });
  [0, 1, 2, 3].forEach(m => { s.line(Z0 + m * zp, zax - 5, Z0 + m * zp, zax + 5, { tone: 'soft' }); s.text(Z0 + m * zp, zax + 20, `${m}`, { size: 17, tone: 'soft' }); });
  s.text(Z1, zax + 42, 'minutes', { size: 17, tone: 'soft', anchor: 'end' });
  // ready marker
  const rx = Z0 + 2.45 * zp;
  s.line(rx, top - 8, rx, zax, { tone: 'green', dashed: true });
  s.text(rx + 8, top + 6 * lane + 13, 'ready', { size: 20, tone: 'green', weight: 700, anchor: 'start' });
  key(s, 20, zax + 70, [['blue', 'split'], ['green', 'encode task'], ['red', 'failed'], ['violet', 'write manifests']]);
  s.save(__dirname, 'serial-vs-parallel');
}

// ── 2. Adaptive bitrate: the player's path through the rendition grid ──────
{
  const bw = [6, 8, 9, 9, 4, 2, 2, 3, 6, 9, 9, 9];          // Mbps measured during each segment
  const rungs = [['1080p', 5], ['720p', 3], ['480p', 1.5], ['360p', 0.8], ['240p', 0.4]];
  // rule: start at 480p, then highest rung <= 0.8 x bandwidth measured on the previous segment
  const pick = [2];
  for (let i = 1; i < bw.length; i++) {
    const cap = 0.8 * bw[i - 1];
    pick.push(rungs.findIndex(([, r]) => r <= cap));
  }
  const s = new Sketch({
    width: 660, height: 560, seed: 52,
    title: 'Adaptive bitrate: the rendition chosen for each 6-second segment as bandwidth changes',
    desc: `Measured bandwidth per segment: ${bw.join(', ')} Mbps. The player starts at 480p, then picks the highest rendition at or below 80 percent of the last measured bandwidth: ${pick.map(p => rungs[p][0]).join(', ')}.`,
  });
  s.text(20, 24, 'rule: highest rung ≤ 80% of last measured bandwidth', { size: 21, anchor: 'start', weight: 700 });
  const x0 = 120, cw = 42, chartTop = 70, chartH = 110, ytop = 230, ch = 44;
  const cx = i => x0 + i * cw + cw / 2;
  // bandwidth chart
  const yb = v => chartTop + chartH - (v / 10) * chartH;
  s.line(x0, chartTop + chartH, x0 + 12 * cw, chartTop + chartH, { tone: 'soft' });
  s.line(x0, chartTop, x0, chartTop + chartH, { tone: 'soft' });
  [0, 5, 10].forEach(v => s.text(x0 - 10, yb(v), `${v}`, { size: 17, tone: 'soft', anchor: 'end' }));
  s.text(x0 - 40, chartTop + chartH / 2, 'Mbps', { size: 18, tone: 'soft', rotate: -90 });
  s.path(bw.map((v, i) => [cx(i), yb(v)]), { tone: 'blue', smooth: false, width: 2.2 });
  bw.forEach((v, i) => s.circle(cx(i), yb(v), 9, { tone: 'blue' }));
  s.text(x0 + 12 * cw - 4, chartTop - 6, 'measured bandwidth', { size: 18, tone: 'blue', anchor: 'end' });
  s.rect(cx(4) - cw / 2 + 2, chartTop + 26, cw * 4 - 4, chartH - 26, { tone: 'red', dashed: true, width: 1.4 });
  s.text(cx(5) + cw / 2, chartTop + 12, 'tunnel', { size: 18, tone: 'red', weight: 700 });
  // grid
  const rows = rungs.map(() => bw.map(() => ''));
  const tones = {};
  pick.forEach((p, i) => { tones[`${p},${i}`] = 'green'; });
  s.grid(x0, ytop, rows, { cw, ch, tones, rowLabels: rungs.map(([n, r]) => `${n}  ${r}`) });
  s.path(pick.map((p, i) => [cx(i), ytop + p * ch + ch / 2]), { tone: 'ink', smooth: false, width: 2.6 });
  pick.forEach((p, i) => s.circle(cx(i), ytop + p * ch + ch / 2, 10, { tone: 'ink', fill: 'solid' }));
  const gb = ytop + rungs.length * ch;
  bw.forEach((_, i) => s.text(cx(i), gb + 18, i + 1, { size: 17, tone: 'soft' }));
  s.text(x0 + 6 * cw, gb + 44, 'segment number (6 s each, 72 s in all)', { size: 18, tone: 'soft' });
  s.text(x0 - 12, ytop - 18, 'rendition, Mbps', { size: 17, tone: 'soft', anchor: 'end' });
  s.text(20, gb + 84, 'starts at 480p for a fast first frame, climbs, drops 2 rungs', { size: 19, anchor: 'start' });
  s.text(20, gb + 110, 'in the dip, climbs back: a switch is the next file from another row', { size: 19, anchor: 'start' });
  s.save(__dirname, 'abr-grid');
}

// ── 3. The popularity curve and where each part of it is served from ───────
{
  const s = new Sketch({
    width: 620, height: 430, seed: 53,
    title: 'Views per video, videos ranked by popularity',
    desc: 'A steep curve: a small head of popular videos takes most of the watch time and is served from edge and ISP caches; the long tail of rarely watched videos is served through the origin shield from object storage, and its renditions move to cheaper storage tiers.',
  });
  s.text(20, 24, 'views per video, videos ranked from most to least watched', { size: 21, anchor: 'start', weight: 700 });
  const X0 = 70, X1 = 590, Y0 = 330, Y1 = 70;
  s.arrow(X0, Y0, X1 + 10, Y0, { tone: 'soft', headLen: 10 });
  s.arrow(X0, Y0, X0, Y1 - 10, { tone: 'soft', headLen: 10 });
  s.text(X1, Y0 + 22, 'videos, by rank', { size: 18, tone: 'soft', anchor: 'end' });
  s.text(X0 - 24, (Y0 + Y1) / 2, 'views', { size: 18, tone: 'soft', rotate: -90 });
  const f = x => Y0 - (Y0 - Y1 - 10) / Math.pow(1 + x / 14, 1.25);
  const pts = []; for (let x = 0; x <= X1 - X0; x += 10) pts.push([X0 + x, f(x)]);
  const cut = 70;
  // head shading
  const head = pts.filter(([x]) => x <= X0 + cut);
  s.path([[X0, Y0], ...head, [X0 + cut, Y0]], { tone: 'green', smooth: false, width: 1.2 });
  for (let x = X0 + 6; x < X0 + cut; x += 8) s.line(x, Y0 - 2, x, f(x - X0) + 4, { tone: 'green', width: 1 });
  for (let x = X0 + cut + 8; x < X1; x += 14) s.line(x, Y0 - 2, x, f(x - X0) + 2, { tone: 'amber', width: 1 });
  s.path(pts, { tone: 'ink', width: 2.4 });
  s.line(X0 + cut, Y0, X0 + cut, Y1 + 10, { tone: 'soft', dashed: true });
  s.text(X0 + cut + 14, 96, 'head: few videos, most of the watch time', { size: 19, anchor: 'start', tone: 'green', weight: 700 });
  s.text(X0 + cut + 14, 122, 'served from edge and ISP caches', { size: 18, anchor: 'start', tone: 'green' });
  s.text(X0 + cut + 140, 236, 'tail: most videos, few views each', { size: 19, anchor: 'start', tone: 'amber', weight: 700 });
  s.text(X0 + cut + 140, 262, 'misses go through the shield to', { size: 18, anchor: 'start', tone: 'amber' });
  s.text(X0 + cut + 140, 286, 'object storage; cold tiers after 90 days', { size: 18, anchor: 'start', tone: 'amber' });
  s.text(20, 380, 'the steeper the head, the higher the CDN hit ratio; at 95%', { size: 19, anchor: 'start' });
  s.text(20, 406, 'the origin serves only 5.2 of the 104 Tbps', { size: 19, anchor: 'start' });
  s.save(__dirname, 'long-tail');
}
