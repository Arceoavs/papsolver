<template>
  <header class="site-header">
    <nav class="nav container" aria-label="Main navigation">
      <NuxtLink class="brand" to="/" aria-label="PapSolver home">
        <img src="../../assets/logo.svg" alt="" width="34" height="34" />
        <span>PapSolver</span>
      </NuxtLink>

      <div class="nav-links">
        <NuxtLink to="/itunes">iTunes</NuxtLink>
        <NuxtLink to="/general">General</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </div>
    </nav>
  </header>
</template>
