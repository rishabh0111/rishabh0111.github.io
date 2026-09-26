// Figures for Part 16: Advanced Graphs (dsa-advanced-graphs).
// node _templates/sketches/dsa-advanced-graphs/figures.js
const { Sketch } = require('../sketch');

// Weight label placed at an edge's midpoint, pushed `off` px along the edge's normal
// (positive = left of travel from a to b), plus optional along-edge shift `t` (0..1).
function weight(s, a, b, label, off, o = {}) {
  const t = o.t ?? 0.5;
  const mx = a.cx + (b.cx - a.cx) * t, my = a.cy + (b.cy - a.cy) * t;
  const L = Math.hypot(b.cx - a.cx, b.cy - a.cy) || 1;
  const nx = (b.cy - a.cy) / L, ny = -(b.cx - a.cx) / L;
  s.text(mx + nx * off, my + ny * off, label, { size: o.size ?? 24, tone: o.tone ?? 'ink', weight: 700 });
}

// ── Dijkstra: the example graph ───────────────────────────────────────────
{
  const s = new Sketch({ width: 620, height: 290, seed: 11, title: 'Dijkstra example graph, source 0',
    desc: 'Directed edges 0 to 1 weight 4, 0 to 2 weight 1, 2 to 1 weight 2, 1 to 3 weight 1, 2 to 3 weight 5, 3 to 4 weight 3. Final distances 0, 3, 1, 4, 7. Shortest-path edges 0-2, 2-1, 1-3, 3-4 in blue.' });
  const n0 = s.node(70, 145, 0, { r: 25, tone: 'green' });
  const n1 = s.node(240, 60, 1, { r: 25 });
  const n2 = s.node(240, 230, 2, { r: 25 });
  const n3 = s.node(420, 145, 3, { r: 25 });
  const n4 = s.node(565, 145, 4, { r: 25 });
  s.edge(n0, n1, { directed: true, tone: 'soft' });
  s.edge(n0, n2, { directed: true, tone: 'blue', width: 2.6 });
  s.edge(n2, n1, { directed: true, tone: 'blue', width: 2.6 });
  s.edge(n1, n3, { directed: true, tone: 'blue', width: 2.6 });
  s.edge(n2, n3, { directed: true, tone: 'soft' });
  s.edge(n3, n4, { directed: true, tone: 'blue', width: 2.6 });
  weight(s, n0, n1, '4', 18, { tone: 'soft' });
  weight(s, n0, n2, '1', -18, { tone: 'blue' });
  weight(s, n2, n1, '2', -16, { tone: 'blue' });
  weight(s, n1, n3, '1', 18, { tone: 'blue' });
  weight(s, n2, n3, '5', -18, { tone: 'soft' });
  weight(s, n3, n4, '3', 16, { tone: 'blue' });
  const d = (n, txt, dy) => s.text(n.cx, n.cy + dy, txt, { size: 20, tone: 'soft' });
  d(n0, 'd = 0', 45); d(n1, 'd = 3', -42); d(n2, 'd = 1', 45); d(n3, 'd = 4', 45); d(n4, 'd = 7', 45);
  s.save(__dirname, 'dijkstra-graph');
}

