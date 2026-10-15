---
layout: post
title: "Linked lists punish you for letting go of the wrong pointer first"
date: 2024-02-16 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, linked-list, fast-slow-pointers, python, series]
read_time: 38
permalink: /blogs/dsa-linked-list/
excerpt: "Every linked list bug is the same one: you overwrote a .next while nothing else was holding the node it pointed to. This post covers safe pointer rewiring, sentinel nodes, and two runners at different speeds, then gives you eleven problems to solve yourself."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 7
series_total: 19
links_new_tab: true
---

Arrays are great at one thing: jumping straight to index i. A linked list gives that up. In return, it lets you splice nodes in and out cheaply. So every problem in this topic comes down to three questions. Which pointers are you holding? In what order do you overwrite them? And where could a second pointer stand?

This post comes after [Two Pointers](/blogs/dsa-two-pointers/), because half the tricks here are two pointers moving over nodes instead of indices. Together with [Binary Search](/blogs/dsa-binary-search/), it unlocks [Trees](/blogs/dsa-trees/), where every node has two `.next` fields instead of one. Finding where a loop starts (Floyd's second phase) is covered inside Fast and Slow Pointers, because one of the problems needs it.

How to use this post: [the method](/blogs/dsa-the-method/). The checkpoints don't show answers on the page. Work each one out yourself first, then open the linked chat to have your answer checked.

## Singly Linked Lists

### Foundation

Think of a scavenger hunt. You're handed the first clue, and each clue tells you where the next one is hidden. There's no map of all the clues. To reach clue 5 you have to read clues 1 through 4.

That's a singly linked list. Each node holds a value and a reference to the next node. A separate `head` reference points at the first node. In practice, the list *is* the head: it's the only way in. Lose the head, or lose any `.next` in the middle, and everything after that point is gone.

Here's what you get for it. Once you're standing at a node, inserting or removing the node right after it is O(1). Nothing else has to shift. Here's what you pay. Reaching position k costs O(k), because you have to walk there, and you can only walk forward.

### Mechanics

Three operations cover almost everything.

1. **Traverse.** Set `cur = head`, then run `while cur: ...; cur = cur.next`. An **invariant** is a fact that stays true at every step of a loop. Here it is: `cur` is always the first node you haven't processed yet. When `cur` is `None`, you've run off the end.
2. **Insert after a node `p`.** First point the new node at `p.next`. Then point `p` at the new node. The order is the whole lesson. If you set `p.next = new` first, you've just overwritten the only reference to the rest of the list, and it's gone.
3. **Delete the node after `p`.** Write `p.next = p.next.next`. Notice that you delete from the *predecessor*, the node just before the one you remove. In a singly list you can't delete the node you're standing on, because you have no way back to the node before it.

That third point creates a classic special case. The head has no predecessor, so how do you delete it? The fix is a **dummy node** (also called a sentinel). It's a throwaway node whose `.next` is the head. Now every real node, including the head, has a predecessor. The same code handles all of them. At the end you return `dummy.next`, which is whatever the head became.

One rule prevents most bugs in this topic: **before you overwrite a `.next`, make sure something else still references the node it pointed to.**

Here's the worked example we'll reuse through this module. Remove every node with value 7 from `7 -> 3 -> 7 -> 7 -> 1`, then insert 5 after the new head.

We walk two pointers. `prev` is the last node we're keeping. `cur` is the node we're examining. They start at `prev = dummy` and `cur = first 7`.

- `cur` is 7. Unlink it with `prev.next = cur.next`. The dummy now points at 3. `prev` stays on the dummy.
- `cur` is 3. Keep it. `prev` moves to 3.
- `cur` is the second 7. Unlink it, so 3 now points at the third 7. `prev` stays on 3.
- `cur` is the third 7. Unlink it, so 3 now points at 1. `prev` is still on 3.
- `cur` is 1. Keep it. `prev` moves to 1. `cur` becomes `None`, and the loop ends.

The result is `3 -> 1`, returned as `dummy.next`. The first node of the original list was removed, and the code needed no special case for it. Then inserting 5 after the head (the node 3) gives `3 -> 5 -> 1`.

Why doesn't `prev` move forward after an unlink? Because `prev.next` is now a node nobody has checked yet. If you move `prev` anyway, you skip that check. Two 7s in a row are exactly the case that breaks (Active Recall question 1).

Why is `cur = cur.next` still safe after an unlink? We never touched the removed node's own `.next`. So it still points into the live list, and `cur` lands on the right node.

### Diagram

<figure class="sketch">{% include sketches/dsa-linked-list/remove-trace.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-linked-list/unlink-zoom.svg %}</figure>

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

Complexity:

- `remove_all` is O(n) time for n nodes, because each node is visited once. It uses O(1) extra space: two pointers and one dummy.
- `insert_after` is O(1). Getting to the node you want to insert after is the O(k) part, and that cost is separate.

### Recognition

These are the signals that you're doing linked list work:

- **The input is a `ListNode` head**, and the question asks you to rearrange, splice, remove or build nodes, not just read values.
- **The problem says "in place" or "O(1) extra memory".** The easy escape is to copy the values into a Python list and back. These constraints exist to close that escape.
- **The head might change.** It could be removed, replaced, or unknown until you've built the answer. That's the signal to use a dummy node.
- **You're producing a new list one node at a time.** `build` above shows the pattern: a dummy plus a `tail` pointer.

When not to use a linked list: if you need repeated random access by position, or you keep searching for a value, the O(k) walk dominates the cost. In an interview, if the input is already a Python list and space isn't constrained, stay with arrays.

How it differs from array two pointers ([Part 3](/blogs/dsa-two-pointers/)): there's no index arithmetic, and you can't move backwards. So a "right" pointer that walks left doesn't exist. If you'll need to look behind you, you must save that node on the way forward.

Here is where these signals show up in this topic's list. The head can change in Remove Nth Node From End of List, Merge Two Sorted Lists and Reverse Nodes In K Group. Building a result node by node shows up in Merge Two Sorted Lists and Add Two Numbers. In-place rewiring is the whole point of Reverse Linked List, Reorder List and Reverse Nodes In K Group.

### Pitfalls

- **Losing the rest of the list.** Assigning to `x.next` destroys the only reference to the old `x.next`, unless you saved it first.
- **Moving `prev` forward after a removal.** This skips the check on the next node. You won't notice until two targets sit next to each other.
- **Following a `None`.** `cur.next.next` crashes when `cur.next` is `None`. Check the shorter chain first: `cur.next and cur.next.next`.
- **Empty and single-node lists.** `head` can be `None`. Walk every function through `[]` and `[x]` before you trust it.
- **Returning `head` instead of `dummy.next`.** If the head was removed, `head` still points at the removed node.
- **Accidental loops.** Rewiring in the wrong order can make a node point back at an earlier node. Then your `to_list` never returns. It looks like a timeout, not a bug.
- **Values versus identity.** Two different nodes can hold the same value. Use `is` when you mean "the same node".

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

Skipped for this module. Reverse Linked List makes you work out pointer rewiring from nothing, and that is exactly this module's mechanics. So you'll practise them on your own there, and a separate checkpoint here would only repeat it.

### Transfer test

A music app keeps a queue of upcoming songs. Users constantly do two things: "play this next" (insert right after the song currently playing) and "remove the current song" (delete it and continue with the one after). Nobody ever asks for "song number 40". Would you store the queue as a singly linked list? Why?

{% capture coach %}
You are my coding-interview coach. I just learned singly linked lists (nodes that each point only to the next one; inserting or deleting after a node you hold is O(1), deletion needs the predecessor, and reaching position k costs O(k)). Scenario: A music app keeps a queue of upcoming songs. Users constantly do two things: "play this next" (insert right after the song currently playing) and "remove the current song" (delete it and continue with the one after). Nobody ever asks for "song number 40". Would you store the queue as a singly linked list?
Ask me whether I would use a singly linked list here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Doubly Linked Lists

### Foundation

Picture a train where every car is coupled to both of its neighbours. Standing in any car, you can walk forward or backward. You can also uncouple a car from the middle using only that car, because it knows who's in front of it and who's behind it.

That's a doubly linked list: every node has both `.prev` and `.next`. You get one specific ability a singly list lacks. You can **remove a node in O(1) given only a reference to that node**. The cost is an extra pointer per node, and twice as many pointer writes per insert.

### Mechanics

We use **two sentinels**. These are a `head` node and a `tail` node that never hold data. The empty list is just `head <-> tail`. Because of them, every real node always has a real `prev` and a real `next`. So no operation ever has to check for `None`.

- **Insert `x` between neighbours `a` and `b`:** `x.prev = a`, `x.next = b`, `a.next = x`, `b.prev = x`. That's four writes. The first two only touch `x`, so their order doesn't matter. The last two overwrite the links between `a` and `b`. They're safe because you already read `a` and `b` into variables before changing anything.
- **Remove `x`:** `x.prev.next = x.next`, `x.next.prev = x.prev`. That's two writes, and both go through `x` itself. There's no search and no hunting for the predecessor.
- **Append at the back:** insert between `tail.prev` and `tail`.

Here's the invariant to protect: **for every node `n` other than the tail sentinel, `n.next.prev is n`.** In plain words, if you step forward and then back, you end up where you started. When this holds, forward and backward traversal agree exactly. Each operation above changes a few links, and puts the invariant back before it returns.

The worked example for this module: append A, B, C. Remove B using only the reference to B. Then append B again.

- After three appends: `H <-> A <-> B <-> C <-> T`.
- `remove(B)`: `B.prev.next = B.next` makes A point forward to C. `B.next.prev = B.prev` makes C point back to A. The list is now `H <-> A <-> C <-> T`. B itself still has `prev = A` and `next = C`. But no node points at B any more, so it's out of the list.
- `append(B)`: `last = T.prev` is C. B's two stale pointers get overwritten with `prev = C` and `next = T`. Then `C.next = B` and `T.prev = B`. The list is now `H <-> A <-> C <-> B <-> T`.

Removing a node and putting it back somewhere else, both in O(1), is the main reason to pay for the extra pointer.

### Diagram

<figure class="sketch">{% include sketches/dsa-linked-list/dll-remove-append.svg %}</figure>

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

I also checked `n.next.prev is n` for every node after each step, and it was true every time. I checked the single-node case too. Appending X, removing it, and appending it again gives `[]` and then `['X']`, in both directions.

Complexity:

- `append` and `remove` are O(1) time.
- The list uses O(n) space for n nodes: two pointers per node, plus the two sentinels.
- Traversal is O(n).

A Python note, recalled rather than derived: `collections.deque` is implemented as a doubly linked list of fixed-size blocks. That gives it O(1) appends and pops at both ends. But `deque.remove(x)` searches by value, which is O(n). So a deque can't give you O(1) removal of an arbitrary element you're already holding, and that's the one thing this module is for.

### Recognition

These are the signals that a doubly linked list is worth it:

- **You need to remove or move an arbitrary element in O(1)**, and you can get a direct reference to it some other way. Usually that's a hash map from key to node.
- **An ordering changes as elements are touched** ("most recent", "oldest", "move to the front"), and every operation must be O(1).
- **You need to walk from both ends.**

When not to use one:

- If you only add and remove at the ends, `collections.deque` already does that.
- If you only walk forward, a singly list is half the bookkeeping.
- If you need the element with the smallest key rather than a recency order, you want a heap ([Part 10](/blogs/dsa-heaps/)), not a list.

In this topic's list, LRU Cache is the problem with these signals. Copy List With Random Pointer makes a useful contrast. Each node there has two pointers too. But `random` can point anywhere, or nowhere, so it isn't a doubly linked list and the invariant above doesn't apply.

### Pitfalls

- **Forgetting one of the four insert writes.** Forward traversal can still look right while backward traversal is broken, or the other way round. Test both directions.
- **Writing through a neighbour after you've overwritten the pointer to it.** Read `a` and `b` into local variables first, the way `append` does with `last`.
- **Removing a sentinel, or removing a node twice.** A second `remove(B)` writes through B's stale pointers. Right after the first removal, that happens to do no harm. Once the neighbours change, it does. Take A, B, C, D and remove B, then C, then B again. Now `forward()` returns `['A', 'C', 'D']` but `backward()` returns `['D', 'A']`. C has come back from the dead, but only in one direction. Only remove nodes you know are in the list.
- **Skipping the sentinels.** Without them, insert and remove each need extra `if node is self.first` / `if node is self.last` branches, and one of them will be wrong.

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

Skipped for this module. LRU Cache makes you design and build a doubly linked list with sentinels from scratch, alongside another structure. So you'll practise this module's mechanics on your own there.

### Transfer test

A job queue: workers always take the oldest job from the front, and any job can be cancelled by its job ID at any moment, from anywhere in the queue. There could be millions of jobs. Would you use a doubly linked list? Why?

{% capture coach %}
You are my coding-interview coach. I just learned doubly linked lists (every node points both ways, and with head and tail sentinels you can remove a node you already hold in O(1) with two pointer writes). Scenario: A job queue: workers always take the oldest job from the front, and any job can be cancelled by its job ID at any moment, from anywhere in the queue. There could be millions of jobs.
Ask me whether I would use a doubly linked list here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Fast and Slow Pointers

### Foundation

Two runners start together, and one runs twice as fast as the other. On a straight road, when the fast runner reaches the finish, the slow one is exactly halfway. On a circular track, the fast runner eventually comes up behind the slow one, and they're side by side again.

In a linked list, that idea gives you two things in one pass with O(1) memory:

- the **middle** of the list, and
- a way to tell a list that ends from one that **loops**. With a second phase, you can even find the exact node where the loop starts.

### Mechanics

**The middle.** Start `slow` and `fast` at the head. On each step, `slow` moves one node and `fast` moves two. Stop when `fast` can't take another double step: `while fast and fast.next`.

The invariant: after k steps, `slow` is at index k and `fast` is at index 2k. The loop stops when index 2k is `None` or the last node. So for a list of n nodes, it stops with `slow` at index n // 2.

Take the six nodes `1 -> 2 -> 3 -> 4 -> 5 -> 6`. That's index 3, the node 4. An even-length list has two middles, and this is the second one. With five nodes it's index 2, the one true middle.

Want the first middle instead (3 in the six-node list)? Stop one step earlier with `while fast.next and fast.next.next`. That returns index (n - 1) // 2.

**Loops.** Now make the same six nodes loop by pointing node 6 back at node 3. We need two names:

- **a** is the number of nodes before the loop starts. Here a = 2 (nodes 1 and 2).
- **L** is the loop length. Here L = 4 (nodes 3, 4, 5, 6).

Nothing ever becomes `None` now. So the only question is whether the runners meet.

Once both runners are in the loop, call g the gap: how many single steps `fast` would need to reach `slow`. Each round, `slow` moves 1 and `fast` moves 2, so the gap drops by exactly 1. It can't jump from 1 to -1, so it must hit 0. That means they land on the same node within L steps of `slow` entering the loop.

Let's check that on the example. `slow` enters the loop (reaches node 3) after 2 steps. At that moment `fast` is on 5 and needs 2 steps (5, 6, 3) to reach it, so g = 2. After step 3, g = 1. After step 4, g = 0, and both are on node 5.

**Where the loop starts (Floyd's second phase).** Let b be how far past the entry the meeting point is. At the meeting point, `slow` has walked a + b steps, and `fast` has walked twice that, 2(a + b). They're on the same node. So `fast`'s extra a + b steps must be whole laps of the loop: a + b = kL for some whole number k.

Here's why that helps. The meeting point is b steps past the entry. Walk a more steps from there, and you're b + a = kL steps past the entry. A whole number of laps puts you right back on the entry. Meanwhile, a pointer starting at the head also reaches the entry after exactly a steps.

So here's phase 2. Put one pointer back at the head. Leave the other at the meeting point. Move both **one** step at a time. They meet at the entry, and you never need to know a, b or L.

In the example, a + b = 4 and L = 4, so k = 1. And b = 2, because node 5 is two past node 3. Phase 2 moves the head pointer 1 -> 2 -> 3 and the meeting pointer 5 -> 6 -> 3. They meet on node 3 after 2 = a steps.

### Diagram

<figure class="sketch">{% include sketches/dsa-linked-list/middle-steps.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-linked-list/loop-shape.svg %}</figure>

<figure class="sketch">{% include sketches/dsa-linked-list/loop-phases.svg %}</figure>

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

Complexity:

- `middle` is O(n) time for n nodes, because `fast` passes each node at most once. It uses O(1) space.
- `loop_entry` takes at most a + L steps in phase 1. That's a steps to bring `slow` into the loop, then at most L more to close the gap. (I checked this bound on every loop shape up to 39 nodes.) Phase 2 takes exactly a steps. So it's O(n) time with n = a + L nodes, and O(1) space.

### Recognition

These are the signals that fast and slow pointers are worth trying:

- **A linked list, plus a position you'd find instantly in an array.** The middle, or a point some fraction of the way along.
- **"Might contain a cycle", "does it loop"**, or anything where following `.next` might never reach `None`.
- **O(1) extra memory.** A `set` of visited nodes also detects loops, but it uses O(n) space. Fast and slow is how you drop that set.
- **Something that behaves like `.next` without being a node.** Take any process where each state decides exactly one next state, and there are only finitely many states. It must eventually repeat. That makes it a linked list with a loop, even if it's stored as numbers in an array.

When not to use it:

- When you have random access, just index `n // 2`.
- When memory is free and clarity matters more, a visited set is simpler to get right.
- When a node can have several successors, fast and slow can't help. That's a graph ([Part 14](/blogs/dsa-graphs/)).

How it differs from the Two Pointers of [Part 3](/blogs/dsa-two-pointers/): those pointers usually move in from both ends of an array, and they rely on the array being sorted. Here both pointers start at the same end. The only thing that differs is their speed.

Here is where these signals show up in this topic's list. Linked List Cycle carries the "might loop" signal directly. Reorder List needs the middle as one of its steps. Find The Duplicate Number carries the last signal, in disguise. Seeing how is the problem itself.

### Pitfalls

- **Checking `slow is fast` before the first move.** They start on the same node, so you'd always report a meeting at step 0.
- **The wrong loop condition for the middle you want.** `while fast and fast.next` gives the second middle on even lengths. `while fast.next and fast.next.next` gives the first, but it crashes on an empty list.
- **Comparing values instead of nodes.** With duplicate values, two different nodes would look like a meeting. Use `is`.
- **Moving the phase 2 pointers at different speeds.** Both must move one step at a time. The argument only works if both walk exactly a steps.
- **Printing a list with a loop.** `to_list` never finishes. Cap any debugging walk at a fixed number of steps.
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

Skipped for this module. Find The Duplicate Number makes you work out from scratch how this technique applies. So you'll practise the pattern on your own there, and a separate checkpoint would only rehearse it.

### Transfer test

A cheap random number generator produces each value from the previous one with `x -> (x * x + 1) % 1000`, starting at 7. You want to know after how many calls the sequence starts repeating and how long the repeating part is, using O(1) memory. Would you use fast and slow pointers? Why?

{% capture coach %}
You are my coding-interview coach. I just learned fast and slow pointers (two runners over a sequence, one moving one step and one moving two; they find the middle of a list, detect a loop, and with a second phase find where the loop starts, all in O(1) memory). Scenario: A cheap random number generator produces each value from the previous one with x -> (x * x + 1) % 1000, starting at 7. I want to know after how many calls the sequence starts repeating and how long the repeating part is, using O(1) memory.
Ask me whether I would use fast and slow pointers here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

The three modules are one skill seen from three sides.

- **Singly Linked Lists is pointer surgery.** It's about what you can change safely, and in which order.
- **Doubly Linked Lists** is what you add when the surgery has to start from a node you're holding, not from its predecessor.
- **Fast and Slow Pointers is navigation.** It gets a pointer to a specific position, like the middle or the loop entry, without counting and without extra memory.

Most problems in this topic are a sequence of these steps. You navigate to a position, do surgery there, and sometimes navigate again.

How to choose between competing approaches:

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

Work through these with the solving cycle from [Part 1](/blogs/dsa-the-method/). Give each problem an honest 15-minute struggle, write down one key sentence in your own words, then review it with spaced repetition.

For linked lists, draw four or five boxes with arrows on paper during the struggle. Before every pointer assignment, ask yourself:

- What would become unreachable if I did this now?
- Can the head change?
- Can two pointers at different speeds reach the position I need?

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
