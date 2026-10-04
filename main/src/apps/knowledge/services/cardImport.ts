import type { Card } from '../types/index.ts';
import { parseStudyMode, STUDY_MODES } from './studyModes.ts';
import { choiceProblem, combineChoiceAnswer } from './multipleChoice.ts';

export type ImportedCard = Pick<Card,
  'deck_id' | 'question' | 'answer' | 'image_url' | 'is_code' | 'card_type' | 'distractors'
>;

type Fields = Record<string, unknown>;

const parsePipeLine = (line: string): Fields => {
  const fields: Fields = {};
  if (/^Q:/.test(line)) {
    // Preserve pipes in code/types unless followed by a recognized field label.
    const parts = line.split(/\s*\|\s*(?=(?:Q|A|I|C|TYPE):)/);
    const keys: Record<string, string> = {
      Q: 'question', A: 'answer', I: 'image_url', C: 'is_code', TYPE: 'card_type',
    };
    for (const part of parts) {
      const match = /^(Q|A|I|C|TYPE):\s*([\s\S]*)$/.exec(part.trim());
      if (match) fields[keys[match[1]]] = match[2];
    }
  } else {
    const parts = line.split('|');
    if (parts.length !== 2) {
      throw new Error('Use Question | Answer, or Q: Question | A: Answer with optional I:, C:, TYPE: fields. Use JSON for multiline code.');
    }
    fields.question = parts[0];
    fields.answer = parts[1];
  }
  return fields;
};

/** Validate the entire batch before callers send any insert request. */
export const parseCardImport = (text: string, deckId: string): ImportedCard[] => {
  const input = text.trim();
  if (!input) throw new Error('Paste a JSON array or one pipe-format card per line.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    if (input.startsWith('[') || input.startsWith('{')) {
      throw new Error('Invalid JSON. Check commas, quotes, and escaped newlines before importing.');
    }
  }

  const errors: string[] = [];
  const entries: { value: unknown; label: string }[] = [];
  if (parsed !== undefined) {
    if (!Array.isArray(parsed)) throw new Error('JSON imports must be an array of card objects.');
    parsed.forEach((value, index) => entries.push({ value, label: `Card ${index + 1}` }));
  } else {
    input.split(/\r?\n/).forEach((line, index) => {
      if (!line.trim()) return;
      try {
        entries.push({ value: parsePipeLine(line.trim()), label: `Line ${index + 1}` });
      } catch (error) {
        errors.push(`Line ${index + 1}: ${error instanceof Error ? error.message : 'Invalid format.'}`);
      }
    });
  }
  if (!entries.length && !errors.length) throw new Error('The import contains no cards.');

  const cards: ImportedCard[] = [];
  for (const { value, label } of entries) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${label}: expected a card object.`);
      continue;
    }
    const fields = value as Fields;
    const question = fields.question ?? fields.q;
    const answer = fields.correct_option ?? fields.answer ?? fields.a;
    const explanation = fields.explanation;
    const rawMode = fields.card_type !== undefined ? fields.card_type : fields.t;
    const mode = rawMode === undefined ? 'classic' : parseStudyMode(rawMode);
    const image = fields.image_url ?? fields.i;
    const code = fields.is_code ?? fields.c;
    const distractors = fields.distractors ?? fields.d;
    const problems: string[] = [];

    if (typeof question !== 'string' || !question.trim()) problems.push('question must be non-empty text');
    if (typeof answer !== 'string' || !answer.trim()) problems.push('answer must be non-empty text');
    if (fields.correct_option !== undefined && (fields.answer !== undefined || fields.a !== undefined)) {
      problems.push('provide correct_option or answer, not both');
    }
    if (fields.correct_option !== undefined && mode !== 'multiple_choice') {
      problems.push('correct_option requires card_type multiple_choice');
    }
    if (explanation !== undefined && typeof explanation !== 'string') problems.push('explanation must be text');
    if (explanation !== undefined && mode !== 'multiple_choice') problems.push('separate explanation is only supported for multiple-choice cards');
    if (typeof answer === 'string' && explanation !== undefined && /\r?\n\s*\r?\n/.test(answer)) {
      problems.push('keep correct_option in one paragraph/code block and put feedback in explanation');
    }
    if (!mode) problems.push(`unsupported study mode; use ${STUDY_MODES.join(', ')}`);
    if (image !== undefined && typeof image !== 'string') problems.push('image_url must be text');
    if (code !== undefined && typeof code !== 'boolean' && code !== 'true' && code !== 'false') {
      problems.push('is_code / C: must be true or false');
    }
    if (distractors !== undefined && (!Array.isArray(distractors) ||
      distractors.some(item => typeof item !== 'string' || !item.trim()))) {
      problems.push('distractors must be an array of non-empty text options');
    }
    if (mode === 'multiple_choice' && typeof answer === 'string') {
      const problem = choiceProblem(answer, distractors);
      if (problem) problems.push(problem);
    }
    if (problems.length) {
      errors.push(`${label}: ${problems.join('; ')}.`);
      continue;
    }
    cards.push({
      deck_id: deckId,
      question: (question as string).trim(),
      answer: typeof explanation === 'string' ? combineChoiceAnswer(answer as string, explanation) : (answer as string).trim(),
      card_type: mode,
      image_url: typeof image === 'string' ? image.trim() || undefined : undefined,
      is_code: code === true || code === 'true',
      distractors: (distractors as string[] | undefined)?.map(item => item.trim()) ?? [],
    });
  }
  if (errors.length) throw new Error(`Nothing was imported. Fix these items:\n${errors.join('\n')}`);
  return cards;
};
