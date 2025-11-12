const express = require('express');
const router = express.Router();
const myInvoisService = require('../services/myinvoisService');

// Generate and submit e-Invoice to MyInvois
router.post('/generate', async (req, res) => {
  try {
    const { invoiceData, customerInfo, items } = req.body;

    // Validate required fields
    if (!invoiceData || !customerInfo || !items) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: invoiceData, customerInfo, items'
      });
    }

    // Prepare invoice data for MyInvois
    const invoicePayload = {
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString(),
      customer: customerInfo,
      items: items,
      totalAmount: invoiceData.totalAmount,
      taxAmount: invoiceData.taxAmount || 0
    };

    // Submit to MyInvois
    const submissionResult = await myInvoisService.submitEInvoice(invoicePayload);

    if (submissionResult.success) {
      res.json({
        success: true,
        message: 'e-Invoice generated and submitted to LHDN MyInvois successfully',
        data: {
          einvoiceId: submissionResult.data.documents[0].internalId,
          invoiceNumber: invoiceData.invoiceNumber,
          timestamp: new Date().toISOString(),
          qrCode: submissionResult.data.documents[0].qrCode,
          submissionId: submissionResult.data.documents[0].uuid,
          status: submissionResult.data.documents[0].status,
          customer: customerInfo,
          summary: {
            totalAmount: invoiceData.totalAmount,
            taxAmount: invoiceData.taxAmount || 0,
            grandTotal: invoiceData.totalAmount + (invoiceData.taxAmount || 0)
          },
          myInvoisResponse: submissionResult.data
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'MyInvois submission failed',
        details: submissionResult.error
      });
    }

  } catch (error) {
    console.error('e-Invoice generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate e-Invoice',
      details: error.message
    });
  }
});

// Get e-Invoice status from MyInvois
router.get('/status/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const statusResult = await myInvoisService.getEInvoiceStatus(invoiceId);

    if (statusResult.success) {
      res.json({
        success: true,
        data: {
          invoiceId,
          status: statusResult.data.status,
          lastUpdated: new Date().toISOString(),
          lhdnReference: statusResult.data.uuid,
          qrCode: statusResult.data.qrCode,
          details: statusResult.data
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve e-Invoice status',
        details: statusResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check e-Invoice status',
      details: error.message
    });
  }
});

// Cancel e-Invoice
router.post('/cancel/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { reason } = req.body;

    const cancelResult = await myInvoisService.cancelEInvoice(invoiceId, reason);

    if (cancelResult.success) {
      res.json({
        success: true,
        message: 'e-Invoice cancelled successfully',
        data: cancelResult.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to cancel e-Invoice',
        details: cancelResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel e-Invoice',
      details: error.message
    });
  }
});

// Validate e-Invoice data against MyInvois schema
router.post('/validate', async (req, res) => {
  try {
    const { invoiceData } = req.body;

    // Basic validation (you can add more complex validation)
    const errors = [];

    if (!invoiceData.invoiceNumber) {
      errors.push('Invoice number is required');
    }

    if (!invoiceData.customer || !invoiceData.customer.name) {
      errors.push('Customer name is required');
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors
      });
    }

    res.json({
      success: true,
      message: 'e-Invoice data is valid',
      data: {
        validated: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
});

// Get MyInvois API health
router.get('/health', async (req, res) => {
  try {
    // Test authentication
    await myInvoisService.authenticate();
    
    res.json({
      success: true,
      message: 'MyInvois API is accessible',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'MyInvois API is not accessible',
      details: error.message
    });
  }
});

module.exports = router;