// backend/controllers/astrologerController.js
import Astrologer from "../models/Astrologer.js";
import Availability from "../models/Availability.js";
import Booking from "../models/Booking.js";
import { startOfDay, endOfDay, addDays, parseISO, format } from 'date-fns';

// Get approved astrologers for listing (users can see only approved)
export const getApprovedAstrologers = async (req, res) => {
  try {
    const astrologers = await Astrologer.find({ 
      approvalStatus: 'approved',
      isActive: true 
    })
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .lean();

    res.json(astrologers);
  } catch (err) {
    console.error("getApprovedAstrologers error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single astrologer profile
export const getAstrologerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const astrologer = await Astrologer.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean();

    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    res.json(astrologer);
  } catch (err) {
    console.error("getAstrologerById error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get astrologer availability
export const getAstrologerAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use yyyy-MM-dd" });
    }

    // Get recurring availability slots
    const recurringSlots = await Availability.find({
      astrologerId: id,
      isRecurring: true,
      isActive: true
    });

    console.log(` Fetching availability for astrologer ${id} from ${startDate} to ${endDate}`);
    console.log(` Found ${recurringSlots.length} recurring slots`);

    if (recurringSlots.length === 0) {
      console.log(` No recurring slots found for astrologer ${id}`);
      return res.json({});
    }

    // Get already booked slots
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const bookedSlots = await Booking.find({
      astrologerId: id,
      date: { $gte: start, $lte: end },
      bookingStatus: { $in: ['pending', 'confirmed'] },
      $or: [
        { paymentMethod: { $ne: 'khalti' } },
        { paymentMethod: 'khalti', paymentStatus: 'paid' },
        { paymentMethod: 'khalti', paymentStatus: 'pending', createdAt: { $gt: fifteenMinsAgo } }
      ]
    });

    console.log(` Found ${bookedSlots.length} booked slots`);

    // Generate available slots for each day
    const availability = {};
    let currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);
    const endDate_obj = new Date(end);
    endDate_obj.setHours(23, 59, 59, 999);

    while (currentDate <= endDate_obj) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Get slots for this day of week
      const daySlots = recurringSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
      
      // Generate time slots
      const slots = [];
      
      for (const slot of daySlots) {
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        
        let currentSlotTime = new Date(currentDate);
        currentSlotTime.setHours(startHour, startMin, 0, 0);
        
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHour, endMin, 0, 0);
        
        // Generate individual time slots
        while (currentSlotTime < slotEnd) {
          const slotTimeStr = format(currentSlotTime, 'HH:mm');
          
          // Check if slot is already booked
          const isBooked = bookedSlots.some(booking => 
            format(booking.date, 'yyyy-MM-dd') === dateStr && 
            booking.time === slotTimeStr
          );
          
          if (!isBooked) {
            slots.push(slotTimeStr);
          }
          
          // Add slot duration in milliseconds
          currentSlotTime = new Date(currentSlotTime.getTime() + slot.slotDuration * 60000);
        }
      }
      
      if (slots.length > 0) {
        availability[dateStr] = slots;
        console.log(`  ${dateStr} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayOfWeek]}): ${slots.length} slots available`);
      }
      
      currentDate = addDays(currentDate, 1);
    }

    console.log(`  Availability generation complete: ${Object.keys(availability).length} days with slots`);
    res.json(availability);
  } catch (err) {
    console.error("getAstrologerAvailability error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get astrologer dashboard data
export const getAstrologerDashboard = async (req, res) => {
  try {
    const astrologerId = req.userId;
    
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer profile not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get bookings
    const [totalBookings, upcomingSessions, completedSessions, earnings] = await Promise.all([
      Booking.countDocuments({ astrologerId }),
      Booking.countDocuments({ 
        astrologerId,
        date: { $gte: today },
        bookingStatus: { $in: ['pending', 'confirmed'] }
      }),
      Booking.countDocuments({ 
        astrologerId,
        bookingStatus: 'completed'
      }),
      Booking.aggregate([
        { 
          $match: { 
            astrologerId: astrologer._id,
            paymentStatus: 'paid',
            bookingStatus: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find({ astrologerId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();

    res.json({
      profile: {
        name: astrologer.name,
        email: astrologer.email,
        phone: astrologer.phone,
        experience: astrologer.experience ?? 0,
        pricing: astrologer.pricing || { perSession: 0 },
        bio: astrologer.bio || "",
        profileImage: astrologer.profileImage || "",
        meetingLink: astrologer.meetingLink || "",
        location: astrologer.location || { address: "", city: "", district: "", landmark: "" },
        pendingProfile: astrologer.pendingProfile || { status: "none" },
        canUpdateHoroscope: astrologer.canUpdateHoroscope || false,
      },
      stats: {
        totalBookings,
        upcomingSessions,
        completedSessions,
        totalEarnings: earnings[0]?.total || 0,
        monthlyEarnings: astrologer.monthlyEarnings || 0,
        rating: astrologer.rating || 0,
        totalReviews: astrologer.totalReviews || 0,
        meetingLink: astrologer.meetingLink || ""
      },
      recentBookings: recentBookings.map(booking => {
        const bookingObj = {
          id: booking._id?.toString(),
          _id: booking._id?.toString(),
          userName: booking.userId?.name || 'Unknown',
          userEmail: booking.userId?.email || '',
          userPhone: booking.userId?.phone || '',
          date: booking.date,
          time: booking.time,
          amount: booking.amount,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          consultationType: booking.consultationType,
          paymentMethod: booking.paymentMethod,
          notes: booking.notes,
          birthDetails: booking.birthDetails
        };
        console.log(' Booking object:', { id: bookingObj.id, bookingId: booking._id, status: booking.bookingStatus });
        return bookingObj;
      })
    });
  } catch (err) {
    console.error("getAstrologerDashboard error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update astrologer profile (submitted for admin approval)
export const updateAstrologerProfile = async (req, res) => {
  try {
    const astrologerId = req.userId;

    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer profile not found" });
    }

    const changes = {
      name: astrologer.name,
      phone: astrologer.phone,
      experience: astrologer.experience ?? 0,
      pricing: { perSession: astrologer.pricing?.perSession ?? 0 },
      bio: astrologer.bio || "",
      location: {
        address: astrologer.location?.address || "",
        city: astrologer.location?.city || "",
        district: astrologer.location?.district || "",
        landmark: astrologer.location?.landmark || "",
      },
    };

    if (req.body.name?.trim()) changes.name = req.body.name.trim();
    if (req.body.phone?.trim()) changes.phone = req.body.phone.trim();

    if (req.body.experience !== undefined) {
      const experience = Number(req.body.experience);
      if (!Number.isNaN(experience) && experience >= 0) changes.experience = experience;
    }

    if (req.body.pricing?.perSession !== undefined) {
      const perSession = Number(req.body.pricing.perSession);
      if (!Number.isNaN(perSession) && perSession >= 0) {
        changes.pricing = { perSession };
      }
    }

    if (req.body.bio !== undefined) changes.bio = String(req.body.bio).trim();

    if (req.body.location) {
      changes.location = {
        address: String(req.body.location.address || "").trim(),
        city: String(req.body.location.city || "").trim(),
        district: String(req.body.location.district || "").trim(),
        landmark: String(req.body.location.landmark || "").trim(),
      };
    }

    astrologer.pendingProfile = {
      status: "pending",
      submittedAt: new Date(),
      rejectionReason: "",
      changes,
    };

    await astrologer.save();

    res.json({
      message: "Profile changes submitted for admin approval.",
      pendingProfile: astrologer.pendingProfile,
    });
  } catch (err) {
    console.error("updateAstrologerProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add availability
export const addAvailability = async (req, res) => {
  try {
    const astrologerId = req.userId;
    
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer profile not found" });
    }

    const { dayOfWeek, startTime, endTime, slotDuration, isRecurring } = req.body;

    console.log(' Received availability request:', { dayOfWeek, startTime, endTime, slotDuration, isRecurring });

    // Validate all fields
    if (dayOfWeek === undefined || dayOfWeek === null || dayOfWeek === '') {
      return res.status(400).json({ message: "Day of week is required" });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Start time and end time are required" });
    }

    // Validate dayOfWeek is 0-6 FIRST
    const dayInt = parseInt(dayOfWeek);
    if (isNaN(dayInt) || dayInt < 0 || dayInt > 6) {
      return res.status(400).json({ message: `Day of week must be 0-6 (Sunday-Saturday), got: ${dayOfWeek}` });
    }

    console.log(`   Day: ${dayInt} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayInt]})`);

    // Validate time format HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime)) {
      return res.status(400).json({ message: `Invalid start time format: "${startTime}". Use HH:MM (e.g., 09:00, 17:30)` });
    }
    if (!timeRegex.test(endTime)) {
      return res.status(400).json({ message: `Invalid end time format: "${endTime}". Use HH:MM (e.g., 09:00, 17:30)` });
    }

    // Validate start time < end time
    if (startTime >= endTime) {
      return res.status(400).json({ message: "End time must be after start time" });
    }
    
    // Check if slot already exists
    const existing = await Availability.findOne({
      astrologerId,
      dayOfWeek: dayInt,
      startTime
    });

    if (existing) {
      console.log(`\n FOUND EXISTING SLOT:`);
      console.log(`   Day: ${existing.dayOfWeek} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][existing.dayOfWeek]})`);
      console.log(`   Time: ${existing.startTime}-${existing.endTime}`);
      console.log(`   Trying to add: ${dayInt} ${startTime}-${endTime}`);
      
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayInt];
      console.log(`   Duplicate slot found: ${dayName} ${startTime}-${existing.endTime}`);
      return res.status(400).json({ 
        message: `Slot already exists for ${dayName} at ${startTime}. Delete it first if you want to modify it.`
      });
    }
    
    console.log(`  No duplicate found. Proceeding to create slot for day ${dayInt} ${startTime}-${endTime}`);

    const availability = new Availability({
      astrologerId,
      dayOfWeek: dayInt,
      startTime,
      endTime,
      slotDuration: parseInt(slotDuration) || 30,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      isActive: true
    });

    await availability.save();
    
    console.log(`  Availability added for astrologer ${astrologerId}: ${dayInt} ${startTime}-${endTime}`);

    res.status(201).json({ 
      message: "Availability added successfully",
      availability 
    });
  } catch (err) {
    console.error("addAvailability error:", err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === 'date') {
        return res.status(500).json({ 
          error: "Database error: Old index needs to be dropped. Contact admin to run: db.availabilities.dropIndex('astrologerId_1_date_1')" 
        });
      }
      return res.status(400).json({ 
        error: "Slot already exists for this day and time" 
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: err.message });
  }
};

// Get astrologer's own availability
export const getMyAvailability = async (req, res) => {
  try {
    const astrologerId = req.userId;
    
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer profile not found" });
    }

    const availability = await Availability.find({ 
      astrologerId,
      isActive: true 
    }).sort({ dayOfWeek: 1, startTime: 1 });

    console.log(`   Astrologer ${astrologerId} has ${availability.length} slots:`);
    availability.forEach(slot => {
      console.log(`   - Day ${slot.dayOfWeek} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][slot.dayOfWeek]}): ${slot.startTime}-${slot.endTime} (${slot.slotDuration}min)`);
    });

    res.json(availability);
  } catch (err) {
    console.error("getMyAvailability error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete availability
export const deleteAvailability = async (req, res) => {
  try {
    const astrologerId = req.userId;
    const { id } = req.params;

    const availability = await Availability.findOneAndDelete({
      _id: id,
      astrologerId
    });

    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    res.json({ message: "Availability deleted successfully" });
  } catch (err) {
    console.error("deleteAvailability error:", err);
    res.status(500).json({ error: err.message });
  }
};