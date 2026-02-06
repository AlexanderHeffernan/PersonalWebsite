import db from '../../../utils/db'
import { getUploadsDir } from '../../../utils/uploads'
import fs from 'node:fs'
import path from 'node:path'

interface ImageRow {
  id: number
  url: string
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  // Try project_images first
  let image = db.prepare('SELECT id, url FROM project_images WHERE id = ?').get(id) as ImageRow | undefined
  let table = 'project_images'

  // If not found, try writing_post_images
  if (!image) {
    image = db.prepare('SELECT id, url FROM writing_post_images WHERE id = ?').get(id) as ImageRow | undefined
    table = 'writing_post_images'
  }

  if (!image) {
    throw createError({ statusCode: 404, message: 'Image not found' })
  }

  // Delete file from filesystem
  // Support both old (/uploads/...) and new (/api/uploads/...) URL formats
  const urlPath = image.url.replace(/^\/api\/uploads\//, '').replace(/^\/uploads\//, '')
  if (urlPath !== image.url) {
    const filePath = path.join(getUploadsDir(), urlPath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  // Delete from database
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id)

  return { success: true }
})
