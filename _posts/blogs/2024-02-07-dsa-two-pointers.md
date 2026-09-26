---
layout: post
title: "Two pointers work because one comparison throws away a whole row"
date: 2024-02-07 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 3
series_total: 19
tags: [dsa, two-pointers, sorting, python, series]
read_time: 19
permalink: /blogs/dsa-two-pointers/
excerpt: "Two pointers is not a trick for walking an array from both ends. It is a way of proving, one comparison at a time, that a whole row of candidate pairs can never be the answer."
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers two pointers: why moving an index is safe, how one comparison settles a whole row or column of candidate pairs, and how to tell when the technique applies at all.

Most people learn two pointers as a shape: one index at the start, one at the end, move them toward each other. The shape is easy to memorize and easy to misapply, because the shape is not what makes the algorithm correct. What makes it correct is an argument. Every time you move a pointer, you are claiming that every pair involving the index you just left behind has already been decided, and that claim has to be true for the specific comparison you made.

In the order this series follows, this topic comes directly after [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/) and leads into three more: [Binary Search](/blogs/dsa-binary-search/), [Sliding Window](/blogs/dsa-sliding-window/) and [Linked List](/blogs/dsa-linked-list/). The one prerequisite here is two pointers itself, so it is the foundational module and the only one below. How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Two Pointers

### Foundation

Picture two people searching a long, sorted bookshelf for a pair of books whose combined page count is under some limit. One starts at the thinnest book, the other at the thickest. They compare the pair they are holding, and that single comparison lets one of them walk away from their end of the shelf for good. Neither ever walks back. After at most one step per book, every pair has been accounted for.

That is the whole mental model. Two indices bound a region of the input that is still undecided. Each step looks at the two boundary elements, and a property of the input (usually sortedness) guarantees that one boundary element has nothing more to offer, so the region shrinks by one. The problem it solves is the brute-force pair search: checking all n(n-1)/2 pairs costs O(n^2), and two pointers cuts that to O(n) whenever each comparison can settle every pair involving one of the two indices.

The worked example for this whole module, which is not a problem from this topic's list:

Given a sorted array nums and a number target, count the index pairs (i, j) with i < j and nums[i] + nums[j] < target.

We use nums = [-4, -1, 2, 3, 5, 8] and target = 4. The answer is 6: the pairs (-4, -1), (-4, 2), (-4, 3), (-4, 5), (-1, 2) and (-1, 3), with sums -5, -2, -1, 1, 1 and 2.

### Mechanics

Think of every candidate pair as a cell in a grid: row i, column j, only the cells with i < j. For six elements that is 15 cells. Brute force visits all 15. Two pointers visits one cell per step and uses it to decide an entire row or an entire column.

Start with left = 0 and right = 5, the two ends. The undecided region is every pair with both indices in left..right inclusive. The current cell (left, right) is special inside that region:

- It has the **largest** sum in row left, because nums[right] is the largest value still in play and every other partner nums[j] for j in left+1..right-1 is less than or equal to it.
- It has the **smallest** sum in column right, because nums[left] is the smallest value still in play and every other partner nums[i] for i in left+1..right-1 is greater than or equal to it.

That double extremity is the invariant that makes the moves safe:

1. If nums[left] + nums[right] < target, the largest sum in row left already passes, so every cell in that row passes. Add all of them at once, which is right - left pairs (the partners j in left+1..right), then move left forward. Row left is finished.
2. Otherwise the sum is at least target. The smallest sum in column right already fails, so every cell in that column fails. Move right backward. Column right is finished.
3. Stop when left == right. There is no pair left inside the region.

Both moves are safe for the same reason: you only discard an index after proving something about every pair it could still form. Neither move can skip a valid pair, because the pairs that pointer would have formed later are exactly the ones you just decided.

Here is the arithmetic on the worked example, step by step:

| Step | left | right | nums[left] + nums[right] | < 4? | Action | count |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 5 | -4 + 8 = 4 | no | column 5 fails, right becomes 4 | 0 |
| 2 | 0 | 4 | -4 + 5 = 1 | yes | row 0 passes, add 4 - 0 = 4, left becomes 1 | 4 |
| 3 | 1 | 4 | -1 + 5 = 4 | no | column 4 fails, right becomes 3 | 4 |
| 4 | 1 | 3 | -1 + 3 = 2 | yes | row 1 passes, add 3 - 1 = 2, left becomes 2 | 6 |
| 5 | 2 | 3 | 2 + 3 = 5 | no | column 3 fails, right becomes 2 | 6 |

