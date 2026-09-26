const { Sketch } = require('../sketch');

// A row of linked boxes, each pointing at the next. items: [{ label, tone }] or strings.
function chain(s, x0, y, items, { w = 48, h = 44, step = 80, head = 'end' } = {}) {
  const boxes = items.map((it, i) => {
    const o = typeof it === 'object' ? it : { label: it };
    return s.box(x0 + i * step, y, String(o.label), { w, h, tone: o.tone, size: 22 });
  });
  for (let i = 0; i + 1 < boxes.length; i++) s.connect(boxes[i], boxes[i + 1], { head });
  return boxes;
}

// ── Singly linked list: remove every 7 from 7 -> 3 -> 7 -> 7 -> 1 ─────────────
{
  const s = new Sketch({
    width: 680, height: 440, seed: 2,
    title: 'Removing every 7 from 7, 3, 7, 7, 1 with a dummy node',
    desc: 'One row per loop iteration: the list reachable from the dummy D after the step, with prev after the step in blue.',
  });
  s.text(24, 24, 'iter', { anchor: 'start', size: 19, tone: 'soft' });
  s.text(88, 24, 'cur', { anchor: 'start', size: 19, tone: 'soft' });
  s.text(138, 24, 'action', { anchor: 'start', size: 19, tone: 'soft' });
  s.text(236, 24, 'reachable from D  (blue = prev after the step)', { anchor: 'start', size: 19, tone: 'soft' });
  const rows = [
    ['start', '', '', ['D', 7, 3, 7, 7, 1], 0],
    ['1', '7', 'unlink', ['D', 3, 7, 7, 1], 0],
    ['2', '3', 'keep', ['D', 3, 7, 7, 1], 1],
    ['3', '7', 'unlink', ['D', 3, 7, 1], 1],
    ['4', '7', 'unlink', ['D', 3, 1], 1],
    ['5', '1', 'keep', ['D', 3, 1], 2],
  ];
  rows.forEach(([it, cur, act, list, prev], r) => {
    const y = 76 + r * 70;
    s.text(24, y, it, { anchor: 'start', size: 21 });
    s.text(96, y, cur, { size: 21 });
    s.text(138, y, act, { anchor: 'start', size: 21, tone: act === 'unlink' ? 'red' : act === 'keep' ? 'green' : 'ink' });
    chain(s, 262, y, list.map((v, i) => ({ label: v, tone: i === prev ? 'blue' : (v === 'D' ? 'soft' : undefined) })), { step: 80 });
  });
  s.save(__dirname, 'remove-trace');
}

// ── Zoom on iteration 3: the unlink with prev on 3 ─────────────────────────────
{
  const s = new Sketch({
    width: 600, height: 400, seed: 4,
    title: 'Unlinking cur with prev.next = cur.next',
    desc: 'Before: D, 3, 7, 7, 1 with prev on 3 and cur on the first remaining 7. After: 3 points past cur to the next 7; cur is out of the list but its next still points into it.',
  });
  s.text(20, 24, 'before', { anchor: 'start', size: 21, tone: 'soft' });
  const y1 = 110;
  const [d1, t1, c1, n1, o1] = chain(s, 60, y1, [{ label: 'D', tone: 'soft' }, { label: 3, tone: 'blue' }, { label: 7, tone: 'amber' }, 7, 1], { step: 110 });
  s.pointer(t1.cx, t1.top, 'prev', { dir: 'down', tone: 'blue' });
  s.pointer(c1.cx, c1.top, 'cur', { dir: 'down', tone: 'amber' });

  s.text(300, 178, 'prev.next = cur.next', { size: 24, weight: 700 });

  s.text(20, 222, 'after', { anchor: 'start', size: 21, tone: 'soft' });
  const y2 = 266;
  const d2 = s.box(60, y2, 'D', { w: 48, h: 44, tone: 'soft', size: 22 });
  const t2 = s.box(170, y2, '3', { w: 48, h: 44, tone: 'blue', size: 22 });
  const n2 = s.box(390, y2, '7', { w: 48, h: 44, size: 22 });
  const o2 = s.box(500, y2, '1', { w: 48, h: 44, size: 22 });
  s.connect(d2, t2); s.connect(t2, n2); s.connect(n2, o2);
  const c2 = s.box(280, 340, '7', { w: 48, h: 44, tone: 'amber', size: 22 });
  s.text(c2.left - 14, c2.cy, 'cur', { anchor: 'end', size: 21, tone: 'amber', weight: 700 });
  s.arrow(c2.right + 4, c2.cy - 6, n2.left - 4, n2.bottom - 2, { tone: 'amber', width: 1.6 });
  s.text(c2.right + 60, 368, 'its .next still points into the list', { anchor: 'start', size: 19, tone: 'soft' });
  s.save(__dirname, 'unlink-zoom');
}

