<template>
  <section class="content-page container narrow">
    <p class="eyebrow">About</p>
    <h1>A tiny tool for an annoyingly specific problem.</h1>

    <div class="panel prose">
      <h2>Why?</h2>
      <p>
        PapSolver began as a way to use the last few euros in an iTunes account
        before changing its store country. Small balances are easy to overlook,
        but they should still be yours to spend.
      </p>

      <h2>How does it work?</h2>
      <p>
        You provide a balance and the price points you can buy. The backend uses
        integer-cent dynamic programming to find an exact sum. It either returns a
        valid purchase combination or tells you clearly that none exists.
      </p>

      <h2>Why integer cents?</h2>
      <p>
        Currency entered as text is converted directly to cents. Avoiding binary
        floating-point arithmetic prevents values such as €6.85 from being rounded
        incorrectly on their way to the solver.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({ title: "About — PapSolver" });
</script>
