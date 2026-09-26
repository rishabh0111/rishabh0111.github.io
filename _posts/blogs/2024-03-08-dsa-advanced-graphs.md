---
layout: post
title: "Dijkstra, Prim and Kahn are one loop asking three different questions"
date: 2024-03-08 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 16
series_total: 19
tags: [dsa, graphs, shortest-path, python, series]
read_time: 47
permalink: /blogs/dsa-advanced-graphs/
excerpt: "Advanced graph algorithms look like five things to memorise. Each one repeats the same move: pick the next node you can prove is safe to finalise. What changes is the proof."
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers advanced graphs: Dijkstra's shortest paths, Prim's and Kruskal's minimum spanning trees, topological sort with Kahn's algorithm, and Bellman-Ford for paths with an edge budget.

Plain graphs ask whether you can get somewhere. Advanced graphs ask what it costs, what it costs to connect everything, or what order things may come in, and every algorithm here repeats one step: finalise the node you can prove is safe, then update its neighbours. Most wrong answers in this topic come from using that step where its proof doesn't hold.

The topic builds on [Heap / Priority Queue](/blogs/dsa-heaps/) and [Graphs](/blogs/dsa-graphs/) (DFS, BFS, 3-colour cycle detection and Union-Find live there and are only referenced here), and nothing later in the series builds on it. The prerequisites here are Dijkstra's, Prim's, Kruskal's and Topological Sort. I've added Bellman-Ford at the end, because one of the problems limits how many edges a path may use.

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Dijkstra's

### Foundation

Picture a fire starting at the source and spreading along every road at the same speed. Each town catches fire at the time given by its shortest distance, and towns catch fire in order of that distance. Dijkstra's algorithm simulates this: it always handles the unhandled town that is closest to the source.

It solves single-source shortest paths when every edge weight is non-negative. BFS from Part 14 is the special case where all weights are equal.

### Mechanics

Keep `dist[v]`, the best distance found so far, plus a min-heap of `(distance, node)` candidates. Repeat:

1. Pop the smallest `(d, u)`.
2. If `u` is already settled, this entry is stale, so skip it.
3. Otherwise settle `u`: `d` is final.
4. For every edge `u -> v` of weight `w`, if `d + w < dist[v]`, set `dist[v] = d + w` and push `(d + w, v)`.

**The invariant.** When `(d, u)` is the smallest entry in the heap and `u` is unsettled, `d` is the true shortest distance to `u`. Why this is safe: any other path to `u` has to leave the settled set at some point, through an edge into some unsettled node `x`. The cost of reaching `x` is at least the smallest heap key, and that is `d`. Everything after `x` adds weights that are ≥ 0. So no other path costs less than `d`. **The whole proof depends on the "≥ 0".** A negative edge after `x` could pull the total below `d`, which is why Dijkstra is wrong with negative weights.

**Stale entries (lazy deletion).** Python's `heapq` can't lower an existing key (recalled: it has no decrease-key), so when a better distance turns up we just push a second entry. The older, larger entry stays in the heap and gets skipped when it is popped.

Worked example: a directed graph, source 0.

Edges: `0->1 (4)`, `0->2 (1)`, `2->1 (2)`, `1->3 (1)`, `2->3 (5)`, `3->4 (3)`.

The direct edge `0->1` costs 4, but `0->2->1` costs 1 + 2 = 3. Node 3 is first reached through `0->2->3` for 1 + 5 = 6, then improved through `0->2->1->3` to 3 + 1 = 4. Node 4 gets 4 + 3 = 7. Final distances: `[0, 3, 1, 4, 7]`.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/dijkstra-graph.svg %}<figcaption>The example graph, source 0 (green). Edge labels are weights. Blue edges are the shortest paths the algorithm ends up using; d is each node's final distance.</figcaption></figure>

Heap trace, taken from running the code below. Heap contents are shown after that step's pushes.

<figure class="sketch">{% include sketches/dsa-advanced-graphs/dijkstra-heap.svg %}<figcaption>Each pop, in order. Green pops settle a node; red pops are stale entries that get skipped. Amber heap entries were pushed in that step. The row at the bottom is the final dist array.</figcaption></figure>

Steps 4 and 6 are the lazy-deletion entries. Node 1 was first pushed at 4 and node 3 at 6, and both were improved before those entries came up.

### Implementation

```python
import heapq
from collections import defaultdict

def dijkstra(n, edges, src):
    graph = defaultdict(list)            # u -> [(v, w)], directed
    for u, v, w in edges:
        graph[u].append((v, w))
    dist = {src: 0}                      # best distance found so far
    done = set()                         # nodes whose distance is final
    heap = [(0, src)]                    # (distance, node); recalled: heapq is a min-heap
    while heap:
        d, u = heapq.heappop(heap)
        if u in done:
            # stale: u was settled earlier with a smaller d
            # (example: (4,1) popped after node 1 was settled at 3)
            continue
        done.add(u)                      # d is final: every other path to u costs >= d
        for v, w in graph[u]:
            nd = d + w
            if nd < dist.get(v, float("inf")):
                # strictly better: record it and push a fresh entry;
                # the old, larger entry for v becomes stale
                # (example: 2->1 gives 3 < 4, so (3,1) is pushed and (4,1) goes stale)
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    return [dist.get(i, float("inf")) for i in range(n)]

edges = [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3)]
print(dijkstra(5, edges, 0))             # [0, 3, 1, 4, 7]
```

Edge cases I ran: a single node gives `[0]`, an unreachable node stays `inf` (`[0, 2, inf]` for one edge `0->1 (2)` among 3 nodes), zero-weight edges work (`[0, 0, 0]`), and parallel edges keep the cheaper one.

**Complexity.** V = nodes, E = edges. Each edge pushes at most once, so the heap holds at most E + 1 entries and each push or pop costs O(log E). Total time is O((V + E) log E), which is the same as O((V + E) log V) because log E ≤ 2 log V. Space is O(V + E).

