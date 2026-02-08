<script setup lang="ts">
interface WorkExperience {
  id: number
  company: string
  role: string
  dateRange: string
  description: string
  technologies: string[]
  sortOrder: number
}

const { data: experiences } = await useFetch<WorkExperience[]>('/api/experience')

const expandedIds = ref<Set<number>>(new Set())

function toggleExpanded(id: number) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
  expandedIds.value = new Set(expandedIds.value)
}
</script>

<template>
  <section id="experience" class="experience">
    <div class="experience__container">
      <!-- Section header -->
      <div class="experience__header">
        <h2 class="experience__title">
          Work <span>Experience</span>
        </h2>
        <p class="experience__subtitle">
          Hands-on experience in small teams, building and maintaining real-world software.
        </p>
      </div>

      <!-- Experience timeline -->
      <div class="experience__timeline">
        <div v-for="exp in experiences" :key="exp.id" class="experience__item">
          <!-- Timeline dot -->
          <div class="experience__dot" />

          <!-- Content -->
          <div class="experience__content">
            <div class="experience__meta">
              <div>
                <h3 class="experience__role">{{ exp.role }}</h3>
                <p class="experience__company">{{ exp.company }}</p>
              </div>
              <span class="experience__date">{{ exp.dateRange }}</span>
            </div>

            <div class="experience__description-wrapper" :class="{ 'experience__description-wrapper--expanded': expandedIds.has(exp.id) }">
              <p class="experience__description">{{ exp.description }}</p>
              <div class="experience__fade" />
            </div>
            <button
              class="experience__toggle"
              :aria-expanded="expandedIds.has(exp.id)"
              :aria-label="expandedIds.has(exp.id) ? 'Collapse description' : 'Expand description'"
              @click="toggleExpanded(exp.id)"
            >
              <span class="experience__toggle-line" />
              <svg
                class="experience__toggle-chevron"
                :class="{ 'experience__toggle-chevron--up': expandedIds.has(exp.id) }"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span class="experience__toggle-line" />
            </button>

            <div v-if="exp.technologies?.length" class="experience__techs">
              <span v-for="tech in exp.technologies" :key="tech" class="experience__tech">
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experience {
  padding: var(--space-24, 6rem) var(--space-6);
  border-top: 1px solid var(--border);
}

.experience__container {
  max-width: 1200px;
  margin: 0 auto;
}

.experience__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
  margin-bottom: var(--space-12, 3rem);
}

.experience__title {
  font-size: clamp(1.875rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin: 0;
}

.experience__title span {
  color: var(--accent);
}

.experience__subtitle {
  color: var(--muted-foreground);
  max-width: 42rem;
  margin: 0;
}

.experience__timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 2rem);
}

.experience__item {
  position: relative;
  padding-left: var(--space-8, 2rem);
  padding-bottom: var(--space-8, 2rem);
  border-left: 2px solid var(--border);
}

.experience__item:last-child {
  padding-bottom: 0;
}

.experience__dot {
  position: absolute;
  left: -9px;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 4px solid var(--background);
}

.experience__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.experience__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .experience__meta {
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
  }
}

.experience__role {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
}

.experience__company {
  color: var(--accent);
  font-weight: var(--font-weight-medium);
  margin: var(--space-1) 0 0;
}

.experience__date {
  font-size: var(--text-sm);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.experience__description-wrapper {
  position: relative;
  max-height: 9em;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.experience__description-wrapper--expanded {
  max-height: 100em;
}

.experience__fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2em;
  background: linear-gradient(to bottom, transparent, var(--background));
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.experience__description-wrapper--expanded .experience__fade {
  opacity: 0;
}

.experience__description {
  color: var(--muted-foreground);
  line-height: 1.7;
  margin: 0;
}

.experience__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  width: 100%;
  padding: var(--space-2, 0.5rem) 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted-foreground);
  transition: color 0.2s ease;
}

.experience__toggle:hover {
  color: var(--foreground);
}

.experience__toggle-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.experience__toggle-chevron {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.experience__toggle-chevron--up {
  transform: rotate(180deg);
}

@media (min-width: 640px) {
  .experience__description-wrapper {
    max-height: none;
    overflow: visible;
  }

  .experience__fade {
    display: none;
  }

  .experience__toggle {
    display: none;
  }
}

.experience__techs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  padding-top: var(--space-2);
}

.experience__tech {
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
</style>
