---
layout: post
title: "Dijkstra, Prim and Kahn are one loop asking three different questions"
date: 2024-03-08 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 16
series_total: 19
links_new_tab: true
tags: [dsa, graphs, shortest-path, python, series]
read_time: 51
permalink: /blogs/dsa-advanced-graphs/
excerpt: "Advanced graph algorithms look like five separate things to memorise. But each one repeats the same move: pick the next node you can prove is safe to finalise. Only the proof changes."
---

Plain graph questions ask whether you can get from one place to another. Advanced graph questions ask harder things. What does the cheapest route cost? What does it cost to connect everything? In what order may things happen?

Every algorithm in this post repeats the same step. Pick the next node you can prove is safe to finalise, then update its neighbours. "Finalise" means you decide its answer now and never change it again. Most wrong answers come from using that step in a situation where its proof doesn't hold.

This post builds on [Heap / Priority Queue](/blogs/dsa-heaps/) and [Graphs](/blogs/dsa-graphs/). DFS, BFS, 3-colour cycle detection and Union-Find are taught there, so here we only refer to them. Nothing later in the series builds on this post. Bellman-Ford is added at the end, because one of the problems limits how many edges a path may use.

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## Dijkstra's

### Foundation

Picture a fire that starts in one town, the source. It spreads along every road at the same speed. Each town catches fire at a time equal to its shortest distance from the source. So towns catch fire in order of that distance: the closest first, then the next closest, and so on.

Dijkstra's algorithm simulates this fire. At every step it handles the closest town it hasn't handled yet.

The problem it solves is called single-source shortest paths: the cheapest distance from one starting node to every other node. It only works when every edge weight is non-negative (zero or more). BFS from Part 14 is the special case where all weights are equal.

### Mechanics

We keep two things:

- `dist[v]`, the best distance to `v` found so far.
- A min-heap of `(distance, node)` candidates. A min-heap always hands back its smallest entry first.

A node is **settled** once its distance is final. Then we repeat these steps:

1. Pop the smallest `(d, u)`.
2. If `u` is already settled, this entry is stale, so skip it.
3. Otherwise settle `u`: `d` is final.
4. For every edge `u -> v` of weight `w`, if `d + w < dist[v]`, set `dist[v] = d + w` and push `(d + w, v)`.

Step 4 is called **relaxing** an edge: you check whether going through `u` gives `v` a cheaper distance, and if so you record it.

**The invariant.** An invariant is a fact that stays true at every step of the loop. Here it is: when `(d, u)` is the smallest entry in the heap and `u` is unsettled, `d` is the true shortest distance to `u`.

Why is that safe? Think about any other path to `u`. It starts inside the settled set (the source is settled first). At some point it has to step out of that set, through an edge into some unsettled node `x`. Reaching `x` costs at least the smallest key in the heap, and that smallest key is `d`. Everything after `x` only adds weights that are ≥ 0. So that other path costs at least `d`, and none can cost less.

**The whole proof depends on the "≥ 0".** A negative edge after `x` could pull the total below `d`. That's why Dijkstra gives wrong answers when weights can be negative.

**Stale entries (lazy deletion).** Sometimes we find a better distance for a node that is already in the heap. Ideally we'd lower its key in place. Python's `heapq` can't do that (recalled: it has no decrease-key operation). So we just push a second, smaller entry. The older, larger entry stays in the heap. When it's eventually popped, its node is already settled, so we call it **stale** and skip it.

Worked example: a directed graph, source 0.

Edges: `0->1 (4)`, `0->2 (1)`, `2->1 (2)`, `1->3 (1)`, `2->3 (5)`, `3->4 (3)`.

Let's work out the answers by hand first:

- Node 1: the direct edge `0->1` costs 4, but `0->2->1` costs 1 + 2 = 3. So node 1 gets 3.
- Node 3: it's first reached through `0->2->3`, for 1 + 5 = 6. Later it's improved through `0->2->1->3`, to 3 + 1 = 4.
- Node 4: 4 + 3 = 7.

