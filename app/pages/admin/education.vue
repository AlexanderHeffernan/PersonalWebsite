<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

interface Education {
  id: number
  institution: string
  degree: string
  field: string | null
  dateRange: string
  description: string | null
  achievements: string[]
  sortOrder: number
}

const { data: educationList, refresh } = await useFetch<Education[]>('/api/admin/education')

const isEditing = ref<number | null>(null)
const isSaving = ref(false)
const showForm = ref(false)

const form = reactive({
  institution: '',
  degree: '',
  field: '',
  dateRange: '',
  description: '',
  achievements: [''],
  sortOrder: 0,
})

const resetForm = () => {
  form.institution = ''
  form.degree = ''
  form.field = ''
  form.dateRange = ''
  form.description = ''
  form.achievements = ['']
  form.sortOrder = educationList.value?.length ?? 0
  isEditing.value = null
}

const editEducation = (edu: Education) => {
  isEditing.value = edu.id
  form.institution = edu.institution
  form.degree = edu.degree
  form.field = edu.field || ''
  form.dateRange = edu.dateRange
  form.description = edu.description || ''
  form.achievements = edu.achievements.length ? [...edu.achievements] : ['']
  form.sortOrder = edu.sortOrder
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleCancel = () => {
  showForm.value = false
  resetForm()
}

const addAchievement = () => form.achievements.push('')
const removeAchievement = (index: number) => form.achievements.splice(index, 1)

const handleSave = async () => {
  isSaving.value = true
  
  const payload = {
    institution: form.institution,
    degree: form.degree,
    field: form.field || undefined,
    dateRange: form.dateRange,
    description: form.description || undefined,
    achievements: form.achievements.filter(a => a.trim()),
    sortOrder: form.sortOrder,
  }

  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/education/${isEditing.value}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      await $fetch('/api/admin/education', {
        method: 'POST',
        body: payload,
      })
    }
    await refresh()
    resetForm()
    showForm.value = false
  } catch (err) {
    alert('Failed to save education')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this education entry?')) return
  
  try {
    await $fetch(`/api/admin/education/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    alert('Failed to delete education')
  }
}
</script>

<template>
  <div class="education-page">
    <div class="education-header">
      <div>
        <h1 class="education-title">Manage Education</h1>
        <p class="education-subtitle">Add, edit, or remove your academic background</p>
      </div>
      <button v-if="!showForm" class="btn btn--primary" @click="showForm = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        Add Education
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="education-form">
      <h2 class="form-title">{{ isEditing ? 'Edit Education' : 'Add Education' }}</h2>
      
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Institution *</label>
          <input v-model="form.institution" type="text" class="form-input" placeholder="e.g., University Name">
        </div>
        
        <div class="form-group">
          <label class="form-label">Degree *</label>
          <input v-model="form.degree" type="text" class="form-input" placeholder="e.g., Bachelor of Science">
        </div>
        
        <div class="form-group">
          <label class="form-label">Field of Study</label>
          <input v-model="form.field" type="text" class="form-input" placeholder="e.g., Computer Science">
        </div>
        
        <div class="form-group">
          <label class="form-label">Date Range *</label>
          <input v-model="form.dateRange" type="text" class="form-input" placeholder="e.g., 2017 - 2021">
        </div>
        
        <div class="form-group">
          <label class="form-label">Sort Order</label>
          <input v-model.number="form.sortOrder" type="number" class="form-input" min="0">
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea v-model="form.description" class="form-textarea" rows="3" placeholder="Describe your studies, focus areas, etc..." />
      </div>
      
      <div class="form-group">
        <div class="form-header">
          <label class="form-label">Achievements</label>
          <button type="button" class="btn btn--sm btn--secondary" @click="addAchievement">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Achievement
          </button>
        </div>
        <div class="achievements-list">
          <div v-for="(achievement, index) in form.achievements" :key="index" class="achievement-item">
            <input v-model="form.achievements[index]" type="text" class="form-input" placeholder="e.g., GPA: 3.8/4.0">
            <button v-if="form.achievements.length > 1" type="button" class="btn btn--icon btn--danger" @click="removeAchievement(index)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn--secondary" @click="handleCancel">
          Cancel
        </button>
        <button class="btn btn--primary" :disabled="isSaving" @click="handleSave">
          <svg v-if="isSaving" class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          {{ isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="education-list">
      <div v-for="edu in educationList" :key="edu.id" class="education-card">
        <div class="education-card__content">
          <div class="education-card__header">
            <div>
              <h3 class="education-card__degree">
                {{ edu.degree }}
                <span v-if="edu.field" class="education-card__field">in {{ edu.field }}</span>
              </h3>
              <p class="education-card__institution">{{ edu.institution }}</p>
            </div>
            <span class="education-card__date">{{ edu.dateRange }}</span>
          </div>
          <p v-if="edu.description" class="education-card__description">{{ edu.description }}</p>
          <div v-if="edu.achievements?.length" class="education-card__achievements">
            <span v-for="achievement in edu.achievements" :key="achievement" class="achievement-tag">
              {{ achievement }}
            </span>
          </div>
          <div class="education-card__meta">
            Order: {{ edu.sortOrder }}
          </div>
        </div>
        <div class="education-card__actions">
          <button class="action-btn" @click="editEducation(edu)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
            </svg>
          </button>
          <button class="action-btn action-btn--danger" @click="handleDelete(edu.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="!educationList?.length" class="education-empty">
        <p>No education entries yet. Add your academic background to get started.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.education-page {
  max-width: 1000px;
}

.education-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.education-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.education-subtitle {
  color: var(--muted-foreground);
  margin: 0;
}

.education-form {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.form-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-6);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
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

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.achievement-item .form-input {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.education-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .education-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.education-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.education-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.education-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.education-card__degree {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.education-card__field {
  color: var(--muted-foreground);
  font-weight: var(--font-weight-normal);
}

.education-card__institution {
  color: var(--accent);
  font-weight: var(--font-weight-medium);
  margin: var(--space-1) 0 0;
}

.education-card__date {
  font-size: var(--text-sm);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.education-card__description {
  color: var(--muted-foreground);
  margin: 0;
  line-height: 1.5;
}

.education-card__achievements {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.achievement-tag {
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1) var(--space-2);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.education-card__meta {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border);
}

.education-card__actions {
  display: flex;
  gap: var(--space-2);
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
  color: var(--destructive);
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

.education-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-12);
  color: var(--muted-foreground);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
