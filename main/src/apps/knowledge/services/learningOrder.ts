import type { Card } from '../types/index.ts';

type Ordered = { id: string; learning_order?: number | null };
const position = (item: Ordered) => Number.isInteger(item.learning_order) && item.learning_order! >= 0
  ? item.learning_order! : Number.POSITIVE_INFINITY;

/** Teaching order is independent of review scheduling and user-facing difficulty. */
export const compareLearningOrder = (a: Ordered, b: Ordered) => {
  const left = position(a), right = position(b);
  return left === right ? a.id.localeCompare(b.id) : left < right ? -1 : 1;
};

export const orderNewCards = (cards: Card[]) => cards.some(card => Number.isFinite(position(card)))
  ? [...cards].sort(compareLearningOrder)
  : [...cards].sort(() => Math.random() - 0.5);
