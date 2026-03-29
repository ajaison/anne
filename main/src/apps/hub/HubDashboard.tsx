import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cake, Brain, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import './HubDashboard.css';

interface AppProject {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  isLegacy?: boolean;
}

const APPS: AppProject[] = [
  {
    id: 'birthday',
    title: 'Birthday Adventure',
    description: 'A collection of mini-games and a heartfelt letter. Challenges include Wordle, Trivia, and more.',
    icon: <Cake className="app-icon" />,
    route: '/birthday',
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    isLegacy: true,
  },
  {
    id: 'knowledge',
    title: '2nd Brain (Knowledge)',
    description: 'Your long-term knowledge hub. Note-taking, flashcards (Anki-style), and Notion synchronization.',
    icon: <Brain className="app-icon" />,
    route: '/knowledge',
    color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
];

const HubDashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % APPS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + APPS.length) % APPS.length);
  };

  const activeApp = APPS[currentIndex];

  return (
    <div className="hub-container">
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="hub-header"
      >
        <h1 className="hub-title">Alan's Applications</h1>
        <p className="hub-subtitle">Personal collection of tools and mini-apps</p>
      </motion.header>

      <main className="hub-main">
        <div className="carousel-wrapper">
          <button className="nav-button prev" onClick={handlePrev}>
            <ArrowLeft size={32} />
          </button>

          <div className="card-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeApp.id}
                initial={{ x: 100, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -100, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="app-card"
                style={{ background: activeApp.color }}
                onClick={() => navigate(activeApp.route)}
              >
                <div className="app-content">
                  <div className="icon-wrapper">
                    {activeApp.icon}
                  </div>
                  <h2 className="app-title">{activeApp.title}</h2>
                  {activeApp.isLegacy && <span className="legacy-badge">Legacy</span>}
                  <p className="app-description">{activeApp.description}</p>
                  
                  <motion.div 
                    className="launch-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Open Application <ExternalLink size={18} />
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="nav-button next" onClick={handleNext}>
            <ArrowRight size={32} />
          </button>
        </div>

        <div className="pagination">
          {APPS.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </main>

      <footer className="hub-footer">
        <p>© 2026 Alan Jaison Hub</p>
      </footer>

      {/* Decorative background elements */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
    </div>
  );
};

export default HubDashboard;
