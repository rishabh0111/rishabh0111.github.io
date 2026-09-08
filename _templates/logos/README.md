# Tech marks

`assets/img/logos/tech/` holds one SVG per brand the site names, plus
`_data/tech_logos.json` mapping the display string used in `index.md` to its
file. It lives in `_data/` because that is where Jekyll reads it from, so the
layout can look a mark up by name.

**Sources**, in order of preference:

1. **[devicon](https://devicon.dev)** (MIT) — real multi-colour marks. Python
   comes out blue *and* yellow, React in its own cyan. 45 of the 64 marks come
   from here, including AWS, Azure and Playwright, which Simple Icons removed at
   the owners' request.
2. **[simple-icons](https://github.com/simple-icons/simple-icons)** (CC0) —
   single-path marks carrying one official brand colour, used for the 19 names
   devicon has nothing for. The hex is written into the file as a `fill`, so
   they are coloured too — just one colour, because that is all the source has.

Either way the marks remain the property of their owners and are used
nominatively, to label a technology this site says it uses — the same basis on
which a CV lists them.

## Regenerating

```
cd _templates/logos
npm pack devicon      && tar -xzf devicon-*.tgz      && mv package devicon
npm pack simple-icons && tar -xzf simple-icons-*.tgz && mv package simple
cd ../.. && python _templates/logos/build_logos.py
```

The 158 MB of source packages are gitignored; only the ~64 marks index.md names
are committed (434 KB). The script reads `index.md`, so adding a skill and
re-running is all that is needed to pull its mark in.

## The two lists that make this safe

`build_logos.py` holds `DEVICON_ALIAS` and `SIMPLE_ALIAS` (the name in
`index.md` → the folder or slug in each source, for the cases the automatic
lookup misses — `Node.js` → `nodejs`, `MCP` → `modelcontextprotocol`,
`Postgres RLS` → `postgresql`) and `NO_MARK_REASON` (why a name will never get
one).

**A name in neither list fails the build.** That is deliberate: without it, a
missing mark is indistinguishable from a mark nobody got round to, and the grid
quietly degrades. Eight names were caught this way on the first run.

Two reasons a name has no mark, and both are honest:

- **It isn't a brand.** `RAG`, `Outbox pattern`, `Idempotency`, `Schema design`,
  `SQL`, `CEH v11` never had a logo.
- **The owner had it withdrawn.** AWS, Azure, Slack, OpenAI, Microsoft Graph and
  Playwright were all removed from Simple Icons at the trademark holder's
  request. Sourcing them from elsewhere would be going around a decision the
  owner made on purpose, so the site doesn't.

Either way the skill still renders — as an initialled badge in the same cell
shape, so the grid stays even and nothing is dropped for lacking a logo. What
never happens is a drawn substitute.

## How they are painted

Plain `<img>`:

```html
<img class="tech-ic" src="/assets/img/logos/tech/python.svg" alt="">
```

An earlier version used a CSS mask over `background-color: currentColor`. That
is why the icons were monochrome — a mask paints exactly one colour by
definition, and it discards the gradients and multiple fills a devicon mark
carries. Rendering the SVG as an image keeps all of it.

## Company logos

Not from Simple Icons — neither employer is in it. These came from the companies'
own sites and are used nominatively, to say where the work was done.

| File | Source | Why that shape |
| --- | --- | --- |
| `kleeto.light.png` · `kleeto.dark.png` | `kleeto.in/images/logo.png` and `logo-white.png` | A wordmark. The colour version disappears on the dark theme and the white one on the light, so it ships as a pair |
| `zeonix.png` | `zeonixglobal.com` app icon | A square icon that reads on either ground, so one file does |

The Kleeto colour mark arrived on an opaque white box, which showed as a pale
rectangle against the card. The background is flood-filled from the border
inward — never a blanket "make white transparent", which would punch holes
through the mark's own light pixels.

In `index.md`, `logo:` is the mark and `logo_dark:` is the optional second
version. **Only set `logo_dark` when a mark genuinely needs it.** The layout adds
the theme-swap class only when a dark counterpart exists, because tagging a lone
mark with it hides that mark on the dark theme and leaves an empty plate. That is
exactly the bug that shipped here first.

With no `logo` at all, the row renders the company's initial. That is a designed
state, matching the initialled badges in the toolkit — not a broken image.
