---
layout: post
title: "Python integers never overflow. Half the bit problems assume they do."
date: 2024-03-13 09:00:00 +0530
author: Rishabh Sharma
categories: blogs
tags: [dsa, bit-manipulation, twos-complement, python, series]
read_time: 32
permalink: /blogs/dsa-bit-manipulation/
excerpt: "Bit problems are short, but they turn on a handful of identities: what AND, OR, XOR and shifts do to each position, why n & (n-1) drops a bit, why pairs cancel under XOR. In Python there is a second lesson on top: faking the 32-bit integers the problems were written for."
series: "Data Structures & Algorithms, Pattern by Pattern"
series_order: 18
series_total: 19
---

These are my data structures and algorithms notes, cleaned up into nineteen posts, one pattern at a time. This one covers bit manipulation: the handful of bitwise identities the problems turn on, and how to fake 32-bit integers in a language whose integers never overflow.

Bit manipulation treats an integer as a row of switches instead of a quantity. Most problems in this topic are a few lines long, and each one hinges on a single identity: XOR cancels pairs, `n & (n - 1)` drops the lowest 1, a shifted 1 picks out one position. If you know the identities cold, you can spot the problem. If you don't, no amount of cleverness gets you there.

In the order this series follows, this topic comes after [1-D Dynamic Programming](/blogs/dsa-1d-dynamic-programming/), and together with [2-D Dynamic Programming](/blogs/dsa-2d-dynamic-programming/) it leads to the last part, [Math & Geometry](/blogs/dsa-math-and-geometry/). The prerequisite here is **Bit Operations**. Python adds a complication on top of it. Its integers are unbounded, while several problems on this list are specified for 32-bit integers, so there's one extra module on imitating fixed-width integers.

How to use this post: [the method](/blogs/dsa-the-method/). Checkpoints have no answers on the page: work them out, then open the linked chat to have your answer checked.

## Bit Operations

### Foundation

An integer in binary is a row of positions, and position `i` is worth 2^i. 12 is `1100`, meaning 8 + 4. A bitwise operator works on every position independently, as if you had 32 (or 64, or infinitely many) tiny one-bit machines working in parallel. There is no carrying between positions, which is the difference from `+`.

That's why the technique is useful. A single integer can act as a set of flags, and one bitwise instruction does something to all of them at once. A handful of identities then turn questions like "which bit is lowest?", "is exactly one bit set?" or "which value is left after pairs cancel?" into O(1) expressions.

Negative numbers use **two's complement**. In a w-bit integer the top position is worth −2^(w−1) instead of +2^(w−1), so a pattern with the top bit set reads as its unsigned value minus 2^w. Two consequences you'll use constantly:

- `-x == ~x + 1`. Negating means flip every bit, then add 1.
- In Python, `~x == -x - 1` for every integer, because Python behaves as if every integer had infinitely many bits: non-negative numbers have infinitely many leading 0s, negative numbers have infinitely many leading 1s (recalled: this is how Python defines bitwise operations on its unbounded ints).

### Mechanics

One worked example for the whole module: **a = 12 (`1100`) and b = 10 (`1010`)**.

**The operators, one position at a time.**

The symbols are `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<` and `>>` (shifts).

| Operator | Rule per position | Applied to 12 and 10 |
| --- | --- | --- |
| AND | 1 only if both are 1 | `1000` = 8 |
| OR | 1 if either is 1 | `1110` = 14 |
| XOR | 1 if exactly one is 1, meaning "the bits differ" | `0110` = 6 |
| NOT (of 12) | flip every bit | −13 in Python |
| Left shift by k | move every bit up k positions, fill with 0; same as times 2^k | `12 << 1` = 24 |
| Right shift by k | move every bit down k positions, the low k bits fall off; same as floor division by 2^k | `12 >> 2` = 3 |

**Masks.** A mask is an integer built so its 1s mark the positions you care about. `1 << i` has a single 1 at position `i`. `(1 << k) - 1` has 1s at positions 0 to k−1 inclusive, so `(1 << 4) - 1` is `1111`. The single-bit operations below follow from what AND, OR and XOR do to one bit y: `y & 1 == y`, `y & 0 == 0`, `y | 0 == y`, `y | 1 == 1`, `y ^ 0 == y`, `y ^ 1 == not y`.

