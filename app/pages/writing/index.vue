<script setup lang="ts">
interface WritingPost {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  tags: string[]
}

const { data: posts } = await useFetch<WritingPost[]>('/api/writing')

useSeoMeta({
  title: 'Writing',
  description: 'Articles and insights on software engineering, AI, and building quality systems by Alexander Heffernan.',
  ogTitle: 'Writing — Alexander Heffernan',
  ogDescription: 'Articles and insights on software engineering, AI, and building quality systems.',
  ogImage: 'https://alexheffernan.dev/headshot.jpeg',
  ogUrl: 'https://alexheffernan.dev/writing',
})

const search = ref('')
const activeTags = ref<Set<string>>(new Set())

const allTags = computed(() => {
  const tags = new Set<string>()
  for (const post of posts.value || []) {
    for (const tag of post.tags) {
      tags.add(tag)
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b))
})

const clearFilters = () => {
  search.value = ''
  activeTags.value = new Set()
}

const filteredPosts = computed(() => {
  let result = posts.value || []

  if (search.value.trim()) {
    const query = search.value.toLowerCase().trim()
    result = result.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.excerpt.toLowerCase().includes(query) ||
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
  const total = posts.value?.length || 0
  const shown = filteredPosts.value.length
  return hasActiveFilters.value ? `${shown} of ${total} articles` : `${total} articles`
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="catalog-page">
    <div class="catalog-page__container">
      <div class="catalog-page__layout">
        <FilterSidebar
          v-model:search="search"
          v-model:active-tags="activeTags"
          title="All"
          title-accent="Writing"
          subtitle="Browse all articles — search by topic or filter by tag."
          :all-tags="allTags"
          :result-count="resultCount"
          :has-active-filters="hasActiveFilters"
          @clear-filters="clearFilters"
        />

        <div class="catalog-page__main">
          <div v-if="filteredPosts.length" class="writing-list">
            <NuxtLink
              v-for="post in filteredPosts"
              :key="post.id"
              :to="`/writing/${post.slug}`"
              class="writing-card"
            >
              <div class="writing-card__content">
                <div class="writing-card__heading">
                  <h3 class="writing-card__title">
                    {{ post.title }}
                  </h3>
                  <svg
                    class="writing-card__arrow"
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

                <p class="writing-card__excerpt">
                  {{ post.excerpt }}
                </p>

                <div v-if="post.tags?.length" class="writing-card__tags">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="writing-card__tag"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div class="writing-card__meta">
                  <span class="writing-card__meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    {{ formatDate(post.date) }}
                  </span>
                  <span class="writing-card__meta-separator">•</span>
                  <span class="writing-card__meta-item">{{ post.readTime }}</span>
                </div>
              </div>
            </NuxtLink>
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
            <p v-if="hasActiveFilters">No articles match your filters.</p>
            <p v-else>No articles yet.</p>
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

.catalog-page__main {
  min-width: 0;
}

/* Writing list */
.writing-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
}

.writing-card {
  display: block;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6, 1.5rem);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
}

.writing-card:hover {
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
  box-shadow: 0 10px 40px -10px color-mix(in srgb, var(--accent), transparent 90%);
}

.writing-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.writing-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4, 1rem);
}

.writing-card__title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
  transition: color 0.2s ease;
}

.writing-card:hover .writing-card__title {
  color: var(--accent);
}

.writing-card__arrow {
  flex-shrink: 0;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
  transition: color 0.2s ease;
}

.writing-card:hover .writing-card__arrow {
  color: var(--accent);
}

.writing-card__excerpt {
  color: var(--muted-foreground);
  line-height: 1.6;
  margin: 0;
}

.writing-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
}

.writing-card__tag {
  font-size: var(--text-xs, 0.75rem);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 0.25rem);
}

.writing-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
  padding-top: var(--space-2);
}

.writing-card__meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.writing-card__meta-separator {
  opacity: 0.5;
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
