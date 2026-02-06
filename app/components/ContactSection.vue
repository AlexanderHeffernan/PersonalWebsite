<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')

const handleSubmit = async () => {
  isSubmitting.value = true
  submitStatus.value = 'idle'
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: formData.value,
    })

    if (response.success) {
      submitStatus.value = 'success'
      // Reset form
      formData.value = {
        name: '',
        email: '',
        message: '',
      }
      // Reset success message after 5 seconds
      setTimeout(() => {
        submitStatus.value = 'idle'
      }, 5000)
    }
  } catch (error: any) {
    submitStatus.value = 'error'
    errorMessage.value = error.data?.message || 'Failed to send message. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section id="contact" class="contact">
    <div class="contact__container">
      <div class="contact__grid">
        <!-- Contact Info -->
        <div class="contact__info">
          <div class="contact__header">
            <h2 class="contact__title">
              Get in <span>Touch</span>
            </h2>
            <p class="contact__subtitle">
              I'm always interested in hearing about new projects, opportunities, or just having a conversation about software engineering and AI.
            </p>
          </div>

          <!-- Email -->
          <div class="contact__email">
            <div class="contact__email-content">
              <svg class="contact__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <a
                href="mailto:heffernan.alexander@icloud.com"
                class="contact__email-link"
              >
                heffernan.alexander@icloud.com
              </a>
            </div>
          </div>

          <!-- Socials -->
          <div class="contact__socials">
            <h3 class="contact__socials-title">Connect</h3>
            <div class="contact__socials-grid">
              <a
                href="https://github.com/AlexanderHeffernan"
                target="_blank"
                rel="noopener noreferrer"
                class="contact__social-link"
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/alexander-heffernan/"
                target="_blank"
                rel="noopener noreferrer"
                class="contact__social-link"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="contact__form-wrapper">
          <form @submit.prevent="handleSubmit" class="contact__form">
            <div class="contact__field">
              <label for="name" class="contact__label">Name</label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                class="contact__input"
                required
                :disabled="isSubmitting"
              />
            </div>

            <div class="contact__field">
              <label for="email" class="contact__label">Email</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                class="contact__input"
                required
                :disabled="isSubmitting"
              />
            </div>

            <div class="contact__field">
              <label for="message" class="contact__label">Message</label>
              <textarea
                id="message"
                v-model="formData.message"
                rows="5"
                class="contact__textarea"
                required
                :disabled="isSubmitting"
              />
            </div>

            <div v-if="submitStatus === 'success'" class="contact__success">
              ✓ Message sent successfully! I'll get back to you soon.
            </div>

            <div v-if="submitStatus === 'error'" class="contact__error">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              class="contact__submit"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: var(--space-24, 6rem) var(--space-4, 1rem);
  border-top: 1px solid var(--border);
}

.contact__container {
  max-width: var(--max-width-7xl, 80rem);
  margin: 0 auto;
  padding: 0 var(--space-6, 1.5rem);
}

.contact__grid {
  display: grid;
  gap: var(--space-12, 3rem);
}

@media (min-width: 1024px) {
  .contact__grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-16, 4rem);
  }
}

.contact__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 2rem);
}

.contact__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.contact__title {
  font-size: var(--text-3xl, 1.875rem);
  font-weight: 700;
  letter-spacing: -0.025em;
}

@media (min-width: 640px) {
  .contact__title {
    font-size: var(--text-4xl, 2.25rem);
  }
}

.contact__title span {
  color: var(--accent);
}

.contact__subtitle {
  color: var(--muted-foreground);
  max-width: 36rem;
  line-height: 1.6;
}

.contact__email {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.contact__email-content {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  color: var(--muted-foreground);
}

.contact__icon {
  color: var(--accent);
  flex-shrink: 0;
}

.contact__email-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.contact__email-link:hover {
  color: var(--accent);
}

.contact__socials {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.contact__socials-title {
  font-size: var(--text-sm, 0.875rem);
  font-family: var(--font-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
}

.contact__socials-grid {
  display: flex;
  gap: var(--space-4, 1rem);
}

.contact__social-link {
  padding: var(--space-3, 0.75rem);
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 0.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: currentColor;
  text-decoration: none;
}

.contact__social-link:hover {
  border-color: rgba(var(--accent-rgb), 0.5);
  background: rgba(var(--accent-rgb), 0.1);
}

.contact__form-wrapper {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 0.5rem);
  padding: var(--space-6, 1.5rem);
}

@media (min-width: 1024px) {
  .contact__form-wrapper {
    padding: var(--space-8, 2rem);
  }
}

.contact__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
}

.contact__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
}

.contact__label {
  font-size: var(--text-sm, 0.875rem);
  font-weight: 500;
}

.contact__input,
.contact__textarea {
  width: 100%;
  padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
  background: var(--input-background, var(--background));
  border: 1px solid var(--input, var(--border));
  border-radius: var(--radius-lg, 0.5rem);
  font-family: inherit;
  font-size: var(--text-base, 1rem);
  color: var(--foreground);
  transition: all 0.2s;
}

.contact__input:focus,
.contact__textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.contact__input:disabled,
.contact__textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.contact__textarea {
  resize: none;
  min-height: 120px;
}

.contact__success {
  padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: var(--radius, 0.375rem);
  color: rgb(34, 197, 94);
  font-size: var(--text-sm, 0.875rem);
}

.contact__error {
  padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius, 0.375rem);
  color: rgb(239, 68, 68);
  font-size: var(--text-sm, 0.875rem);
}

.contact__submit {
  width: 100%;
  padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
  background: var(--accent);
  color: var(--accent-foreground, white);
  border: none;
  border-radius: var(--radius-lg, 0.5rem);
  font-weight: 500;
  font-size: var(--text-base, 1rem);
  cursor: pointer;
  transition: all 0.2s;
}

.contact__submit:hover:not(:disabled) {
  background: var(--accent-hover, var(--accent));
  opacity: 0.9;
}

.contact__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
