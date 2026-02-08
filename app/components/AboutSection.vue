<script setup lang="ts">
interface AboutContent {
  id: number
  bioParagraphs: string[]
  highlights: string[]
  updatedAt: string
}

const { data: about } = await useFetch<AboutContent>('/api/about')

const expanded = ref(false)
</script>

<template>
  <section id="about" class="about">
    <div class="about__container">
      <div class="about__grid">
        <!-- Bio -->
        <div class="about__bio">
          <h2 class="about__title">
            About <span>Me</span>
          </h2>
          <div class="about__paragraphs-wrapper" :class="{ 'about__paragraphs-wrapper--expanded': expanded }">
            <div class="about__paragraphs">
              <p v-for="(paragraph, index) in about?.bioParagraphs" :key="index" class="about__text">
                {{ paragraph }}
              </p>
            </div>
            <div class="about__fade" />
          </div>
          <button
            class="about__toggle"
            :aria-expanded="expanded"
            :aria-label="expanded ? 'Collapse bio' : 'Expand bio'"
            @click="expanded = !expanded"
          >
            <span class="about__toggle-line" />
            <svg
              class="about__toggle-chevron"
              :class="{ 'about__toggle-chevron--up': expanded }"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="about__toggle-line" />
          </button>
        </div>

        <!-- Highlights -->
        <div class="about__highlights">
          <h3 class="about__subtitle">What I Focus On</h3>
          <ul class="about__list">
            <li v-for="(highlight, index) in about?.highlights" :key="index" class="about__item">
              <svg class="about__check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
              </svg>
              <span class="about__highlight-text">{{ highlight }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  padding: var(--space-24, 6rem) var(--space-6);
  border-top: 1px solid var(--border);
  background-color: var(--muted);
}

.about__container {
  max-width: 1200px;
  margin: 0 auto;
}

.about__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-12, 3rem);
}

@media (min-width: 1024px) {
  .about__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-16, 4rem);
  }
}

.about__bio {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
}

.about__title {
  font-size: clamp(1.875rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin: 0;
}

.about__title span {
  color: var(--accent);
}

.about__paragraphs-wrapper {
  position: relative;
  max-height: 9em;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.about__paragraphs-wrapper--expanded {
  max-height: 100em;
}

.about__fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2em;
  background: linear-gradient(to bottom, transparent, var(--muted));
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.about__paragraphs-wrapper--expanded .about__fade {
  opacity: 0;
}

.about__toggle {
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

.about__toggle:hover {
  color: var(--foreground);
}

.about__toggle-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.about__toggle-chevron {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.about__toggle-chevron--up {
  transform: rotate(180deg);
}

@media (min-width: 640px) {
  .about__paragraphs-wrapper {
    max-height: none;
    overflow: visible;
  }

  .about__fade {
    display: none;
  }

  .about__toggle {
    display: none;
  }
}

.about__paragraphs {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.about__text {
  color: var(--muted-foreground);
  line-height: 1.7;
  margin: 0;
}

.about__highlights {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
}

.about__subtitle {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
}

.about__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
  list-style: none;
  margin: 0;
  padding: 0;
}

.about__item {
  display: flex;
  gap: var(--space-3, 0.75rem);
  align-items: flex-start;
}

.about__check {
  flex-shrink: 0;
  color: var(--accent);
  margin-top: 0.125rem;
}

.about__highlight-text {
  color: var(--muted-foreground);
  line-height: 1.6;
}
</style>
