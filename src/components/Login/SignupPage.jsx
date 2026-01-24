import React, { useEffect, useState } from "react";
import "./LoginPage.css"; // reuse login styles for consistent look
import { useNavigate } from "react-router-dom";
import { signUp } from "../../services/auth.service";
import { EnvelopeIcon, LockClosedIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

// Signup behavior: we send { email, password, full_name } to Supabase.
// Supabase will create the user and store full_name in user.user_metadata.full_name.
// The app continues to use auth.users.id as user_id for expenses/budgets/goals.
// After signup we attempt to auto-login; if the backend requires email confirmation the
// sign-in will fail and the user will see the confirmation message.

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, session, profile, initializing, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing || profileLoading) return;
    if (session && profile) {
      navigate(profile.onboarding_completed ? "/dashboard" : "/onboarding", { replace: true });
    }
  }, [initializing, profileLoading, session, profile, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { data, error: signupError } = await signUp(form.email, form.password, form.name);
    setLoading(false);

    if (signupError) {
      setError(signupError.message || "Signup failed");
      return;
    }

    setLoading(true);
    const { error: loginError, profile: nextProfile } = await login(form.email, form.password);
    setLoading(false);

    if (!loginError && nextProfile) {
      navigate(nextProfile.onboarding_completed ? "/dashboard" : "/onboarding");
      return;
    }

    if (!loginError) {
      navigate("/dashboard");
      return;
    }

    setSuccess("Account created. Check your email to confirm your account. Your full name is saved to your profile.");
    setForm({ name: "", email: "", password: "", confirm: "" });
  }

  return (
    <div className="login-page-root">
      <div className="login-page-form-wrapper">
        <div className="login-page-card">
          <h1 className="login-page-title">Sign up</h1>
          <p className="login-page-subtitle">Create an account to get started</p>

          {/* <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
            We will store your full name in your account profile (saved as
            <code>user_metadata.full_name</code>).
          </div> */}

          {error && (
            <div style={{ color: "#d85c5c", marginBottom: 12, fontSize: 13 }}>{error}</div>
          )}
          {success && (
            <div style={{ color: "#2d8a5f", marginBottom: 12, fontSize: 13 }}>{success}</div>
          )}

          <div className="login-page-field">
            <label className="login-page-label">Full name</label>
            <div className="login-page-input">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name..."
              />
            </div>
          </div>

          <div className="login-page-field">
            <label className="login-page-label">Email</label>
            <div className="login-page-input">
              <EnvelopeIcon className="login-page-icon" style={{ width: 18, height: 18 }} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email..."
              />
            </div>
          </div>

          <div className="login-page-field">
            <label className="login-page-label">Password</label>
            <div className="login-page-input">
              <LockClosedIcon className="login-page-icon" style={{ width: 18, height: 18 }} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password..."
              />
              <EyeIcon
                className="login-page-eye"
                style={{ width: 18, height: 18, cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          <div className="login-page-field">
            <label className="login-page-label">Confirm password</label>
            <div className="login-page-input">
              <input
                name="confirm"
                type={showPassword ? "text" : "password"}
                value={form.confirm}
                onChange={handleChange}
                placeholder="Confirm your password..."
              />
            </div>
          </div>

          <button className="login-page-button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <div className="login-page-footer" style={{ marginTop: 12 }}>
            Already have an account? <span onClick={() => navigate("/login")}>Login</span>
          </div>
        </div>
      </div>
    </div>
  );
}
