# RashiBazar — Sequence Diagrams (From Codebase)

> [!NOTE]
> All diagrams below are derived **exclusively** from the project source code — controllers, routes, middleware, models, and frontend services.

---

## 1. User Registration

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend (React)
    participant API as Axios Interceptor
    participant BE as POST /api/auth/register/user
    participant AC as authController.registerUser
    participant DB as MongoDB (Users)

    U->>FE: Fill registration form (name, email, password, phone)
    FE->>API: API.post("/auth/register/user", data)
    API->>API: Attach Content-Type header
    API->>BE: HTTP POST with JSON body
    BE->>AC: registerUser(req, res)
    AC->>AC: Validate required fields
    AC->>AC: Validate password strength (regex)
    AC->>DB: User.findOne({ email })
    DB-->>AC: null (no duplicate)
    AC->>AC: bcrypt.hash(password, 10)
    AC->>DB: new User({ name, email, password, phone, role:'user' }).save()
    DB-->>AC: Saved user document
    AC->>AC: jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" })
    AC-->>BE: 201 { message, token, user }
    BE-->>API: HTTP 201 Response
    API-->>FE: response.data
    FE->>FE: localStorage.setItem("token", token)
    FE->>FE: localStorage.setItem("user", JSON.stringify(user))
    FE->>U: toast.success("Registration successful!")
```

---

## 2. Astrologer Registration

```mermaid
sequenceDiagram
    actor A as Astrologer (Browser)
    participant FE as Frontend (React)
    participant API as Axios Interceptor
    participant BE as POST /api/auth/register/astrologer
    participant AC as authController.registerAstrologer
    participant DB as MongoDB (Astrologers)

    A->>FE: Fill astrologer registration form
    FE->>API: API.post("/auth/register/astrologer", data)
    API->>BE: HTTP POST with JSON body
    BE->>AC: registerAstrologer(req, res)
    AC->>AC: Validate required fields & password strength
    AC->>DB: Astrologer.findOne({ email })
    DB-->>AC: null (no duplicate)
    AC->>AC: bcrypt.hash(password, 10)
    AC->>DB: new Astrologer({ ..., approvalStatus:'pending', isActive:false }).save()
    DB-->>AC: Saved astrologer document
    AC->>AC: jwt.sign({ id, role:'astrologer' }, JWT_SECRET)
    AC-->>BE: 201 { message: "pending admin approval", token, astrologer }
    BE-->>API: HTTP 201 Response
    API-->>FE: response.data
    FE->>FE: localStorage.setItem("token", token)
    FE->>FE: localStorage.setItem("astrologer", JSON.stringify(astrologer))
    FE->>A: toast.success("Waiting for admin approval.")
```

---

## 3. User / Admin Login

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend (React)
    participant API as Axios Interceptor
    participant BE as POST /api/auth/login
    participant AC as authController.loginUser
    participant DB as MongoDB (Users)

    U->>FE: Enter email, password, role="user"
    FE->>API: API.post("/auth/login", { email, password, role:"user" })
    API->>BE: HTTP POST
    BE->>AC: loginUser(req, res)
    AC->>DB: User.findOne({ email })
    DB-->>AC: User document
    AC->>AC: bcrypt.compare(password, user.password)
    alt User is Admin (role === 'admin')
        AC->>AC: jwt.sign({ id, role:'admin' })
        AC-->>BE: 200 { token, user: {..., role:'admin'}, isAdmin:true }
    else Regular User
        AC->>AC: jwt.sign({ id, role:'user' })
        AC-->>BE: 200 { token, user }
    end
    BE-->>API: HTTP 200 Response
    API-->>FE: response.data
    FE->>FE: localStorage.setItem("token" & "user")
    FE->>U: toast.success("Login successful!")
    FE->>FE: Redirect based on role (admin→/admin/dashboard, user→/home)
```

---

## 4. Astrologer Login

