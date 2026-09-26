---
layout: post
title: "Every graph problem asks one question first: have I been here before?"
date: 2024-03-04 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, graphs, union-find, python, series]
read_time: 50
permalink: /blogs/dsa-graphs/
excerpt: "Grids, adjacency lists, BFS layers, three-colour cycle detection and Union-Find, taught so the thirteen graph problems stop looking like thirteen different problems."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 14
series_total: 19
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers graphs: grids and adjacency lists, depth-first and breadth-first search on both, three-colour cycle detection with the ordering it gives for free, and Union-Find, followed by the thirteen problems they unlock.

A graph is what you get when you stop assuming your data is a line (arrays), a chain (linked lists) or a hierarchy (trees). Things connect to other things, possibly in loops, possibly in several disconnected pieces, and the question is almost always some version of "what can I reach from here, how fast, and in what order". The traversal itself is not new. It's the DFS and BFS from [Trees](/blogs/dsa-trees/) and the mark-and-explore recursion from [Backtracking](/blogs/dsa-backtracking/), with one addition trees never needed: a record of where you've already been, because a graph can lead you back to a vertex you've already visited.

The prerequisites here are Intro to Graphs, Matrix DFS, Matrix BFS and Adjacency List. The problem list also needs two things those don't teach. Directed cycle detection and ordering are folded into Adjacency List here. Union-Find gets its own short module at the end. Graphs comes after [Backtracking](/blogs/dsa-backtracking/) in the order this series follows, and unlocks [Advanced Graphs](/blogs/dsa-advanced-graphs/) (weighted shortest paths, spanning trees, the full topological sort) and [2-D DP](/blogs/dsa-2d-dynamic-programming/).

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Intro to Graphs

### Foundation

A graph is a set of **vertices** (nodes) and a set of **edges** (connections between pairs of vertices). That's the whole definition. Everything else is a property of the edges:

- **Directed or undirected.** A follow on a social network is directed (I follow you, you might not follow me). A friendship is undirected. An undirected edge is just a directed edge in both directions.
- **Cycles.** A path that returns to its start. Trees are exactly the graphs where this can't happen.
- **Connected components.** The separate pieces. A graph doesn't have to be one piece.

With V vertices there are at most V² directed edges, so E can be anywhere from 0 to roughly V². That range is why representation matters.

### Mechanics

Interview problems hand you graphs in three shapes:

1. **A grid (matrix).** Each cell is a vertex, and its neighbours are the cells up, down, left and right. The edges are never stored. You compute them from `(r ± 1, c)` and `(r, c ± 1)` when you need them.
2. **An adjacency matrix.** A V × V table where `matrix[u][v] == 1` means an edge u → v. Checking one edge is O(1), but the table always costs V² memory, however few edges there are.
3. **An adjacency list.** For every vertex, a list of its neighbours. It costs O(V + E) memory and makes "iterate over u's neighbours" cost exactly deg(u). This is what you build from an edge list almost every time.

The worked example for this module: n = 5 vertices, undirected edges `[[0, 1], [0, 2], [1, 2], [3, 4]]`.

The key property: in an undirected adjacency list, every edge appears twice, once in each endpoint's list. So the list lengths (the degrees) add up to 2E. Here that's 2 + 2 + 2 + 1 + 1 = 8 = 2 × 4.

### Diagram

<figure class="sketch">{% include sketches/dsa-graphs/intro-graph.svg %}<figcaption>The example graph: the triangle 0, 1, 2 is one component, the edge 3–4 (violet) is another.</figcaption></figure>

The same graph as an adjacency matrix and as an adjacency list:

<figure class="sketch">{% include sketches/dsa-graphs/intro-representations.svg %}<figcaption>Blue marks the stored edges: 8 of the matrix's 25 cells are 1, and the list holds exactly those 8 entries.</figcaption></figure>

### Implementation

```python
def to_matrix(n, edges, directed=False):
    # n x n table of 0/1; matrix[u][v] == 1 means an edge u -> v exists
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] = 1
        if not directed:
            matrix[v][u] = 1  # undirected edge {u, v} is stored in both cells
    return matrix


def to_adj_list(n, edges, directed=False):
    # adj[u] lists every v with an edge u -> v
    # All n keys are created up front, so a vertex with no edges still
    # appears (with n = 3 and no edges: {0: [], 1: [], 2: []}).
    adj = {u: [] for u in range(n)}
    for u, v in edges:
        adj[u].append(v)
        if not directed:
            adj[v].append(u)  # edge [0, 1] puts 1 in adj[0] and 0 in adj[1]
    return adj


edges = [[0, 1], [0, 2], [1, 2], [3, 4]]
print(to_adj_list(5, edges))
# {0: [1, 2], 1: [0, 2], 2: [0, 1], 3: [4], 4: [3]}
print(to_adj_list(5, edges, directed=True))
# {0: [1, 2], 1: [2], 2: [], 3: [4], 4: []}
```

Building either takes O(E) after initialisation. The matrix costs O(V²) time and space to initialise. The list costs O(V + E) in total.

### Recognition

- Any time the input is "n things and a list of pairs", build an adjacency list first. That covers Course Schedule, Course Schedule II, Graph Valid Tree, Number of Connected Components In An Undirected Graph and Redundant Connection.
- A 2-D grid where cells relate to their neighbours is a graph with implicit edges. Don't convert it to an adjacency list. Number of Islands, Max Area of Island, Walls And Gates, Rotting Oranges, Pacific Atlantic Water Flow and Surrounded Regions all work straight on the grid.
- Clone Graph hands you the adjacency list already built into node objects (`node.neighbors`).
- Reach for an adjacency matrix only when V is small and you need constant-time "is there an edge u → v?" checks.

### Pitfalls

- **Forgetting the reverse edge** for undirected input. You'll get a traversal that works from one side of the graph and not the other.
- **Missing isolated vertices.** If you build with a `defaultdict` and never touch vertex k, then `adj` has no key k. Looping over `adj` instead of `range(n)` silently skips it. That matters when you're counting components.
- **Self-loops in undirected input.** Edge `[0, 0]` with the code above gives `adj[0] == [0, 0]`, one append for each direction. That's harmless for a traversal, since 0 is already marked when it sees itself. But if you read `len(adj[0])` as "number of distinct neighbours", you get 2 for a vertex whose only neighbour is itself.
- **Choosing the matrix for a big sparse graph.** Take V = 10⁵ and E = 2 × 10⁵. The matrix has 10¹⁰ cells, and the list has 4 × 10⁵ entries.

