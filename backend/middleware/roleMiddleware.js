// backend/middleware/roleMiddleware.js
export const isAstrologer = (req, res, next) => {
  if (req.userRole !== 'astrologer') {
    return res.status(403).json({ message: "Access denied. Astrologer only." });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

export const isUser = (req, res, next) => {
  if (req.userRole !== 'user') {
    return res.status(403).json({ message: "Access denied. User only." });
  }
  next();
};

export const isAdminOrAstrologer = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'astrologer') {
    return res.status(403).json({ message: "Access denied. Admin or Astrologer only." });
  }
  next();
};