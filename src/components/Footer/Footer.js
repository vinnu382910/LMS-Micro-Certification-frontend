import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} SBT-Exam. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
