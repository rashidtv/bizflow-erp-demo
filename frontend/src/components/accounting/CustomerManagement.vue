<template>
  <div class="accounting-page">
    <div class="page-header">
      <h1>🧾 Accounting & Finance</h1>
      <p>Complete financial management with automated invoicing, payment tracking, and real-time reporting</p>
    </div>

    <div class="demo-banner" v-if="$route.query.demo">
      <div class="demo-content">
        <span class="demo-badge">DEMO MODE</span>
        <p>Experience end-to-end financial management with automated workflows</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="finance-stats">
      <div class="stat-card">
        <div class="stat-icon revenue">💰</div>
        <div class="stat-info">
          <h3>RM 45,890</h3>
          <p>Monthly Revenue</p>
          <div class="stat-change positive">+12% from last month</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon outstanding">📊</div>
        <div class="stat-info">
          <h3>RM 23,450</h3>
          <p>Outstanding Invoices</p>
          <div class="stat-change negative">3 overdue</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon expenses">💸</div>
        <div class="stat-info">
          <h3>RM 18,230</h3>
          <p>Monthly Expenses</p>
          <div class="stat-change">On track</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon profit">📈</div>
        <div class="stat-info">
          <h3>RM 27,660</h3>
          <p>Net Profit</p>
          <div class="stat-change positive">28% margin</div>
        </div>
      </div>
    </div>

    <div class="accounting-layout">
      <!-- Left Sidebar - Quick Actions -->
      <div class="sidebar">
        <div class="quick-actions-card">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button class="action-btn primary" @click="showCreateInvoice = true">
              <span class="btn-icon">🧾</span>
              <span class="btn-text">Create Invoice</span>
            </button>
            <button class="action-btn" @click="showCustomerModal = true">
              <span class="btn-icon">👥</span>
              <span class="btn-text">Add Customer</span>
            </button>
            <button class="action-btn" @click="showExpenseModal = true">
              <span class="btn-icon">💸</span>
              <span class="btn-text">Record Expense</span>
            </button>
            <button class="action-btn" @click="generateFinancialReport">
              <span class="btn-icon">📊</span>
              <span class="btn-text">Financial Report</span>
            </button>
            <button class="action-btn" @click="runBankReconciliation">
              <span class="btn-icon">🏦</span>
              <span class="btn-text">Bank Reconciliation</span>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
          <h3>Recent Activity</h3>
          <div class="activity-list">
            <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
              <div class="activity-icon" :class="activity.type">{{ activity.icon }}</div>
              <div class="activity-details">
                <p class="activity-text">{{ activity.text }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
              <div class="activity-amount" v-if="activity.amount">{{ activity.amount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Invoice Management -->
        <div class="section-card">
          <div class="section-header">
            <h2>Invoice Management</h2>
            <div class="section-actions">
              <div class="filter-tabs">
                <button 
                  v-for="tab in invoiceTabs" 
                  :key="tab.id"
                  :class="['tab-btn', { active: activeInvoiceTab === tab.id }]"
                  @click="activeInvoiceTab = tab.id"
                >
                  {{ tab.label }} ({{ tab.count }})
                </button>
              </div>
              <button class="btn-secondary" @click="exportInvoices">
                <span class="btn-icon">📤</span>
                Export
              </button>
            </div>
          </div>

          <div class="invoices-table">
            <div class="table-header">
              <div class="col-invoice">Invoice</div>
              <div class="col-customer">Customer</div>
              <div class="col-date">Due Date</div>
              <div class="col-amount">Amount</div>
              <div class="col-status">Status</div>
              <div class="col-actions">Actions</div>
            </div>
            
            <div 
              v-for="invoice in filteredInvoices" 
              :key="invoice.id" 
              class="table-row"
              :class="getInvoiceRowClass(invoice)"
            >
              <div class="col-invoice">
                <div class="invoice-number">{{ invoice.invoice_number }}</div>
                <div class="invoice-date">{{ formatDate(invoice.created_at) }}</div>
              </div>
              <div class="col-customer">
                <div class="customer-name">{{ invoice.customer_name }}</div>
                <div class="customer-email">{{ invoice.customer_email }}</div>
              </div>
              <div class="col-date">
                <div class="due-date">{{ formatDate(invoice.due_date) }}</div>
                <div 
                  v-if="isOverdue(invoice)" 
                  class="overdue-badge"
                >
                  Overdue
                </div>
              </div>
              <div class="col-amount">
                <div class="amount-main">RM {{ invoice.total_amount.toLocaleString() }}</div>
                <div class="amount-tax">Tax: RM {{ invoice.tax_amount.toLocaleString() }}</div>
              </div>
              <div class="col-status">
                <span :class="['status-badge', invoice.status]">
                  {{ invoice.status }}
                </span>
              </div>
              <div class="col-actions">
                <div class="action-buttons">
                  <button class="btn-icon-small" @click="viewInvoice(invoice)" title="View">
                    👁️
                  </button>
                  <button class="btn-icon-small" @click="editInvoice(invoice)" title="Edit">
                    ✏️
                  </button>
                  <button 
                    class="btn-icon-small primary" 
                    @click="sendReminder(invoice)" 
                    title="Send Reminder"
                    v-if="invoice.status === 'pending'"
                  >
                    ⏰
                  </button>
                  <button 
                    class="btn-icon-small success" 
                    @click="markAsPaid(invoice)" 
                    title="Mark as Paid"
                    v-if="invoice.status === 'pending'"
                  >
                    ✅
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Management -->
        <div class="section-card">
          <div class="section-header">
            <h2>Customer Management</h2>
            <button class="btn-primary" @click="showCustomerModal = true">
              <span class="btn-icon">➕</span>
              Add Customer
            </button>
          </div>

          <div class="customers-grid">
            <div 
              v-for="customer in customers" 
              :key="customer.id" 
              class="customer-card"
            >
              <div class="customer-header">
                <div class="customer-avatar">
                  {{ customer.name.charAt(0) }}
                </div>
                <div class="customer-info">
                  <h4>{{ customer.name }}</h4>
                  <p>{{ customer.email }}</p>
                </div>
                <div class="customer-balance">
                  <div class="balance-amount">RM {{ customer.outstanding_balance.toLocaleString() }}</div>
                  <div class="balance-label">Outstanding</div>
                </div>
              </div>
              
              <div class="customer-details">
                <div class="detail-item">
                  <span class="detail-label">Total Invoices:</span>
                  <span class="detail-value">{{ customer.total_invoices }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Last Invoice:</span>
                  <span class="detail-value">{{ formatDate(customer.last_invoice_date) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Terms:</span>
                  <span class="detail-value">{{ customer.payment_terms }} days</span>
                </div>
              </div>

              <div class="customer-actions">
                <button class="btn-small" @click="viewCustomer(customer)">View</button>
                <button class="btn-small primary" @click="createInvoiceForCustomer(customer)">
                  New Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Invoice Modal -->
    <div v-if="showCreateInvoice" class="modal-overlay" @click="showCreateInvoice = false">
      <div class="modal large" @click.stop>
        <div class="modal-header">
          <h3>Create New Invoice</h3>
          <button class="close-btn" @click="showCreateInvoice = false">×</button>
        </div>
        <div class="modal-content">
          <div class="invoice-form">
            <div class="form-section">
              <h4>Customer Details</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Select Customer *</label>
                  <select v-model="newInvoice.customer_id" @change="onCustomerSelect">
                    <option value="">Choose Customer</option>
                    <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                      {{ customer.name }} - {{ customer.email }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Invoice Date</label>
                  <input type="date" v-model="newInvoice.invoice_date">
                </div>
                <div class="form-group">
                  <label>Due Date</label>
                  <input type="date" v-model="newInvoice.due_date">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Invoice Items</h4>
              <div class="invoice-items">
                <div v-for="(item, index) in newInvoice.items" :key="index" class="invoice-item">
                  <div class="item-description">
                    <input 
                      type="text" 
                      v-model="item.description" 
                      placeholder="Item description"
                    >
                  </div>
                  <div class="item-quantity">
                    <input 
                      type="number" 
                      v-model="item.quantity" 
                      placeholder="Qty"
                      min="1"
                      @input="calculateItemTotal(item)"
                    >
                  </div>
                  <div class="item-price">
                    <input 
                      type="number" 
                      v-model="item.unit_price" 
                      placeholder="Price"
                      step="0.01"
                      @input="calculateItemTotal(item)"
                    >
                  </div>
                  <div class="item-total">
                    RM {{ item.total.toFixed(2) }}
                  </div>
                  <div class="item-actions">
                    <button 
                      class="btn-icon-small danger" 
                      @click="removeInvoiceItem(index)"
                      v-if="newInvoice.items.length > 1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <button class="btn-secondary add-item-btn" @click="addInvoiceItem">
                  + Add Item
                </button>
              </div>
            </div>

            <div class="form-section">
              <div class="invoice-summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>RM {{ newInvoice.subtotal.toFixed(2) }}</span>
                </div>
                <div class="summary-row">
                  <span>Service Tax (6%):</span>
                  <span>RM {{ newInvoice.tax_amount.toFixed(2) }}</span>
                </div>
                <div class="summary-row total">
                  <span>Total Amount:</span>
                  <span>RM {{ newInvoice.total_amount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showCreateInvoice = false">Cancel</button>
          <button class="btn-primary" @click="createInvoice">Create Invoice</button>
          <button class="btn-primary outline" @click="createAndSendInvoice">
            Create & Send
          </button>
        </div>
      </div>
    </div>

    <!-- Add Customer Modal -->
    <div v-if="showCustomerModal" class="modal-overlay" @click="showCustomerModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Customer</h3>
          <button class="close-btn" @click="showCustomerModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="form-row">
            <div class="form-group">
              <label>Company Name *</label>
              <input type="text" v-model="newCustomer.name" placeholder="Enter company name">
            </div>
            <div class="form-group">
              <label>Contact Email *</label>
              <input type="email" v-model="newCustomer.email" placeholder="Enter email address">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" v-model="newCustomer.phone" placeholder="Enter phone number">
            </div>
            <div class="form-group">
              <label>Tax ID</label>
              <input type="text" v-model="newCustomer.tax_id" placeholder="Tax identification number">
            </div>
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea v-model="newCustomer.address" placeholder="Full address"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Payment Terms (days)</label>
              <select v-model="newCustomer.payment_terms">
                <option value="7">7 days</option>
                <option value="15">15 days</option>
                <option value="30" selected>30 days</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
              </select>
            </div>
            <div class="form-group">
              <label>Currency</label>
              <select v-model="newCustomer.currency">
                <option value="MYR">MYR (Malaysian Ringgit)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="SGD">SGD (Singapore Dollar)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showCustomerModal = false">Cancel</button>
          <button class="btn-primary" @click="addCustomer">Add Customer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerManagement',
  data() {
    return {
      showCreateInvoice: false,
      showCustomerModal: false,
      showExpenseModal: false,
      activeInvoiceTab: 'all',
      newInvoice: {
        customer_id: null,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [
          { description: '', quantity: 1, unit_price: 0, total: 0 }
        ],
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0
      },
      newCustomer: {
        name: '',
        email: '',
        phone: '',
        tax_id: '',
        address: '',
        payment_terms: 30,
        currency: 'MYR'
      },
      invoiceTabs: [
        { id: 'all', label: 'All', count: 8 },
        { id: 'pending', label: 'Pending', count: 5 },
        { id: 'overdue', label: 'Overdue', count: 3 },
        { id: 'paid', label: 'Paid', count: 3 }
      ],
      recentActivities: [
        {
          id: 1,
          type: 'invoice',
          icon: '🧾',
          text: 'INV-2025-015 marked as paid',
          time: '2 hours ago',
          amount: '+RM 5,300.00'
        },
        {
          id: 2,
          type: 'customer',
          icon: '👥',
          text: 'New customer added: Global Tech',
          time: '4 hours ago'
        },
        {
          id: 3,
          type: 'reminder',
          icon: '⏰',
          text: 'Payment reminder sent for INV-2025-012',
          time: '1 day ago'
        },
        {
          id: 4,
          type: 'expense',
          icon: '💸',
          text: 'Office supplies expense recorded',
          time: '1 day ago',
          amount: '-RM 450.00'
        }
      ],
      invoices: [
        {
          id: 1,
          invoice_number: 'INV-2025-001',
          customer_name: 'Tech Solutions Malaysia',
          customer_email: 'accounts@techsolutions.my',
          created_at: '2025-10-01',
          due_date: '2025-12-01',
          amount: 5000,
          tax_amount: 300,
          total_amount: 5300,
          status: 'paid'
        },
        {
          id: 2,
          invoice_number: 'INV-2025-002',
          customer_name: 'Global Manufacturing Bhd',
          customer_email: 'finance@globalmfg.com',
          created_at: '2024-11-05',
          due_date: '2024-12-05',
          amount: 7500,
          tax_amount: 450,
          total_amount: 7950,
          status: 'pending'
        },
        {
          id: 3,
          invoice_number: 'INV-2024-003',
          customer_name: 'Digital Agency Co',
          customer_email: 'billing@digitalagency.co',
          created_at: '2024-10-25',
          due_date: '2024-11-24',
          amount: 3200,
          tax_amount: 192,
          total_amount: 3392,
          status: 'overdue'
        }
      ],
      customers: [
        {
          id: 1,
          name: 'Tech Solutions Malaysia',
          email: 'accounts@techsolutions.my',
          phone: '+603-1234-5678',
          outstanding_balance: 0,
          total_invoices: 5,
          last_invoice_date: '2024-11-01',
          payment_terms: 30
        },
        {
          id: 2,
          name: 'Global Manufacturing Bhd',
          email: 'finance@globalmfg.com',
          phone: '+603-8765-4321',
          outstanding_balance: 7950,
          total_invoices: 3,
          last_invoice_date: '2024-11-05',
          payment_terms: 45
        },
        {
          id: 3,
          name: 'Digital Agency Co',
          email: 'billing@digitalagency.co',
          phone: '+603-5555-1234',
          outstanding_balance: 3392,
          total_invoices: 2,
          last_invoice_date: '2024-10-25',
          payment_terms: 30
        }
      ]
    }
  },
  computed: {
    filteredInvoices() {
      if (this.activeInvoiceTab === 'all') return this.invoices;
      return this.invoices.filter(invoice => invoice.status === this.activeInvoiceTab);
    }
  },
  methods: {
    calculateItemTotal(item) {
      item.total = (item.quantity || 0) * (item.unit_price || 0);
      this.calculateInvoiceTotals();
    },
    calculateInvoiceTotals() {
      this.newInvoice.subtotal = this.newInvoice.items.reduce((sum, item) => sum + item.total, 0);
      this.newInvoice.tax_amount = this.newInvoice.subtotal * 0.06;
      this.newInvoice.total_amount = this.newInvoice.subtotal + this.newInvoice.tax_amount;
    },
    addInvoiceItem() {
      this.newInvoice.items.push({
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      });
    },
    removeInvoiceItem(index) {
      this.newInvoice.items.splice(index, 1);
      this.calculateInvoiceTotals();
    },
    onCustomerSelect() {
      const customer = this.customers.find(c => c.id === this.newInvoice.customer_id);
      if (customer) {
        this.newInvoice.due_date = new Date(Date.now() + customer.payment_terms * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
      }
    },
    createInvoice() {
      // Validation
      if (!this.newInvoice.customer_id) {
        this.$root.showNotification(
          'Missing Information',
          'Please select a customer before creating an invoice.',
          'error'
        );
        return;
      }

      if (this.newInvoice.subtotal <= 0) {
        this.$root.showNotification(
          'Invalid Amount',
          'Invoice amount must be greater than zero.',
          'error'
        );
        return;
      }

      const customer = this.customers.find(c => c.id === this.newInvoice.customer_id);
      const newInvoice = {
        id: this.invoices.length + 1,
        invoice_number: `INV-2024-${String(this.invoices.length + 1).padStart(3, '0')}`,
        customer_name: customer.name,
        customer_email: customer.email,
        created_at: this.newInvoice.invoice_date,
        due_date: this.newInvoice.due_date,
        amount: this.newInvoice.subtotal,
        tax_amount: this.newInvoice.tax_amount,
        total_amount: this.newInvoice.total_amount,
        status: 'pending'
      };
      
      this.invoices.unshift(newInvoice);
      this.showCreateInvoice = false;
      this.resetNewInvoice();
      
      this.recentActivities.unshift({
        id: Date.now(),
        type: 'invoice',
        icon: '🧾',
        text: `New invoice created: ${newInvoice.invoice_number}`,
        time: 'Just now',
        amount: `+RM ${newInvoice.total_amount.toLocaleString()}`
      });
      
      this.$root.showNotification(
        'Invoice Created',
        `Invoice ${newInvoice.invoice_number} has been created successfully.`,
        'success'
      );
    },
    createAndSendInvoice() {
      this.createInvoice();
      this.$root.showNotification(
        'Invoice Sent',
        'Invoice has been created and sent to the customer.',
        'success'
      );
    },
    resetNewInvoice() {
      this.newInvoice = {
        customer_id: null,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [
          { description: '', quantity: 1, unit_price: 0, total: 0 }
        ],
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0
      };
    },
    addCustomer() {
      // Validation
      if (!this.newCustomer.name || !this.newCustomer.email) {
        this.$root.showNotification(
          'Missing Information',
          'Please fill in all required fields (Company Name and Email).',
          'error'
        );
        return;
      }

      const newCust = {
        id: this.customers.length + 1,
        ...this.newCustomer,
        outstanding_balance: 0,
        total_invoices: 0,
        last_invoice_date: null
      };
      this.customers.push(newCust);
      this.showCustomerModal = false;
      this.resetNewCustomer();
      
      this.recentActivities.unshift({
        id: Date.now(),
        type: 'customer',
        icon: '👥',
        text: `New customer added: ${newCust.name}`,
        time: 'Just now'
      });
      
      this.$root.showNotification(
        'Customer Added',
        `${newCust.name} has been added to the system.`,
        'success'
      );
    },
    resetNewCustomer() {
      this.newCustomer = {
        name: '',
        email: '',
        phone: '',
        tax_id: '',
        address: '',
        payment_terms: 30,
        currency: 'MYR'
      };
    },
    viewInvoice(invoice) {
      this.$root.showNotification(
        'Invoice Details',
        `Viewing invoice: ${invoice.invoice_number}\nCustomer: ${invoice.customer_name}\nAmount: RM ${invoice.total_amount}\nStatus: ${invoice.status}`,
        'info'
      );
    },
    editInvoice(invoice) {
      this.$root.showNotification(
        'Edit Mode',
        `Editing invoice: ${invoice.invoice_number}`,
        'info'
      );
    },
    sendReminder(invoice) {
      invoice.status = 'reminded';
      this.$root.showNotification(
        'Reminder Sent',
        `Payment reminder sent for ${invoice.invoice_number}`,
        'info'
      );
    },
    markAsPaid(invoice) {
      invoice.status = 'paid';
      this.$root.showNotification(
        'Invoice Paid',
        `Invoice ${invoice.invoice_number} has been marked as paid.`,
        'success'
      );
    },
    viewCustomer(customer) {
      this.$root.showNotification(
        'Customer Details',
        `Name: ${customer.name}\nEmail: ${customer.email}\nOutstanding: RM ${customer.outstanding_balance}\nTotal Invoices: ${customer.total_invoices}`,
        'info'
      );
    },
    createInvoiceForCustomer(customer) {
      this.newInvoice.customer_id = customer.id;
      this.onCustomerSelect();
      this.showCreateInvoice = true;
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-MY');
    },
    isOverdue(invoice) {
      return invoice.status === 'pending' && new Date(invoice.due_date) < new Date();
    },
    getInvoiceRowClass(invoice) {
      if (invoice.status === 'overdue') return 'overdue';
      if (this.isOverdue(invoice)) return 'overdue';
      return '';
    },
    generateFinancialReport() {
      this.$root.showNotification(
        'Report Generated',
        'Comprehensive financial report generated with P&L, balance sheet, and cash flow statements!',
        'success'
      );
    },
    runBankReconciliation() {
      this.$root.showNotification(
        'Bank Reconciliation',
        'Bank reconciliation process started. 15 transactions matched successfully!',
        'success'
      );
    },
    exportInvoices() {
      this.$root.showNotification(
        'Data Exported',
        'Invoice data exported to Excel format successfully!',
        'success'
      );
    }
  },
  mounted() {
    this.calculateInvoiceTotals();
  }
}
</script>

<style scoped>
.accounting-page {
  max-width: 1400px;
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

/* Finance Stats */
.finance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
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
  gap: 1rem;
  transition: transform 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  padding: 1rem;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.stat-icon.outstanding {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.stat-icon.expenses {
  background: linear-gradient(135deg, #e53e3e, #c53030);
}

.stat-icon.profit {
  background: linear-gradient(135deg, #2c5aa0, #1e3a8a);
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  word-wrap: break-word;
}

.stat-info p {
  margin: 0.25rem 0;
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #38a169;
}

.stat-change.negative {
  color: #e53e3e;
}

/* Main Layout */
.accounting-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
  width: 100%;
  max-width: 100%;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 2rem;
  width: 100%;
  max-width: 100%;
}

.quick-actions-card,
.recent-activity {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.quick-actions-card h3,
.recent-activity h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.1rem;
  word-wrap: break-word;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
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

.btn-text {
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
}

/* Recent Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.activity-item:hover {
  background: #f7fafc;
}

.activity-icon {
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: #f7fafc;
  flex-shrink: 0;
}

.activity-details {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.activity-text {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
}

.activity-time {
  color: #718096;
  font-size: 0.8rem;
  word-wrap: break-word;
}

.activity-amount {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
  flex-shrink: 0;
  white-space: nowrap;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
}

.section-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  word-wrap: break-word;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 100%;
}

.filter-tabs {
  display: flex;
  background: #f7fafc;
  border-radius: 8px;
  padding: 0.25rem;
  gap: 0.25rem;
  max-width: 100%;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #718096;
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.tab-btn.active {
  background: white;
  color: #2c5aa0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-primary.outline {
  background: white;
  color: #2c5aa0;
  border: 2px solid #2c5aa0;
}

.btn-primary.outline:hover {
  background: #2c5aa0;
  color: white;
}

/* Invoices Table */
.invoices-table {
  background: white;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e1e5e9;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
  width: 100%;
  max-width: 100%;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e1e5e9;
  align-items: center;
  transition: background 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.table-row:hover {
  background: #f7fafc;
}

.table-row.overdue {
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
}

.table-row:last-child {
  border-bottom: none;
}

.col-invoice .invoice-number {
  font-weight: 600;
  color: #2d3748;
  word-wrap: break-word;
}

.col-invoice .invoice-date {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.25rem;
  word-wrap: break-word;
}

.col-customer .customer-name {
  font-weight: 600;
  color: #2d3748;
  word-wrap: break-word;
}

.col-customer .customer-email {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.25rem;
  word-wrap: break-word;
}

.col-date .due-date {
  color: #2d3748;
  word-wrap: break-word;
}

.overdue-badge {
  background: #fed7d7;
  color: #c53030;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 0.25rem;
  white-space: nowrap;
}

.col-amount .amount-main {
  font-weight: 700;
  color: #2d3748;
  font-size: 1rem;
  word-wrap: break-word;
}

.col-amount .amount-tax {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.25rem;
  word-wrap: break-word;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-badge.paid {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.pending {
  background: #feebc8;
  color: #744210;
}

.status-badge.overdue {
  background: #fed7d7;
  color: #c53030;
}

.status-badge.reminded {
  background: #bee3f8;
  color: #2a4365;
}

.col-actions .action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-icon-small {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s ease;
  font-size: 1rem;
  flex-shrink: 0;
}

.btn-icon-small:hover {
  background: #f7fafc;
}

.btn-icon-small.primary:hover {
  background: #bee3f8;
}

.btn-icon-small.success:hover {
  background: #c6f6d5;
}

.btn-icon-small.danger:hover {
  background: #fed7d7;
}

/* Customers Grid */
.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.customer-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  transition: transform 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
}

.customer-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.customer-info {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.customer-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
}

.customer-info p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.customer-balance {
  text-align: right;
  flex-shrink: 0;
}

.balance-amount {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
  word-wrap: break-word;
}

.balance-label {
  color: #718096;
  font-size: 0.8rem;
  word-wrap: break-word;
}

.customer-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.detail-label {
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.detail-value {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.customer-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.btn-small {
  padding: 0.5rem 1rem;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  flex: 1;
  box-sizing: border-box;
  max-width: 100%;
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

.modal.large {
  max-width: 800px;
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

/* Invoice Form */
.invoice-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.form-section h4 {
  margin: 0;
  color: #2d3748;
  font-size: 1.1rem;
  word-wrap: break-word;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 100%;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.form-group input:invalid:not(:focus) {
  border-color: #e53e3e;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Invoice Items */
.invoice-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.invoice-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.item-description input {
  width: 100%;
  max-width: 100%;
}

.item-quantity input,
.item-price input {
  width: 100%;
  max-width: 100%;
  text-align: center;
}

.item-total {
  font-weight: 600;
  color: #2d3748;
  text-align: center;
  word-wrap: break-word;
}

.add-item-btn {
  align-self: flex-start;
}

/* Invoice Summary */
.invoice-summary {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e1e5e9;
  width: 100%;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  border-top: 2px solid #e1e5e9;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  padding-top: 1rem;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid #e1e5e9;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .accounting-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .sidebar {
    position: static;
    order: 2;
  }

  .main-content {
    order: 1;
  }

  .quick-actions-card .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .accounting-page {
    padding: 0.5rem;
  }

  .finance-stats {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .section-card {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .section-actions {
    justify-content: space-between;
  }

  .filter-tabs {
    order: 2;
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    min-width: auto;
  }

  /* Mobile Table Styles */
  .invoices-table {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
  }

  .table-header {
    display: none;
  }

  .table-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    border-bottom: 1px solid #e1e5e9;
    margin: 0;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .col-invoice,
  .col-customer,
  .col-date,
  .col-amount,
  .col-status,
  .col-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.25rem 0;
  }

  .col-invoice::before {
    content: "Invoice:";
    font-weight: 600;
    color: #4a5568;
    margin-right: 1rem;
  }

  .col-customer::before {
    content: "Customer:";
    font-weight: 600;
    color: #4a5568;
    margin-right: 1rem;
  }

  .col-date::before {
    content: "Due Date:";
    font-weight: 600;
    color: #4a5568;
    margin-right: 1rem;
  }

  .col-amount::before {
    content: "Amount:";
    font-weight: 600;
    color: #4a5568;
    margin-right: 1rem;
  }

  .col-status::before {
    content: "Status:";
    font-weight: 600;
    color: #4a5568;
    margin-right: 1rem;
  }

  .col-actions::before {
    content: "Actions:";
    font-weight: 600;
    color: #4a5568;
    margin-right: 1rem;
  }

  .col-actions .action-buttons {
    justify-content: flex-end;
    flex: 1;
  }

  .customers-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .section-actions {
    justify-content: space-between;
  }

  .filter-tabs {
    order: 2;
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .accounting-page {
    padding: 0.5rem;
  }

  .finance-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
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

  .section-card {
    padding: 1rem;
  }

  .table-row {
    padding: 1rem;
  }

  .col-invoice,
  .col-customer,
  .col-date,
  .col-amount,
  .col-status,
  .col-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .col-invoice::before,
  .col-customer::before,
  .col-date::before,
  .col-amount::before,
  .col-status::before,
  .col-actions::before {
    margin-right: 0;
    font-size: 0.8rem;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    min-width: calc(50% - 0.125rem);
    font-size: 0.75rem;
    padding: 0.5rem 0.25rem;
  }

  .customer-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .customer-balance {
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .invoice-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}

/* Print Styles */
@media print {
  .navbar,
  .demo-banner,
  .sidebar,
  .section-actions,
  .col-actions {
    display: none !important;
  }

  .accounting-layout {
    grid-template-columns: 1fr;
  }

  .section-card {
    box-shadow: none;
    border: 1px solid #000;
  }
}
</style>