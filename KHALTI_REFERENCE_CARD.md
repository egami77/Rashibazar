# Khalti Payment Integration - Visual Reference Card

## 🎨 Visual Summary

### Payment Flow (Visual)
```
USER JOURNEY:

   Login
     ↓
  Booking Page
     ↓
  Select Astrologer
     ↓
  Choose Date/Time
     ↓
  SELECT PAYMENT METHOD ← NEW!
     ├─→ Pay on Visit   (existing)
     └─→ Khalti Wallet  (NEW!)
     ↓
  Khalti Wallet Selected
     ↓
  Confirm Booking
     ↓
  REDIRECT TO KHALTI ← NEW!
     ↓
  https://dev.khalti.com (payment page)
     ↓
  Enter ID: 9800000000
     ↓
  Enter MPIN: 1111
     ↓
  Enter OTP: 987654
     ↓
  Payment Processed
     ↓
  REDIRECT BACK (callback) ← NEW!
     ↓
  VERIFY PAYMENT ← NEW!
     ↓
  SUCCESS PAGE ← NEW!
     ↓
  My Bookings (Confirmed)
```

---

## 📦 Component Map

```
┌─────────────────────────────────────────────────────────────┐
│                      RashiBazar                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FRONTEND                          BACKEND                │
│  ┌──────────────────┐             ┌──────────────────┐   │
│  │ Booking.jsx      │             │ khaltiService.js │   │
│  │ ├─ Payment Opts  │◄────────────│ ├─ Initiate      │   │
│  │ └─ handleBooking │             │ ├─ Lookup        │   │
│  └──────────────────┘             │ └─ Validate      │   │
│         │                         └──────────────────┘   │
│         │                                   │            │
│         ├────────────────────────────────────┤            │
│                                    │                     │
│  ┌──────────────────┐             ┌──────────────────┐   │
│  │PaymentCallback.jsx              │ khaltiRoutes.js  │   │
│  │ ├─ Verify       │◄────────────│ ├─ /initiate      │   │
│  │ ├─ Show Success │             │ ├─ /verify       │   │
│  │ └─ Redirect     │             │ ├─ /status       │   │
│  └──────────────────┘             │ └─ /callback     │   │
│                                   └──────────────────┘   │
│                                            │            │
│  ┌──────────────────┐             ┌────────┴─────────┐   │
│  │ App.jsx          │             │ Booking Model    │   │
│  │ ├─ /booking      │             │ ├─ khaltiPayment │   │
│  │ ├─ /payment/cb   │             │ ├─ khaltiStatus  │   │
│  │ └─ Routes        │             │ └─ khaltiTxnId   │   │
│  └──────────────────┘             └──────────────────┘   │
│                                                          │
│                        DATABASE                         │
│                      (MongoDB)                          │
│                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  API INTERACTION DIAGRAM                   │
└─────────────────────────────────────────────────────────────┘

Step 1: INITIATE PAYMENT
────────────────────────
Frontend                Backend              Khalti
   │                       │                   │
   │ POST /khalti/initiate  │                   │
   ├──────────────────────>│                   │
   │                       │ POST /epayment/   │
   │                       │ initiate/         │
   │                       ├──────────────────>│
   │                       │                   │
   │                       │ {pidx, url}       │
   │                       │<──────────────────┤
   │ {pidx, url}           │                   │
   │<──────────────────────┤                   │
   │                       │                   │

Step 2: USER PROCESSES PAYMENT (at Khalti)
─────────────────────────────────────────
Frontend              Khalti              User
   │                   │                   │
   │ Redirect to URL   │                   │
   ├──────────────────>│                   │
   │                   │ Enter ID (9800...)
   │                   │<──────────────────┤
   │                   │ Enter MPIN (1111) │
   │                   │<──────────────────┤
   │                   │ Enter OTP (987654)│
   │                   │<──────────────────┤
   │                   │ Payment Success   │
   │                   │─────────────────->│

Step 3: VERIFY PAYMENT
──────────────────────
Frontend              Backend             Khalti
   │                   │                   │
   │ /payment/callback  │                   │
   │ (redirected from Khalti)               │
   │                   │ GET /lookup-order │
   │                   │ /{pidx}/          │
   │                   ├──────────────────>│
   │                   │ {status, amount}  │
   │ POST /khalti/verify                 │
   │ {pidx, bookingId}  │<──────────────────┤
   ├──────────────────>│                   │
   │                   │ Validate & Update │
   │                   │ Booking (paid)    │
   │ {success: true}    │                   │
   │<──────────────────┤                   │
   │                   │                   │
```

---

## 🗂️ File Organization

