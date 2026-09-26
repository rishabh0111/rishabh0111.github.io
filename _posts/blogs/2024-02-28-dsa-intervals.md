---
layout: post
title: "Interval problems are a sort plus one number: where the current block ends"
date: 2024-02-28 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 12
series_total: 19
tags: [dsa, intervals, sweep-line, python, series]
read_time: 27
permalink: /blogs/dsa-intervals/
excerpt: "Almost every interval problem opens the same way: sort by start, then sweep while remembering one end time, or a heap of them. This part teaches the overlap test, the merge sweep and concurrency counting on a single day of studio bookings."
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers intervals: the overlap test, the merge sweep, and counting how many ranges are alive at once, all worked on one day of studio bookings.

Intervals are pairs of numbers that mean "from here to there": meetings, bookings, IP ranges, video segments, loan periods. The problems look different on the surface, but nearly all of them reduce to three moves: decide whether two intervals overlap, sweep a sorted list while growing a block, and count how many intervals are alive at once. This part comes right after [Heap / Priority Queue](/blogs/dsa-heaps/) because the third move is a min-heap of end times, and it runs alongside [Greedy](/blogs/dsa-greedy/), which picks up the question of which intervals to keep. There are no separate prerequisites here, so the single module below is "Intervals" itself, taught as the foundation.

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Intervals

### Foundation

Picture a recording studio with one shared booking sheet. Each line is a slot like 9 to 13. The questions people ask about that sheet are always the same kind: does this new slot clash with anything, when is the studio free today, and at the busiest moment how many people were trying to use it.

The mental model: an interval is a segment on a number line, and a list of intervals is a set of segments dropped on that line in random order. Random order is the whole difficulty. Once the segments are sorted by where they start, you can walk the line left to right and every question above becomes a single pass with a tiny amount of state: one number (the furthest end you have seen) or one heap (the ends of everything still running).

What it solves: any question about coverage (what is busy, what is free), conflict (do two things clash) or load (how many things at once) over a collection of ranges, in O(n log n) instead of comparing every pair in O(n²).

### Mechanics

One worked example runs through the whole module. The studio has seven bookings for a day that runs from 8 to 20 (hours):

bookings = [(15, 17), (9, 13), (10, 11), (12, 14), (16, 17), (17, 18), (12, 13)]

Sorted by start, and labelled so the diagram can refer to them:

| Label | A | B | C | D | E | F | G |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Booking | (9, 13) | (10, 11) | (12, 13) | (12, 14) | (15, 17) | (16, 17) | (17, 18) |

**Step 1: pick an endpoint convention before anything else.** A booking (15, 17) followed by (17, 18) is not a clash: one person walks out at 17 and the next walks in. That is the half-open convention, [start, end), where the start instant is included and the end instant is not. Integer ranges like "addresses 1 to 3" are usually closed, [lo, hi], where both ends are included. Every comparison below has a strict version and a non-strict version, and the convention decides which one is correct. Most interval bugs are this decision made implicitly.

**Step 2: the overlap test.** Two half-open intervals a and b fail to overlap exactly when one finishes before the other starts: a.end <= b.start or b.end <= a.start. Negate that (De Morgan) and you get the test:

a.start < b.end and b.start < a.end

Check it on the example. A = (9, 13) and D = (12, 14): 9 < 14 and 12 < 13, so they overlap (on [12, 13)). E = (15, 17) and G = (17, 18): 15 < 18 but 17 < 17 is false, so they do not, which is the handover at 17 we wanted. For closed intervals both comparisons become <=, because [9, 13] and [13, 14] share the point 13.

**Step 3: sorting turns two comparisons into one.** If a comes before b in start order, then a.start <= b.start < b.end, so the first half of the test is already true. The only question left is b.start < a.end. That is why nearly every interval algorithm starts with a sort: after it, "does the next one overlap?" is one comparison against something to its left.

**Step 4: the merge sweep, and why you compare against the running end.** Walk the sorted bookings keeping cur_end, the furthest end seen so far in the current busy block. For each booking (start, end):

- If start > cur_end, nothing seen so far reaches start. Every earlier booking ends at or before cur_end (that is what cur_end means), and every later booking starts at or after start (that is what sorting guarantees). So [cur_end, start) is genuinely free, and a new block begins.
- Otherwise the booking touches or overlaps the current block, and the block now reaches max(cur_end, end).

