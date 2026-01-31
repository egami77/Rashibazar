// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      console.log("🔒 No authorization header");
      // Allow guest access for generate endpoint
      if (req.path === "/generate" && req.method === "POST") {
        console.log("👥 Allowing guest access for kundali generation");
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
    req.userId = decoded.id;
    console.log(`✅ Authenticated user: ${req.userId}`);
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    
    // If token is invalid but it's a guest generate request, allow it
    if (req.path === "/generate" && req.method === "POST") {
      console.log("👥 Allowing guest access despite invalid token");
      return next();
    }
    
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;