import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import CustomerManagement from '../components/accounting/CustomerManagement.vue'
import SSTTemplates from '../components/compliance/SSTTemplates.vue'
import PayrollCalculator from '../components/hr/PayrollCalculator.vue'
import ProductManagement from '../components/inventory/ProductManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: CustomerManagement
  },
  {
    path: '/compliance',
    name: 'Compliance',
    component: SSTTemplates
  },
  {
    path: '/hr',
    name: 'HR',
    component: PayrollCalculator
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: ProductManagement
  },
  // Catch all route - redirect to dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router