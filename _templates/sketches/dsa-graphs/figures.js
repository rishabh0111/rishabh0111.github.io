// Figures for Part 14, Graphs.  node _templates/sketches/dsa-graphs/figures.js
const { Sketch } = require('../sketch');

// The worked grid shared by Matrix DFS and Matrix BFS (1 = wall).
const G = [[0, 0, 0, 1], [1, 0, 0, 0], [1, 0, 1, 0], [0, 1, 0, 0]];
const WALLS = {};
G.forEach((row, r) => row.forEach((v, c) => { if (v === 1) WALLS[`${r},${c}`] = 'soft'; }));
const RL = ['r0', 'r1', 'r2', 'r3'], CL = ['c0', 'c1', 'c2', 'c3'];

// 1. The example undirected graph: two components.
{
  const s = new Sketch({ width: 480, height: 230, title: 'Undirected graph, 5 vertices, 4 edges, two components', desc: 'Edges 0-1, 0-2, 1-2 form a triangle; edge 3-4 is a separate piece.', seed: 2 });
  const n0 = s.node(110, 50, 0), n1 = s.node(50, 150, 1), n2 = s.node(170, 150, 2);
  const n3 = s.node(310, 100, 3, { tone: 'violet' }), n4 = s.node(420, 100, 4, { tone: 'violet' });
  s.edge(n0, n1); s.edge(n0, n2); s.edge(n1, n2); s.edge(n3, n4);
  s.text(110, 205, 'component {0, 1, 2}', { size: 20, tone: 'soft' });
  s.text(365, 160, 'component {3, 4}', { size: 20, tone: 'violet' });
  s.save(__dirname, 'intro-graph');
}

// 2. Adjacency matrix vs adjacency list for the same graph.
{
  const s = new Sketch({ width: 660, height: 330, title: 'Adjacency matrix and adjacency list of the example graph', desc: 'Matrix: 25 cells, 8 of them 1. List: 0:[1,2] 1:[0,2] 2:[0,1] 3:[4] 4:[3], 8 entries.', seed: 3 });
  const M = [[0, 1, 1, 0, 0], [1, 0, 1, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0]];
  const tones = {};
  M.forEach((row, r) => row.forEach((v, c) => { if (v) tones[`${r},${c}`] = 'blue'; }));
  s.text(160, 22, 'adjacency matrix', { size: 24, weight: 700 });
  const g = s.grid(60, 70, M.map(r => r.map(String)), { cw: 42, ch: 40, tones, rowLabels: ['0', '1', '2', '3', '4'], colLabels: ['0', '1', '2', '3', '4'] });
  s.text(g.x + 105, g.bottom + 30, '25 cells, 8 of them are 1', { size: 20, tone: 'soft' });
  s.text(490, 22, 'adjacency list', { size: 24, weight: 700 });
  const L = [[1, 2], [0, 2], [0, 1], [4], [3]];
  L.forEach((vals, u) => s.array(440, 70 + u * 40, vals, { cell: 40, height: 34, indices: false, tones: Object.fromEntries(vals.map((_, i) => [i, 'blue'])), label: `${u}:`, labelSize: 22, size: 22 }));
  s.text(490, g.bottom + 30, '8 entries total', { size: 20, tone: 'soft' });
  s.save(__dirname, 'intro-representations');
}

// 3. The Matrix DFS worked grid.
{
  const s = new Sketch({ width: 420, height: 260, title: 'The 4 by 4 worked grid, 0 open and 1 wall', desc: 'Rows: 0 0 0 1 / 1 0 0 0 / 1 0 1 0 / 0 1 0 0', seed: 4 });
  s.grid(100, 50, G.map(r => r.map(String)), { cw: 56, ch: 48, tones: WALLS, rowLabels: RL, colLabels: CL });
  s.save(__dirname, 'grid');
}

// 4. Flood-fill discovery order from (0, 0).
{
  const s = new Sketch({ width: 420, height: 260, title: 'Order flood fill discovers cells from (0, 0)', desc: 'Discovery order 1 to 10; (3,0) is open but never reached.', seed: 5 });
  const ord = [['1', '2', '6', ''], ['', '3', '5', '7'], ['', '4', '', '8'], ['', '', '10', '9']];
  const tones = { ...WALLS };
  ord.forEach((row, r) => row.forEach((v, c) => { if (v) tones[`${r},${c}`] = 'green'; }));
  tones['0,0'] = 'blue';
  s.grid(100, 50, ord, { cw: 56, ch: 48, tones, rowLabels: RL, colLabels: CL, size: 24 });
  s.save(__dirname, 'dfs-order');
}

