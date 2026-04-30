# RashiBazar - Astrological Consulting Platform
## Complete App Flow & Architecture Guide for Viva

---

## 1. PROJECT OVERVIEW

**Project Name**: RashiBazar - Direction Through the Stars  
**Type**: Full-Stack Web Application  
**Domain**: Astrological Consulting Platform  
**Tech Stack**: 
- Frontend: React.js + Vite
- Backend: Node.js + Express.js
- Database: MongoDB
- Styling: Tailwind CSS

**Core Purpose**: Connect users seeking astrological guidance with professional astrologers for consultations, with additional features for Kundali generation, horoscope reading, and compatibility analysis.

---

## 2. USER ROLES & ACCESS LEVELS

### Three Main User Types:

#### **A. Users (Regular Users/Clients)**
- Browse available astrologers
- Book consultation sessions
- Generate Kundali charts
- View horoscopes
- Check compatibility
- Track their bookings
- Make payments

#### **B. Astrologers (Service Providers)**
- Create and manage availability slots
- View incoming bookings
- Confirm/reject bookings
- Mark consultations as complete
- Track earnings from completed bookings
- View payment history
- Manage profile and pricing

#### **C. Admin**
- Approve/reject astrologer registrations
- Manage platform users and astrologers
- View platform statistics
- Moderate content
- Access to all platform data

---

## 3. COMPLETE APPLICATION FLOW

### 3.1 USER AUTHENTICATION FLOW

```
Landing Page (LandingPage)
    ↓
    ├─→ [New User] → Signup Page
    │    ├─→ Enter name, email, password
    │    ├─→ Role selection (User/Astrologer)
    │    ├─→ Create account in MongoDB
    │    ├─→ JWT token generated
    │    └─→ Redirect to Home
    │
    └─→ [Existing User] → Login Page
         ├─→ Enter email & password
         ├─→ Authentication check
         ├─→ JWT stored in localStorage
         └─→ Redirect to Home (based on role)
```

**Key Points**:
- Passwords are hashed using bcrypt
- JWT tokens stored in localStorage for persistent login
- Role-based routing using ProtectedRoute component
- Middleware: `authMiddleware.js` verifies token on every request

---

### 3.2 USER JOURNEY (Regular User)

#### **Step 1: Home Page**
```
User Logged In → Home Page
├─→ View navigation bar (Home, Kundali, Horoscope, Compatibility, Calendar, Profile, Booking)
├─→ Social features (users can view each other)
└─→ Access various astrological tools
```

#### **Step 2: Kundali Generation (Birth Chart)**
```
Kundali Page
├─→ Input Details:
│   ├─→ Birth Date
│   ├─→ Birth Time
│   ├─→ Birth Place (converted to coordinates)
│   └─→ Gender
│
├─→ Backend Calculation:
│   ├─→ Convert birth time (Gregorian → Lunar Calendar via Bikram Samvar)
│   ├─→ Calculate sun position (Polynomial formula)
│   ├─→ Determine Rashi (Zodiac sign) using Lahiri Ayanamsa
│   ├─→ Calculate 12 houses (Anti-clockwise from Lagna)
│   ├─→ Place planets in respective houses
│   └─→ Generate H1, H2, H3... H12 positions
│
└─→ Frontend Display:
    ├─→ Square Diamond Chart Layout
    ├─→ H1 (Lagna) at top center
    ├─→ Houses arranged counter-clockwise
    ├─→ Planets displayed in their houses
    ├─→ Color-coded zodiac signs
    └─→ House-wise planetary positions
```

**Key Algorithm**: Kundali Calculator (`backend/utils/kundaliCalculator.js`)
- Uses polynomial-based calculations for Sun position
- Applies Lahiri Ayanamsa (23.123 degrees) for accuracy
- Divides ecliptic into 12 houses (30 degrees each)

#### **Step 3: Horoscope Reading**
```
Horoscope Page
├─→ Astrologers can create horoscopes
│   ├─→ Select Rashi (Zodiac sign)
│   ├─→ Create Daily/Weekly/Monthly predictions
│   ├─→ Add predictions for each sign
│   └─→ Publish horoscopes
│
└─→ Users can view published horoscopes
    ├─→ Filter by Rashi
    ├─→ View different time periods
    └─→ Read predictions
```

