// Figures for Part 4, Design Dropbox.
//   node _templates/sketches/hld-dropbox/figures.js
const { Sketch } = require('../sketch');

// A row of small swatches with words: [[tone, word], ...] starting at (x, y).
function key(s, x, y, items, size = 19) {
  for (const [tone, word] of items) {
    s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 30, y, word, { size, anchor: 'start', tone: 'soft' });
    x += 30 + s.textWidth(word, size) + 24;
  }
}

// ── 1. Block upload: only missing blocks go up, a drop costs one block ─────
{
  const s = new Sketch({
    width: 640, height: 400, seed: 41,
    title: 'Uploading a 24 MiB file as six 4 MiB blocks',
    desc: 'Blocks 2 and 5 are already stored, so they are skipped. Attempt 1 sends blocks 1 and 3, then the connection drops during block 4. On attempt 2 the server lists only blocks 4 and 6 as missing, so only those are sent. 16 MiB of 24 MiB is uploaded.',
  });
  s.text(20, 24, 'report.mov, 24 MiB = six 4 MiB blocks', { size: 22, anchor: 'start', weight: 700 });
  key(s, 20, 58, [['green', 'server has it'], ['amber', 'sent'], ['red', 'dropped mid-send']]);
  const hashes = ['9f2c', '41ab', 'e07d', 'c3a9', '5b10', 'd8e4'];
  const x0 = 186, cw = 72, ch = 50, y0 = 132;
  hashes.forEach((h, i) => {
    s.text(x0 + i * cw + cw / 2, y0 - 34, `block ${i + 1}`, { size: 18, tone: 'soft' });
    s.text(x0 + i * cw + cw / 2, y0 - 14, `#${h}`, { size: 18, tone: 'soft' });
  });
  const rows = [
    ['', 'yes', '', '', 'yes', ''],
    ['sent', 'skip', 'sent', 'drop', 'skip', ''],
    ['', '', '', 'sent', '', 'sent'],
  ];
  const tones = {
    '0,1': 'green', '0,4': 'green',
    '1,0': 'amber', '1,2': 'amber', '1,3': 'red',
    '2,3': 'amber', '2,5': 'amber',
  };
  const dim = ['1,1', '1,4'];
  s.grid(x0, y0, rows, { cw, ch, tones, dim, size: 19, rowLabels: ['already stored', 'attempt 1', 'attempt 2'] });
  const yb = y0 + 3 * ch + 36;
  s.text(20, yb, 'after the drop the device asks again; the server', { size: 20, anchor: 'start' });
  s.text(20, yb + 28, 'now lists only blocks 4 and 6 as missing', { size: 20, anchor: 'start' });
  s.text(20, yb + 66, 'uploaded in total: blocks 1, 3, 4, 6 = 16 MiB of 24', { size: 21, anchor: 'start', weight: 700, tone: 'amber' });
  s.save(__dirname, 'block-upload');
}

// ── 2. Fixed vs content-defined boundaries after an insert at the start ────
{
  const s = new Sketch({
    width: 680, height: 430, seed: 42,
    title: 'Fixed blocks versus content-defined blocks after inserting bytes at the start',
    desc: 'With fixed 4 MiB boundaries, inserting bytes at the start shifts all content, so every block after the insert is new: 6 of 6 blocks upload. With content-defined boundaries, cuts follow the content, so only the first block, which contains the insert, is new: 1 of 5 blocks uploads.',
  });
  const X = 120, H = 40;
  // draw a strip of blocks: widths[], tones[], optional inserted sliver width at the start
  const strip = (y, widths, tones, ins = 0) => {
    let x = X;
    widths.forEach((w, i) => {
      s.rect(x, y, w, H, { tone: tones[i], fill: tones[i] === 'ink' ? undefined : 'hachure', width: 1.6 });
      x += w;
    });
    if (ins) s.rect(X + 3, y + 4, ins - 6, H - 8, { tone: 'amber', fill: 'cross', hachureGap: 3, width: 1.4 });
    return x;
  };
  s.text(20, 24, 'insert a few bytes at the very start of a file', { size: 22, anchor: 'start', weight: 700 });

  s.text(20, 64, 'fixed boundaries every 4 MiB', { size: 20, anchor: 'start', weight: 700, tone: 'soft' });
  s.text(X - 12, 104, 'before', { size: 19, anchor: 'end', tone: 'soft' });
  strip(84, [80, 80, 80, 80, 80], ['ink', 'ink', 'ink', 'ink', 'ink']);
  s.text(X - 12, 160, 'after', { size: 19, anchor: 'end', tone: 'soft' });
  const e1 = strip(140, [80, 80, 80, 80, 80, 24], ['red', 'red', 'red', 'red', 'red', 'red'], 24);
  s.text(e1 + 14, 160, '6 of 6 new', { size: 21, anchor: 'start', weight: 700, tone: 'red' });
  s.text(X, 200, 'every cut lands on shifted content, so every hash changes', { size: 18, anchor: 'start', tone: 'soft' });

  s.text(20, 244, 'content-defined boundaries (cut where the rolling hash hits)', { size: 20, anchor: 'start', weight: 700, tone: 'soft' });
  s.text(X - 12, 284, 'before', { size: 19, anchor: 'end', tone: 'soft' });
  strip(264, [72, 96, 64, 88, 80], ['ink', 'ink', 'ink', 'ink', 'ink']);
  s.text(X - 12, 340, 'after', { size: 19, anchor: 'end', tone: 'soft' });
  const e2 = strip(320, [96, 96, 64, 88, 80], ['red', 'green', 'green', 'green', 'green'], 24);
  s.text(e2 + 14, 340, '1 of 5 new', { size: 21, anchor: 'start', weight: 700, tone: 'green' });
  s.text(X, 380, 'cuts follow the content, so blocks 2 to 5 keep their hashes', { size: 18, anchor: 'start', tone: 'soft' });

  key(s, 20, 414, [['amber', 'inserted bytes'], ['red', 'new block, uploaded'], ['green', 'same hash, skipped']], 18);
  s.save(__dirname, 'fixed-vs-cdc');
}