- **Test** bit i: `(x >> i) & 1`. For 12 and i = 2: `12 >> 2` is `11`, and `11 & 1` is 1, so bit 2 is set. Bit 0 gives 0.
- **Set** bit i: `x | (1 << i)`. The mask is 0 everywhere else, and OR with 0 keeps a bit, so only position i can change. Set bit 0 of 12: `1101` = 13.
- **Clear** bit i: `x & ~(1 << i)`. The inverted mask is 1 everywhere except position i, and AND with 1 keeps a bit. Clear bit 3 of 12: `0100` = 4.
- **Toggle** bit i: `x ^ (1 << i)`. XOR with 0 keeps, XOR with 1 flips. Toggle bit 1 of 12: `1110` = 14.
- **Flip the low k bits**: `x ^ ((1 << k) - 1)`. 12 XOR `1111` is `0011` = 3.

**`n & (n - 1)` clears the lowest set bit.** Look at what subtracting 1 does to 12 = `1100`. The lowest 1 is at position 2. Subtracting 1 has to borrow from it, so position 2 becomes 0 and the 0s below it (positions 0 and 1) become 1s: 11 = `1011`. Everything above position 2 is untouched. So `n` and `n - 1` agree above the lowest 1 and disagree from it downward. AND keeps the agreement and zeroes the rest: `1100 & 1011 = 1000` = 8. That's safe for every n > 0, because every n > 0 has a lowest 1 to borrow from.

Two consequences:

- `n > 0 and n & (n - 1) == 0` means n had exactly one 1, so n is a power of two. 12 gives 8 (not a power), 8 gives `1000 & 0111 = 0` (a power).
- The lowest set bit on its own is `n & -n`. `-n` is `~n + 1`. Flipping turns the trailing 0s of n into 1s, and the +1 carries through them and stops at the lowest 1 of n. So n and −n share exactly one bit. `12 & -12` = `0100` = 4. And `n & (n - 1)` plus `n & -n` add up to n: 8 + 4 = 12.

**XOR cancellation.** Three properties make XOR special:

1. `x ^ x == 0`. Every position matches itself.
2. `x ^ 0 == x`.
3. XOR is commutative and associative, so the order and grouping of a chain don't matter.

So in any chain of XORs, equal values can be moved next to each other and wiped out in pairs. `12 ^ 10 ^ 12` regroups as `(12 ^ 12) ^ 10 = 0 ^ 10 = 10`. What XOR really tracks is **parity per position**: after a chain, bit i is 1 exactly when an odd number of the inputs had bit i set. A value that appears an even number of times contributes nothing. This is also why XOR is its own inverse: `m ^ k ^ k == m`, the basis of every "encrypt and decrypt with the same key" toy.

### Diagram

The operators on the worked example, one column per position. Set bits of the inputs are tinted blue, set bits of each result green:

<figure class="sketch">{% include sketches/dsa-bit-manipulation/and-or-xor.svg %}<figcaption>AND, OR and XOR of a = 12 and b = 10, column by column: 8, 14 and 6.</figcaption></figure>

<figure class="sketch">{% include sketches/dsa-bit-manipulation/shifts.svg %}<figcaption>Shifts of a = 12: a &lt;&lt; 1 = 24 moves every bit up one; a &gt;&gt; 2 = 3 drops positions 1..0.</figcaption></figure>

The lowest-set-bit tricks. In the first figure the dashed amber frame marks the positions that flip when you subtract 1. In the second, −12 is shown as its low 8 bits, and the grey left-hand cell stands for the pattern that continues forever to the left (infinite 0s for 12, infinite 1s for −12):

<figure class="sketch">{% include sketches/dsa-bit-manipulation/clear-lowest-bit.svg %}<figcaption>a &amp; (a − 1): subtracting 1 flips the lowest 1 of 12 (position 2) and everything below it, so AND clears that bit and keeps positions 7..3. Result 8.</figcaption></figure>

<figure class="sketch">{% include sketches/dsa-bit-manipulation/isolate-lowest-bit.svg %}<figcaption>a &amp; −a: −12 is ~a + 1, and it shares exactly one set bit with 12, the lowest one. Result 4.</figcaption></figure>

### Implementation

