import express from "express";
import Announcement from "../models/Announcement.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get active announcements for the logged-in role
router.get("/", authMiddleware, async (req, res) => {
  try {
    const role = req.userRole;

    let targetFilter;
    if (role === "astrologer") {
      targetFilter = { $in: ["all", "astrologers"] };
    } else if (role === "user") {
      targetFilter = { $in: ["all", "users"] };
    } else if (role === "admin") {
      targetFilter = { $in: ["all", "users", "astrologers"] };
    } else {
      return res.json([]);
    }

    const announcements = await Announcement.find({
      isActive: true,
      target: targetFilter,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("title message target createdAt");

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
