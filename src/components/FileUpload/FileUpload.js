import React, { useState } from 'react';
import './FileUpload.css'; // Import the dedicated stylesheet

const FileUpload = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState('No file chosen');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileUpload(file);
    } else {
      setFileName('No file chosen');
    }
  };

  return (
    <div className="file-upload">
      <h3>Or Upload a CSV File</h3>
      <p className="upload-instructions">File should have columns: English, Telugu, Konkani, Type</p>
      <label htmlFor="file-upload" className="file-upload-button">Choose CSV File</label>
      <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} />
      <span className="file-name">{fileName}</span>
    </div>
  );
};

export default FileUpload;
