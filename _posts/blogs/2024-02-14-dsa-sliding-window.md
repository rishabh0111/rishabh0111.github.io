---
layout: post
title: "Sliding window is two pointers that never walk backwards"
date: 2024-02-14 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 6
series_total: 19
links_new_tab: true
tags: [dsa, sliding-window, monotonic-deque, python, series]
read_time: 37
permalink: /blogs/dsa-sliding-window/
excerpt: "Every contiguous-subarray question has a brute force that re-adds the same elements over and over. Sliding window is the discipline of adding each element once, removing it once, and proving you never needed to look back."
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers sliding window: windows of a fixed size, windows whose size is set by a rule, and the monotonic deque that keeps a window's maximum or minimum when it can't be subtracted away.

Sliding window is what you reach for when a question is about a contiguous stretch of an array or string, and the brute force keeps recomputing the same overlapping ranges. It is a direct descendant of [Two Pointers](/blogs/dsa-two-pointers/): two indices, `l` and `r`, except both move in the same direction and neither ever moves back. The window's contents are summarised in some state (a sum, a count, a frequency map from [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/)) that you update as elements enter and leave. In the order this series follows it hangs off Two Pointers and is a leaf: nothing downstream depends on it, but it shows up everywhere in interviews.

The prerequisites here are **fixed-size windows** and **variable-size windows**. I've added one extra module at the end, the monotonic deque, because one problem on the list needs a window state that neither of the first two teaches.

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Sliding Window Fixed Size

### Foundation

Picture a train window of fixed width moving past a row of houses. Each time the train moves one house forward, one house appears on the right and one disappears on the left. You don't need to re-count every house in view; you add the new one and subtract the old one.

That's the whole idea. When a question asks about every contiguous block of exactly `k` elements, the brute force looks at each block from scratch, which costs O(n·k) for an array of length n. Consecutive blocks share `k - 1` elements, so if you keep a running summary of the block, moving one step costs O(1) and the whole scan costs O(n).

### Mechanics

Worked example for this module: `nums = [2, 1, 5, 1, 3, 2]`, `k = 3`, and the question "what is the largest sum of any 3 consecutive elements?"

1. Build the first window, indices 0 to k-1 inclusive: 2 + 1 + 5 = 8. Best so far is 8.
2. For each new right edge `r` from k to n-1 inclusive, the window moves from indices r-k..r-1 to r-k+1..r. Exactly one element enters (`nums[r]`) and exactly one leaves (`nums[r - k]`).
3. Update: `window_sum = window_sum + nums[r] - nums[r - k]`, then compare with the best.

The invariant: after processing right edge `r`, `window_sum` equals the sum of `nums[r-k+1 .. r]`. It holds initially (r = k-1, sum of indices 0..k-1) and each update preserves it, because adding `nums[r]` and subtracting `nums[r - k]` turns the sum of r-k..r-1 into the sum of r-k+1..r.

Why the leaving index is `r - k` and not `r - k + 1`: the old window's left edge was (r-1) - k + 1 = r - k. That's the element falling off. At r = 4 with k = 3, the old window was indices 1..3 (values 1, 5, 1), so `nums[1] = 1` leaves and `nums[4] = 3` enters: 7 + 3 - 1 = 9.

There are n - k + 1 windows in total. For the example that's 6 - 3 + 1 = 4 windows, and the running sums are 8, 7, 9, 6. The answer is 9.

Note what made this work: a sum is invertible. You can "un-add" a number by subtracting it. The same trick works for counts and for frequency maps (increment the entering character, decrement the leaving one). It does **not** work for max or min, because once the max leaves you can't recover the next-largest from a single number. Hold that thought until the third module.

### Diagram

<figure class="sketch">{% include sketches/dsa-sliding-window/fixed-window.svg %}<figcaption>The window of 3 (blue, braced) at each right edge r. Green is the element that just entered, red the one that just left; the sum updates by one add and one subtract.</figcaption></figure>

### Implementation

```python
def max_sum_window(nums: list[int], k: int) -> int | None:
    """Largest sum of any k consecutive elements, or None if no such window exists."""
    # n - k + 1 windows exist; that count is below 1 when k > len(nums),
    # e.g. nums = [1, 2], k = 3 gives 2 - 3 + 1 = 0 windows.
    if k <= 0 or k > len(nums):
        return None

    window_sum = sum(nums[:k])       # first window: indices 0..k-1 inclusive
    best = window_sum

    for r in range(k, len(nums)):    # new right edge r takes values k..len(nums)-1 inclusive
        # Old window was nums[r-k .. r-1]; new window is nums[r-k+1 .. r].
        # So nums[r] enters and nums[r-k] leaves.
        # Example: r = 4, k = 3 -> nums[4] = 3 enters, nums[1] = 1 leaves, 7 + 3 - 1 = 9.
        window_sum += nums[r] - nums[r - k]
        best = max(best, window_sum)

    return best
```

