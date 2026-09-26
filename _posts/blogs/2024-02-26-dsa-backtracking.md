---
layout: post
title: "Backtracking is one loop: choose, explore, un-choose"
date: 2024-02-26 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 11
series_total: 19
tags: [dsa, backtracking, recursion, python, series]
read_time: 37
permalink: /blogs/dsa-backtracking/
excerpt: "Every backtracking problem is a DFS over a tree of decisions that you never build, with one list you keep mutating and restoring. Learn the four shapes that tree takes, and the ten problems stop looking like ten different problems."
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers backtracking: walking a tree of decisions you never build, keeping one scratch list honest by undoing every choice on the way back, and the four shapes that decision tree almost always takes.

Backtracking is how you enumerate every valid answer when there are too many to guess and no shortcut to compute them directly. You build a candidate one decision at a time, walk away from it the moment a constraint fails, and undo your last decision so the same scratch list can be reused for the next branch. In the order this series follows, it sits right after [Trees](/blogs/dsa-trees/) because it *is* tree DFS: the tree is just made of decisions instead of nodes, and it unlocks [Graphs](/blogs/dsa-graphs/) and [1-D DP](/blogs/dsa-1d-dynamic-programming/), which reuse the same recursion with a visited set or a memo attached.

The prerequisites here are Tree Maze, Subsets, Combinations and Permutations. Tree Maze teaches the choose/explore/un-choose rhythm on a tree that already exists. The other three are the three shapes a decision tree almost always takes: "take it or leave it", "pick the next one from what's left to my right", and "pick any unused one".

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Tree Maze

### Foundation

You are walking a hedge maze with a ball of string. At every fork you pick a corridor and unspool string behind you. If you hit a wall, you reel the string back to the last fork and try the other corridor. When you reach an exit, the string on the ground *is* the route.

That string is the whole idea. It's one list, `path`, that grows when you step forward and shrinks when you step back. Tree Maze asks: in a binary tree, is there a root-to-leaf path that never touches a node with value 0, and if so, what is it? A zero is a wall.

### Mechanics

At each node:

1. **Blocked?** If the node is missing or has value 0, report failure. Nothing gets pushed, so there's nothing to undo.
2. **Choose.** Push the node's value onto `path`.
3. **Goal?** If the node is a leaf (no children at all), `path` is a complete, valid route. Report success and leave `path` alone.
4. **Explore.** Try the left subtree, then the right. If either succeeds, report success immediately, still without touching `path`.
5. **Un-choose.** Both subtrees failed, so this node isn't on any valid route. Pop it and report failure.

The invariant: **when a call returns, `path` is exactly what it was when the call started, unless the call returned success.** Step 1 pushes nothing, step 5 pops the one thing step 2 pushed, and on success we deliberately keep the route. Your parent can trust that a failed child left no debris behind, and that's why one shared list works for the whole search.

Why is it safe to give up on a node the moment it's 0? Every root-to-leaf path through that node contains the 0, so no path in its subtree can be valid. Checking before recursing throws away the whole subtree in O(1). That's pruning, and it's the second half of backtracking.

The worked example (used for the rest of this module):

<figure class="sketch">{% include sketches/dsa-backtracking/maze-tree.svg %}<figcaption>The example tree. Red nodes are walls (value 0): one is the root's left child, the other is the only child of 3.</figcaption></figure>

The root's left child is a wall, so the 7 under it is never reached. Under 1, the node 3 looks promising, but its only child is 0 and 3 isn't a leaf (it has a child), so 3 is a dead end. The search backs out of 3 and finds the leaf 2. Answer: `[4, 1, 2]`.

### Diagram

The call order, with what `path` holds after each step (from running the traced version of the code below):

<figure class="sketch">{% include sketches/dsa-backtracking/maze-trace.svg %}<figcaption>Every call in order, indented by depth. The blue cell is the value that step pushed; the amber row is the backtrack (3 popped), the green row the leaf that ends the search.</figcaption></figure>

The same search, drawn on the tree:

<figure class="sketch">{% include sketches/dsa-backtracking/maze-search.svg %}<figcaption>Green: pushed and kept, the route [4, 1, 2]. Amber: pushed, then popped. Red: walls. Grey with a dashed edge: never visited.</figcaption></figure>

### Implementation

