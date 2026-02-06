<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { renderMarkdown } = useMarkdown()

interface WritingPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  tags: string[]
  heroImageUrl: string | null
  heroImageAlt: string | null
}

const { data: post, error } = await useFetch<WritingPost>(`/api/writing/${slug}`)

const contentHtml = computed(() => {
  if (!post.value?.content) return ''
  return renderMarkdown(post.value.content)
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Handle 404
if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}
</script>

<template>
  <div v-if="post" class="writing-post">
    <!-- Hero section with image -->
    <div class="writing-post__hero">
      <div class="writing-post__hero-image-container">
        <img
          v-if="post.heroImageUrl"
          :src="post.heroImageUrl"
          :alt="post.heroImageAlt || post.title"
          class="writing-post__hero-image"
        >
        <div v-else class="writing-post__hero-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.09-2.5a2 2 0 0 0-1.83-1.2H14l-1.55 2.2a2 2 0 0 1-3.28 0L7.64 13.3A2 2 0 0 0 5.8 13.3L4 17"/>
          </svg>
        </div>
      </div>
      <div class="writing-post__hero-overlay" />
      
      <!-- Hero content -->
      <div class="writing-post__hero-content">
        <div class="writing-post__container">
          <NuxtLink to="/#writing" class="writing-post__back">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Writing
          </NuxtLink>

          <h1 class="writing-post__title">{{ post.title }}</h1>

          <!-- Metadata -->
          <div class="writing-post__meta">
            <span class="writing-post__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              {{ formatDate(post.date) }}
            </span>
            <span class="writing-post__meta-separator">•</span>
            <span class="writing-post__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ post.readTime }}
            </span>
          </div>

          <!-- Tags -->
          <div v-if="post.tags?.length" class="writing-post__tags">
            <span v-for="tag in post.tags" :key="tag" class="writing-post__tag">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>
              </svg>
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Article content -->
    <article class="writing-post__article">
      <div class="writing-post__container writing-post__container--narrow">
        <!-- Excerpt/intro -->
        <p class="writing-post__excerpt">{{ post.excerpt }}</p>

        <!-- Content -->
        <div class="writing-post__content markdown-body" v-html="contentHtml" />

        <!-- Footer navigation -->
        <div class="writing-post__footer">
          <NuxtLink to="/#writing" class="writing-post__footer-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to all writing
          </NuxtLink>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.writing-post {
  min-height: 100vh;
}

.writing-post__hero {
  position: relative;
  height: 60vh;
  min-height: 400px;
  max-height: 600px;
  overflow: hidden;
}

.writing-post__hero-image-container {
  position: absolute;
  inset: 0;
  background: var(--muted);
}

.writing-post__hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.writing-post__hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
  background: linear-gradient(135deg, var(--muted) 0%, var(--card) 100%);
}

.writing-post__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--background) 0%, transparent 60%);
}

.writing-post__hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: var(--space-12);
}

.writing-post__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.writing-post__container--narrow {
  max-width: 800px;
}

.writing-post__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--foreground);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  text-decoration: none;
  margin-bottom: var(--space-6);
  transition: all 0.2s ease;
}

.writing-post__back:hover {
  background: rgba(0, 0, 0, 0.7);
  color: var(--foreground);
  transform: translateX(-2px);
}

@media (prefers-color-scheme: light) {
  .writing-post__back {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .writing-post__back:hover {
    background: rgba(255, 255, 255, 1);
  }
}

.writing-post__title {
  font-size: clamp(1.875rem, 4vw, 3rem);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin: 0 0 var(--space-6);
}

.writing-post__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
}

.writing-post__meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.writing-post__meta-separator {
  opacity: 0.5;
}

.writing-post__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.writing-post__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 9999px;
}

.writing-post__article {
  padding: var(--space-16) 0;
}

.writing-post__excerpt {
  font-size: 1.25rem;
  color: var(--muted-foreground);
  line-height: 1.6;
  margin: 0 0 var(--space-12);
  padding-bottom: var(--space-12);
  border-bottom: 1px solid var(--border);
}

.writing-post__content {
  font-size: 1.125rem;
  line-height: 1.8;
}

.writing-post__content :deep(h2) {
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  margin-top: var(--space-12);
  margin-bottom: var(--space-6);
}

.writing-post__content :deep(h3) {
  font-size: 1.375rem;
  font-weight: var(--font-weight-semibold);
  margin-top: var(--space-8);
  margin-bottom: var(--space-4);
}

.writing-post__content :deep(p) {
  margin-bottom: var(--space-6);
  color: var(--foreground);
}

.writing-post__content :deep(pre) {
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  overflow-x: auto;
  margin: var(--space-8) 0;
}

.writing-post__content :deep(code) {
  font-family: var(--font-mono, monospace);
  font-size: 0.9em;
}

.writing-post__content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.writing-post__content :deep(:not(pre) > code) {
  background: var(--secondary);
  padding: 0.2em 0.4em;
  border-radius: var(--radius-sm);
}

.writing-post__content :deep(ul),
.writing-post__content :deep(ol) {
  margin-bottom: var(--space-6);
  padding-left: var(--space-6);
}

.writing-post__content :deep(li) {
  margin-bottom: var(--space-2);
}

.writing-post__content :deep(blockquote) {
  border-left: 4px solid var(--accent);
  padding-left: var(--space-4);
  margin: var(--space-6) 0;
  color: var(--muted-foreground);
  font-style: italic;
}

.writing-post__content :deep(a) {
  color: var(--accent);
  text-decoration: underline;
}

.writing-post__content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  margin: var(--space-6) 0;
}

.writing-post__content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: var(--space-8) 0;
}

.writing-post__content :deep(strong) {
  font-weight: var(--font-weight-semibold);
}

.writing-post__footer {
  margin-top: var(--space-16);
  padding-top: var(--space-12);
  border-top: 1px solid var(--border);
}

.writing-post__footer-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--accent);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
}

.writing-post__footer-link:hover {
  text-decoration: underline;
}
</style>
