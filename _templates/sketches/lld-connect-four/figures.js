// Figures for Part 4, Design Connect Four.
//   node _templates/sketches/lld-connect-four/figures.js
const { Sketch } = require('../sketch');

// The final board of the Verification scenario, as [row, col, disc]; row 0 is the bottom.
const FINAL = [
  [0, 0, 'R'], [0, 1, 'Y'], [0, 2, 'R'], [0, 3, 'Y'], [0, 6, 'Y'],
  [1, 1, 'R'], [1, 2, 'Y'], [1, 3, 'R'],
  [2, 2, 'R'], [2, 3, 'Y'],
  [3, 3, 'R'],
];
const toneOf = d => (d === 'R' ? 'red' : 'amber');

function key(s, x, y, items) {
  for (const [tone, word, kind] of items) {
    if (kind === 'line') s.line(x, y, x + 24, y, { tone, width: 3 });
    else if (kind === 'ring') s.circle(x + 11, y, 24, { tone, width: 2 });
    else if (kind === 'x') { s.line(x + 3, y - 8, x + 19, y + 8, { tone, width: 2 }); s.line(x + 3, y + 8, x + 19, y - 8, { tone, width: 2 }); }
    else if (kind === 'disc') s.circle(x + 11, y, 22, { tone, fill: 'hachure', width: 1.4 });
    else s.rect(x, y - 11, 22, 22, { tone, fill: 'hachure', width: 1.4 });
    s.text(x + 32, y, word, { size: 19, anchor: 'start', tone: 'soft' });
    x += 32 + s.textWidth(word, 19) + 26;
  }
}

// Draws a rows x cols board whose bottom-left cell is at (x0, yBottom - c).
// Returns cell centre helpers. discs: [[row, col, 'R'|'Y'], ...]
function board(s, x0, y0, rows, cols, c, discs, { r0 = 0, c0 = 0, labels = true, dim = false } = {}) {
  const cx = col => x0 + (col - c0) * c + c / 2;
  const cy = row => y0 + (rows - 1 - (row - r0)) * c + c / 2;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) s.rect(x0 + k * c, y0 + r * c, c, c, { tone: 'soft', width: 1.2 });
  for (const [r, k, d] of discs) {
    if (r < r0 || r >= r0 + rows || k < c0 || k >= c0 + cols) continue;
    s.circle(cx(k), cy(r), c * 0.74, { tone: dim ? 'soft' : toneOf(d), fill: 'hachure', width: 1.5, label: d, size: Math.round(c * 0.4) });
  }
  if (labels) {
    for (let k = 0; k < cols; k++) s.text(cx(k + c0), y0 - 14, k + c0, { size: 17, tone: 'soft' });
    for (let r = 0; r < rows; r++) s.text(x0 - 14, cy(r + r0), r + r0, { size: 17, tone: 'soft', anchor: 'end' });
  }
  return { cx, cy, right: x0 + cols * c, bottom: y0 + rows * c };
}

// ── 1. The final board with the winning diagonal ───────────────────────────
{
  const c = 54, x0 = 70, y0 = 108;
  const s = new Sketch({ width: 580, height: 490, title: 'Final board of the trace: Red wins on a diagonal through the last disc', desc: 'A 6 by 7 board, row 0 at the bottom. Red discs at (0,0), (1,1), (2,2) and (3,3) form a diagonal; the last disc dropped was (2,2), in the middle of the line.', seed: 41 });
  s.text(20, 22, 'after move 13: Red drops into column 2 and wins', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 56, [['red', 'Red', 'disc'], ['amber', 'Yellow', 'disc'], ['green', 'four in a row', 'ring']]);
  const b = board(s, x0, y0, 6, 7, c, FINAL);
  s.text(x0 - 14, y0 - 14, 'row', { size: 15, tone: 'soft', anchor: 'end' });
  for (let i = 0; i < 4; i++) s.circle(b.cx(i), b.cy(i), c * 0.92, { tone: 'green', width: i === 2 ? 3.2 : 2 });
  // the top-left of the board is empty, so the label sits there
  s.text(b.cx(0) - 16, b.cy(4) - 4, 'last disc (2, 2)', { size: 21, anchor: 'start', tone: 'green', weight: 700 });
  s.arrow(b.cx(1), b.cy(4) + 14, b.cx(2) - c * 0.36, b.cy(2) - c * 0.36, { tone: 'green', width: 1.8, headLen: 10 });
  s.text(290, b.bottom + 34, 'the line runs through the last disc, which sits in its middle', { size: 18, tone: 'soft' });
  s.save(__dirname, 'board-win');
}