The invariant: after processing the first i sorted bookings, their union is a list of finished blocks plus one open block whose right edge is cur_end. A finished block never changes again, because every later booking starts at or after the start that closed it.

The word that matters is max. Booking B = (10, 11) sits entirely inside A = (9, 13). If you overwrite cur_end with B's end you would believe the block ends at 11, and then C = (12, 13) would look like it opens a new block after a free hour [11, 12) that never existed. The block's edge is the furthest end seen, not the most recent one.

Here is the sweep on the example, starting cur_end at the day's start, 8:

| Booking | cur_end before | start > cur_end? | Free gap found | cur_end after |
| --- | --- | --- | --- | --- |
| A (9, 13) | 8 | 9 > 8, yes | (8, 9) | 13 |
| B (10, 11) | 13 | no | none | 13 |
| C (12, 13) | 13 | no | none | 13 |
| D (12, 14) | 13 | no | none | 14 |
| E (15, 17) | 14 | 15 > 14, yes | (14, 15) | 17 |
| F (16, 17) | 17 | no | none | 17 |
| G (17, 18) | 17 | 17 > 17, no | none | 18 |

After the loop cur_end = 18 < 20, so the tail (18, 20) is free as well. Free gaps: (8, 9), (14, 15), (18, 20). Busy blocks: [9, 14) and [15, 18). Note G: under half-open, 17 == 17 means "touching", and touching bookings leave no free time between them, so the non-strict branch is correct here.

**Step 5: counting concurrency.** The merge sweep answers "busy or not". The load question, "how many at once", needs a count, and there are two standard ways to keep it.

*Event sweep.* Split every booking into two events: (start, +1) and (end, -1). Sort the events and add them up; the running total is the number of live bookings. The one decision is the tie at equal times. Under half-open, a booking that ends at 17 is gone at 17, so at the same time the -1 must be applied before the +1. Python's tuple sort gives you this for free because -1 < +1 (recalled: tuples compare element by element). On the example the running total goes:

9: 1, 10: 2, 11: 1, 12: 2 then 3, 13: 2 then 1, 14: 0, 15: 1, 16: 2, 17: 1 then 0 then 1, 18: 0.

At 17, E and F end and G starts. Ends first gives 2, 1, 0, 1: the studio never holds more than one person at 17. Starts first would give 2, 3, 2, 1, and for an instant the count reads 3, reporting a three-way clash at 17 that did not happen.

*Min-heap of end times.* Process bookings in start order. Keep a min-heap holding the end times of bookings that have started. When a booking (start, end) arrives, pop every end <= start (those bookings finished at or before this one began), and the heap size is now exactly the number of bookings still running. Then push end.

Why only the top matters: the heap's smallest end is the first booking to finish. If heap[0] > start, every other end in the heap is >= heap[0] > start, so all of them are still running and you can stop popping. Each end is pushed once and popped at most once, so the whole sweep costs O(n log n).

| Arriving booking | Popped (end <= start) | Live when it starts | Heap before pushing |
| --- | --- | --- | --- |
| A (9, 13) | none | 0 | [] |
| B (10, 11) | none | 1 | [13] |
| C (12, 13) | 11 | 1 | [13] |
| D (12, 14) | none | 2 | [13, 13] |
| E (15, 17) | 13, 13, 14 | 0 | [] |
| F (16, 17) | none | 1 | [17] |
| G (17, 18) | 17, 17 | 0 | [] |

The largest "live when it starts" is 2, at D, so with D included three bookings are running at 12, which matches the event sweep's peak of 3 at 12. The two methods answer slightly different questions: the event sweep gives the count at every moment (a load profile), the heap gives the count at each arrival and keeps the identities of running bookings (their ends) available, which is what you need when the question is about the arriving interval itself.

### Diagram

A timeline, one column per hour from 8 to 20. Each bar is a booking [start, end); B is drawn in amber because it hides inside A. The live row shows how many bookings cover each one-hour slot [h, h + 1). The green row marks the busy blocks, the dotted grey row the free gaps, and the dashed red line is the instant 17, where E and F end and G starts.