```python
def get_bit(x: int, i: int) -> int:
    # Shift bit i down to position 0, then keep only position 0.
    # 12 = 0b1100, i = 2: 12 >> 2 = 0b11, 0b11 & 1 = 1.
    return (x >> i) & 1

def set_bit(x: int, i: int) -> int:
    # 1 << i has a single 1 at position i; OR forces position i to 1
    # and leaves every other position of x unchanged (y | 0 == y).
    return x | (1 << i)

def clear_bit(x: int, i: int) -> int:
    # ~(1 << i) is all 1s except a 0 at position i; AND with it forces
    # position i to 0 and keeps every other position (y & 1 == y).
    return x & ~(1 << i)

def toggle_bit(x: int, i: int) -> int:
    # XOR with 1 flips a bit, XOR with 0 keeps it, so only position i flips.
    return x ^ (1 << i)

def low_mask(k: int) -> int:
    # (1 << k) - 1 has 1s at positions 0..k-1 inclusive: k = 4 gives 0b1111.
    return (1 << k) - 1

def clear_lowest_set_bit(x: int) -> int:
    # x - 1 turns the lowest 1 of x into 0 and the 0s below it into 1s;
    # positions above the lowest 1 are identical in x and x - 1,
    # so AND keeps them and zeroes the lowest 1: 12 & 11 = 0b1100 & 0b1011 = 0b1000.
    return x & (x - 1)

def lowest_set_bit(x: int) -> int:
    # -x == ~x + 1 (recalled: two's complement negation). ~x flips everything,
    # + 1 carries through the flipped trailing 0s (now 1s) and stops at the
    # lowest 1 of x, so x and -x share exactly that one bit: 12 & -12 = 4.
    return x & -x

def is_power_of_two(x: int) -> bool:
    # A power of two has exactly one 1, so clearing it leaves 0.
    # x > 0 is required: 0 & -1 == 0 would otherwise pass for x = 0.
    return x > 0 and x & (x - 1) == 0

a, b = 12, 10
print(a & b, a | b, a ^ b, a << 1, a >> 2)               # 8 14 6 24 3
print(get_bit(a, 2), get_bit(a, 0))                      # 1 0
print(set_bit(a, 0), clear_bit(a, 3), toggle_bit(a, 1))  # 13 4 14
print(a ^ low_mask(4))                                   # 3  (flip positions 0..3 of 12)
print(clear_lowest_set_bit(a), lowest_set_bit(a))        # 8 4
print(a ^ b ^ a)                                         # 10 (the two 12s cancel)
print(is_power_of_two(12), is_power_of_two(8), is_power_of_two(0), is_power_of_two(1))
# False True False True
```

I ran this, plus edge cases: `get_bit(0, 5)` is 0, `clear_lowest_set_bit(0)` and `lowest_set_bit(0)` are both 0 (0 has no lowest bit, and both expressions return 0 rather than failing), `toggle_bit(0, 31)` is 2147483648, and `is_power_of_two(-8)` is False while `is_power_of_two(1 << 63)` is True.

Complexity: each operation is O(1) on fixed-width integers. On Python's unbounded ints it's O(w / 30), where w is the bit length, since CPython stores ints in 30-bit digits (recalled). For interview-sized numbers, treat it as O(1). Space O(1).

Python has two built-ins worth knowing: `x.bit_length()` (12 gives 4) and `x.bit_count()`, the number of 1s (12 gives 2, available since Python 3.10, recalled). `bin(x)` and `format(x, "08b")` show the pattern. For negatives they show a minus sign and the magnitude, as the next module covers.

### Recognition

Signals:

- **Pairs cancel, or something appears an odd number of times.** "Every element appears twice except…", "the one that's unmatched". XOR parity. Single Number shows this signal.
- **A known range with one value absent or extra.** When you know in advance which values should be there, you may be able to compare expected against actual without storing either. Missing Number shows this signal.
- **"Count the 1 bits", "reverse the bits", "the i-th bit".** The problem is literally about positions: Number of 1 Bits, Counting Bits, Reverse Bits.
- **"Without using + or −", "without multiplication".** Arithmetic has to be rebuilt from bitwise operators: Sum of Two Integers.
- **O(1) extra space where a hash set would be the obvious answer.** Often a hint that XOR or a bitmask replaces the set.
- **Small n, n ≤ 20 or so, with subsets.** An integer from 0 to 2^n − 1 can encode a subset. That's bitmask DP or enumeration, the same mask mechanics.
- **Powers of two, flags, permissions.** Single-bit tests and `n & (n - 1)`.

When not to use it: when a set or counter says the same thing more clearly and the constraints allow the memory. Bit tricks are also narrower than they look. XOR recovers a value that appears an odd number of times, but it can't tell one occurrence from three, and it can't find two different unmatched values in one pass without extra work.

Nearest look-alikes: **hashing** (Arrays & Hashing) solves most "find the unmatched element" questions in O(n) space. XOR is the O(1)-space version, and it only works because of the parity structure. **Arithmetic identities** (sum of 0..n) compete with XOR on "recover the missing value" questions. They work fine in Python, but in fixed-width languages the sum can overflow and XOR can't.

### Pitfalls

