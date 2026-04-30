# Khalti Payment Gateway Integration Guide

## 🎯 Overview

This guide documents the complete Khalti Payment Gateway integration for the RashiBazar application, enabling secure payment processing for astrology consultation bookings.

## 📋 Components Added

### 1. Backend Components

#### **khaltiService.js** (`backend/utils/khaltiService.js`)
Core service for all Khalti API operations:
- `initiatePayment()` - Initiate payment with Khalti
- `lookupPayment()` - Check payment status
- `validatePayment()` - Validate payment completion
- Comprehensive error handling and logging

#### **khaltiRoutes.js** (`backend/routes/khaltiRoutes.js`)
REST API endpoints:
- `POST /api/khalti/initiate` - Start payment flow
- `POST /api/khalti/verify` - Verify payment after callback
- `GET /api/khalti/status/:pidx` - Check payment status
- `POST /api/khalti/callback` - Webhook for Khalti callbacks

#### **Booking Model Updates**
Added Khalti-specific fields:
- `khaltiPaymentId` - Payment index (pidx)
- `khaltiTransactionId` - Transaction ID from Khalti
- `khaltiPaymentUrl` - Payment page URL
- `khaltiExpiresAt` - Payment expiry timestamp
- `khaltiStatus` - Khalti-specific status (initiated/completed/expired/failed)

### 2. Frontend Components

#### **PaymentCallback.jsx** (`frontend/src/pages/PaymentCallback.jsx`)
Handles post-payment flow:
- Receives redirect from Khalti with pidx and status
- Verifies payment with backend
- Shows success/failure UI
- Auto-redirects to booking confirmation

#### **Updated App.jsx**
- Added `/payment/callback` route
- Imported PaymentCallback component

#### **Updated Booking.jsx**
- Added Khalti as payment method option
- Modified handleBooking to initiate Khalti payment
- Redirects to Khalti payment page for Khalti payments
- Maintains "Pay on Visit" option

## 🔧 environment Configuration

### Backend .env Variables
```env
# Khalti Payment Gateway
KHALTI_SECRET_KEY=69cf0449a6b54f70b862fd3dc8210ff4
KHALTI_PUBLIC_KEY=79858c236bc7492ab915115d2a53f59e
KHALTI_SANDBOX_URL=https://dev.khalti.com
KHALTI_API_VERSION=v2
```

## 📊 Payment Flow

### Step 1: User Initiates Payment
```
User selects Khalti as payment method → Clicks "Confirm Booking"
↓
Frontend creates booking via POST /api/bookings
```

### Step 2: Backend Initiates Khalti Payment
```
POST /api/khalti/initiate
├─ Validates booking details
├─ Calls Khalti API
├─ Receives pidx and payment_url
└─ Updates booking with khaltiPaymentId
```

### Step 3: User Redirected to Khalti
```
Frontend receives payment_url
↓
Redirects: window.location.href = payment_url
↓
User enters Khalti credentials on https://dev.khalti.com
```

### Step 4: Khalti Processes Payment
```
Khalti processes user input
├─ User enters Khalti ID (e.g., 9800000000)
├─ User enters MPIN (1111)
├─ User enters OTP (987654)
└─ Payment processed
```

### Step 5: Khalti Redirects Back to App
```
Khalti redirects to: /payment/callback?pidx=...&status=...&bookingId=...
```

### Step 6: Frontend Verifies Payment
```
PaymentCallback.jsx
├─ Extracts pidx and bookingId
├─ Calls POST /api/khalti/verify
└─ Backend validates with Khalti
```

### Step 7: Backend Confirms Booking
```
POST /api/khalti/verify receives pidx and bookingId
├─ Validates payment with Khalti
├─ Updates booking:
│  ├─ paymentStatus = 'paid'
│  ├─ bookingStatus = 'confirmed'
│  └─ khaltiStatus = 'completed'
└─ Returns success
```

