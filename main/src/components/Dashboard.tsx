import React from 'react';
import type { Challenge } from '../types';

interface DashboardProps {
    challenges: Challenge[];
    onSelectChallenge: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ challenges, onSelectChallenge }) => {
    const allCompleted = challenges.every(c => c.isCompleted);

    return (
        <div className="dashboard-container" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <header className="hero-section" style={{ marginBottom: '3rem' }}>
                <h1 className="title" style={{ fontSize: '3rem' }}>Valentine's Quest</h1>
                <p className="subtitle">Complete all 4 challenges to unlock your final surprise!</p>
            </header>

            <div className="challenges-grid">
                {challenges.map((challenge) => (
                    <div
                        key={challenge.id}
                        className={`challenge-card ${challenge.isCompleted ? 'completed' : ''}`}
                        onClick={() => onSelectChallenge(challenge.id)}
                    >
                        <div className="challenge-status">
                            {challenge.isCompleted ? '✅' : '🔒'}
                        </div>
                        <h3>{challenge.title}</h3>
                        <p>{challenge.description}</p>
                        {!challenge.isCompleted && <button className="start-btn">Start Challenge</button>}
                    </div>
                ))}
            </div>

            {allCompleted && (
                <div className="final-reveal" style={{ marginTop: '4rem', animation: 'bounceIn 1s' }}>
                    <button className="primary-button final-button">
                        Reveal Final Surprise ❤️
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
