// src/components/Header/Header.js
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  FaGraduationCap,
  FaSignOutAlt,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import "./Header.css";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // 👇 Detect scroll and toggle shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header-container ${isScrolled ? "header-shrink" : ""}`}>
      <div className="header-brand" onClick={() => navigate("/")}>
        <FaGraduationCap className="header-logo" />
        <span className="header-title">TalentQuiz Labs</span>
      </div>

      <nav className="header-nav">
        {user ? (
          <>
            <span className="header-welcome">👋 Hi, {user.name}</span>
            <button
              className="header-btn logout-btn"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Sign Out"
            >
              <FaSignOutAlt className="logout-icon" />
              <span className="logout-text">Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <button
              className="header-btn login-btn"
              onClick={() => navigate("/login")}
            >
              <FaUser /> Login
            </button>
            <button
              className="header-btn register-btn"
              onClick={() => navigate("/register")}
            >
              <FaUserPlus /> Register
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
