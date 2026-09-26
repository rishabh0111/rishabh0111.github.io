const { Sketch } = require('../sketch');

// A trie node drawn as a box: the prefix it stands for, then its two counters.
// Green = at least one inserted word ends here (end >= 1).
function tnode(s, cx, cy, prefix, pass, end, o = {}) {
  const w = o.w ?? 128, h = o.h ?? 62;
  const t = o.tone ?? (end > 0 ? 'green' : 'ink');
  s.rect(cx - w / 2, cy - h / 2, w, h, { tone: t, fill: t === 'ink' ? undefined : 'hachure', width: 1.7, dashed: o.dashed });
  s.text(cx, pass === undefined ? cy : cy - 12, prefix, { size: 23, weight: 700 });
  if (pass !== undefined) s.text(cx, cy + 15, `pass ${pass} · end ${end}`, { size: 17, tone: 'soft', weight: 600 });
  return { cx, cy, w, h, top: cy - h / 2, bottom: cy + h / 2, left: cx - w / 2, right: cx + w / 2 };
}

// Figure 1: the trie after inserting cat, car, card, care, dog.
{
  const s = new Sketch({
    width: 680, height: 530, seed: 9,
    title: 'The trie after inserting cat, car, card, care, dog',
    desc: 'root (pass 5, end 0) has children c and d. c (pass 4, end 0) leads by a to ca (pass 4, end 0). ca leads by r to car (pass 3, end 1) and by t to cat (pass 1, end 1). car leads by d to card (pass 1, end 1) and by e to care (pass 1, end 1). d (pass 1, end 0) leads by o to do (pass 1, end 0), which leads by g to dog (pass 1, end 1). Nodes where a word ends are green.',
  });
  const Y = [45, 155, 265, 375, 485];
  const root = tnode(s, 340, Y[0], 'root', 5, 0);
  const c = tnode(s, 215, Y[1], 'c', 4, 0);
  const d = tnode(s, 530, Y[1], 'd', 1, 0);
  const ca = tnode(s, 215, Y[2], 'ca', 4, 0);
  const d_o = tnode(s, 530, Y[2], 'do', 1, 0);
  const car = tnode(s, 145, Y[3], 'car', 3, 1);
  const cat = tnode(s, 345, Y[3], 'cat', 1, 1);
  const dog = tnode(s, 530, Y[3], 'dog', 1, 1);
  const card = tnode(s, 78, Y[4], 'card', 1, 1);
  const care = tnode(s, 250, Y[4], 'care', 1, 1);
  const link = (a, b, ch) => {
    const x1 = a.cx + (b.cx - a.cx) * 0.25, x2 = b.cx - (b.cx - a.cx) * 0.12;
    const side = b.cx < a.cx ? -1 : 1;
    s.arrow(x1, a.bottom + 4, x2, b.top - 6, { tone: 'ink', width: 1.6 });
    const mx = (x1 + x2) / 2, my = (a.bottom + b.top) / 2;
    s.text(mx + (b.cx === a.cx ? 18 : side * 16), my - (b.cx === a.cx ? 0 : 6), ch, { size: 24, tone: 'blue', weight: 700 });
  };
  link(root, c, 'c'); link(root, d, 'd'); link(c, ca, 'a'); link(d, d_o, 'o');
  link(ca, car, 'r'); link(ca, cat, 't'); link(d_o, dog, 'g');
  link(car, card, 'd'); link(car, care, 'e');
  s.text(470, 470, 'green = a word ends here', { size: 20, tone: 'green', anchor: 'start', weight: 700 });
  s.text(470, 498, 'blue = the edge’s character', { size: 20, tone: 'blue', anchor: 'start', weight: 700 });
  s.save(__dirname, 'trie');
}

// Figure 2: the two lookups from Mechanics, "car" (lands) and "cab" (falls off).
{
  const s = new Sketch({
    width: 680, height: 380, seed: 4,
    title: 'Walking the trie for "car" and for "cab"',
    desc: 'Query car: step 0 root (pass 5, end 0), step 1 c (pass 4, end 0), step 2 ca (pass 4, end 0), step 3 car (pass 3, end 1): landed, prefix count 3, word count 1. Query cab: steps 0 to 2 are the same, step 3 finds no b child under ca, whose children are only r and t: fell off, prefix count 0, word count 0.',
  });
  const X = [75, 245, 415, 585];
  const row = (y0, q, last) => {
    s.text(12, y0, `query "${q}"`, { size: 22, anchor: 'start', weight: 700 });
    const y = y0 + 76;
    const nodes = [['root', 5, 0], ['c', 4, 0], ['ca', 4, 0]].map(([p, a, b], i) => {
      s.text(X[i], y - 42, `step ${i}`, { size: 16, tone: 'soft' });
      return tnode(s, X[i], y, p, a, b, { w: 124, tone: 'ink' });
    });
    s.text(X[3], y - 42, 'step 3', { size: 16, tone: 'soft' });
    const endNode = last(y);
    const all = [...nodes, endNode];
    ['c', 'a', q[2]].forEach((ch, i) => {
      const a = all[i], b = all[i + 1];
      const bad = i === 2 && q === 'cab';
      s.arrow(a.right + 4, y, b.left - 6, y, { tone: bad ? 'red' : 'ink', dashed: bad, width: 1.6 });
      s.text((a.right + b.left) / 2, y - 16, ch, { size: 24, tone: bad ? 'red' : 'blue', weight: 700 });
    });
    return y;
  };
  const y1 = row(22, 'car', y => tnode(s, X[3], y, 'car', 3, 1, { w: 124, tone: 'green' }));
  s.text(X[3] + 62, y1 + 54, 'landed: prefix count 3, word count 1', { size: 20, tone: 'green', anchor: 'end', weight: 700 });
  const y2 = row(206, 'cab', y => {
    const n = tnode(s, X[3], y, 'no b', undefined, 0, { w: 124, tone: 'red', dashed: true });
    return n;
  });
  s.text(X[3] + 62, y2 + 50, 'ca has children r and t only', { size: 19, tone: 'soft', anchor: 'end', weight: 600 });
  s.text(X[3] + 62, y2 + 76, 'fell off: prefix count 0, word count 0', { size: 20, tone: 'red', anchor: 'end', weight: 700 });
  s.save(__dirname, 'lookups');
}
