---
layout: post
title: "Greedy is a bet you have to prove: Kadane's algorithm and the arguments that make a local choice safe"
date: 2024-03-01 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, greedy, kadane, python, series]
read_time: 30
permalink: /blogs/dsa-greedy/
excerpt: "A greedy algorithm commits to the choice that looks best right now and never goes back. Writing one takes minutes. Knowing why that choice can't cost you the optimum is the actual skill, and it starts with Kadane's algorithm."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 13
series_total: 19
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers greedy algorithms: Kadane's algorithm first, then how to check that a local choice is safe before you trust it.

A greedy algorithm makes the choice that looks best right now, commits to it, and never goes back. The code is usually short: a sort or a single scan, and one rule. What makes greedy hard in interviews is that plenty of rules look right, pass the examples in the problem statement, and then fail on some input nobody thought of. So this post teaches two things. First the one algorithm this topic builds on, then how to check that a greedy choice is actually safe before you trust it.

The prerequisite here is **Kadane's Algorithm**. In the order this series follows, Greedy comes after [Heaps](/blogs/dsa-heaps/), next to [Intervals](/blogs/dsa-intervals/). A heap is often the data structure that serves up "the best available choice", and interval problems are mostly greedy after a sort. Nothing later in the series depends on Greedy, but Kadane's algorithm reappears as a one-variable DP in [1-D Dynamic Programming](/blogs/dsa-1d-dynamic-programming/).

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Kadane's Algorithm

### Foundation

You run a food stall and log each day's profit or loss. At the end of the season you want the best run: the stretch of consecutive days with the largest total. You also want to know which days those were.

The brute force checks every (first day, last day) pair, which is O(n²) pairs even if each total is computed in O(1) with prefix sums. Kadane's algorithm gets the answer in one pass by noticing one thing. A run of days whose total is negative never helps whatever comes after it. If you're carrying a negative total into today, today does better alone.

### Mechanics

Worked example, eight days of profit and loss:

`pnl = [3, -5, 4, -1, 2, 6, -9, 5]` (days 0 through 7)

Build the answer from one smaller question, asked once per day: **what is the best total of a stretch that ends exactly on day i?** Call it `cur(i)`. Every stretch ends on some day, so the overall answer is the largest `cur(i)` over all days.

A stretch ending on day i is one of two things:

1. Day i alone, total `pnl[i]`.
2. Some stretch ending on day i−1, plus day i. The best of these uses the best stretch ending on day i−1, so its total is `cur(i-1) + pnl[i]`.

So `cur(i) = pnl[i] + max(cur(i-1), 0)`. That one line is the whole algorithm. The `max(..., 0)` is where the greedy decision happens, and it's worth being precise about why it's safe:

- **If `cur(i-1) < 0`**, drop everything before day i. `cur(i-1)` is the *best* total of any stretch ending on day i−1, so every such stretch totals at most `cur(i-1)`, which is below 0. Attaching any of them to day i lowers day i's total. One comparison rules out every start day from the current stretch's start through i−1, all at once. That's the part that makes it linear.
- **If `cur(i-1) >= 0`**, extend. Adding a non-negative number never lowers the total, so extending is at least as good as starting fresh.

To report the days, keep `lo`, the first day of the stretch `cur` currently describes. `lo` moves only on a reset, to `i`. Whenever `cur` beats the best seen so far, record `(lo, i)`.

On the example: day 0 gives `cur = 3`. Day 1 adds −5, giving `cur = -2`. Going into day 2, `cur = -2 < 0`, so days 0 and 1 are dropped: `cur = 0 + 4 = 4`, `lo = 2`. Days 3, 4 and 5 extend: `4 − 1 = 3`, `3 + 2 = 5`, `5 + 6 = 11`, and 11 is the new best, days 2 through 5. Day 6 brings `11 − 9 = 2`. That's still non-negative, so day 7 extends: `2 + 5 = 7`, which doesn't beat 11. Answer: **total 11, days 2 through 5** (4 − 1 + 2 + 6 = 11).

Notice day 6. The stretch went through a −9 and survived because its running total stayed at 2, not below 0. Kadane's doesn't reset on a bad *day*, only on a bad *running total*.

### Diagram

The state before and after each day. `cur in` is `cur(i-1)`, and `cur out` is `cur(i)`. In the `pnl` row, red marks the days the reset drops and green the best stretch. Amber marks the reset column, and blue marks the days where `best` improves.

