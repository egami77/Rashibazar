// backend/models/Astrologer.js
import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: Number, min: 0, default: 0 },
  pricing: {
    perSession: { type: Number, default: 0 }
  },
  bio: { type: String, maxlength: 500, default: "" },
  profileImage: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  meetingLink: { type: String, default: "" },
  isActive: { type: Boolean, default: false },
  totalEarnings: { type: Number, default: 0 },
  monthlyEarnings: { type: Number, default: 0 },
  completedSessions: { type: Number, default: 0 },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

export default mongoose.model("Astrologer", astrologerSchema);