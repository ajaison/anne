import React, { useState } from 'react';
import triviaBg from '../assets/triviaBackground.jpg';
import memoryPlaceholder from '../assets/hero.png';

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
        correctAnswer: "Venice"
    },
    {
        question: "What is my favorite flower?",
        options: ["Rose", "Lily", "Daisy", "Sun flower"],
        correctAnswer: "Rose"
    },
    {
        question: "In which year did we first meet?",
        options: ["2020", "2021", "2022", "2019"],
        correctAnswer: "2021"
    },
    {
        question: "What was the first movie we watched together?",
        options: ["The Notebook", "About Time", "La La Land", "Interstellar"],
        correctAnswer: "About Time"
    },
    {
        question: "Who said 'I love you' first?",
        options: ["Me", "You", "Both at once", "It's a secret"],
        correctAnswer: "You"
    },
    {
        question: "What is our dream travel destination?",
        options: ["Maldives", "Amalfi Coast", "Kyoto", "Santorini"],
        correctAnswer: "Amalfi Coast"
    },
    {
        question: "What is my favorite Italian dish?",
        options: ["Pizza", "Pasta Carbonara", "Risotto", "Lasagna"],
        correctAnswer: "Pasta Carbonara"
    },
    {
        question: "What was our first holiday together?",
        options: ["Spain", "Italy", "Greece", "France"],
        correctAnswer: "Italy"
    },
    {
        question: "What color are my eyes?",
        options: ["Blue", "Brown", "Green", "Hazel"],
        correctAnswer: "Brown"
    },
    {
        question: "What is our song?",
        options: ["Perfect", "Lover", "All of Me", "Thinking Out Loud"],
        correctAnswer: "Perfect"
    }
];

const TriviaGame: React.FC<TriviaGameProps> = ({ onComplete, onBack }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

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
                            <div className="memory-gallery">
                                {/* User can add more images here later */}
                                <img src={memoryPlaceholder} alt="Memory 1" className="memory-img" />
                                <div className="memory-caption">"The beginning of forever..."</div>
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