```mermaid
sequenceDiagram
    actor A as Astrologer (Browser)
    participant FE as Frontend (React)
    participant API as Axios Interceptor
    participant BE as POST /api/auth/login
    participant AC as authController.loginUser
    participant DB as MongoDB (Astrologers)

    A->>FE: Enter email, password, role="astrologer"
    FE->>API: API.post("/auth/login", { email, password, role:"astrologer" })
    API->>BE: HTTP POST
    BE->>AC: loginUser(req, res)
    AC->>DB: Astrologer.findOne({ email })
    DB-->>AC: Astrologer document
    alt approvalStatus !== 'approved'
        AC-->>BE: 403 { message: "account is pending/rejected" }
        BE-->>FE: Error response
        FE->>A: toast.error(message)
    else Approved
        AC->>AC: bcrypt.compare(password, astrologer.password)
        AC->>AC: jwt.sign({ id, role:'astrologer' })
        AC-->>BE: 200 { token, astrologer }
        BE-->>API: HTTP 200
        API-->>FE: response.data
        FE->>FE: localStorage.setItem("token" & "astrologer")
        FE->>A: Redirect to /astrologer/dashboard
    end
```

---

## 5. Kundali Generation

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend (Kundali.jsx)
    participant API as Axios Interceptor
    participant MW as authMiddleware
    participant BE as POST /api/kundali/generate
    participant KC as kundaliController.generateKundali
    participant CALC as kundaliCalculator.calculateKundali
    participant DB as MongoDB (Kundalis)

    U->>FE: Enter birth details (name, date, time, place, gender)
    FE->>API: API.post("/kundali/generate", data)
    API->>API: Attach Bearer token from localStorage
    API->>MW: HTTP POST with Authorization header
    MW->>MW: jwt.verify(token) → decoded { id, role }
    MW->>MW: Set req.userId (allow guest if no token)
    MW->>BE: next()
    BE->>KC: generateKundali(req, res)
    KC->>KC: Validate required fields (name, birthDate, birthTime, birthPlace)
    KC->>KC: Parse birthDate → Date object
    KC->>CALC: calculateKundali({ name, birthDate, birthTime, birthPlace, ... })
    CALC-->>KC: kundaliData (ascendant, moonSign, planets, dashas, chartData)
    alt User is logged in (req.userId exists)
        KC->>DB: new Kundali({ userId, ...kundaliData }).save()
        DB-->>KC: Saved kundali _id
    end
    KC-->>BE: 200 { success:true, data: kundaliData }
    BE-->>API: HTTP 200
    API-->>FE: response.data
    FE->>U: Render kundali chart, planets, dashas, predictions
```

---

## 6. Compatibility Check (Guna Milan)

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend (Compatibility.jsx)
    participant API as Axios Interceptor
    participant MW as authMiddleware
    participant BE as POST /api/kundali/compatibility
    participant KC as kundaliController.checkCompatibility
    participant VE as vedicEngine (generateKundaliEngine + calculateGunaMilan)

    U->>FE: Enter Partner 1 & Partner 2 birth details
    FE->>API: API.post("/kundali/compatibility", { partner1, partner2 })
    API->>MW: HTTP POST with Bearer token
    MW->>BE: Authenticated → next()
    BE->>KC: checkCompatibility(req, res)
    KC->>VE: generateKundaliEngine(partner1 birth data)
    VE-->>KC: astro1 (planets, moonRashi, moonNakshatra)
    KC->>VE: generateKundaliEngine(partner2 birth data)
    VE-->>KC: astro2
    KC->>VE: calculateGunaMilan(astro1, astro2)
    VE-->>KC: matchingResult (totalObtained, percentage, koots, doshas)
    KC->>KC: Check Mangal Dosha for both partners
    KC->>KC: Determine verdict (Excellent/Good/Average/Challenging)
    KC-->>BE: 200 { score, maxScore:36, percentage, verdict, koots, partner1, partner2, doshas }
    BE-->>API: HTTP 200
    API-->>FE: response.data
    FE->>U: Display compatibility score, verdict, koot details
```

---

