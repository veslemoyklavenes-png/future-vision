-- Future Vision – Database-skjema
-- Kjør dette i Supabase SQL Editor

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'lifestyle',
  scenario_text TEXT,
  action_plan JSONB DEFAULT '[]',
  future_artifacts JSONB DEFAULT '[]',
  wizard_answers JSONB DEFAULT '{}',
  reflection JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  timeline TEXT DEFAULT 'Next 30 days',
  priority TEXT DEFAULT 'medium',
  sub_tasks JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Row Level Security
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own scenarios"
  ON scenarios FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own action items"
  ON action_items FOR ALL USING (
    scenario_id IN (SELECT id FROM scenarios WHERE user_id = auth.uid())
  );

-- Automatisk updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
