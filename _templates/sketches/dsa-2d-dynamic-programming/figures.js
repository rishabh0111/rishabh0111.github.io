// Figures for Part 17, 2-D dynamic programming.
// Colour code used throughout: amber = the cell being filled, blue = the cells it reads,
// soft grey = walls / out of play, green = the chosen path or the winning option.
const { Sketch } = require('../sketch');

// ── 2-Dimension DP ─────────────────────────────────────────────────────────

// The input grid for the cheapest-path example.
{
  const s = new Sketch({ width: 440, height: 290, title: 'The 4 by 4 cost grid with three walls', desc: 'Row 0: 1 3 1 2. Row 1: 1 wall 5 1. Row 2: 4 2 1 wall. Row 3: 2 wall 1 1. Start at the top-left, finish at the bottom-right, moving only right or down.' });
  const rows = [
    ['1', '3', '1', '2'],
    ['1', '#', '5', '1'],
    ['4', '2', '1', '#'],
    ['2', '#', '1', '1'],
  ];
  const g = s.grid(110, 50, rows, {
    cw: 62, ch: 50, size: 24,
    tones: { '1,1': 'soft', '2,3': 'soft', '3,1': 'soft', '0,0': 'blue', '3,3': 'green' },
    rowLabels: ['r=0', 'r=1', 'r=2', 'r=3'], colLabels: ['c=0', 'c=1', 'c=2', 'c=3'],
  });
  s.text(g.x - 50, g.cy(0) - 2, 'start', { size: 18, tone: 'blue', anchor: 'end' });
  s.text(g.right + 12, g.cy(3), 'finish', { size: 20, tone: 'green', anchor: 'start' });
  s.text(220, 272, 'moves: right or down only · # = wall', { size: 20, tone: 'soft' });
  s.save(__dirname, 'grid-input');
}

// The filled dp table, two panels: filling dp[2][2] and filling dp[3][3].
{
  const s = new Sketch({ width: 680, height: 330, title: 'The cheapest-path dp table, filling two cells', desc: 'dp table rows: 1 4 5 7; 2 wall 10 8; 6 8 9 wall; 8 wall 10 11. Left: dp[2][2] reads 10 from above and 8 from the left, giving 1 + 8 = 9. Right: dp[3][3] reads infinity from the wall above and 10 from the left, giving 1 + 10 = 11.', seed: 2 });
  const rows = [
    ['1', '4', '5', '7'],
    ['2', '#', '10', '8'],
    ['6', '8', '9', '#'],
    ['8', '#', '10', '11'],
  ];
  const walls = { '1,1': 'soft', '2,3': 'soft', '3,1': 'soft' };
  const panel = (x, target, deps, caption, formula) => {
    const tones = { ...walls };
    deps.forEach(d => { tones[d] = 'blue'; });
    tones[target] = 'amber';
    const g = s.grid(x, 78, rows, { cw: 58, ch: 50, size: 23, tones, rowLabels: ['r=0', 'r=1', 'r=2', 'r=3'], colLabels: ['c=0', 'c=1', 'c=2', 'c=3'] });
    s.text(x + 116, 24, caption, { size: 22, weight: 700 });
    const [tr, tc] = target.split(',').map(Number);
    // arrow from above
    s.arrow(g.cx(tc) + 20, g.cy(tr - 1) + 8, g.cx(tc) + 20, g.cy(tr) - 12, { tone: 'blue', width: 2, headLen: 9 });
    // arrow from the left
    s.arrow(g.cx(tc - 1) + 8, g.cy(tr) + 18, g.cx(tc) - 14, g.cy(tr) + 18, { tone: 'blue', width: 2, headLen: 9 });
    s.text(x + 116, g.bottom + 30, formula, { size: 21 });
    return g;
  };
  panel(70, '2,2', ['1,2', '2,1'], 'filling dp[2][2]', '1 + min(10 up, 8 left) = 9');
  panel(410, '3,3', ['2,3', '3,2'], 'filling dp[3][3]', '1 + min(inf up, 10 left) = 11');
  s.save(__dirname, 'grid-dp');
}