After step 5, left == right == 2 and the loop ends with count = 6, matching the brute-force count. Five comparisons decided all 15 cells.

Notice what step 1 does. The pair (0, 5) sums to exactly 4, which is not less than 4, so index 5 is dropped. That is safe because -4 is the smallest value, so every other partner for 8 only makes the sum bigger. The equality case has to land in a branch, and you have to check that the branch's claim still holds when the sum equals target exactly. Here it does, because "at least target" is what the else-branch needs.

The same idea shows up in three shapes across the problem set. Opposite ends converging, as above, is what this topic's list mostly uses. Two indices moving the same direction at different speeds (a reader and a writer, or a fast and a slow pointer) returns in [Sliding Window](/blogs/dsa-sliding-window/) and [Linked List](/blogs/dsa-linked-list/). One pointer per sequence, walking two sorted sequences side by side, is what merge does. The shape changes; the requirement that each move be justified by a proof about what you are leaving behind does not.

### Diagram

Pointer positions on the worked example, one row per step:

<figure class="sketch">{% include sketches/dsa-two-pointers/pointer-trace.svg %}<figcaption>Each step on [-4, -1, 2, 3, 5, 8] with target 4. Blue (L) is left, amber (R) is right, greyed cells are out of play. A green action counts a whole row; a red one drops a whole column.</figcaption></figure>

And the grid of all 15 candidate pairs, showing which step decided each cell. A green `+k` means step k counted the cell; a red `×k` means step k ruled it out.

<figure class="sketch">{% include sketches/dsa-two-pointers/pair-grid.svg %}<figcaption>The 15 candidate pairs, row i and column j with i &lt; j. Green cells were counted, red cells ruled out, and the number is the step that decided them.</figcaption></figure>

Every `+` step fills a row segment, every `×` step fills a column segment, and together they tile the whole triangle with no gaps and no overlaps. That picture is the correctness proof. Six cells are green, which is the answer.

### Implementation

```python
def count_pairs_less(nums: list[int], target: int) -> int:
    """Count index pairs (i, j) with i < j and nums[i] + nums[j] < target.

    Precondition: nums is sorted in non-decreasing order.
    """
    left, right = 0, len(nums) - 1
    count = 0
    # Invariant: every pair still undecided has both indices in left..right (inclusive).
    while left < right:  # at left == right the only "pair" would be an index with itself
        total = nums[left] + nums[right]
        if total < target:
            # For every j in left+1..right, nums[j] <= nums[right], so
            # nums[left] + nums[j] <= total < target: all right - left pairs count.
            # Example: left=0, right=4 on [-4, -1, 2, 3, 5, 8], target=4 gives
            # total = -4 + 5 = 1, so (0,1), (0,2), (0,3), (0,4) all count: count += 4.
            count += right - left
            left += 1  # row `left` is fully decided, drop it
        else:
            # For every i in left..right-1, nums[i] >= nums[left], so
            # nums[i] + nums[right] >= total >= target: none of those right - left pairs count.
            # Example: left=0, right=5 gives total = -4 + 8 = 4, not < 4,
            # so (0,5), (1,5), (2,5), (3,5), (4,5) all fail.
            right -= 1  # column `right` is fully decided, drop it
    return count


print(count_pairs_less([-4, -1, 2, 3, 5, 8], 4))  # 6
print(count_pairs_less([], 4))                    # 0  (right starts at -1, loop never runs)
print(count_pairs_less([7], 4))                   # 0  (left == right == 0, loop never runs)
print(count_pairs_less([1, 1, 1, 1], 3))          # 6  (all 4 * 3 / 2 index pairs sum to 2)
```

Running it prints 6, 0, 0, 6. I also checked it against a brute-force count over every pair on 2,000 random sorted arrays of length 0 to 9; they agreed every time.

