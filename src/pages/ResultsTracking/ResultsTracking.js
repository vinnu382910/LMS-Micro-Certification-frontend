// src/pages/ResultsTracking/ResultsTracking.js
import React, { useEffect, useState, useCallback } from "react";
import {
  FaChartLine,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaTrophy,
  FaSkull,
  FaListAlt,
  FaExclamationTriangle,
  FaSadTear,
  FaUndo,
} from "react-icons/fa";
import API from "../../api/api";
import Loader from "../../components/Shared/Loader/Loader";
import "./ResultsTracking.css";

const ResultsTracking = () => {
  const [results, setResults] = useState([]);
  const [animatedScores, setAnimatedScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Stats
  const [stats, setStats] = useState({
    totalAttempts: 0,
    passedCount: 0,
    failedCount: 0,
  });

  const [filters, setFilters] = useState({
    status: "all",
    level: "all",
    quiz: "all",
    sortBy: "date-desc",
  });

  // ✅ Fetch Paginated Results
  const fetchResults = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const queryParams = new URLSearchParams({
          page,
          limit,
          ...(filters.status !== "all" && {
            pass: filters.status === "pass" ? "true" : "false",
          }),
          ...(filters.level !== "all" && { level: filters.level }),
          ...(filters.quiz !== "all" && { quizId: filters.quiz }),
          sortBy: filters.sortBy,
        }).toString();

        const res = await API.get(`/user/passed-results?${queryParams}`);
        const fetchedData = Array.isArray(res.data.results)
          ? res.data.results
          : [];

        setResults(fetchedData);
        setCurrentPage(res.data.pagination?.currentPage || 1);
        setTotalPages(res.data.pagination?.totalPages || 1);

        setStats({
          totalAttempts: res.data.stats?.totalAttempts || 0,
          passedCount: res.data.stats?.passedCount || 0,
          failedCount: res.data.stats?.failedCount || 0,
        });

        // Reset animated scores
        setAnimatedScores(fetchedData.map(() => 0));
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    },
    [filters, limit]
  );

  useEffect(() => {
    fetchResults(currentPage);
  }, [currentPage, fetchResults]);

  // ✅ Animate Score Percentage
  useEffect(() => {
    if (!results.length) return;

    const duration = 800; // total ms
    const frameRate = 30;
    const steps = duration / (1000 / frameRate);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setAnimatedScores((prev) =>
        results.map((r, i) =>
          Math.min(
            Math.round((r.score * frame) / steps),
            Math.round(r.score)
          )
        )
      );
      if (frame >= steps) clearInterval(interval);
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [results]);

  // ✅ Filter & Pagination Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "all",
      level: "all",
      quiz: "all",
      sortBy: "date-desc",
    });
    setCurrentPage(1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  // ✅ Render
  return (
    <div className="rt-wrap">
      {/* Header */}
      <div className="rt-header">
        <div className="rt-main-heading">
          <FaChartLine className="rt-title-icon" />
          <h2 className="rt-title">Progress Tracking</h2>
        </div>
          <p>Track your learning journey and achievements</p>
      </div>

      {/* Stats */}
      <div className="rt-stats">
        <div className="rt-stat-item">
          <div className="rt-stat-icon-wrapper">
            <FaListAlt className="rt-stat-icon total" />
          </div>
          <div className="rt-stat-content">
            <span className="rt-stat-value">{stats.totalAttempts}</span>
            <span className="rt-stat-label">Total Attempts</span>
          </div>
        </div>
        <div className="rt-stat-item">
          <div className="rt-stat-icon-wrapper">
            <FaTrophy className="rt-stat-icon passed" />
          </div>
          <div className="rt-stat-content">
            <span className="rt-stat-value">{stats.passedCount}</span>
            <span className="rt-stat-label">Passed</span>
          </div>
        </div>
        <div className="rt-stat-item">
          <div className="rt-stat-icon-wrapper">
            <FaSkull className="rt-stat-icon failed" />
          </div>
          <div className="rt-stat-content">
            <span className="rt-stat-value">{stats.failedCount}</span>
            <span className="rt-stat-label">Failed</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rt-filters">
        <div className="rt-filter-header">
          <FaFilter className="rt-filter-icon" />
          <span>Filter Results</span>
        </div>

        <div className="rt-filter-group">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rt-filter-select"
          >
            <option value="all">All Results</option>
            <option value="pass">Passed Only</option>
            <option value="fail">Failed Only</option>
          </select>

          <select
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
            className="rt-filter-select"
          >
            <option value="all">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            name="quiz"
            value={filters.quiz}
            onChange={handleFilterChange}
            className="rt-filter-select"
          >
            <option value="all">All Quizzes</option>
            {[...new Set(results.map((r) => r.quizId))].map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>

          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="rt-filter-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
          </select>

          {/* Reset Button */}
          <button onClick={handleResetFilters} className="rt-reset-btn">
            <FaUndo className="rt-reset-icon" /> Reset
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="rt-results-container">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="rt-error">
            <FaExclamationTriangle className="rt-error-icon" />
            <p>⚠️ {error}</p>
          </div>
        ) : !results.length ? (
          <div className="rt-empty">
            <FaSadTear className="rt-empty-icon" />
            <p>No results found for your current filters</p>
          </div>
        ) : (
          <>
            <div className="rt-list">
              {results.map((r, i) => (
                <div
                  key={r.resultId || r._id}
                  className={`rt-item ${r.pass ? "passed" : "failed"}`}
                >
                  <div className="rt-left">
                    <div className="rt-quiz-header">
                      <h3 className="rt-quiz-title">
                        {r.quizTitle || "Untitled Quiz"}
                      </h3>
                      <span
                        className={`rt-level-badge ${r.level?.toLowerCase()}`}
                      >
                        {r.level}
                      </span>
                    </div>
                    <p className="rt-meta">
                      <FaCalendarAlt className="rt-meta-icon" />
                      {new Date(r.date).toLocaleString()}
                    </p>
                    <div className="rt-stats-details">
                      <span className="rt-stat-detail correct">
                        <FaCheck className="rt-detail-icon" />
                        {r.correctCount} correct
                      </span>
                      <span className="rt-stat-detail wrong">
                        <FaTimes className="rt-detail-icon" />
                        {r.wrongCount} wrong
                      </span>
                      <span className="rt-stat-detail total">
                        • {r.totalQuestions} total
                      </span>
                    </div>
                  </div>
                  <div className="rt-right">
                    <div className="rt-score-container">
                      <div className="rt-score">
                        {animatedScores[i] || 0}%
                      </div>
                      <div className={`rt-status ${r.pass ? "yes" : "no"}`}>
                        {r.pass ? (
                          <>
                            <FaCheckCircle className="rt-status-icon" />
                            PASS
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="rt-status-icon" />
                            FAIL
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="rt-pagination">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="rt-btn rt-prev-btn"
              >
                <FaChevronLeft className="rt-btn-icon" /> Previous
              </button>
              <span className="rt-page-info">
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="rt-btn rt-next-btn"
              >
                Next <FaChevronRight className="rt-btn-icon" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsTracking;