// The day-by-day trace of the no-three-runs state machine.
{
  const s = new Sketch({ width: 520, height: 400, title: 'Trace of rest, run1 and run2 over five days', desc: 'points 3 2 5 10 7. Before day 0: rest 0, run1 and run2 minus infinity. Day 0: 0 3 -inf. Day 1: 3 2 5. Day 2: 5 8 7. Day 3: 8 15 18. Day 4: 18 15 22. The best plan reads back run2 day 4, run1 day 3, rest day 2, run2 day 1, run1 day 0.', seed: 3 });
  const NI = '-inf';
  const rows = [
    ['-', '0', NI, NI],
    ['3', '0', '3', NI],
    ['2', '3', '2', '5'],
    ['5', '5', '8', '7'],
    ['10', '8', '15', '18'],
    ['7', '18', '15', '22'],
  ];
  const path = [[1, 2], [2, 3], [3, 1], [4, 2], [5, 3]];
  const tones = {};
  path.forEach(([r, c]) => { tones[`${r},${c}`] = 'green'; });
  const g = s.grid(130, 50, rows, {
    cw: 82, ch: 46, size: 23, tones,
    rowLabels: ['before', 'day 0', 'day 1', 'day 2', 'day 3', 'day 4'],
    colLabels: ['points', 'rest', 'run1', 'run2'],
  });
  for (let i = 0; i + 1 < path.length; i++) {
    const [r1, c1] = path[i], [r2, c2] = path[i + 1];
    const dx = Math.sign(c2 - c1);
    s.arrow(g.cx(c1) + dx * 26, g.cy(r1) + 17, g.cx(c2) - dx * 26, g.cy(r2) - 15, { tone: 'green', width: 1.9, headLen: 9 });
  }
  s.text(260, g.bottom + 28, 'answer = max(18, 15, 22) = 22', { size: 22, weight: 700 });
  s.save(__dirname, 'training-trace');
}

// The state machine: which mode may follow which.
{
  const s = new Sketch({ width: 620, height: 300, title: 'State machine for never running three days in a row', desc: 'rest can go to rest or to run1; run1 can go to run2 or back to rest; run2 can only go to rest.', seed: 4 });
  const rest = s.box(120, 190, 'rest', { tone: 'green', w: 110, h: 56, size: 24 });
  const run1 = s.box(320, 80, 'run1', { tone: 'blue', w: 110, h: 56, size: 24 });
  const run2 = s.box(520, 190, 'run2', { tone: 'amber', w: 110, h: 56, size: 24 });
  // self loop on rest
  s.arrow(rest.left + 14, rest.bottom + 4, rest.left - 4, rest.top + 16, { bend: -46, tone: 'ink', headLen: 10 });
  s.text(rest.left - 44, rest.cy + 8, 'rest', { size: 19, anchor: 'end' });
  // rest -> run1 and run1 -> rest
  s.arrow(rest.cx + 10, rest.top - 4, run1.left - 6, run1.cy - 6, { bend: 26, tone: 'blue', headLen: 10 });
  s.text(170, 88, 'run: + points[i]', { size: 19, tone: 'blue' });
  s.arrow(run1.left + 20, run1.bottom + 4, rest.right + 4, rest.cy - 4, { bend: 10, tone: 'ink', headLen: 10 });
  s.text(250, 170, 'rest', { size: 19 });
  // run1 -> run2
  s.arrow(run1.right + 6, run1.cy - 6, run2.cx + 10, run2.top - 4, { bend: 26, tone: 'blue', headLen: 10 });
  s.text(470, 88, 'run: + points[i]', { size: 19, tone: 'blue' });
  // run2 -> rest
  s.arrow(run2.left - 6, run2.cy + 12, rest.right + 6, rest.cy + 12, { tone: 'ink', headLen: 10 });
  s.text(320, 222, 'rest', { size: 19 });
  s.text(520, 262, 'no run arrow out of run2', { size: 19, tone: 'soft' });
  s.save(__dirname, 'state-machine');
}

// ── 0 / 1 Knapsack ─────────────────────────────────────────────────────────

const capLabels = ['c=0', 'c=1', 'c=2', 'c=3', 'c=4', 'c=5', 'c=6'];

