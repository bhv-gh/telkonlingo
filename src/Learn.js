import React, { useState } from 'react';
import Quiz from './Quiz';
import './Learn.css';

const Learn = ({ data, settings }) => {
  const [activeGame, setActiveGame] = useState(null);

  const renderGame = () => {
    switch (activeGame) {
      case 'quiz':
        return <Quiz data={data} settings={settings} />;
      default:
        return null;
    }
  };

  return (
    <div className="learn-container">
      {!activeGame ? (
        <>
          <h2>Learning Zone</h2>
          <p>Select a game to start learning!</p>
          <div className="game-selection-menu">
            <div className="game-card" onClick={() => setActiveGame('quiz')}>
              <h3>Quiz</h3>
              <p>Test your vocabulary with multiple-choice questions.</p>
            </div>
            {/* You can add more game cards here in the future */}
          </div>
        </>
      ) : (
        <div className="game-fullscreen-container">
          <button onClick={() => setActiveGame(null)} className="close-game-button" aria-label="Close game">
            &times;
          </button>
          {renderGame()}
        </div>
      )}
    </div>
  );
};

export default Learn;