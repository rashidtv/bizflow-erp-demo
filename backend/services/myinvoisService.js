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
      const response = await axios.post(`${this.baseURL}/connect/token`, 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: myInvoisConfig.clientId,
            password: myInvoisConfig.clientSecret
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      console.log('MyInvois authentication successful');
      return this.accessToken;
    } catch (error) {
      console.error('MyInvois authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with MyInvois');
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
      const token = await this.ensureAuthenticated();

      const myInvoisPayload = this.transformToMyInvoisFormat(invoiceData);

      const response = await axios.post(
        `${this.baseURL}/api/v1.0/documents`,
        myInvoisPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('MyInvois submission successful:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'e-Invoice successfully submitted to LHDN MyInvois'
      };
    } catch (error) {
      console.error('MyInvois submission failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to submit e-Invoice to LHDN MyInvois'
      };
    }
  }

  // Transform our invoice data to MyInvois format
  transformToMyInvoisFormat(invoiceData) {
    const { invoiceNumber, invoiceDate, customer, items, totalAmount, taxAmount } = invoiceData;

    return {
      "documents": [
        {
          "documentType": "010",
          "documentTypeVersion": "1.0",
          "dateTimeIssued": new Date().toISOString(),
          "taxpayerActivityCode": "69209", // Adjust based on your business
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
              "idValue": customer.taxId || customer.nationalId || "000000000000",
              "branch": customer.branch || "000"
            },
            "name": customer.name,
            "address": {
              "country": customer.country || "MY",
              "governate": customer.state || "",
              "regionCity": customer.city || "",
              "street": customer.address || "",
              "buildingNumber": "1"
            },
            "contact": {
              "name": customer.contactName || customer.name,
              "phone": customer.phone || "",
              "email": customer.email || ""
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
            "description": item.description,
            "itemType": "GS1",
            "itemCode": item.sku || `ITEM${index + 1}`,
            "unitType": "PCE",
            "quantity": item.quantity,
            "salesTotal": item.unitPrice * item.quantity,
            "total": item.unitPrice * item.quantity,
            "valueDifference": 0,
            "totalTaxableFees": 0,
            "netTotal": item.unitPrice * item.quantity,
            "itemsDiscount": 0,
            "unitValue": {
              "currencySold": "MYR",
              "amountEGP": item.unitPrice
            },
            "discount": {
              "rate": 0,
              "amount": 0
            },
            "taxableItems": [
              {
                "taxType": "T1",
                "amount": item.taxAmount || 0,
                "subType": "V009",
                "rate": item.taxRate || 0
              }
            ]
          })),

          "totalSalesAmount": totalAmount,
          "totalDiscountAmount": 0,
          "netAmount": totalAmount,
          "taxTotals": [
            {
              "taxType": "T1",
              "amount": taxAmount || 0
            }
          ],
          "totalAmount": totalAmount + (taxAmount || 0),
          "extraDiscountAmount": 0,
          "totalItemsDiscountAmount": 0
        }
      ]
    };
  }

  // Get e-Invoice status from MyInvois
  async getEInvoiceStatus(internalId) {
    try {
      const token = await this.ensureAuthenticated();

      const response = await axios.get(
        `${this.baseURL}/api/v1.0/documents/${internalId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'e-Invoice status retrieved successfully'
      };
    } catch (error) {
      console.error('Failed to get e-Invoice status:', error.response?.data || error.message);
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
      const token = await this.ensureAuthenticated();

      const response = await axios.post(
        `${this.baseURL}/api/v1.0/documents/${internalId}/cancel`,
        { reason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'e-Invoice cancelled successfully'
      };
    } catch (error) {
      console.error('Failed to cancel e-Invoice:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to cancel e-Invoice'
      };
    }
  }
}

module.exports = new MyInvoisService();