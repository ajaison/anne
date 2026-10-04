import type { StudyMode } from '../types/index.ts';

export const STUDY_MODES: readonly StudyMode[] = [
  'classic', 'multiple_choice', 'fill_blank', 'type_answer',
];

/** Legacy spelling is accepted; unsupported values remain invalid for imports. */
export const parseStudyMode = (value: unknown): StudyMode | undefined => {
  if (typeof value !== 'string') return undefined;
  const mode = value.trim();
  if (mode === 'fill_in_the_blank') return 'fill_blank';
  return STUDY_MODES.find(candidate => candidate === mode);
};

/** Existing remote/cached cards must always have a usable presentation. */
export const resolveStudyMode = (value: unknown): StudyMode =>
  parseStudyMode(value) ?? 'classic';
