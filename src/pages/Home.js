import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate("/quiz/quiz1");
  };

  const handleViewResult = () => {
    navigate("/result");
  };

  return (
    <div className="home-container">
      <h1>Your Learning Dashboard</h1>
      <p>Complete quizzes and earn your micro-certifications</p>
      <div className="buttons">
        <button onClick={handleStartQuiz}>Start Quiz</button>
        <button onClick={handleViewResult}>View Result</button>
      </div>
    </div>
  );
};

export default Home;
