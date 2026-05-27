---
layout: post
title: "AI Engineering Digest – May 26, 2026"
date: 2026-05-26 09:00:00 +0530
categories: news
tags: [digest, ai-engineering, agents, mcp, inference, browser-agents]
read_time: 8 min
excerpt: "Anthropic splits the agent execution plane with self-hosted sandboxes and MCP tunnels; Google ships Gemini 3.5 Flash GA with a hard deprecation deadline for 2.0-generation models; Microsoft Research open-sources Webwright, a code-first browser agent harness with a 26-point Odysseys improvement."
---

Three distinct but convergent developments this week: both Google and Anthropic shipped production-grade agent infrastructure that moves execution control closer to the customer perimeter, while Microsoft Research published a reproducible architectural argument that code-generation beats click-prediction for browser agents. The dominant theme is managed agent infrastructure hardening. The single most important engineering takeaway: the agent execution plane is now a design choice, not a given — and all three platforms made that choice explicit this week.

---

## Anthropic splits the Claude agent execution plane with self-hosted sandboxes and MCP tunnels

Announced at Code with Claude London on May 19, Anthropic's Claude Managed Agents platform now ships two new capabilities: self-hosted sandboxes in public beta, and MCP tunnels in research preview.

The architectural split is precise. The agent loop — orchestration, context management, error recovery — continues to run on Anthropic's infrastructure. Tool execution moves to customer-controlled environments. Supported sandbox providers include Cloudflare (microVM-based), Daytona, Modal, and Vercel, or any runtime the customer brings. Customers control compute sizing, network policies, runtime images, and audit logging. Files, repositories, and proprietary packages do not leave the customer perimeter.

MCP tunnels address the complementary problem: reaching MCP servers on private networks without public exposure. A lightweight gateway deployed inside the enterprise makes a single outbound HTTPS connection — no inbound firewall rules, no public endpoints, traffic encrypted end-to-end. This allows agents to call internal databases, private APIs, and ticketing systems as MCP tools without those systems being exposed to the internet. A companion release note also documents that large tool outputs exceeding 100K tokens are now automatically spilled to a sandbox file rather than inflating the context window.

The research preview status on MCP tunnels means access requires a request; the sandbox public beta is open. Neither eliminates the orchestration dependency on Anthropic's servers, which remains a data-residency concern for the most sensitive environments.

**Why it matters:** Teams blocking Claude agent deployments on data residency grounds now have a concrete execution isolation path to evaluate — the compliance conversation shifts from "we can't" to "here are the controls we need to configure."

---

## Gemini 3.5 Flash ships GA with a mandatory 2.0-generation migration deadline of June 1

Google shipped Gemini 3.5 Flash as generally available on May 19 (model ID: `gemini-3.5-flash`, internal version `3.5-flash-05-2026`). Pricing is $1.50 input / $9.00 output per million tokens, with cached input at $0.15/M. Context window is 1,048,576 input / 65,536 output tokens. The model ships with dynamic thinking on by default, adjustable via thinking levels (minimal, low, medium, high). Artificial Analysis benchmarks put it at 203.6 tokens/second — above the reasoning-model median of 73.9 t/s at comparable price tiers.

Google's own claim — that 3.5 Flash outperforms Gemini 3.1 Pro on coding and agentic benchmarks (76.2% Terminal-Bench 2.1, 83.6% MCP Atlas) while running roughly 4× faster — is worth noting but not yet independently reproduced. Take the specific percentages with appropriate skepticism until third-party evals appear.

The harder, confirmed engineering fact is the deprecation deadline: `gemini-2.0-flash` and `gemini-2.0-flash-lite` shut down June 1, 2026, per Google's official pricing page. That is five days from this writing. Any production system still referencing those model IDs will return errors next week. The cost math on migration is non-trivial: 2.0 Flash was priced at $0.10 input / $0.40 output per Mtok. The obvious replacement, 2.5 Flash, costs $0.30 input / $2.50 output — 3× on input, 6× on output — and thinking tokens enabled by default can push effective output cost higher still unless `thinkingBudget: 0` is explicitly set. The like-for-like cost replacement is 2.5 Flash-Lite at $0.10/$0.40, which is GA-stable and raises the output token limit from 8K to 65K.

Separately, the Gemini Interactions API request/response schema changes on May 26 (today) — the `outputs → steps` field rename becomes default, with legacy schema removal on June 8.

**Why it matters:** The June 1 shutdown is a hard production incident waiting to happen; any team that hasn't confirmed their model ID strings are not pointing at 2.0-generation Gemini needs to do that today, and the migration path requires explicit thinking-budget configuration to avoid unexpected cost increases.

---