- **Precedence.** Arithmetic binds tighter than shifts, and shifts bind tighter than `&`, `^`, `|`. So `1 << i + 1` is `1 << (i + 1)`: `1 << 2 + 1` is 8. In Python, comparisons bind looser than bitwise operators, so `x & 1 == 0` means `(x & 1) == 0`. In C, Java and JavaScript `==` binds tighter than `&` (recalled), so parenthesise anyway. The code then ports and reads unambiguously.
- **`~` is not `not`.** `~12` is −13, and `~True` is −2. Use `not` for booleans.
- **`n & (n - 1)` and `n & -n` at n = 0.** Both return 0, so a power-of-two test without `n > 0` wrongly accepts 0.
- **Right shift of negatives floors.** `-5 >> 1` is −3, the same as `-5 // 2`, while C-style truncation `int(-5 / 2)` gives −2. Don't mix the two views.
- **Negative shift counts raise.** `1 >> -1` is a `ValueError`, so guard computed shift amounts.
- **Bit positions are 0-indexed from the right.** "The 3rd bit" in a problem statement might mean position 2 or position 3. Pin it down with a tiny example before coding.
- **`bin(x)` has a `0b` prefix**, and for negative x a `-0b` prefix and the magnitude. Counting characters in it for negative numbers counts the wrong thing.

### Active Recall

1. For a = 40 (`101000`), what are `a & -a` and `a & (a - 1)`? What relation between the two results holds for every a > 0?

2. Why does `is_power_of_two` need `x > 0`? What would `x & (x - 1)` alone say about −8?

3. Starting from x = 11 (`1011`), write one expression that clears bit 1 and sets bit 2. What's the result, and does the order of the two steps matter?

4. What is `12 ^ 10 ^ 12 ^ 10 ^ 10`, and why can you get it without evaluating left to right? What would a value that appears three times contribute?

5. In Python, what do `1 << 2 + 1` and `12 & 10 == 8` evaluate to?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied Bit Operations in Python: an integer is a row of positions where position i is worth 2^i, and &, |, ^, ~, << and >> act on every position independently with no carrying. Masks pick out positions (1 << i is one bit, (1 << k) - 1 is the low k bits), so test, set, clear and toggle are (x >> i) & 1, x | (1 << i), x & ~(1 << i) and x ^ (1 << i). n & (n - 1) clears the lowest set bit (subtracting 1 borrows from the lowest 1 and flips everything below it), n & -n isolates it (-n == ~n + 1), and XOR tracks parity per position, so equal values cancel in pairs. Negative numbers are two's complement; Python behaves as if every int had infinitely many leading 0s (non-negative) or 1s (negative).
Worked example from the lesson: a = 12 (1100), b = 10 (1010): a & b = 8, a | b = 14, a ^ b = 6, a << 1 = 24, a >> 2 = 3, 12 & 11 = 8, 12 & -12 = 4, 12 ^ 10 ^ 12 = 10.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. For a = 40 (101000), what are a & -a and a & (a - 1)? What relation between the two results holds for every a > 0?
2. Why does is_power_of_two (x > 0 and x & (x - 1) == 0) need x > 0? What would x & (x - 1) alone say about -8?
3. Starting from x = 11 (1011), write one expression that clears bit 1 and sets bit 2. What's the result, and does the order of the two steps matter?
4. What is 12 ^ 10 ^ 12 ^ 10 ^ 10, and why can you get it without evaluating left to right? What would a value that appears three times contribute?
5. In Python, what do 1 << 2 + 1 and 12 & 10 == 8 evaluate to?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Single Number and Missing Number each make you find a use for XOR cancellation from scratch, and Reverse Bits makes you drive single-bit tests and sets by position yourself, so the list already exercises this module's core. That reasoning happens when you solve them.

### Transfer test

A deduplication service stores a 64-bit "fingerprint" per document, built so that similar documents get fingerprints that differ in only a few bit positions. Two documents count as near-duplicates if their fingerprints differ in at most 3 positions. Given two fingerprints, would you use bit operations to decide? Why?

{% capture coach %}
You are my coding-interview coach. I just learned Bit Operations (an integer is a row of independent switches: AND, OR, XOR and shifts act on every position at once, XOR marks the positions where two values differ, and masks pick out positions). Scenario: A deduplication service stores a 64-bit "fingerprint" per document, built so that similar documents get fingerprints that differ in only a few bit positions. Two documents count as near-duplicates if their fingerprints differ in at most 3 positions. Given two fingerprints, would you use bit operations to decide? Why? (I work in Python.)
Ask me whether I would use Bit Operations here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Fixed-width integers in Python

Why the list needs it: Reverse Bits works on a 32-bit unsigned value, Sum of Two Integers is specified on 32-bit signed integers, and Reverse Integer must detect 32-bit overflow. Python has no 32-bit integers, so you have to build that behaviour yourself.

### Foundation

