const express = require('express');
const router = express.Router();

// Demo authentication routes
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo authentication - in real app, validate against database
  if (email && password) {
    res.json({
      success: true,
      user: {
        id: 1,
        name: 'Demo User',
        email: email,
        role: 'admin',
        tenant_id: 1
      },
      token: 'demo-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

router.post('/register', (req, res) => {
  const { name, email, password, company } = req.body;
  
  res.json({
    success: true,
    user: {
      id: 2,
      name: name,
      email: email,
      role: 'admin',
      tenant_id: 2,
      company: company
    },
    token: 'demo-jwt-token-new'
  });
});

router.get('/me', (req, res) => {
  // Demo user data
  res.json({
    user: {
      id: 1,
      name: 'Demo User',
      email: 'demo@bizflow.com',
      role: 'admin',
      tenant_id: 1,
      company: 'Demo Business'
    }
  });
});

module.exports = router;