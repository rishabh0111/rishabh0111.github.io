# sketches

Hand-drawn figures for blog posts: rough.js wobble, hatched fills, Caveat
lettering, inline SVG whose colours are CSS classes so they follow the light/dark
toggle (the `SKETCHES` block at the end of `assets/css/style.css`).

```
_templates/sketches/
  sketch.js                 the drawing vocabulary (below)
  preview.js                render SVGs to PNG, light and dark side by side
  <folder>/figures.js       one spec per post or series part
_includes/sketches/<folder>/<name>.svg   the output, committed
```

Setup once: `npm i` here (roughjs, puppeteer-core; Chrome must be installed).

Build and check a post's figures:

```
node _templates/sketches/<folder>/figures.js
node _templates/sketches/preview.js _includes/sketches/<folder>   # → _preview/sketches/<folder>/*.png
```

Embed in a post, on one line (kramdown treats it as one HTML block):

```html
<figure class="sketch">{% include sketches/<folder>/<name>.svg %}<figcaption>What the figure shows.</figcaption></figure>
```

## Vocabulary

```js
const { Sketch } = require('../sketch');
const s = new Sketch({ width: 560, height: 190, title: 'Required, read by screen readers', desc: 'optional' });
s.save(__dirname, 'name');
```

Tones: `ink` (default), `soft` (muted), `blue`, `violet`, `green`, `cyan`, `amber`, `red`.
Fills: `fill: 'hachure'` (default when a tone is given to a box/node), `'solid'`, `'dots'`, `'cross'`.

| Call | Draws | Returns |
| --- | --- | --- |
| `text(x, y, str, {size, tone, anchor, weight, rotate})` | handwritten label, vertically centred on y | `{width}` |
| `rect(x, y, w, h, {tone, fill, label, dashed})` | box | edges and centre |
| `circle(cx, cy, d, {tone, fill, label})`, `ellipse(cx, cy, w, h, …)` | round shapes | centre |
| `line(x1, y1, x2, y2, {tone, dashed, width})` | line | |
| `path([[x,y],…], {smooth, tone})` | freehand curve / polyline | |
| `arrow(x1, y1, x2, y2, {bend, head, label, tone, dashed})` | arrow; `bend` curves it; `head`: end, start, both, none | |
| `highlight(x, y, w, h, {tone})` | highlighter swipe (amber by default) | |
| `span(x1, x2, y, label, {side, tone})` | brace under/over a range, e.g. a window | |
| `array(x, y, values, {cell, tones: {i: tone}, dim: [i], indices, startIndex, label})` | row of cells with indices | `cx(i)`, `left(i)`, `right(i)`, `top`, `bottom`, `mid` |
| `pointer(x, y, label, {dir, tone, len})` | arrow pointing at (x, y) from below (`up`) or above (`down`) | |
| `grid(x, y, rows, {cw, ch, tones: {"r,c": tone}, rowLabels, colLabels, dim})` | table / DP grid / matrix | `cx(c)`, `cy(r)`, `right`, `bottom` |
| `stack(x, yBottom, items, {w, h, tones, label})` | LIFO stack, items[0] at the bottom | `top`, `cx` |
| `node(cx, cy, label, {r, tone})` + `edge(a, b, {directed, bend, label, dashed})` | graphs and trees | node: `{cx, cy, r}` |
| `box(cx, cy, 'multi\nline', {tone, w, h})` + `connect(a, b, {label, bend, dashed})` | flow / state diagrams | box edges |

Rules of thumb: widths 420–680; labels 18–24px; one idea per figure; colour means
something (say what in the caption or prose); always look at the preview in both
themes before committing.
