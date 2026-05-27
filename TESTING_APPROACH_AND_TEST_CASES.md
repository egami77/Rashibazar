# Chapter 6: Testing and Quality Assurance

This section details the testing methodology, strategies, and execution steps used to validate the correctness, security, performance, and usability of the **RashiBazar** platform.

---

## 6.1 Explanation of the Used Testing Approach

To ensure the reliability of RashiBazar—especially given its unique integration of Vedic astrological calculations, dual calendars, and online financial transactions—a multi-faceted **Black-Box Testing** and **Integration Testing** approach was implemented. Testing was structured around the following core methodologies:

```
+-------------------------------------------------------------------+
|                     RashiBazar Testing Strategy                   |
+-------------------+-----------------+-----------------+-----------+
                    |                 |                 |
     +--------------+--+       +------+-------+   +-----+-----+
     | Functional      |       | Integration  |   | Security  |
     | Testing         |       | Testing      |   | Testing   |
     +-------+---------+       +------+-------+   +-----+-----+
             |                        |                 |
     +-------+---------+       +------+-------+   +-----+-----+
     | Form validations|       | API endpoints|   | JWT token |
     | Astro logic     |       | Swiss Ephem  |   | Khalti sig|
     +-----------------+       +--------------+   +-----------+
```

### 1. Functional Testing (Black-Box Testing)
Functional testing was used to verify that each user flow, page navigation, and input form behaves according to the requirements specified in the SRS. Tests were executed without analyzing the underlying source code (Black-Box), focusing strictly on:
- Form inputs and data validation (empty fields, email formatting, boundary values).
- Astrological output verification (matching coordinates, Rashi/Moon sign, and Ashtakoota Guna Milan points).
- User, Astrologer, and Admin role permissions and dashboard behavior.

### 2. Integration Testing
Since RashiBazar is composed of multiple interacting components (React frontend, Node.js/Express backend, MongoDB database, Swiss Ephemeris astronomical engine, and external payment APIs), integration testing was critical:
- **API Integration:** Assured that HTTP requests from the frontend retrieve correct JSON response structures from the backend.
- **Swiss Ephemeris Engine:** Verified that latitude, longitude, date, and timezone coordinates sent to the calculation engine correctly return traditional birth charts (Janma Kundali).
- **Payment Gateway Webhooks:** Tested the interaction between Khalti/eSewa callback redirections and the database update routines.

### 3. Security & Transaction Testing
With sensitive personal details (birth date, time, location) and financial transactions taking place, security testing verified:
- Password hashing security (using `bcrypt` with salt).
- Session authorization and token storage (JWT tokens in client-side headers).
- Transaction verification via backend signature checking (confirming that transaction tokens returned by payment gateways cannot be spoofed or duplicated).

### 4. Usability & Compatibility Testing
- **Multi-Device Responsiveness:** Verified that the UI (especially the graphical Kundali layout and dual-calendar Patro grid) adapts seamlessly to mobile screens, tablets, and desktops.
- **Cross-Language/Calendar Sync:** Checked that date conversions between BS (Bikram Sambat) and AD (Gregorian) match Nepali cultural Patros and that national holidays/festivals display correctly.

---

## 6.2 Explanation of Why the Approach Was Used

The hybrid approach of manual black-box testing and strict integration testing was selected for the RashiBazar project due to several key factors:

### 1. Complexity of Astrological Computations (Swiss Ephemeris)
The positioning of celestial bodies is highly mathematical. Unit tests are excellent for code-level logic, but verifying that the generated visual chart matches traditional expectations (e.g. correct placement of planets in houses or accurate Guna Milan calculations out of 36) requires visual verification. Comparing results directly with physical patros or trusted digital tools (like Hamro Patro) was the most reliable way to validate the system's accuracy.

### 2. Third-Party Payment Gateway Integration (Khalti / eSewa)
Gateways cannot be fully simulated via local automated scripts because they require browser redirection, user login inside the gateway interface, and dynamic webhook response confirmation. Conducting manual integration tests using the **Khalti and eSewa Sandbox** allowed the validation of authentic transaction sequences, payment cancellation errors, and successful database state transitions.

### 3. Visual Layout and Multi-Viewport Responsiveness
RashiBazar features dense graphical components, such as:
- The traditional **diamond-style Janma Kundali** layout.
- The **Dual Calendar** grid displaying Gregorian dates alongside Bikram Sambat dates and Tithis.
- The interactive scheduling calendars on the **Astrologer Dashboard**.

