---
# ═════════════════════════════════════════════════════════════════
#  HOME: all of the page's content lives in this front matter.
#  _layouts/home.html renders it as full-width rows, one content
#  column, alternating between the open scene and a tinted band so
#  each section is visibly its own. A left-margin rail names the
#  section you are reading (a compact heading stands in for it on
#  narrow screens).
#
#  Each section is a different component, so the page reads at a
#  glance before any of it is read: About is three spotlight tiles,
#  Projects a band of poster cards, Experience a timeline, Toolkit a
#  band of edge-to-edge logo loops, Writing a dated list, Credentials
#  two panels of rows. The prose for each thing sits behind a fold.
#
#  Bullet strings accept inline Markdown (**bold**, `code`, [links](#)).
#  Stack strings are matched against _data/tech_logos.json to pick a
#  brand mark; a name with no mark renders as initials, on purpose.
#  Adding a tool? Add it here, then re-run:
#      python _templates/logos/build_logos.py
#
#  To change the page, change this file.
# ═════════════════════════════════════════════════════════════════
layout: home
title: Rishabh Sharma
description: >-
  AI engineer. Four AI systems shipped at Kleeto since May 2026, three of them
  in production, plus the backends and infrastructure under them, measured
  with tests, benchmarks and real-cloud runs.
permalink: /

profile:
  name:      Rishabh
  surname:   Sharma
  role:      AI · Backend · Infrastructure
  location:  Gurugram, India
  avatar:    /assets/img/home/profile.jpg
  avatar_caption: Gurugram, 2026
  status:    Shipping AI at Kleeto · 4 systems since May 2026
  tagline: >-
    I ship **AI systems to production**, along with the backends and
    infrastructure under them, and I measure them before I trust them. I
    trained in security, so I ask how something breaks before I ask when it
    ships.

# Home-only links, shown after the social links in _data/social.yml.
links:
  - { label: Writing,  url: "/blogs/",                              icon: pen }

# ── Pillars: the three claims, shown inside "About" as icon tiles ─
# Three claims, and only three. More would dilute each one. `icon`
# is the tile's mark (see _includes/icon.html for the names).
# "Full-stack" is deliberately not a pillar: it is evidence inside
# the work below, where it is more convincing than as a claim.
pillars:
  - title: AI that real people use
    icon:  spark
    body: >-
      Four AI systems at Kleeto since May 2026: an HR assistant for 500+
      employees, document checks on 5,500 files a month, ID masking on 30,000
      documents, and a voice presenter piloting with three customers.
  - title: Security built in, not added later
    icon:  shield
    body: >-
      A security degree and a CEH certificate, used on design rather than
      audits. I prefer making a mistake impossible over writing a rule that
      asks people not to make it.
  - title: Systems that prove their guarantees
    icon:  server
    body: >-
      In Python, TypeScript and Java, every promise has a test or a benchmark
      behind it. The durability test on my webhook engine found the durability
      bug; after the fix, a Redis wipe lost 0 of 50,000 events.

# ── Metrics ──────────────────────────────────────────────────────
# Deliberately one per pillar, plus the track record. Rendered as
# four tiles in the first band; the number in each `figure` counts
# up on scroll, and whatever surrounds it ("+", "%") stays put.
metrics:
  - { figure: "4",     label: AI systems shipped at Kleeto since May 2026 }
  - { figure: "500+",  label: employees using the HR assistant }
  - { figure: "0",     label: attempts to trick the AI that worked }
  - { figure: "$3.32", label: for 12 hours on real AWS Kubernetes }