// ── 3. Two offline edits race to commit ────────────────────────────────────
{
  const s = new Sketch({
    width: 660, height: 400, seed: 43,
    title: 'Two laptops edit budget.xlsx offline from version 3 and commit in turn',
    desc: 'Laptop A commits with base version 3 first and becomes version 4. Laptop B then commits with base version 3; the server refuses with 409 because the file is now version 4, and laptop B uploads its edit as a conflicted copy. Neither edit is lost.',
  });
  s.text(20, 24, 'both laptops start from v3 and edit offline', { size: 22, anchor: 'start', weight: 700 });
  const yA = 96, yS = 192, yB = 288, x0 = 130, x1 = 640;
  s.text(x0 - 14, yA, 'laptop A', { size: 20, anchor: 'end', weight: 700 });
  s.text(x0 - 14, yS, 'server', { size: 20, anchor: 'end', weight: 700 });
  s.text(x0 - 14, yB, 'laptop B', { size: 20, anchor: 'end', weight: 700 });
  // lanes: solid when online, dashed while offline
  s.line(170, yA, 300, yA, { tone: 'soft', dashed: true }); s.line(300, yA, x1, yA, { tone: 'soft' });
  s.line(170, yS, 313, yS, { tone: 'soft' }); s.line(367, yS, 405, yS, { tone: 'soft' }); s.line(535, yS, x1, yS, { tone: 'soft' });
  s.line(170, yB, 420, yB, { tone: 'soft', dashed: true }); s.line(420, yB, x1, yB, { tone: 'soft' });
  s.text(235, yA - 18, 'offline, editing', { size: 18, tone: 'soft' });
  s.text(295, yB + 20, 'offline, editing', { size: 18, tone: 'soft' });
  s.circle(150, yA, 34, { tone: 'blue', fill: 'hachure', label: 'v3', size: 18 });
  s.circle(150, yS, 34, { tone: 'blue', fill: 'hachure', label: 'v3', size: 18 });
  s.circle(150, yB, 34, { tone: 'blue', fill: 'hachure', label: 'v3', size: 18 });
  // A commits first
  s.arrow(310, yA + 8, 330, yS - 24, { tone: 'green', headLen: 10 });
  s.text(326, yA + 36, 'commit, base v3', { size: 18, tone: 'green', anchor: 'start' });
  s.box(340, yS, 'v4', { tone: 'green', size: 20, w: 50, h: 38 });
  // B commits second, refused
  s.arrow(430, yB - 8, 450, yS + 24, { tone: 'red', headLen: 10 });
  s.text(446, yB - 36, 'commit, base v3', { size: 18, tone: 'red', anchor: 'start' });
  s.box(470, yS, '409: now v4', { tone: 'red', size: 19 });
  // B saves its edit as a new file
  s.arrow(545, yS + 22, 575, yB + 4, { tone: 'amber', headLen: 10 });
  s.box(575, yB + 44, 'conflicted\ncopy, new file', { tone: 'amber', size: 17 });
  s.text(20, 384, 'A’s edit is v4, B’s edit is a second file: nothing lost', { size: 19, tone: 'soft', anchor: 'start' });
  s.save(__dirname, 'conflict-timeline');
}
