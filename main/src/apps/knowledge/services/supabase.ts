import { createClient } from '@supabase/supabase-js'
import type { Card, StudyMode } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aedrarhwgtajdrfyzyae.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DiPjlX9kxoH_7X_shndwCQ_GR4YTUEN'

console.log('🔗 Connecting to Supabase at:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- HELPERS FOR THE KNOWLEDGE APP ---

// 1. Projects
export const fetchProjects = () => supabase.from('projects').select('*')
export const createProject = (name: string, description: string) => supabase.from('projects').insert({ name, description })

// 2. Decks
export const fetchDecksByProject = (projectId: string) => supabase.from('decks').select('*').eq('project_id', projectId)
export const createDeck = (name: string, description: string, projectId: string) =>
    supabase.from('decks').insert({ name, description, project_id: projectId })

// 3. Cards
export const fetchCardsByDeck = (deckId: string) => supabase.from('cards').select('*').eq('deck_id', deckId)
export const createCard = (
    deckId: string,
    question: string,
    answer: string,
    image_url?: string,
    is_code?: boolean,
    card_type?: StudyMode,
    distractors?: string[]
) =>
    supabase.from('cards').insert({ deck_id: deckId, question, answer, image_url, is_code, card_type, distractors })

// 4. Tags
export const fetchTags = () => supabase.from('tags').select('*')
export const createTag = (name: string) => supabase.from('tags').insert({ name })

// 5. Connect card to tag
export const deleteCardTag = (cardId: string, tagId: string) =>
    supabase.from('card_tags').delete().eq('card_id', cardId).eq('tag_id', tagId)

export const addCardTag = (cardId: string, tagId: string) =>
    supabase.from('card_tags').insert({ card_id: cardId, tag_id: tagId })

// 6. Get cards by Tag (Cross-Deck Query)
export const fetchCardsByTag = (tagId: string) =>
    supabase.from('card_tags').select('cards(*)').eq('tag_id', tagId)

// 7. Update Card Stats (for SRS)
export const updateCardStats = (cardId: string, stats: Partial<Card>) => 
    supabase.from('cards').update(stats).eq('id', cardId)

// 8. Fetch History
export const fetchReviewHistory = () => 
    supabase.from('review_history').select('*').order('created_at', { ascending: false })

// 9. Deletions
export const deleteProject = (id: string) => supabase.from('projects').delete().eq('id', id)
export const deleteCard = (id: string) => supabase.from('cards').delete().eq('id', id)
export const bulkCreateCards = (cards: any[]) => supabase.from('cards').insert(cards)

