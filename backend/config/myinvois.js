const myInvoisConfig = {
  // Sandbox environment for testing
  baseURL: 'https://api-myinvois-sandbox.hasil.gov.my',
  
  // Production environment (when ready)
  // baseURL: 'https://api-myinvois.hasil.gov.my',
  
  // Your credentials (to be obtained from LHDN)
  clientId: process.env.MYINVOIS_CLIENT_ID || 'your-client-id',
  clientSecret: process.env.MYINVOIS_CLIENT_SECRET || 'your-client-secret',
  
  // Seller information (your company details)
  seller: {
    tin: process.env.SELLER_TIN || '123456789012',
    name: process.env.SELLER_NAME || 'Your Company Name',
    branch: process.env.SELLER_BRANCH || '000',
    address: process.env.SELLER_ADDRESS || 'Your Company Address',
    postcode: process.env.SELLER_POSTCODE || '50000',
    city: process.env.SELLER_CITY || 'Kuala Lumpur',
    state: process.env.SELLER_STATE || 'WP Kuala Lumpur',
    country: process.env.SELLER_COUNTRY || 'MY',
    email: process.env.SELLER_EMAIL || 'your-email@company.com',
    phone: process.env.SELLER_PHONE || '+60312345678'
  }
};

module.exports = myInvoisConfig;