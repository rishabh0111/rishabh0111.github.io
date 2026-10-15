---
layout: post
title: "Dynamic programming is backtracking that finally remembers what it already worked out"
date: 2024-03-06 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, dynamic-programming, palindromes, python, series]
read_time: 39
permalink: /blogs/dsa-1d-dynamic-programming/
excerpt: "If a backtracking tree keeps asking the same question, you probably have a DP problem. Say what each subproblem means, write how it's built from smaller ones, fix the smallest answers, then shrink the code from recursion down to two variables."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 15
series_total: 19
links_new_tab: true
---

Sometimes you don't need every solution. You only need a count, a minimum, or a yes/no. In those cases [Backtracking](/blogs/dsa-backtracking/) wastes time, because it solves the same smaller problem again and again as it arrives from different directions.

1-D dynamic programming fixes that. It labels each smaller problem with a single number, like a position or an amount. It solves each one once, then builds the final answer out of smaller answers. Expand-around-center, the second module here, does the same kind of thing for palindromic substrings.

The post also borrows Kadane's "best ending here" idea from [Greedy](/blogs/dsa-greedy/), this time tracking both a max and a min. That idea and a table indexed by amount both live inside the 1-Dimension DP module. Next up are [2-D Dynamic Programming](/blogs/dsa-2d-dynamic-programming/) and [Bit Manipulation](/blogs/dsa-bit-manipulation/).

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## 1-Dimension DP

### Foundation

Imagine you ask a friend, "How many ways can I fill a strip of length 30?" They say, "That depends on how many ways you can fill 29 and 28." So you ask about 29, and they say it depends on 28 and 27.

Without notes, you end up asking about 28 many times over. With a notebook, you work out each length once, write it down, and just look it up after that. That notebook is dynamic programming (DP for short).

Every DP solution comes down to three decisions. You make all three before writing any code:

1. **State.** What does `dp[i]` mean? Say it in one sentence, with units. For example: "the number of ways to fill a strip of length i." If you can't say it in one sentence, you don't have a state yet.
2. **Recurrence.** A recurrence is a formula that builds `dp[i]` from smaller states. You almost always find it by asking "what is the last decision?" and then splitting on each value that decision could take.
3. **Base cases.** These are the smallest states, whose answers you know directly. Pick them so the recurrence never tries to read a state that doesn't exist.

DP works when the problem has two properties:

- **Overlapping subproblems.** The same smaller question comes up again and again.
- **Optimal substructure.** The answer to a big question really is a combination of answers to smaller ones. And the path you took to reach a smaller state doesn't change that state's answer.

### Mechanics

Here is the worked example for this module. We'll reuse it all the way through:

> A 1 × n strip is filled left to right with pieces of three kinds: a red square (length 1), a blue square (length 1), and a domino (length 2). How many different fillings are there? Worked example: n = 5.

**State.** `ways(i)` = the number of fillings of a strip of length i.

**Recurrence.** Take any filling of length i and look at its last piece. There are three options:

- It's red. Then the rest is any filling of length i − 1.
- It's blue. Again, the rest is any filling of length i − 1.
- It's a domino. Then the rest is any filling of length i − 2.

These three groups don't overlap, because each group has a different last piece. Together they cover every filling. So we can just add them up:

ways(i) = ways(i − 1) + ways(i − 1) + ways(i − 2) = 2 · ways(i − 1) + ways(i − 2)

**Base cases.** We need two, because the recurrence reaches back two steps.

- ways(0) = 1. An empty strip has exactly one filling: "place nothing". This isn't a trick. It's what makes the domino branch count correctly at i = 2. A strip of length 2 filled by a single domino is one filling, and that 1 has to come from ways(0).
- ways(1) = 2. A length-1 strip holds either a red square or a blue square.

With those two in place, every call for i ≥ 2 reads i − 1 ≥ 1 and i − 2 ≥ 0. Both of those always exist.

Now let's write the same idea in four forms. Each form is correct for the same reason: it computes exactly the recurrence above. Only the order of work changes.

