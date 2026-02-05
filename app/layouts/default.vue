<template>
  <div class="layout">
    <SiteHeader />
    <div class="layout__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.layout__content {
  padding: 0;
}
</style>
