// src/services/admin.js
import API from "./api";

// Get platform stats
export const getPlatformStats = () => {
  return API.get("/admin/stats");
};

// Get pending astrologers
export const getPendingAstrologers = () => {
  return API.get("/admin/astrologers/pending");
};

// Get all astrologers
export const getAllAstrologers = () => {
  return API.get("/admin/astrologers");
};

// Get all users
export const getAllUsers = () => {
  return API.get("/admin/users");
};

// Get all bookings
export const getAllBookings = () => {
  return API.get("/admin/bookings");
};

// Approve/reject astrologer
export const approveAstrologer = (astrologerId, status) => {
  return API.put(`/admin/astrologers/${astrologerId}/status`, { status });
};

// Delete astrologer
export const deleteAstrologer = (astrologerId) => {
  return API.delete(`/admin/astrologers/${astrologerId}`);
};

// Delete user
export const deleteUser = (userId) => {
  return API.delete(`/admin/users/${userId}`);
};

// Update user status
export const updateUserStatus = (userId, status) => {
  return API.put(`/admin/users/${userId}/status`, { status });
};