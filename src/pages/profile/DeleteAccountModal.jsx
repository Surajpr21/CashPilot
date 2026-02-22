import "./DeleteAccountModal.css";

export default function DeleteAccountModal({ onClose }) {
  return (
    <div className="delete-modal-backdrop">
      <div className="delete-modal">
        <h2>Delete Account</h2>

        <p>
          This action is permanent. All your data will be deleted and cannot be recovered.
        </p>

        <div className="delete-modal-actions">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="danger-btn">
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
