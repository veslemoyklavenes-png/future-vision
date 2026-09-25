-- Implementation intentions. Each action gets the occasion it happens on;
-- the obstacle gets a prepared response. Both are editable by the person,
-- because a cue only works when it is one they actually recognise.
ALTER TABLE action_items
  ADD COLUMN IF NOT EXISTS cue TEXT DEFAULT NULL;

ALTER TABLE scenarios
  ADD COLUMN IF NOT EXISTS coping_plan TEXT DEFAULT NULL;
