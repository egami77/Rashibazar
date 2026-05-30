// backend/controllers/kundaliController.js
import Kundali from "../models/Kundali.js";
import Compatibility from "../models/Compatibility.js";
import { calculateKundali } from "../utils/kundaliCalculator.js";
import { generateKundaliEngine, calculateGunaMilan } from "../utils/vedicEngine.js";

// === GENERATE KUNDALI ===
export const generateKundali = async (req, res) => {
  try {
    console.log(" Received kundali request:", req.body);
    console.log(" User ID:", req.userId || "Guest");

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

    console.log("   Parsed birth date:", parsedBirthDate);
    console.log("   Birth time:", birthTime);

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

    console.log("   Kundali calculated successfully");

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
        birthDetails: kundaliData.birthDetails,
        ascendant: kundaliData.ascendant.name,
        ascendantRashi: kundaliData.ascendant.name,
        moonRashi: kundaliData.moonSign.name,
        planets: kundaliData.planets,
        dashas: kundaliData.dashas,
        nameInitials: kundaliData.nameInitials,
        chartData: kundaliData.chartData
      });

      await kundali.save();
      console.log(" Kundali saved:", kundali._id);
    }

    return res.json({
      success: true,
      message: "Kundali generated successfully",
      data: kundaliData
    });

  } catch (error) {
    console.error("   generateKundali error:", error);
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

export const checkCompatibility = async (req, res) => {
  try {
    const { partner1, partner2, save = false } = req.body;
    const processPartner = (p) => {
      const birth = new Date(p.birthDate);
      const [h, m] = p.birthTime.split(':').map(Number);
      birth.setUTCHours(h, m, 0, 0);
      return generateKundaliEngine({
        birthUtc: new Date(birth.getTime() - (5.75 * 60 * 60 * 1000)),
        latitude: p.latitude || 27.7,
        longitude: p.longitude || 85.3,
      });
    };
    const astro1 = processPartner(partner1);
    const astro2 = processPartner(partner2);
    const matchingResult = calculateGunaMilan(astro1, astro2);
    const checkMangal = (a) => {
      const h = [1, 4, 7, 8, 12];
      const mL = a.planets.find(p => p.key === "Mars").house;
      const mR = a.moonRashi, maR = a.planets.find(p => p.key === "Mars").rashi;
      const mM = ((maR - mR + 12) % 12) + 1;
      return h.includes(mL) || h.includes(mM);
    };
    let verdict = "Challenging Match 🔴", vColor = "text-red-400";
    const s = matchingResult.totalObtained;
    if (s >= 28) { verdict = "Excellent Match! "; vColor = "text-green-400"; }
    else if (s >= 21) { verdict = "Good Match "; vColor = "text-yellow-400"; }
    else if (s >= 18) { verdict = "Average Match "; vColor = "text-orange-400"; }
    
    const responseData = {
      score: s, maxScore: 36, percentage: matchingResult.percentage,
      verdict, verdictColor: vColor, koots: matchingResult.koots,
      partner1: { name: partner1.name, rashi: astro1.moonRashi, nakshatra: astro1.moonNakshatra, pada: astro1.planets[1].pada, mangalDosha: checkMangal(astro1) },
      partner2: { name: partner2.name, rashi: astro2.moonRashi, nakshatra: astro2.moonNakshatra, pada: astro2.planets[1].pada, mangalDosha: checkMangal(astro2) },
      doshas: matchingResult.doshas
    };

    // Save if user is logged in and save flag is true
    if (req.userId && save) {
      const compatibility = new Compatibility({
        userId: req.userId,
        partner1: {
          name: partner1.name,
          birthDate: partner1.birthDate,
          birthTime: partner1.birthTime,
          district: partner1.district,
          latitude: partner1.latitude,
          longitude: partner1.longitude,
          rashi: astro1.moonRashi,
          nakshatra: astro1.moonNakshatra,
          pada: astro1.planets[1].pada,
          mangalDosha: checkMangal(astro1)
        },
        partner2: {
          name: partner2.name,
          birthDate: partner2.birthDate,
          birthTime: partner2.birthTime,
          district: partner2.district,
          latitude: partner2.latitude,
          longitude: partner2.longitude,
          rashi: astro2.moonRashi,
          nakshatra: astro2.moonNakshatra,
          pada: astro2.planets[1].pada,
          mangalDosha: checkMangal(astro2)
        },
        score: s,
        maxScore: 36,
        percentage: matchingResult.percentage,
        verdict,
        verdictColor: vColor,
        koots: matchingResult.koots,
        doshas: matchingResult.doshas
      });

      await compatibility.save();
      console.log(" Compatibility saved:", compatibility._id);
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Compatibility error", error: error.message });
  }
};

// === GET COMPATIBILITY HISTORY ===
export const getCompatibilityHistory = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const history = await Compatibility.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      message: "Compatibility history retrieved",
      data: history
    });
  } catch (error) {
    console.error("   getCompatibilityHistory error:", error);
    res.status(500).json({
      message: "Failed to retrieve compatibility history",
      error: error.message
    });
  }
};

// === DELETE COMPATIBILITY ===
export const deleteCompatibility = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const compatibility = await Compatibility.findById(id);

    if (!compatibility) {
      return res.status(404).json({ message: "Compatibility record not found" });
    }

    if (compatibility.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this record" });
    }

    await Compatibility.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Compatibility record deleted"
    });
  } catch (error) {
    console.error("   deleteCompatibility error:", error);
    res.status(500).json({
      message: "Failed to delete compatibility record",
      error: error.message
    });
  }
};
