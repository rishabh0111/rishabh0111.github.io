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
read_time: 40
permalink: /blogs/dsa-sliding-window/
excerpt: "The brute force for any contiguous-subarray question adds the same elements again and again. Sliding window adds each element once, removes it once, and gives you a reason why you never need to look back."
---

Some questions ask about a contiguous stretch of an array or string, meaning a run of neighbouring elements with no gaps. The brute force for these keeps recomputing ranges that overlap. Sliding window is the fix you reach for.

It is [Two Pointers](/blogs/dsa-two-pointers/) with a twist: both indices move in the same direction, and neither ever moves back. Whatever is between them is the **window**. You keep a short summary of the window, called its **state**. That might be a sum, a count, or a frequency map from [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/). You update the state as elements enter and leave.

On the topic map, sliding window is a leaf: nothing later builds on it. Even so, it shows up everywhere in interviews.

The post covers fixed-size windows and variable-size windows. I've also added one extra module at the end, the monotonic deque. One problem on the list needs the maximum or minimum of the window, and you can't subtract those away the way you can a sum.

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## Sliding Window Fixed Size

### Foundation

Picture a train window of fixed width, moving past a row of houses. Each time the train moves forward by one house, a new house appears on the right and an old one disappears on the left. To know what's in view, you don't re-count every house. You add the new one and subtract the old one.

That's the idea of this module. Say a question asks about every contiguous block of exactly `k` elements. The brute force looks at each block from scratch. That costs O(n·k) for an array of length n, because there are about n blocks and each takes k steps to add up.

But two blocks next to each other share `k - 1` elements. So keep a running summary of the current block instead. Moving one step then costs O(1), and the whole scan costs O(n).

### Mechanics

Here is the worked example for this module: `nums = [2, 1, 5, 1, 3, 2]` and `k = 3`. The question is "what is the largest sum of any 3 consecutive elements?"

1. Build the first window, indices 0 to k-1 inclusive: 2 + 1 + 5 = 8. The best so far is 8.
2. Now move the right edge. For each new right edge `r` from k to n-1 inclusive, the window shifts from indices r-k..r-1 to r-k+1..r. Exactly one element enters (`nums[r]`) and exactly one leaves (`nums[r - k]`).
3. Update the sum with `window_sum = window_sum + nums[r] - nums[r - k]`, then compare it with the best.

The loop keeps one fact true the whole time. A fact like that, which holds at every step of a loop, is called an **invariant**. Here it is: after handling right edge `r`, `window_sum` equals the sum of `nums[r-k+1 .. r]`.

Why does it stay true? At the start, r = k-1 and the sum covers indices 0..k-1, which is exactly the first window. After that, each update adds `nums[r]` and subtracts `nums[r - k]`. That turns the sum of r-k..r-1 into the sum of r-k+1..r, so the fact still holds.

Why is the leaving index `r - k` and not `r - k + 1`? The old window ended at r-1, so its left edge was (r-1) - k + 1 = r - k. That's the element falling off. Check it on the example at r = 4 with k = 3. The old window was indices 1..3 (values 1, 5, 1). So `nums[1] = 1` leaves and `nums[4] = 3` enters, and the sum goes 7 + 3 - 1 = 9.

There are n - k + 1 windows in total. For the example that's 6 - 3 + 1 = 4 windows. Their running sums are 8, 7, 9, 6, so the answer is 9.

What made this work is that a sum is **invertible**: you can "un-add" a number by subtracting it. The same trick works for counts. It also works for frequency maps: add one for the entering character, take one away for the leaving one.

It does **not** work for max or min. Say the max of the window leaves. A single stored number can't tell you what the next-largest value was. Hold that thought until the third module.

### Diagram

<figure class="sketch">{% include sketches/dsa-sliding-window/fixed-window.svg %}</figure>

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

Running it: `max_sum_window([2, 1, 5, 1, 3, 2], 3)` returns 9, with the running sums 8, 7, 9, 6, exactly as in the diagram. Edge cases I ran:

- `[5]` with k = 1 gives 5.
- `[1, 2]` with k = 3 gives None.
- `[]` with k = 1 gives None.
- `[-3, -1, -2]` with k = 2 gives -3 (the two windows sum to -4 and -3).

I also checked it against a brute force on 2,000 random arrays.

Complexity, with n = len(nums):

- **O(n) time.** Each index enters the window once and leaves at most once.
- **O(1) extra space** when the state is a sum. If the state is a frequency map over an alphabet of size σ (σ is just the number of possible characters), it's O(σ).

### Recognition

These are the signals that a fixed window fits:

- **The question fixes the length of the block.** For example "every substring of length k" or "any k consecutive days". Sometimes the length is set by something else, like the length of a second string you compare against.
- **The property you need can be updated when one element enters and one leaves.** Sums, counts, frequency maps and "number of elements satisfying X" all work.
- **The data is contiguous** (a subarray or substring), not a subsequence. A subsequence can skip elements; a window can't.

On this topic's list, Permutation In String and Sliding Window Maximum both use fixed-length windows. What differs is the state each one needs to keep, and that's why the third module exists.

When not to use it:

- **The length isn't fixed** and is part of what you're optimising. That's the next module.
- **The block doesn't have to be contiguous.** That's usually DP or hashing.
- **The state can't be cheaply removed**, and you have no helper structure to do it for you.

How it compares with prefix sums (from [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/)): prefix sums can also give you any window sum in O(1), after an O(n) setup pass. But they cost O(n) extra space. They also suit sums and counts better than richer state like a frequency map. The fixed window gets the same answers in O(1) space, and it works with any invertible state.

### Pitfalls

- **Subtracting `nums[r - k + 1]` instead of `nums[r - k]`.** Check it on the example. At r = 3 you must subtract `nums[0] = 2`, and 3 - 3 = 0, so `r - k` is the right index.
- **Forgetting to count the first window in `best`.** Say you set `best = 0` and only update it inside the loop. Then `[-3, -1, -2]` with k = 2 returns 0 instead of -3.
- **Not handling k > n.** When k is too big, `sum(nums[:k])` quietly sums the whole array. You'd return a "window" that doesn't exist.
- **Zero counts left in a frequency map.** When a character's count drops to 0, it is still a key in the map. If you compare maps, or use `len(counts)` as "number of distinct characters", delete the zero entries.

### Active Recall

Answer out loud or on paper first.

1. In the example, at r = 5 the sum went from 9 to 6. Which two values changed it, and at which indices?
2. For n = 6 and k = 3, how many times does the loop body run, and how many windows are examined in total?
3. Suppose the question were "largest **maximum** over any 3 consecutive elements" instead of largest sum. Using the example, explain why you can't update a running max the same way.
4. Would the algorithm still be correct if `nums` contained negative numbers? What about k = 1?