1. **Plain recursion.** Translate the recurrence into code word for word. It's correct, but it solves the same lengths over and over. For n = 5 it makes 15 calls, and ways(1) alone gets computed 5 times. For n = 30 it makes 2,692,537 calls. Why so many? Let C(n) be the number of calls for n. Each call makes one call for n − 1 and one for n − 2 (the "×2" is a multiplication, not a second call). So C(n) = 1 + C(n − 1) + C(n − 2). That grows by about 1.618 times per extra unit of n, the same rate as Fibonacci numbers. In other words, it grows exponentially.
2. **Memoization (top-down).** Memoization means "keep a memo of answers you've already found". We use the same recursion, plus a cache keyed by i. The first call for a given i computes the answer and stores it. Every later call for that i just returns the stored value. There are only n + 1 distinct states (0..n inclusive), and each one does O(1) work apart from its recursive calls. So it's O(n) time and O(n) space.
3. **Tabulation (bottom-up).** Tabulation means filling in a table. We replace the recursion with a loop that fills `dp[0..n]` from small i to large i. That order is safe because `dp[i]` only reads `dp[i − 1]` and `dp[i − 2]`, and both are already filled by the time the loop reaches i. It's still O(n) time and O(n) space, but there's no recursion, so there's no recursion depth problem.
4. **O(1) space.** Look at which cells the recurrence actually reads. It only reads the previous two. Everything older will never be read again, so we don't need to keep it. Hold two variables and slide them forward. That's O(n) time and O(1) space.

For n = 5 the table comes out as:

| i | 0 | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- | --- |
| ways(i) | 1 | 2 | 5 | 12 | 29 | 70 |

Check a couple of cells by hand. ways(4) = 2 · ways(3) + ways(2) = 2 · 12 + 5 = 29. Then ways(5) = 2 · 29 + 12 = 70.

#### Two more state shapes the list needs

The strip uses the most common shape. There, `dp[i]` is the answer for a **prefix** of length i, meaning the first i cells. The problem list needs two more shapes.

**Shape 2: the amount is the index.** Let's generalise the strip. Now the tiles come as a list of lengths, and you want the number of ordered fillings of length exactly n. The state is the same: `dp[a]` = the number of fillings of length exactly a. What changes is the recurrence. It now loops over "which tile is last":

dp[a] = sum of dp[a − t] over every tile length t ≤ a

Try it on two inputs:

- With tiles [1, 1, 2] (red, blue, domino), this is exactly the strip again, and it gives 70 for a = 5.
- With tiles [3, 5] and a = 7, it gives 0, because you can't make 7 out of 3s and 5s. The full table is [1, 0, 0, 1, 0, 1, 1, 0] for a = 0..7.

The same table can hold other things instead of a count:

- A boolean: "can a be reached at all?" You combine the options with `or`.
- A minimum: "what's the fewest tiles that reach a?" You combine with `min` and add 1.

The skeleton stays the same. Only the combine operation and the starting value change. Coin Change, Word Break and Partition Equal Subset Sum all belong to this family, though each has its own twist on what the "amount" and the "items" are.

**Shape 3: best ending exactly here, tracking both a max and a min.** Some questions are about contiguous pieces of an array (pieces with no gaps, also called subarrays). For those, the natural state isn't "best in the first i elements". It's "best among pieces that **end exactly at** index i". Kadane's algorithm from the Greedy post uses this shape. The upgrade this list needs is carrying two of these states at the same time.

We need an array for this one, so here is a small example separate from the strip. Find the **maximum absolute subarray sum** of nums = [2, −5, 1, −4, 3, −2]. That means the largest |sum| over all non-empty contiguous subarrays. We keep two states:

- `hi[i]` = the largest sum of a subarray ending exactly at i. Any such subarray is one of two things. Either it's `[nums[i]]` alone, or it's a subarray ending at i − 1 with `nums[i]` added on the end. The best of the second kind is `hi[i − 1] + nums[i]`. So hi[i] = max(nums[i], hi[i − 1] + nums[i]).
- `lo[i]` = the smallest sum of a subarray ending exactly at i. It's the same split, but we take the minimum: lo[i] = min(nums[i], lo[i − 1] + nums[i]).
- The answer is the max of |hi[i]| and |lo[i]| over every i. That covers everything, because the best subarray has to end somewhere.

Why track the min at all? Because here the subarray with the largest absolute value is [−5, 1, −4], with sum −8. A max-only pass never sees it. Tracking only `hi` returns 3.

The general lesson: sometimes the quantity you're optimising can flip direction. Examples are an absolute value, a sign change, or multiplying by a negative. When that happens, the extreme on the other side can become the winner. So carry both extremes.

| i | nums[i] | hi | lo | best so far |
| --- | --- | --- | --- | --- |
| 0 | 2 | 2 | 2 | 2 |
| 1 | −5 | −3 | −5 | 5 |
| 2 | 1 | 1 | −4 | 5 |
| 3 | −4 | −3 | −8 | 8 |
| 4 | 3 | 3 | −5 | 8 |
| 5 | −2 | 1 | −7 | 8 |

Look at i = 3. There, lo = min(−4, −4 + (−4)) = −8. The smallest sum ending at index 2 was −4, from the subarray [−5, 1]. Adding −4 to it gives −8, which beats starting fresh with just −4.

### Diagram

