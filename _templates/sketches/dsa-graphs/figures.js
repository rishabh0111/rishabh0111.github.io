// Figures for Part 14, Graphs.  node _templates/sketches/dsa-graphs/figures.js
const { Sketch } = require('../sketch');

// The worked grid shared by Matrix DFS and Matrix BFS (1 = wall).
const G = [[0, 0, 0, 1], [1, 0, 0, 0], [1, 0, 1, 0], [0, 1, 0, 0]];
const WALLS = {};
G.forEach((row, r) => row.forEach((v, c) => { if (v === 1) WALLS[`${r},${c}`] = 'soft'; }));
const RL = ['r0', 'r1', 'r2', 'r3'], CL = ['c0', 'c1', 'c2', 'c3'];

// A figure's one-line heading.
const heading = (s, x, y, str, o = {}) => s.text(x, y, str, { size: 22, weight: 700, anchor: o.anchor ?? 'middle', tone: o.tone ?? 'ink' });
// One legend entry: a small swatch (tone, or plain when tone is 'ink') and a word. Returns the x after it.
const key = (s, x, y, t, label, o = {}) => {
  s.rect(x, y - 9, 18, 18, { tone: t, fill: t === 'ink' ? undefined : 'hachure', width: 1.4, hachureGap: 4 });
  const size = o.size ?? 19;
  s.text(x + 26, y, label, { size, anchor: 'start', tone: o.textTone ?? (t === 'ink' ? 'soft' : t) });
  return x + 26 + s.textWidth(label, size) * 0.85 + 22;
};
// The same, with a node instead of a square.
const nodeKey = (s, x, y, t, label, o = {}) => {
  s.node(x + 10, y, '', { r: 10, tone: t === 'ink' ? undefined : t });
  const size = o.size ?? 19;
  s.text(x + 28, y, label, { size, anchor: 'start', tone: o.textTone ?? (t === 'ink' ? 'soft' : t) });
  return x + 28 + s.textWidth(label, size) * 0.85 + 24;
};

// 1. The example undirected graph: two components.
{
  const s = new Sketch({ width: 480, height: 262, title: 'Undirected graph, 5 vertices, 4 edges, two components', desc: 'Edges 0-1, 0-2, 1-2 form a triangle, component {0, 1, 2}; edge 3-4 is a separate component {3, 4}.', seed: 2 });
  heading(s, 240, 20, 'undirected: 5 vertices, 4 edges');
  const n0 = s.node(110, 82, 0), n1 = s.node(50, 182, 1), n2 = s.node(170, 182, 2);
  const n3 = s.node(310, 132, 3, { tone: 'violet' }), n4 = s.node(420, 132, 4, { tone: 'violet' });
  s.edge(n0, n1); s.edge(n0, n2); s.edge(n1, n2); s.edge(n3, n4);
  s.text(110, 237, 'component {0, 1, 2}', { size: 20, tone: 'soft' });
  s.text(365, 192, 'component {3, 4}', { size: 20, tone: 'violet' });
  s.save(__dirname, 'intro-graph');
}

