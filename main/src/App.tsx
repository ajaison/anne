import { useState } from 'react'
import PasswordGate from './components/PasswordGate'
import Dashboard from './components/Dashboard'
import type { Challenge } from './types'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 1, title: 'Memory Lane', description: 'Recover our first photo together.', isCompleted: false, gameComponent: 'MemoryGame' },
    { id: 2, title: 'Sweet Trivia', description: 'How well do you know us?', isCompleted: false, gameComponent: 'TriviaGame' },
    { id: 3, title: 'Love Map', description: 'Find the hidden location.', isCompleted: false, gameComponent: 'MapGame' },
    { id: 4, title: 'Heart Catcher', description: 'Catch as many hearts as you can!', isCompleted: false, gameComponent: 'CatcherGame' },
  ])

  // Placeholder for selecting a challenge
  const handleSelectChallenge = (id: number) => {
    console.log(`Starting challenge ${id}`);
    // We'll implement the actual game navigation in the next step
    // For now, let's just toggle completion for testing
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, isCompleted: !c.isCompleted } : c));
  }

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />
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
