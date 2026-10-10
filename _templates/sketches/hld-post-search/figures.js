// Figures for Part 10, Post Search and Typeahead.
//   node _templates/sketches/hld-post-search/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: tone === 'soft' ? undefined : 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, 19) + 26;
  }
}

// ── 1. Inverted index and a two-pointer intersection ──────────────────────
{
  const s = new Sketch({
    width: 660, height: 520, seed: 11,
    title: 'Four posts filed by word, and the query "world cup" intersecting two posting lists',
    desc: 'Posts 9004 world cup final tonight, 9003 tea at the world cafe, 9002 cup of tea, 9001 world cup squad named. Posting lists newest first: world 9004 9003 9001, cup 9004 9002 9001, tea 9003 9002. Walking world and cup with one pointer each gives matches 9004 and 9001.',
  });
  s.text(20, 22, 'each term lists the posts that contain it, newest first', { size: 21, anchor: 'start', weight: 700 });
  const posts = ['9004: world cup final tonight', '9003: tea at the world cafe', '9002: cup of tea', '9001: world cup squad named'];
  posts.forEach((p, i) => {
    s.rect(20, 56 + i * 48, 270, 38, { width: 1.5 });
    s.text(32, 56 + i * 48 + 19, p, { size: 19, anchor: 'start' });
  });
  s.arrow(300, 150, 372, 150, { label: 'tokenise', labelOffset: -16, tone: 'soft' });
  const lists = [['world', ['9004', '9003', '9001']], ['cup', ['9004', '9002', '9001']], ['tea', ['9003', '9002']]];
  s.text(452, 48, 'term', { size: 18, tone: 'soft', anchor: 'end' });
  s.text(466, 48, 'posting list', { size: 18, tone: 'soft', anchor: 'start' });
  lists.forEach(([term, ids], i) => {
    const y = 66 + i * 54;
    s.text(452, y + 20, term, { size: 21, anchor: 'end', weight: 700 });
    s.array(466, y, ids, { cell: 60, height: 40, indices: false, size: 19 });
  });

  // bottom: the walk
  const T = 262;
  s.line(20, T, 640, T, { tone: 'soft', width: 1 });
  s.text(20, T + 28, 'query "world cup": one pointer per list, intersect', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, T + 62, [['green', 'in both lists: a match'], ['soft', 'skipped']]);
  const ax = 96, cell = 66;
  const w = s.array(ax, T + 96, ['9004', '9003', '9001'], { cell, height: 44, indices: false, size: 20, tones: { 0: 'green', 2: 'green' }, dim: [1] });
  const c = s.array(ax, T + 170, ['9004', '9002', '9001'], { cell, height: 44, indices: false, size: 20, tones: { 0: 'green', 2: 'green' }, dim: [1] });
  s.text(ax - 12, T + 118, 'world', { size: 20, anchor: 'end', weight: 700 });
  s.text(ax - 12, T + 192, 'cup', { size: 20, anchor: 'end', weight: 700 });
  const steps = ['1. 9004 = 9004: match', '2. 9003 vs 9002: move world', '3. 9001 vs 9002: move cup', '4. 9001 = 9001: match'];
  steps.forEach((t, i) => s.text(330, T + 104 + i * 30, t, { size: 19, anchor: 'start', tone: i === 0 || i === 3 ? 'green' : 'ink' }));
  s.text(330, T + 236, 'always move the pointer on the', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(330, T + 258, 'larger id: each entry read once', { size: 18, anchor: 'start', tone: 'soft' });
  s.text(20, T + 238, 'result: 9004, 9001', { size: 21, anchor: 'start', weight: 700, tone: 'green' });
  s.text(20, T + 262, 'stop once 25 matches are found', { size: 18, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'inverted-index');
}

// ── 2. Shard by term vs shard by document ─────────────────────────────────
{
  const s = new Sketch({
    width: 640, height: 690, seed: 12,
    title: 'Sharding an inverted index by term versus by document',
    desc: 'By term: the query world cup goes to the shard holding all of world and the shard holding all of cup, which must ship a whole list to intersect; a new post writes to every shard holding one of its terms. By document: the query goes to all three shards, each intersects its own lists and returns its top 25; a new post writes to one shard.',
  });
  key(s, 20, 22, [['blue', 'query'], ['amber', 'new post write'], ['red', 'cross-shard list']]);

  const panel = (y0, heading, shardLabels) => {
    s.text(20, y0, heading, { size: 22, anchor: 'start', weight: 700 });
    const Q = s.box(170, y0 + 50, 'query: world cup', { tone: 'blue', size: 20 });
    const P = s.box(480, y0 + 50, 'new post, 30 terms', { tone: 'amber', size: 20 });
    const S = [110, 320, 530].map((cx, i) => s.box(cx, y0 + 168, shardLabels[i], { size: 19, w: 176 }));
    return { Q, P, S };
  };

  // term sharding
  {
    const { Q, P, S } = panel(70, 'shard by term', ['shard A\nall of "world"', 'shard B\nall of "cup"', 'shard C\nall of "tea"']);
    s.arrow(Q.cx - 40, Q.bottom + 4, S[0].cx + 10, S[0].top - 6, { tone: 'blue' });
    s.arrow(Q.cx + 30, Q.bottom + 4, S[1].cx - 30, S[1].top - 6, { tone: 'blue' });
    S.forEach((sh, i) => s.arrow(P.cx - 40 + i * 30, P.bottom + 4, sh.cx + 40 - i * 20, sh.top - 6, { tone: 'amber', dashed: true }));
    s.arrow(S[0].cx, S[0].bottom + 8, S[1].cx, S[1].bottom + 8, { tone: 'red', bend: 22, label: 'ship a whole list', labelOffset: 18 });
    s.text(20, 350, 'one shard per word, but they must swap lists,', { size: 19, anchor: 'start', tone: 'soft' });
    s.text(20, 372, 'and one post writes to up to 30 shards', { size: 19, anchor: 'start', tone: 'soft' });
  }
  s.line(20, 398, 620, 398, { tone: 'soft', width: 1 });
  // document sharding
  {
    const { Q, P, S } = panel(424, 'shard by document', ['shard A\n1/3 of posts', 'shard B\n1/3 of posts', 'shard C\n1/3 of posts']);
    S.forEach((sh, i) => s.arrow(Q.cx - 30 + i * 30, Q.bottom + 4, sh.cx - 20 + i * 10, sh.top - 6, { tone: 'blue' }));
    s.arrow(P.cx + 30, P.bottom + 4, S[2].cx + 30, S[2].top - 6, { tone: 'amber', dashed: true, label: '1 write', labelOffset: -18 });
    s.text(20, 646, 'every shard gets the query, intersects its own', { size: 19, anchor: 'start', tone: 'soft' });
    s.text(20, 668, 'lists and returns its top 25; nothing is shipped', { size: 19, anchor: 'start', tone: 'soft' });
  }
  s.save(__dirname, 'index-sharding');
}

// ── 3. Typeahead trie with the top completions stored at every node ───────
{
  const s = new Sketch({
    width: 640, height: 500, seed: 13,
    title: 'A typeahead trie that stores the top completions at every node',
    desc: 'Nodes c, ca, co, cat and car, each storing its most searched full queries with counts. The node ca already holds cat videos 900, car insurance 700, cat food 400, so a lookup for ca reads one node and walks no subtree.',
  });
  key(s, 20, 22, [['green', 'the one node a lookup for "ca" reads']]);
  const C = s.box(330, 112, '"c"\ncat videos 900\ncar insurance 700\ncoffee near me 600', { size: 19, w: 210 });
  const CA = s.box(180, 268, '"ca"\ncat videos 900\ncar insurance 700\ncat food 400', { size: 19, w: 200, tone: 'green' });
  const CO = s.box(500, 268, '"co"\ncoffee near me 600\ncold brew 200', { size: 19, w: 210 });
  const CAT = s.box(100, 420, '"cat"\ncat videos 900\ncat food 400', { size: 19, w: 170 });
  const CAR = s.box(330, 420, '"car"\ncar insurance 700\ncars 2 300', { size: 19, w: 190 });
  s.arrow(C.cx - 50, C.bottom + 4, CA.cx + 20, CA.top - 6, { label: 'a', labelOffset: 14, size: 22 });
  s.arrow(C.cx + 50, C.bottom + 4, CO.cx - 20, CO.top - 6, { label: 'o', labelOffset: -14, size: 22 });
  s.arrow(CA.cx - 40, CA.bottom + 4, CAT.cx + 10, CAT.top - 6, { label: 't', labelOffset: 14, size: 22 });
  s.arrow(CA.cx + 40, CA.bottom + 4, CAR.cx - 10, CAR.top - 6, { label: 'r', labelOffset: -14, size: 22 });
  s.text(470, 400, 'each node keeps the', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(470, 424, 'top 10 of its subtree', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(470, 448, '(3 shown), built offline', { size: 19, anchor: 'start', tone: 'soft' });
  s.save(__dirname, 'typeahead-trie');
}
