-- 007_create_writing_post_images.sql
CREATE TABLE IF NOT EXISTS writing_post_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES writing_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_writing_post_images_post ON writing_post_images(post_id);
