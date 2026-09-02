<template>
  <div class="app-shell">
    <Navbar />
    <main class="app-main">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from "./components/navigation/Footer.vue";
import Navbar from "./components/navigation/Navbar.vue";
</script>