#### **Step 4: Compatibility Analysis**
```
Compatibility Page
├─→ Input TWO birth charts:
│   ├─→ Person 1 details
│   └─→ Person 2 details
│
├─→ Backend Analysis:
│   ├─→ Generate both Kundalis
│   ├─→ Calculate Moon Signs (Rashi)
│   ├─→ Check Nakshatra compatibility
│   ├─→ Calculate Guna matching (Ashtakuta)
│   └─→ Generate compatibility score (0-36 Gunas)
│
└─→ Display Results:
    ├─→ Compatibility percentage
    ├─→ Guna matching details
    ├─→ Strengths & weaknesses
    └─→ Recommendations
```

#### **Step 5: Booking a Consultation**
```
Astrologer Browsing
├─→ Browse all approved astrologers
├─→ View ratings and experience
├─→ View available time slots
└─→ Select preferred astrologer

Booking Appointment
├─→ Select Date & Time
│   ├─→ Check astrologer's recurring availability
│   ├─→ Show only available slots (not already booked)
│   ├─→ Prevent booking past dates
│   └─→ Display booked slots in gray
│
├─→ Input Booking Details
│   ├─→ Consultation Type (Kundali/Horoscope/Compatibility/General)
│   ├─→ Additional notes
│   └─→ Payment Method (Pay on Visit)
│
├─→ Backend Processing:
│   ├─→ Validate astrologer exists & is approved
│   ├─→ Validate slot availability
│   ├─→ Auto-generate Booking ID (Format: BOOK-[timestamp]-[random])
│   ├─→ Create booking document in MongoDB
│   ├─→ Set initial status: 'pending'
│   └─→ Payment status: 'pending'
│
└─→ Confirmation
    ├─→ Display booking confirmation
    ├─→ Show booking reference number
    └─→ Redirect to My Bookings
```

**Payment Flow**:
- Currently: "Pay on Visit" only
- Payment confirmed during consultation by astrologer
- Astrologer marks payment as "received" or "pending"
- Only completed bookings with payment received count towards earnings

---

### 3.3 BOOKING SYSTEM DETAILED

#### **Booking Model Fields**:
```
{
  bookingId: "BOOK-1680000000-ABC123",      // Auto-generated unique ID
  userId: ObjectId,                          // Reference to User
  astrologerId: ObjectId,                    // Reference to Astrologer
  date: "2026-04-07T00:00:00.000Z",         // Booking date
  time: "15:15",                             // Time slot
  amount: 500,                               // Consultation fee
  bookingStatus: 'pending'|'confirmed'|'completed'|'cancelled'|'no-show',
  paymentMethod: 'pay_on_visit',
  paymentStatus: 'pending'|'paid'|'failed'|'refunded',
  consultationType: 'kundali'|'horoscope'|'compatibility'|'general',
  notes: "Patient notes",
  cancellationReason: "Reason if canceled",
  createdAt: timestamp
}
```

#### **Booking Status Flow**:
```
PENDING (New booking)
    ↓ (Astrologer confirms)
CONFIRMED (Appointment confirmed)
    ↓ (After consultation)
COMPLETED (Consultation done) → Payment marked as PAID/PENDING
    ↓
EARNINGS UPDATED (if payment received)

Alternative paths:
PENDING → CANCELLED (User or astrologer cancels)
CONFIRMED → NO-SHOW (Astrologer marks no-show)
```

---

### 3.4 ASTROLOGER DASHBOARD FLOW