<figure class="sketch">{% include sketches/dsa-1d-dynamic-programming/recursion-tree.svg %}</figure>

The tree has 15 calls. ways(3) appears twice, ways(2) three times, ways(1) five times and ways(0) three times. With memoization, only the leftmost spine does real work: ways(5), ways(4), ways(3), ways(2), ways(1), ways(0). Every other node becomes a lookup.

<figure class="sketch">{% include sketches/dsa-1d-dynamic-programming/table-read.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-1d-dynamic-programming/rolling.svg %}</figure>

### Implementation

```python
from functools import lru_cache


# Form 1: plain recursion. ways_naive(n) = number of fillings of a 1 x n strip
# with red squares (length 1), blue squares (length 1) and dominoes (length 2).
def ways_naive(n):
    if n == 0:
        return 1  # the empty strip has exactly one filling: place nothing
    if n == 1:
        return 2  # a length-1 strip holds one red square or one blue square
    # last piece is red (rest has length n-1), blue (n-1) or a domino (n-2);
    # the three groups differ in their last piece, so none is double-counted
    return 2 * ways_naive(n - 1) + ways_naive(n - 2)


# Form 2: memoization. Same recursion; each i in 0..n inclusive is computed once.
def ways_memo(n):
    @lru_cache(maxsize=None)  # (recalled: lru_cache caches results keyed by arguments)
    def go(i):
        if i == 0:
            return 1
        if i == 1:
            return 2
        return 2 * go(i - 1) + go(i - 2)

    return go(n)


# Form 3: tabulation. dp[i] = ways(i) for every i in 0..n inclusive.
def ways_table(n):
    if n == 0:
        return 1  # dp[1] below would be out of range for n = 0
    dp = [0] * (n + 1)  # indices 0..n inclusive, so n + 1 slots
    dp[0], dp[1] = 1, 2
    for i in range(2, n + 1):  # i runs 2..n inclusive
        # dp[i-1] and dp[i-2] were filled on earlier iterations (or are base cases)
        dp[i] = 2 * dp[i - 1] + dp[i - 2]
    return dp[n]


# Form 4: O(1) space. dp[i] only reads dp[i-1] and dp[i-2], so keep two numbers.
def ways(n):
    if n == 0:
        return 1
    prev2, prev1 = 1, 2  # ways(0), ways(1)
    for i in range(2, n + 1):
        # the right-hand side uses the OLD prev1 and prev2: at i = 2 it is
        # (2, 2*2 + 1) = (2, 5). (recalled: Python evaluates the whole
        # right-hand tuple before assigning either name)
        prev2, prev1 = prev1, 2 * prev1 + prev2
    return prev1  # after the loop, prev1 = ways(n); for n = 1 the loop never runs and prev1 = 2


print([ways_naive(n) for n in range(6)])      # [1, 2, 5, 12, 29, 70]
print(ways_memo(5), ways_table(5), ways(5))   # 70 70 70
print(ways(1), ways_table(1), ways(0))        # 2 2 1
```

Here is the amount-indexed shape. We run it on the same strip (tiles [1, 1, 2]) and on the case where the length can't be reached:

```python
def count_fills(n, tiles):
    # dp[a] = number of ordered tile sequences whose lengths sum to exactly a, a in 0..n
    dp = [0] * (n + 1)
    dp[0] = 1  # one way to fill length 0: the empty sequence
    for a in range(1, n + 1):
        for t in tiles:  # t = length of the LAST tile in the sequence
            if t <= a:  # a tile longer than a cannot be the last tile; skip it
                dp[a] += dp[a - t]
    return dp[n]


print(count_fills(5, [1, 1, 2]))  # 70, same as ways(5): red, blue, domino
print(count_fills(7, [3, 5]))     # 0, since 7 is not a sum of 3s and 5s
print(count_fills(6, [3, 5]))     # 1, only 3 + 3
```

And the "best ending here" shape with both extremes:

```python
def max_abs_subarray_sum(nums):
    # hi = largest sum of a subarray ending exactly at the current index i
    # lo = smallest sum of a subarray ending exactly at the current index i
    hi = lo = nums[0]  # at i = 0 the only subarray ending there is [nums[0]]
    best = abs(nums[0])
    for i in range(1, len(nums)):
        x = nums[i]
        # a subarray ending at i is [x] alone, or (one ending at i-1) + [x];
        # the largest of the second kind is hi + x, the smallest is lo + x
        hi = max(x, hi + x)
        lo = min(x, lo + x)
        best = max(best, abs(hi), abs(lo))
    return best


print(max_abs_subarray_sum([2, -5, 1, -4, 3, -2]))  # 8, from [-5, 1, -4]
print(max_abs_subarray_sum([-7]))                   # 7
print(max_abs_subarray_sum([3, -1, 4]))             # 6, from [3, -1, 4]
```