<figure class="sketch">{% include sketches/dsa-intervals/studio-timeline.svg %}<figcaption>The seven bookings as half-open bars (blue; B in amber, hidden inside A). Live counts per hour slot: 0 1 2 1 3 1 0 1 2 1 0 0. Busy (green): [9, 14) and [15, 18). Free (grey): (8, 9), (14, 15), (18, 20). Red dashed line: the handover at 17.</figcaption></figure>

Three things to read off it. B hides inside A, which is why the merge sweep needs max. E and F both end exactly where G starts, which is where the tie rule lives. And the busy row is just "live >= 1" while the free row is "live == 0", so the merge sweep and the count sweep are two views of the same line.

### Implementation

The overlap test and the merge sweep, returning the free gaps in the day:

```python
def overlaps(a, b):
    # Half-open [start, end). a and b share an instant iff
    # a[0] < b[1] and b[0] < a[1].
    # Checked: (9, 13) vs (12, 14): 9 < 14 and 12 < 13 -> True.
    #          (15, 17) vs (17, 18): 17 < 17 is False -> False (handover at 17).
    return a[0] < b[1] and b[0] < a[1]


def free_gaps(bookings, day_start, day_end):
    """Free (start, end) gaps inside [day_start, day_end) not covered by any booking.
    Assumes every booking lies inside [day_start, day_end)."""
    gaps = []
    cur_end = day_start  # right edge of the current busy block; day_start before any booking
    # (recalled: sorted() returns a new list and orders tuples by start, then end;
    #  the input list is left untouched)
    for start, end in sorted(bookings):
        if start > cur_end:
            # Every booking already processed ends at or before cur_end, and every
            # booking still to come starts at or after start, so [cur_end, start)
            # is free. Example: at E = (15, 17), cur_end = 14 -> gap (14, 15).
            gaps.append((cur_end, start))
        # Either start <= cur_end (touching or overlapping, e.g. G = (17, 18) with
        # cur_end = 17) or a new block was just opened. In both cases the block now
        # reaches max(cur_end, end). max, not end: B = (10, 11) inside A = (9, 13)
        # must leave cur_end at 13, not 11.
        cur_end = max(cur_end, end)
    if cur_end < day_end:
        # The loop only emits a gap when a later booking starts; the free time
        # [cur_end, day_end) after the last block has no later booking to trigger it.
        gaps.append((cur_end, day_end))
    return gaps


bookings = [(15, 17), (9, 13), (10, 11), (12, 14), (16, 17), (17, 18), (12, 13)]
print(overlaps((9, 13), (12, 14)))   # True
print(overlaps((15, 17), (17, 18)))  # False
print(free_gaps(bookings, 8, 20))    # [(8, 9), (14, 15), (18, 20)]
```

The two concurrency sweeps, on the same bookings:

```python
import heapq


def load_profile(bookings):
    """Step function [(time, live count from that time on)] for half-open bookings."""
    events = []
    for start, end in bookings:
        events.append((start, +1))
        events.append((end, -1))
    # (recalled: tuples sort element by element, so at equal time (17, -1) comes
    #  before (17, +1)). Ends first is right for half-open: E and F leave at 17
    #  before G arrives at 17, so the count at 17 goes 2 -> 1 -> 0 -> 1, never 3.
    events.sort()
    profile, live = [], 0
    for time, delta in events:
        live += delta
        if profile and profile[-1][0] == time:
            profile[-1] = (time, live)  # same instant: keep only the settled count
        else:
            profile.append((time, live))
    return profile


def hours_at_least(profile, k):
    """Total time during which at least k bookings are live."""
    total = 0
    for (t, count), (t_next, _) in zip(profile, profile[1:]):
        if count >= k:
            total += t_next - t  # count holds on [t, t_next)
    return total


def live_at_arrival(bookings):
    """For each booking in start order: how many earlier bookings are still running when it starts."""
    ends = []  # min-heap of end times (recalled: heapq is a min-heap, ends[0] is the smallest)
    result = []
    for start, end in sorted(bookings):
        # Pop ends <= start: under half-open, a booking ending at 17 is gone at 17.
        # Stop as soon as ends[0] > start: every other end is >= ends[0] > start,
        # so every remaining booking is still running.
        # Example: at G = (17, 18) the heap holds [17, 17]; both pop, live = 0.
        while ends and ends[0] <= start:
            heapq.heappop(ends)
        result.append(((start, end), len(ends)))
        heapq.heappush(ends, end)
    return result


bookings = [(15, 17), (9, 13), (10, 11), (12, 14), (16, 17), (17, 18), (12, 13)]
profile = load_profile(bookings)
print(profile)
# [(9, 1), (10, 2), (11, 1), (12, 3), (13, 1), (14, 0), (15, 1), (16, 2), (17, 1), (18, 0)]
print(hours_at_least(profile, 2))  # 3  ([10, 11), [12, 13) and [16, 17))
print(live_at_arrival(bookings))
# [((9, 13), 0), ((10, 11), 1), ((12, 13), 1), ((12, 14), 2),
#  ((15, 17), 0), ((16, 17), 1), ((17, 18), 0)]
```

