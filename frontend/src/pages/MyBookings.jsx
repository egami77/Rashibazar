// src/pages/MyBookings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isBefore } from 'date-fns';
import { Calendar, Clock, User, XCircle, Loader2, Star, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';
import AnnouncementPanel from '../components/AnnouncementPanel';
import BookingTokenModal from '../components/BookingTokenModal';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [tokenBookingId, setTokenBookingId] = useState(null);
  const [ratingDraft, setRatingDraft] = useState({});
  const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await API.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (bookingId) => {
    setCancelModal({ isOpen: true, bookingId });
    setCancellationReason('');
  };

  const handleConfirmCancel = async () => {
    const { bookingId } = cancelModal;
    try {
      await API.put(`/bookings/${bookingId}/cancel`, { reason: cancellationReason || null });
      toast.success("Booking cancelled successfully");
      setCancelModal({ isOpen: false, bookingId: null });
      setCancellationReason('');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleCancel = (bookingId) => {
    handleCancelClick(bookingId);
  };

  const setDraft = (bookingId, patch) => {
    setRatingDraft((prev) => ({
      ...prev,
      [bookingId]: { ...(prev[bookingId] || {}), ...patch },
    }));
  };

  const submitRating = async (bookingId) => {
    const draft = ratingDraft[bookingId] || {};
    try {
      await API.post(`/bookings/${bookingId}/rate`, {
        score: draft.score,
        comment: draft.comment || "",
      });
      toast.success("Rating submitted.");
      setRatingDraft((prev) => ({ ...prev, [bookingId]: {} }));
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    }
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

  const getPaymentStatusBadge = (status) => {
    return status === 'paid'
      ? 'bg-green-500/20 text-green-300'
      : 'bg-yellow-500/20 text-yellow-300';
  };

  const canCancel = (booking) => {
    if (booking.bookingStatus !== 'pending' && booking.bookingStatus !== 'confirmed') return false;

    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.time.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    return isBefore(new Date(), bookingDateTime);
  };

  const processedBookings = bookings.map(booking => {
    if (booking.paymentMethod === 'khalti' && (booking.paymentStatus === 'pending' || booking.paymentStatus === 'failed')) {
      return { ...booking, bookingStatus: 'cancelled', cancellationReason: booking.cancellationReason || 'Khalti Payment Failed/Pending' };
    }
    return booking;
  });

  const filteredBookings = processedBookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.bookingStatus === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <AnnouncementPanel className="mb-8" />
        <h1 className="text-5xl md:text-7xl font-extrabold text-center mb-4 bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">
          My Bookings
        </h1>
        <p className="text-center text-purple-200 text-lg mb-8">View and manage your consultation bookings</p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-full font-semibold transition-all capitalize ${filter === status
                  ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black shadow-lg hover:scale-105'
                  : 'bg-black/40 border border-purple-600/30 text-gray-300 hover:border-purple-500'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-600/30 p-12 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/30 mb-4">
              <Calendar className="h-10 w-10 text-purple-400" />
            </div>
            <p className="text-gray-400 text-lg mb-4">No bookings found</p>
            <button
              onClick={() => navigate('/booking')}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
            >
              Book an Astrologer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-600/30 p-6 hover:border-purple-500 transition-all shadow-md group relative overflow-hidden"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.astrologerId?.profileImage || `https://ui-avatars.com/api/?name=${booking.astrologerId?.name}&background=8B5CF6&color=fff`}
                      alt={booking.astrologerId?.name}
                      className="w-12 h-12 rounded-full border-2 border-purple-500"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-yellow-300">{booking.astrologerId?.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>{booking.astrologerId?.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-500">({booking.astrologerId?.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border capitalize ${getStatusBadge(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Token: <span className="text-purple-300">{booking.bookingId}</span>
                  </div>
                  <button
                    onClick={() => setTokenBookingId(booking._id)}
                    className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-widest text-purple-300 hover:bg-purple-500/20 transition-colors"
                  >
                    Open Token
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-black/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <MapPin className="h-3 w-3 text-orange-400" />
                      Type
                    </div>
                    <div className="text-white font-semibold text-sm">In-Person</div>
                  </div>

                  <div className="bg-black/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Calendar className="h-3 w-3" />
                      Date
                    </div>
                    <div className="text-white font-semibold text-sm">
                      {format(parseISO(booking.date), 'MMM dd')}
                    </div>
                  </div>

                  <div className="bg-black/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Clock className="h-3 w-3" />
                      Time
                    </div>
                    <div className="text-white font-semibold text-sm">{booking.time}</div>
                  </div>

                  <div className="bg-black/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <User className="h-3 w-3" />
                      Payment
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase inline-block ${getPaymentStatusBadge(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </div>
                  </div>

                  <div className="bg-black/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      Amount
                    </div>
                    <div className="text-yellow-400 font-bold text-sm">Npr {booking.amount}</div>
                  </div>
                </div>

                {booking.bookingStatus === 'completed' && !booking.rating?.score && (
                  <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">
                      Rate this consultation
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setDraft(booking._id, { score: n })}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors"
                          aria-label={`Rate ${n} stars`}
                        >
                          <Star className={`h-5 w-5 ${((ratingDraft[booking._id]?.score || 0) >= n) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={ratingDraft[booking._id]?.comment || ""}
                      onChange={(e) => setDraft(booking._id, { comment: e.target.value })}
                      className="w-full h-24 bg-black/40 border border-purple-600/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-all resize-none"
                      placeholder="Optional feedback..."
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        type="button"
                        disabled={!ratingDraft[booking._id]?.score}
                        onClick={() => submitRating(booking._id)}
                        className="px-6 py-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                      >
                        Submit Rating
                      </button>
                    </div>
                  </div>
                )}

                {booking.rating?.score && (
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">
                      Your rating: {booking.rating.score}/5
                    </p>
                    {booking.rating.comment && (
                      <p className="text-sm text-gray-300">{booking.rating.comment}</p>
                    )}
                  </div>
                )}

                {booking.notes && (
                  <div className="mb-4 p-3 bg-black/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Your Notes:</p>
                    <p className="text-gray-300 text-sm">{booking.notes}</p>
                  </div>
                )}

                {booking.cancellationReason && (
                  <div className="mb-4 p-3 bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-400 mb-1">Cancellation Reason:</p>
                    <p className="text-gray-300 text-sm">{booking.cancellationReason}</p>
                  </div>
                )}

                {canCancel(booking) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCancelClick(booking._id)}
                      className="flex items-center gap-2 px-6 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {tokenBookingId && (
        <BookingTokenModal bookingId={tokenBookingId} onClose={() => setTokenBookingId(null)} />
      )}

      {/* Cancellation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black border-2 border-purple-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="bg-rose-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Cancel Booking?</h2>
              <p className="text-gray-400">Are you sure you want to cancel this booking?</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">Reason for cancellation (optional)</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Tell us why you're cancelling..."
                className="w-full h-24 bg-white/5 border border-purple-600/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 focus:bg-white/10 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancelModal({ isOpen: false, bookingId: null });
                  setCancellationReason('');
                }}
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-700 transition-all font-semibold"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl text-white hover:from-rose-600 hover:to-red-700 transition-all font-semibold shadow-lg"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;