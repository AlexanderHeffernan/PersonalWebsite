<template>
  <div class="layout">
    <SiteHeader />
    <div class="layout__content">
      <slot />
    </div>
    <footer class="footer">
      <div class="footer__container">
        <div class="footer__content">
          <div class="footer__text">
            © {{ new Date().getFullYear() }} Alexander Heffernan. All rights reserved.
          </div>
          <div class="footer__text">
            Built with quality-first engineering
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout__content {
  padding: 0;
  flex: 1;
}

.footer {
  border-top: 1px solid var(--border);
  background: var(--card);
  opacity: 0.5;
}

.footer__container {
  max-width: var(--max-width-7xl, 80rem);
  margin: 0 auto;
  padding: var(--space-12, 3rem) var(--space-4, 1rem);
}

@media (min-width: 640px) {
  .footer__container {
    padding: var(--space-12, 3rem) var(--space-6, 1.5rem);
  }
}

@media (min-width: 1024px) {
  .footer__container {
    padding: var(--space-12, 3rem) var(--space-8, 2rem);
  }
}

.footer__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4, 1rem);
}

@media (min-width: 768px) {
  .footer__content {
    flex-direction: row;
  }
}

.footer__text {
  font-size: var(--text-sm, 0.875rem);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
}
</style>
