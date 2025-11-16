import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Xarrow, { Xwrapper } from 'react-xarrows';
import Confetti from 'react-confetti';
import './MatchingGame.css';

// Helper to shuffle arrays
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const MatchingGame = ({ data, settings }) => {
  const [gameWords, setGameWords] = useState([]);
  const [leftColumn, setLeftColumn] = useState([]);
  const [rightColumn, setRightColumn] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [relations, setRelations] = useState([]);
  const [tempRelation, setTempRelation] = useState(null);
  const [gameWon, setGameWon] = useState(false);

  const dictionary = useMemo(() => data.filter(item => item.Type === 'word'), [data]);

  const setupGame = useCallback(() => {
    setGameWon(false);
    setRelations([]);
    setTempRelation(null);
    setSelectedSource(null);
    const shuffledData = shuffleArray(dictionary);
    const selectedWords = shuffledData.slice(0, 5);
    setGameWords(selectedWords);
    setLeftColumn(shuffleArray(selectedWords));
    setRightColumn(shuffleArray(selectedWords));
  }, [dictionary]);

  useEffect(() => {
    if (dictionary.length >= 5) {
      setupGame();
    }
  }, [dictionary.length, setupGame]);

  const handleSelect = (word, column) => {
    if (column === 'left') {
      // If user clicks a new source word
      setSelectedSource(word);
    } else if (column === 'right' && selectedSource) {
      // User has selected a source and now clicks a target
      const isMatch = selectedSource.English === word.English;
      const newRelation = {
        start: `left-${selectedSource.English}`,
        end: `right-${word.English}`,
      };
      if (isMatch) {
        setRelations([...relations, newRelation]);
      } else {
        // Set a temporary red arrow
        setTempRelation(newRelation);
        setTimeout(() => setTempRelation(null), 500);
      }
      setSelectedSource(null); // Reset selection
    }
  };

  useEffect(() => {
    if (gameWords.length > 0 && relations.length === gameWords.length) {
      setGameWon(true);
    }
  }, [relations, gameWords]);

  const isMatched = (word, column) => {
    const id = `${column}-${word.English}`;
    return relations.some(rel => rel.start === id || rel.end === id);
  };

  if (dictionary.length < 5) {
    return <div className="matching-game-container"><p>You need at least 5 words in your dictionary to play.</p></div>;
  }

  return (
    <div className="matching-game-container">
      <Xwrapper>
        {gameWon && (
          <Confetti
            recycle={false}
            numberOfPieces={400}
            gravity={0.1}
            // Using window dimensions makes it cover the full game screen
            width={window.innerWidth}
            height={window.innerHeight}
          />
        )}
        <div className="matching-game-columns">
          {/* Left Column (English) */}
          <div className="word-column">
            {leftColumn.map((word) => (
              <button
                key={`left-${word.English}`}
                id={`left-${word.English}`}
                className={`word-box ${selectedSource?.English === word.English ? 'selected' : ''} ${isMatched(word, 'left') ? 'matched' : ''}`}
                onClick={() => handleSelect(word, 'left')}
                disabled={isMatched(word, 'left')}
              >
                {word.English}
              </button>
            ))}
          </div>

          {/* Right Column (Learning Language) */}
          <div className="word-column">
            {rightColumn.map((word) => (
              <button
                key={`right-${word.English}`}
                id={`right-${word.English}`}
                className={`word-box ${isMatched(word, 'right') ? 'matched' : ''}`}
                onClick={() => handleSelect(word, 'right')}
                disabled={isMatched(word, 'right') || !selectedSource}
              >
                {word[settings.learningLanguage]}
              </button>
            ))}
          </div>

          {/* Render permanent lines for correct matches */}
          {relations.map((rel) => (
            <Xarrow
              key={`${rel.start}-${rel.end}`}
              start={rel.start}
              end={rel.end}
              color="#28a745"
              strokeWidth={2}
              path="smooth"
            />
          ))}

          {/* Render temporary line for incorrect match */}
          {tempRelation && (
            <Xarrow
              start={tempRelation.start}
              end={tempRelation.end}
              color="#dc3545"
              strokeWidth={2}
              path="smooth"
            />
          )}
        </div>
      </Xwrapper>
      {gameWon && (
        <div className="game-won-overlay">
          <h2>Congratulations!</h2>
          <button onClick={setupGame} className="play-again-button">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default MatchingGame;