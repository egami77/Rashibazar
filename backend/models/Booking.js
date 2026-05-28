// backend/models/Booking.js
import mongoose from "mongoose";

// Function to generate booking ID
function generateBookingId() {
  return 'BOOK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

const bookingSchema = new mongoose.Schema({
  bookingId: { 
    type: String, 
    required: true, 
    unique: true,
    default: generateBookingId  // Generate by default
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  amount: { type: Number, required: true },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['pay_on_visit', 'khalti'],
    default: 'pay_on_visit'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  // Khalti payment fields
  khaltiPaymentId: { type: String }, // pidx from Khalti
  khaltiTransactionId: { type: String },
  khaltiPaymentUrl: { type: String },
  khaltiExpiresAt: { type: Date },
  khaltiStatus: {
    type: String,
    enum: ['initiated', 'completed', 'expired', 'failed'],
  },
  consultationType: {
    type: String,
    enum: ['kundali', 'horoscope', 'compatibility', 'general'],
    default: 'general'
  },
  notes: { type: String, maxlength: 500 },
  birthDetails: {
    name: String,
    date: Date,
    time: String,
    place: String,
    district: String,
    gender: String
  },
  cancellationReason: { type: String },
  completedAt: { type: Date },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, default: "" },
    ratedAt: { type: Date },
  },
  createdAt: { type: Date, default: Date.now }
});

// Ensure bookingId is generated on save if not already set
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = generateBookingId();
  }
  next();
});

export default mongoose.model("Booking", bookingSchema);