---
layout: post
title: "Math & Geometry is five small tricks, and each one breaks on its own edge case"
date: 2024-03-15 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, math, geometry, python, series]
read_time: 47
permalink: /blogs/dsa-math-and-geometry/
excerpt: "The last topic in the series has no single pattern. It has five small ones: index maps on a matrix, carrying digits, squaring exponents, catching number sequences that loop, and counting points with a hash map. Each is short, and each fails on one specific input you need to see coming."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 19
series_total: 19
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one, the last, covers Math & Geometry: five small techniques that each break on one specific input.

Math & Geometry is the one topic in the series without a single unifying pattern. Its problems are short and implementation-heavy, and they're hard for a different reason than DP or graphs: the idea often fits in a sentence, and the bug hides in an index, a carry, a sign or a duplicate. It comes last in the order this series follows because it waits on [2-D Dynamic Programming](/blogs/dsa-2d-dynamic-programming/) and [Bit Manipulation](/blogs/dsa-bit-manipulation/). From the first you bring comfort with `(r, c)` grid indices, and from the second you bring `& 1`, `>>= 1` and the habit of reading a number as bits. Both show up below. Nothing comes after it, so this is the last lesson in the series.

There are no separate prerequisites here, so the topic itself is the single foundational module. Its problems use five techniques, so I've split the module into five sub-parts, each with its own worked example and its own checkpoints.

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Foundation

Every problem in this topic comes down to replacing a picture or a piece of arithmetic with an exact rule over integers:

- A rotation or reflection becomes a formula that maps `(r, c)` to the cell's new `(r, c)`.
- Grade-school addition becomes a loop that carries a digit from right to left.
- "Multiply x by itself n times" becomes "square x about log₂ n times".
- "Does this number sequence go on forever?" becomes "the values are bounded, so some value must repeat".
- "Which points form this shape?" becomes "fix what the query gives you, and look up the rest in a hash map".

None of these is a big algorithm. The skill is writing the rule down before you write code, and then checking the rule on the degenerate input that breaks it. The five sub-parts below are ordered roughly the way the problem list uses them.

## Part A: Matrix index transformations

### Mechanics

**Index maps.** Treat every in-place matrix operation as a function from an old position to a new one. For an R × C matrix:

| Operation | (r, c) goes to | Square only? |
| --- | --- | --- |
| Transpose | (c, r) | yes, if done in place |
| Mirror left-right | (r, C-1-c) | no |
| Flip top-bottom | (R-1-r, c) | no |
| Rotate 180° | (R-1-r, C-1-c) | no |

To derive a map you don't remember, track where the corners go. For rotating 180°, the top-left corner `(0, 0)` must end at the bottom-right corner `(R-1, C-1)`, so both coordinates get reversed. The 180° map is also the mirror followed by the flip: `(r, c) → (r, C-1-c) → (R-1-r, C-1-c)`. Composing simple maps is how you build complicated ones.

Doing it **in place** is the hard part. Each of these maps is its own inverse: apply it twice and every cell is back where it started. So the cells split into pairs that trade places, plus fixed cells that map to themselves. Swap each pair exactly once. Rotating 180° shows this cleanly if you flatten `(r, c)` to the row-major index `i = r·C + c`. The target `(R-1-r, C-1-c)` has flat index `(R-1-r)·C + (C-1-c) = R·C - 1 - i`. So the map just reverses the flat index, and swapping `i` with `R·C-1-i` for `i` in `0 .. R·C//2 - 1` touches every pair once.

Worked example, the 3 × 4 matrix with values 1 to 12. `R·C = 12`, so `i` runs over 0..5 and its partners are 11..6. Index 0 is cell (0,0) holding 1, and its partner 11 is (2,3) holding 12. Index 5 is (1,1) holding 6, and its partner 6 is (1,2) holding 7.

**Layer boundaries.** A matrix is also a set of nested rings. A cell's ring is its distance to the nearest edge: `k = min(r, c, R-1-r, C-1-c)`. Ring `k` spans rows `k .. R-1-k` and columns `k .. C-1-k`, inclusive, and there are `(min(R, C) + 1) // 2` rings. In the 3 × 4 example that's 2 rings. Ring 1 spans rows 1..1 and columns 1..2. It's a single row, not a loop, and that degenerate innermost ring is where layer code breaks.

**In-place markers.** Sometimes each cell's new value depends on its neighbours' old values. Write new values straight into the grid and later cells read values that have already changed. With O(1) extra space, the fix is to store both values in the same cell. The Bit Manipulation trick fits here: keep the old value in bit 0 and write the new value into bit 1. Reads use `cell & 1`, which setting bit 1 can't disturb. A final pass does `cell >>= 1` to promote new over old.

Worked example: "dilate" a 0/1 grid, where a cell becomes 1 if it or an orthogonal neighbour was 1:

<figure class="sketch">{% include sketches/dsa-math-and-geometry/dilate-markers.svg %}<figcaption>Dilating in place. Blue cells were 1 before; green cells are correctly turned on by the marker version; red cells are the leak in the naive version, which reads 1s it wrote earlier in the same pass.</figcaption></figure>

The naive version sets (0,1) to 1 because of (1,1). Then, reading row-major, it reaches (0,2), sees the freshly written 1 at (0,1), and sets (0,2) as well. The 1s leak across the whole grid.

### Diagram

<figure class="sketch">{% include sketches/dsa-math-and-geometry/rotate-180-map.svg %}<figcaption>The 3 × 4 example. The swap loop visits the blue flat indices 0..5; the amber indices 6..11 are only reached as their partners 11 - i. Ring 1 (green) is the single row (1,1), (1,2). Bottom middle: the grid after the 180° rotation.</figcaption></figure>

### Implementation

