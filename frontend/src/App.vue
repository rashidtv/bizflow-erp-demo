<template>
  <div id="app">
    <!-- Modern Navigation -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="brand-logo">🏢</div>
          <span class="brand-text">BizFlow ERP</span>
        </div>
        
        <!-- Desktop Navigation -->
        <div class="nav-links desktop">
          <router-link 
            to="/" 
            class="nav-link"
            :class="{ active: $route.path === '/' }"
          >
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </router-link>
          
          <router-link 
            to="/accounting" 
            class="nav-link"
            :class="{ active: $route.path === '/accounting' }"
          >
            <span class="nav-icon">🧾</span>
            <span class="nav-text">Accounting</span>
          </router-link>
          
          <router-link 
            to="/compliance" 
            class="nav-link"
            :class="{ active: $route.path === '/compliance' }"
          >
            <span class="nav-icon">📋</span>
            <span class="nav-text">Compliance</span>
          </router-link>
          
          <router-link 
            to="/hr" 
            class="nav-link"
            :class="{ active: $route.path === '/hr' }"
          >
            <span class="nav-icon">💰</span>
            <span class="nav-text">HR & Payroll</span>
          </router-link>
          
          <router-link 
            to="/inventory" 
            class="nav-link"
            :class="{ active: $route.path === '/inventory' }"
          >
            <span class="nav-icon">📦</span>
            <span class="nav-text">Inventory</span>
          </router-link>
        </div>
        
        <div class="nav-right">
          <div class="nav-user">
            <div class="user-avatar">
              ST
            </div>
            <div class="user-info">
              <div class="user-name">Sarah Tan</div>
              <div class="user-company">Sarah Consulting</div>
            </div>
          </div>
          
          <!-- Mobile Menu Button -->
          <button class="mobile-menu-btn" @click="toggleMobileMenu">
            <span class="menu-icon" :class="{ open: mobileMenuOpen }">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div class="mobile-nav" :class="{ open: mobileMenuOpen }">
        <div class="mobile-nav-links">
          <router-link 
            to="/" 
            class="mobile-nav-link"
            :class="{ active: $route.path === '/' }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </router-link>
          
          <router-link 
            to="/accounting" 
            class="mobile-nav-link"
            :class="{ active: $route.path === '/accounting' }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">🧾</span>
            <span class="nav-text">Accounting</span>
          </router-link>
          
          <router-link 
            to="/compliance" 
            class="mobile-nav-link"
            :class="{ active: $route.path === '/compliance' }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">📋</span>
            <span class="nav-text">Compliance</span>
          </router-link>
          
          <router-link 
            to="/hr" 
            class="mobile-nav-link"
            :class="{ active: $route.path === '/hr' }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">💰</span>
            <span class="nav-text">HR & Payroll</span>
          </router-link>
          
          <router-link 
            to="/inventory" 
            class="mobile-nav-link"
            :class="{ active: $route.path === '/inventory' }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">📦</span>
            <span class="nav-text">Inventory</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Professional Notifications -->
    <div class="notifications-container">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification', notification.type]"
      >
        <div class="notification-icon">
          <span v-if="notification.type === 'success'">✅</span>
          <span v-else-if="notification.type === 'error'">❌</span>
          <span v-else-if="notification.type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="notification-content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
        </div>
        <button class="notification-close" @click="removeNotification(notification.id)">
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import api from './utils/api'