```python
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def find_path(node, path):
    """Return True if some root-to-leaf path from node avoids every 0.
    On True, path holds that route; on False, path is unchanged."""
    # Blocked: a missing child or a 0 wall. Nothing was pushed, so nothing to undo.
    # On the example, the call on the root's left child (val 0) returns here,
    # which is why its child 7 is never visited.
    if node is None or node.val == 0:
        return False

    path.append(node.val)                 # choose

    # A leaf has no children at all. Node 3 in the example is NOT a leaf:
    # its left child exists (a 0), so it falls through to the recursion.
    if node.left is None and node.right is None:
        return True                       # keep path: it is the answer

    # `or` short-circuits: if the left subtree succeeds, the right one is never
    # searched and path still ends at that left leaf.
    if find_path(node.left, path) or find_path(node.right, path):
        return True

    path.pop()                            # un-choose: no valid leaf under node
    return False


root = TreeNode(4,
                TreeNode(0, None, TreeNode(7)),
                TreeNode(1, TreeNode(3, TreeNode(0)), TreeNode(2)))
path = []
print(find_path(root, path), path)        # True [4, 1, 2]
```

Checked edge cases: a root of 0 gives `False, []`; a single node 5 gives `True, [5]`; an empty tree gives `False, []`.

Time O(n), n = number of nodes: each node is entered at most once, and pruning only reduces that (the example makes 7 calls: 6 of its 7 nodes plus the missing right child of 3, while 7 is never entered). Space O(h), h = tree height, for the recursion stack plus `path`. (Recalled: list `append` and `pop` from the end are amortized O(1) in CPython.)

### Recognition

- You need a **route**, not just a yes/no or a count: the answer is the sequence of choices that led somewhere.
- The structure branches, and some branches become invalid partway down (a wall, a used cell, a broken rule).
- One mutable scratch structure is shared across the search and must be restored on the way back.

When not to use it: if you only need a yes/no or a number and nothing about the route, plain DFS returning a value is simpler, with no shared list to maintain. If you need the *shortest* route in an unweighted structure, use BFS, since DFS finds *a* route, not the shortest. Word Search shows this "walk a path, undo on failure" signal on a grid instead of a tree.

### Pitfalls

- Forgetting the pop. The boolean stays right but the path is garbage, so tests that only check True/False pass.
- Popping on success. Then the caller receives an empty or truncated route.
- Checking the wall after pushing. Then you have to remember to pop in that branch too; check first and there is nothing to undo.
- Mistaking "has no valid children" for "is a leaf". Node 3 above is the trap.

### Active Recall

1. Delete the `path.pop()` line. What does the example return?
2. Why does the search never visit 7, and why is that safe?
3. Take the tree `4` with left child `0` (a leaf) and right child `3`, where 3's only child is a right child `0`. What does `find_path` return?
4. State the invariant that lets a single `path` list serve every branch.

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied the Tree Maze pattern (backtracking on an existing binary tree) in Python: find a root-to-leaf path that never touches a node with value 0. At each node: if it is None or 0, return False without pushing anything; otherwise push its value onto one shared path list; if it is a leaf (no children at all) return True and keep path; otherwise try left, then right, returning True if either succeeds; if both fail, pop the value and return False. Invariant: when a call returns failure, path is exactly what it was when the call started. Checking the 0 before recursing prunes the whole subtree in O(1).
Worked example from the lesson: root 4; its left child is 0 (with a right child 7); its right child is 1, whose children are 3 (left) and 2 (right); 3 has a single left child 0. The search pushes 4, is blocked at the left 0 (7 is never visited), pushes 1, pushes 3, is blocked at 3's child 0, sees 3's missing right child, pops 3, pushes 2, and 2 is a leaf, so it returns True with path = [4, 1, 2]. Time O(n), space O(h).
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Delete the path.pop() line. What does the example return?
2. Why does the search never visit 7, and why is that safe?
3. Take the tree 4 with left child 0 (a leaf) and right child 3, where 3's only child is a right child 0. What does find_path return?
4. State the invariant that lets a single path list serve every branch.
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: Word Search needs this push, explore, undo walk derived from scratch on a grid, so that problem will exercise this module on its own.

### Transfer test

A build system's config files include other config files, which include others, forming a tree. Some files are marked deprecated. You need one include chain from the root config to any file that defines `timeout`, never passing through a deprecated file, and you must print the chain. Would you use this technique? Why?

