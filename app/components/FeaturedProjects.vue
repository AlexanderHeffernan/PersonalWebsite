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
        <div>
          <h2 class="projects__title">
            Featured <span>Projects</span>
          </h2>
          <p class="projects__subtitle">
            Work I'm proud of—from experiments to production launches.
          </p>
        </div>
        <NuxtLink to="/projects" class="projects__view-all">
          View All
          <svg
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>

      <div class="projects__grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects {
  padding: var(--space-24, 6rem) var(--space-6);
  border-top: 1px solid var(--border);
  background-color: var(--muted);
}

.projects__container {
  max-width: 1200px;
  margin: 0 auto;
}

.projects__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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
  margin: var(--space-4, 1rem) 0 0;
}

.projects__view-all {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--muted-foreground);
  white-space: nowrap;
  padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: color 0.2s ease, border-color 0.2s ease;
  margin-top: var(--space-2, 0.5rem);
}

.projects__view-all:hover {
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
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

@media (max-width: 640px) {
  .projects__header {
    flex-direction: column;
  }
}
</style>