// ── Dijkstra: heap trace ──────────────────────────────────────────────────
{
  const steps = [
    ['(0,0)', 'settle', ['(1,2)', '(4,1)'], [0, 1]],
    ['(1,2)', 'settle', ['(3,1)', '(4,1)', '(6,3)'], [0, 2]],
    ['(3,1)', 'settle', ['(4,1)', '(4,3)', '(6,3)'], [1]],
    ['(4,1)', 'stale', ['(4,3)', '(6,3)'], []],
    ['(4,3)', 'settle', ['(6,3)', '(7,4)'], [1]],
    ['(6,3)', 'stale', ['(7,4)'], []],
    ['(7,4)', 'settle', [], []],
  ];
  const rowH = 54, top = 78;
  const s = new Sketch({ width: 600, height: top + steps.length * rowH + 110, seed: 12, title: 'Dijkstra heap trace',
    desc: 'Seven pops: (0,0) settle, (1,2) settle, (3,1) settle, (4,1) stale, (4,3) settle, (6,3) stale, (7,4) settle. Final dist 0, 3, 1, 4, 7.' });
  s.text(30, 36, 'step', { size: 20, tone: 'soft' });
  s.text(110, 36, 'pop', { size: 20, tone: 'soft' });
  s.text(290, 36, 'heap afterwards', { size: 20, tone: 'soft', anchor: 'start' });
  s.text(490, 36, '(amber = pushed)', { size: 18, tone: 'amber', anchor: 'start' });
  steps.forEach(([pop, act, heap, fresh], i) => {
    const y = top + i * rowH;
    const t = act === 'settle' ? 'green' : 'red';
    s.text(30, y + 18, i + 1, { size: 22, tone: 'soft' });
    s.rect(65, y, 90, 36, { tone: t, fill: 'hachure', label: pop, size: 21 });
    s.text(170, y + 18, act, { size: 20, tone: t, anchor: 'start', weight: 700 });
    if (heap.length) {
      const tones = {}; fresh.forEach(k => { tones[k] = 'amber'; });
      s.array(290, y, heap, { cell: 80, height: 36, size: 20, indices: false, tones });
    } else s.text(290, y + 18, 'empty', { size: 20, tone: 'soft', anchor: 'start' });
  });
  const y = top + steps.length * rowH + 20;
  s.array(290, y, [0, 3, 1, 4, 7], { cell: 50, size: 22, label: 'dist', tones: {} });
  s.text(278, y + 66, 'node', { size: 18, tone: 'soft', anchor: 'end' });
  s.save(__dirname, 'dijkstra-heap');
}

// ── Prim / MST: the example graph ─────────────────────────────────────────
function mstGraph(s) {
  const n0 = s.node(70, 150, 0, { r: 25 });
  const n1 = s.node(235, 55, 1, { r: 25 });
  const n2 = s.node(235, 250, 2, { r: 25 });
  const n3 = s.node(420, 55, 3, { r: 25 });
  const n4 = s.node(565, 150, 4, { r: 25 });
  return { n0, n1, n2, n3, n4 };
}
{
  const s = new Sketch({ width: 630, height: 300, seed: 13, title: 'MST example graph',
    desc: 'Undirected edges 0-1 weight 4, 0-2 weight 1, 1-2 weight 2, 1-3 weight 5, 2-3 weight 8, 3-4 weight 3, 2-4 weight 9. MST edges 0-2, 1-2, 1-3, 3-4 in green, total 11.' });
  const { n0, n1, n2, n3, n4 } = mstGraph(s);
  const mst = { tone: 'green', width: 3.2 }, rest = { tone: 'soft', dashed: true };
  s.edge(n0, n1, rest); s.edge(n2, n3, rest); s.edge(n2, n4, rest);
  s.edge(n0, n2, mst); s.edge(n1, n2, mst); s.edge(n1, n3, mst); s.edge(n3, n4, mst);
  weight(s, n0, n1, '4', 18, { tone: 'soft' });
  weight(s, n0, n2, '1', -18, { tone: 'green' });
  weight(s, n1, n2, '2', 18, { tone: 'green', t: 0.35 });
  weight(s, n1, n3, '5', 18, { tone: 'green' });
  weight(s, n2, n3, '8', 18, { tone: 'soft', t: 0.4 });
  weight(s, n3, n4, '3', 18, { tone: 'green' });
  weight(s, n2, n4, '9', -18, { tone: 'soft' });
  s.text(565, 250, 'MST total 11', { size: 22, tone: 'green', weight: 700 });
  s.save(__dirname, 'mst-graph');
}

