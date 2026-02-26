import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";
import { FaLock, FaArrowLeft, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import OtpInput from "../../../components/Shared/OtpInput/OtpInput";
import "../Login/Login.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await API.post("/auth/reset-password", { email, otp, password });
      setMessage(res.data?.message || "Password reset successful.");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter your new strong password.</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <OtpInput value={otp} onChange={setOtp} />
          </div>
          <div className="input-group has-action">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="auth-helper-text">
            Minimum 8 chars with uppercase, lowercase, number, and special character.
          </p>
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="auth-footer">
          <button onClick={() => navigate("/login")} className="auth-link-btn">
            <FaArrowLeft /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
