<template>
  <section class="hero">
    <div class="container hero-content">
      <p class="eyebrow">Exact balance matching</p>
      <h1>Make the balance<br />land on zero.</h1>
      <p class="hero-copy">
        Enter what is left, choose the prices you can use, and CentMatch finds
        the shortest shopping list that spends the balance exactly.
      </p>
      <div class="hero-actions">
        <NuxtLink class="button button-primary" to="/solve">
          Match my balance
        </NuxtLink>
        <NuxtLink class="button button-secondary" to="/about">
          How it works
        </NuxtLink>
      </div>
      <div class="balance-sequence" aria-label="Example balance reduced to zero">
        <span>€6.85</span><span>€4.56</span><span>€3.27</span><span>€1.98</span><strong>€0.00</strong>
      </div>
      <p class="hero-note">Inputs are used for the calculation and are not stored.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({ title: "CentMatch — Spend a balance exactly" });
</script>
