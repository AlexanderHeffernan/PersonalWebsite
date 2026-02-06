<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

interface WritingPost {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  published: number
  sortOrder: number
}

const { data: posts, refresh } = await useFetch<WritingPost[]>('/api/admin/writing')

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this post?')) return

  try {
    await $fetch(`/api/admin/writing/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    alert('Failed to delete post')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="writing-page">
    <div class="writing-header">
      <div>
        <h1 class="writing-title">Manage Writing</h1>
        <p class="writing-subtitle">Create and manage blog posts and articles</p>
      </div>
      <NuxtLink to="/admin/writing/new" class="btn btn--primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        New Post
      </NuxtLink>
    </div>

    <div class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-card__content">
          <div class="post-card__header">
            <div>
              <h3 class="post-card__title">{{ post.title }}</h3>
              <p class="post-card__slug">/{{ post.slug }}</p>
            </div>
            <span v-if="!post.published" class="post-card__badge post-card__badge--draft">Draft</span>
          </div>
          <p class="post-card__excerpt">{{ post.excerpt }}</p>
          <div class="post-card__meta">
            <span>{{ formatDate(post.date) }}</span>
            <span>•</span>
            <span>{{ post.readTime }}</span>
            <span>•</span>
            <span>Order: {{ post.sortOrder }}</span>
          </div>
        </div>
        <div class="post-card__actions">
          <NuxtLink :to="`/admin/writing/${post.id}`" class="action-btn" aria-label="Edit post">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
            </svg>
          </NuxtLink>
          <button class="action-btn action-btn--danger" aria-label="Delete post" @click="handleDelete(post.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="!posts?.length" class="posts-empty">
        <p>No posts yet. Create your first post to get started.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.writing-page {
  max-width: 1000px;
}

.writing-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.writing-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.writing-subtitle {
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
  text-decoration: none;
}

.btn--primary {
  background: var(--accent);
  color: var(--accent-foreground);
}

.btn--primary:hover {
  background: color-mix(in srgb, var(--accent), #000 10%);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.post-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.post-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.post-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.post-card__title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
}

.post-card__slug {
  font-size: var(--text-sm);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
  margin: var(--space-1) 0 0;
}

.post-card__badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.post-card__badge--draft {
  background: var(--secondary);
  color: var(--muted-foreground);
  border: 1px solid var(--border);
}

.post-card__excerpt {
  color: var(--muted-foreground);
  margin: 0;
  line-height: 1.5;
}

.post-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--muted-foreground);
}

.post-card__actions {
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

.posts-empty {
  text-align: center;
  padding: var(--space-12);
  color: var(--muted-foreground);
}
</style>
