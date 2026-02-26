import React from "react";
import Card from "../../components/Shared/Card/Card";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">SBT-Exam Dashboard</h1>
        <p className="home-subtitle">
          Complete secure exams and earn your micro-certifications.
        </p>
      </header>

      <div className="home-cards">
        <Card
          title="Browse Exams"
          subtitle="Take exams across topics and levels"
          onClick={() => navigate("/quizzes")}
          className="home-card"
        />
        <Card
          title="Progress Tracking"
          subtitle="View your attempts and improvement"
          onClick={() => navigate("/results-tracking")}
          className="home-card"
        />
        <Card
          title="Certificates"
          subtitle="Download certificates for passed exams"
          onClick={() => navigate("/certificates")}
          className="home-card"
        />
      </div>
    </div>
  );
};

export default Home;
