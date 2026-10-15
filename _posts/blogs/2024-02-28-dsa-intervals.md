---
layout: post
title: "Interval problems are a sort plus one number: where the current block ends"
date: 2024-02-28 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 12
series_total: 19
links_new_tab: true
tags: [dsa, intervals, sweep-line, python, series]
read_time: 29
permalink: /blogs/dsa-intervals/
excerpt: "Almost every interval problem starts the same way: sort by start time, then walk through the list remembering one end time, or a heap of them. This part teaches the overlap test, the merge sweep and counting how many things run at once, all on one day of studio bookings."
---

An interval is a pair that means "from here to there". Meetings, bookings and IP ranges are all intervals. Nearly every interval problem comes down to three moves:

- test whether two intervals overlap,
- walk a sorted list while growing a block of busy time,
- count how many intervals are running at the same moment.

We'll work all three on one day of studio bookings. This part comes right after [Heap / Priority Queue](/blogs/dsa-heaps/), because the third move uses a min-heap of end times. It runs alongside [Greedy](/blogs/dsa-greedy/), which takes on a different question: which intervals should you keep?

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## Intervals

### Foundation

Picture a recording studio with one shared booking sheet. Each line on the sheet is a slot, like 9 to 13. People keep asking the same kinds of questions about that sheet:

- Does this new slot clash with anything?
- When is the studio free today?
- At the busiest moment, how many people were trying to use it?

Now the same idea in maths terms. An interval is a segment on a number line. A list of intervals is a bunch of segments dropped onto that line in random order. That random order is what makes these problems hard.

Once you sort the segments by where they start, you can walk the line from left to right. Every question above then becomes a single pass that remembers very little. Sometimes that's one number: the furthest end you've seen so far. Sometimes it's one heap: the end times of everything still running.

What does this buy you? It answers questions about a collection of ranges in O(n log n), instead of comparing every pair in O(n²). Those questions come in three kinds:

- **Coverage:** what is busy, and what is free?
- **Conflict:** do two things clash?
- **Load:** how many things are happening at once?

### Mechanics

We'll use one worked example for the whole module. The studio's day runs from 8 to 20 (in hours), and it has seven bookings:

bookings = [(15, 17), (9, 13), (10, 11), (12, 14), (16, 17), (17, 18), (12, 13)]

Here they are sorted by start time, with a letter each so the diagram can refer to them:

| Label | A | B | C | D | E | F | G |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Booking | (9, 13) | (10, 11) | (12, 13) | (12, 14) | (15, 17) | (16, 17) | (17, 18) |

**Step 1: decide what the endpoints mean, before anything else.** Take a booking (15, 17) followed by (17, 18). That's not a clash. One person walks out at 17 and the next one walks in.

This way of reading intervals is called **half-open**, written [start, end). The start instant is part of the interval, and the end instant isn't. Integer ranges like "addresses 1 to 3" are usually **closed** instead, written [lo, hi]. In a closed interval, both ends are included.

Why does this matter so much? Every comparison below comes in a strict version (<) and a non-strict version (<=). The convention decides which one is correct. Most interval bugs come from making this choice without noticing you made it.

**Step 2: the overlap test.** It's easier to start with when two half-open intervals a and b *don't* overlap. That happens exactly when one finishes before the other starts:

a.end <= b.start or b.end <= a.start