### Active Recall

1. The adjacency list above has 8 entries for 4 edges. Why? And how many would the directed version have?

2. You need to answer "is there an edge between 3 and 4?" thousands of times. What does each representation cost per query, and how would you fix the list's cost?

3. How many connected components does the example graph have, and is the component containing vertex 0 a tree?

4. A 4 × 4 grid with no walls is a graph. How many vertices does it have, what's the maximum degree, and why wouldn't you build an adjacency list for it?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Intro to Graphs in Python: a graph is a set of vertices and a set of edges, directed or undirected, possibly with cycles and possibly in several connected components. Interview problems hand you graphs as a grid (each cell is a vertex; neighbours are computed from (r ± 1, c) and (r, c ± 1), never stored), an adjacency matrix (a V x V table, O(1) edge check, always V² memory) or an adjacency list (each vertex's list of neighbours, O(V + E) memory, iterating u's neighbours costs deg(u)). In an undirected adjacency list every edge is appended at both endpoints, so the list lengths add up to 2E.
Worked example from the lesson: n = 5 vertices, undirected edges [[0, 1], [0, 2], [1, 2], [3, 4]]. Adjacency list {0: [1, 2], 1: [0, 2], 2: [0, 1], 3: [4], 4: [3]}, 8 entries; the adjacency matrix has 25 cells, 8 of them 1. Built as directed, the list is {0: [1, 2], 1: [2], 2: [], 3: [4], 4: []}.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. The adjacency list above has 8 entries for 4 edges. Why? And how many would the directed version have?
2. You need to answer "is there an edge between 3 and 4?" thousands of times. What does each representation cost per query, and how would you fix the list's cost?
3. How many connected components does the example graph have, and is the component containing vertex 0 a tree?
4. A 4 x 4 grid with no walls is a graph. How many vertices does it have, what's the maximum degree, and why wouldn't you build an adjacency list for it?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: none of the problems on this list exercises degree counting on its own (they all use the graph inside a traversal), so this checkpoint is included.

A town has n people labelled 1 to n. `trust` is a list of pairs `[a, b]` meaning "a trusts b". No pair appears twice, and nobody trusts themselves. There's a rumour that one person is the town judge. The judge trusts nobody, and everybody else trusts the judge. Return the judge's label, or -1 if no such person exists. For example, n = 3 and trust = `[[1, 3], [2, 3]]` returns 3.

Before asking for help, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A town has n people labelled 1 to n. trust is a list of pairs [a, b] meaning "a trusts b". No pair appears twice, and nobody trusts themselves. There's a rumour that one person is the town judge. The judge trusts nobody, and everybody else trusts the judge. Return the judge's label, or -1 if no such person exists. For example, n = 3 and trust = [[1, 3], [2, 3]] returns 3.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

You're storing a social network with a billion users, each with about 200 friends, and the most common operation is "list this user's friends". Adjacency matrix or adjacency list? Would you use it? Why?

