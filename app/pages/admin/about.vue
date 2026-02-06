<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

interface AboutContent {
  id: number
  bioParagraphs: string[]
  highlights: string[]
  updatedAt: string
}

const { data: about, refresh, pending } = await useFetch<AboutContent>('/api/about')

const form = reactive({
  bioParagraphs: [''],
  highlights: [''],
})

const isSaving = ref(false)
const saveMessage = ref('')

// Initialize form when data loads
watch(about, (val) => {
  if (val) {
    form.bioParagraphs = [...val.bioParagraphs]
    form.highlights = [...val.highlights]
  }
}, { immediate: true })

const addBioParagraph = () => form.bioParagraphs.push('')
const removeBioParagraph = (index: number) => form.bioParagraphs.splice(index, 1)

const addHighlight = () => form.highlights.push('')
const removeHighlight = (index: number) => form.highlights.splice(index, 1)

const handleSave = async () => {
  isSaving.value = true
  saveMessage.value = ''

  try {
    await $fetch('/api/admin/about', {
      method: 'PUT',
      body: {
        bioParagraphs: form.bioParagraphs.filter(p => p.trim()),
        highlights: form.highlights.filter(h => h.trim()),
      },
    })
    await refresh()
    saveMessage.value = 'Saved successfully!'
    setTimeout(() => saveMessage.value = '', 3000)
  } catch (err) {
    saveMessage.value = 'Failed to save. Please try again.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="about-page">
    <div class="about-header">
      <div>
        <h1 class="about-title">Edit About Section</h1>
        <p class="about-subtitle">Manage the content displayed on your homepage</p>
      </div>
      <div class="about-actions">
        <span v-if="saveMessage" class="save-message" :class="{ 'save-message--error': saveMessage.includes('Failed') }">
          {{ saveMessage }}
        </span>
        <button class="btn btn--primary" :disabled="isSaving || pending" @click="handleSave">
          <svg v-if="isSaving" class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <div v-if="pending" class="loading">
      <p>Loading...</p>
    </div>

    <div v-else class="about-form">
      <!-- Bio Paragraphs -->
      <div class="form-group">
        <div class="form-header">
          <label class="form-label">Bio Paragraphs</label>
          <button type="button" class="btn btn--sm btn--secondary" @click="addBioParagraph">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Paragraph
          </button>
        </div>
        <div class="paragraphs-list">
          <div v-for="(paragraph, index) in form.bioParagraphs" :key="index" class="paragraph-item">
            <textarea
              v-model="form.bioParagraphs[index]"
              class="form-textarea"
              rows="3"
              placeholder="Enter a paragraph about yourself..."
            />
            <button
              v-if="form.bioParagraphs.length > 1"
              type="button"
              class="btn btn--icon btn--danger"
              @click="removeBioParagraph(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Highlights -->
      <div class="form-group">
        <div class="form-header">
          <label class="form-label">Focus Areas / Highlights</label>
          <button type="button" class="btn btn--sm btn--secondary" @click="addHighlight">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Highlight
          </button>
        </div>
        <div class="highlights-list">
          <div v-for="(highlight, index) in form.highlights" :key="index" class="highlight-item">
            <input
              v-model="form.highlights[index]"
              type="text"
              class="form-input"
              placeholder="e.g., Building AI-powered developer tools..."
            >
            <button
              v-if="form.highlights.length > 1"
              type="button"
              class="btn btn--icon btn--danger"
              @click="removeHighlight(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Last Updated -->
      <div v-if="about?.updatedAt" class="last-updated">
        Last updated: {{ new Date(about.updatedAt).toLocaleString() }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 800px;
}

.about-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.about-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.about-subtitle {
  color: var(--muted-foreground);
  margin: 0;
}

.about-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.save-message {
  font-size: var(--text-sm);
  color: var(--accent);
}

.save-message--error {
  color: var(--destructive);
}

.loading {
  text-align: center;
  padding: var(--space-12);
  color: var(--muted-foreground);
}

.about-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--foreground);
}

.form-input,
.form-textarea {
  padding: var(--space-3);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--foreground);
  width: 100%;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

.paragraphs-list,
.highlights-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.paragraph-item,
.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.paragraph-item .form-textarea,
.highlight-item .form-input {
  flex: 1;
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
  transition: background 0.2s ease, opacity 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--accent);
  color: var(--accent-foreground);
}

.btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent), #000 10%);
}

.btn--secondary {
  background: var(--secondary);
  color: var(--foreground);
  border: 1px solid var(--border);
}

.btn--secondary:hover {
  background: var(--muted);
}

.btn--sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
}

.btn--icon {
  padding: var(--space-2);
  background: transparent;
  color: var(--muted-foreground);
}

.btn--icon:hover {
  background: var(--secondary);
  color: var(--destructive);
}

.btn--danger:hover {
  background: color-mix(in srgb, var(--destructive), transparent 90%);
}

.last-updated {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
