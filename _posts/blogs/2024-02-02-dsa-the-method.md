---
layout: post
title: "Following a solution and finding one are different skills. This series trains the second."
date: 2024-02-02 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, study-system, interview-prep, python, series]
read_time: 16
permalink: /blogs/dsa-the-method/
excerpt: "Watching a solution teaches you to recognise it after someone shows it. An interview asks you to find it with nobody showing you. This is the system I use for 150 problems, and the map for the 18 lessons that follow."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 1
series_total: 19
links_new_tab: true
---

For a while I could follow every solution video I watched. Then I'd open a problem I hadn't seen before and have no idea what to try first.

It took me a while to see why. A solution video trains you to recognise an approach after someone has shown it to you. An interview asks for something else: you read the problem statement and have to find the approach yourself, with nobody pointing the way. Those are two different skills, and only the second one counts.

So the goal of this series fits in one sentence: **given an unseen problem, recognise the pattern and solve it on my own.** This post covers three things:

- the system I use to train that skill,
- the order the eighteen topic posts follow,
- the prompt those posts are generated from, in case you want to re-run a lesson as a live chat.

[Part 2](/blogs/dsa-arrays-and-hashing/) starts the topics with Arrays & Hashing.

## Why watching doesn't get you there

When you watch a solution, someone else does the recognising for you. The narrator says "this is a sliding window" in the first minute. Everything after that is mechanics: how to move the indices, what to store, how to write the loop.

So you end up practising the mechanics. You never practise the moment that actually decides the problem. That moment is when you look at a fresh problem statement and notice the clues yourself. For example: the input is contiguous (the answer is an unbroken stretch of the array), the condition is monotone (it only ever moves one way as the stretch grows), so a window will do.

That means recognition has to be trained in the forward direction:

1. Learn a technique's signals before you see the problems it solves.
2. Attempt those problems cold, with no hints.
3. Check your answer.

Everything else in this system is support built around those three steps.

## The topic map

The 18 topics depend on each other. You can draw them as a dependency graph, where each topic is linked to its parents: the topics you should learn before it. Advanced Graphs, 2-D DP and Math & Geometry each wait on two parents.

<figure class="sketch">{% include sketches/dsa-the-method/topic-map.svg %}</figure>

Stack and Sliding Window are leaves, which means nothing on the map depends on them. You'll still use both all the time.

The series walks this graph level by level. A topic only appears after every one of its parents has been covered. Some examples:

- Advanced Graphs comes after both Heap and Graphs, because Dijkstra is a heap driving a graph traversal.
- 2-D DP comes after both Graphs and 1-D DP.
- Math & Geometry comes last, because it waits on 2-D DP and Bit Manipulation.

That's why the order below isn't the usual problem-list order. A problem list groups problems by topic. This series is ordered by what you need to know already.

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

The problem counts add up to 150.

Sometimes a topic's problems need a technique that its prerequisites don't list. Examples are a monotonic stack, Union-Find, or finding where a cycle starts. In those cases the post either folds the technique into the closest module, or adds one clearly labelled extra module at the end.

## How each topic post is built

I first built this system as a prompt for an AI coach. You fill in a topic, its prerequisites and its problem list, then paste the prompt into a chat. The chat teaches you the prerequisites before you touch any of the problems.

Re-opening that prompt and filling it in for every topic got tedious. So each topic post in this series is that lesson, written out once and checked. The post copies the prompt's structure.

Each prerequisite gets its own `##` module, in the order listed. A module has these parts:

- **Foundation.** The intuition in plain words, and what problem the technique solves.
- **Mechanics.** How the technique works, step by step. It spells out the invariant (a fact that stays true at every step) and explains why each move is safe, for example why a pointer can advance or why a candidate can be thrown away. It includes one worked example with real numbers, actually computed rather than guessed.
- **Diagram.** Only when it helps. It's a hand-drawn figure of the same worked example. Arrays, pointers, windows and stacks get drawn where exact positions matter. Trees, graphs and flows get drawn where the shape matters.
- **Implementation.** Idiomatic Python. Before it went into the post, I ran it against the same example plus some edge cases. It gives time and space complexity, with each variable defined. When a comment claims something is correct, it names the actual values. Anything I recalled rather than worked out (say, "heapq is a min-heap") is marked as recalled.
- **Recognition.** The signals that point at the technique: sortedness, contiguity, counting, a monotone condition, constraint sizes. It also says when not to use it, and how it differs from the technique it's most easily confused with.
- **Pitfalls.** Off-by-ones, empty and single-element inputs, duplicates, bad initialisation, infinite loops.
- **Active Recall.** Three to five reasoning questions about the mechanics you just learned. They use small generic examples, never a problem from the list.
- **Mini-task (conditional).** This one depends on the topic's problems. If none of them forces you to work out this technique from scratch, you get an unfamiliar problem where the technique isn't named. The coach behind it hints only when you're stuck, a little more each time. It shows a solution only if you ask for one after trying. If a list problem already exercises the technique, the post says so in one line and skips the mini-task.
- **Transfer test.** One short, unfamiliar scenario. Would you use the technique here, and why?

