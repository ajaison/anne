import React, { useState, useEffect, useCallback } from 'react';

interface Balloon {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    speed: number;
    letter?: string;
}

interface BalloonPopGameProps {
    onComplete: () => void;
    onBack: () => void;
}

const GAME_DURATION = 30;
const TARGET_POPS = 20;
const COLORS = ['#ff4d4d', '#ff944d', '#ffd14d', '#4dff88', '#4d94ff', '#b34dff', '#ff4db3'];
const MESSAGE = "HAPPY BIRTHDAY";

const BalloonPopGame: React.FC<BalloonPopGameProps> = ({ onComplete, onBack }) => {
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
    const [unlockedLetters, setUnlockedLetters] = useState<string[]>([]);

    const spawnBalloon = useCallback(() => {
        const id = Math.random();
        const x = Math.random() * 80 + 10; // 10% to 90%
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const size = Math.random() * 40 + 60; // 60px to 100px
        const speed = Math.random() * 2 + 1; // 1 to 3

        // Occasionally attach a letter if we haven't unlocked them all
        let letter;
        if (Math.random() > 0.7 && unlockedLetters.length < MESSAGE.replace(/\s/g, '').length) {
            const messageLetters = MESSAGE.replace(/\s/g, '').split('');
            letter = messageLetters[unlockedLetters.length];
        }

        const newBalloon: Balloon = { id, x, y: 110, color, size, speed, letter };
        setBalloons(prev => [...prev, newBalloon]);
    }, [unlockedLetters]);

    useEffect(() => {
        if (gameState === 'playing') {
            const spawnInterval = setInterval(spawnBalloon, 800);
            const timerInterval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setGameState('ended');
                        clearInterval(timerInterval);
                        clearInterval(spawnInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const moveInterval = setInterval(() => {
                setBalloons(prev => prev
                    .map(b => ({ ...b, y: b.y - b.speed }))
                    .filter(b => b.y > -20)
                );
            }, 30);

            return () => {
                clearInterval(spawnInterval);
                clearInterval(timerInterval);
                clearInterval(moveInterval);
            };
        }
    }, [gameState, spawnBalloon]);

    const popBalloon = (id: number, letter?: string) => {
        setBalloons(prev => prev.filter(b => b.id !== id));
        setScore(prev => prev + 1);
        if (letter) {
            setUnlockedLetters(prev => [...prev, letter]);
        }
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setBalloons([]);
        setUnlockedLetters([]);
    };

    return (
        <div className="balloon-game-container">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <div className="game-header">
                <h2 className="title">Birthday Balloon Pop!</h2>
                <div className="game-stats">
                    <div className="stat">Time: {timeLeft}s</div>
                    <div className="stat">Score: {score}</div>
                </div>
            </div>

            <div className="message-display">
                {MESSAGE.split('').map((char, i) => (
                    <span key={i} className={`letter-slot ${char === ' ' ? 'space' : ''}`}>
                        {char === ' ' ? '' : unlockedLetters[MESSAGE.slice(0, i).replace(/\s/g, '').length] ? char : '?'}
                    </span>
                ))}
            </div>

            <div className="game-area">
                {gameState === 'idle' && (
                    <div className="game-overlay">
                        <p>Pop {TARGET_POPS} balloons to reveal the birthday message!</p>
                        <button className="primary-button" onClick={startGame}>Start Playing!</button>
                    </div>
                )}

                {gameState === 'playing' && balloons.map(b => (
                    <div
                        key={b.id}
                        className="balloon"
                        style={{
                            left: `${b.x}%`,
                            top: `${b.y}%`,
                            backgroundColor: b.color,
                            width: `${b.size}px`,
                            height: `${b.size * 1.2}px`,
                            boxShadow: `inset -10px -10px 20px rgba(0,0,0,0.2), 0 10px 20px ${b.color}44`
                        }}
                        onClick={() => popBalloon(b.id, b.letter)}
                    >
                        {b.letter && <span className="balloon-letter">?</span>}
                        <div className="balloon-string"></div>
                    </div>
                ))}

                {gameState === 'ended' && (
                    <div className="game-overlay">
                        <h3>{score >= TARGET_POPS ? "Fantastic Job!" : "Time's Up!"}</h3>
                        <p>You popped {score} balloons!</p>
                        {score >= TARGET_POPS ? (
                            <button className="primary-button" onClick={onComplete}>Complete Challenge</button>
                        ) : (
                            <button className="primary-button" onClick={startGame}>Try Again</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalloonPopGame;
