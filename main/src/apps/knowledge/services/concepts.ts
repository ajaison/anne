import { supabase } from './supabase';
import { db } from './db';
import { compareLearningOrder } from './learningOrder';
import type { Card, Concept, ConceptReview, Deck } from '../types';

const checkError = (error: { code?: string; message: string } | null) => {
  if (!error) return;
  if (['42P01', '42703', 'PGRST204', 'PGRST205'].includes(error.code ?? '')) {
    throw new Error('Concept tracking is not configured yet. Apply the concept-tracking setup supplied with this update. Existing deck study is still available.');
  }
  throw new Error(error.message);
};

export const loadTopicCards = async (deckId: string, conceptId?: string) => {
  const cards: Card[] = [];
  for (let offset = 0; ; offset += 500) {
    let query = supabase.from('cards').select('*').eq('deck_id', deckId).order('id');
    if (conceptId) query = query.eq('concept_id', conceptId);
    const page = await query.range(offset, offset + 499);
    checkError(page.error);
    cards.push(...page.data as Card[]);
    if (page.data!.length < 500) return cards.sort(compareLearningOrder);
  }
};

const loadConcepts = async (deckId: string) => {
  const concepts: Concept[] = [];
  for (let offset = 0; ; offset += 500) {
    const page = await supabase.from('concepts').select('*').eq('deck_id', deckId)
      .order('created_at').order('id').range(offset, offset + 499);
    checkError(page.error);
    concepts.push(...page.data as Concept[]);
    if (page.data!.length < 500) return concepts.sort((a, b) => {
      if (a.learning_order != null || b.learning_order != null) return compareLearningOrder(a, b);
      return Date.parse(a.created_at) - Date.parse(b.created_at) || a.id.localeCompare(b.id);
    });
  }
};

export const loadConceptTopic = async (deckId: string) => {
  const [deck, conceptData, cards] = await Promise.all([
    supabase.from('decks').select('*').eq('id', deckId).single(),
    loadConcepts(deckId), loadTopicCards(deckId),
  ]);
  checkError(deck.error);
  const reviews: ConceptReview[] = [];
  // Page rather than silently truncating progress at Supabase's default row limit.
  if (conceptData.length) {
    for (let offset = 0; ; offset += 500) {
      const page = await supabase.from('review_history')
        .select('id,card_id,exercise_id,concept_id,created_at,study_mode,correct,first_attempt')
        .in('concept_id', conceptData.map(concept => concept.id))
        .order('created_at').order('id').range(offset, offset + 499);
      checkError(page.error);
      reviews.push(...page.data as ConceptReview[]);
      if (page.data!.length < 500) break;
    }
  }
  return { deck: deck.data as Deck, concepts: conceptData, cards, reviews };
};

export const createConcept = async (deckId: string, title: string, objective: string) => {
  if (!title.trim() || !objective.trim()) throw new Error('Enter a concept name and learning objective.');
  const result = await supabase.from('concepts')
    .insert({ deck_id: deckId, title: title.trim(), objective: objective.trim() }).select('*').single();
  checkError(result.error);
  if (!result.data) throw new Error('The concept was not saved.');
  return result.data as Concept;
};

export const linkCardToConcept = async (deckId: string, cardId: string, conceptId: string | null) => {
  const result = await supabase.from('cards').update({ concept_id: conceptId })
    .eq('id', cardId).eq('deck_id', deckId).select('*').single();
  checkError(result.error);
  if (!result.data) throw new Error('The question was not updated.');
  // Remote data remains authoritative; a cache error must not hide the saved link.
  try { await db.cards.put(result.data as Card); }
  catch { throw new Error('The link was saved online. Reload this page and download the deck again to refresh its local copy.'); }
  return result.data as Card;
};
