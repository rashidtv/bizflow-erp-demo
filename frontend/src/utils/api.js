import axios from 'axios';

// Use environment variable for API base URL, fallback to development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response received from: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// E-Invoicing API methods
export const eInvoicingAPI = {
  // Generate and submit e-Invoice
  generateEInvoice: (invoiceData) => {
    return api.post('/einvoicing/generate', invoiceData);
  },

  // Demo submission (for testing without credentials)
  generateDemoEInvoice: (invoiceData) => {
    return api.post('/einvoicing/demo/generate', invoiceData);
  },

  // Get e-Invoice status
  getEInvoiceStatus: (invoiceId) => {
    return api.get(`/einvoicing/status/${invoiceId}`);
  },

  // Cancel e-Invoice
  cancelEInvoice: (invoiceId, reason) => {
    return api.post(`/einvoicing/cancel/${invoiceId}`, { reason });
  },

  // Validate e-Invoice data
  validateEInvoice: (invoiceData) => {
    return api.post('/einvoicing/validate', { invoiceData });
  },

  // Check MyInvois API health
  checkHealth: () => {
    return api.get('/einvoicing/health');
  },

  // Debug authentication test
  testAuth: () => {
    return api.get('/einvoicing/debug/auth');
  }
};

// Export individual methods as well
export const generateEInvoice = eInvoicingAPI.generateEInvoice;
export const generateDemoEInvoice = eInvoicingAPI.generateDemoEInvoice;
export const getEInvoiceStatus = eInvoicingAPI.getEInvoiceStatus;
export const cancelEInvoice = eInvoicingAPI.cancelEInvoice;
export const validateEInvoice = eInvoicingAPI.validateEInvoice;
export const checkEInvoiceHealth = eInvoicingAPI.checkHealth;
export const testEInvoiceAuth = eInvoicingAPI.testAuth;

export default api;