Final distances: `[0, 3, 1, 4, 7]`.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/dijkstra-graph.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-advanced-graphs/dijkstra-heap.svg %}</figure>

Steps 4 and 6 are the stale entries from lazy deletion. Node 1 was first pushed at 4, and node 3 at 6. Both got better distances before those old entries reached the top of the heap.

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

Edge cases I ran:

- A single node gives `[0]`.
- An unreachable node stays `inf`. With 3 nodes and one edge `0->1 (2)`, the result is `[0, 2, inf]`.
- Zero-weight edges work (`[0, 0, 0]`).
- Parallel edges (two edges between the same pair of nodes) keep the cheaper one.

**Complexity.** Let V be the number of nodes and E the number of edges.

- Each edge causes at most one push. So the heap never holds more than E + 1 entries, and each push or pop costs O(log E).
- Total time is O((V + E) log E). That's the same as O((V + E) log V), because a graph without parallel edges has at most V² edges, so log E ≤ 2 log V.
- Space is O(V + E).

### Recognition

Signals:

- The question asks for a minimum total cost, time or distance from one source, and **edge weights differ and are non-negative**.
- A grid or state space where moves cost different amounts. The "graph" doesn't have to be given to you. It can be implicit, with nodes as states and edges as moves.
- The cost of a path is built by adding up its steps. More generally, any cost rule works if a path never gets cheaper as it gets longer.

When not to use it:

- All weights are equal. Plain BFS gives the answer in O(V + E).
- Some weights are negative. The proof breaks, and you need Bellman-Ford (the last module).
- The path has a limit on how many edges it may use. Dijkstra settles each node once, at its cheapest cost. But that cheapest path might use too many edges. This case also goes to the last module.
- You need the distance between every pair of nodes on a small graph. Floyd-Warshall is simpler there (not needed for this list).

Here is where the signals show up on the list. Network Delay Time shows the plain signal. Swim In Rising Water shows a different one: the cheapest path under a cost rule you have to define yourself, where the cost isn't a plain sum. Min Cost to Connect All Points *looks* like a Dijkstra problem because it says "min cost". But it asks for something else (see Prim's).

### Pitfalls

- **Settling on push instead of on pop.** In the example, node 3 is first pushed at 6. If you finalised it at that moment, you'd keep 6 instead of the correct 4.
- **Missing the stale check.** Without `if u in done`, the stale `(4,1)` would relax node 1's edges a second time. In this example that does no harm. But if a node improves many times, its edges get relaxed over and over, and the running time blows up.
- **Negative edges.** Take `0->1 (2)`, `0->2 (3)`, `2->1 (-2)`, `1->3 (1)`. The code returns `dist[3] = 3`, but the true answer is 2 (0→2→1→3 = 3 − 2 + 1). Here's what went wrong. Node 1 was settled at 2 before the negative edge was seen. Node 3 had then already been relaxed from that wrong value.
- **Unreachable nodes.** Decide what `inf` should mean in your answer before you return it.
- **Undirected graphs.** Add each edge in both directions.

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

Skipped for this module. In Swim In Rising Water you have to work out again why settling on pop is still safe under that problem's own path-cost rule. So you'll practise this technique from scratch there.

### Transfer test

A warehouse grid: moving onto a floor tile costs 1 second, and moving along a conveyor belt tile costs 0 seconds. You want the fastest time from the loading dock to every shelf. Would you use Dijkstra? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Dijkstra's algorithm (always finalise the unsettled node with the smallest tentative distance from a min-heap; correct only when every edge weight is non-negative). Scenario: A warehouse grid: moving onto a floor tile costs 1 second, and moving along a conveyor belt tile costs 0 seconds. You want the fastest time from the loading dock to every shelf.
Ask me whether I would use Dijkstra's algorithm here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Prim's

### Foundation