### Recognition

Signals:

- The question asks for a minimum total cost, time or distance from one source, and **edge weights differ and are non-negative**.
- A grid or state space where moves cost different amounts. The "graph" can be implicit, with nodes as states and edges as moves.
- The cost of a path is built by adding up its steps, or more generally by any rule that never gets cheaper as the path gets longer.

When not to use it:

- All weights are equal. Plain BFS gives the answer in O(V + E).
- Some weights are negative. The proof breaks, and you need Bellman-Ford (last module).
- The path has a limit on how many edges it may use. Dijkstra settles each node once at its cheapest cost, and that cheapest path might use too many edges. This also goes to the last module.
- You need all pairs of nodes on a small graph. Floyd-Warshall is simpler there (not needed for this list).

On the list, Network Delay Time shows the plain signal. Swim In Rising Water shows the "cheapest path under a cost rule you have to define" signal, where the cost isn't a plain sum. Min Cost to Connect All Points *looks* like a Dijkstra problem because it says "min cost", but it asks for something else (see Prim's).

### Pitfalls

- **Settling on push instead of on pop.** In the example, node 3 is first pushed at 6. If you finalised it then, you would keep 6 instead of 4.
- **Missing the stale check.** Without `if u in done`, the stale `(4,1)` would relax node 1's edges a second time. Here that does no harm, but with many improvements per node the same edges get relaxed over and over and the time blows up.
- **Negative edges.** On `0->1 (2)`, `0->2 (3)`, `2->1 (-2)`, `1->3 (1)`, the code returns `dist[3] = 3`, but the true answer is 2 (0→2→1→3 = 3 − 2 + 1). Node 1 was settled at 2 before the negative edge was seen, and node 3 had already been relaxed from that wrong value.
- **Unreachable nodes.** Decide what `inf` means for your answer before returning it.
- **Undirected graphs.** Add both directions.

### Active Recall

1. At step 3, the heap holds `(3,1)` and `(4,1)`. Why is it safe to finalise node 1 at 3 without ever looking at the `(4,1)` entry?
2. If you only need the distance to node 3, what is the earliest moment you can stop, and why is stopping when node 3 is first pushed wrong?
3. Replace the heap with a plain FIFO queue and settle each node the first time it is dequeued. What does node 1 get?
4. In the negative-edge example from Pitfalls, which sentence of the correctness proof fails?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Dijkstra's algorithm in Python: keep dist[v] (best distance so far) and a min-heap of (distance, node) entries. Pop the smallest; if the node is already settled the entry is stale and is skipped (lazy deletion, because heapq has no decrease-key); otherwise the popped distance is final, and each edge u->v of weight w is relaxed: if d + w < dist[v], update dist[v] and push (d + w, v). The invariant: the smallest heap entry for an unsettled node is its true shortest distance, because any other path must leave the settled set through a frontier node costing at least that much and then add weights that are >= 0. It needs non-negative weights.
Worked example from the lesson: directed graph, source 0, edges 0->1 (4), 0->2 (1), 2->1 (2), 1->3 (1), 2->3 (5), 3->4 (3). Pops in order: (0,0) settle, pushes (4,1) (1,2); (1,2) settle, pushes (3,1) (6,3); (3,1) settle, pushes (4,3); (4,1) stale; (4,3) settle, pushes (7,4); (6,3) stale; (7,4) settle. Final dist [0, 3, 1, 4, 7]. A negative-edge example from the lesson: 0->1 (2), 0->2 (3), 2->1 (-2), 1->3 (1); the code returns dist[3] = 3 but the true answer is 2 (0->2->1->3).
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At step 3, the heap holds (3,1) and (4,1). Why is it safe to finalise node 1 at 3 without ever looking at the (4,1) entry?
2. If you only need the distance to node 3, what is the earliest moment you can stop, and why is stopping when node 3 is first pushed wrong?
3. Replace the heap with a plain FIFO queue and settle each node the first time it is dequeued. What does node 1 get?
4. In the negative-edge example, which sentence of the correctness proof fails?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Swim In Rising Water requires re-deriving why the settle-on-pop guarantee still holds under its own path-cost rule, so this technique gets exercised from scratch there.

### Transfer test

A warehouse grid: moving onto a floor tile costs 1 second, and moving along a conveyor belt tile costs 0 seconds. You want the fastest time from the loading dock to every shelf. Would you use Dijkstra? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Dijkstra's algorithm (always finalise the unsettled node with the smallest tentative distance from a min-heap; correct only when every edge weight is non-negative). Scenario: A warehouse grid: moving onto a floor tile costs 1 second, and moving along a conveyor belt tile costs 0 seconds. You want the fastest time from the loading dock to every shelf.
Ask me whether I would use Dijkstra's algorithm here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Prim's

### Foundation

You have to cable together every office in a campus, and each possible cable has a price. You don't care how far any office is from any other. You only want every office connected at the lowest total price. The cheapest such set of cables forms a tree (any cycle has a cable you could remove), called the **minimum spanning tree (MST)**: V − 1 edges that touch every node.

Prim's grows a single connected blob. It starts at any node and, every step, buys the cheapest cable that leaves the blob.

### Mechanics

**The cut property** is what makes the greedy choice safe. Split the nodes into any two groups. The cheapest edge crossing between them belongs to some MST. Exchange argument: take an MST that doesn't contain that edge `e`. Adding `e` creates a cycle, and the cycle must cross the split a second time through another edge `f`. `f` costs at least as much as `e`, so swapping `f` out for `e` gives a spanning tree that costs no more.

Prim's always uses the split (blob, everything else), so the cheapest edge leaving the blob is always safe to take.

The loop has the same shape as Dijkstra's, with one difference that matters: **the heap key is the weight of the single edge, `w`, not the path total `d + w`.** Prim's asks "how cheap is it to attach this node to the tree?", not "how far is this node from the start?".

