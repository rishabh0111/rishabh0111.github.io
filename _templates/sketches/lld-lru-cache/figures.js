// Figures for Part 11, LRU Cache (LLD series).
//   node _templates/sketches/lld-lru-cache/figures.js
const { Sketch } = require('../sketch');

function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. The two maps and the list, state at t=60 ───────────────────────────
{
  const s = new Sketch({
    width: 660, height: 480, seed: 11,
    title: 'LRU cache state at t=60: values in one map, recency in the policy\'s list',
    desc: 'LocalCache.entries maps a, d, e to value and deadline. LruPolicy.nodes maps the same keys to list nodes. The list runs head, e, d, a, tail: e is most recent, a is the next victim.',
  });
  s.text(20, 24, 't=60, capacity 3: one map finds values, the list orders keys', { size: 21, anchor: 'start', weight: 700 });

  // entries map (left)
  s.text(40, 66, 'LocalCache.entries', { size: 20, anchor: 'start', weight: 700, tone: 'cyan' });
  s.text(40, 90, 'key → value, deadline', { size: 18, anchor: 'start', tone: 'soft' });
  s.grid(40, 132, [['a', '1', 'never'], ['d', '4', 'never'], ['e', '5', '80 ms']], {
    cw: 78, ch: 42, size: 20, tones: { '0,0': 'cyan', '1,0': 'cyan', '2,0': 'cyan' }, colLabels: ['key', 'value', 'expires'],
  });

  // nodes map (right)
  s.text(400, 66, 'LruPolicy.nodes', { size: 20, anchor: 'start', weight: 700, tone: 'violet' });
  s.text(400, 90, 'key → list node (no order)', { size: 18, anchor: 'start', tone: 'soft' });
  const nx = 410, ny = 132, nw = 52, nh = 42;
  const mapKeys = ['e', 'd', 'a'];
  mapKeys.forEach((k, i) => s.rect(nx + i * (nw + 20), ny, nw, nh, { tone: 'violet', fill: 'hachure', label: k, size: 22 }));

  // the list (bottom)
  const ly = 330, bw = 74, bh = 48;
  const names = ['head', 'e', 'd', 'a', 'tail'];
  const xs = [30, 160, 290, 420, 550];
  const tones = ['soft', 'green', 'ink', 'red', 'soft'];
  const boxes = names.map((n, i) => s.rect(xs[i], ly, bw, bh, {
    tone: tones[i], fill: i === 0 || i === 4 ? undefined : (tones[i] === 'ink' ? undefined : 'hachure'), dashed: i === 0 || i === 4, label: n, size: 22,
  }));
  for (let i = 0; i < 4; i++) {
    s.arrow(boxes[i].right + 6, ly + 16, boxes[i + 1].left - 6, ly + 16, { tone: 'ink', headLen: 9 });
    s.arrow(boxes[i + 1].left - 6, ly + 34, boxes[i].right + 6, ly + 34, { tone: 'soft', headLen: 9 });
  }
  s.text(boxes[0].cx, ly + bh + 22, 'sentinel', { size: 18, tone: 'soft' });
  s.text(boxes[4].cx, ly + bh + 22, 'sentinel', { size: 18, tone: 'soft' });
  s.text(boxes[1].cx, ly + bh + 22, 'most recent', { size: 19, tone: 'green', weight: 700 });
  s.text(boxes[3].cx, ly + bh + 22, 'next victim', { size: 19, tone: 'red', weight: 700 });
  s.text(330, ly + bh + 56, 'upper arrows are next, lower arrows are prev', { size: 19, tone: 'soft' });
  s.text(330, ly + bh + 84, 'get(a) would unlink a and relink it just after head', { size: 19, tone: 'soft' });

  // map cells point at their nodes
  const target = { a: 3, d: 2, e: 1 };
  mapKeys.forEach((k, i) => {
    const fromX = nx + i * (nw + 20) + nw / 2;
    const b = boxes[target[k]];
    s.arrow(fromX, ny + nh + 6, b.cx + 10, ly - 8, { tone: 'violet', dashed: true, headLen: 10 });
  });
  s.save(__dirname, 'map-and-list');
}

