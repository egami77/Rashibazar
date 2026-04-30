// backend/routes/systemRoutes.js
import express from "express";
import SystemSetting from "../models/SystemSetting.js";

const router = express.Router();

// Get public configuration
router.get("/config", async (req, res) => {
  try {
    const settings = await SystemSetting.find({
      key: { $in: ['MAINTENANCE_MODE', 'SYSTEM_ANNOUNCEMENT'] }
    });
    
    const config = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
