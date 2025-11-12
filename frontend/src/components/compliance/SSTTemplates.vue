<template>
  <div class="compliance-page">
    <div class="page-header">
      <h1>📋 SST Compliance</h1>
      <p>Malaysia Sales & Service Tax Management</p>
    </div>

    <div class="demo-banner" v-if="$route.query.demo">
      <div class="demo-content">
        <span class="demo-badge">DEMO MODE</span>
        <p>Experience automated SST compliance and tax filing</p>
      </div>
    </div>

    <div class="compliance-grid">
      <!-- Overview Cards -->
      <div class="overview-section">
        <div class="overview-cards">
          <div class="overview-card">
            <div class="overview-icon service-tax">📊</div>
            <div class="overview-info">
              <h3>Service Tax</h3>
              <div class="overview-amount">6%</div>
              <p>Consulting & Services</p>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="overview-icon sales-tax">🏭</div>
            <div class="overview-info">
              <h3>Sales Tax</h3>
              <div class="overview-amount">10%</div>
              <p>Products & Manufacturing</p>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="overview-icon filing">📅</div>
            <div class="overview-info">
              <h3>Next Filing</h3>
              <div class="overview-amount">15 Dec 2025</div>
              <p>Q4 2025 Submission</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button class="action-btn primary" @click="showFilingModal = true">
            <span class="btn-icon">📤</span>
            File SST Return
          </button>
          <button class="action-btn" @click="generateReport">
            <span class="btn-icon">📊</span>
            Generate Report
          </button>
          <button class="action-btn" @click="showTemplateModal = true">
            <span class="btn-icon">⚙️</span>
            Manage Templates
          </button>
        </div>
      </div>

      <!-- Filing History -->
      <div class="filing-history-section">
        <div class="section-header">
          <h2>Filing History</h2>
          <button class="btn-secondary" @click="refreshHistory">
            Refresh
          </button>
        </div>
        <div class="history-list">
          <div v-for="filing in filingHistory" :key="filing.id" class="filing-item">
            <div class="filing-info">
              <div class="filing-period">{{ filing.period }}</div>
              <div class="filing-details">
                <span class="filing-amount">RM {{ filing.amount.toLocaleString() }}</span>
                <span class="filing-date">Filed: {{ filing.filed_date }}</span>
              </div>
            </div>
            <div class="filing-status">
              <span :class="['status-badge', filing.status]">{{ filing.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SST Calculator -->
      <div class="calculator-section">
        <h2>SST Calculator</h2>
        <div class="calculator">
          <div class="calc-inputs">
            <div class="form-group">
              <label>Amount (RM)</label>
              <input type="number" v-model="calcAmount" @input="calculateSST">
            </div>
            <div class="form-group">
              <label>Tax Type</label>
              <select v-model="calcTaxType">
                <option value="service">Service Tax (6%)</option>
                <option value="sales">Sales Tax (10%)</option>
              </select>
            </div>
          </div>
          <div class="calc-results">
            <div class="result-item">
              <span class="result-label">Original Amount:</span>
              <span class="result-value">RM {{ calcAmount || 0 }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Tax Amount ({{ calcTaxType === 'service' ? '6%' : '10%' }}):</span>
              <span class="result-value">RM {{ calcTaxAmount }}</span>
            </div>
            <div class="result-item total">
              <span class="result-label">Total Amount:</span>
              <span class="result-value">RM {{ calcTotalAmount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filing Modal -->
    <div v-if="showFilingModal" class="modal-overlay" @click="showFilingModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>File SST Return</h3>
          <button class="close-btn" @click="showFilingModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>Filing Period</label>
            <select v-model="filingData.period">
              <option value="2025-Q4">Q4 2025 (Oct-Dec)</option>
              <option value="2025-Q4">Q1 2025 (Jul-Sept)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Total Taxable Sales (RM)</label>
            <input type="number" v-model="filingData.taxableSales">
          </div>
          <div class="form-group">
            <label>Total Tax Amount (RM)</label>
            <input type="number" v-model="filingData.taxAmount" readonly>
          </div>
          <div class="filing-summary">
            <h4>Summary</h4>
            <div class="summary-item">
              <span>Service Tax Collected:</span>
              <span>RM {{ (filingData.taxableSales * 0.06).toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>Sales Tax Collected:</span>
              <span>RM {{ (filingData.taxableSales * 0.10).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showFilingModal = false">Cancel</button>
          <button class="btn-primary" @click="submitFiling">Submit Filing</button>
        </div>
      </div>
    </div>

    <!-- Template Modal -->
    <div v-if="showTemplateModal" class="modal-overlay" @click="showTemplateModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Manage SST Templates</h3>
          <button class="close-btn" @click="showTemplateModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="template-list">
            <div v-for="template in sstTemplates" :key="template.id" class="template-item">
              <div class="template-info">
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
                <span class="template-rate">{{ template.rate }}% {{ template.type }}</span>
              </div>
              <div class="template-actions">
                <button class="btn-small" @click="editTemplate(template)">Edit</button>
                <button class="btn-small primary" @click="applyTemplate(template)">Apply</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showTemplateModal = false">Close</button>
          <button class="btn-primary" @click="createNewTemplate">New Template</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SSTTemplates',
  data() {
    return {
      showFilingModal: false,
      showTemplateModal: false,
      calcAmount: 1000,
      calcTaxType: 'service',
      calcTaxAmount: 60,
      calcTotalAmount: 1060,
      filingData: {
        period: '2025-Q4',
        taxableSales: 25000,
        taxAmount: 1500
      },
      filingHistory: [
        {
          id: 1,
          period: '2025-Q3',
          amount: 1200,
          status: 'approved',
          filed_date: '2025-10-05'
        },
        {
          id: 2,
          period: '2025-Q2',
          amount: 980,
          status: 'approved',
          filed_date: '2025-07-05'
        },
        {
          id: 3,
          period: '2025-Q1',
          amount: 750,
          status: 'approved',
          filed_date: '2025-04-05'
        }
      ],
      sstTemplates: [
        {
          id: 1,
          name: 'Service Tax Template',
          rate: 6,
          type: 'service',
          description: 'Standard service tax for consulting services'
        },
        {
          id: 2,
          name: 'Sales Tax Template',
          rate: 10,
          type: 'sales',
          description: 'Sales tax for product sales'
        },
        {
          id: 3,
          name: 'Digital Services Tax',
          rate: 6,
          type: 'service',
          description: 'Tax for digital and online services'
        }
      ]
    }
  },
  methods: {
    calculateSST() {
      const rate = this.calcTaxType === 'service' ? 0.06 : 0.10;
      this.calcTaxAmount = (this.calcAmount * rate).toFixed(2);
      this.calcTotalAmount = (parseFloat(this.calcAmount) + parseFloat(this.calcTaxAmount)).toFixed(2);
    },
    submitFiling() {
      // Validation
      if (!this.filingData.period) {
        this.$root.showNotification(
          'Missing Information',
          'Please select a filing period.',
          'error'
        );
        return;
      }

      if (!this.filingData.taxableSales || this.filingData.taxableSales <= 0) {
        this.$root.showNotification(
          'Invalid Amount',
          'Please enter a valid taxable sales amount.',
          'error'
        );
        return;
      }

      const newFiling = {
        id: this.filingHistory.length + 1,
        period: this.filingData.period,
        amount: this.filingData.taxAmount,
        status: 'submitted',
        filed_date: new Date().toISOString().split('T')[0]
      };
      
      this.filingHistory.unshift(newFiling);
      this.showFilingModal = false;
      
      this.$root.showNotification(
        'SST Filed Successfully',
        `SST return for ${newFiling.period} has been submitted.`,
        'success'
      );
    },
    generateReport() {
      this.$root.showNotification(
        'Report Generated',
        'SST compliance report has been generated and downloaded.',
        'success'
      );
    },
    refreshHistory() {
      this.$root.showNotification(
        'History Refreshed',
        'Filing history has been updated.',
        'info'
      );
    },
    editTemplate(template) {
      this.$root.showNotification(
        'Edit Template',
        `Editing template: ${template.name}`,
        'info'
      );
    },
    applyTemplate(template) {
      this.calcTaxType = template.type;
      this.calculateSST();
      
      this.$root.showNotification(
        'Template Applied',
        `${template.name} (${template.rate}%) has been applied to the calculator.`,
        'success'
      );
    },
    createNewTemplate() {
      this.$root.showNotification(
        'New Template',
        'Create new SST template feature opened.',
        'info'
      );
    }
  },
  mounted() {
    this.calculateSST();
  }
}
</script>

<style scoped>
.compliance-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
  width: 100%;
  max-width: 100%;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
  word-wrap: break-word;
}

.page-header p {
  color: #718096;
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  word-wrap: break-word;
}

.demo-banner {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.demo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Fixed Grid Layout */
.compliance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  grid-template-areas: 
    "overview actions"
    "history calculator";
}

.overview-section {
  grid-area: overview;
  width: 100%;
  max-width: 100%;
}

.quick-actions-section {
  grid-area: actions;
  width: 100%;
  max-width: 100%;
}

.filing-history-section {
  grid-area: history;
  width: 100%;
  max-width: 100%;
}

.calculator-section {
  grid-area: calculator;
  width: 100%;
  max-width: 100%;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.overview-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.overview-card:hover {
  transform: translateY(-5px);
}

.overview-icon {
  font-size: 3rem;
  padding: 1rem;
  border-radius: 12px;
  flex-shrink: 0;
}

.overview-icon.service-tax {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.overview-icon.sales-tax {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.overview-icon.filing {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.overview-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.2rem;
  word-wrap: break-word;
}

.overview-amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
  word-wrap: break-word;
}

.overview-info p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.quick-actions-section h2,
.filing-history-section h2,
.calculator-section h2 {
  margin-bottom: 1rem;
  color: #2d3748;
  word-wrap: break-word;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
}

.action-btn:hover {
  border-color: #2c5aa0;
  transform: translateY(-2px);
}

.action-btn.primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  border-color: transparent;
}

.action-btn.primary:hover {
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.filing-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.filing-info {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.filing-period {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
}

.filing-details {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filing-amount {
  font-weight: 700;
  color: #2d3748;
  word-wrap: break-word;
}

.filing-date {
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.approved {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.submitted {
  background: #feebc8;
  color: #744210;
}

/* Calculator Styles */
.calculator {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.calc-inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  width: 100%;
}

.calc-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  width: 100%;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  min-width: 0;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.result-label {
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-value {
  color: #2d3748;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-item.total {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  font-size: 0.95rem;
}

.result-item.total .result-label,
.result-item.total .result-value {
  color: white;
  font-weight: 700;
}

.form-group {
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
  display: block;
  word-wrap: break-word;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  max-width: 100%;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  word-wrap: break-word;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-content {
  padding: 1.5rem;
}

.filing-summary {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.filing-summary h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  word-wrap: break-word;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e1e5e9;
}

.summary-item:last-child {
  border-bottom: none;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid #e1e5e9;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.4);
}

/* Template List */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  word-wrap: break-word;
}

.template-info p {
  margin: 0 0 0.5rem 0;
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.template-rate {
  background: #e6fffa;
  color: #234e52;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-small:hover {
  background: #f7fafc;
}

.btn-small.primary {
  background: #2c5aa0;
  color: white;
  border-color: #2c5aa0;
}

.btn-small.primary:hover {
  background: #1e3a8a;
}

/* Enhanced Responsive Design */
@media (max-width: 1024px) {
  .compliance-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    grid-template-areas: 
      "overview"
      "actions"
      "history"
      "calculator";
    gap: 1.5rem;
  }
  
  .overview-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .compliance-page {
    padding: 0.75rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .compliance-grid {
    gap: 1.5rem;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .overview-card {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    min-width: auto;
  }

  .filing-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }

  .filing-details {
    justify-content: center;
  }

  .calculator {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.25rem;
  }
  
  .calc-results h3 {
    font-size: 1rem;
    text-align: center;
  }
  
  .result-item {
    padding: 0.75rem;
  }

  .modal {
    margin: 0;
    max-height: 95vh;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }

  .template-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }

  .template-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .compliance-page {
    padding: 0.5rem;
  }

  .overview-card {
    padding: 1rem;
  }

  .calculator {
    padding: 1rem;
  }

  .filing-item {
    padding: 1rem;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-content {
    padding: 1.25rem;
  }

  .modal-actions {
    padding: 1.25rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .result-item {
    padding: 0.625rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
    text-align: center;
  }
  
  .result-label,
  .result-value {
    white-space: normal;
    text-overflow: clip;
    overflow: visible;
  }
  
  .result-label {
    font-size: 0.8rem;
  }
  
  .result-value {
    font-size: 0.9rem;
    font-weight: 700;
  }
}

/* Critical overflow prevention */
@media (max-width: 400px) {
  .compliance-page {
    padding: 0.25rem;
  }
  
  .overview-card,
  .calculator,
  .filing-item {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .overview-amount {
    font-size: 1.5rem;
  }
}

/* Print Styles */
@media print {
  .demo-banner,
  .action-buttons,
  .btn-secondary,
  .modal-overlay {
    display: none !important;
  }

  .compliance-grid {
    grid-template-columns: 1fr;
  }

  .overview-card,
  .calculator,
  .filing-item {
    box-shadow: none;
    border: 1px solid #000;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .overview-card:hover,
  .action-btn:hover,
  .btn-primary:hover {
    transform: none;
  }
  
  .overview-card:active,
  .action-btn:active {
    transform: scale(0.98);
  }
}
</style>