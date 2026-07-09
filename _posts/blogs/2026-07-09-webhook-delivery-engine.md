---
layout: post
title: "I built a webhook delivery engine to learn distributed systems the hard way"
date: 2026-07-09 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [distributed-systems, webhooks, reliability, postgres, engineering]
read_time: 15
permalink: /blogs/webhook-delivery-engine/
excerpt: "A deep dive into durability, idempotency, and the surprisingly large gap between COMMIT and 'enqueue a job.'"
---

Think about the last time you bought something online. You hit Pay, and within a second or two
a lot of things happened at once: a confirmation email landed in your inbox, the store's
warehouse got told to start packing, maybe your bank pinged your phone. You didn't do any of
that. The payment happened in one system, but a handful of other systems found out about it
almost instantly.

How? The short answer is a webhook, and it's one of the quiet workhorses of the modern
internet. The idea is simple: when something important happens in System A (a payment clears),
System A sends a little message over the internet to System B (the email service) that basically
says "hey, this just happened, here are the details." That's it. A webhook is one computer
tapping another on the shoulder.

So far, so boring. I assumed it was a solved, one-line problem too. Just send a message to a
URL. Then I actually tried to build one I could trust, and I ran straight into the part nobody
puts on the brochure.

## The catch: that little message can quietly vanish

The internet is not a reliable courier. When System A sends its "you've been paid" message, any
number of things can go wrong:

- System B might be down for a moment, or busy, or slow.
- The network might drop the message somewhere in between.
- System A itself might crash in the half-second right after the payment, before it ever got the
  message out.

And here's the cruel part, the part that turns "send a message" into a genuinely hard problem:
when it fails, it usually fails silently. Nobody gets an error. The payment still went through,
so the customer is happy. But the warehouse never heard about it, so the order never ships. The
money moved, and the message about the money simply evaporated. No alarm, no log, no trace. Days
later someone files a support ticket asking where their package is.

That's the problem this whole project exists to kill: an event happens, but the news of it gets
lost, and no one finds out until it's already a problem.