After all the prerequisites comes **Integration**. It covers how the prerequisites connect to the topic, how to tell competing approaches apart, and a recognition checklist for problems you haven't seen.

Then comes **The problems**: a table of the topic's exact problems from the list. Each row has:

- a link to the problem page,
- a tag: easy, medium or hard,
- a **coach** link that opens a chat running the cycle below for that one problem.

That chat makes you struggle first. It hints only when you say what you're stuck on, and it ends by drafting your tracker row. Nothing in the post solves or walks through any of those problems, and that's on purpose. The post stops right where you'd start solving.

A blog can't pause and wait for you the way a chat can, so a chat does the waiting. **Checkpoints have no answers on the page. Work them out, then open the linked chat to have your answer checked.**

Each checkpoint (Active Recall, Mini-task, Transfer test) ends with a link. The link opens ChatGPT or Claude with a coaching prompt already typed in. That prompt knows what the lesson taught. It asks the questions one at a time, waits for your attempt, and then confirms or corrects it.

Answer out loud or on paper first. If you ask for the answer straight away, the question turns back into reading, and reading is the habit this series exists to break.

The order (signals and invariants first, problems last) is deliberate. If you learn a pattern from a solution, you only recognise it after you've seen the solution. If you learn it from its properties and then meet the problems cold, you practise recognising it before anyone shows you.

After each lesson, **spend five minutes summarising it aloud**. Cover the mental model, the invariant and the signals. It feels a bit silly, but it works. The parts you can't say smoothly are the parts you don't know yet.

## The problem-solving cycle

The lesson gets you ready. The problems are where you actually build the skill. For every one of the 150 problems I run the same six steps.

### 1. Struggle with purpose (15 minutes)

Solve the problem from scratch, with no hints. The struggle isn't random. It follows four steps:

1. Restate the problem in your own words.
2. Read the constraints as hints. The input size often tells you the target complexity before you have any idea how to solve it.
3. Get a brute-force solution working in your head, however slow it is.
4. Look at what the brute force wastes, and attack that. What is it computing more than once? What is it checking that it could rule out?

For step 2, here's the cheatsheet I use to turn input size into a target complexity. **These are rules of thumb.** They assume the judge (the system that runs your code) allows somewhere around 10⁷ to 10⁸ simple operations per second, and Python sits at the slow end of that range:

| Input size n | Target complexity | What it usually suggests |
| --- | --- | --- |
| n ≤ 10 to 12 | O(n!) or O(n · n!) | Permutations, brute-force orderings |
| n ≤ 20 to 25 | O(2ⁿ) or O(n · 2ⁿ) | Backtracking, subsets, bitmasks |
| n ≤ 100 to 500 | O(n³) | Triple loops, interval or 2-D DP |
| n ≤ 10³ to 5·10³ | O(n²) | Pairwise checks, quadratic DP |
| n ≤ 10⁵ to 10⁶ | O(n log n) or O(n) | Sorting, heaps, binary search, hashing, two pointers, windows |
| n up to 10⁹ or more | O(log n) or O(1) | Binary search on the answer, maths |

Say you're still stuck when the 15 minutes run out. Before moving on, finish one sentence: **"I'm stuck because ___."** For example, "I'm stuck because I don't know how to avoid rescanning the window each time."

Why bother? Because now the video has a specific question to answer. It fills one gap in your thinking instead of replacing your thinking.

### 2. Last-chance insight (5 minutes)

Open a video walkthrough of the problem. Pause it as soon as the problem has been restated. Hearing someone else describe the problem sometimes shakes an idea loose, so use those five minutes to think again before you watch any more.

The problem's coach link is the other way through this step. Tell it "I'm stuck because ___". It replies to that sentence with the smallest hint it can, rather than giving you the whole approach.

### 3. Absorb, then reconstruct

Watch only the approach, and stop before the coding starts. Make sure you understand why the approach works. Then close the video and write the code from scratch. If one specific line won't come, replay only that part of the video.

### 4. Explain aloud

Open a blank file and write the solution again, saying out loud what each line does as you type it. This turns "I understood it" into "I can produce it." Gaps show up quickly when you have to say the reason out loud.

### 5. Log it in the spreadsheet

Add one row per problem:

| Problem | Key sentence | Pattern | Complexity | Edge case missed | Solved |
| --- | --- | --- | --- | --- | --- |
| | | | | | Cold / Needed video |

**[Download the tracker spreadsheet (.xlsx)](/assets/downloads/dsa-tracker.xlsx){:download=""}.** Here's what's in it:

- All 150 problems in series order, each with its topic, difficulty and link.
- The columns above, ready to fill in.
- Each problem's next review date, worked out for you, and whether it's due.
- A dashboard that tracks the cold-solve ratio per topic. A cold solve is one you finished without watching the video.

It opens in Excel, or in Google Sheets via File > Import.

The **key sentence** is the column that matters most. It's one line that captures how the solution flows. Write it so that future-you can rebuild the whole solution from that line alone.

