// Figures for Part 13, In-Memory File System (LLD series).
//   node _templates/sketches/lld-file-system/figures.js
const { Sketch } = require('../sketch');

function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// The tree after step 9 of the trace, shared by figures 1 and 2.
function tree(s, labels = {}) {
  const L = (k, d) => labels[k] ?? d;
  const n = {
    root: s.box(320, 120, L('root', '/'), { tone: 'violet', w: 70, h: 44 }),
    home: s.box(320, 220, L('home', 'home'), { tone: 'violet', w: 110, h: 44 }),
    alice: s.box(210, 320, L('alice', 'alice'), { tone: 'violet', w: 110, h: 44 }),
    bob: s.box(450, 320, L('bob', 'bob'), { tone: 'violet', w: 100, h: 44 }),
    docs: s.box(120, 420, L('docs', 'docs'), { tone: 'violet', w: 110, h: 44 }),
    todo: s.box(310, 420, L('todo', 'todo.md'), { tone: 'green', w: 130, h: 44 }),
    notes: s.box(120, 520, L('notes', 'notes.txt'), { tone: 'green', w: 140, h: 44 }),
  };
  return n;
}
function plainEdges(s, n, skip = []) {
  const pairs = [['root', 'home'], ['home', 'alice'], ['home', 'bob'], ['alice', 'docs'], ['alice', 'todo'], ['docs', 'notes']];
  for (const [a, b] of pairs) {
    if (skip.includes(`${a}-${b}`)) continue;
    s.line(n[a].cx, n[a].bottom + 3, n[b].cx, n[b].top - 3, { tone: 'soft', width: 1.5 });
  }
}

// ── 1. Path resolution, one segment per step ──────────────────────────────
{
  const s = new Sketch({
    width: 660, height: 590, seed: 31,
    title: 'Resolving /home/alice/docs/notes.txt, one child lookup per segment',
    desc: 'The tree: root, home, alice and bob under home, docs and todo.md under alice, notes.txt under docs. Blue arrows walk from root to home, alice, docs and notes.txt, four lookups for four segments.',
  });
  s.text(20, 24, 'resolve("/home/alice/docs/notes.txt"): one lookup per segment', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 60, [['violet', 'directory'], ['green', 'file'], ['blue', 'the walk']]);
  const n = tree(s);
  plainEdges(s, n, ['root-home', 'home-alice', 'alice-docs', 'docs-notes']);
  const walk = [['root', 'home', '1'], ['home', 'alice', '2'], ['alice', 'docs', '3'], ['docs', 'notes', '4']];
  for (const [a, b, num] of walk) {
    s.arrow(n[a].cx, n[a].bottom + 3, n[b].cx, n[b].top - 6, { tone: 'blue', width: 2.3, label: num, labelTone: 'blue', size: 21, labelOffset: 16 });
  }
  const lx = 410, ly = 420;
  ['1  root.child("home")', '2  home.child("alice")', '3  alice.child("docs")', '4  docs.child("notes.txt")'].forEach((t, i) =>
    s.text(lx, ly + i * 28, t, { size: 19, anchor: 'start', tone: 'blue' }));
  s.text(lx, ly + 4 * 28 + 6, 'one lookup per level, never a scan', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'path-walk');
}

// ── 2. Size, computed recursively ─────────────────────────────────────────
{
  const s = new Sketch({
    width: 660, height: 590, seed: 32,
    title: 'size() computed recursively: files report bytes, directories add up their children',
    desc: 'notes.txt is 21 bytes, so docs is 21. todo.md is 14, so alice is 21 plus 14, 35. bob is empty, 0. home is 35 plus 0, and root is 35.',
  });
  s.text(20, 24, 'size(): files know their bytes, directories ask their children', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 60, [['violet', 'directory'], ['green', 'file']]);
  const n = tree(s, {
    root: '/  35', home: 'home  35', alice: 'alice  35', bob: 'bob  0', docs: 'docs  21', todo: 'todo.md  14', notes: 'notes.txt  21',
  });
  plainEdges(s, n);
  s.text(n.alice.right + 14, n.alice.cy - 4, '= 21 + 14', { size: 19, anchor: 'start', tone: 'amber', weight: 700 });
  s.text(n.home.right + 14, n.home.cy - 4, '= 35 + 0', { size: 19, anchor: 'start', tone: 'amber', weight: 700 });
  s.text(410, 470, 'size(/) visits every node:', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(410, 498, 'O(subtree), recomputed', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(410, 526, 'on every call', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'sizes');
}

// ── 3. mv into its own subtree ────────────────────────────────────────────
{
  const s = new Sketch({
    width: 640, height: 500, seed: 33,
    title: 'mv /home/bob /home/bob/docs/archive is rejected',
    desc: 'After step 10 the tree is root, home, alice and bob under home, docs under bob, notes.txt under docs. The target directory for the move is docs. Walking up from docs reaches bob, the directory being moved, so the move would put bob inside itself and is rejected.',
  });
  s.text(20, 24, 'mv /home/bob /home/bob/docs/archive', { size: 22, anchor: 'start', weight: 700 });
  s.text(20, 56, 'walk up from the target directory; meeting the source means a cycle', { size: 19, anchor: 'start', tone: 'soft' });
  const root = s.box(300, 110, '/', { tone: 'violet', w: 70, h: 44 });
  const home = s.box(300, 200, 'home', { tone: 'violet', w: 110, h: 44 });
  const alice = s.box(170, 290, 'alice', { tone: 'violet', w: 110, h: 44 });
  const bob = s.box(430, 290, 'bob', { tone: 'red', w: 110, h: 44 });
  const docs = s.box(430, 380, 'docs', { tone: 'amber', w: 110, h: 44 });
  const notes = s.box(430, 465, 'notes.txt', { tone: 'green', w: 140, h: 40 });
  for (const [a, b] of [[root, home], [home, alice], [home, bob], [bob, docs], [docs, notes]]) {
    s.line(a.cx, a.bottom + 3, b.cx, b.top - 3, { tone: 'soft', width: 1.5 });
  }
  s.text(bob.right + 12, bob.cy - 14, 'source', { size: 19, anchor: 'start', tone: 'red', weight: 700 });
  s.text(docs.right + 12, docs.cy - 14, 'target dir', { size: 19, anchor: 'start', tone: 'amber', weight: 700 });
  s.arrow(docs.left - 14, docs.cy, bob.left - 14, bob.cy + 6, { tone: 'red', width: 2.2, bend: -40 });
  s.text(bob.left - 76, 334, "docs's parent is bob,", { size: 19, anchor: 'end', tone: 'red', weight: 600 });
  s.text(bob.left - 76, 360, 'the source: reject', { size: 19, anchor: 'end', tone: 'red', weight: 600 });
  s.text(30, 400, 'if allowed, bob would hang', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(30, 426, 'under its own child: the', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(30, 452, 'subtree loses its way to /', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'mv-cycle');
}
