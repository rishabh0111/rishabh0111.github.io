---
layout: post
title: "Binary search was never about sorted arrays. It's about a yes/no question that flips exactly once"
date: 2024-02-12 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, binary-search, python, series]
read_time: 30
permalink: /blogs/dsa-binary-search/
excerpt: "Everyone can write binary search on a sorted array. The seven problems in this category test whether you can spot the search space when nobody hands you a sorted array, and whether your boundaries survive duplicates, empty inputs and the last two elements."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 5
series_total: 19
links_new_tab: true
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers binary search: the lower-bound loop on a sorted array, and the same loop lifted onto any integer range with a yes/no question that flips exactly once. Seven problems at the end put it to work.

Binary search is how you find something in a space of n candidates while only looking at about log2(n) of them. The catch is that it only works when one check at the middle tells you, with certainty, which half cannot contain the answer. Sorted arrays give you that for free, which is why they're where everyone learns it. Most of the problems in this category don't hand you a sorted array of the answers, though. They hand you a range of speeds, a split point, a rotated array, or a list of timestamps, and the work is noticing that a monotone yes/no question lives inside it.

In the order this series follows, Binary Search comes after [Two Pointers](/blogs/dsa-two-pointers/), which is where the idea of shrinking a search space by reasoning about sorted order first showed up. Together with Linked List it unlocks Trees, where a binary search tree is this same halving argument baked into a data structure.

The prerequisites here are **Search Array** and **Search Range**. Those are the two modules below. The first is binary search over the indices of a sorted array, and the second lifts the same loop off the array and onto any integer range with a yes/no question attached.

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Search Array

### Foundation

You're looking for a word in a paper dictionary. You don't read from page one. You open near the middle, see "M", know your word starts with "D", and throw away the entire back half without reading any of it. One glance, half the book gone.

That throwaway step is the whole technique. It's only safe because the dictionary is sorted: if the middle page is past "D", every page after it is also past "D". Sorted order turns one comparison into a verdict about half the remaining candidates.

The version worth learning first isn't "is the target here?" but a slightly stronger question: **what is the first index whose value is at least `target`?** This is the "lower bound" or insertion point. It answers "is it present?" (check that index), "where would it go?" (that index), and "where does the run of duplicates start?" (also that index), so it's the one loop to know cold.

### Mechanics

Worked example, used for the rest of this module:

nums = [1, 3, 5, 5, 8, 12, 15], target = 5. The answer is index 2, the leftmost 5.

Keep two indices, lo and hi, and treat the candidates as the half-open range [lo, hi), meaning lo is a candidate and hi is not. Start with lo = 0 and hi = len(nums) = 7. hi starts one past the end on purpose: "no element is at least target" is a legal answer, and it's represented by index 7.

The invariant, true before every iteration:

