// backend/routes/horoscopeRoutes.js
import express from "express";
import { 
  getHoroscope, 
  getAllRashis, 
  getDailyHoroscopeForAll,
  updateHoroscope,
  getAstrologerHoroscopes,
  deleteHoroscope
} from "../controllers/horoscopeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Specific routes first (before path-based routes)
router.get("/rashis", getAllRashis);
router.get("/astrologer/all", authMiddleware, getAstrologerHoroscopes);
router.get("/daily/all", getDailyHoroscopeForAll);

// Routes with ID parameter
router.delete("/:horoscopeId", authMiddleware, deleteHoroscope);

// Routes with rashi/period/date parameters
router.put("/:rashi/:period/:date", authMiddleware, updateHoroscope);
router.get("/:rashi/:period", getHoroscope);

export default router;