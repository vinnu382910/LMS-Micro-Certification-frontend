import React from "react";
import "./InfoPages.css";

const Help = () => {
  return (
    <main className="info-page">
      <section className="info-card">
        <h1>Help Center</h1>
        <p>Everything you need to start and complete exams on SBT-Exam.</p>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>Frequently Asked Questions</h2>
          <ul>
            <li>How do I register? Use Register and verify email with OTP.</li>
            <li>Can I retake quizzes? Yes, but best score is preserved per quiz.</li>
            <li>How long is OTP valid? 5 minutes.</li>
            <li>Why did OTP resend fail? Cooldown (60s) or hourly limit may apply.</li>
          </ul>
        </article>

        <article className="info-card">
          <h2>How To Register</h2>
          <ol>
            <li>Create an account with a strong password.</li>
            <li>Enter OTP sent to your email.</li>
            <li>Login and start exams.</li>
          </ol>
        </article>

        <article className="info-card">
          <h2>How To Take Exam</h2>
          <ol>
            <li>Open Exams page and choose a quiz.</li>
            <li>Read instructions and start session.</li>
            <li>Answer within time and submit.</li>
          </ol>
        </article>

        <article className="info-card" id="contact-support">
          <h2>Contact Support</h2>
          <p>
            For login, OTP, or exam issues, contact support at:
            <br />
            <strong>vinay3829100@gmail.com</strong>
          </p>
        </article>
      </section>
    </main>
  );
};

export default Help;
