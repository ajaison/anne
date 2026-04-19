import { supabase } from './supabase';
import { db } from './db';
import { Deck, Card } from '../types';

export const syncService = {
  /**
   * Downloads a deck and all its cards to the local database
   */
  async downloadDeck(deckId: string) {
    try {
      console.log(`📥 Syncing deck ${deckId}...`);

      // 1. Fetch deck metadata from Supabase
      const { data: deck, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (deckError) throw deckError;

      // 2. Fetch all cards for this deck from Supabase
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deckId);

      if (cardsError) throw cardsError;

      // 3. Save to Local Dexie DB
      // We use 'put' so it updates existing records or adds new ones
      await db.transaction('rw', [db.decks, db.cards], async () => {
        await db.decks.put(deck as Deck);
        if (cards && cards.length > 0) {
          await db.cards.bulkPut(cards as Card[]);
        }
      });

      console.log(`✅ Deck ${deckId} and ${cards?.length || 0} cards synced successfully.`);
      return { success: true, count: cards?.length || 0 };
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Gets cards for a deck, trying local DB first if preferred
   */
  async getCards(deckId: string, preferLocal: boolean = false) {
    if (preferLocal || !navigator.onLine) {
      const localCards = await db.cards.where('deck_id').equals(deckId).toArray();
      if (localCards.length > 0) return localCards;
    }

    // Fallback to supabase if online and local is empty
    const { data } = await supabase.from('cards').select('*').eq('deck_id', deckId);
    return data as Card[];
  }
};
