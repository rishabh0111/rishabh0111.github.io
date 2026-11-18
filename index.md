---
# ═════════════════════════════════════════════════════════════════
#  HOME: all of the page's content lives in this front matter.
#  _layouts/home.html renders it as full-width rows, one content
#  column, alternating between the open scene and a tinted band.
#
#  WHO IT IS FOR. Founders, CTOs, investors, peers, and whoever else
#  turns up: not recruiters (the resume serves them). So this page
#  is NOT written in resume form:
#    · no stat tiles, no counts in the hero, no X-Y-Z bullets on the
#      surface. A card says what problem it solves, for whom, and why
#      that matters; at most one number on it (`proof`), and only one
#      that marks a real stake. Every other figure lives in the fold,
#      next to how it was measured.
#    · no role title and no employer in the hero. Projects holds my
#      own work; work done for an employer lives under its company in
#      Experience, as tiles. A new job is one more entry there.
#    · nothing that reads as a job search (no "open to", "available",
#      "hire"). The close invites a conversation, not an offer.
#
#  Order: hero → principles → projects → experience → toolkit →
#  education & credentials → writing → contact.
#
#  Bullet strings accept inline Markdown (**bold**, `code`, [links](#)).
#  Stack and skill names are matched against _data/tech_logos.json for
#  a brand mark.
#  Adding a tool? Add it here, then re-run:
#      python _templates/logos/build_logos.py
# ═════════════════════════════════════════════════════════════════
layout: home
title: Rishabh Sharma
description: >-
  Rishabh Sharma builds AI systems, backends and the infrastructure under
  them, for work where a mistake is expensive: money, identity documents,
  other people's data. Notes on what he builds and what broke.
permalink: /

profile:
  name:      Rishabh
  surname:   Sharma
  # The headline names no role and no employer on purpose: it has to stay
  # true whatever the next job is. Agreed with three reviewers (Nov 2026).
  headline:  I design the mistake out.
  sub: >-
    Software engineer. I build AI systems, backends and the infrastructure
    under them, for work that handles money, identity documents and private
    data.
  status:    Gurugram, India
  avatar:    /assets/img/home/profile-cutout.webp

# Home-only links, shown after the social links in _data/social.yml.
links:
  - { label: Writing,  url: "/blogs/",                              icon: pen }

# ── Principles: how I build, four tiles ─────────────────────────
# Habits that hold in any job. Each is told through one story, and the
# stories come from different places (`from`), so no single employer
# or project carries the page. No numbers here: the story is the proof.
principles:
  - title: Remove what can go wrong
    icon:  shield
    from:  ZeoVerify · Zeonix
    body: >-
      ZeoVerify fetches documents straight from the government instead of
      accepting uploads. Nothing to forge, so no forgery to catch.
  - title: Measure before you trust it
    icon:  check
    from:  Webhook Delivery Engine · own project
    url:   /blogs/webhook-delivery-engine/
    body: >-
      My first Redis-wipe test left events stuck. I found why, fixed it and
      ran it again; the write-up starts with the failure.
  - title: Own it end to end
    icon:  spark
    from:  Kleeto AI Slides · Kleeto
    body: >-
      I built Kleeto AI Slides alone, voice pipeline to authoring screens, and
      rebuilt its setup around its owner's feedback before the pilot.
  - title: Explain it in public
    icon:  pen
    from:  LinkPulse · own project
    url:   /blogs/production-grade-devops-platform/
    body: >-
      I made ten of LinkPulse's thirteen alerts fire on purpose. Two never
      could have, and the published postmortem says so.

