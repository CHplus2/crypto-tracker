import React from "react";
import "./Logo.css";

export default function Logo() {
  return (
    <div className="logo-container">
      {/* Symbol: hexagon block */}
      <div className="logo-symbol">⎈</div>
      {/* Brand text */}
      <span className="logo-text">coinsave</span>
    </div>
  );
}