Complexity, with n = len(nums): **O(n) time**, because right - left starts at n - 1 and every iteration reduces it by exactly 1, so the loop runs at most n - 1 times. **O(1) extra space**: three integers. If the input arrives unsorted and the question only cares about values, sort first and the total becomes O(n log n) time (recalled: Python's list.sort is Timsort, O(n log n) worst case, and it needs up to n/2 extra slots of temporary memory, so "O(1) space" is only true of the pointer pass itself).

### Recognition

Signals that two pointers is worth trying:

- **The input is sorted**, or the question asks for values rather than original positions, so you are free to sort it yourself.
- **You are looking for a pair (or a small tuple) whose combined value** is compared against a target: a sum, a difference, a product, a distance.
- **The relationship is monotone**: moving one index in one direction can only push the combined value one way. That monotonicity is what lets one comparison settle a whole row or column.
- **Symmetric positions are compared**: first against last, second against second-to-last.
- **The answer depends on a left boundary and a right boundary**, and you can argue which boundary is the limiting one.
- **The constraint asks for O(1) extra space** or an in-place answer, which rules out the hash-map route.

In this topic's list: Two Sum II Input Array Is Sorted states the sortedness outright. 3Sum asks for values, not indices, which is the licence to sort. Valid Palindrome compares symmetric positions. Container With Most Water and Trapping Rain Water both have answers that depend on a left and a right boundary.

When not to use it:

- **Unsorted input where you must return original indices** and you need an exact match: a hash map gives O(n) time without sorting, as in [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/). Sorting would lose the indices unless you sort (value, index) pairs.
- **The condition is not monotone**, for example "sum divisible by k". Moving a pointer tells you nothing about the pairs you would skip, so there is no elimination argument, and the algorithm silently misses answers.
- **The question is about a contiguous stretch** (the longest or shortest subarray satisfying something). Both pointers then move the same direction and the region between them is the answer itself. That is [Sliding Window](/blogs/dsa-sliding-window/), Part 6.

Distinguishing it from its neighbours: binary search can also find a partner for each element in a sorted array, at O(log n) per element and O(n log n) total. Two pointers gets O(n) by noticing that as left moves right, the useful partner can only move left, so there is no reason to restart the search each time. A hash set gets O(n) time without sorting but pays O(n) space and only answers exact-match questions, not "less than" or "closest to".

### Pitfalls

- **Missing the sortedness precondition.** On the unsorted [8, -4, 5] the "largest sum in row left" claim is false: with target 2 the function returns 0, although -4 + 5 = 1 qualifies, and nothing raises an error. If you sort to make it work, remember that original indices are gone.
- **`left <= right` instead of `left < right`.** With `<=`, the loop considers left == right, which pairs an element with itself. For the count above it happens to be harmless (at left == right == 2 the sum is 2 + 2 = 4, the else-branch runs once more, and the count stays 6), but in a "find a pair" problem the same bug returns an index paired with itself.
- **A branch that moves nothing.** Every branch must move at least one pointer, or the loop never ends. Watch the equality case in particular: decide which branch it belongs to and check that branch's claim holds when the values are exactly equal.
- **Counting by index vs by value.** On [1, 1, 1, 1] with target 3 the count is 6, because the six index pairs are distinct even though the values repeat. If a problem wants distinct value combinations, you need to skip over equal neighbours, and the skip loop needs its own bounds check (`while left < right and nums[left] == nums[left - 1]`) or it walks off the array.
- **Empty and single-element inputs.** With [] the initial right is -1; with one element, left == right == 0. The `left < right` condition handles both, but only because the loop condition is checked before any indexing.
- **Complexity inside an outer loop.** One two-pointer pass is O(n). If you run a fresh pass for each of n outer choices, the total is O(n^2), not O(n). That can still be a big win over O(n^3), but state it correctly.

### Active Recall

1. At step 2 of the worked example (left = 0, right = 4), the sum is 1 and the code adds 4 to count without looking at those pairs individually. Name the four pairs and explain why none of them needs checking.
2. At step 1, the code dropped index 5 (value 8) after checking only one pair. Why can index 5 never appear in a counted pair with any index still in play?
3. Why start the pointers at opposite ends? What goes wrong if both start at index 0 and 1 and you try to decide which to move based on the sum?
4. Change the question to count pairs with sum less than or equal to target. What changes in the code, and what is the new count for the worked example?
5. On [1, 1, 1, 1] with target 3, the function returns 6. Is that double counting caused by the duplicate values?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied two pointers (opposite ends converging) in Python: on a sorted array, left and right bound the region of still-undecided index pairs. The pair (left, right) is the largest sum in row left and the smallest sum in column right, so one comparison settles a whole row or column. If nums[left] + nums[right] < target, all right - left pairs in row left count and left moves forward; otherwise every pair in column right fails and right moves back; stop when left == right. O(n) time, O(1) extra space.
Worked example from the lesson: count index pairs (i, j), i < j, with nums[i] + nums[j] < target, on nums = [-4, -1, 2, 3, 5, 8] and target = 4. Trace: (0,5) sum 4, not < 4, right to 4; (0,4) sum 1, count += 4, left to 1; (1,4) sum 4, right to 3; (1,3) sum 2, count += 2, left to 2; (2,3) sum 5, right to 2; stop with count = 6.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At step 2 of the worked example (left = 0, right = 4), the sum is 1 and the code adds 4 to count without looking at those pairs individually. Name the four pairs and explain why none of them needs checking.
2. At step 1, the code dropped index 5 (value 8) after checking only one pair. Why can index 5 never appear in a counted pair with any index still in play?
3. Why start the pointers at opposite ends? What goes wrong if both start at index 0 and 1 and you try to decide which to move based on the sum?
4. Change the question to count pairs with sum less than or equal to target. What changes in the code, and what is the new count for the worked example?
5. On [1, 1, 1, 1] with target 3, the function returns 6. Is that double counting caused by the duplicate values?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: Container With Most Water and Trapping Rain Water each need their own independent argument for which pointer is safe to move, so the technique gets exercised from scratch when you solve those directly.

### Transfer test

Two shops each give you a price list, both sorted ascending: shop A has m items, shop B has n items. You want to buy exactly one item from each shop, and you want the total to be as close as possible to your budget without going over it. Would you use two pointers? Why?

{% capture coach %}
You are my coding-interview coach. I just learned two pointers (on sorted input, compare the pair at the two boundaries and use one comparison to rule out every remaining pair that shares one of the two indices, so each step discards a whole row or column of candidates). Scenario: Two shops each give you a price list, both sorted ascending: shop A has m items, shop B has n items. You want to buy exactly one item from each shop, and you want the total to be as close as possible to your budget without going over it.
Ask me whether I would use two pointers here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

With one module, the connection to the topic is direct, but it is worth being precise about what the module did and did not give you. It gave you a frame: the candidates form a grid, two indices bound the undecided region, and each step is a small proof that one row or column is finished. It did not give you the proof for any specific problem. Each problem in this topic's list has its own reason why moving a particular pointer is safe, and that reason is the actual content of the problem. If you catch yourself moving a pointer because "that's what two pointers does", stop and write the one-sentence claim about the index you are leaving behind. If you cannot write it, the move is not justified yet.

Competing approaches for a "find or count pairs" question:

| Approach | Needs | Time | Extra space | Good for |
| --- | --- | --- | --- | --- |
| Nested loops | nothing | O(n^2) | O(1) | small n, or as the baseline to beat |
| Hash set / map | exact-match condition | O(n) | O(n) | unsorted input, original indices needed |
| Sort, then binary search per element | monotone condition | O(n log n) | O(1) beyond the sort | a fallback when no pointer-elimination argument is visible |
| Sort, then two pointers | monotone condition | O(n) after sorting | O(1) beyond the sort | exact, less-than, closest-to; in-place answers |
| Same-direction pointers (sliding window) | the answer is a contiguous stretch | O(n) | O(1) or O(k) | longest or shortest subarray with a property |

Recognition checklist for an unfamiliar problem:

1. Is the input sorted, or am I allowed to sort it because only values matter?
2. Is the answer a pair (or small tuple), or a pair of boundaries?
3. If I move one index, does the quantity I care about change in only one direction?
4. For the pair I am looking at, can I say something about every other pair that shares one of its indices? Write that sentence down.
5. Does each branch of my comparison move at least one pointer, and is the equality case in a branch whose claim still holds?
6. Is the answer a contiguous range between the pointers? Then it is probably a sliding window, not converging pointers.
7. Do I need original indices on unsorted data? Then a hash map is likely simpler.

## The problems

Work through these with the solving cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute struggle, one key sentence written in your own words, spaced repetition. During the struggle for this topic, ask: can a hash map or set give O(1) lookups? Would prefix sums help? Can two pointers shrink the search space, and what exactly does one comparison let me throw away? The insight is usually the right data structure, or reframing the question as a pair or window condition.

| # | Problem |
| --- | --- |
| 1 | [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) |
| 2 | [Two Sum II Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) |
| 3 | [3Sum](https://leetcode.com/problems/3sum/) |
| 4 | [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) |
| 5 | [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) |

## Take this lesson as a live session

To go through this lesson interactively, with the coach stopping to wait for your answers, open the full prompt in a chat.

{% capture coach %}
[TOPIC]: Two Pointers
[PREREQUISITES]: Two Pointers
[PROBLEM LIST]: Valid Palindrome, Two Sum II Input Array Is Sorted, 3Sum, Container With Most Water, Trapping Rain Water
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
