# RashiBazar - Quick Reference Guide
## For Viva Preparation

---

## 1. ONE-SENTENCE DEFINITION
**RashiBazar is a full-stack web application that connects users with professional astrologers for consultations, featuring Kundali generation, horoscope reading, and compatibility analysis.**

---

## 2. THREE MAIN FLOWS AT A GLANCE

### Flow 1: User Booking Consultation
```
User → Browse Astrologers → Select Slot → Create Booking (pending)
        ↓
Astrologer receives → Confirms booking → Consultation happens
        ↓
Mark Complete + Payment Status → Earnings Updated (if paid)
```

### Flow 2: Kundali Generation
```
Input (Birth Date/Time/Place) → Calculate Sun Position 
→ Apply Lahiri Ayanamsa → Determine Houses 
→ Place Planets → Display Chart
```

### Flow 3: Astrologer Dashboard
```
View Bookings → Confirm/Reject → Manage Availability 
→ Create Horoscopes → Track Earnings
```

---

## 3. KEY ENTITIES (Database Models)

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **User** | All users base | name, email, password (hashed), role |
| **Astrologer** | Astrologer profile | experience, pricing, approval status, ratings |
| **Booking** | Consultation session | userId, astrologerId, date, time, status, payment status |
| **Availability** | Time slots | astrologerId, dayOfWeek, startTime, endTime, duration |
| **Kundali** | Birth chart | userId, birthDate, time, place, planets, houses |
| **Horoscope** | Predictions | astrologerId, rashis, period, prediction text |

---

## 4. USER ROLES & PERMISSIONS

```
┌─────────────────────────────────────────────────────────┐
│ USER (Client)          │ ASTROLOGER      │ ADMIN        │
├────────────────────────┼─────────────────┼──────────────┤
│ ✓ Browse astrologers   │ ✓ Book mgmt     │ ✓ Approve    │
│ ✓ Book consultations   │ ✓ Set slots     │ ✓ Statistics │
│ ✓ Generate Kundali     │ ✓ Create horoscopes │ ✓ Moderate │
│ ✓ View horoscopes      │ ✓ View earnings │ ✓ Manage all │
│ ✓ Check compatibility  │ ✓ Edit profile  │              │
│ ✓ Track bookings       │ ✓ Check ratings │              │
└─────────────────────────────────────────────────────────┘
```

---

## 5. BOOKING STATUS STATES

```
                    PENDING
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      CONFIRMED    CANCELLED     (Invalid)
        │              │
        ↓              ↓
     COMPLETED      REJECTED
        │
     ┌──┴──┐
     ↓     ↓
   PAID  PENDING
```

---

## 6. EARNING CALCULATION FORMULA

```javascript
monthlyEarnings = 0

FOR EACH booking WHERE:
  - astrologerId = current astrologer
  - date >= first day of current month
  - date <= last day of current month
  - bookingStatus === 'completed'
  - paymentStatus === 'paid'
DO:
  monthlyEarnings += booking.amount

RETURN monthlyEarnings
```

---

## 7. KUNDALI CHART LAYOUT

```
Traditional Format (as implemented):
        
           H12     H1 (Lagna)    H2
         ┌─────────┬────────────┬─────┐
         │         │            │     │
      H11│         │            │     │H3
         │         │  HOUSE 1   │     │
      H10│         │            │     │H4
         │         │ (Ascendant)│     │
         ├─────────┼────────────┼─────┤
      H9 │  H8     │            │ H5  │
         │         │            │     │
      H8 │  H7     │            │ H6  │
         │         │            │     │
         ├─────────┼────────────┼─────┤
         │         │            │     │
      H7 │         │            │     │H7
         │         │            │     │
      H6 │ H6   H5  │ H4     H3  │ H9 │
         └─────────┴────────────┴─────┘

Anti-clockwise arrangement:
H1 (Top) → H2 (Top-Right) → H3 (Right) → ... → H12 (Top-Left)
```

---

## 8. AUTHENTICATION FLOW (Simple)

```
Signup:
email + password → Hash password → Store in DB → Generate JWT → Login

Login:
email + password → Compare hash → Match? → Generate JWT → Store locally

Protected Route:
Check JWT valid? → Extract userId → Allow access or redirect to login
```

---

## 9. API RESPONSE PATTERN

### Success Response
```json
{
  "success": true,
  "message": "Booking created",
  "data": {
    "bookingId": "BOOK-1680000000-ABC123",
    "status": "pending",
    "amount": 500
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Slot not available",
  "error": "SLOT_BOOKED"
}
```

---

## 10. TOP 10 QUESTIONS LIKELY TO BE ASKED

