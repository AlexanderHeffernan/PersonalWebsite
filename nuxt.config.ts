// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  typescript: {
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  },
  css: ['~/assets/css/main.css']
})