- every index in [0, lo - 1] holds a value less than target (definitely not the answer), and
- every index in [hi, len(nums) - 1] holds a value at least target (a valid index, but not the first one we haven't ruled out).

Each step picks mid = (lo + hi) // 2 and asks one question: is nums[mid] >= target?

- **Yes.** Then mid might be the answer, and by sortedness every index in [mid + 1, hi - 1] is also at least target, so none of them can be the *first* such index. Set hi = mid. Not mid - 1, because that would throw away mid, which might be the answer.
- **No.** nums[mid] < target, and by sortedness every index in [lo, mid] is at most nums[mid], so all of them are less than target. None can be the answer. Set lo = mid + 1.

Stop when lo == hi. The candidate range is empty, and the invariant says everything left of lo is too small and everything from hi onward is big enough, so lo is the first index that's big enough.

Why it always terminates: while lo < hi, floor division gives lo <= mid <= hi - 1. Setting hi = mid shrinks the range because mid < hi. Setting lo = mid + 1 shrinks it because mid + 1 > lo. The width hi - lo drops by at least 1 every iteration, and in fact roughly halves.

Running it on the example (computed, not guessed):

| step | lo | hi | mid | nums[mid] | nums[mid] >= 5? | move |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 7 | 3 | 5 | yes | hi = 3 |
| 2 | 0 | 3 | 1 | 3 | no | lo = 2 |
| 3 | 2 | 3 | 2 | 5 | yes | hi = 2 |

lo = hi = 2. Answer 2. Step 1 landed on a 5 at index 3 and didn't stop, which is exactly why this loop finds the leftmost duplicate rather than whichever copy it happens to hit first.

### Diagram

<figure class="sketch">{% include sketches/dsa-binary-search/lower-bound-trace.svg %}<figcaption>Lower bound for target 5. Violet is mid, the cell checked at that step; blue marks lo, amber marks hi. Red cells are ruled out as too small, green cells are known to be at least 5. Index 7 is the "none" slot and is never read.</figcaption></figure>

The last row is the invariant made visible: a wall between "too small" on the left and "big enough" on the right, and lo sits on the first cell of the right side.

### Implementation

```python
def lower_bound(nums: list[int], target: int) -> int:
    """Return the first index i with nums[i] >= target, or len(nums) if none.

    nums must be sorted in non-decreasing order.
    """
    lo, hi = 0, len(nums)          # candidates are indices lo..hi-1; hi = len(nums) means "none"
    while lo < hi:                 # stop when the candidate range lo..hi-1 is empty
        mid = (lo + hi) // 2       # lo <= mid <= hi - 1 while lo < hi, so nums[mid] is in bounds
        if nums[mid] >= target:
            # nums[mid] >= target: index mid may be the answer, so keep it (hi = mid, not mid - 1).
            # Indices mid+1..hi-1 hold values >= nums[mid] >= target, so none of them is the FIRST.
            # Example: target=5, lo=0, hi=7, mid=3, nums[3]=5 -> hi=3; answer 2 is still in 0..2.
            hi = mid
        else:
            # nums[mid] < target: indices lo..mid all hold values <= nums[mid] < target.
            # Example: target=5, lo=0, hi=3, mid=1, nums[1]=3 -> lo=2; indices 0..1 hold 1 and 3.
            lo = mid + 1
    # lo == hi: indices 0..lo-1 are < target and indices lo..len(nums)-1 are >= target.
    return lo


nums = [1, 3, 5, 5, 8, 12, 15]
print(lower_bound(nums, 5))    # 2  (leftmost of the two 5s)
print(lower_bound(nums, 6))    # 4  (6 would be inserted before the 8 at index 4)
print(lower_bound(nums, 0))    # 0  (every element is >= 0)
print(lower_bound(nums, 20))   # 7  (no element is >= 20, so len(nums))
print(lower_bound([], 3))      # 0  (loop never runs; empty input needs no special case)
```

I ran this against the example and the edge cases above, and against 2,000 random sorted arrays compared with Python's `bisect.bisect_left`. They agree every time. The standard library already ships this loop: `bisect.bisect_left(nums, target)` returns the same index, and `bisect.bisect_right(nums, target)` returns the first index with `nums[i] > target` (recalled from the `bisect` docs, not derived here; since Python 3.10 both also accept a `key=` function). Know how to write the loop anyway. Interviewers ask for it, and several problems need a comparison `bisect` can't express directly.

Turning this into "return the index of target, or -1" is a one-line check after the loop. That's what the first problem in the list asks for, so it's yours to write.

**Complexity.** Time O(log n), where n = len(nums): the width hi - lo at least halves each iteration, so the loop runs at most floor(log2 n) + 1 times. I checked that bound exhaustively for small n; for n = 7 it's 3, matching the three steps in the trace. Space O(1).

### Recognition

Signals that this module applies:

- The input is **sorted** (or the problem says "non-decreasing", "ascending", "sorted by timestamp") and you need to find a value, a position, or a boundary.
- The question is "first/last element that is at least / at most X", "where would X be inserted", "how many elements are below X", or "does X exist".
- Constraints are large (n up to 10^5 or 10^6) and you're asked for many lookups against a fixed sorted collection. One O(n log n) sort plus O(log n) per query beats O(n) per query.
- **Sorted order that isn't handed to you as a flat sorted list.** It can hide in the layout of a structure or in the order the data arrives. Search a 2D Matrix and Time Based Key Value Store both show this signal; spotting exactly where the sorted order lives is their work, not this module's.

When not to use it:

- **Unsorted data with a single lookup.** Sorting costs O(n log n) to save an O(n) scan. A hash set gives O(1) average membership without sorting at all.
- **You need a pair or triple satisfying a condition on a sorted array.** That's usually two pointers, which walks both ends in one O(n) pass instead of binary searching once per element in O(n log n).
- **The collection changes constantly.** Inserting into a sorted Python list is O(n) even though finding the position is O(log n). Past a point you want a heap or a balanced tree.

### Pitfalls

- **Mixing conventions.** The half-open [lo, hi) template pairs `hi = len(nums)`, `while lo < hi`, and `hi = mid`. The closed [lo, hi] template pairs `hi = len(nums) - 1`, `while lo <= hi`, and `hi = mid - 1`. Taking one line from each is the most common source of infinite loops and off-by-ones. Pick one per loop and say its invariant out loud.
- **`lo = mid` instead of `lo = mid + 1`.** With lo = 6, hi = 7 (target 20 in the example), mid = 6. If the "no" branch sets lo = mid, lo stays 6 forever.
- **Reading `nums[lo]` after the loop without checking lo < len(nums).** The answer can be len(nums), which is out of bounds.
- **Stopping on the first equal element.** Fine for "does it exist", wrong for "where does the run of equal values start". The trace above hit a 5 at index 3 first; the leftmost 5 is at 2.
- **Empty and single-element inputs.** With hi = len(nums) the empty case falls out naturally (the loop never runs, return 0). Test the single-element case both ways: `lower_bound([4], 4)` is 0 and `lower_bound([4], 5)` is 1.
- **Integer overflow in (lo + hi) // 2.** Not a problem in Python, whose integers are unbounded (recalled). In Java or C++ you'd write lo + (hi - lo) / 2. Worth mentioning in an interview if you're asked about other languages.

### Active Recall

1. In step 1 of the trace, nums[3] equals the target. Why is it correct to set hi = 3 and keep going rather than returning 3, and why is hi = 3 safe while hi = 2 would not be?

2. Why does `while lo < hi` with `mid = (lo + hi) // 2` never read `nums[hi]` when hi = len(nums)?

3. Using the same nums = [1, 3, 5, 5, 8, 12, 15], how would you find the index of the *last* element that is at most 5, using only lower bound or `bisect`? What does your method return for "last element at most 0"?

4. For an array of 1,000,000 sorted values, roughly how many iterations does the loop take at most, and how many for n = 8?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Search Array (binary search on a sorted array, the "lower bound" loop) in Python: keep a half-open candidate range [lo, hi) with lo = 0 and hi = len(nums), where hi = len(nums) means "no element qualifies". While lo < hi, take mid = (lo + hi) // 2; if nums[mid] >= target set hi = mid (mid may be the answer), else set lo = mid + 1. The invariant: every index left of lo holds a value < target and every index from hi on holds a value >= target, so when lo == hi, lo is the first index with nums[i] >= target. Python's bisect.bisect_left does the same; bisect_right returns the first index with nums[i] > target.
Worked example from the lesson: nums = [1, 3, 5, 5, 8, 12, 15], target = 5. Step 1: lo 0, hi 7, mid 3, nums[3] = 5 >= 5, so hi = 3. Step 2: lo 0, hi 3, mid 1, nums[1] = 3 < 5, so lo = 2. Step 3: lo 2, hi 3, mid 2, nums[2] = 5 >= 5, so hi = 2. lo = hi = 2, the leftmost 5.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. In step 1 of the trace, nums[3] equals the target. Why is it correct to set hi = 3 and keep going rather than returning 3, and why is hi = 3 safe while hi = 2 would not be?
2. Why does while lo < hi with mid = (lo + hi) // 2 never read nums[hi] when hi = len(nums)?
3. Using the same nums = [1, 3, 5, 5, 8, 12, 15], how would you find the index of the last element that is at most 5, using only lower bound or bisect? What does your method return for "last element at most 0"?
4. For an array of 1,000,000 sorted values, roughly how many iterations does the loop take at most, and how many for n = 8?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: the first problem in the list (Binary Search) makes you write this loop, including its exact-match variant, from a blank page, so the mechanics get exercised there directly.

### Transfer test

A shop has 200,000 products stored in a list sorted by price. The page gets thousands of requests like "how many products cost between 500 and 1,200, inclusive?" Would you use this module? Why?

{% capture coach %}
You are my coding-interview coach. I just learned binary search on a sorted array, the lower-bound loop (one comparison at mid discards half the remaining candidates; bisect_left finds the first index with value >= x, bisect_right the first with value > x). Scenario: A shop has 200,000 products stored in a list sorted by price. The page gets thousands of requests like "how many products cost between 500 and 1,200, inclusive?"
Ask me whether I would use binary search on the sorted array here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Search Range

### Foundation

Play "I'm thinking of a number between 1 and 100". You guess 50, hear "lower", guess 25, and so on. There's no array anywhere. What makes halving work is that every guess gets an answer that rules out a whole side.

That's the move this module makes: binary search doesn't need an array, it needs a **range of integer candidates** and a **yes/no question that is false for a prefix of the range and true for the rest**. In the previous module the question was "is nums[i] >= target?" and the range was the indices 0..len(nums). Swap the question and the range, and the same loop searches over speeds, capacities, sizes, days, thresholds, or split positions.

Formally, a predicate pred(x) over integers lo..hi is **monotone** if, once it becomes true, it stays true:

F F F F T T T T

Find the first T and you've answered the problem. This is "binary search on the answer" and it's the single most transferable idea in this category.

### Mechanics

Worked example, used for the rest of this module: **the integer square root of n = 40**, the largest x with x * x <= 40. The answer is 6 (36 <= 40, 49 > 40).

Step 1: find a monotone predicate. "x * x <= 40" is true then false (T T ... T F F), which is the wrong way round for a "first true" search. Flip it: pred(x) = x * x > 40 is false for x in 0..6 and true for every x >= 7, because squares of non-negative integers only grow. The first true is 7, and the answer is the last false, 7 - 1 = 6. Converting "last x where something holds" into "first x where it stops holding, minus one" is a trick you'll use repeatedly.

Step 2: pick the range so that the answer is guaranteed to be inside it. The smallest candidate is 0. For the upper end, use n + 1 = 41: (n + 1)^2 > n for every n >= 0, so pred(41) is true and a first-true is guaranteed to exist in 0..41. Using hi = n instead breaks n = 0, as the recall questions show.

Step 3: run the same loop as lower bound, with pred(mid) in place of nums[mid] >= target. The invariant is the same with the words swapped:

- every x in [original lo, lo - 1] has pred(x) false, and
- every x in [hi, original hi] has pred(x) true.

"Yes" (pred(mid) true): mid might be the first true, and everything above it is true too, so hi = mid. "No": mid and everything below it are false, so lo = mid + 1. Monotonicity is what makes each of those "everything" claims safe. Without it, a false at mid says nothing about mid - 1.

The trace for n = 40, computed by running the code below:

| step | lo | hi | mid | mid * mid | > 40? | move |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 41 | 20 | 400 | yes | hi = 20 |
| 2 | 0 | 20 | 10 | 100 | yes | hi = 10 |
| 3 | 0 | 10 | 5 | 25 | no | lo = 6 |
| 4 | 6 | 10 | 8 | 64 | yes | hi = 8 |
| 5 | 6 | 8 | 7 | 49 | yes | hi = 7 |
| 6 | 6 | 7 | 6 | 36 | no | lo = 7 |

lo = hi = 7, the first x whose square exceeds 40. Answer 7 - 1 = 6. Six predicate calls to search 42 candidates.

### Diagram

<figure class="sketch">{% include sketches/dsa-binary-search/isqrt-predicate.svg %}<figcaption>The predicate x*x &gt; 40 over the range 0..41: red is false, green is true. The numbered circles are the six probes in the order the loop makes them.</figcaption></figure>

<figure class="sketch">{% include sketches/dsa-binary-search/isqrt-candidates.svg %}<figcaption>The candidates after step 3 and after step 6. Red is ruled out (false), green is known true, "?" is still a candidate; blue marks lo, amber marks hi. At the end the wall sits between 6 and 7.</figcaption></figure>

The predicate row is the thing to draw on paper for any problem in this category. If you can't fill it in as a run of F followed by a run of T, binary search on that predicate is not safe.

### Implementation

```python
from typing import Callable


def first_true(lo: int, hi: int, pred: Callable[[int], bool]) -> int:
    """Return the smallest x in lo..hi with pred(x) True.

    Requires: pred is monotone on lo..hi (all False, then all True) and pred(hi) is True,
    or hi is a sentinel meaning "none". pred(hi) itself is never evaluated.
    """
    while lo < hi:                 # candidates are lo..hi-1 plus the known-True hi
        mid = (lo + hi) // 2       # lo <= mid <= hi - 1, so pred is never called on hi
        if pred(mid):
            # pred(mid) True: by monotonicity pred is True on mid..hi, so the first True is <= mid.
            # Example (n=40): lo=0, hi=41, mid=20, 20*20=400 > 40 -> hi=20.
            hi = mid
        else:
            # pred(mid) False: by monotonicity pred is False on lo..mid, so the first True is >= mid+1.
            # Example (n=40): lo=0, hi=10, mid=5, 5*5=25 <= 40 -> lo=6.
            lo = mid + 1
    return lo


def isqrt(n: int) -> int:
    """Largest x with x * x <= n, for n >= 0."""
    # pred(x) = x*x > n is False for x in 0..isqrt(n) and True for x >= isqrt(n)+1.
    # hi = n + 1 is safe because (n+1)*(n+1) > n for every n >= 0 (n=0: 1 > 0).
    return first_true(0, n + 1, lambda x: x * x > n) - 1


print(isqrt(40))   # 6   (first x with x*x > 40 is 7)
print(isqrt(0))    # 0   (first_true(0, 1) -> 1, minus 1)
print(isqrt(16))   # 4   (perfect square: 4*4 = 16 is not > 16, 5*5 = 25 is)
print(isqrt(17))   # 4
```

I ran this on the example, on 0, 1, 2, 15, 16 and 17, and on 2,000 random n up to 10^6 against `math.isqrt` (recalled: standard library since Python 3.8). All match. `first_true` is `lower_bound` with the array lookup replaced by a function call. If you prefer the library, `lo + bisect.bisect_left(range(lo, hi), True, key=pred)` does the same job on Python 3.10+ (the `key=` parameter and `range` indexing without building a list are recalled; I checked that it returns 7 for n = 40 on Python 3.11). Note the `lo +`: bisect returns a position inside the range, not the value. Writing the loop yourself is still easier to debug when the predicate is the hard part.

**Complexity.** Let R = hi - lo be the size of the search range and C the cost of one pred call. Time O(C · log R): the loop runs at most floor(log2 R) + 1 times. For isqrt, R = n + 1 and C = O(1), so O(log n). Space O(1) beyond whatever pred uses.

That C factor is the part people forget. When pred has to scan an input of size m, the search costs O(m · log R), and R is often the size of the *value* range, not the input. A range of 1..10^9 is still only about 30 probes.

### Recognition

Signals:

- The problem asks for the **minimum** (or maximum) value of something that still satisfies a condition: "smallest speed such that...", "least capacity so that...", "earliest day when...".
- Checking a single candidate is easy, but constructing the optimal one directly is hard. If you can write `is_feasible(x)` in O(m), you can usually find the best x in O(m log R).
- Making x bigger only makes the condition easier to satisfy (or only harder). That's monotonicity, and it's the thing you must be able to argue in one sentence. Koko Eating Bananas has exactly this shape: a candidate answer, a feasibility check, and a direction in which feasibility only improves.
- The answer is bounded by something you can compute: 1 and max(input), 0 and n, the sum of the input.
- The yes/no question is about **positions in an array that isn't fully sorted**, but still flips once. "Is this index at or after the point where X happens?" is a monotone predicate even when the values aren't sorted. The two rotated-array problems (Find Minimum In Rotated Sorted Array and Search In Rotated Sorted Array) live here: the work is finding a question about index mid that you can answer in O(1) and that flips once. Median of Two Sorted Arrays searches over a split position rather than a value. Those derivations are the problems themselves, so I'm naming the signal and stopping.

When not to use it, and how it differs from neighbours:

- **The predicate isn't monotone.** "Is x * x exactly 36?" is F F ... F T F F ..., and the recall question below shows binary search walking straight past the only T.
- **Linear scan is already fast enough.** If R is 50, just try all 50 candidates; clarity wins.
- **Greedy or DP optimises the value directly.** Binary search on the answer turns "optimise" into "decide". It's the right move when deciding is much easier than optimising. When there's a direct greedy construction, use it.
- **Two pointers / sliding window** also shrink a search space, but they move one step at a time through a sequence in O(n) total. Binary search jumps and needs random access to candidates, which a range of integers always has.

### Pitfalls

- **No sentinel.** If the range can contain no true value, hi must be a slot that means "none" (n + 1 above, len(nums) in lower bound). Otherwise the loop returns hi and you treat a false candidate as the answer.
- **Wrong direction.** Many problems naturally give T ... T F ... F ("still feasible?"). Either flip the predicate or search for the last true with mid rounded up. Flipping keeps you on one template, which is fewer bugs.
- **Off by one when converting.** "Largest x with P(x)" = first_true(not P) - 1. Check it on one concrete value (here: first true 7, answer 6, and 6 * 6 = 36 <= 40).
- **Bounds that exclude the answer.** A lower bound of 0 when the answer must be at least 1 can make pred divide by zero. An upper bound that's too small silently caps the answer.
- **Floats.** On real-valued ranges, `lo = mid + 1` makes no sense. Iterate a fixed number of times (say 100) or until hi - lo is below a tolerance. None of this category needs that, but it's the first thing that breaks when you transfer the idea.
- **Forgetting the C in O(C log R).** A predicate that sorts or builds a structure each call can make the "log" search slower than you think.

### Active Recall

1. Why did the implementation use hi = n + 1 instead of hi = n? What does `first_true(0, 0, lambda x: x * x > 0) - 1` return, and why is it wrong?

2. Suppose you used pred(x) = x * x == 36 on the range 0..41. What happens, and what does that tell you about the requirement on pred?

3. In the n = 40 trace, step 3 had mid = 5 with pred false. Name every candidate that one probe ruled out, and explain why it's safe to rule out the ones you didn't evaluate.

4. You have pred computed by scanning an array of m = 10^5 numbers, and the answer range is 1..10^9. Roughly how many operations does binary search on the answer take, compared with trying every candidate?

5. You want the *largest* x in 1..100 such that f(x) <= 50, where f is increasing. Write the call to `first_true` that gets it, and say what it returns if even f(1) > 50.

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Search Range (binary search on the answer) in Python: binary search needs no array, only an integer range lo..hi and a monotone yes/no predicate pred(x) that is False for a prefix of the range and True for the rest. The loop is the lower-bound loop with pred(mid) in place of nums[mid] >= target: first_true(lo, hi, pred) keeps "everything left of lo is False, everything from hi on is True", sets hi = mid when pred(mid) is True and lo = mid + 1 otherwise, and never evaluates pred(hi), so hi must be provably True or act as a "none" sentinel. "Largest x with P(x)" becomes first_true(not P) - 1. Cost is O(C * log R) for predicate cost C and range size R.
Worked example from the lesson: integer square root of n = 40 as first_true(0, 41, lambda x: x * x > 40) - 1, with hi = n + 1 = 41 because (n+1)^2 > n for every n >= 0. Probes: mid 20 (400, True, hi = 20), mid 10 (100, True, hi = 10), mid 5 (25, False, lo = 6), mid 8 (64, True, hi = 8), mid 7 (49, True, hi = 7), mid 6 (36, False, lo = 7). lo = hi = 7, answer 7 - 1 = 6.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Why did the implementation use hi = n + 1 instead of hi = n? What does first_true(0, 0, lambda x: x * x > 0) - 1 return, and why is it wrong?
2. Suppose you used pred(x) = x * x == 36 on the range 0..41. What happens, and what does that tell you about the requirement on pred?
3. In the n = 40 trace, step 3 had mid = 5 with pred false. Name every candidate that one probe ruled out, and explain why it's safe to rule out the ones you didn't evaluate.
4. You have pred computed by scanning an array of m = 10^5 numbers, and the answer range is 1..10^9. Roughly how many operations does binary search on the answer take, compared with trying every candidate?
5. You want the largest x in 1..100 such that f(x) <= 50, where f is increasing. Write the call to first_true that gets it, and say what it returns if even f(1) > 50.
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: Koko Eating Bananas makes you find the search range, invent the predicate, and argue its monotonicity from scratch, so this module's core move gets exercised there without a separate warm-up.

### Transfer test

You're tuning a video encoder. You want the lowest bitrate, an integer between 100 and 20,000 kbps, at which a quality metric reaches a target score. One encode-and-measure run takes 30 seconds, and higher bitrate never lowers quality. Would you use this module? Why?

{% capture coach %}
You are my coding-interview coach. I just learned binary search on the answer (search an integer range with a monotone yes/no predicate that is False then True, finding the first True in O(check cost * log range)). Scenario: You're tuning a video encoder. You want the lowest bitrate, an integer between 100 and 20,000 kbps, at which a quality metric reaches a target score. One encode-and-measure run takes 30 seconds, and higher bitrate never lowers quality.
Ask me whether I would use binary search on the answer here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

Both modules are the same loop. Search Array is binary search where the yes/no question is "is nums[i] >= target?" over the indices 0..len(nums). Search Range removes the array and keeps the loop: any integer range, any monotone question. Every problem in this category is one of three things:

1. **A sorted collection you search directly**, possibly one whose sorted order you first have to notice because it isn't a plain list. Search Array's lower bound, or its mirror "last element at most X", does the work.
2. **An answer you can check but not construct**, where you binary search the value of the answer with a feasibility predicate. Search Range, with the predicate and its bounds as the whole problem.
3. **A monotone question about positions in something that isn't plainly sorted**: a rotated array, a split point between two arrays. The loop is the same; finding a predicate on index mid that flips exactly once is the problem.

Telling it apart from competing approaches:

| If you see... | Reach for... | Because |
| --- | --- | --- |
| Sorted data, one value or boundary to find, many queries | Binary search, O(log n) each | One comparison discards half |
| Unsorted data, "does X exist?" | Hash set, O(1) average | Sorting just to search once costs more than it saves |
| Sorted data, find a pair or triple meeting a condition | Two pointers, O(n) | Both ends move inward in one pass |
| "Minimum X such that it works" and checking X is easy | Binary search on the answer, O(check · log range) | Turns an optimisation into ~30 yes/no questions |
| Contiguous subarray with a condition that grows/shrinks with the window | Sliding window, O(n) | Needs order, not halving |
| Repeated "smallest/largest so far" as data arrives | Heap | Binary search needs a static, indexable space |

A recognition checklist for unfamiliar problems:

1. What exactly am I searching for: an index, a value, or a split point? Write the range of candidates as lo..hi.
2. Can I state a yes/no question about one candidate whose answers, across the range, look like F F F T T T? Draw the row for a tiny input.
3. Can I answer that question for one candidate quickly (O(1), O(log n), or O(n))? That cost times log(range) is my complexity.
4. Is the answer the first T, or the last F? If the natural question runs T then F, flip it.
5. Does the range need a sentinel for "no answer"? Pick hi so that pred(hi) is provably true, or treat hi as "none".
6. Hand-run the loop on the tiny input, including the last two candidates, before trusting it.
7. If I can't make the question monotone, binary search isn't the tool. Look at hashing, two pointers, or a direct greedy.

## The problems

Work these with the solving cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute honest struggle, one key sentence per problem, spaced repetition. For this category, the struggle questions are: what is the search space (indices, values, or a split point), what yes/no question flips exactly once across it, and after one check at mid, which half can I throw away and why?

{% include dsa-problems.html slug="dsa-binary-search" %}

## Take this lesson as a live session

If you'd rather be taught this interactively, with the coach actually waiting for your answers, open the full lesson prompt in a chat.

{% capture coach %}
[TOPIC]: Binary Search
[PREREQUISITES]: Search Array, Search Range
[PROBLEM LIST]: Binary Search, Search a 2D Matrix, Koko Eating Bananas, Find Minimum In Rotated Sorted Array, Search In Rotated Sorted Array, Time Based Key Value Store, Median of Two Sorted Arrays
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
