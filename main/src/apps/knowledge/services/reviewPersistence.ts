import { supabase } from './supabase';
import { db } from './db';
import { createReviewSaver, newReviewId, matchesReviewHistory, type ReviewAttempt } from './reviewSaver';
import { parseStudyMode } from './studyModes';
import { conceptEvidence } from './conceptEvidence';

const storageKey = (deckId: string) => `anne:pending-review:${deckId}`;

const readPending = (deckId: string): ReviewAttempt | undefined => {
  const raw = sessionStorage.getItem(storageKey(deckId));
  if (!raw) return undefined;
  // Only this app writes the draft. Reject stale/invalid shapes before sending requests.
  const value: ReviewAttempt = JSON.parse(raw);
  if (!value?.id || value.card?.deck_id !== deckId || !value.card.id ||
    !['again', 'hard', 'good', 'easy'].includes(value.rating) ||
    !parseStudyMode(value.result?.mode) || value.result.card?.id !== value.card.id ||
    typeof value.result.correct !== 'boolean' || !Number.isInteger(value.result.attempts) || value.result.attempts < 1 ||
    !Number.isFinite(value.stats?.interval) || !Number.isFinite(value.stats.ease_factor) ||
    !Number.isFinite(value.stats.repetitions) ||
    !Number.isFinite(Date.parse(value.stats.next_review)) ||
    !Number.isFinite(Date.parse(value.created_at))) {
    throw new Error('The pending review could not be restored. Please return to the deck and try again.');
  }
  return value;
};

export const makeReviewSaver = (deckId: string) => createReviewSaver({
  online: () => navigator.onLine,
  newId: () => newReviewId(),
  keepPending: attempt => {
    if (attempt) sessionStorage.setItem(storageKey(deckId), JSON.stringify(attempt));
    else sessionStorage.removeItem(storageKey(deckId));
  },
  saveStats: async attempt => {
    const { data, error } = await supabase.from('cards').update(attempt.stats)
      .eq('id', attempt.card.id).select('id').single();
    if (error || !data) throw new Error(`Could not save the review schedule: ${error?.message ?? 'Card was not updated.'}`);
  },
  saveHistory: async attempt => {
    const row = {
      id: attempt.id, card_id: attempt.card.id,
      rating: attempt.rating, created_at: attempt.created_at,
      ...(attempt.card.concept_id ? conceptEvidence(attempt) : {}),
    };
    const { error } = await supabase.from('review_history').insert(row);
    if (!error) return;
    if (error.code === '23505') {
      // A previous request may have succeeded even if its response was lost.
      const { data, error: readError } = await supabase.from('review_history')
        .select('*').eq('id', attempt.id).single();
      if (!readError && matchesReviewHistory(attempt, data)) return;
    }
    throw new Error(`Could not save review history: ${error.message}. Retry to finish saving this review.`);
  },
  saveCache: async attempt => {
    try {
      // Upsert also handles cards that have never been downloaded before.
      await db.cards.put({ ...attempt.card, ...attempt.stats });
    } catch {
      throw new Error('The review is saved online, but the local card cache could not be updated. Retry to finish.');
    }
  },
}, readPending(deckId));