// 5. The two simple paths path counting finds.
{
  const s = new Sketch({ width: 640, height: 280, title: 'The two simple paths from (0,0) to (3,3)', desc: 'Path A goes down through (1,1); path B goes right through (0,2). Both share (1,2), (1,3), (2,3).', seed: 6 });
  const paths = [
    ['path A', 'blue', 60, [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3]]],
    ['path B', 'amber', 380, [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 3]]],
  ];
  for (const [name, t, x, cells] of paths) {
    const tones = { ...WALLS };
    cells.forEach(([r, c]) => { tones[`${r},${c}`] = t; });
    const g = s.grid(x, 60, G.map(r => r.map(() => '')), { cw: 50, ch: 46, tones, rowLabels: RL, colLabels: CL });
    for (let i = 1; i < cells.length; i++) {
      const [r0, c0] = cells[i - 1], [r1, c1] = cells[i];
      const x0 = g.cx(c0), y0 = g.cy(r0), x1 = g.cx(c1), y1 = g.cy(r1);
      const k = 12, dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
      s.arrow(x0 + dx * k, y0 + dy * k, x1 - dx * k, y1 - dy * k, { width: 2, headLen: 9 });
    }
    s.text(x + 100, 262, `${name}: 6 moves`, { size: 22, tone: t, weight: 700 });
  }
  s.save(__dirname, 'dfs-paths');
}

// 6. BFS distances from (0, 0) and the layers.
{
  const s = new Sketch({ width: 660, height: 300, title: 'BFS distance of every cell from (0,0), layer by layer', desc: 'Distances 0 1 2 # / # 2 3 4 / # 3 # 5 / . # 7 6. Target (3,3) popped in layer 6.', seed: 7 });
  const D = [['0', '1', '2', ''], ['', '2', '3', '4'], ['', '3', '', '5'], ['', '', '7', '6']];
  const tones = { ...WALLS, '0,0': 'blue', '3,3': 'green' };
  s.grid(70, 50, D, { cw: 54, ch: 48, tones, rowLabels: RL, colLabels: CL, size: 24 });
  const layers = [
    ['layer 0: (0,0)', 'blue'], ['layer 1: (0,1)'], ['layer 2: (1,1) (0,2)'], ['layer 3: (2,1) (1,2)'],
    ['layer 4: (1,3)'], ['layer 5: (2,3)'], ['layer 6: (3,3)  target, answer 6', 'green'], ['layer 7: (3,2)  only if you keep going', 'soft'],
  ];
  layers.forEach(([t, tone], i) => s.text(340, 42 + i * 30, t, { size: 21, anchor: 'start', tone: tone ?? 'ink', weight: tone === 'green' ? 700 : 500 }));
  s.save(__dirname, 'bfs-layers');
}

// 7. Multi-source BFS from (0,0) and (3,3).
{
  const s = new Sketch({ width: 480, height: 260, title: 'Multi-source BFS: distance to the nearest of (0,0) and (3,3)', desc: 'Distances 0 1 2 # / # 2 3 2 / # 3 # 1 / . # 1 0.', seed: 8 });
  const D = [['0', '1', '2', ''], ['', '2', '3', '2'], ['', '3', '', '1'], ['', '', '1', '0']];
  const tones = { ...WALLS, '0,0': 'blue', '3,3': 'blue', '1,3': 'amber', '2,3': 'amber', '3,2': 'amber' };
  const g = s.grid(70, 50, D, { cw: 54, ch: 48, tones, rowLabels: RL, colLabels: CL, size: 24 });
  s.text(g.right + 14, g.cy(1), 'was 4', { size: 20, anchor: 'start', tone: 'amber' });
  s.text(g.right + 14, g.cy(2), 'was 5', { size: 20, anchor: 'start', tone: 'amber' });
  s.text(g.cx(2), g.bottom + 22, 'was 7', { size: 20, tone: 'amber' });
  s.save(__dirname, 'bfs-multi-source');
}

// Layout shared by the two directed-graph figures.
const DAG = { 0: [70, 145], 1: [200, 75], 2: [200, 215], 3: [330, 145], 4: [460, 145], 5: [590, 145] };

