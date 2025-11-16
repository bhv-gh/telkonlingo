import React from 'react';
import './Search.css';

const Search = ({ value, onChange, placeholder }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
      />
    </div>
  );
};

export default Search;