{% capture coach %}
You are my coding-interview coach. I just learned the Tree Maze backtracking pattern (walk a tree depth-first, push each node onto one shared path, treat blocked nodes as walls that prune their whole subtree, stop and keep the path at a goal, and pop on the way back when nothing below worked). Scenario: A build system's config files include other config files, which include others, forming a tree. Some files are marked deprecated. You need one include chain from the root config to any file that defines timeout, never passing through a deprecated file, and you must print the chain.
Ask me whether I would use the Tree Maze pattern here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Subsets

### Foundation

Packing for a trip with three items: a, b, c. For each item in turn you make a yes/no decision: bring it or don't. Three binary decisions give 2 × 2 × 2 = 8 possible bags, and every possible bag appears exactly once. That's a subset: one include/exclude decision per element, made in a fixed order.

### Mechanics

The state is `(i, path)`: `i` is the index of the next element to decide on, and `path` holds the elements included so far.

1. **Goal.** If `i == len(items)`, every element has been decided. Record a *copy* of `path`.
2. **Include.** Push `items[i]`, recurse on `i + 1`, pop.
3. **Exclude.** Recurse on `i + 1` with `path` untouched.

Why does this produce every subset exactly once? A subset is fully described by its answers to "is element 0 in? element 1? ...". Each root-to-leaf path in the recursion answers each of those questions exactly once, in order, so leaves and subsets are in one-to-one correspondence. No subset is missed (every combination of answers is some path) and none is repeated (two different paths differ in at least one answer).

Why copy? `path` is the one shared scratch list. If you append the list itself, every entry in `result` points at the same object, which ends empty after the last pop.

The worked example is `"abc"`. There are 8 leaves, and 2^4 − 1 = 15 calls in total, because it's a full binary tree of depth 3.

### Diagram

Left edge = include, right edge = exclude. Leaves left to right are the output order.

<figure class="sketch">{% include sketches/dsa-backtracking/subsets-tree.svg %}<figcaption>The include/exclude tree for "abc". Each node shows path; a violet +x edge includes x, a grey −x edge skips it. The eight green leaves are the recorded subsets, in output order.</figcaption></figure>

### Implementation

```python
def all_subsets(items):
    result, path = [], []

    def dfs(i):
        # Goal: indices 0..len(items)-1 have all been decided.
        # For "abc" this fires at i == 3, eight times in total (2**3 leaves).
        if i == len(items):
            result.append(path[:])      # copy: path keeps changing after this line
            return

        path.append(items[i])           # include items[i]
        dfs(i + 1)
        path.pop()                      # undo, so path is back to its state on entry

        dfs(i + 1)                      # exclude items[i]: path already lacks it

    dfs(0)
    return result


print(all_subsets("abc"))
# [['a', 'b', 'c'], ['a', 'b'], ['a', 'c'], ['a'], ['b', 'c'], ['b'], ['c'], []]
```

Checked edge cases: `""` gives `[[]]` (one subset, the empty one), `"x"` gives `[['x'], []]`.

Time O(n · 2^n), n = number of elements: 2^n leaves, each copying up to n items (the 2^(n+1) − 1 calls add only O(2^n)). Space O(n) for the recursion and `path`, not counting the output, which is itself O(n · 2^n).

There's a second way to write the same tree: instead of a yes/no per index, loop "which element do I add next, from index `start` onward" and record at *every* node. That formulation is the bridge to the next module.

### Recognition

- "All subsets", "every selection", "each item can be in or out", "any subsequence (not necessarily contiguous)".
- n is small, around 20 or less. 2^20 is about a million, so a search that touches every subset is feasible only there.
- The order inside a chosen group doesn't matter: {a, b} and {b, a} are the same answer.

When not to use it: when you only need a count or a best value over subsets and the values are small integers, that's usually DP (subset-sum style tables, coming in the DP parts), not enumeration. When the elements are contiguous (subarrays), you want sliding window or prefix sums, not subsets. Subsets and Subsets II show the "every selection" signal directly. Subsets II adds duplicate input values, which is exactly the pitfall below.

### Pitfalls

- `result.append(path)` instead of a copy: 8 references to one list that ends empty.
- Forgetting the pop between include and exclude: the "exclude" branch still contains the included element, and paths keep growing.
- Duplicate input values: the algorithm is index-based, not value-based. On `"aab"` it returns 8 lists, but only 6 are distinct, because choosing the first `a` and choosing the second `a` look identical. The fix of never trying the same value twice at one level is taught in the Permutations module.

### Active Recall

