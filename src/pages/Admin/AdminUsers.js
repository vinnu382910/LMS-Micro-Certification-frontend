import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./Admin.css";

const DEFAULT_FILTERS = {
  search: "",
  role: "",
  isActive: "",
  isSuspended: "",
  isVerified: "",
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 10;

  const loadUsers = async (pageNo = page, filterState = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: pageNo,
        limit,
        ...Object.fromEntries(Object.entries(filterState).filter(([, v]) => v !== "")),
      };
      const res = await adminApi.getUsers(params);
      setUsers(res.data?.users || []);
      setPagination(res.data?.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers(1, filters);
  };

  const handleStatusUpdate = async (id, payload) => {
    try {
      await adminApi.updateUser(id, payload);
      loadUsers(page, filters);
    } catch (err) {
      setError(err?.message || "Failed to update user");
    }
  };

  const handlePage = (nextPage) => {
    const normalized = Math.max(1, Math.min(nextPage, pagination.totalPages || 1));
    setPage(normalized);
    loadUsers(normalized, filters);
  };

  return (
    <section className="admin-page">
      <form className="admin-card admin-filters" onSubmit={applyFilters}>
        <input
          type="text"
          placeholder="Search by name/email"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select value={filters.role} onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}>
          <option value="">All Roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select
          value={filters.isActive}
          onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}
        >
          <option value="">Active: All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={filters.isSuspended}
          onChange={(e) => setFilters((prev) => ({ ...prev, isSuspended: e.target.value }))}
        >
          <option value="">Suspension: All</option>
          <option value="true">Suspended</option>
          <option value="false">Not Suspended</option>
        </select>
        <select
          value={filters.isVerified}
          onChange={(e) => setFilters((prev) => ({ ...prev, isVerified: e.target.value }))}
        >
          <option value="">Verification: All</option>
          <option value="true">Verified</option>
          <option value="false">Not Verified</option>
        </select>
        <button type="submit">Apply</button>
      </form>
      <div className="admin-state">
        Role promotion is intentionally DB-controlled only. Update role directly in MongoDB for admin assignment.
      </div>

      {loading ? <div className="admin-state">Loading users...</div> : null}
      {error ? <div className="admin-state admin-error">{error}</div> : null}

      {!loading && !error ? (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id || item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <span className={`pill ${item.role === "ADMIN" ? "admin" : ""}`}>{item.role}</span>
                  </td>
                  <td>
                    <span className={`pill ${item.isActive ? "ok" : "warn"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className={`pill ${item.isSuspended ? "danger" : "ok"}`}>
                      {item.isSuspended ? "Suspended" : "Normal"}
                    </span>
                  </td>
                  <td>{item.isVerified ? "Yes" : "No"}</td>
                  <td>{item.lastLogin ? new Date(item.lastLogin).toLocaleString() : "Never"}</td>
                  <td>
                    <div className="actions-row">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleStatusUpdate(item._id, { isActive: !item.isActive })}
                      >
                        {item.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleStatusUpdate(item._id, { isSuspended: !item.isSuspended })}
                      >
                        {item.isSuspended ? "Unsuspend" : "Suspend"}
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
              Page {page} of {pagination.totalPages || 1} ({pagination.total || 0} users)
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

export default AdminUsers;