#### **Dashboard Overview**:
```
Astrologer Logs In → Dashboard
├─→ Overview Tab:
│   ├─→ Statistics Cards:
│   │   ├─→ Total Bookings Count
│   │   ├─→ Upcoming Sessions (future, pending/confirmed)
│   │   ├─→ Completed Sessions Count
│   │   ├─→ Total Earnings (from completed + paid bookings)
│   │   ├─→ Monthly Earnings (current month, completed + paid)
│   │   ├─→ Average Rating
│   │   └─→ Total Reviews Count
│   │
│   ├─→ Recent Bookings Section:
│   │   ├─→ Show upcoming bookings
│   │   ├─→ Display user details (name, email)
│   │   ├─→ Show date, time, consultation type
│   │   ├─→ Display booking amount
│   │   │
│   │   └─→ Payment Confirmation Section (Pay on Visit):
│   │       ├─→ "Yes, Paid" button
│   │       ├─→ "No, Pending" button
│   │       └─→ Marks payment status
│   │
│   ├─→ Completed Bookings with Payment Section:
│   │   ├─→ Display all completed + paid bookings
│   │   ├─→ Show customer name & email
│   │   ├─→ Display date, consultation type, amount received
│   │   └─→ Total payment summary:
│   │       └─→ "From X completed bookings"
│   │
│   └─→ Performance Metrics:
│       ├─→ Completed Sessions count
│       ├─→ Average Rating (calculated from reviews)
│       └─→ Monthly Earnings breakdown
│
├─→ Availability Tab:
│   ├─→ Add recurring time slots
│   ├─→ Select day of week (Mon-Sun)
│   ├─→ Set start & end time
│   ├─→ Choose slot duration (15/30/45/60 min)
│   ├─→ View and delete existing slots
│   └─→ System prevents double-booking
│
├─→ Horoscope Tab:
│   ├─→ Create/Edit horoscope predictions
│   ├─→ Select Rashi (zodiac sign)
│   ├─→ Create daily/weekly/monthly predictions
│   ├─→ Publish or unpublish
│   └─→ View existing horoscopes
│
├─→ Bookings Tab:
│   ├─→ View all bookings in detail
│   ├─→ Pending bookings:
│   │   ├─→ "Confirm Booking" button
│   │   └─→ "Cancel Booking" button (with reason)
│   │
│   ├─→ Confirmed bookings:
│   │   ├─→ "Mark Completed" button
│   │   └─→ "No Show" button
│   │
│   └─→ View payment status
│
└─→ Profile Tab:
    ├─→ Edit profile information
    ├─→ Update pricing
    ├─→ Upload profile image
    ├─→ Update bio and experience
    └─→ Save changes
```

#### **Earnings Calculation Logic**:
```javascript
Monthly Earnings = SUM of all bookings WHERE:
  - astrologerId = current astrologer
  - bookingStatus = 'completed'
  - paymentStatus = 'paid'
  - booking date is in current month
  - amount >= 0

Example:
Bookings from current month:
- Booking 1: ₹500, completed, paid → Add ₹500
- Booking 2: ₹300, completed, pending → Skip (not paid)
- Booking 3: ₹800, confirmed, paid → Skip (not completed)
Total = ₹500
```

---

### 3.5 AVAILABILITY SLOT MANAGEMENT

```
Astrologer Creates Slots:
├─→ Select Day of Week (DayOfWeek: 0-6, where 0=Sunday)
├─→ Set time range (startTime: "10:00", endTime: "18:00")
├─→ Set slot duration (15/30/45/60 minutes)
│
└─→ System generates:
    ├─→ For each day of that week
    ├─→ Generate slots: 10:00, 10:30, 11:00, ... 17:30
    ├─→ Each slot can only be booked once
    └─→ Future occurrences are automatically recurring

User Booking Slots:
├─→ Select future date
├─→ System finds matching day of week
├─→ Fetch available slots from Availability model
├─→ Filter out already booked slots
├─→ Show available times to user
└─→ User selects and books
```

---

## 4. DATABASE SCHEMA & RELATIONSHIPS

### 4.1 Entity Relationship Diagram

```
User (Base for regular users and admins)
├─→ id (PK)
├─→ name
├─→ email (Unique)
├─→ password (hashed)
├─→ role: 'user' | 'astrologer' | 'admin'
└─→ connections:
    ├─→ Kundali (one-to-many: user has multiple kundalis)
    ├─→ Horoscope (one-to-many)
    ├─→ Booking (one-to-many: user can have multiple bookings)
    └─→ MyProfile (one-to-one)

Astrologer (Service provider profile)
├─→ id (PK)
├─→ userId (FK: if registered user)
├─→ name, email, password
├─→ experience, pricing, rating
├─→ approvalStatus: 'pending' | 'approved' | 'rejected'
├─→ totalEarnings, monthlyEarnings
└─→ connections:
    ├─→ Availability (one-to-many: astrologer has multiple slots)
    ├─→ Booking (one-to-many: astrologer receives bookings)
    ├─→ Horoscope (one-to-many: astrologer creates horoscopes)
    └─→ Review (one-to-many: receives ratings/reviews)

Booking (Consultation session)
├─→ id (PK)
├─→ bookingId (Unique: "BOOK-XXX-YYY")
├─→ userId (FK)
├─→ astrologerId (FK)
├─→ date, time
├─→ amount
├─→ bookingStatus, paymentStatus
├─→ consultationType
└─→ connections:
    ├─→ User
    └─→ Astrologer

Availability (Time slots)
├─→ id (PK)
├─→ astrologerId (FK)
├─→ dayOfWeek (0-6)
├─→ startTime, endTime
├─→ slotDuration (in minutes)
└─→ Used to check availability when booking

Kundali (Birth chart)
├─→ id (PK)
├─→ userId (FK)
├─→ name, birthDate, birthTime, birthPlace
├─→ coordinates: latitude, longitude
├─→ ascendant, moonRashi, planets[]
├─→ houses[], dashas[]
└─→ chartData (for rendering)

Horoscope (Predictions)
├─→ id (PK)
├─→ astrologerId (FK)
├─→ rashis[] (which zodiac signs it applies to)
├─→ period: 'daily' | 'weekly' | 'monthly'
├─→ prediction text
└─→ createdAt
```

