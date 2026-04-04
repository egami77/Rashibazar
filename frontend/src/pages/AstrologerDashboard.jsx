// src/pages/AstrologerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, DollarSign, Users, Star, 
  CalendarDays, CheckCircle, XCircle, Clock3,
  Edit, Trash2, Plus, Download, BarChart3,
  Phone, MessageCircle, Video, Loader2, RefreshCw,
  Sparkles, X
} from 'lucide-react';
import { 
  getAstrologerDashboard, 
  getMyAvailability, 
  addAvailability, 
  deleteAvailability,
  getAstrologerBookings,
  updateBookingStatus
} from '../services/booking';
import { 
  updateHoroscope,
  getAstrologerHoroscopes,
  deleteHoroscope as deleteHoroscopeService,
  getAllRashis
} from '../services/horoscope';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const AstrologerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    slotDuration: 30
  });
  const [error, setError] = useState('');
  
  // Horoscope state
  const [horoscopes, setHoroscopes] = useState([]);
  const [rashis, setRashis] = useState([]);
  const [showAddHoroscope, setShowAddHoroscope] = useState(false);
  const [editingHoroscope, setEditingHoroscope] = useState(null);
  const [activePeriodTab, setActivePeriodTab] = useState('daily');
  const [horoscopeForm, setHoroscopeForm] = useState({
    rashi: '',
    period: 'daily',
    date: new Date().toISOString().split('T')[0],
    prediction: '',
    advice: '',
    luckyNumber: '',
    luckyColor: '',
    compatibility: '',
    categoryPredictions: {
      career: '',
      love: '',
      health: '',
      finance: ''
    },
    additionalInfo: {
      element: '',
      rulingPlanet: '',
      quality: '',
      bestTime: '',
      favorableDirection: ''
    }
  });
  const [horoscopeError, setHoroscopeError] = useState('');

  // Calculate monthly earnings from completed and paid bookings
  const calculateMonthlyEarnings = () => {
    if (!bookings || bookings.length === 0) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.date);
        return (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear &&
          booking.bookingStatus === 'completed' &&
          booking.paymentStatus === 'paid'
        );
      })
      .reduce((sum, booking) => sum + booking.amount, 0);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, availabilityRes, bookingsRes, horoscopesRes, rashisRes] = await Promise.all([
        getAstrologerDashboard(),
        getMyAvailability(),
        getAstrologerBookings(),
        getAstrologerHoroscopes(),
        getAllRashis()
      ]);
      
      setDashboardData(dashboardRes.data);
      setAvailability(availabilityRes.data);
      setBookings(bookingsRes.data);
      setHoroscopes(horoscopesRes.data);
      setRashis(rashisRes.rashis);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!slotForm.dayOfWeek) {
      setError("Please select a day of week");
      return;
    }

    if (!slotForm.startTime || !slotForm.endTime) {
      setError("Both start and end time are required");
      return;
    }

    if (slotForm.startTime >= slotForm.endTime) {
      setError("End time must be after start time");
      return;
    }

    try {
      const payload = {
        dayOfWeek: parseInt(slotForm.dayOfWeek),
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        slotDuration: parseInt(slotForm.slotDuration)
      };
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      console.log('📝 FORM DATA:');
      console.log(`   Day: ${dayNames[payload.dayOfWeek]} (${payload.dayOfWeek})`);
      console.log(`   Time: ${payload.startTime} - ${payload.endTime}`);
      console.log(`   Duration: ${payload.slotDuration} min`);
      console.log('📤 Sending payload:', payload);
      
      await addAvailability(payload);
      toast.success("✅ Slot added successfully! Users can now book this time.");
      setShowAddSlot(false);
      setSlotForm({ dayOfWeek: '', startTime: '', endTime: '', slotDuration: 30 });
      setError('');
      loadDashboardData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to add slot";
      console.error('❌ addAvailability error:', errorMsg);
      console.error('Full error:', error.response?.data);
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    
    try {
      await deleteAvailability(id);
      toast.success("✅ Slot deleted successfully");
      loadDashboardData();
    } catch (error) {
      console.error('Delete availability error:', error);
      toast.error(error.response?.data?.message || "Failed to delete slot");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status, reason = null) => {
    console.log('🔄 handleUpdateBookingStatus called:', { bookingId, status, reason });
    
    if (!bookingId) {
      console.error('❌ bookingId is missing or undefined!');
      toast.error('Error: Booking ID is missing');
      return;
    }

    try {
      // Handle payment status updates
      if (status === 'payment_received' || status === 'payment_pending') {
        await updateBookingStatus(bookingId, status, reason);
        const statusText = status === 'payment_received' ? 'Payment marked as received' : 'Payment marked as pending';
        toast.success(`✅ ${statusText}`);
      } else {
        await updateBookingStatus(bookingId, status, reason);
        toast.success(`✅ Booking ${status} successfully`);
      }
      loadDashboardData();
    } catch (error) {
      toast.error(`Failed to update: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddOrUpdateHoroscope = async (e) => {
    e.preventDefault();
    setHoroscopeError('');

    if (!horoscopeForm.rashi) {
      setHoroscopeError("Please select a rashi");
      return;
    }

    if (!horoscopeForm.prediction || horoscopeForm.prediction.trim().length === 0) {
      setHoroscopeError("Prediction text cannot be empty");
      return;
    }

    try {
      console.log('📝 Submitting horoscope:', horoscopeForm);
      
      const horoscopeData = {
        prediction: horoscopeForm.prediction,
        advice: horoscopeForm.advice,
        luckyNumber: horoscopeForm.luckyNumber ? parseInt(horoscopeForm.luckyNumber) : null,
        luckyColor: horoscopeForm.luckyColor,
        compatibility: horoscopeForm.compatibility,
        categoryPredictions: horoscopeForm.categoryPredictions,
        additionalInfo: horoscopeForm.additionalInfo
      };

      await updateHoroscope(
        horoscopeForm.rashi,
        horoscopeForm.period,
        horoscopeForm.date,
        horoscopeData
      );

      toast.success("✅ Horoscope updated successfully!");
      setShowAddHoroscope(false);
      setEditingHoroscope(null);
      resetHoroscopeForm();
      loadDashboardData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to update horoscope";
      console.error('❌ Error updating horoscope:', errorMsg);
      setHoroscopeError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDeleteHoroscope = async (id) => {
    if (!window.confirm("Are you sure you want to delete this horoscope?")) return;
    
    try {
      await deleteHoroscopeService(id);
      toast.success("✅ Horoscope deleted successfully");
      loadDashboardData();
    } catch (error) {
      console.error('Delete horoscope error:', error);
      toast.error(error.response?.data?.message || "Failed to delete horoscope");
    }
  };

  const handleEditHoroscope = (horoscope) => {
    setEditingHoroscope(horoscope);
    setHoroscopeForm({
      rashi: horoscope.rashi,
      period: horoscope.period,
      date: new Date(horoscope.date).toISOString().split('T')[0],
      prediction: horoscope.prediction,
      advice: horoscope.advice || '',
      luckyNumber: horoscope.luckyNumber || '',
      luckyColor: horoscope.luckyColor || '',
      compatibility: horoscope.compatibility || '',
      categoryPredictions: horoscope.categoryPredictions || {
        career: '',
        love: '',
        health: '',
        finance: ''
      },
      additionalInfo: horoscope.additionalInfo || {
        element: '',
        rulingPlanet: '',
        quality: '',
        bestTime: '',
        favorableDirection: ''
      }
    });
    setShowAddHoroscope(true);
  };

  const handleEditRashi = (rashi, period) => {
    const today = new Date();
    setEditingHoroscope(null);
    setHoroscopeForm({
      rashi,
      period,
      date: today.toISOString().split('T')[0],
      prediction: '',
      advice: '',
      luckyNumber: '',
      luckyColor: '',
      compatibility: '',
      categoryPredictions: {
        career: '',
        love: '',
        health: '',
        finance: ''
      },
      additionalInfo: {
        element: '',
        rulingPlanet: '',
        quality: '',
        bestTime: '',
        favorableDirection: ''
      }
    });
    setShowAddHoroscope(true);
  };

  const getHoroscopeForRashi = (rashi, period) => {
    return horoscopes.find(h => h.rashi === rashi && h.period === period);
  };

  const getRashiSymbol = (rashiName) => {
    const symbols = {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    };
    return symbols[rashiName] || '✦';
  };

  const resetHoroscopeForm = () => {
    setHoroscopeForm({
      rashi: '',
      period: 'daily',
      date: new Date().toISOString().split('T')[0],
      prediction: '',
      advice: '',
      luckyNumber: '',
      luckyColor: '',
      compatibility: '',
      categoryPredictions: {
        career: '',
        love: '',
        health: '',
        finance: ''
      },
      additionalInfo: {
        element: '',
        rulingPlanet: '',
        quality: '',
        bestTime: '',
        favorableDirection: ''
      }
    });
    setEditingHoroscope(null);
  };

  const handleCloseHoroscopeForm = () => {
    setShowAddHoroscope(false);
    setHoroscopeError('');
    resetHoroscopeForm();
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'confirmed': 'bg-green-500/20 text-green-300 border-green-500/30',
      'cancelled': 'bg-red-500/20 text-red-300 border-red-500/30',
      'completed': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'no-show': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return badges[status] || 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  };

  const getConsultationIcon = (type) => {
    switch(type) {
      case 'chat': return <MessageCircle className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white pt-24 px-4 md:px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
            Astrologer Dashboard
          </h1>
          <p className="text-gray-300">Manage your profile, availability, and bookings</p>
        </div>

        {/* Stats Cards */}
        {dashboardData?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-blue-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-400 font-semibold">Total Bookings</div>
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{dashboardData.stats.totalBookings}</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-400 font-semibold">Upcoming</div>
                <Clock3 className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{dashboardData.stats.upcomingSessions}</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-yellow-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-yellow-400 font-semibold">Completed</div>
                <CheckCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">{dashboardData.stats.completedSessions}</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-purple-400 font-semibold">Earnings</div>
                <DollarSign className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">₹{dashboardData.stats.totalEarnings}</div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-purple-500/30 pb-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'availability', label: 'Availability', icon: Calendar },
            { id: 'horoscope', label: 'Horoscope', icon: Sparkles },
            { id: 'bookings', label: 'Bookings', icon: Users },
            { id: 'profile', label: 'Profile', icon: Edit }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black'
                    : 'bg-black/30 border border-purple-500/30 text-gray-300 hover:bg-purple-900/30'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Recent Bookings */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
              <h2 className="text-2xl font-bold mb-6 text-yellow-300">Recent Bookings</h2>
              
              {dashboardData.recentBookings?.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentBookings?.map((booking) => (
                    <div key={booking.id} className="bg-black/50 p-4 rounded-lg border border-purple-500/30">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                            <Users className="h-5 w-5 text-purple-300" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{booking.userName}</div>
                            <div className="text-sm text-gray-400">{booking.userEmail}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(booking.date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="h-4 w-4" />
                            {booking.time}
                          </div>
                          <div className="flex items-center gap-2">
                            {getConsultationIcon(booking.consultationType)}
                            <span className="capitalize text-gray-300">{booking.consultationType}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(booking.bookingStatus)}`}>
                            {booking.bookingStatus}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">₹{booking.amount}</div>
                          <div className="text-xs text-gray-400">{booking.paymentStatus}</div>
                        </div>
                      </div>

                      {/* Payment Section - Only for Pay on Visit */}
                      {booking.paymentMethod === 'pay_on_visit' && (
                        <div className="border-t border-purple-500/20 pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-yellow-300 mb-2">Payment Status: {booking.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}</p>
                              <p className="text-xs text-gray-400">Mark payment as received during consultation</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  console.log('📝 Payment Received button clicked. Booking:', { 
                                    id: booking.id, 
                                    _id: booking._id, 
                                    userName: booking.userName,
                                    paymentStatus: booking.paymentStatus
                                  });
                                  handleUpdateBookingStatus(booking.id, 'payment_received');
                                }}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                  booking.paymentStatus === 'paid'
                                    ? 'bg-green-600/30 text-green-300 border border-green-500/50'
                                    : 'bg-green-600 hover:bg-green-700 text-white border border-green-500/50'
                                }`}
                                disabled={booking.paymentStatus === 'paid'}
                              >
                                Yes, Paid
                              </button>
                              <button
                                onClick={() => {
                                  console.log('📝 Payment Pending button clicked. Booking:', { 
                                    id: booking.id, 
                                    _id: booking._id,
                                    userName: booking.userName,
                                    paymentStatus: booking.paymentStatus
                                  });
                                  handleUpdateBookingStatus(booking.id, 'payment_pending');
                                }}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                  booking.paymentStatus === 'pending'
                                    ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                                    : 'bg-red-600 hover:bg-red-700 text-white border border-red-500/50'
                                }`}
                                disabled={booking.paymentStatus === 'pending'}
                              >
                                No, Pending
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Bookings with Payment */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
              <h2 className="text-2xl font-bold mb-6 text-yellow-300">Payment Received - Completed Bookings</h2>
              
              {bookings && bookings.filter(b => b.bookingStatus === 'completed' && b.paymentStatus === 'paid').length === 0 ? (
                <p className="text-center text-gray-400 py-8">No completed bookings with payment received yet</p>
              ) : (
                <div className="space-y-4">
                  {bookings && bookings
                    .filter(b => b.bookingStatus === 'completed' && b.paymentStatus === 'paid')
                    .map((booking) => (
                      <div key={booking._id} className="bg-black/50 p-4 rounded-lg border border-green-500/30">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              </div>
                              <div className="font-semibold text-white">{booking.userId?.name || 'Unknown User'}</div>
                              <span className="text-xs text-green-300 px-2 py-1 bg-green-900/30 rounded-full">✅ Payment Received</span>
                            </div>
                            <div className="text-sm text-gray-400 ml-10">{booking.userId?.email}</div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6 text-right">
                            <div>
                              <div className="text-xs text-gray-400">Date</div>
                              <div className="text-white font-semibold text-sm">{format(parseISO(booking.date), 'MMM dd, yyyy')}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Type</div>
                              <div className="text-white font-semibold text-sm capitalize">{booking.consultationType}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Amount Received</div>
                              <div className="text-yellow-400 font-bold text-lg">₹{booking.amount}</div>
                            </div>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <div className="text-xs text-gray-400 ml-10 mt-2 italic">Note: {booking.notes}</div>
                        )}
                      </div>
                    ))}
                  
                  {bookings && bookings.filter(b => b.bookingStatus === 'completed' && b.paymentStatus === 'paid').length > 0 && (
                    <div className="mt-6 pt-4 border-t border-green-500/30 flex justify-between items-center bg-green-900/20 p-4 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-300 mb-1">Total Payments Received</div>
                        <div className="text-2xl font-bold text-green-400">
                          ₹{bookings
                            .filter(b => b.bookingStatus === 'completed' && b.paymentStatus === 'paid')
                            .reduce((sum, b) => sum + b.amount, 0)
                            .toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        From <span className="font-bold text-white">{bookings.filter(b => b.bookingStatus === 'completed' && b.paymentStatus === 'paid').length}</span> completed bookings
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rating & Performance */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-blue-500/30 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Star className="h-8 w-8 text-yellow-400" />
                  <div>
                    <div className="text-3xl font-bold text-white">{dashboardData.stats.rating.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">Average Rating</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">{dashboardData.stats.totalReviews} reviews</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-green-500/30 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div>
                    <div className="text-3xl font-bold text-white">{dashboardData.stats.completedSessions}</div>
                    <div className="text-sm text-gray-400">Completed Sessions</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">Total consultations delivered</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <DollarSign className="h-8 w-8 text-purple-400" />
                  <div>
                    <div className="text-3xl font-bold text-white">₹{calculateMonthlyEarnings().toLocaleString('en-IN')}</div>
                    <div className="text-sm text-gray-400">Monthly Earnings (Completed & Paid)</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">This month's earnings</div>
              </div>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-yellow-300">Manage Availability</h2>
              <button
                onClick={() => setShowAddSlot(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-black rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="h-5 w-5" />
                Add Slot
              </button>
            </div>

            {/* Add Slot Form */}
            {showAddSlot && (
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">Add New Slot</h3>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Day of Week</label>
                      <select
                        value={slotForm.dayOfWeek}
                        onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: e.target.value })}
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                        required
                      >
                        <option value="">Select Day</option>
                        {dayNames.map((day, index) => (
                          <option key={day} value={index}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Slot Duration (minutes)</label>
                      <select
                        value={slotForm.slotDuration}
                        onChange={(e) => setSlotForm({ ...slotForm, slotDuration: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={slotForm.startTime}
                        onChange={(e) => {
                          console.log('Start time changed:', e.target.value);
                          setSlotForm({ ...slotForm, startTime: e.target.value });
                        }}
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">Format: HH:MM (24-hour)</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                      <input
                        type="time"
                        value={slotForm.endTime}
                        onChange={(e) => {
                          console.log('End time changed:', e.target.value);
                          setSlotForm({ ...slotForm, endTime: e.target.value });
                        }}
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">Format: HH:MM (24-hour)</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Add Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSlot(false);
                        setError('');
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Availability List */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
              <h3 className="text-xl font-bold mb-6 text-yellow-300">Current Availability</h3>
              
              {availability.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No availability slots added yet</p>
              ) : (
                <div className="space-y-4">
                  {availability.map((slot) => (
                    <div key={slot._id} className="bg-black/50 p-4 rounded-lg border border-purple-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-24 text-yellow-400 font-semibold">{dayNames[slot.dayOfWeek]}</div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="h-4 w-4" />
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="text-sm text-gray-400">
                          {slot.slotDuration} min slots
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteSlot(slot._id)}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Manage Bookings</h2>
            
            {bookings.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings?.map((booking) => (
                  <div key={booking._id} className="bg-black/50 p-6 rounded-lg border border-purple-500/30">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{booking.userName}</h3>
                        <p className="text-sm text-gray-400">{booking.userEmail}</p>
                        {booking.userPhone && (
                          <p className="text-sm text-gray-400">{booking.userPhone}</p>
                        )}
                      </div>
                      
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-xs text-gray-400 mb-1">Date</div>
                        <div className="text-white font-semibold">
                          {format(parseISO(booking.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-xs text-gray-400 mb-1">Time</div>
                        <div className="text-white font-semibold">{booking.time}</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-xs text-gray-400 mb-1">Type</div>
                        <div className="text-white font-semibold capitalize">{booking.consultationType}</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-xs text-gray-400 mb-1">Amount</div>
                        <div className="text-yellow-400 font-bold">₹{booking.amount}</div>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div className="mb-4 p-3 bg-black/30 rounded">
                        <div className="text-xs text-gray-400 mb-1">Notes</div>
                        <p className="text-gray-300">{booking.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      {booking.bookingStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                          >
                            Confirm Booking
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Please provide cancellation reason:");
                              if (reason) handleUpdateBookingStatus(booking._id, 'cancelled', reason);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        </>
                      )}
                      
                      {booking.bookingStatus === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking._id, 'no-show')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                          >
                            No Show
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Horoscope Tab */}
        {activeTab === 'horoscope' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-yellow-300">Manage Horoscopes</h2>
              <button
                onClick={() => {
                  resetHoroscopeForm();
                  setShowAddHoroscope(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="h-5 w-5" />
                Add Horoscope
              </button>
            </div>

            {/* Add/Edit Horoscope Form */}
            {showAddHoroscope && (
              <div className="bg-black/40 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-yellow-300">
                    {editingHoroscope ? 'Edit Horoscope' : 'Add New Horoscope'}
                  </h3>
                  <button
                    onClick={handleCloseHoroscopeForm}
                    className="p-1 hover:bg-red-900/30 rounded transition-colors"
                  >
                    <X className="h-6 w-6 text-red-400" />
                  </button>
                </div>
                
                {horoscopeError && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
                    {horoscopeError}
                  </div>
                )}

                <form onSubmit={handleAddOrUpdateHoroscope} className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rashi</label>
                      <select
                        value={horoscopeForm.rashi}
                        onChange={(e) => setHoroscopeForm({ ...horoscopeForm, rashi: e.target.value })}
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                        required
                      >
                        <option value="">Select Rashi</option>
                        {rashis.map((rashi) => (
                          <option key={rashi.name} value={rashi.name}>
                            {rashi.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
                      <select
                        value={horoscopeForm.period}
                        onChange={(e) => setHoroscopeForm({ ...horoscopeForm, period: e.target.value })}
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                      <input
                        type="date"
                        value={horoscopeForm.date}
                        onChange={(e) => setHoroscopeForm({ ...horoscopeForm, date: e.target.value })}
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Lucky Number</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={horoscopeForm.luckyNumber}
                        onChange={(e) => setHoroscopeForm({ ...horoscopeForm, luckyNumber: e.target.value })}
                        placeholder="1-99"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Lucky Color</label>
                      <input
                        type="text"
                        value={horoscopeForm.luckyColor}
                        onChange={(e) => setHoroscopeForm({ ...horoscopeForm, luckyColor: e.target.value })}
                        placeholder="e.g., Red, Blue"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Compatibility</label>
                      <input
                        type="text"
                        value={horoscopeForm.compatibility}
                        onChange={(e) => setHoroscopeForm({ ...horoscopeForm, compatibility: e.target.value })}
                        placeholder="e.g., Gemini"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ruling Planet</label>
                      <input
                        type="text"
                        value={horoscopeForm.additionalInfo.rulingPlanet}
                        onChange={(e) => setHoroscopeForm({
                          ...horoscopeForm,
                          additionalInfo: {
                            ...horoscopeForm.additionalInfo,
                            rulingPlanet: e.target.value
                          }
                        })}
                        placeholder="e.g., Mars"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prediction</label>
                    <textarea
                      value={horoscopeForm.prediction}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, prediction: e.target.value })}
                      placeholder="Enter the horoscope prediction..."
                      rows="4"
                      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Advice</label>
                    <textarea
                      value={horoscopeForm.advice}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, advice: e.target.value })}
                      placeholder="Enter advice for this period..."
                      rows="3"
                      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-yellow-300 mb-3">Category Predictions</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={horoscopeForm.categoryPredictions.career}
                        onChange={(e) => setHoroscopeForm({
                          ...horoscopeForm,
                          categoryPredictions: {
                            ...horoscopeForm.categoryPredictions,
                            career: e.target.value
                          }
                        })}
                        placeholder="Career prediction"
                        className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={horoscopeForm.categoryPredictions.love}
                        onChange={(e) => setHoroscopeForm({
                          ...horoscopeForm,
                          categoryPredictions: {
                            ...horoscopeForm.categoryPredictions,
                            love: e.target.value
                          }
                        })}
                        placeholder="Love prediction"
                        className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={horoscopeForm.categoryPredictions.health}
                        onChange={(e) => setHoroscopeForm({
                          ...horoscopeForm,
                          categoryPredictions: {
                            ...horoscopeForm.categoryPredictions,
                            health: e.target.value
                          }
                        })}
                        placeholder="Health prediction"
                        className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={horoscopeForm.categoryPredictions.finance}
                        onChange={(e) => setHoroscopeForm({
                          ...horoscopeForm,
                          categoryPredictions: {
                            ...horoscopeForm.categoryPredictions,
                            finance: e.target.value
                          }
                        })}
                        placeholder="Finance prediction"
                        className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      {editingHoroscope ? 'Update Horoscope' : 'Add Horoscope'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseHoroscopeForm}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Horoscope List by Period */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
              <h3 className="text-xl font-bold mb-6 text-yellow-300">Horoscope Predictions</h3>
              
              {horoscopes.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No horoscopes added yet</p>
              ) : (
                <div className="space-y-8">
                  {/* Period Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-purple-500/30 pb-4">
                    {[
                      { id: 'daily', label: '📅 Daily', icon: Calendar },
                      { id: 'weekly', label: '📊 Weekly', icon: CalendarDays },
                      { id: 'monthly', label: '📈 Monthly', icon: BarChart3 },
                      { id: 'yearly', label: '📭 Yearly', icon: Clock }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActivePeriodTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                          activePeriodTab === tab.id
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                            : 'bg-black/30 border border-purple-500/30 text-gray-300 hover:bg-purple-900/30'
                        }`}
                      >
                        {tab.label}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activePeriodTab === tab.id
                            ? 'bg-black/30'
                            : 'bg-purple-500/30'
                        }`}>
                          12
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Daily Horoscopes */}
                  {activePeriodTab === 'daily' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-purple-300 mb-4">📅 Daily Rashifal - All 12 Rashis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rashis.map((rashi) => {
                          const horo = getHoroscopeForRashi(rashi.name, 'daily');
                          return (
                            <div key={rashi.name} className="bg-black/50 p-4 rounded-lg border border-purple-500/30 hover:border-yellow-400/50 transition-colors">
                              <div className="mb-3">
                                <div className="text-3xl mb-2">{getRashiSymbol(rashi.name)}</div>
                                <h5 className="font-semibold text-yellow-300">{rashi.displayName}</h5>
                              </div>
                              
                              {horo ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-300 line-clamp-3">{horo.prediction}</p>
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => handleEditHoroscope(horo)}
                                      className="flex-1 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs hover:bg-blue-900/50 rounded transition-colors font-semibold"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHoroscope(horo._id)}
                                      className="px-2 py-1 bg-red-900/30 text-red-400 text-xs hover:bg-red-900/50 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 italic">No prediction added</p>
                                  <button
                                    onClick={() => handleEditRashi(rashi.name, 'daily')}
                                    className="w-full px-2 py-1 bg-green-900/30 text-green-400 text-xs hover:bg-green-900/50 rounded transition-colors font-semibold"
                                  >
                                    Add Prediction
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Weekly Horoscopes */}
                  {activePeriodTab === 'weekly' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-4">📊 Weekly Rashifal - All 12 Rashis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rashis.map((rashi) => {
                          const horo = getHoroscopeForRashi(rashi.name, 'weekly');
                          return (
                            <div key={rashi.name} className="bg-black/50 p-4 rounded-lg border border-purple-500/30 hover:border-blue-400/50 transition-colors">
                              <div className="mb-3">
                                <div className="text-3xl mb-2">{getRashiSymbol(rashi.name)}</div>
                                <h5 className="font-semibold text-yellow-300">{rashi.displayName}</h5>
                              </div>
                              
                              {horo ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-300 line-clamp-3">{horo.prediction}</p>
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => handleEditHoroscope(horo)}
                                      className="flex-1 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs hover:bg-blue-900/50 rounded transition-colors font-semibold"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHoroscope(horo._id)}
                                      className="px-2 py-1 bg-red-900/30 text-red-400 text-xs hover:bg-red-900/50 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 italic">No prediction added</p>
                                  <button
                                    onClick={() => handleEditRashi(rashi.name, 'weekly')}
                                    className="w-full px-2 py-1 bg-green-900/30 text-green-400 text-xs hover:bg-green-900/50 rounded transition-colors font-semibold"
                                  >
                                    Add Prediction
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Monthly Horoscopes */}
                  {activePeriodTab === 'monthly' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-green-300 mb-4">📈 Monthly Rashifal - All 12 Rashis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rashis.map((rashi) => {
                          const horo = getHoroscopeForRashi(rashi.name, 'monthly');
                          return (
                            <div key={rashi.name} className="bg-black/50 p-4 rounded-lg border border-purple-500/30 hover:border-green-400/50 transition-colors">
                              <div className="mb-3">
                                <div className="text-3xl mb-2">{getRashiSymbol(rashi.name)}</div>
                                <h5 className="font-semibold text-yellow-300">{rashi.displayName}</h5>
                              </div>
                              
                              {horo ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-300 line-clamp-3">{horo.prediction}</p>
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => handleEditHoroscope(horo)}
                                      className="flex-1 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs hover:bg-blue-900/50 rounded transition-colors font-semibold"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHoroscope(horo._id)}
                                      className="px-2 py-1 bg-red-900/30 text-red-400 text-xs hover:bg-red-900/50 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 italic">No prediction added</p>
                                  <button
                                    onClick={() => handleEditRashi(rashi.name, 'monthly')}
                                    className="w-full px-2 py-1 bg-green-900/30 text-green-400 text-xs hover:bg-green-900/50 rounded transition-colors font-semibold"
                                  >
                                    Add Prediction
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Yearly Horoscopes */}
                  {activePeriodTab === 'yearly' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-red-300 mb-4">📭 Yearly Rashifal - All 12 Rashis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rashis.map((rashi) => {
                          const horo = getHoroscopeForRashi(rashi.name, 'yearly');
                          return (
                            <div key={rashi.name} className="bg-black/50 p-4 rounded-lg border border-purple-500/30 hover:border-red-400/50 transition-colors">
                              <div className="mb-3">
                                <div className="text-3xl mb-2">{getRashiSymbol(rashi.name)}</div>
                                <h5 className="font-semibold text-yellow-300">{rashi.displayName}</h5>
                              </div>
                              
                              {horo ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-300 line-clamp-3">{horo.prediction}</p>
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => handleEditHoroscope(horo)}
                                      className="flex-1 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs hover:bg-blue-900/50 rounded transition-colors font-semibold"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHoroscope(horo._id)}
                                      className="px-2 py-1 bg-red-900/30 text-red-400 text-xs hover:bg-red-900/50 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 italic">No prediction added</p>
                                  <button
                                    onClick={() => handleEditRashi(rashi.name, 'yearly')}
                                    className="w-full px-2 py-1 bg-green-900/30 text-green-400 text-xs hover:bg-green-900/50 rounded transition-colors font-semibold"
                                  >
                                    Add Prediction
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Profile Settings</h2>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-900/30 mb-4">
                <Edit className="h-12 w-12 text-purple-400" />
              </div>
              <p className="text-gray-400 mb-6">
                Profile management will be implemented in the next phase
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstrologerDashboard;