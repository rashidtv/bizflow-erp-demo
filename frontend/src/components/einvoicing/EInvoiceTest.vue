<template>
  <div class="e-invoice-test">
    <h3>E-Invoicing Test Interface</h3>
    
    <div class="test-actions">
      <button @click="testHealth" class="btn-primary">Test API Health</button>
      <button @click="testValidation" class="btn-secondary">Test Validation</button>
      <button @click="testSubmission" class="btn-primary">Test Submission</button>
    </div>

    <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
      <h4>Test Result:</h4>
      <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
    </div>

    <div class="sample-data">
      <h4>Sample Invoice Data</h4>
      <pre>{{ sampleInvoice }}</pre>
    </div>
  </div>
</template>

<script>
import { generateEInvoice, validateEInvoice, checkEInvoiceHealth } from '@/utils/api'

export default {
  name: 'EInvoiceTest',
  data() {
    return {
      testResult: null,
      sampleInvoice: {
        invoiceData: {
          invoiceNumber: 'TEST-INV-' + Date.now(),
          invoiceDate: new Date().toISOString(),
          totalAmount: 150.00,
          taxAmount: 9.00
        },
        customerInfo: {
          name: 'Test Customer Sdn Bhd',
          taxId: '123456789012',
          email: 'test@customer.com',
          phone: '+60312345678',
          address: '123 Test Street, Kuala Lumpur'
        },
        items: [
          {
            description: 'Consulting Services',
            quantity: 2,
            unitPrice: 75.00,
            taxRate: 6
          }
        ]
      }
    }
  },
  methods: {
    async testHealth() {
      try {
        const response = await checkEInvoiceHealth()
        this.testResult = {
          success: true,
          message: 'API Health Check Passed',
          data: response.data
        }
      } catch (error) {
        this.testResult = {
          success: false,
          message: 'API Health Check Failed',
          error: error.response?.data || error.message
        }
      }
    },

    async testValidation() {
      try {
        const response = await validateEInvoice(this.sampleInvoice)
        this.testResult = {
          success: true,
          message: 'Validation Test Passed',
          data: response.data
        }
      } catch (error) {
        this.testResult = {
          success: false,
          message: 'Validation Test Failed',
          error: error.response?.data || error.message
        }
      }
    },

    async testSubmission() {
      try {
        const response = await generateEInvoice(this.sampleInvoice)
        this.testResult = {
          success: true,
          message: 'Submission Test Passed',
          data: response.data
        }
      } catch (error) {
        this.testResult = {
          success: false,
          message: 'Submission Test Failed',
          error: error.response?.data || error.message
        }
      }
    }
  }
}
</script>

<style scoped>
.e-invoice-test {
  padding: 20px;
}

.test-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.test-result {
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.test-result.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.test-result.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.sample-data {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #e9ecef;
}

.sample-data pre {
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
}

.btn-primary, .btn-secondary {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}
</style>