---

## 5. API ENDPOINTS STRUCTURE

### 5.1 Authentication Routes
```
POST   /api/auth/signup          → Create new user
POST   /api/auth/login           → Login user (returns JWT)
POST   /api/auth/forgot-password → Request password reset
POST   /api/auth/reset-password  → Reset password with token
```

### 5.2 Astrologer Routes
```
GET    /api/astrologers/approved           → Get all approved astrologers
GET    /api/astrologers/:id                → Get single astrologer details
GET    /api/astrologers/:id/availability   → Check available slots
GET    /api/astrologers/dashboard/data     → Get astrologer dashboard stats
PUT    /api/astrologers/profile            → Update astrologer profile
POST   /api/astrologers/availability       → Add availability slot
DELETE /api/astrologers/availability/:id   → Remove availability slot
GET    /api/astrologers/my-availability    → Get my recurring slots
```

### 5.3 Booking Routes
```
POST   /api/bookings                        → Create new booking
GET    /api/bookings/my-bookings            → Get user's bookings
GET    /api/bookings/:id                    → Get booking details
PUT    /api/bookings/:id/status             → Update booking status (by astrologer)
PUT    /api/bookings/:id/cancel             → Cancel booking (by user)
GET    /api/bookings/astrologer/bookings    → Get astrologer's bookings
```

### 5.4 Kundali Routes
```
POST   /api/kundali/generate     → Generate kundali chart
GET    /api/kundali/:id          → Get kundali details
DELETE /api/kundali/:id          → Delete kundali
```

### 5.5 Horoscope Routes
```
POST   /api/horoscopes           → Create horoscope (astrologer)
GET    /api/horoscopes           → Get published horoscopes
GET    /api/horoscopes/:id       → Get horoscope details
PUT    /api/horoscopes/:id       → Update horoscope
DELETE /api/horoscopes/:id       → Delete horoscope
```

---

## 6. KEY FEATURES EXPLAINED

### 6.1 Kundali (Birth Chart) Generation

**What is Kundali?**
- Hindu astrological birth chart
- Represents planetary positions at birth time
- Used for predictions, compatibility, career guidance

**How it's calculated:**
1. **Input** → Date, Time, Place of birth
2. **Lunar Calendar Conversion** → Convert Gregorian to Bikram Samvat
3. **Sun Position** → Calculate using polynomial formula
4. **Rashi Determination** → Using Lahiri Ayanamsa (23.123°)
5. **House Calculation** → 12 houses (each 30° apart)
6. **Planet Placement** → Assign planets to houses
7. **Output** → Square diamond chart with houses

**Chart Layout**:
```
        H12  |  H1  |  Solar
             |      |  House
    ─────────────────────────
    H11      |      |      H2
    H10      |      |      H3
    ─────────────────────────
             |      |
        H9   |  H8  |  H4-H5
             |      |
```
- H1 (Lagna/Ascendant) at top = strongest influence
- Houses arrange counter-clockwise
- Planets shown in their respective houses

### 6.2 Compatibility Analysis

**Ashtakuta (8-fold) Matching System**:
1. **Varna** - Caste compatibility
2. **Vasya** - Dominance/control
3. **Tara** - Longevity of relationship
4. **Yoni** - Sexual compatibility
5. **Graha Maitri** - Friendship based on lords
6. **Gana** - Temperament compatibility
7. **Bhakuta** - Health prosperity
8. **Nadi** - Genetic compatibility (most important)

**Maximum Score**: 36 Gunas
- 32+ = Excellent
- 26-31 = Good
- 20-25 = Average
- Below 20 = Not recommended

