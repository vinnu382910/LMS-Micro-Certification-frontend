<<<<<<< HEAD
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
        <span className="header-title">SBTQuiz Labs</span>
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

=======
import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaSignOutAlt, FaUser, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";
import "./Header.css";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/quizzes", label: "Exams" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/results-tracking", label: "Results" },
  { to: "/about", label: "About Us" },
  { to: "/help", label: "Help" },
  { to: "/guide", label: "Guide" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="brand" onClick={() => { navigate("/"); handleNavClick(); }}>
          <span className="brand-mark">SBT</span>
          <span className="brand-text">SBT-Exam</span>
        </button>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              {item.label}
            </NavLink>
          ))}
          {isAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link admin-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              Admin
            </NavLink>
          ) : null}

          <div className="auth-actions">
            {user ? (
              <>
                <span className="welcome">Hi, {user.name}</span>
                <button
                  className="auth-btn logout"
                  onClick={async () => {
                    await logout();
                    handleNavClick();
                    navigate("/login");
                  }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="auth-btn login"
                  onClick={() => {
                    handleNavClick();
                    navigate("/login");
                  }}
                >
                  <FaUser /> Login
                </button>
                <button
                  className="auth-btn register"
                  onClick={() => {
                    handleNavClick();
                    navigate("/register");
                  }}
                >
                  <FaUserPlus /> Register
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

>>>>>>> b039901 (Updated dashboard UI and fixed product API bug added http-cookie)
export default Header;

