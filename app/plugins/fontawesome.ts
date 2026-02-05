import { library } from '@fortawesome/fontawesome-svg-core'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default defineNuxtPlugin((nuxtApp) => {
  library.add(faSun, faMoon)
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
