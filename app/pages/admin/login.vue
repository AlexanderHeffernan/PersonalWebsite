<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const loading = ref(false)
const error = ref('')

// Check if already logged in
onMounted(async () => {
  try {
    await $fetch('/api/auth/me', { credentials: 'include' })
    navigateTo('/admin/projects')
  } catch {
    // Not logged in, stay on login page
  }
})

const loginWithGithub = () => {
  loading.value = true
  window.location.href = '/api/auth/github'
}

const route = useRoute()
if (route.query.error) {
  error.value = route.query.error as string
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">Admin Login</h1>
        <p class="login-subtitle">Sign in to manage your portfolio content</p>
      </div>

      <div class="login-card">
        <div v-if="error" class="login-error">
          <p>{{ error }}</p>
        </div>

        <button
          :disabled="loading"
          class="login-button"
          @click="loginWithGithub"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
            <path d="M9 18c-4.51 2-5-2-7-2"/>
          </svg>
          {{ loading ? 'Redirecting...' : 'Sign in with GitHub' }}
        </button>

        <div class="login-note">
          <p>
            <strong>Note:</strong> Only authorized GitHub accounts can access the admin panel.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  padding-top: var(--space-16);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.login-title {
  font-size: 1.875rem;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.login-subtitle {
  color: var(--muted-foreground);
  margin: 0;
}

.login-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
}

.login-error {
  padding: var(--space-3);
  background: color-mix(in srgb, var(--destructive), transparent 90%);
  border: 1px solid color-mix(in srgb, var(--destructive), transparent 80%);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
}

.login-error p {
  font-size: var(--text-sm);
  color: var(--destructive);
  margin: 0;
}

.login-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  background: var(--accent);
  color: var(--accent-foreground);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background 0.2s ease;
}

.login-button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent), #000 10%);
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-note {
  margin-top: var(--space-6);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--muted), transparent 50%);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.login-note p {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  margin: 0;
}
</style>
