import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FaChartPie, FaUsers, FaBookOpen, FaPoll, FaBars } from "react-icons/fa";
import "./Admin.css";

const links = [
  { to: "/admin", label: "Dashboard", icon: <FaChartPie /> },
  { to: "/admin/users", label: "Users", icon: <FaUsers /> },
  { to: "/admin/quizzes", label: "Quizzes", icon: <FaBookOpen /> },
  { to: "/admin/results", label: "Results", icon: <FaPoll /> },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = useMemo(() => {
    const active = links.find((item) => location.pathname === item.to);
    return active?.label || "Admin";
  }, [location.pathname]);

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-head">
          <h2>SBT-Exam Admin</h2>
        </div>
        <nav className="admin-nav">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-content-wrap">
        <div className="admin-topbar">
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle admin navigation"
          >
            <FaBars />
          </button>
          <h1>{currentTitle}</h1>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