export default {
  name: 'App',
  data() {
    return {
      mobileMenuOpen: false,
      notifications: []
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
    },
    
    // Notification methods
    showNotification(title, message, type = 'info', duration = 5000) {
      const id = Date.now() + Math.random()
      const notification = {
        id,
        title,
        message,
        type
      }
      
      this.notifications.push(notification)
      
      if (duration > 0) {
        setTimeout(() => {
          this.removeNotification(id)
        }, duration)
      }
      
      return id
    },
    
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  },
  watch: {
    '$route'() {
      this.closeMobileMenu()
    }
  },
  
  mounted() {
    // Add notification method to global instance
    this.$showNotification = this.showNotification
    
 // Handle route errors
  this.$router.onError((error) => {
    console.error('Router error:', error)
    this.showNotification(
      'Navigation Error',
      'The page you are looking for might have been moved.',
      'error',
      5000
    )
  })

    // Test API connection on app start
    api.get('/health')
      .then(response => {
        console.log('Backend health:', response.data)
        this.showNotification(
          'Welcome to BizFlow ERP', 
          'Your business management dashboard is ready.', 
          'success',
          4000
        )
      })
      .catch(error => {
        console.warn('Backend connection failed:', error.message)
        this.showNotification(
          'Backend Connection', 
          'Connected to demo mode. Backend features limited.', 
          'info',
          4000
        )
      })
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f7fafc;
  color: #2d3748;
  line-height: 1.6;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* Modern Navigation */
.navbar {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 70px;
  position: relative;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: #2d3748;
  z-index: 1001;
}

.brand-logo {
  font-size: 1.5rem;
}

/* Desktop Navigation */
.nav-links.desktop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #718096;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
}

.nav-link:hover {
  background: #f7fafc;
  color: #4a5568;
}

.nav-link.active {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
}

.nav-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

.user-company {
  font-size: 0.8rem;
  color: #718096;
  white-space: nowrap;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.mobile-menu-btn:hover {
  background: #f7fafc;
}

.menu-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 20px;
  height: 20px;
  position: relative;
}

.menu-icon span {
  display: block;
  height: 2px;
  background: #4a5568;
  border-radius: 1px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.menu-icon.open span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.menu-icon.open span:nth-child(2) {
  opacity: 0;
}

.menu-icon.open span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Navigation */
.mobile-nav {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e1e5e9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 999;
}

.mobile-nav.open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  text-decoration: none;
  color: #718096;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.mobile-nav-link:hover {
  background: #f7fafc;
  color: #4a5568;
}

.mobile-nav-link.active {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
}

.main-content {
  min-height: calc(100vh - 70px);
  padding: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-links.desktop {
    gap: 0.25rem;
  }
  
  .nav-link {
    padding: 0.75rem;
  }
  
  .nav-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
    height: 60px;
  }

  .nav-links.desktop {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .nav-user .user-info {
    display: none;
  }

  .brand-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.75rem;
  }

  .nav-brand {
    gap: 0.5rem;
  }

  .brand-text {
    font-size: 1rem;
  }

  .mobile-nav-links {
    padding: 0.5rem;
  }

  .mobile-nav-link {
    padding: 0.875rem;
  }
}

/* Prevent body scroll when mobile menu is open */
body.menu-open {
  overflow: hidden;
}

/* Professional Notifications */
.notifications-container {
  position: fixed;
  top: 90px;
  right: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  width: calc(100% - 2rem);
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #2c5aa0;
  animation: slideInRight 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid #e1e5e9;
}

.notification::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #2c5aa0;
  transform: scaleX(0);
  transform-origin: left;
  animation: progress 5s linear;
}

.notification.success {
  border-left-color: #38a169;
}

.notification.success::before {
  background: #38a169;
}

.notification.error {
  border-left-color: #e53e3e;
}

.notification.error::before {
  background: #e53e3e;
}

.notification.warning {
  border-left-color: #dd6b20;
}

.notification.warning::before {
  background: #dd6b20;
}

.notification.info {
  border-left-color: #2c5aa0;
}

.notification.info::before {
  background: #2c5aa0;
}

.notification-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
}

.notification-content p {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes progress {
  to {
    transform: scaleX(1);
  }
}

/* Responsive Notifications */
@media (max-width: 768px) {
  .notifications-container {
    top: 80px;
    right: 0.5rem;
    left: 0.5rem;
    width: auto;
    max-width: none;
  }
  
  .notification {
    padding: 0.875rem;
  }
}

@media (max-width: 480px) {
  .notifications-container {
    right: 0.25rem;
    left: 0.25rem;
  }
  
  .notification {
    padding: 0.75rem;
  }
  
  .notification-content h4 {
    font-size: 0.9rem;
  }
  
  .notification-content p {
    font-size: 0.8rem;
  }
}

/* Global Fix for Horizontal Scrolling */
html, body {
  overflow-x: hidden;
  max-width: 100%;
  position: relative;
}

#app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  width: 100%;
}
</style>