# ═════════════════════════════════════════════════════════════════
#  PROJECTS: my own work, one card each, the same shape on every card:
#  `shots` as the cover (no shots: a plate with the first `stack`
#  mark) → name and `year` → `blurb` (one short line) → `proof` (at
#  most one number, optional) → `stack` chips (or the `parts`) → one
#  "Details" button. Details opens a window with the rest, in this
#  order: `why`, `promise`, `body`, `points`, `glance`, `parts`, the
#  stack, then the `video` and `links`. Numbers belong in that window,
#  next to how they were measured. `earlier: true` puts a card in the
#  folded "Earlier side projects" row.
#
#  `roles`  is read only by ?for= links (the old Focus lenses, now
#           without buttons; existing links keep working).
#  Employer work (experience[].ventures) takes the same fields.
# ═════════════════════════════════════════════════════════════════
# Read by ?for=<id> links only (no buttons are shown). `note` is the line
# that appears above the work when such a link is opened.
lenses:
  - { id: ai,        note: "Work that puts a model to use: the HR assistant, Nivara Desk and Kleeto AI Slides first." }
  - { id: backend,   note: "Nostro in Java, the Webhook Delivery Engine in Node.js, the Nivara Desk API in TypeScript, and two Zeonix platforms in Node.js." }
  - { id: platform,  note: "LinkPulse: Terraform, Kubernetes, GitOps and chaos tests, run for 12 hours on real AWS." }
  - { id: fullstack, note: "Nivara Desk's four front ends on one typed client, behind the API they share." }
  - { id: security,  note: "TheMask, the HR assistant's borrowed permissions, ZeoVerify's fetch-instead-of-upload, and Nivara Desk's isolation in the database." }

