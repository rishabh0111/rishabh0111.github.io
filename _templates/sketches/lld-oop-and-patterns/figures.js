// Figures for Part 2, OOP, principles and patterns (Low-Level Design, Question by Question).
//   node _templates/sketches/lld-oop-and-patterns/figures.js
const { Sketch } = require('../sketch');

// ── 1. Decorator: the same three wrappers in two orders ────────────────────
{
  // Each class keeps its colour in both panels: violet = CountingNotifier,
  // blue = RetryingNotifier, amber = FlakyNotifier (fails twice, then succeeds).
  const s = new Sketch({
    width: 680, height: 400, seed: 21,
    title: 'Decorator order matters: count(retry(flaky)) against retry(count(flaky))',
    desc: 'Left: a counting notifier wraps a retrying notifier (up to 3 tries), which wraps a notifier that fails twice and then succeeds. The caller makes one send, the retry layer makes three, and the counter sees 1 call. Right: the retry layer is outermost and the counter sits inside it, so the counter sees all 3 attempts. Both deliver the message.',
  });
  s.text(20, 24, 'same three wrappers, two orders, two different counts', { size: 22, anchor: 'start', weight: 700 });
  const layers = {
    count: { tone: 'violet', name: 'Counting' },
    retry: { tone: 'blue', name: 'Retrying (max 3)' },
    flaky: { tone: 'amber', name: 'Flaky (fails twice)' },
  };
  const panel = (x, order, verdict) => {
    const boxes = [[x, 96, 310, 226], [x + 20, 142, 270, 164], [x + 40, 188, 230, 102]];
    order.forEach((k, i) => {
      const [bx, by, bw, bh] = boxes[i];
      s.rect(bx, by, bw, bh, { tone: layers[k].tone, width: i === 2 ? 2.4 : 1.8 });
      s.text(bx + 12, by + 20, layers[k].name, { size: 20, anchor: 'start', weight: 700, tone: layers[k].tone });
    });
    s.text(x + 155, 238, 'fail, fail, ok', { size: 21, weight: 600 });
    s.text(x + 155, 266, 'attempts 1, 2, 3', { size: 19, tone: 'soft' });
    s.arrow(x + 155, 56, x + 155, 92, { tone: 'ink', label: 'send() once', labelOffset: 60 });
    s.text(x + 155, 352, verdict, { size: 22, weight: 700, tone: 'violet' });
  };
  panel(20, ['count', 'retry', 'flaky'], 'counter sees 1 call');
  panel(350, ['retry', 'count', 'flaky'], 'counter sees 3 calls');
  s.text(340, 386, 'both deliver: the retry layer makes 3 attempts, the caller makes 1', { size: 18, tone: 'soft' });
  s.save(__dirname, 'decorator-order');
}

