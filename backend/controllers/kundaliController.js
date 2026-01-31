// backend/controllers/kundaliController.js
import Kundali from "../models/Kundali.js";
import { calculateKundali } from "../utils/kundaliCalculator.js";

// === GENERATE KUNDALI ===
export const generateKundali = async (req, res) => {
  try {
    console.log("📩 Received kundali request:", req.body);
    console.log("👤 User ID:", req.userId || "Guest");

    const {
      name,
      birthDate,
      birthTime,
      birthPlace,
      gender,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!name || !birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        message: "Required fields are missing",
        required: ["name", "birthDate", "birthTime", "birthPlace"],
        received: Object.keys(req.body)
      });
    }

    // Parse birth date
    const parsedBirthDate = new Date(birthDate);
    if (isNaN(parsedBirthDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
        received: birthDate
      });
    }

    console.log("✅ Parsed birth date:", parsedBirthDate);
    console.log("✅ Birth time:", birthTime);

    // Calculate kundali
    const kundaliData = calculateKundali({
      name,
      birthDate: parsedBirthDate,
      birthTime,
      birthPlace,
      gender,
      latitude,
      longitude
    });

    console.log("✅ Kundali calculated successfully");

    // Save if user is logged in
    if (req.userId) {
      const kundali = new Kundali({
        userId: req.userId,
        name,
        birthDate: parsedBirthDate,
        birthTime,
        birthPlace,
        gender,
        latitude,
        longitude,
        ascendant: kundaliData.ascendant.name,
        ascendantRashi: kundaliData.ascendant.name,
        moonRashi: kundaliData.moonSign.name,
        planets: kundaliData.planets,
        dashas: kundaliData.dashas,
        nameInitials: kundaliData.nameInitials,
        chartData: kundaliData.chartData
      });

      await kundali.save();
      console.log("💾 Kundali saved:", kundali._id);
    }

    return res.json({
      success: true,
      message: "Kundali generated successfully",
      data: kundaliData
    });

  } catch (error) {
    console.error("❌ generateKundali error:", error);
    return res.status(500).json({
      message: "Failed to generate kundali",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

// === GET USER'S KUNDALI HISTORY ===
export const getKundaliHistory = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const kundalis = await Kundali.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("name birthDate birthPlace ascendantRashi moonRashi createdAt")
      .lean();

    const formatted = kundalis.map(k => ({
      ...k,
      birthDate: k.birthDate.toISOString().split("T")[0],
      createdAt: k.createdAt.toISOString()
    }));

    res.json(formatted);
  } catch (err) {
    console.error("getKundaliHistory error:", err);
    res.status(500).json({ error: err.message });
  }
};

// === GET SINGLE KUNDALI ===
export const getKundali = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const kundali = await Kundali.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!kundali) {
      return res.status(404).json({ message: "Kundali not found" });
    }

    res.json(kundali);
  } catch (err) {
    console.error("getKundali error:", err);
    res.status(500).json({ error: err.message });
  }
};

// === DELETE KUNDALI ===
export const deleteKundali = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const deleted = await Kundali.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Kundali not found" });
    }

    res.json({ message: "Kundali deleted successfully" });
  } catch (err) {
    console.error("deleteKundali error:", err);
    res.status(500).json({ error: err.message });
  }
};