### 6.3 Horoscope Reading

**Types**:
- **Daily** → Daily predictions
- **Weekly** → Weekly outlook
- **Monthly** → Monthly forecast

**Rashis (Zodiac Signs)**:
- Aries (Mesh), Taurus (Vrishabh), Gemini (Mithun), Cancer (Kark)
- Leo (Sinh), Virgo (Kanya), Libra (Tula), Scorpio (Vrischik)
- Sagittarius (Dhanu), Capricorn (Makar), Aquarius (Kumbh), Pisces (Meen)

---

## 7. AUTHENTICATION & SECURITY

### 7.1 Authentication Flow

```
User Signup:
├─→ Validate input (name, email, password, role)
├─→ Hash password using bcrypt (10 rounds)
├─→ Create user in MongoDB
├─→ Generate JWT token (secret key + expiry)
└─→ Store token in localStorage

User Login:
├─→ Check email exists
├─→ Compare password with hashed version
├─→ If match: Generate JWT
├─→ Store token in localStorage
└─→ ProtectedRoute checks on navigation

API Requests:
├─→ Include JWT in Authorization header
├─→ authMiddleware validates token
├─→ If valid: Continue, If invalid: Return 401
└─→ Extract userId from token payload
```

### 7.2 JWT Token Structure
```
header.payload.signature

Payload contains:
{
  userId: "123abc",
  email: "user@example.com",
  role: "user" | "astrologer" | "admin",
  iat: 1680000000,
  exp: 1680000000 + 7 days
}
```

### 7.3 Password Recovery

```
User Forgets Password:
├─→ Enter email
├─→ Generate random reset token
├─→ Save token + expiry (24 hours) to DB
├─→ Send reset link via email
│   └─→ Link: /reset-password/{token}
│
User Clicks Link:
├─→ Token validated
├─→ Enter new password
├─→ Hash new password
├─→ Update DB
└─→ Redirect to login
```

---

## 8. TRANSACTION FLOW: END-TO-END BOOKING

```
SCENARIO: User books consultation with Astrologer

1. USER BROWSING PHASE
   ├─→ User logs in → Home Page
   ├─→ Browse astrologers (/api/astrologers/approved)
   ├─→ Select astrologer → View profile
   ├─→ Check availability (/api/astrologers/:id/availability)
   └─→ See available slots for next 30 days

2. BOOKING CREATION PHASE
   ├─→ User selects date & time
   ├─→ Fills booking details (notes, consultation type)
   ├─→ Submits booking form
   │
   └─→ Backend Processing:
       ├─→ Validate inputs
       ├─→ Check astrologer exists & approved
       ├─→ Verify slot still available (double-check)
       ├─→ Generate unique bookingId
       ├─→ Create booking in MongoDB:
       │   ├─→ bookingStatus = 'pending'
       │   ├─→ paymentStatus = 'pending'
       │   ├─→ amount = astrologer.pricing.perSession
       │   └─→ createdAt = now
       ├─→ Slot now marked as booked
       └─→ Return confirmation to user

3. BOOKING CONFIRMATION PHASE (Astrologer)
   ├─→ Astrologer logs in → Dashboard
   ├─→ Sees new pending booking
   │   ├─→ User details
   │   ├─→ Date, time, consultation type
   │   └─→ Notes
   │
   ├─→ Two options:
   │   ├─→ Confirm Booking (status → 'confirmed')
   │   └─→ Cancel Booking (status → 'cancelled')
   │
   └─→ Booking confirmed (ready for consultation)

4. CONSULTATION & PAYMENT PHASE
   ├─→ Date arrives
   ├─→ Consultation happens (video/phone/in-person)
   ├─→ After consultation complete
   │
   └─→ Astrologer marks in dashboard:
       ├─→ Confirm: "Mark Completed" → status = 'completed'
       ├─→ But first: Mark payment status
       │   ├─→ "Yes, Paid" → paymentStatus = 'paid'
       │   └─→ "No, Pending" → paymentStatus = 'pending'
       │
       └─→ Booking.bookingStatus = 'completed'

5. EARNINGS UPDATE PHASE
   ├─→ System recalculates astrologer earnings
   ├─→ Only if: bookingStatus='completed' && paymentStatus='paid'
   │
   └─→ Earnings Update:
       ├─→ totalEarnings += booking.amount
       ├─→ monthlyEarnings += booking.amount
       └─→ Dashboard shows updated earnings

6. USER SEES IN MY BOOKINGS
   ├─→ Sees completed booking
   ├─→ Shows amount paid
   ├─→ Shows completion date/time
   └─→ Consultation marked as complete
```