## Microsoft Research's Webwright replaces stateful browser sessions with reusable Playwright code

Microsoft Research's AI Frontiers lab released Webwright as an open-source, terminal-native browser agent framework in early May, with broader visibility arriving around May 24. The design premise: most browser agents fail because they treat the browser session as the workspace. Webwright inverts this — the agent writes Playwright code and bash commands in a terminal workspace; the browser is a process the agent launches, inspects, and discards. Persistent artifacts are code files and logs, not browser state.

The benchmark results are from Microsoft's own evaluation and haven't been independently reproduced externally, but the methodology is disclosed and the harness is open-source. On the Odysseys long-horizon benchmark (300 tasks, average instruction length 272 words), Webwright with GPT-5.4 scores 60.1% against a base GPT-5.4 score of 33.5% — a 26.6-point absolute gain attributed to the architectural harness rather than the model. On Online-Mind2Web (300 tasks, 136 sites), the same configuration reaches 86.7% within a 100-step budget. A secondary finding is operationally useful: Qwen3.5-9B with a pre-built tool library of reusable scripts reaches 66.2% on the Online-Mind2Web hard split — suggesting that smaller, cheaper models benefit disproportionately from code-first harnesses because the task of navigation is offloaded to deterministic Playwright scripts.

The framework is roughly 1,500 lines across three modules, supports OpenAI, Anthropic, and OpenRouter backends, and ships with plugin manifests for Claude Code, Codex, and OpenClaw. The gate self-check mechanism — requiring a clean-environment re-run before the agent can emit a completion signal — directly addresses the false-completion failure mode common in long-horizon browser tasks.

**Why it matters:** If the Odysseys gains hold under independent evaluation, the implication for browser automation architecture is significant: teams building web agents should be testing code-generation harnesses before investing further in screenshot/DOM click-prediction pipelines.

---

## WorkOS ships auth.md, a machine-readable service registration spec for agents

Announced at MCP Night 4 in San Francisco, WorkOS published auth.md: a draft specification for how services expose agent registration flows without requiring a human in the loop. A service publishes a Markdown file at a discoverable domain path describing what the service does, which auth flows it supports (OAuth ID-JAG, OTP email, anonymous), what scopes exist, and how a human can later claim an agent-created account.

This addresses a real gap: MCP's auth layer as currently specified requires a human to consent at registration time. Auth.md proposes an agent-native alternative where agents can register for services, acquire scoped credentials, and begin making API calls without manual setup. Three flow types are defined: an ID-JAG flow requiring IdP participation, an OTP email claim flow needing no provider coordination, and anonymous access with subsequent claim upgrade. Credentials are scoped, tied to a real user or org, and independently revocable. On any 401 from a previously-working credential, the spec calls for the agent to drop it and restart discovery.

This is a WorkOS-originated community specification, not an IETF standard. It has live demos with Cloudflare and Firecrawl but no broad adoption yet. The practical engineering question it raises is real regardless of whether auth.md specifically wins: MCP-based agent ecosystems need an automated registration primitive, and teams building services that agents consume will need to pick a posture on this before it is standardized.

**Why it matters:** Teams exposing internal or external services to MCP-capable agents now need to model automated agent registration as a design requirement, not an afterthought — auth.md is one early proposal for what that surface looks like.

---

## Further reading

https://thenewstack.io/anthropic-mcp-tunnels-sandboxes/
https://www.infoq.com/news/2026/05/claude-mcp-tunnels/
https://9to5mac.com/2026/05/19/anthropic-enhances-claude-managed-agents-with-two-new-privacy-and-security-features/
https://releasebot.io/updates/anthropic
https://llm-stats.com/blog/research/gemini-3.5-flash-launch
https://artificialanalysis.ai/models/gemini-3-5-flash
https://ai.google.dev/gemini-api/docs/pricing
https://ai.google.dev/gemini-api/docs/changelog
https://tokencost.app/blog/gemini-2-0-flash-deprecated-migration-cost
https://www.microsoft.com/en-us/research/articles/webwright-a-terminal-is-all-you-need-for-web-agents/
https://github.com/microsoft/webwright
https://www.marktechpost.com/2026/05/24/microsoft-research-releases-webwright-a-terminal-native-web-agent-framework-that-scores-60-1-on-odysseys-up-from-base-gpt-5-4s-33-5/
https://workos.com/blog/mcp-night-4-recap-auth-md-agentic-registration
https://www.marktechpost.com/2026/05/25/workos-releases-auth-md-an-open-agent-registration-protocol-built-on-oauth-standards/
https://apidog.com/blog/google-antigravity-2/
https://openrouter.ai/google/gemini-3.5-flash
