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

const search = ref('')
const activeTags = ref<Set<string>>(new Set())
const filtersExpanded = ref(false)
const showScrollTop = ref(false)

const allTags = computed(() => {
  const tags = new Set<string>()
  for (const project of projects.value || []) {
    for (const tag of project.tags) {
      tags.add(tag)
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b))
})

const toggleTag = (tag: string) => {
  const next = new Set(activeTags.value)
  if (next.has(tag)) {
    next.delete(tag)
  } else {
    next.add(tag)
  }
  activeTags.value = next
}

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
  return hasActiveFilters.value ? `${shown} of ${total}` : `${total}`
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  const onScroll = () => {
    showScrollTop.value = window.scrollY > 400
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })
})
</script>

<template>
  <div class="projects-page">
    <div class="projects-page__container">
      <!-- Layout: sidebar + grid -->
      <div class="projects-page__layout">
        <!-- Sidebar -->
        <aside class="projects-page__sidebar">
          <div class="sidebar-card">
            <div class="sidebar-header">
              <h1 class="sidebar-title">
                All <span>Projects</span>
              </h1>
              <p class="sidebar-subtitle">
                Browse the full catalog — search by name or filter by technology.
              </p>
            </div>

            <!-- Mobile toggle for filters -->
            <button
              class="filters-toggle"
              :aria-expanded="filtersExpanded"
              aria-label="Toggle search and filters"
              @click="filtersExpanded = !filtersExpanded"
            >
              <span class="filters-toggle__line" />
              <span class="filters-toggle__label">Search / Filters</span>
              <svg
                class="filters-toggle__chevron"
                :class="{ 'filters-toggle__chevron--up': filtersExpanded }"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span class="filters-toggle__line" />
            </button>

            <!-- Filters content -->
            <div class="filters-content" :class="{ 'filters-content--expanded': filtersExpanded }">
              <div class="sidebar-section">
                <label class="sidebar-label">Search</label>
                <div class="search-bar">
                  <svg
                    class="search-bar__icon"
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
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    v-model="search"
                    type="text"
                    class="search-bar__input"
                    placeholder="Search projects..."
                  />
                </div>
              </div>

              <div v-if="allTags.length" class="sidebar-section">
                <label class="sidebar-label">Filter by tag</label>
                <div class="tag-filters">
                  <button
                    v-for="tag in allTags"
                    :key="tag"
                    :class="['tag-pill', { 'tag-pill--active': activeTags.has(tag) }]"
                    @click="toggleTag(tag)"
                  >
                    {{ tag }}
                  </button>
                </div>
              </div>

              <div class="sidebar-footer">
                <span class="result-count">{{ resultCount }} projects</span>
                <button
                  v-if="hasActiveFilters"
                  class="clear-filters"
                  @click="clearFilters"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main content -->
        <div class="projects-page__main">
          <div v-if="filteredProjects.length" class="projects-page__grid">
            <ProjectCard
              v-for="project in filteredProjects"
              :key="project.id"
              :project="project"
            />
          </div>

          <div v-else class="projects-page__empty">
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
.projects-page {
  padding: var(--space-12, 3rem) var(--space-6);
  min-height: 60vh;
}

.projects-page__container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Sidebar header */
.sidebar-header {
  padding-bottom: var(--space-5, 1.25rem);
  border-bottom: 1px solid var(--border);
}

@media (max-width: 1023px) {
  .sidebar-header {
    padding-bottom: 0;
    border-bottom: none;
  }
}

.sidebar-title {
  font-size: clamp(1.5rem, 2.5vw, 1.875rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-2, 0.5rem);
}

.sidebar-title span {
  color: var(--accent);
}

.sidebar-subtitle {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  line-height: 1.5;
  margin: 0;
}

/* Layout */
.projects-page__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8, 2rem);
}

@media (min-width: 1024px) {
  .projects-page__layout {
    grid-template-columns: 320px 1fr;
  }
}

/* Sidebar */
.projects-page__sidebar {
  min-width: 0;
}

@media (max-width: 1023px) {
  .projects-page__sidebar {
    position: sticky;
    top: 2.5rem;
    z-index: 5;
    background: var(--background);
    margin: 0 calc(-1 * var(--space-6));
    padding: var(--space-4, 1rem) var(--space-6) 0;
  }

  .projects-page__sidebar::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1.5rem;
    height: 1.5rem;
    background: linear-gradient(to bottom, var(--background), transparent);
    pointer-events: none;
  }
}

.sidebar-card {
  display: flex;
  flex-direction: column;
  gap: 0;
}

@media (min-width: 1024px) {
  .sidebar-card {
    gap: var(--space-6, 1.5rem);
  }
}

@media (min-width: 1024px) {
  .sidebar-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-6, 1.5rem) var(--space-8, 2rem);
    position: sticky;
    top: 6.5rem;
  }
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.sidebar-label {
  font-size: var(--text-xs, 0.75rem);
  font-family: var(--font-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-4, 1rem);
  border-top: 1px solid var(--border);
}

.result-count {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
}

/* Mobile filters toggle */
.filters-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  width: 100%;
  margin-top: var(--space-6, 1.5rem);
  margin-bottom: var(--space-2, 0.5rem);
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted-foreground);
  transition: color 0.2s ease;
}

.filters-toggle:hover {
  color: var(--foreground);
}

.filters-toggle__line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.filters-toggle__label {
  font-size: var(--text-xs, 0.75rem);
  font-family: var(--font-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.filters-toggle__chevron {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.filters-toggle__chevron--up {
  transform: rotate(180deg);
}

@media (min-width: 1024px) {
  .filters-toggle {
    display: none;
  }
}

/* Filters content - collapsible on mobile */
.filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
}

@media (max-width: 1023px) {
  .filters-content {
    display: none;
  }

  .filters-content--expanded {
    display: flex;
    background: var(--background);
    padding: var(--space-4) 0;
  }
}

/* Search */
.search-bar {
  position: relative;
}

.search-bar__icon {
  position: absolute;
  left: var(--space-3, 0.75rem);
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-foreground);
  pointer-events: none;
}

.search-bar__input {
  width: 100%;
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem) var(--space-2, 0.5rem) calc(var(--space-3, 0.75rem) + 24px);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-bar__input::placeholder {
  color: var(--muted-foreground);
}

.search-bar__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent), transparent 80%);
}

/* Tags */
.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
}

.tag-pill {
  font-size: var(--text-xs, 0.75rem);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-pill:hover {
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
  color: var(--foreground);
}

.tag-pill--active {
  background: var(--accent);
  color: var(--accent-foreground);
  border-color: var(--accent);
}

.tag-pill--active:hover {
  background: color-mix(in srgb, var(--accent), #000 10%);
  border-color: color-mix(in srgb, var(--accent), #000 10%);
  color: var(--accent-foreground);
}

.clear-filters {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.clear-filters:hover {
  color: var(--accent);
}

/* Main / Grid */
.projects-page__main {
  min-width: 0;
}

.projects-page__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-6, 1.5rem);
}

@media (min-width: 768px) and (max-width: 1023px) {
  .projects-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .projects-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Empty state */
.projects-page__empty {
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
