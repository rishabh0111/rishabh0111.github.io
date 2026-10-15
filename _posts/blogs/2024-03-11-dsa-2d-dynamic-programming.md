---
layout: post
title: "Every 2-D DP table is a question with two blanks in it"
date: 2024-03-11 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, dynamic-programming, knapsack, python, series]
read_time: 57
permalink: /blogs/dsa-2d-dynamic-programming/
excerpt: "Climbing stairs needed one index. Grids, budgets, two strings and ranges each need a second one. The hard part is spotting which second index the problem is hiding, and working out what order to fill the table in."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 17
series_total: 19
links_new_tab: true
---

In most hard DP problems, you need two numbers to name a subproblem. That might be a row and a column, an item and a budget, a position in each of two strings, or the two ends of a range. The second number changes three things: what the state means, the order you fill the table in, and how you shrink memory back down to one row.

This post builds on [Part 15](/blogs/dsa-1d-dynamic-programming/) and [Graphs](/blogs/dsa-graphs/). (A DP table is a DAG, a graph with no cycles, filled in topological order.) Together with [Bit Manipulation](/blogs/dsa-bit-manipulation/), it leads into [Math & Geometry](/blogs/dsa-math-and-geometry/). Interval DP gets its own module at the end.

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## 2-Dimension DP

### Foundation

Think of a spreadsheet where each cell's formula only uses the cell above it and the cell to its left. If you fill it top to bottom, left to right, every formula finds its inputs already worked out. A 2-D DP is that spreadsheet. The only difference is that you write the formula yourself.

In DP terms, `dp[r][c]` is the original question asked about a smaller piece of the input. That piece takes two numbers to describe, which is why the table has two indices. The **recurrence** is the formula: it says which other cells a cell reads. The **fill order** can be any order that computes those cells first.

Here is the worked example for this module. You want the cheapest path through a grid, from the top-left corner to the bottom-right. You may only move right or down. Cells marked `#` are walls, and you can't enter them. A path's cost is the sum of the cells it visits, including the first and last cell.

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/grid-input.svg %}</figure>

### Mechanics

1. **State.** `dp[r][c]` is the cheapest cost of a path that starts at (0, 0) and ends on (r, c). If no path can reach (r, c), it is infinity. Why do we need two indices? Because "the cheapest way to reach column 2" means nothing until you say which row.
2. **Last move.** You can only move right or down. So the path into (r, c) arrived either from (r-1, c) above or from (r, c-1) on the left. There's no third option. That gives `dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])`.
3. **Why taking the min of the two neighbours is safe.** Take a cheapest path to (r, c) and chop off its last cell. What's left is a path to one of the two neighbours. Suppose that leftover were not the cheapest path to that neighbour. Then you could swap in the cheaper one and get a cheaper path to (r, c). That contradicts "cheapest". This is the **optimal-substructure** argument from Part 15 (a best answer is built from best answers to smaller pieces), now with two predecessors instead of one.
4. **Base cases.** `dp[0][0] = grid[0][0]`. Row 0 has nothing above it, and column 0 has nothing to its left. A missing neighbour must count as infinity, not 0. A 0 would claim there's a free path coming in from outside the grid. Walls also stay at infinity. Infinity plus any number is still infinity, so a wall only blocks the paths that actually go through it.
5. **Fill order.** Row by row, left to right. When you reach (r, c), cell (r-1, c) was finished during the previous row, and (r, c-1) was finished a moment ago in this row. Column by column also works, and so does one anti-diagonal at a time. Any order that finishes both predecessors first is valid.
6. **Answer.** `dp[3][3]`.

Let's compute two cells by hand:

- `dp[2][2] = 1 + min(dp[1][2], dp[2][1]) = 1 + min(10, 8) = 9`.
- `dp[3][3] = 1 + min(dp[2][3], dp[3][2]) = 1 + min(inf, 10) = 11`.

The winning path is down, down, right, right, down, right. Its cost is 1 + 1 + 4 + 2 + 1 + 1 + 1 = 11. For comparison, the route along the top costs 1 + 3 + 1 + 5 + 1 + 1 + 1 = 13.

**Space.** Each row only reads the row above it, so you can keep a single row. Look at the moment just before you overwrite `row[c]`:

- `row[c]` still holds `dp[r-1][c]`, the "above" value, because you haven't touched it yet in this row.
- `row[c-1]` was already overwritten, so it holds `dp[r][c-1]`, the "left" value.

So one array gives you both neighbours, with O(columns) memory.

### The second index does not have to be a grid: state-machine DP

Sometimes one index is time (day `i`), and the second is a small **mode**: a label for the situation you're in, such as holding or not holding, or resting versus partway through a streak. The state is `dp[i][mode]`, and the recurrence is just a list of which mode is allowed to follow which.

Here's an example. `points = [3, 2, 5, 10, 7]`. On day `i` you either run and earn `points[i]`, or rest and earn nothing. You may never run three days in a row. Maximize the total.

Why doesn't a single `dp[i]` work? Because "the best total through day i" doesn't tell you whether you're allowed to run tomorrow. Take `[1, 1, 10]`:

- The best total through day 1 is 2 (run, run).
- But that plan has to rest on day 2, so it finishes at 2.
- The real optimum is 11: run on day 0, rest on day 1, run on day 2.

So two plans with different totals can have different futures. The 1-D state threw away the one detail that decides the future.

That leads to the rule: **add to the state exactly what the future needs to know about the past.** Here, the future needs to know your current running streak: 0, 1 or 2. That gives three modes:

- `rest[i]` is the best total through day i, having rested on day i. You can rest after anything, so `rest[i] = max(rest[i-1], run1[i-1], run2[i-1])`.
- `run1[i]` means you ran on day i and rested on day i-1. So `run1[i] = rest[i-1] + points[i]`.
- `run2[i]` means you ran on days i-1 and i. So `run2[i] = run1[i-1] + points[i]`. Nothing leads from `run2` into another run. That missing transition is how "never three in a row" is enforced.

Before day 0 you're rested with 0 points. `run1` and `run2` are impossible at that point, so they start at minus infinity.

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/training-trace.svg %}</figure>

The answer is max(18, 15, 22) = 22. To see which plan gives 22, read the trace backwards:

- `run2` on day 4 came from `run1` on day 3 (15).
- That came from `rest` on day 2 (5).
- That came from `run2` on day 1 (3 + 2).

So the plan is run, run, rest, run, run, for 3 + 2 + 10 + 7 = 22.

### Diagram

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/grid-dp.svg %}</figure>

Look at `dp[1][3] = 8`. It's finite, but it doesn't help. Its only way forward is down, and the cell below it, (2, 3), is a wall.

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/state-machine.svg %}</figure>

### Implementation