1. How many calls does `dfs` make on `"abc"`, and where does the number come from?
2. Replace `result.append(path[:])` with `result.append(path)`. What prints for `"abc"`?
3. Swap the order so the exclude call runs before the include block. Does the set of results change? The order?
4. On `"aab"`, why does the include/exclude tree produce duplicate subsets even though every root-to-leaf path is different?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied subsets by include/exclude recursion in Python: the state is (i, path), where i is the next index to decide and path holds the elements included so far. If i == len(items), record a copy of path; otherwise push items[i], recurse on i + 1, pop, then recurse on i + 1 again without it. Each root-to-leaf path answers "is element j in?" once for every j, so leaves and subsets correspond one to one. The copy matters because path is one shared scratch list.
Worked example from the lesson: all_subsets("abc") returns [a,b,c], [a,b], [a,c], [a], [b,c], [b], [c], [] in that order, from a full binary tree of depth 3 with 8 leaves. Time O(n * 2^n), space O(n) excluding the output.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. How many calls does dfs make on "abc", and where does the number come from?
2. Replace result.append(path[:]) with result.append(path). What prints for "abc"?
3. Swap the order so the exclude call runs before the include block. Does the set of results change? The order?
4. On "aab", why does the include/exclude tree produce duplicate subsets even though every root-to-leaf path is different?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Included. Subsets and Subsets II are direct applications of this pattern rather than a fresh derivation, so this module needs its own exercise.

A device has n feature flags in a row, each on (1) or off (0). Two adjacent flags must never both be on, because they share a power line. List every allowed configuration as a string. For n = 4 there are 8.

Before any code, write down the observation, the approach, why it's correct, and the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A device has n feature flags in a row, each on (1) or off (0). Two adjacent flags must never both be on, because they share a power line. List every allowed configuration as a string. For n = 4 there are 8: 0000, 0001, 0010, 0100, 0101, 1000, 1001, 1010.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

You have 18 lab tests with known costs and a patient budget. You need to report whether *some* selection of tests costs exactly the budget. The costs are arbitrary decimals like 412.37. Would you use subset enumeration? Why?

{% capture coach %}
You are my coding-interview coach. I just learned subset enumeration by backtracking (one include/exclude decision per element in a fixed order, 2^n leaves, feasible for n up to about 20, with pruning when a partial selection already breaks a constraint). Scenario: You have 18 lab tests with known costs and a patient budget. You need to report whether some selection of tests costs exactly the budget. The costs are arbitrary decimals like 412.37.
Ask me whether I would use subset enumeration here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Combinations

### Foundation

Choosing 2 people from a team of 4 to go to a conference. {Asha, Ben} is the same pair as {Ben, Asha}. The trick to never listing a pair twice is to always write names in one fixed order, alphabetical say. Then every pair has exactly one "canonical" spelling, and you only generate canonical spellings.

That's C(n, k): the subsets of size exactly k. Instead of a yes/no per element, each level of the tree answers "which element comes next?", and the answer must be larger than the previous one.

### Mechanics

Numbers 1..n, choose k. The state is `(start, path)`: `path` holds the chosen numbers in increasing order, and `start` is the smallest number the next choice may be.

1. **Goal.** If `len(path) == k`, record a copy.
2. **Choices.** For each x from `start` upward: push x, recurse with `start = x + 1`, pop.
3. **Prune.** You still need `need = k - len(path)` numbers, and they must come from x..n, which has n − x + 1 numbers. So x is only worth trying if n − x + 1 ≥ need, meaning x ≤ n − need + 1.

Why `x + 1` and not `start + 1`? The next number must be larger than the one just chosen, x, so every path is strictly increasing, and each combination has exactly one increasing spelling. That's the "no duplicates" guarantee, and it's derived from the ordering, not checked afterwards.

Why is the pruning safe? A branch whose x exceeds n − need + 1 can't collect `need` numbers from what remains, so none of its leaves reach length k. Cutting it removes zero valid answers.

The worked example is n = 4, k = 2. At the root need = 2, so x runs over 1..3. Choosing 4 first would leave nothing larger to pair it with. The answer is `[1,2] [1,3] [1,4] [2,3] [2,4] [3,4]`, which is C(4,2) = 6.

### Diagram

<figure class="sketch">{% include sketches/dsa-backtracking/combos-tree.svg %}<figcaption>n = 4, k = 2. Each node shows path, with its start and the range of x it tries beside it; violet edge labels are the x chosen. The red dashed branch (4 first) is pruned, and the six green leaves are the answers.</figcaption></figure>

### Implementation

