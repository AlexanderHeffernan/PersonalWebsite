<script setup lang="ts">
interface AboutContent {
  id: number
  bioParagraphs: string[]
  highlights: string[]
  updatedAt: string
}

const { data: about } = await useFetch<AboutContent>('/api/about')
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
          <div class="about__paragraphs">
            <p v-for="(paragraph, index) in about?.bioParagraphs" :key="index" class="about__text">
              {{ paragraph }}
            </p>
          </div>
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
