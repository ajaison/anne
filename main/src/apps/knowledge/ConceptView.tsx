import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { loadConceptTopic } from './services/concepts';
import { summarizeConcept } from './services/conceptEvidence';
import { choiceProblem } from './services/multipleChoice';
import { practiceUrl, topicUrl } from './curricula/pathways';
import './KnowledgeApp.css';
import './TopicView.css';

type TopicData = Awaited<ReturnType<typeof loadConceptTopic>>;

const ConceptView = () => {
  const { deckId, conceptId } = useParams<{ deckId: string; conceptId: string }>();
  const [searchParams] = useSearchParams();
  const pathwayId = searchParams.get('pathway');
  const [data, setData] = useState<TopicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true); setError(null); setData(null);
      try {
        if (!deckId || !conceptId) throw new Error('Concept not found.');
        const result = await loadConceptTopic(deckId);
        if (!result.concepts.some(concept => concept.id === conceptId)) throw new Error('This concept does not belong to this topic.');
        if (!cancelled) setData(result);
      } catch (cause) { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load concept.'); }
      finally { if (!cancelled) setLoading(false); }
    };
    void load();
    return () => { cancelled = true; };
  }, [deckId, conceptId, reload]);

  const concept = data?.concepts.find(value => value.id === conceptId);
  const evidence = summarizeConcept(conceptId ?? '', data?.reviews ?? []);
  const questions = data?.cards.filter(card => card.concept_id === conceptId) ?? [];
  const ready = questions.filter(card => card.card_type === 'multiple_choice' && !choiceProblem(card.answer, card.distractors));
  const history = data?.reviews.filter(review => review.concept_id === conceptId)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)) ?? [];

  return <div className="knowledge-container">
    <header className="knowledge-header">
      <Link className="back-button" to={topicUrl(deckId!, pathwayId)}><ArrowLeft size={18} /> Back to topic</Link>
      <div className="header-bottom"><h1>{concept?.title ?? 'Concept'}</h1></div>
      <p className="project-subtitle">{data?.deck.name}</p>
    </header>
    <main className="knowledge-content topic-content">
      {loading ? <p role="status">Loading concept…</p> : error ? <section className="project-form-card">
        <p role="alert">{error}</p><button className="primary-btn" onClick={() => setReload(value => value + 1)}>Retry</button>
      </section> : concept && <>
        <section className="project-form-card">
          <h2>Learning objective</h2><p>{concept.objective}</p>
          <dl className="topic-evidence">
            <div><dt>Questions ready</dt><dd>{ready.length} / {questions.length}</dd></div>
            <div><dt>Correct on first choice</dt><dd>{evidence.choiceReviews ? `${evidence.correctFirst} / ${evidence.choiceReviews} reviews` : 'No results yet'}</dd></div>
            <div><dt>Different questions practised</dt><dd>{evidence.distinctQuestions}</dd></div>
            <div><dt>Last practised</dt><dd>{evidence.lastPractised ? new Date(evidence.lastPractised).toLocaleString() : 'Not practised yet'}</dd></div>
          </dl>
          {ready.length ? <Link className="study-btn" to={practiceUrl(deckId!, concept.id, pathwayId, true)}><Play size={18} /> Practice concept</Link>
            : <p>Link a prepared multiple-choice question on the topic page to start practising.</p>}
          <p className="pathway-note">These results show practice evidence. Mastery across separate days is not scored yet.</p>
        </section>
        <section className="project-form-card">
          <h2>Recent practice</h2>
          {!history.length ? <p>No recorded practice yet.</p> : <ol className="concept-history">
            {history.slice(0, 10).map(review => <li key={review.id}>
              <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleString()}</time>
              <span>{review.study_mode === 'multiple_choice' && typeof review.correct === 'boolean' && typeof review.first_attempt === 'boolean'
                ? review.correct && review.first_attempt ? 'Correct on first choice' : review.correct ? 'Correct after another attempt' : 'Incorrect'
                : review.study_mode === 'classic' ? 'Self-rated review' : 'Other practice — not counted in choice accuracy'}</span>
            </li>)}
          </ol>}
        </section>
      </>}
    </main>
  </div>;
};

export default ConceptView;
