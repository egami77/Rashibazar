# Khalti Payment Integration - Architecture & Implementation

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         RashiBazar App Flow                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Frontend   │        │   Backend    │        │   Khalti     │
│  (React)     │        │ (Node/Exp)   │        │   Server     │
└──────┬───────┘        └──────┬───────┘        └──────┬───────┘
       │                       │                       │
       │ 1. Select Booking     │                       │
       ├──────────────>────────┤                       │
       │                       │ POST /bookings        │
       │                 2. Create & Return bookingId │
       │<──────────────────────┤                       │
       │                       │                       │
       │ 3. Select Khalti      │                       │
       ├──────────────>────────┤                       │
       │                       │ POST /khalti/initiate │
       │                       ├──────────────>────────┤
       │                       │                       │
       │                       │ 6. Return pidx & URL  │
       │                       │<──────────────────────┤
       │ 4. Redirect to Khalti │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │ 5. User Payment       │                       │
       ├──────────────────────────────────────>────────┤
       │                       │                       │
       │                       │                       │ 7. Process
       │                       │                       │    Payment
       │                       │                       │
       │ 8. Redirect to Callback                       │
       │<──────────────────────────────────────────────┤
       │                       │                       │
       │ 9. Verify Payment     │                       │
       ├──────────────>────────┤                       │
       │                       │ POST /khalti/verify   │
       │                       ├──────────────>────────┤
       │                       │                       │
       │                       │ 13. Lookup Order      │
       │                       │<──────────────────────┤
       │                       │                       │
       │ 10. Booking Confirmed │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │ 11. Show Success      │                       │
       │ 12. Redirect to /my-bookings                  │
       │                       │                       │
```

## 🔄 Detailed Payment State Machine

```
┌──────────────────┐
│   NEW BOOKING    │
│ (paymentStatus:  │
│  'pending')      │
└────────┬─────────┘
         │
         ├─ User selects "Pay on Visit"
         │  └──> Booking Confirmed (step 4)
         │
         └─ User selects "Khalti Wallet"
            │
            ├──> POST /khalti/initiate
            │    │
            │    └──> ┌─────────────────────┐
            │         │  khaltiStatus:      │
            │         │  'initiated'        │
            │         │  khaltiPaymentId: X │
            │         └─────────────────────┘
            │
            ├──> Redirect to Khalti Payment Page
            │    │
            │    ├──> User Enters Credentials (9800000000)
            │    ├──> User Enters MPIN (1111)
            │    ├──> User Enters OTP (987654)
            │    └──> Khalti Processes Payment
            │
            ├──> Khalti Redirects to /payment/callback?pidx=X
            │    │
            │    ├──> POST /khalti/verify
            │    │    │
            │    │    ├──> Validate pidx with Khalti
            │    │    │
            │    │    ├──> ┌──────────────────────────┐
            │    │    │    │  IF Payment Successful   │
            │    │    │    │  ├─ paymentStatus: paid  │
            │    │    │    │  ├─ bookingStatus: conf  │
            │    │    │    │  └─ khaltiStatus: comp   │
            │    │    │    └──────────────────────────┘
            │    │    │
            │    │    └──> ┌──────────────────────────┐
            │    │         │  IF Payment Failed       │
            │    │         │  ├─ paymentStatus: fail  │
            │    │         │  ├─ khaltiStatus: failed │
            │    │         │  └─ Show Error Message   │
            │    │         └──────────────────────────┘
            │    │
            │    └──> Show Success/Error Page
            │
            └──> Redirect to /my-bookings
                 │
                 └──> Display Confirmed Booking
                      with "Khalti Payment Received"
```

## 📦 Component Interactions

### Backend Service Layer

```
┌─────────────────────────────────────────────────┐
│            khaltiService.js                     │
│  ┌────────────────────────────────────────────┐ │
│  │ initiatePayment(paymentData)               │ │
│  │  ├─ Create axios with secret key           │ │
│  │  ├─ POST https://dev.khalti.com/api/v2/... │ │
│  │  └─ Return { pidx, payment_url, ... }      │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ lookupPayment(pidx)                        │ │
│  │  ├─ GET https://dev.khalti.com/.../pidx    │ │
│  │  └─ Return { status, amount, txn_id }      │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ validatePayment(pidx, amount, orderId)     │ │
│  │  ├─ Call lookupPayment()                   │ │
│  │  ├─ Verify status = "Completed"            │ │
│  │  ├─ Verify amount matches (±1 paisa)       │ │
│  │  └─ Verify order ID matches                │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Backend Routes Layer