// 2. Adjacency matrix vs adjacency list for the same graph.
{
  const s = new Sketch({ width: 660, height: 345, title: 'Adjacency matrix and adjacency list of the example graph', desc: 'Matrix: 25 cells, 8 of them 1, one per stored edge direction. List: 0:[1,2] 1:[0,2] 2:[0,1] 3:[4] 4:[3], the same 8 entries.', seed: 3 });
  const M = [[0, 1, 1, 0, 0], [1, 0, 1, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0]];
  const tones = {};
  M.forEach((row, r) => row.forEach((v, c) => { if (v) tones[`${r},${c}`] = 'blue'; }));
  s.text(165, 22, 'adjacency matrix', { size: 24, weight: 700 });
  const g = s.grid(70, 76, M.map(r => r.map(String)), { cw: 42, ch: 40, tones, rowLabels: ['0', '1', '2', '3', '4'], colLabels: ['0', '1', '2', '3', '4'] });
  s.text(g.x - 34, g.cy(2), 'u', { size: 20, tone: 'soft', weight: 700 });
  s.text(g.right + 18, g.y - 14, 'v',{ size: 20, tone: 'soft', weight: 700 });
  s.text(g.x + 105, g.bottom + 26, '25 cells, 8 are 1', { size: 20, tone: 'soft' });
  s.text(g.x + 105, g.bottom + 52, 'blue = an edge u – v', { size: 20, tone: 'blue', weight: 700 });
  s.text(490, 22, 'adjacency list', { size: 24, weight: 700 });
  const L = [[1, 2], [0, 2], [0, 1], [4], [3]];
  L.forEach((vals, u) => s.array(440, 76 + u * 40, vals, { cell: 40, height: 34, indices: false, tones: Object.fromEntries(vals.map((_, i) => [i, 'blue'])), label: `${u}:`, labelSize: 22, size: 22 }));
  s.text(490, g.bottom + 26, '8 entries total', { size: 20, tone: 'soft' });
  s.text(490, g.bottom + 52, 'the same 8 edges', { size: 20, tone: 'blue', weight: 700 });
  s.save(__dirname, 'intro-representations');
}

// 3. The Matrix DFS worked grid.
{
  const s = new Sketch({ width: 420, height: 300, title: 'The 4 by 4 worked grid, 0 open and 1 wall', desc: 'Rows: 0 0 0 1 / 1 0 0 0 / 1 0 1 0 / 0 1 0 0. Wall cells are hatched grey.', seed: 4 });
  heading(s, 210, 20, 'the worked grid');
  const g = s.grid(100, 76, G.map(r => r.map(String)), { cw: 56, ch: 48, tones: WALLS, rowLabels: RL, colLabels: CL });
  const x = key(s, 110, g.bottom + 26, 'ink', '0 = open');
  key(s, x, g.bottom + 26, 'soft', '1 = wall');
  s.save(__dirname, 'grid');
}

// 4. Flood-fill discovery order from (0, 0).
{
  const s = new Sketch({ width: 560, height: 310, title: 'Order flood fill discovers cells from (0, 0)', desc: 'Directions tried down, up, right, left. Discovery order 1 to 10 starting at (0,0); walls are grey; (3,0) is open but never reached.', seed: 5 });
  heading(s, 20, 20, 'flood fill from (0, 0): discovery order', { anchor: 'start' });
  s.text(20, 48, 'directions tried: down, up, right, left', { size: 20, anchor: 'start', tone: 'soft' });
  const ord = [['1', '2', '6', ''], ['', '3', '5', '7'], ['', '4', '', '8'], ['', '', '10', '9']];
  const tones = { ...WALLS };
  ord.forEach((row, r) => row.forEach((v, c) => { if (v) tones[`${r},${c}`] = 'green'; }));
  tones['0,0'] = 'blue';
  const g = s.grid(70, 104, ord, { cw: 56, ch: 48, tones, rowLabels: RL, colLabels: CL, size: 24 });
  const kx = g.right + 36;
  key(s, kx, g.cy(0), 'blue', 'start');
  key(s, kx, g.cy(1), 'green', 'reached');
  key(s, kx, g.cy(2), 'soft', 'wall');
  key(s, kx, g.cy(3), 'ink', 'open, never reached', { textTone: 'ink' });
  s.save(__dirname, 'dfs-order');
}