```python
import math


def min_path_cost(grid):
    """Cheapest top-left to bottom-right path, moving only right or down.
    Cells holding None are walls. Returns -1 if no path exists."""
    rows, cols = len(grid), len(grid[0])
    INF = math.inf
    # dp[r][c] = cheapest cost of a path from (0, 0) ending on (r, c), both cells included.
    # Built with a comprehension: [[INF] * cols] * rows would repeat ONE row object
    # rows times (recalled Python list semantics).
    dp = [[INF] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] is None:          # wall: no path ends here, dp[r][c] stays INF
                continue
            if r == 0 and c == 0:
                dp[r][c] = grid[0][0]       # base case: the path is only the start cell
                continue
            # A missing neighbour is INF, not 0. With 0, dp[0][1] would be 3 instead of
            # 1 + 3 = 4, and the final answer on the example drops from 11 to a wrong 9.
            from_up = dp[r - 1][c] if r > 0 else INF
            from_left = dp[r][c - 1] if c > 0 else INF
            # (recalled: INF + an int is INF, so min() never picks a blocked neighbour
            # while a reachable one exists)
            dp[r][c] = grid[r][c] + min(from_up, from_left)
    return -1 if dp[-1][-1] == INF else dp[-1][-1]


def min_path_cost_one_row(grid):
    """Same answer with O(cols) memory."""
    rows, cols = len(grid), len(grid[0])
    INF = math.inf
    row = [INF] * cols
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] is None:
                row[c] = INF
            elif r == 0 and c == 0:
                row[c] = grid[0][0]
            else:
                # row[c] is not overwritten yet in pass r, so it still holds dp[r-1][c];
                # row[c-1] was overwritten earlier in pass r, so it holds dp[r][c-1].
                left = row[c - 1] if c > 0 else INF
                row[c] = grid[r][c] + min(row[c], left)
    return -1 if row[-1] == INF else row[-1]


def max_training_points(points):
    """Run on day i to earn points[i]; never run 3 days in a row."""
    NEG = -math.inf
    # Before day 0: rested with 0 points; a streak of 1 or 2 is impossible, so NEG.
    rest, run1, run2 = 0, NEG, NEG
    for p in points:
        # One tuple assignment: every right-hand side reads YESTERDAY's rest/run1/run2.
        rest, run1, run2 = (
            max(rest, run1, run2),  # resting today is allowed after any of the 3 states
            rest + p,               # streak of 1: yesterday must have been rest
            run1 + p,               # streak of 2: yesterday must have been run1
        )
    return max(rest, run1, run2)


W = None
grid = [
    [1, 3, 1, 2],
    [1, W, 5, 1],
    [4, 2, 1, W],
    [2, W, 1, 1],
]
print(min_path_cost(grid), min_path_cost_one_row(grid))   # 11 11
print(min_path_cost([[5]]), min_path_cost([[1, W], [W, 1]]))  # 5 -1
print(max_training_points([3, 2, 5, 10, 7]))              # 22
print(max_training_points([]), max_training_points([4, 4, 4]))  # 0 8
```

I ran these against the example, the edge cases shown, and a brute force. The brute force covered 2,000 random grids up to 4 by 4 (walls included) and 500 random point lists. All of them agree.

Complexity:

- **Grid DP** is O(R × C) time for R rows and C columns. Space is O(R × C) for the full table, or O(C) for the one-row version.
- **The state machine** is O(n × S) time for n days and S modes. Here S = 3, so that's O(n). Space is O(S).

### Recognition

- **Naming one subproblem takes two numbers.** For example (row, column), (day, mode), (item, budget), or (position in string 1, position in string 2).
- **A grid where moves only go "forward"** (right or down), and the question asks for a count, a minimum or a maximum over paths. Unique Paths shows this signal.
- **A sequence of days or steps where what you may do now depends on what you did recently.** Think cooldowns, "at most k in a row", or holding versus not holding. That's the state-machine signal, and Best Time to Buy And Sell Stock With Cooldown shows it.
- Longest Increasing Path In a Matrix is a grid too. But its moves go in all four directions, so read the dependency-order pitfall below before assuming a row-by-row sweep works.

When not to use it: suppose moves can go in any direction and costs are arbitrary. Then cells depend on each other in cycles, and no fill order exists. That's a shortest-path problem. Use Dijkstra ([Part 16](/blogs/dsa-advanced-graphs/)), or BFS if every step costs the same. DP needs the dependencies to form a DAG.

### Pitfalls

- **Treating missing neighbours as 0 in a min problem.** On the example this gives 9 instead of 11. A missing neighbour means "impossible". That's infinity for a min, minus infinity for a max, and 0 for counting.
- **`[[x] * cols] * rows`.** This makes every row the same list object. Writing one cell writes the whole column.
- **One-row overwrite order.** Left to right is correct when a cell reads "above and left". But suppose a cell also read the up-left diagonal. By the time you need that old value, `row[c-1]` has already been overwritten. So you have to save it in a variable first.
- **Updating state-machine variables one at a time.** Say you write `rest = ...`, then `run1 = rest + p`, then `run2 = run1 + p`. Now `run2` reads today's `run1`, which reads today's `rest`. On the example that "allows" running and resting on the same day, and returns 54 instead of 22. Update all modes from yesterday's values at once.
- **Starting unreachable modes at 0.** For this machine it happens to be harmless. Starting `run1` and `run2` at 0 still gives 22, because `run2` is never a better place to leave from than `run1`. But in a machine where leaving an unreachable mode earns something, 0 invents free value. Use minus infinity out of habit.
- **Dependency order.** Row by row only works when every cell reads cells that come earlier in that order. Sometimes "comes before" means something else, like a value comparison or a range length. Then sweep in that order instead. Or use top-down memoization and let the recursion find the order, as long as there are no cycles.

### Active Recall

Answer out loud or on paper first.

**Q1.** If diagonal moves (down-right) were also allowed, what changes in the recurrence, and why does the one-row version need an extra variable?

**Q2.** Row-by-row works. Would filling from the bottom-right corner, right-to-left, bottom row first, work with the same recurrence?

**Q3.** In the running example, why is `run2` on day 1 equal to 5, and why can `run1` on day 2 not be built from it?

**Q4.** Change the rule to "never more than k runs in a row". How many modes, and what is the time?

