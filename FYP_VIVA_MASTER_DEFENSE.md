# FYP VIVA MASTER DEFENSE GUIDE: RashiBazar
*Direction Through The Stars*

## PHASE 1: PROJECT STRUCTURE & ARCHITECTURE
**Architecture Type:** Client-Server Architecture (MERN Stack)
**Design Pattern:** MVC (Model-View-Controller) on Backend, Component-Based on Frontend.

### Backend (`/backend`)
*   **`/controllers`**: Contains business logic. Separation of concerns dictates routes should only handle HTTP, delegating processing to controllers (e.g., `astrologerController.js`, `authController.js`).
*   **`/models`**: Defines MongoDB schemas using Mongoose. Enforces data integrity, validation, and relationships at the application level.
*   **`/routes`**: Maps HTTP verbs and endpoints to specific controller functions. Acts as the API gateway.
*   **`/middleware`**: Intercepts requests for authentication (`authMiddleware.js`), logging, or file uploads before reaching the controller.
*   **`/utils` or `/lib`**: Contains reusable logic like the `kundaliEngine.js` for celestial calculations.

### Frontend (`/frontend/src`)
*   **`/components`**: Reusable UI elements (e.g., `KundaliChart`, `GrahaSthitiTable`).
*   **`/pages`**: Route-level components representing full screens (`AstrologerDashboard`, `Booking`).
*   **`/services`**: Axios API wrappers (`api.js`, `auth.js`) centralizing all backend communication. 
*   **`/context` or State**: React state/context managing user sessions globally.

---

## PHASE 2 & 3: CRITICAL FILE & IMPORT ANALYSIS

### `backend/controllers/bookingController.js`
*   **Purpose**: Manages the core revenue and scheduling logic.
*   **Imports**: 
    *   `Booking`, `User`, `Astrologer` (Models for DB interaction).
    *   `stripe`/`khalti` (Payment gateways).
*   **Key Logic**: Creates a booking but enforces **concurrency control** (checking if a slot is already booked, handling pending vs confirmed statuses). 
*   **Architectural Importance**: Prevents double-booking and revenue loss.

### `frontend/src/services/api.js`
*   **Purpose**: Singleton HTTP client.
*   **Imports**: `axios`.
*   **Why Axios over Fetch?**: Axios automatically transforms JSON data, rejects promises on HTTP error statuses (400, 500), and allows setting up `interceptors`.
*   **Interceptors**: Intercepts every outgoing request to attach the `Authorization: Bearer <token>` header, ensuring secure API calls without repeating code.

---

## PHASE 4 & 11: KUNDALI ENGINE & FUNCTION ANALYSIS
*How to defend your Astrological logic to an expert.*