```python
def combine(n, k):
    result, path = [], []

    def dfs(start):
        if len(path) == k:
            result.append(path[:])
            return

        need = k - len(path)
        # x needs need-1 more numbers from x+1..n after it, so x can go up to
        # n - need + 1 inclusive. For n=4, k=2 at the root: need=2, so x is in 1..3.
        # For path=[3]: need=1, so x is in 4..4.
        for x in range(start, n - need + 2):
            path.append(x)
            dfs(x + 1)       # next pick must exceed x: keeps path strictly increasing
            path.pop()

    dfs(1)
    return result


print(combine(4, 2))
# [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
```

Checked edge cases: `combine(4, 0)` gives `[[]]` (one way to choose nothing); `combine(4, 4)` gives `[[1, 2, 3, 4]]`; `combine(3, 5)` gives `[]`, because at the root the upper bound 3 − 5 + 1 = −1 makes the range empty.

Time O(k · C(n, k)), with n = pool size and k = pick size. With the pruning every node lies on the way to at least one leaf, so there are at most (k + 1) · C(n, k) nodes, and each leaf copies k items. Space O(k) excluding output.

The pruning line matters more than it looks. On n = 4, k = 2 it saves one call (10 versus 11). On n = 10, k = 8 it's 165 calls versus 1,013, because without it the search wanders into long dead chains that start too late to fill 8 slots.

### Recognition

- "Choose k", "groups of size k", "pairs/teams/committees", and **order doesn't matter**.
- A fixed pool, and each element used at most once, or explicitly "may be reused". The latter changes one argument, as in question 2 below.
- Answers must be unique as sets, so you need a canonical ordering (the `start` index) instead of a dedupe step.

When not to use it: if you want the single best group and the score is a simple sum of individual values, sort and take the top k (greedy), with no enumeration at all. If order matters, it's permutations. Combination Sum, Combination Sum II and Letter Combinations of a Phone Number all show the "build a group one pick at a time" signal. Watch what each says about reuse and duplicates.

### Pitfalls

- `dfs(start + 1)` instead of `dfs(x + 1)`: the next level restarts just after `start`, not after the chosen x, so it can pick values less than or equal to x. You get `[2,2]`, `[3,2]` and friends, 9 results instead of 6.
- Missing or wrong pruning bound: correct output, much slower. An off-by-one in the other direction (`n - need + 1` as the exclusive end) silently drops valid answers, so test with k = n.
- Using `if len(path) == k` *after* the loop instead of as the base case: you'd recurse past size k for nothing.

### Active Recall

1. At the root of n = 4, k = 2, why is x = 4 never tried, and what exactly would the pruned branch have done?
2. Change `dfs(x + 1)` to `dfs(x)`. What comes out for n = 4, k = 2, and what does that version enumerate in general?
3. How would you turn `combine` into "all subsets of 1..n" with the same loop shape?
4. Why does pruning matter much more for n = 10, k = 8 than for n = 4, k = 2?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied combinations (choose k of 1..n) by backtracking in Python: the state is (start, path), with path strictly increasing and start the smallest number the next pick may be. If len(path) == k, record a copy; otherwise, with need = k - len(path), loop x over start..n - need + 1, push x, recurse with start = x + 1, pop. Recursing on x + 1 keeps every path strictly increasing, so each combination has exactly one spelling and no dedupe is needed. The upper bound prunes branches that cannot collect enough numbers.
Worked example from the lesson: n = 4, k = 2. At the root need = 2, so x runs over 1..3 (4 first is pruned). The answer is [1,2] [1,3] [1,4] [2,3] [2,4] [3,4], which is C(4,2) = 6, in 10 calls. On n = 10, k = 8 the search makes 165 calls with pruning. Time O(k * C(n, k)), space O(k) excluding output.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At the root of n = 4, k = 2, why is x = 4 never tried, and what exactly would the pruned branch have done?
2. Change dfs(x + 1) to dfs(x). What comes out for n = 4, k = 2, and what does that version enumerate in general?
3. How would you turn combine into "all subsets of 1..n" with the same loop shape?
4. Why does pruning matter much more for n = 10, k = 8 than for n = 4, k = 2?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: Combination Sum has to work out, on its own, what the next pick's starting index should be when an element may be reused, which exercises this module's core rule without help from here.

### Transfer test

You're picking a 3-person on-call rotation from 50 engineers and want the trio with the highest total "familiarity score", where each engineer has an individual score and the trio's score is just the sum. Would you enumerate combinations? Why?

