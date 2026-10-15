---
layout: post
title: "Backtracking is one loop: choose, explore, un-choose"
date: 2024-02-26 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 11
series_total: 19
links_new_tab: true
tags: [dsa, backtracking, recursion, python, series]
read_time: 40
permalink: /blogs/dsa-backtracking/
excerpt: "Every backtracking problem is a depth-first search over a tree of decisions you never actually build. You keep one list, change it as you go down, and restore it on the way back. Learn the four shapes that tree takes, and the ten problems stop looking like ten different problems."
---

Some problems ask for every valid answer. There are too many to guess, and no formula hands them to you. Backtracking is how you list them all. You build a candidate one decision at a time. The moment a rule breaks, you abandon it. Then you undo your last decision and try the next option, so a single scratch list can serve every branch.

This post comes right after [Trees](/blogs/dsa-trees/) because backtracking *is* tree DFS (depth-first search). The tree is made of decisions, and you never actually build it. It also leads into [Graphs](/blogs/dsa-graphs/) and [1-D DP](/blogs/dsa-1d-dynamic-programming/). Those reuse the same recursion, with a visited set or a memo attached.

There are four modules:

- **Tree Maze** teaches the rhythm of choose, explore, un-choose on a tree that already exists.
- **Subsets**, **Combinations** and **Permutations** are the three shapes a decision tree almost always takes.

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## Tree Maze

### Foundation

You are walking a hedge maze with a ball of string. At every fork you pick a corridor and unspool string behind you. If you hit a wall, you reel the string back to the last fork and try the other corridor. When you reach an exit, the string on the ground *is* the route.

In code, that string is one list, `path`. It grows when you step forward and shrinks when you step back.

Here is the Tree Maze problem. You have a binary tree. Is there a path from the root down to a leaf that never touches a node with value 0? If so, what is it? Think of each 0 as a wall.

### Mechanics

At each node:

1. **Blocked?** If the node is missing or has value 0, report failure. Nothing gets pushed, so there's nothing to undo.
2. **Choose.** Push the node's value onto `path`.
3. **Goal?** If the node is a leaf (no children at all), `path` is a complete, valid route. Report success and leave `path` alone.
4. **Explore.** Try the left subtree, then the right. If either succeeds, report success immediately, still without touching `path`.
5. **Un-choose.** Both subtrees failed, so this node isn't on any valid route. Pop it and report failure.

An **invariant** is a fact that stays true every time the code reaches a certain point. Here it is: **when a call returns, `path` is exactly what it was when the call started, unless the call returned success.**

Check it against the steps. Step 1 pushes nothing. Step 5 pops the one value that step 2 pushed. On success we keep the route on purpose. So a parent call can trust that a failed child left nothing behind in `path`. That's why one shared list can work for the whole search.

Why is it safe to give up on a node the moment it's 0? Every root-to-leaf path through that node contains the 0. So no path in its subtree can be valid. Checking before you recurse throws away that whole subtree in O(1). Cutting off a branch early like this is called **pruning**, and it's the second half of backtracking.

Here is the worked example we'll use for the rest of this module:

<figure class="sketch">{% include sketches/dsa-backtracking/maze-tree.svg %}</figure>

Let's walk it. The root is 4. Its left child is a wall, so the 7 under that wall is never reached.

Next we try the right child, 1. Under 1, the node 3 looks promising. But its only child is 0. And 3 isn't a leaf, because it does have a child. So 3 is a dead end. The search backs out of 3 and finds the leaf 2. The answer is `[4, 1, 2]`.

### Diagram

<figure class="sketch">{% include sketches/dsa-backtracking/maze-trace.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-backtracking/maze-search.svg %}</figure>

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

Checked edge cases:

- A root of 0 gives `False, []`.
- A single node 5 gives `True, [5]`.
- An empty tree gives `False, []`.

Complexity, with n = number of nodes and h = tree height:

- **Time O(n).** Each node is entered at most once, and pruning only lowers that. The example makes 7 calls: 6 of its 7 nodes, plus the missing right child of 3. Node 7 is never entered.
- **Space O(h)**, for the recursion stack plus `path`. (This part is recalled, not derived here: in CPython, list `append` and `pop` from the end are amortized O(1), meaning O(1) on average over many calls.)

### Recognition

- **You need a route**, not just a yes/no or a count. The answer is the sequence of choices that led somewhere.
- **The structure branches, and some branches go bad partway down.** That might be a wall, a cell you already used, or a broken rule.
- **One scratch structure is shared across the whole search.** You change it as you go, so you must restore it on the way back.

When not to use it:

- If you only need a yes/no or a number, and nothing about the route, plain DFS that returns a value is simpler. There's no shared list to look after.
- If you need the *shortest* route in an unweighted structure, use BFS. DFS finds *a* route, not the shortest one.

Word Search shows this "walk a path, undo on failure" signal, on a grid instead of a tree.

### Pitfalls

- **Forgetting the pop.** The True/False result stays right, but the path is garbage. So tests that only check True/False still pass.
- **Popping on success.** Then the caller gets back an empty or cut-short route.
- **Checking the wall after pushing.** Then you have to remember to pop in that branch too. If you check first, there's nothing to undo.
- **Mistaking "has no valid children" for "is a leaf".** Node 3 above is the trap.

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

Skipped. Word Search makes you build this push, explore, undo walk from scratch on a grid. So that problem will give this module its own workout.

### Transfer test

A build system's config files include other config files, which include others, forming a tree. Some files are marked deprecated. You need one include chain from the root config to any file that defines `timeout`, never passing through a deprecated file, and you must print the chain. Would you use this technique? Why?

{% capture coach %}
You are my coding-interview coach. I just learned the Tree Maze backtracking pattern (walk a tree depth-first, push each node onto one shared path, treat blocked nodes as walls that prune their whole subtree, stop and keep the path at a goal, and pop on the way back when nothing below worked). Scenario: A build system's config files include other config files, which include others, forming a tree. Some files are marked deprecated. You need one include chain from the root config to any file that defines timeout, never passing through a deprecated file, and you must print the chain.
Ask me whether I would use the Tree Maze pattern here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Subsets

### Foundation

You're packing for a trip with three items: a, b and c. You go through them in turn, and for each one you make a yes/no decision: bring it or don't. Three yes/no decisions give 2 × 2 × 2 = 8 possible bags. Every possible bag shows up exactly once.

Each of those bags is a **subset**. You get one by making one include/exclude decision per element, in a fixed order.

### Mechanics

The **state** is what the recursion carries from call to call. Here it's `(i, path)`. `i` is the index of the next element to decide on. `path` holds the elements included so far.

1. **Goal.** If `i == len(items)`, every element has been decided. Record a *copy* of `path`.
2. **Include.** Push `items[i]`, recurse on `i + 1`, pop.
3. **Exclude.** Recurse on `i + 1` with `path` untouched.

Why does this produce every subset exactly once? A subset is fully described by its answers to "is element 0 in? Is element 1 in? ...". Each root-to-leaf path in the recursion answers each of those questions exactly once, in order. So each leaf matches one subset, and each subset matches one leaf. That gives us two guarantees:

- **No subset is missed**, because every combination of answers is some path.
- **No subset is repeated**, because two different paths differ in at least one answer.

Why record a copy? `path` is the one shared scratch list. If you append the list itself, every entry in `result` points at the same object. That object ends up empty after the last pop.

The worked example is `"abc"`. The recursion is a full binary tree of depth 3. So it has 8 leaves, and 2^4 − 1 = 15 calls in total.

### Diagram

<figure class="sketch">{% include sketches/dsa-backtracking/subsets-tree.svg %}</figure>

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

Checked edge cases:

- `""` gives `[[]]`: one subset, the empty one.
- `"x"` gives `[['x'], []]`.

Complexity, with n = number of elements:

- **Time O(n · 2^n).** There are 2^n leaves, and each one copies up to n items. The 2^(n+1) − 1 calls themselves add only O(2^n).
- **Space O(n)** for the recursion and `path`. That doesn't count the output, which is itself O(n · 2^n).

There's a second way to write the same tree. Instead of a yes/no per index, each call loops over "which element do I add next, from index `start` onward?" and records a result at *every* node, not just at leaves. That version is the bridge to the next module.

### Recognition

- The wording says "all subsets", "every selection", "each item can be in or out", or "any subsequence (not necessarily contiguous)".
- **n is small, around 20 or less.** 2^20 is about a million. A search that touches every subset is only feasible at that size.
- **The order inside a chosen group doesn't matter.** {a, b} and {b, a} are the same answer.

When not to use it:

- **You only need a count or a best value over subsets, and the values are small integers.** That's usually DP (subset-sum style tables, coming in the DP parts), not listing every subset.
- **The elements must be contiguous** (subarrays). Then you want sliding window or prefix sums, not subsets.

Subsets and Subsets II show the "every selection" signal directly. Subsets II adds duplicate input values, which is exactly the last pitfall below.

### Pitfalls

