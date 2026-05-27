---
layout: post
title: "Tech & AI Digest – May 20, 2026"
date: 2026-05-20 09:00:00 +0530
categories: news
tags: [digest, ai, design, engineering]
read_time: 4
excerpt: "This week: context window wars, a quiet Figma update that matters, and why the best CLI tools are making a comeback."
---

A roundup of the things worth reading from the past two weeks.

## Context window wars are missing the point

Every major model provider announced larger context windows this month. The framing — "now you can fit your entire codebase!" — misses what actually limits usefulness. Retrieval quality, not window size, is the binding constraint for most applications. A model that can see 2 million tokens but attends poorly to the middle of its context is not twice as useful as one with 1 million tokens and better retrieval.

**Why it matters:** If you are building on top of these APIs, focus your engineering effort on chunking and retrieval strategy, not on stuffing more tokens into a single call.

---

## Figma quietly shipped variable fonts support

Buried in a patch release: Figma now supports variable font axes in the design panel. No announcement, no blog post. For teams working with modern typefaces that expose weight, width, and optical size as continuous axes, this removes a longstanding friction point — you no longer need to export to code to see how a variable font actually behaves at a given size.

**Why it matters:** Small teams doing their own typography can now prototype more accurately without leaving Figma.

---

## The CLI revival

Three well-funded developer tools launched terminal-first interfaces this month, reversing a five-year trend toward browser-based dashboards. The pattern: heavy keyboard users were churning from GUI tools and the teams followed them back to the terminal. Good reminder that the best interface is the one your user already has open.

**Why it matters:** If you are building developer tooling, a `--json` flag and solid stdin/stdout behaviour are worth more than a settings panel.