Flip that around (De Morgan's law: "not (X or Y)" is "not X and not Y") and you get the overlap test:

a.start < b.end and b.start < a.end

Let's check it on the example. Take A = (9, 13) and D = (12, 14). We have 9 < 14 and 12 < 13, so they overlap, on [12, 13). Now take E = (15, 17) and G = (17, 18). 15 < 18 holds, but 17 < 17 is false, so they don't overlap. That's the handover at 17 we wanted.

For closed intervals, both comparisons become <=. That's because [9, 13] and [13, 14] both contain the point 13, so they do overlap.

**Step 3: sorting turns two comparisons into one.** Say a comes before b once the list is sorted by start. Then a.start <= b.start, and b.start < b.end, so a.start <= b.start < b.end. The first half of the test is already true for free.

The only question left is b.start < a.end. That's why nearly every interval algorithm starts with a sort. After it, "does the next one overlap?" is one comparison against something on its left.

**Step 4: the merge sweep, and why you compare against the running end.** A **sweep** just means walking through the sorted list once, from left to right. As we go, we keep one number, cur_end. It's the furthest end we've seen so far in the current busy block. For each booking (start, end):

- **If start > cur_end**, nothing we've seen so far reaches start. Why can we be sure? Every earlier booking ends at or before cur_end, because that's what cur_end means. Every later booking starts at or after start, because the list is sorted. So [cur_end, start) really is free, and a new busy block begins.
- **Otherwise**, the booking touches or overlaps the current block. The block now stretches to max(cur_end, end).

Here's the fact that stays true at every step (the **invariant**). After the first i sorted bookings, the time they cover is a list of finished blocks plus one open block, and the open block's right edge is cur_end. A finished block never changes again. That's because every later booking starts at or after the start that closed it.

The word that matters most here is max. Look at booking B = (10, 11). It sits entirely inside A = (9, 13). Suppose you overwrote cur_end with B's end. You'd think the block ends at 11. Then C = (12, 13) would look like it opens a new block, after a free hour [11, 12) that never existed. The block's edge is the furthest end seen so far, not the most recent one.

Here is the sweep on the example. cur_end starts at the start of the day, 8:

| Booking | cur_end before | start > cur_end? | Free gap found | cur_end after |
| --- | --- | --- | --- | --- |
| A (9, 13) | 8 | 9 > 8, yes | (8, 9) | 13 |
| B (10, 11) | 13 | no | none | 13 |
| C (12, 13) | 13 | no | none | 13 |
| D (12, 14) | 13 | no | none | 14 |
| E (15, 17) | 14 | 15 > 14, yes | (14, 15) | 17 |
| F (16, 17) | 17 | no | none | 17 |
| G (17, 18) | 17 | 17 > 17, no | none | 18 |

After the loop, cur_end = 18, which is less than 20. So the tail (18, 20) is free as well. That gives:

- Free gaps: (8, 9), (14, 15), (18, 20).
- Busy blocks: [9, 14) and [15, 18).

Look at G's row. Under half-open, 17 == 17 means the two bookings are "touching". Touching bookings leave no free time between them. So it's correct that 17 > 17 is false and G goes into the "otherwise" branch.

**Step 5: counting how many run at once.** The merge sweep only tells you "busy or not". The load question, "how many at once?", needs a count. There are two standard ways to keep one.

*Event sweep.* Split every booking into two events: (start, +1) and (end, -1). Sort the events and add up the +1s and -1s as you go. The running total is the number of **live** bookings, meaning the ones running right now.

There's one decision to make: what happens when two events share a time? Under half-open, a booking that ends at 17 is already gone at 17. So at the same time, the -1 has to be applied before the +1. Python's tuple sort does this for you, because -1 < +1 (recalled: tuples compare element by element). On the example, the running total goes:

9: 1, 10: 2, 11: 1, 12: 2 then 3, 13: 2 then 1, 14: 0, 15: 1, 16: 2, 17: 1 then 0 then 1, 18: 0.

Zoom in on 17, where E and F end and G starts. With ends first, the count goes 2, 1, 0, 1. The studio never holds more than one person at 17. With starts first, it would go 2, 3, 2, 1. For an instant the count reads 3, which reports a three-way clash at 17 that never happened.

*Min-heap of end times.* Go through the bookings in start order. Keep a min-heap (a structure that always hands you its smallest item first) holding the end times of bookings that have started. When a booking (start, end) arrives:

1. Pop every end that is <= start. Those bookings finished at or before this one began.
2. Now the heap size is exactly the number of bookings still running.
3. Push end.

Why is it enough to look only at the top of the heap? The smallest end belongs to the first booking that will finish. If heap[0] > start, then every other end in the heap is >= heap[0], which is > start. So all of them are still running, and you can stop popping.

Each end is pushed once and popped at most once. So the whole sweep costs O(n log n).

| Arriving booking | Popped (end <= start) | Live when it starts | Heap before pushing |
| --- | --- | --- | --- |
| A (9, 13) | none | 0 | [] |
| B (10, 11) | none | 1 | [13] |
| C (12, 13) | 11 | 1 | [13] |
| D (12, 14) | none | 2 | [13, 13] |
| E (15, 17) | 13, 13, 14 | 0 | [] |
| F (16, 17) | none | 1 | [17] |
| G (17, 18) | 17, 17 | 0 | [] |

The largest "live when it starts" is 2, at D. Count D itself too, and three bookings are running at 12. That matches the event sweep's peak of 3 at 12.

The two methods answer slightly different questions:

- **The event sweep** gives the count at every moment. That's called a **load profile**.
- **The heap** gives the count at each arrival. It also keeps track of which bookings are running (through their end times). You need that when the question is about the arriving interval itself.

### Diagram

<figure class="sketch">{% include sketches/dsa-intervals/studio-timeline.svg %}</figure>

There are three things to read off it:

- B hides inside A. That's why the merge sweep needs max.
- E and F both end exactly where G starts. That's where the tie rule matters.
- The busy row is just "live >= 1", and the free row is "live == 0". So the merge sweep and the count sweep are two views of the same line.

### Implementation

First, the overlap test and the merge sweep. The sweep returns the free gaps in the day:

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

Next, the two sweeps that count how many bookings run at once, on the same bookings:

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

I ran these edge cases:

- free_gaps([], 8, 20) returns [(8, 20)].
- free_gaps([(8, 20)], 8, 20) returns [].
- free_gaps([(9, 15), (10, 11), (12, 14)], 8, 20) returns [(8, 9), (15, 20)]. This is the containment case, where bookings sit inside another one.
- load_profile([]) and live_at_arrival([]) both return [].
- Two identical bookings [(9, 11), (9, 11)] give the profile [(9, 2), (11, 0)], and live counts of 0 then 1.

I also checked every function against a brute-force version that checks every hour, on 5,000 random sets of bookings.

Complexity, with n bookings:

- **free_gaps, load_profile and live_at_arrival take O(n log n) time.** The sort is the most expensive part. live_at_arrival also does n pushes and at most n pops, on a heap that never holds more than n items.
- **Their space is O(n).** That's for the sorted copy, the 2n events, or the heap.
- **hours_at_least is O(n)**, since it walks a profile of at most 2n points.
- **overlaps is O(1).**

### Recognition

These are the signals that an interval sweep applies:

- **The input is a list of (start, end) pairs, or can be turned into one.** Think meetings, bookings, ranges, segments, or "from day x to day y".
- **The problem uses words like these:** overlap, conflict, clash, merge, cover, free time, at the same time, simultaneously, how many at once, minimum number of rooms, servers or resources.
- **The input order is arbitrary, and nothing in the problem depends on it.** So sorting loses nothing.
- **n is large enough (thousands and up)** that comparing every pair in O(n²) is too slow.

Here's how those signals show up in this topic's list:

- **Merge Intervals and Insert Interval** are coverage questions. Insert Interval adds one more signal: the input is "already sorted and non-overlapping", which means you can skip the sort.
- **Meeting Rooms** is a pure conflict question.
- **Meeting Rooms II** is a "how many at once" question.
- **Non Overlapping Intervals** asks you to choose which intervals to keep. That's more a selection question than a sweep question.
- **Minimum Interval to Include Each Query** has the "set of live intervals" signal. It also has a second list, the queries, which you're free to process in whatever order you like.

When not to use it, and what it gets confused with:

- **The coordinates are tiny and bounded**, say all times are whole hours from 0 to 24, or days in a year. Then use a **difference array**: an array with one slot per time step, where you add +1 at each start and -1 at each end, then take a running total (a prefix sum). It costs O(n + T) for T time slots and needs no sort. It's the event sweep without the sort, and it only works when T is small.
- **Intervals arrive and disappear over time, with queries in between** (an "online" problem). A single sort-and-sweep assumes you have everything up front. This case needs a balanced tree or a sorted container instead.
- **Sliding window is a different thing.** In a sliding window, you choose a contiguous range of indices in one array. In interval problems, the ranges are handed to you, and the question is how they relate to each other.
- **Greedy selection is a close neighbour, but not the same.** The sweep tells you what overlaps. Deciding which intervals to keep or drop needs its own argument for why each local choice is safe. Which endpoint you sort by is part of that argument. That's Part 13's job.

### Pitfalls

- **Convention drift.** Use <= in the overlap test for half-open intervals, and (15, 17) and (17, 18) clash. Use < for closed integer ranges, and [9, 13] and [13, 14] look disjoint, even though both contain 13. Decide on a convention once, write it down, and check the touching case.
- **Overwriting instead of taking max.** cur_end = end breaks when one booking sits inside another. On the example, it invents a free gap (11, 12), because B = (10, 11) sits inside A = (9, 13).
- **Forgetting to flush.** The loop only records something when a later interval triggers it. So the last block, or here the free tail (18, 20), has to be handled after the loop.
- **Tie order in the event sweep.** For half-open intervals, ends go before starts. For closed intervals it flips. [15, 17] and [17, 18] both contain 17, so the start at 17 must be counted before the end at 17. That means you need an explicit sort key, rather than relying on -1 < +1.
- **The heap pop condition.** Write while ends[0] < start instead of <=, and E and F stay alive when G starts. G then reports 2 live bookings instead of 0.
- **Sorting by the wrong key, or not sorting at all.** sorted(bookings) sorts by start, then by end. The merge sweep only needs start order, so key=lambda b: b[0] works too. Sorting by end is a different algorithm with a different correctness argument. It isn't a harmless variant.
- **Changing the caller's list.** list.sort() sorts in place. If the caller still needs their original order, use sorted().
- **Zero-length intervals (start == end).** Under half-open, they contain no instant at all. But the two-comparison test still says (19, 19) overlaps (15, 20), because 19 < 20 and 15 < 19. In the event sweep, a lone (12, 12) makes the running count dip to -1 for a moment, because its -1 sorts before its +1. Either filter them out or decide what they mean.
- **Empty input and a single interval.** Start cur_end at day_start, not at the first booking's end. Then the empty case returns the whole day as free, with no special branch.
- **Complexity claims.** The sweep itself is O(n). The sort is O(n log n), so the whole thing is O(n log n). If the input is guaranteed to be sorted already, say so and claim O(n).

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

Every problem in this topic's list announces itself. Each one hands you pairs called intervals and asks about overlap, rooms or merging. So none of them makes you spot the sweep when it's in disguise. That's why this checkpoint stays in: you get to practise the mechanics on something that doesn't look like a textbook interval problem.

A firewall keeps a blocklist of IPv4 address ranges, stored as integers and written as inclusive pairs [lo, hi]. Different teams add ranges independently, so ranges repeat, overlap and nest. Given the list, return how many distinct addresses are blocked. There can be up to 10^5 ranges, and the addresses span about 4.3 billion values, so you cannot mark them one by one.

Example: [[5, 9], [1, 3], [4, 4], [8, 12], [20, 22], [10, 11]] should return 15.

Before opening the chat, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A firewall keeps a blocklist of IPv4 address ranges, stored as integers and written as inclusive pairs [lo, hi]. Different teams add ranges independently, so ranges repeat, overlap and nest. Given the list, return how many distinct addresses are blocked. There can be up to 10^5 ranges, and the addresses span about 4.3 billion values, so you cannot mark them one by one.
Example: [[5, 9], [1, 3], [4, 4], [8, 12], [20, 22], [10, 11]] should return 15.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
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

Here's how the pieces connect to the topic. Every interval problem in this list combines three things from this module:

- the overlap test, under a convention you've chosen,
- a sort, so that one comparison against the left side is enough,
- a sweep that remembers only what the question needs.

What the sweep remembers depends on the question. Coverage questions keep one number, the running end. Load questions keep a counter over events, or a min-heap of end times. Questions about the arriving interval itself ("what is still running when this one starts?") keep a heap of the live intervals.

How the competing approaches compare:

| Approach | State kept | Answers | Cost |
| --- | --- | --- | --- |
| Pairwise overlap test | none | any question, slowly | O(n²) |
| Merge sweep (sort by start) | running end | coverage: blocks, gaps, total covered | O(n log n) |
| Event sweep | running count or sum | load at every instant, weighted load | O(n log n) |
| Min-heap of ends | ends of live intervals | load at each arrival, which intervals are live | O(n log n) |
| Difference array | array over time slots | load when coordinates are small integers | O(n + T) |

Two questions tell them apart quickly:

1. Is the question about coverage (busy or not) or about load (how many)?
2. Is it asked about every instant, or about each interval as it arrives?

A third question sits on the border with Greedy: are you asked to *choose* intervals, not just describe them? If so, the sort order becomes part of a correctness argument you have to make yourself. The sweep is just how you carry it out.

<figure class="sketch">{% include sketches/dsa-intervals/which-sweep.svg %}</figure>

A recognition checklist for an unfamiliar problem:

1. Can the input be read as ranges on a line? Times, positions, IDs, days and addresses all count.
2. Is the endpoint convention half-open or closed? Write down what happens when one range ends exactly where another starts.
3. Does the input order not matter, so you're free to sort? If it's already sorted, can you skip the sort?
4. Is it about coverage, load, or choice? Coverage means a running end. Load means a counter or a heap. Choice means a greedy argument.
5. Is it about every instant, or each arrival? Every instant points to events. Each arrival points to a heap.
6. Is there a second list (queries, points, rooms) that you can also sort and sweep against the first?
7. Is the coordinate range tiny? Then a difference array might beat the sort.
8. Does the complexity target allow O(n²)? If not, sort-plus-sweep is almost certainly the intended shape.

## The problems

Work through these with the solving cycle from [Part 1](/blogs/dsa-the-method/). Give each problem a 15-minute honest struggle, write down one key sentence per problem, then review it with spaced repetition.

While you struggle with a problem from this topic, ask yourself:

- Why does the local choice stay the best choice overall?
- Is it a sort, a heap, or both?

After you watch a solution, justify the greedy decision in your own words. Why this sort key? Why this comparison? Why this tie rule?

{% include dsa-problems.html slug="dsa-intervals" %}

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
Foundation: Simple intuition/analogy. Plain-language mental model. What problem it solves.
Mechanics: Step-by-step reasoning. Key invariant/property. Explain WHY each important decision is safe, especially pointer/boundary movement or eliminating candidates. Whenever you introduce a worked numeric example to justify a step, reuse that same example consistently in the Diagram and Implementation sections rather than switching arrays between sections. Compute each step's value arithmetically and confirm it before presenting the trace; if a computed value differs from what you expected, correct the trace rather than adjusting the narrative to fit a wrong number.
Diagram: Use a diagram when it materially improves understanding of structure, state, or movement; do not force one. Pick the form based on your actual output capability, in this priority order:
If you can render inline SVG/vector graphics that the user can view directly, use a custom SVG-style diagram for anything where exact spatial detail matters: positions/indices in an array, pointer or window boundaries, stack/queue contents at a point in time.If you cannot render SVG/images but can render diagram markup the platform displays visually (e.g. Mermaid), use that for flows, state transitions, recursion trees, graph/tree relationships, or sequences of discrete steps. If the concept is index/position-based rather than flow-based, prefer a text-based diagram (option 3) over forcing Mermaid to depict spatial layout it isn't suited for.If neither of the above is available, use a plain text/ASCII diagram (aligned indices, values, and pointer markers using monospace formatting) so pointer positions, array layout, and movement are still visible without graphics. This is the universal fallback and should still show exact positions, not just describe them in prose.
State which of the three you're using only if it's not obvious from the output itself; otherwise just produce it.
Implementation: Clean [PROGRAMMING_LANGUAGE] in a fenced code block (for readability/syntax highlighting) with useful comments explaining important lines and relevant operations. Mentally execute the code against the same worked example end-to-end and confirm the output matches before presenting it; only include a comment claiming what the code does or why it's correct if that trace actually supports it. All other sections (explanations, questions, prose) should NOT use code fences. Time and space complexity.
Recognition: Signals: constraints, keywords, data properties, sortedness, contiguity, frequency/counting, optimization, etc. When NOT to use it. Distinguish it from similar techniques. If naming which [PROBLEM LIST] problems show these signals, only reference problems literally present in the [PROBLEM LIST] value provided; do not assume standard LeetCode 150 groupings or invent problem names.
Pitfalls: Important edge cases, off-by-one/boundary errors, duplicates, empty/single inputs, incorrect initialization, infinite loops, and complexity mistakes when relevant.
Active Recall: 3–5 reasoning questions. Base every question on the mechanics/invariant just taught, using the same worked example from Mechanics or a new small generic/synthetic example, never a problem named in [PROBLEM LIST]. Do not ask me to derive, prove, or walk through the full solution of a specific [PROBLEM LIST] problem here, even if it instantiates this exact technique; that derivation belongs in its own section later. Do not give answers immediately. Stop and wait for my answers before proceeding. When I respond: if correct, briefly confirm and add any nuance I missed; if incorrect or incomplete, correct it with a short explanation before moving on. Don't just move to the next section.
Disguised Mini-Task: Conditional checkpoint. Before starting this prerequisite's lesson, check whether any problem in [PROBLEM LIST] requires deriving and applying this prerequisite's core technique essentially from scratch (not merely as a labeled instance of a named pattern). Make this judgment call yourself and state it in one line (e.g. "X requires an independent safety-proof derivation, so we'll skip this checkpoint and cover that reasoning when we solve X directly"). Do not justify the call by actually deriving or proving that problem's solution here; that derivation happens only when we solve the problem in its own section. If yes, skip this checkpoint entirely and go straight to Transfer Test. If no such problem exists (the prerequisite's mechanics won't otherwise be independently exercised), include this checkpoint: use a problem not from [PROBLEM LIST]. Do not name the technique or hint at it initially. Make me identify the relevant observations, approach, justification, and complexity before coding. Stop and wait for my attempt. If stuck, give progressively stronger hints across multiple turns rather than solving it for me. Do not give the solution immediately.
Transfer Test: After the mini-task is resolved (or skipped), give one short unfamiliar scenario and ask whether I would use the concept and why. Stop and wait for my answer before giving feedback.
For every code comment that explains why something is correct (not just what a line does): name the actual variables/values involved instead of pronouns ("it", "this"); state any range, bound, or count as an explicit, inclusive expression rather than a hand-typed list or vague description; and mentally verify the claim against one small concrete example before writing the comment. If the claim isn't obvious on inspection, show that example inline or directly below the code. Apply this same rigor to every branch of a conditional, not just the first one. Do not leave a later branch's justification as "symmetric" without also checking it against a concrete example. When a claim rests on recalled general knowledge (library function behavior, language semantics, a known complexity result) rather than something you derived from the example in front of you, note that it's recalled rather than derived, so I know which claims to double-check myself.
Interaction:
Teach one prerequisite at a time. Within a prerequisite, pause at each applicable marked checkpoint above (Active Recall, Mini-Task when included, Transfer Test) rather than delivering the whole prerequisite in one uninterrupted block. If there are more prerequisites after this one, wait until I say "continue for next." If there is only one, finish it (through Transfer Test) without asking me to continue further. Do not solve [PROBLEM LIST] during prerequisite teaching. This applies to every subsection (Foundation, Mechanics, Diagram, Implementation, Recognition, Pitfalls, Active Recall, Mini-Task, Transfer Test), not just the obvious "let's solve problem X" case. Naming a [PROBLEM LIST] problem for motivation/context is fine; deriving, proving, or walking through its full solution is not; that happens only once we reach [PROBLEM LIST] itself, after all prerequisites are taught.
Integration:
After all prerequisites: Explain how they connect to TOPIC. Show how to distinguish competing approaches. Give a practical recognition checklist for unfamiliar problems. Stop there. Do not suggest which [PROBLEM LIST] problem to start with, do not ask which one I want to begin with, and do not start solving or discussing any specific [PROBLEM LIST] problem. Wait for me to initiate problem-solving on my own.
Depth
Keep the lesson as short as possible while achieving genuine understanding. The sections above are a checklist, not a target length. Scale depth to difficulty. Avoid repetition, unnecessary theory, excessive examples, history, and unrelated details. Prefer reasoning density over completeness.
Formatting
Use ### headings or lower only. No horizontal rules. No Markdown code fences except around [PROGRAMMING_LANGUAGE] implementation code and, if used, text/ASCII diagrams. Use whichever diagram form (SVG, Mermaid, or text-based) fits your actual rendering capability and the concept being taught, per the Diagram section above.
Begin with the first prerequisite.
{% endcapture %}
{% include coach.html prompt=coach label="Open the full lesson in" %}