{% capture coach %}
You are my coding-interview coach. I just learned adjacency matrices versus adjacency lists (a matrix is a V x V table with O(1) edge checks and V² memory; a list stores each vertex's neighbours in O(V + E) memory and lists them in O(degree)). Scenario: You're storing a social network with a billion users, each with about 200 friends, and the most common operation is "list this user's friends".
Ask me whether I would use an adjacency matrix or an adjacency list here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Matrix DFS

### Foundation

Think of a paint bucket tool. You click one pixel and every same-coloured pixel connected to it changes colour, spreading until it hits a boundary. That's depth-first search on a grid: go as deep as you can in one direction, back up when you're blocked, try the next direction. It answers "which cells can I reach from here?", and every time a cell is reached you can collect something from it.

### Mechanics

The worked example is a 4 × 4 grid, where 0 is open and 1 is a wall:

<figure class="sketch">{% include sketches/dsa-graphs/grid.svg %}<figcaption>The worked grid. Hatched grey cells are walls (1); the rest are open (0).</figcaption></figure>

Flood fill from (0, 0) marks every reachable open cell as 2:

1. `dfs(r, c)` first checks whether the cell is off the grid, a wall, or already marked. If any is true, return. This one guard is the base case.
2. Otherwise mark `grid[r][c] = 2` **before** recursing.
3. Recurse into the four neighbours.

Why marking before recursing is the decision that matters: (0, 0) recurses into (0, 1), and (0, 1)'s neighbour list includes (0, 0) again. If (0, 0) were still 0 at that moment, the two cells would call each other forever. I ran a version that marks after the recursive calls on this grid and got a `RecursionError`. Marking first means that when (0, 1) looks back, it sees 2 and stops.

The invariant: **every cell is marked at most once, and once marked it is never explored again.** That's what makes the total work proportional to the grid size.

Matrix DFS has a second classic use: counting **paths** from the top-left to the bottom-right. That changes one thing. A cell can sit on many different paths, so it's marked only while it's on the current path and unmarked on the way back out. That's the backtracking pattern. Flood fill asks "is this cell reachable?", which has one answer per cell. Path counting asks "how many routes are there?", where a cell can be reused by different routes.

### Diagram

The order flood fill discovers cells from (0, 0), with directions tried as down, up, right, left:

<figure class="sketch">{% include sketches/dsa-graphs/dfs-order.svg %}<figcaption>Discovery order from the blue start cell (0, 0). Green cells are reached, grey cells are walls, and the plain cell (3, 0) is open but never reached.</figcaption></figure>

Follow the numbers. It goes right to (0, 1), down to (1, 1), down to (2, 1), and hits a dead end. It backs up to (1, 1), goes right to (1, 2), up to (0, 2), and hits another dead end. It backs up to (1, 2), goes right to (1, 3), then down, down, left. (3, 0) is open but boxed in by walls, so no path reaches it. The two simple paths to (3, 3) that path counting finds, 6 moves each:

<figure class="sketch">{% include sketches/dsa-graphs/dfs-paths.svg %}<figcaption>Path A (blue) goes down at (0, 1), path B (amber) goes right; both take 6 moves and share (1, 2), (1, 3), (2, 3). Grey cells are walls.</figcaption></figure>

### Implementation

```python
def flood_fill(grid, r, c):
    """Mark every open (0) cell reachable from (r, c) as 2. Mutates grid."""
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        # One guard covers every reason to stop: off the grid, a wall (1),
        # or already marked (2). Only an unmarked open cell (0) gets past it.
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != 0:
            return
        grid[r][c] = 2  # mark BEFORE recursing: when (0, 1) looks back at (0, 0), it sees 2 and stops
        dfs(r + 1, c)   # down
        dfs(r - 1, c)   # up
        dfs(r, c + 1)   # right
        dfs(r, c - 1)   # left

    dfs(r, c)
    return grid


def count_paths(grid, r, c, visit):
    """Count simple paths from (r, c) to the bottom-right cell through open (0) cells."""
    rows, cols = len(grid), len(grid[0])
    if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 1 or (r, c) in visit:
        return 0
    if (r, c) == (rows - 1, cols - 1):
        return 1
    visit.add((r, c))  # (r, c) is on the CURRENT path only
    total = (count_paths(grid, r + 1, c, visit) + count_paths(grid, r - 1, c, visit)
             + count_paths(grid, r, c + 1, visit) + count_paths(grid, r, c - 1, visit))
    visit.remove((r, c))  # unmark: path A and path B both pass through (1, 2)
    return total


grid = [[0, 0, 0, 1],
        [1, 0, 0, 0],
        [1, 0, 1, 0],
        [0, 1, 0, 0]]
print(count_paths(grid, 0, 0, set()))  # 2
flood_fill(grid, 0, 0)
# grid is now [[2,2,2,1], [1,2,2,2], [1,2,1,2], [0,1,2,2]]; (3, 0) stays 0
```

Flood fill on an R × C grid takes O(R · C) time, because each cell is marked once and each marked cell checks 4 neighbours. Space is O(R · C) for the recursion stack in the worst case (a snake-shaped region). Path counting is exponential in the worst case, because it enumerates paths rather than cells.

Edge cases I ran: starting on a wall (0, 3) marks nothing. Starting on the isolated (3, 0) marks only (3, 0). A 1 × 1 grid `[[0]]` becomes `[[2]]`. For path counting, `[[0]]` gives 1, `[[0, 1], [1, 0]]` gives 0, and an open 2 × 2 gives 2.

### Recognition

- Signals: a grid, and words like "connected", "region", "island", "enclosed", "reachable", "flows to". The question is about a whole group of cells, not the distance to one of them.
- On this list: Number of Islands, Max Area of Island, Pacific Atlantic Water Flow and Surrounded Regions all show these signals.
- Not DFS when the question is "fewest steps" or "minimum time". DFS reaches a cell by whichever path it tries first, not the shortest one. That's BFS, the next module.
- Flood fill (mark permanently) versus path enumeration (mark and unmark): if the answer depends on the route taken, you're backtracking, and the cost is exponential.

### Pitfalls

- **Marking after recursing** causes infinite recursion (the `RecursionError` above).
- **Recursion depth.** An all-open 200 × 200 grid can need a call stack 40,000 frames deep, and CPython's default limit is 1000 (recalled; `sys.getrecursionlimit()` printed 1000 on my machine). Use an explicit stack (the Iterative DFS pattern from Trees) or raise the limit.
- **Mutating input you're not allowed to touch.** If the grid must survive, use a separate `visited` set, at the cost of O(R · C) extra space.
- **Bounds check order.** Check `0 <= r < rows` before reading `grid[r][c]`. Python's `grid[-1]` doesn't crash. It quietly reads the last row.
- **Forgetting to unmark in path counting.** I ran the version without `visit.remove`, and it returns 1 instead of 2, because path A's marks block path B.

### Active Recall

1. Why must `grid[r][c] = 2` happen before the four recursive calls, and not after them?

2. On the example grid, what does `flood_fill(grid, 3, 0)` mark? And `flood_fill(grid, 0, 3)`?

3. `flood_fill` never unmarks, but `count_paths` does. What goes wrong if `count_paths` stops unmarking?

4. What are the time and space costs of flood fill on an R × C grid, and what's the worst-case shape for space?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Matrix DFS (flood fill and path counting on a grid) in Python: dfs(r, c) has one guard that returns if the cell is off the grid, a wall, or already marked; otherwise it marks the cell (grid[r][c] = 2) BEFORE recursing into the four neighbours. The invariant is that every cell is marked at most once and never explored again, so flood fill costs O(R · C) time and O(R · C) stack in the worst case. Counting paths is different: a cell is added to a visit set only while it is on the current path and removed on the way back out (backtracking), which is exponential in the worst case.
Worked example from the lesson: a 4 x 4 grid where 0 is open and 1 is a wall, rows [0,0,0,1], [1,0,0,0], [1,0,1,0], [0,1,0,0]. Flood fill from (0, 0), directions tried down, up, right, left, discovers (0,0), (0,1), (1,1), (2,1), (1,2), (0,2), (1,3), (2,3), (3,3), (3,2) in that order; (3, 0) is open but boxed in by walls and never reached. Path counting from (0, 0) to (3, 3) finds 2 simple paths: A = (0,0) (0,1) (1,1) (1,2) (1,3) (2,3) (3,3) and B = (0,0) (0,1) (0,2) (1,2) (1,3) (2,3) (3,3).
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Why must grid[r][c] = 2 happen before the four recursive calls, and not after them?
2. On the example grid, what does flood_fill(grid, 3, 0) mark? And flood_fill(grid, 0, 3)?
3. flood_fill never unmarks, but count_paths does. What goes wrong if count_paths stops unmarking?
4. What are the time and space costs of flood fill on an R x C grid, and what's the worst-case shape for space?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: Pacific Atlantic Water Flow and Surrounded Regions each need their own derivation of how to apply flood fill, beyond running one, so this checkpoint is skipped and that reasoning happens when you solve them.

### Transfer test

An image editor's "magic wand" selects every pixel connected to the clicked pixel whose colour is within a tolerance of the clicked colour. Images are up to 4000 × 3000. Would you use matrix DFS? Why?

{% capture coach %}
You are my coding-interview coach. I just learned matrix DFS (flood fill) (mark a cell before recursing into its four neighbours, so every reachable cell is visited exactly once). Scenario: An image editor's "magic wand" selects every pixel connected to the clicked pixel whose colour is within a tolerance of the clicked colour. Images are up to 4000 x 3000.
Ask me whether I would use matrix DFS (flood fill) here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Matrix BFS

### Foundation

Drop a stone in a pond. The ripple reaches everything 1 unit away, then everything 2 units away, then 3. Breadth-first search works the same way. It visits cells in rings of equal distance from the start, so the first time it reaches any cell, it has reached it by the shortest route. It answers "what's the fewest number of moves?" when every move costs the same.

### Mechanics

Same grid, same start (0, 0), target (3, 3).

1. Put the start in a queue and mark it seen.
2. Process the queue **one layer at a time**. Read `len(q)` once, pop exactly that many cells, and push their unseen open neighbours. When the layer is done, `steps += 1`.
3. When the target is popped, return `steps`.

The invariant: **at the start of each layer, the queue holds exactly the cells at distance `steps`, and every closer cell has already been popped.** A cell's neighbours are at most one further away, so everything pushed during layer k is at distance k + 1. No shorter route can turn up later, because all shorter distances were fully processed first.

Mark cells **when you enqueue them**, not when you pop them. A cell can be adjacent to several cells in the current layer. Marking on push means it enters the queue once. Marking on pop lets duplicates in. I counted pushes: 10 versus 11 on this grid, and 9 versus 13 on an open 3 × 3.

The multi-source variant: if there are several starting cells, push **all** of them at distance 0 before the loop starts. Every cell then gets the distance to its **nearest** source. It's correct because it's the same as adding one imaginary vertex joined to every source and running ordinary BFS from it. Every distance shifts by one layer, and nothing else changes, in the reasoning or in the code.

### Diagram

The distance of each cell from (0, 0), which is also the layer it's popped in:

<figure class="sketch">{% include sketches/dsa-graphs/bfs-layers.svg %}<figcaption>Each cell's distance from the blue source (0, 0), which is also the layer it is popped in. The green target (3, 3) pops in layer 6. Grey cells are walls; the plain cell (3, 0) is never reached.</figcaption></figure>

The same grid with two sources, (0, 0) and (3, 3), seeded together at distance 0:

<figure class="sketch">{% include sketches/dsa-graphs/bfs-multi-source.svg %}<figcaption>Both blue cells seeded at distance 0. Every number is now the distance to the nearer source; amber cells got closer than in the single-source run.</figcaption></figure>

(1, 3) drops from 4 to 2, because (3, 3) is closer. (3, 2) drops from 7 to 1.

### Implementation

```python
from collections import deque


def shortest_path(grid, sources, target):
    """Fewest moves from any cell in `sources` to `target` through open (0) cells; -1 if unreachable."""
    rows, cols = len(grid), len(grid[0])
    q = deque()  # (recalled: deque.popleft is O(1); list.pop(0) is O(n))
    seen = set()
    for r, c in sources:
        if grid[r][c] == 0:
            q.append((r, c))
            seen.add((r, c))  # mark on ENQUEUE, so each cell is pushed at most once
    steps = 0
    while q:
        # Invariant: q holds exactly the cells at distance `steps` from the
        # nearest source. With source (0, 0): steps = 2 -> q = [(1, 1), (0, 2)].
        for _ in range(len(q)):  # range(len(q)) is evaluated once, so only this layer is popped
            r, c = q.popleft()
            if (r, c) == target:
                return steps
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    q.append((nr, nc))
        steps += 1
    return -1  # queue ran dry: target is in a different region, like (3, 0)


grid = [[0, 0, 0, 1],
        [1, 0, 0, 0],
        [1, 0, 1, 0],
        [0, 1, 0, 0]]
print(shortest_path(grid, [(0, 0)], (3, 3)))          # 6
print(shortest_path(grid, [(0, 0)], (3, 0)))          # -1
print(shortest_path(grid, [(0, 0), (3, 3)], (1, 3)))  # 2
print(shortest_path([[0]], [(0, 0)], (0, 0)))         # 0
print(shortest_path([[1]], [(0, 0)], (0, 0)))         # -1: the only source is a wall
```

Time O(R · C), because each cell is pushed and popped at most once and checks 4 neighbours. Space O(R · C) for `seen` and the queue.

### Recognition

- Signals: "minimum number of steps / moves / minutes / transformations", with every move costing the same. If the answer is a count of hops, think BFS.
- Several starting points spreading at the same time ("every X affects its neighbours each minute", "distance to the nearest Y") means multi-source BFS. Walls And Gates and Rotting Oranges show this signal.
- The graph doesn't have to be a grid. Word Ladder asks for a minimum number of transformations, so it's BFS over vertices you generate yourself.
- Not BFS when moves have different costs. That's Dijkstra ([Advanced Graphs](/blogs/dsa-advanced-graphs/)). And not needed when you only care whether a cell is reachable, not how far it is. DFS is simpler there.

### Pitfalls

- **Marking on pop** lets duplicates into the queue (11 versus 10 pushes here, 13 versus 9 on an open 3 × 3). The answer is still right, but the work grows. With several sources it's also easy to count a cell twice.
- **Incrementing `steps` per pop instead of per layer.** Then `steps` counts cells processed, not distance.
- **Returning `steps` off by one.** Decide whether you count moves (start = 0) or cells on the path (start = 1), and check it against a 1 × 1 grid. Here `[[0]]` returns 0.
- **Using a list as the queue.** `list.pop(0)` shifts every element, so the loop turns quadratic.
- **A blocked source.** If the start cell is a wall, return -1 before the loop, which is what the `grid[r][c] == 0` check in the seeding loop does.

### Active Recall

1. Why is the first time BFS pops (3, 3) guaranteed to give the shortest distance?

2. Marking on enqueue gave 10 pushes on this grid. Marking on pop gave 11. Where does the extra push come from?

3. With sources (0, 0) and (3, 3) seeded together, (3, 2) gets distance 1. What does each number in that grid mean now, and why does seeding both at distance 0 produce it?

4. What breaks if you replace the `for _ in range(len(q))` loop with a plain `while q:` that pops one cell and then does `steps += 1`?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Matrix BFS (shortest paths on a grid) in Python: put the start in a queue (collections.deque) and mark it seen; process the queue one layer at a time by reading len(q) once and popping exactly that many cells, pushing their unseen open neighbours, then steps += 1. Invariant: at the start of each layer the queue holds exactly the cells at distance steps, and every closer cell has already been popped, so the first time the target is popped its distance is the shortest. Cells are marked when enqueued, not when popped. Multi-source BFS seeds every source at distance 0, which gives each cell its distance to the nearest source.
Worked example from the lesson: a 4 x 4 grid where 0 is open and 1 is a wall, rows [0,0,0,1], [1,0,0,0], [1,0,1,0], [0,1,0,0], start (0, 0), target (3, 3). Layers: 0: (0,0); 1: (0,1); 2: (1,1) (0,2); 3: (2,1) (1,2); 4: (1,3); 5: (2,3); 6: (3,3), so the answer is 6; (3,2) would be layer 7. Mark-on-enqueue makes 10 pushes on this grid, mark-on-pop makes 11. With sources (0, 0) and (3, 3) seeded together, (1, 3) drops from 4 to 2 and (3, 2) from 7 to 1.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Why is the first time BFS pops (3, 3) guaranteed to give the shortest distance?
2. Marking on enqueue gave 10 pushes on this grid. Marking on pop gave 11. Where does the extra push come from?
3. With sources (0, 0) and (3, 3) seeded together, (3, 2) gets distance 1. What does each number in that grid mean now, and why does seeding both at distance 0 produce it?
4. What breaks if you replace the for _ in range(len(q)) loop with a plain while q: that pops one cell and then does steps += 1?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: Word Ladder has to be derived from scratch, starting with what counts as a vertex and what counts as a neighbour, before any BFS runs, so this checkpoint is skipped and that derivation happens when you solve it.

### Transfer test

A warehouse robot moves on a grid. Most floor tiles take 1 second to cross, but some are sticky and take 5 seconds. You want the fastest route from dock to shelf. Would you use matrix BFS? Why?

{% capture coach %}
You are my coding-interview coach. I just learned matrix BFS (visit cells in rings of equal distance, so the first arrival at a cell is the shortest route when every move costs the same). Scenario: A warehouse robot moves on a grid. Most floor tiles take 1 second to cross, but some are sticky and take 5 seconds. You want the fastest route from dock to shelf.
Ask me whether I would use matrix BFS here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Adjacency List

### Foundation

Grids come with their edges built in. Most other graphs arrive as a list of pairs, and you build the adjacency list yourself (from the first module). Then DFS and BFS work exactly as they did on grids, except "the four neighbours" becomes "`adj[u]`". The new thing is **direction**. A directed edge u → v means "u leads to v" or "u must come before v", and that raises a question grids never did: can following the arrows bring you back to where you started? For dependencies ("build step u must run before step v"), a loop means no valid order exists. When there's no loop, you want an order.

### Mechanics

The worked example: 6 build steps, directed edges `[[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 4]]`, where u → v means "u before v".

**BFS on an adjacency list** is the Matrix BFS loop with `for v in adj[u]` as the neighbour loop. From 0, the fewest hops to 4 is 3 (0 → 1 → 3 → 4). From 4 to 0 it's -1, because edges only go one way.

**Directed cycle detection with three colours.** A plain `visited` set isn't enough in a directed graph. Every vertex gets a colour:

- **WHITE**: not visited yet.
- **GRAY**: visited, and still on the current recursion path (we're inside its `dfs` call).
- **BLACK**: finished. Every vertex reachable from it has been explored, and none of them led back.

When `dfs(u)` looks at a neighbour v:

- v is **GRAY**: v is an ancestor of u on the current path, so there's a path v → … → u, and the edge u → v closes it into a cycle. Report the cycle.
- v is **WHITE**: recurse into v.
- v is **BLACK**: skip v. Is that safe? For u → v to be part of a cycle, v would need a path back to u. If it had one, v's own DFS would have walked that path. It would either have met u as GRAY and reported the cycle, or found u WHITE, visited it, and finished it, in which case u would already be BLACK and could not be GRAY now. Neither happened, so the path doesn't exist.

The BLACK case is why two colours aren't enough. In the example, 0 → 1 → 3 and 0 → 2 → 3 both reach 3 (a diamond). When `dfs(2)` looks at 3, 3 has already been visited through 1, but that's two routes to the same place, not a loop. I ran a visited-only version on this DAG and it wrongly reports a cycle.

**Ordering for free.** Record each vertex when it turns BLACK (postorder). Then reverse the list. For every edge u → v, u comes before v. Why: when `dfs(u)` examines v, either v is WHITE (so it recurses and v finishes first), or v is already BLACK (already finished). GRAY would be a cycle. Either way v finishes before u, so v is earlier in the postorder and later in the reversed list.

Finally, loop over **every** vertex and start a DFS from each one still WHITE. The graph may not be reachable from vertex 0 (vertex 5 isn't).

### Diagram

<figure class="sketch">{% include sketches/dsa-graphs/dag.svg %}<figcaption>The six build steps; u → v means u before v. The dashed red edge 4 → 1 exists only in the cycle run.</figcaption></figure>

The trace I got from running the code on the six real edges (no dashed edge):

<figure class="sketch">{% include sketches/dsa-graphs/dfs-colour-trace.svg %}<figcaption>Each row shows every vertex's colour after the event: plain is WHITE, amber is GRAY (on the current path), green is BLACK (finished).</figcaption></figure>

With the dashed edge 4 → 1 added:

<figure class="sketch">{% include sketches/dsa-graphs/dfs-cycle.svg %}<figcaption>With 4 → 1 added, DFS reaches 4 with 0, 1, 3, 4 GRAY (amber). The edge 4 → 1 points at a GRAY vertex, so the red edges form the cycle.</figcaption></figure>

### Implementation

```python
from collections import deque

WHITE, GRAY, BLACK = 0, 1, 2


def build(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)  # directed: u -> v only
    return adj


def bfs_hops(adj, src, dst):
    q, seen, steps = deque([src]), {src}, 0
    while q:
        for _ in range(len(q)):  # one layer = every vertex exactly `steps` hops from src
            u = q.popleft()
            if u == dst:
                return steps
            for v in adj[u]:
                if v not in seen:
                    seen.add(v)
                    q.append(v)
        steps += 1
    return -1


def cycle_or_order(n, adj):
    """Return (True, []) if a directed cycle exists, else (False, order) with u before v for every edge u -> v."""
    color = [WHITE] * n
    post = []

    def dfs(u):
        color[u] = GRAY  # u is on the current recursion path
        for v in adj[u]:
            if color[v] == GRAY:
                return True  # v is an ancestor of u still on the path: edge u -> v closes a loop (4 -> 1 above)
            if color[v] == WHITE and dfs(v):
                return True
            # color[v] == BLACK: v already finished without reaching a GRAY vertex,
            # so edge u -> v can't be part of a cycle (edge 2 -> 3 above)
        color[u] = BLACK  # every path out of u explored, none looped back
        post.append(u)    # v finished before u for every edge u -> v
        return False

    for u in range(n):  # vertices 0..n-1: vertex 5 is not reachable from 0, so this loop is what finds it
        if color[u] == WHITE and dfs(u):
            return True, []
    return False, post[::-1]


edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 4]]
adj = build(6, edges)
print(bfs_hops(adj, 0, 4), bfs_hops(adj, 4, 0))  # 3 -1
print(cycle_or_order(6, adj))                    # (False, [5, 0, 2, 1, 3, 4])
print(cycle_or_order(6, build(6, edges + [[4, 1]])))  # (True, [])
```

Edge cases I ran: a single vertex with no edges gives `(False, [0])`. A self-loop `[[0]]` gives `(True, [])`, since 0 is GRAY when it sees itself. Three isolated vertices give `(False, [2, 1, 0])`, which is valid because there are no edges to violate. `0 → 1, 1 → 0` gives `(True, [])`.

Time O(V + E): each vertex goes WHITE → GRAY → BLACK once, and each edge is examined once from its source. Space O(V) for colours and the recursion stack, plus the O(V + E) adjacency list.

### Recognition

- Signals: "n items and a list of pairs", "dependencies", "prerequisites", "must happen before", "is it possible to finish", "return an order". Course Schedule and Course Schedule II show the directed cycle / ordering signals. Number of Connected Components In An Undirected Graph and Graph Valid Tree show explicit-edge, undirected signals.
- Clone Graph gives you the adjacency list as objects. The `seen` structure can be a dict that maps each vertex to something you've built for it, not just a set.
- Three colours are for **directed** graphs. For undirected graphs, "have I seen this vertex, and is it not the vertex I just came from?" detects a cycle, and so does Union-Find (next module).
- Kahn's algorithm (repeatedly remove vertices with in-degree 0) is the BFS way to get the same ordering. It's taught with Topological Sort in [Advanced Graphs](/blogs/dsa-advanced-graphs/).

### Pitfalls

- **Two colours in a directed graph** give false cycles on diamonds (the visited-only version I ran says "cycle" on this DAG).
- **Three colours on an undirected graph.** Edge {0, 1} is stored as 0 → 1 and 1 → 0. `dfs(1)` sees 0 as GRAY and reports a cycle on a single edge (I ran it, and it did). For undirected graphs, pass the parent and skip it.
- **Edge direction backwards.** "[a, b] means b before a" is common in problem statements. Getting it backwards still finds cycles correctly but produces the order reversed. Check against one pair by hand.
- **Starting only from vertex 0.** Unreachable vertices never get coloured, so they're missing from the order and their cycles go undetected.
- **Forgetting to return early** once a cycle is found. The order then contains partial garbage.
- **Recursion depth.** A dependency chain of 10⁴ vertices exceeds the default recursion limit of 1000 (recalled).

### Active Recall

1. `bfs_hops(adj, 0, 4)` is 3, but `bfs_hops(adj, 4, 0)` is -1. Why doesn't reachability go both ways here, when it did in the Intro example?

2. When `dfs(2)` examines 3, 3 is BLACK. Why is skipping it safe, and what would a visited-only check have done?

3. Show that the reversed postorder `[5, 0, 2, 1, 3, 4]` has u before v for the edges 2 → 3 and 5 → 4, and explain why that holds for every edge.

4. With edge 4 → 1 added, which vertices are GRAY at the moment the cycle is detected, and which of them are on the cycle?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied traversal on an adjacency list, with three-colour directed cycle detection in Python: BFS and DFS work as on grids with for v in adj[u] as the neighbour loop. For directed cycles, every vertex is WHITE (unvisited), GRAY (on the current recursion path) or BLACK (finished, nothing reachable from it led back). In dfs(u), a GRAY neighbour means a back edge and a cycle, a WHITE one is recursed into, and a BLACK one is skipped safely. Appending each vertex to post when it turns BLACK and reversing the list gives an order with u before v for every edge u -> v. An outer loop starts a DFS from every vertex still WHITE.
Worked example from the lesson: 6 build steps, directed edges [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 4]], u -> v meaning u before v. BFS hops from 0 to 4 is 3; from 4 to 0 it is -1. The DFS finishes vertices in the order 4, 3, 1, 2, 0, 5 (when dfs(2) looks at 3, 3 is already BLACK), so the reversed postorder is [5, 0, 2, 1, 3, 4]. Adding edge 4 -> 1 makes dfs reach 4 via 0 -> 1 -> 3 -> 4 and find 1 GRAY: a cycle.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. bfs_hops(adj, 0, 4) is 3, but bfs_hops(adj, 4, 0) is -1. Why doesn't reachability go both ways here, when it did for an undirected graph built with both directions appended?
2. When dfs(2) examines 3, 3 is BLACK. Why is skipping it safe, and what would a visited-only check have done?
3. Show that the reversed postorder [5, 0, 2, 1, 3, 4] has u before v for the edges 2 -> 3 and 5 -> 4, and explain why that holds for every edge.
4. With edge 4 -> 1 added, which vertices are GRAY at the moment the cycle is detected, and which of them are on the cycle?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: Course Schedule and Course Schedule II require modelling the input as a directed graph and working out what the answer means in graph terms on your own, so this checkpoint is skipped and that happens when you solve them.

### Transfer test

A spreadsheet recalculates when a cell changes. Each cell's formula may reference other cells, and circular references must be reported as errors. Would you use the adjacency-list DFS with three colours? Why?

{% capture coach %}
You are my coding-interview coach. I just learned three-colour DFS on an adjacency list (WHITE / GRAY / BLACK colours; a GRAY neighbour is a directed cycle, and the reversed finishing order puts u before v for every edge u -> v). Scenario: A spreadsheet recalculates when a cell changes. Each cell's formula may reference other cells, and circular references must be reported as errors.
Ask me whether I would use three-colour DFS on an adjacency list here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Union-Find

The problems below also need this. Redundant Connection, Graph Valid Tree and Number of Connected Components In An Undirected Graph all ask undirected connectivity questions while edges arrive one at a time, and Union-Find answers those in near-constant time per edge.

### Foundation

Picture companies merging. Every company has one CEO at the top. To ask "do these two employees work for the same company?", each walks up the reporting chain to their CEO, and you compare CEOs. When two companies merge, one CEO starts reporting to the other, and the whole company comes along in one move. Union-Find (a disjoint set union, or DSU) is exactly that. It keeps a set of groups that only ever merge, and answers "same group?" fast.

### Mechanics

State: `parent[x]` for each vertex. A vertex with `parent[x] == x` is a **root**, the group's representative.

- **find(x)**: follow `parent` until you reach a root. That root names x's group. **Path compression**: after finding the root, point every vertex on the path directly at it, so the next find is one hop.
- **union(a, b)**: find both roots. If they're equal, a and b are already connected, so return False. Otherwise attach one root under the other and return True. **Union by size**: attach the smaller tree under the larger, so trees stay shallow.

Why union by size keeps trees shallow: a vertex gets one level deeper only when its tree is attached under a tree at least as big, which at least doubles the size of the tree it belongs to. That can happen at most log₂ n times, so depth stays at or below log₂ n. With path compression added, the amortised cost per operation is O(α(n)), where α is the inverse Ackermann function, below 5 for any practical n (recalled, not derived here).

Invariant: **two vertices have the same root if and only if the edges processed so far connect them.** A union that returns False means the edge joins two vertices that were already connected. In an undirected graph, that edge closes a cycle.

The worked example: n = 6, edges processed in order `(0, 1), (2, 3), (1, 2), (4, 5), (0, 3)`.

### Diagram

The states I got from running the code below:

<figure class="sketch">{% include sketches/dsa-graphs/dsu-states.svg %}<figcaption>The parent array after each union. Amber is the entry a union changed; cyan is the entry path compression rewrote during the last find.</figcaption></figure>

The forest before and after the last find:

<figure class="sketch">{% include sketches/dsa-graphs/dsu-forest.svg %}<figcaption>Arrows point at each vertex's parent. Roots are blue; amber vertex 3 is the one path compression moved.</figcaption></figure>

### Implementation

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))  # every vertex 0..n-1 starts as its own root
        self.size = [1] * n           # size[r] is only meaningful while r is a root
        self.components = n

    def find(self, x):
        root = x
        while self.parent[root] != root:  # climb until a vertex is its own parent
            root = self.parent[root]
        while self.parent[x] != root:     # path compression: point every vertex on the path at root
            self.parent[x], x = root, self.parent[x]  # find(3): parent[3] 2 -> 0, then x = 2, whose parent is already 0
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False  # union(0, 3): find(0) == find(3) == 0, so edge (0, 3) adds no new connection
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra  # union by size: rb is now the root of the smaller (or equal) tree
        self.parent[rb] = ra  # union(1, 2): ra = 0, rb = 2, both size 2, so 2 goes under 0
        self.size[ra] += self.size[rb]
        self.components -= 1  # two separate groups became one
        return True


