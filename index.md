---
# ═════════════════════════════════════════════════════════════════
#  HOME — the whole portfolio lives in this file.
#
#  Everything below the front matter is the "About" prose.
#  Everything inside it is structured data rendered by _layouts/home.html.
#  Bullet strings accept inline Markdown (**bold**, `code`, [links](#)).
#
#  To change the page, change this file. Nothing else.
# ═════════════════════════════════════════════════════════════════
layout: home
title: Rishabh Sharma
description: >-
  Engineer working across AI agents, backends, and full-stack product.
  Currently running a live LLM agent over an HRIS platform at Kleeto.
  Previously shipped three B2B platforms end to end.
permalink: /

profile:
  name:      Rishabh
  surname:   Sharma
  # Shown as the small label above the name. Keep it short.
  role:      AI · Backend · Full-stack
  location:  Gurugram, India
  # Drop your photo at this path. Until it exists, an "RS" monogram renders.
  # The plate is a 1:1 crop, so a roughly square source works best.
  avatar:    /assets/img/profile.jpg
  avatar_caption: Gurugram, 2026
  status:    Building the live agent layer over Kleeto's HRIS platform
  tagline: >-
    **Engineer first.** AI is where I'm pointed right now: a live agent
    running over an entire HRIS platform. Under it sits the part that
    actually transfers, which is durable backends and two years of shipping
    full-stack product. I came up through Information Security, so I ask
    what breaks before I ask what ships.

links:
  - { label: GitHub,   url: "https://github.com/rishabh0111",       icon: github }
  - { label: LinkedIn, url: "https://linkedin.com/in/rishabh0111",  icon: linkedin }
  - { label: Email,    url: "mailto:rishabhsharma8912@gmail.com",   icon: mail }
  - { label: Writing,  url: "/blogs/",                              icon: pen }

# ── What I want to be believed about. Rendered as a 2×2 grid. ────
pillars:
  - title: Agents in production
    body: >-
      A live LLM agent over Kleeto's HRIS platform, covering the whole
      employee lifecycle. Five hundred people depend on it during their
      working day, which changes how you build the thing.
  - title: Security by design
    body: >-
      An Information Security specialization and CEH v11, spent on
      architecture. Guardrail-by-contract, approval-gated actions,
      RBAC-scoped retrieval. Five roles behind SSO at Zeonix, no access
      incidents in eighteen months.
  - title: Durable distributed backends
    body: >-
      Outbox pattern, idempotency, dead-lettering, HMAC signing, reconciler
      backstops. I design for the crash, on the theory that the happy path
      takes care of itself.
  - title: Full-stack, end to end
    body: >-
      Three B2B platforms owned from API design through Angular and React
      frontends, integrations, deployment, backups, and client onboarding.
      Some Solidity, a Selenium bot, a Capacitor mobile build. I don't hand
      off at the boundary.

# ── The numbers. Deliberately spanning all four pillars. ─────────
metrics:
  - { figure: "500+", label: employees served by the live agent }
  - { figure: "3",    label: B2B platforms shipped end-to-end }
  - { figure: "70%",  label: faster data ingestion at ZeoCRM }
  - { figure: "0",    label: successful prompt injections }

