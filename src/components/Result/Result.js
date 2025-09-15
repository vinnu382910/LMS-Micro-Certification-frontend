import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CertificateButton from "../CertificateButton/CertificateButton";
import "./Result.css";

const Result = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const res = JSON.parse(localStorage.getItem("result"));
    setResult(res);
  }, []);

  const handleBack = () => {
    navigate("/", { replace: true });
  };

  if (!result) return <p>Loading...</p>;

  return (
    <div className="result-container">
      <div className="result-header">
        <h2>Score: {result.score}</h2>
        <p className={result.pass ? "pass" : "fail"}>
          {result.pass ? "Pass ✅" : "Fail ❌"}
        </p>
      </div>

      <div className="result-details">
        <CertificateButton name="John Doe" quizTitle="Sample Quiz" score={result.score} />
        <button className="back-btn" onClick={handleBack}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Result;
