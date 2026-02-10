import "./ProfilePassword.css";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabaseClient";

export default function ProfilePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setMessage("Error: " + error.message);
      } else {
        setMessage("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="profile-section profile-section-password">
      <h2 className="profile-section-title">Change Password</h2>

      <div className="profile-password-field">
        <input
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowNewPassword((prev) => !prev)}
          aria-label={showNewPassword ? "Hide password" : "Show password"}
        >
          {showNewPassword ? <EyeSlashIcon className="password-toggle-icon" /> : <EyeIcon className="password-toggle-icon" />}
        </button>
      </div>

      <div className="profile-password-field">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
        >
          {showConfirmPassword ? <EyeSlashIcon className="password-toggle-icon" /> : <EyeIcon className="password-toggle-icon" />}
        </button>
      </div>

      <button onClick={handlePasswordUpdate} disabled={loading} className="profile-password-button primary-blue">
        {loading ? "Updating..." : "Update Password"}
      </button>

      {message && (
        <p className={`feedback-text ${message.toLowerCase().includes("success") ? "success" : ""}`}>
          {message}
        </p>
      )}
    </section>
  );
}
