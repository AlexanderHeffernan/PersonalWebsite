<script setup lang="ts">
interface Project {
  id: number
  slug: string
  title: string
  description: string
  tags: string[]
}

defineProps<{
  project: Project
}>()
</script>

<template>
  <NuxtLink
    :to="`/projects/${project.slug}`"
    class="project-card"
  >
    <div class="project-card__content">
      <div class="project-card__header">
        <h3 class="project-card__title">
          {{ project.title }}
        </h3>
        <svg
          class="project-card__icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>

      <p class="project-card__description">
        {{ project.description }}
      </p>

      <div class="project-card__tags">
        <span
          v-for="tag in project.tags"
          :key="tag"
          class="project-card__tag"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.project-card {
  display: block;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6, 1.5rem);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
  box-shadow: 0 10px 40px -10px color-mix(in srgb, var(--accent), transparent 90%);
}

.project-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.project-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4, 1rem);
}

.project-card__title {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
  transition: color 0.2s ease;
}

.project-card:hover .project-card__title {
  color: var(--accent);
}

.project-card__icon {
  flex-shrink: 0;
  color: var(--muted-foreground);
  transition: color 0.2s ease;
}

.project-card:hover .project-card__icon {
  color: var(--accent);
}

.project-card__description {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  line-height: 1.6;
  margin: 0;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
}

.project-card__tag {
  font-size: var(--text-xs, 0.75rem);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 0.25rem);
}
</style>
