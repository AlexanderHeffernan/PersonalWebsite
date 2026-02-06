<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

interface ContactSubmission {
  id: number
  name: string
  email: string
  message: string
  status: 'unread' | 'read' | 'archived'
  createdAt: string
}

const { data: submissions, refresh } = await useFetch<ContactSubmission[]>('/api/admin/contact')

const filterStatus = ref<'all' | 'unread' | 'read' | 'archived'>('all')

const filteredSubmissions = computed(() => {
  if (!submissions.value) return []
  if (filterStatus.value === 'all') return submissions.value
  return submissions.value.filter(s => s.status === filterStatus.value)
})

const unreadCount = computed(() => {
  return submissions.value?.filter(s => s.status === 'unread').length || 0
})

const handleStatusChange = async (id: number, status: string) => {
  try {
    await $fetch(`/api/admin/contact/${id}`, {
      method: 'PUT',
      body: { status },
    })
    await refresh()
  } catch (err) {
    alert('Failed to update submission status')
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this submission?')) return

  try {
    await $fetch(`/api/admin/contact/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    alert('Failed to delete submission')
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'unread': return 'status-unread'
    case 'read': return 'status-read'
    case 'archived': return 'status-archived'
    default: return ''
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<template>
  <div class="contact-page">
    <div class="contact-header">
      <div>
        <h1 class="contact-title">Contact Submissions</h1>
        <p class="contact-subtitle">
          View and manage messages from your contact form
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }} unread</span>
        </p>
      </div>
    </div>

    <div class="filters">
      <button
        :class="['filter-btn', { active: filterStatus === 'all' }]"
        @click="filterStatus = 'all'"
      >
        All
      </button>
      <button
        :class="['filter-btn', { active: filterStatus === 'unread' }]"
        @click="filterStatus = 'unread'"
      >
        Unread
        <span v-if="unreadCount > 0" class="count-badge">{{ unreadCount }}</span>
      </button>
      <button
        :class="['filter-btn', { active: filterStatus === 'read' }]"
        @click="filterStatus = 'read'"
      >
        Read
      </button>
      <button
        :class="['filter-btn', { active: filterStatus === 'archived' }]"
        @click="filterStatus = 'archived'"
      >
        Archived
      </button>
    </div>

    <div class="submissions-list">
      <div v-for="submission in filteredSubmissions" :key="submission.id" class="submission-card">
        <div class="submission-header">
          <div class="submission-info">
            <h3 class="submission-name">{{ submission.name }}</h3>
            <a :href="`mailto:${submission.email}`" class="submission-email">
              {{ submission.email }}
            </a>
          </div>
          <div class="submission-meta">
            <span :class="['status-badge', getStatusColor(submission.status)]">
              {{ submission.status }}
            </span>
            <span class="submission-date">{{ formatDate(submission.createdAt) }}</span>
          </div>
        </div>

        <div class="submission-message">
          <p>{{ submission.message }}</p>
        </div>

        <div class="submission-actions">
          <select
            :value="submission.status"
            @change="(e) => handleStatusChange(submission.id, (e.target as HTMLSelectElement).value)"
            class="status-select"
          >
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>

          <button
            class="action-btn action-btn--danger"
            @click="handleDelete(submission.id)"
            aria-label="Delete submission"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="!filteredSubmissions?.length" class="submissions-empty">
        <p v-if="filterStatus === 'all'">No contact submissions yet.</p>
        <p v-else>No {{ filterStatus }} submissions.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
  max-width: 1000px;
}

.contact-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.contact-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.contact-subtitle {
  color: var(--muted-foreground);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius);
  color: rgb(239, 68, 68);
  font-size: 0.75rem;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--foreground);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--accent);
  color: var(--accent-foreground);
  border-color: var(--accent);
}

.filter-btn.active {
  background: var(--accent);
  color: var(--accent-foreground);
  border-color: var(--accent);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--accent-foreground);
  color: var(--accent);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.submission-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.submission-info {
  flex: 1;
  min-width: 200px;
}

.submission-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 var(--space-1);
}

.submission-email {
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: color 0.2s;
}

.submission-email:hover {
  color: var(--accent);
}

.submission-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.status-badge {
  padding: 4px 10px;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-unread {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.status-read {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status-archived {
  background: rgba(156, 163, 175, 0.1);
  color: rgb(107, 114, 128);
}

.submission-date {
  color: var(--muted-foreground);
  font-size: var(--text-sm);
}

.submission-message {
  padding: var(--space-4);
  background: var(--secondary);
  border-radius: var(--radius);
  margin-bottom: var(--space-4);
}

.submission-message p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
}

.submission-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.status-select {
  padding: var(--space-2) var(--space-3);
  background: var(--input-background, var(--background));
  border: 1px solid var(--input, var(--border));
  border-radius: var(--radius);
  font-size: var(--text-sm);
  color: var(--foreground);
  cursor: pointer;
  transition: border-color 0.2s;
}

.status-select:focus {
  outline: none;
  border-color: var(--accent);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--foreground);
  margin-left: auto;
}

.action-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-foreground);
}

.action-btn--danger:hover {
  background: rgb(239, 68, 68);
  border-color: rgb(239, 68, 68);
  color: white;
}

.submissions-empty {
  text-align: center;
  padding: var(--space-12);
  color: var(--muted-foreground);
}

.submissions-empty p {
  margin: 0;
}
</style>
