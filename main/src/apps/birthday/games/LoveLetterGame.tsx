import React, { useState, useEffect, useRef } from 'react';
import songFile from '../assets/song.mp3';
import a1 from '../assets/b1.png';
import a2 from '../assets/b2.png';
import a3 from '../assets/b3.png';
import a4 from '../assets/b4.png';
import a5 from '../assets/b5.png';
import a7 from '../assets/b7.png';
import a8 from '../assets/b8.png';
import a9 from '../assets/b9.png';
import a10 from '../assets/b10.png';
import a11 from '../assets/b11.png';
import a12 from '../assets/b12.png';

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

const LETTER_MEMORIES = [
    { image: a1, caption: "❤️" },
    { image: a2, caption: "❤️" },
    { image: a3, caption: "🌹" },
    { image: a4, caption: "📸" },
    { image: a5, caption: "💕" },
    { image: a7, caption: "🌍" },
    { image: a8, caption: "🥰" },
    { image: a9, caption: "🙏" },
    { image: a10, caption: " 💖" },
    { image: a11, caption: " 💖" },
    { image: a12, caption: " 💖" },
];

const LoveLetterGame: React.FC<LoveLetterGameProps> = ({ onComplete, onBack }) => {
    const [typedText, setTypedText] = useState("");
    const [showEnvelope, setShowEnvelope] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [letterDone, setLetterDone] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isTyping) {
            if (typedText.length < FINAL_MESSAGE.length) {
                const timeout = setTimeout(() => {
                    setTypedText(FINAL_MESSAGE.slice(0, typedText.length + 1));
                }, 60);
                return () => clearTimeout(timeout);
            } else {
                setTimeout(() => setLetterDone(true), 1000);
            }
        }
    }, [typedText, isTyping]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const openEnvelope = () => {
        setShowEnvelope(false);
        const audio = new Audio(songFile);
        audio.loop = true;
        audio.volume = 0.4;
        audio.play().catch(() => { });
        audioRef.current = audio;
        setTimeout(() => setIsTyping(true), 800);
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    const handleBack = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        onBack();
    };

    const handleComplete = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        onComplete();
    };

    const nextMemory = () => {
        setCurrentMemoryIndex((prev) => (prev + 1) % LETTER_MEMORIES.length);
    };

    const prevMemory = () => {
        setCurrentMemoryIndex((prev) => (prev - 1 + LETTER_MEMORIES.length) % LETTER_MEMORIES.length);
    };

    return (
        <div className="letter-game-container">
            <button className="back-btn" onClick={handleBack}>← Back</button>

            {!showEnvelope && (
                <button className="mute-btn" onClick={toggleMute}>
                    {isMuted ? '🔇' : '🔊'}
                </button>
            )}

            {showEnvelope ? (
                <div className="envelope-container" onClick={openEnvelope}>
                    <div className="envelope">
                        <div className="envelope-flap"></div>
                        <div className="envelope-front"></div>
                        <div className="heart-seal">❤️</div>
                        <div className="tap-hint">Tap to Open</div>
                    </div>
                </div>
            ) : showGallery ? (
                /* Full-screen Gallery View */
                <div className="gallery-view" style={{ animation: 'fadeIn 0.8s ease-out' }}>
                    <h2 className="title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>A Few Memories... 📸</h2>

                    <div className="memory-carousel">
                        <button className="carousel-arrow prev" onClick={prevMemory}>❮</button>
                        <div className="memory-item">
                            <div className="memory-card">
                                <img
                                    src={LETTER_MEMORIES[currentMemoryIndex].image}
                                    alt={`Memory ${currentMemoryIndex + 1}`}
                                    className="memory-img"
                                />
                            </div>
                            <div className="memory-caption">{LETTER_MEMORIES[currentMemoryIndex].caption}</div>
                        </div>
                        <button className="carousel-arrow next" onClick={nextMemory}>❯</button>
                    </div>

                    <div className="carousel-dots">
                        {LETTER_MEMORIES.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentMemoryIndex ? 'active' : ''}`}
                                onClick={() => setCurrentMemoryIndex(index)}
                            ></span>
                        ))}
                    </div>

                    <div className="letter-footer">
                        <button className="primary-button" onClick={handleComplete}>Finish Quest ❤️</button>
                    </div>
                </div>
            ) : (
                /* Letter View */
                <div className="letter-paper">
                    <div className="letter-content">
                        {typedText}
                        {!letterDone && <span className="cursor">|</span>}
                    </div>
                    {letterDone && (
                        <div className="letter-footer" style={{ animation: 'fadeIn 1s' }}>
                            <button className="primary-button" onClick={() => setShowGallery(true)}>
                                View Memories 📸
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoveLetterGame;
