// Figures for Part 18: Bit Manipulation.
//   node _templates/sketches/dsa-bit-manipulation/figures.js
const { Sketch } = require('../sketch');

const CELL = 40;
const PITCH = 52;

// Bits of v at positions hi..0, most significant first.
function bitsOf(v, hi = 7) {
  const out = [];
  for (let i = hi; i >= 0; i--) out.push((v >> i) & 1);
  return out;
}

// Position labels above a bit row. `labels` are left-to-right.
function header(s, x, y, labels) {
  labels.forEach((l, k) => s.text(x + k * CELL + CELL / 2, y, l, { size: 17, tone: 'soft' }));
}

// One row of 0/1 cells; set bits tinted with `tone`. Extra per-cell tones override.
function bitRow(s, x, y, bits, label, { tone = 'blue', over = {}, dim = [], note, noteTone = 'soft' } = {}) {
  const tones = {};
  bits.forEach((b, i) => { if (b === 1 && !dim.includes(i)) tones[i] = tone; });
  Object.assign(tones, over);
  const a = s.array(x, y, bits, { cell: CELL, indices: false, tones, dim, label, labelSize: 21, size: 22 });
  if (note) s.text(a.x + a.width + 18, a.mid, note, { size: 19, tone: noteTone, anchor: 'start' });
  return a;
}

const POS8 = ['7', '6', '5', '4', '3', '2', '1', '0'];

// 1. AND, OR, XOR on a = 12, b = 10.
{
  const s = new Sketch({
    width: 620, height: 318, seed: 11,
    title: 'AND, OR and XOR of 12 and 10, one column per bit position',
    desc: 'a = 12 is 00001100, b = 10 is 00001010. a AND b = 8 (00001000), a OR b = 14 (00001110), a XOR b = 6 (00000110).',
  });
  const x = 150;
  header(s, x, 28, POS8);
  s.text(x - 12, 28, 'position', { size: 17, tone: 'soft', anchor: 'end' });
  bitRow(s, x, 46, bitsOf(12), 'a = 12');
  bitRow(s, x, 46 + PITCH, bitsOf(10), 'b = 10');
  s.line(x - 130, 46 + 2 * PITCH - 7, x + 8 * CELL + 10, 46 + 2 * PITCH - 7, { tone: 'soft', width: 1.2 });
  bitRow(s, x, 46 + 2 * PITCH + 4, bitsOf(8), 'a & b = 8', { tone: 'green', note: 'both 1' });
  bitRow(s, x, 46 + 3 * PITCH + 4, bitsOf(14), 'a | b = 14', { tone: 'green', note: 'either 1' });
  bitRow(s, x, 46 + 4 * PITCH + 4, bitsOf(6), 'a ^ b = 6', { tone: 'green', note: 'they differ' });
  s.save(__dirname, 'and-or-xor');
}

// 2. Shifts of a = 12.
{
  const s = new Sketch({
    width: 640, height: 214, seed: 12,
    title: 'Shifting 12 left by one and right by two',
    desc: 'a = 12 is 00001100. a << 1 = 24 is 00011000, every bit up one position. a >> 2 = 3 is 00000011, the bits at positions 0 and 1 fell off.',
  });
  const x = 150;
  header(s, x, 28, POS8);
  s.text(x - 12, 28, 'position', { size: 17, tone: 'soft', anchor: 'end' });
  bitRow(s, x, 46, bitsOf(12), 'a = 12');
  bitRow(s, x, 46 + PITCH + 10, bitsOf(24), 'a << 1 = 24', { tone: 'green', note: 'every bit up one' });
  bitRow(s, x, 46 + 2 * PITCH + 20, bitsOf(3), 'a >> 2 = 3', { tone: 'green', note: 'positions 1..0 fell off' });
  s.save(__dirname, 'shifts');
}

// 3. n & (n - 1) clears the lowest set bit.
{
  const s = new Sketch({
    width: 620, height: 248, seed: 13,
    title: 'a & (a - 1) clears the lowest set bit of 12',
    desc: 'a = 12 is 00001100, a - 1 = 11 is 00001011: the lowest 1 of a (position 2) and everything below it flips. a & (a - 1) = 8 is 00001000: the lowest 1 cleared, positions 3 to 7 kept.',
  });
  const x = 170;
  header(s, x, 28, POS8);
  s.text(x - 12, 28, 'position', { size: 17, tone: 'soft', anchor: 'end' });
  bitRow(s, x, 46, bitsOf(12), 'a = 12');
  bitRow(s, x, 46 + PITCH, bitsOf(11), 'a − 1 = 11', { note: 'positions 2..0 flip' , noteTone: 'amber' });
  // Dashed amber frame around positions 2..0 in the a and a - 1 rows: the zone that flips.
  s.rect(x + 5 * CELL - 2, 40, 3 * CELL + 8, PITCH + CELL + 12, { tone: 'amber', dashed: true, width: 2.2 });
  s.line(x - 150, 46 + 2 * PITCH - 7 + 8, x + 8 * CELL + 10, 46 + 2 * PITCH - 7 + 8, { tone: 'soft', width: 1.2 });
  bitRow(s, x, 46 + 2 * PITCH + 16, bitsOf(8), 'a & (a−1) = 8', { tone: 'green', note: 'lowest 1 cleared' });
  s.text(x + 4 * CELL, 46 + 3 * PITCH + 30, 'positions 7..3 agree in a and a − 1, so AND keeps them', { size: 19, tone: 'soft' });
  s.save(__dirname, 'clear-lowest-bit');
}