# ═════════════════════════════════════════════════════════════════
#  PROJECTS: one list, however many entries, and no ranking: a
#  weekend repo and a flagship get the same card. Add a project here
#  and the grid makes room; nothing in _layouts/home.html changes.
#  Four show at once; from the fifth on, an "All N projects" button
#  reveals the rest in place, so ten projects is still one grid.
#
#  Every project is a card in a two-across grid, top to bottom:
#  `shots` as the cover (one at a time, dots to page; with no shots
#  a plate with the name's initial stands in) → heading → `blurb` →
#  `stack` chips (or the `parts` as chips) → `links` → the write-up
#  folded behind "The full write-up" (`promise`, `body`, `points`,
#  `glance`, `parts` as cards). Same shape whatever it has to say.
#
#  `promise` is the one sentence the thing guarantees. It renders as
#            the pull quote, so keep it to a sentence.
#  `body` / `points` carry the results. Follow the resume framing:
#            accomplished [X] as measured by [Y] by doing [Z]. Put the
#            numbers in the sentence, not in a separate stat strip.
#  `glance`  is the summary table.
#  `shots`   need `src`; add `src_dark` only if the image is unreadable
#            on the dark theme.
#  `parts`   are the separable pieces of a bigger project, one card each.
# ═════════════════════════════════════════════════════════════════
projects:
  - name:     Nivara Desk
    year:     "2026"
    kind:     Flagship
    blurb:    A help desk that many companies share, where the AI answers only when it should
    languages: [Python, TypeScript]

    promise: >-
      Four ways to log in, one set of rules, so *"is this person allowed to see
      this ticket?"* has the same answer everywhere.

    body: >-
      Someone asks a question from a chat box on their supplier's website. It
      becomes a real ticket in the support queue with a response clock running.
      The AI answers if it is confident; otherwise a person picks it up.

    shots:
      - { src: /assets/img/home/projects/nivara/queue.light.png,       src_dark: /assets/img/home/projects/nivara/queue.dark.png,       alt: "Support queue with response clocks",  caption: "The support queue" }
      - { src: /assets/img/home/projects/nivara/ticket.light.png,      src_dark: /assets/img/home/projects/nivara/ticket.dark.png,      alt: "A ticket showing the AI's answer",    caption: "One ticket, and how the AI answered it" }
      - { src: /assets/img/home/projects/nivara/widget.host.light.png, src_dark: /assets/img/home/projects/nivara/widget.host.dark.png, alt: "Chat widget on another company's page", caption: "The chat box, on someone else's site" }
      - { src: /assets/img/home/projects/nivara/analytics.light.png,   src_dark: /assets/img/home/projects/nivara/analytics.dark.png,   alt: "Analytics dashboard",                 caption: "Analytics, behind its own permission" }

    glance:
      - { k: Guarantee, v: "One company can never see another's data; the database enforces it, not the code" }
      - { k: Built with, v: "Postgres row-level security · a trained answer gate · replayable tests" }
      - { k: Size,      v: "4 apps · 3 services · 18 permissions · 550 labelled test questions" }
      - { k: Runs on,   v: "Free hosting, and `docker compose up` with no API keys" }

    parts:
      - id:    ai
        label: AI layer
        lang:  Python
        stack: [FastAPI, Hybrid RAG, Qdrant, MCP, Langfuse, pytest]
        blog:  /blogs/mcp-tool-surface-as-the-guardrail/
        promise: >-
          Anything the model writes on its own can never reach a customer.
        points:
          - >-
            Made the right call on **93.6% of 600 recorded tickets** (595 of
            600) by routing every answer through a trained gate that decides
            when to reply, when to ask, and when to fetch a human. Money
            questions always go to a human.
          - >-
            Put the right document first **94.2% of the time** with hybrid
            retrieval over Qdrant, and every reply is built from one of those
            real documents, so a made-up answer is **impossible rather than
            unlikely**. **No attempt to trick it has worked**, and the attacks
            re-run on every change.
          - >-
            Held wrongful escalations to **6.8%** with zero wrong answers on
            money questions, and kept the full eval **free to re-run ($0)** by
            recording model responses once and replaying them. One automated
            grader agreed with people too rarely (κ = 0.14), so its score was
            dropped rather than published.
          - >-
            Cut model cost **26–39% on 8 of 13 kinds of question** with no drop
            in accuracy, by sending each question to the cheapest model that
            answers it well and falling back down a chain that ends in a person.
          - >-
            Found and fixed a **ranking leak between companies** inside the
            search engine, and pinned it with a test so it cannot come back.

      - id:    api
        label: API
        lang:  TypeScript
        stack: [NestJS, Prisma, PostgreSQL RLS, PgBouncer, Socket.IO, Redis]
        blog:  /blogs/postgres-rls-multitenancy/
        promise: >-
          Forget the company filter on a query and you get nothing back, never
          someone else's data.
        points:
          - >-
            Postgres itself blocks the rows, so a mistake in the code cannot leak
            them. Asking for another company's ticket returns **404, not 403**;
            saying "forbidden" would confirm the ticket exists.

      - id:    web
        label: Front ends
        lang:  TypeScript
        stack: [Next.js 15, React 19, Tailwind v4, TanStack, Shadow DOM, Playwright]
        promise: >-
          Every screenshot above was taken from the running app by a script.
        points:
          - >-
            Four apps share one codebase: the agent dashboard, the customer
            portal, the analytics view, and a chat box that drops into any
            website **under 60 KB** without picking up that site's styling.

    links:
      - { label: Live app, icon: external, url: "https://nivara-web-nextjs.vercel.app/dashboard" }
      - { label: Product,  icon: external, url: "https://nivara-landing-iota.vercel.app" }
      - { label: API docs, icon: external, url: "https://nivara-api-nestjs.onrender.com/docs" }
      - { label: Chat box, icon: external, url: "https://rishabh0111.github.io/nivara-web-nextjs/" }
      - { label: Source,   icon: github,   url: "https://github.com/rishabh0111?tab=repositories&q=nivara" }
      - { label: Write-up, icon: pen,      url: "/blogs/postgres-rls-multitenancy/" }

  - name:     Nostro
    year:     "2026"
    kind:     Systems
    blurb:    A ledger for many companies where money cannot go missing
    languages: [Java]

    promise: >-
      An entry that doesn't balance, arrives twice, or touches another
      company's money cannot be recorded. The database refuses it.

    body: >-
      A double-entry ledger API for many tenants on one deployment, split into
      three Spring Boot services. Every guarantee in the README names the test
      that proves it, and CI ticks that table on every push.

    glance:
      - { k: Guarantee, v: "Every entry sums to zero, is recorded once, and stays inside its own tenant" }
      - { k: Built with, v: "Transactional outbox · Kafka relay · gRPC read model · Postgres row-level security" }
      - { k: Size,      v: "3 services · 211 tests · 16 decision records" }
      - { k: Runs on,   v: "`docker compose up`, which seeds two tenants and prints their keys" }

    points:
      - >-
        **211 tests (127 against real Postgres, Kafka and Redis)** prove the
        guarantees in a **3-minute** CI run: 40 writers on one account,
        opposite-order writers, concurrent duplicates, and killing the relay's
        leader mid-stream.
      - >-
        Load-tested a hot account: **half the throughput and 2.3× the p99** on
        one account versus 64, with **zero database errors** either way. Every
        refusal was the balance floor, answered as a clean 422.
      - >-
        Failure cases are **sealed types**, so a failure nobody handled is a
        compile error, not a 500 in production.

    stack: [Java, Spring Boot, Kafka, gRPC, PostgreSQL, Testcontainers]
    links:
      - { label: Source,   icon: github, url: "https://github.com/rishabh0111/nostro-ledger" }
      - { label: Write-up, icon: pen,    url: "/blogs/multitenant-double-entry-ledger/" }

  - name:     LinkPulse
    year:     "2026"
    kind:     Infrastructure
    blurb:    A small app, run like a production platform, then broken on purpose on real AWS
    languages: [Go]

    promise: >-
      Every alert has been seen to fire, because I made each failure happen.

    body: >-
      A URL shortener with click analytics, where the product is small on
      purpose and the work is operating it: Terraform, Kubernetes, GitOps,
      monitoring, and chaos tests, on $0 plus one budgeted window on AWS.

    glance:
      - { k: Guarantee, v: "Redirects stay fast even when the database is throttling or down" }
      - { k: Built with, v: "Terraform · Kubernetes on AWS EKS · ArgoCD · Prometheus, Grafana, Loki" }
      - { k: Size,      v: "4 Terraform environments · 13 alerts · 5 chaos experiments · 9 CI jobs" }
      - { k: Runs on,   v: "An always-free AWS tier, and a local cluster with one command" }

    points:
      - >-
        Ran the whole stack for **12 hours on AWS EKS against real DynamoDB for
        $3.32**, and found and fixed **13 defects** no local run or CI could
        have shown.
      - >-
        Proved **13 alert rules with 5 chaos experiments** (4 run in CI on
        every push). Two alerts turned out to be unable to ever fire; the
        write-up is a blameless postmortem.
      - >-
        With real DynamoDB throttling clicks, redirects stayed at **0 failures
        in 7,202 requests** and a **7 ms p99**, because clicks are written in the
        background and the redirect never waits for them.

    stack: [Go, Terraform, Kubernetes, AWS EKS, ArgoCD, Prometheus, Grafana]
    links:
      - { label: Source,   icon: github, url: "https://github.com/rishabh0111/linkpulse" }
      - { label: Write-up, icon: pen,    url: "/blogs/production-grade-devops-platform/" }

  - name:     Webhook Delivery Engine
    year:     "2026"
    kind:     Systems
    blurb:    Sends webhooks and never loses one, even when things break
    languages: [Node.js]

    promise: >-
      Once the API says `202`, the event is either delivered or recorded as
      failed, and every attempt in between is written down.

    body: >-
      There is no fourth outcome where an event quietly disappears. That is the
      whole point, and the hardest part to keep true.

    # Taken from the live dashboard at 1440×900, 2×, in the app's own
    # light and dark themes, the same pair as the Nivara shots.
    shots:
      - { src: /assets/img/home/projects/webhook/dashboard.light.png, src_dark: /assets/img/home/projects/webhook/dashboard.dark.png, alt: "Operator dashboard showing live counters, demo controls and the scenario buttons", caption: "The operator dashboard" }
      - { src: /assets/img/home/projects/webhook/events.light.png,    src_dark: /assets/img/home/projects/webhook/events.dark.png,    alt: "Event list showing dead-lettered events with every attempt recorded",          caption: "Every attempt, including the failures" }

    glance:
      - { k: Guarantee, v: "Accepted once · delivered at least once · never silently lost" }
      - { k: Built with, v: "Outbox pattern · dead-letter queue with replay · signed requests" }
      - { k: Runs on,   v: "$0 of hosting" }

    points:
      - >-
        **Postgres holds the truth; Redis is only a scheduler.** Wiping all of
        Redis in the middle of a load test lost **0 of 50,000 events**, sent
        none twice, and needed no restart: all 50,000 were delivered within
        **191 seconds**.
      - >-
        The first time I ran that test it failed: **23,536 events** sat
        undelivered until a restart, because the wipe also deleted the
        sweeper's schedule. A watchdog now puts the schedule back, and the same
        test passes. Measure the claim, find it false, fix it, measure again.
      - >-
        Held **5,000 events a minute for 15 minutes** at **47 ms p95** with a
        flat backlog, and turned **10,000 events sent twice** into exactly
        10,000 deliveries. Every delivery is signed, Stripe-style.

    stack: [Express, BullMQ, Redis, PostgreSQL, Docker, OpenAPI]
    links:
      - { label: Live demo, icon: external, url: "https://webhook-delivery-engine-on21.onrender.com/dashboard" }
      - { label: API docs,  icon: external, url: "https://webhook-delivery-engine-on21.onrender.com/docs" }
      - { label: Source,    icon: github,   url: "https://github.com/rishabh0111/webhook-delivery-engine" }
      - { label: Write-up,  icon: pen,      url: "/blogs/webhook-delivery-engine/" }

  - name:     MoviesWave
    year:     "2023"
    kind:     Side project
    blurb:    A film browser that remembers what you already looked at
    languages: [JavaScript]
    # From the live app at 1440×900, 2×, in its own light and dark
    # themes. JPEG, not PNG: these are movie posters, not UI.
    shots:
      - { src: /assets/img/home/projects/movieswave/home.light.jpg,  src_dark: /assets/img/home/projects/movieswave/home.dark.jpg,  alt: "MoviesWave home: a featured film and a grid of posters by category", caption: "Popular, by genre" }
      - { src: /assets/img/home/projects/movieswave/movie.light.jpg, src_dark: /assets/img/home/projects/movieswave/movie.dark.jpg, alt: "A film's page: poster, rating, overview, top cast and links",          caption: "One film, with its cast" }
    body: >-
      Caching in the browser cut repeat calls to the film database by
      **about half** in a normal browsing session.
    stack: [JavaScript, React, Redux]
    links:
      - { label: Live,   icon: external, url: "https://movieswave.netlify.app" }
      - { label: Source, icon: github,   url: "https://github.com/rishabh0111/MoviesWave" }

  - name:     MetaMask ETH Bank
    year:     "2023"
    kind:     Side project
    blurb:    Deposits and withdrawals on a smart contract, signed in with a wallet
    languages: [Solidity]
    body: >-
      A smart contract for deposits and withdrawals, using a crypto wallet to
      sign in. No server involved.
    stack: [Solidity, Ethereum]
    links:
      - { label: Source, icon: github, url: "https://github.com/rishabh0111/MetaMask-ETH-Bank" }

