---
# ═════════════════════════════════════════════════════════════════
#  HOME — all of the page's content lives in this front matter.
#  _layouts/home.html renders it as the dossier layout: a stack of
#  section cards, one content width top to bottom. A left-margin rail
#  names the section you are reading (and a compact heading stands in
#  for it on narrow screens).
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
  AI engineer. I build assistants companies can trust: a live one inside
  Kleeto's HR platform, a shared help desk that keeps every company's data
  apart, and three business platforms before those.
permalink: /

profile:
  name:      Rishabh
  surname:   Sharma
  role:      AI · Backend · Security
  location:  Gurugram, India
  avatar:    /assets/img/profile.jpg
  avatar_caption: Gurugram, 2026
  status:    Building the AI assistant inside Kleeto's HR platform
  tagline: >-
    I build **AI assistants that companies can actually trust**, and the
    backends underneath them. I trained in security, so I ask how something
    breaks before I ask when it ships.

links:
  - { label: GitHub,   url: "https://github.com/rishabh0111",       icon: github }
  - { label: LinkedIn, url: "https://linkedin.com/in/rishabh0111",  icon: linkedin }
  - { label: Email,    url: "mailto:rishabhsharma8912@gmail.com",   icon: mail }
  - { label: Writing,  url: "/blogs/",                              icon: pen }

# ── Pillars — the three claims, shown inside "About" ─────────────
# Three claims, and only three. More would dilute each one.
# "Full-stack" is deliberately not a pillar: it is evidence inside
# the work below, where it is more convincing than as a claim.
pillars:
  - title: AI that real people use
    icon:  spark
    body: >-
      An assistant inside Kleeto's HR platform, used by 500+ employees across
      six parts of the system. Plus Nivara Desk, where the AI hands the question
      to a person rather than guess at it.
  - title: Security built in, not added later
    icon:  shield
    body: >-
      A security degree and a CEH certificate, used on design rather than
      audits. I prefer making a mistake impossible over writing a rule that
      asks people not to make it.
  - title: Backends that survive a bad day
    icon:  server
    body: >-
      Retries, duplicate protection, signed requests, jobs that resume after a
      crash. I design for the thing going wrong, because the version where
      everything works takes care of itself.

# ── Metrics ──────────────────────────────────────────────────────
# Deliberately one per pillar, plus the track record.
metrics:
  - { figure: "500+",  label: employees using the assistant }
  - { figure: "93.6%", label: right call on a test of 600 questions }
  - { figure: "0",     label: attempts to trick the AI that worked }
  - { figure: "4",     label: platforms shipped start to finish }

