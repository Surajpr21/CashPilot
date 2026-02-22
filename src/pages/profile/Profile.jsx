import "./Profile.css";

import ProfilePhoto from "./ProfilePhoto";
import ProfileInfo from "./ProfileInfo";
import ProfilePassword from "./ProfilePassword";
import ProfileTwoFactor from "./ProfileTwoFactor";
import ProfileTheme from "./ProfileTheme";
import DeleteAccountModal from "./DeleteAccountModal";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useProfile } from "../../context/ProfileContext";
import { PROFILE_AVATARS } from "../../config/profileAvatars";

export default function Profile() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { profile } = useProfile();

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState("");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const userId = userData?.user?.id;
        const userEmail = userData?.user?.email || "";
        if (!userId) throw new Error("No authenticated user");

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!active) return;
        setUserId(userId);
        setFullName(data?.full_name || "");
        setAvatarUrl(data?.avatar_url || "");
        setEmail(userEmail);
      } catch (err) {
        console.error("Profile load failed", err);
        if (!active) return;
        setError("Unable to load profile right now.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, []);

  const hasAvatarChanged = pendingAvatar && pendingAvatar !== avatarUrl;

  function openAvatarModal() {
    setPendingAvatar(avatarUrl || PROFILE_AVATARS[0] || "");
    setAvatarError("");
    setAvatarModalOpen(true);
  }

  async function handleAvatarSave() {
    if (!hasAvatarChanged || avatarSaving) return;
    setAvatarSaving(true);
    setAvatarError("");

    try {
      if (!userId) throw new Error("Missing user id");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: pendingAvatar })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(pendingAvatar);
      setAvatarModalOpen(false);
    } catch (err) {
      const message = err?.message || "Failed to update avatar.";
      setAvatarError(message);
    } finally {
      setAvatarSaving(false);
    }
  }

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
        <ProfilePhoto
          avatarUrl={avatarUrl}
          fullName={fullName}
          loading={loading}
          onChangeAvatar={openAvatarModal}
        />
        <ProfileInfo
          fullName={fullName}
          email={email}
          loading={loading}
          error={error}
          userId={userId}
          onNameUpdated={setFullName}
        />
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

      {avatarModalOpen && (
        <div className="profile-avatar-modal-backdrop" role="dialog" aria-modal="true">
          <div className="profile-avatar-modal">
            <div className="profile-avatar-modal-header">
              <h3>Choose an avatar</h3>
              <button
                type="button"
                className="profile-avatar-modal-close"
                onClick={() => {
                  if (avatarSaving) return;
                  setAvatarModalOpen(false);
                  setAvatarError("");
                }}
                aria-label="Close avatar picker"
              >
                ×
              </button>
            </div>

            {avatarError && (
              <div className="profile-banner error">
                <div className="profile-banner-dot" />
                <div className="profile-banner-text">{avatarError}</div>
              </div>
            )}

            <div className="profile-avatar-grid">
              {PROFILE_AVATARS.map((url) => {
                const selected = pendingAvatar === url;
                return (
                  <button
                    key={url}
                    type="button"
                    className={`profile-avatar-choice${selected ? " is-selected" : ""}`}
                    onClick={() => setPendingAvatar(url)}
                  >
                    <img src={url} alt="Avatar option" />
                  </button>
                );
              })}
            </div>

            <div className="profile-avatar-modal-actions">
              <button
                type="button"
                className="secondary neutral-elevated"
                onClick={() => {
                  if (avatarSaving) return;
                  setAvatarModalOpen(false);
                  setAvatarError("");
                }}
                disabled={avatarSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAvatarSave}
                disabled={!hasAvatarChanged || avatarSaving}
              >
                {avatarSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
