import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../api/api";
import "./QuizList.css";
import { AiOutlineClockCircle, AiOutlineSearch } from "react-icons/ai";
import { BsFillPatchCheckFill } from "react-icons/bs";
import { FaCode, FaUndo, FaChevronLeft, FaChevronRight, FaFilter } from "react-icons/fa";

const QUIZZES_PER_PAGE = 9;
const VALID_LEVELS = new Set(["all", "Easy", "Medium", "Hard"]);

const QuizList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLevel = VALID_LEVELS.has(searchParams.get("level"))
    ? searchParams.get("level")
    : "all";
  const initialTech = searchParams.get("tech") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);

  const [quizzes, setQuizzes] = useState([]);
  const [techOptions, setTechOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalQuizzes: 0,
    limit: QUIZZES_PER_PAGE,
    hasNextPage: false,
    hasPrevPage: initialPage > 1,
  });
  const [filters, setFilters] = useState({
    level: initialLevel,
    tech: initialTech,
    search: initialSearch,
  });
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        const res = await API.get("/quiz/technologies");
        if (res.data?.success && Array.isArray(res.data.technologies)) {
          setTechOptions(res.data.technologies);
        }
      } catch (err) {
        console.error("Failed to load technologies:", err);
      }
    };
    loadTechnologies();
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (filters.level !== "all") params.append("level", filters.level);
      if (filters.tech.trim()) params.append("tech", filters.tech.trim());
      if (filters.search.trim()) params.append("search", filters.search.trim());
      params.append("page", currentPage);
      params.append("limit", QUIZZES_PER_PAGE);

      const res = await API.get(`/quiz/list?${params.toString()}`);
      if (res.data.success) {
        setQuizzes(Array.isArray(res.data.quizzes) ? res.data.quizzes : []);
        setPagination(
          res.data.pagination || {
            currentPage,
            totalPages: 0,
            totalQuizzes: 0,
            limit: QUIZZES_PER_PAGE,
            hasNextPage: false,
            hasPrevPage: currentPage > 1,
          }
        );
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching quizzes.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    const params = {};
    if (filters.level !== "all") params.level = filters.level;
    if (filters.tech.trim()) params.tech = filters.tech.trim();
    if (filters.search.trim()) params.search = filters.search.trim();
    if (currentPage > 1) params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [filters.level, filters.tech, filters.search, currentPage, setSearchParams]);

  const handleViewQuiz = (quiz) => {
    const id = quiz.quizId || quiz._id;
    if (!id) return;
    navigate(`/quiz/start/${id}`);
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "easy":
        return { color: "#15803d", bg: "#dcfce7" };
      case "medium":
        return { color: "#a16207", bg: "#fef3c7" };
      case "hard":
        return { color: "#b91c1c", bg: "#fee2e2" };
      default:
        return { color: "#1e3a8a", bg: "#dbeafe" };
    }
  };

  const levelCounts = useMemo(() => {
    return quizzes.reduce(
      (acc, quiz) => {
        const key = quiz.level?.toLowerCase();
        if (key === "easy" || key === "medium" || key === "hard") acc[key] += 1;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );
  }, [quizzes]);

  const hasActiveFilters =
    filters.level !== "all" || filters.tech.trim() !== "" || filters.search.trim() !== "";

  const dropdownTechOptions = useMemo(() => {
    if (!filters.tech || techOptions.includes(filters.tech)) return techOptions;
    return [filters.tech, ...techOptions];
  }, [techOptions, filters.tech]);

  const clearAllFilters = () => {
    setCurrentPage(1);
    setSearchInput("");
    setFilters({ level: "all", tech: "", search: "" });
  };

  const filtersPanel = (
    <aside className="quiz-filters-panel">
      <div className="filter-panel-head">
        <FaFilter />
        <h3>Filters</h3>
      </div>

      <div className="filter-block">
        <label htmlFor="quiz-search">Search Quiz</label>
        <div className="search-input-wrap">
          <AiOutlineSearch className="search-icon" />
          <input
            id="quiz-search"
            type="text"
            placeholder="Title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-block">
        <label>Difficulty</label>
        <div className="level-chip-row">
          {["all", "Easy", "Medium", "Hard"].map((level) => (
            <button
              key={level}
              className={`level-chip ${filters.level === level ? "active" : ""}`}
              onClick={() => {
                setCurrentPage(1);
                setFilters((prev) => ({ ...prev, level }));
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-block">
        <label htmlFor="quiz-tech">Technology</label>
        <select
          id="quiz-tech"
          value={filters.tech}
          onChange={(e) => {
            setCurrentPage(1);
            setFilters((prev) => ({ ...prev, tech: e.target.value }));
          }}
        >
          <option value="">All Technologies</option>
          {dropdownTechOptions.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>
      </div>

      <button className="filter-clear-btn" onClick={clearAllFilters} disabled={!hasActiveFilters}>
        <FaUndo /> Clear Filters
      </button>
    </aside>
  );

  return (
    <div className="quizlist-page">
      <div className="quizlist-topbar">
        <h2>Explore Quizzes</h2>
        <p>Find the right challenge by difficulty, technology, and topic.</p>
      </div>

      <div className="quizlist-mobile-filter-toggle">
        <button onClick={() => setMobileFiltersOpen((prev) => !prev)}>
          <FaFilter /> {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className="quizlist-layout">
        <div className={`quizlist-mobile-filters ${mobileFiltersOpen ? "open" : ""}`}>
          {filtersPanel}
        </div>
        <div className="quizlist-desktop-filters">{filtersPanel}</div>

        <section className="quizlist-main">
          <div className="quizlist-summary">
            <div className="summary-item">
              <span className="summary-label">Total</span>
              <strong>{pagination.totalQuizzes}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Easy</span>
              <strong>{levelCounts.easy}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Medium</span>
              <strong>{levelCounts.medium}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Hard</span>
              <strong>{levelCounts.hard}</strong>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="active-filter-strip">
              {filters.level !== "all" && <span>Level: {filters.level}</span>}
              {filters.tech.trim() && <span>Tech: {filters.tech}</span>}
              {filters.search.trim() && <span>Search: {filters.search}</span>}
            </div>
          )}

          {loading ? (
            <div className="quiz-grid">
              {Array.from({ length: QUIZZES_PER_PAGE }).map((_, index) => (
                <article className="quiz-card quiz-skeleton-card" key={`skeleton-${index}`}>
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-stat" />
                  <div className="skeleton skeleton-stat" />
                  <div className="skeleton skeleton-stat" />
                  <div className="skeleton skeleton-tags" />
                  <div className="skeleton skeleton-button" />
                </article>
              ))}
            </div>
          ) : error ? (
            <p className="quizlist-error">{error}</p>
          ) : (
            <>
              <div className="quiz-grid">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => {
                    const { color, bg } = getLevelColor(quiz.level);
                    return (
                      <article className="quiz-card" key={quiz.quizId}>
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
                              Total Questions: <strong>{quiz.totalQuestions}</strong>
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
                            {quiz.technologies.map((tech) => (
                              <span className="quiz-tag" key={`${quiz.quizId}-${tech}`}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        <button className="quiz-btn" onClick={() => handleViewQuiz(quiz)}>
                          Start Quiz
                        </button>
                      </article>
                    );
                  })
                ) : (
                  <p className="quizlist-empty">No quizzes match your current filters.</p>
                )}
              </div>

              {pagination.totalPages > 1 && (
                <div className="quiz-pagination">
                  <button
                    className="quiz-pagination-btn"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  <span className="quiz-pagination-info">
                    Page <strong>{pagination.currentPage}</strong> of{" "}
                    <strong>{pagination.totalPages}</strong>
                  </span>
                  <button
                    className="quiz-pagination-btn"
                    disabled={!pagination.hasNextPage}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))
                    }
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default QuizList;
