// backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  registerAstrologer,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Separate registration endpoints
router.post("/register/user", registerUser);
router.post("/register/astrologer", registerAstrologer);

// Login endpoint with role parameter
router.post("/login", loginUser);

// Password management
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Profile management (protected)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/account", authMiddleware, deleteAccount);

export default router;