projects:
  - name:     Nivara Desk
    # The failure this project rules out (struck through at the top of its
    # Details window) and the line that answers it. Both restate `why`,
    # `promise` or `proof`.
    mistake:  "The model answers when it should hand over"
    answer:   "Right call on 515 of 550 scored tickets; 0 prompt injections got through."
    year:     "2026"
    blurb:    A RAG agent with a learned answer gate, a model router with failover, and evals that replay for $0
    why:      >-
      An LLM agent in front of customers can do harm two ways: answering when it
      should hand over, and letting one tenant's data into another's answer.
      This one is built, and measured, so neither happens.
    proof:    "93.6% correct calls on 550 scored tickets, and 0 successful prompt injections."
    roles:    [ai, backend, fullstack, security]
    languages: [Python, TypeScript]
    # Built from the frames nivara-landing's scripts/capture.ts takes (the same
    # ones as the README GIF): a local build reading the live API with every
    # write refused, and the chat box answered from recorded turns.
    video:    { src: /assets/img/home/projects/nivara/walkthrough.mp4, poster: /assets/img/home/projects/nivara/walkthrough.jpg, length: "24 s", title: "Nivara Desk: the agent answering one question, handing another to a person, and both landing on the queue as tickets" }

    promise: >-
      Text the model writes on its own has no path to a customer: the only way
      out is a tool call carrying retrieved content. Every published metric
      re-runs from a clean clone for $0, with no API key.

    body: >-
      Hybrid dense + BM25 retrieval on Qdrant, a learned gate that picks answer,
      clarify or escalate, a Groq → Gemini → human failover chain, MCP tools and
      Langfuse traces, with evals recorded once and replayed in CI. It runs
      inside a working multi-tenant helpdesk, so every escalation lands on a
      real queue for a person.

    # Crops of nivara-landing's public/shots (1440x900, 2x), framed so each
    # panel of the card shows the part that matters. The full frames sit
    # beside them under the plain names (the blog posts use those).
    # Led by the agent's own ruling, not the chat box: the first frame a
    # visitor sees is the gate deciding, then the queue and the numbers.
    shots:
      - { src: /assets/img/home/projects/nivara/ticket.card.light.png,    src_dark: /assets/img/home/projects/nivara/ticket.card.dark.png,    alt: "A handed-over ticket with a What the AI did panel: Hand over picked, reason model_declined, and nobody assigned yet", caption: "The gate's ruling on one ticket" }
      - { src: /assets/img/home/projects/nivara/queue.card.light.png,     src_dark: /assets/img/home/projects/nivara/queue.card.dark.png,     alt: "Support queue with an AI ruling column: one ticket answered, the rest handed over and waiting for a person", caption: "Every ticket, with the agent's ruling" }
      - { src: /assets/img/home/projects/nivara/analytics.card.light.png, src_dark: /assets/img/home/projects/nivara/analytics.card.dark.png, alt: "Analytics for a chosen window: deflection, the answered, asked and handed-over split, and resolution and SLA breach rates", caption: "Answered, asked, handed over: measured" }
      - { src: /assets/img/home/projects/nivara/widget.card.light.png,    src_dark: /assets/img/home/projects/nivara/widget.card.dark.png,    alt: "The embeddable widget on a host page answering a question about the contact importer, with an Answer, Ask, Hand over strip showing it answered", caption: "The same gate, in the embeddable widget" }

    glance:
      - { k: Guarantee, v: "Model text never reaches a customer on its own; only a tool call carrying retrieved content does" }
      - { k: Built with, v: "Hybrid RAG on Qdrant · learned answer gate · model router with failover · MCP · Langfuse" }
      - { k: Evals,     v: "550 labelled questions · record-and-replay harness in CI · LLM judge checked against 100 hand labels" }
      - { k: Runs on,   v: "Free hosting, and `docker compose up` with no API keys" }

    parts:
      - id:    ai
        label: AI layer
        lang:  Python
        stack: [FastAPI, RAG, Qdrant, MCP, Langfuse, pytest]
        blog:  /blogs/mcp-tool-surface-as-the-guardrail/
        promise: >-
          Anything the model writes on its own can never reach a customer.
        points:
          - >-
            Made the right call on **93.6% of 550 scored tickets** (515 of
            550) by routing every answer through a trained gate that decides
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
        stack: [NestJS, Prisma, Postgres RLS, PostgreSQL, PgBouncer, Socket.IO, Redis]
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
        stack: [Next.js, React, Tailwind CSS, TanStack Query, Playwright]
        promise: >-
          Every screenshot above was taken from the running app by a script.
        points:
          - >-
            Four apps share one codebase: the agent dashboard, the customer
            portal, the analytics view, and a chat box that drops into any
            website **under 60 KB** without picking up that site's styling.

    stack: [Python, FastAPI, RAG, Qdrant, MCP, Langfuse, NestJS, PostgreSQL]
    links:
      # `?demo` opens the dashboard already signed in as the seeded admin.
      - { label: "Try it, signed in", icon: external, url: "https://nivara-web-nextjs.vercel.app/dashboard?demo" }
      - { label: Widget, icon: external, url: "https://rishabh0111.github.io/nivara-web-nextjs/" }
      - { label: Product,  icon: external, url: "https://nivara-desk.vercel.app" }
      - { label: API reference, icon: external, url: "https://nivara-api-nestjs.onrender.com/docs" }
      - { label: Source,   icon: github,   url: "https://github.com/rishabh0111?tab=repositories&q=nivara" }
      - { label: Write-up, icon: pen,      url: "/blogs/postgres-rls-multitenancy/" }

  - name:     Webhook Delivery Engine
    # The failure this project rules out (struck through at the top of its
    # Details window) and the line that answers it. Both restate `why`,
    # `promise` or `proof`.
    mistake:  "An accepted event is lost when the queue dies"
    answer:   "0 of 50,000 lost through a Redis wipe mid-load, and 0 sent twice."
    year:     "2026"
    blurb:    At-least-once webhook delivery in Node.js on a Postgres outbox, BullMQ retries and a replayable dead-letter queue
    why:      >-
      Once an API returns 202, the caller stops watching. If the queue then
      loses the event, nobody finds out. Here Postgres is the source of truth
      and Redis only schedules, so losing Redis loses nothing.
    proof:    "0 of 50,000 events lost through a Redis wipe, and 5,000 a minute at a 47 ms p95."
    roles:    [backend]
    languages: [Node.js]
    video:    { src: /assets/img/home/projects/webhook/tour.mp4, poster: /assets/img/home/projects/webhook/tour.jpg, length: "22 s", title: "Webhook Delivery Engine: three events on one timeline, one delivered, one retried then delivered, one dead after five attempts" }

    promise: >-
      Once the API says `202`, the event is either delivered or recorded as
      failed, and every attempt in between is written down.

    body: >-
      A transactional outbox, exponential backoff over 5 attempts, a dead-letter
      queue with one-click replay, idempotency keys at ingest, and HMAC-SHA256
      signatures, Stripe-style. A reconciler rebuilds the queue from Postgres
      whenever Redis is lost.

    # Taken from the dashboard run locally at 1440×900, 2×, after the tour
    # settles, in the app's own light and dark themes. The video is the
    # README's tour GIF, re-encoded from the same frames.
    shots:
      - { src: /assets/img/home/projects/webhook/dashboard.light.png, src_dark: /assets/img/home/projects/webhook/dashboard.dark.png, alt: "Delivery timeline after the tour: one event dead after 5 attempts with a Replay button, one delivered on attempt 3, one delivered first time, the backoff gaps labelled 2 s, 4 s, 8 s and 16 s", caption: "Every attempt on one timeline" }
      - { src: /assets/img/home/projects/webhook/paths.light.png,     src_dark: /assets/img/home/projects/webhook/paths.dark.png,     alt: "Run one path: recipes from a signed happy path to a receiver timing out, retries running out and a dead event replayed, each drawn the way its row will look", caption: "Run one path" }

    glance:
      - { k: Guarantee, v: "Idempotent ingest · at-least-once delivery · never silently lost" }
      - { k: Built with, v: "Node.js · Express · BullMQ on Redis · PostgreSQL outbox · HMAC-signed requests" }
      - { k: Measured,  v: "0 of 50,000 lost through a Redis wipe · 5,000/min for 15 min at p95 47 ms · 10,000 duplicates, 10,000 deliveries" }
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

    stack: [Node.js, Express.js, BullMQ, Redis, PostgreSQL, Docker, OpenAPI]
    links:
      - { label: Live demo, icon: external, url: "https://webhook-delivery-engine-on21.onrender.com/dashboard" }
      - { label: API reference, icon: external, url: "https://webhook-delivery-engine-on21.onrender.com/docs" }
      - { label: Source,    icon: github,   url: "https://github.com/rishabh0111/webhook-delivery-engine" }
      - { label: Write-up,  icon: pen,      url: "/blogs/webhook-delivery-engine/" }

  - name:     LinkPulse
    # The failure this project rules out (struck through at the top of its
    # Details window) and the line that answers it. Both restate `why`,
    # `promise` or `proof`.
    mistake:  "An alert that can never fire"
    answer:   "10 of 13 alerts made to fire by 5 chaos experiments; 2 dead ones found and fixed."
    year:     "2026"
    blurb:    Terraform, Kubernetes on AWS EKS, ArgoCD GitOps and Prometheus alerting, broken on purpose on real AWS
    why:      >-
      Most platform demos stop at a green deploy. This one ran on real AWS and
      was broken on purpose, because an alert nobody has seen fire may stay
      silent in the outage it was written for.
    proof:    "12 hours on EKS against real DynamoDB for $3.32, and 13 defects found that no local run or CI could show."
    roles:    [platform]
    languages: [Go]

    promise: >-
      Ten of its thirteen alerts have been seen to fire, because I made each
      failure happen; the other three are checked as loaded.

    body: >-
      4 Terraform environments with apply, empty re-plan and destroy on every
      push; an ArgoCD app-of-apps over Kustomize overlays; Prometheus,
      Alertmanager, Grafana and Loki; a 9-job CI pipeline with a Trivy gate.
      The workload is a small Go URL shortener on purpose: the work is running it.

    # The dashboard is the Go service's static page served with a mock API
    # (sample clicks, not real traffic); the diagram is the README's
    # architecture SVG, rasterized at 2×.
    shots:
      - { src: /assets/img/home/projects/linkpulse/dashboard.light.png,    src_dark: /assets/img/home/projects/linkpulse/dashboard.dark.png,    alt: "LinkPulse dashboard with sample data: a shortened link, its clicks in all, a 30-minute trace of clicks as they land, clicks per day, and recent clicks by device and country", caption: "The dashboard, with sample clicks" }
      - { src: /assets/img/home/projects/linkpulse/architecture.light.png, src_dark: /assets/img/home/projects/linkpulse/architecture.dark.png, alt: "LinkPulse architecture: requests pass the ingress to the Go service and one DynamoDB table, inside a Kubernetes cluster watched by Prometheus, Alertmanager, Grafana and Loki and deployed by ArgoCD; every push runs tests, an end-to-end run on k3d and a Trivy gate before a bot commit pins the image", caption: "How it is run and deployed" }

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
        Made **10 of its 13 alert rules fire with 5 chaos experiments** (4 run
        in CI on every push); the other 3 are checked as loaded. Two alerts
        turned out to be unable to ever fire; the write-up is a blameless
        postmortem.
      - >-
        With real DynamoDB throttling clicks, redirects stayed at **0 failures
        in 7,202 requests** and a **7 ms p99**, because clicks are written in the
        background and the redirect never waits for them.

    stack: [Terraform, Kubernetes, AWS EKS, ArgoCD, Prometheus, Grafana, Go]
    links:
      - { label: Source,   icon: github, url: "https://github.com/rishabh0111/linkpulse" }
      - { label: Write-up, icon: pen,    url: "/blogs/production-grade-devops-platform/" }

  - name:     Nostro
    # The failure this project rules out (struck through at the top of its
    # Details window) and the line that answers it. Both restate `why`,
    # `promise` or `proof`.
    mistake:  "A ledger entry that doesn't balance gets recorded"
    answer:   "Postgres refuses it at commit, and 211 tests prove it on every push."
    year:     "2026"
    blurb:    Java 21 and Spring Boot microservices over Kafka and gRPC, a multi-tenant ledger where money can't go missing
    why:      >-
      A ledger that finds an error in a nightly check has already reported a
      wrong number. Here an unbalanced, duplicated or cross-tenant entry can't
      be recorded at all.
    proof:    "211 tests on every push, and zero database errors under a contended load test."
    roles:    [backend]
    languages: [Java]

    promise: >-
      An entry that doesn't balance, arrives twice, or touches another
      company's money cannot be recorded. The database refuses it.

    body: >-
      3 Spring Boot services: a write API with a transactional outbox, a Kafka
      relay kept single-writer by leader election, and a gRPC read model with
      read-your-writes position tokens. Failure cases are sealed types, and
      every guarantee in the README names the test that proves it.

    # The README's architecture SVG, rasterized at 2× and set on a 16:9
    # ground so the single-panel card shows all of it.
    shots:
      - { src: /assets/img/home/projects/nostro/architecture.light.png, src_dark: /assets/img/home/projects/nostro/architecture.dark.png, alt: "Nostro architecture: the API service records an Entry, its Postings and an outbox row in one Postgres transaction; a single-writer relay publishes Entries to Kafka keyed by Tenant; a projection applies each Entry once into its own Postgres of Balances, which the API reads over gRPC", caption: "The path of one Entry" }

    glance:
      - { k: Guarantee, v: "Every entry sums to zero, is recorded once, and stays inside its own tenant" }
      - { k: Built with, v: "Java 21 · Spring Boot · Kafka · gRPC · Testcontainers · Postgres row-level security" }
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

  - name:     MoviesWave
    earlier:  true
    year:     "2023"
    blurb:    A film browser that remembers what you already looked at
    roles:    [fullstack]
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
    earlier:  true
    year:     "2023"
    blurb:    Deposits and withdrawals on a smart contract, signed in with a wallet
    languages: [Solidity]
    body: >-
      A smart contract for deposits and withdrawals, using a crypto wallet to
      sign in. No server involved.
    stack: [Solidity, Ethereum]
    links:
      - { label: Source, icon: github, url: "https://github.com/rishabh0111/MetaMask-ETH-Bank" }