// 5. The two simple paths path counting finds.
{
  const s = new Sketch({ width: 640, height: 330, title: 'The two simple paths from (0,0) to (3,3)', desc: 'Path A goes down through (1,1); path B goes right through (0,2). Both take 6 moves and share (1,2), (1,3), (2,3). Walls are grey.', seed: 6 });
  heading(s, 320, 20, 'every simple path from (0, 0) to (3, 3)');
  const paths = [
    ['path A', 'blue', 60, [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3]]],
    ['path B', 'amber', 380, [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 3]]],
  ];
  for (const [name, t, x, cells] of paths) {
    const tones = { ...WALLS };
    cells.forEach(([r, c]) => { tones[`${r},${c}`] = t; });
    const g = s.grid(x, 76, G.map(r => r.map(() => '')), { cw: 50, ch: 46, tones, rowLabels: RL, colLabels: CL });
    for (let i = 1; i < cells.length; i++) {
      const [r0, c0] = cells[i - 1], [r1, c1] = cells[i];
      const x0 = g.cx(c0), y0 = g.cy(r0), x1 = g.cx(c1), y1 = g.cy(r1);
      const k = 12, dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
      s.arrow(x0 + dx * k, y0 + dy * k, x1 - dx * k, y1 - dy * k, { width: 2, headLen: 9 });
    }
    s.text(x + 100, 278, `${name}: 6 moves`, { size: 22, tone: t, weight: 700 });
  }
  key(s, 285, 312, 'soft', 'wall');
  s.save(__dirname, 'dfs-paths');
}

// 6. BFS distances from (0, 0) and the layers.
{
  const s = new Sketch({ width: 680, height: 345, title: 'BFS distance of every cell from (0,0), layer by layer', desc: 'Distances 0 1 2 # / # 2 3 4 / # 3 # 5 / . # 7 6, which is also the layer each cell pops in. Target (3,3) popped in layer 6; (3,0) is never reached.', seed: 7 });
  heading(s, 20, 20, 'BFS from (0, 0): distance = the layer a cell pops in', { anchor: 'start' });
  const D = [['0', '1', '2', ''], ['', '2', '3', '4'], ['', '3', '', '5'], ['', '', '7', '6']];
  const tones = { ...WALLS, '0,0': 'blue', '3,3': 'green' };
  const g = s.grid(70, 84, D, { cw: 54, ch: 48, tones, rowLabels: RL, colLabels: CL, size: 24 });
  s.arrow(g.cx(0) + 6, g.bottom + 30, g.cx(0) + 2, g.bottom + 6, { tone: 'soft', headLen: 9 });
  s.text(g.cx(0) + 14, g.bottom + 40, 'never reached', { size: 19, anchor: 'start', tone: 'soft' });
  key(s, g.x + 150, g.bottom + 40, 'soft', 'wall');
  const layers = [
    ['layer 0: (0,0)  source', 'blue'], ['layer 1: (0,1)'], ['layer 2: (1,1) (0,2)'], ['layer 3: (2,1) (1,2)'],
    ['layer 4: (1,3)'], ['layer 5: (2,3)'], ['layer 6: (3,3)  target, answer 6', 'green'], ['layer 7: (3,2)  only if you keep going', 'soft'],
  ];
  layers.forEach(([t, tone], i) => s.text(330, 78 + i * 30, t, { size: 21, anchor: 'start', tone: tone ?? 'ink', weight: tone === 'green' || tone === 'blue' ? 700 : 500 }));
  s.save(__dirname, 'bfs-layers');
}

// 7. Multi-source BFS from (0,0) and (3,3).
{
  const s = new Sketch({ width: 520, height: 370, title: 'Multi-source BFS: distance to the nearest of (0,0) and (3,3)', desc: 'Both sources seeded at distance 0. Distances 0 1 2 # / # 2 3 2 / # 3 # 1 / . # 1 0. Cells (1,3), (2,3), (3,2) were 4, 5, 7 with one source.', seed: 8 });
  heading(s, 20, 20, 'two sources, both seeded at distance 0', { anchor: 'start' });
  s.text(20, 48, 'each number = distance to the nearer source', { size: 20, anchor: 'start', tone: 'soft' });
  const D = [['0', '1', '2', ''], ['', '2', '3', '2'], ['', '3', '', '1'], ['', '', '1', '0']];
  const tones = { ...WALLS, '0,0': 'blue', '3,3': 'blue', '1,3': 'amber', '2,3': 'amber', '3,2': 'amber' };
  const g = s.grid(70, 104, D, { cw: 54, ch: 48, tones, rowLabels: RL, colLabels: CL, size: 24 });
  s.text(g.right + 14, g.cy(1), 'was 4', { size: 20, anchor: 'start', tone: 'amber' });
  s.text(g.right + 14, g.cy(2), 'was 5', { size: 20, anchor: 'start', tone: 'amber' });
  s.text(g.cx(2), g.bottom + 22, 'was 7', { size: 20, tone: 'amber' });
  let x = key(s, 30, g.bottom + 58, 'blue', 'source');
  x = key(s, x, g.bottom + 58, 'amber', 'closer than one source');
  key(s, x, g.bottom + 58, 'soft', 'wall');
  s.save(__dirname, 'bfs-multi-source');
}

