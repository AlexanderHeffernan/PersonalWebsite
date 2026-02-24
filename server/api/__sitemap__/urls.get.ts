import db from '../../utils/db'

interface SlugRow {
  slug: string
  updated_at: string
}

export default defineEventHandler(() => {
  const projects = db.prepare(`
    SELECT slug, updated_at FROM projects WHERE published = 1
  `).all() as SlugRow[]

  const posts = db.prepare(`
    SELECT slug, updated_at FROM writing_posts WHERE published = 1
  `).all() as SlugRow[]

  return [
    ...projects.map(p => ({
      loc: `/projects/${p.slug}`,
      lastmod: p.updated_at,
    })),
    ...posts.map(p => ({
      loc: `/writing/${p.slug}`,
      lastmod: p.updated_at,
    })),
  ]
})