// One array, swept downward, after each item.
{
  const s = new Sketch({ width: 600, height: 250, title: 'The 0/1 knapsack array after each item, capacity swept downward', desc: 'after item (2 kg, 3): 0 0 3 3 3 3 3. After item (3 kg, 5): 0 0 3 5 5 8 8. After item (4 kg, 6): 0 0 3 5 6 8 9.', seed: 5 });
  const rows = [
    ['0', '0', '3', '3', '3', '3', '3'],
    ['0', '0', '3', '5', '5', '8', '8'],
    ['0', '0', '3', '5', '6', '8', '9'],
  ];
  const tones = {};
  [[0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 3], [1, 4], [1, 5], [1, 6], [2, 4], [2, 6]].forEach(([r, c]) => { tones[`${r},${c}`] = 'amber'; });
  const g = s.grid(190, 50, rows, { cw: 54, ch: 46, size: 23, tones, rowLabels: ['after w=2, v=3', 'after w=3, v=5', 'after w=4, v=6'], colLabels: capLabels });
  s.arrow(g.right - 10, g.bottom + 26, g.x + 10, g.bottom + 26, { tone: 'soft', headLen: 10 });
  s.text((g.x + g.right) / 2, g.bottom + 50, 'each pass sweeps c from 6 down to w', { size: 20, tone: 'soft' });
  s.save(__dirname, 'knap01-array');
}