```
RashiBazar/
│
├── backend/
│   ├── .env (MODIFIED)
│   │   └── + KHALTI_SECRET_KEY
│   │   └── + KHALTI_PUBLIC_KEY
│   │   └── + KHALTI_SANDBOX_URL
│   │
│   ├── utils/
│   │   └── khaltiService.js (NEW ⭐)
│   │       ├── initiatePayment()
│   │       ├── lookupPayment()
│   │       └── validatePayment()
│   │
│   ├── routes/
│   │   └── khaltiRoutes.js (NEW ⭐)
│   │       ├── POST /khalti/initiate
│   │       ├── POST /khalti/verify
│   │       ├── GET /khalti/status/:pidx
│   │       └── POST /khalti/callback
│   │
│   ├── models/
│   │   └── Booking.js (MODIFIED)
│   │       ├── khaltiPaymentId
│   │       ├── khaltiTransactionId
│   │       ├── khaltiPaymentUrl
│   │       ├── khaltiExpiresAt
│   │       └── khaltiStatus
│   │
│   └── server.js (MODIFIED)
│       └── + khaltiRoutes
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Booking.jsx (MODIFIED)
│       │   │   └── + Khalti payment option
│       │   │   └── + handleBooking redirect
│       │   │
│       │   └── PaymentCallback.jsx (NEW ⭐)
│       │       ├── verifyPayment()
│       │       ├── Success display
│       │       └── Error handling
│       │
│       └── App.jsx (MODIFIED)
│           └── + /payment/callback route
│
└── Documentation/ (NEW ⭐)
    ├── KHALTI_README.md
    ├── KHALTI_SUMMARY.md
    ├── KHALTI_QUICK_TEST.md
    ├── KHALTI_INTEGRATION_GUIDE.md
    └── KHALTI_ARCHITECTURE.md
```

---

## 📊 Database Changes

### Booking Collection Update
```javascript
// BEFORE (Pay on Visit only)
{
  _id: ObjectId,
  bookingId: "BOOK-...",
  userId: ObjectId,
  paymentMethod: "pay_on_visit",
  paymentStatus: "pending"
}

// AFTER (with Khalti support)
{
  _id: ObjectId,
  bookingId: "BOOK-...",
  userId: ObjectId,
  paymentMethod: "pay_on_visit" | "khalti",  // ← UPDATED
  paymentStatus: "pending" | "paid" | "failed",
  
  // NEW FIELDS
  khaltiPaymentId: "1JO01O115O95...",        // pidx
  khaltiTransactionId: "DyILGdXGbADjWs",     // txn id
  khaltiPaymentUrl: "https://...",           // checkout url
  khaltiExpiresAt: ISODate("2024-04-07..."), // expiry
  khaltiStatus: "initiated" | "completed"    // status
}
```

---

## 🔐 Security Layers

```
┌────────────────────────────────────────────────┐
│          SECURITY VALIDATION STACK            │
├────────────────────────────────────────────────┤
│ 1. JWT AUTHENTICATION                         │
│    ├─ Token required in Authorization header  │
│    ├─ Verified with JWT_SECRET key            │
│    └─ User ID extracted from token            │
│                                               │
│ 2. USER OWNERSHIP VERIFICATION                │
│    ├─ Booking.userId == JWT.user.id           │
│    ├─ Prevents cross-user payment             │
│    └─ Returns 403 if mismatch                  │
│                                               │
│ 3. AMOUNT VALIDATION                          │
│    ├─ Request amount == booking.amount        │
│    ├─ Check for manipulation attempts         │
│    └─ Returns 400 if mismatch                  │
│                                               │
│ 4. KHALTI VERIFICATION                        │
│    ├─ Call Khalti lookup-order API            │
│    ├─ Verify status = "Completed"             │
│    ├─ Verify amount matches (±1 paisa)        │
│    ├─ Verify order ID matches                 │
│    └─ Returns 400 if any mismatch             │
│                                               │
│ 5. ATOMIC DATABASE UPDATE                     │
│    ├─ Only after all validations pass         │
│    ├─ Single atomic operation                 │
│    └─ Transaction state consistency           │
└────────────────────────────────────────────────┘
```

---

## 🎯 Quick Reference Card

### Test Credentials
```
┌─────────────────────┬──────────────────────┐
│ Field               │ Value                │
├─────────────────────┼──────────────────────┤
│ Khalti IDs          │ 9800000000-05        │
│ MPIN                │ 1111                 │
│ OTP                 │ 987654               │
│ Phone (any)         │ 10-digit number      │
│ Sandbox URL         │ https://dev.khalti...│
└─────────────────────┴──────────────────────┘
```

### API Endpoints
```
┌─────────────────────────────────────────────┐
│ POST /api/khalti/initiate                   │
│ Starts payment process                      │
├─────────────────────────────────────────────┤
│ POST /api/khalti/verify                     │
│ Verifies payment after Khalti redirect      │
├─────────────────────────────────────────────┤
│ GET /api/khalti/status/:pidx                │
│ Checks payment status                       │
├─────────────────────────────────────────────┤
│ POST /api/khalti/callback                   │
│ Webhook from Khalti (server-to-server)      │
└─────────────────────────────────────────────┘
```

