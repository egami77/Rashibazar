import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  initiatePayment,
  lookupPayment,
  validatePayment,
  getKhaltiConfig,
} from '../utils/khaltiService.js';

const router = express.Router();

/**
 * GET /api/khalti/test-config
 * Test endpoint to verify Khalti config is loading correctly (NO AUTH REQUIRED)
 */
router.get('/test-config', (req, res) => {
  try {
    const config = getKhaltiConfig();
    const hasSecret = !!config.secretKey;
    const hasPublic = !!config.publicKey;
    const secretLength = config.secretKey?.length || 0;
    
    return res.json({
      success: true,
      config: {
        secretKeyPresent: hasSecret,
        secretKeyLength: secretLength,
        publicKeyPresent: hasPublic,
        sandboxUrl: config.sandboxUrl,
      },
      message: hasSecret && hasPublic ? 'Khalti config loaded successfully!' : 'Khalti config incomplete',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/khalti/initiate
 * Initiate Khalti payment for a booking
 * Body: { bookingId, amount, customerInfo }
 */
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { bookingId, amount, customerInfo } = req.body;
    const userId = req.userId; // From JWT token via authMiddleware

    console.log('[Khalti Route] /initiate called with:', {
      bookingId,
      amount,
      userId: userId?.toString?.() || userId,
      customerInfo
    });

    // Validate required fields
    if (!bookingId || !amount || !customerInfo) {
      console.error('[Khalti Route] Missing required fields:', { bookingId, amount, customerInfo });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: bookingId, amount, customerInfo',
      });
    }

    // Fetch booking
    const booking = await Booking.findById(bookingId).populate('userId');
    if (!booking) {
      console.error('[Khalti Route] Booking not found:', bookingId);
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    console.log('[Khalti Route] Booking found:', {
      bookingId: booking._id,
      bookingUserId: booking.userId._id,
      authenticatedUserId: userId,
      userIdType: typeof userId,
      bookingUserIdType: typeof booking.userId._id
    });

    // Verify user owns this booking
    const bookingUserIdStr = booking.userId._id.toString();
    const authenticatedUserIdStr = userId.toString?.() || userId?.toString?.() || String(userId);
    
    if (bookingUserIdStr !== authenticatedUserIdStr) {
      console.error('[Khalti Route] Unauthorized access attempt:', {
        bookingUserId: bookingUserIdStr,
        authenticatedUserId: authenticatedUserIdStr
      });
      return res.status(403).json({
        success: false,
        error: 'Unauthorized - booking does not belong to this user',
      });
    }

    // Prevent re-initiating if already initiated
    if (booking.khaltiPaymentId && booking.khaltiStatus === 'initiated') {
      return res.status(400).json({
        success: false,
        error: 'Payment already initiated for this booking',
        pidx: booking.khaltiPaymentId,
        payment_url: booking.khaltiPaymentUrl,
      });
    }

    const PLATFORM_FEE = 50;
    const expectedAmount = booking.amount + PLATFORM_FEE;

    // Verify amount matches booking amount including platform fee
    if (amount !== expectedAmount) {
      return res.status(400).json({
        success: false,
        error: 'Amount mismatch',
        expected: expectedAmount,
        provided: amount,
      });
    }

    // Prepare payment data for Khalti
    const paymentData = {
      amount: Math.round(amount * 100), // Convert rupees to paisa
      purchase_order_id: booking.bookingId,
      purchase_order_name: `Booking_${booking.bookingId}`,
      return_url: process.env.CLIENT_URL + `/payment/callback`,
      website_url: process.env.CLIENT_URL,
      customer_info: {
        name: customerInfo.name || booking.userId.name || 'Customer',
        email: customerInfo.email || booking.userId.email || '',
        phone: customerInfo.phone || booking.userId.phone || '9800000000',
      },
    };

    console.log('[Khalti Route] Initiating payment:', {
      bookingId: booking.bookingId,
      userId,
      amount: paymentData.amount / 100 + ' NPR',
    });

    // Call Khalti service
    const khaltiResponse = await initiatePayment(paymentData);

    if (!khaltiResponse.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to initiate Khalti payment',
        details: khaltiResponse.error,
      });
    }

    // Update booking with Khalti details
    booking.khaltiPaymentId = khaltiResponse.pidx;
    booking.khaltiPaymentUrl = khaltiResponse.payment_url;
    booking.khaltiExpiresAt = khaltiResponse.expires_at;
    booking.khaltiStatus = 'initiated';
    booking.paymentMethod = 'khalti';
    await booking.save();

    console.log('[Khalti Route] Booking updated with payment details:', {
      bookingId: booking._id,
      pidx: khaltiResponse.pidx,
    });

    return res.json({
      success: true,
      pidx: khaltiResponse.pidx,
      payment_url: khaltiResponse.payment_url,
      expires_at: khaltiResponse.expires_at,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('[Khalti Route] Initiate error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during payment initiation',
      message: error.message,
    });
  }
});

