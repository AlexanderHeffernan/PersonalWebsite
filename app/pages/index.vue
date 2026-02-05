<script setup lang="ts">
const { data: projects } = await useFetch('/api/projects');
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