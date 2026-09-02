<template>
  <section class="not-found">
    <div class="container narrow">
      <p class="eyebrow">404</p>
      <h1>This page wandered off.</h1>
      <p>The address does not point to anything here.</p>
      <RouterLink class="button button-primary" :to="{ name: 'home' }">
        Back home
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