<figure class="sketch">{% include sketches/dsa-greedy/kadane-trace.svg %}<figcaption>Kadane's algorithm on pnl = [3, −5, 4, −1, 2, 6, −9, 5]. The only reset is before day 2 (amber); the −9 on day 6 leaves the running total at 2, so day 7 extends. Best stretch: days 2 to 5, total 11 (green).</figcaption></figure>

### Implementation

```python
def best_stretch(pnl):
    """Return (best_total, first_day, last_day) of the best run of consecutive days."""
    if not pnl:
        raise ValueError("need at least one day")
    # Start from a real stretch (day 0 alone), not from 0: if every day is a
    # loss, the answer is the smallest loss, e.g. [-4, -2, -7] -> (-2, 1, 1).
    best, best_lo, best_hi = pnl[0], 0, 0
    cur, lo = 0, 0      # cur = best total of a stretch ending on day i-1; it starts on day lo
    for i, x in enumerate(pnl):
        if cur < 0:
            # cur is the best total of any stretch ending on day i-1, so every
            # stretch starting on a day in lo..i-1 and ending on day i-1 totals
            # <= cur < 0. Prefixing any of them onto day i only lowers the total,
            # so the best stretch ending on day i starts on day i.
            # Example: before day 2, cur = -2, so days 0..1 are dropped.
            cur, lo = 0, i
        # else: cur >= 0, and adding cur to day i can't lower day i's total.
        # Example: before day 7, cur = 2 >= 0, so day 7 extends days 2..6.
        cur += x        # now cur = best total of a stretch ending exactly on day i
        if cur > best:  # strict '>': on a tie, keep the stretch found first
            best, best_lo, best_hi = cur, lo, i
    return best, best_lo, best_hi


print(best_stretch([3, -5, 4, -1, 2, 6, -9, 5]))   # (11, 2, 5)
print(best_stretch([-4, -2, -7]))                  # (-2, 1, 1)
print(best_stretch([7]))                           # (7, 0, 0)
print(best_stretch([2, -2, 3]))                    # (3, 0, 2)
```

I ran all four, and the printed values match the comments. I also compared the function with an O(n²) brute force on 20,000 random lists of lengths 1 to 9 and values −6 to 6. The totals matched every time, and the reported range always summed to the reported total.

Complexity: O(n) time, where n is the number of days (one pass, O(1) work per day), and O(1) extra space.

It's fair to ask whether this is greedy or dynamic programming. It's both. `cur(i) = pnl[i] + max(cur(i-1), 0)` is a DP recurrence whose state is a single number. "Drop a negative prefix and never look at it again" is the greedy way of reading the same line. You'll see the DP view again in [Part 15](/blogs/dsa-1d-dynamic-programming/).

### Recognition

Signals:

- **Contiguous** is in the statement: subarray, stretch, consecutive days, a segment.
- You're **maximizing (or minimizing) a sum**.
- **Negative values are allowed.** This matters. If every value is non-negative, the whole array is the answer and you don't need Kadane.
- The problem can be restated as a ±1 or gain/loss score per element, then "the best segment". This is the disguised form. If flipping, taking or skipping a segment changes each element's contribution independently, turn each element into its gain and run Kadane on the gains.

When NOT to use it, and what to use instead:

- **Subsequence, not subarray.** If the elements don't have to be adjacent, take every positive value. No scan needed.
- **Length limits** ("at most k days", "exactly k days"). With exactly k days it's a fixed-size sliding window ([Part 6](/blogs/dsa-sliding-window/)). With at most k days, the reset rule is no longer enough. See the Transfer test.
- **Counting subarrays with a given sum.** That's prefix sums plus a hash map ([Part 2](/blogs/dsa-arrays-and-hashing/)), not a max.
- **Products instead of sums.** A negative number can turn the worst product into the best one, so you track a running max and a running min together. Maximum Product Subarray, in the 1-D DP list, is that variant.
- **Variable-size sliding window vs Kadane.** A window needs a condition that stays broken as the window grows, so shrinking from the left is safe. With negative numbers, a sum doesn't behave that way, so a window can't decide when to shrink. Kadane doesn't need that monotone property.

