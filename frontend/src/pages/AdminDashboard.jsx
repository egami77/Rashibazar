// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Calendar, DollarSign,
  Star, Clock, CheckCircle, XCircle, Loader2,
  BarChart3, TrendingUp, Award, Shield, Eye,
  LayoutDashboard, Search, Bell, Settings, LogOut,
  ChevronRight, ArrowUpRight, Activity, Trash2,
  Filter, Download, MessageSquare, Megaphone,
  Briefcase, MapPin, CreditCard, RefreshCw, X,
  Globe, Wrench, Save, ToggleLeft as Toggle, ExternalLink,
  BookOpen, Mail, Phone, CalendarDays
} from 'lucide-react';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingAstrologers, setPendingAstrologers] = useState([]);
  const [pendingProfileUpdates, setPendingProfileUpdates] = useState([]);
  const [allAstrologers, setAllAstrologers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetType, setResetType] = useState('expert'); // 'expert' or 'user'
  
  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Horoscope Assignment
  const [showHoroscopeAssignModal, setShowHoroscopeAssignModal] = useState(false);
  const [horoscopeAssign, setHoroscopeAssign] = useState(false);
  
  const [announcement, setAnnouncement] = useState({ title: '', message: '', target: 'all' });
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, pendingProfileRes, astrologersRes, usersRes, bookingsRes, settingsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/astrologers/pending'),
        API.get('/admin/astrologers/profile/pending'),
        API.get('/admin/astrologers'),
        API.get('/admin/users'),
        API.get('/admin/bookings'),
        API.get('/admin/settings')
      ]);

      setStats(statsRes.data.stats || statsRes.data);
      setPendingAstrologers(pendingRes.data);
      setPendingProfileUpdates(pendingProfileRes.data);
      setAllAstrologers(astrologersRes.data);
      setAllUsers(usersRes.data);
      setAllBookings(bookingsRes.data);
      setSystemSettings(settingsRes.data || []);
    } catch (error) {
      toast.error("Access denied or session expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAstrologer = async (astrologerId, status) => {
    try {
      await API.put(`/admin/astrologers/${astrologerId}/status`, { status });
      toast.success(`Access ${status === 'approved' ? 'granted' : 'denied'}.`);
      loadDashboardData();
      setSelectedExpert(null);
    } catch (error) {
      toast.error("Permission update failed");
    }
  };

  const handleApproveProfileUpdate = async (astrologerId) => {
    try {
      await API.put(`/admin/astrologers/${astrologerId}/profile/approve`);
      toast.success("Profile changes published.");
      loadDashboardData();
      setSelectedExpert(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve profile changes");
    }
  };

  const handleRejectProfileUpdate = async (astrologerId) => {
    const reason = prompt("Reason for rejecting profile update (optional):") || "";
    try {
      await API.put(`/admin/astrologers/${astrologerId}/profile/reject`, { reason });
      toast.success("Profile changes rejected.");
      loadDashboardData();
      setSelectedExpert(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject profile changes");
    }
  };

  const handleResetAstrologerPassword = async () => {
    if (!resetPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    setResetPasswordLoading(true);
    try {
      await API.put(`/admin/astrologers/${selectedExpert._id}/reset-password`, {
        newPassword: resetPassword
      });
      toast.success("Astrologer password reset successfully!");
      setShowPasswordResetModal(false);
      setResetPassword('');
      setSelectedExpert(null);
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleResetUserPassword = async () => {
    if (!resetPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    setResetPasswordLoading(true);
    try {
      await API.put(`/admin/users/${selectedUser._id}/reset-password`, {
        newPassword: resetPassword
      });
      toast.success("User password reset successfully!");
      setShowPasswordResetModal(false);
      setResetPassword('');
      setSelectedUser(null);
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleDeleteUser = async (userId, type = 'user') => {
    setConfirmAction({ action: 'delete', userId, type });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    const { userId, type } = confirmAction;
    setShowConfirmModal(false);
    try {
      const endpoint = type === 'astrologer' ? `/admin/astrologers/${userId}` : `/admin/users/${userId}`;
      await API.delete(endpoint);
      toast.success("Identity purged from system.");
      loadDashboardData();
    } catch (error) {
      toast.error("Operation restricted.");
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    setBroadcastLoading(true);
    try {
      await API.post('/admin/broadcast', announcement);
      toast.success("Broadcast transmitted successfully.");
      setShowAnnouncementModal(false);
      setAnnouncement({ title: '', message: '', target: 'all' });
    } catch (error) {
      toast.error("Transmission failed.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleUpdateSetting = async (key, value, description) => {
    try {
      await API.post('/admin/settings', { key, value, description });
      toast.success(`Config ${key} synced.`);
      const updated = await API.get('/admin/settings');
      setSystemSettings(updated.data);
    } catch (error) {
      toast.error("Config sync failed.");
    }
  };

  const handleAssignHoroscope = async () => {
    try {
      await API.put(`/admin/astrologers/${selectedExpert._id}/assign-horoscope`, {
        canUpdateHoroscope: horoscopeAssign
      });
      toast.success(`Horoscope access ${horoscopeAssign ? 'granted' : 'revoked'}.`);
      setShowHoroscopeAssignModal(false);
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update horoscope access");
    }
  };

  // Filtered lists
  const filteredAstrologers = useMemo(() => 
    allAstrologers.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase())),
    [allAstrologers, searchTerm]
  );

  const filteredUsers = useMemo(() => 
    allUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())),
    [allUsers, searchTerm]
  );

  const todayBookings = useMemo(() => {
    const today = startOfDay(new Date());
    return allBookings.filter(b => {
      const bDate = startOfDay(parseISO(b.date));
      return bDate.getTime() === today.getTime();
    });
  }, [allBookings]);

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'approved': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'confirmed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'completed': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'cancelled': 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    };
    return badges[status] || 'bg-gray-500/10 text-gray-400 border-white/5';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <RefreshCw className="h-10 w-10 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white flex pt-20">
      {/* Sidebar */}
      <aside className="w-72 bg-black/40 backdrop-blur-md border-r border-purple-600/30 sticky top-20 h-[calc(100vh-5rem)] hidden lg:flex flex-col p-8 z-50">
        <div className="mb-12">
          <div className="flex items-center gap-3">
             <Shield className="h-8 w-8 text-purple-500" />
             <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent tracking-wide">ADMIN</h2>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black -mt-1 opacity-50">Core Console v2.0</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          {[
            { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
            {
              id: 'pending',
              label: 'Approvals',
              icon: UserX,
              count: pendingAstrologers.length + pendingProfileUpdates.length
            },
            { id: 'astrologers', label: 'Experts', icon: Briefcase },
            { id: 'users', label: 'Client Nodes', icon: Users },
            { id: 'bookings', label: 'Financial Ledger', icon: CreditCard },
            { id: 'settings', label: 'Core Config', icon: Settings }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-full transition-all group ${activeTab === item.id ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black shadow-lg font-bold' : 'text-gray-400 hover:bg-purple-900/30 hover:text-white'}`}
            >
              <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className="text-xs uppercase tracking-widest">{item.label}</span>
              {item.count > 0 && <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-black">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-2">
          <button onClick={() => setShowAnnouncementModal(true)} className="w-full flex items-center gap-4 px-6 py-4 text-emerald-400 hover:bg-emerald-500/10 rounded-2xl transition-all group">
            <Megaphone className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Broadcast</span>
          </button>
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-6 py-4 text-gray-600 hover:text-rose-500 transition-colors">
            <LogOut className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto ">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 tracking-wide">System Console</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Security Stream
                </span>
                <span className="text-gray-800">|</span>
                <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Root@RashiBazar</span>
              </div>
            </div>

            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
               <input 
                 type="text" 
                 placeholder="Filter system identifiers..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-black/40 border border-purple-600/30 rounded-full pl-14 pr-6 py-4 text-sm outline-none focus:border-purple-500 transition-all text-white"
               />
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Active Users', val: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Approved Experts', val: stats.approvedAstrologers, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Pending Access', val: pendingAstrologers.length, icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Total Revenue', val: `Npr ${stats.totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-400/10' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-black/40 border border-purple-600/30 p-8 rounded-xl group hover:border-purple-500 transition-all relative overflow-hidden shadow-md">
                      <div className={`absolute -right-4 -top-4 w-20 h-20 ${stat.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <stat.icon className={`h-6 w-6 ${stat.color} mb-6 relative z-10`} />
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white mt-2 relative z-10">{stat.val}</h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center justify-between px-4">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Live Traffic Node</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{todayBookings.length} Packets detected</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {todayBookings.length > 0 ? todayBookings.map(booking => (
                          <div key={booking._id} className="bg-black/40 border border-purple-600/30 p-6 rounded-xl flex items-center gap-6 group hover:border-purple-500 transition-all shadow-md">
                             <div className="h-16 w-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/5">
                                <Activity className="h-8 w-8 text-orange-500/30 group-hover:text-orange-500 transition-colors" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                   <p className="font-black text-white uppercase text-sm tracking-tight truncate">{booking.userId?.name}</p>
                                   <ChevronRight className="h-4 w-4 text-gray-800" />
                                   <p className="font-black text-orange-500 uppercase text-sm tracking-tight truncate">{booking.astrologerId?.name}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                   <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                                      <Clock className="h-3.5 w-3.5" /> {booking.time}
                                   </span>
                                   <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${getStatusBadge(booking.bookingStatus)}`}>
                                      {booking.bookingStatus}
                                   </span>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-black text-white">Npr {booking.amount}</p>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">{booking.paymentStatus}</p>
                             </div>
                          </div>
                        )) : (
                          <div className="text-center py-24 bg-black/40 border border-dashed border-purple-600/30 rounded-xl">
                             <p className="text-gray-500 font-semibold uppercase tracking-widest text-xs">No active bookings detected for today</p>
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-8">
                       <div className="bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-purple-600/20 border border-purple-600/30 p-8 rounded-xl shadow-2xl relative overflow-hidden group backdrop-blur-sm">
                         <Shield className="absolute -right-10 -bottom-10 h-40 w-40 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                          <h4 className="text-lg font-bold text-yellow-300 uppercase mb-6 relative z-10">Primary Actions</h4>
                         <div className="space-y-3 relative z-10">
                            {[
                              { label: 'Access Requests', icon: Shield, tab: 'pending', color: 'amber' },
                              { label: 'Platform Broadcast', icon: Megaphone, modal: true, color: 'emerald' },
                              { label: 'Financial Audits', icon: CreditCard, tab: 'bookings', color: 'blue' }
                            ].map((btn, idx) => (
                              <button 
                                key={idx}
                                onClick={() => btn.modal ? setShowAnnouncementModal(true) : setActiveTab(btn.tab)}                                 
                                className="w-full bg-black/40 border border-purple-600/30 hover:border-purple-500 text-white p-4 rounded-full flex items-center justify-between transition-all"
                              >
                                <span className="font-black text-[10px] uppercase tracking-widest">{btn.label}</span>
                                <btn.icon className={`h-4 w-4 text-${btn.color}-400`} />
                              </button>
                            ))}
                         </div>
                      </div>

                       <div className="bg-black/40 border border-purple-600/30 p-8 rounded-xl backdrop-blur-sm shadow-md">
                         <h4 className="text-lg font-bold text-pink-400 uppercase mb-6 tracking-wide">System Logs</h4>
                        <div className="space-y-5">
                           {[
                             { log: 'Database Kernel Optimized', time: '14m' },
                             { log: 'Expert Approval Node #42', time: '1h' },
                             { log: 'Financial Sync Complete', time: '4h' },
                             { log: 'Backup Cluster Verified', time: '12h' }
                           ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                               <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{item.log}</p>
                               <span className="text-[9px] text-gray-700 font-black uppercase shrink-0">{item.time}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pending' && (
              <motion.div key="pending" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                 <header className="flex items-center justify-between px-4">
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 tracking-wide">
                      Approvals
                    </h2>
                    <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full uppercase tracking-[0.2em]">
                      {(pendingAstrologers.length + pendingProfileUpdates.length)} Pending Nodes
                    </span>
                 </header>

                 <div className="space-y-14">
                   <div>
                     <div className="flex items-center justify-between px-4 mb-8">
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Access Requests</h3>
                       <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full uppercase tracking-[0.2em]">
                         {pendingAstrologers.length} Pending
                       </span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {pendingAstrologers.map(astro => (
                         <motion.div 
                           whileHover={{ y: -5 }}
                           key={astro._id}                         
                           className="bg-black/40 border border-purple-600/30 p-8 rounded-xl relative overflow-hidden group hover:border-purple-500 transition-all shadow-md"
                         >
                           <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.03] bg-orange-500 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>
                           <div className="flex items-center gap-6 mb-10">
                             <img src={astro.profileImage || `https://ui-avatars.com/api/?name=${astro.name}&background=8B5CF6&color=fff`} className="h-20 w-20 rounded-[2rem] border-2 border-white/10 object-cover" alt="" />
                             <div>
                               <h4 className="text-2xl font-black text-white uppercase tracking-tight">{astro.name}</h4>
                               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{astro.email}</p>
                             </div>
                           </div>

                           <div className="grid grid-cols-3 gap-4 mb-10">
                             <div className="bg-black/20 p-5 rounded-3xl border border-white/5 text-center">
                               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Experience</p>
                               <p className="text-lg font-black text-white">{astro.experience}Y</p>
                             </div>
                             <div className="bg-black/20 p-5 rounded-3xl border border-white/5 text-center">
                               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Price</p>
                               <p className="text-lg font-black text-orange-500">{astro.pricing?.perSession}</p>
                             </div>
                             <div className="bg-black/20 p-5 rounded-3xl border border-white/5 text-center flex flex-col justify-center">
                               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Action</p>
                               <button onClick={() => setSelectedExpert(astro)} className="text-[9px] font-black text-blue-400 uppercase flex items-center justify-center gap-1 hover:text-blue-300">
                                 Details <ExternalLink className="h-2.5 w-2.5" />
                               </button>
                             </div>
                           </div>

                           <div className="flex gap-4">
                             <button
                               onClick={() => handleApproveAstrologer(astro._id, 'approved')}
                               className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                             >
                               Grant Access
                             </button>
                             <button
                               onClick={() => handleApproveAstrologer(astro._id, 'rejected')}
                               className="flex-1 py-4 bg-black/40 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-all"
                             >
                               Deny
                             </button>
                           </div>
                         </motion.div>
                       ))}
                       {pendingAstrologers.length === 0 && (
                         <div className="col-span-2 text-center py-40 bg-black/40 border border-dashed border-purple-600/30 rounded-xl">
                           <Shield className="h-20 w-20 text-purple-400 mx-auto mb-8 opacity-30" />
                           <p className="text-gray-500 font-semibold uppercase tracking-widest text-xs">No pending approval requests</p>
                         </div>
                       )}
                     </div>
                   </div>

                   <div>
                     <div className="flex items-center justify-between px-4 mb-8">
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Profile Updates</h3>
                       <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full uppercase tracking-[0.2em]">
                         {pendingProfileUpdates.length} Pending
                       </span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {pendingProfileUpdates.map(astro => (
                         <motion.div 
                           whileHover={{ y: -5 }}
                           key={astro._id}                         
                           className="bg-black/40 border border-purple-600/30 p-8 rounded-xl relative overflow-hidden group hover:border-purple-500 transition-all shadow-md"
                         >
                           <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.03] bg-emerald-500 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>
                           <div className="flex items-center gap-6 mb-10">
                             <img src={astro.profileImage || `https://ui-avatars.com/api/?name=${astro.name}&background=8B5CF6&color=fff`} className="h-20 w-20 rounded-[2rem] border-2 border-white/10 object-cover" alt="" />
                             <div>
                               <h4 className="text-2xl font-black text-white uppercase tracking-tight">{astro.pendingProfile?.changes?.name || astro.name}</h4>
                               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{astro.email}</p>
                             </div>
                           </div>

                           <div className="grid grid-cols-3 gap-4 mb-10">
                             <div className="bg-black/20 p-5 rounded-3xl border border-white/5 text-center">
                               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Experience</p>
                               <p className="text-lg font-black text-white">{astro.pendingProfile?.changes?.experience ?? astro.experience}Y</p>
                             </div>
                             <div className="bg-black/20 p-5 rounded-3xl border border-white/5 text-center">
                               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Price</p>
                               <p className="text-lg font-black text-orange-500">{astro.pendingProfile?.changes?.pricing?.perSession ?? astro.pricing?.perSession}</p>
                             </div>
                             <div className="bg-black/20 p-5 rounded-3xl border border-white/5 text-center flex flex-col justify-center">
                               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Action</p>
                               <button onClick={() => setSelectedExpert(astro)} className="text-[9px] font-black text-blue-400 uppercase flex items-center justify-center gap-1 hover:text-blue-300">
                                 Details <ExternalLink className="h-2.5 w-2.5" />
                               </button>
                             </div>
                           </div>

                           <div className="flex gap-4">
                             <button
                               onClick={() => handleApproveProfileUpdate(astro._id)}
                               className="flex-1 py-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-black rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                             >
                               Publish Profile
                             </button>
                             <button
                               onClick={() => handleRejectProfileUpdate(astro._id)}
                               className="flex-1 py-4 bg-black/40 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-all"
                             >
                               Reject
                             </button>
                           </div>
                         </motion.div>
                       ))}
                       {pendingProfileUpdates.length === 0 && (
                         <div className="col-span-2 text-center py-40 bg-black/40 border border-dashed border-purple-600/30 rounded-xl">
                           <Shield className="h-20 w-20 text-purple-400 mx-auto mb-8 opacity-30" />
                           <p className="text-gray-500 font-semibold uppercase tracking-widest text-xs">No profile updates awaiting approval</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
               <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <header className="flex items-center justify-between px-4">
                     <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 tracking-wide">Core Configuration</h2>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Global Sync Status:</span>
                       <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/10">
                              <Globe className="h-8 w-8 text-blue-500" />
                           </div>
                           <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Platform Variables</h3>
                        </div>

                        <div className="space-y-8">
                           {[
                             { id: 'COMMISSION_RATE', label: 'Commission Fee (%)', val: '15', desc: 'Global platform cut per transaction' },
                             { id: 'MIN_SESSION_PRICE', label: 'Min. Session Price', val: '500', desc: 'Threshold for expert pricing' },
                             { id: 'BOOKING_WINDOW', label: 'Booking Horizon', val: '30', desc: 'Maximum lead time in days' }
                           ].map(item => (
                             <div key={item.id} className="group">
                                <div className="flex items-center justify-between mb-3 px-1">
                                   <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.label}</label>
                                   <p className="text-[8px] text-gray-800 font-black">{item.id}</p>
                                </div>
                                <div className="flex gap-4">
                                   <input type="text" defaultValue={systemSettings.find(s => s.key === item.id)?.value || item.val} className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-8 py-5 text-white font-bold text-sm outline-none focus:border-blue-500 focus:bg-black/60 transition-all shadow-inner" />
                                   <button onClick={(e) => handleUpdateSetting(item.id, e.target.closest('div').querySelector('input').value, item.desc)} className="h-[60px] w-[60px] bg-white/5 rounded-2xl flex items-center justify-center text-gray-600 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition-all group-hover:scale-105">
                                      <Save className="h-5 w-5" />
                                   </button>
                                </div>
                                <p className="text-[9px] text-gray-600 mt-3 italic px-2 font-medium opacity-70 leading-relaxed">{item.desc}</p>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/10">
                              {/* <Shield className="h-8 w-8 text-rose-500" /> */}
                           </div>
                           <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">System Status</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-black/40 border border-purple-600/30 p-6 rounded-xl flex items-center justify-between group hover:border-rose-500/30 transition-all">
                              <div>
                                 <h4 className="text-sm font-black text-white uppercase tracking-tight">Maintenance Mode</h4>
                                 <p className="text-[10px] text-gray-600 mt-2 font-medium">Temporarily offline public access</p>
                              </div>
                              <button onClick={() => handleUpdateSetting('MAINTENANCE_MODE', !systemSettings.find(s => s.key === 'MAINTENANCE_MODE')?.value, 'System status')} className={`h-12 w-24 rounded-full relative transition-all duration-500 shadow-xl ${systemSettings.find(s => s.key === 'MAINTENANCE_MODE')?.value ? 'bg-rose-600' : 'bg-gray-800'}`}>
                                 <div className={`absolute top-1.5 h-9 w-9 bg-white rounded-full transition-all duration-500 shadow-lg ${systemSettings.find(s => s.key === 'MAINTENANCE_MODE')?.value ? 'left-13' : 'left-1.5'}`}></div>
                              </button>
                           </div>

                            <div className="bg-black/40 border border-purple-600/20 p-6 rounded-xl flex items-center justify-between opacity-40 cursor-not-allowed">
                              <div>
                                 <h4 className="text-sm font-black text-white uppercase tracking-tight">Auto-Audit Logs</h4>
                                 <p className="text-[10px] text-gray-600 mt-2 font-medium">Independent transaction verification</p>
                              </div>
                              <div className="h-12 w-24 bg-emerald-600/30 rounded-full relative">
                                 <div className="absolute top-1.5 left-13 h-9 w-9 bg-white/50 rounded-full"></div>
                              </div>
                           </div>

                           <div className="pt-6">
                              <button className="w-full py-8 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all">Emergency Core Reset</button>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {(activeTab === 'astrologers' || activeTab === 'users' || activeTab === 'bookings') && (
               <motion.div key="tables" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                  <header className="flex items-center justify-between px-4">
                     <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 tracking-wide">
                        {activeTab === 'astrologers' ? 'Expert Directory' : activeTab === 'users' ? 'Client Nodes' : 'Financial Ledger'}
                    </h2>
                    <div className="flex items-center gap-3">
                       <button className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-600 hover:text-white transition-all"><Download className="h-5 w-5" /></button>
                       <button className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-600 hover:text-white transition-all"><Filter className="h-5 w-5" /></button>
                    </div>
                  </header>

                   <div className="bg-black/40 border border-purple-600/30 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          {activeTab === 'astrologers' ? (
                            <>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Expert Identity</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Stats</th>
                              {/* <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Communication</th> */}
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Pricing</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Security</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Cmd</th>
                            </>
                          ) : activeTab === 'users' ? (
                            <>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Client Identity</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Communication</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Created</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Audit</th>
                            </>
                          ) : (
                            <>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Transaction ID</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Node Link</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Revenue</th>
                              <th className="px-10 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Status</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeTab === 'astrologers' && filteredAstrologers.map(astro => (
                          <tr key={astro._id} className="group hover:bg-white/[0.03] transition-all">
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-5">
                                  <img src={astro.profileImage || `https://ui-avatars.com/api/?name=${astro.name}&background=8B5CF6&color=fff`} className="h-14 w-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                  <div>
                                     <p className="font-black text-white uppercase text-sm tracking-tight">{astro.name}</p>
                                     <p className="text-[10px] text-gray-600 font-bold tracking-widest">{astro.email}</p>
                                     <p className="text-[10px] text-gray-600 font-bold tracking-widest">{astro.phone}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5">
                                     <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                     <span className="text-xs font-black text-white">{astro.rating?.toFixed(1) || '0.0'}</span>
                                  </div>
                                  <span className="text-gray-800">|</span>
                                  <span className="text-[9px] font-black text-gray-500 uppercase">{astro.experience}Y Exp</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-sm font-black text-orange-500 uppercase tracking-tighter">Npr {astro.pricing?.perSession}</td>
                            <td className="px-10 py-8">
                               <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${getStatusBadge(astro.approvalStatus)}`}>
                                  {astro.approvalStatus}
                               </span>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedExpert(astro);
                                      setResetType('expert');
                                      setShowPasswordResetModal(true);
                                    }} 
                                    className="p-3 text-gray-700 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                                    title="Reset Password"
                                  >
                                     <RefreshCw className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setSelectedExpert(astro);
                                      setHoroscopeAssign(astro.canUpdateHoroscope || false);
                                      setShowHoroscopeAssignModal(true);
                                    }} 
                                    className="p-3 text-gray-700 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all"
                                    title="Assign Horoscope"
                                  >
                                     <BookOpen className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleDeleteUser(astro._id, 'astrologer')} className="p-3 text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                     <Trash2 className="h-4 w-4" />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                        {activeTab === 'users' && filteredUsers.map(user => (
                          <tr key={user._id} className="group hover:bg-white/[0.03] transition-all">
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-5">
                                  <div className="h-14 w-14 bg-white/5 rounded-full flex items-center justify-center font-black text-orange-500 border border-white/10 text-xl">
                                     {user.name.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="font-black text-white uppercase text-sm tracking-tight">{user.name}</p>
                                     <p className="text-[10px] text-gray-600 font-bold tracking-widest">{user.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-xs text-gray-500 font-black uppercase tracking-[0.1em]">{user.phone || 'NONE_SPECIFIED'}</td>
                            <td className="px-10 py-8 text-[10px] text-gray-700 font-black uppercase tracking-widest">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setResetType('user');
                                      setShowPasswordResetModal(true);
                                    }} 
                                    className="p-3 text-gray-700 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                                    title="Reset Password"
                                  >
                                     <RefreshCw className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleDeleteUser(user._id)} className="p-3 text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                     <Trash2 className="h-4 w-4" />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                        {activeTab === 'bookings' && allBookings.map(booking => (
                          <tr key={booking._id} className="group hover:bg-white/[0.03] transition-all">
                            <td className="px-10 py-8">
                               <p className="text-[10px] font-black text-white uppercase tracking-tighter mb-1.5 opacity-50">#{booking._id.slice(-12)}</p>
                               <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                                  <CalendarDays className="h-3 w-3" /> {format(new Date(booking.date), 'MMM dd')} @ {booking.time}
                               </p>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex flex-col gap-1.5">
                                  <p className="text-[10px] font-black text-white uppercase tracking-tight">C: {booking.userId?.name || 'ANONYMOUS'}</p>
                                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-tight italic">E: {booking.astrologerId?.name || 'REMOVED'}</p>
                               </div>
                            </td>
                            <td className="px-10 py-8 font-black text-white text-sm tracking-tighter">Npr {booking.amount}</td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-4">
                                  <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${getStatusBadge(booking.bookingStatus)}`}>
                                     {booking.bookingStatus}
                                  </span>
                                  <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${booking.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                     {booking.paymentStatus}
                                  </span>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-black/80 border border-purple-600/40 w-full max-w-xl rounded-2xl p-12 relative shadow-2xl backdrop-blur-xl">
                <button onClick={() => setShowAnnouncementModal(false)} className="absolute top-12 right-12 text-gray-700 hover:text-white transition-colors group">
                   <X className="h-10 w-10 group-hover:rotate-90 transition-transform" />
                </button>
                 <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-8 flex items-center gap-5">
                   <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                      <Megaphone className="h-6 w-6 text-purple-400" />
                   </div>
                   Global Broadcast
                </h3>
                
                <form onSubmit={handleSendAnnouncement} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-2">Transmission Title</label>
                       <input type="text" value={announcement.title} onChange={e => setAnnouncement({...announcement, title: e.target.value})} className="w-full bg-black/40 border border-purple-600/30 rounded-full px-6 py-4 text-white text-sm outline-none focus:border-purple-500 transition-all" placeholder="Enter broadcast header..." required />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-2">Data Payload</label>
                       <textarea value={announcement.message} onChange={e => setAnnouncement({...announcement, message: e.target.value})} className="w-full h-40 bg-black/40 border border-purple-600/30 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-purple-500 transition-all resize-none" placeholder="Transmission content..." required />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <label className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-2">Target Cluster</label>
                          <select value={announcement.target} onChange={e => setAnnouncement({...announcement, target: e.target.value})} className="w-full bg-black/40 border border-purple-600/30 rounded-full px-6 py-4 text-white text-sm outline-none focus:border-purple-500 appearance-none cursor-pointer">
                            <option value="all">ALL NODES</option>
                            <option value="users">CLIENTS ONLY</option>
                            <option value="astrologers">EXPERTS ONLY</option>
                         </select>
                      </div>
                      <div className="flex items-end">
                          <button type="submit" disabled={broadcastLoading} className="w-full h-[56px] bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg disabled:opacity-50">
                            {broadcastLoading ? 'Transmitting...' : 'Send Broadcast'}
                         </button>
                      </div>
                   </div>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expert Profile Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-black/80 border border-purple-600/40 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative backdrop-blur-xl">
                <button onClick={() => setSelectedExpert(null)} className="absolute top-12 right-12 z-10 text-gray-600 hover:text-white transition-colors group">
                   <X className="h-10 w-10 group-hover:rotate-90 transition-transform" />
                </button>
                
                <div className="flex flex-col md:flex-row h-full">
                   <div className="md:w-1/2 relative h-96 md:h-auto">
                      <img src={selectedExpert.profileImage || `https://ui-avatars.com/api/?name=${selectedExpert.name}&background=8B5CF6&color=fff`} className="absolute inset-0 w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent md:bg-gradient-to-r"></div>
                   </div>
                   
                   <div className="flex-1 p-12 md:p-16 space-y-10 overflow-y-auto max-h-[90vh]">
                      <div>
                         <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">{selectedExpert.name}</h3>
                         <div className="flex flex-wrap gap-4 items-center">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/20 px-3 py-1 rounded-full">Pending Security Audit</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                               <MapPin className="h-3 w-3" /> Global Identity
                            </span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-1.5">
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2"><Mail className="h-3 w-3" /> Email</p>
                            <p className="text-sm font-bold text-white truncate">{selectedExpert.email}</p>
                         </div>
                         <div className="space-y-1.5">
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2"><Phone className="h-3 w-3" /> Secure Line</p>
                            <p className="text-sm font-bold text-white">{selectedExpert.phone || 'RESTRICTED'}</p>
                         </div>
                         <div className="space-y-1.5">
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2"><Award className="h-3 w-3" /> Experience</p>
                            <p className="text-sm font-bold text-white">{selectedExpert.experience} Years Active</p>
                         </div>
                         <div className="space-y-1.5">
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2"><DollarSign className="h-3 w-3" /> Rate</p>
                            <p className="text-sm font-black text-orange-500">Npr {selectedExpert.pricing?.perSession}</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Professional Bio</p>
                         <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <p className="text-gray-400 text-sm leading-relaxed italic">
                               "{selectedExpert.bio || "No biography transmitted for this identity."}"
                            </p>
                         </div>
                      </div>

                      {selectedExpert.pendingProfile?.status === 'pending' && (
                        <div className="space-y-4">
                          <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Bell className="h-3.5 w-3.5" /> Pending Profile Update
                          </p>
                          <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl space-y-2">
                            <p className="text-sm text-gray-300">
                              This expert has submitted profile changes. Approve to publish to the user side.
                            </p>
                            <div className="text-xs text-gray-400 space-y-1">
                              <div><span className="text-gray-500">Name:</span> {selectedExpert.pendingProfile?.changes?.name || '—'}</div>
                              <div><span className="text-gray-500">Phone:</span> {selectedExpert.pendingProfile?.changes?.phone || '—'}</div>
                              <div><span className="text-gray-500">Experience:</span> {selectedExpert.pendingProfile?.changes?.experience ?? '—'}</div>
                              <div><span className="text-gray-500">Rate:</span> Npr {selectedExpert.pendingProfile?.changes?.pricing?.perSession ?? '—'}</div>
                              <div><span className="text-gray-500">Location:</span> {selectedExpert.pendingProfile?.changes?.location?.address || '—'}</div>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <button onClick={() => handleApproveProfileUpdate(selectedExpert._id)} className="flex-1 py-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-black rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg">
                              Publish Profile
                            </button>
                            <button onClick={() => handleRejectProfileUpdate(selectedExpert._id)} className="flex-1 py-4 bg-black/40 border border-rose-500/30 text-rose-400 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-rose-500/10 transition-all">
                              Reject Update
                            </button>
                          </div>
                        </div>
                      )}

                       <div className="flex gap-4 pt-6">
                          <button onClick={() => handleApproveAstrologer(selectedExpert._id, 'approved')} className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg">Authorize</button>
                          <button onClick={() => handleApproveAstrologer(selectedExpert._id, 'rejected')} className="flex-1 py-4 bg-black/40 border border-rose-500/30 text-rose-400 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-rose-500/10 transition-all">Deny Access</button>
                          <button onClick={() => {
                            setResetType('expert');
                            setShowPasswordResetModal(true);
                          }} className="flex-1 py-4 bg-black/40 border border-blue-500/30 text-blue-400 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-blue-500/10 transition-all">Reset Password</button>
                      </div>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showPasswordResetModal && (selectedExpert || selectedUser) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-black/80 border border-blue-600/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative backdrop-blur-xl p-8 space-y-6">
              <button onClick={() => {
                setShowPasswordResetModal(false);
                setResetPassword('');
                setSelectedExpert(null);
                setSelectedUser(null);
              }} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>

              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Reset Password</h3>
                <p className="text-sm text-gray-400 mt-2">
                  For: <span className="text-blue-400 font-bold">{selectedExpert?.name || selectedUser?.name}</span>
                  {resetType === 'user' && <span className="text-xs text-gray-600 ml-2">(User)</span>}
                  {resetType === 'expert' && <span className="text-xs text-gray-600 ml-2">(Expert)</span>}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-black uppercase tracking-widest">New Password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Enter new password (8+ chars, letter, number, special char)"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                />
                <p className="text-xs text-gray-500">Password must contain: letters, numbers, and special characters (@$!%*?&)</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowPasswordResetModal(false);
                    setResetPassword('');
                    setSelectedExpert(null);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-3 bg-black/40 border border-gray-600/30 text-gray-400 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-gray-500/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={resetType === 'expert' ? handleResetAstrologerPassword : handleResetUserPassword}
                  disabled={resetPasswordLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetPasswordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <p className="text-sm text-gray-400 mt-3">Permanently wipe this {confirmAction.type} record?</p>
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

      {/* Horoscope Assignment Modal */}
      <AnimatePresence>
        {showHoroscopeAssignModal && selectedExpert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-black/80 border border-purple-600/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl p-8 space-y-6">
              <button onClick={() => setShowHoroscopeAssignModal(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>

              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Assign Horoscope</h3>
                <p className="text-sm text-gray-400 mt-2">Expert: <span className="text-purple-400 font-bold">{selectedExpert.name}</span></p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-purple-500/30 hover:bg-purple-500/10 cursor-pointer transition-all">
                  <input
                    type="radio"
                    checked={horoscopeAssign}
                    onChange={() => setHoroscopeAssign(true)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">Assign</p>
                    <p className="text-xs text-gray-500">This expert will update horoscopes</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-600/30 hover:bg-gray-500/10 cursor-pointer transition-all">
                  <input
                    type="radio"
                    checked={!horoscopeAssign}
                    onChange={() => setHoroscopeAssign(false)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">Remove</p>
                    <p className="text-xs text-gray-500">Revoke horoscope update access</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowHoroscopeAssignModal(false)}
                  className="flex-1 py-3 bg-black/40 border border-gray-600/30 text-gray-400 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-gray-500/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignHoroscope}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all"
                >
                  {horoscopeAssign ? 'Assign' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;