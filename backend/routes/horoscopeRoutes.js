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

const router = express.Router();

// Specific routes first (before path-based routes)
router.get("/rashis", getAllRashis);
router.get("/astrologer/all", getAstrologerHoroscopes);
router.get("/daily/all", getDailyHoroscopeForAll);

// Routes with ID parameter
router.delete("/:horoscopeId", deleteHoroscope);

// Routes with rashi/period/date parameters
router.put("/:rashi/:period/:date", updateHoroscope);
router.get("/:rashi/:period", getHoroscope);

export default router;