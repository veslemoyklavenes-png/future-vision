-- Mental contrasting: the section that holds the desired future and the
-- obstacle side by side. The obstacle itself, in the person's own words,
-- lives in scenarios.wizard_answers.
ALTER TABLE scenarios
  ADD COLUMN IF NOT EXISTS obstacle_reflection TEXT DEFAULT NULL;