# ═════════════════════════════════════════════════════════════════
#  PROJECTS — one section, however many entries. Add a project here
#  and the page grows; nothing in _layouts/home.html needs touching.
#
#  Every project renders the same way, top to bottom:
#    heading → horizontal strip of `shots` → the write-up
#    (`promise`, `body`, `points`, `glance`) → `parts` as cards
#    stacked one per row → `links`.
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
      Four ways to log in, one set of rules — so *"is this person allowed to see
      this ticket?"* has the same answer everywhere.

    body: >-
      Someone asks a question from a chat box on their supplier's website. It
      becomes a real ticket in the support queue with a response clock running.
      The AI answers if it is confident; otherwise a person picks it up.

    shots:
      - { src: /assets/img/nivara/queue.light.png,       src_dark: /assets/img/nivara/queue.dark.png,       alt: "Support queue with response clocks",  caption: "The support queue" }
      - { src: /assets/img/nivara/ticket.light.png,      src_dark: /assets/img/nivara/ticket.dark.png,      alt: "A ticket showing the AI's answer",    caption: "One ticket, and how the AI answered it" }
      - { src: /assets/img/nivara/widget.host.light.png, src_dark: /assets/img/nivara/widget.host.dark.png, alt: "Chat widget on another company's page", caption: "The chat box, on someone else's site" }
      - { src: /assets/img/nivara/analytics.light.png,   src_dark: /assets/img/nivara/analytics.dark.png,   alt: "Analytics dashboard",                 caption: "Analytics, behind its own permission" }

    glance:
      - { k: Guarantee, v: "One company can never see another's data — the database enforces it, not the code" }
      - { k: Built with, v: "Postgres row-level security · a trained answer gate · replayable tests" }
      - { k: Size,      v: "4 apps · 3 services · 18 permissions · 550 labelled test questions" }
      - { k: Runs on,   v: "Free hosting, and `docker compose up` with no API keys" }

    parts:
      - id:    ai
        label: AI layer
        lang:  Python
        stack: [FastAPI, Hybrid RAG, Qdrant, MCP, Langfuse, pytest]
        blog:  /blogs/nivara-desk-part-four/
        promise: >-
          Anything the model writes on its own can never reach a customer.
        points:
          - >-
            Made the right call on **93.6% of a 600-question eval** (595 of 600)
            by routing every answer through a trained gate that decides when to
            reply and when to fetch a human — money questions always go to a
            human.
          - >-
            Put the right document first **94.2% of the time** with hybrid
            retrieval over Qdrant, and every reply is built from one of those
            real documents — so a made-up answer is **impossible rather than
            unlikely**.
          - >-
            Held wrongful escalations to **6.8%** (sent to a human when it could
            have answered) and kept the full eval **free to re-run ($0)** by
            recording model responses once and replaying them.

      - id:    api
        label: API
        lang:  TypeScript
        stack: [NestJS, Prisma, PostgreSQL RLS, PgBouncer, Socket.IO, Redis]
        blog:  /blogs/nivara-desk-part-two/
        promise: >-
          Forget the company filter on a query and you get nothing back — never
          someone else's data.
        points:
          - >-
            Postgres itself blocks the rows, so a mistake in the code cannot leak
            them. Asking for another company's ticket returns **404, not 403** —
            saying "forbidden" would confirm the ticket exists.

      - id:    web
        label: Front ends
        lang:  TypeScript
        stack: [Next.js 15, React 19, Tailwind v4, TanStack, Shadow DOM, Playwright]
        blog:  /blogs/nivara-desk-part-three/
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
      - { label: Write-up, icon: pen,      url: "/blogs/nivara-desk-part-one/" }

  - name:     Webhook Delivery Engine
    year:     "2026"
    kind:     Systems
    blurb:    Sends webhooks and never loses one, even when things break
    languages: [Node.js]

    promise: >-
      Once the API says `202`, the event is either delivered or recorded as
      failed — and every attempt in between is written down.

    body: >-
      There is no fourth outcome where an event quietly disappears. That is the
      whole point, and the hardest part to keep true.

    # A light UI, and readable on both themes, so no `src_dark`.
    shots:
      - { src: /assets/img/webhook/dashboard.png, alt: "Operator dashboard showing live counters and demo controls", caption: "The operator dashboard" }
      - { src: /assets/img/webhook/events.png,    alt: "Event list showing a dead-lettered event and two retrying",  caption: "Every attempt, including the failures" }

    glance:
      - { k: Guarantee, v: "Accepted once · delivered at least once · never silently lost" }
      - { k: Built with, v: "Outbox pattern · dead-letter queue with replay · signed requests" }
      - { k: Runs on,   v: "$0 of hosting" }

    points:
      - >-
        **Postgres holds the truth; Redis is only a scheduler.** That sounds
        minor and it is the whole design — the entire Redis instance can be wiped
        without losing a single event.
      - >-
        A process can die between saving an event and queueing it. A **sweeper**
        runs every few minutes and picks up anything left stranded in that gap.

    stack: [Express, BullMQ, Redis, PostgreSQL, Docker, OpenAPI]
    links:
      - { label: Live demo, icon: external, url: "https://webhook-delivery-engine-on21.onrender.com/dashboard" }
      - { label: API docs,  icon: external, url: "https://webhook-delivery-engine-on21.onrender.com/docs" }
      - { label: Source,    icon: github,   url: "https://github.com/rishabh0111/webhook-delivery-engine" }
      - { label: Write-up,  icon: pen,      url: "/blogs/webhook-delivery-engine/" }

# ── Smaller projects — a line each ───────────────────────────────
projects_small:
  - name: MoviesWave
    language: JavaScript
    line: >-
      A film browser. Caching in the browser cut repeat calls to the film
      database by **about half** in a normal browsing session.
    links:
      - { label: Source, icon: github,   url: "https://github.com/rishabh0111/MoviesWave" }
      - { label: Live,   icon: external, url: "https://movieswave.netlify.app" }
  - name: MetaMask ETH Bank
    language: Solidity
    line: >-
      A smart contract for deposits and withdrawals, using a crypto wallet to
      sign in. No server involved.
    links:
      - { label: Source, icon: github, url: "https://github.com/rishabh0111/MetaMask-ETH-Bank" }

