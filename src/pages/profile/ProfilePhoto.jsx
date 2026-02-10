import "./ProfilePhoto.css";
import { generateAvatar } from "./utils/avatar";
import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";

export default function ProfilePhoto() {
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const avatar = generateAvatar(profile?.full_name || "User");

  return (
    <section className="profile-section profile-section-photo">
      <h2 className="profile-section-title">Profile Photo</h2>

      <div className="profile-photo-content">
        <div
          className="profile-photo-avatar"
          style={{ backgroundColor: avatar.color }}
        >
          {avatar.initials}
        </div>

        <div className="profile-photo-actions">
          <button disabled={loading} className="primary-green">
            {loading ? "Updating..." : "Change Photo"}
          </button>
          <button
            className="secondary neutral-elevated"
            disabled={loading}
            onClick={() => setLoading(true)}
          >
            Generate Random
          </button>
        </div>
      </div>
    </section>
  );
}
