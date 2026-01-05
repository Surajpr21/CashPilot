import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import dashboardDemo from "../../../assets/img/demo-dashboard.png";


export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="hero-section-wrapper">
      <header className="hero-section-header">
        <div className="hero-section-logo">💰 Cash Pilot</div>
        <nav className="hero-section-nav">
          <a href="#" className="hero-section-link">Features</a>
          <a href="#" className="hero-section-link">About</a>
          <a href="#" className="hero-section-link">Contact</a>
          <button className="hero-section-nav-btn" onClick={() => navigate("/login")}>
            Dashboard
          </button>
        </nav>
      </header>

      <main className="hero-section-content">
        <h1 className="hero-section-title">
          The only <span>all-in-one</span> platform <br /> you need for personal expense tracking
        </h1>
        <p className="hero-section-subtitle">
          Powerful visualizations and tools to help you master your spending, budgeting,
          and money flow.
        </p>
        <button className="hero-section-cta-btn" onClick={() => navigate("/login")}>
          Get started for free →
        </button>

        <div className="hero-section-preview">
          <img
            src={dashboardDemo}
            alt="Dashboard Preview"
            className="hero-section-image"
          />
        </div>
      </main>
    </div>
  );
}