{% capture coach %}
You are my coding-interview coach. I just studied 2-D dynamic programming (grid DP and state-machine DP) in Python: dp[r][c] is the original question asked about a smaller piece of the input that needs two numbers to describe. For a grid where moves go only right or down, dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]), missing neighbours and walls count as infinity (not 0), and any fill order that finishes both predecessors first is valid (row by row, left to right). The one-row version works because row[c] still holds the value from above while row[c-1] already holds the value from the left. In state-machine DP the second index is a small mode, and the rule is: add to the state exactly what the future needs to know about the past; all modes are updated from yesterday's values at once.
Worked examples from the lesson: (1) cheapest right/down path through the grid [[1, 3, 1, 2], [1, #, 5, 1], [4, 2, 1, #], [2, #, 1, 1]] where # is a wall. The dp table is [[1, 4, 5, 7], [2, #, 10, 8], [6, 8, 9, #], [8, #, 10, 11]]; dp[2][2] = 1 + min(10, 8) = 9, dp[3][3] = 1 + min(inf, 10) = 11. (2) points = [3, 2, 5, 10, 7], on each day either run (earn points[i]) or rest, never run three days in a row. Modes: rest[i] = max(rest[i-1], run1[i-1], run2[i-1]); run1[i] = rest[i-1] + points[i]; run2[i] = run1[i-1] + points[i]. Start: rest 0, run1 and run2 minus infinity. Trace (rest, run1, run2): day 0: 0, 3, -inf; day 1: 3, 2, 5; day 2: 5, 8, 7; day 3: 8, 15, 18; day 4: 18, 15, 22. Answer 22.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. If diagonal moves (down-right) were also allowed, what changes in the recurrence, and why does the one-row version need an extra variable?
2. Row-by-row works. Would filling from the bottom-right corner, right-to-left, bottom row first, work with the same recurrence?
3. In the running example, why is run2 on day 1 equal to 5, and why can run1 on day 2 not be built from it?
4. Change the rule to "never more than k runs in a row". How many modes, and what is the time?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Interleaving String makes you invent a two-index state from scratch, and Best Time to Buy And Sell Stock With Cooldown makes you design its own state machine. So the problem list already gives this module a full workout on its own.

### Transfer test

A delivery robot crosses a city grid where each cell has a traffic cost. It may move up, down, left or right, and you need the cheapest route between two corners. Would you use grid DP? Why?

{% capture coach %}
You are my coding-interview coach. I just learned grid DP (dp[r][c] is the cheapest cost to reach cell (r, c), computed from the cells it can be entered from, filled in an order where every cell's inputs are already final). Scenario: A delivery robot crosses a city grid where each cell has a traffic cost. It may move up, down, left or right, and you need the cheapest route between two corners.
Ask me whether I would use grid DP here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## 0 / 1 Knapsack

### Foundation

You're packing a bag that can hold a limited weight. Each item has a weight and a value. There's one copy of each item, and each one is either in the bag or out. Maximize the value you carry.

Why two indices? A subproblem has two parts: "which items have I already decided about" and "how much room do I have left". Take the same first three items. With 2 kg of room and with 5 kg of room, those are different questions with different answers.

You've seen this before. Part 15's table was indexed only by amount, and it had a rule: "scan the amount downward for use-once items". That was this same problem with the item index already squeezed out. Here the hidden index comes back, and it explains why that scan direction works.

The worked example for this module and the next: weights `[2, 3, 4]`, values `[3, 5, 6]`, capacity 6.

Greedy doesn't work here. By value per kilo, the items rate 1.5, 1.67 and 1.5. So greedy takes the 3 kg item first (value 5), then the 2 kg item (value 3). That's weight 5 and value 8, and now the 4 kg item no longer fits. The best choice is the 2 kg and 4 kg items: weight 6, value 9.

### Mechanics

1. **State.** `dp[i][c]` is the best value using only the first i items (items 0 to i-1 inclusive), with total weight at most c.
2. **Decision on item i-1.** You can skip it, which gives `dp[i-1][c]`. Or, if its weight w fits (w ≤ c), you can take it, which gives `dp[i-1][c-w] + v`. Then `dp[i][c]` is the max of whichever options exist.
3. **Why it is safe.** Take any optimal choice for (i, c). Either it leaves out item i-1, and then it's a valid choice for (i-1, c). Or it includes item i-1, and removing that item leaves a valid choice for (i-1, c-w). Both sub-answers are already optimal, so the max over the two branches is optimal too.
4. **Why "row i-1" on the take branch.** Reading `dp[i-1][c-w]` means "the rest of the bag was filled using only earlier items". That's what stops you taking item i-1 twice. This one index is the whole difference between this module and the next.
5. **Base cases.** `dp[0][c] = 0` for every c from 0 to capacity inclusive, because no items means no value. `dp[i][0]` comes out as 0 on its own.
6. **Fill order.** Row by row. Row i reads only row i-1, so for the full table any column order inside a row works.

Here are two cells from the example:

- `dp[2][5] = max(dp[1][5], dp[1][2] + 5) = max(3, 3 + 5) = 8`. That's the items of weight 2 and 3.
- `dp[3][6] = max(dp[2][6], dp[2][2] + 6) = max(8, 3 + 6) = 9`. That's the items of weight 2 and 4.

**Space.** Row i reads row i-1 at two columns, c and c-w. Both are at c or to its left. So you can keep one array and sweep c **downward**, from capacity to w. Why downward? When you update `dp[c]`, the cell `dp[c-w]` is to its left. Going downward, you haven't touched it yet in this pass, so it still holds row i-1's value.

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/knap01-array.svg %}</figure>

What if you sweep upward instead? The first item alone produces `0 0 3 3 6 6 9`. At c = 4, the loop read `dp[2] = 3`, which it had already updated in this pass. So it took the 2 kg item a second time. At c = 6 it took it a third time. The final upward answer is 10, which isn't a legal 0/1 answer. Keep that 10 in mind for the next module.

### Diagram

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/knap01-table.svg %}</figure>

Both arrows come from row 2, never from row 3. That's what "one copy" looks like in the table.

### Implementation

```python
def knapsack_01_table(weights, values, capacity):
    n = len(weights)
    # dp[i][c] = best value using only items 0..i-1 with total weight <= c
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]   # row 0: no items, value 0
    for i in range(1, n + 1):
        w, v = weights[i - 1], values[i - 1]
        for c in range(capacity + 1):
            skip = dp[i - 1][c]                  # item i-1 left out: same budget c
            if w <= c:
                # row i-1, not row i: the other c - w units hold only items 0..i-2,
                # so item i-1 appears at most once. dp[3][6] = max(8, dp[2][2] + 6 = 9) = 9
                dp[i][c] = max(skip, dp[i - 1][c - w] + v)
            else:
                dp[i][c] = skip                  # w > c: item i-1 cannot fit in budget c
    return dp[n][capacity]


def knapsack_01(weights, values, capacity):
    dp = [0] * (capacity + 1)   # dp[c] = best value with weight <= c, items seen so far
    for w, v in zip(weights, values):
        # c goes capacity, capacity-1, ..., w (inclusive). Downward, so dp[c - w]
        # (an index below c) is not yet updated for this item and still holds the
        # previous row's value. An item heavier than capacity gives an empty range.
        for c in range(capacity, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[capacity]


print(knapsack_01_table([2, 3, 4], [3, 5, 6], 6), knapsack_01([2, 3, 4], [3, 5, 6], 6))  # 9 9
print(knapsack_01([], [], 5), knapsack_01([7], [9], 5), knapsack_01([2], [3], 0))        # 0 0 0
```

I checked these against a brute force over all subsets, on 1,000 random instances (up to 5 items, capacity up to 10).

Complexity: O(n × C) time for n items and capacity C. Space is O(n × C) for the table, or O(C) for the one-array version.

This is called **pseudo-polynomial**. The cost grows with the value of C, not with how many digits it takes to write C down. So a capacity of 10^9 makes the table impossible to build. (Recalled, not derived: 0/1 knapsack is NP-hard in general. That's why nobody expects an algorithm that is polynomial in the number of digits of C.)

### Recognition

- **You choose a subset.** Each element is used at most once.
- **There's a numeric budget or target on some sum**, like a weight, a cost or a target total. The question asks for a max, a min, a count, or "is it reachable".
- **The numbers are small enough** that "budget from 0 to C" fits in a table.
- Target Sum shows this signal. Partition Equal Subset Sum from Part 15 was its yes/no cousin.

How is this different from backtracking over subsets ([Part 11](/blogs/dsa-backtracking/))? Backtracking goes through all 2^n subsets one by one. That's the right tool when you must list them. Knapsack merges every subset that reaches the same (items considered, budget used) into one cell. That's why it's O(n × C) instead of O(2^n).

To tell it apart from unbounded knapsack, ask one question: can an item be used again?

### Pitfalls

- **An upward loop in the one-array version.** It quietly turns 0/1 into unbounded, giving 10 instead of 9 on the example.
- **"At most c" vs "exactly c".** For "at most", every `dp[c]` starts at 0. For "exactly", `dp[0]` starts at 0 and every other `dp[c]` starts at minus infinity, so sums you can't reach stay unreachable. On the example, exactly 6 is still 9. But exactly 1 is impossible, so it stays at minus infinity.
- **Counting instead of maximizing.** Start `dp[0] = 1`, and use `+` instead of `max`. The loop direction rule stays the same.
- **Zero or negative weights.** The recurrence assumes w ≥ 1, so that c - w is a smaller budget. Negative numbers need an offset or a different formulation.

### Active Recall

Answer out loud or on paper first.

**Q1.** What is `dp[2][4]` in the table, and which items make it?

**Q2.** Why does the order you process items in not change the final answer?

**Q3.** Switch the example to "exactly 5 kg". What is the answer, and which initial values produce it?

{% capture coach %}
You are my coding-interview coach. I just studied 0/1 knapsack in Python: dp[i][c] is the best value using only the first i items (items 0 to i-1) with total weight at most c. For item i-1 with weight w and value v, dp[i][c] = max(dp[i-1][c], dp[i-1][c-w] + v) when w <= c, else dp[i-1][c]. The take branch reads row i-1, which is what forbids using an item twice. Base row dp[0][c] = 0. With one array, sweep c downward from capacity to w so dp[c-w] still holds the previous row's value; sweeping upward silently turns it into unbounded knapsack. For "exactly c", start dp[0] = 0 and every other dp[c] at minus infinity.
Worked example from the lesson: weights [2, 3, 4], values [3, 5, 6], capacity 6. Greedy by value per kilo gives 8; the best is 9 (the 2 kg and 4 kg items). Full table rows for c = 0..6: i=0: 0 0 0 0 0 0 0; i=1: 0 0 3 3 3 3 3; i=2: 0 0 3 5 5 8 8; i=3: 0 0 3 5 6 8 9. dp[3][6] = max(dp[2][6] = 8, dp[2][2] + 6 = 9) = 9. Sweeping upward instead gives 10, which is not a legal 0/1 answer.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. What is dp[2][4] in the table, and which items make it?
2. Why does the order you process items in not change the final answer?
3. Switch the example to "exactly 5 kg". What is the answer, and which initial values produce it?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. In Target Sum you have to turn a choice of plus or minus signs into item choices on your own. That works this module from scratch, and the reframing belongs to solving that problem.

### Transfer test

You are planning a conference day. Each talk has a length in minutes and an interest score, there are no time clashes, you have 240 minutes, and you will attend at most 5 talks. Would you use 0/1 knapsack? Why?

{% capture coach %}
You are my coding-interview coach. I just learned 0/1 knapsack (each item is taken at most once; dp over items and a remaining budget, where the take branch reads the previous item row, or a one-array version swept downward). Scenario: You are planning a conference day. Each talk has a length in minutes and an interest score, there are no time clashes, you have 240 minutes, and you will attend at most 5 talks.
Ask me whether I would use 0/1 knapsack here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Unbounded Knapsack

### Foundation

Same bag, but now you're in a shop with unlimited stock. After you take an item, you can take the same item again. Only one question changes: "after I take one, is this item still available?" The answer is now yes.

Same worked example: weights `[2, 3, 4]`, values `[3, 5, 6]`, capacity 6, but now with unlimited copies.

### Mechanics

1. **State.** `dp[i][c]` is the best value using item types 0 to i-1 inclusive, any number of copies of each, with total weight at most c.
2. **Decision.** You can skip item type i-1 entirely, which gives `dp[i-1][c]`. Or, if w ≤ c, you can take one copy, which gives `dp[i][c-w] + v`. That reads **row i**, not row i-1. After you take one copy, the same type is still on offer for the remaining c - w.
3. **Why it is safe.** An optimal answer for (i, c) uses either zero copies of type i-1 or at least one. With zero copies, it's an answer for (i-1, c). With at least one, remove one copy. What's left is a valid answer for (i, c-w), where type i-1 is still allowed. Both sub-answers are optimal, so the max is optimal.
4. **Why it terminates.** `dp[i][c]` reads `dp[i][c-w]` in the same row. That looks circular. But c - w < c whenever w ≥ 1, so it always reads a smaller budget. If you sweep c upward, `dp[i][c-w]` is already done by the time you need it.
5. **Fill order.** Row by row, with c going upward.

Here are two cells:

- `dp[2][3] = max(dp[1][3], dp[2][0] + 5) = max(3, 0 + 5) = 5`.
- `dp[2][6] = max(dp[1][6], dp[2][3] + 5) = max(9, 5 + 5) = 10`. That's two copies of the 3 kg item.

Also note that `dp[1][6] = 9` is three copies of the 2 kg item.

**Space.** With one array, an upward sweep gives you exactly "row i at column c - w". By the time you reach `dp[c]`, `dp[c-w]` was already updated in this pass, so it may already contain this item. The loop you were warned about in the previous module is the correct loop here.

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/unbounded-array.svg %}</figure>

### Diagram

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/unbounded-table.svg %}</figure>

