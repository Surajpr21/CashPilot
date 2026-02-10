import "./Profile.css";

import ProfilePhoto from "./ProfilePhoto";
import ProfileInfo from "./ProfileInfo";
import ProfilePassword from "./ProfilePassword";
import ProfileTwoFactor from "./ProfileTwoFactor";
import ProfileTheme from "./ProfileTheme";
import DeleteAccountModal from "./DeleteAccountModal";

import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";

export default function Profile() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { profile } = useProfile();

  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">Profile & Settings</h1>
          <p className="profile-page-subtitle">Manage your account, security, and personal preferences.</p>
        </div>
      </div>

      <div className="profile-sections">
        <ProfilePhoto />
        <ProfileInfo />
        <ProfilePassword />
        <ProfileTwoFactor />
        <ProfileTheme />

        <div className="profile-section profile-delete-card">
          <div>
            <h3>Danger Zone</h3>
            <p className="profile-support-text">Delete your account and remove all associated data.</p>
          </div>
          <div className="profile-delete-trigger">
            <button
              className="danger-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}