// ── Prim: trace from node 0 ───────────────────────────────────────────────
{
  const steps = [
    ['(0,0,-)', 'add', 0, ['(4,1,0)', '(1,2,0)']],
    ['(1,2,0)', 'add', 1, ['(2,1,2)', '(8,3,2)', '(9,4,2)']],
    ['(2,1,2)', 'add', 3, ['(5,3,1)']],
    ['(4,1,0)', 'stale', 3, []],
    ['(5,3,1)', 'add', 8, ['(3,4,3)']],
    ['(3,4,3)', 'add', 11, null],
  ];
  const rowH = 54, top = 78;
  const s = new Sketch({ width: 660, height: top + steps.length * rowH + 20, seed: 14, title: 'Prim trace from node 0',
    desc: 'Heap entries (weight, node, from). Steps: add (0,0), add (1,2,0), add (2,1,2), stale (4,1,0), add (5,3,1), add (3,4,3); totals 0, 1, 3, 3, 8, 11.' });
  s.text(30, 36, 'step', { size: 20, tone: 'soft' });
  s.text(62, 36, 'pop (w, node, from)', { size: 20, tone: 'soft', anchor: 'start' });
  s.text(262, 36, 'total', { size: 20, tone: 'soft' });
  s.text(320, 36, 'pushes', { size: 20, tone: 'soft', anchor: 'start' });
  steps.forEach(([pop, act, total, pushes], i) => {
    const y = top + i * rowH;
    const t = act === 'add' ? 'green' : 'red';
    s.text(30, y + 18, i + 1, { size: 22, tone: 'soft' });
    s.rect(62, y, 110, 36, { tone: t, fill: 'hachure', label: pop, size: 21 });
    s.text(185, y + 18, act, { size: 20, tone: t, anchor: 'start', weight: 700 });
    s.text(262, y + 18, total, { size: 23, weight: 700 });
    if (pushes === null) s.text(320, y + 18, 'tree has 5 nodes: stop', { size: 21, tone: 'green', anchor: 'start', weight: 700 });
    else if (pushes.length) s.array(320, y, pushes, { cell: 92, height: 36, size: 20, indices: false, tones: {} });
    else s.text(320, y + 18, '-', { size: 22, tone: 'soft', anchor: 'start' });
  });
  s.save(__dirname, 'prim-trace');
}

// ── Kruskal: sorted edges and components ──────────────────────────────────
{
  const rows = [
    ['1', '0-2', [[0], [1], [2], [3], [4]], 'take', 'total 1', [[0], [2]]],
    ['2', '1-2', [[0, 2], [1], [3], [4]], 'take', 'total 3', [[0, 2], [1]]],
    ['3', '3-4', [[0, 1, 2], [3], [4]], 'take', 'total 6', [[3], [4]]],
    ['4', '0-1', [[0, 1, 2], [3, 4]], 'skip', '0, 1 same group', [[0, 1, 2]]],
    ['5', '1-3', [[0, 1, 2], [3, 4]], 'take', 'total 11, V-1 edges: stop', [[0, 1, 2], [3, 4]]],
    ['8', '2-3', null, 'never', 'never examined', []],
    ['9', '2-4', null, 'never', 'never examined', []],
  ];
  const rowH = 56, top = 78;
  const s = new Sketch({ width: 680, height: top + rows.length * rowH + 10, seed: 15, title: 'Kruskal on the MST example',
    desc: 'Edges in weight order. 1: 0-2 take, total 1. 2: 1-2 take, total 3. 3: 3-4 take, total 6. 4: 0-1 skip, both in {0,1,2}. 5: 1-3 take, total 11, stop. 8: 2-3 and 9: 2-4 never examined.' });
  s.text(28, 36, 'w', { size: 20, tone: 'soft' });
  s.text(75, 36, 'edge', { size: 20, tone: 'soft' });
  s.text(120, 36, 'components before', { size: 20, tone: 'soft', anchor: 'start' });
  s.text(430, 36, 'action', { size: 20, tone: 'soft', anchor: 'start' });
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  rows.forEach(([w, e, comps, act, note, hit], i) => {
    const y = top + i * rowH;
    const at = act === 'take' ? 'green' : act === 'skip' ? 'red' : 'soft';
    s.text(28, y + 18, w, { size: 24, weight: 700, tone: act === 'never' ? 'soft' : 'ink' });
    s.text(75, y + 18, e, { size: 23, weight: 700, tone: act === 'never' ? 'soft' : 'ink' });
    if (comps) {
      let x = 120;
      comps.forEach(c => {
        const wBox = c.length * 22 + 24;
        const isHit = hit.some(h => same(h, c));
        const t = isHit ? (act === 'skip' ? 'red' : 'amber') : undefined;
        s.rect(x, y, wBox, 36, { tone: t ?? 'ink', fill: t ? 'hachure' : undefined, label: c.join(' '), size: 21, width: 1.5 });
        x += wBox + 10;
      });
    } else s.text(120, y + 18, '-', { size: 22, tone: 'soft', anchor: 'start' });
    s.text(430, y + 18, act === 'never' ? note : `${act}: ${note}`, { size: 20, tone: at, anchor: 'start', weight: 700 });
  });
  s.save(__dirname, 'kruskal-trace');
}

