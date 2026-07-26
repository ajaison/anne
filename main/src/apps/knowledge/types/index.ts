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

export interface Card {
  id: string;
  deck_id: string;
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

export interface Tag {
  id: string;
  name: string;
}

export interface SessionCardResult {
  card: Card;
  correct: boolean;
  attempts: number;
  mode: StudyMode;
}

export interface SessionResult {
  totalCards: number;
  correctFirst: number;
  xpEarned: number;
  bestStreak: number;
  cardResults: SessionCardResult[];
}
