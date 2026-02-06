<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

interface PostImage {
  id: number
  url: string
  alt: string | null
  sortOrder: number
}

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
  published: number
  sortOrder: number
  images: PostImage[]
}

const route = useRoute()
const router = useRouter()
const postId = route.params.id as string

const { data: post, error: fetchError, refresh } = await useFetch<WritingPost>(`/api/admin/writing/${postId}`)

if (fetchError.value) {
  throw createError({ statusCode: 404, message: 'Post not found' })
}

const saving = ref(false)
const error = ref('')
const uploadingImage = ref(false)
const dragOver = ref(false)
const copiedId = ref<number | null>(null)

const form = reactive({
  slug: post.value?.slug || '',
  title: post.value?.title || '',
  excerpt: post.value?.excerpt || '',
  content: post.value?.content || '',
  date: post.value?.date || '',
  readTime: post.value?.readTime || '',
  tags: post.value?.tags || [],
  heroImageUrl: post.value?.heroImageUrl || '',
  heroImageAlt: post.value?.heroImageAlt || '',
  published: post.value?.published === 1,
  sortOrder: post.value?.sortOrder || 0,
})

const tagsInput = ref(form.tags.join(', '))

const updateTags = (value: string) => {
  tagsInput.value = value
  form.tags = value.split(',').map(t => t.trim()).filter(Boolean)
}

const handleSave = async () => {
  if (!form.slug || !form.title || !form.excerpt || !form.date || !form.readTime) {
    error.value = 'Slug, title, excerpt, date, and read time are required'
    return
  }

  saving.value = true
  error.value = ''

  try {
    await $fetch(`/api/admin/writing/${postId}`, {
      method: 'PUT',
      body: form,
    })
    await refresh()
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to save post'
  } finally {
    saving.value = false
  }
}

const handleImageUpload = async (files: FileList | null) => {
  if (!files || files.length === 0) return

  uploadingImage.value = true

  for (const file of Array.from(files)) {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('alt', file.name.replace(/\.[^/.]+$/, ''))

    try {
      await $fetch(`/api/admin/writing/${postId}/images`, {
        method: 'POST',
        body: formData,
      })
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to upload image'
    }
  }

  await refresh()
  uploadingImage.value = false
}

const handleFileDrop = (event: DragEvent) => {
  dragOver.value = false
  handleImageUpload(event.dataTransfer?.files || null)
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  handleImageUpload(input.files)
  input.value = ''
}

const deleteImage = async (imageId: number) => {
  if (!confirm('Delete this image?')) return

  try {
    await $fetch(`/api/admin/images/${imageId}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to delete image'
  }
}

const setAsHero = (image: PostImage) => {
  form.heroImageUrl = image.url
  form.heroImageAlt = image.alt || ''
}

const getMarkdownSnippet = (image: PostImage): string => {
  return `![${image.alt || 'Image'}](${image.url})`
}

const copyToClipboard = async (image: PostImage) => {
  const snippet = getMarkdownSnippet(image)
  try {
    await navigator.clipboard.writeText(snippet)
    copiedId.value = image.id
    setTimeout(() => {
      if (copiedId.value === image.id) {
        copiedId.value = null
      }
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
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
        <NuxtLink to="/admin/writing" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
        </NuxtLink>
        <div>
          <h1 class="edit-title">Edit Post</h1>
          <p class="edit-subtitle">{{ form.title || 'Untitled' }}</p>
        </div>
      </div>
      <button class="btn btn--primary" :disabled="saving" @click="handleSave">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>
        </svg>
        {{ saving ? 'Saving...' : 'Save Post' }}
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
              <input v-model="form.title" type="text" class="form-input" placeholder="Post title" />
            </div>
            <div class="form-group">
              <label class="form-label">Slug (URL)</label>
              <input v-model="form.slug" type="text" class="form-input" placeholder="post-slug" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input v-model="form.date" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Read Time</label>
              <input v-model="form.readTime" type="text" class="form-input" placeholder="e.g., 8 min read" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Excerpt (shown on homepage)</label>
            <textarea v-model="form.excerpt" class="form-textarea" rows="3" placeholder="Brief summary of the post..." />
          </div>
          <div class="form-group">
            <label class="form-label">Tags (comma-separated)</label>
            <input :value="tagsInput" type="text" class="form-input" placeholder="AI, Development, Code Quality" @input="updateTags(($event.target as HTMLInputElement).value)" />
          </div>
        </div>

        <!-- Content -->
        <div class="card card--editor">
          <div class="card__header">
            <h2 class="card__title">Content</h2>
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
            <textarea v-model="form.content" class="form-textarea form-textarea--code" rows="20" placeholder="Write your article in markdown...

## Introduction

Start with a hook...

## Main Content

Your thoughts..." />
            <div class="markdown-hint">
              <strong>Markdown tips:</strong> Use ## for headings, **text** for bold, *text* for italic, - for lists, ``` for code blocks
            </div>
          </div>
          <div v-else class="card__body card__body--preview">
            <div v-if="form.content" class="prose" v-html="contentHtml" />
            <div v-else class="preview-empty">
              No content yet. Switch to Edit mode to write your article.
            </div>
          </div>
        </div>
      </div>

      <div class="edit-sidebar">
        <!-- Hero Image -->
        <div class="card">
          <h3 class="card__title card__title--sm">Hero Image</h3>
          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input v-model="form.heroImageUrl" type="url" class="form-input" placeholder="https://example.com/image.jpg" />
          </div>
          <div class="form-group">
            <label class="form-label">Alt Text</label>
            <input v-model="form.heroImageAlt" type="text" class="form-input" placeholder="Image description" />
          </div>
          <div v-if="form.heroImageUrl" class="hero-preview">
            <img :src="form.heroImageUrl" :alt="form.heroImageAlt || ''" class="hero-preview__image" />
          </div>
        </div>

        <!-- Publishing -->
        <div class="card">
          <h3 class="card__title card__title--sm">Publishing</h3>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="form.published" type="checkbox" class="checkbox-input" />
              <span>Published</span>
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">Sort Order</label>
            <input v-model.number="form.sortOrder" type="number" class="form-input" placeholder="0" min="0" />
            <p class="form-hint">Lower numbers appear first</p>
          </div>
        </div>

        <!-- Images -->
        <div class="card">
          <h3 class="card__title card__title--sm">Images</h3>
          
          <!-- Upload area -->
          <div
            :class="['upload-zone', { 'upload-zone--active': dragOver, 'upload-zone--uploading': uploadingImage }]"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleFileDrop"
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              class="upload-zone__input"
              @change="handleFileSelect"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="upload-zone__icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <span v-if="uploadingImage">Uploading...</span>
            <span v-else>Drop images or click to upload</span>
          </div>

          <!-- Image list -->
          <div v-if="post?.images?.length" class="image-list">
            <div v-for="image in post.images" :key="image.id" class="image-item">
              <img :src="image.url" :alt="image.alt || ''" class="image-item__preview" />
              <div class="image-item__actions">
                <button 
                  :class="['image-item__btn', { 'image-item__btn--active': form.heroImageUrl === image.url }]"
                  @click="setAsHero(image)"
                  title="Set as hero image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button 
                  class="image-item__btn"
                  :class="{ 'image-item__btn--copied': copiedId === image.id }"
                  @click="copyToClipboard(image)"
                  :title="copiedId === image.id ? 'Copied!' : 'Copy markdown'"
                >
                  <svg v-if="copiedId !== image.id" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <button class="image-item__btn image-item__btn--delete" @click="deleteImage(image.id)" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <p class="form-hint">Click the eye icon to set as hero. Click the copy icon to copy markdown snippet.</p>
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
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

.prose :deep(pre) {
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  overflow-x: auto;
  margin: var(--space-4) 0;
}

.prose :deep(code) {
  font-family: var(--font-mono, monospace);
  font-size: 0.9em;
}

.prose :deep(pre code) {
  background: transparent;
  padding: 0;
}

/* Hero preview */
.hero-preview {
  margin-top: var(--space-4);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
}

.hero-preview__image {
  width: 100%;
  height: auto;
  display: block;
}

/* Image upload */
.upload-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-6);
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.upload-zone:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent), transparent 95%);
}

.upload-zone--active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent), transparent 90%);
}

.upload-zone--uploading {
  pointer-events: none;
  opacity: 0.7;
}

.upload-zone__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-zone__icon {
  color: var(--muted-foreground);
}

.image-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.image-item {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
}

.image-item__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item__actions {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-item:hover .image-item__actions {
  opacity: 1;
}

.image-item__btn {
  padding: var(--space-1);
  background: var(--background);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--foreground);
  transition: all 0.2s ease;
}

.image-item__btn:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}

.image-item__btn--active {
  background: var(--accent);
  color: var(--accent-foreground);
}

.image-item__btn--copied {
  background: var(--accent);
  color: var(--accent-foreground);
}

.image-item__btn--delete:hover {
  background: var(--destructive);
  color: white;
}
</style>
