import axios from 'axios';

/**
 * Khalti Payment Gateway Service
 * Handles all Khalti API operations for payment initiation and verification
 */

// Load config on-demand to ensure environment variables are loaded
let khaltiAxiosInstance = null;

const getKhaltiConfig = () => {
  return {
    secretKey: process.env.KHALTI_SECRET_KEY,
    publicKey: process.env.KHALTI_PUBLIC_KEY,
    sandboxUrl: process.env.KHALTI_SANDBOX_URL || 'https://dev.khalti.com',
    apiVersion: process.env.KHALTI_API_VERSION || 'v2',
  };
};

const API_ENDPOINTS = {
  INITIATE: '/api/v2/epayment/initiate/',
  LOOKUP: '/api/v2/epayment/lookup/',
};

/**
 * Get or create axios instance with Khalti authentication headers
 */
const getKhaltiAxios = () => {
  if (!khaltiAxiosInstance) {
    const config = getKhaltiConfig();
    
    console.log('[Khalti Config] Loaded:');
    console.log('  - Secret Key Present:', !!config.secretKey);
    console.log('  - Secret Key Length:', config.secretKey?.length || 0);
    console.log('  - Sandbox URL:', config.sandboxUrl);
    console.log('  - API Version:', config.apiVersion);
    
    khaltiAxiosInstance = axios.create({
      baseURL: config.sandboxUrl,
      headers: {
        'Authorization': `Key ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('[Khalti Axios] Instance created with baseURL:', config.sandboxUrl);
  }
  return khaltiAxiosInstance;
};

/**
 * Initiate Payment
 * @param {Object} paymentData - Payment details
 * @param {number} paymentData.amount - Amount in paisa (1 rupee = 100 paisa)
 * @param {string} paymentData.purchase_order_id - Unique order ID
 * @param {string} paymentData.purchase_order_name - Order name/description
 * @param {string} paymentData.return_url - Callback URL after payment
 * @param {string} paymentData.website_url - Your website URL
 * @param {Object} paymentData.customer_info - Customer details
 * @returns {Promise<Object>} - pidx and payment_url from Khalti
 */
const initiatePayment = async (paymentData) => {
  try {
    const config = getKhaltiConfig();
    const khaltiAxios = getKhaltiAxios();
    
    const payload = {
      return_url: paymentData.return_url || process.env.CLIENT_URL + '/booking',
      website_url: process.env.CLIENT_URL || 'http://localhost:5173',
      amount: paymentData.amount, // in paisa
      purchase_order_id: paymentData.purchase_order_id,
      purchase_order_name: paymentData.purchase_order_name,
      customer_info: {
        name: paymentData.customer_info.name || 'Customer',
        email: paymentData.customer_info.email || 'customer@example.com',
        phone: paymentData.customer_info.phone || '9800000000',
      },
    };

    console.log('[Khalti Service] Initiating payment:');
    console.log('  - URL:', config.sandboxUrl + API_ENDPOINTS.INITIATE);
    console.log('  - Amount:', payload.amount, 'paisa');
    console.log('  - Order ID:', payload.purchase_order_id);
    console.log('  - Auth Header:', `Key ${config.secretKey?.substring(0, 10)}...`);

    const response = await khaltiAxios.post(API_ENDPOINTS.INITIATE, payload);

    console.log('[Khalti Service] Payment initiated successfully:', {
      pidx: response.data.pidx,
      payment_url: response.data.payment_url,
    });

    return {
      success: true,
      pidx: response.data.pidx,
      payment_url: response.data.payment_url,
      expires_at: response.data.expires_at,
    };
  } catch (error) {
    console.error('[Khalti Service] Payment initiation failed:');
    console.error('  - Status:', error.response?.status);
    console.error('  - Error:', error.response?.data?.detail || error.response?.data || error.message);
    console.error('  - Full Response:', error.response?.data);

    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      status: error.response?.status,
    };
  }
};

/**
 * Lookup Payment Status
 * @param {string} pidx - Payment index from initiation
 * @returns {Promise<Object>} - Payment details from Khalti
 */
const lookupPayment = async (pidx) => {
  try {
    const khaltiAxios = getKhaltiAxios();
    
    console.log('[Khalti Service] Looking up payment status for pidx:', pidx);

    const response = await khaltiAxios.post(API_ENDPOINTS.LOOKUP, { pidx });

    const paymentStatus = response.data.status;
    const isCompleted = paymentStatus === 'Completed';

    console.log('[Khalti Service] Payment status retrieved:', {
      pidx: response.data.pidx,
      status: paymentStatus,
      amount: response.data.total_amount || response.data.amount,
      transaction_id: response.data.transaction_id,
      isCompleted,
    });

    return {
      success: true,
      pidx: response.data.pidx,
      status: paymentStatus,
      amount: response.data.total_amount || response.data.amount,
      transaction_id: response.data.transaction_id,
      purchase_order_id: response.data.purchase_order_id,
      isCompleted,
      raw: response.data,
    };
  } catch (error) {
    console.error('[Khalti Service] Payment lookup failed:', {
      pidx,
      status: error.response?.status,
      message: error.response?.data?.detail || error.message,
    });

    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      status: error.response?.status,
    };
  }
};

/**
 * Validate payment before updating order
 * @param {string} pidx - Payment index
 * @param {number} expectedAmount - Expected amount to verify
 * @param {string} expectedOrderId - Expected order ID to verify
 * @returns {Promise<Object>} - Validation result
 */
const validatePayment = async (pidx, expectedAmount, expectedOrderId) => {
  try {
    const lookupResult = await lookupPayment(pidx);

    if (!lookupResult.success) {
      return {
        valid: false,
        error: 'Payment lookup failed',
        details: lookupResult.error,
      };
    }

    // Verify payment is completed
    if (!lookupResult.isCompleted) {
      return {
        valid: false,
        error: `Payment status is ${lookupResult.status}, not Completed`,
        status: lookupResult.status,
      };
    }

    // Verify amount matches (with small tolerance for rounding)
    const amountDifference = Math.abs(lookupResult.amount - expectedAmount);
    if (amountDifference > 1) {
      // Allow 1 paisa difference
      return {
        valid: false,
        error: 'Amount mismatch',
        expected: expectedAmount,
        received: lookupResult.amount,
      };
    }

    // Verify order ID matches (only if Khalti provides it in the response)
    if (lookupResult.purchase_order_id && lookupResult.purchase_order_id !== expectedOrderId) {
      return {
        valid: false,
        error: 'Order ID mismatch',
        expected: expectedOrderId,
        received: lookupResult.purchase_order_id,
      };
    }

    return {
      valid: true,
      paymentData: lookupResult,
    };
  } catch (error) {
    console.error('[Khalti Service] Payment validation failed:', error.message);
    return {
      valid: false,
      error: 'Validation failed: ' + error.message,
    };
  }
};

export {
  initiatePayment,
  lookupPayment,
  validatePayment,
  getKhaltiConfig,
  getKhaltiAxios,
};