You have to cable together every office on a campus, and each possible cable has a price. You don't care how far any office is from any other. You only want every office connected, at the lowest total price.

The cheapest set of cables that does this always forms a tree. Why? If your cables formed a cycle, you could remove one cable from it and everything would still be connected, for less money. This cheapest tree is called the **minimum spanning tree (MST)**. "Spanning" means it touches every node. A tree on V nodes always has V − 1 edges.

Prim's algorithm grows one connected blob of offices. It starts at any node. At every step, it buys the cheapest cable that leaves the blob.

### Mechanics

Why is it safe to always grab the cheapest cable? The reason is called **the cut property**.

A **cut** is any split of the nodes into two groups. The cut property says: the cheapest edge crossing between the two groups belongs to some MST.

Here's the proof, an exchange argument. Call that cheapest crossing edge `e`. Take any MST that doesn't contain `e`. Adding `e` to it creates a cycle. That cycle crosses the split once through `e`, so it has to cross back through some other edge `f`. Since `e` is the cheapest crossing edge, `f` costs at least as much as `e`. Swap `f` out and `e` in. You still have a spanning tree, and it costs no more. So some MST contains `e`.

Prim's always uses the same cut: (the blob, everything else). So the cheapest edge leaving the blob is always safe to take. The blob is itself a tree at every step, so from here on we'll just call it the tree.

The loop has the same shape as Dijkstra's, with one difference that matters: **the heap key is the weight of the single edge, `w`, not the path total `d + w`.** Prim's asks "how cheap is it to attach this node to the tree?" It doesn't ask "how far is this node from the start?"

1. Push `(0, start)`.
2. Pop the smallest `(w, u)`. If `u` is already in the tree, it's stale, so skip it.
3. Add `u` and add `w` to the total.
4. Push `(weight, v)` for every edge to a node `v` not yet in the tree.

Worked example: an undirected graph with 5 nodes.

Edges: `0-1 (4)`, `0-2 (1)`, `1-2 (2)`, `1-3 (5)`, `2-3 (8)`, `3-4 (3)`, `2-4 (9)`.

The MST is `0-2 (1)`, `2-1 (2)`, `1-3 (5)`, `3-4 (3)`, with total 1 + 2 + 5 + 3 = 11.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/mst-graph.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-advanced-graphs/prim-trace.svg %}</figure>

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

Edge cases I ran:

- `n = 1` gives 0.
- A disconnected graph gives `None`.
- A triangle of equal weights gives 2.

I also checked it against the Kruskal version from the next module on 300 random graphs. The totals matched every time.

**Complexity.** With the heap, it's O(E log E) time and O(V + E) space.

Dense graphs are a special case. If every pair of nodes has an edge (a **complete** graph), E is about V²/2. There's a heap-free version of Prim's that keeps a `best[v]` array and scans the whole array for the minimum each round. That version runs in O(V²) (recalled). On a complete graph, that beats the heap version's O(V² log V).

### Recognition

Signals:

- Phrases like "connect all", "every node must be reachable" or "minimum total cost to link".
- The graph is undirected.
- There is **no source node**. The answer is one number for the whole network, not one number per node.

A shortest-path tree and a spanning tree are different things. Let's compare them on the same example graph.

- Run Dijkstra from 0, treating the edges as undirected. It gives distances `[0, 3, 1, 8, 10]`, using edges `0-2, 2-1, 1-3, 2-4`. Those edges have a total weight of 17.
- The MST uses `3-4` instead of `2-4`, and totals 11.

The difference is node 4. Dijkstra wants node 4 as close to node 0 as possible, so it uses the edge `2-4` for 9. The MST doesn't care how far node 4 is from node 0, so it attaches node 4 for just 3.

Min Cost to Connect All Points shows the "connect all, no source" signal. Its graph is complete, so that's also where the dense-graph note above matters.

### Pitfalls

