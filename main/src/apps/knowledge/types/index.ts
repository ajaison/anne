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
}

export interface Tag {
  id: string;
  name: string;
}
