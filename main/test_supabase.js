import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aedrarhwgtajdrfyzyae.supabase.co'
// Using the anon key from your supabase.ts file
const supabaseAnonKey = 'sb_publishable_DiPjlX9kxoH_7X_shndwCQ_GR4YTUEN'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabase() {
    const { data: history, error: historyError } = await supabase.from('review_history').select('*');
    if (historyError) {
        console.error("Error fetching review_history:", historyError);
    } else {
        console.log("Success! Found", history?.length, "records in review_history.");
        console.log("First record:", history?.[0]);
    }
}

testSupabase();
