// backend/models/Announcement.js
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  // 'all' | 'users' | 'astrologers'
  target: {
    type: String,
    enum: ['all', 'users', 'astrologers'],
    default: 'all',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Announcement", announcementSchema);
