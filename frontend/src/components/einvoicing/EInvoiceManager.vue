<template>
  <div class="e-invoice-manager">
    <!-- Header -->
    <div class="page-header">
      <h1>E-Invoicing</h1>
      <p class="subtitle">LHDN MyInvois Compliant Electronic Invoicing</p>
    </div>

    <!-- Status Overview -->
    <div class="status-overview">
      <div class="status-card" :class="apiStatus">
        <div class="status-icon">
          <span v-if="apiStatus === 'connected'">✅</span>
          <span v-else-if="apiStatus === 'disconnected'">❌</span>
          <span v-else>⏳</span>
        </div>
        <div class="status-info">
          <h3>MyInvois API</h3>
          <p>{{ apiStatusMessage }}</p>
        </div>
        <button @click="checkApiStatus" class="btn-refresh" :disabled="checkingStatus">
          {{ checkingStatus ? 'Checking...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-card" @click="showGenerateForm = true">
        <div class="action-icon">📄</div>
        <div class="action-content">
          <h3>Create e-Invoice</h3>
          <p>Generate LHDN-compliant electronic invoice</p>
        </div>
        <div class="action-arrow">→</div>
      </div>

      <div class="action-card" @click="viewSubmissions">
        <div class="action-icon">📋</div>
        <div class="action-content">
          <h3>View Submissions</h3>
          <p>Check status of submitted e-Invoices</p>
        </div>
        <div class="action-arrow">→</div>
      </div>
    </div>

    <!-- Generate e-Invoice Modal -->
    <div v-if="showGenerateForm" class="modal-overlay" @click.self="showGenerateForm = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create e-Invoice</h2>
          <button @click="showGenerateForm = false" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <!-- Invoice Details -->
          <div class="form-section">
            <h3>Invoice Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Invoice Number *</label>
                <input v-model="newInvoice.invoiceNumber" type="text" 
                       placeholder="INV-2024-001" class="form-input">
              </div>
              <div class="form-group">
                <label>Invoice Date *</label>
                <input v-model="newInvoice.invoiceDate" type="date" class="form-input">
              </div>
              <div class="form-group">
                <label>Total Amount (MYR) *</label>
                <input v-model="newInvoice.totalAmount" type="number" step="0.01" 
                       placeholder="0.00" class="form-input" @input="calculateTax">
              </div>
              <div class="form-group">
                <label>Tax Amount (MYR)</label>
                <input v-model="newInvoice.taxAmount" type="number" step="0.01" 
                       placeholder="0.00" class="form-input" readonly>
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="form-section">
            <h3>Customer Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Customer Name *</label>
                <input v-model="newInvoice.customer.name" type="text" 
                       placeholder="Customer Name" class="form-input">
              </div>
              <div class="form-group">
                <label>Tax ID (TIN)</label>
                <input v-model="newInvoice.customer.taxId" type="text" 
                       placeholder="123456789012" class="form-input">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="newInvoice.customer.email" type="email" 
                       placeholder="customer@email.com" class="form-input">
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="newInvoice.customer.phone" type="tel" 
                       placeholder="+60123456789" class="form-input">
              </div>
            </div>
            <div class="form-group full-width">
              <label>Address</label>
              <textarea v-model="newInvoice.customer.address" 
                        placeholder="Customer address" class="form-textarea"></textarea>
            </div>
          </div>

          <!-- Invoice Items -->
          <div class="form-section">
            <div class="section-header">
              <h3>Invoice Items</h3>
              <button @click="addItem" class="btn-add">+ Add Item</button>
            </div>
            <div v-for="(item, index) in newInvoice.items" :key="index" class="item-row">
              <div class="item-grid">
                <div class="form-group">
                  <label>Description *</label>
                  <input v-model="item.description" type="text" 
                         placeholder="Item description" class="form-input">
                </div>
                <div class="form-group">
                  <label>Quantity *</label>
                  <input v-model="item.quantity" type="number" step="1" 
                         placeholder="1" class="form-input" @input="calculateTotals">
                </div>
                <div class="form-group">
                  <label>Unit Price (MYR) *</label>
                  <input v-model="item.unitPrice" type="number" step="0.01" 
                         placeholder="0.00" class="form-input" @input="calculateTotals">
                </div>
                <div class="form-group">
                  <label>Total</label>
                  <input :value="(item.quantity * item.unitPrice).toFixed(2)" 
                         type="text" class="form-input" readonly>
                </div>
                <button @click="removeItem(index)" class="btn-remove" 
                        :disabled="newInvoice.items.length === 1">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showGenerateForm = false" class="btn-cancel">Cancel</button>
          <button @click="validateAndSubmit" :disabled="generating" class="btn-primary">
            {{ generating ? 'Submitting...' : 'Generate e-Invoice' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Submissions -->
    <div v-if="recentSubmissions.length > 0" class="recent-submissions">
      <h3>Recent Submissions</h3>
      <div class="submissions-list">
        <div v-for="submission in recentSubmissions" :key="submission.id" 
             class="submission-item">
          <div class="submission-info">
            <div class="submission-header">
              <span class="invoice-number">{{ submission.invoiceNumber }}</span>
              <span class="status-badge" :class="submission.status">{{ submission.status }}</span>
            </div>
            <div class="submission-details">
              <p><strong>Customer:</strong> {{ submission.customer.name }}</p>
              <p><strong>Amount:</strong> MYR {{ submission.summary.totalAmount.toFixed(2) }}</p>
              <p><strong>Submitted:</strong> {{ formatDate(submission.timestamp) }}</p>
            </div>
          </div>
          <div class="submission-actions">
            <button @click="checkStatus(submission.einvoiceId)" class="btn-secondary">
              Check Status
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { generateEInvoice, getEInvoiceStatus, checkEInvoiceHealth } from '@/utils/api'

export default {
  name: 'EInvoiceManager',
  data() {
    return {
      showGenerateForm: false,
      generating: false,
      checkingStatus: false,
      apiStatus: 'checking', // checking, connected, disconnected
      apiStatusMessage: 'Checking API connection...',
      recentSubmissions: [],
      newInvoice: this.getDefaultInvoice()
    }
  },
  mounted() {
    this.checkApiStatus()
    this.loadRecentSubmissions()
  },
  methods: {
    getDefaultInvoice() {
      return {
        invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        invoiceDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        taxAmount: 0,
        customer: {
          name: '',
          taxId: '',
          email: '',
          phone: '',
          address: ''
        },
        items: [
          {
            description: '',
            quantity: 1,
            unitPrice: 0,
            taxRate: 6
          }
        ]
      }
    },

    async checkApiStatus() {
      this.checkingStatus = true
      try {
        const response = await checkEInvoiceHealth()
        this.apiStatus = 'connected'
        this.apiStatusMessage = 'Connected to LHDN MyInvois API'
      } catch (error) {
        this.apiStatus = 'disconnected'
        this.apiStatusMessage = 'MyInvois API temporarily unavailable'
      } finally {
        this.checkingStatus = false
      }
    },

    addItem() {
      this.newInvoice.items.push({
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 6
      })
    },

    removeItem(index) {
      if (this.newInvoice.items.length > 1) {
        this.newInvoice.items.splice(index, 1)
        this.calculateTotals()
      }
    },

    calculateTotals() {
      const subtotal = this.newInvoice.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice)
      }, 0)
      
      this.newInvoice.totalAmount = subtotal
      this.calculateTax()
    },

    calculateTax() {
      this.newInvoice.taxAmount = this.newInvoice.totalAmount * 0.06 // 6% SST
    },

    async validateAndSubmit() {
      // Basic validation
      if (!this.newInvoice.invoiceNumber) {
        alert('Please enter an invoice number')
        return
      }

      if (!this.newInvoice.customer.name) {
        alert('Please enter customer name')
        return
      }

      if (this.newInvoice.items.some(item => !item.description)) {
        alert('Please enter description for all items')
        return
      }

      await this.generateInvoice()
    },

    async generateInvoice() {
      this.generating = true
      try {
        const response = await generateEInvoice({
          invoiceData: this.newInvoice,
          customerInfo: this.newInvoice.customer,
          items: this.newInvoice.items
        })

        if (response.data.success) {
          alert('e-Invoice submitted to LHDN successfully!')
          this.recentSubmissions.unshift(response.data.data)
          this.showGenerateForm = false
          this.newInvoice = this.getDefaultInvoice()
        } else {
          throw new Error(response.data.error || 'Submission failed')
        }
      } catch (error) {
        alert('Failed to submit e-Invoice: ' + (error.response?.data?.error || error.message))
      } finally {
        this.generating = false
      }
    },

    async checkStatus(invoiceId) {
      try {
        const response = await getEInvoiceStatus(invoiceId)
        alert(`Invoice status: ${response.data.data.status}`)
      } catch (error) {
        alert('Failed to check status: ' + error.message)
      }
    },

    viewSubmissions() {
      // In a real app, this would navigate to a submissions page
      alert('View all submissions feature coming soon!')
    },

    loadRecentSubmissions() {
      // Mock data for demo - in real app, fetch from backend
      this.recentSubmissions = []
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.e-invoice-manager {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.subtitle {
  color: #6c757d;
  font-size: 1.1rem;
}

.status-overview {
  margin-bottom: 2rem;
}

.status-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #6c757d;
}

.status-card.connected {
  border-left-color: #28a745;
}

.status-card.disconnected {
  border-left-color: #dc3545;
}

.status-icon {
  font-size: 1.5rem;
}

.status-info {
  flex: 1;
}

.status-info h3 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.status-info p {
  margin: 0;
  color: #6c757d;
}

.btn-refresh {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-refresh:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 2rem;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.action-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.action-arrow {
  color: #007bff;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-add {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.item-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-input, .form-textarea {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  height: fit-content;
}

.btn-remove:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.item-row {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

/* Recent Submissions */
.recent-submissions {
  margin-top: 3rem;
}

.recent-submissions h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.submissions-list {
  display: grid;
  gap: 1rem;
}

.submission-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submission-info {
  flex: 1;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.invoice-number {
  font-weight: bold;
  color: #2c3e50;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.submitted {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.submission-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.submission-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.submission-actions {
  display: flex;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .e-invoice-manager {
    padding: 1rem;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .item-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .submission-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .submission-actions {
    justify-content: center;
  }

  .modal-content {
    margin: 1rem;
  }
}
</style>