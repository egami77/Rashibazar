// src/pages/Booking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
import { Calendar, Clock, Star, Phone, MapPin, Award, CheckCircle, Loader2, User, Sparkles, Map, Home, Building2 } from 'lucide-react';
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
      if (!selectedDate || !selectedAstrologer?._id) return;
      const startDate = selectedDate;
      const endDate = format(addDays(new Date(selectedDate), 6), 'yyyy-MM-dd');
      const response = await API.get(`/astrologers/${selectedAstrologer._id}/availability`, {
        params: { startDate, endDate }
      });
      setAvailability(response.data);
    } catch (error) {
      toast.error('Failed to fetch availability');
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
      const booking = response.data.booking;

      if (paymentMethod === 'khalti') {
        const khaltiInitResponse = await API.post('/khalti/initiate', {
          bookingId: booking._id,
          amount: (selectedAstrologer.pricing?.perSession || 0) + 50,
          customerInfo: {
            name: user?.name || 'Customer',
            email: user?.email || '',
            phone: user?.phone || '9800000000'
          }
        });

        if (khaltiInitResponse.data.success) {
          window.location.href = khaltiInitResponse.data.payment_url;
        } else {
          setError('Failed to initiate Khalti payment');
          toast.error('Failed to initiate Khalti payment');
        }
      } else {
        setBookingDetails(booking);
        setBookingComplete(true);
        setStep(4);
        toast.success('Booking confirmed successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed');
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'pay_on_visit', label: 'Pay on Visit', description: 'Pay the astrologer directly during your in-person consultation' },
    { id: 'khalti', label: 'Khalti Wallet', description: 'Pay securely with Khalti digital wallet' }
  ];

  if (loading && step === 1 && id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading astrologer details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-center items-center gap-2 md:gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-500 ${step >= s ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-black scale-110 shadow-lg shadow-yellow-500/20' : 'bg-gray-700 text-gray-400'
                  }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-1 md:mx-2 transition-all duration-500 ${step > s ? 'bg-gradient-to-r from-yellow-400 to-pink-500' : 'bg-gray-700'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-3 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            <span className={`w-20 text-center transition-colors ${step === 1 ? 'text-yellow-400' : ''}`}>Expert</span>
            <span className={`w-24 text-center transition-colors ${step === 2 ? 'text-yellow-400' : ''}`}>Schedule</span>
            <span className={`w-20 text-center transition-colors ${step === 3 ? 'text-yellow-400' : ''}`}>Confirm</span>
          </div>
        </div>

        {step === 1 && !id && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-5xl md:text-7xl font-extrabold text-center mb-4 bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">
              Choose Your Expert
            </h1>
            <p className="text-center text-purple-200 text-lg md:text-xl mb-12 max-w-2xl mx-auto">Connect with certified Vedic practitioners for profound in-person consultations.</p>

            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-purple-400/30 p-8 mb-12 shadow-2xl">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by expert name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-black/40 border border-purple-600/30 rounded-full focus:border-purple-500 focus:ring-0 outline-none text-white transition-all text-lg"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {astrologers
                .filter(astro => astro.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((astrologer) => (
                  <div
                    key={astrologer._id}
                    onClick={() => handleAstrologerSelect(astrologer)}
                    className="bg-black/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-8 hover:border-purple-500 transition-all duration-300 cursor-pointer group relative hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.3)]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="flex items-center gap-6 mb-8 relative">
                      <div className="relative">
                        <img
                          src={astrologer.profileImage || `https://ui-avatars.com/api/?name=${astrologer.name}&background=8B5CF6&color=fff`}
                          alt={astrologer.name}
                          className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-white/10 group-hover:border-yellow-400/50 transition-all"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 fill-black" /> {astrologer.rating?.toFixed(1) || '5.0'}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-pink-400 mb-1">{astrologer.name}</h3>
                        <p className="text-sm text-gray-300">{astrologer.experience} Years Exp</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-8 line-clamp-3 leading-relaxed">{astrologer.bio || 'Professional Vedic astrologer dedicated to providing accurate predictions and remedies.'}</p>

                    <div className="flex justify-between items-end pt-6 border-t border-white/5">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Session Rate</p>
                        <span className="text-2xl font-semibold text-yellow-300">Npr {astrologer.pricing?.perSession || 0}</span>
                      </div>
                      <button className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-pink-500 group-hover:text-black transition-all">
                        <MapPin className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {step === 2 && selectedAstrologer && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest"
            >
              ← Back to Experts
            </button>

            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-purple-400/30 p-10 md:p-14 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                <Calendar className="h-64 w-64 text-white" />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-10 pb-12 mb-12 border-b border-white/5 relative">
                <img
                  src={selectedAstrologer.profileImage || `https://ui-avatars.com/api/?name=${selectedAstrologer.name}&background=8B5CF6&color=fff`}
                  alt={selectedAstrologer.name}
                  className="w-32 h-32 rounded-[2rem] border-2 border-yellow-400/30 object-cover"
                />
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-bold text-yellow-400 mb-4">{selectedAstrologer.name}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-6">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold">{selectedAstrologer.rating?.toFixed(1) || '5.0'} Rating</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                      <Award className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-bold">{selectedAstrologer.experience} Years Experience</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12 relative">
                <div>
                  <h3 className="text-lg font-black text-yellow-400 uppercase italic mb-6 flex items-center gap-3">
                    <Calendar className="h-5 w-5" /> Select Date
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-white/10">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime('');
                        }}
                        className={`p-4 rounded-[1.5rem] border transition-all text-left group ${selectedDate === date
                          ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          }`}
                      >
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedDate === date ? 'text-black/60' : 'text-gray-500'}`}>
                          {format(parseISO(date), 'EEEE')}
                        </p>
                        <p className="text-lg font-black tracking-tight">{format(parseISO(date), 'MMM dd')}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-yellow-400 uppercase italic mb-6 flex items-center gap-3">
                    <Clock className="h-5 w-5" /> Select Time
                  </h3>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availability[selectedDate] && availability[selectedDate].length > 0 ? (
                        availability[selectedDate].map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-4 rounded-2xl border transition-all text-center font-bold ${selectedTime === time
                              ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                              }`}
                          >
                            {time}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                          <Clock className="h-8 w-8 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No slots available for this date</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                      <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest">Select a date to see availability</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-12 pt-8 border-t border-white/5">
                <button
                  onClick={handleDateTimeSelect}
                  disabled={!selectedDate || !selectedTime}
                  className={`px-12 py-5 bg-gradient-to-r from-yellow-400 to-orange-600 text-black rounded-2xl font-black uppercase tracking-widest transition-all ${!selectedDate || !selectedTime ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20'
                    }`}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && selectedAstrologer && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
             <button
              onClick={() => setStep(2)}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest"
            >
              ← Back to Schedule
            </button>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="md:col-span-2 space-y-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-purple-400/30 p-10 shadow-2xl">
                  <h2 className="text-2xl font-semibold text-yellow-300 mb-8">Payment Method</h2>
                  
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentSelect(method.id)}
                        className={`w-full p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${paymentMethod === method.id
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                      >
                        <div className="text-left flex items-center gap-6">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === method.id ? 'bg-yellow-400 text-black' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                            {method.id === 'khalti' ? <Building2 className="h-6 w-6" /> : <Home className="h-6 w-6" />}
                          </div>
                          <div>
                            <span className={`font-black uppercase italic block tracking-tight ${paymentMethod === method.id ? 'text-yellow-400' : 'text-white'}`}>{method.label}</span>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{method.description}</span>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === method.id ? 'border-yellow-400 bg-yellow-400' : 'border-white/10'
                          }`}>
                          {paymentMethod === method.id && <div className="w-3 h-3 bg-black rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 mb-8">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1 mb-2 block">Additional Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-[2rem] focus:border-yellow-400/50 outline-none text-white transition-all resize-none"
                      placeholder="Share any specific concerns or questions for the astrologer..."
                    />
                  </div>

                  <div className="mt-12">
                    <button
                      onClick={handleBooking}
                      disabled={!paymentMethod || loading}
                      className="w-full py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Confirm In-Person Session'}
                    </button>
                    <p className="text-center text-[10px] text-gray-600 font-black uppercase tracking-widest mt-6">By continuing, you agree to our terms of service.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-black/40 backdrop-blur-sm border border-purple-600/30 rounded-xl p-8">
                  <h3 className="text-lg font-semibold text-pink-400 mb-6">Booking Summary</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Schedule</p>
                        <p className="text-sm font-bold text-white">{format(parseISO(selectedDate), 'MMM dd')} @ {selectedTime}</p>
                      </div>
                    </div>

                    <div className="space-y-3 px-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-gray-500">Consultation</span>
                        <span className="text-white">Npr {selectedAstrologer.pricing?.perSession}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-gray-500">Service Fee</span>
                        <span className="text-white">Npr 50</span>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-black text-yellow-400 uppercase italic">Total</span>
                          <span className="text-3xl font-black text-white tracking-tighter">Npr {(selectedAstrologer.pricing?.perSession || 0) + 50}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-[2rem] p-6 text-center">
                   <MapPin className="h-6 w-6 text-orange-400 mx-auto mb-4" />
                   <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Physical Visit</p>
                   <p className="text-[10px] text-gray-500 mt-2 font-medium leading-relaxed">This is an in-person session. Please arrive at the astrologer's location 10 minutes early.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && bookingComplete && bookingDetails && (
          <div className="animate-in zoom-in duration-500 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-emerald-500/30 p-12 text-center relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                <CheckCircle className="h-64 w-64 text-emerald-500" />
              </div>

              <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/40 relative">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>

              <h2 className="text-5xl font-bold text-emerald-400 mb-4">Confirmed!</h2>
              <p className="text-emerald-200 text-lg mb-12">Your in-person session is scheduled.</p>

              <div className="bg-black/40 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-10 mb-12 text-left space-y-6">
                <div className="grid grid-cols-2 gap-y-8">
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Session ID</p>
                    <p className="font-mono text-sm text-yellow-400">{bookingDetails._id || 'BCK-4921'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Expert</p>
                    <p className="font-black text-white uppercase italic">{selectedAstrologer.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Date</p>
                    <p className="font-bold text-white">{format(parseISO(bookingDetails.date), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Time</p>
                    <p className="font-bold text-white">{bookingDetails.time}</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Consultation Type</p>
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> In-Person Visit
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Amount Paid</p>
                    <p className="text-2xl font-black text-white">Npr {bookingDetails.amount + 50}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
                >View My Bookings</button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-transparent border border-purple-600 text-purple-200 rounded-full hover:text-yellow-400 hover:border-yellow-400 transition-all"
                >Back Home</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
