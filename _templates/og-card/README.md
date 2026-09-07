# og-card

Source for `/assets/img/og-card.png` — the single social share image
(`og:image` / `twitter:image`) used site-wide via `_config.yml` `defaults`.

`og-card.html` is self-contained (logo SVGs inlined). To regenerate after an edit:

```sh
# edit build_card.js (text, layout) then rebuild the HTML:
node build_card.js

# render to PNG at 1200x630 with headless Chrome:
chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 \
  --screenshot=../../assets/img/og-card.png "file:///$(pwd -W)/og-card.html"
```

`logos/` holds the devicon SVGs (TypeScript, Node.js, NestJS, Next.js, React,
PostgreSQL, Redis, Docker, Python). `_templates/` is excluded from the Jekyll build.