```python
def rotate_180_in_place(grid):
    """Rotate an R x C grid by 180 degrees in place, O(1) extra space."""
    R, C = len(grid), len(grid[0])
    total = R * C
    # (r, c) -> (R-1-r, C-1-c) is flat index i -> total-1-i. Looping i over
    # 0 .. total//2 - 1 swaps each pair once; for 3x4, i = 0..5 pairs with 11..6.
    # For odd total (3x3, total 9) the middle index 4 maps to 8-4 = 4 and is skipped.
    for i in range(total // 2):
        j = total - 1 - i
        r1, c1 = divmod(i, C)
        r2, c2 = divmod(j, C)
        grid[r1][c1], grid[r2][c2] = grid[r2][c2], grid[r1][c1]
    return grid


def transpose_in_place(m):
    """Transpose a square n x n matrix in place."""
    n = len(m)
    for r in range(n):
        # Only c in r+1 .. n-1 (above the diagonal). Visiting c in 0 .. n-1 would
        # swap (0, 1) with (1, 0) and later swap them back, leaving m unchanged.
        for c in range(r + 1, n):
            m[r][c], m[c][r] = m[c][r], m[r][c]
    return m


def ring_sums(grid):
    """Sum of each concentric ring, outermost first."""
    R, C = len(grid), len(grid[0])
    sums = [0] * ((min(R, C) + 1) // 2)      # 3x4 -> 2 rings, 5x3 -> 2, 4x4 -> 2
    for r in range(R):
        for c in range(C):
            k = min(r, c, R - 1 - r, C - 1 - c)  # distance from (r, c) to nearest edge
            sums[k] += grid[r][c]
    return sums


def dilate_in_place(grid):
    """Cell becomes 1 if it or an orthogonal neighbour was 1; O(1) extra space."""
    R, C = len(grid), len(grid[0])
    for r in range(R):
        for c in range(C):
            # Old value is bit 0. Setting bit 1 below leaves bit 0 intact, so a
            # later neighbour reading grid[r][c] & 1 still sees the OLD value.
            was_on = grid[r][c] & 1
            neighbour_on = any(
                0 <= nr < R and 0 <= nc < C and grid[nr][nc] & 1
                for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1))
            )
            if was_on or neighbour_on:
                grid[r][c] |= 2                 # new value 1 stored in bit 1
    for r in range(R):
        for c in range(C):
            grid[r][c] >>= 1                    # 3 -> 1, 2 -> 1, 1 -> 0, 0 -> 0
    return grid


g = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
print(ring_sums(g))                      # [65, 13]
print(rotate_180_in_place(g))            # [[12, 11, 10, 9], [8, 7, 6, 5], [4, 3, 2, 1]]
print(transpose_in_place([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
# [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
print(dilate_in_place([[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1]]))
# [[0, 1, 0, 0], [1, 1, 1, 1], [0, 1, 1, 1]]
```

Ring 1 is cells (1,1) and (1,2), holding 6 + 7 = 13. Ring 0 is everything else, 78 - 13 = 65. I also ran the edge cases: `[[1]]` stays `[[1]]`, a single row `[[1, 2, 3]]` becomes `[[3, 2, 1]]`, a single column `[[1], [2]]` becomes `[[2], [1]]`, and `ring_sums([[1, 2, 3, 4, 5]])` is `[15]`.

Complexity: every function is O(R · C) time for an R × C grid. Extra space is O(1) for the rotation, the transpose and the dilation, and O(min(R, C)) for the list of ring sums.

### Recognition

- The statement says "in place" or "O(1) extra space" about a matrix, or describes a rotation, reflection or traversal order.
- The output order is defined by position (a border, a diagonal, a ring) rather than by value.
- A cell's update depends on other cells' old values while you're overwriting the grid.

When not to use it: if extra space is allowed, `[row[::-1] for row in grid[::-1]]` or a fresh output grid is simpler and harder to get wrong. Separately, an update rule that spreads ("everything reachable from a 1") is a graph traversal from [Graphs](/blogs/dsa-graphs/), not a single index map. In the list, Rotate Image, Spiral Matrix and Set Matrix Zeroes show these signals.

### Pitfalls

- Swapping every pair twice. Any in-place involution needs a loop over one half of the index space.
- Transposing a non-square matrix in place doesn't work, because its shape changes from R × C to C × R.
- Degenerate rings: a single row or single column in the middle (3 × 4, 5 × 3), or a single cell (odd n × n). Code that walks four sides of a ring visits that row or column twice.
- Reading a value you already overwrote. Either keep a copy, or encode old and new together as with the markers above.
- `R - 1 - r` versus `R - r`. Test the map on a corner first: `(0, 0)` must land on a real cell.

### Active Recall

1. In the 3 × 4 example, which cell does flat index 5 name, and which cell does it swap with?

2. What does `transpose_in_place` return if the inner loop is `range(n)` instead of `range(r + 1, n)`?

3. How many rings does a 5 × 3 matrix have, and what shape is the innermost one?

4. In the naive dilation, (0,3) ends as 1. It had no 1-neighbour in the original grid. Which write caused it?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied matrix index transformations in Python: every in-place matrix operation is a map from old (r, c) to new (r, c): transpose (c, r), mirror (r, C-1-c), flip (R-1-r, c), rotate 180 (R-1-r, C-1-c). Each is its own inverse, so cells split into pairs and each pair must be swapped exactly once; for rotate 180 the flat index i = r*C + c maps to R*C-1-i, so looping i over 0 .. R*C//2 - 1 swaps each pair once. A cell's ring is k = min(r, c, R-1-r, C-1-c), there are (min(R, C) + 1) // 2 rings, and the innermost can be a single row or column. When new values depend on neighbours' old values, keep the old value in bit 0 and write the new one into bit 1, read with & 1, then shift right by 1 at the end.
Worked example from the lesson: the 3 x 4 matrix [[1,2,3,4],[5,6,7,8],[9,10,11,12]]; i runs 0..5 with partners 11..6; after the 180 rotation it is [[12,11,10,9],[8,7,6,5],[4,3,2,1]]; ring sums are [65, 13]. Dilating [[0,0,0,0],[0,1,0,0],[0,0,0,1]] (a cell becomes 1 if it or an orthogonal neighbour was 1) gives [[0,1,0,0],[1,1,1,1],[0,1,1,1]] with markers, but naive row-major writes give [[0,1,1,1],[1,1,1,1],[1,1,1,1]].
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. In the 3 x 4 example, which cell does flat index 5 name, and which cell does it swap with?
2. In an in-place square transpose that swaps m[r][c] with m[c][r], what does it return if the inner loop runs c over range(n) instead of range(r + 1, n)?
3. How many rings does a 5 x 3 matrix have, and what shape is the innermost one?
4. In the naive dilation, (0,3) ends as 1. It had no 1-neighbour in the original grid. Which write caused it?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Rotate Image, Spiral Matrix and Set Matrix Zeroes each make you derive an index map, a layer walk or a marker scheme from scratch, so those three problems exercise this sub-part on their own.

