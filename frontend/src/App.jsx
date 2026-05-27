// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import API from "./services/api";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import Kundali from "./pages/Kundali";
import Compatibility from "./pages/Compatibility";
import Horoscope from "./pages/Horoscope";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import PaymentCallback from "./pages/PaymentCallback";
import AstrologerDashboard from "./pages/AstrologerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MaintenancePage from "./pages/MaintenancePage";

function App() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const { data } = await API.get('/system/config');
        setMaintenanceMode(data.MAINTENANCE_MODE === 'true' || data.MAINTENANCE_MODE === true);
      } catch (error) {
        console.error("System sync failed");
      } finally {
        setLoading(false);
      }
    };
    checkSystemStatus();
  }, []);

  // Determine if we should show maintenance page
  // Admins and Astrologers are always exempt — maintenance only affects regular users
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAstrologerPath = location.pathname.startsWith('/astrologer');
  const isLoginPath = location.pathname === '/login';
  const isLandingPath = location.pathname === '/';
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const storedAstrologer = JSON.parse(localStorage.getItem('astrologer') || 'null');
  const isAdmin = storedUser?.role === 'admin';
  const isAstrologer = storedAstrologer !== null || storedUser?.role === 'astrologer';

  if (loading) return null;

  // Show maintenance page ONLY to regular users (not admins, not astrologers)
  if (maintenanceMode && !isAdmin && !isAstrologer && !isAdminPath && !isAstrologerPath && !isLoginPath && !isLandingPath) {
    return <MaintenancePage />;
  }

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* User routes (including admin) */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kundali" 
          element={
            <ProtectedRoute allowedRoles={['user', 'astrologer', 'admin']}>
              <Kundali />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/compatibility" 
          element={
            <ProtectedRoute allowedRoles={['user', 'astrologer', 'admin']}>
              <Compatibility />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/horoscope" 
          element={
            <ProtectedRoute allowedRoles={['user', 'astrologer', 'admin']}>
              <Horoscope />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute allowedRoles={['user', 'astrologer', 'admin']}>
              <Calendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['user', 'astrologer', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Booking routes - User only */}
        <Route 
          path="/booking" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Booking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/booking/:id" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Booking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-bookings" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MyBookings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment/callback" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <PaymentCallback />
            </ProtectedRoute>
          } 
        />
        
        {/* Astrologer routes */}
        <Route 
          path="/astrologer/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['astrologer']}>
              <AstrologerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;