import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Plus } from 'lucide-react';
import { getPathway, topicUrl } from './curricula/pathways';
import { loadPathwayData, setupPathwayTopics } from './services/pathways';
import { resolvePathwayTopics, summarizeTopic } from './services/pathwayProgress';
import './KnowledgeApp.css';
import './PathwayView.css';

type PathwayData = Awaited<ReturnType<typeof loadPathwayData>>;

const PathwayView = () => {
  const { projectId, pathwayId } = useParams<{ projectId: string; pathwayId: string }>();
  const pathway = getPathway(pathwayId);
  const [data, setData] = useState<PathwayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true); setError(null); setData(null);
      try {
        if (!projectId || !pathway) throw new Error('This pathway could not be found.');
        const result = await loadPathwayData(projectId);
        if (!cancelled) setData(result);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load pathway.');
      } finally { if (!cancelled) setLoading(false); }
    };
    void load();
    return () => { cancelled = true; };
  }, [projectId, pathway, reload]);

  const setup = async (topicId?: string) => {
    if (!projectId || !pathway || lock.current) return;
    lock.current = true; setBusy(true); setSaveError(null);
    try {
      const decks = await setupPathwayTopics(projectId, pathway, topicId);
      setData(previous => previous && { ...previous, decks });
    } catch (cause) { setSaveError(cause instanceof Error ? cause.message : 'Unable to add topics.'); }
    finally { lock.current = false; setBusy(false); }
  };

  const topics = pathway && data ? resolvePathwayTopics(pathway, data.decks, data.project.id).map(topic => ({
    ...topic, progress: summarizeTopic(topic.decks, data.concepts, data.cards, data.reviews),
  })) : [];
  const includedDeckIds = new Set(topics.flatMap(topic => topic.decks.map(deck => deck.id)));
  const otherDecks = data?.decks.filter(deck => !includedDeckIds.has(deck.id)) ?? [];
  const totalConcepts = topics.reduce((sum, topic) => sum + topic.progress.concepts, 0);
  const practisedConcepts = topics.reduce((sum, topic) => sum + topic.progress.practisedConcepts, 0);
  const dueQuestions = topics.reduce((sum, topic) => sum + topic.progress.dueQuestions, 0);
  const missingTopics = topics.filter(topic => !topic.decks.length).length;
  const nextTopic = topics.find(topic => topic.progress.dueQuestions > 0) ??
    topics.find(topic => topic.progress.readyQuestions > 0 && topic.progress.practisedConcepts < topic.progress.concepts) ??
    topics.find(topic => topic.progress.readyQuestions > 0);
  const nextDeck = nextTopic && data ? nextTopic.decks.find(deck =>
    summarizeTopic([deck], data.concepts, data.cards, data.reviews).dueQuestions > 0) ??
    nextTopic.decks.find(deck => summarizeTopic([deck], data.concepts, data.cards, data.reviews).readyQuestions > 0) : undefined;

  return <div className="knowledge-container">
    <header className="knowledge-header">
      <div className="header-top pathway-nav">
        <Link className="back-button" to="/knowledge"><ArrowLeft size={18} /> All projects</Link>
        <Link className="back-button" to={`/knowledge/project/${projectId}`}>Manage decks</Link>
      </div>
      <div className="header-bottom"><div>
        <p className="pathway-eyebrow">{data?.project.name ?? 'Learning pathway'}</p>
        <h1>{pathway?.title ?? 'Pathway'}</h1>
      </div></div>
      <p className="project-subtitle">{pathway?.description}</p>
    </header>
    <main className="knowledge-content pathway-content">
      {loading ? <p role="status">Loading your topics and practice history…</p> : error ?
        <section className="project-form-card"><p role="alert">{error}</p>
          <button className="primary-btn" onClick={() => setReload(value => value + 1)}>Retry</button>
        </section> : data && pathway && <>
          <section className="pathway-overview" aria-label="Pathway overview">
            <div><strong>{topics.filter(topic => topic.decks.length).length} / {topics.length}</strong><span>Topics set up</span></div>
            <div><strong>{totalConcepts ? `${practisedConcepts} / ${totalConcepts}` : 'No concepts yet'}</strong><span>Concepts practised</span></div>
            <div><strong>{dueQuestions}</strong><span>Questions due</span></div>
          </section>
          <p className="pathway-note">Concepts practised shows coverage of the concepts you’ve added. Ready questions are complete multiple-choice questions linked to those concepts. Mastery needs evidence across separate days and is not scored yet.</p>
          {saveError && <p className="topic-error" role="alert">{saveError}</p>}
          <div className="pathway-actions">
            {!!missingTopics && <button className="study-btn" disabled={busy} onClick={() => void setup()}>
              <Plus size={18} /> {busy ? 'Setting up…' : `Set up ${missingTopics === topics.length ? 'topics' : 'remaining topics'}`}
            </button>}
            {nextDeck && <Link className="study-btn" to={topicUrl(nextDeck.id, pathway.id)}>
              <ArrowRight size={18} /> {dueQuestions ? 'Open next due topic' : 'Continue practising'}
            </Link>}
          </div>
          {!data.concepts.length && <p className="pathway-note">Start by setting up the topics. Open Collections or another topic, add concepts, then link multiple-choice questions to practise.</p>}
          {Array.from(new Set(topics.map(topic => topic.section))).map(section =>
            <section key={section} className="pathway-section">
              <h2>{section}</h2>
              <div className="pathway-grid">
                {topics.map((topic, index) => topic.section !== section ? null : <article className="pathway-topic" key={topic.id}>
                  <div className="pathway-topic-heading"><span className="pathway-topic-number">{index + 1}</span>
                    <h3>{topic.title}</h3><span className="pathway-status">{topic.progress.practisedConcepts ? 'Practising' : topic.progress.readyQuestions ? 'Ready' : topic.decks.length ? 'Add content' : 'Planned'}</span>
                  </div>
                  <p>{topic.objective}</p>
                  <dl className="pathway-topic-stats">
                    <div><dt>Concepts practised</dt><dd>{topic.progress.concepts ? `${topic.progress.practisedConcepts} / ${topic.progress.concepts}` : 'No concepts yet'}</dd></div>
                    <div><dt>Questions ready</dt><dd>{topic.progress.readyQuestions} / {topic.progress.questions}</dd></div>
                    <div><dt>Questions due</dt><dd>{topic.progress.dueQuestions}</dd></div>
                    <div><dt>Last concept practice</dt><dd>{topic.progress.lastPractised ?
                      <time dateTime={topic.progress.lastPractised}>{new Date(topic.progress.lastPractised).toLocaleDateString()}</time> : 'Not practised yet'}</dd></div>
                  </dl>
                  <div className="pathway-topic-links">
                    {topic.decks.length ? topic.decks.map(deck => <Link className="pathway-open" key={deck.id} to={topicUrl(deck.id, pathway.id)}>
                      <BookOpen size={18} /> {topic.decks.length > 1 ? `Open ${deck.name}` : 'Open topic'} <ArrowRight size={16} />
                    </Link>) : <button className="pathway-open" disabled={busy} onClick={() => void setup(topic.id)}><Plus size={18} /> Set up topic</button>}
                  </div>
                </article>)}
              </div>
            </section>)}
          {!!otherDecks.length && <section className="pathway-section"><h2>Other topics in this project</h2>
            <p>These decks are available alongside the ordered pathway.</p>
            <div className="pathway-actions">{otherDecks.map(deck => <Link className="back-button" key={deck.id} to={topicUrl(deck.id, pathway.id)}>{deck.name} <ArrowRight size={16} /></Link>)}</div>
          </section>}
          <p className="pathway-note">Topic outline references <a href={pathway.source.url} target="_blank" rel="noreferrer">{pathway.source.title}</a>. This pathway is not a complete certification syllabus.</p>
        </>}
    </main>
  </div>;
};

export default PathwayView;
