import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";
import { FaEnvelope, FaArrowLeft, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import OtpInput from "../../../components/Shared/OtpInput/OtpInput";
import "../Login/Login.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data?.message || "If that email exists, reset OTP has been sent.");
      setOtpRequested(true);
    } catch (err) {
      setError(err?.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await API.post("/auth/reset-password", { email, otp, password });
      setMessage(res.data?.message || "Password reset successful.");
      setTimeout(() => navigate("/login", { replace: true }), 1000);
    } catch (err) {
      setError(err?.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a reset link.</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        <form className="auth-form" onSubmit={handleSendOtp}>
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
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Sending..." : "Send Reset OTP"}
          </button>
        </form>

        {otpRequested && (
          <form className="auth-form" onSubmit={handleResetPassword} style={{ marginTop: "1rem" }}>
            <div className="input-group">
              <OtpInput value={otp} onChange={setOtp} />
            </div>
            <div className="input-group has-action">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Strong Password"
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
            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? "Resetting..." : "Reset Password with OTP"}
            </button>
          </form>
        )}
        <div className="auth-footer">
          <button onClick={() => navigate("/login")} className="auth-link-btn">
            <FaArrowLeft /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