```
┌──────────────────────────────────────────────────────────┐
│              khaltiRoutes.js                             │
├──────────────────────────────────────────────────────────┤
│ POST /khalti/initiate                                    │
│  ├─ Auth: JWT token required                            │
│  ├─ Body: { bookingId, amount, customerInfo }           │
│  ├─ Logic:                                              │
│  │  ├─ Fetch booking & verify ownership                 │
│  │  ├─ Call khaltiService.initiatePayment()             │
│  │  ├─ Save pidx to booking.khaltiPaymentId             │
│  │  └─ Return { pidx, payment_url }                     │
│  └─ Status: 201 Created                                 │
│                                                          │
│ POST /khalti/verify                                     │
│  ├─ Auth: JWT token required                            │
│  ├─ Body: { pidx, bookingId }                           │
│  ├─ Logic:                                              │
│  │  ├─ Fetch booking & verify ownership                 │
│  │  ├─ Call khaltiService.validatePayment()             │
│  │  ├─ If valid:                                        │
│  │  │  ├─ booking.paymentStatus = 'paid'                │
│  │  │  ├─ booking.bookingStatus = 'confirmed'           │
│  │  │  └─ Save to DB                                    │
│  │  └─ Return success/error                             │
│  └─ Status: 200 OK                                      │
│                                                          │
│ GET /khalti/status/:pidx                                │
│  ├─ Auth: JWT token required                            │
│  ├─ Logic: Call khaltiService.lookupPayment()           │
│  └─ Return { status, amount, transactionId }            │
│                                                          │
│ POST /khalti/callback (Webhook)                         │
│  ├─ No Auth (Khalti server calls)                       │
│  ├─ Body: { pidx, status, booking_id }                  │
│  └─ Logic: Update booking if status = "Completed"       │
└──────────────────────────────────────────────────────────┘
```

### Frontend Component Flow

```
┌─────────────────────────────────────────────┐
│         Booking.jsx (Step 3)                │
│  ┌───────────────────────────────────────┐  │
│  │ Payment Method Selection              │  │
│  │ ├─ "Pay on Visit"                     │  │
│  │ └─ "Khalti Wallet" (NEW)              │  │
│  └────────────┬──────────────────────────┘  │
│               │                             │
│         User selects Khalti                 │
│               │                             │
│               ├──> handleBooking()          │
│               │    │                        │
│               │    ├─ POST /bookings        │
│               │    ├─ POST /khalti/initiate │
│               │    └─ Get payment_url       │
│               │                             │
│               ├──> window.location.href =   │
│               │     payment_url             │
│               │                             │
│  ┌────────────┴──────────────────────────┐  │
│  │  [KAHTI Redirects to Page]            │  │
│  │  https://dev.khalti.com/checkout/...  │  │
│  └────────────────────────────────────────┘  │
│               │                             │
│         [User Completes Payment]            │
│               │                             │
│  ┌────────────┴──────────────────────────┐  │
│  │  Khalti Redirects Back                │  │
│  │  /payment/callback?pidx=...&status... │  │
│  └────────────┬──────────────────────────┘  │
│               │                             │
│  ┌────────────┴──────────────────────────┐  │
│  │   PaymentCallback.jsx                 │  │
│  │  ├─ Extract pidx & bookingId          │  │
│  │  ├─ POST /khalti/verify               │  │
│  │  ├─ Show Success/Error UI             │  │
│  │  └─ Auto-redirect /my-bookings        │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 💾 Database Schema Changes

### Booking Model - New Fields

```javascript
// Before (Pay on Visit only)
{
  bookingId: String,
  userId: ObjectId,
  astrologerId: ObjectId,
  paymentMethod: 'pay_on_visit',
  paymentStatus: 'pending',
}

// After (Khalti support added)
{
  bookingId: String,
  userId: ObjectId,
  astrologerId: ObjectId,
  
  // Original fields
  paymentMethod: 'pay_on_visit' | 'khalti',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  
  // NEW Khalti fields
  khaltiPaymentId: String,           // pidx
  khaltiTransactionId: String,       // Transaction ID from Khalti
  khaltiPaymentUrl: String,          // Khalti checkout URL
  khaltiExpiresAt: Date,             // Payment expiry time
  khaltiStatus: 'initiated' | 'completed' | 'expired' | 'failed'
}
```

### Sample Documents

```javascript
// Pay on Visit Booking
db.bookings.insertOne({
  bookingId: "BOOK-1712471234567-ABC123",
  userId: ObjectId("..."),
  astrologerId: ObjectId("..."),
  paymentMethod: "pay_on_visit",
  paymentStatus: "pending",
  bookingStatus: "pending"
})

// Khalti Payment - Initiated
db.bookings.insertOne({
  bookingId: "BOOK-1712471234568-XYZ789",
  userId: ObjectId("..."),
  astrologerId: ObjectId("..."),
  paymentMethod: "khalti",
  paymentStatus: "pending",
  bookingStatus: "pending",
  khaltiPaymentId: "1JO01O115O95...",
  khaltiPaymentUrl: "https://dev.khalti.com/checkout/1JO01O115O95...",
  khaltiExpiresAt: ISODate("2024-04-07T12:30:00Z"),
  khaltiStatus: "initiated"
})

