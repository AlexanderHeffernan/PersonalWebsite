-- 011_add_projects_published.sql
ALTER TABLE projects ADD COLUMN published INTEGER NOT NULL DEFAULT 1;
CREATE INDEX idx_projects_published ON projects(published);
