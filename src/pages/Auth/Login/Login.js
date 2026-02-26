import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";
import { AuthContext } from "../../../context/AuthContext";
import {
  FaLock,
  FaEnvelope,
  FaSignInAlt,
  FaArrowRight,
  FaUserGraduate,
  FaPaperPlane,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import OtpInput from "../../../components/Shared/OtpInput/OtpInput";
import "./Login.css";

const Login = () => {
  const { login, user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationOtp, setVerificationOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setVerificationEmail("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      const message = err?.message || "Login failed";
      setError(message);
      if (err?.needsVerification) {
        setVerificationEmail(err?.email || email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    setResending(true);
    setError("");
    setMessage("");
    try {
      const res = await API.post("/auth/resend-email-otp", { email: verificationEmail });
      setMessage(res.data?.message || "Verification email sent.");
    } catch (err) {
      setError(err?.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationEmail || !verificationOtp) return;
    setVerifyingOtp(true);
    setError("");
    setMessage("");
    try {
      const res = await API.post("/auth/verify-email-otp", {
        email: verificationEmail,
        otp: verificationOtp,
      });
      setMessage(res.data?.message || "Email verified. Please login.");
      setVerificationOtp("");
    } catch (err) {
      setError(err?.message || "Invalid or expired OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <FaUserGraduate className="auth-icon" />
          <h2>Welcome Back</h2>
          <p>Login securely with HTTP-only cookie authentication.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form className="auth-form" onSubmit={handle}>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group has-action">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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
            <FaSignInAlt />
            {loading ? " Logging in..." : " Login"}
          </button>
        </form>

        {verificationEmail && (
          <>
            <div className="input-group">
              <OtpInput value={verificationOtp} onChange={setVerificationOtp} />
            </div>
            <button onClick={handleVerifyOtp} className="auth-btn" disabled={verifyingOtp}>
              {verifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>
            <button onClick={handleResendVerification} className="auth-link-btn" disabled={resending}>
              <FaPaperPlane /> {resending ? "Sending..." : "Resend OTP"}
            </button>
          </>
        )}

        <div className="auth-footer">
          <p>New here?</p>
          <button onClick={() => navigate("/register")} className="auth-link-btn">
            Register <FaArrowRight />
          </button>
          <button onClick={() => navigate("/forgot-password")} className="auth-link-btn">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
