// Part 11: Backtracking. Build: node _templates/sketches/dsa-backtracking/figures.js
const { Sketch } = require('../sketch');

// Label an edge with the choice made on it, offset sideways from the edge's midpoint.
function choice(s, a, b, label, o = {}) {
  s.edge(a, b, { dashed: o.dashed, tone: o.tone });
  const mx = (a.cx + b.cx) / 2, my = (a.cy + b.cy) / 2;
  const dx = b.cx - a.cx;
  const side = o.side ?? (dx < -1 ? -1 : dx > 1 ? 1 : 1);
  const off = o.off ?? 14;
  s.text(mx + side * off, my - (o.up ?? 4), label, {
    size: o.size ?? 19, tone: o.labelTone ?? o.tone ?? 'violet', anchor: side < 0 ? 'end' : 'start', weight: 700,
  });
}

// ── Tree Maze: the example tree ───────────────────────────────────────────
{
  const s = new Sketch({ width: 460, height: 310, title: 'The Tree Maze example tree',
    desc: 'Root 4. Left child 0 (a wall) with right child 7. Right child 1 with children 3 and 2. Node 3 has a left child 0 (a wall).', seed: 11 });
  const n4 = s.node(230, 45, 4);
  const w1 = s.node(130, 125, 0, { tone: 'red' });
  const n1 = s.node(330, 125, 1);
  const n7 = s.node(180, 205, 7);
  const n3 = s.node(270, 205, 3);
  const n2 = s.node(390, 205, 2);
  const w2 = s.node(220, 280, 0, { tone: 'red' });
  s.edge(n4, w1); s.edge(n4, n1); s.edge(w1, n7); s.edge(n1, n3); s.edge(n1, n2); s.edge(n3, w2);
  s.text(92, 125, 'wall', { size: 19, tone: 'red', anchor: 'end' });
  s.text(182, 280, 'wall', { size: 19, tone: 'red', anchor: 'end' });
  s.save(__dirname, 'maze-tree');
}

