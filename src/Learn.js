import React, { useState } from 'react';
import Quiz from './Quiz';
import MatchingGame from './MatchingGame';
import WordLaneGame from './WordLaneGame';
import './Learn.css';

const Learn = ({ data, settings }) => {
  const [activeGame, setActiveGame] = useState(null);

  const renderGame = () => {
    switch (activeGame) {
      case 'quiz':
        return <Quiz data={data} settings={settings} />;
      case 'matching':
        return <MatchingGame data={data} settings={settings} />;
      case 'wordlane':
        return <WordLaneGame data={data} settings={settings} />;
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
            <div className="game-card" onClick={() => setActiveGame('matching')}>
              <h3>Matching Game</h3>
              <p>Draw lines to match words with their translations.</p>
            </div>
            <div className="game-card" onClick={() => setActiveGame('wordlane')}>
              <h3>Word Lane</h3>
              <p>Catch the sliding words in the correct order.</p>
            </div>
          </div>
        </>
      ) : (
        <div className={`game-fullscreen-container game-fullscreen-container--${activeGame}`}>
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