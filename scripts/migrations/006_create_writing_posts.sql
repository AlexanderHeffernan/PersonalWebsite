-- 006_create_writing_posts.sql
CREATE TABLE IF NOT EXISTS writing_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  read_time TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  hero_image_url TEXT,
  hero_image_alt TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_writing_posts_slug ON writing_posts(slug);
CREATE INDEX idx_writing_posts_published ON writing_posts(published);
CREATE INDEX idx_writing_posts_sort ON writing_posts(sort_order);
CREATE INDEX idx_writing_posts_date ON writing_posts(date);
