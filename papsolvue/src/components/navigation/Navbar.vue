<template>
  <header class="site-header">
    <nav class="nav container" aria-label="Main navigation">
      <RouterLink class="brand" :to="{ name: 'home' }" aria-label="PapSolver home">
        <img src="../../assets/logo.svg" alt="" width="34" height="34" />
        <span>PapSolver</span>
      </RouterLink>

      <div class="nav-links">
        <RouterLink :to="{ name: 'itunes' }">iTunes</RouterLink>
        <RouterLink :to="{ name: 'general' }">General</RouterLink>
        <RouterLink :to="{ name: 'about' }">About</RouterLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
