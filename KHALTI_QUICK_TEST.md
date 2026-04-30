# Khalti Integration Quick Test Guide

## 🚀 5-Minute Setup

### 1. Start Backend
```bash
cd backend
npm run dev
# Watch for: ✅ Server running on port 5000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Watch for: ✅ Server running on localhost:5173
```

## ✅ Testing Checklist

### Phase 1: Authentication (1 min)
- [ ] Open http://localhost:5173
- [ ] Login with test user credentials
- [ ] Verify JWT token in localStorage

### Phase 2: Booking Creation (2 min)
- [ ] Click "Booking"
- [ ] Select an astrologer
- [ ] Select date and time
- [ ] Select **Khalti Wallet** payment method
- [ ] Click **Confirm Booking**
- [ ] Check console for: `[Booking] Initiating Khalti payment`

### Phase 3: Payment in Khalti (1 min)
You'll be redirected to https://dev.khalti.com:
- [ ] Select "Khalti Wallet"
- [ ] Enter ID: **9800000000**
- [ ] Click "Request OTP"
- [ ] Enter any 10-digit phone number
- [ ] Enter MPIN: **1111**
- [ ] Enter OTP: **987654**
- [ ] Click "Pay"
- [ ] Wait for redirect back to app

### Phase 4: Verification (1 min)
- [ ] See loading: "Verifying Your Payment"
- [ ] See success page with green checkmark
- [ ] See booking confirmation details
- [ ] Auto-redirect to /my-bookings
- [ ] See booking in "My Bookings" with "Confirmed" status

## 🔍 Debugging

### Check Backend Logs
```
[Khalti Service] Initiating payment...
[Khalti Route] Booking updated with payment details...
[Khalti Service] Payment status retrieved...
```

### Check Frontend Logs
```
[Booking] Initiating Khalti payment for booking
[PaymentCallback] Received params
[PaymentCallback] Payment verified successfully
```

### MongoDB Check
```bash
# Connect to MongoDB
db.bookings.find({ khaltiPaymentId: { $exists: true } }).pretty()

# Should show:
{
  khaltiPaymentId: "pidx_1234...",
  khaltiStatus: "completed",
  paymentStatus: "paid",
  bookingStatus: "confirmed"
}
```

## 🎯 Test Scenarios

### Scenario 1: Successful Payment ✅
**Expected:** Booking confirmed, payment marked as paid
```
Payment Flow: User → Khalti → Success → My Bookings
```

### Scenario 2: Failed Payment ❌
**Expected:** Error message, booking still pending
```
Wrong OTP → Payment fails → Redirect to error page → Try again
```

### Scenario 3: Abandoned Payment
**Expected:** Booking stays in pending state
```
User closes Khalti page → No callback → Need to retry
```

## 📊 Key Files to Monitor

| File | Purpose | Key Line |
|------|---------|----------|
| `khaltiService.js` | API calls | `initiatePayment()` |
| `khaltiRoutes.js` | Backend endpoints | `POST /khalti/verify` |
| `PaymentCallback.jsx` | Verification UI | `verifyPayment()` |
| `Booking.jsx` | Payment selection | `handleBooking()` |
| `Booking.js` Model | Data schema | `khaltiPaymentId` |

## 🔧 Quick Fixes

### Fix: "Secret key invalid"
```bash
# Verify in .env
KHALTI_SECRET_KEY=69cf0449a6b54f70b862fd3dc8210ff4
```

### Fix: "Payment URL shows 404"
```bash
# Clear cache and hard refresh
Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### Fix: "Token expired"
```bash
# Clear localStorage and re-login
localStorage.clear()
```

### Fix: "Booking not found"
```bash
# Verify bookingId is correct in URL
# Check MongoDB for booking existence
```

## 📱 Test Credentials Reference

| Field | Value |
|-------|-------|
| Khalti ID | 9800000000 |
| MPIN | 1111 |
| OTP | 987654 |
| Phone | Any 10-digit number |

## ✨ Expected Outputs

### Success Response (Backend)
```json
{
  "success": true,
  "pidx": "1JO01O115O95...",
  "payment_url": "https://dev.khalti.com/checkout/1JO01O115O95...",
  "expires_at": "2024-04-07T12:30:00Z"
}
```

### Verification Response (Backend)
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "booking": {
    "_id": "660a1b2c3d4e5f6g7h8i9j0k",
    "bookingId": "BOOK-1712471234567-ABC123",
    "paymentStatus": "paid",
    "bookingStatus": "confirmed"
  }
}
```

## ⚡ Performance Metrics

| Operation | Expected Time | Actual Time |
|-----------|---|---|
| Initiate Payment | < 2s | --- |
| User Enters Khalti | Instant | --- |
| Khalti Processing | < 5s | --- |
| Verification | < 2s | --- |
| Total Flow | < 10s | --- |

## 🎓 Learning Path

1. **Understand Flow:** Read diagram in README
2. **Setup Test:** Follow 5-minute setup above
3. **Successful Payment:** Complete Phase 1-4
4. **Debug Issues:** Check debugging section
5. **Read Code:** Study khaltiService.js
6. **Production Ready:** Update to production keys

## 📋 Final Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on localhost:5173
- [ ] MongoDB connected
- [ ] .env has correct Khalti keys
- [ ] PaymentCallback route added to App.jsx
- [ ] Khalti heading Payment route added to Booking.jsx
- [ ] Can complete full payment flow
- [ ] Database shows confirmed booking
- [ ] Can redirect to payment page
- [ ] Can verify payment callback

---

**Status:** Ready for Testing
**Last Updated:** 2024-04-06
**Sandbox URL:** https://dev.khalti.com/