// ── 2. The four scan directions from the last disc ─────────────────────────
{
  const c = 40, rows = 5, cols = 5;
  const s = new Sketch({ width: 660, height: 720, title: 'From the last disc, scan four directions both ways and add one for the disc itself', desc: 'Four copies of the 5 by 5 window around (2,2). Horizontal: no red neighbours, length 1. Vertical: Yellow below, empty above, length 1. Diagonal: two red down-left, one red up-right, length 4, a win. Anti-diagonal: one red down-right, length 2.', seed: 42 });
  s.text(20, 22, 'the four lines through the last disc (2, 2), each scanned both ways', { size: 21, anchor: 'start', weight: 700 });
  key(s, 20, 54, [['green', 'counted', 'line'], ['soft', 'scan stops: not Red', 'x']]);
  const panels = [
    { name: 'horizontal', d: [0, 1], calc: '1 + 0 + 0 = 1' },
    { name: 'vertical', d: [1, 0], calc: '1 + 0 + 0 = 1' },
    { name: 'diagonal', d: [1, 1], calc: '1 + 2 + 1 = 4  win', win: true },
    { name: 'anti-diagonal', d: [1, -1], calc: '1 + 1 + 0 = 2' },
  ];
  const at = new Map(FINAL.map(([r, k, d]) => [`${r},${k}`, d]));
  panels.forEach((p, i) => {
    const px = 60 + (i % 2) * 320, py = 128 + Math.floor(i / 2) * 290;
    s.text(px + 14, py - 20, p.name, { size: 21, anchor: 'start', weight: 700, tone: p.win ? 'green' : 'ink' });
    const b = board(s, px + 14, py, rows, cols, c, FINAL, { labels: false });
    for (const sign of [1, -1]) {
      let r = 2, k = 2, n = 0;
      while (true) {
        const nr = r + sign * p.d[0], nk = k + sign * p.d[1];
        if (at.get(`${nr},${nk}`) !== 'R' || nr < 0 || nr > 4 || nk < 0 || nk > 4) {
          if (nr >= 0 && nr <= 4 && nk >= 0 && nk <= 4) {
            s.line(b.cx(nk) - 9, b.cy(nr) - 9, b.cx(nk) + 9, b.cy(nr) + 9, { tone: 'soft', width: 2 });
            s.line(b.cx(nk) - 9, b.cy(nr) + 9, b.cx(nk) + 9, b.cy(nr) - 9, { tone: 'soft', width: 2 });
          }
          break;
        }
        s.arrow(b.cx(k), b.cy(r), b.cx(nk), b.cy(nr), { tone: 'green', width: 2.6, headLen: 9 });
        r = nr; k = nk; n++;
      }
    }
    s.circle(b.cx(2), b.cy(2), c * 0.98, { tone: 'green', width: 2.2 });
    s.text(px + 14 + cols * c / 2, b.bottom + 24, p.calc, { size: 20, weight: 700, tone: p.win ? 'green' : 'ink' });
  });
  s.text(330, 700, 'itself + one way + the other way; stop at the first cell that is not Red', { size: 18, tone: 'soft' });
  s.save(__dirname, 'scan-directions');
}

// ── 3. Gravity in O(1): heights[] says where the disc lands ────────────────
{
  const c = 50, x0 = 80, y0 = 116;
  const before = FINAL.filter(([r, k]) => !(r === 2 && k === 2));
  const heights = [1, 2, 2, 4, 0, 0, 1];
  const s = new Sketch({ width: 600, height: 560, title: 'The heights array gives the landing row of a drop without scanning the column', desc: 'The board before move 13 with heights [1, 2, 2, 4, 0, 0, 1] under it. A disc dropped into column 2 lands at row heights[2] = 2, then heights[2] becomes 3.', seed: 43 });
  s.text(20, 22, 'before move 13: where does a disc in column 2 land?', { size: 21, anchor: 'start', weight: 700 });
  const b = board(s, x0, y0, 6, 7, c, before, { labels: true });
  s.rect(b.cx(2) - c / 2 + 4, b.cy(2) - c / 2 + 4, c - 8, c - 8, { tone: 'green', dashed: true, width: 2 });
  s.arrow(b.cx(2), y0 + 6, b.cx(2), b.cy(2) - c / 2 - 2, { tone: 'green', width: 2.2, headLen: 11 });
  s.text(b.cx(2), y0 - 44, 'drop(2, RED)', { size: 20, tone: 'green', weight: 700 });
  const ay = b.bottom + 30;
  const a = s.array(x0, ay, heights, { cell: c, indices: false, tones: { 2: 'green' }, size: 22 });
  s.text(x0 - 12, ay + c / 2, 'heights', { size: 18, anchor: 'end', tone: 'soft' });
  s.text(300, ay + c + 30, 'row = heights[2] = 2, then heights[2] becomes 3', { size: 20, weight: 700, tone: 'green' });
  s.text(300, ay + c + 60, 'no loop down the column; full when heights[col] == 6', { size: 19, tone: 'soft' });
  s.save(__dirname, 'gravity-heights');
}
