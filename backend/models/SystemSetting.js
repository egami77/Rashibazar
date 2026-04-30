// backend/models/SystemSetting.js
import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

systemSettingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("SystemSetting", systemSettingSchema);
