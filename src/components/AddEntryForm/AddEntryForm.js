import React, { useState } from 'react';
import './AddEntryForm.css'; // Import the dedicated stylesheet

const AddEntryForm = ({ onAddEntry }) => {
  const [entry, setEntry] = useState({
    English: '',
    Telugu: '',
    Konkani: '',
    Type: 'word',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntry({ ...entry, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entry.English && entry.Telugu && entry.Konkani) {
      onAddEntry(entry);
      setEntry({ English: '', Telugu: '', Konkani: '', Type: 'word' });
    }
  };

  return (
    <div className="add-entry-form">
      <h3>Add a New Entry</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="English">English</label>
          <input
            type="text"
            id="English"
            name="English"
            placeholder="e.g., Hello"
            value={entry.English}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="Telugu">Telugu</label>
          <input
            type="text"
            id="Telugu"
            name="Telugu"
            placeholder="e.g., నమస్కారం"
            value={entry.Telugu}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="Konkani">Konkani</label>
          <input
            type="text"
            id="Konkani"
            name="Konkani"
            placeholder="e.g., नमस्कार"
            value={entry.Konkani}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="Type">Type</label>
          <select id="Type" name="Type" value={entry.Type} onChange={handleChange}>
            <option value="word">Word</option>
            <option value="phrase">Phrase</option>
          </select>
        </div>
        <button type="submit">Add Entry</button>
      </form>
    </div>
  );
};

export default AddEntryForm;
