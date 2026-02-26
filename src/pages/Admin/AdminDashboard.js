import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import { FaUsers, FaUserCheck, FaUserSlash, FaFileAlt, FaChartLine } from "react-icons/fa";
import "./Admin.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboard();
        setStats(res.data?.stats || null);
      } catch (err) {
        setError(err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="admin-state">Loading dashboard...</div>;
  if (error) return <div className="admin-state admin-error">{error}</div>;

  return (
    <section className="admin-page">
      <div className="admin-grid admin-stat-grid">
        <article className="admin-card stat-card">
          <FaUsers className="stat-icon" />
          <p>Total Users</p>
          <h3>{stats?.totalUsers || 0}</h3>
        </article>
        <article className="admin-card stat-card">
          <FaUserCheck className="stat-icon success" />
          <p>Verified Users</p>
          <h3>{stats?.verifiedUsers || 0}</h3>
        </article>
        <article className="admin-card stat-card">
          <FaUserSlash className="stat-icon danger" />
          <p>Suspended Users</p>
          <h3>{stats?.suspendedUsers || 0}</h3>
        </article>
        <article className="admin-card stat-card">
          <FaFileAlt className="stat-icon" />
          <p>Total Quizzes</p>
          <h3>{stats?.totalQuizzes || 0}</h3>
        </article>
        <article className="admin-card stat-card">
          <FaChartLine className="stat-icon" />
          <p>Total Attempts</p>
          <h3>{stats?.totalAttempts || 0}</h3>
        </article>
        <article className="admin-card stat-card">
          <FaChartLine className="stat-icon success" />
          <p>Pass Rate</p>
          <h3>{stats?.passRate || 0}%</h3>
        </article>
      </div>

      <div className="admin-grid admin-two-col">
        <article className="admin-card">
          <h3>Account Health</h3>
          <p>Active Users: {stats?.activeUsers || 0}</p>
          <p>Suspended Users: {stats?.suspendedUsers || 0}</p>
          <p>Verified Users: {stats?.verifiedUsers || 0}</p>
        </article>
        <article className="admin-card">
          <h3>Quiz Insights</h3>
          <p>Most Attempted Quiz: {stats?.mostAttemptedQuizId || "N/A"}</p>
          <p>Most Failed Quiz: {stats?.mostFailedQuizId || "N/A"}</p>
          <p>Total Quizzes: {stats?.totalQuizzes || 0}</p>
        </article>
      </div>
    </section>
  );
};

export default AdminDashboard;
