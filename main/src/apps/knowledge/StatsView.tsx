import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Zap, Award, Loader, BarChart3, Clock } from 'lucide-react';
import { supabase, fetchReviewHistory } from './services/supabase';
import type { Card } from './types';
import './KnowledgeApp.css';

interface ReviewLog {
    id: string;
    rating: string;
    created_at: string;
}

const StatsView = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Card[]>([]);
    const [history, setHistory] = useState<ReviewLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { data: cardData } = await supabase.from('cards').select('*');
        const { data: historyData } = await fetchReviewHistory();
        
        setCards(cardData || []);
        setHistory(historyData || []);
        setLoading(false);
    };

    // --- Stats Calculations ---
    
    // 1. Mature vs Young vs New
    const newCards = cards.filter(c => c.repetitions === 0).length;
    const youngCards = cards.filter(c => c.repetitions > 0 && c.interval <= 21).length;
    const matureCards = cards.filter(c => c.interval > 21).length;

    // 2. Retention Rate
    const successfulReviews = history.filter(h => h.rating !== 'again').length;
    const retentionRate = history.length > 0 ? Math.round((successfulReviews / history.length) * 100) : 0;

    // 3. Due Today
    const now = new Date();
    const dueCards = cards.filter(c => c.next_review && new Date(c.next_review) <= now).length;

    // 4. Activity Streak (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const activityData = last7Days.map(date => {
        const count = history.filter(h => h.created_at.startsWith(date)).length;
        return { date, count };
    });

    const maxActivity = Math.max(...activityData.map(d => d.count), 1);

    if (loading) return (
        <div className="knowledge-container loading-full">
            <Loader size={60} className="animate-spin" />
            <p>Analyzing your brain...</p>
        </div>
    );

    return (
        <div className="knowledge-container">
            <header className="knowledge-header">
                <button className="back-button" onClick={() => navigate('/knowledge')}>
                    <ArrowLeft size={20} /> Back to Hub
                </button>
                <div className="header-bottom">
                    <h1>Brain Analytics</h1>
                </div>
            </header>

            <main className="knowledge-content">
                <div className="stats-hero-grid">
                    <div className="stat-hero-card">
                        <TrendingUp className="stat-icon" size={32} color="#6366f1" />
                        <div className="stat-val">{retentionRate}%</div>
                        <div className="stat-label">Retention Rate</div>
                    </div>
                    <div className="stat-hero-card">
                        <Zap className="stat-icon" size={32} color="#f59e0b" />
                        <div className="stat-val">{dueCards}</div>
                        <div className="stat-label">Cards Due Now</div>
                    </div>
                    <div className="stat-hero-card">
                        <Award className="stat-icon" size={32} color="#10b981" />
                        <div className="stat-val">{matureCards}</div>
                        <div className="stat-label">Mature Cards</div>
                    </div>
                    <div className="stat-hero-card">
                        <Clock className="stat-icon" size={32} color="#ec4899" />
                        <div className="stat-val">{history.length}</div>
                        <div className="stat-label">Total Reviews</div>
                    </div>
                </div>

                <div className="stats-detail-section">
                    <div className="stats-card-main">
                        <h3><BarChart3 size={20} /> Knowledge Profile</h3>
                        <div className="profile-bar">
                            <div className="pb-segment mature" style={{ width: `${(matureCards/cards.length)*100}%` }}></div>
                            <div className="pb-segment young" style={{ width: `${(youngCards/cards.length)*100}%` }}></div>
                            <div className="pb-segment new" style={{ width: `${(newCards/cards.length)*100}%` }}></div>
                        </div>
                        <div className="profile-legend">
                            <div className="legend-item"><span className="dot mature"></span> Mature ({(matureCards/cards.length*100).toFixed(0)}%)</div>
                            <div className="legend-item"><span className="dot young"></span> Young ({(youngCards/cards.length*100).toFixed(0)}%)</div>
                            <div className="legend-item"><span className="dot new"></span> New ({(newCards/cards.length*100).toFixed(0)}%)</div>
                        </div>
                    </div>

                    <div className="stats-card-main">
                        <h3><Calendar size={20} /> Recent Activity</h3>
                        <div className="activity-chart">
                            {activityData.map((d, i) => (
                                <div key={i} className="activity-col">
                                    <div className="activity-bar" style={{ height: `${(d.count / maxActivity) * 100}%` }}>
                                        {d.count > 0 && <span className="bar-val">{d.count}</span>}
                                    </div>
                                    <span className="activity-label">{d.date.split('-')[2]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StatsView;
