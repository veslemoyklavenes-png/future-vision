-- Occasions the person has written in their own words.
--
-- Action items are deleted and rewritten on every regeneration, so a cue
-- stored only on the item cannot survive. These rows live on the account
-- instead: when someone corrects a cue they are telling us something true
-- about their week, which is worth more than the one action it was attached to.
CREATE TABLE IF NOT EXISTS user_cues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, text)
);

ALTER TABLE user_cues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only see their own cues" ON user_cues;
CREATE POLICY "Users can only see their own cues"
  ON user_cues FOR ALL USING (auth.uid() = user_id);
