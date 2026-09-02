<template>
  <footer class="site-footer">
    <div class="container footer-content">
      <nav aria-label="Footer navigation">
        <a href="https://github.com/Arceoavs/papsolver">GitHub</a>
        <a href="mailto:info@vgr.best">Mail</a>
        <RouterLink :to="{ name: 'imprint' }">Imprint</RouterLink>
        <RouterLink :to="{ name: 'privacy' }">Privacy</RouterLink>
      </nav>
      <span>&copy; {{ new Date().getFullYear() }} Arnold Arz</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
