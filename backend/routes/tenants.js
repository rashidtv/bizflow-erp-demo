const express = require('express');
const router = express.Router();

// Demo tenant management
router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Sarah Consulting Sdn Bhd',
      business_type: 'consulting',
      sst_registered: true,
      created_at: '2024-01-01'
    }
  ]);
});

router.post('/', (req, res) => {
  const { name, business_type, sst_registered } = req.body;
  
  res.json({
    id: 2,
    name: name,
    business_type: business_type,
    sst_registered: sst_registered,
    created_at: new Date().toISOString()
  });
});

router.get('/:id', (req, res) => {
  const tenantId = req.params.id;
  
  res.json({
    id: parseInt(tenantId),
    name: 'Demo Tenant',
    business_type: 'consulting',
    sst_registered: true,
    created_at: '2024-01-01'
  });
});

module.exports = router;