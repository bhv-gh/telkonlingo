import React from 'react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) {
    return null;
  }

  const handleLanguageChange = (e) => {
    onSettingsChange({ ...settings, learningLanguage: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="close-button" aria-label="Close settings">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="learningLanguage">I want to learn:</label>
            <select
              id="learningLanguage"
              name="learningLanguage"
              value={settings.learningLanguage}
              onChange={handleLanguageChange}
            >
              <option value="Konkani">Konkani</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="done-button">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;