## 7. Horoscope Retrieval

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend (Horoscope.jsx)
    participant API as Axios Interceptor
    participant BE as GET /api/horoscope/:rashi/:period
    participant HC as horoscopeController.getHoroscope
    participant DB as MongoDB (Horoscopes)

    U->>FE: Select rashi (e.g., Aries) and period (daily/weekly/monthly/yearly)
    FE->>API: API.get("/horoscope/Aries/daily")
    API->>BE: HTTP GET
    BE->>HC: getHoroscope(req, res)
    HC->>HC: Validate rashi & period against allowed lists
    HC->>HC: Calculate date range (startDate, endDate) based on period
    HC->>DB: Horoscope.findOne({ rashi, period, date: { $gte, $lt } })
    alt Found in DB
        DB-->>HC: Existing horoscope document
    else Not found
        HC->>HC: generateHoroscope(rashi, period, date)
        Note right of HC: Generates prediction, luckyNumber,<br/>luckyColor, compatibility,<br/>categoryPredictions (career, love, health, finance)
        HC->>DB: new Horoscope({ ... }).save()
        DB-->>HC: Saved horoscope
    end
    HC-->>BE: 200 { success, rashi, period, date, data: { prediction, luckyNumber, ... } }
    BE-->>API: HTTP 200
    API-->>FE: response.data
    FE->>U: Display horoscope prediction with categories
```

---

## 8. Booking Creation (Pay on Visit)

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend (Booking.jsx)
    participant API as Axios Interceptor
    participant MW as authMiddleware + isUser
    participant BE as POST /api/bookings
    participant BC as bookingController.createBooking
    participant DB_A as MongoDB (Astrologers)
    participant DB_B as MongoDB (Bookings)

    U->>FE: Select astrologer, date, time slot, payment method
    FE->>API: API.post("/bookings", { astrologerId, date, time, paymentMethod:"pay_on_visit" })
    API->>MW: HTTP POST with Bearer token
    MW->>MW: authMiddleware → verify JWT, set req.userId
    MW->>MW: isUser → check req.userRole === 'user'
    MW->>BE: next()
    BE->>BC: createBooking(req, res)
    BC->>DB_A: Astrologer.findOne({ _id, approvalStatus:'approved', isActive:true })
    DB_A-->>BC: Astrologer document (with pricing.perSession)
    BC->>BC: Parse and validate booking date
    BC->>DB_B: Booking.findOne({ astrologerId, date range, time, status in ['pending','confirmed'] })
    DB_B-->>BC: null (slot available)
    BC->>DB_B: new Booking({ userId, astrologerId, date, time, amount, paymentMethod, bookingStatus:'pending', paymentStatus:'pending' }).save()
    DB_B-->>BC: Saved booking (with auto-generated bookingId "BOOK-...")
    BC->>DB_B: Booking.findById(id).populate('userId').populate('astrologerId')
    DB_B-->>BC: Populated booking
    BC-->>BE: 201 { message: "Booking created successfully", booking }
    BE-->>API: HTTP 201
    API-->>FE: response.data
    FE->>U: Show booking confirmation
```

---

