<script setup lang="ts">
const isLight = ref(false);
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink to="/" class="site-header__brand">
        Alexander Heffernan
      </NuxtLink>
      <nav class="site-header__nav" aria-label="Primary">
        <NuxtLink to="/#projects">Projects</NuxtLink>
        <NuxtLink to="/#about">About</NuxtLink>
        <NuxtLink to="/#writing">Blog</NuxtLink>
        <NuxtLink to="/#contact">Contact</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--background), transparent 10%);
  backdrop-filter: blur(10px);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-4) var(--space-6);
}

.site-header__brand {
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.01em;
}

.site-header__nav {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.site-header__toggle {
  border: none;
  background: transparent;
  color: var(--foreground);
  border-radius: 999px;
  padding: var(--space-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.site-header__toggle:hover {
  color: var(--accent);
}

.site-header__toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.site-header__toggle-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

@media (max-width: 720px) {
  .site-header__inner {
    flex-wrap: wrap;
    justify-content: center;
  }

  .site-header__nav {
    order: 3;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