Compare this with the 0/1 diagram. The take arrow now starts in the row being filled.

### Implementation

```python
def knapsack_unbounded(weights, values, capacity):
    dp = [0] * (capacity + 1)   # dp[c] = best value with weight <= c, unlimited copies
    for w, v in zip(weights, values):
        # Requires w >= 1: with w = 0, dp[c - w] is dp[c] itself.
        # c goes w, w+1, ..., capacity (inclusive). Upward, so dp[c - w] was already
        # updated in this pass and may contain item (w, v); taking it again from there
        # is "one more copy". dp[6] = max(9, dp[3] + 5 = 10) = 10 on the example.
        for c in range(w, capacity + 1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[capacity]


print(knapsack_unbounded([2, 3, 4], [3, 5, 6], 6))   # 10
print(knapsack_unbounded([], [], 5), knapsack_unbounded([7], [9], 5), knapsack_unbounded([1], [2], 5))  # 0 0 10
```

I checked this against a memoized brute force on 1,000 random instances.

Complexity: O(n × C) time for n item types and capacity C, and O(C) space.

### Recognition

- **Wording like** "unlimited supply", "each may be used any number of times", "infinite coins", or "you may cut as many pieces as you like".
- **Building a total out of reusable parts**, and asking for a max, a min, or a count.
- Coin Change II shows this signal. So did Coin Change in Part 15.