## 9. Khalti Payment Flow (Initiate → Pay → Verify)

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend
    participant API as Axios Interceptor
    participant MW as authMiddleware
    participant KR as POST /api/khalti/initiate
    participant KS as khaltiService.initiatePayment
    participant KG as Khalti Gateway (Sandbox)
    participant DB as MongoDB (Bookings)
    participant KV as POST /api/khalti/verify
    participant KSV as khaltiService.validatePayment

    U->>FE: Click "Pay with Khalti" for a booking
    FE->>API: API.post("/khalti/initiate", { bookingId, amount, customerInfo })
    API->>MW: HTTP POST with Bearer token
    MW->>KR: Authenticated → next()
    KR->>DB: Booking.findById(bookingId).populate('userId')
    DB-->>KR: Booking document
    KR->>KR: Verify user owns booking (userId match)
    KR->>KR: Verify amount = booking.amount + 50 (platform fee)
    KR->>KS: initiatePayment({ amount*100 (paisa), purchase_order_id, return_url, customer_info })
    KS->>KG: POST to Khalti sandbox API
    KG-->>KS: { pidx, payment_url, expires_at }
    KS-->>KR: { success:true, pidx, payment_url }
    KR->>DB: Update booking: khaltiPaymentId=pidx, khaltiStatus='initiated', paymentMethod='khalti'
    DB-->>KR: Saved
    KR-->>FE: 200 { success, pidx, payment_url }
    FE->>U: Redirect to Khalti payment_url

    Note over U, KG: User completes payment on Khalti page

    KG->>FE: Redirect to /payment/callback?pidx=...
    FE->>API: API.post("/khalti/verify", { pidx, bookingId })
    API->>MW: HTTP POST with Bearer token
    MW->>KV: Authenticated → next()
    KV->>DB: Find booking by bookingId
    DB-->>KV: Booking document
    KV->>KV: Verify user ownership & pidx match
    KV->>KSV: validatePayment(pidx, (amount+50)*100, bookingId)
    KSV->>KG: Lookup payment by pidx
    KG-->>KSV: Payment details (status, transaction_id, amount)
    KSV-->>KV: { valid:true, paymentData }
    KV->>DB: Update booking: khaltiStatus='completed', paymentStatus='paid', bookingStatus='confirmed'
    DB-->>KV: Saved
    KV-->>FE: 200 { success, message:"Payment verified", booking, transaction }
    FE->>U: Show payment success & confirmed booking
```

---

## 10. Astrologer Updates Booking Status

```mermaid
sequenceDiagram
    actor A as Astrologer (Browser)
    participant FE as Frontend (AstrologerDashboard.jsx)
    participant API as Axios Interceptor
    participant MW as authMiddleware + isAstrologer
    participant BE as PUT /api/bookings/:id/status
    participant BC as bookingController.updateBookingStatus
    participant DB_B as MongoDB (Bookings)
    participant DB_A as MongoDB (Astrologers)

    A->>FE: Click Confirm/Complete/Cancel on a booking
    FE->>API: API.put("/bookings/{id}/status", { status:"confirmed" })
    API->>MW: HTTP PUT with Bearer token
    MW->>MW: authMiddleware → verify JWT (role:'astrologer')
    MW->>MW: isAstrologer → check role
    MW->>BE: next()
    BE->>BC: updateBookingStatus(req, res)
    BC->>DB_B: Booking.findOne({ _id:id, astrologerId:req.userId })
    DB_B-->>BC: Booking document
    alt status === 'payment_received'
        BC->>BC: booking.paymentStatus = 'paid'
    else status === 'completed' && paymentStatus === 'paid'
        BC->>BC: booking.bookingStatus = 'completed'
        BC->>DB_A: Astrologer.findById(astrologerId)
        DB_A-->>BC: Astrologer document
        BC->>BC: Update totalEarnings, monthlyEarnings, completedSessions
        BC->>DB_A: astrologer.save()
    else Other status
        BC->>BC: booking.bookingStatus = status
    end
    BC->>DB_B: booking.save()
    BC-->>BE: 200 { message: "Booking updated", booking }
    BE-->>FE: HTTP 200
    FE->>A: Update booking card UI
```

---

## 11. Admin Approves/Rejects Astrologer

```mermaid
sequenceDiagram
    actor AD as Admin (Browser)
    participant FE as Frontend (AdminDashboard.jsx)
    participant API as Axios Interceptor
    participant MW as authMiddleware + isAdmin
    participant BE as PUT /api/admin/astrologers/:id/status
    participant DB as MongoDB (Astrologers)

    AD->>FE: Click Approve/Reject on pending astrologer
    FE->>API: API.put("/admin/astrologers/{id}/status", { status:"approved" })
    API->>MW: HTTP PUT with Bearer token
    MW->>MW: authMiddleware → verify JWT (role:'admin')
    MW->>MW: isAdmin → check req.userRole === 'admin'
    MW->>BE: next()
    BE->>DB: Astrologer.findById(id)
    DB-->>BE: Astrologer document
    BE->>BE: astrologer.approvalStatus = 'approved'
    BE->>BE: astrologer.isActive = true
    BE->>DB: astrologer.save()
    DB-->>BE: Saved
    BE-->>API: 200 { message: "Astrologer approved successfully", astrologer }
    API-->>FE: response.data
    FE->>AD: Update astrologer list, show success toast
