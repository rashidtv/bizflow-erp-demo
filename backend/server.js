// server.js - Production Ready for Render Deployment
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const accountingRoutes = require('./routes/accounting');
const complianceRoutes = require('./routes/compliance');
const hrRoutes = require('./routes/hr');
const inventoryRoutes = require('./routes/inventory');
const adminRoutes = require('./routes/admin');

// Add this to your server.js after imports
const demoData = require('./demo-data');

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://bizflow-erp-demo.onrender.com',
      'https://bizflow-frontend.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (important for Render)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);

// Demo data endpoints for pitching
app.get('/api/demo/scenarios', (req, res) => {
  res.json(demoData.demoScenarios);
});

app.get('/api/demo/business/:id', (req, res) => {
  const businessId = req.params.id;
  const business = demoData.demoBusinesses[businessId] || demoData.demoBusinesses.sarahConsulting;
  res.json(business);
});

app.get('/api/demo/:tenantId/invoices', (req, res) => {
  const tenantId = parseInt(req.params.tenantId);
  const invoices = demoData.demoInvoices.filter(inv => inv.tenant_id === tenantId);
  res.json(invoices);
});

app.get('/api/demo/:tenantId/customers', (req, res) => {
  const tenantId = parseInt(req.params.tenantId);
  const customers = demoData.demoCustomers.filter(cust => cust.tenant_id === tenantId);
  res.json(customers);
});

app.get('/api/demo/:tenantId/employees', (req, res) => {
  const tenantId = parseInt(req.params.tenantId);
  const employees = demoData.demoEmployees.filter(emp => emp.tenant_id === tenantId);
  res.json(employees);
});

app.get('/api/demo/:tenantId/products', (req, res) => {
  const tenantId = parseInt(req.params.tenantId);
  const products = demoData.demoProducts.filter(prod => prod.tenant_id === tenantId);
  res.json(products);
});

// Quick setup endpoint for demo
app.post('/api/demo/setup', (req, res) => {
  // This would set up demo data in database
  res.json({
    success: true,
    message: 'Demo data loaded successfully',
    business: demoData.demoBusinesses.sarahConsulting,
    stats: {
      invoices: demoData.demoInvoices.length,
      customers: demoData.demoCustomers.length,
      employees: demoData.demoEmployees.length,
      products: demoData.demoProducts.length
    }
  });
});

// Demo data endpoint
app.get('/api/demo/setup', (req, res) => {
  // Pre-load demo data for pitching
  res.json({ 
    status: 'Demo data loaded',
    businesses: Object.keys(demoData.demoBusinesses),
    features: ['accounting', 'payroll', 'inventory', 'compliance']
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend dist directory
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Handle SPA routing - return index.html for all unknown routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/health',
      '/api/auth/*',
      '/api/accounting/*',
      '/api/compliance/*',
      '/api/hr/*',
      '/api/inventory/*',
      '/api/demo/*'
    ]
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong!'
    });
  }

  // Detailed error in development
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
    stack: error.stack
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 BizFlow ERP Demo Server Started');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Demo API: http://localhost:${PORT}/api/demo/setup`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🏗️  Serving frontend from static build');
  }
});