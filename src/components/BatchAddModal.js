import React, { useState, useMemo } from 'react';
import './BatchAddModal.css'; // Assuming this file is moved to components folder

const BatchAddModal = ({ isOpen, onClose, onBatchAdd }) => {
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [separator, setSeparator] = useState('\\n');
  const [entries, setEntries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const parsedItems = useMemo(() => {
    if (!rawText) return [];
    const sep = separator === '\\n' ? '\n' : separator;
    return rawText.split(sep).map(s => s.trim()).filter(Boolean);
  }, [rawText, separator]);

  const handleNextStep1 = () => {
    const newEntries = parsedItems.map(item => ({
      English: item,
      Telugu: '',
      Konkani: '',
      Type: item.includes(' ') ? 'phrase' : 'word',
    }));
    setEntries(newEntries);
    setCurrentIndex(0);
    setStep(2);
  };

  const handleTranslationChange = (lang, value) => {
    const newEntries = [...entries];
    newEntries[currentIndex][lang] = value;
    setEntries(newEntries);
  };

  const goToNextWord = () => {
    if (currentIndex < entries.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Move to review step
      setStep(3);
    }
  };

  const goToPrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleConfirmBatchAdd = () => {
    onBatchAdd(entries);
    handleClose();
  };

  const handleClose = () => {
    // Reset state on close
    setStep(1);
    setRawText('');
    setSeparator('\\n');
    setEntries([]);
    setCurrentIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  const currentEntry = entries[currentIndex];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Batch Add</h2>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="batch-add-step">
              <div className="form-group">
                <label htmlFor="batch-text">Paste your words/phrases</label>
                <textarea
                  id="batch-text"
                  className="batch-textarea"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="hello&#10;how are you?&#10;world&#10;&#10;Or with a custom separator:&#10;hello;how are you?;world"
                />
              </div>
              <div className="form-group">
                <label htmlFor="separator">Separator (use \n for new line)</label>
                <input
                  id="separator"
                  type="text"
                  className="separator-input"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && currentEntry && (
            <div className="batch-add-step">
              <div className="translation-card">
                <div className="english-phrase">"{currentEntry.English}"</div>
                <div className="translation-inputs">
                  <input
                    type="text"
                    placeholder="Telugu Translation"
                    value={currentEntry.Telugu}
                    onChange={(e) => handleTranslationChange('Telugu', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Konkani Translation"
                    value={currentEntry.Konkani}
                    onChange={(e) => handleTranslationChange('Konkani', e.target.value)}
                  />
                </div>
                <p className="progress-indicator">
                  {currentIndex + 1} / {entries.length}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="batch-add-step">
              <h3>Review Entries</h3>
              <ul className="review-list">
                {entries.map((entry, index) => (
                  <li key={index} className="review-item">
                    <strong>{entry.English}</strong>
                    <span><strong>T:</strong> {entry.Telugu || '–'}</span>
                    <span><strong>K:</strong> {entry.Konkani || '–'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step === 1 && (
            <button
              className="primary-button"
              onClick={handleNextStep1}
              disabled={parsedItems.length === 0}
            >
              Next ({parsedItems.length} items)
            </button>
          )}

          {step === 2 && (
            <>
              <button className="secondary-button" onClick={goToPrevWord} disabled={currentIndex === 0}>
                Previous
              </button>
              <button className="primary-button" onClick={goToNextWord}>
                {currentIndex === entries.length - 1 ? 'Review' : 'Next'}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button className="secondary-button" onClick={() => setStep(2)}>
                Back to Editing
              </button>
              <button className="primary-button" onClick={handleConfirmBatchAdd}>
                Add {entries.length} Entries to Dictionary
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchAddModal;