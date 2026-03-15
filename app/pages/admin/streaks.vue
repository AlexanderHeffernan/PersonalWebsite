<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

interface StreakDay {
  date: string
  hasContributions: boolean
}

const { data: streakDays, refresh, pending } = await useFetch<StreakDay[]>(
  '/api/admin/streak-days'
)

const isRefreshing = ref(false)
const refreshMessage = ref<string | null>(null)
const pruneBefore = ref('')
const isPruning = ref(false)
const isRecalculating = ref(false)
const pruneCount = computed(() => {
  if (!pruneBefore.value || !streakDays.value?.length) return 0
  return streakDays.value.filter((day) => day.date < pruneBefore.value).length
})

const handleToggle = async (day: StreakDay) => {
  const nextValue = !day.hasContributions
  try {
    await $fetch(`/api/admin/streak-days/${day.date}`, {
      method: 'PATCH',
      body: { hasContributions: nextValue },
    })
    await refresh()
  } catch (err) {
    alert('Failed to update streak day')
  }
}

const handleDelete = async (day: StreakDay) => {
  if (!confirm(`Delete ${day.date}?`)) return
  try {
    await $fetch(`/api/admin/streak-days/${day.date}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    alert('Failed to delete streak day')
  }
}

const handleRefreshMissing = async () => {
  isRefreshing.value = true
  refreshMessage.value = null
  try {
    const result = await $fetch<{
      updatedDays: number
      ranges: number
      zerosChecked: number
      missingChecked: number
      from: string
      to: string
    }>('/api/admin/streak-days/refresh', {
      method: 'POST',
      body: {
        from: undefined,
        to: undefined,
      },
    })
    refreshMessage.value = `Updated ${result.updatedDays} days. Checked ${result.zerosChecked} zero days and ${result.missingChecked} missing days across ${result.ranges} range(s).`
    await refresh()
  } catch (err) {
    alert('Failed to refresh missing/zero days')
  } finally {
    isRefreshing.value = false
  }
}

const handleRecalculateCache = async () => {
  isRecalculating.value = true
  refreshMessage.value = null
  try {
    const result = await $fetch<{ streak: number; calculatedDate: string }>('/api/admin/streak-days/recalculate-cache', {
      method: 'POST',
    })
    refreshMessage.value = `Cache updated. Streak is now ${result.streak} (as of ${result.calculatedDate}).`
    await refresh()
  } catch (err) {
    alert('Failed to refresh cache')
  } finally {
    isRecalculating.value = false
  }
}

const handlePrune = async () => {
  if (!pruneBefore.value) {
    alert('Select a prune date first')
    return
  }
  if (!confirm(`Prune all streak data before ${pruneBefore.value}?`)) return
  isPruning.value = true
  try {
    const result = await $fetch<{ deleted: number }>('/api/admin/streak-days/prune', {
      method: 'POST',
      body: { before: pruneBefore.value },
    })
    refreshMessage.value = `Pruned ${result.deleted} day(s) before ${pruneBefore.value}.`
    await refresh()
  } catch (err) {
    alert('Failed to prune streak days')
  } finally {
    isPruning.value = false
  }
}
</script>

<template>
  <div class="streaks-page">
    <div class="streaks-header">
      <div>
        <h1 class="streaks-title">Streak Database</h1>
        <p class="streaks-subtitle">Inspect and edit GitHub contribution days</p>
      </div>
      <div class="header-actions">
        <button class="btn btn--secondary" :disabled="pending" @click="() => refresh()">
          Reload
        </button>
        <button class="btn btn--secondary" :disabled="isRecalculating" @click="handleRecalculateCache">
          {{ isRecalculating ? 'Updating...' : 'Update Cache' }}
        </button>
        <button class="btn btn--primary" :disabled="isRefreshing" @click="handleRefreshMissing">
          <svg v-if="isRefreshing" class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          {{ isRefreshing ? 'Syncing...' : 'Sync' }}
        </button>
      </div>
    </div>

    <div class="filters-card">
      <div class="filters-actions">
        <div class="prune-control">
          <label class="form-label prune-label">Prune before</label>
          <input v-model="pruneBefore" type="date" class="form-input prune-input" />
          <button class="btn btn--danger prune-button" :disabled="isPruning || !pruneBefore" @click="handlePrune">
            {{ isPruning ? 'Pruning...' : (pruneBefore ? `Prune ${pruneCount} day(s)` : 'Prune') }}
          </button>
        </div>
        <span v-if="pending" class="filters-status">Loading...</span>
      </div>
      <p v-if="refreshMessage" class="filters-message">
        {{ refreshMessage }}
      </p>
    </div>

    <div class="streaks-table">
      <div class="streaks-table__header">
        <span>Date</span>
        <span>Status</span>
        <span class="streaks-table__actions">Actions</span>
      </div>
      <div v-for="day in streakDays" :key="day.date" class="streaks-table__row">
        <span class="streaks-table__date">{{ day.date }}</span>
        <span :class="['streaks-table__status', day.hasContributions ? 'status--yes' : 'status--no']">
          {{ day.hasContributions ? 'Contributed' : 'Zero' }}
        </span>
        <div class="streaks-table__actions">
          <button class="btn btn--sm btn--secondary" @click="handleToggle(day)">
            {{ day.hasContributions ? 'Set Zero' : 'Set Contrib' }}
          </button>
          <button class="btn btn--sm btn--danger" @click="handleDelete(day)">
            Delete
          </button>
        </div>
      </div>

      <div v-if="!streakDays?.length" class="streaks-empty">
        <p>No streak days found for this range.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.streaks-page {
  max-width: 1000px;
}

.streaks-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.streaks-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.streaks-subtitle {
  color: var(--muted-foreground);
  margin: 0;
}

.filters-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.streaks-header {
  flex-direction: row;
}

@media (max-width: 640px) {
  .streaks-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: flex-end;
}


.filters-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.filters-status {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
}

.filters-message {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--foreground);
}

.form-input {
  padding: var(--space-3);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--foreground);
  width: 100%;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.prune-control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.prune-label {
  white-space: nowrap;
  margin-right: var(--space-1);
}

.prune-input {
  min-width: 180px;
}

.prune-button {
  padding-inline: var(--space-4);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .prune-control {
    width: 100%;
    flex-wrap: wrap;
  }
}

.streaks-table {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.streaks-table__header,
.streaks-table__row {
  display: grid;
  grid-template-columns: 1fr 140px 240px;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
}

.streaks-table__header {
  background: var(--secondary);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
}

.streaks-table__row {
  border-top: 1px solid var(--border);
}

.streaks-table__date {
  font-family: var(--font-mono, monospace);
}

.streaks-table__status {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.status--yes {
  color: var(--accent);
}

.status--no {
  color: var(--destructive);
}

.streaks-table__actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.streaks-empty {
  text-align: center;
  padding: var(--space-10);
  color: var(--muted-foreground);
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

.btn--danger {
  background: color-mix(in srgb, var(--destructive), transparent 85%);
  color: var(--destructive);
  border: 1px solid color-mix(in srgb, var(--destructive), transparent 70%);
}

.btn--danger:hover {
  background: color-mix(in srgb, var(--destructive), transparent 75%);
}

.btn--sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
