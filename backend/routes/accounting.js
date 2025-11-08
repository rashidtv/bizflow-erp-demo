const express = require('express');
const router = express.Router();

// Demo customers data
const demoCustomers = [
  {
    id: 1,
    tenant_id: 1,
    name: 'Tech Solutions Malaysia',
    email: 'accounts@techsolutions.my',
    phone: '+603-1234-5678',
    address: 'Kuala Lumpur City Center',
    tax_id: 'T1234567890'
  },
  {
    id: 2,
    tenant_id: 1,
    name: 'Global Manufacturing Bhd',
    email: 'finance@globalmfg.com',
    phone: '+603-8765-4321',
    address: 'Petaling Jaya, Selangor',
    tax_id: 'T9876543210'
  }
];

// Demo invoices data
const demoInvoices = [
  {
    id: 1,
    tenant_id: 1,
    customer_id: 1,
    invoice_number: 'INV-2024-001',
    amount: 5000.00,
    tax_amount: 300.00,
    status: 'paid',
    due_date: '2024-12-30',
    created_at: '2024-11-01'
  },
  {
    id: 2,
    tenant_id: 1,
    customer_id: 2,
    invoice_number: 'INV-2024-002',
    amount: 7500.00,
    tax_amount: 450.00,
    status: 'pending',
    due_date: '2024-12-31',
    created_at: '2024-11-02'
  }
];

// Customer routes
router.get('/customers', (req, res) => {
  const tenantId = parseInt(req.query.tenant_id) || 1;
  const customers = demoCustomers.filter(cust => cust.tenant_id === tenantId);
  res.json(customers);
});

router.post('/customers', (req, res) => {
  const newCustomer = {
    id: demoCustomers.length + 1,
    tenant_id: 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  demoCustomers.push(newCustomer);
  res.json(newCustomer);
});

// Invoice routes
router.get('/invoices', (req, res) => {
  const tenantId = parseInt(req.query.tenant_id) || 1;
  const invoices = demoInvoices.filter(inv => inv.tenant_id === tenantId);
  res.json(invoices);
});

router.post('/invoices', (req, res) => {
  const newInvoice = {
    id: demoInvoices.length + 1,
    tenant_id: 1,
    invoice_number: `INV-2024-${String(demoInvoices.length + 1).padStart(3, '0')}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    ...req.body
  };
  demoInvoices.push(newInvoice);
  res.json(newInvoice);
});

module.exports = router;