// ── Topological sort: the build pipeline ──────────────────────────────────
{
  const s = new Sketch({ width: 640, height: 260, seed: 16, title: 'Build pipeline dependency graph',
    desc: 'Edges fetch to lint, fetch to build, build to test, test to ship, lint to ship. docs has no edges.' });
  const fetch = s.box(75, 110, 'fetch');
  const lint = s.box(250, 45, 'lint');
  const build = s.box(250, 175, 'build');
  const test = s.box(410, 175, 'test');
  const ship = s.box(565, 110, 'ship');
  const docs = s.box(75, 220, 'docs', { tone: 'soft', dashed: true });
  s.connect(fetch, lint); s.connect(fetch, build); s.connect(build, test);
  s.connect(test, ship); s.connect(lint, ship);
  s.text(docs.right + 12, 220, 'no rules', { size: 19, tone: 'soft', anchor: 'start' });
  s.save(__dirname, 'topo-graph');
}

// ── Kahn's trace ──────────────────────────────────────────────────────────
{
  const names = ['fetch', 'lint', 'build', 'test', 'ship', 'docs'];
  // each row: label, indegree/placed per node, changed columns, queue after
  const P = '✓';
  const rows = [
    ['start', [0, 1, 1, 1, 2, 0], [], ['fetch', 'docs']],
    ['pop fetch', [P, 0, 0, 1, 2, 0], [1, 2], ['docs', 'lint', 'build']],
    ['pop docs', [P, 0, 0, 1, 2, P], [], ['lint', 'build']],
    ['pop lint', [P, P, 0, 1, 1, P], [4], ['build']],
    ['pop build', [P, P, P, 0, 1, P], [3], ['test']],
    ['pop test', [P, P, P, P, 0, P], [4], ['ship']],
    ['pop ship', [P, P, P, P, P, P], [], []],
  ];
  const gx = 110, cw = 58, ch = 46, gy = 74, qx = 478;
  const s = new Sketch({ width: 680, height: gy + rows.length * ch + 70, seed: 17, title: "Kahn's algorithm trace",
    desc: 'Indegree per node after each pop, with the queue. Pops in order fetch, docs, lint, build, test, ship. 6 of 6 placed, a valid order.' });
  const tones = {};
  rows.forEach(([, vals, changed], r) => {
    vals.forEach((v, c) => { if (v === P) tones[`${r},${c}`] = 'green'; });
    changed.forEach(c => { tones[`${r},${c}`] = 'amber'; });
  });
  s.grid(gx, gy, rows.map(r => r[1].map(String)), { cw, ch, tones, size: 21, colLabels: names });
  rows.forEach(([label], r) => s.text(gx - 10, gy + r * ch + ch / 2, label, { size: 19, tone: 'ink', anchor: 'end', weight: 600 }));
  s.text(gx - 10, gy - 14, 'indegree', { size: 18, tone: 'soft', anchor: 'end' });
  s.text(qx, gy - 14, 'queue after', { size: 18, tone: 'soft', anchor: 'start' });
  rows.forEach(([, , , q], r) => {
    const y = gy + r * ch + 5;
    if (q.length) s.array(qx, y, q, { cell: 64, height: ch - 10, size: 19, indices: false, tones: Object.fromEntries(q.map((_, i) => [i, 'blue'])) });
    else s.text(qx, y + (ch - 10) / 2, 'empty', { size: 19, tone: 'soft', anchor: 'start' });
  });
  const by = gy + rows.length * ch + 32;
  s.text(20, by, 'output: fetch, docs, lint, build, test, ship  (6 of 6 placed: valid order)', { size: 21, tone: 'green', anchor: 'start', weight: 700 });
  s.save(__dirname, 'kahn-trace');
}