Imagine every Python integer as a tape of bits that goes on forever to the left: 0s forever for non-negative numbers, 1s forever for negative ones. A 32-bit machine keeps only the rightmost 32 squares of that tape and throws the rest away. Whether those 32 squares are read as unsigned (0 to 2^32 − 1) or signed (−2^31 to 2^31 − 1) is a matter of interpretation. The pattern itself is the same.

So imitating fixed width in Python comes down to two moves: **cut the tape** to 32 squares (a mask), and **choose a reading** (unsigned or signed). Knowing when you must cut is the rest.

### Mechanics

The worked example for this module is **x = −12**, the negative of the previous module's a.

**1. Cut: `x & 0xFFFFFFFF`.** `0xFFFFFFFF` has 1s at positions 0 to 31 inclusive. ANDing keeps those and zeroes everything above, so the result is always between 0 and 2^32 − 1 inclusive. For −12 the tape is `...1111 0100`, and the cut gives `0xFFFFFFF4` = 4294967284, the 32-bit pattern `11111111111111111111111111110100`, which has 29 ones.

**2. Read as signed.** In a 32-bit pattern, position 31 is worth −2^31 instead of +2^31, so a pattern with bit 31 set reads as its unsigned value minus 2^32. 4294967284 − 4294967296 = −12. If bit 31 is 0 (unsigned value 0 to 2^31 − 1 inclusive), the signed and unsigned readings agree. An equivalent one-liner is `(u ^ 0x80000000) - 0x80000000`.

**3. When the cut can wait, and when it can't.** This is the invariant that matters: **for `+`, `-`, `*`, `&`, `|`, `^`, `~` and `<<`, the low 32 bits of the result depend only on the low 32 bits of the inputs.** Carries and shifts only move information upward, never down. So for a chain of those operations, cutting once at the end gives the same bits as cutting after every step (I checked this on 20,000 random pairs per operator). The other side:

- **`>>` pulls high bits down**, so cutting after is wrong. `(-12 >> 1) & 0xFFFFFFFF` is `0xFFFFFFFA` (arithmetic shift, sign bits come in), while `(-12 & 0xFFFFFFFF) >> 1` is `0x7FFFFFFA` (logical shift, 0s come in). They differ. Cut before a right shift whenever you want the unsigned, logical behaviour.
- **Comparisons, division, `%` and loop conditions** look at the whole number, so cut (and reinterpret) before them.
- **Growth.** Even where cutting late is correct, the intermediate numbers keep growing. That costs time and memory, so in loops you usually cut every iteration anyway.

**4. Overflow.** A signed 32-bit result is valid only if it lies between −2^31 and 2^31 − 1 inclusive. Python computes the true result, so you can check after the fact: `INT32_MIN <= r <= INT32_MAX`. In a language where the result itself would already have wrapped, you check before computing, rearranged so the check can't overflow. For `a + b` with b > 0, `a + b > INT32_MAX` is the same as `a > INT32_MAX - b`, and `INT32_MAX - b` is in range. What wrapping looks like: 2,000,000,000 + 2,000,000,000 is 4,000,000,000 in Python, but read as 32-bit signed it's −294967296.

**5. Loops that never end.** `while n: n >>= 1` terminates for n ≥ 0, but for n = −12 the values are −12, −6, −3, −2, −1, −1, −1, and so on. An arithmetic shift of −1 is −1 forever. Either cut first (then n reaches 0 within 32 shifts) or loop a fixed 32 times.

### Diagram

The two readings of the same 32-bit pattern. Amber rows have bit 31 set, which is exactly where the two readings part ways:

<figure class="sketch">{% include sketches/dsa-bit-manipulation/two-readings.svg %}<figcaption>One pattern, two readings. Below 0x80000000 unsigned and signed agree; from there on the signed value is the unsigned one minus 2^32.</figcaption></figure>

And the cut on the worked example. Python's −12 is the infinite tape, and the mask keeps positions 0..31. Set bits are tinted blue in −12, violet in the mask and green in the result; ⋯ stands for positions 28..4, all 1s in every row:

<figure class="sketch">{% include sketches/dsa-bit-manipulation/mask-32.svg %}<figcaption>Masking −12 with 0xFFFFFFFF: everything above position 31 is cut away, leaving 0xFFFFFFF4 = 4294967284.</figcaption></figure>

### Implementation

