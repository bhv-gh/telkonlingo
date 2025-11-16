import React, { useState } from 'react';
import './DataTable.css'; // Import the dedicated stylesheet

const DataTable = ({ data, onDeleteEntry, onUpdateEntry }) => {
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, header }
  const [editValue, setEditValue] = useState('');

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const handleDoubleClick = (rowIndex, header, value) => {
    setEditingCell({ rowIndex, header });
    setEditValue(value);
  };

  const handleBlur = () => {
    if (editingCell) {
      onUpdateEntry(editingCell.rowIndex, editingCell.header, editValue);
      setEditingCell(null);
    }
  };

  const handleChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="data-table-container">
      {data.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
              <th className="action-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header) => (
                  <td
                    key={header}
                    onDoubleClick={() => handleDoubleClick(rowIndex, header, row[header])}
                  >
                    {editingCell &&
                    editingCell.rowIndex === rowIndex &&
                    editingCell.header === header ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="edit-input"
                      />
                    ) : (
                      row[header]
                    )}
                  </td>
                ))}
                <td className="action-cell">
                  <button
                    onClick={() => onDeleteEntry(rowIndex)}
                    className="delete-button"
                    aria-label="Delete entry"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data yet. Add some entries or upload a CSV file.</p>
      )}
    </div>
  );
};

export default DataTable;
