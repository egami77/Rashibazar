// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Astrologer from "../models/Astrologer.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      console.log("No authorization header");
      // Allow guest access for generate endpoint
      if (req.path === "/generate" && req.method === "POST") {
        console.log("Allowing guest access for kundali generation");
        return next();
      }
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists based on role
    if (decoded.role === 'user') {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.userId = user._id;
      req.userRole = user.role;
      req.user = user;
    } else if (decoded.role === 'astrologer') {
      const astrologer = await Astrologer.findById(decoded.id).select('-password');
      if (!astrologer) {
        return res.status(401).json({ message: "Astrologer not found" });
      }
      req.userId = astrologer._id;
      req.userRole = 'astrologer';
      req.astrologer = astrologer;
    } else if (decoded.role === 'admin') {
      const admin = await User.findById(decoded.id).select('-password');
      if (!admin || admin.role !== 'admin') {
        return res.status(401).json({ message: "Admin not found" });
      }
      req.userId = admin._id;
      req.userRole = admin.role;
      req.user = admin;
    } else {
      return res.status(401).json({ message: "Invalid role" });
    }
    
    console.log(`Authenticated ${req.userRole}: ${req.userId}`);
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    
    // If token is invalid but it's a guest generate request, allow it
    if (req.path === "/generate" && req.method === "POST") {
      console.log("Allowing guest access despite invalid token");
      return next();
    }
    
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;