// src/pages/QuizList/QuizList.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import "./QuizList.css";
import { AiOutlineClockCircle, AiOutlineSearch } from "react-icons/ai";
import { BsFillPatchCheckFill } from "react-icons/bs";
import { FaCode, FaUndo } from "react-icons/fa";
import Loader from "../../components/Shared/Loader/Loader";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    level: "all",
    tech: "",
    search: "",
  });
  const navigate = useNavigate();

  // ✅ Fetch quizzes with filters
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (filters.level !== "all") params.append("level", filters.level);
      if (filters.tech) params.append("tech", filters.tech);
      if (filters.search) params.append("search", filters.search);

      const res = await API.get(`/quiz/list?${params.toString()}`);
      if (res.data.success) {
        setQuizzes(res.data.quizzes);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching quizzes.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // ✅ Navigate to quiz
  const handleViewQuiz = (quiz) => {
    const id = quiz.quizId || quiz._id;
    if (!id) return alert("Invalid quiz ID");
    navigate(`/quiz/start/${id}`);
  };

  // ✅ Level badge colors
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "easy":
        return { color: "#16a34a", bg: "#dcfce7" };
      case "medium":
        return { color: "#ca8a04", bg: "#fef9c3" };
      case "hard":
        return { color: "#dc2626", bg: "#fee2e2" };
      default:
        return { color: "#1e3a8a", bg: "#e0e7ff" };
    }
  };

  return (
    <div className="quizlist-container">
      <h2 className="quizlist-title">📘 Available Quizzes</h2>
      <p className="quizlist-subtitle">
        Filter quizzes by level, technology, or keyword
      </p>

      {/* 🔍 Sticky Filter Bar */}
      <div className="quiz-filters">
        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
        >
          <option value="all">All Levels</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <input
          type="text"
          placeholder="Filter by technology (e.g. Python, React)"
          value={filters.tech}
          onChange={(e) => setFilters({ ...filters, tech: e.target.value })}
        />

        <div className="search-bar">
          <AiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <button
          className="filter-reset-btn"
          onClick={() => setFilters({ level: "all", tech: "", search: "" })}
        >
          <FaUndo className="filter-reset-icon" /> Reset
        </button>
      </div>

      {/* 🧩 Quiz List */}
      {loading ? (
        <div className="quizlist-loading-wrap">
          <Loader />
          <p className="quizlist-loading">Loading quizzes...</p>
        </div>
      ) : error ? (
        <p className="quizlist-error">{error}</p>
      ) : (
        <div className="quiz-grid">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => {
              const { color, bg } = getLevelColor(quiz.level);
              return (
                <div className="quiz-card" key={quiz._id || quiz.quizId}>
                  <div className="quiz-header">
                    <div className="quiz-header-top">
                      <h3 className="quiz-name">{quiz.title}</h3>
                      <span
                        className="difficulty-badge"
                        style={{ color, backgroundColor: bg }}
                      >
                        {quiz.level}
                      </span>
                    </div>
                    <p className="quiz-desc">{quiz.description}</p>
                  </div>

                  <div className="quiz-details">
                    <div className="quiz-item">
                      <AiOutlineClockCircle className="quiz-icon" />
                      <span>
                        Time Limit: <strong>{quiz.timeLimit} min</strong>
                      </span>
                    </div>
                    <div className="quiz-item">
                      <FaCode className="quiz-icon" />
                      <span>
                        Total Questions:{" "}
                        <strong>{quiz.totalQuestions}</strong>
                      </span>
                    </div>
                    <div className="quiz-item">
                      <BsFillPatchCheckFill className="quiz-icon" />
                      <span>
                        Pass Marks: <strong>{quiz.passMarks}</strong>
                      </span>
                    </div>
                  </div>

                  {quiz.technologies?.length > 0 && (
                    <div className="quiz-tech">
                      {quiz.technologies.map((tech, idx) => (
                        <span className="quiz-tag" key={idx}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    className="quiz-btn"
                    onClick={() => handleViewQuiz(quiz)}
                  >
                    Start Quiz →
                  </button>
                </div>
              );
            })
          ) : (
            <p className="quizlist-empty fade-in">
              🚫 No quizzes found for selected filters.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizList;