On this topic's list, **Maximum Subarray** is a direct instance of this module. It asks for the best sum only, not the range. Nothing else on the list is Kadane itself, but several of them reuse the idea underneath it: a running total that, once it crosses a line, rules out a whole block of candidates. The next module is about that idea.

### Pitfalls

- **Starting `best` at 0.** On `[-4, -2, -7]` a version that starts at 0 returns 0. That's the total of an empty stretch, which the problem usually doesn't allow. Start from `pnl[0]` or `float('-inf')`.
- **Resetting on a negative day instead of a negative running total.** On the example, day 6 is −9, but the running total stays at 2 and day 7 correctly extends.
- **Returning `cur` instead of `best`.** At the end, `cur` is the best stretch ending on the *last* day (7 on the example), not the best overall (11).
- **Moving `lo` in the wrong place.** `lo` changes only on a reset. The best range is copied only when `best` improves. If you update `best_lo` on every reset, you get a range that doesn't match `best`.
- **Ties.** `cur < 0` versus `cur <= 0` doesn't change the total, but it changes which range you report. On `[2, -2, 3]`, `< 0` reports days 0 to 2 (2 − 2 + 3 = 3), and `<= 0` reports day 2 alone (also 3). Check which one the problem wants.
- **Empty input.** Decide explicitly. The function above raises an error.

### Active Recall

Answer out loud or on paper first.

1. On the worked example, before day 2, `cur = -2`. That throws away *two* possible start days, 0 and 1. The stretch starting on day 1 (just −5) was never compared with anything directly. Why is it safe to drop it too?
2. After day 6, `cur = 2`. What exactly does that 2 mean, and why didn't `best` change on day 6?
3. On `[-4, -2, -7]`, what does `best_stretch` return? What would a version that starts `best = 0` return, and why is that wrong?
4. On `[2, -2, 3]` the function reports days 0 to 2. Which one-character change makes it report day 2 alone, and does the total change?
5. Write the recurrence for `cur(i)` and say what the DP state is.

{% capture coach %}
You are my coding-interview coach. I just studied Kadane's algorithm in Python: to find the contiguous stretch with the largest sum, keep cur, the best total of a stretch ending exactly on the current index, using cur(i) = pnl[i] + max(cur(i-1), 0). If the running total coming into day i is negative, every stretch ending on day i-1 is negative, so all of them are dropped at once and a new stretch starts at day i (lo = i); otherwise extend. best starts at pnl[0] (not 0), and the range (lo, i) is recorded only when cur beats best (strict >). The implementation resets with "if cur < 0: cur, lo = 0, i" before adding the day's value.
Worked example from the lesson: pnl = [3, -5, 4, -1, 2, 6, -9, 5] for days 0 to 7. cur after each day is 3, -2, 4, 3, 5, 11, 2, 7. The only reset is before day 2 (cur was -2). Day 6 (-9) leaves cur at 2, so day 7 extends. Answer: total 11, days 2 through 5 (4 - 1 + 2 + 6). The function best_stretch returns (best_total, first_day, last_day): (11, 2, 5) here, (-2, 1, 1) on [-4, -2, -7], (3, 0, 2) on [2, -2, 3].
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. On the worked example, before day 2, cur = -2. That throws away two possible start days, 0 and 1. The stretch starting on day 1 (just -5) was never compared with anything directly. Why is it safe to drop it too?
2. After day 6, cur = 2. What exactly does that 2 mean, and why didn't best change on day 6?
3. On [-4, -2, -7], what does best_stretch return? What would a version that starts best = 0 return, and why is that wrong?
4. On [2, -2, 3] the function reports days 0 to 2. Which one-character change makes it report day 2 alone, and does the total change?
5. Write the recurrence for cur(i) and say what the DP state is.
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: Maximum Subarray is a labeled instance of Kadane, so it doesn't count. No other problem on the list requires deriving the best-ending-here recurrence itself, so this checkpoint stays.

You're given a string of `0`s and `1`s. You must pick exactly one non-empty contiguous segment and flip every bit in it (0 becomes 1, 1 becomes 0). What is the largest possible number of `1`s in the string afterwards?

Example: `s = "1001101001"` has five 1s. The best you can do is 7.

Before opening anything, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
You're given a string of 0s and 1s. You must pick exactly one non-empty contiguous segment and flip every bit in it (0 becomes 1, 1 becomes 0). What is the largest possible number of 1s in the string afterwards? Example: s = "1001101001" has five 1s. The best you can do is 7.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