```python
MASK32 = 0xFFFFFFFF          # 1s at positions 0..31 inclusive, i.e. 2**32 - 1
SIGN32 = 0x80000000          # the single bit at position 31, i.e. 2**31
INT32_MAX = 2**31 - 1        # 2147483647
INT32_MIN = -(2**31)         # -2147483648

def to_u32(x: int) -> int:
    # Keep positions 0..31 of x. For x = -12, Python treats x as having
    # infinitely many leading 1s (recalled: Python's bitwise ops act on an
    # infinite two's complement), so the result is 0xFFFFFFF4 = 4294967284.
    return x & MASK32

def to_i32(u: int) -> int:
    # Read a 32-bit pattern as signed. If position 31 is 1, the pattern stands
    # for u - 2**32: 0xFFFFFFF4 -> 4294967284 - 4294967296 = -12.
    # If position 31 is 0 (u in 0..2**31 - 1 inclusive), u already equals its
    # signed value: 0x0000000C -> 12.
    u &= MASK32
    return u - (1 << 32) if u & SIGN32 else u

def lsr32(x: int, k: int) -> int:
    # Logical shift right on 32 bits: mask first so the leading 1s of a negative
    # x become a finite 32-bit pattern, then shift zeros in from the left.
    # -12 -> 0xFFFFFFF4 >> 1 = 0x7FFFFFFA. Plain -12 >> 1 would give -6.
    return to_u32(x) >> k

def bits32(x: int) -> str:
    # format(-12, '032b') prints '-000...1100' (a sign plus the magnitude),
    # so mask first to see the real 32-bit pattern.
    return format(to_u32(x), "032b")

def fits_i32(r: int) -> bool:
    # Python never overflows, so the range check can be done after computing r.
    return INT32_MIN <= r <= INT32_MAX

def add_overflows_i32(a: int, b: int) -> bool:
    # For languages that CAN'T hold a + b: check before adding, using a
    # subtraction that stays in range. With b > 0, a + b > INT32_MAX exactly when
    # a > INT32_MAX - b (and INT32_MAX - b is in range because 1 <= b <= INT32_MAX).
    # With b < 0, a + b < INT32_MIN exactly when a < INT32_MIN - b
    # (INT32_MIN - b is in range because INT32_MIN <= b <= -1).
    # With b == 0, a + b == a, which is already in range.
    if b > 0:
        return a > INT32_MAX - b
    if b < 0:
        return a < INT32_MIN - b
    return False

x = -12
print(to_u32(x), hex(to_u32(x)))                # 4294967284 0xfffffff4
print(bits32(x))                                 # 11111111111111111111111111110100
print(to_i32(to_u32(x)), to_i32(12))             # -12 12
print(x >> 1, lsr32(x, 1), hex(lsr32(x, 1)))     # -6 2147483642 0x7ffffffa
print(hex(to_u32(~12)))                          # 0xfffffff3
print(12 << 29, to_i32(12 << 29))                # 6442450944 -2147483648
print(fits_i32(12 << 29), fits_i32(-12))         # False True
print(add_overflows_i32(INT32_MAX, 1), add_overflows_i32(INT32_MIN, -1))   # True True
print(add_overflows_i32(INT32_MAX, -1), add_overflows_i32(-12, 0))         # False False
```

Checked beyond the example: `to_i32(0)` is 0, `to_i32(0xFFFFFFFF)` is −1, `to_i32(0x80000000)` is −2147483648, `lsr32(-1, 31)` is 1. On 100,000 random pairs of 32-bit signed values, `add_overflows_i32(a, b)` agreed with `not fits_i32(a + b)` every time, and `to_i32(to_u32(a)) == a` always held.

The `12 << 29` line is worth a second look. 12 is `1100`, so shifting by 29 puts its two 1s at positions 31 and 32. The cut drops position 32 and keeps position 31, the sign bit, so a positive 12 shifted left becomes INT32_MIN. That's exactly what a 32-bit machine would do.

Complexity: every helper is O(1) time and O(1) space for inputs that fit in a few machine words.

### Recognition

Signals:

- The statement says **"32-bit signed integer"**, **"unsigned integer"** or **"assume the environment cannot store 64-bit integers"**, or gives a range like −2^31 ≤ x ≤ 2^31 − 1. In this list: Reverse Bits, Sum of Two Integers, Reverse Integer.
- The expected output for a negative input is a large positive number, or vice versa. The problem is reading a pattern under the other interpretation.
- You're porting code from C, Java or Go that relies on wraparound: hashes, random number generators, checksums.
- An operation lets a carry or a set bit travel upward forever. With a negative operand in Python, "forever" is literal, so a loop that expects the value to hit 0 may never stop.

When not to use it: if the problem only involves non-negative values that stay far below 2^31 and no right shifts or wraparound are needed, masking is noise. Python's unbounded ints are then an advantage, not a problem.

