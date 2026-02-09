<script setup lang="ts">
interface ProjectImage {
  id: number
  url: string
  alt: string | null
}

interface Project {
  id: number
  slug: string
  title: string
  description: string
  content: string | null
  githubUrl: string | null
  liveUrl: string | null
  tags: string[]
  images: ProjectImage[]
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const slug = route.params.slug as string

const { data: project, error } = await useFetch<Project>(`/api/projects/${slug}`)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Project not found' })
}

const { renderMarkdown } = useMarkdown()

const selectedImage = ref(0)

const contentHtml = computed(() => {
  return renderMarkdown(project.value?.content || '')
})
</script>

<template>
  <div v-if="project" class="project-page">
    <!-- Back button -->
    <div class="project-page__nav">
      <NuxtLink to="/projects" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Back to projects
      </NuxtLink>
    </div>

    <!-- Image Gallery -->
    <section v-if="project.images.length > 0" class="project-page__gallery">
      <div class="project-page__container">
        <div class="gallery">
          <div class="gallery__main">
            <img
              :src="project.images[selectedImage]?.url"
              :alt="project.images[selectedImage]?.alt || `${project.title} screenshot`"
            />
          </div>
          <div v-if="project.images.length > 1" class="gallery__thumbs">
            <button
              v-for="(image, index) in project.images"
              :key="image.id"
              :class="['gallery__thumb', { 'gallery__thumb--active': selectedImage === index }]"
              @click="selectedImage = index"
            >
              <img :src="image.url" :alt="image.alt || `Thumbnail ${index + 1}`" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Project header & content -->
    <section class="project-page__content">
      <div class="project-page__container">
        <div class="project-page__grid">
          <!-- Main content -->
          <div class="project-page__main">
            <!-- Title & description -->
            <div class="project-page__header">
              <h1 class="project-page__title">{{ project.title }}</h1>
              <p class="project-page__description">{{ project.description }}</p>
            </div>

            <!-- Content sections -->
            <ClientOnly>
              <div v-if="project.content" class="prose" v-html="contentHtml" />
            </ClientOnly>
          </div>

          <!-- Sidebar -->
          <aside class="project-page__sidebar">
            <div class="sidebar">
              <!-- Links -->
              <div class="sidebar__section">
                <h3 class="sidebar__title">Links</h3>
                <div class="sidebar__links">
                  <a
                    v-if="project.githubUrl"
                    :href="project.githubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-card"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                      <path d="M9 18c-4.51 2-5-2-7-2"/>
                    </svg>
                    <div class="link-card__text">
                      <span class="link-card__label">View on GitHub</span>
                      <span class="link-card__sub">Source code</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="link-card__arrow">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                  <a
                    v-if="project.liveUrl"
                    :href="project.liveUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-card"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <div class="link-card__text">
                      <span class="link-card__label">Live Demo</span>
                      <span class="link-card__sub">Visit site</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="link-card__arrow">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              </div>

              <!-- Technologies -->
              <div class="sidebar__section">
                <h3 class="sidebar__title">Technologies</h3>
                <div class="sidebar__tags">
                  <span v-for="tag in project.tags" :key="tag" class="sidebar__tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.project-page {
  overflow-x: hidden;
}

.project-page__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  min-width: 0;
}

.project-page__nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--foreground);
}

/* Gallery */
.project-page__gallery {
  padding-bottom: var(--space-12);
}

.gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.gallery__main {
  position: relative;
  max-height: 480px;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.gallery__main img {
  width: 100%;
  height: 100%;
  max-height: 480px;
  object-fit: contain;
  background: var(--secondary);
}

.gallery__thumbs {
  display: flex;
  flex-direction: row;
  gap: var(--space-2);
  overflow-x: auto;
  padding: 2px 0;
}

.gallery__thumb {
  position: relative;
  width: 72px;
  height: 56px;
  min-width: 56px;
  min-height: 40px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: border-color 0.2s ease;
  background: transparent;
  padding: 0;
  flex: 0 0 auto;
}

.gallery__thumb:hover {
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
}

.gallery__thumb--active {
  border-color: var(--accent);
}

.gallery__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Content Grid */
.project-page__content {
  padding-bottom: var(--space-24);
}

.project-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
}