These layouts are prone to overlapping text, overflow bugs, or misalignments on mobile screen widths. Usability testing ensures a high-quality, premium visual experience for Nepali users.

### 4. Multi-Role Workflows and State Machine Verification
The core business model relies on transactions between distinct roles:
1. **User** searches, selects, and pays for a slot.
2. **Astrologer** receives the booking request, marks it as accepted, and schedules a slot.
3. **Admin** acts as a moderator, validating credentials and reviewing transactions.

Testing these sequences requires simulated end-to-end walkthroughs across multiple concurrent sessions, making manual system testing the most cost-effective and thorough method for this development phase.

---

## 6.4 Test Cases

A comprehensive suite of test cases was created to validate all modules of the RashiBazar app. The spreadsheet containing the data has been fully populated.

### Spreadsheet Link
Access the complete test cases spreadsheet here:  
👉 **[RashiBazar Test Cases Sheet (Excel)](file:///c:/Users/A%20C%20E%20R%20N%20I%20T%20R%20O/OneDrive/Desktop/RashiBazar%20Direction%20Through%20the%20stars/Test%20Case%20Template%20(1).xlsx)**

### Test Case Execution Summary

Below is an overview of the test cases executed for all the functional modules in the application:

| Test Case ID | Test Category | Test Scenario Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC_Register_01-07** | **User Onboarding** | Form validation with empty fields, invalid emails, short passwords, duplicate usernames, and successful signup. | Validation errors shown for invalid inputs; User registered successfully on valid form submission. | **Pass / Fail** |
| **TC_Login_01-04** | **Authentication** | Verification of valid credentials, incorrect passwords, invalid usernames, and JWT token authorization. | Redirects to dashboard on success; displays appropriate error on failure. | **Pass / Fail** |
| **TC_ForgotPassword_01-02** | **Authentication** | Password reset requests via valid and invalid email addresses. | Verification link sent to valid email; error shown for invalid email. | **Pass / Fail** |
| **TC_ResetPassword_01-08** | **Authentication** | Setting new password checking complexity rules (length, uppercase, lowercase, numbers, special characters). | Rejects insecure passwords; accepts complex passwords and redirects to login. | **Pass / Fail** |
| **TC_Profile_01-03** | **Profile Management** | Updating personal profile information, editing birth details, and uploading profile pictures. | Updates database values, recalculates Kundali, and updates profile picture across dashboards. | **Pass** |
| **TC_Kundali_01-04** | **Astrology Engine** | Swiss Ephemeris calculations, missing input validation, graphical house/sign rendering, and saving charts to profile. | Correct birth chart generated and displayed in diamond style; saved to user profile successfully. | **Pass** |
| **TC_Compatibility_01-02** | **Astrology Engine** | Ashtakoota Guna Milan calculation of matching score and display of detailed 8-koota report. | Calculates correct score out of 36 points and shows tabular points breakdown. | **Pass** |
| **TC_Horoscope_01** | **Astro Features** | Displaying daily and weekly predictions based on selected moon signs. | Renders correct astrological texts for selected Rashi. | **Pass** |
| **TC_Calendar_01-02** | **Astro Features** | Conversion from AD to BS, monthly calendar view, and festival/holiday details display. | Converts dates accurately and highlights specific Tithis/Nepali festivals. | **Pass** |
| **TC_Booking_01-03** | **Consultation** | Searching/filtering astrologers, viewing detailed bio profiles, and reserving specific time slots. | Displays matching astrologer cards; holds selected time slot and proceeds to payment. | **Pass** |
| **TC_Payment_01-04** | **Payment Integration** | Khalti sandbox payment initiation, success callback confirmation, cancellation handling, and PDF invoice generation. | Updates booking status to 'Paid' upon successful callback verification; generates downloadable receipt. | **Pass** |
| **TC_AstroDash_01-03** | **Astrologer Domain** | Astrologer slot allocation, accepting/declining consultation requests, and updating profile settings. | Updates booking calendar; client is notified of approval/decline; updates fees and bio. | **Pass** |
| **TC_AdminDash_01-04** | **Admin Domain** | Astrologer certification review, account suspension, financial commission logs, and global settings. | Activates/deactivates accounts; displays platform revenue details; updates system commission rates. | **Pass** |