# ═════════════════════════════════════════════════════════════════
#  EXPERIENCE: a timeline. `period` sits in the gutter, a dot on
#  the spine marks the job (`current: true` lights it), and the job
#  is a card: `summary` (one line; always give a job one), the
#  `ventures` as small tiles, `stack`. The `points` are folded behind
#  "What I did there", so a new job takes the same room as the last.
#  `logo` is the company mark; add `logo_dark` only for a wordmark
#  that needs a second version to read on the dark theme.
# ═════════════════════════════════════════════════════════════════
experience:
  - company: Kleeto
    legal:   Next Gen Paper Solutions Pvt. Ltd.
    # A wordmark, so it needs both grounds: the colour mark is
    # invisible on the dark theme and the white one on the light.
    logo:      /assets/img/home/logos/kleeto.light.png
    logo_dark: /assets/img/home/logos/kleeto.dark.png
    role:    AI Engineer
    period:  May 2026 to Present
    place:   Gurugram
    current: true
    stack:   [Python, FastAPI, LangGraph, MCP, RAG, Claude, OpenAI, Pipecat]
    summary: >-
      I own Kleeto's AI layer: **4 AI systems shipped since May 2026**, three of
      them in production for **500+ employees and 2 enterprise clients**, and
      one piloting with **3 customers**.
    ventures:
      - name: HR assistant
        note: AI agent across the HR platform · 500+ employees
        points:
          - >-
            Staff ask for things in plain English across **6 parts of the HR
            platform** (hiring, onboarding, attendance, payroll, leaving, and
            the document system) instead of hunting through screens: **250+
            questions a week**, answered **the same day** instead of in one to
            two.
          - >-
            Built in **Python and FastAPI** with **18 actions** the assistant
            can take, grounded in **500,000 documents**. It asks for approval
            before anything sensitive, and **it can never see or do more than
            the person asking it**.
          - >-
            Measured, not assumed: **85%+ of tasks completed correctly**, **no
            successful attempt** to trick it out of 50+ tries, answers at
            **6 seconds p95** for **2 cents each**.
      - name: Document verification
        note: GPT-4o checks on onboarding documents · 5,500 a month
        points:
          - >-
            Checks every document a new hire uploads (right type, readable,
            clean scan, name matches) and tells them exactly what to fix:
            **5,500 documents a month, 82% accepted automatically**, live for
            **2 enterprise clients** since July 2026.
          - >-
            The model only reads the facts off the page; **plain code makes the
            decision**, so every rejection names the rule and the number. If
            the model is down, onboarding carries on the old way instead of
            blocking anyone.
      - name: TheMask
        note: Masks ID numbers before archiving · 30,000 documents
        points:
          - >-
            Hides government ID numbers on identity documents before they are
            archived, so **a full server breach reveals nothing**. **30,000
            documents masked** so far.
          - >-
            The customer can still recover their number by answering 4 of 6
            security questions. The encrypted copy lives inside the masked image
            itself, so the server keeps **no database and no files** to leak.
      - name: Kleeto AI Slides
        note: Real-time voice AI presenter · piloting with 3 customers
        points:
          - >-
            Presents any slide deck aloud in **English or Hindi**, stops for
            questions at any moment, and answers **only from the company's own
            documents**, with a citation on screen, or says plainly that they
            don't cover it.
          - >-
            Works on whatever laptop and projector a room has: it tells a
            question from a cough, a side remark, or its own voice coming back
            through the speakers. **1,000+ tests**; **40 sessions** run in the
            pilot so far.

  - company: Zeonix Global Pvt. Ltd.
    # The full wordmark. "nix Global" is near-black, so it needs a
    # lifted version to stay readable on the dark theme.
    logo:      /assets/img/home/logos/zeonix.light.png
    logo_dark: /assets/img/home/logos/zeonix.dark.png
    role:    Software Developer
    period:  Jun 2024 to Apr 2026
    place:   Chandigarh
    stack:   [Node.js, Express, PostgreSQL, GraphQL, Angular, WSO2]
    summary: >-
      Built and shipped **three business platforms**, owning each one from the
      API through to security, integrations, deployment, backups and getting
      clients set up.
    ventures:
      - name: ZeoCRM
        note: University management · all 40+ Australian universities
        points:
          - >-
            Replaced manual data entry with a spreadsheet importer that checks
            and loads **10,000+ records** at once, cutting the job from about
            **three hours to under one**.
          - >-
            Made the busiest pages **40% faster (1.5s → 0.9s)** on ~10K requests a
            day, and set up single sign-on with five permission levels:
            **no unauthorised access in 18 months across 500+ users**.
          - >-
            Cut commission payouts for **100+ agent partners from two days to
            same-day** by automating the chain from accounts to PDF invoice to
            email, and saved **4–6 hours a week** of form filling with a bot
            that submits university applications.
      - name: ZeoVerify
        note: Document verification & digital onboarding
        points:
          - >-
            Cut document checking from about **25 minutes to 10** per
            application. Instead of accepting an uploaded scan, the system asks
            permission and **fetches the document from the government directly**,
            so there is nothing to forge.
          - >-
            Launched the company's **first production AI feature**: a
            document-checking service in **Python and FastAPI** on **Google's
            Gemini**, kept
            deliberately simple and predictable so a reviewer could see exactly
            why it flagged something. The model advised; a person still decided.
            *This is where my AI work started.*
      - name: ZeoForex
        note: Financial remittance & currency exchange
        points:
          - >-
            Cut mistakes on live money transfers by **a third (8% → 5%)** with
            step-by-step checks and tax rules, and by making each transfer either
            complete fully or not at all.