# ── Skills ───────────────────────────────────────────────────────
# `icon` picks an inline SVG from the {% case %} in _layouts/home.html.
# Valid: code · spark · chip · shield · server · database · window ·
#        cube · link · check · blocks · phone
skills:
  - group: Languages
    icon:  code
    items: [Python, JavaScript (ES6+), TypeScript, Node.js, C/C++, SQL]

  - group: AI & LLM Engineering
    icon:  spark
    items: [LangGraph, Model Context Protocol, RAG, LangChain, Qdrant, Embeddings,
            Prompt engineering, Eval harnesses, Guardrails, Langfuse, Multi-model routing]

  - group: Models
    icon:  chip
    items: [Anthropic Claude, OpenAI, Google Gemini, Groq, "Ollama (Llama, Qwen, Gemma, Kimi)"]

  - group: Security
    icon:  shield
    items: [CEH v11, OWASP LLM Top 10, Prompt-injection resistance, HMAC signing,
            JWT + RBAC, Adversarial testing, Rate limiting]

  - group: Backend
    icon:  server
    items: [FastAPI, Express.js, NestJS, GraphQL, Microservices, Outbox pattern,
            Idempotent processing, BullMQ, Redis, WSO2 SSO, OpenAPI]

  - group: Data
    icon:  database
    items: [PostgreSQL, MongoDB, MySQL, Redis, Neon, Supabase, Schema design, Query optimization]

  - group: Frontend
    icon:  window
    items: [React, Redux, Next.js, Angular, Tailwind CSS, RxJS, Material UI]

  - group: Infrastructure
    icon:  cube
    items: [Docker, Kubernetes, GitHub Actions, Jenkins, Nginx, Linux,
            "AWS (EC2, S3, RDS, Lambda, IAM)", "Azure (App Service, Blob)"]

  - group: Integrations
    icon:  link
    items: [Razorpay, ICICI Payments, Digilocker, Gmail API, Google Calendar,
            Microsoft Graph, Slack Bolt, Selenium, Metabase]

  - group: Testing & Quality
    icon:  check
    items: [Postman, Selenium WebDriver, Integration testing, Deterministic agent testing,
            In-memory fakes, Golden-task eval harnesses]

  - group: Blockchain & Web3
    icon:  blocks
    items: [Solidity, Ethereum, Avalanche C-Chain, Polygon, ERC-20, zkSNARK circuits, MetaMask]

  - group: Mobile
    icon:  phone
    items: ["Capacitor (iOS & Android)"]

# ── Experience ───────────────────────────────────────────────────
experience:
  - company: Kleeto
    legal:   Next Gen Paper Solutions Pvt. Ltd.
    role:    AI Engineer
    period:  May 2026 — Present
    place:   Gurugram
    current: true
    stack:   [Python, FastAPI, MCP, LangGraph, RAG, Claude, OpenAI]
    points:
      - >-
        Own the design and delivery of the **live AI agent layer over Kleeto's
        HRIS platform**, covering recruitment, onboarding, attendance, payroll,
        and offboarding, plus a separate document management system. Every
        module became natural-language self-service.
      - >-
        Architected the agent in **Python/FastAPI** as an **MCP tool surface**
        over platform modules, driven by a **LangGraph** orchestrator for
        planning and tool routing, with **RAG** grounding responses in HR
        knowledge and policy content.
      - >-
        Engineered security in from day one: least-privilege tool access,
        approval gates on sensitive actions, and RBAC-scoped retrieval. The
        agent can never see or do more than the requesting user could.
      - >-
        Held quality and cost to measured targets: **85%+ eval-verified task
        completion**, **zero successful prompt injections** across a 50+ case
        adversarial suite, **p95 ~6s** at **~$0.02 per resolved query**,
        traced end-to-end in Langfuse.
      - >-
        Routine HR queries now resolve **same-day through self-service**. The
        same question used to cost a 1–2 day ticket-and-reply cycle.

  - company: Zeonix Global Pvt. Ltd.
    role:    Software Developer
    period:  Jun 2024 — Apr 2026
    place:   Chandigarh
    stack:   [Node.js, Express, PostgreSQL, GraphQL, Angular, WSO2]
    summary: >-
      Designed and shipped **three production B2B platforms**, owning services
      end-to-end: API design, security, integrations, deployment, backups, and
      client onboarding.
    ventures:
      - name: ZeoCRM
        note: University management · all 40+ Australian universities
        points:
          - >-
            Cut university data-ingestion time **70%**, from ~3 hours of manual
            entry to under an hour per intake cycle, with a Node.js Excel
            pipeline that parsed, validated, and bulk-inserted 10,000+ records
            into PostgreSQL.
          - >-
            Improved average API response time **40% (~1.5s → ~900ms)** on the
            platform's highest-traffic endpoints (~10K requests/day) via
            server-side pagination, GraphQL query optimization, and DB indexing.
          - >-
            Secured 5 distinct user roles with product-module RBAC, WSO2 SSO, and
            JWT middleware. **Zero unauthorized-access incidents across 500+
            users over 18 months** post-launch.
          - >-
            Eliminated **4–6 hours/week** of repetitive admissions work with a
            Selenium bot, and cut commission processing from **2 days to
            same-day** by automating payouts across 100+ agent partners.

      - name: ZeoVerify
        note: Document verification & digital onboarding
        points:
          - >-
            Reduced manual verification effort **60% (~25 → ~10 minutes per
            application)** across hundreds of applications/month by integrating
            ICICI Payments, Razorpay, and Digilocker into an end-to-end digital
            onboarding flow.
          - >-
            Built an AI fraud-detection module on the **Google Gemini API**,
            generating analytical reports for suspect documents with
            user-feedback weighting. *My first production LLM feature, and the
            start of the AI track.*

      - name: ZeoForex
        note: Financial remittance & currency exchange
        points:
          - >-
            Reduced remittance order errors **35% (error rate ~8% → ~5%)** on
            live financial transactions by enforcing multi-step validation,
            tax-calculation logic, and atomic DB transactions across Multimoney
            API workflows.
          - >-
            Designed a multi-node invoicing system with a parent-child hierarchy
            supporting complex commission structures across agent networks.

