<template>
  <div class="e-invoice-manager">
    <div class="header">
      <h1>E-Invoicing Management</h1>
      <p>Generate and manage e-Invoices compliant with LHDN MyInvois</p>
    </div>

    <!-- Health Status -->
    <div class="health-status" :class="healthStatus">
      <div class="status-indicator"></div>
      <span>MyInvois API: {{ healthMessage }}</span>
      <button @click="checkHealth" class="btn-sm">Refresh</button>
    </div>

    <!-- Main Actions -->
    <div class="action-grid">
      <div class="action-card" @click="showGenerateForm = true">
        <div class="action-icon">📄</div>
        <h3>Generate e-Invoice</h3>
        <p>Create and submit new e-Invoice to LHDN</p>
      </div>

      <div class="action-card" @click="loadSubmissions">
        <div class="action-icon">📋</div>
        <h3>View Submissions</h3>
        <p>Check status of submitted e-Invoices</p>
      </div>

      <div class="action-card" @click="showTestInterface = true">
        <div class="action-icon">🧪</div>
        <h3>Test Interface</h3>
        <p>Test e-Invoicing functionality</p>
      </div>
    </div>

    <!-- Generate e-Invoice Form -->
    <GlobalModal v-model="showGenerateForm" title="Generate e-Invoice" size="large">
      <div class="generate-form">
        <div class="form-section">
          <h3>Invoice Details</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Invoice Number *</label>
              <input v-model="newInvoice.invoiceNumber" type="text" placeholder="INV-2024-001">
            </div>
            <div class="form-group">
              <label>Invoice Date</label>
              <input v-model="newInvoice.invoiceDate" type="date">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Total Amount (MYR) *</label>
              <input v-model="newInvoice.totalAmount" type="number" step="0.01" placeholder="100.00">
            </div>
            <div class="form-group">
              <label>Tax Amount (MYR)</label>
              <input v-model="newInvoice.taxAmount" type="number" step="0.01" placeholder="6.00">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Customer Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Customer Name *</label>
              <input v-model="newInvoice.customer.name" type="text" placeholder="Customer Name">
            </div>
            <div class="form-group">
              <label>Tax ID (TIN)</label>
              <input v-model="newInvoice.customer.taxId" type="text" placeholder="123456789012">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input v-model="newInvoice.customer.email" type="email" placeholder="customer@email.com">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input v-model="newInvoice.customer.phone" type="tel" placeholder="+60123456789">
            </div>
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea v-model="newInvoice.customer.address" placeholder="Customer address"></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>Invoice Items</h3>
          <div v-for="(item, index) in newInvoice.items" :key="index" class="item-row">
            <div class="form-row">
              <div class="form-group">
                <label>Description *</label>
                <input v-model="item.description" type="text" placeholder="Item description">
              </div>
              <div class="form-group">
                <label>Quantity *</label>
                <input v-model="item.quantity" type="number" step="1" placeholder="1">
              </div>
              <div class="form-group">
                <label>Unit Price (MYR) *</label>
                <input v-model="item.unitPrice" type="number" step="0.01" placeholder="50.00">
              </div>
              <button @click="removeItem(index)" class="btn-danger btn-sm">Remove</button>
            </div>
          </div>
          <button @click="addItem" class="btn-secondary">+ Add Item</button>
        </div>

        <div class="form-actions">
          <button @click="validateInvoice" class="btn-secondary">Validate</button>
          <button @click="generateInvoice" :disabled="generating" class="btn-primary">
            {{ generating ? 'Generating...' : 'Generate e-Invoice' }}
          </button>
        </div>
      </div>
    </GlobalModal>

    <!-- Submissions List -->
    <div v-if="submissions.length > 0" class="submissions-section">
      <h3>Recent Submissions</h3>
      <div class="submissions-list">
        <div v-for="submission in submissions" :key="submission.id" class="submission-card">
          <div class="submission-header">
            <span class="invoice-number">{{ submission.invoiceNumber }}</span>
            <span class="status-badge" :class="submission.status">{{ submission.status }}</span>
          </div>
          <div class="submission-details">
            <p><strong>Customer:</strong> {{ submission.customer.name }}</p>
            <p><strong>Amount:</strong> MYR {{ submission.summary.totalAmount }}</p>
            <p><strong>Submitted:</strong> {{ formatDate(submission.timestamp) }}</p>
          </div>
          <div class="submission-actions">
            <button @click="checkStatus(submission.einvoiceId)" class="btn-sm">Check Status</button>
            <button @click="viewDetails(submission)" class="btn-sm btn-secondary">Details</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Interface Modal -->
    <GlobalModal v-model="showTestInterface" title="E-Invoicing Test Interface" size="large">
      <EInvoiceTest @close="showTestInterface = false" />
    </GlobalModal>
  </div>
