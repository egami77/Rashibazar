
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

// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to convert minutes to time string
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper function to check if two time ranges overlap
function isOverlapping(start1, end1, start2, end2) {
  return (start1 < end2 && end1 > start2);
}

// Pre-save middleware to validate time slot
availabilitySchema.pre('save', function(next) {
  const startMinutes = timeToMinutes(this.startTime);
  const endMinutes = timeToMinutes(this.endTime);
  const actualDuration = endMinutes - startMinutes;
  
  // Validate end time is after start time
  if (endMinutes <= startMinutes) {
    return next(new Error('End time must be after start time'));
  }
  
  // Validate duration is divisible by 30 (30, 60, 90, 120 minutes)
  if (actualDuration % 30 !== 0) {
    return next(new Error('Time duration must be divisible by 30 minutes (30, 60, 90, or 120 minutes)'));
  }
  
  // Validate duration is between 30 and 120 minutes
  if (actualDuration < 30 || actualDuration > 120) {
    return next(new Error('Time duration must be between 30 and 120 minutes'));
  }
  
  // Auto-adjust slotDuration to 30 (since all bookings are 30-minute slots)
  this.slotDuration = 30;
  
  next();
});

// Pre-save middleware to check for overlapping slots
availabilitySchema.pre('save', async function(next) {
  try {
    const startMinutes = timeToMinutes(this.startTime);
    const endMinutes = timeToMinutes(this.endTime);
    
    // Find existing slots for the same astrologer and day
    const existingSlots = await this.constructor.find({
      astrologerId: this.astrologerId,
      dayOfWeek: this.dayOfWeek,
      isActive: true,
      _id: { $ne: this._id }
    });
    
    // Check for overlap with existing slots
    for (const slot of existingSlots) {
      const existingStart = timeToMinutes(slot.startTime);
      const existingEnd = timeToMinutes(slot.endTime);
      
      if (isOverlapping(startMinutes, endMinutes, existingStart, existingEnd)) {
        return next(new Error(
          `Time slot ${this.startTime}-${this.endTime} overlaps with existing availability slot ${slot.startTime}-${slot.endTime}`
        ));
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to generate 30-minute booking slots from availability
availabilitySchema.statics.getBookingSlots = function(startTime, endTime) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const slots = [];
  
  // Generate 30-minute slots
  for (let slotStart = startMinutes; slotStart + 30 <= endMinutes; slotStart += 30) {
    const slotEnd = slotStart + 30;
    slots.push({
      startTime: minutesToTime(slotStart),
      endTime: minutesToTime(slotEnd),
      duration: 30
    });
  }
  
  return slots;
};

// Static method to get all available time slots for a date
availabilitySchema.statics.getAvailableSlotsForDate = async function(astrologerId, date, bookedSlots = []) {
  const dayOfWeek = new Date(date).getDay();
  
  // Get all availabilities for this day
  const availabilities = await this.find({
    astrologerId,
    dayOfWeek,
    isActive: true
  });
  
  if (!availabilities.length) {
    return [];
  }
  
  // Generate all possible 30-minute slots from all availabilities
  let allSlots = [];
  for (const availability of availabilities) {
    const slots = this.getBookingSlots(availability.startTime, availability.endTime);
    allSlots.push(...slots);
  }
  
  // Filter out booked slots
  const availableSlots = allSlots.filter(slot => {
    return !bookedSlots.some(booked => booked.time === slot.startTime);
  });
  
  return availableSlots;
};

// Compound index to prevent duplicate slots on same day/time
availabilitySchema.index({ astrologerId: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

// Index for faster overlap queries
availabilitySchema.index({ astrologerId: 1, dayOfWeek: 1, isActive: 1 });

export default mongoose.model("Availability", availabilitySchema);