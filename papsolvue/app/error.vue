<template>
  <section class="not-found">
    <div class="container narrow">
      <p class="eyebrow">404</p>
      <h1>This page wandered off.</h1>
      <p>The address does not point to anything here.</p>
      <NuxtLink class="button button-primary" to="/">
        Back home
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({ title: "Page not found — PapSolver" });
</script>
