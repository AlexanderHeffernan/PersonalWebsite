-- 012_create_github_streak_days.sql
CREATE TABLE IF NOT EXISTS github_streak_days (
  date TEXT PRIMARY KEY,
  has_contributions INTEGER NOT NULL DEFAULT 0
);

-- Add streak cache column to existing activity cache (safe to re-run)
ALTER TABLE github_activity_cache ADD COLUMN streak_calculated_date TEXT;
