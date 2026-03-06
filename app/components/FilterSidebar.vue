<script setup lang="ts">
const props = defineProps<{
  title: string
  titleAccent: string
  subtitle: string
  allTags: string[]
  resultCount: string
  hasActiveFilters: boolean
}>()

const search = defineModel<string>('search', { required: true })
const activeTags = defineModel<Set<string>>('activeTags', { required: true })

const emit = defineEmits<{
  clearFilters: []
}>()

const filtersExpanded = ref(false)

const toggleTag = (tag: string) => {
  const next = new Set(activeTags.value)
  if (next.has(tag)) {
    next.delete(tag)
  } else {
    next.add(tag)
  }
  activeTags.value = next
}
</script>

<template>
  <aside class="filter-sidebar">
    <div class="sidebar-card">
      <div class="sidebar-header">
        <h1 class="sidebar-title">
          {{ title }} <span>{{ titleAccent }}</span>
        </h1>
        <p class="sidebar-subtitle">
          {{ subtitle }}
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
              :placeholder="`Search ${titleAccent.toLowerCase()}...`"
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
          <span class="result-count">{{ resultCount }}</span>
          <button
            v-if="hasActiveFilters"
            class="clear-filters"
            @click="emit('clearFilters')"
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.filter-sidebar {
  min-width: 0;
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
  margin: 0;
}

.sidebar-title span {
  color: var(--accent);
}

.sidebar-subtitle {
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  margin: var(--space-2, 0.5rem) 0 0;
}

.sidebar-card {
  display: flex;
  flex-direction: column;
  gap: 0;
}

@media (min-width: 1024px) {
  .sidebar-card {
    gap: var(--space-6, 1.5rem);
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
</style>