### Transfer test

You need to list the cells of an R × C grid grouped by anti-diagonal, the lines running from top-right to bottom-left. Would you use an index transformation? Why?

{% capture coach %}
You are my coding-interview coach. I just learned matrix index transformations (replace a picture of a matrix operation with an exact formula over (r, c), such as a ring label min(r, c, R-1-r, C-1-c)). Scenario: You need to list the cells of an R x C grid grouped by anti-diagonal, the lines running from top-right to bottom-left.
Ask me whether I would use matrix index transformations here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Part B: Digit-by-digit arithmetic with carry

### Mechanics

When a number is too big for the language, or the problem hands it to you as a string or a list of digits and forbids converting it, you do arithmetic the way you learned it on paper. Line the numbers up at the **right** (the ones place), work leftward, and carry.

The invariant: after processing the rightmost k columns, the output holds the correct last k digits of the sum, and `carry` is exactly the amount that spills into column k+1. It's safe to emit each digit immediately because nothing to the left can change a column to its right. Carries only travel leftward.

Worked example, `"987" + "2345"`:

| column | a digit | b digit | carry in | s | digit out | carry out |
| --- | --- | --- | --- | --- | --- | --- |
| ones | 7 | 5 | 0 | 12 | 2 | 1 |
| tens | 8 | 4 | 1 | 13 | 3 | 1 |
| hundreds | 9 | 3 | 1 | 13 | 3 | 1 |
| thousands | (none) → 0 | 2 | 1 | 3 | 3 | 0 |

Result `"3332"`, and 987 + 2345 = 3332. Two decisions make the loop general:

- A missing digit counts as 0. That handles numbers of different lengths without padding.
- `carry, digit = divmod(s, base)` splits any column sum into "what stays" and "what moves left". In base 10 the largest column sum is 9 + 9 + 1 = 19, so the carry is always 0 or 1. Don't rely on that, though: other operations produce larger carries.

The reverse direction, peeling digits off an integer, is the same `divmod`: `n, d = divmod(n, 10)` gives the last digit `d` and drops it from `n`. Part D uses this.

### Diagram

<figure class="sketch">{% include sketches/dsa-math-and-geometry/carry-addition.svg %}<figcaption>"987" + "2345", aligned at the ones place. i (blue) starts at index 2 of a, j (amber) at index 3 of b, and both move left; the amber carries of 1 go into the tens, hundreds and thousands columns. Sum 3332.</figcaption></figure>

### Implementation

```python
def add_digit_strings(a, b, base=10):
    """Add two non-negative numbers given as digit strings, in any base <= 10."""
    i, j = len(a) - 1, len(b) - 1        # start at the ones column of each
    carry = 0
    out = []
    # Keep going while either string has digits left OR a carry remains:
    # for "999" + "1" the 4th iteration runs only because carry == 1.
    while i >= 0 or j >= 0 or carry:
        da = int(a[i]) if i >= 0 else 0  # a missing digit counts as 0
        db = int(b[j]) if j >= 0 else 0
        carry, digit = divmod(da + db + carry, base)
        out.append(str(digit))           # digits come out ones-first
        i -= 1
        j -= 1
    return "".join(reversed(out)) or "0" # reverse to most-significant-first


def digits_of(n):
    """Digits of a non-negative int, ones digit first."""
    out = []
    while n:
        n, d = divmod(n, 10)             # 4096 -> (409, 6)
        out.append(d)
    return out


print(add_digit_strings("987", "2345"))     # 3332
print(add_digit_strings("999", "1"))        # 1000
print(add_digit_strings("1011", "111", 2))  # 10010  (11 + 7 = 18)
print(digits_of(4096))                      # [6, 9, 0, 4]
```

Edge cases I ran: `"0" + "0"` gives `"0"`, two empty strings give `"0"`, and `"007" + "5"` gives `"012"`, so leading zeros in the input survive into the output.

Complexity: O(max(len(a), len(b))) time and O(max(len(a), len(b))) space for the output, one iteration per column plus at most one for the final carry. `digits_of` is O(d) for a d-digit number.

### Recognition

- The numbers arrive as strings, lists or linked lists of digits, or the statement says "do not convert to integer" or "no built-in big-integer library".
- The numbers can be far longer than 64 bits.
- The problem asks about a number's digits: their sum, their squares, reversing them.

When not to use it: in Python, if conversion is allowed and the inputs are modest, `int(a) + int(b)` is correct and simpler. Carry-based addition is also different from the bitwise addition in [Part 18](/blogs/dsa-bit-manipulation/), which computes carries with `&` and `<<` instead of column by column. In the list, Plus One and Multiply Strings work on digit sequences, and Happy Number needs the digit-peeling loop.

### Pitfalls

- Forgetting the final carry. Without `or carry` in the loop condition, `"999" + "1"` returns `"000"`.
- Emitting digits most-significant-first. They come out ones-first, so reverse once at the end, and don't prepend in the loop (prepending to a string or list is O(n) each time).
- Index misalignment. Align at the right end with two separate pointers, never by the same index from the left.
- `digits_of(0)` returns `[]`, since the loop body never runs. The digit sum (0) is still right, but a digit count would come out 0 instead of 1.
- Negative input to the peeling loop. `divmod(-7, 10)` is `(-1, 3)`, then `divmod(-1, 10)` is `(-1, 9)` forever, which I confirmed by running it. Peel `abs(n)` and handle the sign separately.

### Active Recall

1. Why can the carry never exceed 1 when adding two base-10 numbers, and when does that stop being true?

2. In the `"987" + "2345"` trace, why is it safe to emit the ones digit 2 before looking at any other column?

