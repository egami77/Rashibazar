// src/pages/AstrologerDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, DollarSign, Users, Star,
  CalendarDays, CheckCircle, XCircle, Clock3,
  Edit, Trash2, Plus, Download, BarChart3,
  Phone, MessageCircle, Loader2, RefreshCw,
  Sparkles, X, ChevronRight, LayoutDashboard, 
  Settings, LogOut, Bell, ExternalLink, User as UserIcon,
  Info, MapPin, Activity, Home, Building2, ListTodo, Zap
} from 'lucide-react';
import {
  getAstrologerDashboard,
  getMyAvailability,
  addAvailability,
  deleteAvailability,
  getAstrologerBookings,
  updateBookingStatus,
  updateAstrologerProfile
} from '../services/booking';
import {
  updateHoroscope,
  getAstrologerHoroscopes,
  deleteHoroscope as deleteHoroscopeService,
  getAllRashis
} from '../services/horoscope';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { format, parseISO, isAfter, isBefore, addMinutes } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

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
    keyHighlights: '',
    advice: '',
    luckyNumber: '',
    luckyColor: '',
    luckyGem: '',
    compatibleSigns: '',
    additionalInfo: {
      element: '', rulingPlanet: '', quality: '', bestTime: '', favorableDirection: ''
    }
  });
  const [horoscopeError, setHoroscopeError] = useState('');

  // Profile management
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    experience: 0,
    pricing: { perSession: 0 },
    bio: '',
    location: { address: '', city: '', district: '', landmark: '' }
  });

  // Countdown for next session
  const [nextSessionCountdown, setNextSessionCountdown] = useState(null);

  // Confirmation Modal for Deleting Slot
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Permission Modal for Publishing Horoscope
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [cancelBookingModal, setCancelBookingModal] = useState({ isOpen: false, bookingId: null });
  const [cancelReason, setCancelReason] = useState('');
  const [queueTab, setQueueTab] = useState('today');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [bookings]);

  const updateCountdown = () => {
    const now = new Date();
    const upcoming = bookings
      .filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending')
      .map(b => ({ ...b, fullDate: new Date(`${format(parseISO(b.date), 'yyyy-MM-dd')}T${b.time}:00`) }))
      .filter(b => isAfter(b.fullDate, now))
      .sort((a, b) => a.fullDate - b.fullDate)[0];

    if (upcoming) {
      const diff = upcoming.fullDate - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setNextSessionCountdown({
        id: upcoming.id,
        userName: upcoming.userName,
        time: `${hours}h ${mins}m ${secs}s`,
        isNear: diff < 15 * 60 * 1000 // 15 mins
      });
    } else {
      setNextSessionCountdown(null);
    }
  };

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

      // Initialize profile form from dashboard profile
      if (dashboardRes.data.profile) {
        const p = dashboardRes.data.profile;
        setProfileForm({
          name: p.name || '',
          phone: p.phone || '',
          experience: p.experience ?? 0,
          pricing: { perSession: p.pricing?.perSession ?? 0 },
          bio: p.bio || '',
          location: {
            address: p.location?.address || '',
            city: p.location?.city || '',
            district: p.location?.district || '',
            landmark: p.location?.landmark || '',
          }
        });
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const parseNumberInput = (value, fallback = 0) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : Math.max(0, parsed);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        experience: parseNumberInput(profileForm.experience, 0),
        pricing: {
          perSession: parseNumberInput(profileForm.pricing?.perSession, 0),
        },
        bio: profileForm.bio?.trim() || "",
        location: {
          address: profileForm.location?.address?.trim() || "",
          city: profileForm.location?.city?.trim() || "",
          district: profileForm.location?.district?.trim() || "",
          landmark: profileForm.location?.landmark?.trim() || "",
        },
      };
      if (profileForm.name?.trim()) payload.name = profileForm.name.trim();
      if (profileForm.phone?.trim()) payload.phone = profileForm.phone.trim();

      await updateAstrologerProfile(payload);
      toast.success("Profile changes sent for admin approval.");
      setShowProfileEdit(false);
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addAvailability({
        dayOfWeek: parseInt(slotForm.dayOfWeek),
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        slotDuration: parseInt(slotForm.slotDuration)
      });
      toast.success("Availability slot added!");
      setShowAddSlot(false);
      loadDashboardData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add slot");
    }
  };

  const handleDeleteSlot = (id) => {
    setConfirmAction({ action: 'deleteSlot', id });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!confirmAction) return;
    const { id } = confirmAction;
    setShowConfirmModal(false);
    try {
      await deleteAvailability(id);
      toast.success("Slot deleted");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status, reason = null) => {
    try {
      await updateBookingStatus(bookingId, status, reason);
      toast.success(`Booking ${status}`);
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAddOrUpdateHoroscope = async (e) => {
    e.preventDefault();
    if (!dashboardData?.profile?.canUpdateHoroscope) {
      setShowPermissionModal(true);
      return;
    }
    try {
      // Map form fields to backend structure
      const payload = {
        ...horoscopeForm,
        // We still send prediction as keyHighlights to maintain backend compatibility if needed
        prediction: horoscopeForm.keyHighlights 
      };
      await updateHoroscope(horoscopeForm.rashi, horoscopeForm.period, horoscopeForm.date, payload);
      toast.success("Horoscope published!");
      setShowAddHoroscope(false);
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to update horoscope");
    }
  };

  const resetHoroscopeForm = () => {
    setHoroscopeForm({
      rashi: '', period: 'daily', date: new Date().toISOString().split('T')[0],
      keyHighlights: '', advice: '', luckyNumber: '', luckyColor: '', luckyGem: '', compatibleSigns: '',
      additionalInfo: { element: '', rulingPlanet: '', quality: '', bestTime: '', favorableDirection: '' }
    });
  };

  // Group bookings by date
  const groupedBookings = useMemo(() => {
    const validBookings = bookings.filter(booking => {
      if (booking.paymentMethod === 'khalti' && (booking.paymentStatus === 'pending' || booking.paymentStatus === 'failed')) {
        return false;
      }
      return true;
    });

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const today = new Date();
    today.setHours(0,0,0,0);

    const filteredForTab = validBookings.filter(b => {
      const bDate = new Date(b.date);
      bDate.setHours(0,0,0,0);
      const bDateStr = format(bDate, 'yyyy-MM-dd');
      if (queueTab === 'today') return bDateStr === todayStr;
      if (queueTab === 'upcoming') return bDate > today;
      if (queueTab === 'previous') return bDate < today;
      return true;
    });

    const groups = {};
    filteredForTab.forEach(booking => {
      const dateKey = format(parseISO(booking.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(booking);
    });
    
    return Object.keys(groups)
      .sort((a, b) => queueTab === 'upcoming' ? a.localeCompare(b) : b.localeCompare(a))
      .map(date => ({
        date,
        sessions: groups[date].sort((a, b) => a.time.localeCompare(b.time))
      }));
  }, [bookings, queueTab]);

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'confirmed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'cancelled': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      'completed': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return badges[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <RefreshCw className="h-10 w-10 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  const dashboardTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Queue Management', icon: ListTodo },
    { id: 'availability', label: 'Office Hours', icon: Clock },
    { id: 'horoscope', label: 'Daily Predictions', icon: Sparkles },
    { id: 'profile', label: 'Expert Profile', icon: UserIcon }
  ];

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-black/40 backdrop-blur-md border-r border-purple-600/30 sticky top-24 h-[calc(100vh-6rem)] hidden lg:flex flex-col p-8 z-40 overflow-y-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent tracking-wide">RASHIBAZAR</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Expert Dashboard</p>
        </div>

        <nav className="flex-1 space-y-2">
          {dashboardTabs.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-full transition-all group ${activeTab === item.id ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black shadow-lg font-bold' : 'text-gray-400 hover:bg-purple-900/30 hover:text-white'}`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className="text-sm">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-rose-500 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
        {/* Mobile Navigation */}
        <div className="lg:hidden flex overflow-x-auto pb-4 mb-6 space-x-2 snap-x hide-scrollbar">
          {dashboardTabs.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all snap-center ${activeTab === item.id ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold shadow-lg' : 'bg-black/40 border border-purple-600/30 text-gray-300'}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Top Bar / Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 tracking-wide">
                Namaste, {dashboardData?.profile?.name || 'Expert'}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase">
                  <Activity className="h-3 w-3" /> System Active
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  {format(new Date(), 'EEEE, MMMM dd')}
                </span>
              </div>
            </div>

            {nextSessionCountdown && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm ${nextSessionCountdown.isNear ? 'bg-rose-500/10 border-rose-500/30' : 'bg-purple-500/10 border-purple-600/30'}`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${nextSessionCountdown.isNear ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg'}`}>
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Next Physical Visit In</p>
                  <p className={`text-xl font-black ${nextSessionCountdown.isNear ? 'text-rose-500' : 'text-white'}`}>
                    {nextSessionCountdown.time}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Client: {nextSessionCountdown.userName}</p>
                </div>
              </motion.div>
            )}
          </header>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Visits', val: dashboardData.stats.totalBookings, icon: Users, color: 'blue' },
                    { label: 'Upcoming Visits', val: dashboardData.stats.upcomingSessions, icon: Calendar, color: 'orange' },
                    { label: 'Avg Rating', val: `${dashboardData.stats.rating.toFixed(1)}/5`, icon: Star, color: 'yellow' },
                    { label: 'Total Earnings', val: `Npr ${dashboardData.stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'emerald' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-black/40 border border-purple-600/30 p-6 rounded-xl relative overflow-hidden group hover:border-purple-500 transition-all shadow-md">
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`}></div>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-400 mb-4`} />
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-3xl font-black text-white mt-1">{stat.val}</h3>
                    </div>
                  ))}
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Bookings List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Today's Managed Queue</h3>
                      <button onClick={() => setActiveTab('bookings')} className="text-xs text-orange-500 font-bold uppercase hover:underline">View All Dates</button>
                    </div>

                    <div className="space-y-4">
                      {dashboardData.recentBookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd')).length > 0 ? (
                        dashboardData.recentBookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd')).map((booking, idx) => (
                          <div key={booking.id} className="bg-black/40 border border-purple-600/30 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 hover:border-purple-500 transition-all shadow-md">
                            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                              <UserIcon className="h-8 w-8 text-gray-500" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-black text-white uppercase text-lg truncate">{booking.userName}</h4>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(booking.bookingStatus)}`}>
                                  {booking.bookingStatus}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-6 gap-y-1">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Clock className="h-3 w-3" /> {booking.time}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase">
                                  <MapPin className="h-3 w-3" /> In-Person
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {booking.bookingStatus === 'pending' && (
                                <button 
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                                >Accept</button>
                              )}
                              <button 
                                onClick={() => setActiveTab('bookings')}
                                className="px-6 py-3 bg-black/40 border border-purple-600/30 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:border-purple-500 transition-all"
                              >Queue</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20 bg-black/40 border border-dashed border-purple-600/30 rounded-xl">
                          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No physical visits scheduled for today</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Widgets */}
                  <div className="space-y-8">
                    {/* Quick Actions */}
                     <div className="bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-purple-600/20 border border-purple-600/30 p-8 rounded-xl shadow-xl backdrop-blur-sm">
                       <h4 className="text-lg font-bold text-yellow-300 uppercase mb-6">Expert Actions</h4>
                      <div className="space-y-3">
                        <button onClick={() => setActiveTab('horoscope')} className="w-full bg-black/40 border border-purple-600/30 hover:border-purple-500 text-white p-4 rounded-full flex items-center justify-between transition-all group">
                          <span className="font-bold text-sm">Update Predictions</span>
                          <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        </button>
                         <button onClick={() => setActiveTab('availability')} className="w-full bg-black/40 border border-purple-600/30 hover:border-purple-500 text-white p-4 rounded-full flex items-center justify-between transition-all group">
                          <span className="font-bold text-sm">Manage Schedule</span>
                          <Calendar className="h-4 w-4 group-hover:-rotate-12 transition-transform" />
                        </button>
                         <button onClick={() => setActiveTab('profile')} className="w-full bg-black/40 border border-purple-600/30 hover:border-purple-500 text-white p-4 rounded-full flex items-center justify-between transition-all group">
                          <span className="font-bold text-sm">Edit Profile</span>
                          <Settings className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Earnings Summary */}
                     <div className="bg-black/40 border border-purple-600/30 p-8 rounded-xl shadow-md">
                      <h4 className="text-lg font-black text-white uppercase italic mb-6 tracking-tight">Revenue Info</h4>
                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Monthly Target</p>
                          <p className="text-xs text-emerald-400 font-bold">82%</p>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 w-[82%]"></div>
                        </div>
                        <div className="pt-4 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Received</p>
                            <p className="text-xl font-black text-white">Npr {dashboardData.stats.monthlyEarnings.toLocaleString()}</p>
                          </div>
                          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                            <BarChart3 className="h-5 w-5 text-emerald-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div 
                key="bookings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-4">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Physical Visit Queue</h2>
                  <div className="flex bg-black/40 p-1 rounded-full border border-purple-600/30">
                    {['previous', 'today', 'upcoming'].map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setQueueTab(tab)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${queueTab === tab ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black' : 'text-gray-500 hover:text-white'}`}
                      >{tab}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-16">
                  {groupedBookings.length > 0 ? groupedBookings.map(group => (
                    <div key={group.date} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-0.5 flex-1 bg-white/5"></div>
                         <div className="bg-black/40 border border-purple-600/30 px-6 py-2 rounded-full">
                           <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest">
                            {format(parseISO(group.date), 'EEEE, MMMM dd, yyyy')}
                          </h3>
                        </div>
                        <div className="h-0.5 flex-1 bg-white/5"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {group.sessions.map(booking => (
                           <div key={booking._id} className="bg-black/40 border border-purple-600/30 p-6 rounded-xl relative overflow-hidden group hover:border-purple-500 transition-all shadow-md">
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-full -mr-16 -mt-16 bg-white group-hover:opacity-[0.07] transition-all"></div>
                            
                            <div className="flex items-start justify-between mb-8">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-gradient-to-br from-white/10 to-transparent rounded-2xl flex items-center justify-center border border-white/10">
                                  <UserIcon className="h-8 w-8 text-white/50" />
                                </div>
                                <div>
                                  <h4 className="text-xl font-black text-white uppercase">{booking.userId?.name || 'Client'}</h4>
                                  <p className="text-xs text-gray-500 font-medium">{booking.userId?.email}</p>
                                </div>
                              </div>
                              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(booking.bookingStatus)}`}>
                                {booking.bookingStatus}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Time</p>
                                <p className="text-xs font-bold text-white">{booking.time}</p>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Amount</p>
                                <p className="text-xs font-bold text-orange-400">Npr {booking.amount}</p>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Type</p>
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">Physical</p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              {booking.bookingStatus === 'confirmed' && (
                                <button 
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                                  className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg"
                                >
                                  <CheckCircle className="h-4 w-4" /> Mark as Completed
                                </button>
                              )}

                              {booking.bookingStatus === 'pending' && (
                                <div className="flex w-full gap-3">
                                  <button 
                                    onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
                                  >Confirm Visit</button>
                                  <button 
                                    onClick={() => setCancelBookingModal({ isOpen: true, bookingId: booking._id })}
                                    className="px-6 py-4 bg-black/40 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-all"
                                  >Decline</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-32 bg-black/40 border border-dashed border-purple-600/30 rounded-xl">
                      <Calendar className="h-16 w-16 text-gray-700 mx-auto mb-6" />
                      <p className="text-gray-500 font-black uppercase tracking-widest">No physical visits in the queue</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'availability' && (
              <motion.div 
                key="availability"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Office Hours</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Set your active physical consulting hours</p>
                  </div>
                  <button 
                    onClick={() => setShowAddSlot(true)}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                  >
                    <Plus className="h-4 w-4" /> Add Office Hours
                  </button>
                </div>

                {showAddSlot && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-black/40 border border-purple-600/30 p-10 rounded-xl relative overflow-hidden">
                    <button onClick={() => setShowAddSlot(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"><X className="h-6 w-6" /></button>
                    <h4 className="text-xl font-black text-white uppercase italic mb-8">Define Office Time</h4>
                    <h4 className="text-s font-black text-white   mb-8">Must be on 30 min format </h4>
                    
                    <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Day of Week</label>
                        <select 
                          value={slotForm.dayOfWeek}
                          onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all"
                          required
                        >
                          <option value="" className="bg-neutral-900">Choose Day</option>
                          {dayNames.map((d, i) => <option key={i} value={i} className="bg-neutral-900">{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Start Time</label>
                        <input 
                          type="time"
                          value={slotForm.startTime}
                          onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all [color-scheme:dark]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">End Time</label>
                        <input 
                          type="time"
                          value={slotForm.endTime}
                          onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all [color-scheme:dark]"
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 hover:text-white transition-all">Save Slot</button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dayNames.map((day, dayIdx) => {
                    const daySlots = availability.filter(s => s.dayOfWeek === dayIdx);
                    return (
                       <div key={day} className={`bg-black/40 border border-purple-600/30 p-6 rounded-xl ${daySlots.length === 0 ? 'opacity-40 grayscale' : 'hover:border-purple-500 transition-all shadow-md'}`}>
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-xl font-black text-white uppercase italic">{day}</h4>
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{daySlots.length} Slots</span>
                        </div>
                        
                        <div className="space-y-3">
                          {daySlots.length > 0 ? daySlots.map(slot => (
                             <div key={slot._id} className="group bg-white/5 p-4 rounded-full border border-purple-600/20 flex items-center justify-between hover:border-purple-500 transition-all">
                              <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-bold text-white">{slot.startTime} — {slot.endTime}</span>
                              </div>
                              <button onClick={() => handleDeleteSlot(slot._id)} className="p-2 text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )) : (
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest py-4">No office hours set</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'horoscope' && (
              <motion.div 
                key="horoscope"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Daily Predictions</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Guide your followers through the stars</p>
                  </div>
                   <div className="flex bg-black/40 p-1 rounded-full border border-purple-600/30">
                    {['daily', 'weekly', 'monthly'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => setActivePeriodTab(p)}
                        className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activePeriodTab === p ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black' : 'text-gray-500 hover:text-white'}`}
                      >{p}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {rashis.map(r => {
                    const prediction = horoscopes.find(h => h.rashi === r.name && h.period === activePeriodTab);
                    return (
                      <button 
                        key={r.name}
                        onClick={() => {
                          setHoroscopeForm({
                            ...horoscopeForm,
                            rashi: r.name,
                            period: activePeriodTab,
                            keyHighlights: prediction?.prediction || '',
                            advice: prediction?.advice || '',
                            luckyNumber: prediction?.luckyNumber || '',
                            luckyColor: prediction?.luckyColor || '',
                            luckyGem: prediction?.luckyGem || '',
                            compatibleSigns: prediction?.compatibleSigns || '',
                            additionalInfo: prediction?.additionalInfo || { element: '', rulingPlanet: '', quality: '', bestTime: '', favorableDirection: '' }
                          });
                          setShowAddHoroscope(true);
                        }}
                        className={`p-6 rounded-xl border transition-all text-center group ${prediction ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/40 border-purple-600/30 hover:border-purple-500'}`}
                      >
                        <div className="text-3xl mb-2 opacity-80 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                          {r.symbol || '✦'}
                        </div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest truncate">{r.name}</h4>
                        <p className={`text-[8px] font-bold mt-1 uppercase tracking-widest ${prediction ? 'text-emerald-500' : 'text-gray-600'}`}>
                          {prediction ? 'Updated' : 'Missing'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {showAddHoroscope && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                     <div className="bg-black/80 border border-purple-600/40 w-full max-w-4xl rounded-2xl p-10 relative max-h-[90vh] overflow-y-auto backdrop-blur-xl">
                      <button onClick={() => setShowAddHoroscope(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors"><X className="h-8 w-8" /></button>
                      
                      <div className="mb-10">
                         <p className="text-pink-400 text-xs font-semibold uppercase tracking-widest mb-2">Cosmic Editor</p>
                        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                          Update {horoscopeForm.rashi} {activePeriodTab}
                        </h3>
                      </div>

                      <form onSubmit={handleAddOrUpdateHoroscope} className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <div className="space-y-8">
                              <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                  <Zap className="h-3 w-3 text-yellow-400" /> Key Highlights
                                </label>
                                <textarea 
                                  value={horoscopeForm.keyHighlights}
                                  onChange={(e) => setHoroscopeForm({ ...horoscopeForm, keyHighlights: e.target.value })}
                                  className="w-full h-32 bg-black/40 border border-purple-600/30 rounded-xl p-6 text-white outline-none focus:border-purple-500 transition-all leading-relaxed"
                                  placeholder="Essential points for the day..."
                                  required
                                />
                              </div>

                              <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Expert Advice & Remedies</label>
                                <textarea 
                                  value={horoscopeForm.advice}
                                  onChange={(e) => setHoroscopeForm({ ...horoscopeForm, advice: e.target.value })}
                                  className="w-full h-32 bg-black/40 border border-purple-600/30 rounded-xl p-6 text-white outline-none focus:border-purple-500 transition-all leading-relaxed"
                                  placeholder="Practical steps to align with planetary energies..."
                                />
                              </div>
                           </div>

                           <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Lucky Number</label>
                                  <input type="text" value={horoscopeForm.luckyNumber} onChange={(e) => setHoroscopeForm({...horoscopeForm, luckyNumber: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Lucky Color</label>
                                  <input type="text" value={horoscopeForm.luckyColor} onChange={(e) => setHoroscopeForm({...horoscopeForm, luckyColor: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Lucky Gem</label>
                                  <input type="text" value={horoscopeForm.luckyGem} onChange={(e) => setHoroscopeForm({...horoscopeForm, luckyGem: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Compatible Signs</label>
                                  <input type="text" value={horoscopeForm.compatibleSigns} onChange={(e) => setHoroscopeForm({...horoscopeForm, compatibleSigns: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                                </div>
                              </div>

                               <div className="p-6 bg-black/40 border border-purple-600/20 rounded-xl">
                                <h5 className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-4">Rashi Information</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[8px] text-gray-500 font-bold uppercase">Element</label>
                                    <input type="text" value={horoscopeForm.additionalInfo.element} onChange={(e) => setHoroscopeForm({...horoscopeForm, additionalInfo: {...horoscopeForm.additionalInfo, element: e.target.value}})} className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-xs" placeholder="e.g. Fire" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] text-gray-500 font-bold uppercase">Ruling Planet</label>
                                    <input type="text" value={horoscopeForm.additionalInfo.rulingPlanet} onChange={(e) => setHoroscopeForm({...horoscopeForm, additionalInfo: {...horoscopeForm.additionalInfo, rulingPlanet: e.target.value}})} className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-xs" placeholder="e.g. Mars" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] text-gray-500 font-bold uppercase">Best Time</label>
                                    <input type="text" value={horoscopeForm.additionalInfo.bestTime} onChange={(e) => setHoroscopeForm({...horoscopeForm, additionalInfo: {...horoscopeForm.additionalInfo, bestTime: e.target.value}})} className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-xs" placeholder="e.g. 09:00 AM" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] text-gray-500 font-bold uppercase">Direction</label>
                                    <input type="text" value={horoscopeForm.additionalInfo.favorableDirection} onChange={(e) => setHoroscopeForm({...horoscopeForm, additionalInfo: {...horoscopeForm.additionalInfo, favorableDirection: e.target.value}})} className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-xs" placeholder="e.g. East" />
                                  </div>
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <button type="submit" className="flex-1 py-5 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Publish Prediction</button>
                           <button type="button" onClick={() => setShowAddHoroscope(false)} className="px-10 py-5 bg-black/40 border border-purple-600/30 text-gray-400 rounded-full font-bold uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {dashboardData?.profile?.pendingProfile?.status === 'pending' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-xl">
                    <p className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-1">Profile update pending</p>
                    <p className="text-gray-300 text-sm">
                      Your recent profile changes are waiting for admin approval. Until approved, users will see your previous profile.
                    </p>
                  </div>
                )}

                {dashboardData?.profile?.pendingProfile?.status === 'rejected' && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-xl">
                    <p className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-1">Profile update rejected</p>
                    <p className="text-gray-300 text-sm">
                      Reason: {dashboardData.profile.pendingProfile.rejectionReason || 'No reason provided.'}
                    </p>
                  </div>
                )}

                 <div className="bg-black/40 border border-purple-600/30 rounded-xl p-12 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                    <Settings className="h-64 w-64 text-white" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-start gap-12">
                     <div className="h-48 w-48 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 p-1 shrink-0 shadow-2xl">
                      <div className="h-full w-full bg-neutral-900 rounded-[2.4rem] flex items-center justify-center overflow-hidden border-4 border-black/50">
                        {dashboardData?.profile?.profileImage ? (
                          <img src={dashboardData.profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="h-20 w-20 text-white/20" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div>
                         <p className="text-pink-400 text-xs font-semibold uppercase tracking-widest mb-1">Expert Profile</p>
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{dashboardData?.profile?.name}</h2>
                        <p className="text-gray-500 font-bold mt-2">{dashboardData?.profile?.email}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Experience</p>
                          <p className="text-lg font-bold text-white">{dashboardData?.profile?.experience} Years</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Session Rate</p>
                          <p className="text-lg font-bold text-orange-400">Npr {dashboardData?.profile?.pricing?.perSession}</p>
                        </div>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Location</p>
                          <p className="text-xs font-bold text-white uppercase">
                            {dashboardData?.profile?.location?.address || dashboardData?.profile?.location?.city || dashboardData?.profile?.location?.district
                              ? `${dashboardData?.profile?.location?.address || ''}${dashboardData?.profile?.location?.address ? ', ' : ''}${dashboardData?.profile?.location?.city || ''}${dashboardData?.profile?.location?.city ? ', ' : ''}${dashboardData?.profile?.location?.district || ''}`.replace(/,\s*$/, '')
                              : 'Not set'}
                          </p>
                          {dashboardData?.profile?.location?.landmark && (
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                              Landmark: {dashboardData.profile.location.landmark}
                            </p>
                          )}
                        </div>
                      </div>

                       <button onClick={() => setShowProfileEdit(true)} className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Edit Public Profile</button>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 border border-purple-600/30 rounded-xl p-8 shadow-2xl">
                  <ChangePasswordForm />
                </div>

                {showProfileEdit && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                     <div className="bg-black/80 border border-purple-600/40 w-full max-w-2xl rounded-2xl p-10 relative backdrop-blur-xl">
                      <button onClick={() => setShowProfileEdit(false)} className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors"><X className="h-8 w-8" /></button>
                      <h3 className="text-3xl font-black text-white uppercase italic mb-8">Edit Public Profile</h3>
                      
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Session Rate (Npr)</label>
                            <input 
                              type="number"
                              min="0"
                              value={profileForm.pricing?.perSession ?? 0}
                              onChange={(e) => setProfileForm({
                                ...profileForm,
                                pricing: { perSession: parseNumberInput(e.target.value, profileForm.pricing?.perSession ?? 0) },
                              })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Exp (Years)</label>
                            <input 
                              type="number"
                              min="0"
                              value={profileForm.experience ?? 0}
                              onChange={(e) => setProfileForm({
                                ...profileForm,
                                experience: parseNumberInput(e.target.value, profileForm.experience ?? 0),
                              })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Location Address</label>
                          <input
                            type="text"
                            value={profileForm.location?.address || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, location: { ...(profileForm.location || {}), address: e.target.value } })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all"
                            placeholder="Street / area"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">City</label>
                            <input
                              type="text"
                              value={profileForm.location?.city || ''}
                              onChange={(e) => setProfileForm({ ...profileForm, location: { ...(profileForm.location || {}), city: e.target.value } })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">District</label>
                            <input
                              type="text"
                              value={profileForm.location?.district || ''}
                              onChange={(e) => setProfileForm({ ...profileForm, location: { ...(profileForm.location || {}), district: e.target.value } })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Landmark (optional)</label>
                          <input
                            type="text"
                            value={profileForm.location?.landmark || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, location: { ...(profileForm.location || {}), landmark: e.target.value } })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all"
                            placeholder="Near..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Professional Bio</label>
                          <textarea 
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-orange-500 transition-all"
                          />
                        </div>
                         <button type="submit" className="w-full py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Save Profile</button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-black/80 border border-red-600/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl p-8 space-y-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 mx-auto">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Confirm Deletion</h3>
                <p className="text-sm text-gray-400 mt-3">Permanently wipe this office hour slot?</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-xs text-red-400 font-semibold">⚠️ This action cannot be undone</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-black/40 border border-gray-600/30 text-gray-400 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-gray-500/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Modal */}
      <AnimatePresence>
        {showPermissionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-black/80 border border-orange-500/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl p-8 space-y-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/50 mx-auto">
                <Sparkles className="h-6 w-6 text-orange-400" />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Access Denied</h3>
                <p className="text-sm text-gray-400 mt-3">You are not currently assigned to update daily predictions.</p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
                <p className="text-xs text-orange-400 font-semibold">Please contact the admin to request permission.</p>
              </div>

              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => setShowPermissionModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all"
                >
                  Okay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Cancellation Modal */}
        {cancelBookingModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-black border-2 border-purple-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="text-center mb-6">
                <div className="bg-rose-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                  <XCircle className="h-8 w-8 text-rose-400" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">Cancel Meeting?</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Provide a reason for the client</p>
              </div>

              <div className="mb-6">
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Unexpected emergency..."
                  className="w-full h-24 bg-white/5 border border-purple-600/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-rose-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCancelBookingModal({ isOpen: false, bookingId: null });
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-700 transition-all font-semibold uppercase tracking-widest text-xs"
                >
                  Keep Meeting
                </button>
                <button
                  onClick={() => {
                    handleUpdateBookingStatus(cancelBookingModal.bookingId, 'cancelled', cancelReason);
                    setCancelBookingModal({ isOpen: false, bookingId: null });
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl text-white hover:from-rose-600 hover:to-red-700 transition-all font-black shadow-lg uppercase tracking-widest text-xs"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  </Layout>
);
};

export default AstrologerDashboard;