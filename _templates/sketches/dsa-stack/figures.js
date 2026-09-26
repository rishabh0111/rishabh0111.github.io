// Figures for Part 4: Stack (/blogs/dsa-stack/).
const { Sketch } = require('../sketch');

// ── 1. simplify_path("/a/b/../c/./d/..") step by step ────────────────────
{
  const steps = [
    { part: "'' (empty)", act: 'skip', stack: [] },
    { part: "'a'", act: 'push', stack: ['a'] },
    { part: "'b'", act: 'push', stack: ['a', 'b'] },
    { part: "'..'", act: "pop 'b'", stack: ['a'], popped: 'b' },
    { part: "'c'", act: 'push', stack: ['a', 'c'] },
    { part: "'.'", act: 'skip', stack: ['a', 'c'] },
    { part: "'d'", act: 'push', stack: ['a', 'c', 'd'] },
    { part: "'..'", act: "pop 'd'", stack: ['a', 'c'], popped: 'd' },
  ];
  const W = 640, colW = 160, rowH = 226, sw = 72, sh = 36;
  const s = new Sketch({
    width: W, height: 2 * rowH + 60, seed: 4,
    title: 'The directory stack after each part of /a/b/../c/./d/..',
    desc: "Eight panels. '' skip: empty. 'a' push: [a]. 'b' push: [a, b]. '..' pops b: [a]. 'c' push: [a, c]. '.' skip: [a, c]. 'd' push: [a, c, d]. '..' pops d: [a, c]. Result /a/c.",
  });
  const actTone = { push: 'green', skip: 'soft' };
  steps.forEach((st, k) => {
    const col = k % 4, row = Math.floor(k / 4);
    const cx = col * colW + colW / 2, y0 = row * rowH;
    s.text(cx, y0 + 26, st.part, { size: 26, weight: 700 });
    s.text(cx, y0 + 56, st.act, { size: 22, tone: st.popped ? 'red' : actTone[st.act] });
    const yb = y0 + 200;
    const tones = {};
    if (st.act === 'push') tones[st.stack.length - 1] = 'green';
    s.stack(cx - sw / 2, yb, st.stack, { w: sw, h: sh, tones, size: 24 });
    if (st.popped) {
      const top = yb - st.stack.length * sh;
      s.rect(cx - sw / 2, top - sh - 10, sw, sh, { tone: 'red', dashed: true, label: st.popped, textTone: 'red', size: 24 });
      s.arrow(cx + sw / 2 + 20, top - 12, cx + sw / 2 + 20, top - sh - 16, { tone: 'red', headLen: 9, width: 1.5 });
    }
  });
  s.line(20, rowH - 4, W - 20, rowH - 4, { tone: 'soft', dashed: true, width: 1 });
  s.text(W / 2, 2 * rowH + 28, 'read bottom to top:  "/" + "a/c"  =  "/a/c"', { size: 24, weight: 700 });
  s.save(__dirname, 'simplify-path-trace');
}

// ── 2. previous greater element on [5, 3, 1, 3, 4, 2] ────────────────────
{
  const nums = [5, 3, 1, 3, 4, 2];
  const steps = [
    { i: 0, popped: [], ans: -1, stack: [0] },
    { i: 1, popped: [], ans: 0, stack: [0, 1] },
    { i: 2, popped: [], ans: 1, stack: [0, 1, 2] },
    { i: 3, popped: [2, 1], ans: 0, stack: [0, 3] },
    { i: 4, popped: [3], ans: 0, stack: [0, 4] },
    { i: 5, popped: [], ans: 4, stack: [0, 4, 5] },
  ];
  const W = 660, colW = 220, rowH = 240, top0 = 130, sw = 92, sh = 36, gw = 70;
  const s = new Sketch({
    width: W, height: top0 + 2 * rowH + 50, seed: 7,
    title: 'Previous greater element with a monotonic stack on [5, 3, 1, 3, 4, 2]',
    desc: 'Stack of index: value after each i. i=0 pushes 0, answer -1. i=1 answer 0. i=2 answer 1. i=3 pops 2 and 1, answer 0, stack [0, 3]. i=4 pops 3, answer 0, stack [0, 4]. i=5 answer 4, stack [0, 4, 5]. Answer [-1, 0, 1, 0, 0, 4], 6 pushes, 3 pops.',
  });
  const a = s.array((W - 6 * 54) / 2 + 20, 20, nums, { cell: 54, label: 'nums' });
  s.text(a.x - 12, a.y + a.height + 16, 'index', { size: 17, tone: 'soft', anchor: 'end' });
  steps.forEach((st, k) => {
    const col = k % 3, row = Math.floor(k / 3);
    const x0 = col * colW, y0 = top0 + row * rowH, cx = x0 + colW / 2;
    s.text(cx, y0 + 22, `i = ${st.i},  x = ${nums[st.i]}`, { size: 24, weight: 700 });
    const sx = x0 + 22, yb = y0 + 178;
    const tones = { [st.stack.length - 1]: 'green' };
    if (st.stack.length > 1) tones[st.stack.length - 2] = 'amber';
    s.stack(sx, yb, st.stack.map(j => `${j} : ${nums[j]}`), { w: sw, h: sh, tones, size: 22 });
    // popped entries, dashed red, stacked beside the stack
    const gx = sx + sw + 24;
    [...st.popped].reverse().forEach((j, m) => { // keep their old stack order: first popped on top
      s.rect(gx, yb - (m + 1) * sh - 8, gw, sh, { tone: 'red', dashed: true, label: `${j} : ${nums[j]}`, textTone: 'red', size: 21 });
    });
    if (st.popped.length) s.text(gx + gw / 2, yb - st.popped.length * sh - 26, 'popped', { size: 19, tone: 'red' });
    s.text(cx, yb + 32, `answer[${st.i}] = ${st.ans}`, { size: 22, tone: st.ans === -1 ? 'soft' : 'amber', weight: 700 });
  });
  s.text(W / 2, top0 + 2 * rowH + 22, 'answer = [-1, 0, 1, 0, 0, 4]   ·   6 pushes, 3 pops', { size: 23, weight: 700 });
  s.save(__dirname, 'previous-greater-trace');
}