### Step 8: Success Page Shown
```
PaymentCallback shows success UI
├─ Displays booking confirmation
├─ Shows transaction details
└─ Auto-redirects to /my-bookings after 3s
```

## 🧪 Testing Guide

### Test Credentials (Sandbox Only)

**Khalti Wallet IDs (use any one):**
- 9800000000
- 9800000001
- 9800000002
- 9800000003
- 9800000004
- 9800000005

**MPIN:** `1111`
**OTP:** `987654`

### Testing Steps

#### 1. Local Environment Setup
```bash
# Backend
cd backend
npm install  # axios should already be installed
npm run dev

# Frontend
cd ../frontend
npm run dev
```

#### 2. Create Test Booking
1. Login as user
2. Navigate to `/booking`
3. Select an astrologer
4. Choose date and time
5. Select **Khalti Wallet** as payment method
6. Enter optional notes
7. Click **Confirm Booking**

#### 3. Khalti Payment Page
1. You'll be redirected to `https://dev.khalti.com`
2. Select "Khalti Wallet" (mobile wallet icon)
3. Enter Khalti ID: `9800000000`
4. Click "Request OTP"
5. Enter phone number (any number with 10 digits)
6. Enter MPIN: `1111`
7. Enter OTP: `987654`
8. Confirm payment

#### 4. Verify Payment Callback
1. You'll be redirected back to `/payment/callback`
2. App verifies payment with Khalti API
3. Shows success/failure message
4. Auto-redirects to `/my-bookings` after 3 seconds

#### 5. Verify in Database
```bash
# Check booking status
db.bookings.findOne({ khaltiPaymentId: "<pidx>" })

# Expected output:
{
  khaltiPaymentId: "...",
  khaltiTransactionId: "...",
  khaltiStatus: "completed",
  paymentStatus: "paid",
  bookingStatus: "confirmed",
  ...
}
```

## 🔍 Debugging

### Enable Logging
All Khalti operations log to console with `[Khalti Service]`, `[Khalti Route]`, or `[PaymentCallback]` prefix.

```javascript
// Backend logs:
[Khalti Service] Initiating payment...
[Khalti Service] Payment initiated successfully...
[Khalti Route] Initiating payment...
[Khalti Callback] Received callback...

// Frontend logs:
[Booking] Initiating Khalti payment for booking...
[PaymentCallback] Received params...
[PaymentCallback] Payment verified successfully
```

### Common Issues & Solutions

**Issue: "Payment URL not loading"**
- Verify `KHALTI_SECRET_KEY` is correct
- Check network requests in browser DevTools
- Ensure `CLIENT_URL` env variable matches your localhost

**Issue: "Payment verification failed"**
- Check that pidx is correct
- Verify booking exists in database
- Check console logs for detailed error

**Issue: "Payment amount mismatch"**
- Verify astrologer pricing is set
- Check amount calculation (price + 50)
- Ensure amounts convert correctly (rupees → paisa)

**Issue: "401 Unauthorized"**
- Verify JWT token is present in Authorization header
- Check token hasn't expired
- Clear browser cache and re-login

## 🛡️ Security Best Practices

1. **Secret Key Protection**
   - Never expose `KHALTI_SECRET_KEY` in frontend code
   - Only use in backend API calls
   - Set in environment variables, never hardcode

2. **Amount Verification**
   - Always verify payment amount matches booking price
   - Check for amount manipulation attempts
   - Allow 1 paisa tolerance for rounding

3. **Payment Validation**
   - Always validate payment with Khalti's lookup API
   - Verify transaction ID matches
   - Confirm payment status is "Completed"

4. **User Authentication**
   - Require valid JWT token for all payment routes
   - Verify user owns the booking
   - Prevent payment access from unauthorized users

## 📱 Production Setup

To move to production after testing:

1. **Get Production Credentials**
   - Visit https://khalti.com/merchant/
   - Save production secret key
   - Save production public key

