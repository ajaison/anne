-- Create the review_history table
CREATE TABLE IF NOT EXISTS public.review_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    rating TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.review_history ENABLE ROW LEVEL SECURITY;

-- If you are not using authentication for this personal app, 
-- you can create a policy that simply allows anonymous users to read and insert:
CREATE POLICY "Enable read access for all users" ON public.review_history
    AS PERMISSIVE FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert for all users" ON public.review_history
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK (true);
