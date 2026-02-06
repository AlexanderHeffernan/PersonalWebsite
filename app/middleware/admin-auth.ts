export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') {
    return
  }

  // Only run on client-side to avoid SSR cookie issues
  if (import.meta.server) {
    return
  }

  try {
    await $fetch('/api/auth/me', { credentials: 'include' })
  } catch {
    return navigateTo('/admin/login')
  }
})
