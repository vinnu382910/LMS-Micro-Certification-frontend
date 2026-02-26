// src/routes/ProtectedRoute.js
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    const toastId = "auth-warning";
    if (!toast.isActive(toastId)) {
      toast.info("Login or Register to Start Quiz", { toastId });
    }
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