{% capture coach %}
You are my coding-interview coach. I just learned combinations by backtracking (build a size-k group one pick at a time, each pick larger than the last so every group is generated exactly once, with pruning when too few elements remain). Scenario: You're picking a 3-person on-call rotation from 50 engineers and want the trio with the highest total "familiarity score", where each engineer has an individual score and the trio's score is just the sum.
Ask me whether I would enumerate combinations here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Permutations

### Foundation

Seating three guests, a, b and c, in three chairs. For chair 1 you can pick any of the three. For chair 2, anyone not yet seated. For chair 3, whoever is left. 3 × 2 × 1 = 6 seatings. Unlike combinations, order is the whole point, so "bac" and "abc" are different answers.

### Mechanics

The state is `path` (who is seated, in order) plus `used[i]`, which is True if element i is already in `path`.

1. **Goal.** If `len(path) == len(s)`, record it.
2. **Choices.** Every index i with `used[i]` False, in any position, including indices *smaller* than ones already chosen.
3. **Choose / explore / un-choose.** Set `used[i] = True` and push `s[i]`, recurse, then pop and set `used[i] = False`. Two things are modified, so two things are restored.

Why can't we reuse the combinations `start` index? `start` forces increasing order, which is exactly what made {1, 2} and {2, 1} collapse into one answer. Here we *want* both orders, so earlier elements must stay available. `used` replaces "everything left of `start` is off-limits" with "exactly the elements already on the path are off-limits".

Duplicate letters. On `"aab"` the plain version returns 6 strings but only 3 are distinct, because picking the `a` at index 0 or the `a` at index 1 for a chair leads to identical subtrees. The rule: **at any single node, never branch on the same value twice.** Keep a small `tried` set local to each call. It has to be local: siblings share a node, but a value used at one level is perfectly legal again at the next.

This "same value, same level, skip it" rule is the general cure for duplicate inputs in all three shapes: include/exclude, start-index and used-array.

The worked example is `"abc"`, which gives `abc, acb, bac, bca, cab, cba`. The tree has 1 + 3 + 6 + 6 = 16 nodes.

### Diagram

<figure class="sketch">{% include sketches/dsa-backtracking/perms-tree.svg %}<figcaption>The permutation tree for "abc": 16 nodes. Each node shows path; the violet edge label is the letter placed next, always one not yet used. The six green leaves are the answers.</figcaption></figure>

Here's the state going from the first answer to the second. Both pieces of state rewind before the next branch opens.

<figure class="sketch">{% include sketches/dsa-backtracking/perms-state.svg %}<figcaption>path and used between recording "abc" and recording "acb". Blue flags are True, grey are False, amber is the flag that step just flipped; green rows record an answer.</figcaption></figure>

### Implementation

```python
def permutations(s):
    result, path = [], []
    used = [False] * len(s)          # used[i] is True while s[i] is in path

    def dfs():
        if len(path) == len(s):
            result.append("".join(path))
            return

        for i in range(len(s)):      # all indices 0..len(s)-1, not just those after the last pick
            if used[i]:
                continue
            used[i] = True           # choose (two pieces of state)
            path.append(s[i])
            dfs()
            path.pop()               # un-choose both, in reverse order
            used[i] = False

    dfs()
    return result


def distinct_permutations(s):
    result, path = [], []
    used = [False] * len(s)

    def dfs():
        if len(path) == len(s):
            result.append("".join(path))
            return

        tried = set()                # values already branched on AT THIS NODE only
        for i in range(len(s)):
            # For "aab" at the root: i=0 tries 'a'; i=1 is also 'a', so its subtree
            # would be identical and is skipped; i=2 tries 'b'.
            if used[i] or s[i] in tried:
                continue
            tried.add(s[i])
            used[i] = True
            path.append(s[i])
            dfs()
            path.pop()
            used[i] = False

    dfs()
    return result


print(permutations("abc"))            # ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']
print(permutations("aab"))            # ['aab', 'aba', 'aab', 'aba', 'baa', 'baa']
print(distinct_permutations("aab"))   # ['aab', 'aba', 'baa']
```

Checked edge cases: `""` gives `['']` (one empty arrangement), `"z"` gives `['z']`. `distinct_permutations` matched a brute-force `set(itertools.permutations(...))` on `"aabb"` (6), `"aaa"`, `"abcd"` and `"mississ"`.

