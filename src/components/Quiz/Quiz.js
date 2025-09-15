import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import "./Quiz.css";

const Quiz = () => {
  const { quizId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await API.get(`/quiz/${quizId}`);
        setQuestions(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestions();
  }, [quizId]);

  // Timer effect with handleSubmit moved inside
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const submitQuiz = async () => {
      try {
        const res = await API.post("/quiz/submit", { quizId, answers });
        localStorage.setItem("result", JSON.stringify(res.data));
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
      }
    };

    return () => clearInterval(timer);
  }, [loading, answers, quizId, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[current] = answer;
    setAnswers(newAnswers);
    if (current + 1 < questions.length) setCurrent(current + 1);
    else submitQuiz();
  };

  // Move submitQuiz here so it can be reused in handleAnswer
  const submitQuiz = async () => {
    try {
      const res = await API.post("/quiz/submit", { quizId, answers });
      localStorage.setItem("result", JSON.stringify(res.data));
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuit = () => {
    if (window.confirm("Are you sure you want to quit the exam?")) {
      navigate("/", { replace: true });
    }
  };

  if (loading) return <p className="quiz-loading">Loading...</p>;
  const q = questions[current];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Quiz for {user?.name}</h2>
        <div className="quiz-timer">
          ⏱ Time Left: <span className="quiz-time">{formatTime(timeLeft)}</span>
        </div>
        <button className="quit-btn" onClick={handleQuit}>Quit Exam</button>
      </div>

      <div className="quiz-question">
        <h3>{q.questionText}</h3>
        <div className="quiz-options">
          {q.options.map((opt, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(opt)}
              className="quiz-option"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        Question {current + 1} of {questions.length}
      </div>
    </div>
  );
};

export default Quiz;