Same food stall and same daily profit/loss list, but the stall's lease only allows a promotion run of **at most k consecutive days**. You want the best total over any run of 1 to k days. Would you use Kadane's algorithm as written? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Kadane's algorithm (keep the best total of a stretch ending at the current day, and drop the carried prefix whenever its running total goes negative, giving the best contiguous sum in one O(n) pass). Scenario: A food stall logs each day's profit or loss. The stall's lease only allows a promotion run of at most k consecutive days. You want the best total over any run of 1 to k days.
Ask me whether I would use Kadane's algorithm as written here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Proving a greedy choice

The problems below also need this. Kadane's algorithm is one algorithm. Every other problem on this list asks you to invent a local rule and convince yourself it can't lose the optimum, and that takes a method of its own.

### Foundation

A greedy algorithm is a sequence of choices you never undo, each made by a simple rule ("take the shortest", "go as far as you can", "drop the prefix once it goes negative"). The code is easy. The only real question is: **can committing to this choice cost me the best answer?**

"It worked on the examples" doesn't answer that question. Most wrong greedy rules pass the examples in the statement. What does answer it is one of a small number of argument shapes, plus a quick mechanical check that kills bad rules before you spend time trying to prove them.

### Mechanics

Worked example: four jobs with durations `[4, 1, 3, 2]` minutes share one machine and run back to back. A job's waiting time is its start time. Choose the order that minimizes total waiting time.

In the given order the jobs start at minutes 0, 4, 5 and 8, for a total of **17**. Obvious rule: run the shortest job first.

**Step 1: try to break the rule mechanically.** Before any proof, compare the rule with brute force on every small input. For four jobs that's only 24 orders. If a counterexample exists among small inputs, it usually shows up here in seconds. For shortest-first, the check finds none. For longest-first, it finds `[1, 2]` straight away.

**Step 2: pick an argument shape.** There are three you'll need for this list.

**Exchange argument.** Take any optimal answer. If it differs from what greedy would do, change it one step toward greedy's answer without making it worse. Repeat until it *is* greedy's answer. Then greedy is optimal too.

For the jobs: suppose some order has a job of length x directly before a job of length y, with x > y. Swap just those two:

- the shorter job (y) now starts x minutes earlier
- the longer job (x) now starts y minutes later
- every other job starts at exactly the same time, because the pair takes x + y minutes in either order

The total changes by y − x, which is negative. So any order containing such an adjacent pair is not optimal. An order with no such pair is sorted ascending, so shortest-first is optimal. On the example, swapping the first pair (4 then 1) changes 17 to 14, and 14 − 17 = −3 = 1 − 4. The fully sorted order `[1, 2, 3, 4]` starts jobs at 0, 1, 3, 6, total **10**, which matches brute force's minimum of 10.

**Stays ahead (frontier) argument.** Define a measure of progress after k steps: how far you've reached, or how many items you've handled. Then show, by induction on k, that greedy's progress is at least as good as any other strategy's after *every* step. If greedy is never behind, it can't finish worse. A tiny example: to check whether `"ace"` is a subsequence of `"abcde"`, match each pattern letter at its earliest possible position in the text. After k letters, greedy's position in the text is at or before any other valid matching's position, so greedy always has at least as much text left to match the rest. Matching late only uses up text.

**Running balance (invariant) argument.** Keep one number that summarizes everything about the prefix that matters. Show two things: the number tells you whether the prefix is still usable, and once it crosses a line, a whole block of candidates is ruled out together. You've already seen one. Kadane's reset says: the running total is negative, so every start day in `lo..i-1` is dead. The whole proof of a running-balance greedy is choosing the right number and proving that "crossed the line" really does rule out that block.

The common thread: each argument compares greedy with an *arbitrary* competitor (any optimal order, any other matching, any start day in the block), never with one example.

### Diagram

The exchange argument on the worked example. Each bar is one job, drawn to scale on a 0 to 10 minute timeline, and each duration keeps its colour across the three rows.

<figure class="sketch">{% include sketches/dsa-greedy/exchange-jobs.svg %}<figcaption>Given order: total 17. Swapping the first pair: total 14 (change 1 − 4 = −3). Sorted: total 10, the brute-force minimum.</figcaption></figure>