Here `hi` and `lo` don't read each other, so it's fine to update them one after the other. But some recurrences need the old `lo` to compute the new `hi`. A sign flip does exactly that. In that case, compute both from the old values in one tuple assignment.

Complexity for each version:

- **Plain recursion:** exponential time (15 calls at n = 5, 2,692,537 at n = 30), and O(n) stack depth.
- **Memoization:** O(n) time. O(n) space for the cache, plus O(n) recursion depth.
- **Tabulation:** O(n) time, O(n) space.
- **Two variables:** O(n) time, O(1) space.
- **`count_fills`:** O(n · k) time and O(n) space, where k is the number of tile types.
- **`max_abs_subarray_sum`:** O(m) time and O(1) space, for an array of length m.

### Recognition

These are the signals that a problem is 1-D DP:

- The question asks for a **count** ("how many ways"), an **optimum** ("minimum cost", "maximum amount"), or **feasibility** ("can you reach", "is it possible"). It doesn't ask for a list of every solution.
- There's a sequence of decisions, and the future only depends on a small summary of the past, like a position or a remaining amount. That summary is your state.
- You can sketch a backtracking tree and see the same subproblem show up on different branches.
- The constraints are around n ≤ 10^4 (or amount ≤ 10^4), with only a few choices per step. That fits O(n · choices).

Which state shape to pick:

| Shape | dp[i] means | Answer lives at |
| --- | --- | --- |
| Prefix / position | answer for the first i items (or from i to the end) | dp[n] (or dp[0]) |
| Amount | answer for an exact total a | dp[target] |
| Ending exactly here | best among things that end at index i | max (or min) over all i |

Here is where those signals show up in this topic's list:

- "Number of ways": Decode Ways.
- "Minimum": Min Cost Climbing Stairs and Coin Change.
- Feasibility over an amount: Partition Equal Subset Sum. Feasibility over a prefix: Word Break.
- "Ending here": Maximum Product Subarray and Longest Increasing Subsequence.
- A "can't take two neighbours" rule: House Robber and House Robber II.

When not to use it, and what it's easily confused with:

- **You need every solution, not a summary of them.** That's backtracking. The output itself is exponential in size, so no cache can help.
- **A local choice is provably safe.** Then greedy is simpler, and usually O(n) or O(n log n). DP is what you fall back to when you can build a counterexample to the greedy choice.
- **The future depends on the whole history**, such as which items have been used and in what arrangement. Then the state isn't one index, and 1-D DP doesn't fit. You need a second dimension or a bitmask.
- **A contiguous piece with a monotone condition.** Monotone means it only moves one way as the piece grows. If every element is non-negative and you want the longest window under a budget, a sliding window is enough. Negative numbers break the window's rule that "shrinking only helps", and that's when the "ending here" DP takes over.

### Pitfalls

- **Wrong base case.** In a counting problem, setting dp[0] = 0 quietly zeroes every count built on top of it. For the strip, dp[0] = 0 gives dp[2] = 2 · 2 + 0 = 4. That misses the single-domino filling.
- **Table size off by one.** States 0..n inclusive need `n + 1` slots. The answer is `dp[n]`, not `dp[n - 1]`.
- **Too few base cases for how far back the recurrence reads.** If dp[i] reads dp[i − 2], you need two base cases. Inputs smaller than both (n = 0 here) need an early return before you write `dp[1]`.
- **Wrong starting value in min/max tables.** For "fewest pieces", start every unreachable cell at infinity, not 0. Otherwise `min` will happily pick the fake 0. For counts, 0 is right. For feasibility, use `False`.
- **Recursion depth.** Memoised recursion on n = 5000 raises `RecursionError` under Python's default limit of 1000 (recalled, and confirmed by running it). Switch to tabulation rather than raising the limit.
- **Loop order changes what you count.** In the amount shape, if the amount loop is outside and the tile loop inside, you count **ordered** sequences. If the tile loop is outside, you count **unordered** combinations. Take tiles [1, 3] and length 4. Ordered gives 3 (1+1+1+1, 1+3, 3+1). Unordered gives 2 (four 1s, or one 1 and one 3).
- **Reuse versus use-once.** Say you have a 1-D boolean table over amounts and you scan it upward. Then an item can be reused within the same pass. With items [2, 3] and target 4, scanning upward marks 4 as reachable via 2 + 2. But if each item may be used at most once, 4 isn't reachable. The fix is to scan the amount downward for each item. Then each cell only reads values from before this item was considered.
- **Forgetting the "ending here" answer is a max over all i.** If you return `hi` at the last index, you've answered "best subarray ending at the end". That's a different question.

