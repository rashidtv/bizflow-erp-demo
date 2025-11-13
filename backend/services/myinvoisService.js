const axios = require('axios');
const myInvoisConfig = require('../config/myinvois');

class MyInvoisService {
  constructor() {
    this.baseURL = myInvoisConfig.baseURL;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token from MyInvois
  async authenticate() {
    try {
      console.log('🔐 Attempting MyInvois authentication...');
      console.log('Base URL:', this.baseURL);
      console.log('Client ID exists:', !!myInvoisConfig.clientId);
      console.log('Client Secret exists:', !!myInvoisConfig.clientSecret);

      // Check if credentials are provided
      if (!myInvoisConfig.clientId || !myInvoisConfig.clientSecret) {
        throw new Error('MyInvois credentials missing. Please check environment variables.');
      }

      const response = await axios.post(`${this.baseURL}/connect/token`, 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: myInvoisConfig.clientId,
            password: myInvoisConfig.clientSecret
          },
          timeout: 10000
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      console.log('✅ MyInvois authentication successful');
      console.log('Token expires in:', response.data.expires_in, 'seconds');
      return this.accessToken;
    } catch (error) {
      console.error('❌ MyInvois authentication failed:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid MyInvois credentials. Please check CLIENT_ID and CLIENT_SECRET.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to MyInvois API. Please check network connection.');
      } else {
        throw new Error(`MyInvois authentication failed: ${error.response?.data?.error || error.message}`);
      }
    }
  }