```

---

## 12. Forgot & Reset Password

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend (Login.jsx)
    participant API as Axios Interceptor
    participant BE1 as POST /api/auth/forgot-password
    participant AC as authController.forgotPassword
    participant DB as MongoDB (Users / Astrologers)
    participant EM as Nodemailer (Gmail SMTP)
    participant BE2 as POST /api/auth/reset-password/:token
    participant RC as authController.resetPassword

    U->>FE: Click "Forgot Password", enter email & role
    FE->>API: API.post("/auth/forgot-password", { email, role })
    API->>BE1: HTTP POST
    BE1->>AC: forgotPassword(req, res)
    alt role === 'user'
        AC->>DB: User.findOne({ email })
    else role === 'astrologer'
        AC->>DB: Astrologer.findOne({ email })
    end
    DB-->>AC: User/Astrologer document
    AC->>AC: jwt.sign({ id, role }, JWT_SECRET, { expiresIn:"15m" })
    AC->>DB: Save resetPasswordToken & resetPasswordExpire (15 min)
    AC->>EM: transporter.sendMail({ to: email, html: resetUrl link })
    EM-->>AC: Email sent
    AC-->>BE1: 200 { message: "Reset email sent" }
    BE1-->>FE: HTTP 200
    FE->>U: toast.success("Check your inbox")

    Note over U: User clicks reset link in email

    U->>FE: Navigate to /reset-password/:token, enter new password
    FE->>API: API.post("/auth/reset-password/{token}", { password, confirmPassword })
    API->>BE2: HTTP POST
    BE2->>RC: resetPassword(req, res)
    RC->>RC: jwt.verify(token) → { id, role }
    RC->>RC: Validate password strength & match
    alt role === 'user'
        RC->>DB: User.findOne({ _id, resetPasswordToken, resetPasswordExpire > now })
    else role === 'astrologer'
        RC->>DB: Astrologer.findOne({ _id, resetPasswordToken, resetPasswordExpire > now })
    end
    DB-->>RC: Document found
    RC->>RC: bcrypt.hash(newPassword, 10)
    RC->>DB: Update password, clear resetPasswordToken & resetPasswordExpire
    RC-->>BE2: 200 { message: "Password reset successfully" }
    BE2-->>FE: HTTP 200
    FE->>U: toast.success("Password reset!") → Redirect to login
```

---

## 13. Admin Dashboard Stats

```mermaid
sequenceDiagram
    actor AD as Admin (Browser)
    participant FE as Frontend (AdminDashboard.jsx)
    participant API as Axios Interceptor
    participant MW as authMiddleware + isAdmin
    participant BE as GET /api/admin/stats
    participant DB_U as MongoDB (Users)
    participant DB_A as MongoDB (Astrologers)
    participant DB_B as MongoDB (Bookings)

    AD->>FE: Open Admin Dashboard
    FE->>API: API.get("/admin/stats")
    API->>MW: HTTP GET with Bearer token
    MW->>MW: Verify admin JWT
    MW->>BE: next()
    par Parallel DB Queries
        BE->>DB_U: User.countDocuments({ role:'user' })
        BE->>DB_A: Astrologer.countDocuments()
        BE->>DB_A: Astrologer.countDocuments({ approvalStatus:'pending' })
        BE->>DB_A: Astrologer.countDocuments({ approvalStatus:'approved' })
        BE->>DB_B: Booking.countDocuments()
        BE->>DB_B: Booking.countDocuments({ bookingStatus:'completed' })
        BE->>DB_B: Booking.aggregate([match paid+completed, sum amount])
    end
    DB_U-->>BE: totalUsers
    DB_A-->>BE: totalAstrologers, pending, approved
    DB_B-->>BE: totalBookings, completed, totalRevenue
    BE->>DB_B: Booking.find().populate('userId','astrologerId').sort(-1).limit(5)
    DB_B-->>BE: recentBookings
    BE-->>API: 200 { stats: {...}, recentBookings }
    API-->>FE: response.data
    FE->>AD: Render dashboard cards & recent bookings table
```

