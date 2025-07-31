import React from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";
import HeroSection from "./Hero/HeroSection";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing">
        <HeroSection />

      {/* Features */}
      <section className="features">
        <h2 className="section-title">Why Cash Pilot?</h2>
        <div className="feature-grid">
          <FeatureCard
            title="📊 Visual Analytics"
            desc="Beautiful graphs and charts to understand spending patterns."
          />
          <FeatureCard
            title="💸 Track Daily Expenses"
            desc="Easily log and categorize all your daily expenses."
          />
          <FeatureCard
            title="🔁 Subscription Management"
            desc="Manage recurring payments like Netflix, Gym, etc. separately."
          />
          <FeatureCard
            title="🧠 Smart Budgeting"
            desc="Set limits, track your balance and avoid overspending."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How it works</h2>
        <div className="steps">
          <Step number="1" title="Add Your Expenses" desc="Log your spending with tags and categories." />
          <Step number="2" title="Visualize Everything" desc="See where your money goes with charts & donuts." />
          <Step number="3" title="Optimize Your Money" desc="Get insights and take control of your financial flow." />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        Made with 💜 by Suraj · © {new Date().getFullYear()} · <a href="#">GitHub</a>
      </footer>
    </main>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="step">
      <div className="step-number">{number}</div>
      <div className="step-content">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  );
}