- **Using `d + w` as the key.** That turns Prim's into Dijkstra. You get the shortest-path tree (17 here), not the MST (11).
- **Adding `w` before the stale check.** Then the stale `(4,1)` gets counted, and the total comes out as 15.
- **Disconnected input.** The loop ends with fewer than V nodes in the tree. Return a sentinel value (like `None`), not the partial sum.
- **Directed graphs.** An MST is defined for undirected graphs. The directed version (called an arborescence) needs a different algorithm.

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

Included for this module. Min Cost to Connect All Points is a straight MST problem. Solving it doesn't make you rebuild this technique from scratch, so the mechanics get their own workout here.

A village has `n` houses numbered 1 to `n`. House `i` can get water by digging its own well for `well[i-1]`, or by laying a pipe to another house. `pipes` lists `(a, b, cost)` for the pipes that can be laid, and water flows both ways along a pipe. Find the minimum total cost so that every house has water.

Example: `well = [5, 4, 3, 6]`, `pipes = [(1,2,2), (2,3,2), (3,4,1), (1,4,7)]`. The answer is 8.

Before you open the chat, write down four things: the key observation, your approach, why it's correct, and its complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A village has n houses numbered 1 to n. House i can get water by digging its own well for well[i-1], or by laying a pipe to another house. pipes lists (a, b, cost) for the pipes that can be laid, and water flows both ways along a pipe. Find the minimum total cost so that every house has water. Example: well = [5, 4, 3, 6], pipes = [(1,2,2), (2,3,2), (3,4,1), (1,4,7)]. The answer is 8.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
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

Kruskal's builds the same MST from the other direction. It doesn't grow one blob. Instead, you sort **all** the cables by price and go down the list. You buy each cable unless its two ends are already connected.

Early on you have many small islands of connected offices. As you buy cables, the islands merge, until there is just one.

### Mechanics

We'll call each island a **component**: a group of nodes that are all connected to each other by the edges taken so far.

1. Sort the edges by weight.
2. For each edge `(u, v, w)`: if `u` and `v` are in different components, take the edge and merge the two components. Otherwise skip it, because it would close a cycle.
3. Stop after V − 1 edges have been taken.

Step 2 needs two operations: "are these in the same component?" and "merge them". Those are exactly Union-Find's `find` and `union` from [Part 14](/blogs/dsa-graphs/). I'm not re-teaching Union-Find here. The version below uses path halving and union by size.

