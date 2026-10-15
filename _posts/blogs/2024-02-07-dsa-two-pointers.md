---
layout: post
title: "Two pointers work because one comparison throws away a whole row"
date: 2024-02-07 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 3
series_total: 19
links_new_tab: true
tags: [dsa, two-pointers, sorting, python, series]
read_time: 21
permalink: /blogs/dsa-two-pointers/
excerpt: "Two pointers looks like walking an array from both ends. What makes it work is that one comparison can prove a whole row of candidate pairs is never the answer, so you can drop them all at once."
---

Most people learn two pointers as a shape: one index at each end, both moving inward. The shape is easy to copy, but it isn't what makes the algorithm correct. Each time a pointer moves, it leaves an index behind for good. That move is only safe if you've already settled every pair that index could still be part of.

This post is about how one comparison lets you settle all those pairs at once, and how to tell when the technique applies at all. It builds on [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/) and leads into [Binary Search](/blogs/dsa-binary-search/), [Sliding Window](/blogs/dsa-sliding-window/) and [Linked List](/blogs/dsa-linked-list/).

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## Two Pointers

### Foundation

Picture a long bookshelf, sorted from the thinnest book to the thickest. Two friends want to find pairs of books whose page counts add up to less than some limit. One friend stands at the thin end, the other at the thick end, and each holds one book.

They add up the two books they're holding. That one sum is enough for one of them to put their book back and step inward, and they never need to come back to that spot. Each book gets stepped past at most once, so after a single walk along the shelf every pair has been dealt with.

Let's turn that into code terms. The two friends are two indices, left and right. Everything between them (both ends included) is the part of the array we haven't finished with yet. At each step we look at the two elements at the ends. Because the array is sorted, one of those two elements can't form any more useful pairs, so we drop it and the undecided part gets one element shorter.

Why bother? The brute-force way to search pairs is to check all n(n-1)/2 of them, which costs O(n^2). Two pointers does the same job in O(n), as long as each comparison can settle every pair that involves one of the two indices.

Here is the worked example we'll use for the whole post. It isn't one of this topic's problems:

Given a sorted array nums and a number target, count the index pairs (i, j) with i < j and nums[i] + nums[j] < target.

We'll use nums = [-4, -1, 2, 3, 5, 8] and target = 4. The answer is 6. The six pairs are (-4, -1), (-4, 2), (-4, 3), (-4, 5), (-1, 2) and (-1, 3), and their sums are -5, -2, -1, 1, 1 and 2.

### Mechanics

It helps to see every possible pair as a cell in a grid. Row i, column j holds the pair (i, j), and we only care about cells where i < j. With six elements that's 15 cells. Brute force looks at all 15. Two pointers looks at one cell per step, and uses that one cell to settle a whole row or a whole column.

We start with left = 0 and right = 5, the two ends of the array. The pairs we haven't settled yet are the ones where both indices sit somewhere in left..right (inclusive). Inside that range, the cell (left, right) is special in two ways:

- It has the **largest** sum in row left. Every other partner for nums[left] is some nums[j] with j in left+1..right-1, and since the array is sorted, each of those is less than or equal to nums[right].
- It has the **smallest** sum in column right. Every other partner for nums[right] is some nums[i] with i in left+1..right-1, and each of those is greater than or equal to nums[left].

This is the fact everything else rests on. A fact that stays true at every step of a loop is called an **invariant**, and this one is what makes each move safe:

1. If nums[left] + nums[right] < target, then the *largest* sum in row left already passes. So every cell in that row passes too. That's right - left pairs (one for each partner j in left+1..right), and we add them all at once. Then we move left forward, because row left is finished.
2. Otherwise the sum is at least target. Now the *smallest* sum in column right already fails, so every cell in that column fails too. We move right backward, because column right is finished.
3. We stop when left == right. At that point there are no pairs left to check.

Both moves follow the same rule: you only drop an index after you've settled every pair it could still form. So a move can never skip a valid pair. The pairs that index would have formed later are exactly the ones you just counted (or ruled out).

Here is the arithmetic on the worked example, one step at a time:

| Step | left | right | nums[left] + nums[right] | < 4? | Action | count |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 5 | -4 + 8 = 4 | no | column 5 fails, right becomes 4 | 0 |
| 2 | 0 | 4 | -4 + 5 = 1 | yes | row 0 passes, add 4 - 0 = 4, left becomes 1 | 4 |
| 3 | 1 | 4 | -1 + 5 = 4 | no | column 4 fails, right becomes 3 | 4 |
| 4 | 1 | 3 | -1 + 3 = 2 | yes | row 1 passes, add 3 - 1 = 2, left becomes 2 | 6 |
| 5 | 2 | 3 | 2 + 3 = 5 | no | column 3 fails, right becomes 2 | 6 |

After step 5, left == right == 2, so the loop ends with count = 6. That matches the brute-force answer. Five comparisons settled all 15 cells.

Look again at step 1, because it's the one people get wrong. The pair (0, 5) sums to exactly 4. That's not less than 4, so we drop index 5. Is that safe? Yes: -4 is the smallest value in play, so pairing 8 with any other element only makes the sum bigger, and bigger than 4 still fails.

The general lesson is about ties. When the sum equals target exactly, it has to go into one of the two branches. Whichever branch you pick, check that its claim still holds for a tie. Here the else-branch only needs "the sum is at least target", and 4 is at least 4, so it works.

You'll meet this idea in three shapes across the problem set:

- **Opposite ends moving inward**, as above. Most of this topic's problems use this one.
- **Two indices moving the same way at different speeds**, like a reader and a writer, or a fast and a slow pointer. This comes back in [Sliding Window](/blogs/dsa-sliding-window/) and [Linked List](/blogs/dsa-linked-list/).
- **One pointer per sequence**, walking two sorted lists side by side. This is how merge works.

The shape differs each time. What stays the same is the rule: before a pointer moves, you need a reason why the index it leaves behind has nothing more to offer.

### Diagram

<figure class="sketch">{% include sketches/dsa-two-pointers/pointer-trace.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-two-pointers/pair-grid.svg %}</figure>

Each `+` step fills in part of a row, and each `×` step fills in part of a column. Put together, they cover the whole triangle of pairs, with no cell missed and no cell counted twice. That picture is the proof that the algorithm is correct. Six cells are green, and six is the answer.

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

Running it prints 6, 0, 0, 6. I also checked it against a brute-force count of every pair, on 2,000 random sorted arrays of length 0 to 9. The two agreed every time.

Complexity, with n = len(nums):

- **O(n) time.** The gap right - left starts at n - 1, and every pass through the loop shrinks it by exactly 1. So the loop runs at most n - 1 times.
- **O(1) extra space.** We only keep three integers.

If the input arrives unsorted and the question only cares about values, you can sort it first. The total then becomes O(n log n) time. One caveat, from memory rather than derived here: Python's list.sort is Timsort, which is O(n log n) in the worst case and can use up to n/2 extra slots of temporary memory. So "O(1) space" is only true of the pointer pass itself, not of the sort.

### Recognition

These are the signals that two pointers is worth trying:

- **The input is sorted.** Or the question asks for values rather than original positions, which means you're free to sort it yourself.
- **You're looking for a pair (or a small group) whose combined value gets compared to a target.** That value might be a sum, a difference, a product or a distance.
- **The relationship is monotone.** Monotone means it only ever moves one way: moving an index in one direction can only push the combined value up, or only push it down. This is what lets one comparison settle a whole row or column.
- **Mirror positions get compared.** First against last, second against second-to-last, and so on.
- **The answer depends on a left boundary and a right boundary**, and you can argue which of the two is holding the answer back.
- **The problem asks for O(1) extra space** or an in-place answer. That rules out the hash-map approach.

Here is where those signals show up in this topic's list. Two Sum II Input Array Is Sorted tells you the input is sorted. 3Sum asks for values, not indices, so you're allowed to sort. Valid Palindrome compares mirror positions. Container With Most Water and Trapping Rain Water both have answers that depend on a left and a right boundary.

When not to use it:

- **The input is unsorted, you need an exact match, and you must return the original indices.** A hash map solves this in O(n) time without sorting, as in [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/). Sorting would lose the original indices, unless you sort (value, index) pairs.
- **The condition isn't monotone**, for example "the sum is divisible by k". Moving a pointer then tells you nothing about the pairs you're skipping. There's no reason to believe they've been settled, and the algorithm quietly misses answers.
- **The question is about a contiguous stretch**, like the longest or shortest subarray with some property. There, both pointers move in the same direction, and the stretch between them is the answer itself. That's [Sliding Window](/blogs/dsa-sliding-window/), Part 6.

