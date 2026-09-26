---
layout: post
title: "Following a solution and finding one are different skills. This series trains the second."
date: 2024-02-02 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, study-system, interview-prep, python, series]
read_time: 14
permalink: /blogs/dsa-the-method/
excerpt: "Watching a solution teaches you to recognise it after you have seen it. An interview asks for the opposite. This is the system I use for 150 interview problems, and the map for the 18 lessons that follow."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 1
series_total: 19
links_new_tab: true
---

These are my data structures and algorithms notes, cleaned up into nineteen posts. This one is the entry point: the method I use, the topic map the series follows, and how each of the eighteen topic posts is built. [Part 2](/blogs/dsa-arrays-and-hashing/) starts the topics with Arrays & Hashing.

For a while I could follow every solution video I watched. Each step made sense, the code was short, and I'd nod along to the complexity at the end. Then I'd open a problem I hadn't seen, and nothing came. I didn't know what to try first.

The problem wasn't effort. I was practising the wrong direction. A solution video trains you to recognise an approach once someone has shown it to you. An interview, or any real problem, asks you to go from the problem statement to the approach with nobody showing you anything. Those are different skills, and only the second one counts.

So the goal of this series is one sentence: **given an unseen problem, recognise the pattern and solve it on my own.** Everything below serves that sentence. This part covers the topic map, how each topic post is built, the cycle I run on every problem, and the prompt the posts are generated from, in case you want to re-run a lesson interactively.

## Why watching doesn't get you there

When you watch a solution, the recognition step happens for you. The narrator says "this is a sliding window" in the first minute, and everything after is mechanics. You end up practising mechanics and never the moment that decides the problem: looking at a blank statement and noticing that the input is contiguous, the condition is monotone, and a window will do.

Recognition has to be trained forwards. That means learning a technique's signals before seeing the problems it solves, then attempting those problems cold, then checking. The rest of the system is scaffolding around that.

## The topic map

The 18 topics form a dependency graph. An arrow means the topic below builds on the one above.

<figure class="sketch">{% include sketches/dsa-the-method/topic-map.svg %}<figcaption>The topic map: 18 topics, top to bottom in levels. An arrow from A to B means B builds on A; Advanced Graphs, 2-D DP and Math &amp; Geometry each wait on two parents. DP is dynamic programming.</figcaption></figure>

Stack and Sliding Window are leaves. Nothing on the map depends on them, though you'll still use both constantly.

The series walks this graph level by level: a topic only appears after every one of its parents. Advanced Graphs comes after both Heap and Graphs, because Dijkstra is a heap driving a graph traversal. 2-D DP comes after both Graphs and 1-D DP. Math & Geometry comes last because it waits on 2-D DP and Bit Manipulation. That's why the order below isn't the usual problem-list order. A problem list groups by topic. This series is ordered by what you need to already know.

