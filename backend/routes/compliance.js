const express = require('express');
const router = express.Router();

// Demo SST compliance data
const sstTemplates = [
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
  }
];

// SST filing history
const filingHistory = [
  {
    id: 1,
    tenant_id: 1,
    period: '2024-Q4',
    amount: 1500.00,
    status: 'filed',
    filed_date: '2024-11-05'
  }
];

router.get('/sst/templates', (req, res) => {
  res.json(sstTemplates);
});

router.get('/sst/filings', (req, res) => {
  const tenantId = parseInt(req.query.tenant_id) || 1;
  const filings = filingHistory.filter(f => f.tenant_id === tenantId);
  res.json(filings);
});

router.post('/sst/filings', (req, res) => {
  const newFiling = {
    id: filingHistory.length + 1,
    tenant_id: 1,
    period: req.body.period,
    amount: req.body.amount,
    status: 'submitted',
    filed_date: new Date().toISOString().split('T')[0]
  };
  filingHistory.push(newFiling);
  res.json(newFiling);
});

module.exports = router;