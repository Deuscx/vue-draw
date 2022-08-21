import { createApp } from 'vue'
import * as Vue from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'
import { enableVueBindings } from '@syncedstore/core'
import App from './App.vue'

// make SyncedStore use Vuejs internally
enableVueBindings(Vue)

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
app.use(router)
app.mount('#app')