1. Push `(0, start)`.
2. Pop the smallest `(w, u)`. If `u` is already in the tree, it's stale, so skip it.
3. Add `u` and add `w` to the total.
4. Push `(weight, v)` for every edge to a node `v` not yet in the tree.

Worked example: an undirected graph with 5 nodes.

Edges: `0-1 (4)`, `0-2 (1)`, `1-2 (2)`, `1-3 (5)`, `2-3 (8)`, `3-4 (3)`, `2-4 (9)`.

The MST is `0-2 (1)`, `2-1 (2)`, `1-3 (5)`, `3-4 (3)`, with total 1 + 2 + 5 + 3 = 11.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/mst-graph.svg %}<figcaption>The example graph. Edge labels are weights. The thick green edges are the MST (total 11); the dashed grey edges are left out.</figcaption></figure>

Prim's trace starting at 0, with heap entries written `(w, node, from)`:

<figure class="sketch">{% include sketches/dsa-advanced-graphs/prim-trace.svg %}<figcaption>Prim's from node 0. Green pops add a node to the tree; the red pop at step 4 is a stale entry for node 1, which had already joined at weight 2. Total is the running MST weight.</figcaption></figure>

### Implementation

```python
import heapq
from collections import defaultdict

def prim(n, edges):
    graph = defaultdict(list)
    for u, v, w in edges:                # undirected: store both directions
        graph[u].append((v, w))
        graph[v].append((u, w))
    in_tree = set()
    total = 0
    heap = [(0, 0)]                      # (edge weight, node); node 0 joins for free
    while heap and len(in_tree) < n:
        w, u = heapq.heappop(heap)
        if u in in_tree:
            # stale: u already joined by a cheaper edge
            # (example: (4,1) popped after node 1 joined through 2-1 at weight 2)
            continue
        in_tree.add(u)
        total += w                       # w is the cheapest edge crossing (tree, rest): cut property
        for v, wv in graph[u]:
            if v not in in_tree:
                heapq.heappush(heap, (wv, v))   # key is the edge weight wv, NOT total + wv
    # fewer than n nodes reached means the graph is disconnected: no spanning tree
    return total if len(in_tree) == n else None

edges = [(0, 1, 4), (0, 2, 1), (1, 2, 2), (1, 3, 5), (2, 3, 8), (3, 4, 3), (2, 4, 9)]
print(prim(5, edges))                    # 11
```

Edge cases I ran: `n = 1` gives 0, a disconnected graph gives `None`, and a triangle of equal weights gives 2. I also checked it against the Kruskal version from the next module on 300 random graphs, and the totals matched every time.

**Complexity.** O(E log E) time with the heap and O(V + E) space. On a dense graph where every pair of nodes has an edge, E is about V²/2, and a heap-free version that keeps a `best[v]` array and scans it for the minimum each round runs in O(V²) (recalled). That is better than O(V² log V) when the graph is complete.

### Recognition

Signals: "connect all", "every node must be reachable", "minimum total cost to link", undirected, **no source node**. The answer is one number for the whole network, not one per node.

Shortest-path trees and spanning trees are different things. On the same example, Dijkstra from 0 (treating edges as undirected) gives distances `[0, 3, 1, 8, 10]` using edges `0-2, 2-1, 1-3, 2-4`, for a total edge weight of 17. The MST uses `3-4` instead of `2-4` and totals 11. The MST doesn't try to keep node 4 close to node 0, so it pays 3 for node 4 instead of 9.

Min Cost to Connect All Points shows the "connect all, no source" signal on a complete graph, which is also where the dense-graph note above matters.

### Pitfalls

- **Using `d + w` as the key.** That turns Prim's into Dijkstra and gives the shortest-path tree (17 here), not the MST (11).
- **Adding `w` before the stale check.** The stale `(4,1)` would be counted and the total would come out 15.
- **Disconnected input.** The loop ends with fewer than V nodes in the tree. Return a sentinel, not a partial sum.
- **Directed graphs.** MST is defined for undirected graphs. The directed version (arborescence) is a different algorithm.

### Active Recall

1. At step 4, `(4,1)` is popped. Which cut-property argument already made node 1's 2-weight edge the right one?
2. Run Prim's from node 3 instead of node 0. Is the total still 11? Is the tree the same?
3. At step 2, the first entries pushed for nodes 3 and 4 were the expensive `(8,3)` and `(9,4)`. Node 3 later joins at 5 and node 4 at 3. Why is pushing those expensive entries first harmless?
4. What does the heap hold at most, and why isn't it just V entries?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Prim's algorithm for minimum spanning trees in Python: grow one tree from any start node; keep a min-heap of (edge weight, node); pop the smallest, skip it if the node is already in the tree (stale), otherwise add the node, add the edge weight to the total, and push (weight, v) for each edge to a node v not yet in the tree. The heap key is the single edge weight w, not a path total d + w. It is correct because of the cut property: for any split of the nodes into two groups, the cheapest edge crossing the split belongs to some MST (exchange argument), and Prim's always uses the split (tree, rest).
Worked example from the lesson: undirected graph with 5 nodes, edges 0-1 (4), 0-2 (1), 1-2 (2), 1-3 (5), 2-3 (8), 3-4 (3), 2-4 (9). Prim's from node 0, entries written (w, node, from): step 1 pop (0,0,-) add, total 0, pushes (4,1,0) (1,2,0); step 2 pop (1,2,0) add, total 1, pushes (2,1,2) (8,3,2) (9,4,2); step 3 pop (2,1,2) add, total 3, pushes (5,3,1); step 4 pop (4,1,0) stale; step 5 pop (5,3,1) add, total 8, pushes (3,4,3); step 6 pop (3,4,3) add, total 11, tree has 5 nodes, stop. MST = 0-2, 2-1, 1-3, 3-4, total 11.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At step 4, (4,1) is popped. Which cut-property argument already made node 1's 2-weight edge the right one?
2. Run Prim's from node 3 instead of node 0. Is the total still 11? Is the tree the same?
3. At step 2, the first entries pushed for nodes 3 and 4 were the expensive (8,3) and (9,4). Node 3 later joins at 5 and node 4 at 3. Why is pushing those expensive entries first harmless?
4. What does the heap hold at most, and why isn't it just V entries?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Included. Min Cost to Connect All Points is a direct MST instance, not a from-scratch derivation of this technique, so the mechanics need their own workout here.

