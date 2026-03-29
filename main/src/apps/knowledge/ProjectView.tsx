import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Book, Loader } from 'lucide-react';
import { fetchDecksByProject, createDeck, supabase } from './services/supabase';
import type { Deck, Project } from './types';
import './KnowledgeApp.css';

const ProjectView = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    
    const [project, setProject] = useState<Project | null>(null);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    const [deckName, setDeckName] = useState('');
    const [deckDesc, setDeckDesc] = useState('');

    useEffect(() => {
        if (projectId) {
            loadProjectDetails();
            loadDecks();
        }
    }, [projectId]);

    const loadProjectDetails = async () => {
        const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
        if (!error) setProject(data);
    };

    const loadDecks = async () => {
        if (!projectId) return;
        setLoading(true);
        const { data, error } = await fetchDecksByProject(projectId);
        if (!error) setDecks(data || []);
        setLoading(false);
    };

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deckName.trim() || !projectId) return;

        const { error } = await createDeck(deckName, deckDesc, projectId);
        if (!error) {
            setDeckName('');
            setDeckDesc('');
            setIsCreating(false);
            loadDecks();
        }
    };

    return (
        <div className="knowledge-container">
            <header className="knowledge-header">
                <button className="back-button" onClick={() => navigate('/knowledge')}>
                    <ArrowLeft size={20} /> All Projects
                </button>
                <div className="header-bottom">
                    <h1>{project?.name || 'Loading Project...'}</h1>
                    <button className="add-project-btn" onClick={() => setIsCreating(true)}>
                        <Plus size={20} /> New Deck
                    </button>
                </div>
                <p className="project-subtitle">{project?.description}</p>
            </header>

            <main className="knowledge-content">
                {isCreating && (
                    <div className="project-form-card">
                        <h2>Create New Deck</h2>
                        <form onSubmit={handleCreateDeck}>
                            <input 
                                type="text" 
                                placeholder="Deck Name (e.g., Java, React)" 
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                autoFocus
                            />
                            <textarea 
                                placeholder="What is this deck about?"
                                value={deckDesc}
                                onChange={(e) => setDeckDesc(e.target.value)}
                            />
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={!deckName.trim()}>Create Deck</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <Loader size={40} className="animate-spin" />
                        <p>Opening project...</p>
                    </div>
                ) : decks.length > 0 ? (
                    <div className="project-grid">
                        {decks.map(deck => (
                            <div 
                                key={deck.id} 
                                className="project-card deck-card"
                                onClick={() => navigate(`/knowledge/deck/${deck.id}`)}
                            >
                                <Book className="project-icon" size={24} />
                                <div className="project-info">
                                    <h3>{deck.name}</h3>
                                    <p>{deck.description || "Learn this topic."}</p>
                                </div>
                                <div className="card-footer">
                                    <span className="deck-tag">Deck</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Book size={60} className="empty-icon" />
                        <h2>No decks here yet.</h2>
                        <p>Decks are where you store your flashcards. Create one to get started!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProjectView;
