import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import localforage from 'localforage';
import './BubbleGame.css';

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const BubbleGame = ({ data, settings }) => {
  const [gameWords, setGameWords] = useState([]);
  const [bubbles, setBubbles] = useState([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won
  const gameAreaRef = useRef(null);
  const requestRef = useRef();

  const dictionary = useMemo(() => data.filter(item => item.Type === 'word'), [data]);

  const setupGame = useCallback(async () => {
    setGameState('playing');
    setCurrentTargetIndex(0);

    // --- Reinforcement Learning Logic ---
    let mistakeWeights = (await localforage.getItem('telkonlingoMistakes')) || {};
    const weightedWords = dictionary.map(word => ({
      ...word,
      weight: mistakeWeights[word.English] || 0,
    })).sort((a, b) => b.weight - a.weight); // Prioritize words with more mistakes

    const selectedWords = shuffleArray(weightedWords).slice(0, 5);
    const distractorWords = dictionary.filter(d => !selectedWords.some(sw => sw.English === d.English)).slice(0, 5);
    const allBubbleWords = [...selectedWords, ...distractorWords];

    setGameWords(selectedWords.map(word => ({ ...word, collected: false })));

    // --- Bubble Generation ---
    const initialBubbles = allBubbleWords.map((word, index) => ({
      id: `${Date.now()}-${index}`,
      word: word,
      x: Math.random() * 90, // % position from left
      y: -10 - (Math.random() * 50), // Start off-screen
      // --- Increased Speed ---
      // Bubbles are now 2-4 times faster
      speed: 0.1 + Math.random() * 0.15,
      status: 'active', // active, burst, disperse
    }));
    setBubbles(shuffleArray(initialBubbles));
  }, [dictionary]);

  useEffect(() => {
    if (dictionary.length >= 5) {
      setupGame();
    }
  }, [dictionary, setupGame, settings.learningLanguage]);

  const handleBubbleClick = async (clickedBubble) => {
    if (gameState !== 'playing') return;

    const currentTargetWord = gameWords[currentTargetIndex];

    if (clickedBubble.word.English === currentTargetWord.English) {
      // --- CORRECT ---
      setBubbles(prev => prev.map(b => b.id === clickedBubble.id ? { ...b, status: 'burst' } : b));
      setGameWords(prev => prev.map((w, i) => i === currentTargetIndex ? { ...w, collected: true } : w));

      // Check for win
      if (currentTargetIndex === gameWords.length - 1) {
        setGameState('won');
      } else {
        setCurrentTargetIndex(prev => prev + 1);
      }
    } else {
      // --- INCORRECT ---
      setBubbles(prev => prev.map(b => b.id === clickedBubble.id ? { ...b, status: 'disperse' } : b));

      // Reinforcement learning: increase mistake weight for the word we were supposed to click
      let mistakeWeights = (await localforage.getItem('telkonlingoMistakes')) || {};
      mistakeWeights[currentTargetWord.English] = (mistakeWeights[currentTargetWord.English] || 0) + 1;
      await localforage.setItem('telkonlingoMistakes', mistakeWeights);
    }
  };

  // --- Animation Loop ---
  const animate = useCallback(() => {
    setBubbles(prevBubbles => {
      return prevBubbles.map(bubble => {
        if (bubble.status !== 'active') return bubble;

        let newY = bubble.y + bubble.speed;
        // Reset bubble if it goes off-screen
        if (newY > 110) {
          newY = -10;
          bubble.x = Math.random() * 90;
        }
        return { ...bubble, y: newY };
      }).filter(bubble => bubble.status === 'active' || (bubble.status !== 'active' && bubble.y > -50)); // Keep burst/dispersed bubbles for a bit
    });
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, animate]);

  if (dictionary.length < 5) {
    return <div className="bubble-game-container"><p>You need at least 5 words in your dictionary to play.</p></div>;
  }

  return (
    <div className="bubble-game-container">
      <div className="game-area" ref={gameAreaRef}>
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className={`bubble ${bubble.status}`}
            style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
            onClick={() => handleBubbleClick(bubble)}
          >
            <div className="bubble-inner">
              {bubble.word[settings.learningLanguage]}
            </div>
          </div>
        ))}
      </div>

      <div className="word-sequence-bar">
        {gameWords.map((word, index) => (
          <div
            key={word.English}
            className={`sequence-word ${index === currentTargetIndex ? 'target' : ''} ${word.collected ? 'collected' : ''}`}
          >
            <span className="english-word">{word.English}</span>
            <div className="translation-slot">
              {word.collected ? word[settings.learningLanguage] : '?'}
            </div>
          </div>
        ))}
      </div>

      {gameState === 'won' && (
        <div className="game-won-overlay">
          <h2>Excellent Work!</h2>
          <button onClick={setupGame} className="play-again-button">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default BubbleGame;
