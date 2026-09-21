-- Reflection reminders: one nudge per scenario, never repeated.
ALTER TABLE scenarios
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ DEFAULT NULL;

-- The cron job filters on exactly these three columns.
CREATE INDEX IF NOT EXISTS scenarios_reminder_idx
  ON scenarios (created_at)
  WHERE reminder_sent_at IS NULL AND reflection IS NULL;