| Part | Topic | Prerequisites | Problems | Link |
| --- | --- | --- | --- | --- |
| 1 | The method | none | none | [/blogs/dsa-the-method/](/blogs/dsa-the-method/) |
| 2 | Arrays & Hashing | Dynamic Arrays; Hash Usage; Hash Implementation; Prefix Sums | 9 | [/blogs/dsa-arrays-and-hashing/](/blogs/dsa-arrays-and-hashing/) |
| 3 | Two Pointers | Two Pointers | 5 | [/blogs/dsa-two-pointers/](/blogs/dsa-two-pointers/) |
| 4 | Stack | Stacks | 6 | [/blogs/dsa-stack/](/blogs/dsa-stack/) |
| 5 | Binary Search | Search Array; Search Range | 7 | [/blogs/dsa-binary-search/](/blogs/dsa-binary-search/) |
| 6 | Sliding Window | Sliding Window Fixed Size; Sliding Window Variable Size | 6 | [/blogs/dsa-sliding-window/](/blogs/dsa-sliding-window/) |
| 7 | Linked List | Singly Linked Lists; Doubly Linked Lists; Fast and Slow Pointers | 11 | [/blogs/dsa-linked-list/](/blogs/dsa-linked-list/) |
| 8 | Trees | BST Insert and Remove; Depth-First Search; Breadth-First Search; BST Sets and Maps; Iterative DFS | 15 | [/blogs/dsa-trees/](/blogs/dsa-trees/) |
| 9 | Tries | Trie | 3 | [/blogs/dsa-tries/](/blogs/dsa-tries/) |
| 10 | Heap / Priority Queue | Heap Properties; Push and Pop; Heapify; Two Heaps | 7 | [/blogs/dsa-heaps/](/blogs/dsa-heaps/) |
| 11 | Backtracking | Tree Maze; Subsets; Combinations; Permutations | 10 | [/blogs/dsa-backtracking/](/blogs/dsa-backtracking/) |
| 12 | Intervals | none (the topic is its own foundational module) | 6 | [/blogs/dsa-intervals/](/blogs/dsa-intervals/) |
| 13 | Greedy | Kadane's Algorithm | 8 | [/blogs/dsa-greedy/](/blogs/dsa-greedy/) |
| 14 | Graphs | Intro to Graphs; Matrix DFS; Matrix BFS; Adjacency List | 13 | [/blogs/dsa-graphs/](/blogs/dsa-graphs/) |
| 15 | 1-D Dynamic Programming | 1-Dimension DP; Palindromes | 12 | [/blogs/dsa-1d-dynamic-programming/](/blogs/dsa-1d-dynamic-programming/) |
| 16 | Advanced Graphs | Dijkstra's; Prim's; Kruskal's; Topological Sort | 6 | [/blogs/dsa-advanced-graphs/](/blogs/dsa-advanced-graphs/) |
| 17 | 2-D Dynamic Programming | 2-Dimension DP; 0 / 1 Knapsack; Unbounded Knapsack; LCS | 11 | [/blogs/dsa-2d-dynamic-programming/](/blogs/dsa-2d-dynamic-programming/) |
| 18 | Bit Manipulation | Bit Operations | 7 | [/blogs/dsa-bit-manipulation/](/blogs/dsa-bit-manipulation/) |
| 19 | Math & Geometry | none (the topic is its own foundational module) | 8 | [/blogs/dsa-math-and-geometry/](/blogs/dsa-math-and-geometry/) |

The problem counts add up to 150. Where a topic's problems need a technique its prerequisites don't list (a monotonic stack, Union-Find, finding where a cycle starts), the post folds it into the closest module, or adds one clearly labelled extra module at the end.

## How each topic post is built

I built this system as an AI-coach prompt: fill in a topic, its prerequisites and its problem list, paste it into a chat, and get taught the prerequisites before touching the problems. Re-opening and filling that prompt for every topic got tedious, so each topic post in this series is that lesson, written once and checked. The structure copies the prompt's.

For each prerequisite, in the order listed, a `##` module with these parts:

- **Foundation.** The intuition in plain words, and what problem the technique solves.
- **Mechanics.** Step by step, with the invariant spelled out and why each move is safe: why a pointer can advance, why a candidate can be discarded. One worked numeric example, computed for real, not guessed.
- **Diagram.** Only when it helps. A hand-drawn figure of the same worked example: arrays, pointers, windows and stacks where the exact positions matter; trees, graphs and flows where the shape does.
- **Implementation.** Idiomatic Python, run against that same example plus edge cases before it went in the post. Time and space complexity with the variables defined. Comments that claim something is correct name the actual values, and anything recalled rather than derived (say, "heapq is a min-heap") is marked as recalled.
- **Recognition.** The signals that point at the technique (sortedness, contiguity, counting, a monotone condition, constraint sizes), when not to use it, and how it differs from its nearest look-alike.
- **Pitfalls.** Off-by-ones, empty and single-element inputs, duplicates, bad initialisation, infinite loops.
- **Active Recall.** Three to five reasoning questions about the mechanics just taught, on small generic examples, never on a list problem.
- **Mini-task (conditional).** If none of the topic's problems forces you to derive this technique from scratch, you get an unfamiliar problem with the technique left unnamed. The coach behind it hints only when you're stuck, a little more each time, and shows a solution only if you ask after trying. If a list problem already exercises it, the post says so in one line and skips the mini-task.
- **Transfer test.** One short, unfamiliar scenario. Would you use the technique here, and why?

After all the prerequisites comes **Integration**: how they connect to the topic, how to tell competing approaches apart, and a recognition checklist for problems you haven't seen. Then **The problems**, a table of the topic's exact problems from the list: each linked to its problem page, tagged easy, medium or hard, and with a **coach** link that opens a chat running the cycle below for that one problem. It makes you struggle first, hints only when you say what you're stuck on, and ends by drafting your tracker row. Nothing in the post solves or walks through any of those problems. That's the point. The post stops right where you'd start solving.

