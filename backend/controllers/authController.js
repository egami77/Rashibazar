// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Astrologer from "../models/Astrologer.js";

// Password strength rule
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const hasEmailService = () =>
  Boolean(process.env.RESEND_API_KEY?.trim()) ||
  Boolean(
    process.env.EMAIL_USER?.trim() &&
      process.env.EMAIL_PASS?.replace(/\s/g, "")
  );

const verifyEmailConfig = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "");
  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set on the server");
  }
  return { user, pass };
};

/** Resend HTTP API — reliable on Render (Gmail SMTP often times out on cloud hosts) */
const sendViaResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM?.trim() ||
    "RashiBazar <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail}`);
  }
};

const sendMailWithGmail = (mailOptions, port, secure, timeoutMs) => {
  const { user, pass } = verifyEmailConfig();
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 40000,
  });

  return Promise.race([
    transport.sendMail(mailOptions),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email delivery timed out")), timeoutMs)
    ),
  ]);
};

/** Try Gmail on 587 then 465 (Render blocks or slows one port sometimes) */
const sendMailWithGmailFallback = async (mailOptions, timeoutMs = 45000) => {
  const attempts = [
    { port: 587, secure: false },
    { port: 465, secure: true },
  ];
  let lastError;
  for (const { port, secure } of attempts) {
    try {
      await sendMailWithGmail(mailOptions, port, secure, timeoutMs);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`Gmail SMTP port ${port} failed:`, err.message);
    }
  }
  throw lastError;
};

const deliverResetEmail = async (mailOptions) => {
  if (process.env.RESEND_API_KEY?.trim()) {
    await sendViaResend({
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
    });
    return;
  }
  await sendMailWithGmailFallback(mailOptions);
};

const getForgotPasswordErrorMessage = (err) => {
  const code = err?.code;
  const msg = err?.message || "";

  if (/resend/i.test(msg)) {
    return "Email API error. Check RESEND_API_KEY on Render.";
  }
  if (code === "EAUTH" || /invalid login|authentication/i.test(msg)) {
    return "Gmail login failed. Use a Gmail App Password in EMAIL_PASS, or set RESEND_API_KEY (recommended for hosting).";
  }
  if (msg === "Email delivery timed out" || code === "ETIMEDOUT") {
    return "Gmail SMTP timed out from the server. Add RESEND_API_KEY on Render (free at resend.com) for reliable email.";
  }
  if (["ESOCKET", "ECONNECTION", "ECONNREFUSED", "ENOTFOUND"].includes(code)) {
    return "Could not reach the mail server from Render. Use RESEND_API_KEY instead of Gmail SMTP.";
  }
  return "Could not send the reset email. Please try again later.";
};

