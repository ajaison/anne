import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Trophy, Flame, Zap, Target, RotateCcw, Home } from 'lucide-react';
import type { SessionResult } from '../types';

interface SessionSummaryProps {
  result: SessionResult;
  deckName: string;
  onStudyAgain: () => void;
  onBackToDeck: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ result, deckName, onStudyAgain, onBackToDeck }) => {
  const accuracy = result.totalCards > 0
    ? Math.round((result.correctFirst / result.totalCards) * 100)
    : 0;

  const getMoodEmoji = () => {
    if (accuracy >= 90) return '🚀';
    if (accuracy >= 70) return '🎯';
    if (accuracy >= 50) return '💪';
    return '📚';
  };

  const getMoodMessage = () => {
    if (accuracy >= 90) return 'Outstanding session!';
    if (accuracy >= 70) return 'Great work!';
    if (accuracy >= 50) return 'Keep it up!';
    return 'Practice makes perfect!';
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="summary-container">
      <motion.div
        className="summary-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero */}
        <motion.div className="summary-hero" variants={itemVariants}>
          <div className="summary-emoji">{getMoodEmoji()}</div>
          <h2 className="summary-title">{getMoodMessage()}</h2>
          <p className="summary-subtitle">You completed <strong>{deckName}</strong></p>
        </motion.div>

        {/* Stats grid */}
        <motion.div className="summary-stats" variants={itemVariants}>
          <div className="summary-stat">
            <div className="summary-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
              <Target size={22} />
            </div>
            <div className="summary-stat-value">{accuracy}%</div>
            <div className="summary-stat-label">Accuracy</div>
          </div>

          <div className="summary-stat">
            <div className="summary-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              <Zap size={22} />
            </div>
            <div className="summary-stat-value">+{result.xpEarned}</div>
            <div className="summary-stat-label">XP Earned</div>
          </div>

          <div className="summary-stat">
            <div className="summary-stat-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
              <Flame size={22} />
            </div>
            <div className="summary-stat-value">{result.bestStreak}</div>
            <div className="summary-stat-label">Best Streak</div>
          </div>

          <div className="summary-stat">
            <div className="summary-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              <Trophy size={22} />
            </div>
            <div className="summary-stat-value">{result.correctFirst}/{result.totalCards}</div>
            <div className="summary-stat-label">First Try</div>
          </div>
        </motion.div>

        {/* Accuracy bar */}
        <motion.div className="summary-accuracy-bar-wrapper" variants={itemVariants}>
          <div className="summary-accuracy-bar-bg">
            <motion.div
              className="summary-accuracy-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              style={{
                background: accuracy >= 70
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : accuracy >= 50
                    ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)'
              }}
            />
          </div>
          <span className="summary-accuracy-label">{accuracy}% accuracy</span>
        </motion.div>

        {/* Per-card breakdown */}
        {result.cardResults.length > 0 && (
          <motion.div className="summary-breakdown" variants={itemVariants}>
            <h3 className="summary-breakdown-title">Card Breakdown</h3>
            <div className="summary-breakdown-list">
              {result.cardResults.map((r, i) => (
                <div key={i} className={`summary-breakdown-item ${r.correct ? 'breakdown-correct' : 'breakdown-wrong'}`}>
                  <span className="breakdown-dot">{r.correct ? '✅' : '❌'}</span>
                  <span className="breakdown-q">{r.card.question.replace(/```[\w]*\n?/g, '').replace(/`/g, '').trim().slice(0, 60)}{r.card.question.length > 60 ? '…' : ''}</span>
                  <span className="breakdown-mode">{r.mode.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div className="summary-actions" variants={itemVariants}>
          <button className="summary-btn summary-btn--secondary" onClick={onBackToDeck}>
            <Home size={18} /> Back to Deck
          </button>
          <button className="summary-btn summary-btn--primary" onClick={onStudyAgain}>
            <RotateCcw size={18} /> Study Again
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SessionSummary;
