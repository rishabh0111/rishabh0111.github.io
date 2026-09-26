// Figures for Part 8: Trees. Build: node _templates/sketches/dsa-trees/figures.js
const { Sketch } = require('../sketch');

// ── BST insert and remove ────────────────────────────────────────────────
{
  const s = new Sketch({ width: 560, height: 320, title: 'The worked BST before remove(3)', desc: '8 at the root; 3 left with children 1 and 6; 6 has children 4 and 7; 10 right with right child 14; 14 has left child 13. 3 is the node to remove, 4 its in-order successor.', seed: 11 });
  const n8 = s.node(280, 40, 8);
  const n3 = s.node(150, 120, 3, { tone: 'red' }), n10 = s.node(410, 120, 10);
  const n1 = s.node(80, 200, 1), n6 = s.node(220, 200, 6), n14 = s.node(480, 200, 14);
  const n4 = s.node(170, 280, 4, { tone: 'amber' }), n7 = s.node(270, 280, 7), n13 = s.node(430, 280, 13);
  s.edge(n8, n3, { label: 'L' }); s.edge(n8, n10, { label: 'R' });
  s.edge(n3, n1, { label: 'L' }); s.edge(n3, n6, { label: 'R' });
  s.edge(n6, n4, { label: 'L' }); s.edge(n6, n7, { label: 'R' });
  s.edge(n10, n14, { label: 'R' }); s.edge(n14, n13, { label: 'L' });
  s.save(__dirname, 'bst-before');
}
{
  const s = new Sketch({ width: 560, height: 320, title: 'The worked BST after remove(3)', desc: '4 now sits where 3 was, with left child 1 and right child 6; 6 keeps only its right child 7; the right side 10, 14, 13 is unchanged.', seed: 12 });
  const n8 = s.node(280, 40, 8);
  const n4 = s.node(150, 120, 4, { tone: 'green' }), n10 = s.node(410, 120, 10);
  const n1 = s.node(80, 200, 1), n6 = s.node(220, 200, 6), n14 = s.node(480, 200, 14);
  const n7 = s.node(270, 280, 7), n13 = s.node(430, 280, 13);
  s.line(146, 256, 194, 304, { tone: 'red', width: 1.6 }); s.line(194, 256, 146, 304, { tone: 'red', width: 1.6 });
  const gone = s.node(170, 280, 4, { tone: 'soft', fill: 'none' });
  s.edge(n8, n4, { label: 'L' }); s.edge(n8, n10, { label: 'R' });
  s.edge(n4, n1, { label: 'L' }); s.edge(n4, n6, { label: 'R' });
  s.edge(n6, gone, { dashed: true, tone: 'soft' }); s.edge(n6, n7, { label: 'R' });
  s.edge(n10, n14, { label: 'R' }); s.edge(n14, n13, { label: 'L' });
  s.save(__dirname, 'bst-after');
}

// ── DFS ──────────────────────────────────────────────────────────────────
{
  const s = new Sketch({ width: 460, height: 250, title: 'The worked binary tree', desc: '1 at the root; left child -2 with children 4 and -5; right child 3 with only a right child 6.', seed: 21 });
  const a = s.node(230, 40, 1);
  const b = s.node(140, 120, -2), c = s.node(320, 120, 3);
  const d = s.node(85, 205, 4), e = s.node(195, 205, -5), f = s.node(380, 205, 6);
  s.edge(a, b); s.edge(a, c); s.edge(b, d); s.edge(b, e); s.edge(c, f, { label: 'R' });
  s.save(__dirname, 'dfs-tree');
}
{
  const s = new Sketch({ width: 680, height: 330, title: 'Call tree for the subtree-sum DFS', desc: 'Each box is one dfs call and what it returns. dfs(3) returns 9 and sets best to 9, which is the final answer; the root returns 7.', seed: 22 });
  const A = s.box(340, 45, 'dfs(1)\n1 + (-3) + 9 = 7');
  const B = s.box(175, 160, 'dfs(-2)\n-2 + 4 + (-5) = -3');
  const C = s.box(505, 160, 'dfs(3)\n3 + 0 + 6 = 9\nbest = 9', { tone: 'green' });
  const D = s.box(90, 280, 'dfs(4)\nreturns 4');
  const E = s.box(255, 280, 'dfs(-5)\nreturns -5');
  const F = s.box(425, 280, 'dfs(None)\nreturns 0', { tone: 'soft', dashed: true, textTone: 'soft' });
  const G = s.box(590, 280, 'dfs(6)\nreturns 6');
  s.connect(A, B); s.connect(A, C); s.connect(B, D); s.connect(B, E); s.connect(C, F); s.connect(C, G);
  s.save(__dirname, 'subtree-sum-calls');
}

