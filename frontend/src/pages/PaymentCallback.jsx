// src/pages/PaymentCallback.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [bookingDetails, setBookingDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const pidx = searchParams.get('pidx');
      const bookingId = searchParams.get('bookingId') || searchParams.get('purchase_order_id');
      const khaltiStatus = searchParams.get('status');

      console.log('[PaymentCallback] Received params:', {
        pidx,
        bookingId,
        khaltiStatus,
      });

      if (!pidx || !bookingId) {
        setStatus('failed');
        setErrorMessage('Missing payment verification details');
        toast.error('Payment verification failed - missing details');
        return;
      }

      // Call backend to verify payment
      const response = await API.post('/khalti/verify', {
        pidx,
        bookingId,
      });

      if (response.data.success) {
        console.log('[PaymentCallback] Payment verified successfully');
        setBookingDetails(response.data.booking);
        setStatus('success');
        toast.success('Payment successful! Your booking is confirmed.');

        // Redirect to booking confirmation after 3 seconds
        setTimeout(() => {
          navigate('/my-bookings');
        }, 3000);
      } else {
        setStatus('failed');
        setErrorMessage(response.data.error || 'Payment verification failed');
        toast.error(response.data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('[PaymentCallback] Verification error:', error);
      setStatus('failed');
      setErrorMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Payment verification failed. Please contact support.'
      );
      toast.error(errorMessage);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verifying Your Payment</h2>
          <p className="text-gray-400">Please wait while we confirm your payment with Khalti...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>

            <h2 className="text-4xl font-bold mb-4 text-emerald-400">Payment Successful!</h2>
            <p className="text-gray-300 mb-8">Your booking has been confirmed</p>

            {bookingDetails && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8 text-left">
                <h3 className="text-lg font-semibold text-yellow-300 mb-4">Booking Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Booking ID</span>
                    <span className="text-white font-mono">{bookingDetails.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="text-yellow-400 font-semibold">Npr{bookingDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Status</span>
                    <span className="text-green-400 font-semibold">{bookingDetails.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Booking Status</span>
                    <span className="text-blue-400 font-semibold capitalize">{bookingDetails.bookingStatus}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-gray-300 text-sm">Redirecting you to your bookings in 3 seconds...</p>
              <div className="flex gap-4">
                <button
                  className="flex-1 px-8 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
                >
                  View My Bookings
                </button>
                <button
                  className="flex-1 px-8 py-3 bg-transparent border border-purple-600 text-purple-200 rounded-full hover:text-yellow-400 hover:border-yellow-400 transition-all"
                >
                  Book Another Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-rose-500/30 p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/20">
              <AlertCircle className="h-12 w-12 text-rose-400" />
            </div>

            <h2 className="text-4xl font-bold mb-4 text-rose-400">Payment Failed</h2>
            <p className="text-gray-300 mb-8">{errorMessage || 'Unable to verify your payment'}</p>

            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-red-300">
                <strong>What to do next:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check your Khalti wallet balance</li>
                  <li>Try the payment again with correct details</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </p>
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 px-8 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Try Again
              </button>
              <button
                className="flex-1 px-8 py-3 bg-transparent border border-purple-600 text-purple-200 rounded-full hover:text-yellow-400 hover:border-yellow-400 transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PaymentCallback;
