import React, { useState, useEffect } from "react";

import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { signIn, getSession } from "../../services/auth.service";
import { EnvelopeIcon, LockClosedIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) navigate("/dashboard");
    })();
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: loginError } = await signIn(email, password);

    setLoading(false);

    if (loginError) {
      setError(loginError.message || "Login failed");
      return;
    }

    // Redirect to dashboard
    navigate("/dashboard");
  }

  return (
    <div className="login-page-root">

      {/* RIGHT FORM */}
      <div className="login-page-form-wrapper">
        <div className="login-page-card">
          <h1 className="login-page-title">Login</h1>
          <p className="login-page-subtitle">
            Welcome back! Please enter your login details
          </p>

          {error && (
            <div style={{ color: "#d85c5c", marginBottom: 12, fontSize: 13 }}>{error}</div>
          )}

          <div className="login-page-field">
            <label className="login-page-label">Email</label>
            <div className="login-page-input">
              <EnvelopeIcon className="login-page-icon" style={{ width: 18, height: 18 }} />
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="login-page-field">
            <label className="login-page-label">Password</label>
            <div className="login-page-input">
              <LockClosedIcon className="login-page-icon" style={{ width: 18, height: 18 }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <EyeIcon
                className="login-page-eye"
                style={{ width: 18, height: 18, cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          <div className="login-page-row">
            <label className="login-page-checkbox">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <span className="login-page-forgot">Forgot password?</span>
          </div>

       <button className="login-page-button" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="login-page-footer">
            Don’t have an account? <span onClick={() => navigate("/signup")}>Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
