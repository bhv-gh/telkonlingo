import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Quiz.css';
import Fuse from 'fuse.js';
import Confetti from 'react-confetti';

// Helper to shuffle arrays
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const Quiz = ({ data, settings }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiSource, setConfettiSource] = useState(null);
  const [shake, setShake] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);

  const phrases = useMemo(() => data.filter(item => item.Type === 'phrase'), [data]);
  const words = useMemo(() => data.filter(item => item.Type === 'word'), [data]);

  const generateQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setFeedback('');
    setShowConfetti(false);
    setConfettiSource(null);
    setShake(false);
    setCorrectFlash(false);
    setIsCorrect(null);

    const sourceData = Math.random() > 0.5 ? phrases : words;
    if (sourceData.length < 4) {
      setCurrentQuestion(null);
      return;
    }

    const correctEntry = sourceData[Math.floor(Math.random() * sourceData.length)];

    // Use Fuse.js to find similar items for better distractors
    const fuse = new Fuse(sourceData, {
      keys: ['English'],
      threshold: 0.8, // Looser threshold to find more potential distractors
    });

    // Find items similar to the correct answer's English text
    const similarItems = fuse.search(correctEntry.English)
      .map(result => result.item)
      // Filter out the correct answer itself
      .filter(item => item.English !== correctEntry.English);

    // Take the top 3 most similar items as distractors
    const distractors = shuffleArray(similarItems).slice(0, 3);

    // If we don't have enough similar distractors, fill with random ones
    while (distractors.length < 3 && sourceData.length > distractors.length + 1) {
      const randomEntry = sourceData[Math.floor(Math.random() * sourceData.length)];
      if (randomEntry.English !== correctEntry.English && !distractors.some(d => d.English === randomEntry.English)) {
        distractors.push(randomEntry);
      }
    }

    setCurrentQuestion(correctEntry);
    const learningLang = settings.learningLanguage;
    const answerOptions = [
      correctEntry[learningLang],
      ...distractors.map(d => d[learningLang])
    ];
    setOptions(shuffleArray(answerOptions));
  }, [phrases, words, settings.learningLanguage]);

  useEffect(() => {
    if (data.length >= 4) {
      generateQuestion();
    }
  }, [data.length, generateQuestion]);

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    // Now that the confetti is done, move to the next question
    generateQuestion();
  };

  const handleOptionClick = (option, event) => {
    if (selectedAnswer) return; // Prevent changing answer

    setSelectedAnswer(option);
    setQuestionsAsked(questionsAsked + 1);
    const learningLang = settings.learningLanguage;
    if (option === currentQuestion[learningLang]) {
      setIsCorrect(true);
      setFeedback('Correct!');
      setCorrectFlash(true);

      const rect = event.currentTarget.getBoundingClientRect();
      setConfettiSource({
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
      });
      setShowConfetti(true);
      setScore(score + 1);
    } else {
      setIsCorrect(false);
      setFeedback(`The correct answer is: ${currentQuestion[learningLang]}`);
      setShake(true);
      // For incorrect answers, wait a bit before moving on
      setTimeout(() => {
        generateQuestion();
      }, 2000); // 2-second delay
    }
  };

  const getButtonClass = (option) => {
    if (!selectedAnswer) return '';
    const learningLang = settings.learningLanguage;
    if (option === currentQuestion[learningLang]) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    // If an answer is selected, and this button is neither correct nor the selected answer, fade it out.
    if (selectedAnswer) return 'faded';

    return ''; // Default class
  };

  if (data.length < 4) {
    return <div className="quiz-container"><p>You need at least 4 dictionary entries to start a quiz.</p></div>;
  }

  if (!currentQuestion) {
    return <div className="quiz-container"><p>Loading quiz...</p></div>;
  }

  return (
    <div className={`quiz-container ${shake ? 'shake' : ''} ${correctFlash ? 'correct-flash' : ''}`}>
      {showConfetti && (
        <Confetti
          recycle={false}
          onConfettiComplete={handleConfettiComplete}
          confettiSource={confettiSource}
          gravity={0.3}
          spread={360}
          startVelocity={40}
          decay={0.85}
          numberOfPieces={250}
          tweenDuration={500}
        />
      )}
      <div className="quiz-header">
        <p className="score">Score: {score} / {questionsAsked}</p>
      </div>
      <div className="question-area">
        <p className="question-prompt">What is the {settings.learningLanguage} translation for:</p>
        <h3 className="question-text">"{currentQuestion.English}"</h3>
      </div>
      <div className="options-grid">
        {options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${getButtonClass(option)}`}
            onClick={(e) => handleOptionClick(option, e)}
            disabled={!!selectedAnswer}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="quiz-footer">
        {/* The feedback message will appear here after an answer is selected */}
        <p className={`feedback-message ${isCorrect === true ? 'correct-feedback' : 'incorrect-feedback'}`}>{feedback}</p>
      </div>
    </div>
  );
};

export default Quiz;