How it compares with its neighbours:

- **Binary search** can also find a partner for each element in a sorted array. That costs O(log n) per element, so O(n log n) in total. Two pointers gets down to O(n) by noticing something binary search ignores: as left moves right, the useful partner can only move left. So there's no need to restart the search from scratch each time.
- **A hash set** gets O(n) time without sorting. But it costs O(n) space, and it can only answer exact-match questions, not "less than" or "closest to".

### Pitfalls

- **Forgetting that the input must be sorted.** On the unsorted array [8, -4, 5], the claim "(left, right) has the largest sum in row left" is simply false. With target 2 the function returns 0, even though -4 + 5 = 1 qualifies, and nothing raises an error. If you sort to fix this, remember that the original indices are gone.
- **Writing `left <= right` instead of `left < right`.** With `<=`, the loop also runs when left == right, which pairs an element with itself. In the count above it happens to do no harm: at left == right == 2 the sum is 2 + 2 = 4, the else-branch runs once more, and the count stays 6. But in a "find a pair" problem, the same bug can return an index paired with itself.
- **A branch that doesn't move anything.** Every branch has to move at least one pointer, or the loop never ends. The tie case (sum exactly equal to target) is where this usually goes wrong. Decide which branch a tie belongs to, then check that the branch's claim still holds when the values are exactly equal.
- **Counting by index vs by value.** On [1, 1, 1, 1] with target 3, the count is 6. The values repeat, but the six index pairs are all different. If a problem wants distinct value combinations instead, you have to skip over equal neighbours. That skip loop needs its own bounds check (`while left < right and nums[left] == nums[left - 1]`), or it walks off the end of the array.
- **Empty and single-element inputs.** With [], right starts at -1. With one element, left == right == 0. The `left < right` check handles both, but only because the loop checks its condition before it reads any element.
- **Getting the complexity wrong inside an outer loop.** One two-pointer pass is O(n). If you run a fresh pass for each of n outer choices, the total is O(n^2), not O(n). That can still be a big improvement over O(n^3), but say it correctly.

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

Skipped for this topic. Container With Most Water and Trapping Rain Water each need their own argument for which pointer is safe to move. So you'll practise building that argument from scratch when you solve them.

### Transfer test

Two shops each give you a price list, both sorted ascending: shop A has m items, shop B has n items. You want to buy exactly one item from each shop, and you want the total to be as close as possible to your budget without going over it. Would you use two pointers? Why?

{% capture coach %}
You are my coding-interview coach. I just learned two pointers (on sorted input, compare the pair at the two boundaries and use one comparison to rule out every remaining pair that shares one of the two indices, so each step discards a whole row or column of candidates). Scenario: Two shops each give you a price list, both sorted ascending: shop A has m items, shop B has n items. You want to buy exactly one item from each shop, and you want the total to be as close as possible to your budget without going over it.
Ask me whether I would use two pointers here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

This topic has only one module, so the link between the module and the problems is direct. Still, be clear about what the module gave you and what it didn't.

It gave you a way to think. The candidate pairs form a grid. Two indices mark off the part you haven't settled yet. And each step is a small proof that one row or one column is finished.

It didn't give you that proof for any specific problem. Each problem in this topic's list has its own reason why moving a particular pointer is safe, and finding that reason is the real work of the problem. If you catch yourself moving a pointer because "that's what two pointers does", stop. Write one sentence about the index you're leaving behind: why can it not be part of the answer? If you can't write that sentence, the move isn't justified yet.

The competing approaches for a "find or count pairs" question:

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

Work through these with the solving cycle from [Part 1](/blogs/dsa-the-method/). Give each problem a 15-minute struggle, write down the one key sentence in your own words, then review it with spaced repetition.

While you struggle with a problem from this topic, ask yourself:

- Can a hash map or set give me O(1) lookups?
- Would prefix sums help?
- Can two pointers shrink the search space? What exactly does one comparison let me throw away?

The breakthrough is usually picking the right data structure, or restating the question as a condition on a pair or a window.

{% include dsa-problems.html slug="dsa-two-pointers" %}

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
