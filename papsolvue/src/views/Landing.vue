<template>
  <section class="hero">
    <div class="container hero-content">
      <p class="eyebrow">Prepaid balance optimizer</p>
      <h1>Spend it exactly.<br />Leave nothing behind.</h1>
      <p class="hero-copy">
        PapSolver finds a combination of available prices that uses your entire
        remaining balance—calculated in integer cents, without rounding surprises.
      </p>
      <div class="hero-actions">
        <RouterLink class="button button-primary" :to="{ name: 'itunes' }">
          Solve an iTunes balance
        </RouterLink>
        <RouterLink class="button button-secondary" :to="{ name: 'about' }">
          How it works
        </RouterLink>
      </div>
      <div class="balance-sequence" aria-label="Example balance reduced to zero">
        <span>€6.85</span><span>€4.56</span><span>€3.27</span><span>€1.98</span><strong>€0.00</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