// Khalti Payment - Completed
db.bookings.updateOne(
  { khaltiPaymentId: "1JO01O115O95..." },
  {
    $set: {
      khaltiTransactionId: "DyILGdXGbADjWs",
      khaltiStatus: "completed",
      paymentStatus: "paid",
      bookingStatus: "confirmed"
    }
  }
)
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────┐
│          Security Validation Steps          │
└─────────────────────────────────────────────┘

1. JWT Authentication
   ├─ Every route requires valid JWT token
   ├─ Extracted from Authorization header
   └─ Verified using JWT_SECRET key

2. User Ownership Verification
   ├─ Fetch booking from database
   ├─ Compare booking.userId with JWT.user.id
   └─ Reject if mismatch

3. Amount Verification
   ├─ Request amount = booking.amount
   ├─ Verify booking.amount was calculated
   └─ Reject for mismatches > 1 paisa

4. Payment Validation
   ├─ Call Khalti lookup API with pidx
   ├─ Verify status = "Completed"
   ├─ Verify transaction ID exists
   ├─ Verify order ID matches
   └─ Verify amount matches (±1 paisa)

5. Database Update
   ├─ Only update after all validations pass
   ├─ Atomic update operation
   └─ Log all transaction details

6. Response Handling
   ├─ Never expose secret key
   ├─ Never expose pidx to frontend initially
   ├─ Always validate callback data
   └─ Implement rate limiting (future)
```

## 📊 Data Flow Diagram

```
User Input Layer:
┌─────────────────────┐
│ Select Khalti       │
│ Enter Amount        │
│ Complete Khalti OTP │
└──────────┬──────────┘
           │
Transport Layer:
           ├─ HTTP POST with JWT
           ├─ HTTPS to Khalti
           ├─ Query Parameters
           └─ JSON Bodies

Application Layer:
           │
           ├──> handleBooking()
           ├──> POST /khalti/initiate
           ├──> POST /khalti/verify
           └──> PaymentCallback verification

Service Layer:
           │
           ├──> khaltiService.initiatePayment()
           ├──> khaltiService.lookupPayment()
           └──> khaltiService.validatePayment()

API Layer:
           │
           ├──> axios POST https://dev.khalti.com/api/v2/...
           ├──> axios GET https://dev.khalti.com/api/v2/...
           └──> Handle responses/errors

Data Layer:
           │
           ├──> Booking.findById()
           ├──> booking.save()
           └──> Update payment fields
```

## 🚨 Error Handling Strategy

```
┌──────────────────────────────────────────┐
│        Error Handling Flow               │
└──────────────────────────────────────────┘

Khalti Service Errors:
├─ Network timeout → Retry logic
├─ Invalid secret key → 401
├─ Invalid pidx → 404
├─ Payment failed → User-friendly message
└─ Server error → Log & notify support

Route Handler Errors:
├─ Missing fields → 400 Bad Request
├─ Booking not found → 404 Not Found
├─ Unauthorized → 403 Forbidden
├─ Service error → 500 Server Error
└─ Validation error → 400

Frontend Errors:
├─ Network error → Retry button
├─ Payment failed → Show error message
├─ Verification failed → Try again link
└─ Timeout → Go back & retry

Database Errors:
├─ Connection lost → Reconnect
├─ Update failed → Rollback & alert
└─ Concurrent updates → Queue & retry
```

## 🔄 API Response Examples

### Initiate Payment Response
```json
{
  "success": true,
  "pidx": "1JO01O115O95Tr9EWA1Vw2",
  "payment_url": "https://dev.khalti.com/checkout/1JO01O115O95Tr9EWA1Vw2/",
  "expires_at": "2024-04-07T12:30:00Z",
  "bookingId": "507f1f77bcf86cd799439011"
}
```

### Verify Payment Response
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "bookingId": "BOOK-1712471234567-ABC123",
    "paymentStatus": "paid",
    "bookingStatus": "confirmed",
    "amount": 1050
  },
  "transaction": {
    "transactionId": "DyILGdXGbADjWs",
    "pidx": "1JO01O115O95Tr9EWA1Vw2",
    "amount": 105000
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Payment verification failed",
  "details": "Payment status is Pending, not Completed",
  "status": 400
}
```

## 📝 Logging Strategy

All Khalti operations are logged with prefix for easy tracking:

```
[Khalti Service] - khaltiService.js operations
[Khalti Route] - khaltiRoutes.js operations
[Khalti Callback] - Webhook operations
[Booking] - Booking.jsx frontend operations
[PaymentCallback] - PaymentCallback.jsx operations
```

Example logs:
```
[Khalti Service] Initiating payment with payload: { amount: 105000, purchase_order_id: "BOOK-..." }
[Khalti Service] Payment initiated successfully: { pidx: "1JO01...", payment_url: "https://..." }
[Khalti Route] Payment verified successfully: { purchaseOrderId: "BOOK-...", transactionId: "Dy..." }
[Booking] Initiating Khalti payment for booking: "507f1f77bcf86cd799439011"
[PaymentCallback] Payment verified successfully
```

---

**Status:** Production Ready (Sandbox)
**Last Updated:** 2024-04-06
**Version:** 1.0
