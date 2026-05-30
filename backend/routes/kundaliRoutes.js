// backend/routes/kundaliRoutes.js
import express from "express";
import {
  generateKundali,
  getKundaliHistory,
  getKundali,
  deleteKundali,
  checkCompatibility,
  getCompatibilityHistory,
  deleteCompatibility
} from "../controllers/kundaliController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all kundali routes
router.use(authMiddleware);

router.post("/generate", generateKundali);
router.post("/compatibility", checkCompatibility);
router.get("/compatibility/history", getCompatibilityHistory);
router.delete("/compatibility/:id", deleteCompatibility);
router.get("/history", getKundaliHistory);
router.get("/:id", getKundali);
router.delete("/:id", deleteKundali);

export default router;