3. `add_digit_strings("1011", "111", 2)` returns `"10010"`. How many loop iterations run, and why is it one more than the length of the longer input?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied digit-by-digit arithmetic with carry in Python: align two digit strings at the ones place, walk leftward with two separate pointers i and j, treat a missing digit as 0, and split each column sum with carry, digit = divmod(s, base). Keep looping while either string has digits left or carry is non-zero. Digits come out ones-first, so reverse once at the end. Invariant: after k columns the last k output digits are final and carry is exactly what spills into column k+1, because carries only move left.
Worked example from the lesson: "987" + "2345": ones 7+5+0 = 12 -> digit 2 carry 1; tens 8+4+1 = 13 -> 3 carry 1; hundreds 9+3+1 = 13 -> 3 carry 1; thousands 0+2+1 = 3 -> 3 carry 0; result "3332". The same function with base 2 gives add_digit_strings("1011", "111", 2) = "10010" (11 + 7 = 18).
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Why can the carry never exceed 1 when adding two base-10 numbers, and when does that stop being true?
2. In the "987" + "2345" trace, why is it safe to emit the ones digit 2 before looking at any other column?
3. add_digit_strings("1011", "111", 2) returns "10010". How many loop iterations run, and why is it one more than the length of the longer input?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Multiply Strings makes you build a carry scheme from scratch, and it's more demanding than addition, so the list exercises this sub-part directly.

### Transfer test

A ledger stores account balances as decimal strings of up to 100,000 digits, and you need to compute the difference of two balances. The larger one is always given first. Would you use digit-by-digit arithmetic? Why?

{% capture coach %}
You are my coding-interview coach. I just learned digit-by-digit arithmetic with carry (do paper arithmetic on digit strings from the ones place leftward, carrying with divmod). Scenario: A ledger stores account balances as decimal strings of up to 100,000 digits, and you need to compute the difference of two balances. The larger one is always given first.
Ask me whether I would use digit-by-digit arithmetic with carry here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Part C: Fast exponentiation by squaring

### Mechanics

Computing `x^n` by multiplying n times is O(n), which is hopeless when n is around 10⁹ or 10¹⁸. The fix comes from writing the exponent in binary. `13 = 1101₂ = 8 + 4 + 1`, so `3^13 = 3^8 · 3^4 · 3^1`. The powers `3^1, 3^2, 3^4, 3^8` each come from squaring the previous one, and you multiply into the result only the powers whose bit in the exponent is 1.

The loop state is `(result, base, exp)`. The invariant is `result · base^exp = x^n` (mod m) at the top of every iteration, and each step keeps it true:

- If `exp` is odd: `base^exp = base · base^(exp-1)`, so move one `base` into `result`, leaving an even exponent.
- Then `base^exp = (base²)^(exp//2)`, so square `base` and halve `exp` (`exp >>= 1`, the Bit Manipulation shift).

When `exp` reaches 0, `base^0 = 1`, so `result` is the answer. `exp` halves every iteration, so there are `exp.bit_length()` iterations, about log₂ n.

Worked example, `3^13 mod 1000`. I checked that `3^13 = 1594323`, so the answer should be 323:

| exp (binary) | bit 0 | result before | base before | result after | base after |
| --- | --- | --- | --- | --- | --- |
| 13 (1101) | 1 | 1 | 3 | 3 | 9 |
| 6 (110) | 0 | 3 | 9 | 3 | 81 |
| 3 (11) | 1 | 3 | 81 | 243 | 6561 mod 1000 = 561 |
| 1 (1) | 1 | 243 | 561 | 243 · 561 = 136323 → 323 | 721 |

Check the invariant at the third row: `3 · 81³ = 3 · 531441 = 1594323`, which is `323 mod 1000`. I computed `result · base^exp mod 1000` at the top of all four iterations and got 323 every time.

**Negative exponents.** `x^(-n) = (x⁻¹)^n`. Invert the base once, negate the exponent, and run the same loop. With real numbers the inverse is `1 / x`, and `x = 0` has no inverse. In modular arithmetic the inverse of `x` is the number `y` with `x · y ≡ 1 (mod m)`, and it exists only when `gcd(x, m) = 1`. `3⁻¹ mod 1000 = 667`, because `3 · 667 = 2001 ≡ 1`.

### Diagram

<figure class="sketch">{% include sketches/dsa-math-and-geometry/pow-bits.svg %}<figcaption>exp = 13 = 1101₂, read one bit per iteration from the right. Green bits multiply the current power of 3 into result; the grey bit is skipped. The base squares every iteration: 3 multiplies into result, 4 squarings.</figcaption></figure>

### Implementation

```python
def mod_pow(base, exp, mod):
    """base**exp % mod in O(log |exp|) multiplications; exp may be negative."""
    if exp < 0:
        # (recalled: pow(b, -1, m) is Python 3.8+ and raises ValueError when
        # gcd(b, m) != 1.) 3^-1 mod 1000 = 667 since 3 * 667 = 2001 = 2*1000 + 1.
        base = pow(base, -1, mod)
        exp = -exp
    result = 1 % mod        # 1 % 1 == 0: with mod == 1 every answer is 0, even for exp == 0
    base %= mod
    # Invariant at the top of each iteration: result * base**exp == original answer (mod mod).
    # For 3^13 mod 1000 it is 323 at exp = 13, 6, 3 and 1.
    while exp > 0:
        if exp & 1:                     # odd exp: move one factor of base into result
            result = result * base % mod
        base = base * base % mod        # base**exp == (base*base)**(exp // 2) for even exp
        exp >>= 1
    return result


print(mod_pow(3, 13, 1000))      # 323
print(mod_pow(3, -13, 1000))     # 387, and 387 * 323 % 1000 == 1
print(mod_pow(5, 0, 7))          # 1
print(mod_pow(2, 10, 10**9 + 7)) # 1024
print(mod_pow(-2, 3, 7))         # 6, same as (-8) % 7
```

The negative case checks out: 387 · 323 = 125001, which is 1 mod 1000, so 387 really is the inverse of 3^13. It also matches Python's built-in `pow(3, -13, 1000)`. `mod_pow(2, -1, 4)` raises `ValueError: base is not invertible for the given modulus`, because 2 · k mod 4 is always even and never 1.

Complexity: O(log |exp|) multiplications, exactly `exp.bit_length()` loop iterations, and O(1) space. Reducing mod m after every multiply keeps every intermediate value below m².

### Recognition

- An exponent, repeat count or step count that's huge (10⁹, 10¹⁸) while the operation itself is simple.
- "Return the answer modulo 10⁹ + 7" next to a power or a repeated transformation.
- Anything that means "apply the same associative operation n times". Numbers are one case. Matrices, permutations and function composition are others.

