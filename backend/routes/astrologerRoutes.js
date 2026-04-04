// backend/routes/astrologerRoutes.js
import express from "express";
import {
  getApprovedAstrologers,
  getAstrologerById,
  getAstrologerAvailability,
  getAstrologerDashboard,
  updateAstrologerProfile,
  addAvailability,
  getMyAvailability,
  deleteAvailability
} from "../controllers/astrologerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { isAstrologer } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes
router.get("/approved", getApprovedAstrologers);

// Protected astrologer routes (must come BEFORE /:id routes)
router.get("/dashboard/data", authMiddleware, isAstrologer, getAstrologerDashboard);
router.get("/my-availability", authMiddleware, isAstrologer, getMyAvailability);
router.put("/profile", authMiddleware, isAstrologer, updateAstrologerProfile);
router.post("/availability", authMiddleware, isAstrologer, addAvailability);
router.delete("/availability/:id", authMiddleware, isAstrologer, deleteAvailability);

// Parameterized public routes (must come LAST)
router.get("/:id", getAstrologerById);
router.get("/:id/availability", getAstrologerAvailability);

export default router;