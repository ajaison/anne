import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FillBlankCardProps {
  question: string;
  answer: string;
  onResult: (correct: boolean) => void;
}

// Java keywords prioritised for blanking
const JAVA_KEYWORDS = [
  'synchronized', 'volatile', 'transient', 'native', 'strictfp',
  'abstract', 'interface', 'implements', 'extends', 'instanceof',
  'static', 'final', 'public', 'private', 'protected',
  'throws', 'throw', 'catch', 'finally', 'try',
  'return', 'void', 'new', 'this', 'super',
  'class', 'enum', 'record', 'sealed', 'permits',
  'default', 'break', 'continue', 'switch', 'case',
  'for', 'while', 'do', 'if', 'else',
  'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short',
  'String', 'Integer', 'Long', 'Double', 'Boolean', 'Object',
  'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'TreeMap',
  'Set', 'HashSet', 'Queue', 'Stack', 'Iterator',
  'Optional', 'Stream', 'CompletableFuture', 'Thread', 'Runnable',
  'Override', 'FunctionalInterface', 'Deprecated',
  'null', 'true', 'false',
];

/** Extract the token to blank from the answer text */
const extractBlankToken = (answer: string): string => {
  // 1. Backtick-wrapped terms first: `keyword`
  const backtickMatch = answer.match(/`([^`]+)`/);
  if (backtickMatch) return backtickMatch[1];

  // 2. Java keywords (checked in priority order)
  const words = answer.split(/\s+/);
  for (const kw of JAVA_KEYWORDS) {
    if (words.some(w => w.replace(/[^a-zA-Z0-9_]/g, '') === kw)) {
      return kw;
    }
  }

  // 3. CamelCase words
  const camelMatch = answer.match(/\b[A-Z][a-z]+[A-Z][a-zA-Z]+\b/);
  if (camelMatch) return camelMatch[0];

  // 4. Fallback: longest word
  return words.reduce((a, b) => (b.length > a.length ? b : a), '');
};

/** Apply the blank to the answer text, replacing token with ___ */
const applyBlank = (answer: string, token: string): string => {
  return answer.replace(new RegExp(`(?<![a-zA-Z])${token}(?![a-zA-Z])`, 'g'), '___');
};

/** Generate word chip options — correct + 3 similar distractors */
const generateChips = (token: string): string[] => {
  const idx = JAVA_KEYWORDS.indexOf(token);
  let pool: string[] = [];

  if (idx !== -1) {
    const start = Math.max(0, idx - 5);
    pool = JAVA_KEYWORDS.slice(start, start + 8).filter(k => k !== token);
  } else {
    pool = JAVA_KEYWORDS.slice(0, 8);
  }

  const distractors = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...distractors, token].sort(() => Math.random() - 0.5);
};

const FillBlankCard: React.FC<FillBlankCardProps> = ({ question, answer, onResult }) => {
  const blankToken = useMemo(() => extractBlankToken(answer), [answer]);
  const blankedAnswer = useMemo(() => applyBlank(answer, blankToken), [answer, blankToken]);
  const chips = useMemo(() => generateChips(blankToken), [blankToken]);

  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleChipSelect = (chip: string) => {
    if (revealed) return;
    setSelected(chip);
    setRevealed(true);
  };

  const handleNext = () => {
    if (!selected) return;
    onResult(selected === blankToken);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, selected, blankToken]);

  const getChipState = (chip: string) => {
    if (!revealed) return 'idle';
    if (chip === blankToken) return 'correct';
    if (chip === selected) return 'wrong';
    return 'dim';
  };

  const codeWithSlot = blankedAnswer.replace('___', '[  ?  ]');

  return (
    <div className="fb-card">
      <div className="fb-question">
        <p>{question}</p>
      </div>

      <div className="fb-code-area">
        <div className="fb-code-label">Fill in the blank:</div>
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language="java"
          PreTag="div"
          showLineNumbers={false}
          customStyle={{
            borderRadius: '12px',
            fontSize: '1rem',
            lineHeight: '1.7',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            padding: '20px 24px',
          }}
        >
          {codeWithSlot}
        </SyntaxHighlighter>
      </div>

      <div className="fb-chips">
        {chips.map((chip, i) => {
          const state = getChipState(chip);
          return (
            <motion.button
              key={i}
              className={`fb-chip fb-chip--${state}`}
              onClick={() => handleChipSelect(chip)}
              whileHover={!revealed ? { scale: 1.05, y: -3 } : {}}
              animate={state === 'wrong' ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={state === 'wrong' ? { duration: 0.35 } : {}}
              disabled={revealed}
            >
              {chip}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="fb-result-wrapper"
          >
            <div className={`fb-result ${selected === blankToken ? 'fb-result--correct' : 'fb-result--wrong'}`}>
              {selected === blankToken ? (
                <><CheckCircle2 size={20} /> Correct! The answer is <strong>{blankToken}</strong></>
              ) : (
                <><XCircle size={20} /> The correct answer was <strong>{blankToken}</strong></>
              )}
            </div>

            <button className="primary-btn fb-next-btn" onClick={handleNext}>
              Next Question <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FillBlankCard;
