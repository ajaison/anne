import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ChevronDown } from 'lucide-react';
import { createCard } from '../services/supabase';
import type { StudyMode } from '../types';

interface QuickAddPanelProps {
  deckId: string;
  deckName: string;
  onClose: () => void;
  onCardAdded: () => void;
}

const MODE_OPTIONS: { value: StudyMode; label: string; desc: string }[] = [
  { value: 'multiple_choice', label: '🎯 Multiple Choice', desc: 'Pick the right answer from 4 options' },
  { value: 'fill_blank', label: '✏️ Fill in the Blank', desc: 'Java code with a key word missing' },
  { value: 'type_answer', label: '⌨️ Type Answer', desc: 'Type the answer yourself' },
  { value: 'classic', label: '🃏 Classic Flip', desc: 'Traditional flashcard flip' },
];

const QuickAddPanel: React.FC<QuickAddPanelProps> = ({ deckId, deckName, onClose, onCardAdded }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [cardType, setCardType] = useState<StudyMode>('multiple_choice');
  const [isCode, setIsCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const questionRef = useRef<HTMLTextAreaElement>(null);

  // Focus question on open
  useEffect(() => {
    questionRef.current?.focus();
  }, []);

  // Auto-detect code content
  useEffect(() => {
    if (answer.includes('```') || answer.includes('  ') || /[{};()]/.test(answer)) {
      setIsCode(true);
      if (cardType === 'classic') setCardType('multiple_choice');
    }
  }, [answer]);

  const selectedMode = MODE_OPTIONS.find(m => m.value === cardType)!;

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setIsCode(false);
    questionRef.current?.focus();
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    try {
      await createCard(deckId, question.trim(), answer.trim(), undefined, isCode, cardType);
      setSavedCount(prev => prev + 1);
      onCardAdded();
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="qa-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="qa-panel"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="qa-header">
            <div className="qa-header-left">
              <Zap size={20} className="qa-header-icon" />
              <div>
                <h3 className="qa-title">Quick Add</h3>
                <p className="qa-subtitle">{deckName} · {savedCount} added this session</p>
              </div>
            </div>
            <button className="qa-close" onClick={onClose}><X size={20} /></button>
          </div>

          {/* Mode Selector */}
          <div className="qa-section">
            <label className="qa-label">Study Mode</label>
            <div className="qa-mode-selector">
              <button
                className="qa-mode-btn"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
              >
                <span>{selectedMode.label}</span>
                <ChevronDown size={16} className={showModeDropdown ? 'rotate-180' : ''} />
              </button>
              <AnimatePresence>
                {showModeDropdown && (
                  <motion.div
                    className="qa-mode-dropdown"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    {MODE_OPTIONS.map(mode => (
                      <button
                        key={mode.value}
                        className={`qa-mode-option ${cardType === mode.value ? 'qa-mode-option--active' : ''}`}
                        onClick={() => { setCardType(mode.value); setShowModeDropdown(false); }}
                      >
                        <strong>{mode.label}</strong>
                        <span>{mode.desc}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Question */}
          <div className="qa-section">
            <label className="qa-label">Question</label>
            <textarea
              ref={questionRef}
              className="qa-textarea"
              placeholder="What does the volatile keyword do?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              rows={3}
            />
          </div>

          {/* Answer */}
          <div className="qa-section">
            <label className="qa-label">Answer {isCode && <span className="qa-code-badge">☕ Java detected</span>}</label>
            <textarea
              className={`qa-textarea qa-textarea--answer ${isCode ? 'qa-textarea--code' : ''}`}
              placeholder={isCode
                ? '```java\npublic synchronized void method() { }\n```'
                : 'Ensures visibility of changes to variables across threads...'
              }
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={5}
            />
          </div>

          {/* Code toggle */}
          <label className="qa-code-toggle">
            <input
              type="checkbox"
              checked={isCode}
              onChange={e => setIsCode(e.target.checked)}
            />
            <span>Contains Java code snippet</span>
          </label>

          {/* Actions */}
          <div className="qa-actions">
            <div className="qa-shortcut-hint">
              <kbd>⌘</kbd>+<kbd>↵</kbd> to save & continue
            </div>
            <div className="qa-action-btns">
              <button className="qa-btn-cancel" onClick={onClose}>Done</button>
              <button
                className="qa-btn-save"
                onClick={handleSave}
                disabled={saving || !question.trim() || !answer.trim()}
              >
                {saving ? 'Saving…' : '+ Add Card'}
              </button>
            </div>
          </div>

          {/* Saved indicator */}
          <AnimatePresence>
            {savedCount > 0 && (
              <motion.div
                key={savedCount}
                className="qa-saved-toast"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ✅ Card {savedCount} saved!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickAddPanel;
