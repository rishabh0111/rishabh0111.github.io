# rishabh0111.github.io

Personal site built with Jekyll on GitHub Pages.

- **Home** (`index.md`) — the whole portfolio, all of it in the front matter.
  Rendered by `_layouts/home.html` as a *dossier*: a sticky label column on the
  left and content on the right, one width top to bottom. See below.
- **Blog** (`/blogs/`) — original long-form articles, standalone or grouped into a series.
- **News** (`/news/`) — bi-weekly annotated-reading digests.

Most of this file documents the format every file in `_posts/` must follow, so the
layouts render it correctly. It is listed under `exclude:` in `_config.yml`, so it is
never built or served — safe to keep at the repo root.

---

## The home page

Everything the page shows lives in `index.md`'s front matter; the body is empty.
To change the page, change that file.

| Key | What it becomes |
| --- | --- |
| `profile.name` / `.surname` / `.role` / `.avatar` | The hero (name, eyebrow, portrait) |
| `profile.tagline`, `profile.status` | **About** — the standfirst line and the "now" line (moved out of the hero) |
| `links` | The link pills, in the hero and the closing plane |
| `metrics` | The four-figure stat band |
| `pillars` | **About** — the three claims, right column |
| `about` | **About** — the essay |
| `projects` | **Projects** — one section, however many entries. Each has `promise` (a pull quote), `glance` (a table), `shots`, optional `parts` (rendered as cards), and `links` |
| `projects_small` | Smaller ones, a line each |
| `experience` | **Experience**, with `ventures` nested |
| `skills` | **Toolkit** — a logo grid |
| `education`, `certifications`, `awards`, `resources` | **Credentials** |
| `contact` | The closing plane |

Two conventions worth knowing:

- **`promise`** is the one sentence a system makes and never violates — the same
  device the webhook write-up opens with. It is the hook; the blog post carries
  the argument. Keep it to a sentence.
- **`shots`** need a `src`. Add `src_dark` **only** if the image is unreadable on
  the dark theme — a screenshot of a light UI usually is not. A lone image gets
  no theme class; tagging it would hide it on the dark theme and leave a gap.
  Same rule as `logo` / `logo_dark` in `experience`.
- **`parts`** turns a project into cards, one per separable piece. Nivara Desk
  uses it for its AI layer, API and front ends.

Adding a project means adding to `projects:` — the layout does not change.

### Home page effects

The home page has two GPU/canvas touches, in `assets/js/` (loaded `defer`, home only):

