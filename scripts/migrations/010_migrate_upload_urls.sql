-- Migrate image URLs from /uploads/ to /api/uploads/
UPDATE writing_post_images SET url = '/api/uploads/' || SUBSTR(url, 10) WHERE url LIKE '/uploads/%';
UPDATE project_images SET url = '/api/uploads/' || SUBSTR(url, 10) WHERE url LIKE '/uploads/%';
UPDATE writing_posts SET hero_image_url = '/api/uploads/' || SUBSTR(hero_image_url, 10) WHERE hero_image_url LIKE '/uploads/%';
UPDATE writing_posts SET content = REPLACE(content, '](/uploads/', '](/api/uploads/') WHERE content LIKE '%](/uploads/%';
UPDATE projects SET content = REPLACE(content, '](/uploads/', '](/api/uploads/') WHERE content LIKE '%](/uploads/%';
