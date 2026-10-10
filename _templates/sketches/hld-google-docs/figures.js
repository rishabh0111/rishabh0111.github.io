// Figures for HLD Part 17, Design Google Docs.
//   node _templates/sketches/hld-google-docs/figures.js
const { Sketch } = require('../sketch');

function key(s, x, y, items, size = 19) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, size) + 24;
  }
}

// ── 1. Two concurrent edits on "abc", applied as sent vs transformed ────────
{
  const W = 680, cell = 40, LX = 40, RX = 370;
  const s = new Sketch({
    width: W, height: 640, seed: 17,
    title: 'Operational transformation: two concurrent edits to "abc" applied as sent, then transformed',
    desc: 'Both editors start with abc. Alice inserts X at position 1 and sees aXbc. Bob deletes position 2, the c, and sees ab. Applying each other\'s operation as sent: Alice deletes position 2 of aXbc, which is b, giving aXc; Bob inserts X at 1 of ab, giving aXb; the documents diverge. Transformed: Bob\'s delete at 2 becomes delete at 3 on Alice\'s side because her insert at 1 shifted it, giving aXb; Alice\'s insert at 1 is before 2 and stays at 1 on Bob\'s side, giving aXb; they converge.',
  });
  const row = (x, y, chars, tones = {}, dim = []) => s.array(x, y, chars, { cell, tones, dim, size: 22, indices: true });
  key(s, 20, 16, [['green', 'inserted'], ['red', 'deleted'], ['blue', 'Alice'], ['violet', 'Bob']]);
  s.text(W / 2, 54, 'both start with "abc"', { size: 20, weight: 700 });
  row(W / 2 - 60, 70, ['a', 'b', 'c']);
  // local edits
  s.text(LX, 150, 'Alice: insert X at 1', { size: 20, anchor: 'start', tone: 'blue', weight: 700 });
  s.text(RX, 150, 'Bob: delete at 2', { size: 20, anchor: 'start', tone: 'violet', weight: 700 });
  row(LX, 170, ['a', 'X', 'b', 'c'], { 1: 'green' });
  row(RX, 170, ['a', 'b', 'c'], { 2: 'red' });
  s.text(RX + 3 * cell + 14, 190, 'leaves "ab"', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(LX + 4 * cell + 14, 190, 'sees "aXbc"', { size: 19, anchor: 'start', tone: 'soft' });

  // without transform
  s.line(20, 250, W - 20, 250, { tone: 'soft', width: 1.2 });
  s.text(20, 274, "without transform: apply the other's op as sent", { size: 20, anchor: 'start', weight: 700, tone: 'red' });
  s.text(LX, 308, 'gets Bob\'s "delete at 2"', { size: 19, anchor: 'start', tone: 'violet' });
  s.text(RX, 308, 'gets Alice\'s "insert X at 1"', { size: 19, anchor: 'start', tone: 'blue' });
  row(LX, 328, ['a', 'X', 'b', 'c'], { 2: 'red' });
  s.text(LX + 4 * cell + 14, 348, 'deleted b!', { size: 19, anchor: 'start', tone: 'red', weight: 700 });
  row(RX, 328, ['a', 'X', 'b'], { 1: 'green' });
  s.text(W / 2, 410, '"aXc" ≠ "aXb": diverged forever', { size: 21, weight: 700, tone: 'red' });

  // with transform
  s.line(20, 440, W - 20, 440, { tone: 'soft', width: 1.2 });
  s.text(20, 464, 'with transform: shift past what you already applied', { size: 20, anchor: 'start', weight: 700, tone: 'green' });
  s.text(LX, 498, 'delete at 2 → at 3', { size: 19, anchor: 'start', tone: 'violet' });
  s.text(LX, 522, '(my X at 1 pushed c right)', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(RX, 498, 'insert at 1 stays at 1', { size: 19, anchor: 'start', tone: 'blue' });
  s.text(RX, 522, '(1 is before the delete at 2)', { size: 18, anchor: 'start', tone: 'soft' });
  row(LX, 544, ['a', 'X', 'b', 'c'], { 3: 'red' });
  row(RX, 544, ['a', 'X', 'b'], { 1: 'green' });
  s.text(W / 2, 624, 'both "aXb": converged', { size: 21, weight: 700, tone: 'green' });
  s.save(__dirname, 'ot-transform');
}

// ── 2. The same edits with a CRDT: characters have ids, not positions ───────
{
  const W = 660, cell = 56, X0 = 150;
  const s = new Sketch({
    width: W, height: 470, seed: 27,
    title: 'A sequence CRDT: the same two edits addressed by character id instead of position',
    desc: 'Each character carries a unique id: a is 1, b is 2, c is 3. Alice\'s insert says insert X with id A1 after id 1. Bob\'s delete says delete id 3. Each replica applies the two operations in either order and gets a, X, b, with c kept as a hidden tombstone. Nothing needs transforming because ids never shift; the cost is an id on every character and tombstones that stay.',
  });
  s.text(20, 22, 'same edits, addressed by id, not by position', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 56, [['green', 'inserted'], ['soft', 'tombstone (hidden)']]);
  const ids = (x, y, chars, idList, tones = {}, dim = []) => {
    const a = s.array(x, y, chars, { cell, height: 44, tones, dim, size: 22, indices: false });
    idList.forEach((id, i) => s.text(a.cx(i), y + 62, id, { size: 18, tone: 'soft' }));
    return a;
  };
  s.text(X0 - 16, 122, 'start', { size: 19, anchor: 'end', weight: 600 });
  ids(X0, 100, ['a', 'b', 'c'], ['id 1', 'id 2', 'id 3']);
  s.text(X0 + 3 * cell + 20, 122, 'ids never change', { size: 19, anchor: 'start', tone: 'soft' });

  s.text(20, 206, 'Alice sends:', { size: 19, anchor: 'start', tone: 'blue', weight: 700 });
  s.text(150, 206, 'insert "X" with id A1 after id 1', { size: 19, anchor: 'start' });
  s.text(20, 240, 'Bob sends:', { size: 19, anchor: 'start', tone: 'violet', weight: 700 });
  s.text(150, 240, 'delete id 3', { size: 19, anchor: 'start' });
  s.text(20, 274, 'every replica, in either order:', { size: 19, anchor: 'start', tone: 'soft' });

  s.text(X0 - 16, 322, 'result', { size: 19, anchor: 'end', weight: 600 });
  const r = ids(X0, 300, ['a', 'X', 'b', 'c'], ['id 1', 'id A1', 'id 2', 'id 3'], { 1: 'green' }, [3]);
  s.line(r.left(3) + 10, 322, r.right(3) - 10, 322, { tone: 'soft', width: 2 });
  s.text(X0 + 4 * cell + 20, 312, 'shows "aXb"', { size: 20, anchor: 'start', weight: 700, tone: 'green' });
  s.text(X0 + 4 * cell + 20, 338, 'c kept, hidden', { size: 18, anchor: 'start', tone: 'soft' });

  s.text(20, 410, 'nothing to transform: an id means the same thing everywhere', { size: 19, anchor: 'start', tone: 'green' });
  s.text(20, 442, 'the price: an id on every character, and tombstones that stay', { size: 19, anchor: 'start', tone: 'amber' });
  s.save(__dirname, 'crdt-ids');
}

// ── 3. One doc, one server: consistent hashing of doc ids ──────────────────
{
  const W = 640, H = 470, cx = 230, cy = 250, R = 160;
  const s = new Sketch({
    width: W, height: H, seed: 37,
    title: 'Consistent hashing: each document is owned by the next session server clockwise on the ring',
    desc: 'A ring with four session servers S1 to S4 and documents hashed onto it. doc_42 lands just before S2, so S2 owns it and every editor of doc_42 is routed to S2. If S3 fails, only the documents between S2 and S3 move, to S4; every other document stays where it is.',
  });
  s.text(20, 22, 'doc id → hash → next server clockwise', { size: 21, anchor: 'start', weight: 700 });
  s.circle(cx, cy, R * 2, { tone: 'soft', width: 1.6 });
  const at = deg => [cx + R * Math.cos(deg * Math.PI / 180), cy + R * Math.sin(deg * Math.PI / 180)];
  const servers = [['S1', -60], ['S2', 30], ['S3', 130], ['S4', 215]];
  const docs = [['doc_42', 5], ['doc_7', 70], ['doc_19', 105], ['doc_88', 170], ['doc_3', 260]];
  const tone = { S1: 'blue', S2: 'green', S3: 'red', S4: 'violet' };
  const owner = d => { const sv = servers.map(([n, a]) => [n, ((a - d) % 360 + 360) % 360]).sort((p, q) => p[1] - q[1]); return sv[0][0]; };
  servers.forEach(([n, a]) => {
    const [x, y] = at(a);
    s.node(x, y, n, { r: 24, tone: tone[n], size: 20 });
  });
  docs.forEach(([n, a]) => {
    const [x, y] = at(a);
    const o = owner(a);
    s.circle(x, y, 14, { tone: tone[o], width: 3.2 });
    const [lx, ly] = [cx + (R - 44) * Math.cos(a * Math.PI / 180), cy + (R - 44) * Math.sin(a * Math.PI / 180)];
    s.text(lx, ly, n, { size: 18, tone: tone[o], weight: 600 });
  });
  // clockwise hint, outside the ring at the top
  const ring2 = (deg, r) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
  const [ax, ay] = ring2(-125, R + 26), [bx, by] = ring2(-95, R + 26);
  s.arrow(ax, ay, bx, by, { bend: 10, tone: 'soft', width: 1.5 });
  s.text(ax - 8, ay + 4, 'clockwise', { size: 18, tone: 'soft', anchor: 'end' });
  // the story on the right
  const tx = 430;
  s.text(tx, 140, 'doc_42 → S2', { size: 20, anchor: 'start', weight: 700, tone: 'green' });
  s.text(tx, 166, 'every editor of', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(tx, 188, 'doc_42 connects to S2', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(tx, 250, 'S3 dies:', { size: 20, anchor: 'start', weight: 700, tone: 'red' });
  s.text(tx, 276, 'doc_7 and doc_19 move', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(tx, 298, 'to S4; nothing else', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(tx, 320, 'moves', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(tx, 382, 'dot colour = owner', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'doc-ring');
}

// ── 4. Op log and snapshots: what a load reads ─────────────────────────────
{
  const W = 660, X0 = 50, X1 = 610, MAX = 4500;
  const X = r => X0 + (X1 - X0) * r / MAX;
  const s = new Sketch({
    width: W, height: 400, seed: 47,
    title: 'Op log with a snapshot every 1,000 revisions: loading revision 4,317 reads one snapshot and 317 ops',
    desc: 'A revision axis from 0 to 4,500. Snapshots sit at revisions 0, 1,000, 2,000, 3,000 and 4,000. The document is at revision 4,317. Loading it from the log alone replays all 4,317 ops; with snapshots it reads the snapshot at 4,000 and replays the 317 ops after it. Ops older than the oldest snapshot kept for history can move to cold storage.',
  });
  s.text(20, 22, 'load = latest snapshot + the ops after it', { size: 21, anchor: 'start', weight: 700 });
  const y = 150;
  // the log as a long bar of ops
  s.rect(X(0), y - 16, X(4317) - X(0), 32, { tone: 'cyan', fill: 'hachure', width: 1.4, hachureGap: 9 });
  s.text(X(0), y - 34, 'op log', { size: 18, tone: 'cyan', anchor: 'start', weight: 600 });
  [0, 1000, 2000, 3000, 4000].forEach(r => {
    s.rect(X(r) - 14, y - 46 + 76, 28, 28, { tone: 'violet', fill: 'hachure', width: 1.6 });
    s.text(X(r), y + 78, r.toLocaleString('en-US'), { size: 17, tone: 'soft' });
  });
  s.text(X(500), y + 46, 'snapshots', { size: 18, tone: 'violet', weight: 600 });
  s.pointer(X(4317), y - 18, 'rev 4,317', { dir: 'down', tone: 'ink', len: 30 });
  // what a load reads
  s.rect(X(4000), y - 20, X(4317) - X(4000), 40, { tone: 'green', width: 2.4 });
  s.span(X(4000), X(4317), y + 104, undefined, { tone: 'green', depth: 8 });
  s.text(X(4150) - 20, y + 142, 'read: snapshot 4,000', { size: 19, tone: 'green', weight: 700, anchor: 'middle' });
  s.text(X(4150) - 20, y + 166, '+ 317 ops', { size: 19, tone: 'green', weight: 700 });
  s.span(X(0), X(4317), y + 196, undefined, { tone: 'red', depth: 8 });
  s.text(X(2150), y + 196 + 38, 'without snapshots: replay all 4,317 ops', { size: 19, tone: 'red', weight: 700 });
  s.save(__dirname, 'oplog-snapshots');
}