### Active Recall

Answer out loud or on paper first.

1. In the strip problem, why is ways(0) = 1 and not 0? What exactly breaks at i = 2 if you set it to 0?
2. The plain recursion makes 15 calls for n = 5. How many distinct states does the memoised version actually compute, and why does that make it O(n)?
3. In the O(1) version, someone writes `prev2 = prev1` on one line and `prev1 = 2 * prev1 + prev2` on the next. What does it return for n = 5, and why?
4. On [2, −5, 1, −4, 3, −2], a max-only "ending here" pass returns 3 for the maximum absolute subarray sum. Where does the true answer 8 come from, and what does `lo = −8` at index 3 represent?
5. With tiles [3, 5], `count_fills` gives 0 for length 7. If you rewrote the table to store "fewest tiles to reach a" instead of a count, what should the initial value of each cell be, and what would dp[7] hold?

{% capture coach %}
You are my coding-interview coach. I just studied 1-Dimension DP in Python: every DP solution is three decisions made before any code: the state (what dp[i] means, in one sentence), the recurrence (built by splitting on the last decision), and the base cases (true answers for the smallest states, so the recurrence never reads a missing state). The same recurrence can be written as plain recursion (exponential), memoization (O(n) time and space), tabulation (a loop filling dp[0..n] in order), or rolling variables (O(1) space when only the last few states are read). Two more state shapes: an amount-indexed table (dp[a] combines dp[a - t] over item sizes t with sum, min or or), and a "best ending exactly here" state that carries both a max and a min when the objective can flip sign.
Worked example from the lesson: a 1 x n strip is filled with red squares (length 1), blue squares (length 1) and dominoes (length 2). ways(i) = 2 * ways(i - 1) + ways(i - 2), ways(0) = 1, ways(1) = 2, giving 1, 2, 5, 12, 29, 70 for i = 0..5; the plain recursion makes 15 calls for n = 5. The O(1) version updates prev2, prev1 = prev1, 2 * prev1 + prev2. Amount shape: count_fills(n, tiles) with tiles [3, 5] gives the table [1, 0, 0, 1, 0, 1, 1, 0] for a = 0..7. Ending-here shape: maximum absolute subarray sum of [2, -5, 1, -4, 3, -2] with hi[i] = max(nums[i], hi[i-1] + nums[i]) and lo[i] = min(nums[i], lo[i-1] + nums[i]); lo reaches -8 at index 3 and the answer is 8.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. In the strip problem, why is ways(0) = 1 and not 0? What exactly breaks at i = 2 if you set it to 0?
2. The plain recursion makes 15 calls for n = 5. How many distinct states does the memoised version actually compute, and why does that make it O(n)?
3. In the O(1) version, someone writes prev2 = prev1 on one line and prev1 = 2 * prev1 + prev2 on the next. What does it return for n = 5, and why?
4. On [2, -5, 1, -4, 3, -2], a max-only "ending here" pass returns 3 for the maximum absolute subarray sum. Where does the true answer 8 come from, and what does lo = -8 at index 3 represent?
5. With tiles [3, 5], count_fills gives 0 for length 7. If you rewrote the table to store "fewest tiles to reach a" instead of a count, what should the initial value of each cell be, and what would dp[7] hold?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped for this topic. Several problems in the list, including Decode Ways and House Robber, make you choose a state and work out a recurrence from scratch. So you'll practise the core technique on your own when you solve them.

### Transfer test

You're building a text layout engine. Given the lengths of n words (in order) and a line width W, choose where to break lines so that the sum over lines (except the last) of (unused space on that line)² is as small as possible. Would you use 1-D DP? Why?

{% capture coach %}
You are my coding-interview coach. I just learned 1-D dynamic programming (name a one-index state, get the recurrence by splitting on the last decision, pin the base cases, then solve each subproblem once instead of re-exploring a backtracking tree). Scenario: You're building a text layout engine. Given the lengths of n words (in order) and a line width W, choose where to break lines so that the sum over lines (except the last) of (unused space on that line)^2 is as small as possible. Would you use 1-D DP? Why?
Ask me whether I would use 1-D dynamic programming here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Palindromes

### Foundation

A palindrome reads the same in both directions. Another way to say that: it's a mirror image of itself around its middle.

The slow way is to take each substring and ask "is this a palindrome?". There are roughly n²/2 substrings, and each check costs O(n), so that's O(n³) in total. The faster way is to stand at a middle and grow outward for as long as the two sides still mirror each other. Every palindrome has exactly one middle. So if you try every possible middle, you find every palindrome.

### Mechanics

Worked example: s = "abacca", n = 6.

