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

const { data: posts } = await useFetch<WritingPost[]>('/api/writing/featured')

const sectionRef = ref<HTMLElement | null>(null)
useScrollReveal(sectionRef, { children: '.writing__header, .writing__card', y: 30, stagger: 0.1 })

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <section id="writing" ref="sectionRef" class="writing">
    <div class="writing__container">
      <!-- Section header -->
      <div class="writing__header">
        <div>
          <h2 class="writing__title">
            Writing & <span>Insights</span>
          </h2>
          <p class="writing__subtitle">
            Thoughts on software engineering, AI, and building quality systems.
          </p>
        </div>
        <NuxtLink to="/writing" class="writing__view-all">
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

      <!-- Posts list -->
      <div class="writing__list">
        <NuxtLink
          v-for="post in posts"
          :key="post.id"
          :to="`/writing/${post.slug}`"
          class="writing__card"
        >
          <div class="writing__content">
            <div class="writing__heading">
              <h3 class="writing__post-title">
                {{ post.title }}
              </h3>
              <svg
                class="writing__arrow"
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

            <p class="writing__excerpt">
              {{ post.excerpt }}
            </p>

            <div v-if="post.tags?.length" class="writing__tags">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="writing__tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="writing__meta">
              <span class="writing__meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                {{ formatDate(post.date) }}
              </span>
              <span class="writing__meta-separator">•</span>
              <span class="writing__meta-item">{{ post.readTime }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.writing {
  padding: var(--space-24, 6rem) var(--space-6);
  border-top: 1px solid var(--border);
  background-color: var(--muted);
}

.writing__container {
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .writing__list {
    max-width: 800px;
  }
}

.writing__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4, 1rem);
  margin-bottom: var(--space-12, 3rem);
}

.writing__title {
  font-size: clamp(1.875rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin: 0;
}

.writing__title span {
  color: var(--accent);
}

.writing__subtitle {
  color: var(--muted-foreground);
  max-width: 42rem;
  margin: var(--space-4, 1rem) 0 0;
}

.writing__view-all {
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

.writing__view-all:hover {
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
}

.writing__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
}

.writing__card {
  display: block;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6, 1.5rem);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
}

.writing__card:hover {
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
  box-shadow: 0 10px 40px -10px color-mix(in srgb, var(--accent), transparent 90%);
}

.writing__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.writing__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4, 1rem);
}

.writing__post-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
  transition: color 0.2s ease;
}

.writing__card:hover .writing__post-title {
  color: var(--accent);
}

.writing__arrow {
  flex-shrink: 0;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
  transition: color 0.2s ease;
}

.writing__card:hover .writing__arrow {
  color: var(--accent);
}

.writing__excerpt {
  color: var(--muted-foreground);
  line-height: 1.6;
  margin: 0;
}

.writing__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
}

.writing__tag {
  font-size: var(--text-xs, 0.75rem);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 0.25rem);
}

.writing__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
  padding-top: var(--space-2);
}

.writing__meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.writing__meta-separator {
  opacity: 0.5;
}

@media (max-width: 640px) {
  .writing__header {
    flex-direction: column;
  }
}
</style>
