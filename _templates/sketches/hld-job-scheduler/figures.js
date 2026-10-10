// Figures for HLD Part 15, Design a distributed job scheduler.
//   node _templates/sketches/hld-job-scheduler/figures.js
const { Sketch } = require('../sketch');

// ── 1. Two layers: the database holds everything, Redis holds the next 5 min ─
{
  const x0 = 60, ppm = 34;                // 09:00 at x0, 34 px per minute, 0..15 min
  const X = m => x0 + m * ppm;
  const s = new Sketch({ width: 660, height: 450, title: 'Database and Redis sorted set: two layers for finding due executions', desc: 'Timeline from 09:00 to 09:15. The database holds every future execution. Every 5 minutes a pre-loader copies the executions due in the next 5 minutes into a Redis sorted set scored by run time. A dispatcher pops members whose score has passed. A job created at 09:07 to run at 09:08 is written to both layers at once, because the pre-loader for that window has already run.', seed: 31 });
  s.text(20, 24, 'two layers: the database holds everything, Redis only the next 5 min', { size: 21, anchor: 'start', weight: 700 });
  // database layer
  s.text(x0, 70, 'database: every execution, months ahead', { size: 19, anchor: 'start', tone: 'cyan', weight: 600 });
  s.rect(x0, 84, X(15) - x0, 40, { tone: 'cyan', fill: 'hachure', width: 1.5 });
  s.arrow(X(15) + 6, 104, X(15) + 50, 104, { tone: 'cyan', width: 1.5 });
  s.text(X(15) + 30, 130, 'next week', { size: 17, tone: 'cyan' });
  // pre-loader runs
  [0, 5, 10].forEach(m => {
    s.arrow(X(m) + 6, 130, X(m) + 6, 186, { tone: 'violet', width: 1.6 });
    s.text(X(m) + 14, 158, `pre-load ${m === 0 ? '09:00' : (m === 5 ? '09:05' : '09:10')}`, { size: 17, tone: 'violet', anchor: 'start' });
  });
  // redis windows
  s.text(x0, 214, 'Redis sorted set, score = run time', { size: 19, anchor: 'start', tone: 'blue', weight: 600 });
  [0, 5, 10].forEach((m, i) => {
    s.rect(X(m) + 4, 230, 5 * ppm - 8, 40, { tone: 'blue', fill: i === 1 ? 'hachure' : undefined, width: 1.5 });
    s.text(X(m) + 12, 250, `${String(m).padStart(2, '0')}–${String(m + 5).padStart(2, '0')} min`, { size: 17, anchor: 'start' });
  });
  // late-created job
  s.circle(X(8.3), 250, 18, { tone: 'amber', fill: 'hachure', hachureGap: 3, width: 1.8 });
  s.arrow(X(9.6), 302, X(8.3) + 6, 264, { tone: 'amber', width: 1.5, headLen: 9 });
  s.text(X(9.6) - 8, 318, 'created 09:07, runs 09:08:', { size: 18, tone: 'amber', anchor: 'start' });
  s.text(X(9.6) - 8, 340, 'written to both layers', { size: 18, tone: 'amber', anchor: 'start' });
  // dispatcher
  s.line(X(7.75), 220, X(7.75), 286, { tone: 'green', dashed: true, width: 1.6 });
  s.text(X(7.75) - 6, 300, 'now 09:07:45: dispatcher pops', { size: 17, tone: 'green', anchor: 'end' });
  s.text(X(7.75) - 6, 322, 'every member with score ≤ now', { size: 17, tone: 'green', anchor: 'end' });
  // axis
  s.line(x0, 370, X(15), 370, { tone: 'ink', width: 1.4 });
  for (let m = 0; m <= 15; m += 5) {
    s.line(X(m), 364, X(m), 376, { tone: 'ink', width: 1.3 });
    s.text(X(m), 394, `09:${String(m).padStart(2, '0')}`, { size: 17, tone: 'soft' });
  }
  s.text(20, 432, 'Redis holds 10,000 a second × 300 s = 3 million members, about 300 MB', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'two-layer');
}

