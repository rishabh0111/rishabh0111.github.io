---
layout: post
title: "Greedy is a bet you have to prove: Kadane's algorithm and the arguments that make a local choice safe"
date: 2024-03-01 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, greedy, kadane, python, series]
read_time: 32
permalink: /blogs/dsa-greedy/
excerpt: "A greedy algorithm picks the choice that looks best right now and never goes back. Writing one takes minutes. The real skill is knowing why that choice can't cost you the best answer, and it starts with Kadane's algorithm."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 13
series_total: 19
links_new_tab: true
---

A greedy algorithm makes the choice that looks best right now and never goes back to change it. The code is usually short. The trouble is that plenty of rules sound right, pass the examples, and then fail on an input nobody thought of.

So this post does two things. First it teaches Kadane's algorithm. Then it shows how to check that a greedy choice is safe before you trust it.

Where it fits in the series:

- It comes after [Heaps](/blogs/dsa-heaps/). A heap is often what hands a greedy algorithm "the best available choice".
- It sits next to [Intervals](/blogs/dsa-intervals/), whose problems are mostly greedy after a sort.
- Nothing later depends on it. But Kadane's algorithm comes back as a one-variable DP in [1-D Dynamic Programming](/blogs/dsa-1d-dynamic-programming/).

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## Kadane's Algorithm

### Foundation

You run a food stall and write down each day's profit or loss. At the end of the season you want your best run: the stretch of consecutive days with the largest total. You also want to know which days those were.

The brute force tries every (first day, last day) pair. That's O(n²) pairs. Even if prefix sums let you get each total in O(1), you still have O(n²) pairs to check.

Kadane's algorithm finds the answer in one pass. It rests on one observation. Say the days just before today add up to a negative number. Tacking them onto today can only pull today's total down. So if you're carrying a negative total into today, today does better on its own.

### Mechanics

Here is the worked example, eight days of profit and loss:

`pnl = [3, -5, 4, -1, 2, 6, -9, 5]` (days 0 through 7)

Instead of attacking the whole question, we ask a smaller one, once per day: **what is the best total of a stretch that ends exactly on day i?** Call that number `cur(i)`. Every stretch has to end on some day. So once we know `cur(i)` for every day, the overall answer is simply the largest of them.

How do we get `cur(i)`? A stretch that ends on day i can only be one of two things:

1. Day i on its own. Its total is `pnl[i]`.
2. Some stretch that ends on day i−1, with day i added on. Of all these, the best one uses the best stretch ending on day i−1. Its total is `cur(i-1) + pnl[i]`.

Pick whichever is bigger, and you get `cur(i) = pnl[i] + max(cur(i-1), 0)`. That one line is the whole algorithm. The `max(..., 0)` is where the greedy decision happens. Here is why each branch is safe:

- **If `cur(i-1) < 0`, drop everything before day i.** Remember that `cur(i-1)` is the *best* total of any stretch ending on day i−1. So every stretch ending on day i−1 totals at most `cur(i-1)`, which is below 0. Attaching any of them to day i would lower day i's total. That one comparison rules out every possible start day, from the current stretch's start through i−1, all at once. This is what makes the algorithm linear.
- **If `cur(i-1) >= 0`, extend.** Adding a number that is zero or more never lowers a total. So extending is at least as good as starting fresh.

We also want to report which days won. For that, keep `lo`, the first day of the stretch that `cur` currently describes. `lo` only moves when we reset, and then it moves to `i`. Whenever `cur` beats the best total seen so far, record `(lo, i)`.

Let's run it on the example:

- Day 0 gives `cur = 3`.
- Day 1 adds −5, so `cur = -2`.
- Going into day 2, `cur = -2`, which is below 0. So days 0 and 1 are dropped: `cur = 0 + 4 = 4`, and `lo = 2`.
- Days 3, 4 and 5 extend: `4 − 1 = 3`, then `3 + 2 = 5`, then `5 + 6 = 11`. 11 is the new best, covering days 2 through 5.
- Day 6 brings `11 − 9 = 2`.
- That 2 is still not negative, so day 7 extends: `2 + 5 = 7`. That doesn't beat 11.

Answer: **total 11, days 2 through 5** (4 − 1 + 2 + 6 = 11).

Look again at day 6. The stretch took a −9 hit and survived, because its running total only fell to 2, not below 0. Kadane's doesn't reset on a bad *day*. It resets only on a bad *running total*.

### Diagram

<figure class="sketch">{% include sketches/dsa-greedy/kadane-trace.svg %}</figure>

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

I ran all four, and the printed values match the comments. I also compared the function with an O(n²) brute force on 20,000 random lists, with lengths 1 to 9 and values −6 to 6. The totals matched every time, and the reported range always added up to the reported total.

Complexity, with n as the number of days:

- **O(n) time.** It's one pass, with O(1) work per day.
- **O(1) extra space.** We only keep a handful of numbers.

You might wonder whether this is greedy or dynamic programming. It's both. `cur(i) = pnl[i] + max(cur(i-1), 0)` is a DP recurrence (a rule that builds each answer from the previous one), and its state is a single number. "Drop a negative prefix and never look at it again" is the greedy way of reading the same line. You'll see the DP view again in [Part 15](/blogs/dsa-1d-dynamic-programming/).

### Recognition

These are the signals that Kadane's algorithm fits:

- **The statement says contiguous**, or something that means it: subarray, stretch, consecutive days, a segment.
- **You're maximizing (or minimizing) a sum.**
- **Negative values are allowed.** This one matters. If every value is zero or more, the whole array is the answer and you don't need Kadane.
- **The problem can be restated as a score per element, then "find the best segment".** The score might be ±1, or a gain or loss. This is the disguised form. Say flipping, taking or skipping a segment changes each element's contribution on its own, without affecting its neighbours. Then turn each element into its gain and run Kadane on the gains.

When NOT to use it, and what to use instead:

- **Subsequence, not subarray.** If the chosen elements don't have to sit next to each other, just take every positive value. No scan needed.
- **Length limits**, like "at most k days" or "exactly k days". Exactly k days is a fixed-size sliding window ([Part 6](/blogs/dsa-sliding-window/)). With at most k days, the reset rule is no longer enough. See the Transfer test.
- **Counting subarrays with a given sum.** That's prefix sums plus a hash map ([Part 2](/blogs/dsa-arrays-and-hashing/)), not a max.
- **Products instead of sums.** Multiplying by a negative number can turn the worst product into the best one. So you have to track a running max and a running min together. Maximum Product Subarray, in the 1-D DP list, is that variant.
- **Variable-size sliding window vs Kadane.** A window needs a condition that, once broken, stays broken as the window grows. That's what makes shrinking from the left safe. A condition like that is called monotone: it only ever changes in one direction. With negative numbers, a sum isn't monotone, so a window can't tell when to shrink. Kadane doesn't need that property.

On this topic's list, **Maximum Subarray** is a direct use of this module. It only asks for the best sum, not the range of days. Nothing else on the list is Kadane itself. But several problems reuse the idea underneath it: a running total that, once it crosses a line, rules out a whole block of candidates. The next module is about that idea.

### Pitfalls

- **Starting `best` at 0.** On `[-4, -2, -7]`, a version that starts at 0 returns 0. That's the total of an empty stretch, and the problem usually doesn't allow one. Start from `pnl[0]` or `float('-inf')` instead.
- **Resetting on a negative day instead of a negative running total.** In the example, day 6 is −9. But the running total only drops to 2, so day 7 correctly extends.
- **Returning `cur` instead of `best`.** At the end, `cur` is the best stretch ending on the *last* day (7 in the example). That isn't the best overall (11).
- **Moving `lo` in the wrong place.** `lo` changes only on a reset. The best range gets copied only when `best` improves. If you update `best_lo` on every reset, you end up with a range that doesn't match `best`.
- **Ties.** Writing `cur < 0` or `cur <= 0` doesn't change the total. It does change which range you report. On `[2, -2, 3]`, `< 0` reports days 0 to 2 (2 − 2 + 3 = 3), while `<= 0` reports day 2 alone (also 3). Check which one the problem wants.
- **Empty input.** Decide on purpose what should happen. The function above raises an error.

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

Judgment call: this checkpoint stays. Maximum Subarray doesn't count, because it's a labeled use of Kadane. No other problem on the list makes you derive the best-ending-here recurrence yourself.

You're given a string of `0`s and `1`s. You must pick exactly one non-empty contiguous segment and flip every bit in it (0 becomes 1, 1 becomes 0). What is the largest possible number of `1`s in the string afterwards?

Example: `s = "1001101001"` has five 1s. The best you can do is 7.

Before opening anything, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
You're given a string of 0s and 1s. You must pick exactly one non-empty contiguous segment and flip every bit in it (0 becomes 1, 1 becomes 0). What is the largest possible number of 1s in the string afterwards? Example: s = "1001101001" has five 1s. The best you can do is 7.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
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

The problems below need this too. Kadane's algorithm is just one algorithm. Every other problem on this list asks you to invent a local rule and then convince yourself it can't lose the best answer. That takes a method of its own.

### Foundation

A greedy algorithm is a series of choices you never undo. Each choice comes from a simple rule, like "take the shortest", "go as far as you can" or "drop the prefix once it goes negative". The code is easy. The only real question is: **can committing to this choice cost me the best answer?**

"It worked on the examples" doesn't answer that. Most wrong greedy rules pass the examples in the problem statement. Two things do answer it:

- a quick mechanical check that catches bad rules before you spend time trying to prove them, and
- one of a small number of argument shapes that proves a good rule is safe.

### Mechanics

Here is the worked example. Four jobs, with durations `[4, 1, 3, 2]` minutes, share one machine and run back to back. A job's waiting time is its start time. We want the order that makes the total waiting time as small as possible.

In the given order, the jobs start at minutes 0, 4, 5 and 8. That's a total of **17**. The obvious rule to try: run the shortest job first.

**Step 1: try to break the rule mechanically.** Before writing any proof, compare the rule with brute force on every small input. For four jobs there are only 24 orders to try. If the rule fails on some small input, this check usually finds it in seconds. For shortest-first, it finds no failure. For longest-first, it finds one straight away: `[1, 2]`.

**Step 2: pick an argument shape.** You'll need three of them for this list.

**Exchange argument.** Start from any optimal answer. If it differs from what greedy would do, change it one step toward greedy's answer without making it worse. Keep going until it *is* greedy's answer. Since you never made it worse, greedy's answer is optimal too.

Let's do this for the jobs, starting with the example. Swap the first pair, 4 then 1, to get `[1, 4, 3, 2]`. The total drops from 17 to 14, a change of −3. And −3 is exactly 1 − 4.

Now the general case. Suppose some order has a job of length x directly before a job of length y, with x > y. Swap just those two:

- The shorter job (y) now starts x minutes earlier.
- The longer job (x) now starts y minutes later.
- Every other job starts at exactly the same time, because the pair takes x + y minutes in either order.

So the total changes by y − x. Since x > y, that's negative. This means any order with a longer job directly before a shorter one can be improved, so it isn't optimal. The only orders with no such pair are sorted shortest to longest. So shortest-first is optimal.

On the example, the fully sorted order `[1, 2, 3, 4]` starts the jobs at 0, 1, 3 and 6, for a total of **10**. That matches the brute-force minimum of 10.

**Stays ahead (frontier) argument.** First pick a way to measure progress after k steps, such as how far you've reached or how many items you've handled. Then show, by induction on k, that greedy's progress is at least as good as any other strategy's after *every* step. If greedy is never behind, it can't finish worse.

A tiny example: is `"ace"` a subsequence of `"abcde"`? The greedy rule matches each letter of `"ace"` at its earliest possible position in `"abcde"`. After k letters, greedy's position in the text is at or before where any other valid matching would be. So greedy always has at least as much text left for the remaining letters. Matching a letter later than necessary only uses up text.

**Running balance (invariant) argument.** An invariant is a fact that stays true at every step of a loop. Here the fact is about one number that sums up everything that matters about the prefix so far. You show two things:

- the number tells you whether the prefix is still worth keeping, and
- once the number crosses a line, a whole block of candidates is ruled out together.

You've already seen one. Kadane's reset says: the running total is negative, so every start day in `lo..i-1` is dead. The whole proof of a running-balance greedy comes down to choosing the right number, then proving that "crossed the line" really does rule out that block.

All three arguments have one thing in common. Each compares greedy with an *arbitrary* competitor (any optimal order, any other matching, any start day in the block), never with just one example.

### Diagram

<figure class="sketch">{% include sketches/dsa-greedy/exchange-jobs.svg %}</figure>

Swapping the first pair moves the 1-minute job 4 minutes earlier and the 4-minute job 1 minute later. The 3-minute and 2-minute jobs don't move, because the pair fills minutes 0 to 5 in either order.

<figure class="sketch">{% include sketches/dsa-greedy/greedy-workflow.svg %}</figure>

### Implementation

Below are the greedy, a brute force, and a checker that tries every small input. The checker is the part worth keeping. It's how you find out a rule is wrong before an interviewer does.

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

All five printed values are what the code produced when I ran it.

Be careful about what the checker tells you. "No counterexample up to length 5" is evidence, not a proof. But a rule that fails the check is definitely wrong. And wrong rules are the common case.

Complexity, with n jobs:

- **The greedy is O(n log n) time.** The sort dominates (recalled, not derived here: Python's `sorted` is O(n log n)). `total_wait` adds O(n).
- **The brute force is O(n! · n).** That's why the checker stops at length 5.
- **The checker** tries 4ⁿ lists for each n from 1 to 5, and each list costs O(n! · n). That's fine for small limits and nothing else.

### Recognition

Signals that a greedy rule might exist:

- **The question has a certain shape.** It asks for a **yes/no feasibility** answer ("can you reach", "can you complete", "is it possible to arrange"). Or it asks for a **minimum count** ("fewest steps", "fewest groups"). Or it asks for a **maximum** where the choices happen in a natural order.
- **A small summary of the past is enough to pick the next move.** This happens after **sorting** by some key, or while **scanning left to right**. The summary might be a farthest point, a running total or a count.
- **Making a choice now doesn't take options away** from the future, compared with the alternatives. That's the property all three argument shapes end up proving.

On this list, the problem statements themselves show the signals:

- Jump Game, Gas Station, Hand of Straights, Merge Triplets to Form Target Triplet and Valid Parenthesis String ask yes/no feasibility questions.
- Jump Game II asks for a minimum count.
- Partition Labels asks for as many parts as possible.
- Maximum Subarray asks for a best contiguous sum.

Working out which rule and which argument fit each one is the work of solving it.

When NOT to use greedy:

- **The checker finds a counterexample.** Usually that means the choices interact: one choice changes what the others are worth. That's DP ([1-D](/blogs/dsa-1d-dynamic-programming/), [2-D](/blogs/dsa-2d-dynamic-programming/)).
- **You need all valid answers**, or n is tiny and there's no safe rule. Use [backtracking](/blogs/dsa-backtracking/).
- **Greedy vs heap.** These don't compete. When the candidates keep changing, a heap is often how a greedy rule gets "the current best choice" quickly ([Part 10](/blogs/dsa-heaps/)).
- **Greedy vs sliding window.** A variable-size window is itself a greedy argument: "grow while valid, shrink when broken". It's safe only when the window condition behaves the same way as the window grows.

### Pitfalls

- **Greedy by the wrong key.** Now give each job a weight as well, and minimize the sum of weight × waiting time. Shortest-first is now wrong. Take two jobs: (duration 3, weight 10) and (duration 1, weight 1). Shortest-first gives 0·1 + 1·10 = 10. Running the heavy job first gives 0·10 + 3·1 = 3.

  The right key is duration ÷ weight, smallest first (recalled: this is Smith's rule). An exhaustive check, up to four jobs with durations and weights 1 to 3, finds no counterexample for that key.

  The lesson is that the exchange argument has to be redone for each new objective. Here, with job (x, w_x) directly before job (y, w_y), the swap changes the total by `y·w_x − x·w_y`, not `y − x`. On the pair above that's 3·1 − 1·10 = −7, and 10 − 7 = 3.
- **Ties are part of the rule.** Run the same exhaustive check on the weighted version with the shortest-first key. The first failure it finds is `[(1, 1), (1, 2)]`. Both durations are 1, so the tie is broken by input order, and the lighter job goes first. That gives a total of 2 instead of 1. If equal keys can happen, decide what to do with them and check that case.
- **Proof by one example.** Showing that greedy is optimal on the example is not an exchange argument. The argument has to start from an *arbitrary* optimal answer.
- **Stays-ahead must hold at every step.** It isn't enough for greedy to come out ahead at the end of your example. The induction has to show greedy is never behind after any step.
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

Judgment call: skipped. Every problem on this list after Maximum Subarray needs its own safety argument built from scratch. That's where you'll practise this module, so we go straight to the Transfer test.

### Transfer test

You're packing a bag with capacity 10 kg. The items are (6 kg, worth 30), (5 kg, worth 20) and (5 kg, worth 20). Each item is taken whole or not at all. A colleague says: "Greedy: sort by worth per kg, take items while they fit." Would you use it? Why?

{% capture coach %}
You are my coding-interview coach. I just learned how to prove a greedy choice safe (a greedy rule is only trustworthy once it survives brute-force checking on small inputs and has an exchange, stays-ahead or running-balance argument that holds against any optimal answer). Scenario: You're packing a bag with capacity 10 kg. The items are (6 kg, worth 30), (5 kg, worth 20) and (5 kg, worth 20). Each item is taken whole or not at all. A colleague says: "Greedy: sort by worth per kg, take items while they fit."
Ask me whether I would use that greedy rule here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

**How the two modules connect to Greedy.** Kadane's algorithm is the smallest complete example of what this topic asks for. It has:

- one scan,
- a small state,
- a rule that throws away a whole block of candidates, and
- an argument that throwing them away can't lose the best answer.

The second module takes that argument and makes it general. Every greedy problem on the list follows the same template:

1. An order to process things in. That could be the given order, a sorted order, or whatever a heap or hash map serves up.
2. A local rule.
3. One of three reasons the rule is safe: an exchange, stays ahead, or a running balance that certifies the prefix.

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

Work through these with the solving cycle from [Part 1](/blogs/dsa-the-method/). Give each problem a 15-minute honest struggle, write one key sentence for it, then review it with spaced repetition.

For greedy, the question to wrestle with is always the same: *why does the local choice stay globally optimal?* Break it down:

- Is the order a sort or a heap?
- Which of the three arguments makes the choice safe?

If you watch a video walkthrough of a problem, justify the greedy decision in your own words afterwards. Then put that justification in your key sentence.

{% include dsa-problems.html slug="dsa-greedy" %}

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
