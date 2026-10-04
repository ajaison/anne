import type { Card, ReviewRating } from '../types/index.ts';

export type CardSchedule = Pick<Card, 'interval' | 'ease_factor' | 'repetitions' | 'next_review'>;

/** Preserve the existing day-based algorithm; previews and saves use this function. */
export const scheduleReview = (card: CardSchedule, rating: ReviewRating, now = new Date()): CardSchedule => {
  let { interval, ease_factor, repetitions } = card;
  if (rating === 'again') {
    repetitions = 0;
    interval = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * ease_factor);
    if (rating === 'easy') ease_factor += 0.15;
    if (rating === 'hard') ease_factor -= 0.15;
    ease_factor = Math.max(1.3, ease_factor);
  }
  const next = new Date(now);
  next.setDate(next.getDate() + (interval || 1));
  return { interval, ease_factor, repetitions, next_review: next.toISOString() };
};

export const reviewIntervalLabel = (card: CardSchedule, rating: ReviewRating): string =>
  `${scheduleReview(card, rating).interval || 1}d`;
