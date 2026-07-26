import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Send } from 'lucide-react';
import { FlashcardContent } from './FlashcardContent';

interface TypeAnswerCardProps {
  question: string;
  answer: string;
  onResult: (correct: boolean) => void;
}

/** Normalise answer text: strip markdown, lowercase, trim */
const normalise = (text: string): string =>
  text
    .replace(/```[\w]*\n?/g, '')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .trim()
    .toLowerCase();

/** Simple fuzzy match — allows 1 char difference per 6 chars */
const fuzzyMatch = (input: string, target: string): boolean => {
  const a = normalise(input);
  const b = normalise(target);
  if (a === b) return true;

  const maxDist = Math.floor(b.length / 6);
  // Levenshtein distance
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length] <= maxDist;
};

const TypeAnswerCard: React.FC<TypeAnswerCardProps> = ({ question, answer, onResult }) => {
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!typed.trim() || submitted) return;

    const correct = fuzzyMatch(typed, answer);
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onResult(correct), correct ? 1200 : 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="ta-card">
      <div className="ta-question">
        <FlashcardContent content={question} />
      </div>

      <form className="ta-form" onSubmit={handleSubmit}>
        <div className={`ta-input-wrapper ${submitted ? (isCorrect ? 'ta-input--correct' : 'ta-input--wrong') : ''}`}>
          <input
            ref={inputRef}
            className="ta-input"
            type="text"
            placeholder="Type your answer..."
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitted}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="ta-submit-btn" disabled={!typed.trim() || submitted}>
            <Send size={18} />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`ta-result ${isCorrect ? 'ta-result--correct' : 'ta-result--wrong'}`}
          >
            {isCorrect ? (
              <div className="ta-result-inner">
                <CheckCircle2 size={22} />
                <span>Correct!</span>
              </div>
            ) : (
              <div className="ta-result-inner">
                <XCircle size={22} />
                <div className="ta-diff">
                  <div className="ta-diff-row">
                    <span className="ta-diff-label">You wrote:</span>
                    <span className="ta-diff-wrong">{typed}</span>
                  </div>
                  <div className="ta-diff-row">
                    <span className="ta-diff-label">Correct answer:</span>
                    <span className="ta-diff-correct">
                      <FlashcardContent content={answer} />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!submitted && (
        <p className="ta-hint">Press <kbd>Enter</kbd> to submit</p>
      )}
    </div>
  );
};

export default TypeAnswerCard;