// ── Bellman-Ford: rounds with an edge budget ──────────────────────────────
{
  const rows = [
    ['start (r = 0)', ['0', 'inf', 'inf', 'inf'], [], ''],
    ['round 1 (≤ 1 edge)', ['0', '5', '1', 'inf'], [1, 2], '0→1, 0→2'],
    ['round 2 (≤ 2 edges)', ['0', '4', '1', '2'], [1, 3], '0→2→1, 0→2→3'],
    ['round 3 (≤ 3 edges)', ['0', '3', '1', '2'], [1], '0→2→3→1'],
    ['round 4', ['0', '3', '1', '2'], [], 'no change: stop'],
  ];
  const gx = 200, cw = 60, ch = 44, gy = 64;
  const bugY = gy + rows.length * ch + 40;
  const s = new Sketch({ width: 680, height: bugY + ch + 20, seed: 18, title: 'Bellman-Ford rounds with a snapshot',
    desc: 'Edges 0 to 2 weight 1, 2 to 3 weight 1, 3 to 1 weight 1, 0 to 1 weight 5, 2 to 1 weight 3. dist to node 1 is 5, 4, 3 after rounds 1, 2, 3. In-place round 1 wrongly gives 3.' });
  const tones = {};
  rows.forEach(([, , ch2], r) => ch2.forEach(c => { tones[`${r},${c}`] = 'amber'; }));
  s.grid(gx, gy, rows.map(r => r[1]), { cw, ch, tones, size: 21, colLabels: ['0', '1', '2', '3'] });
  s.text(gx - 10, gy - 14, 'node', { size: 18, tone: 'soft', anchor: 'end' });
  rows.forEach(([label, , , note], r) => {
    s.text(gx - 10, gy + r * ch + ch / 2, label, { size: 19, anchor: 'end', weight: 600 });
    if (note) s.text(gx + 4 * cw + 14, gy + r * ch + ch / 2, note, { size: 19, anchor: 'start', tone: note.startsWith('no') ? 'soft' : 'amber', weight: 600 });
  });
  s.line(20, bugY - 20, 660, bugY - 20, { tone: 'soft', dashed: true, width: 1.2 });
  s.grid(gx, bugY, [['0', '3', '1', '2']], { cw, ch, size: 21, tones: { '0,1': 'red', '0,2': 'red', '0,3': 'red' } });
  s.text(gx - 10, bugY + ch / 2, 'in-place round 1', { size: 19, anchor: 'end', tone: 'red', weight: 700 });
  s.text(gx + 4 * cw + 14, bugY + ch / 2, 'bug: 0→2, 2→3, 3→1 chain', { size: 19, anchor: 'start', tone: 'red', weight: 600 });
  s.save(__dirname, 'bellman-rounds');
}