2. **Update Environment Variables**
   ```env
   KHALTI_SECRET_KEY=<production_secret_key>
   KHALTI_PUBLIC_KEY=<production_public_key>
   KHALTI_SANDBOX_URL=https://khalti.com  # Change from dev
   ```

3. **Update Return URL**
   ```
   return_url=https://yourdomain.com/payment/callback
   website_url=https://yourdomain.com
   ```

4. **Business Verification**
   - Register business at https://khalti.com/merchant/
   - Submit required documents
   - Wait for approval

5. **Test in Production Sandbox**
   - Use same test credentials for final testing
   - Test with actual users (using small amounts)
   - Monitor transaction logs

## 🔄 API Reference

### initiatePayment()
```javascript
const result = await initiatePayment({
  amount: 100,                  // in paisa (100 paisa = 1 NPR)
  purchase_order_id: "BOOK-...",
  purchase_order_name: "Booking - BOOK-...",
  return_url: "http://localhost:5173/payment/callback",
  website_url: "http://localhost:5173",
  customer_info: {
    name: "User Name",
    email: "user@example.com",
    phone: "9800000000"
  }
});

// Returns:
{
  success: true,
  pidx: "...",
  payment_url: "https://dev.khalti.com/checkout/...",
  expires_at: "2024-04-07T12:00:00Z"
}
```

### verifyPayment()
```javascript
// Backend route
POST /api/khalti/verify
Body: { pidx, bookingId }

// Returns:
{
  success: true,
  message: "Payment verified successfully",
  booking: {
    _id: "...",
    bookingId: "BOOK-...",
    paymentStatus: "paid",
    bookingStatus: "confirmed"
  },
  transaction: {
    transactionId: "...",
    pidx: "...",
    amount: 100
  }
}
```

### lookupPayment()
```javascript
const result = await lookupPayment(pidx);

// Returns:
{
  success: true,
  pidx: "...",
  status: "Completed",
  amount: 100,
  transaction_id: "...",
  purchase_order_id: "BOOK-...",
  isCompleted: true
}
```

## 📝 Database Schema Changes

### Booking Model
```javascript
// New Khalti fields added:
khaltiPaymentId: String,        // pidx from Khalti
khaltiTransactionId: String,    // Transaction ID
khaltiPaymentUrl: String,       // Payment page URL
khaltiExpiresAt: Date,          // Payment expiry
khaltiStatus: String,           // 'initiated' | 'completed' | 'expired' | 'failed'

// Updated field:
paymentMethod: String,          // 'pay_on_visit' | 'khalti'
```

## 🚀 Next Steps

1. **Test with multiple users**
2. **Monitor Bangalore logs**
3. **Validate error handling**
4. **Test network failures**
5. **Plan production deployment**
6. **Create admin dashboard for transactions**
7. **Add refund handling**
8. **Setup email confirmations**

## 📞 Support & Resources

- **Khalti Docs:** https://docs.khalti.com/
- **Khalti Test Dashboard:** https://test-admin.khalti.com/
- **Sandbox Payment Page:** https://dev.khalti.com/
- **Error Codes:** Check Khalti documentation

## ✅ Checklist

- [x] Add Khalti credentials to .env
- [x] Create khaltiService.js utility
- [x] Create khaltiRoutes.js endpoints
- [x] Update Booking model
- [x] Update server.js to register routes
- [x] Create PaymentCallback.jsx
- [x] Update Booking.jsx
- [x] Update App.jsx with callback route
- [x] Test booking creation
- [x] Test Khalti payment flow
- [x] Test payment verification
- [x] Document integration
- [ ] Create admin transaction dashboard
- [ ] Setup email notifications
- [ ] Configure production credentials
- [ ] Deploy to production

---

**Integration Date:** 2024-04-06
**Status:** Ready for Testing
**Environment:** Sandbox (dev.khalti.com)
