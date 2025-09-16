import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For frontend/backend errors
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!name || !email || !password) {
      setError("All fields are required!");
      return;
    }

    try {
      const res = await API.post("/auth/register", { name, email, password });
      // Registration successful, navigate to login page
      console.log("Registration successful:", res.data);
      navigate("/login", { replace: true });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      {error && <div className="register-error">{error}</div>}
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="register-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="register-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="register-input"
        />
        <button type="submit" className="register-btn">Register</button>
      </form>

      <p className="register-text">Already have an account?</p>
      <button className="login-btn" onClick={() => navigate("/login")}>
        Go to Login
      </button>
    </div>
  );
};

export default Register;
