<template>
  <footer class="site-footer">
    <div class="container footer-content">
      <nav aria-label="Footer navigation">
        <a href="https://github.com/Arceoavs/papsolver">GitHub</a>
        <NuxtLink to="/about#sources">Sources</NuxtLink>
        <NuxtLink to="/imprint">Imprint</NuxtLink>
        <NuxtLink to="/privacy">Privacy</NuxtLink>
      </nav>
      <span>&copy; {{ new Date().getFullYear() }} Arnold Arz</span>
    </div>
  </footer>
</template>
