const { Sketch } = require('../sketch');

// One legend entry: a small swatch and a word. Returns the x after it.
const key = (s, x, y, t, label, o = {}) => {
  s.rect(x, y - 9, 18, 18, { tone: t, fill: o.fill ?? 'hachure', width: 1.4, hachureGap: 4 });
  const size = o.size ?? 19;
  s.text(x + 26, y, label, { size, anchor: 'start', tone: o.textTone ?? t, weight: o.weight ?? 500 });
  return x + 26 + s.textWidth(label, size) * 0.85 + 22;
};

// 1. Plain recursion tree for ways(5): 15 calls. green = first time a state is
//    computed (the memoised spine), amber = a repeated subproblem.
{
  const s = new Sketch({
    width: 640, height: 460, seed: 7,
    title: 'Recursion tree of ways(5)',
    desc: 'Each node i is one call ways(i); the left child is the square-last branch (counted twice), the right child the domino-last branch. 15 calls: ways(3) twice, ways(2) three times, ways(1) five times, ways(0) three times. The leftmost spine 5, 4, 3, 2, 1, 0 (green) is all memoization computes; every other node (amber) repeats a state already solved.',
  });
  const Y = [50, 130, 210, 290, 370];
  const G = { tone: 'green' }, A = { tone: 'amber' };
  const a5 = s.node(366, Y[0], 5, G);
  const a4 = s.node(212, Y[1], 4, G);
  const b3 = s.node(520, Y[1], 3, A);
  const a3 = s.node(130, Y[2], 3, G);
  const b2 = s.node(295, Y[2], 2, A);
  const c2 = s.node(455, Y[2], 2, A);
  const c1 = s.node(585, Y[2], 1, A);
  const a2 = s.node(85, Y[3], 2, G);
  const a1 = s.node(175, Y[3], 1, A);
  const d1 = s.node(255, Y[3], 1, A);
  const b0 = s.node(335, Y[3], 0, A);
  const e1 = s.node(415, Y[3], 1, A);
  const c0 = s.node(495, Y[3], 0, A);
  const b1 = s.node(45, Y[4], 1, G);
  const a0 = s.node(125, Y[4], 0, G);
  const E = (p, c) => s.edge(p, c, { directed: true });
  E(a5, a4); E(a5, b3); E(a4, a3); E(a4, b2); E(a3, a2); E(a3, a1);
  E(a2, b1); E(a2, a0); E(b3, c2); E(b3, c1); E(b2, d1); E(b2, b0); E(c2, e1); E(c2, c0);
  s.text(620, 370, 'node i = a call ways(i)', { anchor: 'end', size: 19, tone: 'soft' });
  s.text(620, 398, 'left child: a square is last (×2)', { anchor: 'end', size: 19, tone: 'soft' });
  s.text(620, 426, 'right child: a domino is last', { anchor: 'end', size: 19, tone: 'soft' });
  s.text(20, 20, 'green: all that memo computes', { anchor: 'start', size: 19, tone: 'green', weight: 700 });
  s.text(620, 20, 'amber: repeat, already solved', { anchor: 'end', size: 19, tone: 'amber', weight: 700 });
  s.save(__dirname, 'recursion-tree');
}

// 2. Tabulation: computing dp[4] reads dp[2] and dp[3].
{
  const s = new Sketch({
    width: 560, height: 220, seed: 11,
    title: 'Filling dp[4] from dp[2] and dp[3]',
    desc: 'dp = [1, 2, 5, 12, 29, 70] for i = 0..5. Filling dp[4] reads only dp[2] and dp[3], already in the table; dp[5] comes later. dp[4] = 2 * dp[3] + dp[2] = 2 * 12 + 5 = 29.',
  });
  const a = s.array(115, 40, [1, 2, 5, 12, 29, 70], { cell: 62, tones: { 2: 'blue', 3: 'blue', 4: 'amber' }, dim: [5], label: 'dp[i]' });
  s.text(103, a.top + a.height + 16, 'i', { anchor: 'end', size: 17, tone: 'soft' });
  s.arrow(a.cx(3), a.top - 4, a.cx(4) - 6, a.top - 4, { bend: -28, tone: 'blue' });
  s.arrow(a.cx(2), a.top - 4, a.cx(4) + 6, a.top - 4, { bend: -48, tone: 'blue' });
  const ly = a.bottom + 14;
  s.text((a.cx(2) + a.cx(3)) / 2, ly, 'read', { size: 20, tone: 'blue', weight: 700 });
  s.text(a.cx(4), ly, 'filling', { size: 20, tone: 'amber', weight: 700 });
  s.text(a.cx(5), ly, 'not yet', { size: 20, tone: 'soft', weight: 700 });
  s.text(280, ly + 42, 'dp[4] = 2 · dp[3] + dp[2] = 2 · 12 + 5 = 29', { size: 23 });
  s.save(__dirname, 'table-read');
}

