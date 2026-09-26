---
layout: post
title: "Most array problems are really asking what you've already seen"
date: 2024-02-05 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, arrays, hashing, python, series]
read_time: 42
permalink: /blogs/dsa-arrays-and-hashing/
excerpt: "Arrays & Hashing is the root of the topic map. Four prerequisites: what a Python list really costs, how to use a dict and set, how a hash table actually works underneath, and prefix sums. Taught properly so the nine problems become yours to solve."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 2
series_total: 19
links_new_tab: true
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers Arrays & Hashing: what a Python list really costs, how to use a dict and a set, how a hash table works underneath, and prefix sums.

Arrays & Hashing is where the topic map starts, and nothing sits above it. The techniques here are the ones every later topic quietly assumes: knowing what an operation on a list costs, reaching for a dict or set when a question sounds like "have I seen this before?" or "how many of each?", and precomputing running totals so a range question becomes one subtraction. Once this is solid, the series opens into [Two Pointers](/blogs/dsa-two-pointers/) and [Stack](/blogs/dsa-stack/).

The prerequisites here are dynamic arrays, hash usage, hash implementation and prefix sums. Each gets its own section below, in that order. None of the nine problems is solved here; they are listed at the end for you to solve.

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Dynamic Arrays

### Foundation

A Python list is a row of numbered seats in a theatre. Because the seats are numbered and adjacent, you can walk straight to seat 4 without passing seats 0 to 3. That is why `nums[i]` is O(1). The catch is that the row has a fixed number of seats at any moment. When it fills up, you move everyone to a bigger row.

A dynamic array makes a fixed row of seats behave like a list that grows forever while keeping `append` cheap on average. Its cost model decides whether your O(n) idea is really O(n).

### Mechanics

The array keeps two numbers: `capacity` (seats reserved) and `size` (seats used). The used seats are always indices 0 to size - 1, packed with no gaps. That packing is the invariant, and it is what makes indexing a single address calculation.

1. **Append.** If `size < capacity`, write into index `size` and increment. O(1).
2. **Resize.** If `size == capacity`, allocate a new block of `2 * capacity`, copy all `size` elements across, then append. That one append costs O(size).
3. **Pop from the end.** Decrement `size`. Nothing moves. O(1).
4. **Insert or delete at index i.** Every element at indices i to size - 1 must shift one seat to keep the "no gaps" invariant. That is size - i moves, so O(n) at the front and O(1) only at the very end.

Why doubling is safe. Take the worked example: append `5, 8, 2, 9, 4, 7, 1, 6` into an array that starts at capacity 1. Resizes fire when size hits 1, 2 and 4, copying 1, then 2, then 4 elements. Total copies = 1 + 2 + 4 = 7 for 8 appends. In general the copies form a geometric series 1 + 2 + 4 + ... that stays below 2n, so n appends cost fewer than 3n element writes in total (n placements plus fewer than 2n copies). That is O(1) amortized per append.

Why growing by a constant is not safe. If capacity grew by +2 instead of x2, resizes happen every two appends and each copies the whole array, so n appends copy roughly n²/4 elements (2,500 copies for n = 100, 250,000 for n = 1,000, both from running it). That is O(n) per append on average.

### Diagram

Same eight appends, capacity starting at 1.

<figure class="sketch">{% include sketches/dsa-arrays-and-hashing/dynamic-array-growth.svg %}<figcaption>Eight appends from capacity 1. Blue is the element just appended, empty cells are reserved but unused, amber rows are the appends that found the array full and paid for a copy.</figcaption></figure>

### Implementation

Python's `list` already does all of this in C. Writing it once by hand is how the costs stop being folklore.

```python
class DynamicArray:
    def __init__(self):
        self.capacity = 1                  # slots reserved
        self.size = 0                      # slots in use: always indices 0..size-1
        self.data = [None] * self.capacity
        self.copies = 0                    # total elements moved by resizes

    def append(self, value):
        if self.size == self.capacity:     # slots 0..capacity-1 are all in use
            self._resize(2 * self.capacity)
        self.data[self.size] = value       # first free slot is index size (slots 0..size-1 are used)
        self.size += 1

    def _resize(self, new_capacity):
        new_data = [None] * new_capacity
        for i in range(self.size):         # copies slots 0..size-1: exactly size moves
            new_data[i] = self.data[i]
        self.copies += self.size
        self.data = new_data
        self.capacity = new_capacity

    def pop(self):
        if self.size == 0:
            raise IndexError("pop from empty array")
        self.size -= 1                     # after this, size is the index of the last used slot
        value = self.data[self.size]
        self.data[self.size] = None        # nothing else moves, so pop from the end is O(1)
        return value

    def get(self, i):
        if not 0 <= i < self.size:         # valid indices are 0..size-1; slots size..capacity-1 are reserved, not real
            raise IndexError(i)
        return self.data[i]

arr = DynamicArray()
for v in [5, 8, 2, 9, 4, 7, 1, 6]:
    arr.append(v)
print(arr.size, arr.capacity, arr.copies)  # 8 8 7
print(arr.get(3))                           # 9
print(arr.pop(), arr.size, arr.capacity)    # 6 7 8
```

Running it prints `8 8 7`, then `9`, then `6 7 8`, matching the diagram. Edge cases I ran: `pop()` on an empty array raises `IndexError`; one append gives size 1, capacity 1, zero copies; after five appends capacity is 8 and `data[5]` exists, but `get(5)` still raises, because only indices 0 to size - 1 are real.

Complexity, with n = number of elements: `get` and `set` O(1); `append` O(1) amortized, O(n) for the single append that triggers a resize; `pop()` from the end O(1); `insert(i, x)`, `pop(i)`, `del nums[i]` and `nums.remove(x)` O(n); `x in nums` O(n). Space O(n), since capacity is always under 2n here.

The real `list` over-allocates by a smaller factor than 2 (on my CPython 3.11, `sys.getsizeof` showed capacity going 4, 8, 16, 24). Any constant factor above 1 gives the same geometric argument.

### Recognition

Signals that you are in dynamic-array territory rather than something fancier:

- Access by position, or "in place" / "O(1) extra space" in the statement. Index arithmetic is the tool.
- An output array the same length as the input, filled position by position. **Product of Array Except Self** has this shape.
- Building strings or sequences piece by piece. **Encode and Decode Strings** is mostly about building and then parsing one long string.
- Values in a small known range (lowercase letters, digits 1 to 9). A fixed-size list indexed by value (`counts[ord(c) - ord('a')]`) can stand in for a dict.

When not to use a plain list: frequent inserts or deletes at the front (use `collections.deque`, O(1) at both ends, recalled), or "does x exist?" asked many times (use a set, next section).

### Pitfalls

- `list.pop(0)` and `list.insert(0, x)` in a loop turn an O(n) algorithm into O(n²). This is the most common hidden quadratic in array code.
- `x in nums` inside a loop over `nums` is O(n²) for the same reason.
- `s += ch` in a loop builds a new string each time, O(n²) in the worst case. Collect pieces in a list and `"".join(parts)` once at the end, O(total length). (Recalled: CPython sometimes optimises in-place `+=` on strings; don't rely on it.)
- `[[0] * 3] * 3` makes three references to the same inner list, so writing `grid[0][0] = 1` changes all three rows. Use `[[0] * 3 for _ in range(3)]`.
- Slicing (`nums[1:]`) copies, so slicing inside a loop quietly adds O(n) per iteration.

### Active Recall

1. Using the doubling class from capacity 1, how many element copies happen during 9 appends, and what is the final capacity?

2. Same eight appends, but capacity grows by +2 instead of x2 (1, 3, 5, 7, 9). How many copies?

3. Why is `nums.pop()` O(1) but `nums.pop(0)` O(n)?

4. A function builds its answer with `result = result + [x]` inside a loop over n items. What is its complexity, and what is the fix?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied dynamic arrays in Python: a list keeps a capacity (slots reserved) and a size (slots used), and the used slots are always indices 0..size-1 with no gaps, so indexing is O(1). Append writes into index size; when size == capacity it first allocates 2 x capacity and copies every element, so n appends cost fewer than 3n writes (O(1) amortized), while growing by a constant (+2) makes append O(n) amortized. Pop from the end moves nothing (O(1)); insert or delete at index i shifts size - i elements (O(n) at the front).
Worked example from the lesson: appending 5, 8, 2, 9, 4, 7, 1, 6 into an array starting at capacity 1. Resizes fire when size hits 1, 2 and 4, copying 1 + 2 + 4 = 7 elements for 8 appends; final size 8, capacity 8.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Using the doubling class from capacity 1, how many element copies happen during 9 appends, and what is the final capacity?
2. Same eight appends, but capacity grows by +2 instead of x2 (1, 3, 5, 7, 9). How many copies?
3. Why is nums.pop() O(1) but nums.pop(0) O(n)?
4. A function builds its answer with result = result + [x] inside a loop over n items. What is its complexity, and what is the fix?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

No problem in the list makes you derive the array cost model on its own (it is used everywhere but never the question itself), so this checkpoint is included.

You are given a list `nums` and a value `val`. Remove every occurrence of `val` from `nums` without creating another list. Afterwards, return `k`, the number of remaining elements, and make sure they sit in `nums[0..k-1]` in their original relative order. Anything after index k - 1 does not matter. Example: `nums = [3, 1, 3, 2, 3, 4]`, `val = 3` gives `k = 3` and `nums[0..2] = [1, 2, 4]`.

Before opening a chat, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
You are given a list nums and a value val. Remove every occurrence of val from nums without creating another list. Afterwards, return k, the number of remaining elements, and make sure they sit in nums[0..k-1] in their original relative order. Anything after index k - 1 does not matter. Example: nums = [3, 1, 3, 2, 3, 4], val = 3 gives k = 3 and nums[0..2] = [1, 2, 4].
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

A worker processes a queue of one million jobs strictly in arrival order. New jobs are appended at the back, and the worker takes from the front with `jobs.pop(0)`. Would you keep a list here? Why?

{% capture coach %}
You are my coding-interview coach. I just learned the dynamic array (Python list) cost model (fast by index and at the end, O(n) for any insert or delete that shifts elements). Scenario: A worker processes a queue of one million jobs strictly in arrival order. New jobs are appended at the back, and the worker takes from the front with jobs.pop(0). Would you keep a list here? Why?
Ask me whether I would use the dynamic array (Python list) cost model here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Hash Usage

### Foundation

A hash map is a coat check. You hand over a coat, you get a ticket, and when you come back the attendant goes straight to your hook without searching the whole room. In Python, `dict` is the coat check with a value on each hook, and `set` is the same thing with just the ticket.

What it solves: turning "search for x" from O(n) into O(1) on average. A lot of array problems that look like they need a nested loop are really asking one of three questions about the elements you have already looked at:

- **Membership.** Have I seen x? Use a `set`.
- **Counting.** How many times have I seen x? Use a `dict` of counts (or `collections.Counter`).
- **Grouping.** Which elements share property f(x)? Use a `dict` from f(x) to a list (`collections.defaultdict(list)`).

### Mechanics

Worked example: a log of visits, `visits = ["ana", "bo", "ana", "cy", "bo", "ana", "dee"]`. We want (a) visits per person, (b) the first person in log order who visited exactly once, (c) people grouped by name length, (d) a fast "is this person a regular (2+ visits)?" check.

1. **Count in one pass.** `counts[name] = counts.get(name, 0) + 1`. The `.get(name, 0)` is the decision that matters: a name never seen before starts at 0 instead of raising `KeyError`.
2. **Answer "first with count 1" in a second pass.** It is tempting to decide during the first pass, but at index 1 `"bo"` has count 1 and later becomes 2. A count is only final after the whole input has been read, so any question about final counts needs a second pass (over the input or over the dict).
3. **Group by a derived key.** The key is whatever the grouped elements have in common, computed from each element: here `len(name)`. Each distinct name goes into the list at `by_length[len(name)]`.
4. **Precompute a set for repeated membership checks.** Building the set costs O(n) once, after which each `in` check is O(1) on average. Worth it when you check many times; not worth it for one check.

The invariant during the counting loop: after processing `visits[0..i]`, `counts[name]` equals the number of times `name` appears in `visits[0..i]`, and names not yet seen are absent from `counts`.

What makes a valid key: it must be hashable, which in practice means immutable. `str`, `int`, `tuple` of hashables and `frozenset` work; `list`, `dict` and `set` do not. Running `d[[1, 2]] = 1` raises `TypeError: unhashable type: 'list'`, while `d[(1, 2)] = 1` works. When you need a composite key such as a (row, col) pair or "the multiset of these letters", your job is to turn it into one of the hashable forms.

### Diagram

The counting loop, one row per step, on the worked example:

<figure class="sketch">{% include sketches/dsa-arrays-and-hashing/visit-counts.svg %}<figcaption>counts after each step of the loop. Blue marks the one count that step changed; a blank cell is a name that is not yet a key.</figcaption></figure>

Picking the container is a small decision tree:

<figure class="sketch">{% include sketches/dsa-arrays-and-hashing/container-choice.svg %}<figcaption>What you need to remember about past elements picks the container (green).</figcaption></figure>

### Implementation

```python
from collections import defaultdict

def visit_report(visits):
    counts = {}                                  # name -> visits so far
    for name in visits:
        counts[name] = counts.get(name, 0) + 1   # unseen name: .get returns 0, so it becomes 1

    # Second pass over visits (not during the first pass): at index 1, "bo" has count 1
    # but ends at 2, so a count is only final once all of visits[0..n-1] is read.
    first_single = None
    for name in visits:
        if counts[name] == 1:
            first_single = name
            break

    by_length = defaultdict(list)                # len(name) -> names of that length
    for name in counts:                          # each distinct name once, in first-seen order
        by_length[len(name)].append(name)        # (recalled: dicts keep insertion order since 3.7)

    regulars = {name for name, c in counts.items() if c >= 2}   # set: O(1) average `in`
    return counts, first_single, dict(by_length), regulars

visits = ["ana", "bo", "ana", "cy", "bo", "ana", "dee"]
counts, first_single, by_length, regulars = visit_report(visits)
print(counts)          # {'ana': 3, 'bo': 2, 'cy': 1, 'dee': 1}
print(first_single)    # cy
print(by_length)       # {3: ['ana', 'dee'], 2: ['bo', 'cy']}
print("bo" in regulars, "cy" in regulars)   # True False
```

Running it prints exactly the commented values. Edge cases I ran: `[]` gives `({}, None, {}, set())`; `["x"]` gives first single `"x"`; `["a", "a"]` gives first single `None` and regulars `{"a"}`.

`collections.Counter(visits)` builds the same counts dict in one call; it is a dict subclass whose missing keys read as 0 (recalled).

Complexity, with n = len(visits) and u = number of distinct names: O(n) time on average, since each dict or set operation is O(1) average (recalled; the next section shows why and when it isn't). Space O(u). Hashing a string key costs O(length of the string), so with long keys the honest bound is O(total characters).

### Recognition

Signals:

- Words like "duplicate", "unique", "appears", "frequency", "count", "most common", "same letters", "group".
- A brute force with a nested loop where the inner loop searches for something specific. If the inner loop is a lookup, a dict or set can usually replace it.
- A requirement of O(n) time on unsorted data, which rules out sorting (O(n log n)).
- Order doesn't matter, only identity and multiplicity.

From the list: **Contains Duplicate** and **Longest Consecutive Sequence** show the membership signal; **Valid Anagram** and **Top K Frequent Elements** show the counting signal; **Group Anagrams** and **Valid Sudoku** show the grouping signal, where the real work is choosing the key; **Two Sum** shows the "remember something about earlier elements" signal.

When not to use it: when you need order or nearest values ("smallest element greater than x", "closest to target"). A hash map throws away order, so a sorted array with binary search or a heap fits better. Also when the input is already sorted, two pointers often gives O(1) extra space instead of O(n).

Distinguish from sorting: sorting also brings equal elements together, in O(n log n) time with no extra dict. Hashing trades O(n) space for O(n) time; if memory is capped, sorting may be the intended trade.

### Pitfalls

- `d[key] += 1` on a plain dict raises `KeyError` for a new key. Use `.get(key, 0) + 1`, `defaultdict(int)` or `Counter`.
- Reading `dd[key]` on a `defaultdict` inserts the key. A check like `if dd[key]:` silently grows the dict; use `key in dd` to test.
- Lists as keys raise `TypeError`. Convert to a tuple. A tuple containing a list is still unhashable.
- Deciding "unique" or "most frequent" before the counting pass has finished.
- Assuming a `set` keeps insertion order. It does not; a `dict` does (recalled, since Python 3.7).
- Building a set inside a loop: the O(n) build cost is paid every iteration, which throws the gain away.

### Active Recall

1. After the first four visits (`"ana", "bo", "ana", "cy"`), what is `counts`? Which name would a "first with count 1" check pick if you ran it at that moment, and why is that wrong?

2. You want a dict keyed by a grid position. Why does `seen[[r, c]] = True` fail while `seen[(r, c)] = True` works?

3. In `visit_report`, the grouping loop iterates `for name in counts`, not `for name in visits`. What would change in `by_length` if it iterated over `visits`?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied hash usage in Python: a set answers "have I seen x?" and a dict answers "how many times?", "which elements share a property?" (defaultdict(list) keyed by f(x)) or "where did x appear?", each lookup O(1) on average. Counting uses counts.get(name, 0) + 1; any question about a final count (unique, most frequent) needs the counting pass to finish first. Keys must be hashable, which in practice means immutable: str, int, frozenset, and tuples of hashables work; lists, dicts and sets do not.
Worked example from the lesson: visits = ["ana", "bo", "ana", "cy", "bo", "ana", "dee"]. Counting gives (ana: 3, bo: 2, cy: 1, dee: 1); a second pass finds "cy" as the first name visited exactly once; grouping distinct names by length (looping over the counts dict's keys) gives (3: [ana, dee], 2: [bo, cy]); regulars with 2+ visits are ana and bo.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. After the first four visits ("ana", "bo", "ana", "cy"), what is counts? Which name would a "first with count 1" check pick if you ran it at that moment, and why is that wrong?
2. You want a dict keyed by a grid position. Why does seen[[r, c]] = True fail while seen[(r, c)] = True works?
3. In visit_report, the grouping loop iterates for name in counts, not for name in visits. What would change in by_length if it iterated over visits?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: Two Sum and Longest Consecutive Sequence both require you to work out for yourself what to store in the map or set and what to look up, which is exactly this checkpoint's exercise, so that derivation happens when you solve them.

### Transfer test

A store has a sorted list of product prices and gets queries like "what is the cheapest product costing at least x?". Someone suggests putting the prices in a set for O(1) lookups. Would you use hashing here? Why?

{% capture coach %}
You are my coding-interview coach. I just learned hash maps and sets (O(1) average answers to identity questions: seen it, how many, which group, where). Scenario: A store has a sorted list of product prices and gets queries like "what is the cheapest product costing at least x?". Someone suggests putting the prices in a set for O(1) lookups. Would you use hashing here? Why?
Ask me whether I would use hash maps and sets here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Hash Implementation

### Foundation

Back to the coat check. The attendant doesn't have a hook per possible customer; there are, say, 4 hooks, and the ticket number tells them which hook to use. Two coats can end up on the same hook. That's fine as long as the attendant checks the name tag on each coat on that hook. When the hooks get too crowded, they move to a room with twice as many hooks and re-hang everything.

That is a hash table: an array of buckets, a function that turns a key into a bucket index, a way to handle collisions, and a resize rule. Knowing how it works tells you why dict operations are O(1) on average, when they aren't, and why keys must be immutable.

### Mechanics

1. **Hash then compress.** `hash(key)` gives an integer (possibly huge or negative). `hash(key) % capacity` maps it into 0 to capacity - 1. Python's `%` with a positive right side always returns a value in that range, even for a negative left side (recalled).
2. **Collisions by chaining.** Each bucket is a small list of `[key, value]` pairs. Two keys with the same index share the bucket.
3. **Put.** Go to the key's bucket. If a pair with that key exists, overwrite its value and stop (size unchanged). Otherwise append a new pair and increment size. We only need to search one bucket, because a key can only ever live in bucket `hash(key) % capacity`.
4. **Get / remove.** Same bucket, scan it comparing keys with `==`.
5. **Resize.** The load factor is size / capacity, the average bucket length. When it passes a threshold (0.75 here), double the capacity and re-insert every pair. Re-inserting is required: the bucket index depends on capacity, so key 14 lives in bucket 14 % 4 = 2 before and 14 % 8 = 6 after.

Why it is O(1) on average: with a decent hash function the keys spread out, so the expected bucket length is about the load factor, which resizing keeps below a constant. Resizing costs O(n) but happens after the size doubles, the same geometric argument as dynamic arrays, so it is O(1) amortized per put. Why it can be O(n): if many keys land in one bucket (a bad hash, or inputs crafted against it), every operation scans a long chain.

Worked example: capacity 4, threshold 0.75, integer keys `10, 3, 14, 7`. In CPython `hash(n) == n` for small non-negative ints (recalled; checked for these keys), so the index is just `key % capacity`.

- put 10: 10 % 4 = 2. Bucket 2 = [10]. Load 1/4 = 0.25.
- put 3: 3 % 4 = 3. Bucket 3 = [3]. Load 0.50.
- put 14: 14 % 4 = 2. Collision with 10; bucket 2 = [10, 14]. Load 0.75, not above 0.75, so no resize.
- put 7: 7 % 4 = 3. Collision with 3; bucket 3 = [3, 7]. Load 4/4 = 1.00 > 0.75, so resize to 8 and re-insert: 10 % 8 = 2, 3 % 8 = 3, 14 % 8 = 6, 7 % 8 = 7. No collisions left. Load 4/8 = 0.50.

### Diagram

<figure class="sketch">{% include sketches/dsa-arrays-and-hashing/hash-resize.svg %}<figcaption>Before and after the resize. Blue keys land in the same bucket number; amber keys move, because the index depends on the capacity.</figcaption></figure>

### Implementation

```python
class HashMap:
    """Separate chaining: each bucket is a list of [key, value] pairs."""

    def __init__(self, capacity=4, max_load=0.75):
        self.capacity = capacity
        self.max_load = max_load
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]   # not [[]] * capacity: that shares one list

    def _index(self, key):
        # hash(key) may be any int, even negative; % capacity maps it into 0..capacity-1
        # (recalled: Python's % with a positive divisor is never negative). Key 14: 14 % 4 = 2.
        return hash(key) % self.capacity

    def put(self, key, value):
        bucket = self.buckets[self._index(key)]
        for pair in bucket:
            if pair[0] == key:          # key already stored: overwrite, size unchanged
                pair[1] = value
                return
        # key is not in its own bucket, and it can only ever live in bucket _index(key),
        # so it is not in the table: this is a new key.
        bucket.append([key, value])
        self.size += 1
        if self.size / self.capacity > self.max_load:   # put 7: 4 / 4 = 1.00 > 0.75
            self._resize(2 * self.capacity)

    def get(self, key, default=None):
        for k, v in self.buckets[self._index(key)]:
            if k == key:
                return v
        return default                  # not in its bucket, so not anywhere

    def remove(self, key):
        bucket = self.buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.size -= 1
                return True
        return False

    def _resize(self, new_capacity):
        old = self.buckets
        self.capacity = new_capacity    # set first: _index below must use the new capacity
        self.buckets = [[] for _ in range(new_capacity)]
        for bucket in old:              # re-bucket every pair: 14 moves from 14 % 4 = 2 to 14 % 8 = 6
            for k, v in bucket:
                self.buckets[self._index(k)].append([k, v])

m = HashMap()
for key in [10, 3, 14, 7]:
    m.put(key, f"v{key}")
print(m.size, m.capacity)                        # 4 8
print([[k for k, _ in b] for b in m.buckets])    # [[], [], [10], [3], [], [], [14], [7]]
m.put(14, "new")
print(m.size, m.get(14), m.get(3), m.get(6))     # 4 new v3 None
print(m.remove(7), m.remove(7), m.size)          # True False 3
```

Running it prints the commented values, matching the diagram. Edge cases I ran: overwriting key 14 leaves size at 4; removing a missing key returns `False`; `get` on a missing key returns the default; 100 string keys `"0"` to `"99"` all read back correctly and capacity ends at 256 (100 / 128 is above 0.75).

Complexity, with n = number of keys: `put`, `get`, `remove` O(1) average and amortized (resize), O(n) worst case when keys pile into one bucket. Space O(n + capacity), and capacity stays within a constant factor of n.

Python's real `dict` uses open addressing instead of chaining: one flat array, and on a collision it probes other slots in a fixed sequence (recalled). Same big-O on average.

### Recognition

You rarely implement a hash table, so recognition is about knowing its guarantees:

- Any time you need a custom object or a composite value as a key, you are relying on `__hash__` and `__eq__` being consistent: equal objects must have equal hashes.
- When a constraint says "O(1) extra space", a dict or set of size n is off the table. Look for a fixed-size array (26 letters, 9 digits) or in-place tricks instead.
- From the list: **Group Anagrams** and **Valid Sudoku** stand or fall on building a correct hashable key; **Encode and Decode Strings** is a reminder that not everything needs hashing.

### Pitfalls

- Forgetting to rehash on resize (copying buckets by position) puts keys in the wrong bucket, so `get` stops finding them.
- `[[]] * capacity` creates one shared bucket list. Use a list comprehension.
- Defining `__eq__` on a class without `__hash__` makes instances unhashable (recalled: Python sets `__hash__ = None` in that case).
- Quoting O(1) as a guarantee. It is average-case; worst case is O(n) per operation.

### Active Recall

1. After the resize to capacity 8, you put key 22. Which bucket does it go to, does it collide, and does it trigger another resize?

2. Why can't `_resize` just copy bucket i of the old table into bucket i of the new one?

3. In `put`, after scanning one bucket and not finding the key, the code appends without looking at any other bucket. Why is that safe?

4. A class defines `__hash__` to always return 1. Is a dict of 10,000 such objects still correct? Is it still fast?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied how a hash table works, in Python: an array of buckets, index = hash(key) % capacity, collisions handled by chaining (each bucket a list of [key, value] pairs). A key only ever lives in bucket hash(key) % capacity, so put, get and remove scan one bucket. When size / capacity exceeds 0.75 the table doubles and re-inserts every pair, because the index depends on capacity. That keeps operations O(1) on average and amortized, but O(n) worst case if keys pile into one bucket. Equal keys must have equal hashes.
Worked example from the lesson: capacity 4, threshold 0.75, integer keys 10, 3, 14, 7 (hash(n) == n for these). 10 -> bucket 2, 3 -> bucket 3, 14 -> bucket 2 (collision, load 0.75, no resize), 7 -> bucket 3 (load 1.00 > 0.75, resize to 8). After re-inserting with key % 8: 10 in bucket 2, 3 in bucket 3, 14 in bucket 6, 7 in bucket 7; load 4/8 = 0.50.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. After the resize to capacity 8, you put key 22. Which bucket does it go to, does it collide, and does it trigger another resize?
2. Why can't _resize just copy bucket i of the old table into bucket i of the new one?
3. In put, after scanning one bucket and not finding the key, the code appends without looking at any other bucket. Why is that safe?
4. A class defines __hash__ to always return 1. Is a dict of 10,000 such objects still correct? Is it still fast?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

No problem in the list asks you to build a hash table yourself, so the mechanics of buckets, collisions and deletion would otherwise never be exercised. This checkpoint is included.

A building tracks who is inside. Member ids are integers from 0 to 10^9. You must support `enter(id)`, `leave(id)` and `inside(id)`, each fast on average. The only storage allowed is one flat Python list whose slots each hold a single id or `None`. No dicts, sets or nested lists. Test your design with a list of 8 slots on ids 5, 13 and 21, then `leave(13)`, then `inside(21)`.

Before opening a chat, write down: the observation, the approach, why it's correct, the complexity.

{% capture coach %}
You are my coding-interview coach. Here is a problem I haven't seen:
A building tracks who is inside. Member ids are integers from 0 to 10^9. You must support enter(id), leave(id) and inside(id), each fast on average. The only storage allowed is one flat Python list whose slots each hold a single id or None. No dicts, sets or nested lists. Test your design with a list of 8 slots on ids 5, 13 and 21, then leave(13), then inside(21).
Don't name the technique or hint at it. First make me state the key observations, my approach, why it is correct, and its time and space complexity — before any code. Wait for my attempt. If I'm stuck, give progressively stronger hints across several turns instead of solving it. Only show a full solution (Python) if I ask for it after trying. Then review my code for correctness and complexity.
{% endcapture %}
{% include coach.html prompt=coach label="Work it out, then talk it through with" %}

### Transfer test

You write a `Point` class with fields `x` and `y`, use points as dict keys to cache distances, and later update `p.x += 1` on a point that is already a key. Would you rely on a hash map here as written? Why?

{% capture coach %}
You are my coding-interview coach. I just learned how a hash map works underneath (a key is only ever looked for in the bucket its current hash points to). Scenario: You write a Point class with fields x and y, use points as dict keys to cache distances, and later update p.x += 1 on a point that is already a key. Would you rely on a hash map here as written? Why?
Ask me whether I would use how a hash map works underneath here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Prefix Sums

### Foundation

A car's odometer. To know how far you drove between two towns, you don't re-drive the road; you subtract the odometer reading at the first town from the reading at the second. A prefix sum array is the odometer for an array: `P[j]` is the total of everything before index j, and any contiguous range total is one subtraction.

What it solves: many queries about sums of contiguous subarrays. Without it, each query is O(length). With it, O(n) once and then O(1) per query.

### Mechanics

Define `P` with one more element than `nums`: `P[0] = 0` and `P[j + 1] = P[j] + nums[j]`. So `P[j]` = sum of `nums[0..j-1]`, and `P[0]` is the sum of nothing.

Then the sum of `nums[l..r]` (inclusive) is `P[r + 1] - P[l]`. Why: `P[r + 1]` covers `nums[0..r]`, `P[l]` covers `nums[0..l-1]`, and subtracting removes exactly the part before l.

Worked example: `nums = [3, -1, 4, 1, -5, 9, 2]`.

- P[0] = 0, P[1] = 3, P[2] = 3 + (-1) = 2, P[3] = 2 + 4 = 6, P[4] = 6 + 1 = 7, P[5] = 7 + (-5) = 2, P[6] = 2 + 9 = 11, P[7] = 11 + 2 = 13.
- Sum of `nums[2..4]` = P[5] - P[2] = 2 - 2 = 0. Check: 4 + 1 + (-5) = 0.

The leading 0 is the decision that removes a special case: a range starting at l = 0 is `P[r + 1] - P[0]`, and it needs no branch.

**Prefix sums plus a hash map.** A second use comes straight out of the formula. `nums[l..r]` sums to k exactly when `P[r + 1] - P[l] = k`, i.e. `P[l] = P[r + 1] - k`. So if you sweep left to right keeping a running total, the number of subarrays ending at the current index with sum k equals the number of earlier prefix values equal to `running - k`. A dict from prefix value to how many times it has occurred answers that in O(1) average. This counts subarrays with sum k in one pass, negatives included.

On the worked example with k = 4 there are 3 such subarrays: `nums[1..3] = [-1, 4, 1]`, `nums[2..2] = [4]` and `nums[4..5] = [-5, 9]`. The sweep finds them at indices 2, 3 and 5 (full trace in the diagram).

The seed `seen = {0: 1}` plays the role of P[0]: it lets a subarray that starts at index 0 be counted.

### Diagram

<figure class="sketch">{% include sketches/dsa-arrays-and-hashing/prefix-fence.svg %}<figcaption>Each P[j] sits on the fence just before nums[j]. The blue range nums[2..4] is the difference of the two amber fence values.</figcaption></figure>

The prefix-plus-hash sweep for k = 4. `need = running - k`; `found` is `seen[need]` before this step's insert.

<figure class="sketch">{% include sketches/dsa-arrays-and-hashing/prefix-hash-sweep.svg %}<figcaption>The sweep for k = 4, with need = running − k and found = seen[need] read before this step's insert. Green rows found a subarray; amber marks the running total that repeats. seen after step i is {0:1} plus the running totals up to i.</figcaption></figure>

At i = 4 the running total returns to 2, so `seen[2]` becomes 2. That repeat is the zero-sum range `nums[2..4]` from the range-query example.

### Implementation

```python
from itertools import accumulate

def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)          # prefix[j] = sum(nums[0..j-1]); prefix[0] = 0
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    return prefix

def range_sum(prefix, l, r):
    # sum(nums[l..r]) inclusive: prefix[r+1] covers nums[0..r], prefix[l] covers nums[0..l-1].
    # l = 2, r = 4: prefix[5] - prefix[2] = 2 - 2 = 0 = 4 + 1 + (-5).
    return prefix[r + 1] - prefix[l]

def count_subarrays_with_sum(nums, k):
    seen = {0: 1}        # prefix value -> times seen; the 0 is prefix[0], so ranges from index 0 count
    running = 0          # after processing nums[i], running == prefix[i + 1]
    total = 0
    for x in nums:
        running += x
        # nums[l..i] sums to k  <=>  prefix[l] == running - k, for l in 0..i.
        # i = 2 on the example: running = 6, need 2 = prefix[2], so nums[2..2] = [4].
        total += seen.get(running - k, 0)
        # insert after the lookup: prefix[i + 1] would otherwise match itself when k == 0,
        # counting the empty range nums[i+1..i]
        seen[running] = seen.get(running, 0) + 1
    return total

nums = [3, -1, 4, 1, -5, 9, 2]
P = build_prefix(nums)
print(P)                                   # [0, 3, 2, 6, 7, 2, 11, 13]
print(P == list(accumulate(nums, initial=0)))   # True
print(range_sum(P, 2, 4), range_sum(P, 0, 6), range_sum(P, 1, 5))   # 0 13 8
print(count_subarrays_with_sum(nums, 4))   # 3
```

Running it prints the commented values. `itertools.accumulate(nums, initial=0)` builds the same prefix list in one line (recalled: the `initial` argument exists since Python 3.8). I checked `count_subarrays_with_sum` against a brute force over all i <= j for k = 0, 3, 4, 5 and 8 on the worked example; they agreed (1, 2, 3, 2 and 1 subarrays). Other edge cases: empty `nums` gives prefix `[0]` and count 0; `[4]` with k = 4 gives 1; `[0, 0, 0]` with k = 0 gives 6; `[1, -1, 1, -1]` with k = 0 gives 4; `[2, 2]` with k = 4 gives 1.

Complexity, with n = len(nums): building the prefix array O(n) time and O(n) space; each range query O(1). The counting sweep is O(n) time on average (one dict lookup and one insert per element) and O(n) space for `seen`.

### Recognition

Signals:

- "Sum of subarray", "range sum", "contiguous", "between index i and j", many queries on a static array.
- A range quantity whose operation can be undone: sums (subtract), XOR (XOR again). Max and min cannot be undone, so they don't work this way.
- "Count subarrays with sum / property equal to k", especially with negative numbers: prefix values plus a hash map.
- Each output position depends on a whole stretch of the input, not just its neighbours. Ask what one pass could precompute so each position reads it in O(1). **Product of Array Except Self** shows this signal.

When not to use it: when the array changes between queries (each update invalidates O(n) prefix entries), or when the range question isn't decomposable by subtraction (range max).

Distinguish from sliding window (coming in [Part 6](/blogs/dsa-sliding-window/)): a window works when growing it moves the quantity one way and shrinking moves it back, which is true for sums only when all numbers are non-negative. Prefix-plus-hash works with negatives too, at the cost of O(n) extra space.

### Pitfalls

- Off by one: with the length-(n + 1) convention the range is `P[r + 1] - P[l]`. Mixing it with a length-n convention (`P[i]` includes `nums[i]`) gives `P[r] - P[l - 1]` and breaks at l = 0. Pick one and stick to it.
- Forgetting `seen = {0: 1}` misses every subarray that starts at index 0.
- Inserting the current running total before the lookup counts the empty range when k = 0. On the worked example that returns 8 instead of 1 (I ran both).
- Using a set instead of a dict of counts when prefix values repeat: at i = 4 the value 2 has occurred twice, and each occurrence starts a different subarray.
- Building `P` with `sum(nums[:i])` for each i is O(n²). Build it incrementally.

### Active Recall

1. Using `P = [0, 3, 2, 6, 7, 2, 11, 13]`, what is the sum of `nums[1..5]`? Which two entries do you use?

2. `P[2]` and `P[5]` are both 2. What does that tell you about `nums` without looking at it?

3. Why must `count_subarrays_with_sum` look up `running - k` before inserting `running`, not after? Give a concrete wrong output.

4. Why can't you answer "maximum of `nums[l..r]`" with a prefix-max array the same way?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied prefix sums in Python: P has one more element than nums, P[0] = 0 and P[j + 1] = P[j] + nums[j], so P[j] is the sum of nums[0..j-1] and the sum of nums[l..r] inclusive is P[r + 1] - P[l]. Combined with a hash map: sweep left to right with a running total; the number of subarrays ending at the current index with sum k is the number of earlier prefix values equal to running - k, kept in a dict of counts seeded with 0: 1, looking up before inserting the current running total.
Worked example from the lesson: nums = [3, -1, 4, 1, -5, 9, 2], P = [0, 3, 2, 6, 7, 2, 11, 13]. Sum of nums[2..4] = P[5] - P[2] = 2 - 2 = 0. With k = 4 there are 3 subarrays: [4], [-1, 4, 1] and [-5, 9].
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Using P = [0, 3, 2, 6, 7, 2, 11, 13], what is the sum of nums[1..5]? Which two entries do you use?
2. P[2] and P[5] are both 2. What does that tell you about nums without looking at it?
3. Why must count_subarrays_with_sum look up running - k before inserting running, not after? Give a concrete wrong output.
4. Why can't you answer "maximum of nums[l..r]" with a prefix-max array the same way?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped: Product of Array Except Self requires deriving a prefix-style precomputation on its own, under a no-division constraint, so that reasoning happens when you solve it.

### Transfer test

A dashboard shows total sales for any date range over the last year. The sales array is also corrected constantly: individual days are edited thousands of times between queries. Would you use a prefix sum array? Why?

{% capture coach %}
You are my coding-interview coach. I just learned prefix sums (precompute running totals once so any range sum is one subtraction). Scenario: A dashboard shows total sales for any date range over the last year. The sales array is also corrected constantly: individual days are edited thousands of times between queries. Would you use a prefix sum array? Why?
Ask me whether I would use prefix sums here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

How the four connect to Arrays & Hashing: dynamic arrays are the storage and the cost model, and they decide whether "one pass" really means O(n). Hash usage is the main move: replace a search inside a loop with an O(1) average lookup into a structure that remembers the past. Hash implementation explains the limits of that move: average not worst case, keys must be immutable, and the key you build is your design decision. Prefix sums turn range questions into arithmetic on two stored values, and combined with a hash map they turn "find a range with property X" into "find an earlier prefix value", which is the same "remember the past, look it up now" move again.

Distinguishing competing approaches:

| If the problem... | Lean toward | Instead of |
| --- | --- | --- |
| Asks about identity or counts, order irrelevant, O(n) wanted | dict / set | sorting (O(n log n)) |
| Caps extra memory at O(1) | sorting in place, or a fixed-size count array | dict / set |
| Has keys from a small known range (26 letters, digits 1 to 9) | a list of counts indexed by value | a dict (same big-O, less overhead) |
| Asks about order or nearest values | sorting + binary search, or a heap | hashing |
| Is already sorted | two pointers ([Part 3](/blogs/dsa-two-pointers/)) | a hash map |
| Asks about contiguous range sums, static array | prefix sums | re-summing each range |
| Counts ranges hitting an exact target, negatives allowed | prefix sums + dict of counts | sliding window |
| Needs a composite key (pair, multiset, pattern) | build a tuple or canonical string key | nested loops comparing elements |

A recognition checklist for an unfamiliar array or string problem:

1. Write the brute force. What is the inner loop doing? If it searches for a specific value, a set or dict can probably replace it.
2. What do I need to remember about elements I've already passed: whether they appeared, how often, where, or which group they belong to? That picks the container.
3. What is the key? If elements should be treated as "the same" under some rule, find a hashable value that is equal exactly when that rule says so.
4. Does the question mention contiguous ranges, or does each answer depend on a whole stretch of the input? Ask what can be precomputed in a single pass.
5. Is a count final yet? Questions about final counts need the counting pass to finish first.
6. Check the constraints: required time (O(n) rules out sorting), allowed space (O(1) rules out a dict of size n), value range (small range means a fixed-size array), negatives (rule out a sliding window on sums).
7. Check the cost model: no `pop(0)`, no `in list` inside a loop, no string `+=` in a loop, no slicing inside a loop.

## The problems

Solve them with the cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute honest struggle, one key sentence per problem once it clicks, then spaced repetition. For this category, ask during the struggle: can a hash map or set give me O(1) lookups? Would prefix sums help? Can two pointers shrink the search space? The insight is usually the right data structure, or reframing the question as a condition on a subarray.

{% include dsa-problems.html slug="dsa-arrays-and-hashing" %}

## Take this lesson as a live session

If you'd rather be taught this interactively, open the prompt below in a chat; it is already filled in for Arrays & Hashing.

{% capture coach %}
[TOPIC]: Arrays & Hashing
[PREREQUISITES]: Dynamic Arrays, Hash Usage, Hash Implementation, Prefix Sums
[PROBLEM LIST]: Contains Duplicate, Valid Anagram, Two Sum, Group Anagrams, Top K Frequent Elements, Encode and Decode Strings, Product of Array Except Self, Valid Sudoku, Longest Consecutive Sequence
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