// 8. The build-step DAG with the optional back edge.
{
  const s = new Sketch({ width: 650, height: 265, title: 'Six build steps as a directed graph', desc: 'Edges 0-1, 0-2, 1-3, 2-3, 3-4, 5-4; dashed 4-1 is added only for the cycle run.', seed: 9 });
  const n = {};
  for (const [k, [x, y]] of Object.entries(DAG)) n[k] = s.node(x, y, k);
  [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 4]].forEach(([u, v]) => s.edge(n[u], n[v], { directed: true }));
  s.edge(n[4], n[1], { directed: true, dashed: true, tone: 'red', bend: 50, label: 'added in the cycle run', labelTone: 'red', size: 20 });
  s.save(__dirname, 'dag');
}

// 9. Three-colour DFS trace on the six real edges.
{
  const W = 680, rowH = 36, top = 70;
  const rows = [
    ['enter 0', 0, 'G.....', ''],
    ['enter 1', 1, 'GG....', ''],
    ['enter 3', 2, 'GG.G..', ''],
    ['enter 4', 3, 'GG.GG.', 'adj[4] = []'],
    ['finish 4', 3, 'GG.GB.', 'post = [4]'],
    ['finish 3', 2, 'GG.BB.', 'post = [4, 3]'],
    ['finish 1', 1, 'GB.BB.', 'post = [4, 3, 1]'],
    ['enter 2', 1, 'GBGBB.', '3 is BLACK: skip', 'soft'],
    ['finish 2', 1, 'GBBBB.', 'post = [4, 3, 1, 2]'],
    ['finish 0', 0, 'BBBBB.', 'post = [4, 3, 1, 2, 0]'],
    ['enter 5', 0, 'BBBBBG', 'outer loop; 4 is BLACK: skip', 'soft'],
    ['finish 5', 0, 'BBBBBB', 'post = [4, 3, 1, 2, 0, 5]'],
  ];
  const H = top + rows.length * rowH + 60;
  const s = new Sketch({ width: W, height: H, title: 'Three-colour DFS trace on the build-step graph', desc: 'Each row shows the colour of vertices 0 to 5 after the event, and the postorder list. Reversed postorder is 5 0 2 1 3 4.', seed: 10 });
  const nx = i => 200 + i * 40;
  s.text(20, 30, 'event', { size: 20, anchor: 'start', tone: 'soft' });
  s.text(nx(0) + 100, 30, 'colour of 0 … 5', { size: 20, tone: 'soft' });
  s.text(448, 30, 'postorder', { size: 20, anchor: 'start', tone: 'soft' });
  rows.forEach(([ev, depth, cols, note, noteTone], i) => {
    const y = top + i * rowH;
    s.text(20 + depth * 16, y, ev, { size: 21, anchor: 'start', weight: ev.startsWith('enter') ? 500 : 700 });
    [...cols].forEach((c, v) => s.node(nx(v), y, v, { r: 14, size: 17, tone: c === 'G' ? 'amber' : c === 'B' ? 'green' : undefined }));
    s.text(448, y, note, { size: 20, anchor: 'start', tone: noteTone ?? 'ink' });
  });
  const yEnd = top + rows.length * rowH + 14;
  s.line(20, yEnd - 12, W - 20, yEnd - 12, { tone: 'soft', width: 1.2 });
  s.text(W / 2, yEnd + 18, 'reversed: [5, 0, 2, 1, 3, 4], every edge u → v has u before v', { size: 22, weight: 700, tone: 'green' });
  s.save(__dirname, 'dfs-colour-trace');
}

// 10. Cycle detection once 4 -> 1 is added.
{
  const s = new Sketch({ width: 650, height: 265, title: 'Back edge 4 to 1 found while 0, 1, 3, 4 are GRAY', desc: 'The GRAY path is 0 1 3 4; edge 4-1 points at GRAY vertex 1, closing the cycle 1 3 4 1.', seed: 11 });
  const gray = new Set(['0', '1', '3', '4']);
  const n = {};
  for (const [k, [x, y]] of Object.entries(DAG)) n[k] = s.node(x, y, k, { tone: gray.has(k) ? 'amber' : undefined });
  const cyc = new Set(['1-3', '3-4']);
  [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 4]].forEach(([u, v]) => s.edge(n[u], n[v], { directed: true, tone: cyc.has(`${u}-${v}`) ? 'red' : (u === 0 && v === 1 ? 'amber' : 'soft'), width: cyc.has(`${u}-${v}`) ? 2.2 : 1.6 }));
  s.edge(n[4], n[1], { directed: true, tone: 'red', bend: 50, width: 2.2, label: 'back edge: 1 is GRAY', labelTone: 'red', size: 20 });
  s.text(330, 250, 'cycle 1 → 3 → 4 → 1', { size: 22, tone: 'red', weight: 700 });
  s.save(__dirname, 'dfs-cycle');
}

