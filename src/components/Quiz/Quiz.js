// src/components/Quiz/Quiz/Quiz.js
import React, { useEffect, useState, useCallback,  } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowRight, FaSignOutAlt, FaCheck, FaRedo } from "react-icons/fa";
import API from "../../api/api";
// import { AuthContext } from "../../context/AuthContext";
import "./Quiz.css";

const Quiz = () => {
  const { quizId } = useParams();
  // const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  // ✅ Submit Exam (moved above useEffect to prevent ReferenceError)
  const handleSubmit = useCallback(async () => {
    try {
      const sessionId = localStorage.getItem("examSessionId");
      if (!sessionId) throw new Error("Session expired or missing.");

      const finalAnswers = questions.map((q, i) => answers[i] || "");
      const res = await API.post(
        "/quiz/submit",
        { quizId, answers: finalAnswers, examSessionId: sessionId },
        { headers: { "x-exam-session": sessionId } }
      );

      setResult(res.data);
      localStorage.removeItem("examSessionId");
      window.history.pushState(null, "", "/quizzes");
    } catch (err) {
      console.error("❌ Submit Error:", err);
      alert(err.response?.data?.message || "Submit failed. Please try again.");
    }
  }, [answers, questions, quizId]);

  // ✅ Fetch Quiz with session validation
  useEffect(() => {
    const sessionId =
      localStorage.getItem("examSessionId") || window.history.state?.usr?.examSessionId;

    if (!sessionId) {
      alert("Please start the exam properly from the Start Page.");
      return navigate(`/quiz/start/${quizId}`);
    }

    const fetchQuiz = async () => {
      try {
        const res = await API.get(`/quiz/${quizId}`, {
          headers: { "x-exam-session": sessionId },
        });

        const { quiz: quizDetails, questions: quizQuestions } = res.data;
        setQuiz(quizDetails);
        setQuestions(quizQuestions);
        setTimeLeft((quizDetails.timeLimit || 5) * 60);
        setAnswers(Array(quizQuestions.length).fill(null));
        setLoading(false);
      } catch (err) {
        console.error("❌ Quiz Fetch Error:", err);
        alert(err.response?.data?.message || "Quiz not found or unauthorized access.");
        navigate("/quizzes");
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  // ⏱️ Timer Countdown (safe now because handleSubmit is already defined)
  useEffect(() => {
    if (loading || !questions.length || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions.length, result, handleSubmit]);

  // 🚫 Prevent navigation / back button
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!result) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? The quiz may not be submitted.";
      }
    };

    const handlePopState = () => {
      if (!result) {
        const leave = window.confirm(
          "Are you sure you want to quit the quiz? Your progress will not be saved."
        );
        if (leave) window.location.replace("/quizzes");
        else window.history.pushState(null, "", window.location.pathname);
      } else {
        window.history.pushState(null, "", "/quizzes");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [result]);

  // ❌ Quit Exam
  const handleQuit = () => {
    if (window.confirm("Are you sure you want to quit? Your answers will not be submitted.")) {
      localStorage.removeItem("examSessionId");
      window.location.replace("/quizzes");
    }
  };

  // 👉 Next Question
  const handleNext = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[current] = selected;
    setAnswers(updatedAnswers);
    setSelected(null);

    let next = current + 1;
    while (next < questions.length && updatedAnswers[next] !== null) next++;
    if (next < questions.length) setCurrent(next);
  };

  // 🔄 Select Question from Sidebar
  const selectQuestion = (index) => {
    setCurrent(index);
    setSelected(answers[index] || null);
  };

  // ⏰ Format Time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  if (loading) return <p className="quiz-loading">Loading Quiz...</p>;
  if (!questions.length) return <p className="quiz-empty">No questions found.</p>;

  // 🎯 Result Screen
  if (result) {
    return (
      <div className="quiz-result-container">
        <h2>{quiz.title} - Result</h2>
        <p>
          <strong>Score:</strong> {result.score} / {result.totalQuestions} &nbsp;
          <strong>Pass:</strong> {result.pass ? "✅ Yes" : "❌ No"}
        </p>
        <p>
          Correct: {result.correctCount} | Wrong: {result.wrongCount}
        </p>

        <div className="result-questions">
          {result.detailedResults.map((q, i) => (
            <div
              key={i}
              className={`result-question ${q.isCorrect ? "correct" : "wrong"}`}
            >
              <h4>
                Q{i + 1}. {q.questionText}
              </h4>
              <p>
                <strong>Your Answer:</strong> {q.userAnswer || "Not Answered"}
              </p>
              <p>
                <strong>Correct Answer:</strong> {q.correctAnswer}
              </p>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="dashboard-btn" onClick={() => window.location.replace("/")}>
            <FaCheck /> Go To Dashboard
          </button>
          <button
            className="retake-btn"
            onClick={() => window.location.replace(`/quiz/start/${quizId}`)}
          >
            <FaRedo /> Retake Exam
          </button>
        </div>
      </div>
    );
  }

  // 🧩 Quiz Question Rendering
  const q = questions[current];

  return (
    <div className="quiz-wrapper">

      <aside className="quiz-sidebar">
        <h3>
          Questions ({answeredCount}/{questions.length})
        </h3>
        <div className="sidebar-list">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`sidebar-question ${answers[i] ? "answered" : "unanswered"} ${
                current === i ? "current" : ""
              }`}
              onClick={() => selectQuestion(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </aside>

      <section className="quiz-main">
              {/* Progress Bar */}
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
            }}
          > 
          </div>
        
        
      </div>
        <header className="quiz-header">
          <h2>{quiz?.title}</h2>
          <p>{quiz?.description}</p>
          <div className="quiz-meta">
            <span>Level: {quiz?.level}</span>
            <span>
              Time Left: <strong>{formatTime(timeLeft)}</strong>
            </span>
            <span>Total Questions: {quiz?.totalQuestions}</span>
            <span>
              Answered: {answeredCount}/{questions.length}
            </span>
          </div>
        </header>

        <article className="quiz-body">
          <h3>
            Q{current + 1}. {q.questionText}
          </h3>
          <div className="options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${selected === opt ? "selected" : ""}`}
                onClick={() => setSelected(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </article>

        <footer className="quiz-footer">
          <button className="quit-btn" onClick={handleQuit}>
            <FaSignOutAlt /> Quit
          </button>

          {allAnswered ? (
            <button className="submit-btn" onClick={handleSubmit}>
              <FaCheck /> Submit & End Exam
            </button>
          ) : (
            <button
              className="next-btn"
              onClick={handleNext}
              disabled={selected === null}
            >
              <FaArrowRight /> Next
            </button>
          )}
        </footer>
      </section>
    </div>
  );
};

export default Quiz;