### Q1: Whole application in 2 minutes?
**A**: RashiBazar connects users with astrologers. Users can generate Kundali charts, read horoscopes, check compatibility, and book consultations. Astrologers manage availability, confirm bookings, and track earnings. Admin approves astrologers and monitors platform.

### Q2: Why did you choose MongoDB?
**A**: Flexible schema for storing complex nested data (planets array, dashas array). Good for rapid development and scalability. Document structure matches our entity relationships well.

### Q3: How do you ensure data consistency?
**A**: Foreign keys (references) and MongoDB's schema validation. Business logic validation at API level. Transaction support for critical operations like booking creation.

### Q4: What security measures?
**A**: 
- JWT tokens with expiry
- Passwords hashed with bcrypt (10 rounds)
- Role-based access control (middleware)
- Input validation on all endpoints
- CORS configured

### Q5: How handle double-booking?
**A**: When booking created, system checks if slot already booked. Also implements atomic operations to prevent race conditions where two users book same slot simultaneously.

### Q6: Concurrency issues?
**A**: 
- Database indexes on frequently queried fields
- Atomic operations for booking creation
- Session-based locking if needed for high traffic

### Q7: What if astrologer cancels last minute?
**A**: Booking status changes to 'cancelled'. User can rebook different slot. Cancellation reason recorded. Future: Could trigger refund or reschedule.

### Q8: How test the Kundali calculation?
**A**: 
- Compare with known Kundalis online
- Verify planetary positions
- Test with historical birth data
- Cross-check with astrological software

### Q9: Scalability issues?
**A**: 
- Add database indexing
- Implement caching (Redis) for horoscopes
- Separate astrologer matching into microservice
- Use message queues for email notifications

### Q10: What would you change?
**A**: 
- Add online payment gateway
- Implement video consultation feature
- Add more personalization (ML for astrologer matching)
- Mobile app
- Real-time notifications using WebSockets

---

## 11. MOCK QUESTIONS - ANSWERS READY

### Q: What is Lahiri Ayanamsa?
**A**: It's a correction value (23.123°) we apply to sun's position to get actual zodiac sign. Different from tropical zodiac used in Western astrology. This is the most accepted ayanamsa in Hindu astrology.

### Q: Why square diamond chart, not circular?
**A**: Square diamond is traditional Indian representation. It's easier to draw, read, and interpret. Each house clearly marked. More suitable for text-based interface.

### Q: How distinguish between Kundali and Natal Chart?
**A**: Kundali is the Hindu/Indian version (12 houses, Lahiri Ayanamsa). Natal chart is Western astrology (different ayanamsa). We implement Kundali specifically.

### Q: Is astrologer approval auto or manual?
**A**: Currently manual (admin approves in dashboard). Could automate with document verification, but kept manual for platform control.

### Q: Payment security?
**A**: Currently "Pay on Visit" (cash) - no payment processing needed. Future: Use PCI-DSS compliant payment gateway.

### Q: How prevent astrologer from no-show?
**A**: 
- System tracks rating
- User reviews visible
- Admin can suspend repeat offenders
- Future: Small penalty/cancellation fee

### Q: What if booking time is in past?
**A**: Frontend prevents selecting past dates. Backend also validates. Booking creation fails with error message.

### Q: How handle time zones?
**A**: Store everything in UTC in database. Convert to user's local timezone on frontend. Important for correct slot display across regions.

### Q: Performance for 100,000 users?
**A**: 
- Add database indexing
- Implement caching layer
- Separate read/write operations
- Use CDN for static assets
- Load balancing for server

### Q: What if user forgets password?
**A**: 
1. Click "Forgot Password"
2. Enter email
3. Receive reset link (token valid 24 hours)
4. Create new password
5. Token invalid after use

---

## 12. DEMO SCENARIOS (Practice)

### Scenario 1: New User Journey (5 min)
1. Landing page → Signup → Fill details → Create account
2. Home → Browse astrologers → Select one
3. Check availability → Pick slot → Create booking
4. See confirmation with booking ID

### Scenario 2: Astrologer Workflow (5 min)
1. Login as astrologer → Dashboard
2. Set availability (Monday 10-18:00, 30 min slots)
3. View bookings → Confirm one
4. Mark complete → Confirm payment received
5. View updated earnings

### Scenario 3: Kundali Generation (3 min)
1. Navigate to Kundali
2. Enter birth date: 15-Jan-2000, time: 14:30, place: Mumbai
3. Click Generate
4. Show chart with 12 houses
5. Explain any one planet position

