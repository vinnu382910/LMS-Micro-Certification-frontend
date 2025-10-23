// src/components/Auth/Register/Register.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";
import { AuthContext } from "../../../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaUserPlus } from "react-icons/fa";
import "../Login/Login.css"

const Register = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      await API.post("/auth/register", { name, email, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <FaUserPlus className="auth-icon" />
          <h2>Join Talend Quiz Lab</h2>
          <p>
            Create your account and start earning micro-certifications in just 10–20 minutes ⚡
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handle}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <FaUserPlus />
            {loading ? " Registering..." : " Register"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button onClick={() => navigate("/login")} className="auth-link-btn">
            <FaArrowLeft /> Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
