import { defineEventHandler, createError } from 'h3'
import db from '../../utils/db'

export interface AboutContent {
  id: number
  bioParagraphs: string[]
  highlights: string[]
  updatedAt: string
}

export default defineEventHandler((): AboutContent => {
  const row: any = db.prepare('SELECT * FROM about_content WHERE id = 1').get()

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'About content not found',
    })
  }

  return {
    id: row.id,
    bioParagraphs: JSON.parse(row.bio_paragraphs),
    highlights: JSON.parse(row.highlights),
    updatedAt: row.updated_at,
  }
})
