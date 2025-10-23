import React from "react";
import { FaArrowRight } from "react-icons/fa";
import "./Card.css";

const Card = ({ title, subtitle, onClick }) => (
  <div className="cw-card" onClick={onClick}>
    <div className="cw-card-content">
      <h3 className="cw-card-title">{title}</h3>
      <p className="cw-card-subtitle">{subtitle}</p>
    </div>
    <div className="cw-card-icon">
      <FaArrowRight />
    </div>
  </div>
);

export default Card;
