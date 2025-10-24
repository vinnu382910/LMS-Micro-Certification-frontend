// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import QuizList from "./pages/QuizList/QuizList";
import StartQuiz from "./components/Quiz/QuizStart";
import Quiz from "./components/Quiz/Quiz";
// import Result from "./components/Result/Result";
import ResultsTracking from "./pages/ResultsTracking/ResultsTracking";
import Certificates from "./components/Certificates/Certificates";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/quizzes" element={<QuizList />} />
          <Route
            path="/quiz/start/:quizId"
            element={
              <ProtectedRoute>
                <StartQuiz />
              </ProtectedRoute>
            }
          />
          <Route path="/quiz/:quizId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />

          {/* <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} /> */}

          <Route path="/results-tracking" element={<ProtectedRoute><ResultsTracking /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover
          theme="colored"
          style={{
            fontFamily: "Poppins, sans-serif",
            textAlign: "center",
          }}
          toastStyle={{
            background:
              "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
            color: "#fff",
            borderRadius: "12px",
            padding: "1rem 1.2rem",
            fontSize: "0.95rem",
            fontWeight: "500",
            boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(6px)",
          }}
          progressStyle={{
            background:
              "linear-gradient(90deg, #facc15, #22c55e, #38bdf8)",
            height: "4px",
            borderRadius: "4px",
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