Nearest look-alike: **modular arithmetic** (`% MOD` in DP counting problems). Masking with 2^32 − 1 is exactly `% 2**32` for non-negative results, and Python's `%` also returns a non-negative result for negative inputs (recalled). But `MOD = 10**9 + 7` problems never need the signed reading, and bit problems usually do.

### Pitfalls

- **`bin(-12)` is `'-0b1100'`**, and `format(-12, '032b')` is a minus sign followed by the zero-padded magnitude. Neither shows two's complement. Mask first.
- **Counting 1s of a negative number counts the magnitude.** `bin(-12).count('1')` is 2, while the 32-bit pattern has 29 ones.
- **Forgetting to convert back.** A function that should return a signed 32-bit value but returns `to_u32(...)` hands back 4294967284 instead of −12.
- **Cutting after a right shift.** `(x >> k) & MASK32` is not a logical shift for negative x. Use `(x & MASK32) >> k`.
- **Infinite loops on negatives.** `while n:` with `n >>= 1` never reaches 0 for n < 0. Anything that loops until a carry dies out has the same risk.
- **Off-by-one on the range.** The signed range is −2^31 to 2^31 − 1 inclusive, which isn't symmetric. The magnitude 2^31 exists only as a negative.

### Active Recall

1. What do `to_i32(0x80000000)` and `to_i32(12 << 29)` return, and why are they the same?

2. Trace `while n: n >>= 1` for n = −12. What goes wrong, and give two fixes.

3. `bin(-12).count('1')` gives 2. How many 1s does −12 have as a 32-bit pattern, and how would you compute it in Python?

4. You want the upper 16 bits of the 32-bit wrapped product of a = 0x10000 and b = 0x10001. Should you mask before or after the `>> 16`? What does each order give?

5. Is `a + b > INT32_MAX` a valid overflow check in Python? Would it be in Java?

Answer out loud or on paper first.

{% capture coach %}
You are my coding-interview coach. I just studied fixed-width integers in Python: Python ints are unbounded, like a tape of bits with infinite leading 0s (non-negative) or 1s (negative), so a 32-bit value has to be imitated in two moves. Cut the tape with x & 0xFFFFFFFF (always 0 to 2^32 - 1), then choose a reading: signed means a pattern with bit 31 set stands for its unsigned value minus 2^32. For +, -, *, &, |, ^, ~ and << the low 32 bits of the result depend only on the low 32 bits of the inputs, so the cut can wait until the end; >> pulls high bits down, and comparisons, division, % and loop conditions look at the whole number, so cut before those. Overflow means the true result lies outside -2^31 to 2^31 - 1 inclusive; in Python you can check after computing, in fixed-width languages you check before.
Worked example from the lesson: x = -12. -12 & 0xFFFFFFFF = 0xFFFFFFF4 = 4294967284 (29 ones in 32 bits), read back as signed it is -12. -12 >> 1 = -6, but (-12 & 0xFFFFFFFF) >> 1 = 0x7FFFFFFA. 12 << 29 = 6442450944, which cut to 32 bits and read as signed is -2147483648.
Quiz me with the questions below, one at a time. After each, wait for my answer. If I'm right, confirm briefly and add any nuance I missed. If I'm wrong or incomplete, correct me with a short explanation before moving on. Never show an answer before I've attempted it.
1. What do to_i32(0x80000000) and to_i32(12 << 29) return (to_i32 masks to 32 bits and reads the result as signed), and why are they the same?
2. Trace while n: n >>= 1 for n = -12. What goes wrong, and give two fixes.
3. bin(-12).count('1') gives 2. How many 1s does -12 have as a 32-bit pattern, and how would you compute it in Python?
4. You want the upper 16 bits of the 32-bit wrapped product of a = 0x10000 and b = 0x10001. Should you mask before or after the >> 16? What does each order give?
5. Is a + b > INT32_MAX a valid overflow check in Python? Would it be in Java?
{% endcapture %}
{% include coach.html prompt=coach label="Answer these yourself, then get them checked by" %}

### Mini-task

Skipped. Sum of Two Integers makes you work out, in Python, when and where the 32-bit cut and the signed reading have to happen for your own loop, which is this module's core applied from scratch. That reasoning belongs in its own solve.

### Transfer test

You're porting a 32-bit FNV-1a hash from C to Python. Per input byte it does `h ^= byte`, then `h *= 16777619`, and C's `uint32_t` wraps silently. Your Python port does a single `& 0xFFFFFFFF` on the return value. It matches the C output on every test string, but it gets slower and slower on long inputs. Is the end-only mask a bug, a performance problem, or both? Where would you put the cut, and why?

