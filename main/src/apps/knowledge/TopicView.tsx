import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { createConcept, linkCardToConcept, loadConceptTopic } from './services/concepts';
import { summarizeConcept } from './services/conceptEvidence';
import { choiceProblem } from './services/multipleChoice';
import { FlashcardContent } from './components/FlashcardContent';
import { conceptUrl, getPathway, practiceUrl } from './curricula/pathways';
import './KnowledgeApp.css';
import './TopicView.css';

type TopicData = Awaited<ReturnType<typeof loadConceptTopic>>;

const TopicView = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pathway = getPathway(searchParams.get('pathway'));
  const [data, setData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (deckId) void loadConceptTopic(deckId).then(value => {
      if (!cancelled) setData(value);
    }).catch(cause => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load concepts.');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [deckId, reload]);

  const save = async (action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setSaveError(null);
    try { await action(); }
    catch (cause) { setSaveError(cause instanceof Error ? cause.message : 'Unable to save.'); }
    finally { lock.current = false; setBusy(false); }
  };

  return <div className="knowledge-container">
    <header className="knowledge-header">
      <button className="back-button" disabled={busy} onClick={() => navigate(pathway && data
        ? `/knowledge/project/${data.deck.project_id}/pathway/${pathway.id}` : `/knowledge/deck/${deckId}`)}>
        <ArrowLeft size={20} /> {pathway ? 'Back to pathway' : 'Back to deck'}
      </button>
      <h1>{data?.deck.name ?? 'Topic concepts'}</h1>
      <p className="project-subtitle">Learn each subtopic from the basics, then build up to practical cases.</p>
      <Link className="back-button" to={`/knowledge/deck/${deckId}${pathway ? `?pathway=${pathway.id}` : ''}`}>Manage questions</Link>
    </header>
    <main className="knowledge-content topic-content">
      {loading ? <p role="status">Loading concepts and practice history…</p> : error ?
        <div className="project-form-card"><p role="alert">{error}</p>
          <button className="primary-btn" onClick={() => setReload(value => value + 1)}>Retry</button>
        </div> : data && <>
          <p>New questions follow the teaching order where available. Due reviews come first in practice. Results show multiple-choice practice, not demonstrated mastery.</p>
          {saveError && <p role="alert" className="topic-error">{saveError}</p>}
          <div className="topic-concepts">
            {data.concepts.map(concept => {
              const cards = data.cards.filter(card => card.concept_id === concept.id);
              const prepared = cards.filter(card => card.card_type === 'multiple_choice' && !choiceProblem(card.answer, card.distractors));
              const evidence = summarizeConcept(concept.id, data.reviews);
              return <article className="project-form-card topic-concept" key={concept.id}>
                <h2>{concept.title}</h2><p>{concept.objective}</p>
                <dl className="topic-evidence">
                  <div><dt>Questions ready</dt><dd>{prepared.length} of {cards.length}</dd></div>
                  <div><dt>Correct on first choice</dt><dd>{evidence.choiceReviews ? `${evidence.correctFirst} / ${evidence.choiceReviews} reviews` : 'No results yet'}</dd></div>
                  <div><dt>Questions practised</dt><dd>{evidence.distinctQuestions}</dd></div>
                  <div><dt>Last practised</dt><dd>{evidence.lastPractised
                    ? <time dateTime={evidence.lastPractised}>{new Date(evidence.lastPractised).toLocaleString()}</time> : 'Not practised yet'}</dd></div>
                </dl>
                <Link className="back-button" to={conceptUrl(deckId!, concept.id, pathway?.id)}>View concept and history</Link>
                <button className="study-btn" disabled={!prepared.length || busy}
                  onClick={() => navigate(practiceUrl(deckId!, concept.id, pathway?.id))}>
                  <Play size={18} /> Practice concept
                </button>
              </article>;
            })}
          </div>
          {!data.concepts.length && <p>Create your first concept, then link questions below. For example: “Equality and hashing” or “Effect dependencies”.</p>}
          <form className="project-form-card" onSubmit={event => {
            event.preventDefault();
            if (deckId) void save(async () => {
              const concept = await createConcept(deckId, title, objective);
              setData(previous => previous && { ...previous, concepts: [...previous.concepts, concept] });
              setTitle(''); setObjective('');
            });
          }}>
            <h2>Add a concept</h2>
            <fieldset disabled={busy} className="card-editor-fields">
              <label className="card-editor-label">Concept name
                <input className="qa-textarea" required maxLength={160} value={title} onChange={event => setTitle(event.target.value)} />
              </label>
              <label className="card-editor-label">What should you understand?
                <textarea className="qa-textarea" required maxLength={2000} rows={3} value={objective} onChange={event => setObjective(event.target.value)} />
              </label>
              <button className="primary-btn" type="submit">{busy ? 'Saving…' : 'Add concept'}</button>
            </fieldset>
          </form>
          <section className="project-form-card topic-links">
            <h2>Link questions to concepts</h2>
            <p>Several questions can test one concept. Unlinked questions remain available in normal deck study.</p>
            {data.cards.map(card => <div className="topic-question" key={card.id}>
              <FlashcardContent content={card.question} />
              <label className="card-editor-label">Concept for this question
                <select className="qa-textarea" disabled={busy} value={card.concept_id ?? ''}
                  onChange={event => {
                    const conceptId = event.target.value || null;
                    if (deckId) void save(async () => {
                      const updated = await linkCardToConcept(deckId, card.id, conceptId);
                      setData(previous => previous && { ...previous,
                        cards: previous.cards.map(existing => existing.id === updated.id ? updated : existing) });
                    });
                  }}>
                  <option value="">Unlinked</option>
                  {data.concepts.map(concept => <option value={concept.id} key={concept.id}>{concept.title}</option>)}
                </select>
              </label>
            </div>)}
          </section>
        </>}
    </main>
  </div>;
};

export default TopicView;
