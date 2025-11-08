const express = require('express');
const router = express.Router();

// Demo products data
const demoProducts = [
  {
    id: 1,
    tenant_id: 1,
    name: 'Consulting Package - Basic',
    sku: 'CON-BASIC-001',
    price: 2000,
    cost: 800,
    stock: 999, // Unlimited virtual product
    category: 'services'
  },
  {
    id: 2,
    tenant_id: 1,
    name: 'Consulting Package - Premium',
    sku: 'CON-PREMIUM-001',
    price: 5000,
    cost: 2000,
    stock: 999,
    category: 'services'
  }
];

router.get('/products', (req, res) => {
  const tenantId = parseInt(req.query.tenant_id) || 1;
  const products = demoProducts.filter(prod => prod.tenant_id === tenantId);
  res.json(products);
});

router.post('/products', (req, res) => {
  const newProduct = {
    id: demoProducts.length + 1,
    tenant_id: 1,
    sku: `SKU-${Date.now()}`,
    ...req.body
  };
  demoProducts.push(newProduct);
  res.json(newProduct);
});

module.exports = router;