To tell it apart from 0/1, ask one question: "can I reuse it?" In the table version, that's the same as asking "does the take branch read row i-1 or row i?" In one-array code, it's the same as asking "do I loop downward or upward?"

What if each item has a limited stock greater than one? That's called bounded knapsack, and neither loop is right as written. Instead, you expand the stock into separate 0/1 items. (Recalled: splitting the stock into groups of 1, 2, 4, ... copies keeps that to O(log stock) items per type.)

### Pitfalls

- **Zero-weight items.** With w = 0, the "copy" loop reads `dp[c]` itself and adds v once per pass. So it returns a number that is finite but meaningless. On a test with a (0 kg, 4) item and a (2 kg, 3) item at capacity 4, it returns 10. The true answer is unbounded, since you could take the free item forever. Reject w = 0 or handle it explicitly.
- **Exact fill.** Same as 0/1: `dp[0] = 0`, and everything else starts at minus infinity (or plus infinity for a min). With weights `[3, 5]`, exactly 7 is unreachable and stays at minus infinity, while 3, 5 and 6 become reachable.
- **Counting.** When you count ways instead of maximizing, there are two ways to nest the loops: items outside and capacity inside, or the reverse. They count different things. One counts unordered collections, the other counts ordered sequences. For max and min it makes no difference. Before trusting either nesting, work out on a tiny example which one your counting problem wants.

### Active Recall

Answer out loud or on paper first.

**Q1.** `dp[1][6] = 9` in the table. Which items make it, and why could the 0/1 table never produce it?

**Q2.** The recurrence `dp[i][c] = max(dp[i-1][c], dp[i][c-w] + v)` reads its own row. Why is that not an infinite loop, and when would it become one?

**Q3.** There is a second common way to write this: loop capacity c on the outside, and for each c try every item, `dp[c] = max(dp[c], dp[c - w] + v)`. Is the answer for the example the same?

{% capture coach %}
You are my coding-interview coach. I just studied unbounded knapsack in Python: dp[i][c] is the best value using item types 0 to i-1, any number of copies, total weight at most c. dp[i][c] = max(dp[i-1][c], dp[i][c-w] + v) when w <= c: the take branch reads row i (the row being filled), because after taking one copy the same type is still available. It is not circular because c - w < c when w >= 1 and c is swept upward. In the one-array version the capacity loop runs upward, exactly the loop that is wrong for 0/1 knapsack. For counting (not max/min), the two loop nestings count different things: unordered collections vs ordered sequences.
Worked example from the lesson: weights [2, 3, 4], values [3, 5, 6], capacity 6, unlimited copies. Table rows for c = 0..6: i=0: 0 0 0 0 0 0 0; i=1: 0 0 3 3 6 6 9; i=2: 0 0 3 5 6 8 10. dp[2][3] = max(3, 0 + 5) = 5; dp[2][6] = max(dp[1][6] = 9, dp[2][3] + 5 = 10) = 10 (two copies of the 3 kg item). The 4 kg item changes nothing, final answer 10.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. dp[1][6] = 9 in the table. Which items make it, and why could the 0/1 table never produce it?
2. The recurrence dp[i][c] = max(dp[i-1][c], dp[i][c-w] + v) reads its own row. Why is that not an infinite loop, and when would it become one?
3. There is a second common way to write this: loop capacity c on the outside, and for each c try every item, dp[c] = max(dp[c], dp[c - w] + v). Is the answer for the example the same?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Included. Coin Change II is a counting problem that is plainly labelled as this pattern. You don't have to derive the technique from scratch to solve it. So without this checkpoint, nothing would make you work this module's mechanics out on your own.

Given a positive integer n, find the fewest perfect squares (1, 4, 9, 16, ...) that add up to exactly n. For n = 12 the answer is 3 (4 + 4 + 4). For n = 13 it is 2 (4 + 9).

Before opening the chat, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
Given a positive integer n, find the fewest perfect squares (1, 4, 9, 16, ...) that add up to exactly n. For n = 12 the answer is 3 (4 + 4 + 4). For n = 13 it is 2 (4 + 9).
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

A workshop has a steel bar of length 8 and a price list: a piece of length L (1 to 8) sells for `price[L]`. You may cut any number of pieces of any lengths, but there must be no leftover. Maximize revenue. Would you use unbounded knapsack? Why?

{% capture coach %}
You are my coding-interview coach. I just learned unbounded knapsack (items can be reused any number of times; the take branch reads the row being filled, so the one-array capacity loop runs upward; "exact fill" starts dp[0] = 0 and everything else at minus infinity). Scenario: A workshop has a steel bar of length 8 and a price list: a piece of length L (1 to 8) sells for price[L]. You may cut any number of pieces of any lengths, but there must be no leftover. Maximize revenue.
Ask me whether I would use unbounded knapsack here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## LCS

### Foundation

Picture two queues of people and a single door. You look only at the two people at the back of the queues, and from them you work out who the last person through the door must have been.

Two-sequence DP works the same way. When the input is two sequences, the natural subproblem is a pair of **prefixes** (the first few characters of each). `dp[i][j]` is the answer for the first i characters of `a` and the first j characters of `b`. The last characters of the two prefixes tell you which case you're in: either they match, or they don't.

