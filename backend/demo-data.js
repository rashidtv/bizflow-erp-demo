// backend/demo-data.js
const demoScenarios = {
  // Scenario 1: Quick Invoice Creation
  quickInvoice: {
    customer: 'Demo Client Sdn Bhd',
    items: [
      { name: 'Consulting Services', quantity: 1, price: 5000 },
      { name: 'Website Maintenance', quantity: 1, price: 1500 }
    ],
    expectedTime: '2 minutes',
    manualTime: '15 minutes',
    timeSaved: '13 minutes',
    efficiency: '87% faster'
  },
  
  // Scenario 2: Compliance Preparation
  compliance: {
    forms: ['SST-03', 'KWSP 3A', 'Perkeso 8A'],
    expectedTime: '10 minutes', 
    manualTime: '4 hours',
    timeSaved: '3 hours 50 minutes',
    efficiency: '96% faster'
  },
  
  // Scenario 3: Payroll Processing
  payroll: {
    employees: 5,
    expectedTime: '5 minutes',
    manualTime: '2 hours',
    timeSaved: '1 hour 55 minutes',
    efficiency: '96% faster'
  }
};

const demoBusinesses = {
  sarahConsulting: {
    id: 1,
    name: 'Sarah Consulting Sdn Bhd',
    subdomain: 'sarah-consulting',
    email: 'sarah@consulting.com',
    ssm: 'SA-1234567-X',
    sst_registered: true,
    business_type: 'consulting',
    plan: 'professional',
    status: 'active'
  },
  techSolutions: {
    id: 2,
    name: 'Tech Solutions Sdn Bhd',
    subdomain: 'tech-solutions', 
    email: 'accounts@techsolutions.com',
    ssm: 'TS-7654321-A',
    sst_registered: true,
    business_type: 'technology',
    plan: 'enterprise',
    status: 'active'
  }
};

const demoCustomers = [
  {
    id: 1,
    tenant_id: 1,
    name: 'Tech Solutions Sdn Bhd',
    email: 'accounts@techsolutions.com',
    phone: '+603-1234 5678',
    type: 'company',
    balance: 0,
    created_at: '2024-01-15'
  },
  {
    id: 2,
    tenant_id: 1,
    name: 'Global Ventures',
    email: 'finance@globalventures.com', 
    phone: '+603-8765 4321',
    type: 'company',
    balance: 9010,
    created_at: '2024-01-20'
  },
  {
    id: 3,
    tenant_id: 1,
    name: 'Innovate Malaysia',
    email: 'billing@innovatemy.com',
    phone: '+603-5555 6666',
    type: 'company',
    balance: 0,
    created_at: '2024-02-01'
  }
];

const demoInvoices = [
  {
    id: 1,
    tenant_id: 1,
    invoice_number: 'INV-2024-SC-001',
    customer_id: 1,
    customer_name: 'Tech Solutions Sdn Bhd',
    date: '2024-01-15',
    due_date: '2024-02-15',
    items: [
      { name: 'Business Strategy Consulting', quantity: 1, price: 5000, sst_type: 'service' }
    ],
    subtotal: 5000,
    sst_amount: 300,
    total: 5300,
    status: 'paid',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    tenant_id: 1, 
    invoice_number: 'INV-2024-SC-002',
    customer_id: 2,
    customer_name: 'Global Ventures',
    date: '2024-01-20',
    due_date: '2024-02-20',
    items: [
      { name: 'Digital Transformation Project', quantity: 1, price: 8000, sst_type: 'service' },
      { name: 'Training Workshops', quantity: 2, price: 250, sst_type: 'service' }
    ],
    subtotal: 8500,
    sst_amount: 510, 
    total: 9010,
    status: 'pending',
    created_at: '2024-01-20T14:45:00Z'
  }
];

const demoEmployees = [
  {
    id: 1,
    tenant_id: 1,
    name: 'Ahmad bin Ismail',
    email: 'ahmad@sarahconsulting.com',
    phone: '+6012-345 6789',
    position: 'Senior Consultant',
    salary: 4500,
    epf_number: 'EPF12345678',
    socso_number: 'SOCSO123456',
    start_date: '2023-06-01',
    status: 'active'
  },
  {
    id: 2,
    tenant_id: 1,
    name: 'Siti Norhayati',
    email: 'siti@sarahconsulting.com',
    phone: '+6012-987 6543', 
    position: 'Marketing Executive',
    salary: 3800,
    epf_number: 'EPF87654321',
    socso_number: 'SOCSO654321',
    start_date: '2023-08-15',
    status: 'active'
  }
];

const demoProducts = [
  {
    id: 1,
    tenant_id: 1,
    name: 'Business Consulting',
    description: 'Strategic business advisory services',
    price: 5000,
    type: 'service',
    sst_type: 'service',
    category: 'Professional Services'
  },
  {
    id: 2,
    tenant_id: 1,
    name: 'Website Development',
    description: 'Custom website design and development',
    price: 12000,
    type: 'service',
    sst_type: 'service', 
    category: 'Technology Services'
  },
  {
    id: 3,
    tenant_id: 1,
    name: 'Digital Marketing Package',
    description: 'SEO and social media marketing services',
    price: 3000,
    type: 'service',
    sst_type: 'service',
    category: 'Marketing Services'
  }
];

module.exports = {
  demoScenarios,
  demoBusinesses,
  demoCustomers, 
  demoInvoices,
  demoEmployees,
  demoProducts
};