// Register User (Store only in Users collection)
export const registerUser = async (req, res) => {
  try {
    console.log("Received user registration:", req.body);

    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, include one number and one special character",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // Create user ONLY (no astrologer profile)
    const user = new User({ 
      name, 
      email, 
      password: hashed,
      phone,
      role: 'user'
    });
    
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Register Astrologer (Store ONLY in Astrologers collection, not in Users)
export const registerAstrologer = async (req, res) => {
  try {
    console.log("Received astrologer registration:", req.body);

    const { name, email, password, confirmPassword, phone, experience, pricePerSession } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, include one number and one special character",
      });
    }

    const existing = await Astrologer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // Create astrologer directly in Astrologers collection
    const astrologer = new Astrologer({
      name,
      email,
      password: hashed,
      phone,
      experience: experience || 0,
      pricing: {
        perSession: pricePerSession || 0
      },
      bio: "",
      approvalStatus: 'pending', // Set to pending by default
      isActive: false // Not active until approved
    });
    
    await astrologer.save();

    const token = jwt.sign(
      { id: astrologer._id, role: 'astrologer' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful! Your profile is pending admin approval.",
      token,
      astrologer: {
        id: astrologer._id,
        name: astrologer.name,
        email: astrologer.email,
        phone: astrologer.phone,
        approvalStatus: astrologer.approvalStatus
      }
    });
  } catch (err) {
    console.error("registerAstrologer error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Login - Handle both roles separately
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // First, check if it's an admin (admins are in User collection with role 'admin')
    if (role === 'user') {
      // Check for regular user OR admin
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Check if user is admin
      if (user.role === 'admin') {
        const token = jwt.sign(
          { id: user._id, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: 'admin'
          },
          isAdmin: true
        });
      }

      // Regular user
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    }

    // Check for astrologer
    if (role === 'astrologer') {
      const astrologer = await Astrologer.findOne({ email });
      
      if (!astrologer) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Check if astrologer is approved
      if (astrologer.approvalStatus !== 'approved') {
        return res.status(403).json({ 
          message: `Your account is ${astrologer.approvalStatus}. Please wait for admin approval.` 
        });
      }

      const match = await bcrypt.compare(password, astrologer.password);
      if (!match) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: astrologer._id, role: 'astrologer' },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        astrologer: {
          id: astrologer._id,
          name: astrologer.name,
          email: astrologer.email,
          phone: astrologer.phone,
          experience: astrologer.experience,
          pricing: astrologer.pricing,
          approvalStatus: astrologer.approvalStatus,
          rating: astrologer.rating
        }
      });
    }

    return res.status(400).json({ message: "Invalid login type" });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Profile (separate for users and astrologers)
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole === 'user') {
      const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpire');
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ user });
    }

    if (userRole === 'astrologer') {
      const astrologer = await Astrologer.findById(userId).select('-password -resetPasswordToken -resetPasswordExpire');
      if (!astrologer) {
        return res.status(404).json({ message: "Astrologer not found" });
      }
      return res.json({ astrologer });
    }

    res.status(403).json({ message: "Invalid role" });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { name, phone, profileImage } = req.body;

    if (userRole === 'user') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (profileImage) user.profileImage = profileImage;

      await user.save();

      return res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage
        }
      });
    }

    if (userRole === 'astrologer') {
      const astrologer = await Astrologer.findById(userId);
      if (!astrologer) {
        return res.status(404).json({ message: "Astrologer not found" });
      }

      if (name) astrologer.name = name;
      if (phone) astrologer.phone = phone;
      if (profileImage) astrologer.profileImage = profileImage;

      await astrologer.save();

      return res.json({
        message: "Profile updated successfully",
        astrologer: {
          id: astrologer._id,
          name: astrologer.name,
          email: astrologer.email,
          phone: astrologer.phone,
          experience: astrologer.experience,
          pricing: astrologer.pricing
        }
      });
    }

    res.status(403).json({ message: "Invalid role" });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = null;
    if (role === 'user') {
      user = await User.findOne({ email });
    } else if (role === 'astrologer') {
      user = await Astrologer.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email content
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset Request</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Hello,</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">We received a request to reset your password for your RashiBazar account. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">This link will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} RashiBazar. All rights reserved.</p>
        </div>
      </div>
    `;

    if (!hasEmailService()) {
      return res.status(503).json({
        message:
          "Email not configured. On Render set RESEND_API_KEY (recommended) or EMAIL_USER + EMAIL_PASS.",
      });
    }

    const { user: emailUser } = process.env.RESEND_API_KEY?.trim()
      ? { user: process.env.EMAIL_USER?.trim() || "noreply@resend.dev" }
      : verifyEmailConfig();

    const mailOptions = {
      from: `"RashiBazar" <${emailUser}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    };

    const successMessage =
      "Password reset email sent successfully. Please check your inbox and spam folder.";

    // Resend is fast — wait for it. Gmail on Render often times out if awaited.
    if (process.env.RESEND_API_KEY?.trim()) {
      await deliverResetEmail(mailOptions);
      console.log(`✅ Reset email sent to ${user.email} (Resend)`);
      return res.json({ message: successMessage });
    }

    if (process.env.NODE_ENV === "production") {
      res.json({
        message:
          "Password reset requested. Check your inbox and spam folder within a few minutes.",
      });
      deliverResetEmail(mailOptions)
        .then(() => console.log(`✅ Reset email sent to ${user.email}`))
        .catch((err) =>
          console.error(`Reset email failed for ${user.email}:`, err.message)
        );
      return;
    }

    await deliverResetEmail(mailOptions);
    console.log(`✅ Reset email sent to ${user.email}`);
    res.json({ message: successMessage });
  } catch (err) {
    console.error("forgotPassword error:", {
      code: err?.code,
      message: err?.message,
      response: err?.response,
    });

    res.status(500).json({
      message: getForgotPasswordErrorMessage(err),
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, include one number and one special character",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    let user = null;
    if (decoded.role === 'user') {
      user = await User.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
      });
    } else if (decoded.role === 'astrologer') {
      user = await Astrologer.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(password, 10);

    // Update user
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, include one number and one special character",
      });
    }

    let user = null;
    if (userRole === 'user' || userRole === 'admin') {
      user = await User.findById(userId);
    } else if (userRole === 'astrologer') {
      user = await Astrologer.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    let user = null;
    if (userRole === 'user') {
      user = await User.findById(userId);
    } else if (userRole === 'astrologer') {
      user = await Astrologer.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Delete user
    if (userRole === 'user') {
      await User.findByIdAndDelete(userId);
    } else if (userRole === 'astrologer') {
      await Astrologer.findByIdAndDelete(userId);
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ error: err.message });
  }
};