// The full 0/1 table: dp[3][6] reads two cells in row 2.
{
  const s = new Sketch({ width: 640, height: 340, title: 'The 0/1 knapsack table, filling dp[3][6]', desc: 'Rows i=0 to 3, capacity 0 to 6. dp[3][6] = max(skip: dp[2][6] = 8, take: dp[2][2] + 6 = 9) = 9. Both inputs come from row 2.', seed: 6 });
  const rows = [
    ['0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '3', '3', '3', '3', '3'],
    ['0', '0', '3', '5', '5', '8', '8'],
    ['0', '0', '3', '5', '6', '8', '9'],
  ];
  const g = s.grid(180, 50, rows, {
    cw: 54, ch: 52, size: 23,
    tones: { '2,6': 'blue', '2,2': 'blue', '3,6': 'amber' },
    rowLabels: ['i=0 (no items)', 'i=1 (w=2, v=3)', 'i=2 (w=3, v=5)', 'i=3 (w=4, v=6)'], colLabels: capLabels,
  });
  // skip: straight down
  s.arrow(g.cx(6) + 16, g.cy(2) + 8, g.cx(6) + 16, g.cy(3) - 10, { tone: 'blue', width: 2, headLen: 9 });
  s.text(g.right + 10, g.y + 2 * g.ch + g.ch, 'skip: 8', { size: 20, tone: 'blue', anchor: 'start' });
  // take: from dp[2][2], along the border between rows 2 and 3
  s.arrow(g.cx(2) + 14, g.cy(2) + 16, g.cx(6) - 22, g.cy(3) - 12, { tone: 'blue', width: 2, headLen: 10 });
  s.text(g.cx(4), g.bottom + 22, 'take from dp[2][2]: 3 + 6', { size: 20, tone: 'blue' });
  s.text(g.x + 190, g.bottom + 58, 'dp[3][6] = max(skip 8, take dp[2][2] + 6 = 9) = 9', { size: 21, weight: 700 });
  s.save(__dirname, 'knap01-table');
}

// ── Unbounded Knapsack ─────────────────────────────────────────────────────

// One array, swept upward, after each item.
{
  const s = new Sketch({ width: 600, height: 250, title: 'The unbounded knapsack array after each item, capacity swept upward', desc: 'after item (2 kg, 3): 0 0 3 3 6 6 9. After item (3 kg, 5): 0 0 3 5 6 8 10. After item (4 kg, 6): 0 0 3 5 6 8 10, unchanged.', seed: 7 });
  const rows = [
    ['0', '0', '3', '3', '6', '6', '9'],
    ['0', '0', '3', '5', '6', '8', '10'],
    ['0', '0', '3', '5', '6', '8', '10'],
  ];
  const tones = {};
  [[0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 3], [1, 5], [1, 6]].forEach(([r, c]) => { tones[`${r},${c}`] = 'amber'; });
  const g = s.grid(190, 50, rows, { cw: 54, ch: 46, size: 23, tones, rowLabels: ['after w=2, v=3', 'after w=3, v=5', 'after w=4, v=6'], colLabels: capLabels });
  s.arrow(g.x + 10, g.bottom + 26, g.right - 10, g.bottom + 26, { tone: 'soft', headLen: 10 });
  s.text((g.x + g.right) / 2, g.bottom + 50, 'each pass sweeps c from w up to 6', { size: 20, tone: 'soft' });
  s.save(__dirname, 'unbounded-array');
}

// The unbounded table: dp[2][6] reads its own row.
{
  const s = new Sketch({ width: 640, height: 300, title: 'The unbounded knapsack table, filling dp[2][6]', desc: 'Rows i=0 to 2, capacity 0 to 6. dp[2][6] = max(skip: dp[1][6] = 9, take: dp[2][3] + 5 = 10) = 10. The take input is in the same row.', seed: 8 });
  const rows = [
    ['0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '3', '3', '6', '6', '9'],
    ['0', '0', '3', '5', '6', '8', '10'],
  ];
  const g = s.grid(180, 50, rows, {
    cw: 54, ch: 52, size: 23,
    tones: { '1,6': 'blue', '2,3': 'blue', '2,6': 'amber' },
    rowLabels: ['i=0 (no items)', 'i=1 (w=2, v=3)', 'i=2 (w=3, v=5)'], colLabels: capLabels,
  });
  s.arrow(g.cx(6) + 16, g.cy(1) + 8, g.cx(6) + 16, g.cy(2) - 10, { tone: 'blue', width: 2, headLen: 9 });
  s.text(g.right + 10, g.y + g.ch * 2, 'skip: 9', { size: 20, tone: 'blue', anchor: 'start' });
  // take: same row, arc underneath the grid
  s.arrow(g.cx(3), g.bottom + 4, g.cx(6), g.bottom + 4, { bend: 30, tone: 'blue', width: 2, headLen: 10 });
  s.text((g.cx(3) + g.cx(6)) / 2, g.bottom + 48, 'take: 5 + 5, same row', { size: 20, tone: 'blue' });
  s.text(g.x + 190, g.bottom + 82, 'dp[2][6] = max(skip 9, take dp[2][3] + 5 = 10) = 10', { size: 21, weight: 700 });
  s.save(__dirname, 'unbounded-table');
}

// ── LCS (shortest common supersequence) ────────────────────────────────────

{
  const s = new Sketch({ width: 560, height: 400, title: 'Shortest common supersequence table for abac and cab', desc: 'Rows: empty, a, b, a, c. Columns: empty, c, a, b. Row values: 0 1 2 3; 1 2 2 3; 2 3 3 3; 3 4 4 4; 4 4 5 5. dp[4][3]: c differs from b, 1 + min(up 4, left 5) = 5. dp[4][1]: c equals c, diagonal 3 + 1 = 4.', seed: 9 });
  const rows = [
    ['0', '1', '2', '3'],
    ['1', '2', '2', '3'],
    ['2', '3', '3', '3'],
    ['3', '4', '4', '4'],
    ['4', '4', '5', '5'],
  ];
  const g = s.grid(170, 60, rows, {
    cw: 62, ch: 48, size: 23,
    tones: { '3,3': 'blue', '4,2': 'blue', '4,3': 'amber', '3,0': 'green', '4,1': 'green' },
    rowLabels: ['i=0  (empty)', 'i=1  a', 'i=2  b', 'i=3  a', 'i=4  c'],
    colLabels: ['j=0', 'j=1 c', 'j=2 a', 'j=3 b'],
  });
  // mismatch at (4,3): up and left
  s.arrow(g.cx(3) + 18, g.cy(3) + 6, g.cx(3) + 18, g.cy(4) - 8, { tone: 'blue', width: 2, headLen: 9 });
  s.arrow(g.cx(2) + 8, g.cy(4) + 14, g.cx(3) - 10, g.cy(4) + 14, { tone: 'blue', width: 2, headLen: 9 });
  // match at (4,1): diagonal
  s.arrow(g.cx(0) + 10, g.cy(3) + 10, g.cx(1) - 10, g.cy(4) - 10, { tone: 'green', width: 2, headLen: 9 });
  s.text(40, g.bottom + 30, "dp[4][3]: 'c' ≠ 'b' → 1 + min(up 4, left 5) = 5", { size: 21, tone: 'amber', anchor: 'start', weight: 700 });
  s.text(40, g.bottom + 62, "dp[4][1]: 'c' = 'c' → diagonal 3 + 1 = 4", { size: 21, tone: 'green', anchor: 'start', weight: 700 });
  s.save(__dirname, 'scs-table');
}

// ── Interval DP ────────────────────────────────────────────────────────────

// Every split of the full chain.
{
  const s = new Sketch({ width: 620, height: 250, title: 'Every split k for the full chain A0 to A3', desc: 'k=0: 0 + 12000 + 40*20*30 = 36000. k=1: 24000 + 9000 + 40*30*30 = 69000. k=2: 14000 + 0 + 40*10*30 = 26000, the minimum.', seed: 10 });
  const rows = [
    ['0', '12000', '40·20·30', '24000', '36000'],
    ['24000', '9000', '40·30·30', '36000', '69000'],
    ['14000', '0', '40·10·30', '12000', '26000'],
  ];
  const tones = { '2,0': 'green', '2,1': 'green', '2,2': 'green', '2,3': 'green', '2,4': 'green' };
  const g = s.grid(90, 60, rows, { cw: 100, ch: 48, size: 21, tones, rowLabels: ['k = 0', 'k = 1', 'k = 2'], colLabels: ['dp[0][k]', 'dp[k+1][3]', 'shapes', 'last step', 'total'] });
  s.text(g.right - 50, g.bottom + 26, 'min ↑', { size: 21, tone: 'green', weight: 700 });
  s.text(g.x, g.bottom + 26, 'dp[0][3] = 26000', { size: 22, anchor: 'start', weight: 700 });
  s.save(__dirname, 'chain-splits');
}

// The triangle table: fill order by length, and what dp[0][3] reads.
{
  const s = new Sketch({ width: 680, height: 360, title: 'Matrix-chain dp table: diagonals by length, and the cells dp[0][3] reads', desc: 'Upper triangle: row 0: 0, 24000, 14000, 26000; row 1: 0, 6000, 12000; row 2: 0, 9000; row 3: 0. Left panel tints each diagonal by interval length 1 to 4. Right panel: dp[0][3] with split k = 2 reads dp[0][2] to its left and dp[3][3] below it.', seed: 11 });
  const rows = [
    ['0', '24000', '14000', '26000'],
    ['', '0', '6000', '12000'],
    ['', '', '0', '9000'],
    ['', '', '', '0'],
  ];
  const dim = ['1,0', '2,0', '2,1', '3,0', '3,1', '3,2'];
  const lenTone = ['green', 'cyan', 'violet', 'amber'];
  const t1 = {};
  for (let i = 0; i < 4; i++) for (let j = i; j < 4; j++) t1[`${i},${j}`] = lenTone[j - i];
  const rl = ['i=0', 'i=1', 'i=2', 'i=3'], cl = ['j=0', 'j=1', 'j=2', 'j=3'];
  const g1 = s.grid(55, 70, rows, { cw: 62, ch: 48, size: 20, tones: t1, dim, rowLabels: rl, colLabels: cl });
  s.text(g1.x + 132, 22, 'fill order: shortest first', { size: 22, weight: 700 });
  s.text(g1.x - 30, g1.bottom + 28, 'length 1', { size: 20, tone: 'green', anchor: 'start', weight: 700 });
  s.text(g1.x + 60, g1.bottom + 28, 'length 2', { size: 20, tone: 'cyan', anchor: 'start', weight: 700 });
  s.text(g1.x + 150, g1.bottom + 28, 'length 3', { size: 20, tone: 'violet', anchor: 'start', weight: 700 });
  s.text(g1.x + 240, g1.bottom + 28, 'length 4', { size: 20, tone: 'amber', anchor: 'start', weight: 700 });

  const g2 = s.grid(380, 70, rows, { cw: 62, ch: 48, size: 20, tones: { '0,3': 'amber', '0,2': 'blue', '3,3': 'blue' }, dim, rowLabels: rl, colLabels: cl });
  s.text(g2.x + 132, 22, 'dp[0][3], split k = 2', { size: 22, weight: 700 });
  s.arrow(g2.cx(2) + 12, g2.cy(0) + 18, g2.cx(3) - 14, g2.cy(0) + 18, { tone: 'blue', width: 2, headLen: 9 });
  s.arrow(g2.right + 4, g2.cy(3), g2.right + 4, g2.cy(0) + 4, { bend: 26, tone: 'blue', width: 2, headLen: 10 });
  s.text(g2.x + 20, g2.bottom + 28, '14000 + 0 + 40·10·30 = 26000', { size: 20, anchor: 'start', weight: 700 });
  s.text(g2.x + 20, g2.bottom + 58, 'reads: left in its row, below in its column', { size: 18, tone: 'soft', anchor: 'start' });
  s.save(__dirname, 'chain-table');
}
