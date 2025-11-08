// server.js - Fixed for Render Deployment
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
    uptime: process.uptime(),
    message: 'BizFlow ERP Backend API is running'
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
  res.json({ 
    status: 'Demo data loaded',
    businesses: Object.keys(demoData.demoBusinesses),
    features: ['accounting', 'payroll', 'inventory', 'compliance']
  });
});

// Serve frontend in production ONLY if the build exists
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  // Check if frontend build exists before serving
  const fs = require('fs');
  if (fs.existsSync(frontendPath)) {
    console.log('🏗️  Serving frontend from static build');
    app.use(express.static(frontendPath));
    
    // Handle SPA routing - return index.html for all unknown routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.log('⚠️  Frontend build not found, serving API only');
    
    // If no frontend build, provide a simple landing page for the root route
    app.get('/', (req, res) => {
      res.json({
        message: 'BizFlow ERP Backend API',
        status: 'Running',
        endpoints: {
          health: '/api/health',
          demo: '/api/demo/setup',
          accounting: '/api/accounting/*',
          payroll: '/api/hr/*',
          inventory: '/api/inventory/*',
          compliance: '/api/compliance/*'
        },
        frontend: 'Frontend will be deployed separately as static site'
      });
    });
  }
} else {
  // Development mode - just API
  app.get('/', (req, res) => {
    res.json({
      message: 'BizFlow ERP Backend API (Development)',
      status: 'Running',
      endpoints: {
        health: '/api/health',
        demo: '/api/demo/setup',
        accounting: '/api/accounting/*',
        payroll: '/api/hr/*',
        inventory: '/api/inventory/*',
        compliance: '/api/compliance/*'
      }
    });
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/health',
      '/api/demo/setup',
      '/api/auth/*',
      '/api/accounting/*',
      '/api/compliance/*',
      '/api/hr/*',
      '/api/inventory/*'
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
  console.log(`🔗 Health Check: https://bizflow-erp-backend.onrender.com/api/health`);
  console.log(`📊 Demo API: https://bizflow-erp-backend.onrender.com/api/demo/setup`);
});