// Layout shared by the two directed-graph figures.
const DAG = { 0: [70, 185], 1: [200, 115], 2: [200, 255], 3: [330, 185], 4: [460, 185], 5: [590, 185] };

// 8. The build-step DAG with the optional back edge.
{
  const s = new Sketch({ width: 650, height: 300, title: 'Six build steps as a directed graph', desc: 'An edge u to v means u before v. Edges 0-1, 0-2, 1-3, 2-3, 3-4, 5-4; dashed red 4-1 is added only for the cycle run.', seed: 9 });
  heading(s, 20, 20, 'six build steps: u → v means u before v', { anchor: 'start' });
  const n = {};
  for (const [k, [x, y]] of Object.entries(DAG)) n[k] = s.node(x, y, k);
  [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 4]].forEach(([u, v]) => s.edge(n[u], n[v], { directed: true }));
  s.edge(n[4], n[1], { directed: true, dashed: true, tone: 'red', bend: 50, label: 'added only in the cycle run', labelTone: 'red', size: 20 });
  s.save(__dirname, 'dag');
}

// 9. Three-colour DFS trace on the six real edges.
{
  const W = 680, rowH = 36, top = 130;
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
  const s = new Sketch({ width: W, height: H, title: 'Three-colour DFS trace on the build-step graph', desc: 'Run on the six real edges, without 4 to 1. Each row shows the colour of vertices 0 to 5 after the event (plain WHITE, amber GRAY on the current path, green BLACK finished), and the postorder list. Reversed postorder is 5 0 2 1 3 4.', seed: 10 });
  heading(s, 20, 20, 'three-colour DFS on the six edges (no 4 → 1)', { anchor: 'start' });
  let kx = nodeKey(s, 20, 54, 'ink', 'WHITE: unvisited', { textTone: 'ink' });
  kx = nodeKey(s, kx, 54, 'amber', 'GRAY: on current path');
  nodeKey(s, kx, 54, 'green', 'BLACK: finished');
  const nx = i => 200 + i * 40;
  s.text(20, 92, 'event', { size: 20, anchor: 'start', tone: 'soft' });
  s.text(nx(0) + 100, 92, 'colour of 0 … 5', { size: 20, tone: 'soft' });
  s.text(448, 92, 'postorder', { size: 20, anchor: 'start', tone: 'soft' });
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
  const s = new Sketch({ width: 650, height: 320, title: 'Back edge 4 to 1 found while 0, 1, 3, 4 are GRAY', desc: 'With 4 to 1 added, DFS reaches 4 along the GRAY path 0 1 3 4; edge 4-1 points at GRAY vertex 1, closing the cycle 1 3 4 1.', seed: 11 });
  heading(s, 20, 20, 'with 4 → 1 added, DFS standing at 4', { anchor: 'start' });
  nodeKey(s, 20, 52, 'amber', 'GRAY: on current path');
  const gray = new Set(['0', '1', '3', '4']);
  const n = {};
  for (const [k, [x, y]] of Object.entries(DAG)) n[k] = s.node(x, y, k, { tone: gray.has(k) ? 'amber' : undefined });
  const cyc = new Set(['1-3', '3-4']);
  [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 4]].forEach(([u, v]) => s.edge(n[u], n[v], { directed: true, tone: cyc.has(`${u}-${v}`) ? 'red' : (u === 0 && v === 1 ? 'amber' : 'soft'), width: cyc.has(`${u}-${v}`) ? 2.2 : 1.6 }));
  s.edge(n[4], n[1], { directed: true, tone: 'red', bend: 50, width: 2.2, label: 'back edge: 1 is GRAY', labelTone: 'red', size: 20 });
  s.text(430, 296, 'cycle 1 → 3 → 4 → 1', { size: 22, tone: 'red', weight: 700 });
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
  const s = new Sketch({ width: 680, height: 420, title: 'Union-Find parent array after each union', desc: 'parent goes from 0..5 to [0,0,0,0,4,4]. Amber marks the entry each union set; the last union returns False and path compression rewrites only parent[3] (cyan).', seed: 12 });
  heading(s, 20, 20, 'parent[i] after each union', { anchor: 'start' });
  const tones = {};
  steps.forEach(([, , ch], r) => ch.forEach(c => { tones[`${r},${c}`] = r === 5 ? 'cyan' : 'amber'; }));
  const g = s.grid(170, 84, steps.map(st => st[1].map(String)), { cw: 42, ch: 42, tones, rowLabels: steps.map(st => st[0]), colLabels: ['0', '1', '2', '3', '4', '5'] });
  s.text(g.x - 10, g.y - 14, 'i', { size: 18, anchor: 'end', tone: 'soft' });
  steps.forEach(([, , , note], r) => s.text(g.right + 14, g.cy(r), note, { size: 19, anchor: 'start', tone: r === 5 ? 'cyan' : 'ink' }));
  s.text(340, g.bottom + 24, 'union(1,2): sizes tie at 2, so root 2 goes under root 0', { size: 20, tone: 'soft' });
  s.text(340, g.bottom + 50, 'union(0,3): find(3) climbs 3 → 2 → 0, then sets parent[3] = 0', { size: 20, tone: 'cyan' });
  const kx = key(s, 120, g.bottom + 86, 'amber', 'set by the union');
  key(s, kx, g.bottom + 86, 'cyan', 'rewritten by path compression');
  s.save(__dirname, 'dsu-states');
}

