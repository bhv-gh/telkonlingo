import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import localforage from 'localforage';
import './WordLaneGame.css'; // Note: CSS file is also significantly updated

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const GAME_DURATION = 120; // seconds

const WordLaneGame = ({ data, settings }) => {
  const [gameWords, setGameWords] = useState([]);
  const [wordTiles, setWordTiles] = useState([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [gameState, setGameState] = useState('ready'); // ready, playing, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const requestRef = useRef();
  const [draggedTile, setDraggedTile] = useState(null);

  const dictionary = useMemo(() => data.filter(item => item.Type === 'word'), [data]);

  const setupGame = useCallback(async () => {
    setTimeLeft(GAME_DURATION);
    setLives(5);
    setScore(0);

    // --- Reinforcement Learning Logic ---
    let mistakeWeights = (await localforage.getItem('telkonlingoMistakes')) || {};
    const wordBarrel = dictionary.map(word => ({
      ...word,
      weight: mistakeWeights[word.English] || 0,
    })).sort((a, b) => b.weight - a.weight);

    const gameSequence = shuffleArray(wordBarrel).slice(0, 5); // A round consists of 5 words
    setGameWords(gameSequence.map(word => ({ ...word, matched: false, passes: 0 })));

    // --- Tile Generation ---
    const initialTiles = shuffleArray(gameSequence).map((word, index) => ({
      id: `${Date.now()}-${index}`,
      word: word,
      lane: index % 4, // Assign to one of 4 lanes
      x: 110 + (Math.random() * 50), // Start off-screen to the right
      speed: 0.15 + Math.random() * 0.1,
      status: 'active', // active, correct, incorrect
    }));
    setWordTiles(initialTiles);
    setGameState('ready');
  }, [dictionary]);

  useEffect(() => {
    if (dictionary.length >= 5) {
      setupGame(); // Initial setup
      localforage.getItem('telkonlingoHighScore').then(hs => setHighScore(hs || 0));
    }
  }, [dictionary, setupGame]);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    if (timeLeft <= 0) {
      setGameState('gameOver');
      if (score > highScore) {
        setHighScore(score);
        localforage.setItem('telkonlingoHighScore', score);
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, timeLeft, score, highScore]);
  // --- Drag and Drop Handlers ---
  const handleDragStart = (e, tile) => {
    e.dataTransfer.setData('application/json', JSON.stringify(tile));
    setDraggedTile(tile);
  };

  const handleDragEnd = () => {
    setDraggedTile(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, targetWord) => {
    e.preventDefault();
    const draggedData = JSON.parse(e.dataTransfer.getData('application/json'));

    if (targetWord.English === draggedData.word.English) {
      // --- CORRECT DROP ---
      setTimeLeft(prev => Math.min(GAME_DURATION, prev + 3)); // Add 3 seconds, capped at max duration
      setScore(prev => prev + 10);
      // Mark the word as matched to trigger the green feedback
      setGameWords(prev => prev.map(w => w.English === targetWord.English ? { ...w, matched: true } : w));

      // Animate the tile out and then reset it with a new word
      setWordTiles(prev => prev.map(t => t.id === draggedData.id ? { ...t, status: 'correct' } : t));
      setTimeout(() => {
        // Find a new word to replace the matched one
        const availableWords = dictionary.filter(
          d => !gameWords.some(gw => gw.English === d.English) && !wordTiles.some(wt => wt.word.English === d.English)
        );
        const newWord = availableWords.length > 0 ? shuffleArray(availableWords)[0] : shuffleArray(dictionary)[0];

        // Replace the matched word in the sequence bar with the new word
        setGameWords(prev => prev.map(w => w.English === targetWord.English ? { ...newWord, matched: false, passes: 0 } : w));

        // Reset the tile with the new word
        setWordTiles(prev => prev.map(t => 
          t.id === draggedData.id 
            ? { ...t, word: newWord, status: 'active', x: 110 + Math.random() * 50 } 
            : t));
      }, 500);
    } else {
      // --- INCORRECT DROP ---
      if (lives - 1 <= 0) {
        setGameState('gameOver');
        if (score > highScore) {
          setHighScore(score);
          localforage.setItem('telkonlingoHighScore', score);
        }
        return;
      }
      setLives(prev => prev - 1);
      setWordTiles(prev => prev.map(t => t.id === draggedData.id ? { ...t, status: 'incorrect' } : t));
      // Reset the incorrect status after the animation
      setTimeout(() => {
        setWordTiles(prev => prev.map(t => t.id === draggedData.id ? { ...t, status: 'active' } : t));
      }, 500);

      // Reinforcement learning
      let mistakeWeights = (await localforage.getItem('telkonlingoMistakes')) || {};
      mistakeWeights[draggedData.word.English] = (mistakeWeights[draggedData.word.English] || 0) + 1;
      await localforage.setItem('telkonlingoMistakes', mistakeWeights);
    }
  };

  const animate = useCallback(() => {
    let wasWordMissed = false;
    let missedWord = null;

    setWordTiles(prevTiles => {
      const newTiles = prevTiles.map(tile => {
        // Pause animation for dragged and correctly matched tiles
        if (tile.status === 'correct' || (draggedTile && tile.id === draggedTile.id)) {
          return tile;
        }

        let newX = tile.x - tile.speed;

        // Check if a target tile went off-screen
        if (newX < -20) {
          const currentTarget = gameWords.find(w => !w.matched);
          if (currentTarget && tile.word.English === currentTarget.English) {
            wasWordMissed = true;
            missedWord = currentTarget;
          }
          newX = 110 + Math.random() * 50;
        }
        return { ...tile, x: newX };
      });
      return newTiles;
    });

    if (wasWordMissed && missedWord) {
      const newPassCount = missedWord.passes + 1;
      if (newPassCount >= 5) {
        if (lives - 1 <= 0) {
          setGameState('gameOver');
          if (score > highScore) {
            setHighScore(score);
            localforage.setItem('telkonlingoHighScore', score);
          }
        } else {
          setLives(prev => prev - 1);
          // Mark as skipped and move on
          setGameWords(prev => prev.map(w => w.English === missedWord.English ? { ...w, matched: 'skipped' } : w));
        }
      } else {
        // Update pass count for the missed word
        setGameWords(prev => prev.map(w => w.English === missedWord.English ? { ...w, passes: newPassCount } : w));
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [draggedTile, gameWords, lives]);

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, animate]);

  if (dictionary.length < 5) {
    return <div className="word-lane-container"><p>You need at least 5 words in your dictionary to play.</p></div>;
  }

  return (
    <div className="word-lane-container">
      <div className="game-hud">
        <div className="lives-container">
          <span>Lives: </span>
          {Array.from({ length: 5 }).map((_, i) => <span key={i} className={`heart ${i < lives ? 'full' : 'empty'}`}>♥</span>)}
        </div>
        <div className="stat-item">Score: <span>{score}</span></div>
        <div className="timer-container">
          <div className="timer-bar" style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}></div>
          <span className="timer-text">{timeLeft}s</span>
        </div>
        <div className="stat-item">High Score: <span>{highScore}</span></div>
      </div>
      <div className="game-lanes">
        {[0, 1, 2, 3].map(laneIndex => (
          <div key={laneIndex} className="lane">
            {wordTiles.filter(t => t.lane === laneIndex).map(tile => (
              <div
                key={tile.id}
                className={`word-tile ${tile.status} ${draggedTile && tile.id === draggedTile.id ? 'dragging' : ''}`}
                draggable={tile.status === 'active'}
                style={{ left: `${tile.x}%` }}
                onDragStart={(e) => handleDragStart(e, tile)}
                onDragEnd={handleDragEnd}
              >
                {tile.word[settings.learningLanguage]}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="word-sequence-bar">
        {gameWords.map((word) => (
          <div
            key={word.English}
            className={`sequence-word ${word.matched === true ? 'matched' : ''} ${word.matched === 'skipped' ? 'skipped' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, word)}
          >
            <span className="english-word">{word.English}</span>
            <div className="translation-slot">
              {word.matched === true ? word[settings.learningLanguage] : '?'}
            </div>
          </div>
        ))}
      </div>
      {gameState === 'ready' && (
        <div className="game-won-overlay">
          <h2>Word Lane</h2>
          <p>Drag the sliding words to their English match.</p>
          <button onClick={() => setGameState('playing')} className="play-again-button">Start Game</button>
        </div>
      )}
      {gameState === 'gameOver' && (
        <div className="game-won-overlay">
          <h2>Game Over</h2>
          <p className="final-score">Your Score: {score}</p>
          <p>You've run out of lives!</p>
          <button onClick={setupGame} className="play-again-button">Try Again</button>
        </div>
      )}
    </div>
  );
};

export default WordLaneGame;