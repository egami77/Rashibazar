// backend/routes/horoscopeRoutes.js
import express from "express";
import { 
  getHoroscope, 
  getAllRashis, 
  getDailyHoroscopeForAll 
} from "../controllers/horoscopeController.js";

const router = express.Router();

// Get all rashis information
router.get("/rashis", getAllRashis);

// Get horoscope for specific rashi and period
router.get("/:rashi/:period", getHoroscope);

// Get today's horoscope for all rashis
router.get("/daily/all", getDailyHoroscopeForAll);

export default router;