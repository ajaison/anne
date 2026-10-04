export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id?: string;
}

export interface Deck {
  id: string;
  project_id: string;
  name: string;
  description: string;
  created_at: string;
}

export type StudyMode = 'classic' | 'multiple_choice' | 'fill_blank' | 'type_answer';
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface Card {
  id: string;
  deck_id: string;
  concept_id?: string | null;
  question: string;
  answer: string;
  interval: number;
  ease_factor: number;
  repetitions: number;
  next_review: string;
  image_url?: string;
  is_code?: boolean;
  card_type?: StudyMode;
  distractors?: string[];
}

export interface Concept {
  id: string;
  deck_id: string;
  title: string;
  objective: string;
  created_at: string;
}

export interface ConceptReview {
  id: string;
  card_id: string | null;
  exercise_id?: string | null;
  concept_id: string | null;
  created_at: string;
  study_mode: StudyMode | null;
  correct: boolean | null;
  first_attempt: boolean | null;
}

export interface Tag {
  id: string;
  name: string;
}

export interface SessionCardResult {
  card: Card;
  correct: boolean;
  attempts: number;
  mode: StudyMode;
  rating: ReviewRating;
}

export interface SessionResult {
  skippedCards?: number;
  totalCards: number;
  correctFirst: number;
  xpEarned: number;
  bestStreak: number;
  cardResults: SessionCardResult[];
}
