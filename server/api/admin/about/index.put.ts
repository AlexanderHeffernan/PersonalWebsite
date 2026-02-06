import { defineEventHandler, createError, readBody } from 'h3'
import db from '../../../utils/db'

interface AboutContent {
  id: number
  bioParagraphs: string[]
  highlights: string[]
  updatedAt: string
}

interface UpdateAboutBody {
  bioParagraphs: string[]
  highlights: string[]
}

export default defineEventHandler(async (event): Promise<AboutContent> => {
  const body = await readBody<UpdateAboutBody>(event)

  if (!Array.isArray(body.bioParagraphs) || !Array.isArray(body.highlights)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
    })
  }

  // Filter out empty strings
  const bioParagraphs = body.bioParagraphs.filter(p => p.trim())
  const highlights = body.highlights.filter(h => h.trim())

  const stmt = db.prepare(`
    UPDATE about_content
    SET bio_paragraphs = ?, highlights = ?, updated_at = datetime('now')
    WHERE id = 1
    RETURNING *
  `)

  const row: any = stmt.get(JSON.stringify(bioParagraphs), JSON.stringify(highlights))

  return {
    id: row.id,
    bioParagraphs: JSON.parse(row.bio_paragraphs),
    highlights: JSON.parse(row.highlights),
    updatedAt: row.updated_at,
  }
})