# ═════════════════════════════════════════════════════════════════
#  EXPERIENCE — three bullets at Kleeto, two per Zeonix venture.
#  `logo` is the company mark; add `logo_dark` only for a wordmark
#  that needs a second version to read on the dark theme.
# ═════════════════════════════════════════════════════════════════
experience:
  - company: Kleeto
    legal:   Next Gen Paper Solutions Pvt. Ltd.
    # A wordmark, so it needs both grounds: the colour mark is
    # invisible on the dark theme and the white one on the light.
    logo:      /assets/img/logos/kleeto.light.png
    logo_dark: /assets/img/logos/kleeto.dark.png
    role:    AI Engineer
    period:  May 2026 — Present
    place:   Gurugram
    current: true
    stack:   [Python, FastAPI, MCP, LangGraph, RAG, Claude, OpenAI]
    points:
      - >-
        I own the **AI assistant inside Kleeto's HR platform** — hiring,
        onboarding, attendance, payroll, leaving, and the document system. Staff
        now ask for things in plain English instead of hunting through screens:
        **500+ employees, 6 parts of the platform, 18 actions the assistant can take**.
      - >-
        Built in **Python and FastAPI**. The assistant plans what to do, looks
        up the relevant HR policy, and answers from it rather than from memory.
        Security came first: it asks for approval before anything sensitive, and
        **it can never see or do more than the person asking it**.
      - >-
        Measured, not assumed: **85%+ of tasks completed correctly**, **no
        successful attempt** to trick it out of 50+ tries, answers in about
        **6 seconds** for roughly **2 cents each**. Everyday HR questions are
        now answered **the same day** instead of taking one to two.

  - company: Zeonix Global Pvt. Ltd.
    # The full wordmark. "nix Global" is near-black, so it needs a
    # lifted version to stay readable on the dark theme.
    logo:      /assets/img/logos/zeonix.light.png
    logo_dark: /assets/img/logos/zeonix.dark.png
    role:    Software Developer
    period:  Jun 2024 — Apr 2026
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
            day, and set up single sign-on with five permission levels —
            **no unauthorised access in 18 months across 500+ users**.
      - name: ZeoVerify
        note: Document verification & digital onboarding
        points:
          - >-
            Cut document checking from about **25 minutes to 10** per
            application. Instead of accepting an uploaded scan, the system asks
            permission and **fetches the document from the government directly**,
            so there is nothing to forge.
          - >-
            Built the document-checking service on **Google's Gemini**, kept
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
#  SKILLS — rendered as a logo grid. Each item is looked up in
#  _data/tech_logos.json; anything with no brand mark renders as an
#  initialled badge on purpose. Add an item, then re-run
#  `python _templates/logos/build_logos.py` to pull its mark in.
# ═════════════════════════════════════════════════════════════════
skills:
  - group: Languages
    icon:  code
    items: [Python, TypeScript, JavaScript, Node.js, SQL, C/C++]
  - group: AI & LLM Engineering
    icon:  spark
    items: [LangGraph, MCP, RAG, LangChain, Qdrant, Embeddings, Eval harnesses,
            Guardrails, Langfuse, Prompt engineering, Multi-model routing]
  - group: Models
    icon:  chip
    items: [Anthropic Claude, OpenAI, Google Gemini, Groq, "Ollama (Llama, Qwen, Gemma)"]
  - group: Security
    icon:  shield
    items: [CEH v11, OWASP LLM Top 10, Postgres RLS, Prompt-injection resistance,
            HMAC signing, JWT + RBAC, Adversarial testing]
  - group: Backend
    icon:  server
    items: [FastAPI, NestJS, Express.js, GraphQL, Outbox pattern, Idempotency,
            BullMQ, Redis, Socket.IO, WSO2 SSO, OpenAPI]
  - group: Data
    icon:  database
    items: [PostgreSQL, MongoDB, MySQL, Redis, Qdrant, Prisma, Schema design,
            Query optimization]
  - group: Frontend
    icon:  window
    items: [React, Next.js, Angular, Redux, TanStack Query, Tailwind CSS, RxJS]
  - group: Infrastructure
    icon:  cube
    items: [Docker, Kubernetes, GitHub Actions, Jenkins, Nginx, Linux,
            "AWS (EC2, S3, RDS, Lambda, IAM)", "Azure (App Service, Blob)"]
  - group: Testing & Quality
    icon:  check
    items: [pytest, Jest, Vitest, Playwright, Supertest, MSW, Selenium, Postman]
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
  that is still how I build. I care most about what a model can reach, whose
  permissions it borrows, and whether I can reproduce every number I publish from
  a clean clone.

# ── Background — education, certs, awards compacted ───────────────
education:
  - degree: B.E. Computer Science Engineering
    detail: Specialization in Information Security
    school: Chandigarh University, Mohali
    period: Aug 2020 — May 2024
    score:  CGPA 8.02 / 10
  - degree: Higher Secondary (12th) — Science
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
  - name: Top 5 nationally — Intel oneAPI Hackathon
    note: Intel × IIT Roorkee.
  - name: District Rank 1 — Mathematics Olympiad
    note: National Science Congress.

resources:
  - { name: "DBMS — a full tutorial", url: "https://iamrishabhsharma.notion.site/DataBase-Management-System-DBMS-98f325fc3e1c44e1976d7d1773525ec4" }
  - { name: "Computer Networking — a full tutorial", url: "https://iamrishabhsharma.notion.site/Computer-Networking-6673ce922d3b4685abdb77ad0a1fef94" }
  - { name: "Data Structures & Algorithms in C++", url: "https://github.com/rishabh0111/DataStructures-Algorithms" }

interests: [Chess, Technical writing, 10-finger typing, Infrastructure spelunking]

contact:
  line: >-
    Open to AI, backend, and full-stack engineering roles at product companies
    and funded startups. Bangalore, Delhi NCR, Gurugram, Pune, Mumbai,
    Chandigarh, remote, or relocation-sponsored.
  email: rishabhsharma8912@gmail.com
---

<!--
  The essay now lives in the `about:` key above so the layout can place
  it in the dossier grid. Nothing is rendered from the body.
-->
