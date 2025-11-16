import React, { useRef } from 'react';
import './SettingsModal.css';
import localforage from 'localforage';

const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const fileInputRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  const handleLanguageChange = (e) => {
    onSettingsChange({ ...settings, learningLanguage: e.target.value });
  };

  const handleExport = async () => {
    const backupData = {
      data: await localforage.getItem('telkonlingoData'),
      settings: await localforage.getItem('telkonlingoSettings'),
      mistakes: await localforage.getItem('telkonlingoMistakes'),
      highScore: await localforage.getItem('telkonlingoHighScore'),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `telkonlingo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (window.confirm('Are you sure you want to import? This will overwrite all your current data.')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          // Clear existing data and set new data
          await localforage.clear();
          await localforage.setItem('telkonlingoData', importedData.data || []);
          await localforage.setItem('telkonlingoSettings', importedData.settings || {});
          await localforage.setItem('telkonlingoMistakes', importedData.mistakes || {});
          await localforage.setItem('telkonlingoHighScore', importedData.highScore || 0);
          alert('Import successful! The application will now reload.');
          window.location.reload();
        } catch (error) {
          alert('Import failed. The file may be corrupt or in the wrong format.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    event.target.value = null;
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
          <div className="divider"></div>
          <div className="form-group">
            <label>Data Management</label>
            <div className="data-management-buttons">
              <button onClick={handleExport} className="secondary-button">Export Data</button>
              <button onClick={handleImportClick} className="secondary-button">Import Data</button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleImport}
              />
            </div>
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