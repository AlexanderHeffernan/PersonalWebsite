<script setup lang="ts">
type Project = {
  id: number
  name: string
  created_at: string
}

const { data: projects } = await useFetch<Project[]>('/api/projects', {
  default: () => []
})
</script>

<template>
    <main>
        <h1>Projects</h1>
        <ul>
            <li v-for="project in projects" :key="project.id">
                {{ project.name }} (Created at: {{ project.created_at }})
            </li>
        </ul>
    </main>
</template>