// ── 2. Three ways an expired entry leaves ─────────────────────────────────
{
  const X = t => 110 + t * 2.6;
  const rows = [
    { k: 'e', put: 30, dead: 80, gone: 90, how: 'put f found the cache full' },
    { k: 'g', put: 100, dead: 110, gone: 115, how: 'get g found it dead' },
    { k: 'h', put: 120, dead: 150, gone: 200, how: 'sweep() at 200' },
  ];
  const top = 120, pitch = 92;
  const s = new Sketch({
    width: 680, height: top + rows.length * pitch + 70, seed: 12,
    title: 'Three ways an expired entry leaves the cache',
    desc: 'Timeline 0 to 200 ms. e lives 30 to 80 and is purged at 90 when a put finds the cache full. g lives 100 to 110 and is removed at 115 by the get that finds it dead. h lives 120 to 150 and is removed by the periodic sweep at 200.',
  });
  s.text(20, 24, 'TTL: alive until the deadline, removed when something looks', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 62, [['green', 'alive'], ['amber', 'dead, still stored']]);
  s.line(311, 53, 329, 71, { tone: 'red', width: 2.4 });
  s.line(311, 71, 329, 53, { tone: 'red', width: 2.4 });
  s.text(340, 62, 'removed', { size: 19, anchor: 'start', tone: 'soft' });
  rows.forEach((r, i) => {
    const y = top + i * pitch;
    s.text(70, y + 14, r.k, { size: 24, weight: 700, anchor: 'end' });
    s.rect(X(r.put), y, X(r.dead) - X(r.put), 28, { tone: 'green', fill: 'hachure' });
    s.rect(X(r.dead), y, Math.max(6, X(r.gone) - X(r.dead)), 28, { tone: 'amber', fill: 'hachure', dashed: true });
    const gx = X(r.gone);
    s.line(gx - 9, y + 5, gx + 9, y + 23, { tone: 'red', width: 2.4 });
    s.line(gx - 9, y + 23, gx + 9, y + 5, { tone: 'red', width: 2.4 });
    const lx = Math.min(gx + 16, 660);
    const anchor = gx > 520 ? 'end' : 'start';
    s.text(anchor === 'end' ? gx - 4 : lx, y + 52, r.how, { size: 19, tone: 'red', anchor, weight: 600 });
  });
  const ay = top + rows.length * pitch + 6;
  s.line(X(0), ay, X(200), ay, { tone: 'soft' });
  [0, 50, 100, 150, 200].forEach(t => {
    s.line(X(t), ay - 6, X(t), ay + 6, { tone: 'soft' });
    s.text(X(t), ay + 24, `${t}`, { size: 18, tone: 'soft' });
  });
  s.text(X(200) + 14, ay + 24, 'ms', { size: 18, tone: 'soft', anchor: 'start' });
  s.save(__dirname, 'ttl-three-paths');
}

// ── 3. Striped locking ─────────────────────────────────────────────────────
{
  const s = new Sketch({
    width: 640, height: 400, seed: 13,
    title: 'Striped cache: four stripes, each with its own lock and list',
    desc: 'Threads T1 to T4 hash their keys to a stripe. T2 and T3 land on stripe 1, so T3 waits for T2. T1 and T4 use stripes 0 and 3 and wait for nobody. Stripe 2 is idle.',
  });
  s.text(20, 24, 'stripe = hash(key) mod 4; only a shared stripe means waiting', { size: 21, anchor: 'start', weight: 700 });
  const sx = [90, 240, 390, 540];
  const threads = [
    { n: 'T1', x: 90, to: 0, tone: 'blue' },
    { n: 'T2', x: 200, to: 1, tone: 'blue' },
    { n: 'T3', x: 290, to: 1, tone: 'amber' },
    { n: 'T4', x: 540, to: 3, tone: 'blue' },
  ];
  const ty = 90, by = 250;
  const nodes = threads.map(t => s.node(t.x, ty, t.n, { tone: t.tone, r: 24, size: 20 }));
  const stripes = sx.map((x, i) => {
    const b = s.box(x, by, `stripe ${i}\nlock + list`, { w: 120, h: 70, tone: i === 1 ? 'amber' : 'cyan', size: 20 });
    return b;
  });
  threads.forEach((t, i) => {
    const b = stripes[t.to];
    const toX = b.cx + (i === 1 ? -24 : i === 2 ? 24 : 0);
    s.arrow(nodes[i].cx, nodes[i].cy + 28, toX, b.top - 8, { tone: t.tone, dashed: i === 2, headLen: 10 });
  });
  s.text(stripes[1].cx, by + 60, 'T3 waits for T2', { size: 19, tone: 'amber', weight: 700 });
  s.text(320, 350, 'each stripe holds 1/4 of the capacity and evicts by its own LRU order', { size: 19, tone: 'soft' });
  s.save(__dirname, 'striped-locks');
}
