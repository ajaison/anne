import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { FlashcardContent } from './FlashcardContent';
import type { Card } from '../types';

interface MultipleChoiceCardProps {
  card: Card;
  allCards: Card[];
  onResult: (correct: boolean) => void;
}

/** Format answer/distractor text cleanly for choice display */
const cleanChoice = (text: string): string => {
  return text
    .replace(/```[\w]*\n?/g, '')
    .replace(/`/g, '')
    .trim();
};

/** Smart domain fallback distractors when authored distractors are missing */
const getSmartFallbacks = (answer: string): string[] => {
  const cleanAns = cleanChoice(answer).toLowerCase();

  // 1. Boolean pair answers
  if (cleanAns === 'true false' || cleanAns === 'false true') {
    return ['true true', 'false false', cleanAns === 'true false' ? 'false true' : 'true false'];
  }
  if (cleanAns === 'true' || cleanAns === 'false') {
    return [cleanAns === 'true' ? 'false' : 'true', 'Compiler Error', 'Runtime Exception'];
  }

  // 2. Numeric / single word answers
  if (/^-?\d+(\.\d+)?$/.test(cleanAns)) {
    const num = parseFloat(cleanAns);
    return [
      String(num + 1),
      String(num - 1),
      String(num === 0 ? 1 : 0),
      'Compiler Error'
    ];
  }

  // 3. Compiler Error answers
  if (cleanAns.includes('compiler error') || cleanAns.includes('compile error')) {
    return [
      'Compiles cleanly and executes without error',
      'Throws NullPointerException at runtime',
      'Throws ClassCastException at runtime'
    ];
  }

  // 4. Runtime Exception answers
  if (cleanAns.includes('exception')) {
    return [
      'Compiles cleanly and prints nothing',
      'Compiler Error: incompatible types',
      'Throws ClassCastException at runtime'
    ];
  }

  // Default clean fallbacks matching technical Java output styles
  return [
    'Compiler Error: incompatible types',
    'Throws NullPointerException at runtime',
    'Compiles cleanly and executes successfully'
  ];
};

const MultipleChoiceCard: React.FC<MultipleChoiceCardProps> = ({ card, allCards, onResult }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const correctAnswer = useMemo(() => cleanChoice(card.answer.split('\n')[0]), [card.answer]);

  const choices = useMemo(() => {
    let distractors: string[] = [];

    // 1. Use authored distractors if available
    if (card.distractors && card.distractors.length > 0) {
      distractors = card.distractors.map(d => cleanChoice(d)).filter(d => d !== correctAnswer);
    }

    // 2. If fewer than 3 distractors, filter sibling cards for short, structurally similar answers
    if (distractors.length < 3) {
      const isShort = correctAnswer.length < 40;
      const siblingChoices = allCards
        .filter(c => c.id !== card.id)
        .map(c => cleanChoice(c.answer.split('\n')[0]))
        .filter(ans => {
          if (ans === correctAnswer || distractors.includes(ans)) return false;
          // Only pick sibling answers that match length category to prevent obvious choices
          return isShort ? ans.length < 50 : ans.length >= 40;
        });

      // Shuffe & pick
      const shuffled = [...siblingChoices].sort(() => Math.random() - 0.5);
      distractors.push(...shuffled.slice(0, 3 - distractors.length));
    }

    // 3. If still under 3, use smart domain fallbacks
    if (distractors.length < 3) {
      const smart = getSmartFallbacks(correctAnswer);
      for (const fb of smart) {
        if (fb !== correctAnswer && !distractors.includes(fb)) {
          distractors.push(fb);
          if (distractors.length >= 3) break;
        }
      }
    }

    return [...distractors.slice(0, 3), correctAnswer].sort(() => Math.random() - 0.5);
  }, [card.id, card.distractors, card.answer, allCards, correctAnswer]);

  const handleSelect = (choice: string) => {
    if (revealed) return;
    setSelected(choice);
    setRevealed(true);
  };

  const handleNext = () => {
    if (!selected) return;
    onResult(selected === correctAnswer);
  };

  // Keyboard Enter shortcut to advance after revealing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, selected, correctAnswer]);

  const getChoiceState = (choice: string) => {
    if (!revealed) return 'idle';
    if (choice === correctAnswer) return 'correct';
    if (choice === selected) return 'wrong';
    return 'dim';
  };

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
              disabled={revealed}
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
                <FlashcardContent content={card.answer} />
              </div>
            </div>

            <button className="primary-btn mc-next-btn" onClick={handleNext}>
              Next Question <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultipleChoiceCard;
