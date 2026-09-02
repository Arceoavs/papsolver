<template>
  <section class="content-page container narrow">
    <p class="eyebrow">How it works</p>
    <h1>From an awkward remainder to an exact shopping list.</h1>

    <article class="panel prose solver-explainer">
      <h2>Why?</h2>
      <p>
        Apple asks you to spend any remaining Apple Account balance before you
        change your account country or region. That is simple when one item has
        the right price, but a small remainder can turn into a frustrating search
        through combinations of apps and in-app purchases.
      </p>
      <p>
        CentMatch started with that problem. The built-in list covers Germany's
        App Store price points, and the custom-list option makes the same solver
        useful for gift cards, prepaid accounts, budgets, or any other set of
        repeatable prices.
      </p>

      <h2>The problem being solved</h2>
      <p>
        For a target balance <code>B</code> and prices <code>p₁ … pₙ</code>, the
        solver looks for non-negative quantities <code>q₁ … qₙ</code> such that:
      </p>
      <p class="equation" aria-label="The sum of each quantity times its price equals the target balance">
        q₁p₁ + q₂p₂ + … + qₙpₙ = B
      </p>
      <p>
        Among all exact matches, it minimizes <code>q₁ + q₂ + … + qₙ</code>—the
        total number of purchases. If several answers use the same number of
        purchases, the earlier price in your list wins the tie.
      </p>

      <h2>1. Work in the smallest currency unit</h2>
      <p>
        Decimal input is parsed directly into minor units: €6.85 becomes 685
        cents. The solver therefore compares whole numbers and never has to ask
        whether a binary floating-point approximation is “close enough” to the
        requested balance.
      </p>

      <h2>2. Reject impossible cases early</h2>
      <p>
        Prices above the balance cannot appear in a solution, so they are set
        aside. The solver then computes the greatest common divisor of the
        remaining prices. If that divisor does not also divide the target, no
        exact combination can exist. Otherwise, every value is divided by the
        common factor, reducing the amount of work without changing the answer.
      </p>

      <h2>3. Build the best subtotal one step at a time</h2>
      <p>
        The core is an unbounded change-making dynamic program. It starts with a
        known solution for subtotal zero: zero purchases. For each subtotal up to
        the target, it tries appending every allowed price to a smaller reachable
        subtotal and keeps the candidate with the fewest purchases.
      </p>
      <p>
        Another way to picture this is a graph whose nodes are subtotals. Adding
        one price follows an edge to a larger subtotal, and every edge costs one
        purchase. The stored value is the shortest path from zero to that
        subtotal.
      </p>

      <h2>4. Reconstruct the shopping list</h2>
      <p>
        Alongside each best purchase count, the solver remembers which price
        reached that subtotal. Starting at the target and following those choices
        backwards yields the quantity for each selected item. If the target was
        never reached, CentMatch reports that there is no exact match instead of
        returning an approximation.
      </p>

      <h2>Cost and limits</h2>
      <p>
        With <code>n</code> prices and normalized target <code>B′</code>, the
        algorithm uses <code>O(n × B′)</code> time and <code>O(B′)</code> memory.
        This is pseudo-polynomial: the numeric size of the balance matters, not
        only the number of digits used to write it. CentMatch therefore caps a
        request at 1,000 prices and 100,000 minor units, and bounds concurrent
        solver work on the server.
      </p>

      <h2>What CentMatch does not do</h2>
      <p>
        It does not buy anything, inspect your account, rank products, or promise
        that a listed price is currently available. It solves the numbers you
        provide. Check the store before purchasing, and contact Apple Support if
        your remaining credit is below the price of every available item.
      </p>

      <section id="sources" class="sources-section">
        <h2>Sources &amp; further reading</h2>
        <ul>
          <li>
            <a href="https://support.apple.com/en-gb/118283" target="_blank" rel="noreferrer">
              Apple Support: changing an Apple Account country or region
            </a>
            — the original reason for the tool.
          </li>
          <li>
            <a href="https://galva.io/tools/apple-pricing-tiers/region/de" target="_blank" rel="noreferrer">
              Galva's Germany App Store pricing matrix
            </a>
            — source for the bundled price snapshot and common-use notes.
          </li>
          <li>
            <a href="https://xlinux.nist.gov/dads/HTML/dynamicprog.html" target="_blank" rel="noreferrer">
              NIST Dictionary of Algorithms and Data Structures: dynamic programming
            </a>,
            <a href="https://xlinux.nist.gov/dads/HTML/unboundedKnapsack.html" target="_blank" rel="noreferrer">
              unbounded knapsack
            </a>, and the
            <a href="https://xlinux.nist.gov/dads/HTML/greatestCommonDivisor.html" target="_blank" rel="noreferrer">
              greatest common divisor
            </a>.
          </li>
          <li>
            <a href="https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-16-dynamic-programming-part-2-lcs-lis-coins/" target="_blank" rel="noreferrer">
              MIT OpenCourseWare: Dynamic Programming, Part 2—Coins
            </a>
            — a deeper lecture on the technique.
          </li>
          <li>
            <a href="https://github.com/Arceoavs/papsolver/blob/master/solver/internal/solver/solver.go" target="_blank" rel="noreferrer">
              CentMatch's Go solver source
            </a>
            — the implementation described above.
          </li>
        </ul>

        <h3>Image credit</h3>
        <p>
          The mixed-coins photograph used across the site was created by Kili and
          <a href="https://commons.wikimedia.org/wiki/File:Coins.jpg" target="_blank" rel="noreferrer">
            released into the public domain via Wikimedia Commons
          </a>.
        </p>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
useHead({
  title: "How the solver works — CentMatch",
  meta: [
    {
      name: "description",
      content:
        "A detailed explanation of CentMatch's exact change-making dynamic-programming solver.",
    },
  ],
});
</script>
