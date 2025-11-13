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
              <div class="form-group">
                <label>Total Amount (MYR) *</label>
                <input v-model="newInvoice.totalAmount" type="number" step="0.01" 
                       placeholder="0.00" class="form-input" @input="calculateTax">
                <span v-if="!newInvoice.totalAmount" class="error-text">Required</span>
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
                       placeholder="Customer Name" class="form-input"
                       :class="{ 'error': !newInvoice.customer.name }">
                <span v-if="!newInvoice.customer.name" class="error-text">Required</span>
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
                         placeholder="Item description" class="form-input"
                         :class="{ 'error': !item.description }">
                  <span v-if="!item.description" class="error-text">Required</span>
                </div>
                <div class="form-group">
                  <label>Quantity *</label>
                  <input v-model="item.quantity" type="number" step="1" 
                         placeholder="1" class="form-input" @input="calculateTotals"
                         :class="{ 'error': !item.quantity || item.quantity <= 0 }">
                  <span v-if="!item.quantity || item.quantity <= 0" class="error-text">Required</span>
                </div>
                <div class="form-group">
                  <label>Unit Price (MYR) *</label>
                  <input v-model="item.unitPrice" type="number" step="0.01" 
                         placeholder="0.00" class="form-input" @input="calculateTotals"
                         :class="{ 'error': !item.unitPrice || item.unitPrice < 0 }">
                  <span v-if="!item.unitPrice || item.unitPrice < 0" class="error-text">Required</span>
                </div>
                <div class="form-group">
                  <label>Total</label>
                  <input :value="(item.quantity * item.unitPrice).toFixed(2)" 
                         type="text" class="form-input" readonly>
                </div>
                <button @click="removeItem(index)" class="btn-remove" 
                        :disabled="newInvoice.items.length === 1" title="Remove item">
                  🗑️
                </button>
              </div>
            </div>
            
            <!-- Summary -->
            <div class="summary-section">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>MYR {{ calculateSubtotal().toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Tax (6%):</span>
                <span>MYR {{ newInvoice.taxAmount.toFixed(2) }}</span>
              </div>
              <div class="summary-row total">
                <span>Grand Total:</span>
                <span>MYR {{ (calculateSubtotal() + parseFloat(newInvoice.taxAmount || 0)).toFixed(2) }}</span>
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
              <p><strong>Amount:</strong> MYR {{ submission.summary.totalAmount.toFixed(2) }}</p>
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
        taxAmount: 0,
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
      this.newInvoice.taxAmount = (this.newInvoice.totalAmount * 0.06).toFixed(2)
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
Total Amount: MYR ${submission.summary.totalAmount.toFixed(2)}
Tax Amount: MYR ${submission.summary.taxAmount.toFixed(2)}
Grand Total: MYR ${submission.summary.grandTotal.toFixed(2)}
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
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
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
  transition: all 0.3s ease;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.action-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  position: relative;
  overflow: hidden;
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
  font-size: 3rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.action-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.5;
}

.action-arrow {
  color: #007bff;
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.3s ease;
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
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
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
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
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
}

.btn-close:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.modal-body {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
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
  font-size: 1.3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-add {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-add:hover {
  background: #218838;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
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
  position: relative;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.form-input, .form-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
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
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  height: fit-content;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-remove:hover {
  background: #c82333;
  transform: scale(1.05);
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
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
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
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
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
}

.recent-submissions .section-header {
  margin-bottom: 1.5rem;
}

.recent-submissions h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
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
}

.submission-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.submission-info {
  flex: 1;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.invoice-number {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
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
}

.submission-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s ease;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: white;
  color: #007bff;
  border: 2px solid #007bff;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-top: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .e-invoice-manager {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .action-card {
    padding: 1.5rem;
  }

  .action-icon {
    font-size: 2.5rem;
  }

  .item-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-content {
    margin: 0.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .submission-item {
    flex-direction: column;
    gap: 1.5rem;
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
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.75rem;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .action-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .action-icon {
    margin-bottom: 0.5rem;
  }

  .empty-state {
    padding: 3rem 1rem;
  }
}
</style>