// 12. The forest before and after the compressing find.
{
  const s = new Sketch({ width: 620, height: 320, title: 'Union-Find forest before and after find(3) compresses the path', desc: 'Arrows point to each vertex\'s parent; roots 0 and 4. Before: 3 under 2 under 0, 1 under 0, 5 under 4. After: 1, 2, 3 all directly under 0; 3 is the vertex path compression moved.', seed: 13 });
  const up = (a, b, o = {}) => s.edge(a, b, { directed: true, ...o });
  const root = n => s.text(n.cx, n.cy - 36, 'root', { size: 18, tone: 'blue', weight: 700 });
  s.text(150, 22, 'before union(0,3)', { size: 22, weight: 700 });
  const a0 = s.node(100, 104, 0, { tone: 'blue' }), a1 = s.node(50, 184, 1), a2 = s.node(150, 184, 2), a3 = s.node(150, 264, 3, { tone: 'amber' });
  const a4 = s.node(250, 104, 4, { tone: 'blue' }), a5 = s.node(250, 184, 5);
  up(a1, a0); up(a2, a0); up(a3, a2, { tone: 'amber' }); up(a5, a4);
  root(a0); root(a4);
  s.text(182, 264, 'depth 2', { size: 19, anchor: 'start', tone: 'amber' });
  s.line(310, 20, 310, 300, { tone: 'soft', dashed: true, width: 1.2 });
  s.text(460, 22, 'after', { size: 22, weight: 700 });
  const b0 = s.node(440, 104, 0, { tone: 'blue' }), b1 = s.node(370, 194, 1), b2 = s.node(440, 194, 2), b3 = s.node(510, 194, 3, { tone: 'amber' });
  const b4 = s.node(580, 104, 4, { tone: 'blue' }), b5 = s.node(580, 194, 5);
  up(b1, b0); up(b2, b0); up(b3, b0, { tone: 'amber' }); up(b5, b4);
  root(b0); root(b4);
  s.text(510, 234, 'moved: depth 1', { size: 19, tone: 'amber' });
  s.text(465, 290, 'arrows point to parent', { size: 20, tone: 'soft' });
  s.save(__dirname, 'dsu-forest');
}