**Centers.** A center is the middle point a palindrome is built around. An odd-length palindrome, like "aba", is centered on a character. An even-length one, like "acca", is centered on the gap between two characters. That gives n character centers plus n − 1 gap centers, so 2n − 1 centers in total. For "abacca" that's 11. Forgetting the gaps is the classic bug, because "acca" has no middle character to start from.

A single loop covers both kinds. For c in 0..2n − 2 inclusive, set l = c // 2 and r = l + (c % 2). When c is even, l = r, which is a character center. When c is odd, r = l + 1, which is a gap center.

**Expansion.** Start with the window s[l..r]. While l ≥ 0, r < n and s[l] == s[r], widen it: l −= 1, r += 1. When the loop stops, the widest palindrome at that center is s[l + 1 .. r − 1].

**Why is it safe to stop at the first mismatch?** Suppose s[l] ≠ s[r]. Every longer substring with the same center contains both l and r, at mirrored positions. A palindrome needs every mirrored pair to match. So none of those longer substrings can be a palindrome, and nothing is lost by stopping.

What about the shorter ones with this center? They were all confirmed on the way out. Each step checked one more mirrored pair around a core that was already a palindrome.

**Result for "abacca".** Here are all 11 centers:

| c | center | widest palindrome | bounds |
| --- | --- | --- | --- |
| 0 | s[0] | a | 0..0 |
| 1 | gap 0\|1 | (none) | empty |
| 2 | s[1] | aba | 0..2 |
| 3 | gap 1\|2 | (none) | empty |
| 4 | s[2] | a | 2..2 |
| 5 | gap 2\|3 | (none) | empty |
| 6 | s[3] | c | 3..3 |
| 7 | gap 3\|4 | acca | 2..5 |
| 8 | s[4] | c | 4..4 |
| 9 | gap 4\|5 | (none) | empty |
| 10 | s[5] | a | 5..5 |

Every palindromic substring of "abacca" is either some center's widest palindrome, or a shorter one nested inside it at the same center. For example, "cc" (3..4) sits inside "acca" at center 7.

**Why it's O(n²), and why that's tight.** There are 2n − 1 centers, and one expansion can take up to about n/2 steps. That's O(n²) in total.

"Tight" means some inputs really do cost that much. On "aaaa…a", every comparison succeeds until it hits the edge of the string. The total number of successful expansion steps is n(n + 1)/2. That's 10 for n = 4 and 5,050 for n = 100. On "abacca" it's only 9 successful steps. Extra space is O(1), since we only keep two indices.

**The DP view.** Define pal(i, j) = "s[i..j] is a palindrome". Then:

- pal(i, j) = (s[i] == s[j]) and pal(i + 1, j − 1)
- Base cases: pal(i, i) = true, and pal(i, i + 1) = (s[i] == s[i + 1]).

That's a 2-D DP with O(n²) states and O(n²) space. Expand-around-center uses the same recurrence, but walks it outward along one center at a time. The pal(i + 1, j − 1) it needs is exactly the window you just confirmed, so you never have to store it. Same O(n²) time, but O(1) space.

There's also Manacher's algorithm. It finds every center's widest palindrome in O(n) total, by reusing mirror information across centers. That's recalled, not derived here, and you don't need it for this list.

### Diagram

<figure class="sketch">{% include sketches/dsa-1d-dynamic-programming/center-gap.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-1d-dynamic-programming/center-char.svg %}</figure>

### Implementation

```python
def expand(s, l, r):
    # Grow the window s[l..r] outward while it stays in bounds and both ends match.
    while l >= 0 and r < len(s) and s[l] == s[r]:
        l -= 1
        r += 1
    # The loop stopped one step too far on each side (a mismatch or a boundary),
    # so the widest palindrome at this center is s[l+1 .. r-1] inclusive.
    # For a gap center with s[l] != s[r] at the start, this returns (r, l): an
    # empty range, e.g. gap 0|1 in "abacca" returns (1, 0).
    return l + 1, r - 1


def widest_per_center(s):
    bounds = []
    for c in range(2 * len(s) - 1):  # c in 0..2n-2 inclusive: n chars + (n-1) gaps
        l = c // 2  # even c: character center s[c//2]; odd c: gap after s[c//2]
        r = l + c % 2  # even c: r = l; odd c: r = l + 1
        bounds.append(expand(s, l, r))
    return bounds


print(widest_per_center("abacca"))
# [(0, 0), (1, 0), (0, 2), (2, 1), (2, 2), (3, 2), (3, 3), (2, 5), (4, 4), (5, 4), (5, 5)]
print([s for s in ("abacca"[lo:hi + 1] for lo, hi in widest_per_center("abacca")) if s])
# ['a', 'aba', 'a', 'c', 'acca', 'c', 'a']
print(widest_per_center(""), widest_per_center("z"))  # [] [(0, 0)]
```

