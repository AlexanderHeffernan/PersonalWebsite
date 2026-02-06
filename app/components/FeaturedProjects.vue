<script setup lang="ts">
interface FeaturedProject {
  id: number
  slug: string
  title: string
  description: string
  tags: string[]
  githubUrl: string | null
  liveUrl: string | null
  thumbnail: { url: string; alt: string | null } | null
}

const { data: projects } = await useFetch<FeaturedProject[]>('/api/projects/featured')
</script>

<template>
  <section id="projects" class="projects">
    <div class="projects__container">
      <div class="projects__header">
        <h2 class="projects__title">
          Featured <span>Projects</span>
        </h2>
        <p class="projects__subtitle">
          Selected work demonstrating AI-literate workflows and production-grade engineering.
        </p>
      </div>

      <div class="projects__grid">
        <NuxtLink
          v-for="project in projects"
          :key="project.id"
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
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
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
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects {
  padding: var(--space-24, 6rem) var(--space-6);
  border-top: 1px solid var(--border);
}

.projects__container {
  max-width: 1200px;
  margin: 0 auto;
}

.projects__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
  margin-bottom: var(--space-12, 3rem);
}

.projects__title {
  font-size: clamp(1.875rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin: 0;
}

.projects__title span {
  color: var(--accent);
}

.projects__subtitle {
  color: var(--muted-foreground);
  max-width: 42rem;
  margin: 0;
}

.projects__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-6, 1.5rem);
}

@media (min-width: 768px) {
  .projects__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .projects__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

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