---

## 14. Astrologer Availability Management

```mermaid
sequenceDiagram
    actor A as Astrologer (Browser)
    participant FE as Frontend (AstrologerDashboard.jsx)
    participant API as Axios Interceptor
    participant MW as authMiddleware + isAstrologer
    participant BE as POST /api/astrologers/availability
    participant AC as astrologerController.addAvailability
    participant DB_A as MongoDB (Astrologers)
    participant DB_AV as MongoDB (Availabilities)

    A->>FE: Set availability (day, startTime, endTime, slotDuration)
    FE->>API: API.post("/astrologers/availability", { dayOfWeek:1, startTime:"09:00", endTime:"17:00", slotDuration:30 })
    API->>MW: HTTP POST with Bearer token
    MW->>MW: Verify astrologer JWT
    MW->>BE: next()
    BE->>AC: addAvailability(req, res)
    AC->>DB_A: Astrologer.findById(req.userId)
    DB_A-->>AC: Astrologer exists
    AC->>AC: Validate dayOfWeek (0-6), time format (HH:MM), startTime < endTime
    AC->>DB_AV: Availability.findOne({ astrologerId, dayOfWeek, startTime })
    DB_AV-->>AC: null (no duplicate)
    AC->>DB_AV: new Availability({ astrologerId, dayOfWeek, startTime, endTime, slotDuration, isRecurring:true, isActive:true }).save()
    DB_AV-->>AC: Saved
    AC-->>BE: 201 { message: "Availability added", availability }
    BE-->>FE: HTTP 201
    FE->>A: Update availability schedule UI
```

---

## 15. User Cancels Booking

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend (MyBookings.jsx)
    participant API as Axios Interceptor
    participant MW as authMiddleware + isUser
    participant BE as PUT /api/bookings/:id/cancel
    participant BC as bookingController.cancelBooking
    participant DB as MongoDB (Bookings)

    U->>FE: Click "Cancel Booking" with reason
    FE->>API: API.put("/bookings/{id}/cancel", { reason })
    API->>MW: HTTP PUT with Bearer token
    MW->>BE: Authenticated user → next()
    BE->>BC: cancelBooking(req, res)
    BC->>DB: Booking.findOne({ _id:id, userId:req.userId })
    DB-->>BC: Booking document
    alt bookingStatus === 'completed'
        BC-->>BE: 400 { message: "Cannot cancel completed booking" }
    else
        BC->>BC: booking.bookingStatus = 'cancelled'
        BC->>BC: booking.cancellationReason = reason
        BC->>DB: booking.save()
        BC-->>BE: 200 { message: "Booking cancelled", booking }
    end
    BE-->>FE: Response
    FE->>U: Update booking status in UI
```

---

## Authentication Middleware Flow (Shared)

```mermaid
sequenceDiagram
    participant Client as HTTP Request
    participant MW as authMiddleware
    participant JWT as jwt.verify
    participant DB_U as MongoDB (Users)
    participant DB_A as MongoDB (Astrologers)
    participant Next as Route Handler

    Client->>MW: Request with Authorization header
    MW->>MW: Extract token from "Bearer <token>"
    MW->>JWT: jwt.verify(token, JWT_SECRET)
    JWT-->>MW: decoded { id, role }
    alt role === 'user'
        MW->>DB_U: User.findById(decoded.id).select('-password')
        DB_U-->>MW: User document
        MW->>MW: req.userId = user._id, req.userRole = user.role
    else role === 'astrologer'
        MW->>DB_A: Astrologer.findById(decoded.id).select('-password')
        DB_A-->>MW: Astrologer document
        MW->>MW: req.userId = astrologer._id, req.userRole = 'astrologer'
    else role === 'admin'
        MW->>DB_U: User.findById(decoded.id) where role='admin'
        DB_U-->>MW: Admin document
        MW->>MW: req.userId = admin._id, req.userRole = 'admin'
    end
    MW->>Next: next()
```