A blog can't pause and wait for you the way a chat can, so the waiting is handed to one. **Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.** Each checkpoint (Active Recall, Mini-task, Transfer test) ends with a link that opens ChatGPT or Claude with a coaching prompt already typed. The prompt carries what the lesson taught, asks the questions one at a time, waits for your attempt, and then confirms or corrects it. Answer out loud or on paper first. Asking for the answer straight away turns the question back into reading, which is the habit this series exists to break.

The order (signals and invariants first, problems last) is deliberate. If you learn the pattern from a solution, you recognise it only after the solution. If you learn it from its properties and then meet the problems cold, you get practice at recognising it beforehand.

After each lesson, **spend five minutes summarising it aloud**: the mental model, the invariant, the signals. It feels a bit silly and it works. The parts you can't say smoothly are the parts you don't know yet.

## The problem-solving cycle

The lesson gets you ready. The problems are where the skill actually gets built. For every one of the 150 I run the same six steps.

### 1. Struggle with purpose (15 minutes)

Solve from scratch, no hints. The struggle has a shape:

1. Restate the problem in your own words.
2. Read the constraints as hints. They often tell you the target complexity before you have an idea.
3. Get a brute force working in your head, however slow.
4. Attack what the brute force wastes. What is it recomputing? What is it checking that it could rule out?

The constraint-size cheatsheet I use. **These are rules of thumb**, based on a judge allowing somewhere around 10⁷ to 10⁸ simple operations per second, and Python sits at the slow end of that:

| Input size n | Target complexity | What it usually suggests |
| --- | --- | --- |
| n ≤ 10 to 12 | O(n!) or O(n · n!) | Permutations, brute-force orderings |
| n ≤ 20 to 25 | O(2ⁿ) or O(n · 2ⁿ) | Backtracking, subsets, bitmasks |
| n ≤ 100 to 500 | O(n³) | Triple loops, interval or 2-D DP |
| n ≤ 10³ to 5·10³ | O(n²) | Pairwise checks, quadratic DP |
| n ≤ 10⁵ to 10⁶ | O(n log n) or O(n) | Sorting, heaps, binary search, hashing, two pointers, windows |
| n up to 10⁹ or more | O(log n) or O(1) | Binary search on the answer, maths |

If you're still stuck when the 15 minutes run out, finish one sentence before moving on: **"I'm stuck because ___."** For example, "I'm stuck because I don't know how to avoid rescanning the window each time." That turns the video into the answer to a specific question instead of a replacement for your thinking.

### 2. Last-chance insight (5 minutes)

Open a video walkthrough of the problem and pause as soon as the problem has been restated. Hearing someone else describe it sometimes shakes an idea loose. Use those five minutes to think again before watching any more. The problem's coach link is the other way through this step: tell it "I'm stuck because ___" and it answers that sentence with the smallest hint it can, instead of the whole approach.

### 3. Absorb, then reconstruct

Watch only the approach, and stop before the coding starts. Make sure you understand why it works. Then close the video and write the code from scratch. If one specific line won't come, replay only that segment.

### 4. Explain aloud

Rewrite the solution in a blank file, narrating every line as you go. This turns "I understood it" into "I can produce it," and gaps show up quickly when you have to say the reason out loud.

### 5. Log it in the spreadsheet

One row per problem:

| Problem | Key sentence | Pattern | Complexity | Edge case missed | Solved |
| --- | --- | --- | --- | --- | --- |
| | | | | | Cold / Needed video |

**[Download the tracker spreadsheet (.xlsx)](/assets/downloads/dsa-tracker.xlsx){:download=""}.** It has all 150 problems in series order, each with its topic, difficulty and link, and the columns above to fill in. It works out each problem's next review date and whether it's due, and a dashboard tracks the cold-solve ratio per topic. It opens in Excel, or in Google Sheets via File > Import.

The **key sentence** is the column that matters. It's one line capturing the flow of the solution, written so future-you can rebuild the whole thing from that line alone. The test is strict: if you can't rebuild the solution from it, the sentence was too vague. Rewrite it.

Some good and vague key sentences, on made-up problems:

