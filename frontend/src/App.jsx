// src/App.jsx
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Kundali from "./pages/Kundali";
import Compatibility from "./pages/Compatibility";
import Horoscope from "./pages/Horoscope";
import Booking from "./pages/Booking";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const location = useLocation();
  
  // Pages where navbar should be hidden
  const noNavbarRoutes = ["/", "/login", "/signup"];
  const hideNavbar = noNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/kundali" element={<Kundali />} />
        <Route path="/compatibility" element={<Compatibility />} />
        <Route path="/horoscope" element={<Horoscope />} />
        <Route path="/calendar" element={<Calendar />} />

        {/* Protected Pages */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;