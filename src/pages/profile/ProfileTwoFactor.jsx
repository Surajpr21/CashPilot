import "./ProfileTwoFactor.css";
import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { enableTwoFactor, disableTwoFactor } from "../../services/twoFactor.service";

export default function ProfileTwoFactor() {
  const { profile, setProfile } = useProfile();
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState("");

  const handleToggle = async () => {
    if (!profile?.id) return;
    setToggling(true);
    setMessage("");
    const nextEnabled = !profile.two_factor_enabled;
    try {
      const updatedFlag = nextEnabled ? await enableTwoFactor() : await disableTwoFactor();

      setProfile({ ...profile, two_factor_enabled: !!updatedFlag });
      setMessage(updatedFlag ? "Two-Factor Authentication enabled." : "Two-Factor Authentication disabled.");
    } catch (err) {
      setMessage(err?.message || "Unable to update 2FA settings.");
      setProfile({ ...profile, two_factor_enabled: profile.two_factor_enabled });
    } finally {
      setToggling(false);
    }
  };

  return (
    <section className="profile-section profile-section-2fa">
      <h2 className="profile-section-title">Two-Factor Authentication</h2>

      <div className="profile-2fa-toggle">
        <span>Enable 2FA</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={!!profile?.two_factor_enabled}
            onChange={handleToggle}
            disabled={toggling}
          />
          <span className="slider" />
        </label>
      </div>
      <p className="profile-support-text" style={{ marginTop: 10 }}>
        Enable extra layer of account security.
      </p>
      <button type="button" className="profile-link" onClick={() => {}}>
        Manage 2FA →
      </button>
      {message && <p className="profile-2fa-message">{message}</p>}
    </section>
  );
}
