<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

navigateTo('/admin/projects')
</script>

<template>
  <div>Redirecting...</div>
</template>