Edge cases, run: free_gaps([], 8, 20) returns [(8, 20)]; free_gaps([(8, 20)], 8, 20) returns []; free_gaps([(9, 15), (10, 11), (12, 14)], 8, 20) returns [(8, 9), (15, 20)] (the containment case); load_profile([]) and live_at_arrival([]) return []; two identical bookings [(9, 11), (9, 11)] give the profile [(9, 2), (11, 0)] and live counts 0 then 1. I also checked every function against a brute-force "check every hour" version on 5,000 random booking sets.

Complexity, with n bookings: free_gaps, load_profile and live_at_arrival are O(n log n) time, dominated by the sort, plus (for live_at_arrival) n pushes and at most n pops on a heap of size at most n. Space is O(n) for the sorted copy, the 2n events or the heap. hours_at_least is O(n) over a profile of at most 2n points, and overlaps is O(1).

### Recognition

Signals that an interval sweep applies:

- The input is a list of (start, end) pairs, or can be turned into one: meetings, bookings, ranges, segments, "from day x to day y".
- The words overlap, conflict, clash, merge, cover, free time, at the same time, simultaneously, how many at once, minimum number of rooms, servers or resources.
- The order of the input is arbitrary and nothing in the problem depends on it, so sorting loses nothing.
- n is large enough (thousands and up) that comparing every pair in O(n²) is too slow.

Which list problems show which signal: Merge Intervals and Insert Interval are coverage questions (Insert Interval adds the signal "already sorted and non-overlapping", which means you can skip the sort). Meeting Rooms is a pure conflict question. Meeting Rooms II is a "how many at once" question. Non Overlapping Intervals asks you to choose which intervals to keep, which is a selection question more than a sweep question. Minimum Interval to Include Each Query has the "set of live intervals" signal plus a second list, the queries, that you also get to process in whatever order you like.

When not to use it, and what it gets confused with:

- Tiny bounded coordinates (say all times are whole hours in 0 to 24, or days in a year): a difference array over the timeline, +1 at start and -1 at end followed by a prefix sum, is O(n + T) for T time slots and needs no sort. That is the event sweep without the sort, and it only works when T is small.
- Intervals arriving and disappearing online with queries in between: a single sort-and-sweep assumes you have everything up front. That needs a balanced tree or sorted container, not this.
- Sliding window is not this. A sliding window is a contiguous range of indices in one array that you choose; interval problems hand you ranges and ask how they relate to each other.
- Greedy selection is adjacent, not identical. The sweep tells you what overlaps; deciding which intervals to keep or drop needs its own argument about why the local choice is safe, and which endpoint you sort by is part of that argument. That is Part 13's job.

### Pitfalls