// ── Tree Maze: the call-by-call trace ─────────────────────────────────────
{
  const rows = [
    { d: 0, call: 'call on 4', act: 'push 4', path: [4], hot: 0 },
    { d: 1, call: 'call on 0', act: 'blocked', path: [4], note: '7 never visited', tone: 'red' },
    { d: 1, call: 'call on 1', act: 'push 1', path: [4, 1], hot: 1 },
    { d: 2, call: 'call on 3', act: 'push 3', path: [4, 1, 3], hot: 2 },
    { d: 3, call: 'call on 0', act: 'blocked', path: [4, 1, 3], tone: 'red' },
    { d: 3, call: 'call on None', act: '', path: [4, 1, 3], note: '3 has no right child' },
    { d: 2, call: 'back in 3', act: 'pop 3', path: [4, 1], note: '<- the backtrack', band: 'amber' },
    { d: 2, call: 'call on 2', act: 'push 2', path: [4, 1, 2], hot: 2 },
    { d: 2, call: '', act: 'leaf', path: null, note: 'return True', band: 'green' },
  ];
  const top = 58, rh = 44;
  const s = new Sketch({ width: 660, height: top + rows.length * rh + 10, title: 'Tree Maze call trace',
    desc: 'Each call in order with the action taken and the contents of path afterwards.', seed: 12 });
  s.text(20, 24, 'call', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(225, 24, 'action', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(320, 24, 'path after', { size: 19, tone: 'soft', anchor: 'start' });
  rows.forEach((r, i) => {
    const y = top + i * rh;
    if (r.band) s.highlight(12, y - 2, 636, rh - 4, { tone: r.band });
    const cy = y + (rh - 4) / 2;
    if (r.call) s.text(20 + r.d * 22, cy, r.call, { size: 20, anchor: 'start' });
    if (r.act) s.text(225, cy, r.act, { size: 20, anchor: 'start', tone: r.tone ?? 'ink', weight: 700 });
    if (r.path) {
      const tones = r.hot !== undefined ? { [r.hot]: 'blue' } : {};
      s.array(320, y + 2, r.path, { cell: 36, indices: false, size: 20, tones });
    }
    if (r.note) s.text(r.path ? 450 : 320, cy, r.note, { size: 19, anchor: 'start', tone: r.band ? 'ink' : 'soft' });
  });
  s.save(__dirname, 'maze-trace');
}

// ── Tree Maze: the search on the tree ─────────────────────────────────────
{
  const s = new Sketch({ width: 560, height: 340, title: 'What the Tree Maze search does to each node',
    desc: '4 push, left 0 wall, 7 never visited, 1 push, 3 push then pop, 0 under 3 wall, 2 push and leaf: done.', seed: 13 });
  const n4 = s.node(280, 45, 4, { tone: 'green' });
  const w1 = s.node(160, 130, 0, { tone: 'red' });
  const n1 = s.node(400, 130, 1, { tone: 'green' });
  const n7 = s.node(215, 225, 7, { tone: 'soft' });
  const n3 = s.node(340, 225, 3, { tone: 'amber' });
  const n2 = s.node(470, 225, 2, { tone: 'green' });
  const w2 = s.node(290, 305, 0, { tone: 'red' });
  s.edge(n4, w1); s.edge(n4, n1); s.edge(w1, n7, { dashed: true, tone: 'soft' });
  s.edge(n1, n3); s.edge(n1, n2); s.edge(n3, w2);
  s.text(250, 45, 'push', { size: 19, anchor: 'end' });
  s.text(125, 130, 'wall', { size: 19, anchor: 'end', tone: 'red' });
  s.text(435, 130, 'push', { size: 19, anchor: 'start' });
  s.text(180, 225, 'never', { size: 19, anchor: 'end', tone: 'soft' });
  s.text(180, 247, 'visited', { size: 19, anchor: 'end', tone: 'soft' });
  s.text(375, 225, 'push,', { size: 19, anchor: 'start', tone: 'amber' });
  s.text(375, 247, 'then pop', { size: 19, anchor: 'start', tone: 'amber' });
  s.text(470, 274, 'push, leaf:', { size: 19, tone: 'green' });
  s.text(470, 296, 'done', { size: 19, tone: 'green' });
  s.text(255, 305, 'wall', { size: 19, anchor: 'end', tone: 'red' });
  s.save(__dirname, 'maze-search');
}

// ── Subsets: the include / exclude tree on "abc" ──────────────────────────
{
  const s = new Sketch({ width: 680, height: 360, title: 'Include/exclude recursion tree for "abc"',
    desc: 'Each level decides one letter: left edge includes it, right edge skips it. Leaves left to right: abc, ab, ac, a, bc, b, c, empty.', seed: 14 });
  const letters = ['a', 'b', 'c'];
  const ys = [45, 130, 215, 310];
  const leafX = i => 45 + 80 * i;
  // x of node k at depth d: the midpoint of the leaves under it
  const xAt = (d, k) => { const span = 2 ** (3 - d); return (leafX(k * span) + leafX(k * span + span - 1)) / 2; };
  const name = p => (p === '' ? '[ ]' : p);
  const nodes = [];
  for (let d = 0; d <= 3; d++) {
    nodes[d] = [];
    for (let k = 0; k < 2 ** d; k++) {
      // path contents: bit j (from the top) = 0 means "included letter j"
      let p = '';
      for (let j = 0; j < d; j++) if (((k >> (d - 1 - j)) & 1) === 0) p += letters[j];
      nodes[d][k] = s.node(xAt(d, k), ys[d], name(p), { r: d === 3 ? 25 : 23, tone: d === 3 ? 'green' : undefined, size: p.length === 3 ? 19 : 20 });
    }
  }
  for (let d = 0; d < 3; d++) for (let k = 0; k < 2 ** d; k++) {
    choice(s, nodes[d][k], nodes[d + 1][2 * k], '+' + letters[d], { off: 12 });
    choice(s, nodes[d][k], nodes[d + 1][2 * k + 1], '-' + letters[d], { off: 12, labelTone: 'soft' });
  }
  ['i=0', 'i=1', 'i=2', 'i=3'].forEach((l, d) => s.text(672, ys[d], l, { size: 18, tone: 'soft', anchor: 'end' }));
  s.save(__dirname, 'subsets-tree');
}

// ── Combinations: n = 4, k = 2 ────────────────────────────────────────────
{
  const s = new Sketch({ width: 680, height: 330, title: 'Combinations tree for n = 4, k = 2',
    desc: 'Root start=1 tries x in 1..3; choosing 4 is pruned. Children [1], [2], [3] try x in 2..4, 3..4, 4..4. Leaves 12, 13, 14, 23, 24, 34.', seed: 15 });
  const root = s.node(330, 62, '[ ]');
  s.text(330, 20, 'start=1, x in 1..3', { size: 18, tone: 'soft' });
  const c1 = s.node(130, 160, '1'), c2 = s.node(330, 160, '2'), c3 = s.node(490, 160, '3');
  const c4 = s.node(625, 160, '4', { tone: 'red' });
  choice(s, root, c1, '1', { off: 12 });
  choice(s, root, c2, '2', { off: 10, side: -1 });
  choice(s, root, c3, '3', { off: 12 });
  choice(s, root, c4, '4 pruned', { tone: 'red', dashed: true, off: 12 });
  s.text(625, 204, "[4] can't", { size: 18, tone: 'red' });
  s.text(625, 225, 'reach size 2', { size: 18, tone: 'red' });
  const ann = (x, y, a, b, anchor) => { s.text(x, y - 11, a, { size: 18, tone: 'soft', anchor }); s.text(x, y + 11, b, { size: 18, tone: 'soft', anchor }); };
  ann(97, 160, 'start=2', 'x in 2..4', 'end');
  ann(362, 160, 'start=3', 'x in 3..4', 'start');
  ann(522, 160, 'start=4', 'x in 4..4', 'start');
  const leaf = (x, l) => s.node(x, 280, l, { r: 25, tone: 'green' });
  const l12 = leaf(50, '12'), l13 = leaf(130, '13'), l14 = leaf(210, '14');
  const l23 = leaf(290, '23'), l24 = leaf(370, '24'), l34 = leaf(490, '34');
  choice(s, c1, l12, '2', { off: 10 }); choice(s, c1, l13, '3', { off: 8 }); choice(s, c1, l14, '4', { off: 10 });
  choice(s, c2, l23, '3', { off: 10 }); choice(s, c2, l24, '4', { off: 10 });
  choice(s, c3, l34, '4', { off: 10 });
  s.save(__dirname, 'combos-tree');
}

// ── Permutations: "abc" ───────────────────────────────────────────────────
{
  const s = new Sketch({ width: 680, height: 360, title: 'Permutations tree for "abc"',
    desc: 'Root [ ] branches to a, b, c; each branches to the two unused letters; each of those has one child. Leaves: abc, acb, bac, bca, cab, cba.', seed: 16 });
  const ys = [45, 135, 225, 315];
  const leafX = i => 50 + 106 * i;
  const root = s.node(340, ys[0], '[ ]');
  const firsts = ['a', 'b', 'c'];
  firsts.forEach((f, i) => {
    const x1 = (leafX(2 * i) + leafX(2 * i + 1)) / 2;
    const n1 = s.node(x1, ys[1], f);
    choice(s, root, n1, f, { off: i === 1 ? 10 : 14, side: i === 1 ? 1 : undefined });
    const rest = firsts.filter(c => c !== f);
    rest.forEach((g, j) => {
      const x = leafX(2 * i + j);
      const n2 = s.node(x, ys[2], f + g);
      choice(s, n1, n2, g, { off: 10 });
      const h = rest.find(c => c !== g);
      const n3 = s.node(x, ys[3], f + g + h, { r: 25, tone: 'green', size: 19 });
      choice(s, n2, n3, h, { off: 10 });
    });
  });
  ['depth 0', 'depth 1', 'depth 2', 'depth 3'].forEach((l, d) => s.text(672, ys[d], l, { size: 17, tone: 'soft', anchor: 'end' }));
  s.save(__dirname, 'perms-tree');
}

// ── Permutations: state between the first and second answer ──────────────
{
  const rows = [
    { step: 'record "abc"', path: 'abc', used: 'TTT', band: 'green' },
    { step: 'pop c, used[2]=False', path: 'ab', used: 'TTF', hot: 2 },
    { note: 'depth-2 loop over, return' },
    { step: 'pop b, used[1]=False', path: 'a', used: 'TFF', hot: 1 },
    { note: 'depth-1 loop moves to i=2' },
    { step: 'push c, used[2]=True', path: 'ac', used: 'TFT', hot: 2 },
    { step: 'push b, used[1]=True', path: 'acb', used: 'TTT', hot: 1 },
    { step: 'record "acb"', path: 'acb', used: 'TTT', band: 'green' },
  ];
  const top = 72, rh = 44;
  const px = 270, ux = 420;
  const s = new Sketch({ width: 640, height: top + rows.length * rh + 8, title: 'Permutation state from the first answer to the second',
    desc: 'path and the used flags for a, b, c at each step between recording abc and recording acb.', seed: 17 });
  s.text(20, 30, 'step', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(px, 30, 'path', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(ux, 30, 'used', { size: 19, tone: 'soft', anchor: 'start' });
  ['a', 'b', 'c'].forEach((c, i) => s.text(ux + 46 + 22 + i * 44, 30, c, { size: 19, tone: 'soft' }));
  rows.forEach((r, i) => {
    const y = top + i * rh;
    const cy = y + (rh - 4) / 2;
    if (r.band) s.highlight(12, y - 2, 600, rh - 4, { tone: r.band });
    if (r.note) { s.text(44, cy, r.note, { size: 19, tone: 'soft', anchor: 'start' }); return; }
    s.text(20, cy, r.step, { size: 20, anchor: 'start' });
    s.array(px, y + 2, r.path.split(''), { cell: 36, indices: false, size: 20 });
    const tones = {};
    [...r.used].forEach((u, k) => { if (u === 'T') tones[k] = 'blue'; });
    if (r.hot !== undefined) tones[r.hot] = 'amber';   // the flag this step just flipped
    const dim = [...r.used].map((u, k) => (u === 'F' ? k : -1)).filter(k => k >= 0);
    s.array(ux + 46, y + 2, [...r.used], { cell: 44, height: 36, indices: false, size: 20, tones, dim });
  });
  s.save(__dirname, 'perms-state');
}
