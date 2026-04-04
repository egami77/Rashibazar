// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, Calendar, DollarSign, 
  Star, Clock, CheckCircle, XCircle, Loader2,
  BarChart3, TrendingUp, Award, Shield, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import API from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingAstrologers, setPendingAstrologers] = useState([]);
  const [allAstrologers, setAllAstrologers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [statsRes, pendingRes, astrologersRes, usersRes, bookingsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/astrologers/pending'),
        API.get('/admin/astrologers'),
        API.get('/admin/users'),
        API.get('/admin/bookings')
      ]);

      console.log("Stats data:", statsRes.data);
      console.log("Pending astrologers:", pendingRes.data);
      console.log("All astrologers:", astrologersRes.data);
      console.log("Users:", usersRes.data);
      console.log("Bookings:", bookingsRes.data);

      setStats(statsRes.data.stats || statsRes.data);
      setPendingAstrologers(pendingRes.data);
      setAllAstrologers(astrologersRes.data);
      setAllUsers(usersRes.data);
      setAllBookings(bookingsRes.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAstrologer = async (astrologerId, status) => {
    try {
      await API.put(`/admin/astrologers/${astrologerId}/status`, { status });
      toast.success(`Astrologer ${status} successfully`);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error updating astrologer:", error);
      toast.error(error.response?.data?.message || "Failed to update astrologer status");
    }
  };

  const handleDeleteAstrologer = async (astrologerId) => {
    if (!window.confirm("Are you sure you want to delete this astrologer?")) return;
    try {
      await API.delete(`/admin/astrologers/${astrologerId}`);
      toast.success("Astrologer deleted successfully");
      loadDashboardData();
    } catch (error) {
      console.error("Error deleting astrologer:", error);
      toast.error(error.response?.data?.message || "Failed to delete astrologer");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      loadDashboardData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-500/20 text-yellow-300',
      'approved': 'bg-green-500/20 text-green-300',
      'rejected': 'bg-red-500/20 text-red-300',
      'confirmed': 'bg-green-500/20 text-green-300',
      'completed': 'bg-blue-500/20 text-blue-300',
      'cancelled': 'bg-red-500/20 text-red-300'
    };
    return badges[status] || 'bg-gray-500/20 text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading admin dashboard...</p>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-300">Manage platform, astrologers, users, and bookings</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-blue-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-400 font-semibold">Total Users</div>
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalUsers || 0}</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-400 font-semibold">Astrologers</div>
                <UserCheck className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalAstrologers || 0}</div>
              <div className="text-xs text-gray-400 mt-1">{stats.approvedAstrologers || 0} approved</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-yellow-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-yellow-400 font-semibold">Pending</div>
                <UserX className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.pendingAstrologers || 0}</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-purple-400 font-semibold">Revenue</div>
                <DollarSign className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">₹{stats.totalRevenue || 0}</div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-purple-500/30 pb-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'pending', label: `Pending (${pendingAstrologers.length})`, icon: UserX },
            { id: 'astrologers', label: 'Astrologers', icon: UserCheck },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'bookings', label: 'Bookings', icon: Calendar }
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

        {/* Pending Astrologers Tab */}
        {activeTab === 'pending' && (
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Pending Astrologer Approvals</h2>
            
            {pendingAstrologers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingAstrologers.map((astro) => (
                  <div key={astro._id} className="bg-black/50 p-6 rounded-lg border border-purple-500/30">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={astro.profileImage || `https://ui-avatars.com/api/?name=${astro.name}&background=8B5CF6&color=fff`}
                          alt={astro.name}
                          className="w-16 h-16 rounded-full border-2 border-yellow-400"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-white">{astro.name}</h3>
                          <p className="text-sm text-gray-400">{astro.email}</p>
                          <p className="text-sm text-gray-400">{astro.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveAstrologer(astro._id, 'approved')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveAstrologer(astro._id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-xs text-gray-400 mb-1">Experience</div>
                        <div className="text-white font-semibold">{astro.experience} years</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-xs text-gray-400 mb-1">Price Per Session</div>
                        <div className="text-yellow-400 font-bold">₹{astro.pricing?.perSession || 0}</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-xs text-gray-400 mb-1">Joined</div>
                        <div className="text-white">{format(new Date(astro.createdAt), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>
                    
                    {astro.bio && (
                      <div className="mt-4 p-3 bg-black/30 rounded">
                        <div className="text-xs text-gray-400 mb-1">Bio</div>
                        <p className="text-gray-300 text-sm">{astro.bio}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Astrologers Tab */}
        {activeTab === 'astrologers' && (
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">All Astrologers</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="p-3 text-left text-gray-400">Name</th>
                    <th className="p-3 text-left text-gray-400">Email</th>
                    <th className="p-3 text-left text-gray-400">Experience</th>
                    <th className="p-3 text-left text-gray-400">Price</th>
                    <th className="p-3 text-left text-gray-400">Status</th>
                    <th className="p-3 text-left text-gray-400">Rating</th>
                    <th className="p-3 text-left text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allAstrologers.map((astro) => (
                    <tr key={astro._id} className="border-b border-purple-500/20 hover:bg-purple-900/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={astro.profileImage || `https://ui-avatars.com/api/?name=${astro.name}&background=8B5CF6&color=fff`}
                            alt={astro.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-white">{astro.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-300">{astro.email}</td>
                      <td className="p-3 text-gray-300">{astro.experience}y</td>
                      <td className="p-3 text-yellow-400">₹{astro.pricing?.perSession || 0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(astro.approvalStatus)}`}>
                          {astro.approvalStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white">{astro.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteAstrologer(astro._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">Platform Users</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="p-3 text-left text-gray-400">Name</th>
                    <th className="p-3 text-left text-gray-400">Email</th>
                    <th className="p-3 text-left text-gray-400">Phone</th>
                    <th className="p-3 text-left text-gray-400">Joined</th>
                    <th className="p-3 text-left text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user._id} className="border-b border-purple-500/20 hover:bg-purple-900/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=8B5CF6&color=fff`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-300">{user.email}</td>
                      <td className="p-3 text-gray-300">{user.phone || '-'}</td>
                      <td className="p-3 text-gray-300">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-yellow-300">All Bookings</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="p-3 text-left text-gray-400">Booking ID</th>
                    <th className="p-3 text-left text-gray-400">User</th>
                    <th className="p-3 text-left text-gray-400">Astrologer</th>
                    <th className="p-3 text-left text-gray-400">Date & Time</th>
                    <th className="p-3 text-left text-gray-400">Amount</th>
                    <th className="p-3 text-left text-gray-400">Status</th>
                    <th className="p-3 text-left text-gray-400">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-purple-500/20 hover:bg-purple-900/20">
                      <td className="p-3 text-gray-300 text-sm">{booking.bookingId}</td>
                      <td className="p-3 text-gray-300">{booking.userId?.name || 'N/A'}</td>
                      <td className="p-3 text-gray-300">{booking.astrologerId?.name || 'N/A'}</td>
                      <td className="p-3 text-gray-300">
                        {booking.date ? format(new Date(booking.date), 'MMM dd, yyyy') : 'N/A'} at {booking.time}
                      </td>
                      <td className="p-3 text-yellow-400">₹{booking.amount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(booking.bookingStatus)}`}>
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;