When not to use it: small fixed exponents (`x * x * x` is clearer), and cases where you need every intermediate power anyway, where a running product is already O(n). Don't confuse it with binary search. Both halve something, but here the halving is applied to the exponent while an invariant is preserved, not to a search range. In the list, Pow(x, n) shows these signals.

### Pitfalls

- Forgetting the odd case, or squaring before multiplying into `result`. The order within one iteration matters.
- Negative exponents: `x = 0` (division by zero) and bases that aren't invertible mod m.
- Negating the most negative 32-bit integer overflows in fixed-width languages. Python ints don't overflow, but know why other people's solutions special-case it.
- Floating point: repeated squaring of a float accumulates rounding error, and `1 / x` for tiny `x` can overflow to infinity. Compare floats with a tolerance.
- Without the `% mod` after each multiply, Python stays correct, but the numbers grow to millions of digits and every multiply gets slow.

### Active Recall

1. At the top of the iteration where `exp = 6`, `result = 3` and `base = 9`. Show the invariant holds there.

2. How many loop iterations does `mod_pow` run for `exp = 1,000,000`, and how many of them multiply into `result`?

3. `mod_pow(3, -13, 1000)` returned 387. Why was it valid to invert 3 first, instead of computing `3^13` and inverting that?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied fast exponentiation by squaring in Python: the loop state is (result, base, exp) with invariant result * base^exp = x^n (mod m) at the top of every iteration. If exp is odd, multiply base into result; then square base and halve exp (exp >>= 1). When exp reaches 0, result is the answer, after exp.bit_length() iterations. For a negative exponent, invert the base once (the modular inverse exists only when gcd(base, m) = 1) and negate the exponent.
Worked example from the lesson: 3^13 mod 1000 (3^13 = 1594323, answer 323). exp 13: result 1 -> 3, base 3 -> 9. exp 6: result stays 3, base 9 -> 81. exp 3: result 3 -> 243, base 81 -> 6561 mod 1000 = 561. exp 1: result 243 * 561 = 136323 -> 323, base -> 721. Also mod_pow(3, -13, 1000) = 387, since 3^-1 mod 1000 = 667 and 387 * 323 = 125001, which is 1 mod 1000.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. At the top of the iteration where exp = 6, result = 3 and base = 9. Show the invariant holds there.
2. How many loop iterations run for exp = 1,000,000, and how many of them multiply into result?
3. mod_pow(3, -13, 1000) returned 387. Why was it valid to invert 3 first, instead of computing 3^13 and inverting that?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Pow(x, n) makes you derive squaring, including negative exponents, from scratch, so it covers this sub-part directly.

### Transfer test

You need the 10¹⁸-th Fibonacci number modulo 10⁹ + 7. Would you use exponentiation by squaring? Why?

{% capture coach %}
You are my coding-interview coach. I just learned exponentiation by squaring (apply an associative operation n times in about log2 n steps by squaring and multiplying on the bits of n). Scenario: You need the 10^18-th Fibonacci number modulo 10^9 + 7.
Ask me whether I would use exponentiation by squaring here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Part D: Cycle detection in number sequences

### Mechanics

Take a function `f` from integers to integers and iterate it: `x₀, f(x₀), f(f(x₀)), …`. If the values can only come from a finite set, some value must eventually repeat (pigeonhole). From the first repeat onward, the sequence loops forever, because `f` is deterministic. The shape is a **rho** (ρ): a tail of length μ that leads into a cycle of length λ. You met this shape in [Linked List](/blogs/dsa-linked-list/), where it was nodes and next-pointers. Here `f` plays the role of `.next`.

So the technique has two steps:

1. **Prove the values are bounded.** That's what makes a cycle unavoidable, so "does it loop forever?" becomes "which cycle does it end in?".
2. **Detect the cycle.** Either store every value seen (dict or set, O(μ + λ) memory), or use Floyd's tortoise and hare (O(1) memory).

Worked example: `f(n) = sum of the cubes of n's digits`, starting from 4. I computed:

<figure class="sketch">{% include sketches/dsa-math-and-geometry/cube-sequence.svg %}<figcaption>Sum of the cubes of the digits, starting from 4. The blue tail (μ = 4) leads into the green cycle 133 → 55 → 250 (λ = 3); the amber cells are the cycle repeating.</figcaption></figure>

`f(4) = 64`. `f(64) = 216 + 64 = 280`. `f(280) = 8 + 512 + 0 = 520`. `f(520) = 125 + 8 + 0 = 133`. `f(133) = 1 + 27 + 27 = 55`. `f(55) = 125 + 125 = 250`. `f(250) = 8 + 125 + 0 = 133`, which repeats. So μ = 4 (the cycle starts at index 4, value 133) and λ = 3 (133 → 55 → 250 → 133).

Why is it bounded for every start? A d-digit number is at least 10^(d-1), and f of it is at most 729·d (every digit a 9, and 9³ = 729). For d = 5, n is at least 10000 while f(n) is at most 3645, and the gap only widens as d grows. So any n ≥ 10000 maps to something strictly smaller, and the sequence drops below 10000. Once it's below 10000 it has at most 4 digits, so f is at most 4 · 729 = 2916, and it stays below 10000. The values end up trapped in 0..9999, so once the sequence is below 10000, a repeat is guaranteed within 10001 more steps.

