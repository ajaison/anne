import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { FlashcardContent } from './FlashcardContent';
import type { Card } from '../types';
import { authoredChoices, choiceProblem, displayChoice, splitChoiceAnswer } from '../services/multipleChoice';

interface MultipleChoiceCardProps {
  card: Card;
  onSkip: () => void;
  onResult: (correct: boolean) => void;
  disabled?: boolean;
}

const MultipleChoiceCard: React.FC<MultipleChoiceCardProps> = ({ card, onResult, onSkip, disabled = false }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showUnreadyAnswer, setShowUnreadyAnswer] = useState(false);
  const [choices] = useState(() => authoredChoices(card));
  const content = splitChoiceAnswer(card.answer);
  const correctAnswer = displayChoice(content.correctOption);
  const problem = choiceProblem(card.answer, card.distractors);

  const handleSelect = (choice: string) => {
    if (revealed || disabled) return;
    setSelected(choice);
    setRevealed(true);
  };

  const handleNext = () => {
    if (!selected || disabled) return;
    onResult(selected === correctAnswer);
  };

  // Keyboard Enter shortcut to advance after revealing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (revealed && selected && !disabled && !e.repeat && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onResult(selected === correctAnswer);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, selected, correctAnswer, disabled, onResult]);

  const getChoiceState = (choice: string) => {
    if (!revealed) return 'idle';
    if (choice === correctAnswer) return 'correct';
    if (choice === selected) return 'wrong';
    return 'dim';
  };

  if (problem) return (
    <div className="mc-card">
      <FlashcardContent content={card.question} />
      <div className="study-save-notice" role="status">
        <p>This card needs authored answer choices. {problem}</p>
        <p>Use Edit card in the deck to prepare it for multiple-choice practice.</p>
      </div>
      {!showUnreadyAnswer ? (
        <button className="show-btn" onClick={() => setShowUnreadyAnswer(true)}>View answer without grading</button>
      ) : <FlashcardContent content={card.answer} />}
      <button className="primary-btn" onClick={onSkip} disabled={disabled}>Skip unprepared card →</button>
    </div>
  );

  return (
    <div className="mc-card">
      <div className="mc-question">
        <FlashcardContent content={card.question} />
      </div>

      <div className="mc-choices">
        {choices.map((choice, i) => {
          const state = getChoiceState(choice);
          return (
            <motion.button
              key={i}
              className={`mc-choice mc-choice--${state}`}
              onClick={() => handleSelect(choice)}
              whileHover={!revealed ? { scale: 1.01, y: -2 } : {}}
              animate={state === 'wrong' ? { x: [0, -10, 10, -8, 8, 0] } : {}}
              transition={state === 'wrong' ? { duration: 0.4 } : { duration: 0.15 }}
              disabled={revealed || disabled}
            >
              <span className="mc-choice-letter">{String.fromCharCode(65 + i)}</span>
              <span className="mc-choice-text">{choice}</span>
              <AnimatePresence>
                {revealed && state === 'correct' && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mc-icon correct-icon">
                    <CheckCircle2 size={20} />
                  </motion.span>
                )}
                {revealed && state === 'wrong' && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mc-icon wrong-icon">
                    <XCircle size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mc-explanation-wrapper"
          >
            <div className={`mc-correction ${selected === correctAnswer ? 'mc-correction--correct' : 'mc-correction--wrong'}`}>
              <strong>{selected === correctAnswer ? '🎉 Correct!' : '❌ Incorrect'}</strong>
              <div className="mc-correct-answer">
                <p className="mc-answer-label">Correct answer</p>
                <div className="mc-choice-text">{correctAnswer}</div>
                {content.explanation && (
                  <>
                    <p className="mc-answer-label">Why?</p>
                    <FlashcardContent content={content.explanation} />
                  </>
                )}
              </div>
            </div>

            <button className="primary-btn mc-next-btn" onClick={handleNext} disabled={disabled}>
              Next Question <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultipleChoiceCard;