- Convention drift. Using <= in the overlap test for half-open intervals makes (15, 17) and (17, 18) clash. Using < for closed integer ranges makes [9, 13] and [13, 14] look disjoint even though both contain 13. Decide once, write it down, check the touching case.
- Overwriting instead of max. cur_end = end breaks on containment. On the example it invents a free gap (11, 12) because B = (10, 11) sits inside A = (9, 13).
- Forgetting to flush. The loop emits something only when a later interval triggers it. The last block, or the free tail (18, 20) here, has to be handled after the loop.
- Tie order in the event sweep. Ends before starts for half-open. For closed intervals it flips: [15, 17] and [17, 18] both contain 17, so the start at 17 must be counted before the end at 17, and you need an explicit sort key rather than relying on -1 < +1.
- Heap pop condition. while ends[0] < start instead of <= keeps E and F alive when G starts, so G reports 2 live bookings instead of 0.
- Sorting by the wrong key or not at all. sorted(bookings) sorts by start, then end. The merge sweep only needs start order; key=lambda b: b[0] works too. Sorting by end is a different algorithm with a different correctness argument, not a harmless variant.
- Mutating the caller's list. list.sort() sorts in place; if the caller still needs their original order, use sorted().
- Zero-length intervals (start == end). Under half-open they contain no instant, but the two-comparison test still says (19, 19) overlaps (15, 20) because 19 < 20 and 15 < 19. In the event sweep a lone (12, 12) makes the running count dip to -1 for a moment because its -1 sorts before its +1. Either filter them out or decide what they mean.
- Empty input and single interval. Initialising cur_end to day_start (not to the first booking's end) makes the empty case return the whole day as free without a special branch.
- Complexity claims. The sweep is O(n); the sort is O(n log n), so the whole thing is O(n log n). If the input is guaranteed sorted, say so and claim O(n).

### Active Recall

Answer out loud or on paper first.

1. In the merge sweep, when E = (15, 17) arrives with cur_end = 14, the code records (14, 15) as free without looking at A, B, C or D again. Why is that safe, and what would have to be true of the input for it not to be?
2. Replace cur_end = max(cur_end, end) with cur_end = end and run the example. What does free_gaps return, and which booking causes the difference?
3. At 17, E and F end and G starts. In the event sweep, what running counts do you see at 17 if ends are processed first, and what if starts are processed first? What does the heap version report for G if the pop condition is ends[0] < start?
4. Suppose the studio switches to closed intervals, so a booking [9, 13] includes hour 13. Which comparisons in overlaps and free_gaps change, and do [9, 13] and [13, 14] overlap?
5. In live_at_arrival, why is it enough to look only at ends[0], and why is the total cost O(n log n) even though one arrival can pop many ends (E pops three)?

{% capture coach %}
You are my coding-interview coach. I just studied interval sweeps in Python: an interval is a segment on a number line, and after sorting by start every question becomes one pass with tiny state. Two half-open intervals [start, end) overlap iff a.start < b.end and b.start < a.end; after sorting, only the second comparison is needed. The merge sweep keeps cur_end, the furthest end seen so far (max, not the latest end); a booking with start > cur_end opens a new block and leaves [cur_end, start) free, and the free tail after the loop must be flushed. Concurrency is counted either with an event sweep ((start, +1) and (end, -1), sorted so that at equal times ends come before starts for half-open intervals) or with a min-heap of end times, popping every end <= start before each arrival, after which the heap size is the number of bookings still running.
Worked example from the lesson: a studio day from 8 to 20 with bookings [(15, 17), (9, 13), (10, 11), (12, 14), (16, 17), (17, 18), (12, 13)]. Sorted: A (9, 13), B (10, 11), C (12, 13), D (12, 14), E (15, 17), F (16, 17), G (17, 18). free_gaps with cur_end starting at 8 returns [(8, 9), (14, 15), (18, 20)]; the busy blocks are [9, 14) and [15, 18). The event-sweep profile is [(9, 1), (10, 2), (11, 1), (12, 3), (13, 1), (14, 0), (15, 1), (16, 2), (17, 1), (18, 0)]. The heap version gives live counts at arrival 0, 1, 1, 2, 0, 1, 0 for A to G.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. In the merge sweep, when E = (15, 17) arrives with cur_end = 14, the code records (14, 15) as free without looking at A, B, C or D again. Why is that safe, and what would have to be true of the input for it not to be?
2. Replace cur_end = max(cur_end, end) with cur_end = end and run the example. What does free_gaps return, and which booking causes the difference?
3. At 17, E and F end and G starts. In the event sweep, what running counts do you see at 17 if ends are processed first, and what if starts are processed first? What does the heap version report for G if the pop condition is ends[0] < start?
4. Suppose the studio switches to closed intervals, so a booking [9, 13] includes hour 13. Which comparisons in overlaps and free_gaps change, and do [9, 13] and [13, 14] overlap?
5. In live_at_arrival, why is it enough to look only at ends[0], and why is the total cost O(n log n) even though one arrival can pop many ends (E pops three)?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

The list problems here all announce themselves: they hand you pairs called intervals and ask about overlap, rooms or merging, so none of them makes you derive the sweep from scratch in disguise. This checkpoint stays in so the mechanics get exercised on something that does not look like a textbook interval problem.

A firewall keeps a blocklist of IPv4 address ranges, stored as integers and written as inclusive pairs [lo, hi]. Different teams add ranges independently, so ranges repeat, overlap and nest. Given the list, return how many distinct addresses are blocked. There can be up to 10^5 ranges, and the addresses span about 4.3 billion values, so you cannot mark them one by one.

Example: [[5, 9], [1, 3], [4, 4], [8, 12], [20, 22], [10, 11]] should return 15.

Before opening the chat, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A firewall keeps a blocklist of IPv4 address ranges, stored as integers and written as inclusive pairs [lo, hi]. Different teams add ranges independently, so ranges repeat, overlap and nest. Given the list, return how many distinct addresses are blocked. There can be up to 10^5 ranges, and the addresses span about 4.3 billion values, so you cannot mark them one by one.
Example: [[5, 9], [1, 3], [4, 4], [8, 12], [20, 22], [10, 11]] should return 15.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

A video CDN logs each stream as (start_ms, end_ms, bitrate_mbps), with the stream released at end_ms. Capacity planning wants the peak total bandwidth ever in use at one instant. Would you use this module? Why, and which version?

{% capture coach %}
You are my coding-interview coach. I just learned interval sweeps (sort the ranges by start, then walk the line once keeping a running end for coverage, a running count over +1/-1 events for load at every instant with ends before starts at equal times for half-open ranges, or a min-heap of end times for load at each arrival). Scenario: A video CDN logs each stream as (start_ms, end_ms, bitrate_mbps), with the stream released at end_ms. Capacity planning wants the peak total bandwidth ever in use at one instant. If it fits, which version of the sweep?
Ask me whether I would use interval sweeps here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

How the pieces connect to the topic. Every interval problem in this list is some combination of three things from this module: the overlap test under a chosen convention, a sort that makes one comparison against the left side enough, and a sweep that keeps the minimum state to answer the question. Coverage questions keep one number (the running end). Load questions keep a counter over events or a min-heap of ends. Questions about the arriving interval itself ("what is still alive when this one starts") keep a heap of the live intervals.

Distinguishing competing approaches:

| Approach | State kept | Answers | Cost |
| --- | --- | --- | --- |
| Pairwise overlap test | none | any question, slowly | O(n²) |
| Merge sweep (sort by start) | running end | coverage: blocks, gaps, total covered | O(n log n) |
| Event sweep | running count or sum | load at every instant, weighted load | O(n log n) |
| Min-heap of ends | ends of live intervals | load at each arrival, which intervals are live | O(n log n) |
| Difference array | array over time slots | load when coordinates are small integers | O(n + T) |

Two questions separate them fast. Is the question about coverage (busy or not) or about load (how many)? And is it asked about every instant, or about each interval as it arrives? A third question sits on the boundary with Greedy: are you asked to choose intervals, not just describe them? Then the sort order is part of a correctness argument you have to make, and the sweep is only the vehicle.

<figure class="sketch">{% include sketches/dsa-intervals/which-sweep.svg %}<figcaption>Choosing the sweep: fix the convention, sort by start unless the input is already sorted, then let the question pick the tool. Green is coverage (merge sweep), blue is load at every instant (event sweep), violet is load at each arrival (min-heap of ends), amber is choosing intervals (Greedy).</figcaption></figure>

A recognition checklist for an unfamiliar problem:

1. Can the input be read as ranges on a line? Times, positions, IDs, days, addresses all count.
2. Is the endpoint convention half-open or closed? Write down what happens when one range ends exactly where another starts.
3. Is order irrelevant, so sorting is free? If it is already sorted, can you skip the sort?
4. Coverage, load, or choice? Coverage means a running end, load means a counter or heap, choice means a greedy argument.
5. Every instant or each arrival? Every instant points to events, each arrival points to a heap.
6. Is there a second list (queries, points, rooms) you can also sort and sweep against the first?
7. Is the coordinate range tiny? Then a difference array might beat the sort.
8. Does the complexity target allow O(n²)? If not, the sort-plus-sweep is almost certainly the intended shape.

## The problems

Work these with the solving cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute honest struggle, one key sentence per problem, spaced repetition. For Intervals the struggle questions are: why does the local choice stay globally optimal? Is it a sort, a heap, or both? After watching a solution, justify the greedy decision in your own words: why this sort key, why this comparison, why this tie rule.

| # | Problem |
| --- | --- |
| 1 | [Insert Interval](https://leetcode.com/problems/insert-interval/) |
| 2 | [Merge Intervals](https://leetcode.com/problems/merge-intervals/) |
| 3 | [Non Overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/) |
| 4 | [Meeting Rooms](https://neetcode.io/problems/meeting-schedule/question) |
| 5 | [Meeting Rooms II](https://neetcode.io/problems/meeting-schedule-ii/question) |
| 6 | [Minimum Interval to Include Each Query](https://leetcode.com/problems/minimum-interval-to-include-each-query/) |

## Take this lesson as a live session

If you want this lesson interactively, with a coach that actually waits for your answers, open the full lesson prompt in a chat.

{% capture coach %}
[TOPIC]: Intervals
[PREREQUISITES]: Intervals
[PROBLEM LIST]: Insert Interval, Merge Intervals, Non Overlapping Intervals, Meeting Rooms, Meeting Rooms II, Minimum Interval to Include Each Query
[PROGRAMMING_LANGUAGE]: Python

You are my coding interview coach. I am learning TOPIC from LeetCode 150. Teach [PREREQUISITES] first so I can solve [PROBLEM LIST] independently. [PREREQUISITES] may contain one or multiple concepts. A single prerequisite may intentionally have the same name as TOPIC; treat it as the foundational module, not as an error. All code must be written in [PROGRAMMING_LANGUAGE], using idiomatic conventions and standard library features of that language.
Goal
Optimize for: understanding, not memorization; recognizing when a technique applies; deriving the approach from problem properties; implementing it from memory; explaining correctness and complexity; transferring the idea to unfamiliar problems. Do not teach me to recognize a solution only after seeing it. Train me to recognize the pattern before seeing the solution.
For Each Prerequisite
Cover, as needed:
Foundation — Simple intuition/analogy. Plain-language mental model. What problem it solves.
Mechanics — Step-by-step reasoning. Key invariant/property. Explain WHY each important decision is safe, especially pointer/boundary movement or eliminating candidates. Whenever you introduce a worked numeric example to justify a step, reuse that same example consistently in the Diagram and Implementation sections rather than switching arrays between sections. Compute each step's value arithmetically and confirm it before presenting the trace; if a computed value differs from what you expected, correct the trace rather than adjusting the narrative to fit a wrong number.
Diagram — Use a diagram when it materially improves understanding of structure, state, or movement; do not force one. Pick the form based on your actual output capability, in this priority order:
If you can render inline SVG/vector graphics that the user can view directly, use a custom SVG-style diagram for anything where exact spatial detail matters — positions/indices in an array, pointer or window boundaries, stack/queue contents at a point in time.If you cannot render SVG/images but can render diagram markup the platform displays visually (e.g. Mermaid), use that for flows, state transitions, recursion trees, graph/tree relationships, or sequences of discrete steps. If the concept is index/position-based rather than flow-based, prefer a text-based diagram (option 3) over forcing Mermaid to depict spatial layout it isn't suited for.If neither of the above is available, use a plain text/ASCII diagram — aligned indices, values, and pointer markers using monospace formatting — so pointer positions, array layout, and movement are still visible without graphics. This is the universal fallback and should still show exact positions, not just describe them in prose.
State which of the three you're using only if it's not obvious from the output itself — otherwise just produce it.
Implementation — Clean [PROGRAMMING_LANGUAGE] in a fenced code block (for readability/syntax highlighting) with useful comments explaining important lines and relevant operations. Mentally execute the code against the same worked example end-to-end and confirm the output matches before presenting it; only include a comment claiming what the code does or why it's correct if that trace actually supports it. All other sections (explanations, questions, prose) should NOT use code fences. Time and space complexity.
Recognition — Signals: constraints, keywords, data properties, sortedness, contiguity, frequency/counting, optimization, etc. When NOT to use it. Distinguish it from similar techniques. If naming which [PROBLEM LIST] problems show these signals, only reference problems literally present in the [PROBLEM LIST] value provided — do not assume standard LeetCode 150 groupings or invent problem names.
Pitfalls — Important edge cases, off-by-one/boundary errors, duplicates, empty/single inputs, incorrect initialization, infinite loops, and complexity mistakes when relevant.
Active Recall — 3–5 reasoning questions. Base every question on the mechanics/invariant just taught, using the same worked example from Mechanics or a new small generic/synthetic example — never a problem named in [PROBLEM LIST]. Do not ask me to derive, prove, or walk through the full solution of a specific [PROBLEM LIST] problem here, even if it instantiates this exact technique; that derivation belongs in its own section later. Do not give answers immediately. Stop and wait for my answers before proceeding. When I respond: if correct, briefly confirm and add any nuance I missed; if incorrect or incomplete, correct it with a short explanation before moving on — don't just move to the next section.
Disguised Mini-Task — Conditional checkpoint. Before starting this prerequisite's lesson, check whether any problem in [PROBLEM LIST] requires deriving and applying this prerequisite's core technique essentially from scratch (not merely as a labeled instance of a named pattern). Make this judgment call yourself and state it in one line (e.g. "X requires an independent safety-proof derivation, so we'll skip this checkpoint and cover that reasoning when we solve X directly") — do not justify the call by actually deriving or proving that problem's solution here; that derivation happens only when we solve the problem in its own section. If yes, skip this checkpoint entirely and go straight to Transfer Test. If no such problem exists (the prerequisite's mechanics won't otherwise be independently exercised), include this checkpoint: use a problem not from [PROBLEM LIST]. Do not name the technique or hint at it initially. Make me identify the relevant observations, approach, justification, and complexity before coding. Stop and wait for my attempt. If stuck, give progressively stronger hints across multiple turns rather than solving it for me. Do not give the solution immediately.
Transfer Test — After the mini-task is resolved (or skipped), give one short unfamiliar scenario and ask whether I would use the concept and why. Stop and wait for my answer before giving feedback.
For every code comment that explains why something is correct (not just what a line does): name the actual variables/values involved instead of pronouns ("it", "this"); state any range, bound, or count as an explicit, inclusive expression rather than a hand-typed list or vague description; and mentally verify the claim against one small concrete example before writing the comment — if the claim isn't obvious on inspection, show that example inline or directly below the code. Apply this same rigor to every branch of a conditional, not just the first one — do not leave a later branch's justification as "symmetric" without also checking it against a concrete example. When a claim rests on recalled general knowledge (library function behavior, language semantics, a known complexity result) rather than something you derived from the example in front of you, note that it's recalled rather than derived, so I know which claims to double-check myself.
Interaction:
Teach one prerequisite at a time. Within a prerequisite, pause at each applicable marked checkpoint above (Active Recall, Mini-Task when included, Transfer Test) rather than delivering the whole prerequisite in one uninterrupted block. If there are more prerequisites after this one, wait until I say "continue for next." If there is only one, finish it (through Transfer Test) without asking me to continue further. Do not solve [PROBLEM LIST] during prerequisite teaching — this applies to every subsection (Foundation, Mechanics, Diagram, Implementation, Recognition, Pitfalls, Active Recall, Mini-Task, Transfer Test), not just the obvious "let's solve problem X" case. Naming a [PROBLEM LIST] problem for motivation/context is fine; deriving, proving, or walking through its full solution is not — that happens only once we reach [PROBLEM LIST] itself, after all prerequisites are taught.
Integration:
After all prerequisites: Explain how they connect to TOPIC. Show how to distinguish competing approaches. Give a practical recognition checklist for unfamiliar problems. Stop there — do not suggest which [PROBLEM LIST] problem to start with, do not ask which one I want to begin with, and do not start solving or discussing any specific [PROBLEM LIST] problem. Wait for me to initiate problem-solving on my own.
Depth
Keep the lesson as short as possible while achieving genuine understanding. The sections above are a checklist, not a target length. Scale depth to difficulty. Avoid repetition, unnecessary theory, excessive examples, history, and unrelated details. Prefer reasoning density over completeness.
Formatting
Use ### headings or lower only. No horizontal rules. No Markdown code fences except around [PROGRAMMING_LANGUAGE] implementation code and, if used, text/ASCII diagrams. Use whichever diagram form (SVG, Mermaid, or text-based) fits your actual rendering capability and the concept being taught, per the Diagram section above.
Begin with the first prerequisite.
{% endcapture %}
{% include coach.html prompt=coach label="Open the full lesson in" %}