LCS itself is on the problem list. So this module teaches the two-prefix technique on a different question: the length of the **shortest common supersequence**. Given `a = "abac"` and `b = "cab"`, find the length of the shortest string that contains both as subsequences. (A subsequence keeps the characters in order, but they don't have to be next to each other.) The answer is 5. `"cabac"` contains `a`, `b`, `a`, `c` in order, and it also contains `c`, `a`, `b` in order. No 4-character string does both.

### Mechanics

1. **State.** `dp[i][j]` is the length of the shortest string that has both `a[:i]` and `b[:j]` as subsequences.
2. **A shortest answer ends in `a[i-1]` or `b[j-1]`.** Why? Suppose its last character served neither string. Then you could delete it and still have a valid answer. So it wasn't the shortest.
3. **Match: `a[i-1] == b[j-1]`.** Here one character can serve as the end of both prefixes. So `dp[i][j] = dp[i-1][j-1] + 1`. Why is this safe? Take any valid string S for (i, j) and delete its last character. What's left is a valid string for (i-1, j-1). Here's why:
   - Inside S, `a[i-1]` sits at some position p.
   - All of `a[:i-1]` sits strictly before p, so it survives when S loses its final character.
   - The same holds for `b[:j-1]`.

   So `dp[i][j] ≥ dp[i-1][j-1] + 1` always, and a match achieves exactly that.
4. **Mismatch.** The answer ends in `a[i-1]` or in `b[j-1]`, but not both, because they're different characters. There are two cases:
   - It ends in `a[i-1]`. That character can't also be the end of `b[:j]`, since it differs from `b[j-1]`. So everything before it must still contain all of `b[:j]` and `a[:i-1]`. The cost is `1 + dp[i-1][j]`.
   - It ends in `b[j-1]`. By the same argument with the roles swapped, the cost is `1 + dp[i][j-1]`.

   Take the min. Let's check both branches on the example at `dp[4][3]`, where a ends in `c` and b ends in `b`. Ending in `c` costs `1 + dp[3][3] = 1 + 4 = 5` (that's `"caba"` + `"c"`). Ending in `b` costs `1 + dp[4][2] = 1 + 5 = 6`. The min is 5.
5. **Base cases.** `dp[i][0] = i` and `dp[0][j] = j`, because if one string is empty, the answer is just the other string. Not every two-prefix problem has zeros on its borders. The border is "the answer when one side is empty", and you have to ask what that is every time.
6. **Fill order.** Each cell reads up, left and up-left, so row by row works.

**A contrast worth knowing.** The longest common **substring** must be contiguous (no gaps). It uses the same table shape with a different state: `dp[i][j]` is the length of the common block that ends exactly at `a[i-1]` and `b[j-1]`. On a mismatch, the block is broken, so the cell is 0. The answer is the max over the whole table, not the corner. For `"abac"` and `"cab"` it's 2 (`"ab"`). So the two questions behave differently after a mismatch. Subsequence questions carry information past it. Substring questions start again from 0.

### Diagram

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/scs-table.svg %}</figure>

### Implementation

```python
def scs_length(a, b):
    """Length of the shortest string having both a and b as subsequences."""
    m, n = len(a), len(b)
    # dp[i][j] = shortest length covering a[:i] and b[:j]; indices i in 0..m, j in 0..n
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 or j == 0:
                # one prefix is empty, so the answer is the other prefix: i + j characters
                # (dp[3][0] = 3 for "aba", dp[0][2] = 2 for "ca")
                dp[i][j] = i + j
            elif a[i - 1] == b[j - 1]:
                # a[i-1] == b[j-1]: one shared last character ends both prefixes.
                # dp[4][1]: a[3] = 'c' == b[0] = 'c', so dp[3][0] + 1 = 4
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                # a[i-1] != b[j-1]: the answer ends in a[i-1] (rest covers a[:i-1], b[:j])
                # or in b[j-1] (rest covers a[:i], b[:j-1]).
                # dp[4][3]: 1 + min(dp[3][3] = 4, dp[4][2] = 5) = 5
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]


print(scs_length("abac", "cab"))                            # 5
print(scs_length("", ""), scs_length("abc", ""), scs_length("abc", "abc"), scs_length("ab", "cd"))  # 0 3 3 4
```

I checked this against a brute force that tries every candidate string in increasing length, on 300 random pairs of short strings.

Complexity: O(m × n) time and space for strings of lengths m and n. Space can drop to O(min(m, n)) if you keep one row plus a saved diagonal value.

### Recognition

- **Two strings or two sequences**, and the question compares, aligns, merges or transforms them.
- **Words like** "subsequence", "transform a into b", "interleave", or "matches the pattern".
- Longest Common Subsequence, Interleaving String, Distinct Subsequences, Edit Distance and Regular Expression Matching all show this signal. Each one is a two-prefix table with its own case analysis on the last characters.

When not to use it:

- **There's only one string.** Then the state is usually one prefix (Part 15) or a range of it (the last module).
- **The question is a yes/no with an obvious greedy**, like "is `s` a subsequence of `t`". Two pointers in O(m + n) are enough. The table is for finding the best among many possible alignments.

### Pitfalls

- **Index shift.** The table is (m+1) × (n+1), and cell (i, j) looks at `a[i-1]` and `b[j-1]`. Mixing up "i is a length" with "i is an index" is the most common bug in this family.
- **Borders are not always 0.** Here they are i and j. Work out the border by asking "what if one side is empty?"
- **Corner vs max.** Prefix questions have their answer in `dp[m][n]`. Substring questions have it in the max cell.
- **One-row compression.** You need the up-left value, and overwriting the row destroys it. Save it before you overwrite.

### Active Recall

Answer out loud or on paper first.

**Q1.** Why is `dp[4][1] = 4` and not 5?

**Q2.** Rebuild an actual shortest supersequence by walking back from (4, 3). Which moves do you make?

**Q3.** On a mismatch, why is there no third option "append both `a[i-1]` and `b[j-1]`": `dp[i-1][j-1] + 2`?

**Q4.** For the longest common substring of `"abac"` and `"cab"`, what is the table cell for (a[1] = 'b', b[2] = 'b'), and why is the answer not in the corner?

{% capture coach %}
You are my coding-interview coach. I just studied the two-prefix DP family (LCS-style tables) in Python, taught on the shortest common supersequence length: dp[i][j] is the length of the shortest string that has both a[:i] and b[:j] as subsequences. If a[i-1] == b[j-1], dp[i][j] = dp[i-1][j-1] + 1 (one character ends both). Otherwise dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1]) (the answer ends in a[i-1] or in b[j-1]). Borders are dp[i][0] = i and dp[0][j] = j, not 0. Fill row by row; each cell reads up, left and up-left. Contrast: longest common substring uses dp[i][j] = length of the common block ending exactly at a[i-1] and b[j-1], resets to 0 on a mismatch, and the answer is the max over the table, not the corner.
Worked example from the lesson: a = "abac" (rows), b = "cab" (columns). Table rows for j = 0..3: i=0: 0 1 2 3; i=1 (a): 1 2 2 3; i=2 (b): 2 3 3 3; i=3 (a): 3 4 4 4; i=4 (c): 4 4 5 5. dp[4][3]: 'c' != 'b', so 1 + min(dp[3][3] = 4, dp[4][2] = 5) = 5. dp[4][1]: 'c' == 'c', so dp[3][0] + 1 = 4. The answer is 5, for example "cabac".
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Why is dp[4][1] = 4 and not 5?
2. Rebuild an actual shortest supersequence by walking back from (4, 3). Which moves do you make?
3. On a mismatch, why is there no third option "append both a[i-1] and b[j-1]": dp[i-1][j-1] + 2?
4. For the longest common substring of "abac" and "cab", what is the table cell for (a[1] = 'b', b[2] = 'b'), and why is the answer not in the corner?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Edit Distance and Distinct Subsequences each make you derive their own last-character case analysis from scratch. So the problem list already gives this module a full workout on its own.

