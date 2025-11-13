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
          <small v-if="apiStatus === 'disconnected'" class="demo-notice">
            Using demo mode - Real LHDN integration requires valid credentials
          </small>
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
                       placeholder="INV-2024-001" class="form-input"
                       :class="{ 'error': !newInvoice.invoiceNumber }">
                <span v-if="!newInvoice.invoiceNumber" class="error-text">Required</span>
              </div>
              <div class="form-group">
                <label>Invoice Date *</label>
                <input v-model="newInvoice.invoiceDate" type="date" class="form-input">
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Total Amount (MYR) *</label>
                <input v-model.number="newInvoice.totalAmount" type="number" step="0.01" 
                       placeholder="0.00" class="form-input" @input="calculateTax">
                <span v-if="!newInvoice.totalAmount" class="error-text">Required</span>
              </div>
              <div class="form-group">
                <label>Tax Amount (MYR)</label>
                <input :value="formatCurrency(newInvoice.taxAmount)" type="text" 
                       class="form-input" readonly>
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
                       placeholder="Customer Name" class="form-input"
                       :class="{ 'error': !newInvoice.customer.name }">
                <span v-if="!newInvoice.customer.name" class="error-text">Required</span>
              </div>
              <div class="form-group">
                <label>Tax ID (TIN)</label>
                <input v-model="newInvoice.customer.taxId" type="text" 
                       placeholder="123456789012" class="form-input">
              </div>
            </div>
            <div class="form-grid">
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
                        placeholder="Customer address" class="form-textarea" rows="3"></textarea>
            </div>
          </div>

          <!-- Invoice Items -->
          <div class="form-section">
            <div class="section-header">
              <h3>Invoice Items</h3>
              <button @click="addItem" class="btn-add">+ Add Item</button>
            </div>
            
            <div v-for="(item, index) in newInvoice.items" :key="index" class="item-row">
              <div class="item-header">
                <h4>Item {{ index + 1 }}</h4>
                <button @click="removeItem(index)" class="btn-remove" 
                        :disabled="newInvoice.items.length === 1" title="Remove item">
                  🗑️ Remove
                </button>
              </div>
              <div class="item-grid">
                <div class="form-group full-width">
                  <label>Description *</label>
                  <input v-model="item.description" type="text" 
                         placeholder="Item description" class="form-input"
                         :class="{ 'error': !item.description }">
                  <span v-if="!item.description" class="error-text">Required</span>
                </div>
                <div class="form-group">
                  <label>Quantity *</label>
                  <input v-model.number="item.quantity" type="number" step="1" 
                         placeholder="1" class="form-input" @input="calculateTotals"
                         :class="{ 'error': !item.quantity || item.quantity <= 0 }">
                  <span v-if="!item.quantity || item.quantity <= 0" class="error-text">Required</span>
                </div>
                <div class="form-group">
                  <label>Unit Price (MYR) *</label>
                  <input v-model.number="item.unitPrice" type="number" step="0.01" 
                         placeholder="0.00" class="form-input" @input="calculateTotals"
                         :class="{ 'error': !item.unitPrice || item.unitPrice < 0 }">
                  <span v-if="!item.unitPrice || item.unitPrice < 0" class="error-text">Required</span>
                </div>
                <div class="form-group">
                  <label>Total (MYR)</label>
                  <input :value="formatCurrency(item.quantity * item.unitPrice)" 
                         type="text" class="form-input" readonly>
                </div>
              </div>
            </div>
            
            <!-- Summary -->
            <div class="summary-section">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>MYR {{ formatCurrency(calculateSubtotal()) }}</span>
              </div>
              <div class="summary-row">
                <span>Tax (6%):</span>
                <span>MYR {{ formatCurrency(newInvoice.taxAmount) }}</span>
              </div>
              <div class="summary-row total">
                <span>Grand Total:</span>
                <span>MYR {{ formatCurrency(calculateSubtotal() + parseFloat(newInvoice.taxAmount || 0)) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showGenerateForm = false" class="btn-cancel">Cancel</button>
          <button @click="validateAndSubmit" :disabled="generating || !isFormValid" class="btn-primary">
            {{ generating ? 'Submitting...' : 'Generate e-Invoice' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Submissions -->
    <div v-if="recentSubmissions.length > 0" class="recent-submissions">
      <div class="section-header">
        <h3>Recent Submissions</h3>
        <button @click="loadRecentSubmissions" class="btn-refresh">Refresh</button>
      </div>
      <div class="submissions-list">
        <div v-for="submission in recentSubmissions" :key="submission.einvoiceId" 
             class="submission-item">
          <div class="submission-info">
            <div class="submission-header">
              <span class="invoice-number">{{ submission.invoiceNumber }}</span>
              <span class="status-badge" :class="submission.status">{{ submission.status }}</span>
            </div>
            <div class="submission-details">
              <p><strong>Customer:</strong> {{ submission.customer.name }}</p>
              <p><strong>Amount:</strong> MYR {{ formatCurrency(submission.summary.totalAmount) }}</p>
              <p><strong>Submitted:</strong> {{ formatDate(submission.timestamp) }}</p>
            </div>
          </div>
          <div class="submission-actions">
            <button @click="checkStatus(submission.einvoiceId)" class="btn-secondary">
              Check Status
            </button>
            <button @click="viewSubmissionDetails(submission)" class="btn-outline">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>No e-Invoices Yet</h3>
      <p>Create your first e-Invoice to get started with LHDN MyInvois integration</p>
      <button @click="showGenerateForm = true" class="btn-primary">Create First e-Invoice</button>
    </div>
  </div>
</template>

<script>
import { generateEInvoice, getEInvoiceStatus, checkEInvoiceHealth, generateDemoEInvoice } from '@/utils/api'

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
  computed: {
    isFormValid() {
      return this.newInvoice.invoiceNumber &&
             this.newInvoice.customer.name &&
             this.newInvoice.items.every(item => 
               item.description && item.quantity > 0 && item.unitPrice >= 0
             )
    }
  },
  mounted() {
    this.checkApiStatus()
    this.loadRecentSubmissions()
  },
  methods: {
    getDefaultInvoice() {
      const timestamp = new Date().getTime()
      return {
        invoiceNumber: `INV-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        taxAmount: 0, // Keep as number, not string
        customer: {
          name: '',
          taxId: '',
          email: '',
          phone: '',
          address: '',
          city: 'Kuala Lumpur',
          state: 'WP Kuala Lumpur',
          country: 'MY'
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

    formatCurrency(value) {
      // Safely format currency values to avoid toFixed errors
      const num = parseFloat(value) || 0
      return num.toFixed(2)
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

    calculateSubtotal() {
      return this.newInvoice.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice)
      }, 0)
    },

    calculateTotals() {
      const subtotal = this.calculateSubtotal()
      this.newInvoice.totalAmount = subtotal
      this.calculateTax()
    },

    calculateTax() {
      // Ensure taxAmount is always a number, not a string
      const tax = (this.newInvoice.totalAmount * 0.06)
      this.newInvoice.taxAmount = parseFloat(tax.toFixed(2))
    },

    async validateAndSubmit() {
      if (!this.isFormValid) {
        alert('Please fill in all required fields correctly.')
        return
      }

      await this.generateInvoice()
    },

    async generateInvoice() {
      this.generating = true
      try {
        // Use demo mode if real API is not working
        const useDemoMode = this.apiStatus !== 'connected'
        const apiMethod = useDemoMode ? generateDemoEInvoice : generateEInvoice

        const response = await apiMethod({
          invoiceData: this.newInvoice,
          customerInfo: this.newInvoice.customer,
          items: this.newInvoice.items
        })

        if (response.data.success) {
          const message = useDemoMode 
            ? 'Demo e-Invoice created successfully! (Using demo mode)' 
            : 'e-Invoice submitted to LHDN successfully!'
          
          alert(message)
          this.recentSubmissions.unshift(response.data.data)
          this.showGenerateForm = false
          this.resetForm()
        } else {
          throw new Error(response.data.error || 'Generation failed')
        }
      } catch (error) {
        console.error('Invoice generation error:', error)
        alert('Failed to generate e-Invoice: ' + (error.response?.data?.error || error.message))
      } finally {
        this.generating = false
      }
    },

    async checkStatus(invoiceId) {
      try {
        const response = await getEInvoiceStatus(invoiceId)
        const status = response.data.data?.status || 'unknown'
        alert(`Invoice status: ${status}`)
      } catch (error) {
        alert('Failed to check status: ' + error.message)
      }
    },

    viewSubmissionDetails(submission) {
      const details = `
Invoice Number: ${submission.invoiceNumber}
Customer: ${submission.customer.name}
Status: ${submission.status}
Total Amount: MYR ${this.formatCurrency(submission.summary.totalAmount)}
Tax Amount: MYR ${this.formatCurrency(submission.summary.taxAmount)}
Grand Total: MYR ${this.formatCurrency(submission.summary.grandTotal)}
Submitted: ${this.formatDate(submission.timestamp)}
${submission.submissionId ? `Submission ID: ${submission.submissionId}` : ''}
      `.trim()
      
      alert(details)
    },

    viewSubmissions() {
      if (this.recentSubmissions.length > 0) {
        document.querySelector('.recent-submissions').scrollIntoView({ 
          behavior: 'smooth' 
        })
      } else {
        alert('No submissions yet. Create your first e-invoice to see it here.')
      }
    },

    loadRecentSubmissions() {
      // For demo purposes - in real app, you'd fetch from backend
      // This would typically make an API call to get recent submissions
      console.log('Loading recent submissions...')
    },

    resetForm() {
      this.newInvoice = this.getDefaultInvoice()
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
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
}

.subtitle {
  color: #6c757d;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  margin: 0;
  line-height: 1.4;
}

.status-overview {
  margin-bottom: 2rem;
  padding: 0 1rem;
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
  transition: all 0.3s ease;
  flex-wrap: wrap;
  max-width: 100%;
}

.status-card.connected {
  border-left-color: #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
}

.status-card.disconnected {
  border-left-color: #ffc107;
  background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
}

.status-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
  min-width: 200px;
}

.status-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.status-info p {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-weight: 500;
}

.demo-notice {
  color: #856404;
  background: #fff3cd;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-block;
}

.btn-refresh {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.btn-refresh:hover {
  background: #0056b3;
}

.btn-refresh:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 0 1rem;
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
  position: relative;
  overflow: hidden;
  max-width: 100%;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-content h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  line-height: 1.3;
  word-wrap: break-word;
}

.action-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.action-arrow {
  color: #007bff;
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
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
  backdrop-filter: blur(5px);
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: min(900px, 95vw);
  max-height: min(90vh, 800px);
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
  line-height: 1.3;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-close:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.modal-body {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  font-size: 1.2rem;
  line-height: 1.3;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h3 {
  margin: 0;
  border: none;
  padding: 0;
}

.btn-add {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-add:hover {
  background: #218838;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1rem;
}

.item-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  position: relative;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.form-input, .form-textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

.form-input.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-remove:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.btn-remove:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.item-row {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.summary-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  border: 1px solid #e9ecef;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: #495057;
}

.summary-row.total {
  border-top: 2px solid #dee2e6;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
  position: sticky;
  bottom: 0;
  flex-wrap: wrap;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
  min-width: 100px;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 160px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.4);
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Recent Submissions */
.recent-submissions {
  margin-top: 3rem;
  padding: 0 1rem;
}

.recent-submissions .section-header {
  margin-bottom: 1.5rem;
}

.recent-submissions h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.4rem;
}

.submissions-list {
  display: grid;
  gap: 1rem;
}

.submission-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 1rem;
}

.submission-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.submission-info {
  flex: 1;
  min-width: 250px;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.invoice-number {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.submitted {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.unknown {
  background: #e2e3e5;
  color: #383d41;
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
  line-height: 1.4;
}

.submission-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: white;
  color: #007bff;
  border: 2px solid #007bff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin: 2rem 1rem 0;
  max-width: 100%;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 1rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .e-invoice-manager {
    padding: 0.5rem;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1rem;
  }

  .action-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1.5rem 1rem;
  }

  .action-icon {
    margin-bottom: 0.5rem;
  }

  .modal-content {
    margin: 0;
    max-height: 95vh;
  }

  .modal-body {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .item-grid {
    grid-template-columns: 1fr;
  }

  .submission-item {
    flex-direction: column;
    text-align: center;
  }

  .submission-actions {
    justify-content: center;
    width: 100%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-primary, .btn-cancel {
    width: 100%;
    min-width: auto;
  }

  .empty-state {
    margin: 1rem 0.5rem 0;
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.6rem;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .section-header h3 {
    text-align: center;
  }

  .btn-add {
    width: 100%;
  }

  .item-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-remove {
    width: 100%;
  }

  .submission-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .submission-details {
    grid-template-columns: 1fr;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .action-card:hover,
  .submission-item:hover,
  .btn-primary:hover:not(:disabled),
  .btn-remove:hover:not(:disabled) {
    transform: none;
  }
}
</style>