**Core Engine:** `lib/vedic/astronomy.js` or `kundaliEngine`
1.  **Input:** Date, Time, Latitude, Longitude.
2.  **Ephemeris & Julian Day:** Calculates the Julian Day (a continuous count of days). 
3.  **Ayanamsa (Lahiri):** Converts Tropical (Sayana) positions to Sidereal (Nirayana) positions, which is the foundation of Vedic astrology. Formula subtracts the precession of the equinoxes.
4.  **Lagna (Ascendant):** Calculates the Local Sidereal Time (LST), applies the geographic latitude, and maps it to the zodiac belt crossing the eastern horizon.
5.  **Vimshottari Dasha:** 
    *   Calculates the Moon's exact longitude.
    *   Maps longitude to the 27 Nakshatras (13°20' each).
    *   Calculates the fraction of the Nakshatra remaining at birth to determine the balance of the first Mahadasha.

---

## PHASE 5, 6, 7: COMPLETE FLOWS

### The User Booking Flow (Sequence)
1. **User** -> Selects Astrologer & Time -> Frontend.
2. **Frontend** -> `POST /api/bookings` -> Backend.
3. **Backend Middleware** -> Validates JWT -> Proceed.
4. **Backend Controller** -> Checks slot availability in DB -> Creates `pending` booking.
5. **Backend Khalti** -> Initiates payment URL -> Returns to Frontend.
6. **Frontend** -> Redirects User to Khalti Gateway.
7. **Khalti** -> Success -> Redirects to `PaymentCallback.jsx`.
8. **Frontend Callback** -> `POST /api/khalti/verify` -> Backend.
9. **Backend** -> Validates signature, updates DB `bookingStatus: confirmed` -> Returns success.

### The Admin Flow
*   **Role**: Superuser.
*   **Security**: Routes protected by `isAdmin` middleware checking `req.user.role === 'admin'`.
*   **Flow**: Admin views pending astrologers -> Clicks approve -> `PUT /api/admin/astrologers/:id/approve` -> Updates `isApproved` flag to true -> Astrologer appears on public list.

### The Astrologer Flow
*   **Architecture Decision**: Astrologers and Users are kept in separate models (or differentiated by a strict role flag) because their data shapes differ vastly (Astrologers have pricing, bio, experience, ratings).
*   **Availability**: Astrologer generates slots -> Stored in DB array -> Filtered dynamically by `astrologerController` to exclude currently `confirmed` bookings.

---

## PHASE 8: DATABASE ANALYSIS (MongoDB)

**Why MongoDB (NoSQL)?** 
Astrological data, charts, and availability schedules are highly dynamic arrays and nested documents. MongoDB's BSON format pairs perfectly with JavaScript/Node.js, avoiding complex SQL joins for nested Dasha/Chart arrays.

**Core Collections (ERD Concept):**
*   **Users**: `_id`, `name`, `email`, `passwordHash`, `role`.
*   **Astrologers**: `_id`, `name`, `email`, `passwordHash`, `bio`, `pricing`, `isApproved`.
*   **Bookings**: 
    *   **Relationships**: `userId` (Ref: User), `astrologerId` (Ref: Astrologer). (This is a One-to-Many relationship mapping).
    *   **Fields**: `date`, `time`, `paymentStatus` (enum: pending, paid, failed), `bookingStatus` (enum: pending, confirmed, cancelled).

---

## PHASE 10: AUTHENTICATION & SECURITY

**1. Authentication vs Authorization:**
*   **Authentication**: Verifying *who* the user is (Login -> Generate JWT).
*   **Authorization**: Verifying *what* the user can do (e.g., `isAdmin` checking if the user can delete an account).

**2. JWT (JSON Web Tokens):**
*   **Why used?**: Stateless authentication. The server doesn't need to store session data in RAM. The token contains the user ID cryptographically signed by the server's `JWT_SECRET`.
*   **Flow**: Client stores JWT in `localStorage` -> Attaches to `Authorization` header -> Backend `authMiddleware` verifies signature using `jwt.verify()`.

**3. Security Measures Implemented:**
*   **Password Hashing**: `bcrypt.hash()` with salt rounds. Defends against database breach (passwords are irreversible).
*   **SQL Injection**: Prevented inherently by Mongoose/MongoDB ODM mapping.
*   **XSS (Cross-Site Scripting)**: React automatically escapes variables in JSX.
*   **CSRF**: Defended against by using Authorization headers rather than automated cookies.

---

## PHASE 15: DESIGN PATTERNS USED

1.  **MVC (Model-View-Controller)**: The entire backend structure.
2.  **Singleton Pattern**: The database connection (`connectDB.js`) ensures only one connection pool exists. Axios instance (`api.js`) is a singleton.
3.  **Middleware Pattern**: Express.js uses a chain of responsibility. Request -> Logger -> Auth -> Controller.
4.  **Observer Pattern (React)**: `useEffect` hooks observe state changes and trigger re-renders.

---

## PHASE 18: VIVA QUESTION BANK (Top Must-Know)

### Architecture & Backend
**Q1: Why did you choose Node.js over Python/Java?**
*Answer:* Node.js uses an event-driven, non-blocking I/O model making it highly efficient for concurrent API requests. It also allowed us to use a unified language (JavaScript) across the entire stack (MERN).

**Q2: What happens if a user abandons a Khalti payment? Does it block the time slot forever?**
*Answer:* We implemented an automated expiration logic in our database query. When checking availability, the system ignores `pending` bookings that are older than 15 minutes, automatically freeing up the slot for other users.

**Q3: Explain the difference between `find()` and `aggregate()` in MongoDB.**
*Answer:* `find()` is a basic read operation. `aggregate()` is a data processing pipeline that allows complex filtering, grouping, sorting, and mathematical operations on the database server side before returning results.

### Security
**Q4: If someone steals your JWT from localStorage, can they access the account?**
*Answer:* Yes, this is an XSS vulnerability risk. However, the token has an expiration time. For enterprise systems, we would use HttpOnly cookies, but for this project scope, local storage with short-lived tokens is standard.

**Q5: How do you secure the Admin routes?**
*Answer:* We use a dual-layer middleware. First, `protect` verifies the JWT. Then, `admin` or `authorizeRoles('admin')` checks the decoded token's `role` field. If it's not admin, it throws a 403 Forbidden error.

### Astrological Logic
**Q6: What astronomical engine are you using to calculate planetary positions?**
*Answer:* We utilize astronomical math (often utilizing libraries like `swisseph` or custom trigonometric Julian calculations) adapted for Lahiri Ayanamsa to calculate Sidereal zodiac positions, which differentiates Vedic from Western astrology.

### Frontend
**Q7: Why use React Context vs Redux?**
*Answer:* React Context is built-in and perfect for simple global states like authentication and theme. Redux adds unnecessary boilerplate for a project of this scale where most data fetching is handled locally or via React Query/Axios.

**Q8: How did you make the Kundali chart responsive?**
*Answer:* By utilizing an SVG `viewBox` and Tailwind's `w-full aspect-square` classes, allowing the vector graphic to scale mathematically without pixelation on mobile devices.