{% capture coach %}
You are my coding-interview coach. I just learned how to imitate fixed-width integers in Python (cut the unbounded int to 32 bits with & 0xFFFFFFFF, then choose an unsigned or signed reading; for +, -, *, &, |, ^, ~ and << the cut can wait until the end, for >>, comparisons and loop conditions it can't). Scenario: You're porting a 32-bit FNV-1a hash from C to Python. Per input byte it does h ^= byte, then h *= 16777619, and C's uint32_t wraps silently. Your Python port does a single & 0xFFFFFFFF on the return value. It matches the C output on every test string, but it gets slower and slower on long inputs. Is the end-only mask a bug, a performance problem, or both? Where would you put the cut, and why?
Ask me whether I would use this end-only cut here and why, and wait for my answer. Then tell me whether my reasoning holds, what I missed, and what you would use instead if it doesn't fit.
{% endcapture %}
{% include coach.html prompt=coach label="Decide, then get a second opinion from" %}

## Integration

Bit Operations gives you the vocabulary: per-position rules, masks, `n & (n - 1)`, `n & -n`, XOR parity. The fixed-width module gives you the ground those operations run on in the problems as written. A statement that says "32-bit" is describing a machine that cuts the tape at position 31, and in Python you have to do that cut yourself, in the right place. Almost every problem in this topic is one identity from the first module, plus possibly one decision from the second.

Distinguishing competing approaches:

- **XOR vs hash set vs arithmetic total**, for "find the unmatched or missing value". A hash set is O(n) space and handles any multiplicity. An arithmetic total (sum and subtract) is O(1) space but can overflow in fixed-width languages. XOR is O(1) space, can't overflow, and needs a parity structure: whatever you want cancelled has to appear an even number of times.
- **Walk all w positions vs jump from 1 to 1.** A `for i in range(32)` loop with `(x >> i) & 1` is O(w), sees every position including the 0s, and runs a predictable number of times. Repeatedly taking `x & -x` and then `x &= x - 1` jumps straight from one set bit to the next, so it's O(number of set bits) but never looks at a 0. Choose based on whether the 0 positions matter to you.
- **Bit reasoning vs arithmetic reasoning.** Reverse Integer is about decimal digits and 32-bit range, not bit positions. It lives here because of the fixed-width module, not the first one. If the statement talks about digits, think `% 10` and `// 10`. If it talks about bits, think masks and shifts.
- **Bit tricks vs DP.** When a question asks for some bit property of every number in 0..n, per-number work is the fallback. That 1-D DP comes right before this topic in the topic map is a reminder to ask whether one number's answer can be reused for another.

Recognition checklist for an unfamiliar problem:

1. Does the statement say "without +/−", "O(1) extra space", "every element appears twice / k times except"? Think XOR, or per-bit counting.
2. Is it about positions: the i-th bit, counting 1s, reversing, powers of two? Write the numbers in binary for n = 0..8 and look at which positions change.
3. Is there a set of at most about 20 items? A mask from 0 to 2^n − 1 can stand for a subset.
4. Does it name a width (32-bit, unsigned, "cannot store 64-bit")? Decide up front where you'll cut with `& 0xFFFFFFFF`, where you'll read as signed, and whether any right shift or loop condition sees a negative number.
5. Can the answer go out of range? Know the inclusive range −2^31 to 2^31 − 1, and whether you're allowed to compute first and check after.

## The problems

Run each through the solving cycle from [Part 1](/blogs/dsa-the-method/): a 15-minute struggle, a key sentence, spaced repetition. For bit manipulation the struggle is concrete. Write small inputs in binary on paper, ask which identity (XOR cancel, `n & (n - 1)`, single-bit mask) matches what changes, and ask whether the problem assumes 32 bits before you write a loop.

| # | Problem |
| --- | --- |
| 1 | [Single Number](https://leetcode.com/problems/single-number/) |
| 2 | [Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/) |
| 3 | [Counting Bits](https://leetcode.com/problems/counting-bits/) |
| 4 | [Reverse Bits](https://leetcode.com/problems/reverse-bits/) |
| 5 | [Missing Number](https://leetcode.com/problems/missing-number/) |
| 6 | [Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers/) |
| 7 | [Reverse Integer](https://leetcode.com/problems/reverse-integer/) |

## Take this lesson as a live session

To go through this lesson interactively, with a coach that teaches each module, stops at every checkpoint and waits for your answers, open this prompt; it's the one this post was written from, already filled in for bit manipulation.

{% capture coach %}
[TOPIC]: Bit Manipulation
[PREREQUISITES]: Bit Operations
[PROBLEM LIST]: Single Number, Number of 1 Bits, Counting Bits, Reverse Bits, Missing Number, Sum of Two Integers, Reverse Integer
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
