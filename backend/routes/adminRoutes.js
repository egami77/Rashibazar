// backend/routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import Astrologer from "../models/Astrologer.js";
import Booking from "../models/Booking.js";
import SystemSetting from "../models/SystemSetting.js";
import Announcement from "../models/Announcement.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all astrologers for admin
router.get("/astrologers", authMiddleware, isAdmin, async (req, res) => {
  try {
    const astrologers = await Astrologer.find()
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    res.json(astrologers);
  } catch (error) {
    console.error("Error fetching astrologers:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending astrologers
router.get("/astrologers/pending", authMiddleware, isAdmin, async (req, res) => {
  try {
    const pendingAstrologers = await Astrologer.find({ approvalStatus: 'pending' })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    res.json(pendingAstrologers);
  } catch (error) {
    console.error("Error fetching pending astrologers:", error);
    res.status(500).json({ error: error.message });
  }
});

// Approve/reject astrologer
router.put("/astrologers/:id/status", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
    }

    const astrologer = await Astrologer.findById(id);
    if (!astrologer) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    astrologer.approvalStatus = status;
    astrologer.isActive = status === 'approved';

    await astrologer.save();

    console.log(`Astrologer ${astrologer.name} ${status} successfully`);

    res.json({
      message: `Astrologer ${status} successfully`,
      astrologer: {
        id: astrologer._id,
        name: astrologer.name,
        email: astrologer.email,
        approvalStatus: astrologer.approvalStatus,
        isActive: astrologer.isActive
      }
    });
  } catch (error) {
    console.error("Error updating astrologer status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete astrologer
router.delete("/astrologers/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const astrologer = await Astrologer.findByIdAndDelete(id);

    if (!astrologer) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    res.json({ message: 'Astrologer deleted successfully' });
  } catch (error) {
    console.error("Error deleting astrologer:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete("/users/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings
router.get("/bookings", authMiddleware, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('astrologerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get("/stats", authMiddleware, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAstrologers = await Astrologer.countDocuments();
    const pendingAstrologers = await Astrologer.countDocuments({ approvalStatus: 'pending' });
    const approvedAstrologers = await Astrologer.countDocuments({ approvalStatus: 'approved' });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'completed' });

    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', bookingStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name')
      .populate('astrologerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalAstrologers,
        pendingAstrologers,
        approvedAstrologers,
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get system settings
router.get("/settings", authMiddleware, isAdmin, async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update system setting
router.post("/settings", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { key, value, description } = req.body;
    let setting = await SystemSetting.findOne({ key });

    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
      setting.updatedBy = req.user._id;
    } else {
      setting = new SystemSetting({ key, value, description, updatedBy: req.user._id });
    }

    await setting.save();
    res.json({ message: "Setting updated", setting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Broadcast Announcement
router.post("/broadcast", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, message, target } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const validTargets = ["all", "users", "astrologers"];
    if (!validTargets.includes(target)) {
      return res.status(400).json({ error: "Invalid target audience" });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      target,
      createdBy: req.user._id,
    });

    console.log(`[BROADCAST] ${target.toUpperCase()}: ${title}`);
    res.status(201).json({
      message: "Broadcast sent successfully",
      announcement,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;