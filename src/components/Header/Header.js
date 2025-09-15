import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="company-name">LMS Micro-Certification</h1>
      </div>
      <div className="header-right">
        {user && <span className="welcome-msg">Welcome, <span className="user-name">{user.name}</span></span>}
        <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
      </div>
    </header>
  );
};

export default Header;