{% capture coach %}
You are my coding-interview coach. I just studied fixed-size sliding windows in Python: to examine every contiguous block of exactly k elements, build the first window (indices 0..k-1), then for each new right edge r from k to n-1 add nums[r] (entering) and subtract nums[r - k] (leaving, the old window's left edge). The invariant is that after right edge r the running state equals the summary of nums[r-k+1 .. r]. It needs an invertible state (sum, count, frequency map); max and min are not invertible. Time O(n), space O(1) for a sum.
Worked example from the lesson: nums = [2, 1, 5, 1, 3, 2], k = 3, largest sum of 3 consecutive elements. Running sums: r=2: 2+1+5 = 8; r=3: 8+1-2 = 7; r=4: 7+3-1 = 9; r=5: 9+2-5 = 6. There are n-k+1 = 4 windows and the answer is 9.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. In the example, at r = 5 the sum went from 9 to 6. Which two values changed it, and at which indices?
2. For n = 6 and k = 3, how many times does the loop body run, and how many windows are examined in total?
3. Suppose the question were "largest maximum over any 3 consecutive elements" instead of largest sum. Using the example, explain why you can't update a running max the same way.
4. Would the algorithm still be correct if nums contained negative numbers? What about k = 1?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Included for this topic. Permutation In String and Sliding Window Maximum use a fixed window as a clearly labelled building block. They don't make you rediscover it, so this checkpoint is your chance to do that.

A fence has n panels in a row. Each panel is painted black (`'B'`) or white (`'W'`), given as a string like `"WBBWWBBWBW"`. You want at least one run of k black panels in a row. Repainting a white panel black costs 1, and black panels are free. What's the minimum cost? For the string above with k = 7, the answer is 3.

Before opening the chat, write down four things: the key observation, your approach, why it's correct, and its complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A fence has n panels in a row. Each panel is painted black ('B') or white ('W'), given as a string like "WBBWWBBWBW". You want at least one run of k black panels in a row. Repainting a white panel black costs 1, and black panels are free. What's the minimum cost? Example: for "WBBWWBBWBW" with k = 7, the answer is 3.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
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

Now the width isn't given. Instead you get a rule, like "the sum must stay at most 7" or "no character may repeat". You want the longest (or shortest) stretch that follows the rule. A window that follows the rule is called **valid**.

Think of playing an accordion. Your right hand keeps pulling outwards to take in the next element. When the window breaks the rule, your left hand squeezes in until the window is valid again. Neither hand ever moves back the way it came.

There's a loop inside a loop here, so it looks like it could be slow. But each hand travels at most n steps in total over the whole run. So the whole scan is O(n).

Before going further, let's name the one property of the rule that all of this depends on. It's called **monotonicity**. Here it means: if a window is valid, every smaller window inside it is valid too. Said the other way round, if a window is invalid, every bigger window that contains it is invalid too. Without that property, throwing away the left element isn't safe, and the technique gives wrong answers.

### Mechanics

Here is the worked example for this module: `nums = [2, 3, 1, 2, 4, 3]`, all positive. We'll ask two questions about the same array:

- **Longest** subarray with sum at most 7. Answer: 3.
- **Shortest** subarray with sum at least 7. Answer: 2.

Here's the longest version, step by step:

1. Move `r` from 0 to n-1 inclusive, adding `nums[r]` to `window_sum`.
2. **While** `window_sum > 7`, subtract `nums[l]` and move `l` right.
3. Now the window `l..r` is valid. Record `r - l + 1` if it beats the best.

The invariant after step 2 is: `l..r` is the longest valid window that ends at `r`.

Why is it safe to move `l` past an index and never come back? This is the part you should be able to say out loud.

Suppose `window_sum > 7` for `l..r`. All the numbers are positive. So for any later right edge r' > r, the sum of `l..r'` is even bigger, and still over 7. That means index `l` can never again be the left end of a valid window, for this `r` or any later one. Dropping it loses nothing.

Check it on the example at r = 5. The window 2..5 has sum 1 + 2 + 4 + 3 = 10. The window 3..5 has sum 2 + 4 + 3 = 9. Both are over 7, so both left edges 2 and 3 get dropped, and `l` lands on 4.

Why is it O(n)? `l` only ever increases, and it never goes past `r + 1`. So across the whole run, the inner `while` runs at most n times in total, not n times per `r`. Add the n steps of `r`, and that's at most 2n updates.

The shortest version is the same loop with the inside flipped:

1. Add `nums[r]`.
2. **While** the window is valid (`window_sum >= 7`), record `r - l + 1`, then subtract `nums[l]` and move `l` right.

Why record *inside* the loop this time? Because the loop only stops once the window is invalid. After the loop, the window is too small to count. The valid windows were the ones you passed through on the way down.

The safety argument mirrors the longest case. Once `l..r` has sum at least 7, any window `l..r'` with r' > r is longer. So it can't beat the length you just recorded. Index `l` has already given its best answer, and it can go.

Here is the shortest trace on the example:

- Nothing is valid until r = 3, where 2 + 3 + 1 + 2 = 8 records length 4.
- At r = 4, the window 1..4 (3 + 1 + 2 + 4 = 10) records 4. Then 2..4 (1 + 2 + 4 = 7) records 3.
- At r = 5, 3..5 (2 + 4 + 3 = 9) records 3. Then 4..5 (4 + 3 = 7) records 2.

The answer is 2.

### Diagram

<figure class="sketch">{% include sketches/dsa-sliding-window/variable-window.svg %}</figure>

The right edge moves one step per row. The left edge only ever moves right, sometimes by more than one step at a time.

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

Running both on `[2, 3, 1, 2, 4, 3]` with 7: `longest_at_most` returns 3 and `shortest_at_least` returns 2. Both match the traces above, step for step. Edge cases I ran (longest result first, then shortest):

- `[]` gives 0 and 0.
- `[8]` with 7 gives 0 and 1. For longest, the only element is already over the limit, so the window ends up empty: `r - l + 1 = 0 - 1 + 1 = 0`.
- `[1, 1, 1]` with 10 gives 3 and 0.

I also checked both against a brute force on 3,000 random positive arrays.

Complexity, with n = len(nums):

- **O(n) time**, because `l` and `r` each move forward at most n times.
- **O(1) extra space** for a sum, or O(σ) for a frequency map over an alphabet of size σ.

Across problems, only two things change: the window state and the validity check. Swap "sum" for "a frequency map". Swap "sum > limit" for "some character appears twice" or "the map is missing something from a target". The rest of the code stays exactly the same.

### Recognition

These are the signals that a variable window fits:

- **The question asks for "longest", "shortest", "minimum length" or "maximum length"** of a contiguous subarray or substring.
- **There's a validity rule you can check from a running state.** For example: at most k distinct characters, no repeats, sum at most (or at least) X, or "at most k elements need changing".
- **The rule is monotone.** For "longest", shrinking a valid window keeps it valid. For "shortest", growing a valid window keeps it valid.
- **The numbers are non-negative**, when the state is a sum.

Here is how this topic's list splits. Longest Substring Without Repeating Characters and Longest Repeating Character Replacement are "longest valid window" questions. Minimum Window Substring is a "shortest valid window" question.

Best Time to Buy And Sell Stock is the disguised one. Nothing in its statement says "subarray". That's exactly why it's worth solving without being told it belongs here.

When not to use it: when the rule isn't monotone. The classic case is sums over arrays with negative numbers. There, growing a window can lower its sum, so a window that's over the limit now might be fine later. That's a job for prefix sums plus a hash map.

How it compares with two pointers from [Part 3](/blogs/dsa-two-pointers/): opposite-ends two pointers usually need sorted data, and they look at pairs. Sliding window pointers both start on the left and move the same way. They look at everything between them.

### Pitfalls

- **Using `if` instead of `while` to shrink.** At r = 5 in the example, the window needs two drops (first 1, then 2). With `if` you only drop one, so you'd record the invalid window 3..5 with sum 9.
- **Recording in the wrong place.** For longest, record after the shrink loop. For shortest, record inside it. Swap them and you record invalid windows.
- **Negative numbers.** `longest_at_most([1, -3], 0)` returns 1, but the true answer is 2, since `1 + (-3) = -2 <= 0`. At r = 0 the sum 1 was over 0, so index 0 got dropped for good. A later negative would have rescued it. In the same way, `shortest_at_least([-2, 1], 1)` returns 0 even though `[1]` works. I ran both, and they behave exactly as described.
- **Forgetting the "no valid window" case in the shortest version.** `float("inf")` must become 0 (or whatever the problem asks for).
- **Off by one in the length.** The window `l..r` inclusive has `r - l + 1` elements.

### Active Recall

Answer out loud or on paper first.

1. At r = 5 in the longest trace, `l` jumped from 2 to 4. Give the two sums that justify dropping indices 2 and 3. Then explain why neither can be useful for any future `r`.
2. The code has a `while` nested inside a `for`. Why isn't it O(n²)?
3. In the shortest trace at r = 4, two windows were recorded (lengths 4 and 3). Why do you need to record inside the loop, and what's in the window after the loop exits?
4. `longest_at_most([1, -3], 0)` returns 1 but the answer is 2. Which step of the algorithm made the fatal decision?

{% capture coach %}
You are my coding-interview coach. I just studied variable-size sliding windows in Python: the right edge r moves one step at a time, adding nums[r] to a running state, and the left edge l moves right only, shrinking the window with a while loop. For "longest valid window" you shrink while the window is invalid and record r - l + 1 after the loop; for "shortest valid window" you shrink while it is valid and record inside the loop. It relies on monotonicity (with positive numbers, a window that is over the limit stays over it when extended), which makes dropping index l safe forever; each pointer moves at most n times, so it is O(n).
Worked example from the lesson: nums = [2, 3, 1, 2, 4, 3]. Longest subarray with sum at most 7 (answer 3), states after the shrink loop: r=0 l=0 sum 2, best 1; r=1 l=0 sum 5, best 2; r=2 l=0 sum 6, best 3; r=3: 8 > 7, drop 2, l=1, sum 6; r=4: 10 > 7, drop 3, l=2, sum 7; r=5: 10 > 7, drop 1 then 2, l=4, sum 7; best stays 3. Shortest subarray with sum at least 7 (answer 2): r=3 records 4 (sum 8); r=4 records 4 (window 1..4, sum 10) then 3 (window 2..4, sum 7), then window 3..4 sums to 6 and the loop stops; r=5 records 3 (window 3..5, sum 9) then 2 (window 4..5, sum 7). The code is longest_at_most(nums, limit) and shortest_at_least(nums, target) exactly as described.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At r = 5 in the longest trace, l jumped from 2 to 4. Give the two sums that justify dropping indices 2 and 3. Then explain why neither can be useful for any future r.
2. The code has a while nested inside a for. Why isn't it O(n^2)?
3. In the shortest trace at r = 4, two windows were recorded (lengths 4 and 3). Why do you need to record inside the loop, and what's in the window after the loop exits?
4. longest_at_most([1, -3], 0) returns 1 but the answer is 2. Which step of the algorithm made the fatal decision?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped for this topic. Best Time to Buy And Sell Stock makes you discover a variable window in a problem that never mentions one. Working that out from scratch is already the exercise, so you'll get this practice when you solve it.

### Transfer test

You have an integer array that can contain negatives, and you need the number of subarrays whose sum is exactly k. Would you use a variable sliding window? Why?

{% capture coach %}
You are my coding-interview coach. I just learned variable-size sliding windows (grow the right edge one step at a time, shrink the left edge with a while loop until the window is valid again, and never move either edge back; it is only correct when the validity rule is monotone, so that an index dropped from the left can never be useful again). Scenario: You have an integer array that can contain negatives, and you need the number of subarrays whose sum is exactly k.
Ask me whether I would use a variable sliding window here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Monotonic Deque

Sliding Window Maximum needs the max of the current window as it slides. But you can't un-add a max (see question 3 of the first module). Neither of the first two modules covers the structure that fixes this, so it gets a module of its own.

### Foundation

Picture a queue of candidates for "tallest person in the room". People join at the back. They leave from the front, oldest first, when their time in the room is up.

Now a tall person walks in. Look at everyone already queued who is shorter or the same height. They all entered earlier, so they'll leave earlier. The newcomer is at least as tall and will stay in the room longer. So none of them can ever be the tallest again, and you send them away right now.

What's left is a queue whose heights strictly decrease from front to back. The front is always the tallest person still in the room. When the front person's time is up, you remove them, and the next one becomes the tallest.

That's a **monotonic deque**. A deque (say "deck") is a queue you can add to and remove from at both ends. Here it's a `collections.deque` of indices. The values at those indices are kept in decreasing order (to track the max) or increasing order (to track the min). It tells you the max or min of the current window in O(1).

Each element costs **amortised O(1)**. That means a single step might pop several elements, but averaged over the whole run it's O(1) per element. That's because each element can only be added once and removed once.

### Mechanics

Here is the worked example for this module: `nums = [10, 1, 2, 4, 7, 2]` and `limit = 5`. The question is: what's the longest subarray where max - min is at most 5? The answer is 4, the window `[2, 4, 7, 2]` at indices 2..5.

This is a variable window, like module 2. Its validity check needs both the max and the min of the window, so it uses two deques.

For each new index `r` with value `x`:

1. **Max deque:** pop from the back while the back's value is `<= x`, then append `r`. The popped indices are **dominated**: each one is earlier than `r` and no larger than `x`, so it's useless from now on.
2. **Min deque:** pop from the back while the back's value is `>= x`, then append `r`. This is the mirror image.
3. **Shrink:** while `nums[max_dq[0]] - nums[min_dq[0]] > limit`, move `l` forward by one. If a deque's front index is now below `l`, it has left the window, so pop it from the front.
4. Record `r - l + 1`.

Why is popping from the back safe? Say index j is popped from the max deque because a later index i > j arrived with `nums[i] >= nums[j]`. From now on, `r >= i`. So any window that still contains j (meaning `l <= j`) also contains i. In every such window, i's value is at least j's. So j is never needed to report the max.

The min deque uses the same argument with `nums[i] <= nums[j]`. In the example at r = 5, index 2 (value 2) is popped from the min deque by index 5 (value 2). Every future window that contains index 2 also contains index 5, which has the same value.

Why is the front the window's max? Step 1 makes the values in the max deque strictly decrease from front to back. Now take any index in `l..r` that isn't in the deque. It was popped by a later index with a value at least as big, and that later index is still in the window. So the window's max is always somewhere in the deque. In a decreasing deque, that means it's at the front.

Why is checking only the front for expiry enough? The indices in the deque increase from front to back. So if the front is at least `l`, all of them are. And `l` moves one step at a time, with a front check at each step. So an old index can never get stuck hiding behind the front.

Here are the three steps worth following on the example (the diagram shows every row):

- **r = 1, x = 1.** 1 is smaller than 10, so the max deque keeps index 0 and becomes `[0, 1]`. The min deque pops index 0 (10 >= 1) and becomes `[1]`. Now max - min = 10 - 1 = 9 > 5, so `l` becomes 1. Index 0 is now below `l`, so it's popped from the max deque's front. Both deques are `[1]`, the window is `[1]`, and best stays 1.
- **r = 4, x = 7.** The max deque pops index 3 (4 <= 7) and becomes `[4]`. The min deque becomes `[1, 2, 3, 4]`. Now 7 - 1 = 6 > 5, so `l` becomes 2, and index 1 leaves the min deque's front. Now 7 - 2 = 5, which is valid. The window is `[2, 4, 7]`, and best stays 3.
- **r = 5, x = 2.** The max deque keeps index 4 (7 > 2) and becomes `[4, 5]`. The min deque pops indices 4, 3 and 2 (values 7, 4, 2 are all >= 2) and becomes `[5]`. Now 7 - 2 = 5, valid with no shrinking. The window is `[2, 4, 7, 2]`, and best becomes 4.

### Diagram

<figure class="sketch">{% include sketches/dsa-sliding-window/monotonic-deques.svg %}</figure>

Read down the max deques: in every row, the values strictly decrease from left to right. Read down the min deques: the values always strictly increase. In every row, the fronts are the window's max and min.

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

The shrink loop never empties a deque. Here's why. Index `r` was just appended to both deques. The loop stops by the time `l` reaches `r` at the latest, because the one-element window `nums[r .. r]` has max - min = 0. That's at most `limit` whenever `limit >= 0`. Since `l <= r` the whole time, index `r` is never popped from the front. So `max_dq[0]` and `min_dq[0]` are always safe to read.

Running it: `longest_within_limit([10, 1, 2, 4, 7, 2], 5)` returns 4. The deques at each step match the diagram above (I printed them from the actual run). Edge cases I ran:

- `[5]` with 0 gives 1.
- `[3, 3, 3]` with 0 gives 3. Ties are handled, because the equal element is popped and replaced by the newer index.
- `[1, 5, 1, 5]` with 3 gives 1.

It also matched a brute force on 3,000 random arrays.

Complexity, with n = len(nums):

- **O(n) time.** Each index is appended to each deque once, and popped from each deque at most once. `l` moves at most n times.
- **O(n) extra space** in the worst case. A strictly decreasing input like `[5, 4, 3, 2, 1]` keeps every index in `max_dq`, because nothing ever gets dominated.

### Recognition

These are the signals that a monotonic deque fits:

- **You have a window (fixed or variable) and the state you need is the max or min.** You can't undo those with subtraction.
- **The brute force would be "for every window, scan for the max"**, which is O(n·k).
- **Elements expire from the old end in the order they arrived.** That's what makes it a queue rather than a stack.

On this topic's list, Sliding Window Maximum is where this applies.

How it compares with its neighbours:

- **A monotonic stack** from [Part 4](/blogs/dsa-stack/) uses the same "pop the dominated ones from the back" rule. But a stack has nothing expiring at the front. If nothing ever leaves the old end, a stack is all you need.
- **A heap** from [Part 10](/blogs/dsa-heaps/) can also track the window's max. A max-heap does it with lazy deletion, meaning you leave expired entries in the heap and only throw them out when they reach the top. That costs O(n log n). (This is recalled, not derived here: heap push and pop are O(log n).) The deque is O(n), and simpler once you trust the invariant.

### Pitfalls

- **Storing values instead of indices.** Then you can't tell whether the front has expired. People patch this with "pop the front if it equals `nums[l]`". That only works if you keep duplicates, by popping only strictly smaller values. With `<=` popping and values stored, `[0, 0, 1, 0]` with limit 0 ends up popping the wrong copy, then crashes with `IndexError` on an empty deque. I ran it to be sure.
- **Using `if` instead of `while` when popping from the back.** The deque stops being monotonic, and the front is no longer the max.
- **Using a Python `list` with `pop(0)` for the front.** That's O(n) per call, because the list shifts every remaining element left (recalled, not derived here). It quietly makes the whole thing O(n²).
- **Checking expiry against the wrong boundary.** The window is `l..r` inclusive. So the front expires when its index is `< l`, not `<= l`.

### Active Recall

Answer out loud or on paper first.

1. At r = 5, the min deque popped index 2, whose value (2) equals the incoming value. Why is it safe to throw away an equal value, not just a strictly larger one?
2. At r = 1 the max deque was briefly `[0, 1]` (values 10, 1). Why was index 1 kept behind 10 instead of thrown away?
3. The code has two `while` loops inside the `for`. Justify O(n) total time with an explicit count.
4. At r = 4, one step of `l` was enough to fix the window. What exactly changed between max - min = 6 and max - min = 5?

{% capture coach %}
You are my coding-interview coach. I just studied the monotonic deque in Python: a collections.deque of indices whose values are kept strictly decreasing front to back (for the window max) or strictly increasing (for the window min). When index r with value x arrives, pop from the back every index whose value is <= x (max deque) or >= x (min deque), because each is older and can never be the answer while r is in the window; then append r. When the left edge l passes the front index, pop the front. The front is always the window's max or min, and each index is pushed and popped at most once, so it is amortised O(1) per element.
Worked example from the lesson: nums = [10, 1, 2, 4, 7, 2], limit = 5, longest subarray with max - min <= 5, using a variable window with two deques (answer 4, window [2, 4, 7, 2] at indices 2..5). States after each step (index:value, front first): r=0: max [0:10], min [0:10], l=0, best 1. r=1: max briefly [0:10, 1:1], min [1:1]; 10 - 1 = 9 > 5 so l=1 and index 0 leaves the max deque's front; max [1:1], min [1:1], best 1. r=2: max [2:2], min [1:1, 2:2], l=1, diff 1, best 2. r=3: max [3:4], min [1:1, 2:2, 3:4], l=1, diff 3, best 3. r=4: max [4:7], min [1:1, 2:2, 3:4, 4:7]; 7 - 1 = 6 > 5 so l=2 and index 1 leaves the min deque; min [2:2, 3:4, 4:7], diff 5, best 3. r=5: max [4:7, 5:2]; min pops indices 4, 3, 2 and becomes [5:2]; diff 7 - 2 = 5, l=2, best 4.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At r = 5, the min deque popped index 2, whose value (2) equals the incoming value. Why is it safe to throw away an equal value, not just a strictly larger one?
2. At r = 1 the max deque was briefly [0, 1] (values 10, 1). Why was index 1 kept behind 10 instead of thrown away?
3. The code has two while loops (popping from the back) plus a shrink loop inside the for. Justify O(n) total time with an explicit count.
4. At r = 4, one step of l was enough to fix the window. What exactly changed between max - min = 6 and max - min = 5?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped for this topic. Sliding Window Maximum is where you'll have to fit this deque to a window yourself. That fitting is the whole exercise, so you'll practise it when you solve that problem.

### Transfer test

For each day in a price history, you need the number of consecutive days ending today (including today) on which the price was at most today's price. Would you use a monotonic deque? Why?

{% capture coach %}
You are my coding-interview coach. I just learned the monotonic deque (a deque of indices kept in decreasing or increasing value order: dominated older elements are popped from the back as new ones arrive, and expired elements are popped from the front as a window's left edge moves, so the front is always the window's max or min). Scenario: For each day in a price history, you need the number of consecutive days ending today (including today) on which the price was at most today's price.
Ask me whether I would use a monotonic deque here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

### How the three connect to sliding window

Every sliding window question has the same two parts. There are two indices `l <= r` that only move right. And there's a **window state** that summarises `nums[l .. r]`, which you update whenever an element enters or leaves.

The three modules differ in just two decisions:

| Decision | Fixed size | Variable size | Monotonic deque |
| --- | --- | --- | --- |
| Who moves `l`? | Tied to `r`: `l = r - k + 1` | The validity rule: shrink while invalid (longest) or while valid (shortest) | Either of the two |
| What's the state? | Anything invertible: sum, count, frequency map | Anything invertible, plus a validity check | Max or min, which isn't invertible, so a deque of candidates |

So on any window problem, ask two questions first. Is the length given, or is it something I choose? And can I undo an element's effect on the state?

<figure class="sketch">{% include sketches/dsa-sliding-window/which-window.svg %}</figure>

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
3. If it's variable, write the validity rule in one sentence. Does shrinking a valid window keep it valid? (For "shortest", does growing a valid one keep it valid?) If you can't say yes, check for negative numbers and consider prefix sums.
4. What's the **state**, and can you add and remove one element in O(1)? Sums and counts: yes. A frequency map: yes, as long as you delete zero keys. Max or min: use a monotonic deque of indices.
5. Where do you **record** the answer? Longest: after shrinking. Shortest: inside the shrink loop. Fixed: after each slide.
6. Work out the complexity by counting pointer moves. `r` moves n times, `l` moves at most n times, and each deque index is pushed and popped at most once.

## The problems

Work through these with the solving cycle from [Part 1](/blogs/dsa-the-method/). Give each problem a 15-minute struggle, write down one key sentence per problem, then review it with spaced repetition.

While you struggle with a problem from this category, ask yourself:

- Can a hash map or set give me O(1) lookups of what's in the window?
- Would prefix sums help instead?
- Can I restate the question as "the longest (or shortest) window where some condition holds"?

The breakthrough is usually picking the right window state, or seeing that the problem is a window problem at all.

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
