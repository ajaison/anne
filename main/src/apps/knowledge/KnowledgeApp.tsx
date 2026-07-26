import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Folder, Search, Loader, Trash2 } from 'lucide-react';
import { fetchProjects, createProject, deleteProject } from './services/supabase';
import type { Project } from './types';
import './KnowledgeApp.css';

const KnowledgeApp = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await fetchProjects();
            if (error) {
                console.error('Supabase Error:', error);
                // We'll still keep going so the screen doesn't crash
            } else {
                setProjects(data || []);
            }
        } catch (err) {
            console.error('Fatal Connection Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        const { error } = await createProject(newProjectName, newProjectDesc);
        if (error) {
            alert('Failed to create project: ' + error.message);
        } else {
            setNewProjectName('');
            setNewProjectDesc('');
            setIsCreating(false);
            loadProjects();
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this project and all its decks?')) return;
        
        const { error } = await deleteProject(id);
        if (error) {
            alert('Failed to delete project: ' + error.message);
        } else {
            loadProjects();
        }
    };

    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="knowledge-container">
            <header className="knowledge-header">
                <div className="header-top">
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="back-button" onClick={() => navigate('/')}>
                            <ArrowLeft size={20} /> Back to Hub
                        </button>
                        <button className="back-button" onClick={() => navigate('/knowledge/stats')}>
                            Stats Hub
                        </button>
                    </div>
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search projects..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="header-bottom">
                    <h1>Your Knowledge Hub</h1>
                    <button className="add-project-btn" onClick={() => setIsCreating(true)}>
                        <Plus size={20} /> New Project
                    </button>
                </div>
            </header>
            
            <main className="knowledge-content">
                {isCreating && (
                    <div className="project-form-card">
                        <h2>Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <input 
                                type="text" 
                                placeholder="Project Name (e.g., Technology)" 
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                autoFocus
                            />
                            <textarea 
                                placeholder="Description (Optional)"
                                value={newProjectDesc}
                                onChange={(e) => setNewProjectDesc(e.target.value)}
                            />
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={!newProjectName.trim()}>Create Project</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <Loader size={40} className="animate-spin" />
                        <p>Loading your vault...</p>
                    </div>
                ) : filteredProjects.length > 0 ? (
                    <div className="project-grid">
                        {filteredProjects.map(project => (
                            <div 
                                key={project.id} 
                                className="project-card"
                                onClick={() => navigate(`/knowledge/project/${project.id}`)}
                            >
                                <Folder className="project-icon" size={24} />
                                <div className="project-info">
                                    <h3>{project.name}</h3>
                                    <p>{project.description || "No description provided."}</p>
                                </div>
                                <div className="card-footer">
                                    <span className="date-badge">Created {new Date(project.created_at).toLocaleDateString()}</span>
                                    <button 
                                        className="delete-card-btn" 
                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                        title="Delete Project"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Folder size={60} className="empty-icon" />
                        <h2>No projects found.</h2>
                        <p>Create your first project to start organizing your knowledge.</p>
                        {!isCreating && (
                            <button className="primary-btn" onClick={() => setIsCreating(true)}>
                                Create Project
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default KnowledgeApp;
