import React, { useState, useEffect } from 'react';

interface LoveLetterGameProps {
    onComplete: () => void;
    onBack: () => void;
}

const FINAL_MESSAGE = `My Anne,

I love you so much, my wold is so much brighter with you in it,
you are funny, kind and work so hard for those around you. 
I cant believe how lucky I am to have you in my life and to be with 
on another birthday seeing how you have grown and become more confident
as a person.

You are the reason for my happiest days and my comfort in all others. 
Today, I celebrate you—not just for your birthday, but for the 
incredible person you have become.

Happy Birthday, my love. ❤️`;

const LoveLetterGame: React.FC<LoveLetterGameProps> = ({ onComplete, onBack }) => {
    const [typedText, setTypedText] = useState("");
    const [showEnvelope, setShowEnvelope] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (isTyping) {
            if (typedText.length < FINAL_MESSAGE.length) {
                const timeout = setTimeout(() => {
                    setTypedText(FINAL_MESSAGE.slice(0, typedText.length + 1));
                }, 50); // Typing speed
                return () => clearTimeout(timeout);
            } else {
                setTimeout(() => setShowButton(true), 1000);
            }
        }
    }, [typedText, isTyping]);

    const openEnvelope = () => {
        setShowEnvelope(false);
        setTimeout(() => setIsTyping(true), 800);
    };

    return (
        <div className="letter-game-container">
            <button className="back-btn" onClick={onBack}>← Back</button>

            {showEnvelope ? (
                <div className="envelope-container" onClick={openEnvelope}>
                    <div className="envelope">
                        <div className="envelope-flap"></div>
                        <div className="envelope-front"></div>
                        <div className="heart-seal">❤️</div>
                        <div className="tap-hint">Tap to Open</div>
                    </div>
                </div>
            ) : (
                <div className="letter-paper">
                    <div className="letter-content">
                        {typedText}
                        <span className="cursor">|</span>
                    </div>
                    {showButton && (
                        <div className="letter-footer">
                            <button className="primary-button" onClick={onComplete}>Finish Quest ❤️</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoveLetterGame;
