import React, { useEffect, useMemo, useState } from "react";

import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { getTwoFactorStatus } from "../../services/twoFactor.service";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [authStep, setAuthStep] = useState("PASSWORD"); // "PASSWORD" | "OTP"
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const { session, financial, initializing, profileLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    if (!domain) return email;
    const visible = user.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(0, user.length - 2))}@${domain}`;
  }, [email]);

  useEffect(() => {
    if (initializing || profileLoading) return;
    if (authStep === "OTP" || twoFactorRequired) return;
    if (session && financial) {
      navigate(financial.onboarding_completed ? "/dashboard" : "/onboarding", { replace: true });
    }
  }, [initializing, profileLoading, session, financial, navigate, authStep, twoFactorRequired]);

  useEffect(() => {
    if (authStep !== "OTP") return;
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [authStep, resendTimer]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setOtpMessage("");
    setTwoFactorRequired(false);
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message || "Login failed");
      setLoading(false);
      return;
    }

    const requires2FA = await getTwoFactorStatus();

    if (!requires2FA) {
      const refreshed = await refreshProfile();
      const shouldGoDashboard = refreshed?.financial?.onboarding_completed ?? financial?.onboarding_completed ?? true;
      setLoading(false);
      navigate(shouldGoDashboard ? "/dashboard" : "/onboarding", { replace: true });
      return;
    }

    setTwoFactorRequired(true);
    setAuthStep("OTP");
    await supabase.auth.signOut();
    const otpErr = await sendOTP();
    setLoading(false);
    if (otpErr) {
      setTwoFactorRequired(false);
      setAuthStep("PASSWORD");
    }
  }

  const sendOTP = async () => {
    setOtpMessage("");
    setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (otpError) {
        setError(otpError.message || "Failed to send OTP, try again.");
        return otpError;
      }
      setOtpMessage("OTP sent to your email");
      setResendTimer(60);
      return null;
    } catch (err) {
      setError("Failed to send OTP, try again.");
      return err;
    }
  };

  const verifyOTP = async () => {
    setError("");
    setOtpMessage("");
    if (!otp || otp.length < 6) {
      setError("Enter the 6+ digit OTP");
      return;
    }
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message || "Invalid or expired OTP");
        setLoading(false);
        return;
      }

      setOtpMessage("OTP verified successfully");
      const refreshed = await refreshProfile();
      const shouldGoDashboard = refreshed?.financial?.onboarding_completed ?? financial?.onboarding_completed ?? true;
      setTwoFactorRequired(false);
      setAuthStep("PASSWORD");
      navigate(shouldGoDashboard ? "/dashboard" : "/onboarding", { replace: true });
    } catch (_err) {
      setError("Unable to verify OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {authStep === "PASSWORD" ? (
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
      ) : (
        <div className="login-page-form-wrapper">
          <div className="login-page-card">
            <h1 className="login-page-title">Verify Your Email</h1>
            <p className="login-page-subtitle">We sent a 6-digit code to {maskedEmail || email}</p>

            {error && (
              <div style={{ color: "#d85c5c", marginBottom: 12, fontSize: 13 }}>{error}</div>
            )}
            {otpMessage && (
              <div style={{ color: "#2f855a", marginBottom: 12, fontSize: 13 }}>{otpMessage}</div>
            )}

            <div className="login-page-field">
              <label className="login-page-label">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                placeholder="6-8 digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                autoFocus
                className="otp-input"
              />
            </div>

            <button className="login-page-button" onClick={verifyOTP} disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>

            <div className="login-page-row" style={{ justifyContent: "space-between", marginTop: 12 }}>
              <button
                className="link-button"
                onClick={async () => {
                  if (resendTimer > 0) return;
                  await sendOTP();
                }}
                disabled={resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
              </button>

              <button
                className="link-button"
                onClick={() => {
                  supabase.auth.signOut();
                  setAuthStep("PASSWORD");
                  setTwoFactorRequired(false);
                  setOtp("");
                  setOtpMessage("");
                  setError("");
                }}
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
