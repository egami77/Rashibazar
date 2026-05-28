import React, { useEffect, useState } from "react";
import { X, Calendar, Clock, MapPin, User, DollarSign, Ticket } from "lucide-react";
import { format, parseISO } from "date-fns";
import API from "../services/api";

const BookingTokenModal = ({ bookingId, onClose }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/bookings/my-bookings/${bookingId}`);
        setBooking(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookingId]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-black/80 border border-purple-600/40 w-full max-w-2xl rounded-2xl p-10 relative shadow-2xl backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-8 w-8" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
            <Ticket className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Booking Token</p>
            <h3 className="text-2xl font-black text-white">{booking?.bookingId || "Loading..."}</h3>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-300">Loading booking details...</p>
        ) : !booking ? (
          <p className="text-rose-400">Booking not found.</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Astrologer</p>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-white font-bold">{booking.astrologerId?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Meeting Time</p>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-white font-bold">{format(parseISO(booking.date), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm mt-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-white font-bold">{booking.time}</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Price</p>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-yellow-400 font-black">Npr {booking.amount}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-widest">
                  Booked at: {booking.createdAt ? format(parseISO(booking.createdAt), "MMM dd, yyyy · h:mm a") : "—"}
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Location</p>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="text-white font-bold">
                    {booking.astrologerId?.location?.address ||
                    booking.astrologerId?.location?.city ||
                    booking.astrologerId?.location?.district
                      ? `${booking.astrologerId?.location?.address || ""}${booking.astrologerId?.location?.address ? ", " : ""}${booking.astrologerId?.location?.city || ""}${booking.astrologerId?.location?.city ? ", " : ""}${booking.astrologerId?.location?.district || ""}`.replace(/,\s*$/, "")
                      : "Not provided"}
                  </p>
                  {booking.astrologerId?.location?.landmark && (
                    <p className="text-gray-400 mt-1">Landmark: {booking.astrologerId.location.landmark}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTokenModal;

