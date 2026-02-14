import { useState } from 'react'
import PasswordGate from './components/PasswordGate'
import Dashboard from './components/Dashboard'
import WordleGame from './games/WordleGame'
import TriviaGame from './games/TriviaGame'
import BalloonPopGame from './games/BalloonPopGame'
import type { Challenge } from './types'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 1, title: 'Memory Wordle', description: 'Guess the special 5-letter word.', isCompleted: false, gameComponent: 'WordleGame' },
    { id: 2, title: 'Sweet Trivia', description: 'How well do you know us?', isCompleted: false, gameComponent: 'TriviaGame' },
    { id: 3, title: 'Balloon Pop', description: 'Pop balloons to reveal a message!', isCompleted: false, gameComponent: 'BalloonPopGame' },
    { id: 4, title: 'Heart Catcher', description: 'Catch as many hearts as you can!', isCompleted: false, gameComponent: 'CatcherGame' },
    { id: 5, title: 'Secret Puzzle', description: 'Solve the pieces of us.', isCompleted: false, gameComponent: 'PuzzleGame' },
    { id: 6, title: 'Final Code', description: 'The last key to your gift.', isCompleted: false, gameComponent: 'CodeGame' },
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
      default:
        return null
    }
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
