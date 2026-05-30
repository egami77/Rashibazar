// backend/models/Compatibility.js
import mongoose from "mongoose";

const compatibilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner1: {
    name: { type: String, required: true },
    birthDate: { type: Date, required: true },
    birthTime: { type: String, required: true },
    district: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    rashi: { type: String },
    nakshatra: { type: String },
    pada: { type: Number },
    mangalDosha: { type: Boolean }
  },
  partner2: {
    name: { type: String, required: true },
    birthDate: { type: Date, required: true },
    birthTime: { type: String, required: true },
    district: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    rashi: { type: String },
    nakshatra: { type: String },
    pada: { type: Number },
    mangalDosha: { type: Boolean }
  },
  score: { type: Number, required: true },
  maxScore: { type: Number, default: 36 },
  percentage: { type: Number },
  verdict: { type: String },
  verdictColor: { type: String },
  koots: [{
    name: String,
    obtained: Number,
    maximum: Number,
    detail: String
  }],
  doshas: [{
    name: String,
    description: String,
    severity: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Compatibility", compatibilitySchema);
