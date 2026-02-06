<script setup lang="ts">
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

const { data: educationList } = await useFetch<Education[]>('/api/education')
</script>

<template>
  <section id="education" class="education">
    <div class="education__container">
      <!-- Section header -->
      <div class="education__header">
        <h2 class="education__title">
          <span>Education</span>
        </h2>
        <p class="education__subtitle">
          Academic foundation in computer science and software engineering.
        </p>
      </div>

      <!-- Education grid -->
      <div class="education__grid">
        <div v-for="edu in educationList" :key="edu.id" class="education__card">
          <div class="education__content">
            <div class="education__info">
              <h3 class="education__degree">
                {{ edu.degree }}
                <span v-if="edu.field" class="education__field">in {{ edu.field }}</span>
              </h3>
              <p class="education__institution">{{ edu.institution }}</p>
            </div>

            <p class="education__date">{{ edu.dateRange }}</p>

            <p v-if="edu.description" class="education__description">
              {{ edu.description }}
            </p>

            <div v-if="edu.achievements?.length" class="education__achievements">
              <span v-for="achievement in edu.achievements" :key="achievement" class="education__achievement">
                {{ achievement }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.education {
  padding: var(--space-24, 6rem) var(--space-6);
  border-top: 1px solid var(--border);
  background: var(--muted, #f8f8f8);
}

.education__container {
  max-width: 1200px;
  margin: 0 auto;
}

.education__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
  margin-bottom: var(--space-12, 3rem);
}

.education__title {
  font-size: clamp(1.875rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin: 0;
}

.education__title span {
  color: var(--accent);
}

.education__subtitle {
  color: var(--muted-foreground);
  max-width: 42rem;
  margin: 0;
}

.education__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-6, 1.5rem);
}

@media (min-width: 768px) {
  .education__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.education__card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6, 1.5rem);
  transition: border-color 0.2s ease;
}

.education__card:hover {
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
}

.education__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.education__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.education__degree {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
}

.education__field {
  color: var(--muted-foreground);
  font-weight: var(--font-weight-normal);
}

.education__institution {
  color: var(--accent);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

.education__date {
  font-size: var(--text-sm);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border);
  margin: 0;
}

.education__description {
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: 0;
}

.education__achievements {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  padding-top: var(--space-2);
}

.education__achievement {
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
</style>
