import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./Admin.css";

const initialQuizForm = {
  quizId: "",
  title: "",
  description: "",
  level: "Easy",
  timeLimit: 30,
  passMarks: 1,
  technologies: "",
  questions: [],
  status: "DRAFT",
  isPublished: false,
  isActive: true,
};

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", isActive: "" });
  const [form, setForm] = useState(initialQuizForm);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const limit = 10;

  const loadQuizzes = async (pageNo = page, filterState = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: pageNo,
        limit,
        ...Object.fromEntries(Object.entries(filterState).filter(([, v]) => v !== "")),
      };
      const res = await adminApi.getQuizzes(params);
      setQuizzes(res.data?.quizzes || []);
      setPagination(res.data?.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizePayload = (source) => ({
    quizId: source.quizId.trim(),
    title: source.title.trim(),
    description: source.description.trim(),
    level: source.level,
    timeLimit: Number(source.timeLimit),
    passMarks: Number(source.passMarks),
    technologies: source.technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status: source.status,
    isPublished: source.status === "PUBLISHED",
    isActive: source.isActive,
    questions: [],
  });

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    loadQuizzes(1, filters);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const payload = normalizePayload(form);
      if (editingId) {
        await adminApi.updateQuiz(editingId, payload);
      } else {
        await adminApi.createQuiz(payload);
      }
      setForm(initialQuizForm);
      setEditingId("");
      loadQuizzes(page, filters);
    } catch (err) {
      setError(err?.message || "Failed to save quiz");
    }
  };

  const startEdit = (quiz) => {
    setEditingId(quiz._id);
    setForm({
      quizId: quiz.quizId || "",
      title: quiz.title || "",
      description: quiz.description || "",
      level: quiz.level || "Easy",
      timeLimit: quiz.timeLimit || 30,
      passMarks: quiz.passMarks || 1,
      technologies: Array.isArray(quiz.technologies) ? quiz.technologies.join(", ") : "",
      questions: [],
      status: quiz.status || "DRAFT",
      isPublished: !!quiz.isPublished,
      isActive: quiz.isActive !== false,
    });
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteQuiz(id);
      loadQuizzes(page, filters);
    } catch (err) {
      setError(err?.message || "Failed to delete quiz");
    }
  };

  const handleToggle = async (quiz, field) => {
    try {
      await adminApi.updateQuiz(quiz._id, { [field]: !quiz[field] });
      loadQuizzes(page, filters);
    } catch (err) {
      setError(err?.message || `Failed to update quiz ${field}`);
    }
  };

  const handlePage = (nextPage) => {
    const normalized = Math.max(1, Math.min(nextPage, pagination.totalPages || 1));
    setPage(normalized);
    loadQuizzes(normalized, filters);
  };

  return (
    <section className="admin-page">
      <form className="admin-card admin-filters" onSubmit={applyFilters}>
        <input
          type="text"
          placeholder="Search by title/quizId"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>
        <select
          value={filters.isActive}
          onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}
        >
          <option value="">All Activity</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button type="submit">Apply</button>
      </form>

      <form className="admin-card admin-form" onSubmit={submitForm}>
        <h3>{editingId ? "Edit Quiz Meta" : "Create Quiz Meta"}</h3>
        <div className="admin-form-grid">
          <input
            type="text"
            placeholder="Quiz ID (unique)"
            value={form.quizId}
            onChange={(e) => setForm((prev) => ({ ...prev, quizId: e.target.value }))}
            required
            disabled={Boolean(editingId)}
          />
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <select value={form.level} onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <input
            type="number"
            min="1"
            placeholder="Time limit (minutes)"
            value={form.timeLimit}
            onChange={(e) => setForm((prev) => ({ ...prev, timeLimit: e.target.value }))}
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Pass marks"
            value={form.passMarks}
            onChange={(e) => setForm((prev) => ({ ...prev, passMarks: e.target.value }))}
            required
          />
          <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <input
            type="text"
            placeholder="Technologies (comma separated)"
            value={form.technologies}
            onChange={(e) => setForm((prev) => ({ ...prev, technologies: e.target.value }))}
          />
        </div>
        <div className="actions-row">
          <button type="submit">{editingId ? "Update Quiz" : "Create Quiz"}</button>
          {editingId ? (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId("");
                setForm(initialQuizForm);
              }}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      {loading ? <div className="admin-state">Loading quizzes...</div> : null}
      {error ? <div className="admin-state admin-error">{error}</div> : null}

      {!loading && !error ? (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quiz ID</th>
                <th>Title</th>
                <th>Level</th>
                <th>Status</th>
                <th>Active</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td>{quiz.quizId}</td>
                  <td>{quiz.title}</td>
                  <td>{quiz.level}</td>
                  <td>{quiz.status}</td>
                  <td>{quiz.isActive ? "Yes" : "No"}</td>
                  <td>{quiz.isPublished ? "Yes" : "No"}</td>
                  <td>
                    <div className="actions-row">
                      <button type="button" className="secondary" onClick={() => startEdit(quiz)}>
                        Edit
                      </button>
                      <button type="button" className="secondary" onClick={() => handleToggle(quiz, "isActive")}>
                        {quiz.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" className="secondary" onClick={() => handleToggle(quiz, "isPublished")}>
                        {quiz.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button type="button" className="danger" onClick={() => handleDelete(quiz._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="admin-pagination">
            <button type="button" onClick={() => handlePage(page - 1)} disabled={page <= 1}>
              Prev
            </button>
            <span>
              Page {page} of {pagination.totalPages || 1} ({pagination.total || 0} quizzes)
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

export default AdminQuizzes;
