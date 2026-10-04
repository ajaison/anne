import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scheduleReview, reviewIntervalLabel } from '../src/apps/knowledge/services/scheduler.ts';
import { createReviewSaver, matchesReviewHistory, newReviewId } from '../src/apps/knowledge/services/reviewSaver.ts';

const now = new Date('2026-10-04T08:00:00.000Z');
const card = {
  id: 'card', deck_id: 'deck', question: 'Question', answer: 'Answer',
  interval: 6, ease_factor: 2.5, repetitions: 2, next_review: now.toISOString(),
};
const result = { card, correct: true, attempts: 1, mode: 'classic', rating: 'good' };

const setup = (overrides = {}, initial) => {
  const calls = { stats: [], history: [], cache: [], drafts: [] };
  const dependencies = {
    online: () => true,
    newId: () => 'review-id',
    saveStats: async attempt => { calls.stats.push(attempt); },
    saveHistory: async attempt => { calls.history.push(attempt); },
    saveCache: async attempt => { calls.cache.push(attempt); },
    keepPending: attempt => { calls.drafts.push(attempt); },
    ...overrides,
  };
  return { saver: createReviewSaver(dependencies, initial), calls, dependencies };
};

test('scheduler preserves existing intervals, ease updates, minimum ease, and tomorrow for Again', () => {
  const first = { ...card, interval: 0, repetitions: 0 };
  for (const rating of ['hard', 'good', 'easy']) {
    assert.equal(scheduleReview(first, rating, now).interval, 1);
    assert.equal(scheduleReview({ ...card, repetitions: 1 }, rating, now).interval, 6);
    assert.equal(scheduleReview(card, rating, now).interval, 15);
  }
  assert.equal(scheduleReview(card, 'easy', now).ease_factor, 2.65);
  assert.equal(scheduleReview(card, 'hard', now).ease_factor, 2.35);
  assert.equal(scheduleReview({ ...card, ease_factor: 1.3 }, 'hard', now).ease_factor, 1.3);
  const again = scheduleReview(card, 'again', now);
  assert.equal(again.interval, 0);
  assert.equal(again.repetitions, 0);
  assert.equal(again.ease_factor, 2.5);
  assert.equal(again.next_review, '2026-10-05T08:00:00.000Z');
  assert.equal(card.repetitions, 2); // Input is never mutated.
});

test('rating previews match the day counts used by the saved schedule', () => {
  for (const sample of [card, { ...card, repetitions: 0 }, { ...card, repetitions: 1 }]) {
    for (const rating of ['again', 'hard', 'good', 'easy']) {
      const saved = scheduleReview(sample, rating, now);
      assert.equal(reviewIntervalLabel(sample, rating), `${saved.interval || 1}d`);
      const expectedDate = new Date(now);
      expectedDate.setDate(expectedDate.getDate() + (saved.interval || 1));
      assert.equal(saved.next_review, expectedDate.toISOString());
    }
  }
});