---

## 9. PAYMENT SYSTEM

### Current Implementation: Pay on Visit

```
Payment Process:
├─→ At booking: No payment taken
├─→ User selects "Pay on Visit"
├─→ During consultation: Cash payment to astrologer
├─→ After consultation:
│   ├─→ Astrologer clicks "Yes, Paid" (updates paymentStatus to 'paid')
│   └─→ Booking confirmed as paid
│
├─→ Only PAID bookings count for:
│   ├─→ Astrologer earnings
│   ├─→ Completed session stats
│   └─→ Monthly revenue tracking
│
└─→ If not paid:
    ├─→ Astrologer clicks "No, Pending"
    ├─→ Booking still completed but payment pending
    └─→ Not counted in earnings
```

**Future Enhancement Options**:
- Online payment gateway (Stripe, Razorpay, eSewa, Khalti)
- Wallet system
- Subscription models
- Refund management

---

## 10. ADMIN FEATURES

### Admin Dashboard
```
Admin can:
├─→ View all users
├─→ View all astrologers
├─→ Approve/Reject astrologer registrations
├─→ View platform statistics
│   ├─→ Total bookings
│   ├─→ Total revenue
│   ├─→ Active users & astrologers
│   └─→ Platform metrics
├─→ Moderate horoscopes
├─→ Remove inappropriate content
└─→ User management (ban/suspend)
```

---

## 11. COMMON QUESTIONS FOR VIVA

### Q1: What is the purpose of this application?
**A**: RashiBazar is a platform that connects users seeking astrological guidance with professional astrologers. It provides tools for Kundali generation, horoscope reading, and compatibility analysis, plus booking consultation sessions with astrologers.

### Q2: Explain the Kundali calculation process.
**A**: Kundali uses birth date, time, and place to calculate:
1. Sun position using polynomial formulas
2. Apply Lahiri Ayanamsa (23.123°) to determine Rashi
3. Divide the ecliptic into 12 houses (30° each)
4. Place planets in their respective houses
5. Display in square diamond chart format

### Q3: What happens when a user books a consultation?
**A**: 
1. User selects astrologer, date, and time
2. System checks availability and creates booking with 'pending' status
3. Astrologer receives booking notification
4. Astrologer confirms or rejects
5. If confirmed, consultation occurs on scheduled date
6. After consultation, astrologer marks complete and payment status
7. Earnings updated if payment received

### Q4: How is the payment system designed?
**A**: Currently "Pay on Visit" - user pays cash during consultation. Astrologer confirms payment in dashboard. Only completed bookings with payment received count towards earnings.

### Q5: Explain the role-based access control.
**A**: Three roles with different permissions:
- **User**: Can book, view horoscopes, generate kundali
- **Astrologer**: Can manage bookings, create horoscopes, set availability
- **Admin**: Can approve astrologers, manage all users, view statistics

### Q6: How does availability slot management work?
**A**: Astrologer creates recurring slots (day of week + time range + duration). System generates individual slots for each week. When user books, system finds matching day and shows available times from that slot.

### Q7: What is the database structure?
**A**: MongoDB with collections:
- User (base for all users)
- Astrologer (astrologer profiles)
- Booking (consultation sessions)
- Availability (time slots)
- Kundali (birth charts)
- Horoscope (predictions)

### Q8: Explain the earnings calculation.
**A**: 
```
monthlyEarnings = SUM(booking.amount) WHERE
  booking.bookingStatus = 'completed'
  AND booking.paymentStatus = 'paid'
  AND booking.date in current month
```

### Q9: What security measures are implemented?
**A**:
- Passwords hashed with bcrypt
- JWT tokens for authentication
- Role-based route protection
- authMiddleware validates tokens
- Password reset with token verification

### Q10: How does the Compatibility feature work?
**A**: Uses Ashtakuta (8-fold matching) system:
- Generates kundali for both people
- Calculates 8 compatibility metrics
- Total score: 36 gunas
- 32+ = Excellent, 26-31 = Good, 20-25 = Average

---