### Scenario 4: Compatibility Check (3 min)
1. Go to Compatibility
2. Enter two birth charts
3. Click analyze
4. Show compatibility score breakdown
5. Explain one guna

---

## 13. CODE WALKTHROUGH (1 min each)

### authController.js (signup)
- Validate input
- Hash password: `bcrypt.hash(password, 10)`
- Save User to DB
- Generate JWT: `jwt.sign({userId, role}, secret, {expiresIn: '7d'})`
- Return token

### bookingController.js (createBooking)
- Validate inputs
- Check astrologer exists and approved
- Verify slot available
- Generate bookingId
- Save to DB with status='pending'
- Return booking details

### kundaliCalculator.js (calculateSunRashi)
- Use polynomial formula for sun position
- Apply Lahiri Ayanamsa (23.123°)
- Determine rashi from degrees
- Return rashi name

---

## 14. TECHNICAL DEBT & IMPROVEMENTS

### Current Limitations:
1. ⚠️ No video consultation
2. ⚠️ No real-time notifications
3. ⚠️ Single server (no scaling)
4. ⚠️ No caching layer
5. ⚠️ No online payment

### Easy Wins (Next Phase):
1. ✅ Email notifications
2. ✅ User reviews/ratings
3. ✅ Search astrologer by specialty
4. ✅ Wishlist/favorites
5. ✅ Mobile app

### Medium Complexity:
1. 🔧 WebSocket for real-time updates
2. 🔧 Video consultation integration (Agora/Twilio)
3. 🔧 Redis caching for horoscopes
4. 🔧 Payment gateway integration
5. 🔧 ML-based astrologer recommendations

---

## 15. FINAL CHECKLIST - 1 HOUR BEFORE VIVA

- [ ] All terminals closed, fresh start ready
- [ ] Backend running on localhost:5000
- [ ] Frontend running on localhost:5173
- [ ] Have 2-3 test accounts ready (user, astrologer, admin)
- [ ] MongoDB connected and seeded
- [ ] Chrome DevTools open (Network tab ready)
- [ ] Code editor with project open
- [ ] This guide open in another window
- [ ] Calm, confident mindset
- [ ] Water bottle nearby
- [ ] Phone in silent mode

---

## 16. VIVA DAY TIPS

### First Impression
- Smile when you enter
- Shake hands firmly
- Maintain eye contact
- Speak slowly and clearly

### During Questions
- Don't interrupt the questioner
- Think for 2-3 seconds before answering
- Answer the exact question asked
- Give examples from your code
- Be honest about limitations
- Ask for clarification if unclear

### Red Flags to Avoid
- ❌ "I don't know" without trying
- ❌ "My friend wrote this part"
- ❌ Overconfident tone
- ❌ Defensive responses
- ❌ Blaming libraries/tools
- ❌ Not making eye contact
- ❌ Speaking too fast
- ❌ Giving irrelevant examples

### Power Statements
- "I chose this technology because..."
- "The challenge was... and I solved it by..."
- "If I had more time, I would add..."
- "I tested this by..."
- "This design decision ensures..."

---

## 17. EMERGENCY ANSWERS

If stuck on a question:

1. **Ask for clarification**: "Can you please explain what you mean by...?"
2. **Break it down**: "This depends on two things: first... second..."
3. **Use examples**: "For example, when the user does X..."
4. **Admit limitation**: "I haven't explored that fully, but I think..."
5. **Redirect positively**: "That's an interesting point. Currently, we handle it by..."

---

## 18. POST-VIVA FOLLOW-UP

After viva, be ready to:
- Answer follow-up emails
- Make minor changes if requested
- Submit final code on GitHub
- Prepare for any revisions
- Thank the examiners

---

## 19. KEY METRICS (Know These Numbers)

- **3 User Roles**: User, Astrologer, Admin
- **5 Booking Statuses**: Pending, Confirmed, Completed, Cancelled, No-show
- **2 Payment Statuses**: Pending, Paid (currently)
- **4 Consultation Types**: Kundali, Horoscope, Compatibility, General
- **12 Houses**: Lagna + 11 others
- **8 Guna Metrics**: For compatibility (Ashtakuta)
- **27 Nakshatras**: Lunar mansions
- **12 Rashis**: Zodiac signs
- **36 Total Gunas**: Max compatibility score

---

## 20. FINAL THOUGHTS

**Remember**: 
- Your examiners WANT you to succeed
- They're checking if you understand your own project
- Technical perfection is less important than clear thinking
- Your ability to explain design decisions matters more than code
- Admitting you don't know something is better than lying
- You've built something impressive - own it! 

**You got this! 🚀**

---

*Last Updated: April 5, 2026*
*Final Commit: 6e70722*
