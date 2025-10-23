import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-inner">
        <svg viewBox="25 25 50 50">
          <circle r="20" cy="50" cx="50"></circle>
        </svg>
        <p className="loader-text">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