Running it: `max_sum_window([2, 1, 5, 1, 3, 2], 3)` returns 9, with the running sums 8, 7, 9, 6 exactly as in the diagram. Edge cases I ran: `[5]` with k = 1 gives 5; `[1, 2]` with k = 3 gives None; `[]` with k = 1 gives None; `[-3, -1, -2]` with k = 2 gives -3 (windows -4 and -3). I also checked it against a brute force on 2,000 random arrays.

Complexity: O(n) time where n = len(nums), since each index enters once and leaves at most once. O(1) extra space for a sum; O(σ) if the window state is a frequency map over an alphabet of size σ.

### Recognition

Signals:

- The question fixes the length of the block: "every substring of length k", "any k consecutive days", or a length set implicitly by something else, like the length of a second string you compare against.
- The property you need about a block can be updated when one element enters and one leaves: sums, counts, frequency maps, "number of elements satisfying X".
- The data is contiguous (subarray, substring), not a subsequence.

On this topic's list, Permutation In String and Sliding Window Maximum are both fixed-length windows; the difference is in what state they need, which is why the third module exists.

When not to use it: when the length isn't fixed and is part of what you're optimising (next module), when the block doesn't have to be contiguous (that's usually DP or hashing), or when the state isn't cheaply removable and you have no auxiliary structure for it.

Versus prefix sums (from [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/)): prefix sums also give any window sum in O(1) after an O(n) precompute, but they cost O(n) extra space and suit sums and counts rather than richer state like a frequency map. The fixed window gets the same answers in O(1) space and works with any invertible state.

### Pitfalls

- Subtracting `nums[r - k + 1]` instead of `nums[r - k]`. Check on the example: at r = 3 you must subtract `nums[0] = 2`, and 3 - 3 = 0.
- Forgetting to count the first window in `best`. If you initialise `best = 0` and only update inside the loop, `[-3, -1, -2]` with k = 2 returns 0 instead of -3.
- Not handling k > n. `sum(nums[:k])` silently sums the whole array when k is too big, so you'd return a "window" that doesn't exist.
- With a frequency map as state, a character whose count drops to 0 is still a key. If you compare maps or use `len(counts)` as "number of distinct characters", delete zero entries.

### Active Recall

Answer out loud or on paper first.

1. In the example, at r = 5 the sum went from 9 to 6. Which two values changed it, and at which indices?
2. For n = 6 and k = 3 the loop body runs how many times, and how many windows are examined in total?
3. Suppose the question were "largest **maximum** over any 3 consecutive elements" instead of largest sum. Why can't you update a running max the same way, using the example?
4. Would the algorithm still be correct if `nums` contained negative numbers? What about k = 1?