// 11. Union-Find parent array after each union.
{
  const steps = [
    ['start', [0, 1, 2, 3, 4, 5], [], '6 components'],
    ['union(0,1) True', [0, 0, 2, 3, 4, 5], [1], 'size[0]=2, 5 comps'],
    ['union(2,3) True', [0, 0, 2, 2, 4, 5], [3], 'size[2]=2, 4 comps'],
    ['union(1,2) True', [0, 0, 0, 2, 4, 5], [2], 'size[0]=4, 3 comps'],
    ['union(4,5) True', [0, 0, 0, 2, 4, 4], [5], 'size[4]=2, 2 comps'],
    ['union(0,3) False', [0, 0, 0, 0, 4, 4], [3], 'no merge, 2 comps'],
  ];
  const s = new Sketch({ width: 680, height: 350, title: 'Union-Find parent array after each union', desc: 'parent goes from 0..5 to [0,0,0,0,4,4]; the last union returns False and only compresses parent[3].', seed: 12 });
  const tones = {};
  steps.forEach(([, , ch], r) => ch.forEach(c => { tones[`${r},${c}`] = r === 5 ? 'cyan' : 'amber'; }));
  const g = s.grid(170, 50, steps.map(st => st[1].map(String)), { cw: 42, ch: 42, tones, rowLabels: steps.map(st => st[0]), colLabels: ['0', '1', '2', '3', '4', '5'] });
  steps.forEach(([, , , note], r) => s.text(g.right + 14, g.cy(r), note, { size: 19, anchor: 'start', tone: r === 5 ? 'cyan' : 'ink' }));
  s.text(340, g.bottom + 24, 'union(1,2): sizes tie at 2, so root 2 goes under root 0', { size: 20, tone: 'soft' });
  s.text(340, g.bottom + 50, 'union(0,3): find(3) climbs 3 → 2 → 0, then sets parent[3] = 0', { size: 20, tone: 'cyan' });
  s.save(__dirname, 'dsu-states');
}

// 12. The forest before and after the compressing find.
{
  const s = new Sketch({ width: 620, height: 270, title: 'Union-Find forest before and after find(3) compresses the path', desc: 'Before: 3 under 2 under 0, 1 under 0, 5 under 4. After: 1, 2, 3 all directly under 0.', seed: 13 });
  const up = (a, b, o = {}) => s.edge(a, b, { directed: true, ...o });
  s.text(150, 22, 'before union(0,3)', { size: 22, weight: 700 });
  const a0 = s.node(100, 70, 0, { tone: 'blue' }), a1 = s.node(50, 150, 1), a2 = s.node(150, 150, 2), a3 = s.node(150, 230, 3, { tone: 'amber' });
  const a4 = s.node(250, 70, 4, { tone: 'blue' }), a5 = s.node(250, 150, 5);
  up(a1, a0); up(a2, a0); up(a3, a2, { tone: 'amber' }); up(a5, a4);
  s.line(310, 20, 310, 250, { tone: 'soft', dashed: true, width: 1.2 });
  s.text(460, 22, 'after', { size: 22, weight: 700 });
  const b0 = s.node(440, 70, 0, { tone: 'blue' }), b1 = s.node(370, 160, 1), b2 = s.node(440, 160, 2), b3 = s.node(510, 160, 3, { tone: 'amber' });
  const b4 = s.node(580, 70, 4, { tone: 'blue' }), b5 = s.node(580, 160, 5);
  up(b1, b0); up(b2, b0); up(b3, b0, { tone: 'amber' }); up(b5, b4);
  s.text(460, 230, 'arrows point to parent', { size: 20, tone: 'soft' });
  s.save(__dirname, 'dsu-forest');
}
