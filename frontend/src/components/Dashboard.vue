<template>
  <div class="dashboard-container">
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1>🚀 BizFlow ERP</h1>
          <p class="subtitle">Modern Business Management for Malaysian SMEs</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="startDemo('quickInvoice')">
            <span class="btn-icon">⚡</span>
            Quick Start Demo
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon revenue">💰</div>
          <div class="stat-info">
            <h3>RM 45,890</h3>
            <p>Monthly Revenue</p>
          </div>
          <div class="stat-trend positive">+12%</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon invoices">📊</div>
          <div class="stat-info">
            <h3>24</h3>
            <p>Pending Invoices</p>
          </div>
          <div class="stat-trend negative">-3%</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon compliance">✅</div>
          <div class="stat-info">
            <h3>2</h3>
            <p>SST Due</p>
          </div>
          <div class="stat-trend warning">Due Soon</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon payroll">👥</div>
          <div class="stat-info">
            <h3>8</h3>
            <p>Employees</p>
          </div>
          <div class="stat-trend">Active</div>
        </div>
      </div>

      <!-- Demo Showcase -->
      <div class="demo-section">
        <h2>Experience BizFlow ERP</h2>
        <p class="section-subtitle">Click on any demo to explore our features</p>
        
        <div class="demo-grid">
          <div class="demo-card" @click="startDemo('quickInvoice')">
            <div class="demo-card-header">
              <div class="demo-icon">🧾</div>
              <h3>Quick Invoice & Accounting</h3>
            </div>
            <p>Create professional invoices with automatic SST calculations and payment tracking</p>
            <ul class="feature-list">
              <li>✓ Automatic tax calculations</li>
              <li>✓ Payment reminders</li>
              <li>✓ Client management</li>
            </ul>
            <button class="demo-btn" @click.stop="startDemo('quickInvoice')">Start Accounting Demo</button>
          </div>

          <div class="demo-card" @click="startDemo('compliance')">
            <div class="demo-card-header">
              <div class="demo-icon">📋</div>
              <h3>SST Compliance</h3>
            </div>
            <p>Malaysia Sales & Service Tax management with automated filing</p>
            <ul class="feature-list">
              <li>✓ SST rate management</li>
              <li>✓ Tax filing automation</li>
              <li>✓ Compliance reporting</li>
            </ul>
            <button class="demo-btn" @click.stop="startDemo('compliance')">Start Compliance Demo</button>
          </div>

          <div class="demo-card" @click="startDemo('payroll')">
            <div class="demo-card-header">
              <div class="demo-icon">💰</div>
              <h3>HR & Payroll</h3>
            </div>
            <p>Complete payroll processing with EPF, SOCSO, EIS, and PCB calculations</p>
            <ul class="feature-list">
              <li>✓ Malaysia statutory calculations</li>
              <li>✓ Payslip generation</li>
              <li>✓ Employee self-service</li>
            </ul>
            <button class="demo-btn" @click.stop="startDemo('payroll')">Start Payroll Demo</button>
          </div>

          <div class="demo-card" @click="startDemo('inventory')">
            <div class="demo-card-header">
              <div class="demo-icon">📦</div>
              <h3>Inventory Management</h3>
            </div>
            <p>Real-time inventory tracking with low stock alerts and supplier management</p>
            <ul class="feature-list">
              <li>✓ Stock level monitoring</li>
              <li>✓ Purchase order management</li>
              <li>✓ Supplier tracking</li>
            </ul>
            <button class="demo-btn" @click.stop="startDemo('inventory')">Start Inventory Demo</button>
          </div>
        </div>
      </div>
      <!-- Add this to your dashboard navigation section -->
<div class="dashboard-card" @click="$router.push('/einvoicing')">
  <div class="card-icon">🧾</div>
  <h3>E-Invoicing</h3>
  <p>LHDN MyInvois Integration</p>
  <div class="card-badge">New</div>