// ── BFS ──────────────────────────────────────────────────────────────────
{
  const s = new Sketch({ width: 520, height: 250, title: 'The worked tree by level', desc: 'Level 0 holds 1; level 1 holds -2 and 3; level 2 holds 4, -5 and 6.', seed: 31 });
  const X = 60;
  const a = s.node(X + 230, 40, 1);
  const b = s.node(X + 140, 120, -2), c = s.node(X + 320, 120, 3);
  const d = s.node(X + 85, 205, 4), e = s.node(X + 195, 205, -5), f = s.node(X + 380, 205, 6);
  s.edge(a, b); s.edge(a, c); s.edge(b, d); s.edge(b, e); s.edge(c, f, { label: 'R' });
  [['level 0', 40], ['level 1', 120], ['level 2', 205]].forEach(([t, y]) => s.text(14, y, t, { size: 20, tone: 'soft', anchor: 'start' }));
  s.save(__dirname, 'bfs-levels');
}
{
  const s = new Sketch({ width: 600, height: 300, title: 'BFS queue at the start of each round', desc: 'Round 0: [1], size 1, sum 1. Round 1: [-2, 3], size 2, sum 1. Round 2: [4, -5, 6], size 3, sum 5. Round 3: empty, loop ends.', seed: 32 });
  s.text(30, 24, 'round', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(120, 24, 'queue (front on the left)', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(390, 24, 'size', { size: 19, tone: 'soft' });
  s.text(500, 24, 'level sum', { size: 19, tone: 'soft' });
  const rows = [[[1], 1, 1], [[-2, 3], 2, 1], [[4, -5, 6], 3, 5]];
  rows.forEach(([q, size, sum], r) => {
    const y = 50 + r * 62;
    s.text(55, y + 25, r, { size: 22 });
    s.array(120, y + 3, q, { cell: 56, height: 44, indices: false, tones: Object.fromEntries(q.map((_, i) => [i, 'blue'])) });
    s.text(390, y + 25, size, { size: 22 });
    s.text(500, y + 25, sum, { size: 23, tone: 'green', weight: 700 });
  });
  const y = 50 + 3 * 62;
  s.text(55, y + 25, 3, { size: 22 });
  s.rect(120, y + 3, 56, 44, { tone: 'soft', dashed: true });
  s.text(200, y + 25, 'empty: loop ends', { size: 21, tone: 'soft', anchor: 'start' });
  s.save(__dirname, 'bfs-queue');
}

// ── BST sets and maps ────────────────────────────────────────────────────
{
  const s = new Sketch({ width: 680, height: 380, title: 'The floor(5) walk on the worked BST', desc: 'Visit 8 (greater than 5, go left), 3 (record best 3, go right), 6 (greater than 5, go left), 4 (record best 4, go right), then None: stop, the answer is 4.', seed: 41 });
  const o = { tone: 'soft', fill: 'none' };
  const n8 = s.node(200, 40, 8, { tone: 'amber' });
  const n3 = s.node(110, 120, 3, { tone: 'blue' }), n10 = s.node(290, 120, 10, o);
  const n1 = s.node(55, 200, 1, o), n6 = s.node(170, 200, 6, { tone: 'amber' }), n14 = s.node(345, 200, 14, o);
  const n4 = s.node(125, 280, 4, { tone: 'green' }), n7 = s.node(215, 280, 7, o), n13 = s.node(300, 280, 13, o);
  const nil = s.node(170, 350, 'None', { r: 24, size: 16, tone: 'soft', fill: 'none' });
  s.edge(n8, n3, { label: 'L', width: 2.4 }); s.edge(n8, n10, { tone: 'soft' });
  s.edge(n3, n1, { tone: 'soft' }); s.edge(n3, n6, { label: 'R', width: 2.4 });
  s.edge(n6, n4, { label: 'L', width: 2.4 }); s.edge(n6, n7, { tone: 'soft' });
  s.edge(n10, n14, { tone: 'soft' }); s.edge(n14, n13, { tone: 'soft' });
  s.edge(n4, nil, { dashed: true, label: 'R' });
  const steps = [
    ['1.  8 > 5: go left', 'best None', 'amber'],
    ['2.  3 ≤ 5: record, go right', 'best 3', 'blue'],
    ['3.  6 > 5: go left', 'best 3', 'amber'],
    ['4.  4 ≤ 5: record, go right', 'best 4', 'green'],
    ['5.  None: stop', 'answer 4', 'green'],
  ];
  steps.forEach(([t, b, tn], i) => {
    const y = 70 + i * 56;
    s.text(395, y, t, { size: 21, anchor: 'start', tone: tn });
    s.text(425, y + 24, b, { size: 19, anchor: 'start', tone: 'soft' });
  });
  s.save(__dirname, 'floor-walk');
}

// ── Iterative DFS ────────────────────────────────────────────────────────
function stackTrace(name, title, desc, rows, seed) {
  const s = new Sketch({ width: 520, height: 56 + rows.length * 56, title, desc, seed });
  s.text(40, 22, 'pop', { size: 19, tone: 'soft' });
  s.text(100, 22, 'stack after (top on the right)', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(330, 22, 'output so far', { size: 19, tone: 'soft', anchor: 'start' });
  rows.forEach(([pop, st, out], r) => {
    const y = 42 + r * 56;
    s.text(40, y + 22, pop, { size: 23, tone: 'amber', weight: 700 });
    if (st.length) s.array(100, y, st, { cell: 50, height: 44, indices: false, tones: { [st.length - 1]: 'blue' } });
    else s.text(100, y + 22, 'empty', { size: 20, tone: 'soft', anchor: 'start' });
    s.text(330, y + 22, out, { size: 22, anchor: 'start' });
  });
  s.save(__dirname, name);
}
stackTrace('preorder-stack', 'Iterative preorder: stack after each pop and push',
  'Pop 1, stack [3, -2]; pop -2, stack [3, -5, 4]; pop 4, stack [3, -5]; pop -5, stack [3]; pop 3, stack [6]; pop 6, stack empty. Output 1 -2 4 -5 3 6.',
  [[1, [3, -2], '1'], [-2, [3, -5, 4], '1 -2'], [4, [3, -5], '1 -2 4'], [-5, [3], '1 -2 4 -5'], [3, [6], '1 -2 4 -5 3'], [6, [], '1 -2 4 -5 3 6']], 51);
stackTrace('inorder-stack', 'Iterative inorder: stack after each pop',
  'Push the left spine 1, -2, 4. Pop 4, stack [1, -2]; pop -2, stack [1]; push and pop -5, stack [1]; pop 1, empty; push and pop 3, empty; push and pop 6, empty. Output 4 -2 -5 1 3 6.',
  [[4, [1, -2], '4'], [-2, [1], '4 -2'], [-5, [1], '4 -2 -5'], [1, [], '4 -2 -5 1'], [3, [], '4 -2 -5 1 3'], [6, [], '4 -2 -5 1 3 6']], 52);
