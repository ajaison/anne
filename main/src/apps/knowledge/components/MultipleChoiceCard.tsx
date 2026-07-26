import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { FlashcardContent } from './FlashcardContent';
import type { Card } from '../types';

interface MultipleChoiceCardProps {
  card: Card;
  allCards: Card[]; // Sibling cards used to generate distractors
  onResult: (correct: boolean) => void;
}

/** Pick N random items from array, excluding a specific value */
const pickRandom = (arr: string[], exclude: string, count: number): string[] => {
  const pool = arr.filter(v => v.trim() !== exclude.trim());
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/** Strip markdown fences and trim for use as a choice label */
const stripMarkdown = (text: string): string => {
  return text
    .replace(/```[\w]*\n?/g, '')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .trim()
    .split('\n')[0]  // First line only for choices
    .slice(0, 120);
};

const MultipleChoiceCard: React.FC<MultipleChoiceCardProps> = ({ card, allCards, onResult }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const correctAnswer = stripMarkdown(card.answer);

  const choices = useMemo(() => {
    // Use authored distractors first, otherwise pull from sibling cards
    let distractors: string[] = [];

    if (card.distractors && card.distractors.length >= 3) {
      distractors = card.distractors.slice(0, 3);
    } else {
      const siblingAnswers = allCards
        .filter(c => c.id !== card.id)
        .map(c => stripMarkdown(c.answer));
      distractors = pickRandom(siblingAnswers, correctAnswer, 3);
    }

    // If we still don't have 3, pad with generic Java placeholders
    const javaFallbacks = ['NullPointerException', 'void', 'static', 'final', 'synchronized', 'ArrayList', 'HashMap'];
    while (distractors.length < 3) {
      const fb = javaFallbacks.find(f => f !== correctAnswer && !distractors.includes(f));
      if (fb) distractors.push(fb);
      else break;
    }

    return [...distractors, correctAnswer].sort(() => Math.random() - 0.5);
  }, [card.id]);

  const handleSelect = (choice: string) => {
    if (revealed) return;
    setSelected(choice);
    setRevealed(true);

    const isCorrect = choice === correctAnswer;
    // Give a brief moment to see the result before advancing
    setTimeout(() => onResult(isCorrect), isCorrect ? 1200 : 2200);
  };

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
              whileHover={!revealed ? { scale: 1.02, y: -2 } : {}}
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
        {revealed && selected !== correctAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mc-correction"
          >
            <strong>✅ Correct answer:</strong>
            <div className="mc-correct-answer"><FlashcardContent content={card.answer} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultipleChoiceCard;