</div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">✅</div>
            <div class="activity-content">
              <p><strong>INV-2024-015</strong> was paid by Tech Solutions</p>
              <span class="activity-time">2 hours ago</span>
            </div>
            <div class="activity-amount">RM 5,300.00</div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">📋</div>
            <div class="activity-content">
              <p><strong>SST Filing</strong> for October 2024 submitted</p>
              <span class="activity-time">1 day ago</span>
            </div>
            <div class="activity-amount">RM 2,150.00</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  methods: {
    startDemo(scenario) {
      // Show notification first
      this.$root.showNotification(
        'Demo Started',
        `Starting ${this.getDemoTitle(scenario)} demo...`,
        'info',
        3000
      )
      
      // Route to the appropriate page after a short delay
      setTimeout(() => {
        switch(scenario) {
          case 'quickInvoice':
            this.$router.push('/accounting?demo=true');
            break;
          case 'compliance':
            this.$router.push('/compliance?demo=true');
            break;
          case 'payroll':
            this.$router.push('/hr?demo=true');
            break;
          case 'inventory':
            this.$router.push('/inventory?demo=true');
            break;
          default:
            this.$router.push('/accounting?demo=true');
        }
      }, 500)
    },
    
    getDemoTitle(scenario) {
      const titles = {
        'quickInvoice': 'Quick Invoice & Accounting',
        'compliance': 'SST Compliance', 
        'payroll': 'HR & Payroll',
        'inventory': 'Inventory Management'
      }
      return titles[scenario] || 'Accounting'
    }
  }
}
</script>

<style scoped>
/* Global container to prevent overflow */
.dashboard-container {
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  min-height: calc(100vh - 70px);
  width: 100%;
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  padding: 2rem;
  border-radius: 12px;
  color: white;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.header-content {
  flex: 1;
  min-width: 0; /* Important for flexbox overflow */
  max-width: 100%;
}

.header-content h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.subtitle {
  opacity: 0.9;
  margin: 0.5rem 0 0 0;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.header-actions {
  flex-shrink: 0;
  max-width: 100%;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-icon {
  margin-right: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-height: 120px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.2;
  word-wrap: break-word;
}

.stat-info p {
  margin: 0.25rem 0 0 0;
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.stat-trend {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}

.positive {
  background: #c6f6d5;
  color: #22543d;
}

.negative {
  background: #fed7d7;
  color: #742a2a;
}

.warning {
  background: #feebc8;
  color: #744210;
}

.demo-section {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
}

.demo-section h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
  word-wrap: break-word;
}

.section-subtitle {
  color: #718096;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  word-wrap: break-word;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.demo-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.demo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
}

.demo-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.demo-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
}

.demo-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.demo-card h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.2rem;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
}

.demo-card p {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  flex-shrink: 0;
  width: 100%;
}

.feature-list li {
  padding: 0.25rem 0;
  color: #4a5568;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.demo-btn {
  width: 100%;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-sizing: border-box;
  max-width: 100%;
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.4);
}

.activity-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.activity-section h2 {
  margin-bottom: 1rem;
  color: #2d3748;
  font-size: 1.5rem;
  word-wrap: break-word;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #e1e5e9;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.activity-content {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.activity-content p {
  margin: 0;
  color: #2d3748;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
}

.activity-time {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.25rem;
  word-wrap: break-word;
}

.activity-amount {
  font-weight: 600;
  color: #2d3748;
  flex-shrink: 0;
  white-space: nowrap;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0.75rem;
  }

  .dashboard-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1rem;
  }

  .header-content {
    min-width: auto;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1.25rem;
    min-height: auto;
  }

  .demo-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .demo-card {
    padding: 1.25rem;
    min-height: auto;
  }

  .demo-card-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .demo-icon {
    margin-right: 0;
  }

  .activity-section {
    padding: 1.25rem;
  }

  .activity-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .activity-amount {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0.5rem;
  }

  .dashboard-header {
    padding: 1rem;
    border-radius: 8px;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .stat-icon {
    margin-right: 0;
  }

  .stat-trend {
    margin-left: 0;
  }

  .demo-card {
    padding: 1rem;
  }

  .activity-section {
    padding: 1rem;
  }

  .activity-item {
    padding: 0.75rem 0;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .stat-card:hover,
  .demo-card:hover,
  .demo-btn:hover,
  .btn-primary:hover {
    transform: none;
  }
  
  .stat-card:active,
  .demo-card:active {
    transform: scale(0.98);
  }
}

/* Critical overflow prevention */
@media (max-width: 400px) {
  .dashboard {
    padding: 0.25rem;
  }
  
  .dashboard-header,
  .stat-card,
  .demo-card,
  .activity-section {
    padding: 1rem;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  .demo-card h3 {
    font-size: 1.1rem;
  }
}
</style>