// ── 2. Composite: a bundle's price is the same call on every node ──────────
{
  const s = new Sketch({
    width: 660, height: 450, seed: 22,
    title: 'Composite: a bundle priced by asking each part for its price',
    desc: 'Desk setup, 10 percent off, contains Monitor Rs 12,000, Keyboard kit and Lamp Rs 1,500. Keyboard kit, no discount, contains Keyboard Rs 2,500 and Mouse Rs 1,000, so it costs Rs 3,500. Desk setup sums 12,000 + 3,500 + 1,500 = 17,000 and takes 10 percent off: Rs 15,300. Blue boxes are bundles, green boxes are items.',
  });
  s.text(20, 24, 'pricePaise() on the root asks every part the same question', { size: 22, anchor: 'start', weight: 700 });
  const root = s.box(330, 98, 'Desk setup, 10% off\n12,000 + 3,500 + 1,500 = 17,000\n17,000 − 1,700 = Rs 15,300', { tone: 'blue', size: 20 });
  const mon = s.box(100, 232, 'Monitor\nRs 12,000', { tone: 'green', size: 20 });
  const kit = s.box(330, 232, 'Keyboard kit, 0% off\n2,500 + 1,000 = Rs 3,500', { tone: 'blue', size: 20 });
  const lamp = s.box(570, 232, 'Lamp\nRs 1,500', { tone: 'green', size: 20 });
  const kb = s.box(230, 352, 'Keyboard\nRs 2,500', { tone: 'green', size: 20 });
  const ms = s.box(430, 352, 'Mouse\nRs 1,000', { tone: 'green', size: 20 });
  for (const [a, b] of [[root, mon], [root, kit], [root, lamp], [kit, kb], [kit, ms]])
    s.arrow(b.cx + (a.cx - b.cx) * 0.25, b.top - 6, a.cx + (b.cx - a.cx) * 0.3, a.bottom + 4, { tone: 'soft', width: 1.5 });
  // key
  s.rect(20, 424 - 11, 22, 22, { tone: 'blue', fill: 'hachure', width: 1.4 });
  s.text(50, 424, 'bundle', { size: 19, anchor: 'start', tone: 'soft' });
  s.rect(130, 424 - 11, 22, 22, { tone: 'green', fill: 'hachure', width: 1.4 });
  s.text(160, 424, 'item (leaf)', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(640, 424, 'arrows: each price flows up', { size: 19, anchor: 'end', tone: 'soft' });
  s.save(__dirname, 'composite-bundle');
}

// ── 3. Command: undo and redo stacks, step by step ─────────────────────────
{
  const steps = [
    { act: 'append "Hello"', doc: 'Hello', undo: ['+Hello'], redo: [], moved: 'u' },
    { act: 'append " world"', doc: 'Hello world', undo: ['+Hello', '+ world'], redo: [], moved: 'u' },
    { act: 'delete last 6', doc: 'Hello', undo: ['+Hello', '+ world', '−6'], redo: [], moved: 'u' },
    { act: 'undo', doc: 'Hello world', undo: ['+Hello', '+ world'], redo: ['−6'], moved: 'r' },
    { act: 'undo', doc: 'Hello', undo: ['+Hello'], redo: ['−6', '+ world'], moved: 'r' },
    { act: 'redo', doc: 'Hello world', undo: ['+Hello', '+ world'], redo: ['−6'], moved: 'u' },
    { act: 'append "!"', doc: 'Hello world!', undo: ['+Hello', '+ world', '+!'], redo: [], moved: 'u', cleared: true },
  ];
  const top = 110, pitch = 52, cw = 62, ch = 34, ux = 330, rx = 540;
  const s = new Sketch({
    width: 680, height: top + steps.length * pitch + 46, seed: 23,
    title: 'Command pattern: the undo and redo stacks after each editor action',
    desc: 'Seven actions: append Hello, append space world, delete last 6, undo, undo, redo, append exclamation mark. The document reads Hello, Hello world, Hello, Hello world, Hello, Hello world, Hello world!. Each command moves between the undo stack and the redo stack; the new edit at the end clears the redo stack.',
  });
  s.text(20, 24, 'each edit is an object that knows how to undo itself', { size: 22, anchor: 'start', weight: 700 });
  s.text(20, 74, 'action', { size: 18, tone: 'soft', anchor: 'start' });
  s.text(150, 74, 'document', { size: 18, tone: 'soft', anchor: 'start' });
  s.text(ux, 74, 'undo stack (top at right)', { size: 18, tone: 'soft', anchor: 'start' });
  s.text(rx + 8, 74, 'redo stack', { size: 18, tone: 'soft', anchor: 'start' });
  steps.forEach((st, k) => {
    const y = top + k * pitch;
    s.text(20, y + ch / 2, st.act, { size: 19, anchor: 'start', weight: 600 });
    s.rect(150, y, 160, ch, { width: 1.4 });
    s.text(160, y + ch / 2 + 1, `'${st.doc}'`, { size: 19, anchor: 'start' });
    st.undo.forEach((c, i) => {
      const last = i === st.undo.length - 1 && st.moved === 'u';
      s.rect(ux + i * (cw + 4), y, cw, ch, { tone: last ? 'amber' : 'blue', fill: 'hachure', width: 1.4, label: c, size: 18, hachureGap: 8 });
    });
    st.redo.forEach((c, i) => {
      const last = i === st.redo.length - 1 && st.moved === 'r';
      s.rect(rx + i * (cw + 4), y, cw, ch, { tone: last ? 'amber' : 'violet', fill: 'hachure', width: 1.4, label: c, size: 18, hachureGap: 8 });
    });
    if (st.cleared) s.text(rx + 8, y + ch / 2, 'cleared', { size: 19, anchor: 'start', tone: 'red', weight: 700 });
  });
  const ky = top + steps.length * pitch + 20;
  s.rect(20, ky - 11, 22, 22, { tone: 'amber', fill: 'hachure', width: 1.4 });
  s.text(50, ky, 'the command that moved in this step', { size: 19, anchor: 'start', tone: 'soft' });
  s.text(660, ky, '+ append, − delete', { size: 19, anchor: 'end', tone: 'soft' });
  s.save(__dirname, 'command-undo');
}
