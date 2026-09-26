---
layout: post
title: "Linked lists punish you for letting go of the wrong pointer first"
date: 2024-02-16 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, linked-list, fast-slow-pointers, python, series]
read_time: 36
permalink: /blogs/dsa-linked-list/
excerpt: "Every linked list bug is the same bug: you overwrote a .next before anything else was holding the node it pointed to. Three modules on pointer surgery, sentinels, and two runners at different speeds, taught before the eleven problems so you can solve them yourself."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 7
series_total: 19
links_new_tab: true
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers linked lists: singly linked lists, doubly linked lists, and fast and slow pointers.

A linked list gives up the one thing arrays are best at, jumping to index i, and gets cheap splicing in return. Every problem in this category is a question about which pointers you hold, in what order you overwrite them, and where you can make a second pointer stand. It comes right after [Two Pointers](/blogs/dsa-two-pointers/) in the order this series follows, because half the tricks here are two pointers moving over nodes instead of indices, and together with [Binary Search](/blogs/dsa-binary-search/) it unlocks [Trees](/blogs/dsa-trees/), where every node simply has two `.next` fields instead of one.

The prerequisites here are singly linked lists, doubly linked lists, and fast and slow pointers. Those are the three modules below, in that order. Finding where a loop starts (Floyd's second phase) is folded into Fast and Slow Pointers, because one of the problems below also needs it.

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Singly Linked Lists

### Foundation

Think of a scavenger hunt. You're handed the first clue, and each clue tells you where the next one is hidden. There's no map of all the clues. To reach clue 5 you have to read clues 1 through 4.

That's a singly linked list: nodes that each hold a value and a reference to the next node, and a `head` reference to the first. The list *is* the head. Lose the head, or lose any `.next` in the middle, and everything after it is gone.

What you buy with that: once you're standing at a node, inserting or removing right after it is O(1), with no shifting of other elements. What you pay: reaching position k costs O(k), and you can only walk forward.

### Mechanics

Three operations cover almost everything.

1. **Traverse.** `cur = head`, then `while cur: ...; cur = cur.next`. Invariant: `cur` is the first node you haven't processed yet, and `None` means you've run off the end.
2. **Insert after a node `p`.** Point the new node at `p.next` first, then point `p` at the new node. The order is the whole lesson: if you set `p.next = new` first, the only reference to the rest of the list is gone.
3. **Delete the node after `p`.** `p.next = p.next.next`. Deletion is done from the *predecessor*. You can't delete a node you're standing on in a singly list, because you have no way back to the node before it.

That third point creates the classic special case: the head has no predecessor. The fix is a **dummy (sentinel) node**: a throwaway node whose `.next` is the head. Now every real node, including the head, has a predecessor, the same code handles all of them, and at the end you return `dummy.next`, which is whatever the head became.

The rule that prevents most bugs in this category: **before you overwrite a `.next`, make sure something else still references the node it pointed to.**

Worked example, reused through this module: remove every node with value 7 from `7 -> 3 -> 7 -> 7 -> 1`, then insert 5 after the new head.

Walk two pointers, `prev` (last node we're keeping) and `cur` (node being examined), starting at `prev = dummy`, `cur = first 7`.

- `cur` is 7: unlink it with `prev.next = cur.next`. The dummy now points at 3. `prev` stays on the dummy.
- `cur` is 3: keep it, `prev` moves to 3.
- `cur` is the second 7: unlink, 3 now points at the third 7. `prev` stays on 3.
- `cur` is the third 7: unlink, 3 now points at 1. `prev` still on 3.
- `cur` is 1: keep, `prev` moves to 1. `cur` becomes `None`, loop ends.

Result `3 -> 1`, returned as `dummy.next`. The first node of the original list was removed, and nothing special happened because of it. Inserting 5 after the head (the node 3) gives `3 -> 5 -> 1`.

Why is `prev` not advanced after an unlink? Because `prev.next` is now a node nobody has checked yet. Two adjacent 7s are exactly the case that breaks if you advance anyway (Active Recall question 1).

Why is `cur = cur.next` safe after an unlink? The removed node's own `.next` was never touched, so it still points into the live list.

### Diagram

One row per loop iteration, computed by running the implementation below. `D` is the dummy.

<figure class="sketch">{% include sketches/dsa-linked-list/remove-trace.svg %}<figcaption>Removing every 7 from 7 → 3 → 7 → 7 → 1. Each row is the list reachable from the dummy D after that iteration; the blue node is where prev stands afterwards. Red actions unlink, green actions keep.</figcaption></figure>

Zooming in on iteration 3, the unlink that happens with `prev` on 3:

<figure class="sketch">{% include sketches/dsa-linked-list/unlink-zoom.svg %}<figcaption>Iteration 3 up close. prev (blue) is on 3 and cur (amber) on the first remaining 7. After prev.next = cur.next, 3 skips over cur, but cur's own .next still points into the list, so cur = cur.next works.</figcaption></figure>

### Implementation

```python
class ListNode:
    # Same shape as LeetCode's node (recalled: LeetCode's Python stub is
    # ListNode(val=0, next=None)).
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def build(values):
    """[7, 3, 7, 7, 1] becomes 7 -> 3 -> 7 -> 7 -> 1. Returns the head, or None."""
    dummy = ListNode()
    tail = dummy                  # tail is always the last node built so far
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next


def to_list(head):
    out = []
    while head:                   # stops at None; would never stop on a list with a loop
        out.append(head.val)
        head = head.next
    return out


def remove_all(head, target):
    dummy = ListNode(0, head)     # dummy.next is head, so the real head has a predecessor too
    prev, cur = dummy, head       # invariant at the top of each iteration: prev.next is cur
    while cur:
        if cur.val == target:
            # Unlink cur. prev does NOT move, because prev.next is now cur.next,
            # a node nobody has checked yet. On 7 -> 3 -> 7 -> 7 -> 1 this is what
            # lets the third 7 get checked right after the second 7 is removed.
            prev.next = cur.next
        else:
            prev = cur            # cur is kept, so cur is the new last-kept node
        # Safe in both branches: an unlinked cur still has its original .next,
        # and in the keep branch prev is cur, so after this line prev.next is cur again.
        cur = cur.next
    return dummy.next             # not head: the original head (the first 7) was removed


def insert_after(node, val):
    new = ListNode(val)
    new.next = node.next          # new takes hold of the rest of the list first...
    node.next = new               # ...so node can let go of it without losing anything


head = remove_all(build([7, 3, 7, 7, 1]), 7)
print(to_list(head))              # [3, 1]
insert_after(head, 5)             # head is the node 3
print(to_list(head))              # [3, 5, 1]
```

Edge cases, run against `remove_all(build(values), 7)`:

| values | result |
| --- | --- |
| `[]` | `[]` |
| `[7]` | `[]` |
| `[7, 7, 7]` | `[]` |
| `[1, 2, 3]` | `[1, 2, 3]` |
| `[3, 7]` | `[3]` |
| `[7, 3]` | `[3]` |

Complexity: `remove_all` is O(n) time for n nodes, each visited once, and O(1) extra space (two pointers and one dummy). `insert_after` is O(1). Reaching the node you want to insert after is the O(k) part, and it's separate.

### Recognition

Signals:

- The input is a `ListNode` head, and the question asks you to rearrange, splice, remove or build nodes rather than just read values.
- "In place" or "O(1) extra memory". Copying the values into a Python list and back is the easy escape, and these constraints exist to close it.
- The head might change: removed, replaced, or not known until you've built the answer. That's the dummy node signal.
- You're producing a new list one node at a time. `build` above is the pattern: a dummy plus a `tail` pointer.

When not to use a linked list: if you need repeated random access by position, or you keep searching for a value, the O(k) walk dominates. In an interview, when the input is already a Python list and space isn't constrained, stay in arrays.

Distinguish it from array two pointers ([Part 3](/blogs/dsa-two-pointers/)): there's no index arithmetic and no moving backwards, so a "right" pointer that walks left doesn't exist. Anything that needs to look behind must have been saved on the way forward.

In this list: the head can change in Remove Nth Node From End of List, Merge Two Sorted Lists and Reverse Nodes In K Group. Building a result node by node shows up in Merge Two Sorted Lists and Add Two Numbers. In-place rewiring is the whole point of Reverse Linked List, Reorder List and Reverse Nodes In K Group.

### Pitfalls

- **Losing the rest of the list.** Any assignment to `x.next` destroys the only reference to the old `x.next` unless you saved it first.
- **Advancing `prev` after a removal.** Skips checking the next node. It's invisible until two targets are adjacent.
- **`None` dereferences.** `cur.next.next` crashes when `cur.next` is `None`. Check the shorter chain first: `cur.next and cur.next.next`.
- **Empty and single-node lists.** `head` can be `None`. Walk every function through `[]` and `[x]` before trusting it.
- **Returning `head` instead of `dummy.next`.** If the head was removed, `head` still points at the removed node.
- **Accidental loops.** Rewiring in the wrong order can make a node point back at an earlier node. Your `to_list` then never returns, which feels like a timeout rather than a bug.
- **Values versus identity.** Two nodes can hold the same value. Use `is` when you mean "the same node".

### Active recall

1. Suppose `remove_all` always ran `prev = cur`, including right after an unlink. What does it return for `3 -> 7 -> 7 -> 1` with target 7, and why?
2. What does `remove_all(build([7, 7, 7]), 7)` return, and what would go wrong if the function returned `head` instead of `dummy.next`?
3. In `insert_after`, swap the two lines so `node.next = new` runs before `new.next = node.next`. Starting from `3 -> 1`, what list do you get?
4. "Deleting from a linked list is O(1)." When is that true, and what's the real cost of deleting the node at position k (0-indexed) from a singly linked list?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied singly linked lists in Python: each node holds a value and a .next reference, and the list is only reachable from head. To insert after a node p, point the new node at p.next first, then set p.next to the new node; to delete the node after p, set p.next = p.next.next, so deletion always happens from the predecessor. A dummy (sentinel) node whose .next is the head gives every real node a predecessor, and you return dummy.next at the end. The rule: before you overwrite a .next, make sure something else still references the node it pointed to.
Worked example from the lesson: remove_all(head, target) starts with dummy = ListNode(0, head), prev = dummy, cur = head. In a loop while cur: if cur.val == target it does prev.next = cur.next and leaves prev where it is, otherwise prev = cur; then cur = cur.next in both branches; it returns dummy.next. On 7 -> 3 -> 7 -> 7 -> 1 with target 7 it returns 3 -> 1. insert_after(node, val) does new = ListNode(val); new.next = node.next; node.next = new. Inserting 5 after the node 3 gives 3 -> 5 -> 1. build([values]) makes a list from a Python list and to_list(head) reads it back.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Suppose remove_all always ran prev = cur, including right after an unlink. What does it return for 3 -> 7 -> 7 -> 1 with target 7, and why?
2. What does remove_all(build([7, 7, 7]), 7) return, and what would go wrong if the function returned head instead of dummy.next?
3. In insert_after, swap the two lines so node.next = new runs before new.next = node.next. Starting from 3 -> 1, what list do you get?
4. "Deleting from a linked list is O(1)." When is that true, and what's the real cost of deleting the node at position k (0-indexed) from a singly linked list?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: Reverse Linked List makes you derive pointer rewiring from nothing, which is exactly this module's mechanics exercised independently, so a separate checkpoint would only duplicate it.

### Transfer test

A music app keeps a queue of upcoming songs. Users constantly do two things: "play this next" (insert right after the song currently playing) and "remove the current song" (delete it and continue with the one after). Nobody ever asks for "song number 40". Would you store the queue as a singly linked list? Why?

{% capture coach %}
You are my coding-interview coach. I just learned singly linked lists (nodes that each point only to the next one; inserting or deleting after a node you hold is O(1), deletion needs the predecessor, and reaching position k costs O(k)). Scenario: A music app keeps a queue of upcoming songs. Users constantly do two things: "play this next" (insert right after the song currently playing) and "remove the current song" (delete it and continue with the one after). Nobody ever asks for "song number 40". Would you store the queue as a singly linked list?
Ask me whether I would use a singly linked list here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Doubly Linked Lists

### Foundation

A train where every car is coupled to both neighbours. Standing in any car, you can walk forward or backward, and you can uncouple a car from the middle using only that car: it knows who's in front of it and who's behind it.

That's a doubly linked list: every node has `.prev` and `.next`. The payoff is one specific ability a singly list lacks: **remove a node in O(1) given only a reference to that node**. The cost is an extra pointer per node and twice as many pointer writes per insert.

### Mechanics

Use **two sentinels**, a `head` and a `tail` node that never hold data. The empty list is `head <-> tail`. Every real node then always has a real `prev` and `next`, so no operation ever checks for `None`.

- **Insert `x` between neighbours `a` and `b`:** `x.prev = a`, `x.next = b`, `a.next = x`, `b.prev = x`. Four writes. The first two only touch `x`, so they're safe in any order. The last two overwrite links between `a` and `b`, and they're safe because you read `a` and `b` into variables before changing anything.
- **Remove `x`:** `x.prev.next = x.next`, `x.next.prev = x.prev`. Two writes, both done from `x` itself. No search, no predecessor hunt.
- **Append at the back:** insert between `tail.prev` and `tail`.

The invariant to protect: **for every node `n` other than the tail sentinel, `n.next.prev is n`.** Forward and backward traversal agree exactly when it holds. Each operation above changes a few links and restores it before returning.

Worked example for this module: append A, B, C; remove B using only the reference to B; append B again.

- After three appends: `H <-> A <-> B <-> C <-> T`.
- `remove(B)`: `B.prev.next = B.next` makes A point forward to C, `B.next.prev = B.prev` makes C point back to A. The list is `H <-> A <-> C <-> T`. B itself still has `prev = A` and `next = C`, but no node points at B, so it's out.
- `append(B)`: `last = T.prev` is C. B's two stale pointers get overwritten with `prev = C`, `next = T`, then `C.next = B` and `T.prev = B`. The list is `H <-> A <-> C <-> B <-> T`.

Removing a node and re-inserting it elsewhere, both in O(1), is the main reason to pay for the extra pointer.

### Diagram

<figure class="sketch">{% include sketches/dsa-linked-list/dll-remove-append.svg %}<figcaption>H and T are the sentinels (grey). remove(B) links A and C to each other and leaves B detached, its stale pointers dashed in red. append(B) splices it back in between C and T (green).</figcaption></figure>

### Implementation

```python
class DNode:
    def __init__(self, val=None):
        self.val = val
        self.prev = None
        self.next = None


class DList:
    def __init__(self):
        self.head = DNode()           # sentinel before the first real node
        self.tail = DNode()           # sentinel after the last real node
        self.head.next = self.tail    # empty list: head <-> tail
        self.tail.prev = self.head

    def append(self, node):
        last = self.tail.prev         # read the neighbour before any write
        node.prev = last              # these two writes only touch node
        node.next = self.tail
        last.next = node              # last and tail now point at node, so for
        self.tail.prev = node         # last, node and tail, n.next.prev is n holds again

    def remove(self, node):
        # Both writes go through node's own pointers, so no search is needed.
        # For B in H <-> A <-> B <-> C <-> T: A.next becomes C, C.prev becomes A.
        # Works for the only real node too: H.next becomes T, T.prev becomes H.
        node.prev.next = node.next
        node.next.prev = node.prev

    def forward(self):
        out, cur = [], self.head.next
        while cur is not self.tail:
            out.append(cur.val)
            cur = cur.next
        return out

    def backward(self):
        out, cur = [], self.tail.prev
        while cur is not self.head:
            out.append(cur.val)
            cur = cur.prev
        return out


d = DList()
a, b, c = DNode("A"), DNode("B"), DNode("C")
for n in (a, b, c):
    d.append(n)
print(d.forward(), d.backward())   # ['A', 'B', 'C'] ['C', 'B', 'A']
d.remove(b)
print(d.forward(), d.backward())   # ['A', 'C'] ['C', 'A']
d.append(b)
print(d.forward(), d.backward())   # ['A', 'C', 'B'] ['B', 'C', 'A']
```

I also checked `n.next.prev is n` for every node after each step (true every time), and the single-node case: appending X, removing it, and appending it again gives `[]` and then `['X']` in both directions.

Complexity: `append` and `remove` are O(1) time. The list uses O(n) space for n nodes, two pointers each, plus two sentinels. Traversal is O(n).

Python note (recalled, not derived): `collections.deque` is implemented as a doubly linked list of fixed-size blocks, giving O(1) appends and pops at both ends, but `deque.remove(x)` searches by value in O(n). It can't give you O(1) removal of an arbitrary element you already hold, which is the one thing this module is for.

### Recognition

Signals:

- You need to remove or move an **arbitrary** element in O(1), and you can get a direct reference to it some other way, typically a hash map from key to node.
- An ordering changes as elements are touched ("most recent", "oldest", "move to the front"), and the operations must all be O(1).
- You need to walk from both ends.

When not to use one: if you only add and remove at the ends, `collections.deque` already does it. If you only walk forward, a singly list is half the bookkeeping. If you need the element with the smallest key rather than a recency order, that's a heap ([Part 10](/blogs/dsa-heaps/)), not a list.

In this list, LRU Cache is the problem with these signals. Copy List With Random Pointer is a useful contrast: each node has two pointers, but `random` can point anywhere or nowhere, so it is not a doubly linked list and the invariant above doesn't apply.

### Pitfalls

- **Forgetting one of the four insert writes.** Forward traversal can still look right while backward traversal is broken, or the other way round. Test both directions.
- **Writing through a neighbour after you've overwritten the pointer to it.** Read `a` and `b` into locals first, as `append` does with `last`.
- **Removing a sentinel, or removing a node twice.** A second `remove(B)` writes through B's stale pointers. Right after the first removal that happens to be harmless, but once the neighbours change it isn't: with A, B, C, D, removing B, then C, then B again makes `forward()` return `['A', 'C', 'D']` while `backward()` returns `['D', 'A']`. C is back from the dead in one direction only. Only remove nodes you know are in the list.
- **Skipping the sentinels.** Without them, insert and remove each grow `if node is self.first` / `if node is self.last` branches, and one of them will be wrong.

### Active recall

1. Without the tail sentinel, what extra case would `append` have to handle, and what exactly would it do?
2. After `remove(B)`, B still has `prev = A` and `next = C`. Is the list corrupted? Why does `append(B)` still produce a correct list?
3. Suppose `append` forgot the last line, `self.tail.prev = node`. Append A, B, C to an empty list. What do `forward()` and `backward()` return?
4. Why can a doubly linked list delete a node you're holding in O(1), while a singly linked list can't?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied doubly linked lists in Python: every node has .prev and .next, and the list uses two sentinel nodes, head and tail, that hold no data (the empty list is head <-> tail), so no operation checks for None. Inserting x between neighbours a and b is four writes: x.prev = a, x.next = b, a.next = x, b.prev = x. Removing x is two writes done from x itself: x.prev.next = x.next, x.next.prev = x.prev, so a node you hold is removed in O(1). The invariant: for every node n other than the tail sentinel, n.next.prev is n.
Worked example from the lesson: append(node) reads last = self.tail.prev, then sets node.prev = last, node.next = self.tail, last.next = node, self.tail.prev = node. forward() walks from head.next until it reaches tail; backward() walks from tail.prev until it reaches head. Appending A, B, C gives H <-> A <-> B <-> C <-> T. remove(B) makes A.next = C and C.prev = A, giving H <-> A <-> C <-> T while B keeps stale prev = A and next = C. append(B) then gives H <-> A <-> C <-> B <-> T.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Without the tail sentinel, what extra case would append have to handle, and what exactly would it do?
2. After remove(B), B still has prev = A and next = C. Is the list corrupted? Why does append(B) still produce a correct list?
3. Suppose append forgot the last line, self.tail.prev = node. Append A, B, C to an empty list. What do forward() and backward() return?
4. Why can a doubly linked list delete a node you're holding in O(1), while a singly linked list can't?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: LRU Cache requires designing and implementing a doubly linked list with sentinels from scratch alongside another structure, so this module's mechanics get exercised independently there.

### Transfer test

A job queue: workers always take the oldest job from the front, and any job can be cancelled by its job ID at any moment, from anywhere in the queue. There could be millions of jobs. Would you use a doubly linked list? Why?

{% capture coach %}
You are my coding-interview coach. I just learned doubly linked lists (every node points both ways, and with head and tail sentinels you can remove a node you already hold in O(1) with two pointer writes). Scenario: A job queue: workers always take the oldest job from the front, and any job can be cancelled by its job ID at any moment, from anywhere in the queue. There could be millions of jobs.
Ask me whether I would use a doubly linked list here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Fast and Slow Pointers

### Foundation

Two runners start together. One runs twice as fast. On a straight road, when the fast runner reaches the finish, the slow one is exactly halfway. On a circular track, the fast one eventually comes up behind the slow one and they're side by side again.

In a linked list, that gives you two things in one pass and O(1) memory: the **middle** of a list, and a way to tell a list that ends from one that **loops**, including (with a second phase) the exact node where the loop starts.

### Mechanics

**The middle.** Start `slow` and `fast` at the head. Each step, `slow` moves one node and `fast` moves two. Stop when `fast` can't take another double step: `while fast and fast.next`.

Invariant: after k steps, `slow` is at index k and `fast` is at index 2k. The loop stops when index 2k is `None` or the last node, so for a list of n nodes it stops with `slow` at index n // 2. For the six nodes `1 -> 2 -> 3 -> 4 -> 5 -> 6` that's index 3, the node 4: the second of the two middles. For five nodes it's index 2, the true middle.

Want the first middle (3 in the six-node list)? Stop one step earlier: `while fast.next and fast.next.next`. That returns index (n - 1) // 2.

**Loops.** Now make the same six nodes loop: point node 6 back at node 3. Call the number of nodes before the loop starts a (here a = 2, nodes 1 and 2) and the loop length L (here L = 4, nodes 3, 4, 5, 6). Nothing ever becomes `None` now, so the question is whether the runners meet.

Once both are in the loop, let g be how many single steps `fast` would need to reach `slow`. Each round `slow` moves 1 and `fast` moves 2, so g drops by exactly 1. It can't jump from 1 to -1, so it hits 0: they land on the same node within L steps of `slow` entering the loop. In the example `slow` enters (reaches node 3) after 2 steps, when `fast` is on 5 and needs 2 steps (5, 6, 3) to reach it. After step 3, g = 1. After step 4, g = 0: both are on node 5.

**Where the loop starts (Floyd's second phase).** At the meeting point, `slow` has walked a + b steps, where b is how far past the entry it is. `fast` has walked 2(a + b). Both are on the same node, so `fast`'s extra a + b steps are whole laps: a + b = kL for some whole number k.

So starting at the meeting point, which is b steps past the entry, walking a more steps puts you b + a = kL steps past the entry: back on the entry. And a pointer starting at the head reaches the entry after exactly a steps. Put one pointer back at the head, leave the other at the meeting point, move both **one** step at a time, and they meet at the entry. You never need to know a, b or L.

In the example: a + b = 4 and L = 4, so k = 1, and b = 2 (node 5 is two past node 3). Phase 2 moves head-pointer 1 -> 2 -> 3 and meeting-pointer 5 -> 6 -> 3. They meet on node 3 after 2 = a steps.

### Diagram

<figure class="sketch">{% include sketches/dsa-linked-list/middle-steps.svg %}<figcaption>The straight list 1 → … → 6. S (blue) is slow, F (amber) is fast. At step 3 fast is None, so the loop stops with slow on index 3, the node 4 (green).</figcaption></figure>

<figure class="sketch">{% include sketches/dsa-linked-list/loop-shape.svg %}<figcaption>The same nodes with 6 pointing back at 3: a = 2 nodes before the loop, loop length L = 4. The entry is node 3 (violet); the runners meet on node 5 (green).</figcaption></figure>

<figure class="sketch">{% include sketches/dsa-linked-list/loop-phases.svg %}<figcaption>Phase 1: slow and fast per step, with the gap once slow is in the loop; they meet on 5 (green). Phase 2: p from the head and slow from the meeting node, one step each; they meet on the entry, 3 (violet), after a = 2 steps.</figcaption></figure>

### Implementation

```python
def middle(head):
    slow = fast = head
    # After k steps slow is at index k and fast at index 2k. The loop stops when
    # fast is None (n even: 2k = n) or fast.next is None (n odd: 2k = n - 1), so
    # slow ends at index n // 2. For 1 -> 2 -> 3 -> 4 -> 5 -> 6: index 3, node 4.
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow


def loop_entry(head):
    """Return the node where the loop starts. Assumes the list is known to loop:
    on a list that ends, fast.next.next eventually raises AttributeError."""
    slow = fast = head
    while True:
        slow = slow.next
        fast = fast.next.next
        # Check AFTER moving: both start on head, so checking first would stop at step 0.
        # `is`, not ==: different nodes can hold equal values.
        if slow is fast:
            break
    # slow walked a + b steps and fast 2(a + b), on the same node, so a + b is a
    # whole number of laps. In the example a + b = 4 = 1 * L, meeting on node 5.
    # Walking a more steps from node 5 therefore lands on the entry, and so does
    # walking a steps from head. Both pointers move exactly one step per round.
    p = head
    while p is not slow:
        p = p.next
        slow = slow.next
    return p


def chain(values):
    nodes = [ListNode(v) for v in values]      # ListNode from the first module
    for x, y in zip(nodes, nodes[1:]):
        x.next = y
    return nodes


nodes = chain(range(1, 7))                     # 1 -> 2 -> 3 -> 4 -> 5 -> 6
print(middle(nodes[0]).val)                    # 4
nodes[5].next = nodes[2]                       # 6 now points back at 3
print(loop_entry(nodes[0]).val)                # 3
```

Edge cases, all run:

| list | `middle` | `loop_entry` |
| --- | --- | --- |
| `None` (empty) | `None` | not applicable |
| `1` | 1 | 1 (node 1 points at itself) |
| `1 -> 2`, 2 points back at 2 | 2 | 2 |
| `1 -> 2 -> ... -> 6`, 6 points back at 1 (a = 0) | 4 | 1 |
| `1 -> 2 -> ... -> 6`, 6 points back at 6 (L = 1) | 4 | 6 |
| `1 -> 2 -> ... -> 10`, 10 points back at 4 | 6 | 4 |

(The `middle` column is for the straight version of each list, before the loop is added.)

Complexity: `middle` is O(n) time for n nodes, since `fast` passes each node at most once, and O(1) space. `loop_entry` takes at most a + L steps in phase 1 (a to bring `slow` into the loop, then at most L more to close the gap; I checked the bound on every loop shape up to 39 nodes) and exactly a steps in phase 2, so O(n) time with n = a + L nodes, and O(1) space.

### Recognition

Signals:

- A linked list plus a position you'd find instantly in an array: the middle, a point some fraction of the way along.
- "Might contain a cycle", "does it loop", or anything where following `.next` might never reach `None`.
- O(1) extra memory. A `set` of visited nodes also detects loops, in O(n) space. Fast and slow is how you drop that set.
- **Something that behaves like `.next` without being a node.** Any process where each state determines exactly one next state, over a finite set of states, must eventually repeat, which makes it a linked list with a loop even if it's stored as numbers in an array.

When not to use it: when you have random access, just index `n // 2`. When memory is free and clarity matters more, a visited set is simpler to get right. Fast and slow can't help when a node can have several successors; that's a graph ([Part 14](/blogs/dsa-graphs/)).

Distinguish it from the Two Pointers of [Part 3](/blogs/dsa-two-pointers/): those pointers usually converge from both ends of an array using sortedness. Here both start at the same end and the only thing that differs is speed.

In this list: Linked List Cycle carries the "might loop" signal directly. Reorder List needs the middle as one of its steps. Find The Duplicate Number carries the last signal, disguised. Seeing how is the problem itself.

### Pitfalls

- **Checking `slow is fast` before the first move.** They start on the same node, so you'd always report a meeting at step 0.
- **Wrong loop condition for the middle you want.** `while fast and fast.next` gives the second middle on even lengths, `while fast.next and fast.next.next` gives the first, and the second one crashes on an empty list.
- **Comparing values instead of nodes.** Duplicate values would make two different nodes look like a meeting. Use `is`.
- **Moving the phase 2 pointers at different speeds.** Both must move one step. The argument only works if both walk exactly a steps.
- **Printing a list with a loop.** `to_list` never terminates. Cap debugging walks at a fixed number of steps.
- **Forgetting that `fast.next.next` needs `fast.next` to exist** on any list that might end.

### Active recall

1. For the straight list `1 -> 2 -> 3 -> 4 -> 5 -> 6`, `middle` returns 4. For `1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7`, what does it return, and what does the `fast.next and fast.next.next` version return?
2. The meeting argument relied on the gap shrinking by exactly 1 per step. Suppose `fast` moved 3 nodes per step instead. On the example (1 to 6, with 6 pointing back at 3), do the runners still meet, and does phase 2 still find the entry?
3. In the example the runners met on node 5, not on the entry, node 3. When would the meeting node be the entry itself?
4. Once you have the meeting node, how would you find L, the length of the loop, and what does that cost?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied fast and slow pointers on linked lists in Python: slow moves one node per step and fast moves two. To find the middle, loop while fast and fast.next; after k steps slow is at index k and fast at 2k, so slow ends at index n // 2 (the second middle on even lengths); the condition while fast.next and fast.next.next gives index (n - 1) // 2 instead. On a list with a loop (a nodes before the loop, loop length L), the gap between the runners shrinks by exactly 1 per step, so they meet. At the meeting point slow has walked a + b steps (b = distance past the entry) and fast 2(a + b), so a + b is a whole number of laps. Phase 2: put one pointer back at the head, leave the other at the meeting node, move both one step at a time, and they meet at the loop entry.
Worked example from the lesson: 1 -> 2 -> 3 -> 4 -> 5 -> 6, middle returns 4 (index 3). Then point 6 back at 3: a = 2, L = 4. Phase 1 positions (slow, fast) per step: (1,1), (2,3), (3,5), (4,3), (5,5), so they meet on node 5 after 4 steps; a + b = 4, b = 2. Phase 2: p goes 1 -> 2 -> 3 and slow goes 5 -> 6 -> 3, meeting on 3, the entry, after a = 2 steps.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. For the straight list 1 -> 2 -> 3 -> 4 -> 5 -> 6, middle returns 4. For 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7, what does it return, and what does the fast.next and fast.next.next version return?
2. The meeting argument relied on the gap shrinking by exactly 1 per step. Suppose fast moved 3 nodes per step instead. On the example (1 to 6, with 6 pointing back at 3), do the runners still meet, and does phase 2 still find the entry?
3. In the example the runners met on node 5, not on the entry, node 3. When would the meeting node be the entry itself?
4. Once you have the meeting node, how would you find L, the length of the loop, and what does that cost?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: Find The Duplicate Number requires deriving how this technique applies from scratch, so the pattern gets exercised independently there, and a separate checkpoint would only rehearse it.

### Transfer test

A cheap random number generator produces each value from the previous one with `x -> (x * x + 1) % 1000`, starting at 7. You want to know after how many calls the sequence starts repeating and how long the repeating part is, using O(1) memory. Would you use fast and slow pointers? Why?

{% capture coach %}
You are my coding-interview coach. I just learned fast and slow pointers (two runners over a sequence, one moving one step and one moving two; they find the middle of a list, detect a loop, and with a second phase find where the loop starts, all in O(1) memory). Scenario: A cheap random number generator produces each value from the previous one with x -> (x * x + 1) % 1000, starting at 7. I want to know after how many calls the sequence starts repeating and how long the repeating part is, using O(1) memory.
Ask me whether I would use fast and slow pointers here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

The three modules are one skill seen from three sides. Singly Linked Lists is **pointer surgery**: what you can change safely and in which order. Doubly Linked Lists is what you add when surgery needs to start from a node you're holding rather than from its predecessor. Fast and Slow Pointers is **navigation**: getting a pointer to a specific position (the middle, the loop entry) without counting and without extra memory. Most problems in this category are a sequence of these: navigate to a position, do surgery there, and sometimes navigate again.

Distinguishing competing approaches:

| Decision | Option A | Option B | How to choose |
| --- | --- | --- | --- |
| Where to work | Copy values into a Python list, work there, rebuild | Rewire nodes in place | Copying is O(n) space and often accepted, but it dodges the skill. If the problem says in place or O(1) memory, rewire. |
| Head handling | Special-case the head | Dummy node, return `dummy.next` | Dummy whenever the head can change. It's never wrong. |
| Loop or position finding | Set of visited nodes | Fast and slow pointers | Set is O(n) space and simpler. Fast and slow is O(1) space and needs the invariant right. |
| Links per node | Singly | Doubly with sentinels | Doubly only when you must remove or move a node you're holding in O(1). |
| Walking | Recursion | Iteration | Recursion uses O(n) call stack and hits Python's recursion limit (recalled: 1000 by default) on long lists. Iteration is O(1) space. |

Recognition checklist for an unfamiliar problem:

1. Is the input a `ListNode`, or is there anything where each element determines exactly one next element? Then it's a linked list, whatever it looks like.
2. Can the head change? Start with a dummy node.
3. Before every assignment to `.next` or `.prev`: what becomes unreachable if I do this now? Save it first.
4. Do I need a position I can't index to (middle, loop entry)? Fast and slow pointers.
5. Could following `.next` never reach `None`? Loop handling first: a visited set, or fast and slow for O(1) space.
6. Do I need to remove or reorder arbitrary nodes in O(1)? Doubly linked list with sentinels, plus a hash map pointing into it.
7. Before submitting: run it on `None`, one node, two nodes, and an even and odd length. Most linked list bugs live in those four.

## The problems

Work these with the solving cycle from [Part 1](/blogs/dsa-the-method/): an honest 15-minute struggle, one key sentence per problem in your own words, and spaced repetition. For linked lists, during the struggle draw four or five boxes with arrows on paper and, before every pointer assignment, ask what would become unreachable, whether the head can change, and whether two pointers at different speeds can reach the position you need.

{% include dsa-problems.html slug="dsa-linked-list" %}

## Take this lesson as a live session

If you'd rather be taught this interactively, with the coach waiting for your answers, open the whole lesson as a prompt in a chat.

{% capture coach %}
[TOPIC]: Linked List
[PREREQUISITES]: Singly Linked Lists, Doubly Linked Lists, Fast and Slow Pointers
[PROBLEM LIST]: Reverse Linked List, Merge Two Sorted Lists, Linked List Cycle, Reorder List, Remove Nth Node From End of List, Copy List With Random Pointer, Add Two Numbers, Find The Duplicate Number, LRU Cache, Merge K Sorted Lists, Reverse Nodes In K Group
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
