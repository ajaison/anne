import { supabase } from './supabase';
import type { Card, Concept, ConceptReview, Deck, Project } from '../types';
import type { Pathway } from '../curricula/pathways';
import { resolvePathwayTopics } from './pathwayProgress';

const check = (error: { message: string } | null) => { if (error) throw new Error(error.message); };

/** Scope every read and page all results, including projects with large decks. */
const readAll = async <T>(table: string, field: string, ids: string[]): Promise<T[]> => {
  const rows: T[] = [];
  for (let start = 0; start < ids.length; start += 100) {
    for (let offset = 0; ; offset += 500) {
      const result = await supabase.from(table).select('*').in(field, ids.slice(start, start + 100))
        .order('id').range(offset, offset + 499);
      check(result.error);
      rows.push(...result.data as T[]);
      if (result.data!.length < 500) break;
    }
  }
  return rows;
};

export const loadPathwayData = async (projectId: string) => {
  const [project, decks] = await Promise.all([
    supabase.from('projects').select('*').eq('id', projectId).single(),
    readAll<Deck>('decks', 'project_id', [projectId]),
  ]);
  check(project.error);
  const deckIds = decks.map(deck => deck.id);
  const [concepts, cards] = await Promise.all([
    readAll<Concept>('concepts', 'deck_id', deckIds), readAll<Card>('cards', 'deck_id', deckIds),
  ]);
  const reviews = await readAll<ConceptReview>('review_history', 'concept_id', concepts.map(concept => concept.id));
  return { project: project.data as Project, decks, concepts, cards, reviews };
};

export const setupPathwayTopics = async (projectId: string, pathway: Pathway, topicId?: string) => {
  // Re-read before writing: repeat setup reuses existing matching topics.
  const decks = await readAll<Deck>('decks', 'project_id', [projectId]);
  const missing = resolvePathwayTopics(pathway, decks, projectId)
    .filter(topic => !topic.decks.length && (!topicId || topic.id === topicId));
  if (!missing.length) return decks;
  const result = await supabase.from('decks').insert(missing.map(topic => ({
    project_id: projectId, name: topic.title, description: topic.objective,
  }))).select('*');
  check(result.error);
  if (!result.data?.length) throw new Error('The topics were not saved. Reload and try again.');
  return [...decks, ...result.data as Deck[]];
};
