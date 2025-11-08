import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Create Vue app
const app = createApp(App)

// Global properties for filters
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

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// Use router
app.use(router)

// Mount app
app.mount('#app')

console.log('BizFlow ERP Frontend loaded successfully')