Complexity: O(n²) time in the worst case (2n − 1 centers × up to about n/2 steps each). Each expansion uses O(1) extra space. `widest_per_center` also stores 2n − 1 pairs, which is O(n).

### Recognition

These are the signals that expand-around-center fits:

- The problem mentions palindromes, "reads the same backwards", or mirror symmetry of a **contiguous** piece of a string.
- n is up to a few thousand. So O(n²) is fine, and O(n³) isn't.
- You need information about many palindromic substrings at once: the longest, how many there are, all of them, or which ones touch an edge. Expand-around-center lists all of them in O(n²).

In the list, Longest Palindromic Substring and Palindromic Substrings show these signals directly.

When not to use it, and the neighbours to tell it apart from:

- **Checking one given string.** Use two pointers from both ends, in O(n). That's Part 3's [Two Pointers](/blogs/dsa-two-pointers/) territory, not center expansion.
- **Palindromic subsequences**, where characters may be skipped. The mirror argument breaks, because skipped characters mean there's no fixed center. That's an interval DP over (i, j), which is 2-D DP.
- **n around 10^5 or more, or many queries.** O(n²) is too slow. Manacher's algorithm or hashing is the tool (recalled).
- **"Can the letters be rearranged into a palindrome?"** That's a character-count question (at most one letter may have an odd count). You answer it with a hash map, not by looking at substrings.

### Pitfalls

- **Only odd centers.** This misses every even-length palindrome. "acca" becomes invisible.
- **Off-by-one on the way out.** The loop overshoots by one on both ends. So the palindrome is s[l + 1 .. r − 1], and its length is r − l − 1, not r − l + 1.
- **Empty gap centers.** A gap center whose two sides differ gives an empty range (lo > hi). Code that slices or measures it must treat that as length 0. It shouldn't crash, and it shouldn't count it.
- **Empty string.** `range(2 * 0 - 1)` is `range(-1)`, which is empty, so the loop is simply skipped. Make sure the caller handles "no palindromes" correctly.
- **Assuming O(n²) is a loose bound.** It isn't, because "aaaa…a" actually hits it. If n is 10^5, center expansion will time out.

### Active Recall

Answer out loud or on paper first.

1. How many centers does "abacca" have, and which palindrome would you miss if you only used character centers?
2. At center 7 on "abacca", expansion stops with l = 1, r = 6. Why is it safe to stop, and what do you report?
3. For s = "aaaa", how many successful expansion steps happen in total across all 7 centers? What does that tell you about the O(n²) bound?
4. How does expand-around-center relate to the 2-D table pal(i, j), and what does each cost in space?

{% capture coach %}
You are my coding-interview coach. I just studied Palindromes (expand around center) in Python: every palindrome is mirror-symmetric around exactly one middle, which is either a character (odd length) or the gap between two characters (even length), so a string of length n has 2n - 1 centers. For c in 0..2n-2, l = c // 2 and r = l + c % 2; while l >= 0, r < n and s[l] == s[r], widen (l -= 1, r += 1). The widest palindrome at that center is s[l+1 .. r-1]. Stopping at the first mismatch or boundary is safe because every longer window at the same center contains that mirrored pair. It is O(n^2) time and O(1) extra space, and it walks the 2-D recurrence pal(i, j) = (s[i] == s[j]) and pal(i+1, j-1) without storing the table.
Worked example from the lesson: s = "abacca", n = 6, 11 centers. The widest palindromes per center are a, (none), aba, (none), a, (none), c, acca, c, (none), a. Center 7 (gap between indices 3 and 4): c == c, then a == a (l = 2, r = 5), then r = 6 is out of bounds, so it reports s[2..5] = "acca". Center 2 (character s[1]) grows to s[0..2] = "aba" and stops at l = -1.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. How many centers does "abacca" have, and which palindrome would you miss if you only used character centers?
2. At center 7 on "abacca", expansion stops with l = 1, r = 6. Why is it safe to stop, and what do you report?
3. For s = "aaaa", how many successful expansion steps happen in total across all 7 centers? What does that tell you about the O(n^2) bound?
4. How does expand-around-center relate to the 2-D table pal(i, j), and what does each cost in space?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Included for this topic. The two list problems that use this technique hand you center expansion as a known pattern. You never have to discover it yourself. So this task gives you that practice here.

Given a string s, you may only add characters to its **front**. Return the shortest palindrome you can make this way. For s = "abacd" the answer is "dcabacd". Assume n ≤ 2000.