Swapping the first pair moves the 1-minute job 4 minutes earlier and the 4-minute job 1 minute later. The 3 and 2 jobs don't move, because the pair occupies minutes 0 to 5 either way.

The workflow as a whole. Red is the branch where the rule dies, amber the decision point, green the three argument shapes.

<figure class="sketch">{% include sketches/dsa-greedy/greedy-workflow.svg %}<figcaption>From a rule to a proof: break it with brute force first, then pick an argument shape.</figcaption></figure>

### Implementation

The greedy, a brute force, and the checker that tries every small input. The checker is the tool to keep. It's how you find out a rule is wrong before an interviewer does.

```python
from itertools import permutations, product


def total_wait(order):
    """Sum of start times when jobs run back to back in this order."""
    total, clock = 0, 0
    for d in order:
        total += clock          # this job waited `clock` minutes before it started
        clock += d
    return total


def greedy_order(durations):
    # Shortest first. Why safe: if a job of length x runs directly before a job
    # of length y with x > y, swapping the two changes the total by y - x < 0.
    # The y-job starts x earlier, the x-job starts y later, and every other job
    # keeps its start time because the pair spans x + y minutes either way.
    # Example: [4, 1, 3, 2] -> swap first pair -> total 17 becomes 14 (1 - 4 = -3).
    # So an optimal order has no adjacent pair with x > y: it is sorted ascending.
    return sorted(durations)


def brute_best(durations):
    # Tries all len(durations)! orders; only for checking small inputs.
    return min(total_wait(p) for p in permutations(durations))


def find_counterexample(rule, max_n=5, max_len=4):
    """Try every duration list with values 1..max_len and length 1..max_n."""
    for n in range(1, max_n + 1):
        for jobs in product(range(1, max_len + 1), repeat=n):
            if total_wait(rule(list(jobs))) != brute_best(jobs):
                return list(jobs)
    return None


jobs = [4, 1, 3, 2]
print(total_wait(jobs))                                        # 17
print(total_wait(greedy_order(jobs)), brute_best(jobs))        # 10 10
print(find_counterexample(greedy_order))                       # None
print(find_counterexample(lambda d: sorted(d, reverse=True)))  # [1, 2]
print(find_counterexample(lambda d: d))                        # [2, 1]
```

All five printed values are what the code produced when I ran it. The checker proves nothing: "no counterexample up to length 5" is evidence, not a proof. But a rule that fails it is definitely wrong, and wrong rules are the common case.

