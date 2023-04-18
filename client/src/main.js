import './main.css'
import 'floating-vue/dist/style.css'
import 'virtual:windi.css'

import { createApp } from 'vue'
import FloatingVue from 'floating-vue'

import App from './App.vue'
import router from './router/index.js'
import store from './store/index.js'

import { registerSW } from 'virtual:pwa-register'


registerSW({ immediate: true })

const app = createApp(App)
  .use(router)
  .use(store)
  .use(FloatingVue)
  .mount('#app')

if (window.Cypress) {
  // only available during E2E tests
  window.app = app

  if (window.navigator && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
      })
  }
  /* eslint-disable */
  delete window.navigator.__proto__.ServiceWorker
  delete window.navigator.serviceWorker
}
