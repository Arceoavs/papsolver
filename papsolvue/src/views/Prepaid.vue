<template>
  <section class="content-page container narrow">
    <p class="eyebrow">Generic prepaid solver</p>
    <h1>Bring your own price list</h1>
    <div class="panel prose">
      <p>
        This solver is not available yet. The current version supports German App
        Store price points through the iTunes balance solver.
      </p>
      <RouterLink class="button button-primary" :to="{ name: 'itunes' }">
        Open iTunes solver
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
