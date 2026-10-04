import type { Card } from '../types/index.ts';

/** Keep feedback out of the options; legacy answer + blank line + explanation works. */
export const splitChoiceAnswer = (answer: string) => {
  const [correctOption = '', ...feedback] = answer.trim().split(/\r?\n\s*\r?\n/);
  return { correctOption, explanation: feedback.join('\n\n') };
};

export const combineChoiceAnswer = (correctOption: string, explanation: string): string =>
  [correctOption.trim(), explanation.trim()].filter(Boolean).join('\n\n');

export const displayChoice = (text: string): string => text
  .replace(/```[\w]*\r?\n?/g, '').replace(/`/g, '').replace(/\*\*/g, '')
  .replace(/\r\n/g, '\n').trim();

export const choiceProblem = (answer: string, distractors: unknown): string | undefined => {
  const correct = displayChoice(splitChoiceAnswer(answer).correctOption);
  if (!correct) return 'Add a correct answer option.';
  if (!Array.isArray(distractors) || distractors.length !== 3 ||
    distractors.some(option => typeof option !== 'string' || !displayChoice(option))) {
    return 'Add exactly three convincing wrong answer options.';
  }
  const options = [correct, ...distractors.map(option => displayChoice(option as string))];
  if (new Set(options).size !== 4) return 'All four answer options must be different.';
  return undefined;
};

/** Fisher–Yates, run once on mount rather than whenever parent props change. */
export const authoredChoices = (card: Pick<Card, 'answer' | 'distractors'>,
  random: () => number = Math.random): string[] => {
  if (choiceProblem(card.answer, card.distractors)) return [];
  const choices = [splitChoiceAnswer(card.answer).correctOption, ...card.distractors!].map(displayChoice);
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
};

export const choiceGenerationPrompt = (topic: string): string => `Create 10 carefully reviewed multiple-choice questions for ${topic}.
Return only a JSON array using question, correct_option, explanation, card_type: "multiple_choice", distractors (exactly three strings), and is_code.
Make wrong options convincing misconceptions with comparable length, detail, formatting, and grammatical structure to the correct option. Ensure exactly one option is correct. Avoid obvious filler, unrelated errors, "all of the above", and accidental clues.
Keep correct_option separate from explanation. Explain why the correct option works and why each alternative is wrong. State the Java/React/TypeScript version when relevant and cite official sources in the explanation. Do not generate typed-answer questions. Use escaped newlines and Markdown for code. Avoid duplicate concepts already covered by the supplied deck context.`;
