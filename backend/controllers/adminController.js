// backend/controllers/adminController.js
import User from "../models/User.js";
import Astrologer from "../models/Astrologer.js";
import Booking from "../models/Booking.js";

// Get all astrologers for admin
export const getAllAstrologers = async (req, res) => {
  try {
    const astrologers = await Astrologer.find()
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });
    
    res.json(astrologers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending astrologers
export const getPendingAstrologers = async (req, res) => {
  try {
    const pendingAstrologers = await Astrologer.find({ approvalStatus: 'pending' })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });
    
    res.json(pendingAstrologers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get approved astrologers (for users to book)
export const getApprovedAstrologers = async (req, res) => {
  try {
    const approvedAstrologers = await Astrologer.find({ 
      approvalStatus: 'approved',
      isActive: true 
    }).select('-password -resetPasswordToken -resetPasswordExpire');
    
    res.json(approvedAstrologers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve/reject astrologer
export const updateAstrologerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    
    const astrologer = await Astrologer.findById(id);
    if (!astrologer) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }
    
    astrologer.approvalStatus = status;
    astrologer.isActive = status === 'approved';
    await astrologer.save();
    
    res.json({ 
      message: `Astrologer ${status} successfully`,
      astrologer 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('astrologerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAstrologers = await Astrologer.countDocuments();
    const pendingAstrologers = await Astrologer.countDocuments({ approvalStatus: 'pending' });
    const approvedAstrologers = await Astrologer.countDocuments({ approvalStatus: 'approved' });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'completed' });
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', bookingStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name')
      .populate('astrologerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      stats: {
        totalUsers,
        totalAstrologers,
        pendingAstrologers,
        approvedAstrologers,
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete astrologer
export const deleteAstrologer = async (req, res) => {
  try {
    const { id } = req.params;
    await Astrologer.findByIdAndDelete(id);
    res.json({ message: 'Astrologer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};