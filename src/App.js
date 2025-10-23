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
      </BrowserRouter>
    </AuthProvider>
  );
}
