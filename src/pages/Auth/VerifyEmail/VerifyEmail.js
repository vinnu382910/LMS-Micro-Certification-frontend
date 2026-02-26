import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../../api/api";
import { FaEnvelope, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import OtpInput from "../../../components/Shared/OtpInput/OtpInput";
import "../Login/Login.css";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await API.post("/auth/verify-email-otp", { email, otp });
      setMessage(res.data?.message || "Email verified successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setError(err?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setMessage("");
    try {
      const res = await API.post("/auth/resend-email-otp", { email });
      setMessage(res.data?.message || "OTP sent.");
    } catch (err) {
      setError(err?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Verify Email with OTP</h2>
          <p>Enter the 6-digit OTP sent to your email. OTP expires in 5 minutes.</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        <form className="auth-form" onSubmit={handleVerify}>
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
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <div className="auth-footer">
          <button className="auth-link-btn" onClick={handleResend} disabled={resending || !email}>
            <FaPaperPlane /> {resending ? "Sending..." : "Resend OTP"}
          </button>
          <button className="auth-link-btn" onClick={() => navigate("/login")}>
            <FaArrowLeft /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
