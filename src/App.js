import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload/FileUpload';
import DataTable from './components/DataTable/DataTable';
import AddEntryForm from './components/AddEntryForm/AddEntryForm';
import Search from './Search';
import { parseCSV } from './utils';
import localforage from 'localforage';
import Fuse from 'fuse.js';

function App() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('view');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localforage.getItem('telkonlingoData').then((storedData) => {
      if (storedData) {
        setData(storedData);
      }
    });
  }, []);

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        const parsedData = parseCSV(csvData);
        const newData = [...data, ...parsedData];
        setData(newData);
        localforage.setItem('telkonlingoData', newData);
      };
      reader.readAsText(file);
    }
  };

  const handleAddEntry = (entry) => {
    const newData = [...data, entry];
    setData(newData);
    localforage.setItem('telkonlingoData', newData);
  };

  const handleDeleteEntry = (indexToDelete) => {
    const newData = data.filter((_, index) => index !== indexToDelete);
    setData(newData);
    localforage.setItem('telkonlingoData', newData);
  };

  const handleUpdateEntry = (rowIndex, column, value) => {
    const newData = [...data];
    newData[rowIndex][column] = value;
    setData(newData);
    localforage.setItem('telkonlingoData', newData);
  };

  // Fuzzy search setup
  const fuse = new Fuse(data, {
    keys: ['English', 'Telugu', 'Konkani'],
    includeScore: true,
    threshold: 0.4,
  });

  const searchResults = searchQuery ? fuse.search(searchQuery).map(result => result.item) : data;

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };



  return (
    <div className="App">
      <header className="App-header">
        <h1>Telkonlingo</h1>
        <p>Your personal dictionary builder.</p>
      </header>
      <div className="tab-nav">
        <button
          onClick={() => setActiveTab('view')}
          className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
        >
          View Dictionary
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
        >
          Manage Dictionary
        </button>
      </div>
      <div className="main-content">
        {activeTab === 'view' && (
          <>
            <Search
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Fuzzy search in your dictionary..."
            />
            <DataTable
              data={searchResults}
              onDeleteEntry={handleDeleteEntry}
              onUpdateEntry={handleUpdateEntry}
            />
          </>
        )}
        {activeTab === 'manage' && (
          <div className="manage-dictionary-tab">
            <AddEntryForm onAddEntry={handleAddEntry} />
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
