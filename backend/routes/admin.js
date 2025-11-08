const express = require('express');
const router = express.Router();

// Demo admin routes
router.get('/stats', (req, res) => {
  res.json({
    totalUsers: 15,
    activeTenants: 8,
    totalInvoices: 124,
    revenue: 458900,
    pendingTasks: 23
  });
});

router.get('/users', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@bizflow.com',
      role: 'admin',
      last_login: '2024-11-07T10:30:00Z'
    }
  ]);
});

module.exports = router;