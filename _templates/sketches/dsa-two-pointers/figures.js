// Figures for Part 3: Two Pointers.
//   node _templates/sketches/dsa-two-pointers/figures.js
const { Sketch } = require('../sketch');

const NUMS = [-4, -1, 2, 3, 5, 8];

// 1. Pointer positions on the worked example, one row per step.
{
  const steps = [
    { l: 0, r: 5, sum: '-4 + 8 = 4, not < 4', act: 'right -= 1', tone: 'red' },
    { l: 0, r: 4, sum: '-4 + 5 = 1 < 4', act: 'count += 4, left += 1', tone: 'green' },
    { l: 1, r: 4, sum: '-1 + 5 = 4, not < 4', act: 'right -= 1', tone: 'red' },
    { l: 1, r: 3, sum: '-1 + 3 = 2 < 4', act: 'count += 2, left += 1', tone: 'green' },
    { l: 2, r: 3, sum: '2 + 3 = 5, not < 4', act: 'right -= 1', tone: 'red' },
    { l: 2, r: 2, sum: 'left == right: stop', act: 'count = 6', tone: 'ink', end: true },
  ];
  const ROW = 76, TOP = 58, AX = 92, CELL = 44;
  const s = new Sketch({
    width: 580, height: TOP + steps.length * ROW + 6, seed: 11,
    title: 'Two pointers counting pairs with sum < 4 on [-4, -1, 2, 3, 5, 8]',
    desc: 'Five steps. Step 1: left 0, right 5, sum 4, right moves. Step 2: left 0, right 4, sum 1, count 4, left moves. Step 3: left 1, right 4, sum 4, right moves. Step 4: left 1, right 3, sum 2, count 6, left moves. Step 5: left 2, right 3, sum 5, right moves. End: left equals right at index 2, count 6.',
  });
  // header: indices
  NUMS.forEach((_, i) => s.text(AX + i * CELL + CELL / 2, 22, i, { size: 18, tone: 'soft' }));
  s.text(AX - 12, 22, 'index', { size: 18, tone: 'soft', anchor: 'end' });
  steps.forEach((st, k) => {
    const y = TOP + k * ROW;
    const tones = {}, dim = [];
    NUMS.forEach((_, i) => { if (i < st.l || i > st.r) dim.push(i); });
    if (st.end) tones[st.l] = 'violet';
    else { tones[st.l] = 'blue'; tones[st.r] = 'amber'; }
    const a = s.array(AX, y, NUMS, { cell: CELL, indices: false, tones, dim, size: 21, label: st.end ? 'end' : `step ${k + 1}`, labelSize: 20 });
    if (st.end) s.text(a.cx(st.l), y + CELL + 13, 'L R', { size: 17, tone: 'violet', weight: 700 });
    else {
      s.text(a.cx(st.l), y + CELL + 13, 'L', { size: 17, tone: 'blue', weight: 700 });
      s.text(a.cx(st.r), y + CELL + 13, 'R', { size: 17, tone: 'amber', weight: 700 });
    }
    const tx = AX + a.width + 22;
    s.text(tx, y + 11, st.sum, { size: 20, anchor: 'start' });
    s.text(tx, y + 35, (st.end ? '' : '→ ') + st.act, { size: 20, anchor: 'start', tone: st.tone, weight: 700 });
  });
  s.save(__dirname, 'pointer-trace');
}

// 2. The 15 candidate pairs as a triangle; each cell marked with the step that decided it.
{
  const mark = {
    '0,1': '+2', '0,2': '+2', '0,3': '+2', '0,4': '+2', '0,5': '×1',
    '1,2': '+4', '1,3': '+4', '1,4': '×3', '1,5': '×1',
    '2,3': '×5', '2,4': '×3', '2,5': '×1',
    '3,4': '×3', '3,5': '×1',
    '4,5': '×1',
  };
  const s = new Sketch({
    width: 520, height: 420, seed: 23,
    title: 'All 15 pairs of [-4, -1, 2, 3, 5, 8] and the step that decided each',
    desc: 'Row i, column j, for i < j. Row 0 columns 1 to 4 counted at step 2; row 1 columns 2 and 3 counted at step 4. Column 5 ruled out at step 1, column 4 rows 1 to 3 at step 3, cell (2,3) at step 5. Six cells counted.',
  });
  const GX = 142, GY = 64, CW = 58, CH = 48;
  s.text(GX + 3 * CW, 22, 'j', { size: 20, tone: 'soft' });
  for (let j = 0; j < 6; j++) s.text(GX + j * CW + CW / 2, GY - 14, j, { size: 18, tone: 'soft' });
  NUMS.forEach((v, i) => s.text(GX - 10, GY + i * CH + CH / 2, `i=${i} (${v})`, { size: 18, tone: 'soft', anchor: 'end' }));
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
    const m = mark[`${i},${j}`];
    const t = m.startsWith('+') ? 'green' : 'red';
    s.rect(GX + j * CW, GY + i * CH, CW, CH, { tone: t, fill: 'hachure', width: 1.4, hachureGap: 7 });
    s.text(GX + j * CW + CW / 2, GY + i * CH + CH / 2 + 1, m, { size: 21, weight: 600 });
  }
  // the diagonal: an index paired with itself is not a pair
  s.line(GX + 6, GY + 6, GX + 6 * CW - 6, GY + 6 * CH - 6, { tone: 'soft', dashed: true, width: 1.3 });
  s.text(GX + 1.4 * CW, GY + 4.4 * CH, 'i ≥ j: not a pair', { size: 19, tone: 'soft' });
  const g = { bottom: GY + 6 * CH };
  s.text(20, g.bottom + 34, '+k  counted at step k', { size: 20, anchor: 'start', tone: 'green', weight: 700 });
  s.text(270, g.bottom + 34, '×k  ruled out at step k', { size: 20, anchor: 'start', tone: 'red', weight: 700 });
  s.text(260, g.bottom + 68, '6 cells counted: rows are + steps, columns are × steps', { size: 19, tone: 'soft' });
  s.save(__dirname, 'pair-grid');
}
