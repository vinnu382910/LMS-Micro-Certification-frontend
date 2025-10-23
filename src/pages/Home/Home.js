import React from "react";
import Card from "../../components/Shared/Card/Card";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Your Learning Dashboard</h1>
        <p className="home-subtitle">
          Complete quizzes and earn your micro-certifications
        </p>
      </header>

      <div className="home-cards">
        <Card
          title="Browse Quizzes"
          subtitle="Take quizzes across topics and levels"
          onClick={() => navigate("/quizzes")}
          className="home-card"
        />
        <Card
          title="Progress Tracking"
          subtitle="View all your attempts and progress"
          onClick={() => navigate("/results-tracking")}
          className="home-card"
        />
        <Card
          title="Certificates"
          subtitle="Download certificates for passed quizzes"
          onClick={() => navigate("/certificates")}
          className="home-card"
        />
      </div>
    </div>
  );
};

export default Home;
