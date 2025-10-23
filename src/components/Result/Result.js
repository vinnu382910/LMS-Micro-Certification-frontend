// // src/components/Result/Result.js
// import React, { useEffect, useState } from "react";
// import CertificateButton from "../Certificates/CertificateButton";
// import "./Result.css";
// import { useNavigate } from "react-router-dom";
// import Loader from "../Shared/Loader/Loader";

// const Result = () => {
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     try {
//       const stored = localStorage.getItem("result");
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         setResult(parsed);
//       } else {
//         setError("No result data found. Please retake the quiz.");
//       }
//     } catch (err) {
//       console.error("❌ Error reading result:", err);
//       setError("Failed to load result data.");
//     }
//   }, []);

//   if (error) return <div className="result-error">{error}</div>;
//   if (!result) return <Loader message="Fetching results..." />;

//   return (
//     <div className="result-wrap">
//       <div className="result-header">
//         <h2>Score: {result.score}</h2>
//         <p className={`status ${result.pass ? "pass" : "fail"}`}>
//           {result.pass ? "Pass ✅" : "Fail ❌"}
//         </p>
//       </div>

//       <div className="result-summary">
//         <div><strong>Total Questions:</strong> {result.totalQuestions}</div>
//         <div><strong>Correct:</strong> {result.correctCount ?? result.score}</div>
//         <div>
//           <strong>Wrong:</strong>{" "}
//           {result.wrongCount ?? result.totalQuestions - result.score}
//         </div>
//       </div>

//       <div className="result-actions">
//         {result.pass && result.resultId && (
//           <CertificateButton resultId={result.resultId} />
//         )}
//         <button onClick={() => navigate("/")}>Back to Home</button>
//       </div>

//       <div className="detailed-list">
//         <h3>Question Review</h3>
//         {result.detailedResults?.map((d, i) => (
//           <div key={i} className={`d-card ${d.isCorrect ? "correct" : "wrong"}`}>
//             <div className="q">{d.questionText}</div>
//             <div className="meta">
//               <div>Your answer: <strong>{d.userAnswer ?? "—"}</strong></div>
//               <div>Correct answer: <strong>{d.correctAnswer}</strong></div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Result;
