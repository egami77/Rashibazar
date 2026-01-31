// backend/models/Horoscope.js
import mongoose from "mongoose";

const horoscopeSchema = new mongoose.Schema({
  rashi: {
    type: String,
    required: true,
    enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
           'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  },
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  prediction: {
    type: String,
    required: true
  },
  luckyNumber: {
    type: Number,
    min: 1,
    max: 99
  },
  luckyColor: String,
  compatibility: String,
  advice: String,
  additionalInfo: {
    element: String,
    rulingPlanet: String,
    quality: String,
    bestTime: String,
    favorableDirection: String
  },
  categoryPredictions: {
    career: String,
    love: String,
    health: String,
    finance: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
horoscopeSchema.index({ rashi: 1, period: 1, date: 1 });
horoscopeSchema.index({ date: 1, period: 1 });

horoscopeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Horoscope", horoscopeSchema);