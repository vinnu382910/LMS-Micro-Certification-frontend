import React from "react";
import "./InfoPages.css";

const Guide = () => {
  return (
    <main className="info-page">
      <section className="info-card">
        <h1>SBT-Exam User Guide</h1>
        <p>Follow this workflow for a smooth and valid exam attempt.</p>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>1. Create Account</h2>
          <p>Register with your name, email, and strong password.</p>
        </article>

        <article className="info-card">
          <h2>2. Verify Email</h2>
          <p>Use the 6-digit OTP sent to your inbox within 5 minutes.</p>
        </article>

        <article className="info-card">
          <h2>3. Start Exam</h2>
          <p>Choose a quiz, review instructions, and begin the timed session.</p>
        </article>

        <article className="info-card">
          <h2>4. Exam Rules</h2>
          <ul>
            <li>Do not refresh during active exam.</li>
            <li>Submit before timer ends.</li>
            <li>Use one account per candidate.</li>
          </ul>
        </article>

        <article className="info-card">
          <h2>5. Scoring</h2>
          <p>
            Score is computed server-side. For repeated attempts, only your best
            score per quiz is retained and used in leaderboard ranking.
          </p>
        </article>
      </section>
    </main>
  );
};

export default Guide;
