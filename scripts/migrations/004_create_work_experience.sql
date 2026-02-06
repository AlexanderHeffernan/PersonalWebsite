-- 004_create_work_experience.sql
CREATE TABLE IF NOT EXISTS work_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  date_range TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_work_experience_sort ON work_experience(sort_order);
