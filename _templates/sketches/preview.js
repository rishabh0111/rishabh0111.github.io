// Render sketches to PNG, light and dark side by side, for checking by eye.
//   node preview.js <file.svg | folder> [...]   → _preview/sketches/<folder>/<name>.png
// Uses the SKETCHES block of assets/css/style.css, so what you see is what the
// site shows. Needs Chrome (CHROME env var, or the default Windows/macOS/Linux path).
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const css = fs.readFileSync(path.join(ROOT, 'assets/css/style.css'), 'utf8');
const block = css.slice(css.indexOf('/* ── SKETCHES'), css.indexOf('/* ── /SKETCHES ── */'));

const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(p => fs.existsSync(p));

const files = process.argv.slice(2).flatMap(a => {
  const p = path.resolve(a);
  return fs.statSync(p).isDirectory()
    ? fs.readdirSync(p).filter(f => f.endsWith('.svg')).map(f => path.join(p, f))
    : [p];
});
if (!files.length) { console.error('usage: node preview.js <svg|folder> ...'); process.exit(1); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  for (const f of files) {
    const svg = fs.readFileSync(f, 'utf8');
    const w = +(svg.match(/width="(\d+)"/) || [0, 640])[1];
    const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap" rel="stylesheet">
<style>
  :root { --text:#2E3440; --text-3:#5E6A83; --bg:#ECEFF4; --border:#D8DEE9; --accent:#1E768F; }
  ${block}
  body { margin:0; display:flex; gap:0; font-family:sans-serif; }
  .pane { padding:24px; width:${w}px; }
  .light { background:#ECEFF4; }
  .dark  { background:#2E3440; }
</style></head><body>
<div class="pane light"><figure class="sketch" style="margin:0">${svg}</figure></div>
<div class="pane dark" data-theme="dark"><figure class="sketch" style="margin:0">${svg}</figure></div>
</body></html>`;
    // The dark pane needs the dark tokens; scope them to .dark.
    const darkVars = block.match(/:root\[data-theme="dark"\] \{([^}]*)\}/)[1];
    await page.setViewport({ width: (w + 48) * 2, height: 400, deviceScaleFactor: 1.5 });
    await page.setContent(html.replace('</style>', `.dark { --text:#ECEFF4; --text-3:#A6B2CA; --sk-ink:#ECEFF4; --sk-soft:#A6B2CA; ${darkVars} }</style>`), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(ROOT, '_preview', 'sketches', path.basename(path.dirname(f)));
    fs.mkdirSync(out, { recursive: true });
    const png = path.join(out, path.basename(f, '.svg') + '.png');
    const body = await page.$('body');
    await body.screenshot({ path: png });
    console.log(png);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