</template>

<script>
import { generateEInvoice, getEInvoiceStatus, validateEInvoice, checkEInvoiceHealth } from '@/utils/api'
import EInvoiceTest from './EInvoiceTest.vue'

export default {
  name: 'EInvoiceManager',
  components: {
    EInvoiceTest
  },
  data() {
    return {
      showGenerateForm: false,
      showTestInterface: false,
      generating: false,
      healthStatus: 'unknown',
      healthMessage: 'Checking...',
      submissions: [],
      newInvoice: {
        invoiceNumber: '',
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
    }
  },
  mounted() {
    this.checkHealth()
    this.loadSubmissions()
  },
  methods: {
    async checkHealth() {
      try {
        const response = await checkEInvoiceHealth()
        this.healthStatus = 'healthy'
        this.healthMessage = 'Connected to MyInvois API'
      } catch (error) {
        this.healthStatus = 'unhealthy'
        this.healthMessage = 'MyInvois API unavailable'
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
      this.newInvoice.items.splice(index, 1)
    },

    async validateInvoice() {
      try {
        const response = await validateEInvoice(this.newInvoice)
        alert('Invoice data is valid! You can now generate the e-Invoice.')
      } catch (error) {
        alert('Validation failed: ' + (error.response?.data?.errors?.join(', ') || error.message))
      }
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
          alert('e-Invoice generated and submitted successfully!')
          this.submissions.unshift(response.data.data)
          this.showGenerateForm = false
          this.resetForm()
        } else {
          throw new Error(response.data.error || 'Generation failed')
        }
      } catch (error) {
        alert('Failed to generate e-Invoice: ' + (error.response?.data?.error || error.message))
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

    viewDetails(submission) {
      alert(JSON.stringify(submission, null, 2))
    },

    loadSubmissions() {
      // For demo purposes - in real app, you'd fetch from backend
      this.submissions = []
    },

    resetForm() {
      this.newInvoice = {
        invoiceNumber: 'INV-' + new Date().getTime(),
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

    formatDate(dateString) {
      return new Date(dateString).toLocaleString()
    }
  }
}
</script>

<style scoped>
.e-invoice-manager {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 30px;
  background: #f8f9fa;
}

.health-status.healthy {
  background: #d4edda;
  color: #155724;
}

.health-status.unhealthy {
  background: #f8d7da;
  color: #721c24;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.healthy .status-indicator {
  background: #28a745;
}

.unhealthy .status-indicator {
  background: #dc3545;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.action-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 2em;
  margin-bottom: 15px;
}

.generate-form {
  max-height: 70vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 60px;
  resize: vertical;
}

.item-row {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.submissions-section {
  margin-top: 40px;
}

.submissions-list {
  display: grid;
  gap: 15px;
}

.submission-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #007bff;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.invoice-number {
  font-weight: bold;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
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
  margin-bottom: 15px;
}

.submission-details p {
  margin: 5px 0;
  font-size: 14px;
}

.submission-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>