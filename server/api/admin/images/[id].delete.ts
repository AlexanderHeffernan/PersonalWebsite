import db from '../../../utils/db'
import fs from 'node:fs'
import path from 'node:path'

interface ImageRow {
  id: number
  url: string
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  const image = db.prepare('SELECT id, url FROM project_images WHERE id = ?').get(id) as ImageRow | undefined
  if (!image) {
    throw createError({ statusCode: 404, message: 'Image not found' })
  }

  // Delete file from filesystem
  if (image.url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', image.url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  // Delete from database
  db.prepare('DELETE FROM project_images WHERE id = ?').run(id)

  return { success: true }
})
