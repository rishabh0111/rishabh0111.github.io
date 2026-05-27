# og-card

Source for the previous social share card. The live card is now
`/assets/img/og-card.jpg` (`og:image` / `twitter:image`, set site-wide via
`_config.yml` `defaults`), a supplied image padded with black to 1200x630;
this template no longer produces it.

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