{% capture coach %}
You are my coding-interview coach. I just studied fixed-size sliding windows in Python: to examine every contiguous block of exactly k elements, build the first window (indices 0..k-1), then for each new right edge r from k to n-1 add nums[r] (entering) and subtract nums[r - k] (leaving, the old window's left edge). The invariant is that after right edge r the running state equals the summary of nums[r-k+1 .. r]. It needs an invertible state (sum, count, frequency map); max and min are not invertible. Time O(n), space O(1) for a sum.
Worked example from the lesson: nums = [2, 1, 5, 1, 3, 2], k = 3, largest sum of 3 consecutive elements. Running sums: r=2: 2+1+5 = 8; r=3: 8+1-2 = 7; r=4: 7+3-1 = 9; r=5: 9+2-5 = 6. There are n-k+1 = 4 windows and the answer is 9.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. In the example, at r = 5 the sum went from 9 to 6. Which two values changed it, and at which indices?
2. For n = 6 and k = 3 the loop body runs how many times, and how many windows are examined in total?
3. Suppose the question were "largest maximum over any 3 consecutive elements" instead of largest sum. Why can't you update a running max the same way, using the example?
4. Would the algorithm still be correct if nums contained negative numbers? What about k = 1?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: Permutation In String and Sliding Window Maximum use a fixed window as a clearly labelled building block rather than making you rediscover it, so this checkpoint is included.

A fence has n panels in a row, each painted black (`'B'`) or white (`'W'`), given as a string like `"WBBWWBBWBW"`. You want at least one run of k consecutive black panels. Repainting a white panel black costs 1; black panels are free. What's the minimum cost? For the string above with k = 7, the answer is 3.

Before opening the chat, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A fence has n panels in a row, each painted black ('B') or white ('W'), given as a string like "WBBWWBBWBW". You want at least one run of k consecutive black panels. Repainting a white panel black costs 1; black panels are free. What's the minimum cost? Example: for "WBBWWBBWBW" with k = 7, the answer is 3.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

You have 365 daily portfolio returns, some positive and some negative. Your manager wants the 7-day stretch with the highest total return. Would you use a fixed sliding window? Why?

{% capture coach %}
You are my coding-interview coach. I just learned fixed-size sliding windows (keep a running, invertible summary of exactly k consecutive elements; each step adds the entering element and subtracts the leaving one, so every window is visited once in O(n) total). Scenario: You have 365 daily portfolio returns, some positive and some negative. Your manager wants the 7-day stretch with the highest total return.
Ask me whether I would use a fixed sliding window here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Sliding Window Variable Size

### Foundation

Now the width isn't given. Instead you have a rule ("the sum must stay at most 7", "no character may repeat") and you want the longest, or shortest, stretch that follows it.

Think of an accordion. You keep pulling the right hand outwards to take in the next element. When the window breaks the rule, you squeeze from the left until it's valid again. Neither hand ever moves back towards where it came from. Because each hand travels at most n steps in total, the whole scan is O(n), even though there's a loop inside a loop.

The whole technique rests on one property of the rule, and it's worth naming before anything else: **monotonicity**. If a window is valid, every smaller window inside it is valid too (equivalently, if a window is invalid, every bigger window containing it is invalid). Without that property, throwing away the left element is not safe, and the technique gives wrong answers.

### Mechanics

Worked example for this module: `nums = [2, 3, 1, 2, 4, 3]`, all positive. Two questions on the same array:

- **Longest** subarray with sum at most 7. Answer: 3.
- **Shortest** subarray with sum at least 7. Answer: 2.

Longest flavour, step by step:

1. Move `r` from 0 to n-1 inclusive, adding `nums[r]` to `window_sum`.
2. **While** `window_sum > 7`, subtract `nums[l]` and move `l` right.
3. Now the window `l..r` is valid. Record `r - l + 1` if it beats the best.

The invariant after step 2: `l..r` is the longest valid window that ends at `r`.

Why moving `l` past an index is safe forever (this is the part to be able to say out loud): suppose `window_sum > 7` for `l..r`. All numbers are positive, so for any later right edge r' > r, the sum of `l..r'` is even bigger, also over 7. Index `l` can therefore never be the left end of a valid window again, for this `r` or any later one. Dropping it loses nothing. At r = 5 in the example, the window 2..5 has sum 1 + 2 + 4 + 3 = 10 and the window 3..5 has sum 2 + 4 + 3 = 9; both exceed 7, so both left edges 2 and 3 are discarded and `l` lands on 4.

Why it's O(n): `l` only increases and never passes `r + 1`, so across the entire run the inner `while` executes at most n times in total. Adding the n steps of `r`, that's at most 2n updates.

Shortest flavour, same loop with the inside flipped:

1. Add `nums[r]`.
2. **While** the window is valid (`window_sum >= 7`), record `r - l + 1`, then subtract `nums[l]` and move `l` right.

You record *inside* the loop because the loop's exit condition is "invalid". After the loop, the window is too small to count; the valid windows were the ones you saw on the way down. The safety argument mirrors the longest case: once `l..r` has sum at least 7, any window `l..r'` with r' > r is longer, so it can't beat the length you just recorded. Index `l` has already given its best answer and can go.

Shortest trace on the example: nothing is valid until r = 3, where 2 + 3 + 1 + 2 = 8 records length 4. At r = 4, the window 1..4 (3 + 1 + 2 + 4 = 10) records 4, then 2..4 (1 + 2 + 4 = 7) records 3. At r = 5, 3..5 (2 + 4 + 3 = 9) records 3, then 4..5 (4 + 3 = 7) records 2. Answer 2.

### Diagram

Longest subarray with sum at most 7. Each row is the state after the shrink loop.

<figure class="sketch">{% include sketches/dsa-sliding-window/variable-window.svg %}<figcaption>Longest window with sum at most 7, after the shrink loop at each r. Blue (braced) is the window, red is what the shrink loop dropped at that step, grey is outside the window.</figcaption></figure>

The right edge moves one step per row; the left edge only ever moves right, sometimes by more than one.

### Implementation

```python
def longest_at_most(nums: list[int], limit: int) -> int:
    """Length of the longest subarray with sum <= limit. Requires every nums[i] > 0."""
    l = 0
    window_sum = 0            # always the sum of nums[l .. r] inclusive
    best = 0
    for r, x in enumerate(nums):
        window_sum += x
        # While nums[l .. r] sums above limit, every nums[l .. r'] with r' >= r does too
        # (positive values only grow the sum), so index l is useless from now on.
        # Example: r = 5, l = 2: nums[2 .. 5] = 10 > 7 and nums[3 .. 5] = 9 > 7, so l -> 4.
        while window_sum > limit:
            window_sum -= nums[l]
            l += 1
        # Here nums[l .. r] is valid (sum <= limit), or empty (l = r + 1) if nums[r] alone > limit.
        best = max(best, r - l + 1)
    return best


def shortest_at_least(nums: list[int], target: int) -> int:
    """Length of the shortest subarray with sum >= target, or 0 if none. Requires every nums[i] > 0."""
    l = 0
    window_sum = 0
    best = float("inf")
    for r, x in enumerate(nums):
        window_sum += x
        # While nums[l .. r] reaches target, record it; any nums[l .. r'] with r' > r is longer,
        # so index l can't give a shorter answer later and is dropped.
        # Example: r = 4: nums[1 .. 4] = 10 records 4, nums[2 .. 4] = 7 records 3, nums[3 .. 4] = 6 stops.
        while window_sum >= target:
            best = min(best, r - l + 1)
            window_sum -= nums[l]
            l += 1
        # Here nums[l .. r] sums below target, so there is nothing to record.
    return 0 if best == float("inf") else best
```

Running them on `[2, 3, 1, 2, 4, 3]` with 7: `longest_at_most` returns 3 and `shortest_at_least` returns 2, matching the traces above step for step. Edge cases I ran: `[]` gives 0 and 0; `[8]` with 7 gives 0 (the only element already exceeds the limit, so the window is empty, `r - l + 1 = 0 - 1 + 1 = 0`) and 1; `[1, 1, 1]` with 10 gives 3 and 0. Both were checked against brute force on 3,000 random positive arrays.

Complexity: O(n) time where n = len(nums), because `l` and `r` each advance at most n times. O(1) extra space for a sum; O(σ) for a frequency map over an alphabet of size σ.

The only thing that changes across problems is the window state and the validity check. Replace "sum" with "a frequency map" and "sum > limit" with "some character appears twice" or "the map is missing something from a target", and the skeleton is identical.

### Recognition

Signals:

- "Longest", "shortest", "minimum length", "maximum length" of a contiguous subarray or substring.
- A validity rule you can check from a running state: at most k distinct, no repeats, sum at most / at least X, "at most k elements need changing".
- The rule is monotone: shrinking a valid window keeps it valid (for "longest"), or growing a valid window keeps it valid (for "shortest").
- Non-negative numbers, when the state is a sum.

On this topic's list, Longest Substring Without Repeating Characters and Longest Repeating Character Replacement are "longest valid window" questions; Minimum Window Substring is a "shortest valid window" question. Best Time to Buy And Sell Stock is the disguised one: nothing in its statement says "subarray", which is exactly why it's worth solving without being told it belongs here.

When not to use it: the rule isn't monotone. The classic case is sums over arrays with negative numbers, where growing a window can lower its sum. That's prefix sums plus a hash map territory.

Versus two pointers from [Part 3](/blogs/dsa-two-pointers/): opposite-ends two pointers usually need sorted data and look at pairs; sliding window pointers both start on the left, move the same way, and look at everything between them.

### Pitfalls

- `if` instead of `while` for shrinking. At r = 5 in the example the window needs two drops (1, then 2). With `if`, you'd record the invalid window 3..5 with sum 9.
- Recording in the wrong place. Longest: after the shrink loop. Shortest: inside it. Swap them and you record invalid windows.
- Negative numbers. `longest_at_most([1, -3], 0)` returns 1, but the true answer is 2 (`1 + (-3) = -2 <= 0`). At r = 0 the sum 1 exceeded 0, so index 0 was dropped for good, but a later negative would have rescued it. Likewise `shortest_at_least([-2, 1], 1)` returns 0 even though `[1]` works. Both ran exactly as described.
- Forgetting the "no valid window" case in the shortest flavour. `float("inf")` must become 0 (or whatever the problem says).
- Off by one in length: the window `l..r` inclusive has `r - l + 1` elements.

### Active Recall

Answer out loud or on paper first.

1. At r = 5 in the longest trace, `l` jumped from 2 to 4. Give the two sums that justify dropping indices 2 and 3, and explain why neither can be useful for any future `r`.
2. The code has a `while` nested inside a `for`. Why isn't it O(n²)?
3. In the shortest trace at r = 4, two windows were recorded (lengths 4 and 3). Why is recording inside the loop necessary, and what's in the window after the loop exits?
4. `longest_at_most([1, -3], 0)` returns 1 but the answer is 2. Which step of the algorithm made the fatal decision?

{% capture coach %}
You are my coding-interview coach. I just studied variable-size sliding windows in Python: the right edge r moves one step at a time, adding nums[r] to a running state, and the left edge l moves right only, shrinking the window with a while loop. For "longest valid window" you shrink while the window is invalid and record r - l + 1 after the loop; for "shortest valid window" you shrink while it is valid and record inside the loop. It relies on monotonicity (with positive numbers, a window that is over the limit stays over it when extended), which makes dropping index l safe forever; each pointer moves at most n times, so it is O(n).
Worked example from the lesson: nums = [2, 3, 1, 2, 4, 3]. Longest subarray with sum at most 7 (answer 3), states after the shrink loop: r=0 l=0 sum 2, best 1; r=1 l=0 sum 5, best 2; r=2 l=0 sum 6, best 3; r=3: 8 > 7, drop 2, l=1, sum 6; r=4: 10 > 7, drop 3, l=2, sum 7; r=5: 10 > 7, drop 1 then 2, l=4, sum 7; best stays 3. Shortest subarray with sum at least 7 (answer 2): r=3 records 4 (sum 8); r=4 records 4 (window 1..4, sum 10) then 3 (window 2..4, sum 7), then window 3..4 sums to 6 and the loop stops; r=5 records 3 (window 3..5, sum 9) then 2 (window 4..5, sum 7). The code is longest_at_most(nums, limit) and shortest_at_least(nums, target) exactly as described.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At r = 5 in the longest trace, l jumped from 2 to 4. Give the two sums that justify dropping indices 2 and 3, and explain why neither can be useful for any future r.
2. The code has a while nested inside a for. Why isn't it O(n^2)?
3. In the shortest trace at r = 4, two windows were recorded (lengths 4 and 3). Why is recording inside the loop necessary, and what's in the window after the loop exits?
4. longest_at_most([1, -3], 0) returns 1 but the answer is 2. Which step of the algorithm made the fatal decision?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: Best Time to Buy And Sell Stock asks you to discover a variable window where the problem never mentions one, so deriving that from scratch is its own exercise and this checkpoint is skipped.

### Transfer test

You have an integer array that can contain negatives, and you need the number of subarrays whose sum is exactly k. Would you use a variable sliding window? Why?

{% capture coach %}
You are my coding-interview coach. I just learned variable-size sliding windows (grow the right edge one step at a time, shrink the left edge with a while loop until the window is valid again, and never move either edge back; it is only correct when the validity rule is monotone, so that an index dropped from the left can never be useful again). Scenario: You have an integer array that can contain negatives, and you need the number of subarrays whose sum is exactly k.
Ask me whether I would use a variable sliding window here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Monotonic Deque

Sliding Window Maximum needs the max of the current window as it slides, and max can't be un-added (see question 3 of the first module). Neither of the first two modules covers the structure that fixes this, so it gets its own module.

### Foundation

Think of a queue of candidates for "tallest person in the room", where people enter from the back and leave, oldest first, from the front. When a tall person walks in, everyone already queued who is shorter or equal *and entered earlier* can never be the tallest again: the newcomer is at least as tall and will stay in the room longer. So you send them away immediately.

What's left is a queue whose heights strictly decrease from front to back. The front is always the tallest person still in the room. When the front person's time is up, you pop them and the next one is the new tallest.

That's a monotonic deque: a `collections.deque` of indices, kept in decreasing (for max) or increasing (for min) order of value, that answers "max/min of the current window" in O(1) and costs amortised O(1) per element.

### Mechanics

Worked example for this module: `nums = [10, 1, 2, 4, 7, 2]`, `limit = 5`. Question: the longest subarray where max - min is at most 5. Answer: 4, the window `[2, 4, 7, 2]` at indices 2..5.

It's a variable window (module 2) whose validity check needs both the max and the min of the window, so it uses two deques.

For each new index `r` with value `x`:

1. **Max deque:** pop from the back while the back's value is `<= x`, then append `r`. The popped indices are dominated: each is earlier than `r` and no larger than `x`.
2. **Min deque:** pop from the back while the back's value is `>= x`, then append `r`. Mirror image.
3. **Shrink:** while `nums[max_dq[0]] - nums[min_dq[0]] > limit`, advance `l` by one, and if a deque's front index is now below `l`, pop it from the front (it has left the window).
4. Record `r - l + 1`.

Why popping from the back is safe: say index j is popped from the max deque because index i > j arrived with `nums[i] >= nums[j]`. From now on `r >= i`, so any window that still contains j (it has `l <= j`) also contains i. Within every such window, i's value is at least j's, so j is never needed to report the max. The same argument for the min deque uses `nums[i] <= nums[j]`: at r = 5, index 2 (value 2) is popped from the min deque by index 5 (value 2), and every future window containing index 2 also contains index 5 with the same value.

Why the front is the window's max: the values in the max deque strictly decrease from front to back (step 1 enforces this). Every index in `l..r` that isn't in the deque was popped by a later index with a value at least as big, and that later index is still in the window. So the window's max is in the deque, and in a decreasing deque it's at the front.

Why the front expiry check is enough: indices in the deque are increasing, so if the front is at least `l`, all of them are. Since `l` moves one step at a time and we check the front at each step, no stale index can hide behind the front.

The three steps worth following on the example (the diagram has every row):

- r = 1, x = 1: 1 is smaller than 10, so the max deque keeps index 0 and becomes `[0, 1]`. The min deque pops index 0 (10 >= 1) and becomes `[1]`. max - min = 10 - 1 = 9 > 5, so `l` becomes 1; index 0 is now below `l`, so it's popped from the max deque's front. Both deques are `[1]`, window `[1]`, best stays 1.
- r = 4, x = 7: the max deque pops index 3 (4 <= 7) and becomes `[4]`. The min deque becomes `[1, 2, 3, 4]`. 7 - 1 = 6 > 5, so `l` becomes 2 and index 1 leaves the min deque's front. Now 7 - 2 = 5, valid. Window `[2, 4, 7]`, best stays 3.
- r = 5, x = 2: the max deque keeps index 4 (7 > 2) and becomes `[4, 5]`. The min deque pops indices 4, 3 and 2 (values 7, 4, 2 are all >= 2) and becomes `[5]`. 7 - 2 = 5, valid with no shrinking. Window `[2, 4, 7, 2]`, best becomes 4.

### Diagram

State after each step. Deques show `index:value`, front on the left.

<figure class="sketch">{% include sketches/dsa-sliding-window/monotonic-deques.svg %}<figcaption>State after each step. Blue (braced) is the window l..r. The max deque's front (amber) and the min deque's front (violet) are the window's max and min; values fall along the max deque and rise along the min deque.</figcaption></figure>

Read down the max deques: values always strictly decrease left to right. Read down the min deques: values always strictly increase. The fronts are the window's max and min at every row.

### Implementation

```python
from collections import deque


def longest_within_limit(nums: list[int], limit: int) -> int:
    """Longest subarray whose max - min <= limit. Assumes limit >= 0."""
    max_dq = deque()   # indices; nums values strictly decreasing front -> back
    min_dq = deque()   # indices; nums values strictly increasing front -> back
    l = 0
    best = 0
    for r, x in enumerate(nums):
        # An index j at the back with nums[j] <= x is dominated by r: every window
        # containing j from now on (l <= j, right edge >= r) also contains r, and nums[r] >= nums[j].
        # Example: r = 3, x = 4 pops index 2 (value 2) from max_dq.
        while max_dq and nums[max_dq[-1]] <= x:
            max_dq.pop()
        max_dq.append(r)

        # Mirror: an index j with nums[j] >= x can never be the window's minimum again.
        # Example: r = 5, x = 2 pops indices 4, 3, 2 (values 7, 4, 2) from min_dq.
        while min_dq and nums[min_dq[-1]] >= x:
            min_dq.pop()
        min_dq.append(r)

        # Fronts are the max and min of nums[l .. r]. Shrink while the window is invalid.
        # Example: r = 4: 7 - 1 = 6 > 5 -> l = 2, index 1 (value 1) leaves min_dq; 7 - 2 = 5 stops.
        while nums[max_dq[0]] - nums[min_dq[0]] > limit:
            l += 1
            # Indices in each deque increase front -> back, so only the front can be below l.
            if max_dq[0] < l:
                max_dq.popleft()   # (recalled: deque.popleft and deque.pop are O(1))
            if min_dq[0] < l:
                min_dq.popleft()

        best = max(best, r - l + 1)
    return best
```

The shrink loop never empties a deque. Index `r` was just appended to both, and the loop stops by the time `l` reaches `r` at the latest, because the one-element window `nums[r .. r]` has max - min = 0, which is at most `limit` whenever `limit >= 0`. Since `l <= r`, index `r` is never popped from the front, so `max_dq[0]` and `min_dq[0]` are always safe to read.

Running it: `longest_within_limit([10, 1, 2, 4, 7, 2], 5)` returns 4, and the per-step deques match the diagram above (I printed them from the actual run). Edge cases I ran: `[5]` with 0 gives 1; `[3, 3, 3]` with 0 gives 3 (ties are handled, since the equal element is popped and replaced by the newer index); `[1, 5, 1, 5]` with 3 gives 1. It also matched a brute force on 3,000 random arrays.

Complexity: O(n) time where n = len(nums). Each index is appended to each deque once and popped from each deque at most once, and `l` moves at most n times. O(n) extra space in the worst case: a strictly decreasing input like `[5, 4, 3, 2, 1]` keeps every index in `max_dq`.

### Recognition

Signals:

- A window (fixed or variable) where the state you need is the **max or min**, which can't be undone by subtraction.
- Brute force would be "for every window, scan for the max": O(n·k).
- Elements expire from the old end in arrival order. That's what makes it a queue, not a stack.

On this topic's list, Sliding Window Maximum is where this applies.

Versus a monotonic stack from [Part 4](/blogs/dsa-stack/): same "pop the dominated ones from the back" rule, but a stack has no expiry at the front. If nothing ever leaves the old end, you only need a stack.

Versus a heap from [Part 10](/blogs/dsa-heaps/): a max-heap can also track the window's max, with lazy deletion of expired entries, at O(n log n) (recalled: heap push and pop are O(log n)). The deque is O(n) and simpler once you trust the invariant.

### Pitfalls

- Storing values instead of indices. You then can't tell whether the front has expired. People patch it with "pop the front if it equals `nums[l]`", which only works if you keep duplicates (pop only strictly smaller). With `<=` popping and values stored, `[0, 0, 1, 0]` with limit 0 ends up popping the wrong copy and then crashes with `IndexError` on an empty deque; I ran it to be sure.
- Using `if` instead of `while` when popping from the back. The deque stops being monotonic, and the front is no longer the max.
- Using a Python `list` with `pop(0)` for the front. That's O(n) per call (recalled: lists shift every element left), which quietly makes the whole thing O(n²).
- Checking expiry against the wrong boundary. The window is `l..r` inclusive, so the front expires when its index is `< l`, not `<= l`.

### Active Recall

Answer out loud or on paper first.

1. At r = 5, the min deque popped index 2, whose value (2) equals the incoming value. Why is it safe to discard an equal value, not just a strictly larger one?
2. At r = 1 the max deque was briefly `[0, 1]` (values 10, 1). Why was index 1 kept behind 10 rather than thrown away?
3. The code has two `while` loops inside the `for`. Justify O(n) total time with an explicit count.
4. At r = 4, one step of `l` was enough to fix the window. What exactly changed between max - min = 6 and max - min = 5?

{% capture coach %}
You are my coding-interview coach. I just studied the monotonic deque in Python: a collections.deque of indices whose values are kept strictly decreasing front to back (for the window max) or strictly increasing (for the window min). When index r with value x arrives, pop from the back every index whose value is <= x (max deque) or >= x (min deque), because each is older and can never be the answer while r is in the window; then append r. When the left edge l passes the front index, pop the front. The front is always the window's max or min, and each index is pushed and popped at most once, so it is amortised O(1) per element.
Worked example from the lesson: nums = [10, 1, 2, 4, 7, 2], limit = 5, longest subarray with max - min <= 5, using a variable window with two deques (answer 4, window [2, 4, 7, 2] at indices 2..5). States after each step (index:value, front first): r=0: max [0:10], min [0:10], l=0, best 1. r=1: max briefly [0:10, 1:1], min [1:1]; 10 - 1 = 9 > 5 so l=1 and index 0 leaves the max deque's front; max [1:1], min [1:1], best 1. r=2: max [2:2], min [1:1, 2:2], l=1, diff 1, best 2. r=3: max [3:4], min [1:1, 2:2, 3:4], l=1, diff 3, best 3. r=4: max [4:7], min [1:1, 2:2, 3:4, 4:7]; 7 - 1 = 6 > 5 so l=2 and index 1 leaves the min deque; min [2:2, 3:4, 4:7], diff 5, best 3. r=5: max [4:7, 5:2]; min pops indices 4, 3, 2 and becomes [5:2]; diff 7 - 2 = 5, l=2, best 4.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At r = 5, the min deque popped index 2, whose value (2) equals the incoming value. Why is it safe to discard an equal value, not just a strictly larger one?
2. At r = 1 the max deque was briefly [0, 1] (values 10, 1). Why was index 1 kept behind 10 rather than thrown away?
3. The code has two while loops (popping from the back) plus a shrink loop inside the for. Justify O(n) total time with an explicit count.
4. At r = 4, one step of l was enough to fix the window. What exactly changed between max - min = 6 and max - min = 5?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: Sliding Window Maximum is where you'll have to fit this deque to a window yourself, and that fitting is the whole exercise, so this checkpoint is skipped.

### Transfer test

For each day in a price history, you need the number of consecutive days ending today (including today) on which the price was at most today's price. Would you use a monotonic deque? Why?

{% capture coach %}
You are my coding-interview coach. I just learned the monotonic deque (a deque of indices kept in decreasing or increasing value order: dominated older elements are popped from the back as new ones arrive, and expired elements are popped from the front as a window's left edge moves, so the front is always the window's max or min). Scenario: For each day in a price history, you need the number of consecutive days ending today (including today) on which the price was at most today's price.
Ask me whether I would use a monotonic deque here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

### How the three connect to sliding window

Every sliding window question is two indices `l <= r` that only move right, plus a **window state** that summarises `nums[l .. r]` and is updated when an element enters or leaves. The modules differ only in two decisions:

| Decision | Fixed size | Variable size | Monotonic deque |
| --- | --- | --- | --- |
| Who moves `l`? | Tied to `r`: `l = r - k + 1` | The validity rule: shrink while invalid (longest) or while valid (shortest) | Either of the two |
| What's the state? | Anything invertible: sum, count, frequency map | Anything invertible, plus a validity check | Max or min, which isn't invertible, so a deque of candidates |

So your first two questions on any window problem are "is the length given or chosen?" and "can I undo an element's contribution to the state?"

<figure class="sketch">{% include sketches/dsa-sliding-window/which-window.svg %}<figcaption>Picking the approach. Plain boxes are the questions to ask; blue is a sliding window, violet is a different tool, green is the window state to keep.</figcaption></figure>

### Distinguishing competing approaches

| Situation | Use | Why not a sliding window |
| --- | --- | --- |
| Sorted array, find a pair with a property | Two pointers from opposite ends ([Part 3](/blogs/dsa-two-pointers/)) | You care about two elements, not everything between them |
| Sum of subarrays with negatives, or count of subarrays with exact sum | Prefix sums + hash map ([Part 2](/blogs/dsa-arrays-and-hashing/)) | The rule isn't monotone, so dropping `l` isn't safe |
| "Is there a valid window of length L?" is easy but shrinking isn't | Binary search on L ([Part 5](/blogs/dsa-binary-search/)) | Works when validity is monotone in length; costs O(n log n), so a direct window is usually better when one exists |
| Next greater/smaller element, no expiry | Monotonic stack ([Part 4](/blogs/dsa-stack/)) | Nothing leaves from the old end |
| Non-contiguous selection | DP, sorting, or hashing | A window only ever represents a contiguous range |

### Recognition checklist for an unfamiliar problem

1. Is the answer about a **contiguous** range? If not, stop thinking about windows.
2. Is the length **given** (fixed) or **optimised** (variable)?
3. If variable: write the validity rule in one sentence. Does shrinking a valid window keep it valid (or growing a valid one keep it valid, for "shortest")? If you can't say yes, check for negatives and consider prefix sums.
4. What's the **state**, and can you add and remove one element in O(1)? Sum and counts: yes. Frequency map: yes, delete zero keys. Max or min: use a monotonic deque of indices.
5. Where do you **record** the answer? Longest: after shrinking. Shortest: inside the shrink loop. Fixed: after each slide.
6. Say the complexity by counting pointer moves: `r` moves n times, `l` moves at most n times, deque indices are pushed and popped at most once each.

## The problems

Work them with the solving cycle from [Part 1](/blogs/dsa-the-method/) (a 15-minute struggle, one key sentence per problem, spaced repetition). During the struggle for this category, ask: can a hash map or set give O(1) lookups of what's in the window? Would prefix sums help instead? Can I restate the question as "longest/shortest window where some condition holds"? The insight is usually the right window state, or seeing that the problem is a window at all.

{% include dsa-problems.html slug="dsa-sliding-window" %}

## Take this lesson as a live session

If you'd rather be taught this interactively, with the coach waiting for your answers, open the full lesson prompt in a chat.

{% capture coach %}
[TOPIC]: Sliding Window
[PREREQUISITES]: Sliding Window Fixed Size, Sliding Window Variable Size
[PROBLEM LIST]: Best Time to Buy And Sell Stock, Longest Substring Without Repeating Characters, Longest Repeating Character Replacement, Permutation In String, Minimum Window Substring, Sliding Window Maximum
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