// ── 2. Lease, heartbeats, a frozen worker and a fencing check ──────────────
{
  const x0 = 70, pps = 7.6;               // 0 s at x0, 7.6 px per second, 0..75 s
  const X = t => x0 + t * pps;
  const s = new Sketch({ width: 660, height: 480, title: 'A 30-second lease kept alive by heartbeats, a frozen worker, and the fencing check', desc: 'Worker A claims attempt 1 at 0 s with a lease to 30 s and heartbeats at 10 and 20 s, pushing the lease to 50 s. It freezes at 25 s. The lease expires at 50 s, worker B claims attempt 2 at 52 s. A wakes at 62 s and tries to complete attempt 1; the write is rejected because the current attempt is 2.', seed: 32 });
  s.text(20, 24, 'lease 30 s, heartbeat every 10 s: a dead worker is noticed in ≤ 30 s', { size: 21, anchor: 'start', weight: 700 });
  const yA = 200, yB = 110;
  s.text(x0 - 14, yA, 'A', { size: 24, anchor: 'end', weight: 700, tone: 'blue' });
  s.text(x0 - 14, yB, 'B', { size: 24, anchor: 'end', weight: 700, tone: 'violet' });
  // A's run, frozen part
  s.rect(X(0), yA - 14, X(25) - X(0), 28, { tone: 'blue', fill: 'hachure', width: 1.5 });
  s.rect(X(25), yA - 14, X(62) - X(25), 28, { tone: 'soft', dashed: true, width: 1.3 });
  s.text((X(25) + X(62)) / 2, yA, 'frozen (GC pause)', { size: 18, tone: 'soft' });
  s.text(X(0) + 4, yA - 30, 'claim #1', { size: 17, tone: 'blue', anchor: 'start', weight: 600 });
  [10, 20].forEach(t => { s.line(X(t), yA - 20, X(t), yA + 20, { tone: 'blue', width: 2 }); s.text(X(t), yA + 34, 'beat', { size: 16, tone: 'blue' }); });
  // lease line
  s.text(x0 - 14, 270, 'lease', { size: 18, anchor: 'end', tone: 'soft' });
  s.line(X(0), 270, X(50), 270, { tone: 'green', width: 2.4 });
  s.text(X(25), 288, 'to 30 → 40 → 50 s', { size: 16, tone: 'green' });
  s.text(X(50), 252, 'expires', { size: 17, tone: 'red', weight: 600 });
  s.line(X(50), 260, X(50), 280, { tone: 'red', width: 2 });
  // B claims
  s.rect(X(52), yB - 14, X(75) - X(52), 28, { tone: 'violet', fill: 'hachure', width: 1.5 });
  s.text(X(52) - 6, yB - 30, 'claim #2 at 52 s', { size: 17, tone: 'violet', anchor: 'start', weight: 600 });
  // A wakes and is fenced
  s.arrow(X(62), yA + 16, X(62), 316, { tone: 'red', width: 1.6 });
  s.text(X(62) - 4, 336, 'A wakes at 62 s:', { size: 18, tone: 'red', anchor: 'end', weight: 600 });
  s.text(X(62) - 4, 358, '"complete attempt 1" → rejected,', { size: 18, tone: 'red', anchor: 'end' });
  s.text(X(62) - 4, 380, 'the current attempt is 2', { size: 18, tone: 'red', anchor: 'end' });
  // axis
  s.line(x0, 410, X(75), 410, { tone: 'ink', width: 1.4 });
  for (let t = 0; t <= 70; t += 10) {
    s.line(X(t), 404, X(t), 416, { tone: 'ink', width: 1.3 });
    s.text(X(t), 434, `${t} s`, { size: 17, tone: 'soft' });
  }
  s.text(20, 464, 'UPDATE … SET status = succeeded WHERE id = e AND attempt = 1: no row', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'lease-heartbeat');
}

// ── 3. Time buckets split into shards: the hot column ─────────────────────
{
  const cols = ['09:00', '10:00', '11:00', '12:00', '13:00'];
  const shardLabels = ['#0', '#1', '#2', '#3', '…', '#31'];
  const cw = 86, ch = 38, gx = 150, gy = 120;
  const tones = {};
  shardLabels.forEach((_, r) => { tones[`${r},0`] = 'amber'; for (let c = 1; c < cols.length; c++) tones[`${r},${c}`] = 'cyan'; });
  const rows = shardLabels.map(l => cols.map(() => (l === '…' ? '…' : '')));
  const s = new Sketch({ width: 660, height: 490, title: 'Execution partitions: hour bucket times 32 shards', desc: 'Columns are hour buckets, rows are 32 shards. The current hour, 09:00, takes every claim and completion write: 20,000 a second, 625 per shard. Future hours take only creates, spread over time. A single partition without shards would need 20,000 writes a second against a 1,000 per second limit.', seed: 33 });
  s.text(20, 24, 'partition key = hour bucket # shard (0–31), shard = hash(job) mod 32', { size: 21, anchor: 'start', weight: 700 });
  s.text(gx + cw * 2.5, 80, 'hour bucket', { size: 18, tone: 'soft' });
  const g = s.grid(gx, gy, rows, { cw, ch, tones, colLabels: cols, rowLabels: shardLabels, size: 20 });
  s.text(gx - 60, gy - 14, 'shard', { size: 18, tone: 'soft', anchor: 'end' });
  s.text(g.cx(0), g.bottom + 26, 'now: hot', { size: 19, tone: 'amber', weight: 700 });
  s.text(g.cx(2.5), g.bottom + 26, 'future: creates only', { size: 19, tone: 'cyan', weight: 700 });
  s.text(20, 412, 'claims + completions now: 10,000 / s × 2 = 20,000 writes / s', { size: 19, anchor: 'start' });
  s.text(20, 440, 'one partition takes 1,000 / s: unsharded it throttles 20×', { size: 19, anchor: 'start', tone: 'red' });
  s.text(20, 468, '32 shards: 20,000 ÷ 32 = 625 / s each, under the limit', { size: 19, anchor: 'start', tone: 'green' });
  s.save(__dirname, 'bucket-shards');
}