Before any code, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
Given a string s, you may only add characters to its front. Return the shortest palindrome you can make this way. For s = "abacd" the answer is "dcabacd". Assume n <= 2000.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

A string of length up to 10^5 is given once, followed by 10^5 queries "is s[l..r] a palindrome?". Would you use expand-around-center? Why?

{% capture coach %}
You are my coding-interview coach. I just learned expand-around-center for palindromes (every palindrome has one middle, a character or a gap, so grow outward from all 2n - 1 centers while the mirrored characters match; O(n^2) time, O(1) extra space). Scenario: A string of length up to 10^5 is given once, followed by 10^5 queries "is s[l..r] a palindrome?". Would you use expand-around-center? Why?
Ask me whether I would use expand-around-center here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

How do the two modules connect to 1-D DP?

The first module is the main engine. Choose a one-index state. Find the recurrence by splitting on the last decision. Fix the base cases. Then compress the code from recursion, to memo, to table, to a few variables.

Palindromes are the one place in this topic where the natural state really has two indices: pal(i, j). Expand-around-center is the trick that walks that recurrence without storing the table.

Palindromes show up in two roles:

- **Directly**, where the answer is a fact about palindromic substrings. The two palindrome problems in this list work this way.
- **As a building block** that another search or prefix DP asks: "is this last piece a palindrome?" That's how Palindrome Partitioning used it in the [Backtracking](/blogs/dsa-backtracking/) part.

That second role is also a bridge to [2-D Dynamic Programming](/blogs/dsa-2d-dynamic-programming/), where storing the table stops being optional.

How to tell competing approaches apart:

| If you see | Consider | Tell-apart question |
| --- | --- | --- |
| "list all" / "return every" | Backtracking | Is the output itself exponential? Then no DP. |
| count / min / max / feasible, with choices | 1-D DP | Does the future depend only on an index or an amount? |
| a local rule that looks obviously right | Greedy | Can I build a small counterexample? If yes, DP. |
| contiguous, all values non-negative, budget | Sliding window | Do negatives or sign flips exist? If yes, "ending here" DP. |
| contiguous, sign flips or absolute values | "Ending here" DP with max and min | Can the worst partial result become the best after one more step? |
| exact total built from pieces | Amount-indexed DP | Ordered or unordered? Reuse or use-once? (loop order, scan direction) |
| palindromic substrings, n ≤ a few thousand | Expand around center | Substring (contiguous) or subsequence? |
| palindromic subsequences | 2-D interval DP | Characters may be skipped, so no fixed center |

Recognition checklist for an unfamiliar problem:

1. What is being asked: all solutions, or a count / optimum / yes-no? Only the second one is DP.
2. Sketch the backtracking tree for a tiny input. Do subproblems repeat? Which quantity identifies a subproblem (position, amount, end index)?
3. Say the state in one sentence, with units: "dp[i] = ___ for ___".
4. Ask "what's the last decision?" Then write the recurrence as a combine (sum / min / max / or) over its options.
5. Base cases are the true answers for the smallest states. For counts, that's "one empty arrangement" at size 0. For min, it's 0 at the start and infinity everywhere else.
6. Order of evaluation: which direction means every cell you read is already filled? For use-once items over an amount, scan the amount downward.
7. Which old states does the recurrence read? If it only reads the last k, compress to k variables.
8. If the objective can flip sign, carry both a max and a min "ending here".
9. If palindromic substrings are involved, go through all 2n − 1 centers and expand. Check whether n allows O(n²).

## The problems

Work through these with the solving cycle from [Part 1](/blogs/dsa-the-method/). Give each problem a 15-minute honest struggle, write down the one key sentence, then review it with spaced repetition.

For DP, during the struggle, write these down before any code:

- What does the state represent?
- What's the recurrence?
- What are the base cases?

If you're still stuck after the struggle, take only the recurrence from a video walkthrough of the problem. Then write the code yourself as recurrence → memo → tabulation (→ O(1) space where the recurrence allows).

{% include dsa-problems.html slug="dsa-1d-dynamic-programming" %}

## Take this lesson as a live session

If you'd rather be taught this interactively, open the prompt this post was written from, already filled in for 1-D Dynamic Programming, and the chat will run the lesson with you one checkpoint at a time.

{% capture coach %}
[TOPIC]: 1-D Dynamic Programming
[PREREQUISITES]: 1-Dimension DP, Palindromes
[PROBLEM LIST]: Climbing Stairs, Min Cost Climbing Stairs, House Robber, House Robber II, Longest Palindromic Substring, Palindromic Substrings, Decode Ways, Coin Change, Maximum Product Subarray, Word Break, Longest Increasing Subsequence, Partition Equal Subset Sum
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
