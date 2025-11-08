import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Global styles
import './assets/global.css'

const app = createApp(App)

// Global properties
app.config.globalProperties.$filters = {
  currency(value) {
    if (typeof value !== 'number') {
      return 'RM 0.00'
    }
    return 'RM ' + value.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  },
  date(value) {
    if (!value) return ''
    return new Date(value).toLocaleDateString('en-MY')
  }
}

app.use(router)
app.mount('#app')