- **`result.append(path)` instead of a copy.** You get 8 references to one list, and that list ends empty.
- **Forgetting the pop between include and exclude.** The "exclude" branch still contains the element you included, and paths keep growing.
- **Duplicate input values.** The algorithm works on indices, not values. On `"aab"` it returns 8 lists, but only 6 are distinct. That's because choosing the first `a` and choosing the second `a` look identical. The fix is to never try the same value twice at one level of the tree. The Permutations module teaches it.

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

Included. Subsets and Subsets II apply this pattern directly, so they don't make you work it out fresh. That's why this module gets its own exercise.

A device has n feature flags in a row, each on (1) or off (0). Two adjacent flags must never both be on, because they share a power line. List every allowed configuration as a string. For n = 4 there are 8.

Before you write any code, write down four things: the key observation, your approach, why it's correct, and its complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A device has n feature flags in a row, each on (1) or off (0). Two adjacent flags must never both be on, because they share a power line. List every allowed configuration as a string. For n = 4 there are 8: 0000, 0001, 0010, 0100, 0101, 1000, 1001, 1010.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
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

You're choosing 2 people from a team of 4 to go to a conference. {Asha, Ben} is the same pair as {Ben, Asha}. How do you avoid listing a pair twice?

Always write the names in one fixed order, say alphabetical. Then every pair has exactly one standard way to be written. We'll call that its **canonical** spelling. If you only ever generate canonical spellings, you never get a repeat.

That's C(n, k): the subsets of size exactly k. In Subsets, each level of the tree asked "include this element or not?". Here each level asks "which element comes next?", and the answer must be larger than the previous one.

### Mechanics

Take the numbers 1..n and choose k of them. The state is `(start, path)`. `path` holds the chosen numbers in increasing order. `start` is the smallest number the next choice is allowed to be.

1. **Goal.** If `len(path) == k`, record a copy.
2. **Choices.** For each x from `start` upward: push x, recurse with `start = x + 1`, pop.
3. **Prune.** You still need `need = k - len(path)` numbers. They must come from x..n, which holds n − x + 1 numbers. So x is only worth trying if n − x + 1 ≥ need, which means x ≤ n − need + 1.

Why recurse with `x + 1` and not `start + 1`? Because the next number must be larger than the one you just chose, which is x. That keeps every path strictly increasing. And each combination has exactly one strictly increasing spelling, its canonical one. So there are no duplicates, and you never have to check for them afterwards. The ordering rules them out from the start.

Why is the pruning safe? Say x is bigger than n − need + 1. Then there aren't enough numbers left after it to collect `need` of them. So none of that branch's leaves can reach length k, and cutting it removes zero valid answers.

The worked example is n = 4, k = 2. At the root, need = 2, so x runs over 1..3. Choosing 4 first would leave nothing larger to pair it with. The answer is `[1,2] [1,3] [1,4] [2,3] [2,4] [3,4]`, which is C(4,2) = 6.

### Diagram

<figure class="sketch">{% include sketches/dsa-backtracking/combos-tree.svg %}</figure>

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

Checked edge cases:

- `combine(4, 0)` gives `[[]]`. There's one way to choose nothing.
- `combine(4, 4)` gives `[[1, 2, 3, 4]]`.
- `combine(3, 5)` gives `[]`. At the root the upper bound is 3 − 5 + 1 = −1, so the range is empty.

Complexity, with n = pool size and k = pick size:

- **Time O(k · C(n, k)).** Thanks to the pruning, every node lies on the way to at least one leaf. So there are at most (k + 1) · C(n, k) nodes, and each leaf copies k items.
- **Space O(k)**, not counting the output.

The pruning line matters more than it looks. On n = 4, k = 2 it saves just one call (10 versus 11). On n = 10, k = 8 it's 165 calls versus 1,013. Without it, the search wanders into long dead chains that start too late to ever fill 8 slots.

### Recognition

- The wording says "choose k", "groups of size k", or "pairs/teams/committees", and **order doesn't matter**.
- **There's a fixed pool**, and each element is used at most once. Or the problem says elements "may be reused". That changes one argument in the code, as question 2 below shows.
- **Answers must be unique as sets.** So you need a canonical ordering (the `start` index) instead of a step that removes duplicates afterwards.

When not to use it:

- **You want the single best group, and its score is just the sum of individual values.** Then sort and take the top k. That's a greedy approach, with no listing at all.
- **Order matters.** Then it's permutations.

Combination Sum, Combination Sum II and Letter Combinations of a Phone Number all show the "build a group one pick at a time" signal. Watch what each one says about reuse and duplicates.

### Pitfalls