### Status/State Values
```
Payment Method: "pay_on_visit" | "khalti"
Payment Status: "pending" | "paid" | "failed" | "refunded"
Khalti Status: "initiated" | "completed" | "expired" | "failed"
Booking Status: "pending" | "confirmed" | "completed" | "cancelled"
```

---

## 🚀 Quick Start Steps

```
STEP 1: BACKEND READY ✓
$ cd backend && npm run dev
→ Watch for: ✅ Server running on port 5000

STEP 2: FRONTEND READY ✓
$ cd frontend && npm run dev
→ Watch for: ✅ Server running on localhost:5173

STEP 3: LOGIN ✓
Navigate to: http://localhost:5173/login
→ Login with any test user

STEP 4: START BOOKING ✓
Navigate to: http://localhost:5173/booking
→ Select astrologer

STEP 5: SELECT DATE/TIME ✓
→ Choose date and time

STEP 6: SELECT KHALTI ✓
→ Choose "Khalti Wallet" payment method

STEP 7: CONFIRM ✓
→ Click "Confirm Booking"
→ Redirected to https://dev.khalti.com

STEP 8: PAY ON KHALTI ✓
→ Enter ID: 9800000000
→ Enter MPIN: 1111
→ Enter OTP: 987654
→ Confirm payment

STEP 9: SUCCESS ✓
→ Redirected to /payment/callback
→ Payment verified
→ Booking confirmed
→ Redirected to /my-bookings
```

---

## 📈 Performance Targets

```
┌──────────────────────┬─────────────────┐
│ Operation            │ Expected Time   │
├──────────────────────┼─────────────────┤
│ Initiate Payment     │ < 2 seconds     │
│ Khalti Redirect      │ < 1 second      │
│ User Payment Entry   │ Depends on user │
│ Payment Verification │ < 2 seconds     │
│ Total Flow           │ < 10 seconds    │
└──────────────────────┴─────────────────┘
```

---

## ✅ Deployment Checklist

```
PRE-LAUNCH
├─ [ ] Backend running successfully
├─ [ ] Frontend running successfully
├─ [ ] MongoDB connected
├─ [ ] .env has correct Khalti keys
└─ [ ] Can complete payment flow

SANDBOX TESTING
├─ [ ] Payment initiated successfully
├─ [ ] Khalti payment page loads
├─ [ ] Payment verified correctly
├─ [ ] Booking marked as confirmed
├─ [ ] Database updated correctly
└─ [ ] Error scenarios handled

PRODUCTION READY
├─ [ ] Production Khalti keys obtained
├─ [ ] Business verification complete
├─ [ ] Return URL updated for production
├─ [ ] Environment variables updated
├─ [ ] Database schema migrated
└─ [ ] Load testing completed
```

---

## 🐛 Common Issues at a Glance

```
ISSUE: Khalti page doesn't load
→ Check: KHALTI_SECRET_KEY in .env

ISSUE: "Booking not found" error
→ Check: bookingId is valid in database

ISSUE: "Payment status pending" error
→ Check: Are you using correct OTP (987654)?

ISSUE: "Amount mismatch" error
→ Check: Astrologer pricing is set correctly

ISSUE: "Unauthorized" error
→ Check: JWT token in localStorage, try re-login

ISSUE: Database not updating
→ Check: Backend logs for validation errors
```

---

## 📚 Documentation Map

```
START HERE
    ↓
KHALTI_README.md (this index)
    ├─→ KHALTI_SUMMARY.md (overview)
    ├─→ KHALTI_QUICK_TEST.md (testing)
    ├─→ KHALTI_ARCHITECTURE.md (technical)
    └─→ KHALTI_INTEGRATION_GUIDE.md (production)
```

---

## 🔗 Resources

```
Documentation Files:
├─ All files in project root
└─ Start with KHALTI_README.md

Code Files:
├─ backend/utils/khaltiService.js
├─ backend/routes/khaltiRoutes.js
└─ frontend/src/pages/PaymentCallback.jsx

External Resources:
├─ Khalti Docs: https://docs.khalti.com/
├─ Sandbox: https://dev.khalti.com/
└─ Dashboard: https://test-admin.khalti.com/
```

---

## 📞 Need Help?

1. **Quick Fix?** → See "Common Issues at a Glance" above
2. **Want to Test?** → Read KHALTI_QUICK_TEST.md
3. **Learning?** → Read KHALTI_SUMMARY.md first
4. **Debugging?** → Check KHALTI_ARCHITECTURE.md
5. **Going Live?** → Read KHALTI_INTEGRATION_GUIDE.md

---

**Status:** ✅ READY FOR TESTING  
**Last Updated:** 2024-04-06  
**Version:** 1.0