## 12. TECHNOLOGY STACK DETAILS

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Framework | React.js | UI components |
| Build Tool | Vite | Fast development |
| Styling | Tailwind CSS | Responsive design |
| Routing | React Router | Page navigation |
| State Management | localStorage + Context | User session |
| HTTP Client | Axios | API requests |
| Backend Framework | Node.js + Express | Server logic |
| Database | MongoDB | Data storage |
| Authentication | JWT + bcrypt | Security |
| Date Handling | date-fns | Date operations |
| Notifications | React Hot Toast | User feedback |

---

## 13. PROJECT STRUCTURE

```
RashiBazar/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── astrologerController.js
│   │   ├── bookingController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT validation
│   │   └── roleMiddleware.js        # Role checking
│   ├── models/
│   │   ├── User.js
│   │   ├── Astrologer.js
│   │   ├── Booking.js
│   │   ├── Kundali.js
│   │   ├── Horoscope.js
│   │   └── Availability.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── astrologerRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── ... other routes
│   ├── utils/
│   │   ├── kundaliCalculator.js    # Birth chart calculation
│   │   ├── bsConverter.js          # Date conversion
│   │   └── astrologyConstants.js
│   └── server.js                   # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── Kundali.jsx
    │   │   ├── Booking.jsx
    │   │   ├── AstrologerDashboard.jsx
    │   │   └── ... other pages
    │   ├── services/
    │   │   ├── api.js              # Axios config
    │   │   ├── auth.js             # Auth APIs
    │   │   ├── booking.js          # Booking APIs
    │   │   └── astrology.js        # Astrology APIs
    │   ├── App.jsx                 # Main routing
    │   └── main.jsx
    └── index.html
```

---

## 14. ADDITIONAL FEATURES & IMPROVEMENTS MADE

### Recent Enhancements:
1. ✅ **Payment Tracking**: Added "Payment Received - Completed Bookings" section
2. ✅ **Earnings Calculation**: Accurate monthly earnings from completed & paid bookings
3. ✅ **Consultation Type**: Tracks type (Kundali/Horoscope/Compatibility/General)
4. ✅ **Dashboard Metrics**: Real-time statistics and performance tracking
5. ✅ **Booking ID**: Auto-generated unique IDs for every booking
6. ✅ **Comprehensive Logging**: Payment confirmation debugging

---

## 15. TIPS FOR VIVA PRESENTATION

### What to Emphasize:
1. **Problem Statement**: Why this app was needed (Astrology consultation accessibility)
2. **User Needs**: Different needs for different roles
3. **Technical Implementation**: How you solved key problems
4. **Database Design**: Relationships between entities
5. **API Architecture**: RESTful design with proper endpoints
6. **Security**: JWT, password hashing, role-based access
7. **Business Logic**: Booking flow, earnings calculation, payment tracking
8. **Scalability**: How system can handle growth

### Practice Explaining:
- [ ] Complete booking flow (5-7 minutes)
- [ ] Kundali calculation process (3-5 minutes)
- [ ] Database schema and relationships (3-5 minutes)
- [ ] Authentication and authorization (3-5 minutes)
- [ ] API architecture (2-3 minutes)
- [ ] How earnings are calculated (2-3 minutes)

### Common Pitfalls to Avoid:
- Don't go too deep into implementation details unnecessarily
- Don't mention problems without solutions
- Don't compare with competitors negatively
- Practice explaining in simple, non-technical terms first
- Have code examples ready on laptop

---

## 16. QUICK REFERENCE CHECKLISTS

### Before Viva:
- [ ] Review all three user roles thoroughly
- [ ] Practice explaining booking flow step-by-step
- [ ] Understand Kundali calculation algorithm
- [ ] Know all API endpoints and their purposes
- [ ] Prepare database schema diagrams/explanations
- [ ] Be ready to explain security measures
- [ ] Understand earnings calculation logic
- [ ] Have project running and ready to demo
- [ ] Prepare for "what would you change" questions
- [ ] Know scalability/future improvements

### During Viva:
- [ ] Speak clearly and confidently
- [ ] Listen to questions fully before answering
- [ ] Ask for clarification if needed
- [ ] Use examples from the code
- [ ] Relate technical terms to business logic
- [ ] Show enthusiasm for the project
- [ ] Be honest about limitations
- [ ] Suggest improvements/future work

---

**Good Luck for your Viva! 🌟**

Remember: They want to see you understand the project, not memorize it. Be ready to explain your design decisions and think critically about the system.