- **`dfs(start + 1)` instead of `dfs(x + 1)`.** The next level restarts just after `start`, not after the chosen x. So it can pick values less than or equal to x. You get `[2,2]`, `[3,2]` and friends: 9 results instead of 6.
- **A missing or wrong pruning bound.** If it's missing, the output is correct but much slower. An off-by-one the other way (using `n - need + 1` as the exclusive end) silently drops valid answers. Test with k = n to catch it.
- **Checking `if len(path) == k` *after* the loop instead of as the base case.** You'd recurse past size k for nothing.

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

Skipped. In Combination Sum an element may be reused, so you have to work out for yourself where the next pick should start. That exercises this module's core rule without any help from here.

### Transfer test

You're picking a 3-person on-call rotation from 50 engineers and want the trio with the highest total "familiarity score", where each engineer has an individual score and the trio's score is just the sum. Would you enumerate combinations? Why?

{% capture coach %}
You are my coding-interview coach. I just learned combinations by backtracking (build a size-k group one pick at a time, each pick larger than the last so every group is generated exactly once, with pruning when too few elements remain). Scenario: You're picking a 3-person on-call rotation from 50 engineers and want the trio with the highest total "familiarity score", where each engineer has an individual score and the trio's score is just the sum.
Ask me whether I would enumerate combinations here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Permutations

### Foundation

You're seating three guests, a, b and c, in three chairs. For chair 1 you can pick any of the three. For chair 2, anyone not yet seated. For chair 3, whoever is left. That's 3 × 2 × 1 = 6 seatings.

In combinations, order didn't matter. Here order is the whole point. So "bac" and "abc" are different answers.

### Mechanics

The state has two parts. `path` is who is seated so far, in order. `used[i]` is True if element i is already in `path`.

1. **Goal.** If `len(path) == len(s)`, record it.
2. **Choices.** Any index i with `used[i]` False. That includes indices *smaller* than ones you already chose.
3. **Choose / explore / un-choose.** Set `used[i] = True` and push `s[i]`. Recurse. Then pop and set `used[i] = False`. You changed two things, so you restore two things.

Why can't we reuse the `start` index from combinations? Because `start` forces increasing order. That's exactly what made {1, 2} and {2, 1} collapse into one answer. Here we *want* both orders, so earlier elements must stay available.

So `used` changes the rule. With `start`, everything to the left of `start` was off-limits. With `used`, only the elements already on the path are off-limits.

Now, duplicate letters. On `"aab"` the plain version returns 6 strings, but only 3 are distinct. Why? Picking the `a` at index 0 or the `a` at index 1 for a chair leads to identical subtrees.

The fix is one rule: **at any single node, never branch on the same value twice.** Keep a small `tried` set inside each call. It has to be local to the call. Sibling branches come from the same node, so they share it. But a value used at one level is perfectly legal again at the next level down.

This "same value, same level, skip it" rule is the general cure for duplicate inputs. It works in all three shapes: include/exclude, start-index and used-array.

The worked example is `"abc"`, which gives `abc, acb, bac, bca, cab, cba`. The tree has 1 + 3 + 6 + 6 = 16 nodes.

### Diagram

<figure class="sketch">{% include sketches/dsa-backtracking/perms-tree.svg %}</figure>

Both pieces of state, `path` and `used`, rewind before the next branch opens.

<figure class="sketch">{% include sketches/dsa-backtracking/perms-state.svg %}</figure>

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

Checked edge cases:

- `""` gives `['']`: one empty arrangement.
- `"z"` gives `['z']`.
- `distinct_permutations` matched a brute-force `set(itertools.permutations(...))` on `"aabb"` (6), `"aaa"`, `"abcd"` and `"mississ"`.

Complexity, with n = length of the input:

- **Time O(n · n!).** There are n! leaves. The number of internal nodes is also O(n!), about e · n! nodes in total. Each node spends O(n) on its loop, and each leaf spends another O(n) on the join.
- **Space O(n)** for `path`, `used` and the recursion, not counting the output.
- **With duplicates, `distinct_permutations` is O(n² · D)**, where D = number of distinct arrangements. Every node it opens leads to at least one new distinct leaf, because a skipped branch would only have produced repeats. So there are at most (n + 1) · D nodes, and each loops over n indices.

### Recognition

- The wording says "all arrangements", "orderings", "sequences using each item once", or "every way to assign items to positions".
- **Order matters, and each element is used exactly once.**
- **n is tiny.** 8! = 40,320 is fine. 10! = 3,628,800 is slow in Python. 12! = 479,001,600 is out.

When not to use it:

- **You only need the *next* arrangement, or the k-th one.** There are direct ways to build those without listing everything. The next arrangement takes O(n).
- **You need the best ordering of more than about 10 items.** Look for a greedy argument (sort by some key) or DP over subsets.

