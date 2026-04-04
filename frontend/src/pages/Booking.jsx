// src/pages/Booking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
import { Calendar, Clock, Star, Phone, MapPin, Award, Globe, CheckCircle, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const Booking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [astrologers, setAstrologers] = useState([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      loadAstrologerById(id);
    } else {
      fetchAstrologers();
    }
    
    generateAvailableDates();
  }, [id]);

  useEffect(() => {
    if (selectedAstrologer?._id && selectedDate) {
      console.log(`🔔 Re-fetching availability - astrologer changed or date changed`);
      fetchAvailability();
    } else if (!selectedDate) {
      setAvailability({});
    }
  }, [selectedAstrologer?._id, selectedDate]);

  const generateAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      dates.push(format(addDays(new Date(), i), 'yyyy-MM-dd'));
    }
    setAvailableDates(dates);
  };

  const fetchAstrologers = async () => {
    try {
      const response = await API.get('/astrologers/approved');
      setAstrologers(response.data);
    } catch (error) {
      toast.error('Failed to fetch astrologers');
    }
  };

  const loadAstrologerById = async (astrologerId) => {
    setLoading(true);
    try {
      const response = await API.get(`/astrologers/${astrologerId}`);
      setSelectedAstrologer(response.data);
      setStep(2);
    } catch (error) {
      toast.error('Failed to load astrologer details');
      navigate('/booking');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      if (!selectedDate || !selectedAstrologer?._id) {
        console.warn('Missing selectedDate or astrologer ID');
        return;
      }
      
      const startDate = selectedDate;
      const endDate = format(addDays(new Date(selectedDate), 6), 'yyyy-MM-dd');
      
      console.log(`🔄 Fetching availability for ${selectedAstrologer._id} from ${startDate} to ${endDate}`);
      
      const response = await API.get(`/astrologers/${selectedAstrologer._id}/availability`, {
        params: { startDate, endDate }
      });
      
      console.log(`✅ Availability fetched:`, response.data);
      setAvailability(response.data);
    } catch (error) {
      console.error('Availability fetch error:', error);
      toast.error('Failed to fetch availability: ' + (error.response?.data?.message || error.message));
      setAvailability({});
    }
  };

  const handleAstrologerSelect = (astrologer) => {
    setSelectedAstrologer(astrologer);
    setStep(2);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        astrologerId: selectedAstrologer._id,
        date: selectedDate,
        time: selectedTime,
        paymentMethod,
        notes
      };

      const response = await API.post('/bookings', bookingData);
      
      setBookingDetails(response.data.booking);
      setBookingComplete(true);
      setStep(4);
      
      toast.success('Booking confirmed successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed');
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'pay_on_visit', label: 'Pay on Visit', description: 'Pay the astrologer directly during consultation' }
  ];

  if (loading && step === 1 && id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading astrologer details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-2 md:gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold ${
                  step >= s ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black' : 'bg-gray-700 text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-8 md:w-12 h-0.5 mx-1 md:mx-2 ${
                    step > s ? 'bg-gradient-to-r from-yellow-400 to-pink-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-400">
            <span className="w-20 text-center">Select</span>
            <span className="w-24 text-center">Schedule</span>
            <span className="w-20 text-center">Confirm</span>
          </div>
        </div>

        {step === 1 && !id && (
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 bg-clip-text text-transparent">
              Choose Your Astrologer
            </h1>
            <p className="text-center text-gray-300 mb-8">Connect with our verified Vedic astrologers</p>

            {/* Search */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-6 mb-8">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none text-white"
              />
            </div>

            {/* Astrologers Grid */}
            {astrologers.length === 0 ? (
              <div className="text-center py-12 bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30">
                <p className="text-gray-400">No astrologers available at the moment</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {astrologers
                  .filter(astro => astro.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((astrologer) => (
                    <div
                      key={astrologer._id}
                      onClick={() => handleAstrologerSelect(astrologer)}
                      className="bg-black/30 backdrop-blur-lg border-2 border-purple-500/30 rounded-xl p-6 hover:border-yellow-400 transition-all cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={astrologer.profileImage || `https://ui-avatars.com/api/?name=${astrologer.name}&background=8B5CF6&color=fff`}
                          alt={astrologer.name}
                          className="w-16 h-16 rounded-full border-2 border-purple-500/30 group-hover:border-yellow-400 transition"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-white">{astrologer.name}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span>{astrologer.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-gray-500">({astrologer.totalReviews || 0})</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Award className="h-4 w-4 text-purple-400" />
                          <span>{astrologer.experience} years experience</span>
                        </div>
                        {astrologer.bio && (
                          <p className="text-sm text-gray-400 line-clamp-2">{astrologer.bio}</p>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t border-purple-500/20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Per Session</span>
                          <span className="text-2xl font-bold text-yellow-400">₹{astrologer.pricing?.perSession || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedAstrologer && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-6 flex items-center gap-2 text-purple-300 hover:text-yellow-400 transition-colors"
            >
              ← Back to Astrologers
            </button>

            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-8">
              {/* Astrologer Info */}
              <div className="flex items-center gap-6 pb-6 mb-6 border-b border-purple-500/20">
                <img
                  src={selectedAstrologer.profileImage || `https://ui-avatars.com/api/?name=${selectedAstrologer.name}&background=8B5CF6&color=fff`}
                  alt={selectedAstrologer.name}
                  className="w-20 h-20 rounded-full border-2 border-yellow-400"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedAstrologer.name}</h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {selectedAstrologer.rating?.toFixed(1) || '0.0'} ({selectedAstrologer.totalReviews || 0} reviews)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Award className="h-4 w-4 text-purple-400" />
                      {selectedAstrologer.experience} years experience
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4">Select Date</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime('');
                        }}
                        className={`w-full p-3 rounded-lg border-2 transition text-left ${
                          selectedDate === date
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-purple-400" />
                          <div>
                            <div className="font-semibold text-white">
                              {format(parseISO(date), 'EEEE, MMMM do')}
                            </div>
                            <div className="text-sm text-gray-400">
                              {format(parseISO(date), 'yyyy-MM-dd')}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4">Select Time</h3>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availability[selectedDate] && availability[selectedDate].length > 0 ? (
                        availability[selectedDate].map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg border-2 transition text-center ${
                              selectedTime === time
                                ? 'border-yellow-400 bg-yellow-400/10'
                                : 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-900/20'
                            }`}
                          >
                            <Clock className="h-4 w-4 mx-auto mb-1 text-purple-400" />
                            {time}
                          </button>
                        ))
                      ) : (
                        <div className="text-gray-500 col-span-2 text-center py-8">
                          <p className="mb-2">No slots available for this date</p>
                          <p className="text-xs text-gray-600">Astrologer may not have added availability for {selectedDate}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Select a date first</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-purple-500/20">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleDateTimeSelect}
                  disabled={!selectedDate || !selectedTime}
                  className={`px-8 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-lg font-semibold transition ${
                    !selectedDate || !selectedTime ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
                  }`}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && selectedAstrologer && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-purple-500/30 p-8">
              <h2 className="text-2xl font-bold text-yellow-300 mb-6">Complete Your Booking</h2>
              
              {/* Booking Summary */}
              <div className="bg-purple-900/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-300 mb-3">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Astrologer</span>
                    <span className="text-white font-semibold">{selectedAstrologer.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Date</span>
                    <span className="text-white">{format(parseISO(selectedDate), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Session Price</span>
                    <span className="text-yellow-400">₹{selectedAstrologer.pricing?.perSession}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Platform Fee</span>
                    <span className="text-white">₹50</span>
                  </div>
                  <div className="border-t border-purple-500/30 my-2 pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-yellow-300">Total</span>
                      <span className="text-yellow-400 text-xl">₹{(selectedAstrologer.pricing?.perSession || 0) + 50}</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-yellow-300 mb-4">Payment Method</h3>
              <div className="mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentSelect(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition flex items-center justify-between ${
                      paymentMethod === method.id
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-900/20'
                    }`}
                  >
                    <div className="text-left">
                      <span className="font-semibold block text-white">{method.label}</span>
                      <span className="text-sm text-gray-400">{method.description}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.id ? 'border-yellow-400 bg-yellow-400' : 'border-gray-500'
                    }`}>
                      {paymentMethod === method.id && <div className="w-2 h-2 bg-black rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 outline-none text-white"
                  placeholder="Any specific questions or concerns?"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!paymentMethod || loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && bookingComplete && bookingDetails && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-2 border-green-500/30 p-8 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold mb-2 text-green-400">Booking Confirmed!</h2>
              <p className="text-gray-300 mb-8">Your consultation has been scheduled</p>

              <div className="bg-black/50 rounded-lg p-6 mb-8 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Booking ID</p>
                    <p className="font-mono text-sm text-yellow-400">{bookingDetails.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Astrologer</p>
                    <p className="font-medium text-white">{bookingDetails.astrologerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <p className="text-white">{format(parseISO(bookingDetails.date), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Time</p>
                    <p className="text-white">{bookingDetails.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Amount Paid</p>
                    <p className="text-xl font-bold text-yellow-400">₹{bookingDetails.totalAmount}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedAstrologer(null);
                    setSelectedDate('');
                    setSelectedTime('');
                    setPaymentMethod('');
                    setNotes('');
                    setBookingComplete(false);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Book Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;