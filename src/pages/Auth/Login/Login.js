// src/components/Auth/Login/Login.js
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";
import { AuthContext } from "../../../context/AuthContext";
import { FaLock, FaEnvelope, FaSignInAlt, FaArrowRight, FaUserGraduate } from "react-icons/fa";
import "./Login.css";

const Login = () => {
  const { login, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <FaUserGraduate className="auth-icon" />
          <h2>Welcome Back!</h2>
          <p>Log in to continue your journey and earn more certificates 🏆</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

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

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            <FaSignInAlt />
            {loading ? " Logging in..." : " Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>New here?</p>
          <button onClick={() => navigate("/register")} className="auth-link-btn">
            Register <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