Permutations shows this signal directly. N Queens also asks for every valid arrangement under some rules.

### Pitfalls

- **Restoring `path` but not `used`, or the reverse.** Every piece of state you change in "choose" must be undone in "un-choose".
- **One global `tried` set instead of one per call.** It blocks values at deeper levels, where they're actually legal. On `"aab"` it returns nothing at all.
- **Removing duplicates at the leaves with a set of strings.** That's correct, but you still pay for every duplicate subtree.
- **Checking `ch not in path` instead of a `used` array.** Each check costs O(n), and it gives wrong answers as soon as the input has repeated values.

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

Included. The Permutations problem applies this template directly. Without an exercise here, you'd never use this module's mechanics on a fresh problem.

Given distinct digits, list every ordering in which no two neighbouring digits differ by exactly 1. For `[1, 2, 3, 4]` there are exactly two.

Before you write any code, write down four things: the key observation, your approach, why it's correct, and its complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
Given distinct digits, list every ordering in which no two neighbouring digits differ by exactly 1. For [1, 2, 3, 4] there are exactly two: 2413 and 3142.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
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

Every backtracking solution comes down to the same four decisions. What's the state? What can I choose at a node? When am I done? How do I avoid repeats? The four modules are really just different answers to the second one:

| | State | Choices at a node | Goal | How repeats are avoided |
| --- | --- | --- | --- | --- |
| Tree Maze | path of nodes | the children | reached a leaf | the structure is a tree |
| Subsets | index i, path | include / exclude items[i] | i == n | fixed decision order |
| Combinations | start, path | any x ≥ start | len(path) == k | strictly increasing picks |
| Permutations | used[], path | any unused index | len(path) == n | used[] flags |

Two extras can sit on top of any row:

- **Pruning.** Reject a choice before recursing, when no leaf below it can be valid.
- **Level dedupe.** When the input has duplicates, never branch on the same value twice at one node.

Below is the skeleton to write early, before you know the details. It runs as it is. Between modules, only the `choices` function changes:

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

When you're stuck on a new problem, fill in its table row first. Ask four things:

- What's on the path?
- What can I choose next?
- When am I done?
- What makes a choice illegal *right now*?

The code follows from those answers.

### Distinguishing it from its neighbours

- **Backtracking vs DP.** Backtracking lists or explores every answer. DP computes a single number (a count, a min, a max) in cases where many branches would recompute the same sub-state. If the question asks "how many" or "what's the best", and the state after a choice fits in a few integers, try DP first. If it says "return all", you can't avoid backtracking, because the output alone is exponential in size. The flags mini-task is an example: listing them is backtracking, but counting them is Fibonacci.
- **Backtracking vs BFS.** Want the *shortest* sequence of moves? Use BFS. Want *every* sequence, or any valid one? Use DFS with backtracking.
- **Backtracking vs greedy.** Sometimes a local rule provably never needs undoing, like picking the on-call trio. Then don't search at all. Backtracking is for when a choice might need to be undone.
- **Subsets vs combinations vs permutations.** Does order matter? Then permutations. Is the size fixed? Then combinations. Otherwise, subsets. Is reuse allowed? Then change what `start` becomes in the recursive call. Duplicates in the input? Sort if that helps, and apply the same-level skip.

### Recognition checklist for an unfamiliar problem

1. Does it say "all", "every", "list", "generate", or "return any valid" arrangement or configuration? Then backtracking is likely.
2. Are the constraints small? Think n ≤ ~20 for subsets, ≤ ~10 for orderings, or a small board. That confirms an exponential search is intended.
3. Can you name the decision made at each level? It might be which item, which position, which neighbour or which character. That's your `choices`.
4. Can a partial answer already be invalid? Then prune there, before recursing. Most of the speed comes from this.
5. What state do you change on "choose"? List every piece (path, used flags, board cells, running sums). Restore each one on "un-choose".
6. Can two siblings produce identical subtrees because of duplicate values? Then apply the level dedupe.
7. Estimate the cost as (number of leaves) × (work per leaf). Check it against the limits before you start coding.

## The problems

Work these with the solving cycle from [Part 1](/blogs/dsa-the-method/). That means a 15-minute honest struggle, a one-sentence key insight when you're done, and spaced repetition.

For backtracking, ask three questions during the struggle. What are my choices at each step? What rule makes a partial answer invalid? Where can I prune? Write the `backtrack(state)` skeleton in the first few minutes, even before the details are clear.

{% include dsa-problems.html slug="dsa-backtracking" %}

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
