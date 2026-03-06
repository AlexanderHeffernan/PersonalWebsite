<script setup lang="ts">
interface Project {
  id: number
  slug: string
  title: string
  description: string
  githubUrl: string | null
  liveUrl: string | null
  tags: string[]
  createdAt: string
}

const { data: projects } = await useFetch<Project[]>('/api/projects')

useSeoMeta({
  title: 'Projects',
  description: 'Explore software engineering projects by Alexander Heffernan — AI, full-stack development, and quality-first engineering.',
  ogTitle: 'Projects — Alexander Heffernan',
  ogDescription: 'Software engineering projects featuring AI, full-stack development, and quality-first engineering.',
  ogImage: 'https://alexheffernan.dev/headshot.jpeg',
  ogUrl: 'https://alexheffernan.dev/projects',
})

const search = ref('')
const activeTags = ref<Set<string>>(new Set())

const allTags = computed(() => {
  const tags = new Set<string>()
  for (const project of projects.value || []) {
    for (const tag of project.tags) {
      tags.add(tag)
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b))
})

const clearFilters = () => {
  search.value = ''
  activeTags.value = new Set()
}

const filteredProjects = computed(() => {
  let result = projects.value || []

  if (search.value.trim()) {
    const query = search.value.toLowerCase().trim()
    result = result.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (activeTags.value.size > 0) {
    result = result.filter(p =>
      Array.from(activeTags.value).every(tag => p.tags.includes(tag))
    )
  }

  return result
})

const hasActiveFilters = computed(() => {
  return search.value.trim() !== '' || activeTags.value.size > 0
})

const resultCount = computed(() => {
  const total = projects.value?.length || 0
  const shown = filteredProjects.value.length
  return hasActiveFilters.value ? `${shown} of ${total} projects` : `${total} projects`
})
</script>

<template>
  <div class="catalog-page">
    <div class="catalog-page__container">
      <div class="catalog-page__layout">
        <FilterSidebar
          v-model:search="search"
          v-model:active-tags="activeTags"
          title="All"
          title-accent="Projects"
          subtitle="Browse the full catalog — search by name or filter by technology."
          :all-tags="allTags"
          :result-count="resultCount"
          :has-active-filters="hasActiveFilters"
          @clear-filters="clearFilters"
        />

        <div class="catalog-page__main">
          <div v-if="filteredProjects.length" class="catalog-page__grid">
            <ProjectCard
              v-for="project in filteredProjects"
              :key="project.id"
              :project="project"
            />
          </div>

          <div v-else class="catalog-page__empty">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="empty-icon"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p v-if="hasActiveFilters">No projects match your filters.</p>
            <p v-else>No projects yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-page {
  padding: var(--space-12, 3rem) var(--space-6);
  min-height: 60vh;
}

.catalog-page__container {
  max-width: 1200px;
  margin: 0 auto;
}

.catalog-page__layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 2rem);
}

@media (min-width: 1024px) {
  .catalog-page__layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--space-8, 2rem);
  }
}

/* Main / Grid */
.catalog-page__main {
  min-width: 0;
}

.catalog-page__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-6, 1.5rem);
}

@media (min-width: 768px) and (max-width: 1023px) {
  .catalog-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .catalog-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Empty state */
.catalog-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4, 1rem);
  padding: var(--space-16, 4rem) 0;
  color: var(--muted-foreground);
}

.empty-icon {
  opacity: 0.3;
}
</style>