Complexity: the greedy is O(n log n) time for n jobs, dominated by the sort (recalled: Python's `sorted` is O(n log n)), plus O(n) for `total_wait`. The brute force is O(n! · n), which is why the checker only goes up to length 5. The checker's cost is the sum over n = 1..5 of 4ⁿ lists, each costing O(n! · n). It's fine for small limits and nothing else.

### Recognition

Signals that a greedy rule might exist:

- The problem asks for a **yes/no feasibility** answer ("can you reach", "can you complete", "is it possible to arrange"), a **minimum count** ("fewest steps", "fewest groups"), or a **maximum** where choices happen in a natural order.
- After **sorting** by some key, or while **scanning left to right**, the best next move can be decided from a small summary of the past (a farthest point, a running total, a count).
- Making a choice now **doesn't take options away** from the future compared with the alternatives. That's the property every one of the three argument shapes ends up proving.

On this list, the statements themselves show the signals. Jump Game, Gas Station, Hand of Straights, Merge Triplets to Form Target Triplet and Valid Parenthesis String ask yes/no feasibility questions. Jump Game II asks for a minimum count. Partition Labels asks for as many parts as possible. Maximum Subarray asks for a best contiguous sum. Which rule and which argument fit each one is the work of solving it.

When NOT to use greedy:

- **The checker finds a counterexample.** Usually the choices interact, so one choice changes what the others are worth. That's DP ([1-D](/blogs/dsa-1d-dynamic-programming/), [2-D](/blogs/dsa-2d-dynamic-programming/)).
- You need **all** valid answers, or n is tiny and there's no safe rule: [backtracking](/blogs/dsa-backtracking/).
- Greedy vs heap: these don't compete. A heap is often how a greedy rule gets "the current best choice" quickly when the candidates keep changing ([Part 10](/blogs/dsa-heaps/)).
- Greedy vs sliding window: a variable-size window is itself a greedy argument, "grow while valid, shrink when broken", and it's safe only when the window condition behaves the same way as the window grows.

### Pitfalls

- **Greedy by the wrong key.** Give each job a weight too, and minimize the sum of weight × waiting time. Shortest-first is now wrong. With jobs (duration 3, weight 10) and (duration 1, weight 1), shortest-first gives 0·1 + 1·10 = 10, and running the heavy job first gives 0·10 + 3·1 = 3. The right key is duration ÷ weight, smallest first (recalled: this is Smith's rule). Exhaustive checking up to four jobs with durations and weights 1 to 3 finds no counterexample for that key. The exchange argument has to be redone for each new objective. Here, with job (x, w_x) directly before job (y, w_y), the swap changes the total by `y·w_x − x·w_y`, not `y − x`. On the pair above that is 3·1 − 1·10 = −7, and 10 − 7 = 3.
- **Ties are part of the rule.** For the weighted version, the same exhaustive check on the shortest-first key finds `[(1, 1), (1, 2)]` first. Both durations equal 1, so the tie is broken by input order, and the lighter job goes first: total 2 instead of 1. If equal keys can occur, decide what to do with them and check that case.
- **Proof by one example.** Showing greedy is optimal on the example is not an exchange argument. The argument has to start from an *arbitrary* optimal answer.
- **Stays-ahead must hold at every step.** It isn't enough for greedy to be ahead at the end on your example. The induction has to show it's never behind after any step.
- **Forgetting the sort in the complexity.** A one-pass greedy after a sort is O(n log n), not O(n).

### Active Recall

Answer out loud or on paper first.

1. In the worked example, you swap the adjacent pair (3, 2) in the order `[1, 4, 3, 2]`. By exactly how much does the total change, and which jobs' start times move?
2. The exchange argument only looks at *adjacent* swaps. Why is that enough to prove the sorted order is optimal, and what happens when two jobs have equal duration?
3. Your greedy matches the expected output on all five examples you wrote by hand. What do you do before you trust it, and what does that step actually prove?
4. In the subsequence example, why is matching each pattern letter at its *earliest* position in the text safe? State what "stays ahead" means there.
5. Kadane's reset is a running-balance argument. What is the balance, what line does it cross, and which candidates does one crossing rule out?

{% capture coach %}
You are my coding-interview coach. I just studied proving a greedy choice safe, in Python: first compare the greedy rule with a brute force on every small input (a counterexample proves the rule wrong; none is only evidence), then prove it with one of three argument shapes. Exchange: take any optimal answer and move it one step toward greedy's answer without making it worse. Stays ahead: define progress after k steps and show by induction that greedy is never behind any other strategy after every step. Running balance: one number summarizes the prefix, and once it crosses a line a whole block of candidates is ruled out together (Kadane's reset: once cur, the best total of a stretch ending on the previous day, goes below 0, every start day in lo..i-1 is dead).
Worked example from the lesson: four jobs with durations [4, 1, 3, 2] minutes run back to back on one machine; a job's waiting time is its start time; minimize the total. Given order: starts 0, 4, 5, 8, total 17. Swapping an adjacent pair where a job of length x runs before a shorter job of length y changes the total by y - x, and no other job moves because the pair spans x + y minutes either way. Swapping the first pair gives [1, 4, 3, 2], total 14 (1 - 4 = -3). Sorted [1, 2, 3, 4]: starts 0, 1, 3, 6, total 10, the brute-force minimum. Stays-ahead example: to check whether "ace" is a subsequence of "abcde", match each pattern letter at its earliest possible position in the text.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. In the worked example, you swap the adjacent pair (3, 2) in the order [1, 4, 3, 2]. By exactly how much does the total change, and which jobs' start times move?
2. The exchange argument only looks at adjacent swaps. Why is that enough to prove the sorted order is optimal, and what happens when two jobs have equal duration?
3. Your greedy matches the expected output on all five examples you wrote by hand. What do you do before you trust it, and what does that step actually prove?
4. In the subsequence example, why is matching each pattern letter at its earliest position in the text safe? State what "stays ahead" means there.
5. Kadane's reset is a running-balance argument. What is the balance, what line does it cross, and which candidates does one crossing rule out?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: every problem on this list after Maximum Subarray needs its own safety argument built from scratch, so that's where this module gets practised. Skipping the mini-task and going straight to the Transfer test.

### Transfer test

You're packing a bag with capacity 10 kg. The items are (6 kg, worth 30), (5 kg, worth 20) and (5 kg, worth 20). Each item is taken whole or not at all. A colleague says: "Greedy: sort by worth per kg, take items while they fit." Would you use it? Why?

{% capture coach %}
You are my coding-interview coach. I just learned how to prove a greedy choice safe (a greedy rule is only trustworthy once it survives brute-force checking on small inputs and has an exchange, stays-ahead or running-balance argument that holds against any optimal answer). Scenario: You're packing a bag with capacity 10 kg. The items are (6 kg, worth 30), (5 kg, worth 20) and (5 kg, worth 20). Each item is taken whole or not at all. A colleague says: "Greedy: sort by worth per kg, take items while they fit."
Ask me whether I would use that greedy rule here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

**How the two modules connect to Greedy.** Kadane's algorithm is the smallest complete example of what this topic asks for: one scan, a small state, a rule that throws away a whole block of candidates, and an argument that the throwaway can't lose the optimum. The second module generalizes that argument. Every greedy problem on the list follows the same template: an order to process things in (the given order, or sorted, or served by a heap or hash map), a local rule, and one of three reasons the rule is safe. That's an exchange, stays ahead, or a running balance that certifies the prefix.

**Distinguishing competing approaches:**

| If you notice... | Lean towards | Why |
| --- | --- | --- |
| Best contiguous sum, negatives allowed, no length cap | Kadane | Negative running total rules out the whole prefix |
| A local rule survives brute-force checking on small inputs | Greedy + a proof shape | Evidence the choice never removes options |
| A small counterexample where an early choice changes what later choices are worth | DP | Choices interact, so you must remember more than one summary |
| "Return all" or n ≤ ~20 with no safe rule | Backtracking | Enumerate with pruning |
| "Repeatedly take the best available" while the pool changes | Greedy served by a heap | The heap is how you get the best choice fast |
| Contiguous range with a condition that stays broken as it grows | Sliding window | Monotone condition makes shrinking safe |
| Contiguous range with a length cap | Prefix sums + monotonic deque | Kadane's reset ignores length |

**Recognition checklist for an unfamiliar problem:**

1. Is it contiguous and about a sum with negatives? Try Kadane: what's "best ending here", and when is it worth dropping?
2. Is it a yes/no feasibility, a minimum count, or a maximum under a natural order? Write the simplest local rule you can state in one sentence.
3. What order does the rule need: the given order, sorted by which key, or "current best" from a heap?
4. Before coding the full thing, run the rule against brute force on small inputs. Any counterexample means changing the key, or moving to DP.
5. Name the argument: exchange (swap toward greedy), stays ahead (greedy's progress is never behind), or running balance (one number, and what crossing its line rules out).
6. Check ties, length 0/1/2 inputs, and whether the sort goes into the complexity.

## The problems

Work these with the solving cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute honest struggle, one key sentence per problem, then spaced repetition. For greedy, the struggle question is always *why does the local choice stay globally optimal?* Is the order a sort or a heap, and which of the three arguments makes the choice safe? If you watch a video walkthrough of the problem, justify the greedy decision in your own words afterwards, and put that justification in your key sentence.

| # | Problem |
| --- | --- |
| 1 | [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/) |
| 2 | [Jump Game](https://leetcode.com/problems/jump-game/) |
| 3 | [Jump Game II](https://leetcode.com/problems/jump-game-ii/) |
| 4 | [Gas Station](https://leetcode.com/problems/gas-station/) |
| 5 | [Hand of Straights](https://leetcode.com/problems/hand-of-straights/) |
| 6 | [Merge Triplets to Form Target Triplet](https://leetcode.com/problems/merge-triplets-to-form-target-triplet/) |
| 7 | [Partition Labels](https://leetcode.com/problems/partition-labels/) |
| 8 | [Valid Parenthesis String](https://leetcode.com/problems/valid-parenthesis-string/) |

## Take this lesson as a live session

If you'd rather have this lesson as a conversation that stops and waits for your answers, open the prompt below in a chat.

{% capture coach %}
[TOPIC]: Greedy
[PREREQUISITES]: Kadane's Algorithm
[PROBLEM LIST]: Maximum Subarray, Jump Game, Jump Game II, Gas Station, Hand of Straights, Merge Triplets to Form Target Triplet, Partition Labels, Valid Parenthesis String
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