// 4. n & -n isolates the lowest set bit.
{
  const s = new Sketch({
    width: 640, height: 236, seed: 14,
    title: 'a & -a keeps only the lowest set bit of 12',
    desc: 'a = 12 is 00001100 with 0s continuing to the left. -a = -12 is ~a + 1, 11110100 with 1s continuing to the left. a & -a = 4 is 00000100: only the lowest 1 survives.',
  });
  const x = 150;
  const labels = ['', ...POS8];
  header(s, x, 28, labels);
  s.text(x - 12, 28, 'position', { size: 17, tone: 'soft', anchor: 'end' });
  const row = (y, v, label, opts = {}) => {
    const lead = v < 0 ? '1…' : '0…';
    return bitRow(s, x, y, [lead, ...bitsOf(v)], label, { dim: [0], ...opts });
  };
  row(46, 12, 'a = 12');
  row(46 + PITCH, -12, '−a = −12', { note: '~a + 1' });
  s.line(x - 130, 46 + 2 * PITCH - 7 + 4, x + 9 * CELL + 10, 46 + 2 * PITCH - 7 + 4, { tone: 'soft', width: 1.2 });
  row(46 + 2 * PITCH + 10, 4, 'a & −a = 4', { tone: 'green', note: 'only the lowest 1' });
  s.text(x + CELL / 2, 46 + 3 * PITCH + 26, 'left cell: the pattern repeats forever', { size: 18, tone: 'soft', anchor: 'start' });
  s.save(__dirname, 'isolate-lowest-bit');
}

// 5. Two readings of one 32-bit pattern.
{
  const s = new Sketch({
    width: 640, height: 360, seed: 15,
    title: 'Unsigned and signed readings of the same 32-bit pattern',
    desc: '0x00000000 reads 0 both ways; 0x0000000C reads 12 both ways; 0x7FFFFFFF reads 2147483647 both ways (INT32_MAX); 0x80000000 reads 2147483648 unsigned and -2147483648 signed (INT32_MIN); 0xFFFFFFF4 reads 4294967284 unsigned and -12 signed; 0xFFFFFFFF reads 4294967295 unsigned and -1 signed.',
  });
  const rows = [
    ['pattern', 'unsigned', 'signed'],
    ['0x00000000', '0', '0'],
    ['0x0000000C', '12', '12'],
    ['0x7FFFFFFF', '2147483647', '2147483647'],
    ['0x80000000', '2147483648', '−2147483648'],
    ['0xFFFFFFF4', '4294967284', '−12'],
    ['0xFFFFFFFF', '4294967295', '−1'],
  ];
  const tones = {};
  [4, 5, 6].forEach(r => { tones[`${r},0`] = 'amber'; tones[`${r},2`] = 'amber'; });
  const g = s.grid(20, 30, rows, { cw: 150, ch: 44, header: true, tones, size: 21 });
  s.text(g.right + 14, g.cy(3), 'INT32_MAX', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(g.right + 14, g.cy(4), 'INT32_MIN', { size: 19, tone: 'soft', anchor: 'start' });
  s.text(20, g.bottom + 26, 'amber: bit 31 is set, so the signed reading is unsigned − 2^32', { size: 19, tone: 'amber', anchor: 'start' });
  s.save(__dirname, 'two-readings');
}

// 6. Cutting Python's -12 to 32 bits.
{
  const s = new Sketch({
    width: 660, height: 272, seed: 16,
    title: 'Masking Python -12 with 0xFFFFFFFF keeps positions 31 to 0',
    desc: 'Python -12 is an infinite tape: 1s at every position from 4 upward, then 0100. The mask 0xFFFFFFFF has 1s at positions 31 to 0 and 0s above. The AND keeps positions 31 to 0: 28 ones then 0100, which is 0xFFFFFFF4 = 4294967284.',
  });
  const x = 160;
  const labels = ['', '33', '32', '31', '30', '29', '', '3', '2', '1', '0'];
  header(s, x, 30, labels);
  s.text(x - 12, 30, 'position', { size: 17, tone: 'soft', anchor: 'end' });
  const E = '⋯';
  const py = ['…', 1, 1, 1, 1, 1, E, 0, 1, 0, 0];
  const mk = ['…', 0, 0, 1, 1, 1, E, 1, 1, 1, 1];
  const rs = ['', '', '', 1, 1, 1, E, 0, 1, 0, 0];
  const row = (y, vals, label, tone, dim) => {
    const tones = {};
    vals.forEach((v, i) => { if (v === 1 && !dim.includes(i)) tones[i] = tone; });
    return s.array(x, y, vals, { cell: CELL, indices: false, tones, dim, label, labelSize: 21, size: 22 });
  };
  row(48, py, 'Python −12', 'blue', [0, 6]);
  row(48 + PITCH, mk, '0xFFFFFFFF', 'violet', [0, 6]);
  s.line(x - 140, 48 + 2 * PITCH - 6, x + 11 * CELL + 10, 48 + 2 * PITCH - 6, { tone: 'soft', width: 1.2 });
  // Result row: only positions 31..0 exist after the cut.
  const ry = 48 + 2 * PITCH + 6;
  const r = s.array(x + 3 * CELL, ry, rs.slice(3), { cell: CELL, indices: false, tones: { 0: 'green', 1: 'green', 2: 'green', 5: 'green' }, dim: [3], size: 22 });
  s.text(x - 12, r.mid, '& result', { size: 21, tone: 'soft', anchor: 'end' });
  s.text(x + 1.5 * CELL, r.mid, 'cut away', { size: 19, tone: 'red' });
  s.span(r.left(0), r.right(7), r.bottom + 4, 'positions 31..0 kept: 0xFFFFFFF4 = 4294967284', { tone: 'green', size: 20 });
  s.save(__dirname, 'mask-32');
}
