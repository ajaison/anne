import Dexie, { type Table } from 'dexie';
import { Project, Deck, Card } from '../types';

export class KnowledgeDB extends Dexie {
  // Define our tables
  projects!: Table<Project>;
  decks!: Table<Deck>;
  cards!: Table<Card>;

  constructor() {
    super('KnowledgeDB');
    
    // Define the schema
    // The format is: tableName: 'primaryKey, indexedField1, indexedField2'
    this.version(1).stores({
      projects: 'id, name',
      decks: 'id, project_id, name',
      cards: 'id, deck_id, next_review'
    });
  }
}

// Create a single instance to be used throughout the app
export const db = new KnowledgeDB();
