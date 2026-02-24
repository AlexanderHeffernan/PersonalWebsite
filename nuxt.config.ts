// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/sitemap', 'nuxt-schema-org'],
  site: {
    url: 'https://alexheffernan.dev',
    name: 'Alexander Heffernan',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s | Alexander Heffernan',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'author', content: 'Alexander Heffernan' },
        { property: 'og:site_name', content: 'Alexander Heffernan' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_NZ' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://alexheffernan.dev' },
      ],
    },
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },
  typescript: {
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  },
  css: [
    '~/assets/css/main.css',
    'highlight.js/styles/github-dark.min.css',
  ],
  runtimeConfig: {
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
  },
})