A village has `n` houses numbered 1 to `n`. House `i` can get water by digging its own well for `well[i-1]`, or by laying a pipe to another house. `pipes` lists `(a, b, cost)` for the pipes that can be laid, and water flows both ways along a pipe. Find the minimum total cost so that every house has water.

Example: `well = [5, 4, 3, 6]`, `pipes = [(1,2,2), (2,3,2), (3,4,1), (1,4,7)]`. The answer is 8.

Before opening the chat, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A village has n houses numbered 1 to n. House i can get water by digging its own well for well[i-1], or by laying a pipe to another house. pipes lists (a, b, cost) for the pipes that can be laid, and water flows both ways along a pipe. Find the minimum total cost so that every house has water. Example: well = [5, 4, 3, 6], pipes = [(1,2,2), (2,3,2), (3,4,1), (1,4,7)]. The answer is 8.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

A data centre wants to pick links between racks so that every rack is connected, and the chosen links should have the **largest** possible total bandwidth. Would you use Prim's? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Prim's algorithm (grow one tree, always adding the cheapest edge that leaves it; safe because of the cut property; builds a minimum spanning tree of an undirected graph). Scenario: A data centre wants to pick links between racks so that every rack is connected, and the chosen links should have the largest possible total bandwidth.
Ask me whether I would use Prim's algorithm here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Kruskal's

### Foundation

Kruskal's builds the same MST from the other direction. Instead of growing one blob, you sort **all** the cables by price and go down the list, buying each cable unless its two ends are already connected. Early on you have many small islands, and they merge until there is one.

### Mechanics

1. Sort the edges by weight.
2. For each edge `(u, v, w)`: if `u` and `v` are in different components, take it and merge the components. Otherwise skip it, because it would close a cycle.
3. Stop after V − 1 edges have been taken.

"Are they in the same component?" and "merge them" are exactly Union-Find's `find` and `union` from [Part 14](/blogs/dsa-graphs/). I'm not re-teaching it here. The version below uses path halving and union by size.

