import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './KnowledgeApp.css';

const KnowledgeApp = () => {
    const navigate = useNavigate();

    return (
        <div className="knowledge-container">
            <header className="knowledge-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} /> Back to Hub
                </button>
                <h1>Knowledge Hub & 2nd Brain</h1>
            </header>
            
            <main className="knowledge-content">
                <div className="placeholder-card">
                    <span className="status-tag">Coming Soon</span>
                    <h2>The 2nd Brain is currently under construction.</h2>
                    <p>Planned features:</p>
                    <ul>
                        <li>✨ Supabase-powered Note Taker</li>
                        <li>🗂️ Anki-style Flashcards</li>
                        <li>📚 Coding Practice Dashboard</li>
                        <li>🔄 Notion Page Synchronization</li>
                    </ul>
                    <img 
                        src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop" 
                        alt="Brainstorming" 
                        className="placeholder-img"
                    />
                </div>
            </main>
        </div>
    );
};

export default KnowledgeApp;
