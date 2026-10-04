import type { Card, ReviewRating, SessionCardResult } from '../types/index.ts';
import { scheduleReview, type CardSchedule } from './scheduler.ts';
import { conceptEvidence } from './conceptEvidence.ts';

export interface ReviewAttempt {
  id: string;
  card: Card;
  rating: ReviewRating;
  created_at: string;
  stats: CardSchedule;
  result: SessionCardResult;
}

export const matchesReviewHistory = (attempt: ReviewAttempt,
  row: { card_id: string; rating: string; created_at: string;
    concept_id?: string | null; study_mode?: string | null;
    exercise_id?: string | null;
    correct?: boolean | null; first_attempt?: boolean | null } | null): boolean =>
  row?.card_id === attempt.card.id && row.rating === attempt.rating &&
  Date.parse(row.created_at) === Date.parse(attempt.created_at) &&
  (!attempt.card.concept_id || Object.entries(conceptEvidence(attempt))
    .every(([key, value]) => row[key as keyof typeof row] === value));

interface ReviewDependencies {
  online: () => boolean;
  newId: () => string;
  saveStats: (attempt: ReviewAttempt) => Promise<void>;
  saveHistory: (attempt: ReviewAttempt) => Promise<void>;
  saveCache: (attempt: ReviewAttempt) => Promise<void>;
  keepPending: (attempt: ReviewAttempt | null) => void;
}

/** randomUUID is unavailable on a phone's plain-HTTP LAN preview. */
export const newReviewId = (random: Pick<Crypto, 'getRandomValues'> = crypto): string => {
  const bytes = random.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/** One intent per card, with a synchronous lock and resumable save stages. */
export const createReviewSaver = (dependencies: ReviewDependencies, initial?: ReviewAttempt) => {
  let pending = initial;
  let busy = false;
  let statsSaved = false;
  let historySaved = false;
  let cacheSaved = false;
  const completed = new Set<string>();

  return {
    getPending: () => pending,
    isBusy: () => busy,
    async submit(card: Card, rating: ReviewRating, result: SessionCardResult, now = new Date()) {
      if (busy || completed.has(card.id)) return undefined;
      if (pending && pending.card.id !== card.id) throw new Error('Finish saving the current review first.');
      busy = true;
      try {
        if (!pending) {
          pending = {
            id: dependencies.newId(), card, rating, result,
            created_at: now.toISOString(), stats: scheduleReview(card, rating, now),
          };
        }
        // Keep the original ID, rating, and computed schedule across retries/reloads.
        dependencies.keepPending(pending);
        if (!dependencies.online()) {
          throw new Error('Connect to the internet, then retry. Offline review syncing is not available yet.');
        }
        if (!statsSaved) {
          await dependencies.saveStats(pending);
          statsSaved = true;
        }
        if (!historySaved) {
          await dependencies.saveHistory(pending);
          historySaved = true;
        }
        if (!cacheSaved) {
          await dependencies.saveCache(pending);
          cacheSaved = true;
        }
        dependencies.keepPending(null);
        const saved = pending;
        completed.add(card.id);
        pending = undefined;
        statsSaved = historySaved = cacheSaved = false;
        return saved;
      } finally {
        busy = false;
      }
    },
  };
};