@media (min-width: 1024px) {
  .project-page__grid {
    grid-template-columns: 2fr 1fr;
  }
}

/* Main content */
.project-page__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  min-width: 0;
}

.project-page__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.project-page__title {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.1;
}

.project-page__description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--muted-foreground);
  margin: 0;
  line-height: 1.6;
}

/* Prose */
.prose {
  max-width: 72ch;
  color: var(--muted-foreground);
  line-height: 1.7;
}

.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--foreground);
  margin: var(--space-10) 0 var(--space-4);
}

.prose :deep(h2:first-child) {
  margin-top: 0;
}

.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold, 600);
  color: var(--foreground);
  margin: var(--space-8) 0 var(--space-3);
}

.prose :deep(h4) {
  font-size: 1.1rem;
  font-weight: var(--font-weight-semibold, 600);
  color: var(--foreground);
  margin: var(--space-6) 0 var(--space-2);
}

.prose :deep(p) {
  margin: 0 0 var(--space-4);
}

.prose :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose :deep(a:hover) {
  opacity: 0.8;
}

.prose :deep(strong) {
  color: var(--foreground);
  font-weight: var(--font-weight-semibold, 600);
}

.prose :deep(ul) {
  margin: var(--space-4) 0;
  padding-left: var(--space-6);
  list-style: none;
}

.prose :deep(ol) {
  margin: var(--space-4) 0;
  padding-left: var(--space-6);
}

.prose :deep(li) {
  position: relative;
  margin-bottom: var(--space-2);
  padding-left: var(--space-4);
}

.prose :deep(ul > li)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
}

.prose :deep(ol > li) {
  padding-left: 0;
}

.prose :deep(blockquote) {
  margin: var(--space-6) 0;
  padding: var(--space-4) var(--space-6);
  border-left: 3px solid var(--accent);
  background: var(--secondary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.prose :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.prose :deep(code) {
  font-family: var(--font-mono, monospace);
  font-size: 0.875em;
  padding: 0.15em 0.4em;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.prose :deep(pre) {
  margin: var(--space-6) 0;
  padding: var(--space-4);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
  font-size: var(--text-sm);
  line-height: 1.6;
}

.prose :deep(table) {
  width: 100%;
  margin: var(--space-6) 0;
  border-collapse: collapse;
}

.prose :deep(th) {
  text-align: left;
  font-weight: var(--font-weight-semibold, 600);
  color: var(--foreground);
  padding: var(--space-2) var(--space-4);
  border-bottom: 2px solid var(--border);
}

.prose :deep(td) {
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--border);
}

.prose :deep(hr) {
  margin: var(--space-8) 0;
  border: none;
  border-top: 1px solid var(--border);
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-lg);
  margin: var(--space-6) 0;
}

/* Sidebar */
.project-page__sidebar {
  order: -1;
  min-width: 0;
}

@media (min-width: 1024px) {
  .project-page__sidebar {
    order: 0;
  }
}

.sidebar {
  position: sticky;
  top: var(--space-24, 6rem);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.sidebar__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sidebar__title {
  font-size: var(--text-sm);
  font-family: var(--font-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  margin: 0;
}

.sidebar__links {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.link-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.link-card:hover {
  border-color: color-mix(in srgb, var(--accent), transparent 50%);
  background: color-mix(in srgb, var(--accent), transparent 95%);
}

.link-card svg {
  color: var(--muted-foreground);
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.link-card:hover svg {
  color: var(--accent);
}

.link-card__text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.link-card__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  transition: color 0.2s ease;
}

.link-card:hover .link-card__label {
  color: var(--accent);
}

.link-card__sub {
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  color: var(--muted-foreground);
}

.link-card__arrow {
  opacity: 0.5;
}

.sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.sidebar__tag {
  font-size: var(--text-xs);
  font-family: var(--font-mono, monospace);
  padding: var(--space-1) var(--space-3);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 999px;
}
</style>
