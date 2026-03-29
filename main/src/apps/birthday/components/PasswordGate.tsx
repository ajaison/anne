import React, { useState } from 'react';
import heroImage from '../assets/ivy.png';

interface PasswordGateProps {
    onAuthenticated: () => void;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Hardcoded password - User can change this later
    const HARDCODED_PASSWORD = 'love';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.toLowerCase() === HARDCODED_PASSWORD) {
            onAuthenticated();
        } else {
            setError('Incorrect password, my love. Try again? ❤️');
            setPassword('');
        }
    };

    return (
        <div className="hero-section">
            <img src={heroImage} className="hero-image" alt="Valentine Robot" />
            <h1 className="title">Hello!</h1>
            <p className="subtitle">Welcome to Alan's website. Please enter the secret word to enter.</p>

            <form onSubmit={handleSubmit} className="password-form" style={{ marginTop: '2rem' }}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password..."
                    className="password-input"
                    autoFocus
                />
                <button type="submit" className="primary-button" style={{ marginTop: '1rem', width: '100%' }}>
                    Enter Site
                </button>
                {error && <p className="error-message" style={{ color: '#ff4d4d', marginTop: '1rem' }}>{error}</p>}
            </form>
        </div>
    );
};

export default PasswordGate;
