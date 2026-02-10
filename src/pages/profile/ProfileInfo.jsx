import "./ProfileInfo.css";
import React, { useEffect, useRef, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../lib/supabaseClient";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileInfo() {
  const { profile, setProfile } = useProfile();
  const { setProfile: setAuthProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState("");
  const [editingName, setEditingName] = useState(false);

  const nameInputRef = useRef(null);

  useEffect(() => {
    setFullName(profile?.full_name || "");
  }, [profile]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const nameChanged = fullName.trim() !== (profile?.full_name || "");
  const displayEmail = profile?.email || "";

  function handleStartEdit() {
    setEditingName(true);
    setBanner(null);
    setError("");
  }

  async function handleSaveName() {
    if (saving) return;

    const trimmedName = fullName.trim();

    if (!nameChanged) {
      setBanner({ type: "info", text: "No changes to save." });
      setEditingName(false);
      return;
    }

    setSaving(true);
    setError("");
    setBanner(null);

    try {
      if (!profile?.id) throw new Error("Missing profile id");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: trimmedName })
        .eq("id", profile.id);

      if (updateError) throw new Error(updateError.message);

      setProfile((prev) => (prev ? { ...prev, full_name: trimmedName } : prev));
      setAuthProfile?.((prev) => (prev ? { ...prev, full_name: trimmedName } : prev));
      setFullName(trimmedName);
      setBanner({ type: "success", text: "Name updated successfully." });
      setEditingName(false);
    } catch (err) {
      setError(err?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleNameAction() {
    if (editingName) {
      handleSaveName();
    } else {
      handleStartEdit();
    }
  }

  return (
    <section className="profile-section profile-section-info">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Account Information</h2>
      </div>

      {banner && (
        <div className={`profile-banner ${banner.type}`}>
          <div className="profile-banner-dot" />
          <div className="profile-banner-text">{banner.text}</div>
        </div>
      )}

      {error && (
        <div className="profile-banner error">
          <div className="profile-banner-dot" />
          <div className="profile-banner-text">{error}</div>
        </div>
      )}

      <div className="profile-info-field">
        <label>Name</label>
        <div className={`profile-input-with-action ${editingName ? "is-editing" : ""}`}>
          <input
            ref={nameInputRef}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            disabled={!editingName || saving}
          />
          <button
            type="button"
            className="profile-inline-action"
            onClick={handleNameAction}
            disabled={saving}
            aria-label={editingName ? "Save name" : "Edit name"}
          >
            {editingName ? "Save" : <PencilIcon />}
          </button>
        </div>
      </div>

      <div className="profile-info-field">
        <label>Email</label>
        <input value={displayEmail} readOnly disabled />
        <p className="profile-inline-note">Email is read-only.</p>
      </div>
    </section>
  );
}
