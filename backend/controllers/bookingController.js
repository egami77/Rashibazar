// backend/controllers/bookingController.js
import Booking from "../models/Booking.js";
import Astrologer from "../models/Astrologer.js";
import User from "../models/User.js";

// Create a new booking (User only)
export const createBooking = async (req, res) => {
  try {
    console.log("📝 Booking request received:", req.body);
    
    const { astrologerId, date, time, paymentMethod, notes } = req.body;
    const userId = req.userId; // From auth middleware (user ID)
    
    // Validate required fields
    if (!astrologerId || !date || !time || !paymentMethod) {
      console.error("❌ Missing required fields:", { astrologerId, date, time, paymentMethod });
      return res.status(400).json({ message: "Missing required fields: astrologerId, date, time, paymentMethod" });
    }
    
    console.log(`🔍 Validating astrologer: ${astrologerId}`);
    
    // Check if astrologer exists and is approved
    const astrologer = await Astrologer.findOne({ 
      _id: astrologerId, 
      approvalStatus: 'approved',
      isActive: true 
    });
    
    if (!astrologer) {
      console.error("❌ Astrologer not found or not available:", astrologerId);
      return res.status(404).json({ message: "Astrologer not found or not available" });
    }
    
    console.log(`✅ Astrologer found: ${astrologer.name}, Pricing: Npr${astrologer.pricing.perSession}`);
    
    // Parse date properly
    let bookingDate;
    try {
      // If date is YYYY-MM-DD format, add T00:00:00Z for proper UTC parsing
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        bookingDate = new Date(date + 'T00:00:00Z');
      } else {
        bookingDate = new Date(date);
      }
      
      if (isNaN(bookingDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      console.log(`📅 Booking date: ${bookingDate.toISOString()}`);
    } catch (dateError) {
      console.error("❌ Date parsing error:", dateError);
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }
    
    // Check if slot is already booked
    console.log(`🔍 Checking for existing bookings on ${bookingDate.toISOString()} at ${time}`);
    
    const existingBooking = await Booking.findOne({
      astrologerId,
      date: {
        $gte: new Date(bookingDate.toISOString().split('T')[0] + 'T00:00:00Z'),
        $lt: new Date(bookingDate.toISOString().split('T')[0] + 'T23:59:59Z')
      },
      time,
      bookingStatus: { $in: ['pending', 'confirmed'] }
    });
    
    if (existingBooking) {
      console.error("❌ Time slot already booked");
      return res.status(400).json({ message: "This time slot is already booked" });
    }
    
    console.log("✅ Slot is available. Creating booking...");
    
    // Create booking
    const booking = new Booking({
      userId,
      astrologerId,
      date: bookingDate,
      time,
      amount: astrologer.pricing.perSession,
      paymentMethod: paymentMethod || 'pay_on_visit',
      notes: notes || '',
      bookingStatus: 'pending',
      paymentStatus: 'pending'
    });
    
    console.log("💾 Saving booking to database...");
    await booking.save();
    
    console.log("✅ Booking saved successfully. Populating details...");
    
    // Populate user and astrologer details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('astrologerId', 'name email');
    
    console.log("✅ Booking created successfully:", populatedBooking);
    
    res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("❌ createBooking error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
};

const recalculateAstrologerRating = async (astrologerId) => {
  const ratedBookings = await Booking.find({
    astrologerId,
    "rating.score": { $exists: true, $ne: null },
  }).select("rating.score");

  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) return;

  if (ratedBookings.length === 0) {
    astrologer.rating = 0;
    astrologer.totalReviews = 0;
  } else {
    const total = ratedBookings.reduce((sum, b) => sum + b.rating.score, 0);
    astrologer.rating = Math.round((total / ratedBookings.length) * 10) / 10;
    astrologer.totalReviews = ratedBookings.length;
  }

  await astrologer.save();
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.userId;

    const bookings = await Booking.find({ userId })
      .populate(
        "astrologerId",
        "name email profileImage experience rating totalReviews pricing location"
      )
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("getUserBookings error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single booking details (booking token)
export const getUserBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: id, userId })
      .populate(
        "astrologerId",
        "name email phone profileImage experience rating totalReviews pricing location"
      );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("getUserBookingById error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Rate astrologer after completed consultation
export const rateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comment } = req.body;
    const userId = req.userId;

    const ratingScore = Number(score);
    if (!ratingScore || ratingScore < 1 || ratingScore > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.bookingStatus !== "completed") {
      return res.status(400).json({ message: "You can only rate completed consultations" });
    }

    if (booking.rating?.score) {
      return res.status(400).json({ message: "You have already rated this consultation" });
    }

    booking.rating = {
      score: ratingScore,
      comment: comment?.trim() || "",
      ratedAt: new Date(),
    };
    await booking.save();

    await recalculateAstrologerRating(booking.astrologerId);

    const updated = await Booking.findById(booking._id).populate(
      "astrologerId",
      "name rating totalReviews location pricing"
    );

    res.json({
      message: "Thank you for your rating",
      booking: updated,
    });
  } catch (error) {
    console.error("rateBooking error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get astrologer's bookings
export const getAstrologerBookings = async (req, res) => {
  try {
    const astrologerId = req.userId;
    
    const bookings = await Booking.find({ astrologerId })
      .populate('userId', 'name email phone')
      .sort({ date: -1, time: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error("getAstrologerBookings error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update booking status (for astrologers)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const astrologerId = req.userId;
    
    const booking = await Booking.findOne({ _id: id, astrologerId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Handle payment status updates (for pay on visit)
    if (status === 'payment_received') {
      booking.paymentStatus = 'paid';
    } else if (status === 'payment_pending') {
      booking.paymentStatus = 'pending';
    } else {
      // Handle booking status updates
      booking.bookingStatus = status;
      if (reason) booking.cancellationReason = reason;

      if (status === "completed") {
        booking.completedAt = new Date();
        if (booking.paymentMethod === "pay_on_visit") {
          booking.paymentStatus = "paid";
        }
      }
    }

    // If booking is completed, update astrologer earnings
    if (status === "completed" && booking.paymentStatus === "paid") {
      const astrologer = await Astrologer.findById(astrologerId);
      if (astrologer) {
        astrologer.totalEarnings = (astrologer.totalEarnings || 0) + booking.amount;
        astrologer.monthlyEarnings = (astrologer.monthlyEarnings || 0) + booking.amount;
        astrologer.completedSessions = (astrologer.completedSessions || 0) + 1;
        await astrologer.save();
      }
    }
    
    await booking.save();
    
    res.json({
      message: `Booking updated successfully`,
      booking
    });
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Cancel booking (for users)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.userId;
    
    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }
    
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();
    
    res.json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error) {
    console.error("cancelBooking error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;
    const userId = req.userId;
    
    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    booking.paymentStatus = paymentStatus;
    if (transactionId) booking.transactionId = transactionId;
    await booking.save();
    
    res.json({
      message: "Payment status updated successfully",
      booking
    });
  } catch (error) {
    console.error("updatePaymentStatus error:", error);
    res.status(500).json({ error: error.message });
  }
};