- `assets/js/home-fx.js` — the hero name as particles, plus the page-wide bubble init.
- `assets/js/vendor/canvas-ui-bubble.js` — the [Canvas UI](https://github.com/DavidHDev/canvas-ui)
  `Bubble` effect, vendored and compiled to a plain script. Rebuild with
  `_templates/canvas-ui/build.sh` (needs Node + npx; esbuild is fetched on demand). The two
  TypeScript source files it bundles are checked in next to that script.

Both are progressive enhancement — with JS off, `prefers-reduced-motion`, or no WebGL2, the
plain hero and page render unchanged. Append `?fxsnap` to the home URL to skip the name's
intro animation and draw it settled (useful for screenshots).

### Tech marks

Strings in any `stack:` list, and every item under `skills:`, are looked up in
`_data/tech_logos.json` to find a brand mark. A name with no mark renders as an
initialled badge — deliberately, not as a fallback. After adding a tool, run:

```
python _templates/logos/build_logos.py
```

See `_templates/logos/README.md` for where the marks come from, why some names
will never have one, and why the script fails rather than silently skipping a
name it does not recognise.

---

## Where posts live

```
_posts/
  blogs/YYYY-MM-DD-slug.md     → a blog post
  news/YYYY-MM-DD-slug.md      → a news digest
```

Rules:

- The **subfolder decides the category**. `_posts/blogs/…` → category `blogs`;
  `_posts/news/…` → category `news`. The layouts, listings, breadcrumb, prev/next and
  related-posts band all key off that category.
- The filename **must** start with `YYYY-MM-DD-`. Jekyll refuses to build a post otherwise.
- The date in the filename should match the `date:` in the front matter.
- `slug` becomes the URL slug for news; blogs set their URL explicitly via `permalink:`.
- `future: true` is set in `_config.yml`, so a post dated in the future still builds and
  publishes immediately.

---

## Front matter — every post

All posts use `layout: post`. YAML front matter, fenced by `---`.

| Key | Required | Type | Notes |
| --- | --- | --- | --- |
| `layout` | yes | string | Always `post`. |
| `title` | yes | string | Quote it. Used as `<h1>`, `<title>`, breadcrumb, listings, prev/next. |
| `date` | yes | datetime | `YYYY-MM-DD HH:MM:SS +0530`. Blogs use `09:00:00`, news digests use `00:00:00` by convention. Timezone is `Asia/Kolkata`. |
| `categories` | yes | string | `blogs` or `news`. Matches the subfolder. Keep it explicit even though the folder also sets it. |
| `tags` | recommended | list | `[a, b, c]`. Shown as pills: 3 max in the blog list, 4 max in the news list, all of them at the foot of the article. |
| `read_time` | recommended | integer | Minutes, written by hand. Renders as "N min read" and "N min" in listings. Omit and the field just disappears. |
| `excerpt` | see below | string | One or two sentences. Overrides Jekyll's auto-excerpt. |

`excerpt` behaviour:

- **Blog** — optional. Shows under the title in the post header. Not shown in the blog list.
- **News** — effectively required. Shows in the post header **and** as the summary line in
  the news list (truncated to ~120 chars there), so write it as a real standalone summary.

---

## Blog posts

### Standalone blog post

```yaml
---
layout: post
title: "A short, specific title for the post"
date: 2026-01-15 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [topic-one, topic-two, topic-three]
read_time: 12
permalink: /blogs/post-slug/
excerpt: "One or two sentences that state what the piece is about and why it is worth reading."
---
```

Blog-only keys:

| Key | Required | Type | Notes |
| --- | --- | --- | --- |
| `permalink` | yes (convention) | string | `/blogs/<slug>/` with the trailing slash. Every blog post sets this so the URL is clean and stable regardless of date. |
| `author` | optional | string | Renders in the meta line before the date. Omit to drop it. |

### Series blog post (multi-part)

A series is just a set of blog posts that share a `series:` value. Presence of `series:`
turns on the left-hand "parts" rail, adds a series pill to the breadcrumb, and groups the
posts under a "Series" heading (above the standalone posts) on the blog index.

```yaml
---
layout: post
title: "Part Two: the sub-topic this instalment covers"
date: 2026-02-03 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [series-topic, sub-topic, series]
read_time: 9
permalink: /blogs/series-topic-part-two/
excerpt: "A standalone summary of this part — it should make sense without having read the others."
series: "The Series Name"
series_order: 2
series_total: 7
---
```

Series keys:

| Key | Required | Type | Notes |
| --- | --- | --- | --- |
| `series` | yes | string | The series name. Must be **byte-identical** across every part — it is the join key. |
| `series_order` | yes | integer | Part number. Drives sort order in the rail and the "Part N of M" label. |
| `series_total` | recommended | integer | Planned number of parts. Without it, the count falls back to the number of parts **already published**, so a series that is still coming out reads "Part 2 of 2" instead of "Part 2 of 7". Set it on every part while the series is in progress. |

Notes:

- Give the tag list a `series` tag by convention (the old posts do).
- Parts are ordered by `series_order`, not by date, in the rail — but keep dates ascending
  anyway so prev/next and the index year-grouping stay sane.
- Cross-link parts in the body by hand: `Next: [Part Three title](/blogs/series-topic-part-three/)`.

---

## News digests

```yaml
---
layout: post
title: "The headline theme of this digest window"
date: 2026-01-19 00:00:00 +0530
categories: news
tags: [digest, topic-one, topic-two, topic-three]
read_time: 6
excerpt: "A real standalone summary of the digest — the two or three threads it pulls together, written so it reads well on its own in the news list."
---
```

News-specific:

| Key | Required | Type | Notes |
| --- | --- | --- | --- |
| `source` | optional | string | Renders as "via {source}" in the meta line. Use it when the digest is built around one publication. |
| `permalink` | optional | string | Usually omitted. Jekyll then serves it at `/news/YYYY/MM/DD/slug.html`. Set `permalink: /news/<slug>/` if you want a clean URL. |
| `author` | — | — | Not used on news. Leave it out. |

Conventions the existing digests follow (not enforced, but the layout and tone assume them):

- `tags` starts with `digest`.
- The body opens with a one-paragraph framing of the window, then `---`.
- Each item is an `## Heading`, a paragraph or two, then bolded takeaway lines
  (`**Why it matters:**`, `**If you're building X:**`).
- Closing sections: `## Elsewhere worth a click` (bullet list) and
  `## One to read this weekend` (a single link + why).

---

## Writing the body

Markdown is **kramdown** with GFM input and **Rouge** highlighting (`_config.yml`).

### Headings and the table of contents

- Use `##` and `###` only. `#` is the title (front matter). `####` exists but is tiny.
- The right-hand "In this article" TOC is generated from the `##`/`###` in the body.
  It only appears when there are **2 or more** headings; otherwise the card hides itself.
- Every `##` automatically gets a decorative `§` marker to its left via CSS. **Do not type
  it.** (If you ever do, the TOC strips a leading `§ ` from the entry text.)

### Code

Fenced blocks with a language tag get highlighted:

    ```js
    const result = await client.send(payload);
    ```

Line numbers are off globally.

### Mermaid diagrams

A ```` ```mermaid ```` fence renders as a live, **theme-aware** diagram. `mermaid@10` is
loaded only on pages that contain such a fence. The diagram re-renders when the reader
flips the light/dark toggle.

```mermaid
flowchart TD
    Client([Client]) -->|request| API[API layer]
    API -->|write| DB[(Database)]
    API -->|enqueue| Queue[(Queue)]
    Queue --> Worker[Background worker]
    Worker -->|deliver| Target([External target])
    classDef actor   fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A,stroke-width:2px
    classDef gateway fill:#EDE9FE,stroke:#7C3AED,color:#4C1D95,stroke-width:2px
    classDef service fill:#D1FAE5,stroke:#059669,color:#065F46,stroke-width:2px
    classDef store   fill:#CFFAFE,stroke:#0891B2,color:#164E63,stroke-width:2px
    class Client,Target actor
    class API gateway
    class Worker service
    class Queue,DB store
```

How the theming works — worth understanding so diagrams don't come out mis-coloured:

- **Flowcharts**: colour nodes by giving them a `classDef` **role**, then `class Node role`.
  The site recognises these role names and rewrites their colours per theme:

  | Role | Intended meaning |
  | --- | --- |
  | `actor` | external client / person / target |
  | `gateway` | API / entry point |
  | `service` | worker or background job |
  | `store` | database, queue, cache |
  | `flow` | plain process step |
  | `warn` | decision / caution |
  | `ok` | success terminal state |
  | `error` | failure / dead state |

  Write the light-mode colours in the `classDef` (as above); the dark-mode equivalents are
  substituted automatically. A `classDef` with any **other** name is left exactly as you
  wrote it — and will therefore look wrong on one of the two themes, so stick to the roles.

- **Sequence diagrams**: no `classDef` needed. Actors, signals, notes and activation bars
  are themed automatically from the same palette.

- Any `%%{init: …}%%` directive in the diagram source is **stripped** before rendering, so
  a baked-in theme can't override the page theme. Don't rely on one.

### Images

- Put files in `assets/img/`. Reference with `![alt](/assets/img/foo.png)`.
- Any image or mermaid diagram in the article body opens in a zoom/pan lightbox when
  clicked — unless the image is wrapped in a link, in which case the link wins.
- `figure` / `figcaption` are styled (centred, small caption).

### Tables and blockquotes

Both are styled. Blockquotes are used for the load-bearing one-liner / pull-quote.
Tables get striped rows; keep them narrow — they scroll on mobile but wide tables are ugly.

### Horizontal rules

`---` renders as a centred dot separator. Used liberally between sections.

---

## Build and publish

- Push to `master`. GitHub Pages builds with the plugins in `_config.yml`
  (`jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`) — all natively supported.
- `_config.yml` `exclude:` keeps `README.md`, `Gemfile*`, `vendor`, `dump`,
  `_templates` and `_preview` out of the build. Anything private belongs outside
  this directory entirely — the repo is public, so an ignore rule is a weaker
  guarantee than the file simply not being here.
- `_site/` is the build output — never edit it, never commit changes to it by hand.

### Local preview

```
bundle install                                   # first time only
bundle exec jekyll serve --port 4001 --watch     # http://127.0.0.1:4001/
```

Add `--future` if you're testing a future-dated post and have overridden the
config. `--incremental` speeds up rebuilds but occasionally misses a change to a
layout — drop it if a save doesn't show up.

The `Gemfile` uses the **`github-pages`** gem rather than plain `jekyll`, so the
local build is Jekyll 3.10 — the version Pages actually runs. Installing
`jekyll` on its own would give you Jekyll 4, which differs in enough small ways
that a green local build would not prove much.

On Windows this needs **Ruby with DevKit** (MSYS2), because several gems compile
native extensions:

```
winget install RubyInstallerTeam.RubyWithDevKit.3.2
```

`vendor/`, `.bundle/` and `Gemfile.lock` are gitignored — GitHub Pages resolves
its own versions and ignores a committed lockfile anyway.

## Quick checklist for a new post

- [ ] File in `_posts/blogs/` or `_posts/news/`, named `YYYY-MM-DD-slug.md`
- [ ] `layout: post`, `title`, `date`, `categories` set
- [ ] `tags`, `read_time`, `excerpt` filled in (excerpt mandatory for news)
- [ ] Blog: `permalink: /blogs/<slug>/`
- [ ] Series part: `series`, `series_order`, and `series_total` while the series is in progress
- [ ] Headings are `##` / `###`; no hand-typed `§`
- [ ] Mermaid diagrams use the role names from the table above
- [ ] Images in `assets/img/`