The test is strict. If you can't rebuild the solution from the sentence, the sentence was too vague, so rewrite it.

Here are some vague and good key sentences, on made-up problems:

| Made-up problem | Vague | Good |
| --- | --- | --- |
| Shortest subarray of positive integers with sum at least k | "Sliding window." | "Variable window over positives; extend right, and while sum ≥ k record the length and shrink from left; O(n)." |
| Group words that are rotations of each other | "Use a hash map." | "Key each word by its lexicographically smallest rotation; bucket in a dict of lists; O(n · L²) for n words of length L." |
| Smallest shelf width that fits all books, in order, into at most d rows | "Binary search." | "Binary search the width over [max book, sum of books]; feasible(w) greedily fills rows left to right and checks rows ≤ d; O(n log S), S = sum of books." |

Compare the two columns. The vague versions only name a technique. The good versions name three things: the state you keep, the move you make, and the condition that decides when to make it. Those three are what you forget first.

### 6. Spaced repetition

Spaced repetition means coming back to a problem at growing gaps, so it sticks without daily effort. Re-solve each problem after **1 day, 3 days, 7 days and 14 days**, but keep it light:

- **Default review, 2 minutes.** Cover the key sentence and look only at the problem name. Say the approach aloud. If you can state the pattern, the key idea and the complexity fluently, it passes. Move on.
- **Full re-code** only if the quick review fails, or if your first attempt was "Needed video."
- **If a review fails:** struggle for 5 minutes, then check the key sentence. Re-watch the video only as a last resort. That problem then **resets to day 1.**

The tracker does the date arithmetic for you. Enter the date you solved the problem and how many reviews have passed. It shows the next review date and marks the problem **due** when that day comes. A failed review takes two edits: set the date solved to today, and set reviews passed to 0.

Across 150 problems, most reviews stay two-minute reviews. The full re-codes go only where they're needed.

## Adapting the cycle by topic type

The six steps stay the same for every topic. What changes is the kind of struggle, and where the insight usually hides. Each topic post repeats the note that applies to it, just above its problem table.

- **Arrays & Hashing, Strings, Two Pointers, Sliding Window.** These are driven by patterns and are often mechanical. During the struggle, ask yourself:
  - Can a hash map or set give me O(1) lookups?
  - Would prefix sums help?
  - Can two pointers shrink the search space?

  The insight is usually picking the right data structure. Or it's reframing the problem as a condition on a subarray or window.
- **Dynamic Programming (1-D and 2-D).** These need you to model the state on purpose. Spend the first few minutes defining three things: what the state represents, the recurrence (how one state is built from smaller ones), and the base cases. If you get stuck, use the video for the recurrence only. Then rebuild in this order: recurrence first, then memoisation, then tabulation. When you explain it, focus on which overlapping subproblems get reused.
- **Graphs and Advanced Graphs.** Graph intuition is spatial, so sketch a small example. Then ask: is this DFS, BFS, Dijkstra or topological sort? Do I need cycle detection, or just a visited set? After watching, run the algorithm by hand on your sketch before coding. Your explanation should cover the traversal order and how infinite loops are prevented.
- **Trees, Tries, Heaps.** Here the core move is recursive decomposition: splitting the problem into the same problem on smaller subtrees. Ask: can I combine results from the left and right subtrees? Many solutions depend on choosing the recursive return value well. Rebuild the call stack on a small example, and explain how information moves from the leaves up to the root.
- **Backtracking.** Think in choices, constraints and pruning. Write a basic `backtrack(state)` skeleton early.
- **Greedy and Intervals.** Ask why the best choice right now stays the best choice overall. Many solutions rely on sorting or a heap. After watching, justify why the greedy decision is safe.

Stack, Binary Search, Linked List, Bit Manipulation and Math & Geometry each get a one-line version of the closest note in their own post.

## Principles

- **Struggle is necessary.** The difficulty is how pattern recognition develops. It isn't a sign that it's failing.
- **The key sentence is the asset.** If you can rebuild a solution from one line, you own the pattern. If you can't, the line was too vague.
- **Cold solves are the metric.** Track how many of your solves were Cold versus Needed-video. If that ratio rises, the workflow is working. If it stays flat on one topic, go back and revisit that topic's prerequisites.
- **Some topics are slower.** DP and graphs take more conceptual effort than arrays. That's expected.
- **Explaining aloud matters.** Talking through your reasoning shows up gaps faster than rereading does.
- **Plateaus are normal.** When progress stalls, revisit prerequisites and re-solve old problems, rather than only taking on new ones.

## The coaching prompt

Below is the prompt the whole series is built from, with its fields left blank. Every topic post ends with a copy that's already filled in with that post's topic, prerequisites and problem list. It's one click away from a live session, where you can push back, ask a follow-up or get a different example.

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

After the session, the same rule applies as with the posts. Spend five minutes summarising out loud before you open the first problem.

Next up is [Arrays & Hashing](/blogs/dsa-arrays-and-hashing/), the root of the graph.