d = DSU(6)
for a, b in [(0, 1), (2, 3), (1, 2), (4, 5), (0, 3)]:
    print(a, b, d.union(a, b))
print(d.parent, d.components)  # [0, 0, 0, 0, 4, 4] 2
```

Edge cases I ran: `DSU(1).union(0, 0)` returns False with 1 component. On `DSU(3)`, `union(0, 1)` returns True, then `union(1, 0)` returns False, leaving 2 components.

Time: O(α(n)) amortised per `find`/`union` (recalled), so O(n + E · α(n)) for n vertices and E edges. Space O(n).

### Recognition

- Signals: undirected connectivity; edges arriving one at a time, or all at once in no useful order; "are these connected", "how many groups", "which edge first created a cycle"; merges only, never splits. Redundant Connection, Graph Valid Tree and Number of Connected Components In An Undirected Graph show these signals.
- Versus DFS/BFS: both answer connectivity. A traversal needs the whole graph up front and gives you paths and distances. Union-Find handles edges one at a time, needs no adjacency list, but can't tell you a path or a distance.
- Not for directed graphs. Union-Find forgets direction. Edges 0 → 1, 1 → 2, 0 → 2 contain no directed cycle, but `union(0, 2)` returns False.
- Not when edges get deleted. There's no cheap "split".

### Pitfalls

- **Comparing `parent[a] == parent[b]` instead of `find(a) == find(b)`.** After `union(1, 2)` above, `parent[3] == 2` and `parent[1] == 0`, but 1 and 3 are connected.
- **Attaching a vertex instead of a root.** `parent[a] = b` without finding roots first can cut a out of its existing group.
- **Skipping both optimisations.** Unioning a chain naively (0 under 1, 1 under 2, …) gave me `parent = [1, 2, 3, 4, 4]`, a path of height 4. Finds degrade to O(n) each.
- **1-indexed input.** If vertices are labelled 1..n, allocate `n + 1` slots, or subtract 1 everywhere.
- **Counting components with a separate pass** over `parent` instead of over `find(i)`. A non-root's `parent` entry isn't its group's name.

### Active Recall

1. After `union(1, 2)`, `parent = [0, 0, 0, 2, 4, 5]`. What does `find(3)` do, step by step, and what does `parent` look like afterwards?

2. `union(0, 3)` returned False. What does that say about the graph built from these five edges?

3. Without union by size and path compression, unioning 0-1, 1-2, 2-3, 3-4 produced `parent = [1, 2, 3, 4, 4]`. What does `find(0)` cost, and how does union by size prevent that shape?

4. Why can't Union-Find replace three-colour DFS for directed cycle detection?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Union-Find (disjoint set union) in Python: parent[x] per vertex, and a vertex with parent[x] == x is a root that names its group. find(x) follows parent to the root, then path compression points every vertex on the way directly at the root. union(a, b) finds both roots; if equal it returns False (already connected, so in an undirected graph that edge closes a cycle), otherwise it attaches the smaller tree's root under the larger (union by size) and returns True. Invariant: two vertices share a root if and only if the edges processed so far connect them. Amortised cost is O(α(n)) per operation.
Worked example from the lesson: n = 6, unions in order (0, 1), (2, 3), (1, 2), (4, 5), (0, 3). parent goes [0,1,2,3,4,5] -> [0,0,2,3,4,5] -> [0,0,2,2,4,5] -> [0,0,0,2,4,5] (sizes tie at 2, so root 2 goes under root 0; 3 still points at 2) -> [0,0,0,2,4,4]. Then union(0, 3) returns False, and find(3) climbs 3 -> 2 -> 0 and compresses parent[3] to 0, giving [0,0,0,0,4,4] and 2 components.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. After union(1, 2), parent = [0, 0, 0, 2, 4, 5]. What does find(3) do, step by step, and what does parent look like afterwards?
2. union(0, 3) returned False. What does that say about the graph built from these five edges?
3. Without union by size and path compression, unioning 0-1, 1-2, 2-3, 3-4 (each first vertex under the second) produced parent = [1, 2, 3, 4, 4]. What does find(0) cost, and how does union by size prevent that shape?
4. Why can't Union-Find replace three-colour DFS for directed cycle detection?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Judgment call: every list problem here that uses Union-Find hands you explicit edges to union. None of them makes you notice that a relation in the input behaves like connectivity, so this checkpoint is included.

You're given equations over single lowercase letters, each either `"x==y"` or `"x!=y"` (always 4 characters). Return True if you can assign an integer to every letter so that all equations hold at the same time. For example, `["a==b", "b!=c", "c==a"]` returns False, and `["a==b", "b==c", "a==c"]` returns True.

Before asking for help, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
You're given equations over single lowercase letters, each either "x==y" or "x!=y" (always 4 characters). Return True if you can assign an integer to every letter so that all equations hold at the same time. For example, ["a==b", "b!=c", "c==a"] returns False, and ["a==b", "b==c", "a==c"] returns True.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

A network monitoring tool tracks which servers can reach each other. Cables get plugged in and unplugged all day, and operators constantly ask "can server A reach server B right now?". Would you use Union-Find? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Union-Find (groups that only ever merge; find gives a group's root and union joins two groups in near-constant time). Scenario: A network monitoring tool tracks which servers can reach each other. Cables get plugged in and unplugged all day, and operators constantly ask "can server A reach server B right now?".
Ask me whether I would use Union-Find here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

Every problem in this topic reduces to a traversal over some graph, with a choice about what "visited" means.

- **Intro to Graphs** decides the shape. A grid means neighbours are computed. Pairs mean you build an adjacency list. Node objects mean the list is already built.
- **Matrix DFS** and the DFS half of **Adjacency List** answer "what can I reach?" with a permanent visited mark. **Matrix BFS** answers "how few steps?" with the same mark set at enqueue time, processed layer by layer, and seeded from one source or many.
- **Three colours** extend "visited" to "visited and still on my path", which is what directed cycles and dependency orders need.
- **Union-Find** answers undirected connectivity without traversing at all, one edge at a time.

Distinguishing competing approaches:

| The question | Reach for | Not |
| --- | --- | --- |
| Which cells/vertices are connected to this one? | DFS (or BFS, same set) | Union-Find unless edges stream in |
| Fewest moves, all moves equal cost | BFS, layer by layer | DFS (first path found isn't the shortest) |
| Nearest of several sources, for every cell | Multi-source BFS, all sources at distance 0 | One BFS per source |
| Can these dependencies be satisfied? Give an order | Three-colour DFS + reversed postorder | Visited-only DFS (false cycles) |
| Does this undirected edge close a cycle? How many groups? | Union-Find, or DFS with a parent check | Three colours (flags every edge) |
| Moves cost different amounts | Dijkstra (Advanced Graphs) | BFS |

A recognition checklist for an unfamiliar problem:

1. What are the vertices and what are the edges? If the statement doesn't say, what changes one state into another?
2. Directed or undirected? Does a pair `[a, b]` mean "a before b" or "b before a"?
3. What's the question: reachability, count of groups, minimum steps, an order, or a cycle?
4. Minimum steps with equal costs means BFS. Everything else starts as DFS unless edges stream in, which means Union-Find.
5. What does "visited" mean here: permanent, only on the current path (backtracking), or GRAY/BLACK?
6. When is a vertex marked (before recursing, on enqueue), and what prevents an infinite loop?
7. Is every component covered? Do you need an outer loop over all vertices or cells?
8. What's the recursion depth? Past about 1000, go iterative.

## The problems

Work them with the solving cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute struggle, the key sentence, spaced repetition. For graphs, spend the struggle this way. Sketch a small example first. Decide whether it's DFS, BFS, Dijkstra or a topological sort, and whether you need cycle detection or just a visited set. Simulate by hand before coding. Then explain the traversal order and exactly how your code avoids infinite loops.

| # | Problem |
| --- | --- |
| 1 | [Number of Islands](https://leetcode.com/problems/number-of-islands/) |
| 2 | [Max Area of Island](https://leetcode.com/problems/max-area-of-island/) |
| 3 | [Clone Graph](https://leetcode.com/problems/clone-graph/) |
| 4 | [Walls And Gates](https://neetcode.io/problems/islands-and-treasure/question) |
| 5 | [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) |
| 6 | [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/) |
| 7 | [Surrounded Regions](https://leetcode.com/problems/surrounded-regions/) |
| 8 | [Course Schedule](https://leetcode.com/problems/course-schedule/) |
| 9 | [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) |
| 10 | [Graph Valid Tree](https://neetcode.io/problems/valid-tree/question) |
| 11 | [Number of Connected Components In An Undirected Graph](https://neetcode.io/problems/count-connected-components/question) |
| 12 | [Redundant Connection](https://leetcode.com/problems/redundant-connection/) |
| 13 | [Word Ladder](https://leetcode.com/problems/word-ladder/) |

## Take this lesson as a live session

If you'd rather be taught this interactively, with the coach waiting for your answers, open the full lesson prompt in a chat (it covers the four prerequisites, so ask for Union-Find at the end if you want that too).

{% capture coach %}
[TOPIC]: Graphs
[PREREQUISITES]: Intro to Graphs, Matrix DFS, Matrix BFS, Adjacency List
[PROBLEM LIST]: Number of Islands, Max Area of Island, Clone Graph, Walls And Gates, Rotting Oranges, Pacific Atlantic Water Flow, Surrounded Regions, Course Schedule, Course Schedule II, Graph Valid Tree, Number of Connected Components In An Undirected Graph, Redundant Connection, Word Ladder
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
