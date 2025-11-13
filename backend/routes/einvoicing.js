const express = require('express');
const router = express.Router();
const myInvoisService = require('../services/myinvoisService');

// Debug endpoint to test MyInvois connection
router.get('/debug/auth', async (req, res) => {
  try {
    console.log('🔍 Testing MyInvois authentication...');
    const result = await myInvoisService.testAuthentication();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'MyInvois authentication test passed',
        environment: process.env.NODE_ENV || 'development'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'MyInvois authentication test failed',
        environment: process.env.NODE_ENV || 'development'
      });
    }
  } catch (error) {
    console.error('🔍 MyInvois auth test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'MyInvois authentication test failed',
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Health check for MyInvois API
router.get('/health', async (req, res) => {
  try {
    // Test authentication as health check
    await myInvoisService.authenticate();
    
    res.json({
      success: true,
      message: 'MyInvois API is accessible',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('MyInvois health check failed:', error.message);
    res.status(503).json({
      success: false,
      error: 'MyInvois API is not accessible',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate and submit e-Invoice to MyInvois
router.post('/generate', async (req, res) => {
  try {
    const { invoiceData, customerInfo, items } = req.body;

    console.log('📦 Received e-Invoice generation request');
    console.log('Invoice:', invoiceData?.invoiceNumber);
    console.log('Customer:', customerInfo?.name);
    console.log('Items count:', items?.length);

    // Validate required fields
    if (!invoiceData || !customerInfo || !items) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: invoiceData, customerInfo, items'
      });
    }

    // Validate invoice number
    if (!invoiceData.invoiceNumber) {
      return res.status(400).json({
        success: false,
        error: 'Invoice number is required'
      });
    }

    // Validate customer name
    if (!customerInfo.name) {
      return res.status(400).json({
        success: false,
        error: 'Customer name is required'
      });
    }

    // Validate items
    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one invoice item is required'
      });
    }

    // Prepare invoice data for MyInvois
    const invoicePayload = {
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString(),
      customer: customerInfo,
      items: items,
      totalAmount: invoiceData.totalAmount || 0,
      taxAmount: invoiceData.taxAmount || 0
    };

    console.log('🔄 Submitting to MyInvois...');
    
    // Submit to MyInvois
    const submissionResult = await myInvoisService.submitEInvoice(invoicePayload);

    if (submissionResult.success) {
      console.log('✅ MyInvois submission successful');
      
      // SAFE RESPONSE HANDLING - Handle different response formats
      let responseData = {
        success: true,
        message: submissionResult.message,
        data: {
          einvoiceId: invoiceData.invoiceNumber, // Fallback to invoice number
          invoiceNumber: invoiceData.invoiceNumber,
          timestamp: new Date().toISOString(),
          submissionId: submissionResult.submissionId || 'pending',
          status: 'submitted',
          customer: customerInfo,
          summary: {
            totalAmount: invoiceData.totalAmount || 0,
            taxAmount: invoiceData.taxAmount || 0,
            grandTotal: (invoiceData.totalAmount || 0) + (invoiceData.taxAmount || 0)
          },
          myInvoisResponse: submissionResult.data
        }
      };

      // Try to extract more details from MyInvois response safely
      if (submissionResult.data && submissionResult.data.documents && submissionResult.data.documents[0]) {
        const doc = submissionResult.data.documents[0];
        responseData.data.einvoiceId = doc.internalId || invoiceData.invoiceNumber;
        responseData.data.submissionId = doc.uuid || submissionResult.submissionId;
        responseData.data.status = doc.status || 'submitted';
        
        if (doc.qrCode) {
          responseData.data.qrCode = doc.qrCode;
        }
      }

      res.json(responseData);
    } else {
      console.error('❌ MyInvois submission failed:', submissionResult.error);
      res.status(500).json({
        success: false,
        error: 'MyInvois submission failed',
        details: submissionResult.error,
        message: submissionResult.message
      });
    }

  } catch (error) {
    console.error('💥 e-Invoice generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate e-Invoice',
      details: error.message,
      message: 'Internal server error during e-Invoice generation'
    });
  }
});

// Get e-Invoice status from MyInvois
router.get('/status/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    console.log('🔍 Checking status for invoice:', invoiceId);

    const statusResult = await myInvoisService.getEInvoiceStatus(invoiceId);

    if (statusResult.success) {
      res.json({
        success: true,
        data: {
          invoiceId,
          status: statusResult.data?.status || 'unknown',
          lastUpdated: new Date().toISOString(),
          lhdnReference: statusResult.data?.uuid || 'unknown',
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
    console.error('Status check error:', error);
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

    console.log('🗑️  Cancelling invoice:', invoiceId, 'Reason:', reason);

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
    console.error('Cancel error:', error);
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

    console.log('🔍 Validating e-Invoice data');

    // Basic validation
    const errors = [];

    if (!invoiceData?.invoiceNumber) {
      errors.push('Invoice number is required');
    }

    if (!invoiceData?.customer?.name) {
      errors.push('Customer name is required');
    }

    if (!invoiceData?.items || invoiceData.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (invoiceData.items) {
      invoiceData.items.forEach((item, index) => {
        if (!item.description) {
          errors.push(`Item ${index + 1}: description is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: valid quantity is required`);
        }
        if (!item.unitPrice || item.unitPrice < 0) {
          errors.push(`Item ${index + 1}: valid unit price is required`);
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors,
        message: 'Validation failed'
      });
    }

    res.json({
      success: true,
      message: 'e-Invoice data is valid',
      data: {
        validated: true,
        timestamp: new Date().toISOString(),
        invoiceNumber: invoiceData.invoiceNumber,
        itemsCount: invoiceData.items.length
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
});

// Demo endpoint for testing without real MyInvois credentials
router.post('/demo/generate', async (req, res) => {
  try {
    const { invoiceData, customerInfo, items } = req.body;

    console.log('🎮 Using demo mode for e-Invoice generation');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * 0.06;
    const grandTotal = subtotal + taxAmount;

    // Return mock success response
    res.json({
      success: true,
      message: 'DEMO: e-Invoice would be submitted to LHDN MyInvois',
      data: {
        einvoiceId: 'DEMO-' + Date.now(),
        invoiceNumber: invoiceData.invoiceNumber,
        timestamp: new Date().toISOString(),
        submissionId: 'demo-uuid-' + Math.random().toString(36).substr(2, 9),
        status: 'submitted',
        customer: customerInfo,
        summary: {
          totalAmount: subtotal,
          taxAmount: taxAmount,
          grandTotal: grandTotal
        },
        qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzAwMCI+REVNTyBRUiBDT0RFPC90ZXh0Pjwvc3ZnPg==',
        note: 'This is a demo response. Real MyInvois integration requires valid LHDN credentials.'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Demo submission failed',
      details: error.message
    });
  }
});

module.exports = router;