// backend/models/Availability.js
import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  astrologerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Astrologer',
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
    enum: [0, 1, 2, 3, 4, 5, 6] // 0 = Sunday, 6 = Saturday
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  slotDuration: {
    type: Number,
    required: true,
    min: 15,
    max: 120,
    default: 30
  },
  isRecurring: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index to prevent duplicate slots on same day/time
availabilitySchema.index({ astrologerId: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

export default mongoose.model("Availability", availabilitySchema);