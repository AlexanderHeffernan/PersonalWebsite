<script setup lang="ts">
const route = useRoute()

const navItems = [
  { path: '/admin/projects', label: 'Projects', icon: 'folder' },
  { path: '/admin/experience', label: 'Experience', icon: 'briefcase' },
  { path: '/admin/education', label: 'Education', icon: 'graduation-cap' },
  { path: '/admin/writing', label: 'Writing', icon: 'pen' },
  { path: '/admin/about', label: 'About', icon: 'user' },
]

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar__content">
        <div class="admin-sidebar__header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="admin-sidebar__icon">
            <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          <h2 class="admin-sidebar__title">Admin CMS</h2>
        </div>

        <nav class="admin-nav">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="['admin-nav__item', { 'admin-nav__item--active': isActive(item.path) }]"
          >
            <svg v-if="item.icon === 'folder'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>
            </svg>
            <svg v-else-if="item.icon === 'briefcase'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <svg v-else-if="item.icon === 'graduation-cap'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <svg v-else-if="item.icon === 'pen'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
            </svg>
            <svg v-else-if="item.icon === 'user'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <div class="admin-sidebar__footer">
        <button class="admin-nav__item" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--background);
  display: flex;
}

.admin-sidebar {
  width: 256px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.admin-sidebar__content {
  flex: 1;
  padding: var(--space-6);
}

.admin-sidebar__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}

.admin-sidebar__icon {
  color: var(--accent);
}

.admin-sidebar__title {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.admin-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--muted-foreground);
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.2s ease, color 0.2s ease;
}

.admin-nav__item:hover {
  background: var(--secondary);
  color: var(--foreground);
}

.admin-nav__item--active {
  background: var(--accent);
  color: var(--accent-foreground);
}

.admin-nav__item--active:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}

.admin-sidebar__footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border);
}

.admin-main {
  flex: 1;
  margin-left: 256px;
  padding: var(--space-8);
}
</style>