# ═════════════════════════════════════════════════════════════════
#  EXPERIENCE: one card per employer, every one the same size: the
#  company, role, dates, one line, then the work done there as tiles
#  (`ventures`). A tile is a small card (name, `blurb`, two `highlights`
#  that sell the outcome, stack)
#  with the same Details window as a project.
# ═════════════════════════════════════════════════════════════════
experience:
  - company: Kleeto
    # A wordmark, so it needs both grounds: the colour mark is
    # invisible on the dark theme and the white one on the light.
    logo:      /assets/img/home/logos/kleeto.light.png
    logo_dark: /assets/img/home/logos/kleeto.dark.png
    role:    AI Engineer
    period:  May 2026 to Present
    place:   Gurugram
    current: true
    summary: >-
      I own the AI layer at an HR-tech and document-management company.
      **Four AI systems shipped since May 2026**, three of them in production
      for 500+ employees and two enterprise clients.
    ventures:
      - name:     HR assistant
        year:     "2026"
        blurb:    Staff ask HR in plain English, and it can never see more than they can
        highlights:
          - "In daily use by 500+ employees, answering the same day instead of in one to two"
          - "85%+ of tasks done right, and no attempt to trick it worked in 50+ tries"
        why:      >-
          An assistant with access to HR records is only safe if it can never see
          or do more than the person asking. This one borrows their permissions,
          and asks for approval before anything sensitive.
        roles:    [ai, security]
        languages: [Python]
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
            Measured, not assumed: **85%+ of tasks completed correctly** on a
            set of known tasks, **no successful attempt** to trick it out of 50+
            tries, answers at **6 seconds p95** for **2 cents each**.
        stack: [LangGraph, MCP, Python, FastAPI, RAG, Langfuse]

      - name:     Kleeto AI Slides
        year:     "2026"
        blurb:    A voice AI that presents a deck and answers only from the company's own documents
        highlights:
          - "Piloting with 3 customers, built alone from the voice pipeline to the authoring screens"
          - "Tells a question from a cough or its own echo, so it runs on any room's laptop and projector"
        why:      >-
          It answers only from that company's own documents, with a citation on
          screen, or says plainly that they don't cover it. It works on whatever
          laptop and projector the room has.
        roles:    [ai, fullstack]
        languages: [Python, TypeScript]
        points:
          - >-
            Presents any slide deck aloud in **English or Hindi**, stops for
            questions at any moment, and answers **only from the company's own
            documents**, with a citation on screen, or says plainly that they
            don't cover it.
          - >-
            Tells a question from a cough, a side remark, or its own voice coming
            back through the speakers, so it can run on whatever laptop and
            projector a room has. **1,000+ tests**; **40 sessions** run in the
            pilot so far.
          - >-
            Built alone, including the authoring flow its owner asked for: drop
            documents into a reference set and they prepare themselves.
        stack: [Pipecat, Python, FastAPI, React, TypeScript]

      - name:     Document verification
        year:     "2026"
        blurb:    Checks a new hire's documents. The model reads; plain code rules decide
        highlights:
          - "Live for 2 enterprise clients, with 82% of 5,500 documents a month accepted automatically"
          - "A model outage can never block a new hire: onboarding falls back to the old flow"
        why:      >-
          The model only reads the facts off the page; plain code rules make the
          decision, so every rejection can be explained. If the model is down,
          onboarding carries on the old way instead of blocking anyone.
        roles:    [ai]
        languages: [Python]
        points:
          - >-
            Checks every document a new hire uploads (right type, readable,
            clean scan, name matches) and tells them exactly what to fix:
            **5,500 documents a month, 82% accepted automatically**, live for
            **2 enterprise clients** since July 2026.
          - >-
            GPT-4o only reads the facts off the page; **9 plain code rules** make
            the decision, so every rejection names the rule and the number. If
            the model is down, onboarding carries on the old way instead of
            blocking anyone.
          - >-
            One model call per submission however many documents it holds, and a
            resubmit with nothing changed costs **no model calls at all**.
        stack: [Python, OpenAI, PHP, MySQL]

      - name:     TheMask
        year:     "2026"
        blurb:    Masks government ID numbers, so a full server breach reveals nothing
        highlights:
          - "30,000 ID documents masked, and a full server breach reveals nothing"
          - "Customers recover their own number with 4 of 6 security answers; the server holds no key"
        why:      >-
          A full server breach should reveal nothing. The encrypted number lives
          inside the masked image itself, so the server keeps no database and no
          files to leak, and the customer can still recover their own number.
        roles:    [security]
        languages: [Python]
        points:
          - >-
            Hides government ID numbers on identity documents before they are
            archived, so **a full server breach reveals nothing**. **30,000
            documents masked** so far.
          - >-
            The customer can still recover their number by answering **4 of 6**
            security questions. The encrypted copy lives inside the masked image
            itself, so the server keeps **no database and no files** to leak.
          - >-
            Fails closed: anything it can't read with confidence holds back the
            whole document rather than archiving a number it missed.
        stack: [FastAPI, Python, React, TypeScript, Docker]

  - company: Zeonix Global
    # The full wordmark. "nix Global" is near-black, so it needs a
    # lifted version to stay readable on the dark theme.
    logo:      /assets/img/home/logos/zeonix.light.png
    logo_dark: /assets/img/home/logos/zeonix.dark.png
    role:    Software Developer
    period:  Jun 2024 to Apr 2026
    place:   Chandigarh
    summary: >-
      B2B platforms for education and finance. **I built three of them end to
      end**, from API design and security to deployment and client
      onboarding, and shipped the company's first production AI feature.
    ventures:
      - name:     ZeoCRM
        year:     "2024–26"
        blurb:    Applications, commissions and invoices for universities and their agents
        highlights:
          - "Runs across all 40+ Australian universities"
          - "Agent payouts cut from two days to same-day, and the busiest pages made 40% faster"
        why:      >-
          It replaced spreadsheets and manual entry with an importer that checks
          every record, and automated the chain from accounts to invoice to email,
          so agent partners get paid the same day.
        roles:    [backend, fullstack]
        languages: [Node.js, TypeScript]
        points:
          - >-
            Replaced manual data entry with a spreadsheet importer that checks
            and loads **10,000+ records** at once, cutting the job from about
            **three hours to under one**.
          - >-
            Made the busiest pages **40% faster (1.5s → 0.9s)** on 10K requests a
            day, and set up single sign-on with five permission levels:
            **no unauthorised access in 18 months across 500+ users**.
          - >-
            Cut commission payouts for **100+ agent partners from two days to
            same-day** by automating the chain from accounts to PDF invoice to
            email, and saved **4–6 hours a week** of form filling with a bot
            that submits university applications.
        stack: [Node.js, Express.js, PostgreSQL, GraphQL, Angular]

      - name:     ZeoVerify
        year:     "2024–26"
        blurb:    Fetches documents from the government instead of trusting uploads, so there is nothing to forge
        highlights:
          - "Checking time per application cut from 25 minutes to 10"
          - "Shipped the company's first production AI feature"
        why:      >-
          Instead of accepting an uploaded scan, it asks the applicant's
          permission and fetches the document from the government directly, so
          there is nothing to forge. It also carried the company's first
          production AI feature, which is where my AI work started.
        roles:    [ai, security]
        languages: [Node.js, Python]
        points:
          - >-
            Cut document checking from about **25 minutes to 10** per
            application by fetching documents from the government with the
            applicant's permission instead of accepting uploaded scans.
          - >-
            Launched the company's **first production AI feature**: a
            document-checking service in **Python and FastAPI** on **Google's
            Gemini**, kept deliberately simple and predictable so a reviewer could
            see exactly why it flagged something. The model advised; a person still
            decided.
        stack: [Google Gemini, Node.js, FastAPI, LangChain]

      - name:     ZeoForex
        year:     "2024–26"
        blurb:    Remittance on live money, where a transfer completes fully or not at all
        highlights:
          - "Mistakes on live transfers cut by a third, from 8% to 5%"
          - "Every transfer completes fully or not at all"
        why:      >-
          Each transfer either completes fully or not at all, with step-by-step
          checks and tax rules in front of it, so a half-finished transfer can't
          leave money in the wrong place.
        roles:    [backend]
        languages: [Node.js]
        points:
          - >-
            Cut mistakes on live money transfers by **a third (8% → 5%)** with
            step-by-step checks and tax rules, and by making each transfer either
            complete fully or not at all.
          - >-
            Built a **multi-node parent-child invoicing model** for commission
            structures that don't fit a flat table.
        stack: [PostgreSQL, Node.js, Express.js]

