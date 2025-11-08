// frontend/src/utils/demo.js
export const demoStats = {
  timeSavings: {
    monthly: '20+ hours',
    yearly: '240+ hours', 
    monetary: 'RM 12,000+ (based on RM 50/hour)'
  },
  efficiency: {
    invoicing: '87% faster',
    compliance: '96% faster', 
    payroll: '96% faster',
    overall: '85% time reduction'
  },
  businessImpact: {
    customers: '47% faster client onboarding',
    cashflow: '32% faster payment collection',
    compliance: '100% accuracy in calculations',
    scalability: '300% business growth capacity'
  }
};

export const demoFeatures = {
  accounting: [
    'SST-compliant invoicing',
    'Automated payment tracking',
    'Customer management',
    'Expense categorization',
    'Financial reporting'
  ],
  compliance: [
    'SST form generation',
    'EPF contribution calculations',
    'SOCSO form preparation',
    'EIS compliance',
    'Submission deadline tracking'
  ],
  hr: [
    'Employee database',
    'Auto payroll calculations',
    'Leave management',
    'Attendance tracking',
    'EPF/SOCSO/EIS forms'
  ],
  inventory: [
    'Product/service catalog',
    'Stock level tracking',
    'Category management',
    'Sales analytics',
    'Reorder alerts'
  ]
};

export const getDemoScenario = (scenarioId) => {
  const scenarios = {
    quickInvoice: {
      title: '2-Minute Invoice Creation',
      before: '15 minutes manual work',
      after: '2 minutes with BizFlow',
      savings: '13 minutes per invoice',
      steps: ['Select customer', 'Add items', 'Auto-calculate SST', 'Send professionally']
    },
    compliance: {
      title: '10-Minute Compliance',
      before: '4 hours manual preparation', 
      after: '10 minutes with BizFlow',
      savings: '3 hours 50 minutes monthly',
      steps: ['Generate all forms', 'Auto-fill business data', 'Calculate totals', 'Download & submit']
    },
    payroll: {
      title: '5-Minute Payroll',
      before: '2 hours manual calculations',
      after: '5 minutes with BizFlow',
      savings: '1 hour 55 minutes monthly',
      steps: ['Review employees', 'Auto-calculate EPF/SOCSO', 'Generate forms', 'Process payments']
    }
  };
  
  return scenarios[scenarioId] || scenarios.quickInvoice;
};