Time O(n · n!), n = length of the input. There are n! leaves, the internal node count is also O(n!) (about e · n! in total), and each node spends O(n) on its loop, plus O(n) per leaf to join. Space O(n) for `path`, `used` and the recursion, excluding output. With duplicates, `distinct_permutations` is O(n² · D), D = number of distinct arrangements: every node it opens leads to at least one new distinct leaf (a skipped branch would only have produced repeats), so there are at most (n + 1) · D nodes, each looping over n indices.

### Recognition

- "All arrangements", "orderings", "sequences using each item once", "every way to assign items to positions".
- Order matters, and each element is used exactly once.
- n is tiny: 8! = 40,320 is fine, 10! = 3,628,800 is slow in Python, and 12! = 479,001,600 is out.

When not to use it: if you only need the *next* arrangement, or the k-th one, there are direct constructions that skip enumeration (the next arrangement takes O(n)). If you need an optimal ordering of more than about 10 items, look for a greedy argument (sort by some key) or DP over subsets. Permutations shows this signal directly, and N Queens also asks for every valid arrangement under constraints.

### Pitfalls

- Restoring `path` but not `used` (or the reverse). Every piece of state you change in "choose" must be undone in "un-choose".
- A global `tried` set instead of one per call: it blocks values at deeper levels where they're legal. On `"aab"` it returns nothing at all.
- Deduplicating at the leaves with a set of strings: correct, but it still pays for every duplicate subtree.
- Checking `ch not in path` instead of a `used` array: O(n) per check, and wrong as soon as the input has repeated values.

### Active Recall

1. Delete the line `used[i] = False`. What does `permutations("abc")` return?
2. Why does combinations need only a `start` integer while permutations needs a whole `used` array?
3. Move `tried = set()` outside `dfs` so it's shared by all calls. What happens on `"aab"`, and why?
4. How many nodes does the tree for `"abc"` have, and how does that compare with the number of answers?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied permutations by backtracking in Python: the state is path plus a used array, where used[i] is True while s[i] is on the path. If len(path) == len(s), record it; otherwise loop over every index i with used[i] False (including indices smaller than earlier picks), set used[i] = True and push s[i], recurse, then pop and set used[i] = False. Two pieces of state change, so two are restored. For duplicate letters, keep a tried set local to each call and never branch on the same value twice at one node.
Worked example from the lesson: permutations("abc") returns abc, acb, bac, bca, cab, cba. Between the first and second answers: record abc; pop c and clear used[2]; the depth-2 loop ends; pop b and clear used[1]; the depth-1 loop moves to i=2; push c, set used[2]; push b, set used[1]; record acb. On "aab" the plain version returns 6 strings (3 distinct) and the tried-set version returns aab, aba, baa. Time O(n * n!), space O(n) excluding output.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Delete the line used[i] = False. What does permutations("abc") return?
2. Why does combinations need only a start integer while permutations needs a whole used array?
3. Move tried = set() outside dfs so it's shared by all calls. What happens on "aab", and why?
4. How many nodes does the tree for "abc" have, and how does that compare with the number of answers?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Included. Permutations applies this template directly, so this module's mechanics would otherwise not be exercised on a fresh problem.

Given distinct digits, list every ordering in which no two neighbouring digits differ by exactly 1. For `[1, 2, 3, 4]` there are exactly two.

Before any code, write down the observation, the approach, why it's correct, and the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
Given distinct digits, list every ordering in which no two neighbouring digits differ by exactly 1. For [1, 2, 3, 4] there are exactly two: 2413 and 3142.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

A delivery driver must visit 12 addresses in whatever order minimises total distance, and you have the full distance table. Would you enumerate permutations? Why?

{% capture coach %}
You are my coding-interview coach. I just learned permutations by backtracking (build an ordering one position at a time from the unused elements, tracked with a used array, restoring both path and used on the way back; n! leaves, so only feasible for tiny n). Scenario: A delivery driver must visit 12 addresses in whatever order minimises total distance, and you have the full distance table.
Ask me whether I would enumerate permutations here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

### How the four modules make one technique

Every backtracking solution is the same four decisions, and the modules are just different answers to the second one:

| | State | Choices at a node | Goal | How repeats are avoided |
| --- | --- | --- | --- | --- |
| Tree Maze | path of nodes | the children | reached a leaf | the structure is a tree |
| Subsets | index i, path | include / exclude items[i] | i == n | fixed decision order |
| Combinations | start, path | any x ≥ start | len(path) == k | strictly increasing picks |
| Permutations | used[], path | any unused index | len(path) == n | used[] flags |

