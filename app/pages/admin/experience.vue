<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

interface WorkExperience {
  id: number
  company: string
  role: string
  dateRange: string
  description: string
  technologies: string[]
  sortOrder: number
}

const { data: experiences, refresh } = await useFetch<WorkExperience[]>('/api/admin/experience')

const isEditing = ref<number | null>(null)
const isSaving = ref(false)
const showForm = ref(false)

const form = reactive({
  company: '',
  role: '',
  dateRange: '',
  description: '',
  technologies: [''],
  sortOrder: 0,
})

const resetForm = () => {
  form.company = ''
  form.role = ''
  form.dateRange = ''
  form.description = ''
  form.technologies = ['']
  form.sortOrder = experiences.value?.length ?? 0
  isEditing.value = null
}

const editExperience = (exp: WorkExperience) => {
  isEditing.value = exp.id
  form.company = exp.company
  form.role = exp.role
  form.dateRange = exp.dateRange
  form.description = exp.description
  form.technologies = exp.technologies.length ? [...exp.technologies] : ['']
  form.sortOrder = exp.sortOrder
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleCancel = () => {
  showForm.value = false
  resetForm()
}

const addTechnology = () => form.technologies.push('')
const removeTechnology = (index: number) => form.technologies.splice(index, 1)

const handleSave = async () => {
  isSaving.value = true
  
  const payload = {
    company: form.company,
    role: form.role,
    dateRange: form.dateRange,
    description: form.description,
    technologies: form.technologies.filter(t => t.trim()),
    sortOrder: form.sortOrder,
  }

  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/experience/${isEditing.value}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      await $fetch('/api/admin/experience', {
        method: 'POST',
        body: payload,
      })
    }
    await refresh()
    resetForm()
    showForm.value = false
  } catch (err) {
    alert('Failed to save experience')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this experience?')) return
  
  try {
    await $fetch(`/api/admin/experience/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    alert('Failed to delete experience')
  }
}
</script>

<template>
  <div class="experience-page">
    <div class="experience-header">
      <div>
        <h1 class="experience-title">Manage Work Experience</h1>
        <p class="experience-subtitle">Add, edit, or remove your professional experience</p>
      </div>
      <button v-if="!showForm" class="btn btn--primary" @click="showForm = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        Add Experience
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="experience-form">
      <h2 class="form-title">{{ isEditing ? 'Edit Experience' : 'Add Experience' }}</h2>
      
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Company</label>
          <input v-model="form.company" type="text" class="form-input" placeholder="e.g., Tech Company">
        </div>
        
        <div class="form-group">
          <label class="form-label">Role</label>
          <input v-model="form.role" type="text" class="form-input" placeholder="e.g., Senior Software Engineer">
        </div>
        
        <div class="form-group">
          <label class="form-label">Date Range</label>
          <input v-model="form.dateRange" type="text" class="form-input" placeholder="e.g., 2023 - Present">
        </div>
        
        <div class="form-group">
          <label class="form-label">Sort Order</label>
          <input v-model.number="form.sortOrder" type="number" class="form-input" min="0">
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea v-model="form.description" class="form-textarea" rows="3" placeholder="Describe your role and achievements..." />
      </div>
      
      <div class="form-group">
        <div class="form-header">
          <label class="form-label">Technologies</label>
          <button type="button" class="btn btn--sm btn--secondary" @click="addTechnology">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Tech
          </button>
        </div>
        <div class="tech-list">
          <div v-for="(tech, index) in form.technologies" :key="index" class="tech-item">
            <input v-model="form.technologies[index]" type="text" class="form-input" placeholder="e.g., TypeScript">
            <button v-if="form.technologies.length > 1" type="button" class="btn btn--icon btn--danger" @click="removeTechnology(index)">
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
    <div class="experience-list">
      <div v-for="exp in experiences" :key="exp.id" class="experience-card">
        <div class="experience-card__content">
          <div class="experience-card__header">
            <div>
              <h3 class="experience-card__role">{{ exp.role }}</h3>
              <p class="experience-card__company">{{ exp.company }}</p>
            </div>
            <span class="experience-card__date">{{ exp.dateRange }}</span>
          </div>
          <p class="experience-card__description">{{ exp.description }}</p>
          <div v-if="exp.technologies?.length" class="experience-card__techs">
            <span v-for="tech in exp.technologies" :key="tech" class="tech-tag">
              {{ tech }}
            </span>
          </div>
          <div class="experience-card__meta">
            Order: {{ exp.sortOrder }}
          </div>
        </div>
        <div class="experience-card__actions">
          <button class="action-btn" @click="editExperience(exp)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
            </svg>
          </button>
          <button class="action-btn action-btn--danger" @click="handleDelete(exp.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="!experiences?.length" class="experience-empty">
        <p>No work experience yet. Add your first role to get started.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.experience-page {
  max-width: 1000px;
}

.experience-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.experience-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.experience-subtitle {
  color: var(--muted-foreground);
  margin: 0;
}

.experience-form {
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

.tech-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tech-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.tech-item .form-input {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.experience-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.experience-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.experience-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.experience-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.experience-card__role {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.experience-card__company {
  color: var(--accent);
  font-weight: var(--font-weight-medium);
  margin: var(--space-1) 0 0;
}

.experience-card__date {
  font-size: var(--text-sm);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.experience-card__description {
  color: var(--muted-foreground);
  margin: 0;
  line-height: 1.5;
}

.experience-card__techs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tech-tag {
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1) var(--space-2);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.experience-card__meta {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border);
}

.experience-card__actions {
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

.experience-empty {
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
