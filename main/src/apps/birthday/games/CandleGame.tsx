import React, { useState, useEffect } from 'react';

interface CandleGameProps {
    onComplete: () => void;
    onBack: () => void;
}

const TOTAL_CANDLES = 5;

// Reward Data
const COUPONS = [
    { title: "Dinner Date", emoji: "🍝", desc: "Good for one homemade dinner of your choice." },
    { title: "Massage", emoji: "💆‍♀️", desc: "Redeemable for a 30-minute massage." },
    { title: "Movie Night", emoji: "🎬", desc: "You pick the movie, I get the snacks." },
    { title: "Yes Day", emoji: "✨", desc: "I have to say YES to everything for 24hrs." }
];

const CandleGame: React.FC<CandleGameProps> = ({ onComplete, onBack }) => {
    const [candles, setCandles] = useState<boolean[]>(Array(TOTAL_CANDLES).fill(true)); // true = lit
    const [showReward, setShowReward] = useState(false);

    useEffect(() => {
        // Check if all candles are out
        if (candles.every(lit => !lit)) {
            const timer = setTimeout(() => setShowReward(true), 1500);
            return () => clearTimeout(timer);
        }

        // Randomly relight a candle
        const relightInterval = setInterval(() => {
            setCandles(prev => {
                // Determine if we should relight (85% chance)
                if (Math.random() > 0.19) {
                    const outIndices = prev.map((lit, i) => !lit ? i : -1).filter(i => i !== -1);
                    if (outIndices.length > 0) {
                        const randomIndex = outIndices[Math.floor(Math.random() * outIndices.length)];
                        const newCandles = [...prev];
                        newCandles[randomIndex] = true;
                        return newCandles;
                    }
                }
                return prev;
            });
        }, 500); // Check every 0.5s

        return () => clearInterval(relightInterval);
    }, [candles]);

    const blowCandle = (index: number) => {
        if (!candles[index]) return;
        const newCandles = [...candles];
        newCandles[index] = false;
        setCandles(newCandles);
    };

    if (showReward) {
        return (
            <div className="candle-game-container reward-view">
                <div className="reward-content">
                    <h2 className="reward-title">Happy Birthday! 🎂</h2>
                    <p className="reward-subtitle">Your wish has been granted! Here are your gifts:</p>

                    <div className="coupons-grid">
                        {COUPONS.map((coupon, idx) => (
                            <div key={idx} className="coupon-card">
                                <div className="coupon-emoji">{coupon.emoji}</div>
                                <div className="coupon-title">{coupon.title}</div>
                                <div className="coupon-desc">{coupon.desc}</div>
                            </div>
                        ))}
                    </div>

                    <button className="primary-button" onClick={onComplete}>Complete Challenge</button>
                </div>
            </div>
        );
    }

    return (
        <div className="candle-game-container">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <h2 className="game-title">Make a Wish!</h2>
            <p className="game-instruction">Blow out all the candles to make your wish come true.</p>

            <div className="cake-container">
                <div className="cake">
                    <div className="icing">
                        <div className="drip"></div>
                        <div className="drip"></div>
                        <div className="drip"></div>
                    </div>
                    {candles.map((isLit, i) => (
                        <div
                            key={i}
                            className={`candle ${isLit ? 'lit' : 'out'}`}
                            style={{ left: `${20 + i * 15}%` }}
                            onClick={() => blowCandle(i)}
                        >
                            <div className="flame"></div>
                        </div>
                    ))}
                </div>
                <div className="plate"></div>
            </div>
        </div>
    );
};

export default CandleGame;