**Floyd's version.** Move `slow` one step and `fast` two steps until they're equal. Both are then inside the cycle, and the meeting time t is a multiple of λ. From the example: they meet at t = 6 on value 250, since `x₆ = x₁₂ = 250`, and 6 is a multiple of 3. Reset `slow` to `x₀` and step both pointers one at a time. After μ steps, `slow` is at `x_μ`, and `fast` is at `x_(t+μ)`, which equals `x_μ` because t is a multiple of λ. So they meet exactly at the cycle start: `x₁₀ = x₄ = 133`. (The general proof is in [Part 7](/blogs/dsa-linked-list/). I've only re-checked it on this example.)

### Diagram

<figure class="sketch">{% include sketches/dsa-math-and-geometry/rho.svg %}<figcaption>The same sequence as a rho: the blue tail 4 → 64 → 280 → 520 enters the green cycle at 133 (index 4), and 250 leads back to 133.</figcaption></figure>

<figure class="sketch">{% include sketches/dsa-math-and-geometry/floyd-trace.svg %}<figcaption>Floyd on this sequence. Phase 1: slow = x[t], fast = x[2t]; they first meet (green) at t = 6 on 250. Phase 2: slow restarts at x[0], fast stays at x[6], both move one step; they meet after 4 steps on 133, so μ = 4.</figcaption></figure>

### Implementation

```python
def cube_digit_sum(n):
    total = 0
    while n:
        n, d = divmod(n, 10)           # peel the ones digit (Part B)
        total += d ** 3
    return total


def cycle_with_dict(f, x0):
    """Return (mu, lam, cycle_start) using O(mu + lam) memory."""
    first_seen = {}                    # value -> index where it first appeared
    x, i = x0, 0
    while x not in first_seen:
        first_seen[x] = i
        x = f(x)
        i += 1
    mu = first_seen[x]                 # 133 first seen at index 4
    return mu, i - mu, x               # seen again at i = 7, so lam = 7 - 4 = 3


def cycle_floyd(f, x0):
    """Return (mu, lam, cycle_start) using O(1) memory."""
    slow, fast = f(x0), f(f(x0))
    while slow != fast:                # from 4: meet at t = 6 on 250
        slow, fast = f(slow), f(f(fast))
    # Meeting time t is a multiple of lam (t = 6, lam = 3), so x[t + mu] == x[mu]:
    # a pointer from x0 and a pointer from the meeting point, both moving one
    # step at a time, reach x[mu] together. Here after mu = 4 steps, on 133.
    mu, slow = 0, x0
    while slow != fast:
        slow, fast = f(slow), f(fast)
        mu += 1
    lam, fast = 1, f(slow)             # walk once around the cycle from 133
    while slow != fast:
        fast = f(fast)
        lam += 1
    return mu, lam, slow


print(cycle_with_dict(cube_digit_sum, 4))  # (4, 3, 133)
print(cycle_floyd(cube_digit_sum, 4))      # (4, 3, 133)
print(cycle_floyd(cube_digit_sum, 136))    # (0, 2, 136): 136 -> 244 -> 136
print(cycle_floyd(cube_digit_sum, 153))    # (0, 1, 153): 1 + 125 + 27 = 153
print(cycle_floyd(cube_digit_sum, 9999))   # (7, 1, 153)
```

I checked that both versions agree for every start from 0 to 19999. Starting at 0 gives `(0, 1, 0)` and starting at 1 gives `(0, 1, 1)`. Those are fixed points, cycles of length 1.

Complexity: both are O(μ + λ) calls to `f`, and each call here is O(number of digits). The dict version uses O(μ + λ) extra space, and Floyd uses O(1). Floyd calls `f` roughly three times per step in phase 1, so when `f` is expensive and memory is fine, the dict is often faster in practice.

### Recognition

- "Repeat this process until it ends, or forever": a deterministic step applied to its own output.
- The state space is finite, or you can bound it (digit functions, `mod m`, a fixed-size board).
- The question asks about eventual behaviour: does it reach X, what does it settle into, what's the value after 10¹⁸ steps. For the last one, find μ and λ, then index into the cycle with `(k - μ) % λ`.

When not to use it: if the values can grow without bound (`n → 2n`), there's no cycle to find, so bound the values first. If the step isn't deterministic (random, or depending on outside input), the rho argument fails. Don't confuse it with cycle detection in a general graph ([Graphs](/blogs/dsa-graphs/)): there each node can have many out-edges, and you need DFS colouring or a topological sort. Here every value has exactly one successor. In the list, Happy Number shows these signals.

### Pitfalls

- Assuming termination without proving a bound. Write the bound down, even roughly.
- A fixed point is a cycle of length 1. A check like "stop when we see 1" and a check like "stop on a repeat" both have to handle it.
- In Floyd's, starting `slow` and `fast` both at `x₀` and testing equality before the first move makes them "meet" instantly.
- In phase 2, moving `fast` two steps (as in phase 1) instead of one gives the wrong μ. Both pointers move one step.
- Forgetting that each `f` call has a cost. Floyd's O(1) memory is paid for with extra calls.

### Active Recall

1. From start 136, what are μ and λ? Compute f by hand first.

2. Redo the boundedness argument for `f(n) = 1000 × (sum of the digits of n)`. Is the sequence still guaranteed to cycle?

3. In the Floyd trace, the pointers met at t = 6 on 250, not at the cycle start 133. Why doesn't phase 1 find the start directly?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied cycle detection in number sequences in Python: iterate a deterministic function f from x0. If the values are bounded, pigeonhole forces a repeat, and from then on the sequence loops: a rho shape with a tail of length mu and a cycle of length lambda. First prove the bound, then detect the cycle with a dict of first-seen indices (O(mu + lambda) memory) or Floyd's tortoise and hare (O(1) memory): phase 1 moves slow one step and fast two until they are equal, at a time t that is a multiple of lambda; phase 2 resets slow to x0 and moves both one step until they meet at the cycle start.
Worked example from the lesson: f(n) = sum of the cubes of n's digits, from 4: 4, 64, 280, 520, 133, 55, 250, 133, 55, 250, so mu = 4 and lambda = 3 (133 -> 55 -> 250 -> 133). Bound: a d-digit number is at least 10^(d-1) while f is at most 729d, so values fall below 10000 and stay there. Floyd phase 1 meets at t = 6 on 250; phase 2 meets after 4 steps on 133.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. From start 136, what are mu and lambda? Compute f by hand first.
2. Redo the boundedness argument for f(n) = 1000 x (sum of the digits of n). Is the sequence still guaranteed to cycle?
3. In the Floyd trace, the pointers met at t = 6 on 250, not at the cycle start 133. Why doesn't phase 1 find the start directly?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Happy Number makes you notice the bound and the cycle from scratch, so it exercises this sub-part on its own.

### Transfer test

An old random number generator computes `x → (a · x + c) mod m` with m around 10¹². You want to know after how many calls it starts repeating. Would you use cycle detection? Why?

{% capture coach %}
You are my coding-interview coach. I just learned cycle detection in number sequences (a deterministic step over a bounded set of values must end in a rho, a tail into a cycle, found with a dict or Floyd). Scenario: An old random number generator computes x -> (a * x + c) mod m with m around 10^12. You want to know after how many calls it starts repeating.
Ask me whether I would use cycle detection in number sequences here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Part E: Hash-counting points for geometry queries

### Mechanics

Geometry problems on an integer grid usually ask "how many shapes of a certain kind touch this point?". The brute force tries every pair or triple of stored points, O(n²) or O(n³) per query. The hash-counting technique replaces that with lookups:

1. **Key points by exact integer coordinates.** Use a `Counter` keyed by `(x, y)`, so duplicate points become a count instead of repeated entries.
2. **Index them by the lines the queries care about.** For example, keep a count of points on each vertical line `x = k` and each horizontal line `y = k`.
3. **At query time, fix what the query gives you, enumerate the smallest remaining freedom, and look up everything else.** Counts of independent choices multiply.

Worked example: count axis-parallel right triangles whose right angle is at the query point q. One leg is vertical and one is horizontal. The vertical leg's other end is any stored point with the same x and a different y. The horizontal leg's other end is any stored point with the same y and a different x. The two choices are independent, so the count is `vertical × horizontal`. No enumeration is needed at all.

Stored points: (1,1), (1,4), (1,4), (5,1), (3,1), (1,7), (3,3). Note that (1,4) appears twice. Query q = (1,1):

- On line x = 1 there are 4 points: (1,1), (1,4), (1,4), (1,7). One of them is q itself, a zero-length leg, so vertical = 4 - 1 = 3.
- On line y = 1 there are 3 points: (1,1), (5,1), (3,1). Minus q gives horizontal = 2.
- Triangles = 3 × 2 = 6. The two copies of (1,4) count as different triangles.

I checked this against a brute force over all pairs, on this example and on 2000 random small point sets.

### Diagram

<figure class="sketch">{% include sketches/dsa-math-and-geometry/points-triangles.svg %}<figcaption>Stored points and the query Q = (1,1), stored once. Up the amber column x = 1: (1,4) twice and (1,7), so vertical = 3. Along the violet row y = 1: (3,1) and (5,1), so horizontal = 2. The grey point (3,3) is on neither line. 3 × 2 = 6 triangles.</figcaption></figure>

### Implementation

```python
from collections import Counter


class PointIndex:
    def __init__(self):
        self.points = Counter()   # (x, y) -> how many copies of that point
        self.on_x = Counter()     # x -> number of points on vertical line x
        self.on_y = Counter()     # y -> number of points on horizontal line y

    def add(self, x, y):
        self.points[(x, y)] += 1
        self.on_x[x] += 1
        self.on_y[y] += 1

    def right_angles_at(self, x, y):
        # (recalled: reading a missing key from a Counter returns 0 and does
        # not insert it; after querying (2, 2), self.points still has 6 keys.)
        here = self.points[(x, y)]
        # Copies of (x, y) itself lie on both lines but give zero-length legs.
        # For q = (1, 1): on_x[1] = 4, here = 1 -> vertical = 3.
        vertical = self.on_x[x] - here
        # For q = (1, 1): on_y[1] = 3, here = 1 -> horizontal = 2.
        horizontal = self.on_y[y] - here
        return vertical * horizontal   # independent choices multiply: 3 * 2 = 6


idx = PointIndex()
for p in [(1, 1), (1, 4), (1, 4), (5, 1), (3, 1), (1, 7), (3, 3)]:
    idx.add(*p)
print(idx.right_angles_at(1, 1))   # 6
print(idx.right_angles_at(3, 1))   # 2: vertical (3,3); horizontal (1,1), (5,1)
print(idx.right_angles_at(5, 4))   # 2: q not stored; vertical (5,1); horizontal (1,4) x2
print(idx.right_angles_at(1, 4))   # 0: no other point on y = 4
print(idx.right_angles_at(2, 2))   # 0: nothing on x = 2
```

Complexity: `add` is O(1). `right_angles_at` is O(1). Space is O(P + X + Y) for P distinct points, X distinct x values and Y distinct y values. Brute force over pairs would be O(n²) per query for n stored points.

When a shape isn't axis-aligned, the same idea needs a hashable key for "direction". For collinearity, key by the direction `(dx, dy)` reduced by `gcd(dx, dy)` with a fixed sign. I ran the normalisation: (2, 4) and (-1, -2) both become (1, 2), (0, -5) becomes (0, 1), and (-3, 0) becomes (1, 0). Never key by a float slope. `0.1 + 0.2 == 0.3` is `False`, and vertical lines divide by zero.

### Recognition

- Points on an integer grid, often with duplicates allowed, and many `add` / `count` queries interleaved.
- Shapes defined by axis-aligned or otherwise rigid relationships (same x, same y, equal side lengths, fixed offsets), so a few coordinates determine the rest.
- A counting question ("how many ways") rather than a construction question.

When not to use it: range queries over a region ("how many points in this rectangle") are better served by 2-D prefix sums on a bounded grid or by a sorted structure. Nearest-neighbour questions need sorting or a heap, as in [Heap / Priority Queue](/blogs/dsa-heaps/). The difference: hash counting answers "how many points are exactly at these coordinates", not "near" or "between". In the list, Detect Squares shows these signals.

### Pitfalls

- Storing points in a set, which silently drops duplicates when the problem counts them separately.
- Counting the query point as its own partner (zero-length sides or legs).
- `defaultdict` inserts a key whenever you read a missing one, so queries for absent points grow memory. `Counter` returns 0 without inserting.
- Float keys for slopes or distances. Use integer tuples, gcd-normalised directions, or squared distances.
- A normalised direction for `(0, 0)` means two identical points, and `gcd(0, 0) = 0` would divide by zero. Handle duplicates before normalising.

### Active Recall

1. Query (5, 4) isn't a stored point, yet the answer is 2. List the two triangles.

2. Query (1, 4) returns 0 even though three other points share its x. Why, and what does subtracting `here` do in this case?

3. You key lines through a fixed point by the slope `dy / dx` as a float. Give two concrete ways this breaks.

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied hash-counting points for geometry queries in Python: key stored points by exact integer coordinates in a Counter so duplicates become counts, index them by the lines queries care about (points per vertical line x = k and per horizontal line y = k), and at query time fix what the query gives you, enumerate the smallest remaining freedom, and look up the rest; independent choices multiply. For axis-parallel right triangles with the right angle at q = (x, y): vertical = on_x[x] - here, horizontal = on_y[y] - here, where here = copies of q stored, and the answer is vertical * horizontal. Directions for non-axis shapes use (dx, dy) reduced by gcd with a fixed sign, never a float slope.
Worked example from the lesson: stored points (1,1), (1,4), (1,4), (5,1), (3,1), (1,7), (3,3). Query (1,1): on x = 1 there are 4 points, minus 1 copy of q gives vertical = 3; on y = 1 there are 3, minus 1 gives horizontal = 2; 3 x 2 = 6. Other queries: (3,1) -> 2, (5,4) -> 2, (1,4) -> 0, (2,2) -> 0.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. Query (5, 4) isn't a stored point, yet the answer is 2. List the two triangles.
2. Query (1, 4) returns 0 even though three other points share its x. Why, and what does subtracting here do in this case?
3. You key lines through a fixed point by the slope dy / dx as a float. Give two concrete ways this breaks.
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Detect Squares makes you design the counting index and the enumeration from scratch, so it exercises this sub-part directly.

### Transfer test

A delivery app stores millions of shop locations on an integer grid (duplicates allowed) and must answer: "how many shops are in the 3 × 3 block centred at q?" Later, product asks for the same query with a 2001 × 2001 block. Would you use hash counting for each version? Why?

{% capture coach %}
You are my coding-interview coach. I just learned hash counting over points (exact integer coordinates in a hash map, answer a query with a few O(1) lookups and multiply independent counts). Scenario: A delivery app stores millions of shop locations on an integer grid (duplicates allowed) and must answer: "how many shops are in the 3 x 3 block centred at q?" Later, product asks for the same query with a 2001 x 2001 block. Consider each version separately.
Ask me whether I would use hash counting over points here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

Math & Geometry problems rarely hide their technique. The difficulty is precision: turning a shape or a rule into an exact integer statement, and then catching the one input where it breaks. The five sub-parts map onto the problems as tools rather than patterns. Index maps and markers handle matrix transformations in place. Carry loops handle numbers the language can't or mustn't hold. Squaring handles huge repeat counts. Rho detection handles processes that run "until something happens". Hash counting handles shape queries over points.

Telling competing approaches apart:

| Choice | Pick the first when | Pick the second when |
| --- | --- | --- |
| Copy the matrix vs transform in place | Extra O(R·C) space is allowed | The statement demands O(1) extra space: pair swaps over half the indices, or old and new state encoded in the same cell |
| Walk the boundary vs compute a label | The output order matters (visiting cells in sequence) | Only group membership matters (ring = min distance to an edge, diagonal = r ± c) |
| Built-in integers vs digit loops | Conversion is allowed and sizes are modest | Input is digit sequences with "no conversion", or lengths in the thousands |
| Repeated multiplication vs squaring | The exponent is small, or you need every intermediate power | The exponent is large, or the operation is associative and applied n times |
| Dict of seen values vs Floyd | Memory is fine, or you want the tail or the cycle's contents | Memory is O(1)-constrained, or the state space is huge |
| All-pairs check vs hash counting | One-off query on a few points | Many queries, integer coordinates, exact positions determine the shape |

A recognition checklist for an unfamiliar problem in this area:

1. **Is there a matrix and the word "in place"?** Write the index map `(r, c) → (?, ?)` and test it on the corner `(0, 0)` and on a degenerate shape (1 × n, n × 1, odd n).
2. **Are there digits as data?** Align at the ones place, carry with `divmod`, and check the final carry and the input zero.
3. **Is a count or exponent astronomically large?** Look for an associative step to square, and state the invariant `result · base^exp = answer`.
4. **Does a process repeat "until"?** Bound the state space, then pick a dict or Floyd. Watch for fixed points.
5. **Are there points and a shape?** Decide what the query fixes, what one freedom remains, and which counts multiply. Keep coordinates as integers.
6. **For all of the above: hand-trace a 3 × 3 or 3-digit case before coding.** In this topic, most wrong answers come from an unchecked boundary rather than a wrong idea.

## The problems

Solve these with the six-step cycle from [the method](/blogs/dsa-the-method/): 15 minutes of struggle, the "I'm stuck because ___" sentence, the key sentence in your log, and spaced repetition. Math & Geometry is closest to the pattern-driven note. During the struggle, work a 3 × 3 or 3-digit example by hand, write the index map or invariant down before any code, and list the degenerate inputs (single row, zero, negative exponent, a carry out of the top digit, duplicate points) that could break it.

| # | Problem |
| --- | --- |
| 1 | [Rotate Image](https://leetcode.com/problems/rotate-image/) |
| 2 | [Spiral Matrix](https://leetcode.com/problems/spiral-matrix/) |
| 3 | [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/) |
| 4 | [Happy Number](https://leetcode.com/problems/happy-number/) |
| 5 | [Plus One](https://leetcode.com/problems/plus-one/) |
| 6 | [Pow(x, n)](https://leetcode.com/problems/powx-n/) |
| 7 | [Multiply Strings](https://leetcode.com/problems/multiply-strings/) |
| 8 | [Detect Squares](https://leetcode.com/problems/detect-squares/) |

That's the last topic and the last of the 150 problems, and the end of the series. Finishing the lessons isn't the goal, though. The goal is still being able to solve these problems cold a month from now. That comes from the loop in [Part 1](/blogs/dsa-the-method/): a key sentence for every problem, then reviews at 1, 3, 7 and 14 days, with any failed review resetting to day 1. Keep that loop running across all 18 topics. If you are starting over or picking the series up cold, that is also where the method and the topic map live.

## Take this lesson as a live session

This is the prompt this post was written from, filled in for Math & Geometry: open it in a chat to be taught the topic interactively, with the checkpoints asked and judged one at a time.

{% capture coach %}
[TOPIC]: Math & Geometry
[PREREQUISITES]: Math & Geometry
[PROBLEM LIST]: Rotate Image, Spiral Matrix, Set Matrix Zeroes, Happy Number, Plus One, Pow(x, n), Multiply Strings, Detect Squares
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
