// src/pages/Quiz/QuizStart.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import {
  FaPlay,
  FaClock,
  FaListAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./QuizStart.css";

const QuizStart = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizInfo = async () => {
      try {
        const res = await API.get(`/quiz/info/${quizId}`);
        setQuiz(res.data.quiz || res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load quiz details.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizInfo();
  }, [quizId]);

  const handleStartExam = async () => {
    try {
      const res = await API.post(`/quiz/start/${quizId}`);
      const sessionId = res.data.examSessionId;

      if (!sessionId) throw new Error("Session ID not received");

      localStorage.setItem("examSessionId", sessionId);
      navigate(`/quiz/${quizId}`, { state: { examSessionId: sessionId } });
    } catch (err) {
      console.error("Error starting exam:", err);
      alert(
        err.response?.data?.message ||
          "Unable to start the quiz. Please try again."
      );
    }
  };

  if (loading) return <p className="quiz-loading">Loading quiz details...</p>;
  if (error) return <p className="quiz-error">{error}</p>;

  return (
    <div className="quiz-start-container">
      <div className="quiz-start-card">
        <h2 className="quiz-title">{quiz?.title}</h2>
        <p className="quiz-desc">{quiz?.description}</p>

        <div className="quiz-meta">
          <div className="meta-item">
            <FaClock className="meta-icon" />
            <span>
              Time Limit: <strong>{quiz?.timeLimit} min</strong>
            </span>
          </div>
          <div className="meta-item">
            <FaListAlt className="meta-icon" />
            <span>
              Total Questions: <strong>{quiz?.totalQuestions}</strong>
            </span>
          </div>
          <div className="meta-item">
            <FaExclamationTriangle className="meta-icon" />
            <span>
              Level:{" "}
              <strong className={`level-badge ${quiz?.level?.toLowerCase()}`}>
                {quiz?.level}
              </strong>
            </span>
          </div>
        </div>

        <div className="quiz-rules">
          <h4>📋 Quiz Instructions</h4>
          <ul>
            <li>⚠️ Do not refresh or close the tab once the quiz starts.</li>
            <li>Each question carries equal marks.</li>
            <li>Timer will auto-submit the quiz when it ends.</li>
            <li>Click “Start Quiz” to begin your session.</li>
          </ul>
        </div>

        <button className="start-btn" onClick={handleStartExam}>
          <FaPlay className="start-icon" /> Start Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizStart;