# ═════════════════════════════════════════════════════════════════
#  TOOLKIT: logo loops, one row per group. Each item is looked up in
#  _data/tech_logos.json; anything with no brand mark renders as an
#  initialled badge on purpose.
#  Add an item, then re-run `python _templates/logos/build_logos.py`.
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
  - group: Blockchain & Mobile
    icon:  blocks
    items: [Solidity, Ethereum, Avalanche, Polygon, ERC-20, "Capacitor (iOS & Android)"]

# ── Writing: the three newest posts come from the blog itself; these
# are the series links shown under them.
writing:
  series:
    - { label: "System Design, in ten parts", url: "/blogs/system-design-foundations/" }
    - { label: "DSA, pattern by pattern",     url: "/blogs/dsa-the-method/" }

# ── Education & credentials: their own section, after the toolkit ─
# One card each, with the issuer's mark. `logo` sits on a white plate
# so it reads on both themes. `url` adds a "Verify" link.
credentials:
  - kind:   Education
    title:  B.E. Computer Science Engineering
    detail: Specialisation in Information Security
    org:    Chandigarh University, Mohali
    period: 2020 to 2024
    logo:   /assets/img/home/logos/chandigarh-university.png
  - kind:   Certification
    title:  Certified Ethical Hacker (CEH) v11
    org:    EC-Council
    period: 2023 to 2026
    logo:   /assets/img/home/logos/ceh.png
    url:    "https://aspen.eccouncil.org/VerifyBadge?type=certification&a=BO+LGPmvJfn9LVa/anUsUrQ9C3Ks8fH8j61tvvbF1TI="
  - kind:   Award
    title:  Top 5 nationally
    detail: Intel oneAPI Hackathon
    org:    Intel × IIT Roorkee
    logo:   /assets/img/home/logos/intel.svg

# ── Off-hours: under Education & credentials ─────────────────────
# `icon` names a glyph in _includes/icon.html.
interests:
  - icon:   chess
    label:  Chess
    detail: The game I always come back to, online or across a board.
  - icon:   terminal
    label:  Linux
    detail: I distro-hop, try every new tool, and live on r/linux.
  - icon:   gamepad
    label:  PC gaming
    detail: Counter-Strike first, then the all-time classics on emulators.
  - icon:   music
    label:  Music
    detail: Anything from Pink Floyd, Metallica and the Beatles to NFAK.
  - icon:   tv
    label:  Anime and TV
    detail: Attack on Titan above all, then Breaking Bad and Game of Thrones.

contact:
  line:  Let's connect
  email: rishabhsharma8912@gmail.com
---

<!--
  Everything on the home page comes from the front matter above.
  Nothing is rendered from the body.
-->
