import db from '../../../utils/db'
import { getUploadsDir } from '../../../utils/uploads'
import fs from 'node:fs'
import path from 'node:path'

interface ImageRow {
  url: string
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id)
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  // Get images to delete from filesystem
  const images = db.prepare('SELECT url FROM project_images WHERE project_id = ?').all(id) as ImageRow[]

  // Delete image files
  for (const image of images) {
    // Support both old (/uploads/...) and new (/api/uploads/...) URL formats
    const urlPath = image.url.replace(/^\/api\/uploads\//, '').replace(/^\/uploads\//, '')
    if (urlPath !== image.url) {
      const filePath = path.join(getUploadsDir(), urlPath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
  }

  // Delete from database (cascade will handle project_images)
  db.prepare('DELETE FROM project_images WHERE project_id = ?').run(id)
  db.prepare('DELETE FROM projects WHERE id = ?').run(id)

  return { success: true }
})
