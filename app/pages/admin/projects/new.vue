<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const router = useRouter()
const saving = ref(false)
const error = ref('')

const form = reactive({
  slug: '',
  title: '',
  description: '',
  content: '',
  githubUrl: '',
  liveUrl: '',
  featuredOrder: null as number | null,
  tags: [] as string[],
})

const tagsInput = ref('')

const updateTags = (value: string) => {
  tagsInput.value = value
  form.tags = value.split(',').map(t => t.trim()).filter(Boolean)
}

const handleSave = async () => {
  if (!form.slug || !form.title || !form.description) {
    error.value = 'Slug, title, and description are required'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const result = await $fetch<{ id: number }>('/api/admin/projects', {
      method: 'POST',
      body: form,
    })
    router.push(`/admin/projects/${result.id}`)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to create project'
  } finally {
    saving.value = false
  }
}

const { renderMarkdown } = useMarkdown()

const viewMode = ref<'edit' | 'preview'>('edit')

const contentHtml = computed(() => {
  return renderMarkdown(form.content)
})
</script>

<template>
  <div class="edit-page">
    <div class="edit-header">
      <div class="edit-header__left">
        <NuxtLink to="/admin/projects" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
        </NuxtLink>
        <div>
          <h1 class="edit-title">New Project</h1>
          <p class="edit-subtitle">Create a new portfolio project</p>
        </div>
      </div>
      <button class="btn btn--primary" :disabled="saving" @click="handleSave">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>
        </svg>
        {{ saving ? 'Saving...' : 'Save Project' }}
      </button>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <div class="edit-grid">
      <div class="edit-main">
        <!-- Basic Information -->
        <div class="card">
          <h2 class="card__title">Basic Information</h2>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input v-model="form.title" type="text" class="form-input" placeholder="Project title" />
            </div>
            <div class="form-group">
              <label class="form-label">Slug (URL)</label>
              <input v-model="form.slug" type="text" class="form-input" placeholder="project-slug" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description (shown on homepage)</label>
            <textarea v-model="form.description" class="form-textarea" rows="3" placeholder="Brief project description for the homepage" />
          </div>
          <div class="form-group">
            <label class="form-label">Tags (comma-separated)</label>
            <input :value="tagsInput" type="text" class="form-input" placeholder="React, TypeScript, Node.js" @input="updateTags(($event.target as HTMLInputElement).value)" />
          </div>
        </div>

        <!-- Case Study Content -->
        <div class="card card--editor">
          <div class="card__header">
            <h2 class="card__title">Case Study Content</h2>
            <div class="view-toggle">
              <button :class="['view-toggle__btn', { active: viewMode === 'edit' }]" @click="viewMode = 'edit'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
                </svg>
                Edit
              </button>
              <button :class="['view-toggle__btn', { active: viewMode === 'preview' }]" @click="viewMode = 'preview'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Preview
              </button>
            </div>
          </div>
          <div v-if="viewMode === 'edit'" class="card__body">
            <textarea v-model="form.content" class="form-textarea form-textarea--code" rows="20" placeholder="Write your case study in markdown...

## Overview

Describe the project...

## Technical Implementation

Explain your approach..." />
            <div class="markdown-hint">
              <strong>Markdown tips:</strong> Use ## for headings, **text** for bold, *text* for italic, - for lists
            </div>
          </div>
          <div v-else class="card__body card__body--preview">
            <div v-if="form.content" class="prose" v-html="contentHtml" />
            <div v-else class="preview-empty">
              No content yet. Switch to Edit mode to write your case study.
            </div>
          </div>
        </div>
      </div>

      <div class="edit-sidebar">
        <!-- Featured -->
        <div class="card">
          <h3 class="card__title card__title--sm">Featured Order</h3>
          <div class="form-group">
            <input v-model.number="form.featuredOrder" type="number" class="form-input" placeholder="Leave empty if not featured" min="1" />
            <p class="form-hint">Set 1, 2, 3... to feature on homepage</p>
          </div>
        </div>

        <!-- Links -->
        <div class="card">
          <h3 class="card__title card__title--sm">Links</h3>
          <div class="form-group">
            <label class="form-label">GitHub URL</label>
            <input v-model="form.githubUrl" type="url" class="form-input" placeholder="https://github.com/..." />
          </div>
          <div class="form-group">
            <label class="form-label">Live URL</label>
            <input v-model="form.liveUrl" type="url" class="form-input" placeholder="https://example.com" />
          </div>
        </div>

        <!-- Images Note -->
        <div class="card">
          <h3 class="card__title card__title--sm">Gallery Images</h3>
          <p class="form-hint">Save the project first, then you can upload images.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-page {
  max-width: 1200px;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.edit-header__left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.back-btn {
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  color: var(--foreground);
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: var(--secondary);
}

.edit-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.edit-subtitle {
  color: var(--muted-foreground);
  margin: var(--space-1) 0 0;
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
}

.btn--primary {
  background: var(--accent);
  color: var(--accent-foreground);
}

.btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent), #000 10%);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-banner {
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--destructive), transparent 90%);
  border: 1px solid color-mix(in srgb, var(--destructive), transparent 80%);
  border-radius: var(--radius-lg);
  color: var(--destructive);
  margin-bottom: var(--space-6);
}

.edit-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
}

@media (min-width: 1024px) {
  .edit-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.edit-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.edit-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.card--editor {
  padding: 0;
  overflow: hidden;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
}

.card__body {
  padding: var(--space-6);
}

.card__body--preview {
  min-height: 400px;
}

.card__title {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0 0 var(--space-6);
}

.card__title--sm {
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}

.card__header .card__title {
  margin: 0;
}

.view-toggle {
  display: flex;
  background: var(--secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
}

.view-toggle__btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle__btn:hover {
  color: var(--foreground);
}

.view-toggle__btn.active {
  background: var(--accent);
  color: var(--accent-foreground);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-2);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--space-2) var(--space-4);
  background: var(--input-background, var(--secondary));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  color: var(--foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent), transparent 80%);
}

.form-textarea {
  resize: vertical;
}

.form-textarea--code {
  font-family: var(--font-mono, monospace);
  font-size: var(--text-sm);
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  margin: var(--space-2) 0 0;
}

.markdown-hint {
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: color-mix(in srgb, var(--muted), transparent 50%);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: var(--text-xs);
  color: var(--muted-foreground);
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--muted-foreground);
}

.prose {
  color: var(--muted-foreground);
  line-height: 1.7;
}

.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--foreground);
  margin: var(--space-8) 0 var(--space-4);
}

.prose :deep(h2:first-child) {
  margin-top: 0;
}

.prose :deep(p) {
  margin: 0 0 var(--space-4);
}

.prose :deep(ul) {
  margin: var(--space-4) 0;
  padding-left: var(--space-6);
}

.prose :deep(li) {
  margin-bottom: var(--space-2);
}
</style>
