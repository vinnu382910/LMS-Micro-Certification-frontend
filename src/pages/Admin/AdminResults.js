import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./Admin.css";

const DEFAULT_FILTERS = {
  quizId: "",
  userId: "",
  pass: "",
  minScore: "",
  maxScore: "",
  startDate: "",
  endDate: "",
};

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 10;

  const loadResults = async (pageNo = page, filterState = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: pageNo,
        limit,
        ...Object.fromEntries(Object.entries(filterState).filter(([, v]) => v !== "")),
      };
      const res = await adminApi.getResults(params);
      setResults(res.data?.results || []);
      setPagination(res.data?.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    loadResults(1, filters);
  };

  const handlePage = (nextPage) => {
    const normalized = Math.max(1, Math.min(nextPage, pagination.totalPages || 1));
    setPage(normalized);
    loadResults(normalized, filters);
  };

  return (
    <section className="admin-page">
      <form className="admin-card admin-filters" onSubmit={applyFilters}>
        <input
          type="text"
          placeholder="Quiz ID"
          value={filters.quizId}
          onChange={(e) => setFilters((prev) => ({ ...prev, quizId: e.target.value }))}
        />
        <input
          type="text"
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
        />
        <select value={filters.pass} onChange={(e) => setFilters((prev) => ({ ...prev, pass: e.target.value }))}>
          <option value="">Pass/Fail: All</option>
          <option value="true">Pass</option>
          <option value="false">Fail</option>
        </select>
        <input
          type="number"
          min="0"
          placeholder="Min Score"
          value={filters.minScore}
          onChange={(e) => setFilters((prev) => ({ ...prev, minScore: e.target.value }))}
        />
        <input
          type="number"
          min="0"
          placeholder="Max Score"
          value={filters.maxScore}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxScore: e.target.value }))}
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
        />
        <button type="submit">Apply</button>
      </form>

      {loading ? <div className="admin-state">Loading results...</div> : null}
      {error ? <div className="admin-state admin-error">{error}</div> : null}

      {!loading && !error ? (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Pass</th>
                <th>Level</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div>{item.userName || "N/A"}</div>
                    <small>{String(item.userId)}</small>
                  </td>
                  <td>
                    <div>{item.quizTitle || "N/A"}</div>
                    <small>{item.quizId}</small>
                  </td>
                  <td>
                    {item.score}/{item.totalQuestions}
                  </td>
                  <td>{item.pass ? "Pass" : "Fail"}</td>
                  <td>{item.level || "-"}</td>
                  <td>{item.date ? new Date(item.date).toLocaleString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="admin-pagination">
            <button type="button" onClick={() => handlePage(page - 1)} disabled={page <= 1}>
              Prev
            </button>
            <span>
              Page {page} of {pagination.totalPages || 1} ({pagination.total || 0} results)
            </span>
            <button
              type="button"
              onClick={() => handlePage(page + 1)}
              disabled={page >= (pagination.totalPages || 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AdminResults;
