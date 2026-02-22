import "./ProfileTheme.css";
import { useProfile } from "../../context/ProfileContext";

export default function ProfileTheme() {
  const { profile } = useProfile();
  const currentTheme = profile?.theme || "system";

  return (
    <section className="profile-section profile-section-theme">
      <h2 className="profile-section-title">Appearance</h2>

      <div className="profile-theme-options">
        <label><input type="radio" name="theme" defaultChecked={currentTheme === "system"} /> System</label>
        <label><input type="radio" name="theme" defaultChecked={currentTheme === "light"} /> Light</label>
        <label><input type="radio" name="theme" defaultChecked={currentTheme === "dark"} /> Dark</label>
      </div>

      <button
        type="button"
        className="profile-link"
        style={{ marginTop: 12, display: "inline-flex" }}
        onClick={() => {}}
      >
        Manage 2FA →
      </button>
    </section>
  );
}