// ── Doubly linked list: append A, B, C; remove(B); append(B) ──────────────────
{
  const s = new Sketch({
    width: 640, height: 470, seed: 6,
    title: 'Remove and re-append a node in a doubly linked list with sentinels',
    desc: 'H and T are sentinels. After remove(B), A and C point at each other and B is detached with stale pointers. append(B) puts B between C and T.',
  });
  const both = { head: 'both' };
  const sent = { tone: 'soft' };
  const bx = (cx, y, l, o = {}) => s.box(cx, y, l, { w: 48, h: 44, size: 22, ...o });

  s.text(20, 24, 'append A, B, C', { anchor: 'start', size: 20, tone: 'soft' });
  let y = 70;
  let r = [bx(80, y, 'H', sent), bx(180, y, 'A'), bx(280, y, 'B'), bx(380, y, 'C'), bx(480, y, 'T', sent)];
  for (let i = 0; i + 1 < r.length; i++) s.connect(r[i], r[i + 1], both);

  s.text(20, 134, 'remove(B):  A.next B → C,   C.prev B → A', { anchor: 'start', size: 20, tone: 'soft' });
  y = 180;
  const H2 = bx(80, y, 'H', sent), A2 = bx(180, y, 'A'), C2 = bx(380, y, 'C'), T2 = bx(480, y, 'T', sent);
  s.connect(H2, A2, both); s.connect(A2, C2, both); s.connect(C2, T2, both);
  const B2 = bx(280, 256, 'B', { tone: 'red' });
  s.arrow(B2.left - 4, B2.cy - 4, A2.cx + 6, A2.bottom + 6, { tone: 'red', dashed: true, width: 1.5 });
  s.arrow(B2.right + 4, B2.cy - 4, C2.cx - 6, C2.bottom + 6, { tone: 'red', dashed: true, width: 1.5 });
  s.text(B2.right + 150, 256, 'stale prev / next;', { anchor: 'start', size: 19, tone: 'red' });
  s.text(B2.right + 150, 280, 'no node points at B', { anchor: 'start', size: 19, tone: 'red' });

  s.text(20, 330, 'append(B):  last = T.prev = C', { anchor: 'start', size: 20, tone: 'soft' });
  s.text(20, 356, 'B.prev = C,  B.next = T,  C.next = B,  T.prev = B', { anchor: 'start', size: 20, tone: 'soft' });
  y = 420;
  r = [bx(80, y, 'H', sent), bx(180, y, 'A'), bx(280, y, 'C'), bx(380, y, 'B', { tone: 'green' }), bx(480, y, 'T', sent)];
  for (let i = 0; i + 1 < r.length; i++) s.connect(r[i], r[i + 1], both);
  s.save(__dirname, 'dll-remove-append');
}

// ── Fast and slow: finding the middle of 1..6 ─────────────────────────────────
{
  const s = new Sketch({
    width: 600, height: 370, seed: 8,
    title: 'Slow and fast pointers finding the middle of a six-node list',
    desc: 'Values 1 to 6 at indices 0 to 5, then None. Slow moves one node per step, fast two. At step 3 fast is None, so the loop stops with slow on index 3, the node 4.',
  });
  const a = s.array(140, 30, [1, 2, 3, 4, 5, 6, 'None'], { cell: 58, tones: { 3: 'green' }, dim: [6], size: 22 });
  s.text(128, a.mid, 'value', { anchor: 'end', size: 19, tone: 'soft' });
  s.text(128, a.top + a.height + 16, 'index', { anchor: 'end', size: 17, tone: 'soft' });
  const steps = [[0, 0], [1, 2], [2, 4], [3, 6]];
  steps.forEach(([sl, fa], k) => {
    const yy = 150 + k * 44;
    s.text(128, yy, `step ${k}`, { anchor: 'end', size: 20, tone: 'soft' });
    if (sl === fa) {
      s.text(a.cx(sl) - 13, yy, 'S', { size: 27, tone: 'blue', weight: 700 });
      s.text(a.cx(fa) + 13, yy, 'F', { size: 27, tone: 'amber', weight: 700 });
    } else {
      s.text(a.cx(sl), yy, 'S', { size: 27, tone: 'blue', weight: 700 });
      s.text(a.cx(fa), yy, 'F', { size: 27, tone: 'amber', weight: 700 });
    }
  });
  s.text(300, 336, 'step 3: fast is None, the loop stops, slow is on the node 4', { size: 20 });
  s.save(__dirname, 'middle-steps');
}