| Made-up problem | Vague | Good |
| --- | --- | --- |
| Shortest subarray of positive integers with sum at least k | "Sliding window." | "Variable window over positives; extend right, and while sum ≥ k record the length and shrink from left; O(n)." |
| Group words that are rotations of each other | "Use a hash map." | "Key each word by its lexicographically smallest rotation; bucket in a dict of lists; O(n · L²) for n words of length L." |
| Smallest shelf width that fits all books, in order, into at most d rows | "Binary search." | "Binary search the width over [max book, sum of books]; feasible(w) greedily fills rows left to right and checks rows ≤ d; O(n log S), S = sum of books." |

The vague versions name a technique. The good versions name the state, the move, and the condition that drives the move, and that's what you forget first.

### 6. Spaced repetition

Re-solve after **1 day, 3 days, 7 days and 14 days**, but keep it light:

- **Default review, 2 minutes.** Cover the key sentence, look only at the problem name, and say the approach aloud. If you can state the pattern, the key idea and the complexity fluently, it passes. Move on.
- **Full re-code** only if the quick review fails, or if the first attempt was "Needed video."
- **If a review fails:** struggle for 5 minutes, then consult the key sentence, and re-watch only as a last resort. That problem **resets to day 1.**

The tracker does the date arithmetic: enter the date you solved it and how many reviews have passed, and it shows the next review and marks it **due** when the day comes. A failed review is two edits: date solved to today, reviews passed to 0.

Over 150 problems, most reviews stay two-minute reviews. The full re-codes go where they're needed.

## Adapting the cycle by topic type

The six steps stay the same everywhere. What changes is the kind of struggle, and where the insight usually hides. Each topic post repeats the relevant note above its problem table.

- **Arrays & Hashing, Strings, Two Pointers, Sliding Window.** Pattern-driven and often mechanical. During the struggle, ask: can a hash map or set give O(1) lookups? Would prefix sums help? Can two pointers shrink the search space? The insight is usually picking the right data structure, or reframing the problem as a condition on a subarray or window.
- **Dynamic Programming (1-D and 2-D).** Needs deliberate state modelling. Spend the first few minutes defining what the state represents, the recurrence, and the base cases. If you get stuck, use the video for the recurrence only, then rebuild: recurrence first, then memoisation, then tabulation. When you explain it, focus on which overlapping subproblems get reused.
- **Graphs and Advanced Graphs.** Graph intuition is spatial. Sketch a small example and ask: is this DFS, BFS, Dijkstra or topological sort? Do I need cycle detection, or just a visited set? After watching, simulate the algorithm by hand before coding. Your explanation should cover traversal order and how infinite loops are prevented.
- **Trees, Tries, Heaps.** Recursive decomposition is central. Ask: can I combine results from the left and right subtrees? Many solutions depend on a well-chosen recursive return value. Rebuild the call stack on a small example and explain how information moves from the leaves to the root.
- **Backtracking.** Choices, constraints, pruning. Write a basic `backtrack(state)` skeleton early.
- **Greedy and Intervals.** Ask why the locally optimal choice stays globally optimal. Many solutions rely on sorting or a heap. After watching, justify why the greedy decision is safe.

Stack, Binary Search, Linked List, Bit Manipulation and Math & Geometry each get a one-line version of the closest note in their own post.

## Principles

- **Struggle is necessary.** The difficulty is how pattern recognition develops, not a sign it's failing.
- **The key sentence is the asset.** If you can rebuild a solution from one line, you own the pattern. If you can't, the line was too vague.
- **Cold solves are the metric.** Track your ratio of Cold to Needed-video solves. A rising ratio means the workflow is working. A ratio that stays flat on one topic means you should revisit that topic's prerequisites.
- **Some topics are slower.** DP and graphs take more conceptual effort than arrays. That's expected.
- **Explaining aloud matters.** Talking through your reasoning exposes gaps faster than rereading does.
- **Plateaus are normal.** When progress stalls, revisit prerequisites and re-solve old problems instead of only taking on new ones.

## The coaching prompt

This is the prompt the series is built from, with blank fields. Every topic post ends with a copy already filled in with its topic, prerequisites and problem list, one click away from a live session where you can push back, ask a follow-up or get a different example.

```text
[TOPIC]:
[PREREQUISITES]:
[PROBLEM LIST]:
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
```

{% capture coach %}
[TOPIC]:
[PREREQUISITES]:
[PROBLEM LIST]:
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

After the session, the same rule as with the posts applies: five minutes, out loud, before you open the first problem.

Next up is [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/), the root of the graph.
