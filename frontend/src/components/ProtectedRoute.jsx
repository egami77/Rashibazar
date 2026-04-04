// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getCurrentUser, getCurrentAstrologer, getCurrentRole, isAdmin } from "../services/auth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = getCurrentUser();
  const astrologer = getCurrentAstrologer();
  const currentRole = getCurrentRole();
  const admin = isAdmin();
  
  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem("token") && (user || astrologer);
  
  if (!isAuthenticated) {
    console.log("🔒 Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Check role permissions
  if (allowedRoles.length > 0) {
    // If admin is allowed and user is admin
    if (allowedRoles.includes('admin') && admin) {
      return children;
    }
    
    // Check if current role is in allowed roles
    if (!allowedRoles.includes(currentRole)) {
      console.log(`🔒 Role ${currentRole} not allowed, redirecting`);
      
      // Redirect to appropriate dashboard based on role
      if (admin || currentRole === 'user') {
        return <Navigate to="/home" replace />;
      } else if (currentRole === 'astrologer') {
        return <Navigate to="/astrologer/dashboard" replace />;
      }
      
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;