# ═════════════════════════════════════════════════════════════════
#  SKILLS: rendered as a logo grid. Each item is looked up in
#  _data/tech_logos.json; anything with no brand mark renders as an
#  initialled badge on purpose. Add an item, then re-run
#  `python _templates/logos/build_logos.py` to pull its mark in.
# ═════════════════════════════════════════════════════════════════
skills:
  - group: Languages
    icon:  code
    items: [Python, TypeScript, Java, JavaScript, Node.js, SQL, Go, PHP, C/C++]
  - group: AI & LLM Engineering
    icon:  spark
    items: [LangGraph, MCP, RAG, LangChain, Qdrant, ChromaDB, Embeddings,
            Eval harnesses, Guardrails, Langfuse, Prompt engineering,
            Multi-model routing, Vision LLMs, Voice agents]
  - group: Models
    icon:  chip
    items: [Anthropic Claude, OpenAI, Google Gemini, Groq, Sarvam AI,
            "Ollama (Llama, Qwen, Gemma)"]
  - group: Security
    icon:  shield
    items: [CEH v11, OWASP LLM Top 10, Postgres RLS, Prompt-injection resistance,
            HMAC signing, JWT + RBAC, Applied cryptography, Adversarial testing]
  - group: Backend
    icon:  server
    items: [FastAPI, Spring Boot, NestJS, Express.js, GraphQL, gRPC, Kafka,
            Outbox pattern, Idempotency, BullMQ, Redis, Socket.IO, WSO2 SSO, OpenAPI]
  - group: Data
    icon:  database
    items: [PostgreSQL, MongoDB, MySQL, DynamoDB, Redis, Qdrant, Prisma,
            Schema design, Query optimization]
  - group: Frontend
    icon:  window
    items: [React, Next.js, Angular, Redux, TanStack Query, Tailwind CSS, RxJS]
  - group: Infrastructure
    icon:  cube
    items: [Docker, Kubernetes, Terraform, ArgoCD, Helm, GitHub Actions, Jenkins,
            Prometheus, Grafana, Nginx, Linux,
            "AWS (EKS, DynamoDB, S3, IAM)", "Azure (App Service, Blob)"]
  - group: Testing & Quality
    icon:  check
    items: [pytest, JUnit 5, Testcontainers, Jest, Vitest, Playwright, Supertest,
            MSW, k6, Gatling, Selenium, Postman]
  - group: Integrations
    icon:  link
    items: [Razorpay, ICICI Payments, Digilocker, Slack Bolt, Gmail API,
            Google Calendar, Microsoft Graph, Metabase]
  # Tailor-only in the résumé; kept here because a portfolio can afford range.
  - group: Blockchain & Mobile
    icon:  blocks
    items: [Solidity, Ethereum, Avalanche, Polygon, ERC-20, "Capacitor (iOS & Android)"]