And on top of each: **pruning** (reject a choice before recursing when no leaf below it can be valid) and **level dedupe** (never branch on the same value twice at one node when the input has duplicates).

This is the skeleton to write early, before you know the details. It runs as-is. Only the `choices` function changes between modules:

```python
def backtrack(path, choices, is_complete, out):
    if is_complete(path):
        out.append(path[:])           # copy: path is shared scratch space
        return
    for c in choices(path):           # pruning lives inside choices()
        path.append(c)                # choose
        backtrack(path, choices, is_complete, out)
        path.pop()                    # un-choose


out = []   # combinations C(4, 2): next pick must exceed path[-1]
backtrack([], lambda p: range(p[-1] + 1 if p else 1, 5), lambda p: len(p) == 2, out)
print(out)   # [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]

out = []   # permutations of "abc": any letter not yet used (valid only for distinct letters)
backtrack([], lambda p: [ch for ch in "abc" if ch not in p], lambda p: len(p) == 3, out)
print(["".join(p) for p in out])   # ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']
```

When you're stuck on a new problem, fill in the table row first: what's on the path, what can I choose next, when am I done, and what makes a choice illegal *right now*. The code follows from that.

### Distinguishing it from its neighbours

- **Backtracking vs DP.** Backtracking lists or explores every answer. DP computes a number (a count, a min, a max) when many branches recompute the same sub-state. If the question is "how many" or "what's the best" and the state after a choice can be described by a few integers, try DP first. If it says "return all", backtracking is unavoidable, because the output alone is exponential. The flags mini-task is the example: listing them is backtracking, counting them is Fibonacci.
- **Backtracking vs BFS.** Want the *shortest* sequence of moves? BFS. Want *every* sequence, or any valid one? DFS with backtracking.
- **Backtracking vs greedy.** If a local rule provably never needs undoing (the on-call trio), don't search. Backtracking is what you do when a choice might need to be undone.
- **Subsets vs combinations vs permutations.** Does order matter? Then permutations. Is the size fixed? Then combinations. Otherwise subsets. Is reuse allowed? Then change what the recursive call's start becomes. Duplicates in the input? Sort if it helps and apply the same-level skip.

### Recognition checklist for an unfamiliar problem

1. Does it say "all", "every", "list", "generate", or "return any valid" arrangement or configuration? Backtracking is likely.
2. Are the constraints small (n ≤ ~20 for subsets, ≤ ~10 for orderings, or a small board)? That confirms an exponential search is intended.
3. Can you name the decision made at each level (which item, which position, which neighbour, which character)? That's your `choices`.
4. Can a partial answer already be invalid? Then prune there, before recursing. That's where most of the speed comes from.
5. What state do you modify on "choose"? List every piece (path, used flags, board cells, running sums) and restore each one on "un-choose".
6. Can two siblings produce identical subtrees because of duplicate values? Then apply the level dedupe.
7. Estimate the cost as (number of leaves) × (work per leaf) and check it against the limits before coding.

## The problems

Work these with the solving cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute honest struggle, a one-sentence key insight when you're done, and spaced repetition. For backtracking, during the struggle ask: what are my choices at each step, what constraint makes a partial answer invalid, and where can I prune? Write the `backtrack(state)` skeleton in the first few minutes, even before the details are clear.

| # | Problem |
| --- | --- |
| 1 | [Subsets](https://leetcode.com/problems/subsets/) |
| 2 | [Combination Sum](https://leetcode.com/problems/combination-sum/) |
| 3 | [Combination Sum II](https://leetcode.com/problems/combination-sum-ii/) |
| 4 | [Permutations](https://leetcode.com/problems/permutations/) |
| 5 | [Subsets II](https://leetcode.com/problems/subsets-ii/) |
| 6 | [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) |
| 7 | [Word Search](https://leetcode.com/problems/word-search/) |
| 8 | [Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/) |
| 9 | [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) |
| 10 | [N Queens](https://leetcode.com/problems/n-queens/) |

## Take this lesson as a live session

To go through this lesson interactively, with the coach stopping to wait for your answers, open the full prompt in a chat.

{% capture coach %}
[TOPIC]: Backtracking
[PREREQUISITES]: Tree Maze, Subsets, Combinations, Permutations
[PROBLEM LIST]: Subsets, Combination Sum, Combination Sum II, Permutations, Subsets II, Generate Parentheses, Word Search, Palindrome Partitioning, Letter Combinations of a Phone Number, N Queens
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