### Transfer test

A spell-checker wants to know whether a typed abbreviation like `"mgr"` can be formed by deleting letters from a dictionary word like `"manager"`. It checks one abbreviation against one word at a time. Would you use the two-prefix table? Why?

{% capture coach %}
You are my coding-interview coach. I just learned the two-prefix DP table (dp[i][j] answers the question for the first i characters of one string and the first j of the other, with a case analysis on whether the last characters match; O(m × n)). Scenario: A spell-checker wants to know whether a typed abbreviation like "mgr" can be formed by deleting letters from a dictionary word like "manager". It checks one abbreviation against one word at a time.
Ask me whether I would use the two-prefix table here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Interval DP

The problems below also need this. Burst Balloons is indexed by both ends of a range, and its choices split that range in two. None of the four prefix-style modules above teach that kind of state.

### Foundation

Think about where to put brackets in `2 × 3 + 4 × 5`. Whichever operation you do last splits the expression into a left part and a right part. Each part is its own smaller bracketing problem.

So the subproblem is a contiguous range, named by its two ends `(i, j)`. The recurrence tries every place to split it.

Here is the worked example. You multiply four matrices in a chain: A0 (40 × 20), A1 (20 × 30), A2 (30 × 10) and A3 (10 × 30). We write their shapes as `dims = [40, 20, 30, 10, 30]`, so that matrix k is `dims[k] × dims[k+1]`.

Multiplying a p × q matrix by a q × r matrix costs p × q × r scalar multiplications. (Recalled: that's the standard schoolbook cost.) The final product is the same however you place the brackets, but the cost isn't. Find the cheapest bracketing.

### Mechanics

1. **State.** `dp[i][j]` is the cheapest cost to multiply A_i through A_j (inclusive) into a single matrix. `dp[i][i] = 0`, since a single matrix needs no multiplying.
2. **Last operation.** The final multiplication combines (A_i .. A_k) with (A_{k+1} .. A_j), for some split k from i to j-1 inclusive. The left result has shape `dims[i] × dims[k+1]`. The right result has shape `dims[k+1] × dims[j+1]`. So the final step costs `dims[i] × dims[k+1] × dims[j+1]`.
3. **Recurrence.** `dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + dims[i] × dims[k+1] × dims[j+1]`.
4. **Why it is safe.** Once k is fixed, the two halves are independent. How you bracket the left part can't change the right part's cost. And the last step's cost depends only on shapes, which i, k and j already fix. So each half should be bracketed as cheaply as possible, and trying every k covers every possible last step.
5. **Fill order.** By interval length, shortest first, because `dp[i][j]` reads only strictly shorter intervals. Row by row from i = 0 fails. For example, `dp[0][3]` needs `dp[1][3]`, which belongs to a later row.

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/chain-splits.svg %}</figure>

So `dp[0][3] = 26000`, from the split at k = 2. To recover the full bracketing, look at where `dp[0][2] = 14000` came from. It came from k = 0: A0 times the 20 × 10 product A1·A2, costing 0 + 6000 + 40 × 20 × 10 = 14000. So the best bracketing is ((A0 (A1 A2)) A3).

### Diagram

<figure class="sketch">{% include sketches/dsa-2d-dynamic-programming/chain-table.svg %}</figure>

Each cell reads cells to its left in its row and below it in its column. That's why the diagonals are filled shortest first.

### Implementation

```python
import math


def matrix_chain_cost(dims):
    """Matrix k has shape dims[k] x dims[k+1]; there are n = len(dims) - 1 matrices."""
    n = len(dims) - 1
    # dp[i][j] = cheapest cost to multiply matrices i..j (inclusive); dp[i][i] = 0
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):            # interval lengths 2, 3, ..., n
        for i in range(0, n - length + 1):    # i = 0 .. n-length inclusive
            j = i + length - 1
            best = math.inf
            for k in range(i, j):             # split after matrix k, k = i .. j-1 inclusive
                # (i..k) is dims[i] x dims[k+1] and (k+1..j) is dims[k+1] x dims[j+1];
                # dp[i][k] and dp[k+1][j] have length < `length`, so they are final.
                # dp[0][3], k = 2: 14000 + 0 + 40*10*30 = 26000
                cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
                best = min(best, cost)
            dp[i][j] = best
    return dp[0][n - 1]


print(matrix_chain_cost([40, 20, 30, 10, 30]))   # 26000
print(matrix_chain_cost([5, 7]), matrix_chain_cost([10, 30, 5, 60]))  # 0 4500
```

I checked this against a brute force over every bracketing, on 300 random chains of 1 to 6 matrices.

Complexity: O(n³) time for n matrices. There are O(n²) intervals, and each tries up to n splits. Space is O(n²).

### Recognition

- **The input is one sequence**, and an operation merges, splits, removes or combines **contiguous** pieces. The cost depends on the piece's boundaries or its neighbours.
- **The order of operations changes the total**, and you're asked for the best order.
- **n is small** (hundreds, not hundreds of thousands), because O(n³) is the usual price.
- **Ask yourself: "which single decision, if I fix it, splits the range into two parts that no longer affect each other?"** Sometimes that decision is the first operation, and sometimes it's the last. Pick whichever one makes the halves independent.
- Burst Balloons shows these signals.

How is this different from prefix DP? If every decision only ever eats from one end, a prefix index is enough. Palindrome checks from Part 15 were range-shaped too. But they only shrink from both ends and never try a split point, so they're O(n²).

### Pitfalls

- **Wrong loop order.** If you loop i from 0 upward with j inside, you read cells that aren't finished yet. Loop by length instead, or loop i downward from n-1 with j going upward.
- **Off-by-one in the split range.** k goes from i to j-1 inclusive. k = j would leave the right half empty.
- **Boundary index.** The combined shape uses `dims[j+1]`, not `dims[j]`. For n matrices, `dims` has n + 1 entries.
- **Single element.** One matrix costs 0. `matrix_chain_cost([5, 7])` returns 0 because the length loop never runs.
- **Independence.** Sometimes fixing your chosen split doesn't make the two halves independent: the left half's choices still change the right half's costs. Then the recurrence is wrong. Change which decision you fix, instead of patching the formula.

### Active Recall

