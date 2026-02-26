import React from "react";
import "./InfoPages.css";

const About = () => {
  return (
    <main className="info-page">
      <section className="info-card">
        <h1>About SBT-Exam</h1>
        <p>
          SBT-Exam is a secure skill-based examination platform built to deliver
          reliable assessments, transparent scoring, and measurable learning outcomes.
        </p>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>Mission</h2>
          <p>
            Provide accessible and trustworthy online examinations that support
            learning, certification, and continuous improvement.
          </p>
        </article>
        <article className="info-card">
          <h2>Vision</h2>
          <p>
            Build a modern exam ecosystem where institutions and learners can
            evaluate skills with confidence at scale.
          </p>
        </article>
        <article className="info-card">
          <h2>Why This Platform Exists</h2>
          <p>
            Traditional assessments often lack consistency, analytics, and rapid
            feedback. SBT-Exam solves this with structured quizzes, secure sessions,
            and clear progress reporting.
          </p>
        </article>
        <article className="info-card">
          <h2>Secure Examination System</h2>
          <p>
            The platform uses protected routes, HTTP-only cookie auth, OTP-based
            verification, timed sessions, and server-side validation for reliable exam flow.
          </p>
        </article>
      </section>
    </main>
  );
};

export default About;
