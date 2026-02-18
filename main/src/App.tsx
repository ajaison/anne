import { useState } from 'react'
import PasswordGate from './components/PasswordGate'
import Dashboard from './components/Dashboard'
import WordleGame from './games/WordleGame'
import TriviaGame from './games/TriviaGame'
import BalloonPopGame from './games/BalloonPopGame'
import CandleGame from './games/CandleGame'
import ConnectionsGame from './games/ConnectionsGame'
import LoveLetterGame from './games/LoveLetterGame'
import type { Challenge } from './types'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 1, title: 'Memory Wordle', description: 'Guess the special 5-letter word.', isCompleted: false, gameComponent: 'WordleGame' },
    { id: 2, title: 'Sweet Trivia', description: 'How well do you know us?', isCompleted: false, gameComponent: 'TriviaGame' },
    { id: 3, title: 'Balloon Pop', description: 'Pop balloons to reveal a message!', isCompleted: false, gameComponent: 'BalloonPopGame' },
    { id: 4, title: 'Make a Wish', description: 'Blow out the candles!', isCompleted: false, gameComponent: 'CandleGame' },
    { id: 5, title: 'Our Connections', description: 'Group words that belong together.', isCompleted: false, gameComponent: 'ConnectionsGame' },
    { id: 6, title: 'My Letter to You', description: 'One final message...', isCompleted: false, gameComponent: 'LoveLetterGame' },
  ])

  const handleSelectChallenge = (id: number) => {
    setActiveChallengeId(id)
  }

  const handleGameComplete = (id: number) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, isCompleted: true } : c))
    setActiveChallengeId(null)
  }

  const renderActiveGame = () => {
    switch (activeChallengeId) {
      case 1:
        return (
          <WordleGame
            onComplete={() => handleGameComplete(1)}
            onBack={() => setActiveChallengeId(null)}
          />
        )
      case 2:
        return (
          <TriviaGame
            onComplete={() => handleGameComplete(2)}
            onBack={() => setActiveChallengeId(null)}
          />
        )
      case 3:
        return (
          <BalloonPopGame
            onComplete={() => handleGameComplete(3)}
            onBack={() => setActiveChallengeId(null)}
          />
        )
      case 4:
        return (
          <CandleGame
            onComplete={() => handleGameComplete(4)}
            onBack={() => setActiveChallengeId(null)}
          />
        )
      case 5:
        return (
          <ConnectionsGame
            onComplete={() => handleGameComplete(5)}
            onBack={() => setActiveChallengeId(null)}
          />
        )
      case 6:
        return (
          <LoveLetterGame
            onComplete={() => handleGameComplete(6)}
            onBack={() => setActiveChallengeId(null)}
          />
        )
      default:
        return null
    }
  }

  const handleCompleteAll = () => {
    setChallenges(prev => prev.map(c => ({ ...c, isCompleted: true })))
  }

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />
      ) : activeChallengeId ? (
        renderActiveGame()
      ) : (
        <Dashboard
          challenges={challenges}
          onSelectChallenge={handleSelectChallenge}
          onCompleteAll={handleCompleteAll}
        />
      )}

      <footer className="footer-section">
        <p className="footer-text">
          by Alan Jaison
        </p>
      </footer>
    </div>
  )
}

export default App