Answer out loud or on paper first.

**Q1.** What is `dp[1][3]`, and which split gives it?

**Q2.** How many (i, j, k) combinations does the loop evaluate for 4 matrices, and how does that grow?

**Q3.** Why does the final multiplication's cost depend only on `dims[i]`, `dims[k+1]` and `dims[j+1]`, not on how the halves were bracketed?

**Q4.** Could you fill the table with i going from n-1 down to 0 and j going from i+1 up to n-1, instead of by length?

{% capture coach %}
You are my coding-interview coach. I just studied interval DP in Python, taught on matrix-chain multiplication: dp[i][j] is the cheapest cost to multiply matrices A_i through A_j, with dp[i][i] = 0. Matrix k has shape dims[k] x dims[k+1]. The last multiplication splits the range at some k from i to j-1: dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1]. Once k is fixed the two halves are independent, because bracketing changes the cost but not the resulting shape. Fill by interval length, shortest first, since each cell reads only strictly shorter intervals (cells to its left in its row and below in its column). O(n^3) time, O(n^2) space.
Worked example from the lesson: dims = [40, 20, 30, 10, 30] (A0 40x20, A1 20x30, A2 30x10, A3 10x30). Table (upper triangle): row 0: 0, 24000, 14000, 26000; row 1: 0, 6000, 12000; row 2: 0, 9000; row 3: 0. For dp[0][3]: k=0 gives 0 + 12000 + 40*20*30 = 36000; k=1 gives 24000 + 9000 + 40*30*30 = 69000; k=2 gives 14000 + 0 + 40*10*30 = 26000, the minimum. Best bracketing ((A0 (A1 A2)) A3).
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. What is dp[1][3], and which split gives it?
2. How many (i, j, k) combinations does the loop evaluate for 4 matrices, and how does that grow?
3. Why does the final multiplication's cost depend only on dims[i], dims[k+1] and dims[j+1], not on how the halves were bracketed?
4. Could you fill the table with i going from n-1 down to 0 and j going from i+1 up to n-1, instead of by length?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. In Burst Balloons you have to find the decision that splits the range into independent halves from scratch. So the problem list already gives this module a full workout on its own.

### Transfer test

n files sit in a row with sizes `s[0..n-1]`. You may only merge two **adjacent** files, and a merge costs the sum of the two sizes. Keep merging until one file remains; minimize the total cost. Would you use interval DP? Why?

{% capture coach %}
You are my coding-interview coach. I just learned interval DP (dp[i][j] is the best answer for a contiguous range; fix one decision, such as the last operation, that splits the range into two independent halves, try every split point, and fill by range length; usually O(n^3)). Scenario: n files sit in a row with sizes s[0..n-1]. You may only merge two adjacent files, and a merge costs the sum of the two sizes. Keep merging until one file remains; minimize the total cost.
Ask me whether I would use interval DP here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

**How the modules connect to 2-D DP.** Every module made the same three moves:

1. Name the subproblem with two numbers.
2. Write the recurrence from the last decision.
3. Fill the table in an order where every cell you read is already final.

What changed from module to module was what the two numbers meant:

| Shape | State | Reads | Fill order |
| --- | --- | --- | --- |
| Grid | (row, column) | above, left | row by row |
| Time and mode | (day, mode) | yesterday's allowed modes | day by day, all modes at once |
| Items and budget, used once | (items seen, budget) | previous row, same or smaller budget | one array, budget downward |
| Items and budget, reusable | (item types seen, budget) | same row, smaller budget | one array, budget upward |
| Two prefixes | (length of a, length of b) | up, left, up-left | row by row |
| Range | (left end, right end) | strictly shorter ranges | by length |

The Graphs connection shows up in the last column. Think of the cells as nodes and each "reads" as an edge. Then a fill order is a topological order of that DAG: an order where every node comes after everything it depends on. When the order isn't a simple sweep, top-down memoization (Part 15) finds it for you, as long as there are no cycles. If there are cycles, the problem was never a DP.

**Distinguishing competing approaches.**

- **DP vs greedy.** Before writing any table, look for a small example where the obvious greedy choice fails. Value per kilo gave 8 instead of 9. For 12, biggest-square-first gives four squares instead of three (9 + 1 + 1 + 1 against 4 + 4 + 4). If you can't break the greedy, and you can argue that swapping in the greedy choice never makes things worse, use greedy ([Part 13](/blogs/dsa-greedy/)).
- **DP vs graph search.** If the dependencies can form cycles (moves in every direction, arbitrary costs), use BFS or Dijkstra.
- **DP vs backtracking.** "List every solution" is backtracking. "Count them", "find the best one" or "does one exist", with overlapping subproblems, is DP.
- **Which DP.** The inputs usually tell you. Is it one grid? One list plus a numeric target? Two strings? One sequence plus a rule about recent history? Or one sequence whose pieces get merged or split?

**A recognition checklist for an unfamiliar problem.**

1. Can I describe a subproblem with one number? If the future also depends on something else, that something is my second index.
2. What is the last decision (last move, last item, last character, last operation)? Which smaller subproblems does each choice leave?
3. Are those smaller subproblems independent? Do they overlap across different branches? If they overlap, DP pays off.
4. What is the answer when one index is at its border (empty grid row, empty bag, empty string, single-element range)? That's the base case, and it isn't always 0.
5. Which cells does a cell read? Pick a fill order where they all come earlier. If no such order exists, it's not a DP.
6. Can I keep only one row? Check which old values the overwrite destroys (the up-left diagonal, or the 0/1 vs unbounded direction).
7. Is the second number small enough to fit in a table? (A budget of 10^9 isn't.)

## The problems

Solve them with the cycle from [Part 1](/blogs/dsa-the-method/):

- a 15-minute honest struggle,
- a one-sentence key insight once you have it,
- and spaced repetition.

For DP, define three things before writing any code: what the state represents, what the recurrence is, and what the base cases are. For 2-D, add two more: what the two indices are, and which cells a cell reads (which tells you the order that fills the table). If you're stuck, get the recurrence from a video walkthrough of the problem. Then write the recurrence, then the memoized version, then the tabulation.

{% include dsa-problems.html slug="dsa-2d-dynamic-programming" %}

## Take this lesson as a live session

If you'd rather be taught and quizzed interactively, open the prompt this post was written from, already filled in for 2-D dynamic programming.

{% capture coach %}
[TOPIC]: 2-D Dynamic Programming
[PREREQUISITES]: 2-Dimension DP, 0 / 1 Knapsack, Unbounded Knapsack, LCS
[PROBLEM LIST]: Unique Paths, Longest Common Subsequence, Best Time to Buy And Sell Stock With Cooldown, Coin Change II, Target Sum, Interleaving String, Longest Increasing Path In a Matrix, Distinct Subsequences, Edit Distance, Burst Balloons, Regular Expression Matching
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
