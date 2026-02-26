const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { setAuthCookie, clearAuthCookie } = require("../utils/authCookie");
const { hashToken } = require("../utils/tokens");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

const OTP_EXPIRE_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  isSuspended: user.isSuspended,
  isVerified: user.isVerified,
});

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const getCooldownSeconds = (lastSentAt) => {
  if (!lastSentAt) return 0;
  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  return Math.max(0, Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000));
};

const sendEmailOtp = async (user) => {
  const otp = generateOtp();
  user.emailOTP = hashToken(otp);
  user.emailOTPExpire = new Date(Date.now() + OTP_EXPIRE_MS);
  user.emailOTPLastSentAt = new Date();
  await user.save();
  await sendVerificationEmail({ to: user.email, name: user.name, otp });
};

const sendResetOtp = async (user) => {
  const otp = generateOtp();
  user.passwordResetOTP = hashToken(otp);
  user.passwordResetOTPExpire = new Date(Date.now() + OTP_EXPIRE_MS);
  user.passwordResetOTPLastSentAt = new Date();
  await user.save();
  await sendPasswordResetEmail({ to: user.email, name: user.name, otp });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = await bcrypt.hash(password, 12);
      await sendEmailOtp(existingUser);
      return res.status(200).json({
        success: true,
        message: "Account updated. OTP sent to your email.",
        email: existingUser.email,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });
    await sendEmailOtp(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      email: user.email,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const user = await User.findOne({
      email: normalizedEmail,
      emailOTP: hashToken(otp),
      emailOTPExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.emailOTP = null;
    user.emailOTPExpire = null;
    user.emailOTPLastSentAt = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (err) {
    console.error("Verify email OTP error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.resendEmailOtp = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").toLowerCase().trim();
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, an OTP has been sent.",
      });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified." });
    }

    const waitSeconds = getCooldownSeconds(user.emailOTPLastSentAt);
    if (waitSeconds > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting another OTP.`,
      });
    }

    await sendEmailOtp(user);
    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    console.error("Resend email OTP error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").toLowerCase().trim();
    const { password } = req.body;

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email with OTP before login.",
        needsVerification: true,
        email: user.email,
      });
    }
    if (!user.isActive || user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive or suspended. Contact admin.",
      });
    }

    user.lastLogin = new Date();
    await user.save();
    const token = signToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.logout = async (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: "Logged out successfully." });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error("Me error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").toLowerCase().trim();
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset OTP has been sent.",
      });
    }

    const waitSeconds = getCooldownSeconds(user.passwordResetOTPLastSentAt);
    if (waitSeconds > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting another OTP.`,
      });
    }

    await sendResetOtp(user);

    return res.status(200).json({
      success: true,
      message: "If that email exists, a reset OTP has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();
    const password = String(req.body.password || "");

    if (!normalizedEmail || !otp || !password) {
      return res.status(400).json({ success: false, message: "Email, OTP and password are required." });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
      passwordResetOTP: hashToken(otp),
      passwordResetOTPExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetOTP = null;
    user.passwordResetOTPExpire = null;
    user.passwordResetOTPLastSentAt = null;
    await user.save();

    clearAuthCookie(res);
    return res.status(200).json({ success: true, message: "Password reset successful. Please login again." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