# ── Projects ─────────────────────────────────────────────────────
projects:
  - name:     Webhook Delivery Engine
    year:     "2026"
    language: Node.js
    blurb:    Durable at-least-once delivery
    stack:    [Express, BullMQ, Redis, PostgreSQL, Docker, OpenAPI]
    body: >-
      A self-hostable webhook delivery engine. Every accepted event reaches one
      of two terminal states: **delivered**, or an **explicit, replayable
      failure**. Nothing is silently lost.
    points:
      - >-
        Implemented the **outbox pattern**: the event is persisted and committed
        *before* enqueue, and `jobId = event.id` makes duplicate enqueues no-ops.
        A failed enqueue is therefore harmless.
      - >-
        Made **Postgres authoritative** for business status with Redis/BullMQ as
        a disposable scheduler. The system survives total Redis data loss.
      - >-
        Closed the crash-after-commit gap with a **reconciler backstop** that
        re-enqueues non-terminal events with no live job.
      - >-
        Signed every delivery **Stripe-style (HMAC-SHA256)** over exact raw
        bytes, with constant-time comparison and a replay window.
      - >-
        Documented the conscious production gaps (authN, fan-out, FIFO ordering,
        SSRF hardening, KMS secret encryption) as scoped decisions with argued
        trade-offs.
    # link icons: github · external (live demo) · pen (write-up)
    links:
      - { label: Source,   icon: github,   url: "https://github.com/rishabh0111/webhook-delivery-engine" }
      - { label: Write-up, icon: pen,      url: "/blogs/webhook-delivery-engine" }

  - name:     MoviesWave
    language: JavaScript
    blurb:    Movie discovery app
    stack:    [React, Redux, Material UI, TMDb API]
    body: >-
      A movie discovery client built around aggressive client-side caching.
    points:
      - >-
        Cut redundant TMDb API calls **~50% in typical browse sessions**
        (measured via network-panel comparison) with Redux global state and
        client-side caching.
    links:
      - { label: Source, icon: github,   url: "https://github.com/rishabh0111/MoviesWave" }
      - { label: Live,   icon: external, url: "https://movieswave.netlify.app" }

  - name:     MetaMask ETH Bank
    language: Solidity
    blurb:    Decentralized banking
    stack:    [Ethereum, MetaMask]
    body: >-
      A smart contract supporting trustless deposits and withdrawals with
      MetaMask wallet auth and zero centralized backend.
    links:
      - { label: Source, icon: github, url: "https://github.com/rishabh0111/MetaMask-ETH-Bank" }

