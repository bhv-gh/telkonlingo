import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload/FileUpload';
import DataTable from './components/DataTable/DataTable';
import AddEntryForm from './components/AddEntryForm/AddEntryForm';
import Search from './Search';
import Learn from './Learn';
import SettingsModal from './SettingsModal';
import { parseCSV } from './utils';
import localforage from 'localforage';
import Fuse from 'fuse.js';

function App() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    learningLanguage: 'Konkani', // Default language
  });

  useEffect(() => {
    localforage.getItem('telkonlingoData').then((storedData) => {
      if (storedData) {
        setData(storedData);
      }
    });

    localforage.getItem('telkonlingoSettings').then((storedSettings) => {
      if (storedSettings) {
        setSettings(storedSettings);
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

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    localforage.setItem('telkonlingoSettings', newSettings);
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
        <button onClick={() => setIsSettingsOpen(true)} className="settings-button" aria-label="Open settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>
        </button>
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
        <button
          onClick={() => setActiveTab('learn')}
          className={`tab-button ${activeTab === 'learn' ? 'active' : ''}`}
        >
          Learn
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
              settings={settings}
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
        {activeTab === 'learn' && (
          <Learn data={data} settings={settings} />
        )}
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}

export default App;