/**
 * POST /api/khalti/verify
 * Verify Khalti payment after user returns from payment page
 * Body: { pidx, bookingId }
 */
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { pidx, bookingId } = req.body;
    const userId = req.userId;

    if (!pidx || !bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: pidx, bookingId',
      });
    }

    // Fetch booking (support both _id and human readable bookingId)
    let booking;
    if (bookingId.startsWith('BOOK-')) {
      booking = await Booking.findOne({ bookingId: bookingId });
    } else {
      booking = await Booking.findById(bookingId);
    }
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Verify user owns this booking
    const bookingUserIdStr = booking.userId.toString();
    const authUserIdStr = String(userId);

    if (bookingUserIdStr !== authUserIdStr) {
      console.error('[Khalti Route] /verify unauthorized match attempt.', { bookingUserIdStr, authUserIdStr });
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Verify pidx matches what we have in the booking
    if (booking.khaltiPaymentId !== pidx) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID mismatch',
      });
    }

    console.log('[Khalti Route] Verifying payment:', {
      bookingId: booking.bookingId,
      pidx,
    });

    // Validate payment with Khalti
    const validation = await validatePayment(
      pidx,
      (booking.amount + 50) * 100, // Convert rupees to paisa, including platform fee
      booking.bookingId
    );

    if (!validation.valid) {
      // Update booking with failed status
      booking.khaltiStatus = 'failed';
      booking.paymentStatus = 'failed';
      await booking.save();

      console.error('[Khalti Route] Payment validation failed:', validation.error);

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        details: validation.error,
      });
    }

    // Payment is valid - update booking
    booking.khaltiStatus = 'completed';
    booking.khaltiTransactionId = validation.paymentData.transaction_id;
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed'; // Auto-confirm when payment is successful
    await booking.save();

    console.log('[Khalti Route] Payment verified successfully:', {
      bookingId: booking.bookingId,
      transactionId: validation.paymentData.transaction_id,
      amount: validation.paymentData.amount / 100 + ' NPR',
    });

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        amount: booking.amount,
      },
      transaction: {
        transactionId: validation.paymentData.transaction_id,
        pidx: validation.paymentData.pidx,
        amount: validation.paymentData.amount,
      },
    });
  } catch (error) {
    console.error('[Khalti Route] Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during payment verification',
      message: error.message,
    });
  }
});

/**
 * GET /api/khalti/status/:pidx
 * Check payment status for a pidx
 */
router.get('/status/:pidx', authMiddleware, async (req, res) => {
  try {
    const { pidx } = req.params;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        error: 'Missing pidx',
      });
    }

    console.log('[Khalti Route] Checking payment status:', pidx);

    const result = await lookupPayment(pidx);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.json({
      success: true,
      status: result.status,
      isCompleted: result.isCompleted,
      amount: result.amount,
      transaction_id: result.transaction_id,
      purchase_order_id: result.purchase_order_id,
    });
  } catch (error) {
    console.error('[Khalti Route] Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check payment status',
      message: error.message,
    });
  }
});

/**
 * POST /api/khalti/callback
 * Webhook callback from Khalti after payment
 * This is called by Khalti server
 */
router.post('/callback', async (req, res) => {
  try {
    const { pidx, status, booking_id } = req.body;

    console.log('[Khalti Callback] Received callback:', {
      pidx,
      status,
      booking_id,
    });

    if (status !== 'Completed') {
      console.log('[Khalti Callback] Payment not completed, status:', status);
      return res.json({
        success: false,
        message: 'Payment not completed',
      });
    }

    // Find booking and update
    const booking = await Booking.findOne({ khaltiPaymentId: pidx });
    if (!booking) {
      console.warn('[Khalti Callback] Booking not found for pidx:', pidx);
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Verify with Khalti
    const validation = await validatePayment(
      pidx,
      (booking.amount + 50) * 100,
      booking.bookingId
    );

    if (validation.valid) {
      booking.khaltiStatus = 'completed';
      booking.khaltiTransactionId = validation.paymentData.transaction_id;
      booking.paymentStatus = 'paid';
      booking.bookingStatus = 'confirmed';
      await booking.save();

      console.log('[Khalti Callback] Booking confirmed:', booking._id);
    }

    res.json({
      success: true,
      message: 'Callback processed',
    });
  } catch (error) {
    console.error('[Khalti Callback] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Callback processing failed',
    });
  }
});

export default router;
