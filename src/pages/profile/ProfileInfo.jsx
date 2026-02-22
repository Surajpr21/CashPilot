import "./ProfileInfo.css";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProfileInfo({ fullName, email, loading, error, userId, onNameUpdated }) {
  const [nameInput, setNameInput] = useState(fullName || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");
  const nameInputRef = useRef(null);

  useEffect(() => {
    setNameInput(fullName || "");
  }, [fullName]);

  useEffect(() => {
    if (editing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editing]);

  const nameChanged = nameInput.trim() !== (fullName || "");

  async function handleSaveName() {
    if (saving || loading) return;
    const nextName = nameInput.trim();

    if (!nameChanged) {
      setEditing(false);
      return;
    }

    if (!nextName) {
      setLocalError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    setLocalError("");

    try {
      if (!userId) throw new Error("Missing user id");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: nextName })
        .eq("id", userId);

      if (updateError) throw updateError;

      onNameUpdated?.(nextName);
      setEditing(false);
    } catch (err) {
      const message = err?.message || "Failed to update name.";
      setLocalError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleNameAction() {
    if (editing) {
      handleSaveName();
    } else {
      setLocalError("");
      setEditing(true);
    }
  }

  return (
    <section className="profile-section profile-section-info">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Account Information</h2>
      </div>

      {(error || localError) && (
        <div className="profile-banner error">
          <div className="profile-banner-dot" />
          <div className="profile-banner-text">{error || localError}</div>
        </div>
      )}

      <div className="profile-info-field">
        <label>Name</label>
        {loading ? (
          <div className="profile-input-skeleton" aria-label="Loading name" />
        ) : (
          <div className={`profile-input-with-action ${editing ? "is-editing" : ""}`}>
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              disabled={!editing || saving}
            />
            <button
              type="button"
              className="profile-inline-action"
              onClick={handleNameAction}
              disabled={saving}
              aria-label={editing ? "Save name" : "Edit name"}
            >
              {editing ? "Save" : "Edit"}
            </button>
          </div>
        )}
      </div>

      <div className="profile-info-field">
        <label>Email</label>
        {loading ? (
          <div className="profile-input-skeleton" aria-label="Loading email" />
        ) : (
          <input value={email || ""} readOnly disabled />
        )}
        <p className="profile-inline-note">Email is read-only.</p>
      </div>
    </section>
  );
}
