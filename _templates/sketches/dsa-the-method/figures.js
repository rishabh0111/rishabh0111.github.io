const { Sketch } = require('../sketch');
{
  // The topic map: 18 topics, top to bottom by level. Arrow A -> B means B builds on A.
  const W = 632, top = 48, gap = 108, H = top + gap * 7 + 58;
  const s = new Sketch({
    width: W, height: H, seed: 7,
    title: 'The topic map: 18 DSA topics as a dependency graph',
    desc: 'Arrays & Hashing leads to Two Pointers and Stack. Two Pointers leads to Binary Search, Sliding Window and Linked List. Binary Search and Linked List lead to Trees. Trees leads to Tries, Heap / Priority Queue and Backtracking. Heap leads to Intervals, Greedy and Advanced Graphs. Backtracking leads to Graphs and 1-D DP. Graphs leads to Advanced Graphs and 2-D DP. 1-D DP leads to 2-D DP and Bit Manipulation. 2-D DP and Bit Manipulation lead to Math & Geometry.',
  });
  const y = l => top + gap * l;
  const o = { h: 68, size: 22 };
  const B = (x, l, label) => s.box(x, y(l), label, o);

  const AH  = B(300, 0, 'Arrays &\nHashing');
  const TP  = B(215, 1, 'Two\nPointers');
  const ST  = B(425, 1, 'Stack');
  const SW  = B(80, 2, 'Sliding\nWindow');
  const BS  = B(250, 2, 'Binary\nSearch');
  const LL  = B(425, 2, 'Linked\nList');
  const TR  = B(340, 3, 'Trees');
  const TRI = B(85, 4, 'Tries');
  const HP  = B(290, 4, 'Heap /\nPriority Queue');
  const BT  = B(495, 4, 'Back-\ntracking');
  const IV  = B(70, 5, 'Intervals');
  const GR  = B(190, 5, 'Greedy');
  const GP  = B(410, 5, 'Graphs');
  const D1  = B(535, 5, '1-D DP');
  const AG  = B(280, 6, 'Advanced\nGraphs');
  const D2  = B(392, 6, '2-D DP');
  const BIT = B(548, 6, 'Bit\nManipulation');
  const MG  = B(470, 7, 'Math &\nGeometry');

  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  // bottom edge of the parent to top edge of the child, fanned so arrows don't share one point
  const c = (a, b) => s.arrow(
    a.cx + clamp((b.cx - a.cx) * 0.35, a.w / 3), a.bottom + 4,
    b.cx + clamp((a.cx - b.cx) * 0.2, b.w / 3), b.top - 6, { head: 'end', width: 1.6 });
  c(AH, TP); c(AH, ST);
  c(TP, BS); c(TP, SW); c(TP, LL);
  c(BS, TR); c(LL, TR);
  c(TR, TRI); c(TR, HP); c(TR, BT);
  c(HP, IV); c(HP, GR); c(HP, AG);
  c(BT, GP); c(BT, D1);
  c(GP, AG); c(GP, D2);
  c(D1, D2); c(D1, BIT);
  c(D2, MG); c(BIT, MG);
  s.save(__dirname, 'topic-map');
}