**Why taking the edge is safe.** Say we take `(u, v, w)`. Look at the cut (u's current component, everything else). Every edge cheaper than `w` has already been looked at, and each one went one of two ways:

- It was taken, so it now sits inside some component.
- It was skipped, because its ends were already in one component.

Either way, that cheaper edge doesn't cross our cut. So `(u, v, w)` is the cheapest edge crossing the cut, and the cut property from Prim's says it's safe to take. **The same cut property proves both algorithms.** They just use different cuts.

**Why skipping is safe.** A skipped edge joins two nodes that are already connected, by edges no heavier than it. Adding it would only close a cycle.

The worked example is the same graph we used for Prim's.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/kruskal-trace.svg %}</figure>

Kruskal's takes `3-4 (3)` before `1-3 (5)`. Prim's took them the other way round. That's because Prim's could only reach node 4 from its tree once node 3 had joined. The final edges and the total (11) are the same.

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

Edge cases I ran:

- `n = 1` gives 0. Zero edges are needed, and `taken == n - 1 == 0` is true from the start.
- A disconnected graph gives `None`.
- A triangle of equal weights gives 2.

**Complexity.**

- The sort costs O(E log E).
- Each Union-Find operation is almost O(1) (recalled: it's the inverse Ackermann function, amortised, when you use path compression or halving plus union by size). "Amortised" means averaged over many operations: a single call can be slower, but the average stays tiny.
- So the total time is O(E log E).
- Space is O(V + E): O(V) for the DSU (the Union-Find structure) plus O(E) for the sorted copy of the edges.

### Recognition

Kruskal's fits better than Prim's when:

- The input is already an **edge list**, and you don't want to build an adjacency list.
- You care about the **order in which components merge** as the allowed weight grows. Because edges are processed from lightest to heaviest, one pass answers "which nodes are connected using only edges ≤ t?" for every t at once.
- The graph is sparse (few edges). On a complete graph with about V²/2 edges, sorting them all costs more than dense Prim's O(V²).

The merge order has one more useful property. Take any two nodes. Watch for the moment they first land in the same component, and look at the weight of the edge being processed right then. That weight is the smallest possible value of the heaviest edge on any path between them. Keep this in mind for "minimise the worst single step" questions.

### Pitfalls

- **Forgetting to sort**, or sorting by the wrong field of the tuple.
- **Assuming the graph is connected.** Check `taken == n - 1`.
- **A hand-rolled Union-Find without path compression or union by size.** On a long chain, each `find` can slow down to O(V).
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

Included for this module. No problem on the list makes you derive Kruskal's from scratch, so the mechanics get their own workout here.

You have `n` items and the distance between every pair. Split them into exactly `k` non-empty groups so that the **smallest distance between two items in different groups** is as large as possible, and return that distance.

Example: points on a line at positions `[0, 1, 3, 10, 11, 20]`, where distance is `|a - b|`. With `k = 3`, the answer is 7. With `k = 2` it's 9, and with `k = 4` it's 2.

Before you open the chat, write down four things: the key observation, your approach, why it's correct, and its complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
You have n items and the distance between every pair. Split them into exactly k non-empty groups so that the smallest distance between two items in different groups is as large as possible, and return that distance. Example: points on a line at positions [0, 1, 3, 10, 11, 20], where distance is |a - b|. With k = 3, the answer is 7. With k = 2 it's 9, and with k = 4 it's 2.
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity, before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
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

Think of a to-do list with rules like "X must happen before Y". A **topological order** lists every item so that each rule points forward: X always appears before Y.

Such an order exists exactly when the rules have no cycle. A graph like that is called a DAG (directed acyclic graph: edges have a direction, and there are no cycles).

Part 14 found cycles with 3-colour DFS. This module uses **Kahn's algorithm** instead. Kahn's builds the order directly. It detects a cycle by coming up short: it can't place every item.

### Mechanics

**Step zero: turn the rules into edges.** Most mistakes happen here, before any algorithm runs.

- **Direction.** An edge points from what comes first to what comes after. "a needs b", "b before a", "a depends on b" and "b unlocks a" all become the same edge, `b -> a`. Before you write any code, write down one example rule and its arrow.
- **Every item is a node**, including items that appear in no rule. Those items have indegree 0 (defined below), so they can go anywhere in the order. But they still have to appear in the output.
- **One piece of evidence gives one edge.** Add only what the input directly states. Say you know "a before b" and "b before c". You don't need a separate edge for "a before c". The order will respect it anyway, because it follows from the other two.
- **Duplicate rules** are harmless if you update the edge list and the indegree count together. They break things if you deduplicate one and not the other.
- **Contradictions** in the input show up as a cycle.

**Kahn's loop.** A node's **indegree** is the number of edges pointing into it. In Kahn's loop, `indegree[v]` counts v's prerequisites that haven't been placed yet. A node with indegree 0 is ready to go.

1. Put every node with `indegree == 0` in a queue.
2. Pop `u` and append it to the output. For each edge `u -> v`, decrement `indegree[v]`. Any `v` that reaches 0 joins the queue.
3. If the output ends up shorter than the number of nodes, there is a cycle.

**Why placing a zero-indegree node is safe.** Everything it depends on is already in the output. So no rule can later point backwards to it.

**Why coming up short means a cycle.** Suppose the queue empties while some nodes are still unplaced. Call them the leftovers. Every leftover still has a prerequisite that hasn't been placed, and that prerequisite is also a leftover. So start at any leftover and walk backwards, from each node to one of its unplaced prerequisites. There are only finitely many leftovers, so the walk must eventually revisit a node. That repeated stretch is a cycle.

Worked example: a build pipeline.

Items: `fetch, lint, build, test, ship, docs`.
Rules: lint needs fetch, build needs fetch, test needs build, ship needs test, ship needs lint. docs has no rules.

Edges: `fetch->lint`, `fetch->build`, `build->test`, `test->ship`, `lint->ship`.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/topo-graph.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-advanced-graphs/kahn-trace.svg %}</figure>

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

Edge cases I ran:

- No items gives `[]`.
- A single item gives `['a']`.
- The rule `("a","b")` given twice still gives `['b', 'a']`.
- A rule where an item needs itself, `("a","a")`, gives `None`.

**Complexity.** O(V + E) time, because each node is queued once and each edge is decremented once. O(V + E) space.

### Recognition

Signals:

- Words like "prerequisites", "dependencies" or "must come before".
- "Order of tasks/courses/letters", or "is there a valid ordering".
- "Detect a circular dependency".

The input is a set of rules, each about the order of two items. The output is either one full ordering, or a yes/no answer about whether one exists.

Kahn versus DFS (Part 14): both run in O(V + E). Kahn has a few practical advantages:

- It gives you the cycle signal as a simple count.
- You can swap the queue for a heap to get the smallest-first order.
- The queue length tells you whether the order is unique.

DFS gives the order as reverse postorder, and it fits naturally if you're already doing a DFS.

On the list, Alien Dictionary shows the signal. You have to infer an order, and the edges are hidden in the input rather than handed to you.

### Pitfalls

- **Reversed edges.** The code runs happily and returns a valid order, but for the reversed rules. Here that gives `['ship', 'docs', 'test', 'lint', 'build', 'fetch']`. Ship comes first, which is wrong. Nothing crashes, so this bug is silent.
- **Missing isolated nodes.** If you only create nodes from the rules, `docs` disappears from the output.
- **Forgetting the length check.** Without it, a cyclic input returns a partial order as if it were an answer (`['docs']` in the cycle example).
- **Deduplicating edges but not indegrees**, or the other way round.
- **Assuming the order is unique.** Usually many orders are valid. If a question wants one specific order, it has to say which one (for example, smallest first).

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

Skipped for this module. In Alien Dictionary you have to work out the edges from the input yourself, and that's the hard part of this module. So we'll cover that reasoning when we solve it directly.

### Transfer test

A spreadsheet where cells hold formulas that reference other cells. After an edit, you need to recompute every cell exactly once, after all the cells it references, and report an error if there's a circular reference. Would you use a topological sort? Why?

{% capture coach %}
You are my coding-interview coach. I just learned topological sort with Kahn's algorithm (order items so every "must come before" rule points forward by repeatedly placing a node whose prerequisites are all placed; coming up short means a cycle). Scenario: A spreadsheet where cells hold formulas that reference other cells. After an edit, you need to recompute every cell exactly once, after all the cells it references, and report an error if there's a circular reference.
Ask me whether I would use a topological sort here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Bellman-Ford and bounded-edge shortest paths

The problems below also need this module. Cheapest Flights Within K Stops caps how many edges a path may use. Dijkstra settles each node once, and that rule has no way to respect the cap.

### Foundation

Forget the fire that settles each town once. Think in rounds instead.

- After round 1, you know the cheapest way to reach anything using 1 edge.
- After round 2, you know the cheapest way using up to 2 edges. You get it by extending round 1's answers by one more edge.
- After r rounds, you have the cheapest path using **at most r edges**.

Nothing gets settled early. So there's no greedy step for a negative edge or a hop limit to break.

### Mechanics

**Invariant:** after round r, `dist[v]` is the minimum cost over all paths from src to v that use ≤ r edges.

Each round r works like this. First take a snapshot, `prev = dist[:]`. It holds the values from round r − 1. Then, for every edge `(u, v, w)`: if `prev[u] + w < dist[v]`, set `dist[v] = prev[u] + w`.

**Why the snapshot matters.** Suppose you read from `dist` while you're also writing to it. An edge processed later in the round can then extend a path that was improved earlier in the same round. So one round can add several edges to a path, not just one. For classic Bellman-Ford that's harmless: with no cap, more progress per round is fine. But when the rounds are your edge budget, it gives wrong answers.

**Classic Bellman-Ford.** A shortest simple path (one that never repeats a node) has at most V − 1 edges. So V − 1 rounds, done in place with no snapshot, handle any graph that has negative edges but no negative cycle. A **negative cycle** is a loop whose weights add up to less than zero, so going around it again always lowers the cost. If a V-th round still improves something, a negative cycle is reachable from the source.

**Early exit.** If a whole round changes nothing, the next round sees exactly the same inputs. So it would change nothing too, and you can stop.

Worked example: 4 nodes, source 0, and we care about node 1.

Edges, in this list order: `0->2 (1)`, `2->3 (1)`, `3->1 (1)`, `0->1 (5)`, `2->1 (3)`.

There are three paths to node 1:

- `0->1` = 5, using 1 edge.
- `0->2->1` = 1 + 3 = 4, using 2 edges.
- `0->2->3->1` = 1 + 1 + 1 = 3, using 3 edges.

So the cheapest path overall uses 3 edges. With a budget of 2 edges, the answer is 4. With a budget of 1 edge, it's 5. Dijkstra would settle node 1 at 3, and it has no way to give you the 2-edge answer.

### Diagram

<figure class="sketch">{% include sketches/dsa-advanced-graphs/bellman-rounds.svg %}</figure>

The last row shows the snapshot bug in action. With in-place updates and this edge order, round 1 already reports a 3-edge path.

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

Edge cases I ran:

- `max_edges = 0` leaves only the source at 0 (`[0, inf, inf]`).
- A single node gives `[0]`.
- A graph with a negative edge (`0->1 (4)`, `1->2 (-3)`, `0->2 (2)`, budget 2) gives `[0, 4, 1]`. That's correct, because 4 − 3 = 1 beats the direct edge's 2.

**Complexity.** Let k be the edge budget. It's O(k · E) time and O(V) space (two arrays). Classic Bellman-Ford is O(V · E).

### Recognition

Signals:

- "At most k edges/stops/steps/transfers".
- Negative weights.
- "Detect a negative cycle", or "arbitrage".

In all of these, the cost of a path depends on both its total and its length.

How it differs from its neighbours:

- **Dijkstra** is faster when weights are non-negative and there's no length cap. But it breaks if either of those fails.
- **BFS over (node, edges-used) states** is another way to handle a cap. It costs O(k · (V + E)) in the worst case.

On the list, Cheapest Flights Within K Stops shows the "at most k" signal. Working out how its stop limit maps onto a number of rounds is part of solving it.

### Pitfalls

- **In-place updates with an edge budget.** You get the wrong answer: 3 instead of 5 at budget 1.
- **Off-by-one between the budget and the rounds.** Make sure you know whether your limit counts edges or the nodes in between. They differ by one.
- **`INF` arithmetic.** In Python, `float('inf') + w` is still `inf` (recalled). If you use a large integer as the sentinel instead, check `prev[u] != INF` explicitly. Otherwise `INF + (-3)` will look like a real distance.
- **Early exit with `dist == prev`** is safe only because each round's values depend on nothing but the previous round's values.

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

Skipped for this module. Cheapest Flights Within K Stops is the only problem on the list that uses it. There you have to work out how the stop limit becomes the round budget, so we'll cover that when we solve it directly.

### Transfer test

You have exchange rates between currencies, and you want to know if some sequence of trades turns 1 unit into more than 1 unit. Would you use Bellman-Ford? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Bellman-Ford (relax every edge once per round; after r rounds you have the cheapest paths of at most r edges; handles negative weights, and an improvement after V - 1 rounds means a negative cycle). Scenario: You have exchange rates between currencies, and you want to know if some sequence of trades turns 1 unit into more than 1 unit.
Ask me whether I would use Bellman-Ford here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

**How they connect to Advanced Graphs.** All five modules share one loop. Keep a **frontier** (the set of candidates you could handle next), pick the next one, then update its neighbours. What changes from algorithm to algorithm is what you pick, and why that pick is safe:

| Algorithm | Frontier | Pick | Safe because |
| --- | --- | --- | --- |
| Dijkstra | min-heap by path total `d + w` | smallest total | non-negative weights: nothing later is cheaper |
| Prim | min-heap by single edge `w` | cheapest edge leaving the tree | cut property on (tree, rest) |
| Kruskal | all edges, sorted | cheapest edge between two components | cut property on (component, rest) |
| Kahn | queue of indegree-0 nodes | any ready node | all its prerequisites are already placed |
| Bellman-Ford | no frontier; every edge each round | nothing is final | round r covers every path of ≤ r edges |

The heap from [Part 10](/blogs/dsa-heaps/) powers the first two. Union-Find from [Part 14](/blogs/dsa-graphs/) powers the third.

**Telling the competing approaches apart:**

- **Shortest path or spanning tree?** Ask: is there a source, and is the answer per node or per route? If yes, it's a shortest path. Is the answer one total for connecting everything? Then it's an MST. The example graph showed how different they are: the shortest-path tree totalled 17, and the MST totalled 11.
- **Dijkstra or BFS?** Equal weights mean BFS. Unequal, non-negative weights mean Dijkstra.
- **Dijkstra or Bellman-Ford?** Negative weights, a cap on edges, or a question about negative cycles all mean Bellman-Ford. For the cap, BFS over (node, edges-used) states also works.
- **Prim or Kruskal?** If you have an adjacency list or a dense graph, go with Prim. If you have an edge list or a sparse graph, or you need the merge order by threshold, go with Kruskal.
- **Kahn or DFS topological sort?** Either works. Use Kahn when you need the cycle count, the smallest-first order, or a uniqueness check. Use DFS when you're already doing a DFS.
- **Something none of these covers.** "Use every edge exactly once" asks for an Eulerian path, not a shortest path. The standard tool is Hierholzer's algorithm (recalled: a DFS that uses up each edge once and records a node only after all its edges are used, then reverses that record). It's not taught here. Reconstruct Itinerary shows this signal.

**Recognition checklist for an unfamiliar graph problem:**

1. What are the nodes and edges? Are they given, or hidden in a grid, a set of states, or a set of constraints? Directed or undirected?
2. Is there a source? Is the answer per node, a single total, or an ordering?
3. Are weights all equal, non-negative, or possibly negative?
4. How is a path's cost combined: a sum, the max of its steps, a count of edges? Does the "settle once" argument still hold for that rule?
5. Is there a limit on path length (edges, stops, transfers)?
6. Does every node need to be included (spanning), or every edge used once (Eulerian)?
7. Are there order rules? Which way does each arrow point, and could the rules contradict each other (a cycle)?
8. How big is the input? Dense graphs change which version is fastest (O(V²) Prim, or all-pairs methods when V is tiny).

## The problems

Work through these with the solving cycle from [Part 1](/blogs/dsa-the-method/). Give each problem a 15-minute struggle, write down the key insight in one sentence, then review it with spaced repetition.

During the struggle, sketch a small example first. Then ask yourself:

- DFS, BFS, Dijkstra, or topological sort?
- Do I need cycle detection, or just a visited set?

Simulate by hand before you code. You should be able to explain the order nodes are visited in, and what stops an infinite loop.

{% include dsa-problems.html slug="dsa-advanced-graphs" %}

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
