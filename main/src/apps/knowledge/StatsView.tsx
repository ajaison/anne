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
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setDbError(null);
        const { data: cardData } = await supabase.from('cards').select('*');
        const { data: historyData, error: historyError } = await fetchReviewHistory();
        
        if (historyError) {
            console.error("Supabase Error fetching history:", historyError);
            setDbError(historyError.message);
        }

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

    // 4. GitHub Style Activity Calendar (Last 84 days - 12 weeks)
    const daysToShow = 84;
    const calendarDays = Array.from({ length: daysToShow }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (daysToShow - 1 - i));
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const activityDataMap = new Map<string, number>();
    history.forEach(h => {
        if (!h.created_at) return;
        const hDate = new Date(h.created_at);
        const localHDate = `${hDate.getFullYear()}-${String(hDate.getMonth() + 1).padStart(2, '0')}-${String(hDate.getDate()).padStart(2, '0')}`;
        activityDataMap.set(localHDate, (activityDataMap.get(localHDate) || 0) + 1);
    });

    console.log("StatsView Debug: Total History Items =", history.length);
    console.log("StatsView Debug: Activity Map Size =", activityDataMap.size);

    // Dynamically find the "highest intensity" day to set a relative scale
    const maxActivity = Math.max(...Array.from(activityDataMap.values() as Iterable<number>), 1) as number;

    const getIntensityClass = (count: number) => {
        if (count === 0) return 'level-0';
        
        // Relative scaling based on user's personal max performance
        if (count >= Math.max(maxActivity * 0.8, 4)) return 'level-4';
        if (count >= Math.max(maxActivity * 0.5, 3)) return 'level-3';
        if (count >= Math.max(maxActivity * 0.25, 2)) return 'level-2';
        return 'level-1';
    };

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
                            <div className="pb-segment mature" style={{ width: `${(matureCards/cards.length)*100 || 0}%` }}></div>
                            <div className="pb-segment young" style={{ width: `${(youngCards/cards.length)*100 || 0}%` }}></div>
                            <div className="pb-segment new" style={{ width: `${(newCards/cards.length)*100 || 0}%` }}></div>
                        </div>
                        <div className="profile-legend">
                            <div className="legend-item"><span className="dot mature"></span> Mature ({((matureCards/cards.length)*100 || 0).toFixed(0)}%)</div>
                            <div className="legend-item"><span className="dot young"></span> Young ({((youngCards/cards.length)*100 || 0).toFixed(0)}%)</div>
                            <div className="legend-item"><span className="dot new"></span> New ({((newCards/cards.length)*100 || 0).toFixed(0)}%)</div>
                        </div>
                    </div>

                    <div className="stats-card-main activity-card-container">
                        <h3><Calendar size={20} /> Review Activity</h3>
                        {dbError && (
                            <div style={{ padding: '10px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '10px' }}>
                                <strong>Database Error:</strong> {dbError} <br/>
                                (Did you create the "review_history" table in Supabase?)
                            </div>
                        )}
                        <div className="github-calendar">
                            {calendarDays.map((date, i) => {
                                const count = activityDataMap.get(date) || 0;
                                return (
                                    <div 
                                        key={i} 
                                        className={`calendar-cell ${getIntensityClass(count)}`}
                                        title={`${count} reviews on ${date}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="calendar-legend">
                            <span>Less</span>
                            <div className="calendar-cell level-0"></div>
                            <div className="calendar-cell level-1"></div>
                            <div className="calendar-cell level-2"></div>
                            <div className="calendar-cell level-3"></div>
                            <div className="calendar-cell level-4"></div>
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StatsView;
