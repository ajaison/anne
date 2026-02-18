import React, { useState } from 'react';
import triviaBg from '../assets/triviaBackground.jpg';
import aa1 from '../assets/oldItaly.png';
import aa2 from '../assets/aa1.png';
import aa3 from '../assets/aa2.png';
import aa4 from '../assets/aa3.png';

interface TriviaGameProps {
    onComplete: () => void;
    onBack: () => void;
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
}

const QUESTIONS: Question[] = [
    {
        question: "Where did we have our first date?",
        options: ["Paris", "Rome", "Venice", "Florence"],
        correctAnswer: "Paris"
    },
    {
        question: "What is my favorite flower?",
        options: ["Rose", "Lily", "Daisy", "Sun flower"],
        correctAnswer: "Rose"
    },
    {
        question: "In which year did we first meet?",
        options: ["2020", "2021", "2022", "2019"],
        correctAnswer: "2020"
    }
];

const MEMORIES = [
    { image: aa1, caption: "The beginning of our beautiful journey... ❤️" },
    { image: aa2, caption: "Every moment with you is a gift. 🎁" },
    { image: aa3, caption: "Every moment with you is a gift. 🎁" },
    { image: aa4, caption: "Every moment with you is a gift. 🎁" },
    // User can add more images here
];

const TriviaGame: React.FC<TriviaGameProps> = ({ onComplete, onBack }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);

    const handleOptionClick = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);

        if (option === QUESTIONS[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentQuestionIndex + 1 < QUESTIONS.length) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsAnswered(false);
            } else {
                setShowResult(true);
            }
        }, 1500);
    };

    const nextMemory = () => {
        setCurrentMemoryIndex((prev) => (prev + 1) % MEMORIES.length);
    };

    const prevMemory = () => {
        setCurrentMemoryIndex((prev) => (prev - 1 + MEMORIES.length) % MEMORIES.length);
    };

    const scorePercentage = (score / QUESTIONS.length) * 100;
    const isWinner = scorePercentage >= 80;

    if (showResult) {
        return (
            <div className="trivia-container result-view" style={{ backgroundImage: `url(${triviaBg})` }}>
                <div className="parchment-overlay">
                    <h2 className="romantic-title">Our Story</h2>
                    <p className="score-text">You scored {score} out of {QUESTIONS.length}!</p>

                    {isWinner ? (
                        <div className="reward-section">
                            <p className="congrats-text">Bellissima! You know us so well. ❤️</p>
                            <h3 className="gallery-title">A Few Memories...</h3>

                            <div className="memory-carousel">
                                <button className="carousel-arrow prev" onClick={prevMemory}>❮</button>
                                <div className="memory-item">
                                    <div className="memory-card">
                                        <img
                                            src={MEMORIES[currentMemoryIndex].image}
                                            alt={`Memory ${currentMemoryIndex + 1}`}
                                            className="memory-img"
                                        />
                                    </div>
                                    <div className="memory-caption">"{MEMORIES[currentMemoryIndex].caption}"</div>
                                </div>
                                <button className="carousel-arrow next" onClick={nextMemory}>❯</button>
                            </div>

                            <div className="carousel-dots">
                                {MEMORIES.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`dot ${index === currentMemoryIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentMemoryIndex(index)}
                                    ></span>
                                ))}
                            </div>

                            <button className="romantic-btn" onClick={onComplete}>Complete Challenge</button>
                        </div>
                    ) : (
                        <div className="retry-section">
                            <p className="retry-text">Oh no! Almost there, my love. Why not try again?</p>
                            <button className="romantic-btn" onClick={() => {
                                setCurrentQuestionIndex(0);
                                setScore(0);
                                setShowResult(false);
                                setIsAnswered(false);
                            }}>Try Again</button>
                            <button className="back-btn-romantic" onClick={onBack}>Back to Dashboard</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const currentQuestion = QUESTIONS[currentQuestionIndex];

    return (
        <div className="trivia-container" style={{ backgroundImage: `url(${triviaBg})` }}>
            <button className="back-btn-romantic" onClick={onBack}>← Back</button>

            <div className="parchment-overlay">
                <div className="question-counter">Question {currentQuestionIndex + 1} of {QUESTIONS.length}</div>
                <h2 className="trivia-question">{currentQuestion.question}</h2>

                <div className="options-grid">
                    {currentQuestion.options.map((option) => {
                        let statusClass = "";
                        if (isAnswered) {
                            if (option === currentQuestion.correctAnswer) statusClass = "correct";
                            else if (option === selectedOption) statusClass = "incorrect";
                        }

                        return (
                            <button
                                key={option}
                                className={`option-btn ${statusClass} ${selectedOption === option ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option)}
                                disabled={isAnswered}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TriviaGame;
