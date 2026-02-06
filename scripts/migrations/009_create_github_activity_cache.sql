-- 009_create_github_activity_cache.sql
CREATE TABLE IF NOT EXISTS github_activity_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_commit_date TEXT,
  last_commit_message TEXT,
  last_commit_url TEXT,
  last_commit_hours_ago INTEGER,
  week_commit_count INTEGER,
  streak_days INTEGER,
  languages_json TEXT NOT NULL DEFAULT '{}',
  current_repo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 0,
  cached_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default row
INSERT OR IGNORE INTO github_activity_cache (id) VALUES (1);
