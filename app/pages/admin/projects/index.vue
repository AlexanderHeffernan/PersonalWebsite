<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

interface Project {
  id: number
  slug: string
  title: string
  description: string
  featuredOrder: number | null
  createdAt: string
}

const { data: projects, refresh } = await useFetch<Project[]>('/api/admin/projects')

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this project?')) return

  try {
    await $fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    alert('Failed to delete project')
  }
}
</script>

<template>
  <div class="projects-page">
    <div class="projects-header">
      <div>
        <h1 class="projects-title">Manage Projects</h1>
        <p class="projects-subtitle">Add, edit, or remove projects from your portfolio</p>
      </div>
      <NuxtLink to="/admin/projects/new" class="btn btn--primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        New Project
      </NuxtLink>
    </div>

    <div class="projects-list">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-card__content">
          <div class="project-card__header">
            <h3 class="project-card__title">{{ project.title }}</h3>
            <p class="project-card__slug">/{{ project.slug }}</p>
          </div>
          <p class="project-card__description">{{ project.description }}</p>
          <div class="project-card__meta">
            <span v-if="project.featuredOrder" class="project-card__badge">
              Featured #{{ project.featuredOrder }}
            </span>
            <span class="project-card__date">
              Created {{ new Date(project.createdAt).toLocaleDateString() }}
            </span>
          </div>
        </div>
        <div class="project-card__actions">
          <NuxtLink :to="`/admin/projects/${project.id}`" class="action-btn" aria-label="Edit project">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
            </svg>
          </NuxtLink>
          <button class="action-btn action-btn--danger" aria-label="Delete project" @click="handleDelete(project.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="!projects?.length" class="projects-empty">
        <p>No projects yet. Create your first project to get started.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  max-width: 1000px;
}

.projects-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.projects-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.projects-subtitle {
  color: var(--muted-foreground);
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn--primary {
  background: var(--accent);
  color: var(--accent-foreground);
}

.btn--primary:hover {
  background: color-mix(in srgb, var(--accent), #000 10%);
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.project-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.project-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.project-card__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.project-card__title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
}

.project-card__slug {
  font-size: var(--text-sm);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
  margin: 0;
}

.project-card__description {
  color: var(--muted-foreground);
  margin: 0;
  line-height: 1.5;
}

.project-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--muted-foreground);
}

.project-card__badge {
  padding: var(--space-1) var(--space-2);
  background: var(--accent);
  color: var(--accent-foreground);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.project-card__actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  padding: var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: var(--foreground);
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: var(--secondary);
}

.action-btn--danger {
  color: var(--destructive);
}

.action-btn--danger:hover {
  background: color-mix(in srgb, var(--destructive), transparent 90%);
}

.projects-empty {
  text-align: center;
  padding: var(--space-12);
  color: var(--muted-foreground);
}
</style>
