// backend/models/Kundali.js
import mongoose from "mongoose";

const kundaliSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  birthDate: { type: Date, required: true },
  birthTime: { type: String, required: true },
  birthPlace: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  gender: { type: String },
  
  // Kundali Results
  ascendant: { type: String },
  ascendantRashi: { type: String },
  moonRashi: { type: String },
  planets: [{
    name: String,
    rashi: String,
    degree: String,
    nakshatra: String,
    pada: Number,
    house: Number,
    retrograde: Boolean,
    navamsaRashi: String
  }],
  dashas: [{
    planet: String,
    period: String,
    isCurrent: Boolean
  }],
  nameInitials: [String],
  chartData: { type: Object }
}, { timestamps: true });

export default mongoose.model("Kundali", kundaliSchema);