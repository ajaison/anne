import React, { useState, useEffect } from 'react';

interface ConnectionsGameProps {
    onComplete: () => void;
    onBack: () => void;
}

type Group = {
    category: string;
    items: string[];
    color: string;
};

const GROUPS: Group[] = [
    { category: "citys we have ben to", items: ["Barcelona", "Manila", "Seol", "Milan"], color: "#f9e79f" }, // Yellow
    { category: "Favorite Flowers", items: ["Parkinson", "Addison", "Hodgkin", "Graves"], color: "#a9dfbf" }, // Green
    { category: "Characters things we have watched", items: ["george", "joy", "jane", "miranda"], color: "#aed6f1" }, // Blue
    { category: "Love in different Languages", items: ["premam", "mahal", "ishq", "ask"], color: "#e6b0aa" } // Purple/Red
];

const ALL_WORDS = GROUPS.flatMap(g => g.items);

const ConnectionsGame: React.FC<ConnectionsGameProps> = ({ onComplete, onBack }) => {
    const [words, setWords] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [foundGroups, setFoundGroups] = useState<Group[]>([]);
    const [mistakes, setMistakes] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Shuffle words on mount
        setWords([...ALL_WORDS].sort(() => Math.random() - 0.5));
    }, []);

    const handleWordClick = (word: string) => {
        if (isGameOver) return;

        if (selectedWords.includes(word)) {
            setSelectedWords(prev => prev.filter(w => w !== word));
        } else {
            if (selectedWords.length < 4) {
                setSelectedWords(prev => [...prev, word]);
            }
        }
    };

    const checkSelection = () => {
        if (selectedWords.length !== 4) return;

        const matchedGroup = GROUPS.find(group =>
            group.items.every(item => selectedWords.includes(item))
        );

        if (matchedGroup) {
            setFoundGroups(prev => [...prev, matchedGroup]);
            setWords(prev => prev.filter(w => !selectedWords.includes(w)));
            setSelectedWords([]);
            setMessage("Correct!");
            setTimeout(() => setMessage(""), 2000);

            if (foundGroups.length + 1 === GROUPS.length) {
                setIsGameOver(true);
            }
        } else {
            setMistakes(prev => prev + 1);
            setMessage("Incorrect, try again.");

            // Check if "One Away"
            const oneAway = GROUPS.some(group => {
                const intersection = group.items.filter(item => selectedWords.includes(item));
                return intersection.length === 3;
            });

            if (oneAway) {
                setMessage("One away!");
            }

            setTimeout(() => {
                setSelectedWords([]);
                setMessage("");
            }, 1500);
        }
    };

    const submitButtonClass = selectedWords.length === 4 ? "connections-submit active" : "connections-submit";

    return (
        <div className="connections-container">
            <button className="back-btn" onClick={onBack}>← Back</button>
            <h2 className="title">Connections</h2>
            <p className="subtitle">Group words that share a common thread.</p>

            <div className="game-board">
                {/* Render Found Groups */}
                {foundGroups.map((group, idx) => (
                    <div key={idx} className="found-group" style={{ backgroundColor: group.color }}>
                        <div className="group-category">{group.category}</div>
                        <div className="group-items">{group.items.join(", ")}</div>
                    </div>
                ))}

                {/* Render Remaining Words Grid */}
                <div className="words-grid">
                    {words.map((word, idx) => (
                        <div
                            key={idx}
                            className={`word-card ${selectedWords.includes(word) ? 'selected' : ''}`}
                            onClick={() => handleWordClick(word)}
                        >
                            {word}
                        </div>
                    ))}
                </div>
            </div>

            <div className="controls">
                <div className="mistakes-counter">
                    Mistakes: {Array(mistakes).fill("❌").join(" ")}
                </div>
                <div className="message-area">{message}</div>
                <button className={submitButtonClass} onClick={checkSelection} disabled={selectedWords.length !== 4}>
                    Submit
                </button>
                {/* Optional: Add shuffle button */}
                <button className="secondary-button" onClick={() => setWords(prev => [...prev].sort(() => Math.random() - 0.5))}>
                    Shuffle
                </button>
            </div>

            {isGameOver && (
                <div className="win-modal">
                    <div className="win-content">
                        <h2>Puzzle Solved!</h2>
                        <p>You found all the connections!</p>
                        <button className="primary-button" onClick={onComplete}>Complete Challenge</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ConnectionsGame;
