// backend/routes/bookingRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { isUser, isAstrologer } from "../middleware/roleMiddleware.js";
import {
  createBooking,
  getUserBookings,
  getAstrologerBookings,
  updateBookingStatus,
  cancelBooking,
  updatePaymentStatus
} from "../controllers/bookingController.js";

const router = express.Router();

// User routes
router.post("/", authMiddleware, isUser, createBooking);
router.get("/my-bookings", authMiddleware, isUser, getUserBookings);
router.put("/:id/cancel", authMiddleware, isUser, cancelBooking);
router.put("/:id/payment", authMiddleware, isUser, updatePaymentStatus);

// Astrologer routes
router.get("/astrologer/bookings", authMiddleware, isAstrologer, getAstrologerBookings);
router.put("/:id/status", authMiddleware, isAstrologer, updateBookingStatus);

export default router;