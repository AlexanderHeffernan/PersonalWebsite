import db from '../../utils/db'

interface ProjectRow {
  slug: string
  updated_at: string
}

interface ProjectImageRow {
  url: string
  alt_text: string | null
}

interface WritingRow {
  slug: string
  title: string
  updated_at: string
  hero_image_url: string | null
  hero_image_alt: string | null
}

function toISODate(sqliteDate: string): string {
  return sqliteDate.replace(' ', 'T') + 'Z'
}

function toAbsoluteUrl(path: string): string {
  if (path.startsWith('/')) return `https://alexheffernan.dev${path}`
  return path
}

export default defineEventHandler(() => {
  const projects = db.prepare(`
    SELECT slug, updated_at FROM projects WHERE published = 1
  `).all() as ProjectRow[]

  const projectImages = db.prepare(`
    SELECT p.slug, pi.url, pi.alt_text
    FROM project_images pi
    JOIN projects p ON p.id = pi.project_id
    WHERE p.published = 1
    ORDER BY pi.sort_order ASC
  `).all() as (ProjectImageRow & { slug: string })[]

  const imagesByProject = new Map<string, { loc: string; title?: string }[]>()
  for (const img of projectImages) {
    if (!imagesByProject.has(img.slug)) imagesByProject.set(img.slug, [])
    imagesByProject.get(img.slug)!.push({
      loc: toAbsoluteUrl(img.url),
      ...(img.alt_text ? { title: img.alt_text } : {}),
    })
  }

  const posts = db.prepare(`
    SELECT slug, title, updated_at, hero_image_url, hero_image_alt
    FROM writing_posts WHERE published = 1
  `).all() as WritingRow[]

  return [
    ...projects.map(p => ({
      loc: `/projects/${p.slug}`,
      lastmod: toISODate(p.updated_at),
      images: imagesByProject.get(p.slug) || [],
    })),
    ...posts.map(p => ({
      loc: `/writing/${p.slug}`,
      lastmod: toISODate(p.updated_at),
      images: p.hero_image_url
        ? [{ loc: toAbsoluteUrl(p.hero_image_url), ...(p.hero_image_alt ? { title: p.hero_image_alt } : {}) }]
        : [],
    })),
  ]
})