// ── The same six nodes with 6 pointing back at 3 ──────────────────────────────
{
  const s = new Sketch({
    width: 520, height: 280, seed: 10,
    title: 'A list with a loop: 1, 2, then the loop 3, 4, 5, 6 back to 3',
    desc: 'a = 2 nodes before the loop, loop length L = 4. Node 3 is the entry; the runners meet on node 5.',
  });
  const n1 = s.node(70, 100, 1), n2 = s.node(170, 100, 2), n3 = s.node(280, 100, 3, { tone: 'violet' }), n4 = s.node(410, 100, 4);
  const n5 = s.node(410, 225, 5, { tone: 'green' }), n6 = s.node(280, 225, 6);
  [[n1, n2], [n2, n3], [n3, n4], [n4, n5], [n5, n6], [n6, n3]].forEach(([p, q]) => s.edge(p, q, { directed: true }));
  s.span(46, 194, 64, 'a = 2', { side: 'above' });
  s.text(345, 163, 'L = 4', { size: 22, weight: 700 });
  s.text(280, 56, 'entry', { size: 20, tone: 'violet', weight: 700 });
  s.text(446, 225, 'meet', { anchor: 'start', size: 20, tone: 'green', weight: 700 });
  s.save(__dirname, 'loop-shape');
}

// ── Floyd phase 1 and phase 2 on that loop ────────────────────────────────────
{
  const s = new Sketch({
    width: 640, height: 350, seed: 12,
    title: 'Floyd phase 1 (meet) and phase 2 (find the entry) on the loop example',
    desc: 'Phase 1: slow and fast positions per step and the gap; they meet on 5 after 4 steps. Phase 2: p from the head and slow from 5, one step each, meet on 3 after 2 steps.',
  });
  s.text(28, 24, 'phase 1: slow +1, fast +2', { anchor: 'start', size: 21, weight: 700 });
  const g1 = s.grid(28, 52, [
    ['step', 'slow', 'fast', 'gap'],
    ['0', '1', '1', ''],
    ['1', '2', '3', ''],
    ['2', '3', '5', '2'],
    ['3', '4', '3', '1'],
    ['4', '5', '5', '0'],
  ], { cw: 70, ch: 42, header: true, size: 21, tones: { '5,0': 'green', '5,1': 'green', '5,2': 'green', '5,3': 'green' } });
  s.text(28, g1.bottom + 24, 'gap = single steps for fast to reach slow', { anchor: 'start', size: 18, tone: 'soft' });
  s.text(28, g1.bottom + 50, 'meet on 5: a + b = 4, so b = 2', { anchor: 'start', size: 19, tone: 'green' });

  s.text(380, 24, 'phase 2: both +1', { anchor: 'start', size: 21, weight: 700 });
  const g2 = s.grid(380, 52, [
    ['step', 'p', 'slow'],
    ['0', '1', '5'],
    ['1', '2', '6'],
    ['2', '3', '3'],
  ], { cw: 70, ch: 42, header: true, size: 21, tones: { '3,0': 'violet', '3,1': 'violet', '3,2': 'violet' } });
  s.text(380, g2.bottom + 24, 'p starts at the head,', { anchor: 'start', size: 18, tone: 'soft' });
  s.text(380, g2.bottom + 46, 'slow at the meeting node', { anchor: 'start', size: 18, tone: 'soft' });
  s.text(380, g2.bottom + 76, 'meet on 3, the entry,', { anchor: 'start', size: 19, tone: 'violet' });
  s.text(380, g2.bottom + 98, 'after a = 2 steps', { anchor: 'start', size: 19, tone: 'violet' });
  s.save(__dirname, 'loop-phases');
}
