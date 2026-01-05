import React, { useState } from "react";

import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="login-page-root">

      {/* RIGHT FORM */}
      <div className="login-page-form-wrapper">
        <div className="login-page-card">
          <h1 className="login-page-title">Login</h1>
          <p className="login-page-subtitle">
            Welcome back! Please enter your login details
          </p>

          <div className="login-page-field">
            <label className="login-page-label">Email</label>
            <div className="login-page-input">
              <span className="login-page-icon">✉</span>
              <input type="email" placeholder="Enter your email..." />
            </div>
          </div>

          <div className="login-page-field">
            <label className="login-page-label">Password</label>
            <div className="login-page-input">
              <span className="login-page-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password..."
              />
              <span
                className="login-page-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </span>
            </div>
          </div>

          <div className="login-page-row">
            <label className="login-page-checkbox">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <span className="login-page-forgot">Forgot password?</span>
          </div>

       <button className="login-page-button" onClick={() => navigate("/dashboard")}>
            Login
          </button>

          <div className="login-page-footer">
            Don’t have an account? <span>Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
