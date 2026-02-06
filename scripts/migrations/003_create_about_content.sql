-- 003_create_about_content.sql
CREATE TABLE IF NOT EXISTS about_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  title TEXT NOT NULL DEFAULT 'About Me',
  bio_paragraphs TEXT NOT NULL DEFAULT '[]',
  highlights TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default row
INSERT OR IGNORE INTO about_content (id, title, bio_paragraphs, highlights) VALUES (
  1,
  'About Me',
  '["I''m Alexander Heffernan, a software engineer passionate about leveraging AI to build production-grade systems that solve real problems.","My approach combines the speed and creativity of AI-assisted development with the rigor and discipline of traditional software craftsmanship. I believe the future of engineering isn''t about choosing between AI and quality—it''s about using AI to achieve both velocity and excellence.","When I''m not coding, I''m exploring new technologies, writing about software engineering practices, or contributing to open source projects."]',
  '["Building AI-powered developer tools that enhance productivity without sacrificing code quality","Leading cross-functional teams to deliver complex distributed systems at scale","Advocating for engineering excellence through test-driven development and continuous improvement"]'
);
