const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  emailOTP: { type: String, default: null },
  emailOTPExpire: { type: Date, default: null },
  emailOTPLastSentAt: { type: Date, default: null },
  passwordResetOTP: { type: String, default: null },
  passwordResetOTPExpire: { type: Date, default: null },
  passwordResetOTPLastSentAt: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);