test('UUID creation works with getRandomValues alone, including plain-HTTP mobile previews', () => {
  const id = newReviewId({ getRandomValues: bytes => bytes.fill(0) });
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('concurrent clicks and revisits return only one committed result', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let statsCount = 0;
  const { saver, calls } = setup({ saveStats: async () => { statsCount++; await gate; } });
  const first = saver.submit(card, 'good', result, now);
  assert.equal(saver.isBusy(), true);
  assert.equal(await saver.submit(card, 'easy', result, now), undefined);
  release();
  const saved = await first;
  assert.equal(saved.rating, 'good');
  assert.equal(await saver.submit(card, 'good', result, now), undefined);
  assert.equal(statsCount, 1);
  assert.equal(calls.history.length, 1);
  assert.equal(calls.cache.length, 1);
  assert.equal(saver.getPending(), undefined);
  assert.equal(saver.isBusy(), false);
});

test('schedule failure leaves a retryable original review and does not write history', async () => {
  let fail = true;
  const schedules = [];
  const { saver, calls } = setup({ saveStats: async attempt => {
    schedules.push(attempt.stats);
    if (fail) throw new Error('schedule unavailable');
  } });
  await assert.rejects(saver.submit(card, 'good', result, now), /schedule unavailable/);
  assert.equal(calls.history.length, 0);
  assert.equal(saver.getPending().id, 'review-id');
  fail = false;
  const saved = await saver.submit(card, 'easy', { ...result, rating: 'easy' }, new Date('2026-10-06'));
  assert.equal(saved.rating, 'good');
  assert.equal(saved.created_at, now.toISOString());
  assert.deepEqual(schedules[0], schedules[1]);
});

test('history retry skips the saved schedule, and a cache retry skips both remote writes', async () => {
  let historyFails = true;
  let cacheFails = true;
  let historyCount = 0;
  let cacheCount = 0;
  const { saver, calls } = setup({
    saveHistory: async () => { historyCount++; if (historyFails) throw new Error('history unavailable'); },
    saveCache: async () => { cacheCount++; if (cacheFails) throw new Error('cache unavailable'); },
  });
  await assert.rejects(saver.submit(card, 'good', result, now), /history unavailable/);
  historyFails = false;
  await assert.rejects(saver.submit(card, 'good', result, now), /cache unavailable/);
  cacheFails = false;
  assert.ok(await saver.submit(card, 'good', result, now));
  assert.equal(calls.stats.length, 1);
  assert.equal(historyCount, 2);
  assert.equal(cacheCount, 2);
});

test('offline result is retained without applying writes, and cannot be replaced by another card', async () => {
  let online = false;
  const { saver, calls } = setup({ online: () => online });
  await assert.rejects(saver.submit(card, 'good', result, now), /Connect to the internet/);
  assert.equal(calls.stats.length, 0);
  assert.equal(calls.history.length, 0);
  assert.equal(calls.drafts.at(-1).id, 'review-id');
  await assert.rejects(saver.submit({ ...card, id: 'other' }, 'good', result), /current review first/);
  online = true;
  assert.ok(await saver.submit(card, 'good', result, now));
  assert.equal(calls.drafts.at(-1), null);
});

test('restored review keeps its ID/schedule after a lost response and produces one history row', async () => {
  const rows = new Map();
  let draft;
  let loseResponse = true;
  let storedStats;
  const dependencies = {
    keepPending: attempt => { draft = attempt ? structuredClone(attempt) : undefined; },
    saveStats: async attempt => { storedStats = attempt.stats; },
    saveHistory: async attempt => {
      const existing = rows.get(attempt.id);
      if (existing) {
        assert.ok(matchesReviewHistory(attempt, existing));
        return;
      }
      rows.set(attempt.id, { card_id: attempt.card.id, rating: attempt.rating, created_at: attempt.created_at });
      if (loseResponse) throw new Error('response lost');
    },
  };
  const first = setup(dependencies).saver;
  await assert.rejects(first.submit(card, 'good', result, now), /response lost/);
  const original = structuredClone(draft);
  loseResponse = false;
  const restored = setup(dependencies, draft).saver;
  const saved = await restored.submit(card, 'easy', result, new Date('2026-10-10'));
  assert.equal(saved.id, original.id);
  assert.deepEqual(storedStats, original.stats);
  assert.equal(rows.size, 1);
  assert.equal(draft, undefined);
});

test('duplicate history is accepted only if the original card, rating, and timestamp match', () => {
  const attempt = { card, rating: 'good', created_at: now.toISOString() };
  const row = { card_id: card.id, rating: 'good', created_at: '2026-10-04T09:00:00+01:00' };
  assert.equal(matchesReviewHistory(attempt, row), true);
  assert.equal(matchesReviewHistory(attempt, { ...row, card_id: 'other' }), false);
  assert.equal(matchesReviewHistory(attempt, { ...row, rating: 'again' }), false);
  assert.equal(matchesReviewHistory(attempt, { ...row, created_at: '2026-10-05T08:00:00Z' }), false);
  assert.equal(matchesReviewHistory(attempt, null), false);
});
