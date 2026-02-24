<script setup lang="ts">
useSeoMeta({
  title: 'Alexander Heffernan — Software Engineer',
  titleTemplate: '%s',
  description: 'Software Engineer based in New Zealand specializing in Artificial Intelligence. Quality-first, AI-driven development — building production-ready software without cutting corners.',
  ogTitle: 'Alexander Heffernan — Software Engineer',
  ogDescription: 'Software Engineer based in New Zealand specializing in AI. Quality-first engineering, full-stack development, and AI-assisted software projects.',
  ogImage: 'https://alexheffernan.dev/headshot.jpeg',
  ogUrl: 'https://alexheffernan.dev',
  twitterTitle: 'Alexander Heffernan — Software Engineer',
  twitterDescription: 'Software Engineer in NZ specializing in AI. Quality-first, AI-driven development.',
  twitterImage: 'https://alexheffernan.dev/headshot.jpeg',
})

useSchemaOrg([
  definePerson({
    name: 'Alexander Heffernan',
    url: 'https://alexheffernan.dev',
    image: 'https://alexheffernan.dev/headshot.jpeg',
    jobTitle: 'Software Engineer',
    description: 'Software Engineer based in New Zealand specializing in Artificial Intelligence and quality-first development.',
    sameAs: [
      'https://github.com/AlexanderHeffernan',
      'https://www.linkedin.com/in/alexander-heffernan/',
      'https://x.com/AlexH2035',
    ],
  }),
  defineWebSite({
    name: 'Alexander Heffernan',
    url: 'https://alexheffernan.dev',
    description: 'Portfolio and blog of Alexander Heffernan — Software Engineer specializing in AI-driven, quality-first development.',
  }),
])
</script>

<template>
  <main>
    <HeroSection />
    <FeaturedProjects />
    <AboutSection />
    <WorkExperience />
    <Education />
    <WritingList />
    <ContactSection />
  </main>
</template>