**Why taking the edge is safe.** When `(u, v, w)` is taken, consider the cut (u's current component, everything else). Every edge cheaper than `w` has already been looked at. Each one was either taken, so it's inside some component, or skipped because its ends were already in one component. Either way, no cheaper edge crosses this cut, so `(u, v, w)` is the cheapest crossing edge, and the cut property from Prim's says it's safe. **The same cut property proves both algorithms.** They just pick different cuts.

**Why skipping is safe.** A skipped edge joins two nodes that are already connected by edges no heavier than it, so it would only close a cycle.

Same worked example as Prim's, sorted by weight.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/kruskal-trace.svg %}<figcaption>Kruskal's on the same graph, one row per edge in weight order, with the components as they stand before that edge. Amber groups are the two components the edge merges; the red group at weight 4 already holds both ends of 0-1, so that edge is skipped. After the fourth take (V − 1 edges) the last two edges are never looked at.</figcaption></figure>

Kruskal's takes `3-4 (3)` before `1-3 (5)`. Prim's took them the other way round because node 4 wasn't reachable from its blob until node 3 had joined. The edges and the total (11) are the same.

### Implementation

```python
class DSU:
    """Union-Find (taught in Part 14): find with path halving, union by size."""
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                 # a and b already share a root: edge would close a cycle
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra              # hang the smaller tree under the larger one
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True

def kruskal(n, edges):
    dsu = DSU(n)
    total, taken = 0, 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        if dsu.union(u, v):
            # u and v were in different components, so w is the cheapest edge
            # crossing (u's component, rest): every lighter edge was already processed
            total += w
            taken += 1
            if taken == n - 1:           # a spanning tree on n nodes has exactly n-1 edges
                break
        # else: skipped (example: 0-1 at weight 4, both ends already in {0,1,2})
    return total if taken == n - 1 else None     # fewer than n-1 means disconnected

edges = [(0, 1, 4), (0, 2, 1), (1, 2, 2), (1, 3, 5), (2, 3, 8), (3, 4, 3), (2, 4, 9)]
print(kruskal(5, edges))                 # 11
```

Edge cases I ran: `n = 1` gives 0 (zero edges are needed, and `taken == n - 1 == 0` holds from the start), a disconnected graph gives `None`, and a triangle of equal weights gives 2.

**Complexity.** The sort costs O(E log E). The Union-Find operations are almost O(1) each (recalled: inverse Ackermann amortised, with path compression or halving plus union by size). Total time is O(E log E), and space is O(V + E): O(V) for the DSU plus O(E) for the sorted copy of the edges.

### Recognition

Kruskal's fits better than Prim's when:

- The input is already an **edge list**, and you don't want to build an adjacency list.
- You care about the **order in which components merge** as the allowed weight grows. Processing edges in increasing order answers questions like "which nodes are connected using only edges ≤ t?" for every t in a single pass.
- The graph is sparse. On a complete graph with about V²/2 edges, sorting them all is more expensive than dense Prim's O(V²).

A useful property of the merge order: the moment two nodes first land in the same component, the weight of the edge being processed is the smallest possible value of the heaviest edge on any path between them. Keep it in mind for "minimise the worst single step" questions.

### Pitfalls

- **Forgetting to sort**, or sorting by the wrong tuple field.
- **Assuming the graph is connected.** Check `taken == n - 1`.
- **Hand-rolled Union-Find without path compression or union by size.** It can degrade to O(V) per `find` on a chain.
- **Node labels that aren't `0..n-1`.** Map them to indices first, or back the DSU with a dict.

### Active Recall

1. At weight 4, why is `0-1` skipped, and what does that skip say about the path between 0 and 1 in the tree?
2. Prim's took `1-3` before `3-4`, and Kruskal's took them in the opposite order. Why do both still produce the same tree?
3. Why can the loop stop after V − 1 edges without looking at `2-3 (8)` and `2-4 (9)`?
4. You run Kruskal's on a graph with two separate islands. What do `total` and `taken` look like at the end, and what did you actually build?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Kruskal's algorithm for minimum spanning trees in Python: sort all edges by weight; for each edge (u, v, w), if find(u) != find(v) in a Union-Find (path halving, union by size), take it and union the components, otherwise skip it because it would close a cycle; stop after V - 1 edges, and report failure if fewer were taken (disconnected graph). Taking an edge is safe by the cut property on the cut (u's component, everything else): every lighter edge was already processed, so none crosses that cut. A skipped edge joins nodes already connected by edges no heavier than it.
Worked example from the lesson: undirected graph with 5 nodes, edges 0-1 (4), 0-2 (1), 1-2 (2), 1-3 (5), 2-3 (8), 3-4 (3), 2-4 (9). In weight order: 1 0-2 take (total 1), 2 1-2 take (total 3), 3 3-4 take (total 6), 4 0-1 skip (0 and 1 both in {0,1,2}), 5 1-3 take (total 11, 4 edges = V-1, stop); 2-3 (8) and 2-4 (9) are never examined. Prim's from node 0 on the same graph added 1-3 before 3-4, because node 4 was only reachable through node 3.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At weight 4, why is 0-1 skipped, and what does that skip say about the path between 0 and 1 in the tree?
2. Prim's took 1-3 before 3-4, and Kruskal's took them in the opposite order. Why do both still produce the same tree?
3. Why can the loop stop after V - 1 edges without looking at 2-3 (8) and 2-4 (9)?
4. You run Kruskal's on a graph with two separate islands. What do total and taken look like at the end, and what did you actually build?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Included. No list problem requires deriving Kruskal's from scratch, so the mechanics get their own workout here.

You have `n` items and the distance between every pair. Split them into exactly `k` non-empty groups so that the **smallest distance between two items in different groups** is as large as possible, and return that distance.

Example: points on a line at positions `[0, 1, 3, 10, 11, 20]`, where distance is `|a - b|`. With `k = 3`, the answer is 7. With `k = 2` it's 9, and with `k = 4` it's 2.

Before opening the chat, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
You have n items and the distance between every pair. Split them into exactly k non-empty groups so that the smallest distance between two items in different groups is as large as possible, and return that distance. Example: points on a line at positions [0, 1, 3, 10, 11, 20], where distance is |a - b|. With k = 3, the answer is 7. With k = 2 it's 9, and with k = 4 it's 2.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

A cluster of servers has links, and each link has a latency. Offline, you get a batch of queries: "can server a reach server b using only links with latency ≤ t?" Would you use Kruskal's idea? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Kruskal's algorithm (sort edges by weight and take each one that joins two different Union-Find components; the merge order shows which nodes are connected using only edges up to each weight). Scenario: A cluster of servers has links, and each link has a latency. Offline, you get a batch of queries: "can server a reach server b using only links with latency <= t?"
Ask me whether I would use Kruskal's idea here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Topological Sort

### Foundation

A to-do list with "X must happen before Y" rules. A topological order lists every item so that each rule points forward. One exists exactly when the rules have no cycle, which means the graph is a DAG (directed acyclic graph).

Part 14 found cycles with 3-colour DFS. This module uses **Kahn's algorithm**, which builds the order directly and detects a cycle by coming up short.

### Mechanics

**Step zero: turn constraints into edges.** This is where most mistakes happen, before any algorithm runs.

- **Direction.** An edge points from what comes first to what comes after. "a needs b", "b before a", "a depends on b" and "b unlocks a" all become the edge `b -> a`. Write down one example constraint and its arrow before you write any code.
- **Every item is a node**, including items that appear in no constraint. They have indegree 0 and can go anywhere, but they still have to appear in the output.
- **One piece of evidence gives one edge.** Add only what the input directly states. Transitive facts ("a before b, b before c, so a before c") don't need their own edges, because the order will respect them anyway.
- **Duplicates** are harmless if the edge list and the indegree count are updated together. They break if you deduplicate one and not the other.
- **Contradictions** in the input show up as a cycle.

**Kahn's loop.** `indegree[v]` is the number of v's prerequisites that haven't been placed yet.

1. Put every node with `indegree == 0` in a queue.
2. Pop `u`, append it to the output, and decrement `indegree[v]` for each edge `u -> v`. Any `v` that reaches 0 joins the queue.
3. If the output ends up shorter than the number of nodes, there is a cycle.

**Why placing a zero-indegree node is safe:** everything it depends on is already in the output, so no rule can point backwards to it later. **Why "came up short" means a cycle:** when the queue empties, every leftover node still has an unplaced prerequisite among the leftovers. Follow those prerequisites backwards from any leftover node. There are finitely many leftovers, so the walk eventually repeats a node, and that is a cycle.

Worked example: a build pipeline.

Items: `fetch, lint, build, test, ship, docs`.
Rules: lint needs fetch, build needs fetch, test needs build, ship needs test, ship needs lint. docs has no rules.

Edges: `fetch->lint`, `fetch->build`, `build->test`, `test->ship`, `lint->ship`.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/topo-graph.svg %}<figcaption>The pipeline as a graph: each arrow points from a prerequisite to the step that needs it. docs (dashed) is in no rule but is still a node.</figcaption></figure>

Kahn's trace (FIFO queue), from running the code:

<figure class="sketch">{% include sketches/dsa-advanced-graphs/kahn-trace.svg %}<figcaption>Each row is the state after one pop: remaining indegree per node, then the queue (blue). Amber cells just dropped in that step, and a green tick means the node is already in the output.</figcaption></figure>

### Implementation

```python
from collections import deque

def topo_order(items, needs):
    # needs: list of (a, b) meaning "a needs b first"  ->  edge b -> a
    graph = {x: [] for x in items}       # every item is a node, even with no constraints
    indegree = {x: 0 for x in items}
    for a, b in needs:
        graph[b].append(a)
        indegree[a] += 1                 # added together with the edge, so duplicates stay consistent
    queue = deque(x for x in items if indegree[x] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)                  # safe: indegree[u] == 0, all of u's prerequisites are placed
        for v in graph[u]:
            indegree[v] -= 1             # u was one of v's unplaced prerequisites
            if indegree[v] == 0:         # v's last prerequisite just got placed
                queue.append(v)
    if len(order) < len(items):
        return None                      # every leftover node sits on or behind a cycle
    return order

items = ["fetch", "lint", "build", "test", "ship", "docs"]
needs = [("lint", "fetch"), ("build", "fetch"), ("test", "build"),
         ("ship", "test"), ("ship", "lint")]
print(topo_order(items, needs))
# ['fetch', 'docs', 'lint', 'build', 'test', 'ship']
print(topo_order(items, needs + [("fetch", "ship")]))
# None
```

Edge cases I ran: no items gives `[]`, a single item gives `['a']`, a duplicated rule `("a","b")` twice still gives `['b', 'a']`, and a self-rule `("a","a")` gives `None`.

**Complexity.** O(V + E) time: each node is queued once and each edge is decremented once. O(V + E) space.

### Recognition

Signals: "prerequisites", "dependencies", "must come before", "order of tasks/courses/letters", "is there a valid ordering", "detect a circular dependency". The input is a set of pairwise order constraints, and the output is either one full ordering or a yes/no answer about whether one exists.

Kahn versus DFS (Part 14): both run in O(V + E). Kahn gives you the cycle signal as a simple count, it lets you swap in a heap for the smallest-first order, and its queue length tells you whether the order is unique. DFS gives reverse postorder and fits naturally if you're already doing a DFS.

On the list, Alien Dictionary shows the signal: an order you have to infer, where the edges are hidden in the input rather than handed to you.

### Pitfalls

- **Reversed edges.** The code runs happily and returns a valid order for the reversed rules. Here that gives `['ship', 'docs', 'test', 'lint', 'build', 'fetch']`: ship first, which is wrong. Nothing crashes, so this bug is silent.
- **Missing isolated nodes.** If you build nodes only from the rules, `docs` disappears from the output.
- **Forgetting the length check.** Without it, a cyclic input returns a partial order (`['docs']` in the cycle example) as if it were an answer.
- **Deduplicating edges but not indegrees**, or the other way round.
- **Assuming uniqueness.** Many orders are usually valid. If a question wants one specific order, it must say which one (for example, smallest first).

### Active Recall

1. After `fetch` is popped, both `lint` and `build` join the queue, but `test` doesn't. Why?
2. Add the rule "fetch needs ship". Trace what Kahn's does, and explain why `docs` still gets placed.
3. Is the order for the pipeline unique? How could you tell from the trace alone?
4. Replace the deque with a min-heap of names. What order do you get for the pipeline?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied topological sort with Kahn's algorithm in Python: turn each rule "a needs b" into an edge b -> a (every item is a node, even with no rules), count indegrees, queue every node with indegree 0, then repeatedly pop a node, append it to the output, and decrement the indegree of each of its successors, queueing any that reach 0. If the output is shorter than the number of nodes, there is a cycle. Placing an indegree-0 node is safe because all its prerequisites are already placed.
Worked example from the lesson: items fetch, lint, build, test, ship, docs. Rules: lint needs fetch, build needs fetch, test needs build, ship needs test, ship needs lint; docs has no rules. Edges fetch->lint, fetch->build, build->test, test->ship, lint->ship. Initial indegree: fetch 0, lint 1, build 1, test 1, ship 2, docs 0; initial queue [fetch, docs]. FIFO trace: pop fetch (lint 1->0, build 1->0; queue [docs, lint, build]), pop docs (queue [lint, build]), pop lint (ship 2->1; queue [build]), pop build (test 1->0; queue [test]), pop test (ship 1->0; queue [ship]), pop ship (queue empty). Output fetch, docs, lint, build, test, ship: 6 of 6 placed, a valid order.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. After fetch is popped, both lint and build join the queue, but test doesn't. Why?
2. Add the rule "fetch needs ship". Trace what Kahn's does, and explain why docs still gets placed.
3. Is the order for the pipeline unique? How could you tell from the trace alone?
4. Replace the deque with a min-heap of names. What order do you get for the pipeline?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Alien Dictionary requires deriving its edges from the input from scratch, which is this module's hard part, so we cover that reasoning when we solve it directly.

### Transfer test

A spreadsheet where cells hold formulas that reference other cells. After an edit, you need to recompute every cell exactly once, after all the cells it references, and report an error if there's a circular reference. Would you use a topological sort? Why?

{% capture coach %}
You are my coding-interview coach. I just learned topological sort with Kahn's algorithm (order items so every "must come before" rule points forward by repeatedly placing a node whose prerequisites are all placed; coming up short means a cycle). Scenario: A spreadsheet where cells hold formulas that reference other cells. After an edit, you need to recompute every cell exactly once, after all the cells it references, and report an error if there's a circular reference.
Ask me whether I would use a topological sort here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Bellman-Ford and bounded-edge shortest paths

The problems below also need this: Cheapest Flights Within K Stops caps how many edges a path may use, and Dijkstra's settle-once rule can't respect that cap.

### Foundation

Instead of a fire that settles each town once, think of rounds. In round 1 you know the cheapest way to reach anything with 1 edge. In round 2, you know it with up to 2 edges, built by extending round 1's answers by one more edge. After r rounds you have the cheapest path using **at most r edges**. Nothing gets settled early, so there's no greedy step for a negative edge or a hop limit to break.

### Mechanics

**Invariant:** after round r, `dist[v]` = the minimum cost over all paths from src to v with ≤ r edges.

Round r: take a snapshot `prev = dist[:]`, which holds round r − 1's values. Then for every edge `(u, v, w)`, if `prev[u] + w < dist[v]`, set `dist[v] = prev[u] + w`.

**Why the snapshot matters.** If you read from `dist` while you're writing it, an edge processed later in the same round can extend a path that was improved earlier in that round, so one round can add several edges. That's harmless for classic Bellman-Ford (more progress per round is fine when there's no cap). It's wrong when rounds are the edge budget.

**Classic Bellman-Ford:** a shortest simple path has at most V − 1 edges, so V − 1 rounds (in place, no snapshot) handle any graph with negative edges but no negative cycle. If a V-th round still improves something, a negative cycle is reachable from the source.

**Early exit:** if a whole round changes nothing, later rounds would see the same inputs and change nothing either, so you can stop.

Worked example: 4 nodes, source 0, and we care about node 1.

Edges, in this list order: `0->2 (1)`, `2->3 (1)`, `3->1 (1)`, `0->1 (5)`, `2->1 (3)`.

The paths to node 1 are: `0->1` = 5 (1 edge), `0->2->1` = 1 + 3 = 4 (2 edges), and `0->2->3->1` = 1 + 1 + 1 = 3 (3 edges). The cheapest path overall uses 3 edges. With a budget of 2 edges the answer is 4, and with 1 edge it's 5. Dijkstra would settle node 1 at 3 and couldn't give you the 2-edge answer.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/bellman-rounds.svg %}<figcaption>dist per node after each round with a snapshot. Amber cells improved in that round, with the paths that did it on the right. Below the line, in red: the same round 1 run in place, which chains three edges in one round.</figcaption></figure>

The last row is the snapshot bug in action. With in-place updates and this edge order, round 1 already reports a 3-edge path.

### Implementation

```python
INF = float("inf")

def bounded_shortest(n, edges, src, max_edges):
    # invariant: after round r, dist[v] = cheapest src -> v using at most r edges
    dist = [INF] * n
    dist[src] = 0
    for r in range(1, max_edges + 1):
        prev = dist[:]                   # round r-1's values: paths with <= r-1 edges
        for u, v, w in edges:
            # extend a <= r-1 edge path by exactly one edge; reading prev (not dist)
            # stops 0->2, 2->3, 3->1 from chaining inside one round
            # (recalled: INF + w stays INF, so unreachable u never improves v)
            if prev[u] + w < dist[v]:
                dist[v] = prev[u] + w
        if dist == prev:                 # round r changed nothing: rounds r+1.. cannot either
            break
    return dist

edges = [(0, 2, 1), (2, 3, 1), (3, 1, 1), (0, 1, 5), (2, 1, 3)]
print([bounded_shortest(4, edges, 0, k)[1] for k in (1, 2, 3, 4)])   # [5, 4, 3, 3]
```

Edge cases I ran: `max_edges = 0` leaves only the source at 0 (`[0, inf, inf]`), a single node gives `[0]`, and a negative edge (`0->1 (4)`, `1->2 (-3)`, `0->2 (2)`, budget 2) gives `[0, 4, 1]`, which is correct because 4 − 3 = 1 beats the direct 2.

**Complexity.** k = the edge budget. O(k · E) time and O(V) space (two arrays). Classic Bellman-Ford is O(V · E).

### Recognition

Signals: "at most k edges/stops/steps/transfers", negative weights, "detect a negative cycle" or "arbitrage". The cost of a path depends on both its total and its length.

It's distinct from Dijkstra, which is faster with non-negative weights and no length cap but breaks with either. It's also distinct from BFS over (node, edges-used) states, which is another way to handle a cap and costs O(k · (V + E)) in the worst case.

On the list, Cheapest Flights Within K Stops shows the "at most k" signal. How its stop limit maps onto a number of rounds is part of solving it.

### Pitfalls

- **In-place updates with an edge budget.** You get the wrong answer (3 instead of 5 at budget 1).
- **Off-by-one between the budget and rounds.** Make sure you know whether your limit counts edges or intermediate nodes. They differ by one.
- **`INF` arithmetic.** In Python, `float('inf') + w` is still `inf` (recalled). If you use a large integer sentinel instead, check `prev[u] != INF` explicitly, or `INF + (-3)` will look like a real distance.
- **Early exit with `dist == prev`** is safe only because each round's values depend only on the previous round's.

### Active Recall

1. In round 2, `dist[3]` becomes 2. Which path is that, and why couldn't round 1 find it?
2. With in-place updates, round 1 reports `dist[1] = 3`. Would reordering the edge list fix it?
3. Why is negative-edge `0->1 (4)`, `1->2 (-3)`, `0->2 (2)` handled correctly here but can break Dijkstra?
4. You run classic Bellman-Ford for V − 1 rounds, then one more round, and something still improves. What do you conclude, and why V − 1?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Bellman-Ford and bounded-edge shortest paths in Python: dist starts at 0 for the source and inf elsewhere; each round takes a snapshot prev = dist[:] and, for every edge (u, v, w), sets dist[v] = prev[u] + w if that is smaller. Invariant: after round r, dist[v] is the cheapest path from the source to v using at most r edges. The snapshot stops one round from chaining several edges, which matters when rounds are an edge budget. Nothing is ever finalised, so negative edges are fine; classic Bellman-Ford runs V - 1 rounds, and an improvement in round V means a reachable negative cycle. If a round changes nothing, stop early.
Worked example from the lesson: 4 nodes, source 0, edges in this list order 0->2 (1), 2->3 (1), 3->1 (1), 0->1 (5), 2->1 (3). dist for nodes 0..3: start 0, inf, inf, inf; round 1 (<= 1 edge) 0, 5, 1, inf; round 2 (<= 2 edges) 0, 4, 1, 2; round 3 (<= 3 edges) 0, 3, 1, 2; round 4 no change, stop. With in-place updates (no snapshot), round 1 already gives 0, 3, 1, 2, because 0->2, 2->3, 3->1 chain inside one round. So the answer for node 1 is 5, 4, 3 with budgets 1, 2, 3.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. In round 2, dist[3] becomes 2. Which path is that, and why couldn't round 1 find it?
2. With in-place updates, round 1 reports dist[1] = 3. Would reordering the edge list fix it?
3. Why is the negative-edge graph 0->1 (4), 1->2 (-3), 0->2 (2) handled correctly here but can break Dijkstra?
4. You run classic Bellman-Ford for V - 1 rounds, then one more round, and something still improves. What do you conclude, and why V - 1?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Cheapest Flights Within K Stops is the only list problem that uses this, and it requires deriving how its own stop limit becomes the round budget, so we cover that when we solve it directly.

### Transfer test

You have exchange rates between currencies, and you want to know if some sequence of trades turns 1 unit into more than 1 unit. Would you use Bellman-Ford? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Bellman-Ford (relax every edge once per round; after r rounds you have the cheapest paths of at most r edges; handles negative weights, and an improvement after V - 1 rounds means a negative cycle). Scenario: You have exchange rates between currencies, and you want to know if some sequence of trades turns 1 unit into more than 1 unit.
Ask me whether I would use Bellman-Ford here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

**How they connect to Advanced Graphs.** All five modules share one loop: keep a frontier, pick the next thing, update its neighbours. What changes is what you pick and why that pick is safe:

| Algorithm | Frontier | Pick | Safe because |
| --- | --- | --- | --- |
| Dijkstra | min-heap by path total `d + w` | smallest total | non-negative weights: nothing later is cheaper |
| Prim | min-heap by single edge `w` | cheapest edge leaving the tree | cut property on (tree, rest) |
| Kruskal | all edges, sorted | cheapest edge between two components | cut property on (component, rest) |
| Kahn | queue of indegree-0 nodes | any ready node | all its prerequisites are already placed |
| Bellman-Ford | no frontier; every edge each round | nothing is final | round r covers every path of ≤ r edges |

The heap from [Part 10](/blogs/dsa-heaps/) powers the first two, and Union-Find from [Part 14](/blogs/dsa-graphs/) powers the third.

**Distinguishing the competing approaches:**

- **Shortest path or spanning tree?** Is there a source, and is the answer per node or per route? If yes, it's a shortest path. Is the answer one total for connecting everything? Then it's an MST. The example graph showed how the two differ: the shortest-path tree totalled 17 and the MST 11.
- **Dijkstra or BFS?** Equal weights mean BFS. Unequal non-negative weights mean Dijkstra.
- **Dijkstra or Bellman-Ford?** Negative weights, a cap on edges, or a negative-cycle question all mean Bellman-Ford (or BFS over (node, edges-used) states for the cap).
- **Prim or Kruskal?** Adjacency list or dense graph, go with Prim. Edge list, sparse graph, or you need the merge order by threshold, go with Kruskal.
- **Kahn or DFS topo sort?** Either works. Kahn when you need the cycle count, smallest-first order, or a uniqueness check. DFS when you're already doing a DFS.
- **Something none of these covers:** "use every edge exactly once" is an Eulerian path, not a shortest path. The standard tool is Hierholzer's algorithm (recalled: a DFS that consumes each edge once and records a node only after all its edges are used, then reverses the recording). It's not taught here. Reconstruct Itinerary shows this signal.

**Recognition checklist for an unfamiliar graph problem:**

1. What are the nodes and edges? Are they given, or hidden in a grid, a set of states, or a set of constraints? Directed or undirected?
2. Is there a source? Is the answer per node, a single total, or an ordering?
3. Are weights all equal, non-negative, or possibly negative?
4. How is a path's cost combined: sum, max of steps, count of edges? Does the "settle once" argument still hold for that rule?
5. Is there a limit on path length (edges, stops, transfers)?
6. Does every node need to be included (spanning), or every edge used once (Eulerian)?
7. Are there order constraints? Which way does each arrow point, and could they contradict each other (a cycle)?
8. What's the size? Dense graphs change which version is fastest (O(V²) Prim, all-pairs methods for tiny V).

## The problems

Work these with the solving cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute struggle, a one-sentence key insight, then spaced repetition. During the struggle, sketch a small example first and ask: DFS, BFS, Dijkstra, or topological sort? Do I need cycle detection, or just a visited set? Simulate by hand before coding, and be able to explain the traversal order and what stops an infinite loop.

| # | Problem |
| --- | --- |
| 1 | [Network Delay Time](https://leetcode.com/problems/network-delay-time/) |
| 2 | [Reconstruct Itinerary](https://leetcode.com/problems/reconstruct-itinerary/) |
| 3 | [Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/) |
| 4 | [Swim In Rising Water](https://leetcode.com/problems/swim-in-rising-water/) |
| 5 | [Alien Dictionary](https://neetcode.io/problems/foreign-dictionary/question) |
| 6 | [Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/) |

## Take this lesson as a live session

To be taught this topic interactively, with the coach waiting for your answers at every checkpoint, open the full lesson prompt in a chat.

{% capture coach %}
[TOPIC]: Advanced Graphs
[PREREQUISITES]: Dijkstra's, Prim's, Kruskal's, Topological Sort
[PROBLEM LIST]: Network Delay Time, Reconstruct Itinerary, Min Cost to Connect All Points, Swim In Rising Water, Alien Dictionary, Cheapest Flights Within K Stops
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
