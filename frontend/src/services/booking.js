// src/services/booking.js
import API from "./api";

// Get approved astrologers
export const getApprovedAstrologers = () => {
  return API.get("/astrologers/approved");
};

// Get astrologer by ID
export const getAstrologerById = (id) => {
  return API.get(`/astrologers/${id}`);
};

// Get astrologer availability
export const getAstrologerAvailability = (astrologerId, startDate, endDate) => {
  return API.get(`/astrologers/${astrologerId}/availability`, {
    params: { startDate, endDate }
  });
};

// Create booking
export const createBooking = (bookingData) => {
  return API.post("/bookings", bookingData);
};

// Get user's bookings
export const getUserBookings = () => {
  return API.get("/bookings/my-bookings");
};

// Cancel booking
export const cancelBooking = (bookingId, reason) => {
  return API.put(`/bookings/${bookingId}/cancel`, { reason });
};

// Get booking details
export const getBookingDetails = (bookingId) => {
  return API.get(`/bookings/${bookingId}`);
};

// Astrologer: Get astrologer's bookings
export const getAstrologerBookings = () => {
  return API.get("/bookings/astrologer/bookings");
};

// Astrologer: Update booking status
export const updateBookingStatus = (bookingId, status, reason = null) => {
  return API.put(`/bookings/${bookingId}/status`, { status, reason });
};

// Astrologer: Get dashboard data
export const getAstrologerDashboard = () => {
  return API.get("/astrologers/dashboard/data");
};

// Astrologer: Add availability
export const addAvailability = (availabilityData) => {
  return API.post("/astrologers/availability", availabilityData);
};

// Astrologer: Get my availability
export const getMyAvailability = () => {
  return API.get("/astrologers/my-availability");
};

// Astrologer: Delete availability
export const deleteAvailability = (availabilityId) => {
  return API.delete(`/astrologers/availability/${availabilityId}`);
};

// Astrologer: Update profile
export const updateAstrologerProfile = (profileData) => {
  return API.put("/astrologers/profile", profileData);
};