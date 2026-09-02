<template>
  <div class="app-shell">
    <Navbar />
    <main class="app-main">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import AppFooter from "./components/navigation/Footer.vue";
import Navbar from "./components/navigation/Navbar.vue";
</script>
