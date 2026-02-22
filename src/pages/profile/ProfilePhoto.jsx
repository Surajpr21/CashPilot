import "./ProfilePhoto.css";
import React from "react";

export default function ProfilePhoto({ avatarUrl, fullName, loading, onChangeAvatar }) {
  const initials = (fullName || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

  const showFallback = !avatarUrl && !loading;

  return (
    <section className="profile-section profile-section-photo">
      <h2 className="profile-section-title">Profile Photo</h2>

      <div className="profile-photo-content">
        {loading ? (
          <div className="profile-photo-avatar skeleton" aria-label="Loading avatar" />
        ) : showFallback ? (
          <div className="profile-photo-avatar placeholder" aria-label="Placeholder avatar">
            {initials}
          </div>
        ) : (
          <img src={avatarUrl} alt="User avatar" className="profile-photo-avatar image" />
        )}

        <button
          type="button"
          className="profile-avatar-change-btn"
          onClick={onChangeAvatar}
          disabled={loading}
        >
          Change Avatar
        </button>
      </div>
    </section>
  );
}
