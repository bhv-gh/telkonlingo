import React, { useState, useEffect, useMemo } from 'react';
import { ArcherContainer, ArcherElement } from 'react-archer';
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

  const setupGame = () => {
    setGameWon(false);
    setRelations([]);
    const shuffledData = shuffleArray(dictionary);
    const selectedWords = shuffledData.slice(0, 5);
    setGameWords(selectedWords);
    setLeftColumn(shuffleArray(selectedWords));
    setRightColumn(shuffleArray(selectedWords));
  };

  useEffect(() => {
    if (dictionary.length >= 5) {
      setupGame();
    }
  }, [data, settings.learningLanguage]);

  const handleSelect = (word, column) => {
    if (column === 'left') {
      // If user clicks a new source word
      setSelectedSource(word);
    } else if (column === 'right' && selectedSource) {
      // User has selected a source and now clicks a target
      const isMatch = selectedSource.English === word.English;
      const newRelation = {
        targetId: `right-${word.English}`,
        sourceAnchor: 'right',
        targetAnchor: 'left',
        style: {
          strokeColor: isMatch ? '#28a745' : '#dc3545',
          strokeWidth: 2,
        },
      };

      if (isMatch) {
        setRelations([...relations, { ...newRelation, sourceId: `left-${selectedSource.English}` }]);
      } else {
        setTempRelation({ ...newRelation, sourceId: `left-${selectedSource.English}` });
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
    return relations.some(rel => rel.sourceId === id || rel.targetId === id);
  };

  if (dictionary.length < 5) {
    return <div className="matching-game-container"><p>You need at least 5 words in your dictionary to play.</p></div>;
  }

  return (
    <div className="matching-game-container">
      {gameWon && <Confetti recycle={false} numberOfPieces={500} tweenDuration={10000} />}
      <ArcherContainer strokeColor="transparent">
        <div className="matching-game-columns">
          {/* Left Column (English) */}
          <div className="word-column">
            {leftColumn.map((word) => (
              <ArcherElement
                key={`left-${word.English}`}
                id={`left-${word.English}`}
                relations={[
                  ...relations.filter(rel => rel.sourceId === `left-${word.English}`),
                  ...(tempRelation && tempRelation.sourceId === `left-${word.English}` ? [tempRelation] : [])
                ]}
              >
                <button
                  className={`word-box ${selectedSource?.English === word.English ? 'selected' : ''} ${isMatched(word, 'left') ? 'matched' : ''}`}
                  onClick={() => handleSelect(word, 'left')}
                  disabled={isMatched(word, 'left')}
                >
                  {word.English}
                </button>
              </ArcherElement>
            ))}
          </div>

          {/* Right Column (Learning Language) */}
          <div className="word-column">
            {rightColumn.map((word) => (
              <ArcherElement
                key={`right-${word.English}`}
                id={`right-${word.English}`}
                relations={[]}
              >
                <button
                  className={`word-box ${isMatched(word, 'right') ? 'matched' : ''}`}
                  onClick={() => handleSelect(word, 'right')}
                  disabled={isMatched(word, 'right') || !selectedSource}
                >
                  {word[settings.learningLanguage]}
                </button>
              </ArcherElement>
            ))}
          </div>
        </div>
      </ArcherContainer>
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