# ── About ────────────────────────────────────────────────────────
# One short paragraph (~95 words), in the front matter so the layout
# places it. How the AI track started, and how he still works.
about: >-
  I started in security and moved into AI through the work, not a course. I spent
  two years at Zeonix on payment and onboarding systems, and shipped my first
  production LLM feature there: a document-authenticity check on Gemini, written
  as fixed LangChain chains with retrieval grounding so a human verifier could
  see why a document was flagged. The model advised and a person decided, and
  that is still how I build: at Kleeto the model reads, and code or a person
  makes the call. I care most about what a model can reach, whose permissions
  it borrows, and whether I can reproduce every number I publish from a clean
  clone.

# ── Credentials: two panels ───────────────────────────────────────
# Education in one, certifications and awards in the other, each
# entry a row with the mark of its kind (cap, seal, trophy).
education:
  - degree: B.E. Computer Science Engineering
    detail: Specialization in Information Security
    school: Chandigarh University, Mohali
    period: Aug 2020 to May 2024
    score:  CGPA 8.02 / 10
  - degree: Higher Secondary (12th), Science
    detail: PCM + Computer Science
    school: Govt. Sr. Sec. School, Chotta Shimla
    period: Mar 2019
    score:  90% (HPBoSE)

certifications:
  - name: Certified Ethical Hacker (CEH) v11
    issuer: EC-Council · 2023–2026
    url: "https://aspen.eccouncil.org/VerifyBadge?type=certification&a=BO+LGPmvJfn9LVa/anUsUrQ9C3Ks8fH8j61tvvbF1TI="
  - name: React Basics & Advanced React
    issuer: Meta, via Coursera · 2023
    links:
      - { label: React Basics,   url: "https://www.coursera.org/account/accomplishments/verify/NNUZXDBFEGST" }
      - { label: Advanced React, url: "https://www.coursera.org/account/accomplishments/verify/ZYSRTRLQL85M" }
  - name: ETH Proof · ETH+AVAX Proof · Poly Proof
    issuer: Metacrafters · on-chain, Solana-minted
    links:
      - { label: ETH Proof,      url: "https://solscan.io/token/8vacs7DZRxNhrJihCsJMiHgLYtNw3mxBkAAtfRUK7Xrj" }
      - { label: ETH+AVAX Proof, url: "https://solscan.io/token/QDyELxrS3XqEfiXjB8seWTUEpVeumqBTbqBHsAs7JJL" }
      - { label: Poly Proof,     url: "https://solscan.io/token/Hj9NS5NBVeEeV77n3nF8Fhvmw2Ab68v5AgSNjwVgNt5t" }

awards:
  - name: Top 5 nationally · Intel oneAPI Hackathon
    note: Intel × IIT Roorkee.
  - name: District Rank 1 · Mathematics Olympiad
    note: National Science Congress.

interests: [Chess, Technical writing, 10-finger typing, Infrastructure spelunking]

contact:
  email: rishabhsharma8912@gmail.com
---

<!--
  The essay now lives in the `about:` key above so the layout can place
  it in the dossier grid. Nothing is rendered from the body.
-->
