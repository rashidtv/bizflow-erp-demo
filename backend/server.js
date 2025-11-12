// server.js - Complete Fixed Version for Render Deployment
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
const einvoicingRoutes = require('./routes/einvoicing'); // E-INVOICING ADDED
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

// ==============================================
// HEALTH & MONITORING ENDPOINTS
// ==============================================

// Main comprehensive health check
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    },
    endpoints: [
      '/api/auth/*',
      '/api/accounting/*',
      '/api/compliance/*',
      '/api/hr/*',
      '/api/inventory/*',
      '/api/einvoicing/*',
      '/api/demo/*'
    ],
    message: 'BizFlow ERP Backend API is running optimally'
  };

  res.status(200).json(healthCheck);
});

// Simple ping endpoint (for quick health checks)
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    status: 'pong', 
    timestamp: Date.now(),
    message: 'BizFlow ERP is alive and responding'
  });
});

// Multiple health endpoints for different monitoring services
app.get('/api/health1', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    endpoint: 'health1', 
    timestamp: Date.now(),
    service: 'UptimeRobot Primary'
  });
});

app.get('/api/health2', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    endpoint: 'health2', 
    timestamp: Date.now(),
    service: 'FreshPing Monitor'
  });
});

app.get('/api/health3', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    endpoint: 'health3', 
    timestamp: Date.now(),
    service: 'HetrixTools Monitor'
  });
});

// Keep-alive endpoints
app.get('/api/keepalive', (req, res) => {
  res.status(200).json({ 
    status: 'alive', 
    timestamp: Date.now(),
    message: 'Keep-alive check passed'
  });
});

// Quick warmup endpoint
app.get('/api/warmup', (req, res) => {
  res.status(200).json({ 
    status: 'warmed', 
    timestamp: Date.now(),
    message: 'Backend warmed up successfully'
  });
});

// ==============================================
// API ROUTES REGISTRATION
// ==============================================

// Register all API routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/einvoicing', einvoicingRoutes); // E-INVOICING ROUTES ADDED

// ==============================================
// DEMO DATA ENDPOINTS
// ==============================================

// Demo scenarios
app.get('/api/demo/scenarios', (req, res) => {
  res.json(demoData.demoScenarios);
});

// Business profile
app.get('/api/demo/business/:id', (req, res) => {
  const businessId = req.params.id;
  const business = demoData.demoBusinesses[businessId] || demoData.demoBusinesses.sarahConsulting;
  res.json(business);
});

// Tenant-specific data
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

// Demo setup endpoints
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

app.get('/api/demo/setup', (req, res) => {
  res.json({ 
    status: 'Demo data available',
    businesses: Object.keys(demoData.demoBusinesses),
    features: ['accounting', 'payroll', 'inventory', 'compliance', 'einvoicing']
  });
});

// ==============================================
// STATIC FILE SERVING (PRODUCTION ONLY)
// ==============================================

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
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
    
    // API-only response for root route
    app.get('/', (req, res) => {
      res.json({
        message: 'BizFlow ERP Backend API',
        status: 'Running',
        version: '1.0.0',
        environment: 'production',
        endpoints: {
          health: '/api/health',
          demo: '/api/demo/setup',
          accounting: '/api/accounting/*',
          payroll: '/api/hr/*',
          inventory: '/api/inventory/*',
          compliance: '/api/compliance/*',
          einvoicing: '/api/einvoicing/*'
        },
        documentation: 'Frontend deployed separately as static site'
      });
    });
  }
} else {
  // Development mode - API info only
  app.get('/', (req, res) => {
    res.json({
      message: 'BizFlow ERP Backend API (Development)',
      status: 'Running',
      version: '1.0.0',
      environment: 'development',
      endpoints: {
        health: '/api/health',
        demo: '/api/demo/setup',
        accounting: '/api/accounting/*',
        payroll: '/api/hr/*',
        inventory: '/api/inventory/*',
        compliance: '/api/compliance/*',
        einvoicing: '/api/einvoicing/*'
      },
      docs: 'See /api/health for detailed endpoint information'
    });
  });
}

// ==============================================
// ERROR HANDLING
// ==============================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/health',
      '/api/ping',
      '/api/demo/setup',
      '/api/auth/*',
      '/api/accounting/*',
      '/api/compliance/*',
      '/api/hr/*',
      '/api/inventory/*',
      '/api/einvoicing/*',
      '/api/admin/*',
      '/api/tenants/*'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong!',
      timestamp: new Date().toISOString()
    });
  }

  // Detailed error in development
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Shutting down gracefully...');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Shutting down gracefully...');
  process.exit(1);
});

// ==============================================
// SERVER STARTUP
// ==============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 BizFlow ERP Backend Server Started');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 Started: ${new Date().toISOString()}`);
  console.log('');
  console.log('📊 Available API Endpoints:');
  console.log('   🔍 Health:    /api/health');
  console.log('   🧾 Accounting: /api/accounting/*');
  console.log('   📋 Compliance: /api/compliance/*');
  console.log('   💰 HR/Payroll: /api/hr/*');
  console.log('   📦 Inventory:  /api/inventory/*');
  console.log('   🧾 E-Invoicing: /api/einvoicing/*');
  console.log('   🎮 Demo Data:  /api/demo/setup');
  console.log('');
  console.log('🔗 Production URLs:');
  console.log(`   Backend API: https://bizflow-erp-backend.onrender.com/api/health`);
  console.log(`   E-Invoicing: https://bizflow-erp-backend.onrender.com/api/einvoicing/health`);
});