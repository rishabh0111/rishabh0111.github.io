const fs = require('fs');
const p = 'logos/';
const order = ['typescript','nodejs','nestjs','nextjs','react','postgresql','redis','docker','python'];
const label = {typescript:'TypeScript',nodejs:'Node.js',nestjs:'NestJS',nextjs:'Next.js',react:'React',postgresql:'PostgreSQL',redis:'Redis',docker:'Docker',python:'Python'};
const tiles = order.map(k => {
  const svg = fs.readFileSync(p + k + '.svg', 'utf8').replace(/\n/g, '');
  return `<div class="tile" title="${label[k]}">${svg}</div>`;
}).join('\n      ');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  body {
    font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    background:#0b0f14; color:#e6edf3; overflow:hidden; position:relative;
  }
  .grid { position:absolute; inset:0;
    background-image:radial-gradient(circle at 1px 1px, rgba(120,150,180,0.13) 1px, transparent 0);
    background-size:40px 40px;
    -webkit-mask-image:linear-gradient(120deg, rgba(0,0,0,0.9), rgba(0,0,0,0.12)); }
  .glow { position:absolute; width:640px; height:640px; right:-170px; top:-230px;
    background:radial-gradient(circle, rgba(56,139,253,0.30), transparent 62%); }
  .frame { position:absolute; inset:44px; border:1px solid rgba(139,164,190,0.18); border-radius:18px; }
  .content { position:absolute; inset:44px; padding:64px 72px;
    display:flex; flex-direction:column; justify-content:space-between; }
  .top { display:flex; align-items:center; gap:15px; }
  .dot { width:13px; height:13px; border-radius:50%; background:#3fb950; box-shadow:0 0 14px #3fb95088; }
  .name { font-size:30px; font-weight:650; }
  .prompt { font-family:"SF Mono","JetBrains Mono","Consolas",ui-monospace,monospace;
    font-size:20px; color:#7d8ea3; margin-top:8px; }
  h1 { font-size:46px; line-height:1.2; font-weight:700; letter-spacing:-0.6px; max-width:1050px; }
  h1 .accent { color:#58a6ff; }
  .logos { display:flex; gap:16px; }
  .tile { width:62px; height:62px; border-radius:14px; background:#f2f4f8;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 1px 0 rgba(255,255,255,0.06) inset, 0 6px 16px rgba(0,0,0,0.35); }
  .tile svg { width:38px; height:38px; display:block; }
  .foot { display:flex; align-items:baseline; justify-content:space-between; }
  .url { font-size:23px; font-weight:600; }
  .tag { font-size:19px; color:#7d8ea3; }
</style></head><body>
  <div class="grid"></div><div class="glow"></div><div class="frame"></div>
  <div class="content">
    <div>
      <div class="top"><span class="dot"></span><span class="name">Rishabh Sharma</span></div>
      <div class="prompt">~ engineer &middot; AI agents, backends, full-stack product</div>
    </div>
    <h1>Deep-dives on the systems I build.<br><span class="accent">Architecture, tradeoffs, and the hard parts.</span></h1>
    <div class="logos">
      ${tiles}
    </div>
    <div class="foot"><span class="url">rishabh0111.github.io</span><span class="tag">write-ups &middot; systems &middot; post-mortems</span></div>
  </div>
</body></html>`;
fs.writeFileSync('og-card.html', html);
console.log('wrote og-card.html', html.length, 'bytes');
