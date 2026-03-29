import React, { useState, useEffect } from 'react';

interface WordleGameProps {
    onComplete: () => void;
    onBack: () => void;
}

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
// You can change this word to anything 5 letters long!
const SOLUTION = "BIRTH";

const WordleGame: React.FC<WordleGameProps> = ({ onComplete, onBack }) => {
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
    const [message, setMessage] = useState("");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;

            if (e.key === 'Enter') {
                submitGuess();
            } else if (e.key === 'Backspace') {
                setCurrentGuess(prev => prev.slice(0, -1));
            } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
                if (currentGuess.length < WORD_LENGTH) {
                    setCurrentGuess(prev => (prev + e.key).toUpperCase());
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, gameState, guesses]);

    const submitGuess = () => {
        if (currentGuess.length !== WORD_LENGTH) {
            setMessage("Word must be 5 letters!");
            setTimeout(() => setMessage(""), 2000);
            return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess("");

        if (currentGuess === SOLUTION) {
            setGameState('won');
            setMessage("Correct! Happy Birthday! 🎉");
            setTimeout(() => onComplete(), 3000);
        } else if (newGuesses.length === MAX_ATTEMPTS) {
            setGameState('lost');
            setMessage(`Game Over! The word was ${SOLUTION}`);
        }
    };

    const getLetterClass = (letter: string, index: number) => {
        if (SOLUTION[index] === letter) return 'correct';
        if (SOLUTION.includes(letter)) return 'present';
        return 'absent';
    };

    const renderGrid = () => {
        const rows = [];
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const guess = guesses[i];
            const isCurrentRow = i === guesses.length;
            const rowContent = [];

            for (let j = 0; j < WORD_LENGTH; j++) {
                let letter = "";
                let statusClass = "";

                if (guess) {
                    letter = guess[j];
                    statusClass = getLetterClass(letter, j);
                } else if (isCurrentRow) {
                    letter = currentGuess[j] || "";
                }

                rowContent.push(
                    <div key={j} className={`wordle-cell ${statusClass} ${letter ? 'filled' : ''}`}>
                        {letter}
                    </div>
                );
            }
            rows.push(<div key={i} className="wordle-row">{rowContent}</div>);
        }
        return rows;
    };

    return (
        <div className="wordle-container">
            <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
            <h2 className="game-title">Challenge 1: Word Guess</h2>
            <p className="game-instruction">Guess the secret 5-letter word!</p>

            <div className="wordle-grid">
                {renderGrid()}
            </div>

            {message && <div className="game-message">{message}</div>}

            <div className="virtual-keyboard">
                {/* Simplified keyboard for mobile users */}
                <div className="keyboard-row">
                    {['ENTER', 'BACK'].map(key => (
                        <button
                            key={key}
                            className="key-btn special"
                            onClick={() => {
                                if (key === 'ENTER') submitGuess();
                                else setCurrentGuess(prev => prev.slice(0, -1));
                            }}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WordleGame;