  // Ensure we have a valid token
  async ensureAuthenticated() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
    return this.accessToken;
  }

  // Submit e-Invoice to MyInvois
  async submitEInvoice(invoiceData) {
    try {
      console.log('📤 Submitting e-Invoice to MyInvois...');
      console.log('Invoice Number:', invoiceData.invoiceNumber);
      console.log('Customer:', invoiceData.customer?.name);
      
      const token = await this.ensureAuthenticated();

      const myInvoisPayload = this.transformToMyInvoisFormat(invoiceData);
      console.log('✅ Payload prepared successfully');

      const response = await axios.post(
        `${this.baseURL}/api/v1.0/documents`,
        myInvoisPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000
        }
      );

      console.log('✅ MyInvois submission successful');
      console.log('Response Status:', response.status);
      console.log('Submission ID:', response.data?.documents?.[0]?.uuid);
      
      return {
        success: true,
        data: response.data,
        message: 'e-Invoice successfully submitted to LHDN MyInvois'
      };
    } catch (error) {
      console.error('❌ MyInvois submission failed:');
      console.error('Status:', error.response?.status);
      console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error Message:', error.message);
      
      // Provide more specific error messages
      let userMessage = 'Failed to submit e-Invoice to LHDN MyInvois';
      
      if (error.response?.status === 400) {
        userMessage = 'Invalid invoice data. Please check the invoice format.';
      } else if (error.response?.status === 401) {
        userMessage = 'Authentication failed. Please check MyInvois credentials.';
      } else if (error.response?.status === 403) {
        userMessage = 'Access forbidden. Please check permissions.';
      } else if (error.code === 'ECONNREFUSED') {
        userMessage = 'Cannot connect to MyInvois service. Please try again later.';
      }
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: userMessage,
        statusCode: error.response?.status
      };
    }
  }

  // Transform our invoice data to MyInvois format
  transformToMyInvoisFormat(invoiceData) {
    const { invoiceNumber, invoiceDate, customer, items, totalAmount, taxAmount } = invoiceData;

    // Calculate totals if not provided
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const finalTotalAmount = totalAmount || calculatedSubtotal;
    const finalTaxAmount = taxAmount || (finalTotalAmount * 0.06); // Default 6% SST

    return {
      "documents": [
        {
          "documentType": "010",
          "documentTypeVersion": "1.0",
          "dateTimeIssued": new Date(invoiceDate || Date.now()).toISOString(),
          "taxpayerActivityCode": "69209", // IT consulting services
          "internalId": invoiceNumber,
          "purchaseOrderReference": null,
          "purchaseOrderDescription": null,
          "salesOrderReference": null,
          "salesOrderDescription": null,
          "proformaInvoiceNumber": null,
          
          "seller": {
            "id": {
              "idType": "TIN",
              "idValue": myInvoisConfig.seller.tin,
              "branch": myInvoisConfig.seller.branch
            },
            "name": myInvoisConfig.seller.name,
            "address": {
              "branchId": myInvoisConfig.seller.branch,
              "country": myInvoisConfig.seller.country,
              "governate": myInvoisConfig.seller.state,
              "regionCity": myInvoisConfig.seller.city,
              "street": myInvoisConfig.seller.address,
              "buildingNumber": "1"
            },
            "contact": {
              "name": myInvoisConfig.seller.name,
              "phone": myInvoisConfig.seller.phone,
              "email": myInvoisConfig.seller.email
            }
          },

          "buyer": {
            "id": {
              "idType": customer.taxId ? "TIN" : "NIDN",
              "idValue": customer.taxId || "000000000000",
              "branch": customer.branch || "000"
            },
            "name": customer.name,
            "address": {
              "country": customer.country || "MY",
              "governate": customer.state || "WP Kuala Lumpur",
              "regionCity": customer.city || "Kuala Lumpur",
              "street": customer.address || "Not Provided",
              "buildingNumber": "1"
            },
            "contact": {
              "name": customer.contactName || customer.name,
              "phone": customer.phone || "0300000000",
              "email": customer.email || "customer@example.com"
            }
          },

          "payment": {
            "bankName": "",
            "bankAddress": "",
            "bankAccountNo": "",
            "bankAccountIBAN": "",
            "swiftCode": "",
            "terms": ""
          },

          "delivery": {
            "approach": "",
            "packaging": "",
            "dateValidity": "",
            "exportPort": "",
            "countryOfOrigin": "MY",
            "grossWeight": 0,
            "netWeight": 0,
            "terms": ""
          },

          "invoiceLines": items.map((item, index) => ({
            "id": index + 1,
            "description": item.description || "Product/Service",
            "itemType": "GS1",
            "itemCode": item.sku || `ITEM${index + 1}`,
            "unitType": "PCE",
            "quantity": item.quantity || 1,
            "salesTotal": item.unitPrice * item.quantity,
            "total": item.unitPrice * item.quantity,
            "valueDifference": 0,
            "totalTaxableFees": 0,
            "netTotal": item.unitPrice * item.quantity,
            "itemsDiscount": 0,
            "unitValue": {
              "currencySold": "MYR",
              "amountEGP": item.unitPrice || 0
            },
            "discount": {
              "rate": 0,
              "amount": 0
            },
            "taxableItems": [
              {
                "taxType": "T1",
                "amount": (item.unitPrice * item.quantity * 0.06), // 6% SST
                "subType": "V009",
                "rate": 6
              }
            ]
          })),

          "totalSalesAmount": finalTotalAmount,
          "totalDiscountAmount": 0,
          "netAmount": finalTotalAmount,
          "taxTotals": [
            {
              "taxType": "T1",
              "amount": finalTaxAmount
            }
          ],
          "totalAmount": finalTotalAmount + finalTaxAmount,
          "extraDiscountAmount": 0,
          "totalItemsDiscountAmount": 0
        }
      ]
    };
  }

  // Get e-Invoice status from MyInvois
  async getEInvoiceStatus(internalId) {
    try {
      console.log('🔍 Checking e-Invoice status:', internalId);
      const token = await this.ensureAuthenticated();

      const response = await axios.get(
        `${this.baseURL}/api/v1.0/documents/${internalId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('✅ Status check successful');
      return {
        success: true,
        data: response.data,
        message: 'e-Invoice status retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Failed to get e-Invoice status:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to retrieve e-Invoice status'
      };
    }
  }

  // Cancel e-Invoice
  async cancelEInvoice(internalId, reason) {
    try {
      console.log('🗑️  Cancelling e-Invoice:', internalId);
      const token = await this.ensureAuthenticated();

      const response = await axios.post(
        `${this.baseURL}/api/v1.0/documents/${internalId}/cancel`,
        { reason: reason || "Cancelled by user" },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('✅ Cancellation successful');
      return {
        success: true,
        data: response.data,
        message: 'e-Invoice cancelled successfully'
      };
    } catch (error) {
      console.error('❌ Failed to cancel e-Invoice:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to cancel e-Invoice'
      };
    }
  }

  // Test authentication (for debugging)
  async testAuthentication() {
    try {
      const token = await this.authenticate();
      return {
        success: true,
        message: 'Authentication successful',
        hasToken: !!token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Authentication failed'
      };
    }
  }
}

module.exports = new MyInvoisService();