![The problem: an event happens, but the news of it gets lost silently](https://rishabh0111.github.io/assets/img/blogs/webhook-delivery-engine/the-problem.png)

The fix sounds easy. Just try again if it fails. But that innocent sentence hides a whole nest
of follow-up questions. Try again how many times? What if it failed because the message was bad
and will never work? What if the retry causes the customer to get charged, or emailed, twice?
What if your own server dies in the exact instant between recording the payment and sending the
message, and now how would you even know there was a message you still owed?

That last question is the rabbit hole. Answering it properly is the difference between a toy and
a piece of infrastructure you can actually rely on.

So I built one from scratch to force myself to confront every one of those questions: a
self-hostable webhook delivery engine in Node.js, backed by Postgres and Redis, that makes a
precise promise about every event it accepts and never lets one vanish silently.

What follows is the story of the decisions behind it. If you want the code first:
[github.com/rishabh0111/webhook-delivery-engine][repo]. Around 2.5k lines, fully tested, runs
on $0 of infrastructure.

---

## The promise the system makes

Most of building this thing was about being able to state one sentence precisely and then never
violating it:

> Once the API returns `202`, the event will reach exactly one terminal state, `delivered` or
> `dead`, and every attempt in between is recorded and auditable.

Unpacked, that's a specific set of delivery guarantees, and naming them mattered:

- **Exactly-once acceptance.** The same event submitted twice (same idempotency key) is stored
  once. No duplicate work, no duplicate delivery.
- **At-least-once delivery.** I will deliver your event one or more times until a receiver
  acknowledges it, so receivers have to be idempotent, exactly like with Stripe or GitHub. I
  send a stable event ID on every attempt precisely so they can dedup.
- **No silent loss.** Every accepted event is either `delivered`, or `dead` with a recorded
  reason and a one-click replay path. There is no fourth state where an event quietly vanishes.
  That third guarantee is the whole point, and it's the hardest one to keep.

Everything below is in service of those three lines.

---

## The architecture, in one picture

![Webhook Delivery Engine, system architecture](https://rishabh0111.github.io/assets/img/blogs/webhook-delivery-engine/architecture-overview.png)

There aren't many moving parts. The entire design hangs off a single decision about who is
allowed to be the source of truth:

> Postgres is authoritative for business state. Redis/BullMQ is a disposable scheduler.

That reads like a throwaway line, but it's the load-bearing wall. It means I can lose my entire
Redis instance, every queued job gone, and not lose a single event or violate the promise. The
queue is just a fast, convenient way to schedule work. The truth of "has this been delivered?"
lives only in a database I treat as sacred. Almost every good decision in this project is a
corollary of that one.

The pipeline is ingest, durably persist, commit, enqueue, deliver, with an Express API and a
BullMQ worker in one Node process, a periodic reconciler as a safety net, and an operator-driven
replay path out of the dead-letter store.

---

## Decision #1: the dual-write problem, and finding the point of no return

Here's the trap, and it has a name. The naive ingestion handler does two writes to two systems:

```
1. INSERT event into Postgres
2. enqueue a delivery job in Redis
3. return 202 Accepted
```

This is the dual-write problem, and it's broken in a way that's invisible until it isn't. What
happens if step 2 fails? Redis blips, the process gets OOM-killed, a deploy cycles the
container, and now you've told the caller `202 Accepted` while no job exists and nothing will
ever deliver that event. It sits in the database, `pending`, forever. Silent, unrecoverable
loss, and it violates guarantee #3 on day one.

The fix is the transactional outbox pattern, and the insight that made it click for me was being
ruthless about which exact line is the point of no return:

![Event ingestion, the outbox pattern](https://rishabh0111.github.io/assets/img/blogs/webhook-delivery-engine/event-ingestion.png)

```
1. INSERT event (status = pending)  -- ON CONFLICT (idempotency_key) DO NOTHING
2. COMMIT                            <-- the durable point of no return
3. enqueue job (jobId = event.id)   -- allowed to fail. genuinely.
4. return 202 Accepted
```

Once the Postgres `COMMIT` lands, the engine has promised. Step 3 is now allowed to fail,
because two other mechanisms catch it:

- The reconciler (a background sweep) finds any event that's `pending` with no live job and
  re-enqueues it.
- Setting `jobId = event.id` makes a duplicate enqueue a harmless no-op. Re-adding a job that
  already exists does nothing.

That second point also closes idempotency for free. The same `Idempotency-Key` twice hits `ON
CONFLICT DO NOTHING`, returns the existing event (`200` instead of `202`), and never spawns a
second delivery. So exactly-once acceptance and at-least-once delivery both fall out of one
schema constraint plus one deliberate job ID.

What this reframed for me: "durable" isn't really a property of a system, it's a property of a
specific line. Find that line, name it out loud, and design everything after it on the
assumption that it's allowed to crash.

---

## Decision #2: not all failures deserve a retry

The lazy move is to retry every failure. But hammering a `401 Unauthorized` five times over
fifteen minutes is pointless. The receiver is telling you, unambiguously, that you're never
getting in. A `503`, on the other hand, genuinely deserves another shot. Treating those two the
same wastes work and delays the dead-letter that an operator actually needs to see.

So the worker classifies every outcome:

![Delivery worker, outcome classification and retries](https://rishabh0111.github.io/assets/img/blogs/webhook-delivery-engine/delivery-worker.png)

| Outcome | Decision |
| --- | --- |
| `2xx` | delivered, done |
| `5xx`, timeout, network error, `429`, `408` | transient: retry, exponential backoff (~60s, 120s, 240s, 480s, 5 attempts) |
| any other `4xx` (`400`, `401`, `404`, ...) | permanent: dead-letter immediately, don't waste retries |

The detail I'm proud of: `408` (Request Timeout) and `429` (Too Many Requests) are 4xx codes,
but they're classified as transient. They mean "later," not "never." You only get that right by
reading how the big providers actually behave, not by eyeballing the status-code ranges. In code
it collapses onto BullMQ's two error types:

```js
// Permanent client error -> dead-letter now, no further attempts.
if (statusCode !== null && isPermanentStatus(statusCode)) {
  throw new UnrecoverableError(`permanent failure: status ${statusCode}`);
}
// Everything else is transient -> a plain Error, so BullMQ reschedules with backoff.
throw new Error(errorText || `retryable response: status ${statusCode}`);
```

Two lines hold the entire retry philosophy. And the failure mode I'm most glad I handled:
timeouts use an `AbortController` with a hard per-attempt deadline. A receiver that accepts the
connection and then hangs is the nastiest case there is. Without that deadline, a single dead
endpoint can pin a worker indefinitely and starve every other delivery. Backpressure isn't
optional here. It's the difference between one slow receiver and a dead queue.

---

## Decision #3: the reconciler, a backstop for the gap I couldn't close

The outbox shrinks the danger window but can't erase it. There's still a sliver between the
`COMMIT` and the enqueue. If the process dies exactly there, the event is orphaned. Rare, but
"rare" is not "never," and a system you can trust handles "never."

So I added the reconciler, a repeatable job (roughly every 15 minutes) that asks one question:
are there non-terminal events with no live job?

![Reconciler, outbox backstop](https://rishabh0111.github.io/assets/img/blogs/webhook-delivery-engine/reconciler.png)

It scans Postgres for events stuck `pending` past a threshold or `delivering` gone stale, looks
each up in BullMQ, and re-enqueues anything with no live job. One mechanism covers two disasters:

1. The crash-after-commit gap above.
2. Total loss of Redis. If the disposable scheduler evaporates, the reconciler rebuilds the work
   queue from the source of truth. The system self-heals, which is the entire reason I was
   allowed to call Redis disposable in the first place.

There's a constraint hidden in the cadence, too. The free-tier Postgres I targeted autosuspends
when idle, and a chatty backstop polling every 30 seconds would keep it permanently awake.
Fifteen minutes is a deliberate trade between recovery latency and letting the database sleep.

A backstop you run constantly isn't really a backstop, it's a load generator. Design your safety
nets to be quiet.

---

## Decision #4: replay, without ever double-delivering

When an event dead-letters, it's usually the receiver that was broken, not the engine. Once it's
fixed, an operator should be able to say "try that one again." That's replay, and the danger is
obvious the moment you picture an impatient operator double-clicking the button. You must not
deliver twice, and two replays must not race.

![Replay, recovering a dead-lettered event](https://rishabh0111.github.io/assets/img/blogs/webhook-delivery-engine/replay.png)

The guard is one atomic statement. No application locks, no race window:

```sql
UPDATE event SET status = 'pending' WHERE id = $1 AND status = 'dead'
```

If `rows updated = 1`, this caller won the replay and proceeds. If `0`, the event wasn't
actually `dead` (already replayed, or never dead) and the API returns `409 Conflict`. The
database does the mutual exclusion. Then I remove the stale failed job, re-enqueue, and stamp
`replayed_at` last, so a crash mid-replay leaves a safe, retryable state rather than a
half-finished one.

This is the recurring theme of the whole project: let the database be the referee. Atomic
conditional `UPDATE`s are a concurrency primitive I now reach for constantly and used to reach
for never.

---

## Decision #5: signing the exact bytes, not a re-serialization

If a receiver is going to act on a webhook, it has to know the webhook is really from me. The
standard answer is an HMAC signature, and the part that's subtly, painfully easy to get wrong is
which bytes you sign. My rule: sign the exact raw bytes that go over the wire.

```
HMAC-SHA256(secret, timestamp + "." + raw_body)
```

If I parsed the incoming JSON into an object and re-stringified it before signing, the receiver,
who recomputes the HMAC over the raw body they received, could get a different hash from a single
difference in whitespace, key order, or unicode escaping. The signature would fail for no real
reason. So the API is shaped around this: routing metadata (subscription ID, idempotency key)
rides in headers, leaving the body as the untouched payload, stored and signed and delivered
byte-for-byte.

Each signed delivery carries a stable `X-Webhook-Id` (dedup across retries), an
`X-Webhook-Timestamp` (so receivers can reject stale or replayed requests), and the
`X-Webhook-Signature`. Verification uses a constant-time comparison to avoid timing attacks.
Small details, but they're the line between "I added auth" and "I added auth that holds up."

---

## The constraint that made the project real: $0 of infrastructure

This is where it stopped being a textbook exercise. I wanted it to deploy and stay running for
free, which forced the architecture to bend around free-tier metering, and those bends taught me
more about trade-offs than any unlimited sandbox could:

- **One process, two roles.** API and worker share a Node process because the target free host
  offers no separate worker dyno. This bugged me, since it's not how you'd scale, so the worker
  is fully isolated in its own module and splitting it is a one-line deployment change. I haven't
  done it, and I say so.
- **Memory-metered Redis (`noeviction`).** Successful jobs are dropped immediately
  (`removeOnComplete: true`) to reclaim space. Failed jobs are kept (`removeOnFail: false`)
  because replay needs them. Concurrency caps at 5, enough that one slow receiver can't stall the
  queue, low enough to fit the memory budget.
- **An autosuspending database**, which is the reason the reconciler is lazy rather than eager.

Being forced to design inside hard limits sharpened every "disposable vs. authoritative"
decision, because the disposable thing could genuinely vanish at any moment.

---

## The bugs that actually cost me time

The things that never make it into the tidy final diagram:

- **BullMQ's `failed` event fires on every attempt, not just the last.** My first dead-letter
  logic wrote a dead-letter row on the first `503`, before retries even began. The fix:
  dead-letter only when `job.attemptsMade >= job.opts.attempts` (or on an `UnrecoverableError`).
  Obvious in hindsight, an hour of real confusion in the moment.
- **Worker and producer need separate Redis connections.** Workers issue blocking commands, and
  sharing the producer's connection causes mystifying stalls. Also, `maxRetriesPerRequest: null`
  is mandatory on the worker connection or BullMQ refuses to boot.
- **`attempt_number` must survive replays.** I compute it as `MAX(attempt_number) + 1` per event
  rather than resetting, so a replayed event's audit trail reads as one continuous story instead
  of restarting at 1. Tiny thing, but it's what makes the log trustworthy.
- **Demoing time-delayed, async behavior is its own problem.** A real "retries exhausted ->
  dead-letter" takes around 15 minutes, and nobody watches a demo that long. So I built a runtime
  "fast mode" that compresses backoff to about 2s with no redeploy and no env change. It touches
  only newly-enqueued jobs and leaves production timing untouched. Making the system demonstrable
  was a genuine engineering task on its own.

---

## What I deliberately left out, and why

The most useful thing you can do on a portfolio project is be honest about its edges. This isn't
a production webhook platform, and pretending otherwise would be the real red flag. So here's
what I consciously scoped out, each a known, bounded piece of work rather than an oversight:

- **Auth / multi-tenancy.** The API is open. Production needs API keys or OAuth and per-tenant
  isolation. Omitted to keep the focus on delivery semantics.
- **Topic fan-out** (one event to many subscribers) would mean splitting the `event` row from a
  per-target `delivery` entity, each with its own status. The right model, but a real schema
  change.
- **Per-subscription FIFO ordering** is not guaranteed (neither is it by most providers). It
  needs per-subscription serialization.
- **Secret encryption at rest.** Secrets are plaintext because they have to be readable to sign
  each delivery. They're not passwords, so you can't hash them. Production would use envelope
  encryption / KMS.
- **SSRF hardening.** Target URLs aren't yet validated against private or link-local ranges.
- **Honoring `Retry-After` on `429`.** Currently retried with normal backoff.

Writing this list was the most clarifying part of the whole project. It's where I learned to tell
the difference between "a hard problem I solved well" and "a hard problem I'm choosing not to
solve yet." Knowing that boundary is most of the job.

---

## What I'd tell myself three weeks ago

1. **Pick your source of truth and defend it like your life depends on it.** Every good decision
   here traces back to "Postgres authoritative, Redis disposable."
2. **The database is a better concurrency engine than your application code.** Atomic conditional
   `UPDATE`s replaced every lock I thought I'd need.
3. **Find the exact line that makes data durable, then let everything after it fail**, and build
   the backstop that cleans up when it does.
4. **Constraints are a feature.** The free-tier limits didn't dilute the project. They're the
   reason it has a point of view.

It was the most fun I've had being paranoid about failure. If you build webhooks after reading
this and remember to set a per-attempt timeout, my work here is done.

---

## Project at a glance

| | |
| --- | --- |
| **Stack** | Node.js, Express, BullMQ, PostgreSQL, Redis, Zod, Pino, Jest |
| **Guarantees** | exactly-once acceptance, at-least-once delivery, no silent loss |
| **Patterns** | transactional outbox, dead-letter + replay, reconciliation, HMAC signing |
| **Code** | [github.com/rishabh0111/webhook-delivery-engine][repo], MIT |
| **Live demo** | one-click walkthrough of every delivery outcome, Swagger docs, operator dashboard |

[repo]: https://github.com/rishabh0111/webhook-delivery-engine

*Built and written by Rishabh Sharma. The repo ships a live dashboard, Swagger docs, and a
self-contained demo of every delivery path: happy, retrying, timing out, and dying.*