# ── Education ────────────────────────────────────────────────────
education:
  - degree: B.E. Computer Science Engineering
    detail: Specialization in Information Security
    school: Chandigarh University, Mohali
    period: Aug 2020 — May 2024
    score:  CGPA 8.02 / 10
    note: >-
      Cryptography & Network Security, DSA, Operating Systems, Computer
      Networks, DBMS, Cloud Computing, Compiler Design.

  - degree: Higher Secondary (12th) — Science
    detail: PCM + Computer Science
    school: Govt. Sr. Sec. School, Chotta Shimla
    period: Mar 2019
    score:  90% (HPBoSE)

# ── Certifications & awards ──────────────────────────────────────
# `url` makes the whole title a link. `links` renders a row of verify
# links underneath, for certs that are really several credentials.
certifications:
  - name: Certified Ethical Hacker (CEH) v11
    issuer: EC-Council · 2023–2026
    url: "https://aspen.eccouncil.org/VerifyBadge?type=certification&a=BO+LGPmvJfn9LVa/anUsUrQ9C3Ks8fH8j61tvvbF1TI="

  - name: React Basics & Advanced React
    issuer: Meta, via Coursera · 2023
    links:
      - { label: React Basics,   url: "https://www.coursera.org/account/accomplishments/verify/NNUZXDBFEGST" }
      - { label: Advanced React, url: "https://www.coursera.org/account/accomplishments/verify/ZYSRTRLQL85M" }

  # On-chain credentials, minted as Solana NFTs. Links resolve on Solscan.
  - name: ETH Proof · ETH+AVAX Proof · Poly Proof
    issuer: Metacrafters · Ethereum, Avalanche, Polygon
    links:
      - { label: ETH Proof,      url: "https://solscan.io/token/8vacs7DZRxNhrJihCsJMiHgLYtNw3mxBkAAtfRUK7Xrj" }
      - { label: ETH+AVAX Proof, url: "https://solscan.io/token/QDyELxrS3XqEfiXjB8seWTUEpVeumqBTbqBHsAs7JJL" }
      - { label: Poly Proof,     url: "https://solscan.io/token/Hj9NS5NBVeEeV77n3nF8Fhvmw2Ab68v5AgSNjwVgNt5t" }

awards:
  - name: Top 5 nationally — Intel oneAPI Hackathon
    note: Intel × IIT Roorkee. A compute-optimized solution built on Intel's oneAPI parallel-computing toolkit.
  - name: District Rank 1 — Mathematics Olympiad
    note: National Science Congress.

# ── Teaching / resources ─────────────────────────────────────────
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

My title says AI Engineer. It's accurate, and it's mostly beside the point. What
I care about is what a system does on its ten-thousandth call, at 3 a.m., with a
dependency down. I was asking that question years before any of it involved a
model.

It came from two years at Zeonix, shipping B2B platforms end to end: commission
engines, remittance flows, document verification. The failure modes were
financial and the users were real. I wrote the Postgres schemas and the Angular
reactive forms. I designed the GraphQL layer, then got paged when it was slow. I
built the Selenium bot that ate the admissions busywork, wired up the payment
gateways, owned the deploys, and wrote backup scripts I hoped never to need.
Somewhere in there I shipped a fraud-detection module on the Gemini API, and the
problem changed shape. A system that *reasons* fails in a way a system that
computes never does. It fails plausibly, and it sounds confident while doing it.

That's where the work sits now. At Kleeto I own the agent layer over an entire
HRIS platform, and the questions worth arguing about are almost never about
prompts. What is this tool allowed to do? Who is asking? What happens when
retrieval hands back a document the user was never cleared to see, and how would
I prove afterwards that it didn't? My Information Security specialization and the
CEH turned out to be prerequisites. An agent holding tools is an attack surface
that argues back.

Engineer is the only label I'm attached to. The LLM stack is the current
chapter, and I expect it to age the way every stack I've learned has aged. What
survives is knowing where state lives, what happens when the network lies, who is
allowed to do what, and how to ship a whole thing instead of the interesting
half. Hand me a Solidity contract, a Redux store, or a Postgres query plan and
I'll be just as happy.

Away from the terminal: chess, where I keep losing arguments with my own opening
repertoire.