// 3. O(1) version: the two live cells (prev2, prev1) slide along the table.
{
  const vals = [1, 2, 5, 12, 29, 70];
  const steps = [['start', 1], ['i = 2', 2], ['i = 3', 3], ['i = 4', 4], ['i = 5', 5]];
  const rowH = 62, top = 104;
  const s = new Sketch({
    width: 620, height: top + steps.length * rowH + 4, seed: 13,
    title: 'Two variables sliding along the table',
    desc: 'Only two cells stay alive: prev2 (blue) and prev1 (amber); older cells are dropped. (prev2, prev1) after each step: start (1, 2), i = 2 (2, 5), i = 3 (5, 12), i = 4 (12, 29), i = 5 (29, 70); the answer is prev1 = 70.',
  });
  s.text(20, 20, 'O(1) space: only two cells stay alive', { anchor: 'start', size: 22, weight: 700 });
  let kx = key(s, 20, 52, 'blue', 'prev2', { weight: 700 });
  kx = key(s, kx, 52, 'amber', 'prev1', { weight: 700 });
  key(s, kx, 52, 'soft', 'dropped', { fill: 'none' });
  const x0 = 100, cell = 50;
  vals.forEach((_, i) => s.text(x0 + i * cell + cell / 2, 86, i, { size: 17, tone: 'soft' }));
  s.text(x0 - 14, 86, 'i', { anchor: 'end', size: 17, tone: 'soft' });
  steps.forEach(([lab, k], r) => {
    const y = top + r * rowH;
    const shown = vals.map((v, i) => (i <= k ? v : ''));
    const dim = vals.map((_, i) => i).filter(i => i < k - 1);
    s.array(x0, y, shown, { cell, height: 44, indices: false, tones: { [k - 1]: 'blue', [k]: 'amber' }, dim, label: lab, size: 22 });
    const note = `(${vals[k - 1]}, ${vals[k]})` + (k === 5 ? '  answer 70' : '');
    s.text(x0 + 6 * cell + 22, y + 23, note, { anchor: 'start', size: 21, tone: k === 5 ? 'green' : 'ink', weight: k === 5 ? 700 : 500 });
  });
  s.text(x0 + 6 * cell + 22, 86, '(prev2, prev1)', { anchor: 'start', size: 18, tone: 'soft' });
  s.save(__dirname, 'rolling');
}

// 4 & 5. Expand around a center on "abacca".
function expansion(name, heading, title, desc, rows, result, seed, sameStart) {
  const chars = 'abacca'.split('');
  const rowH = 66, x0 = 130, cell = 48, top = 104;
  const s = new Sketch({ width: 680, height: top + 20 + rows.length * rowH + 44, seed, title, desc });
  s.text(16, 20, heading, { anchor: 'start', size: 22, weight: 700 });
  let kx = key(s, 16, 52, 'blue', 'l (left)', { weight: 700 });
  kx = key(s, kx, 52, 'amber', 'r (right)', { weight: 700 });
  if (sameStart) kx = key(s, kx, 52, 'violet', 'l = r', { weight: 700 });
  key(s, kx, 52, 'green', 'palindrome so far', { weight: 700 });
  chars.forEach((_, i) => s.text(x0 + i * cell + cell / 2, 86, i, { size: 17, tone: 'soft' }));
  s.text(x0 - 14, 86, 'index', { anchor: 'end', size: 17, tone: 'soft' });
  rows.forEach((row, r) => {
    const y = top + r * rowH;
    const tones = {};
    (row.inner || []).forEach(i => { tones[i] = 'green'; });
    if (row.l >= 0 && row.l < 6) tones[row.l] = 'blue';
    if (row.r >= 0 && row.r < 6) tones[row.r] = row.l === row.r ? 'violet' : 'amber';
    s.array(x0, y, chars, { cell, height: 44, indices: false, tones, size: 24 });
    s.text(16, y + 23, row.label, { anchor: 'start', size: 20, tone: 'soft' });
    const ghost = (i, tone, lab) => {
      const gx = x0 + i * cell;
      s.rect(gx + 4, y + 4, cell - 8, 36, { tone, dashed: true });
      s.text(gx + cell / 2, y + 23, lab, { size: 17, tone, weight: 700 });
    };
    if (row.l < 0) ghost(row.l, 'blue', 'l=−1');
    if (row.r >= 6) ghost(row.r, 'amber', 'r=6');
    s.text(x0 + 7 * cell + 10, y + 23, row.note, { anchor: 'start', size: 19, tone: row.stop ? 'red' : 'ink' });
  });
  s.text(340, top + 20 + rows.length * rowH + 14, result, { size: 22, tone: 'green', weight: 700 });
  s.save(__dirname, name);
}

expansion('center-gap',
  'even case: center 7, the gap between s[3] and s[4]',
  'Expanding center 7, the gap between indices 3 and 4',
  'abacca. l is blue, r amber, the confirmed palindrome green. start l=3 r=4: c == c, widen. step 1 l=2 r=5: a == a, widen. step 2 l=1 r=6: r out of bounds, stop. Widest palindrome s[2..5] = acca.',
  [
    { label: 'start', l: 3, r: 4, note: "'c' == 'c' → widen" },
    { label: 'step 1', l: 2, r: 5, inner: [3, 4], note: "'a' == 'a' → widen" },
    { label: 'step 2', l: 1, r: 6, inner: [2, 3, 4, 5], note: 'r out of bounds → stop', stop: true },
  ],
  'widest = s[l+1 .. r−1] = s[2..5] = "acca"', 17, false);

expansion('center-char',
  'odd case: center 2, the character s[1]',
  'Expanding center 2, the character s[1]',
  'abacca. l and r start together on s[1] (violet); then l is blue, r amber, the confirmed palindrome green. start l=r=1: widen. step 1 l=0 r=2: a == a, widen. step 2 l=-1 r=3: l out of bounds, stop. Widest palindrome s[0..2] = aba.',
  [
    { label: 'start', l: 1, r: 1, note: "s[1] == s[1] → widen" },
    { label: 'step 1', l: 0, r: 2, inner: [1], note: "'a' == 'a' → widen" },
    { label: 'step 2', l: -1, r: 3, inner: [0, 1, 2], note: 'l out of bounds → stop', stop: true },
  ],
  'widest = s[l+1 .. r−1] = s[0..2] = "aba"', 19, true);
