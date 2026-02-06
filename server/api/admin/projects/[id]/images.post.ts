import db from '../../../../utils/db'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id)
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }

  const file = formData.find(f => f.name === 'image')
  const altText = formData.find(f => f.name === 'alt')?.data.toString() || null

  if (!file || !file.data) {
    throw createError({ statusCode: 400, message: 'No image file provided' })
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!file.type || !allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' })
  }

  // Generate unique filename
  const ext = file.filename?.split('.').pop() || 'jpg'
  const filename = `${id}-${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects')
  const filePath = path.join(uploadDir, filename)

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Write file
  fs.writeFileSync(filePath, file.data)

  // Get current max sort order
  const maxOrder = db.prepare(
    'SELECT COALESCE(MAX(sort_order), -1) as max FROM project_images WHERE project_id = ?'
  ).get(id) as { max: number }

  // Insert into database
  const result = db.prepare(`
    INSERT INTO project_images (project_id, url, alt_text, sort_order)
    VALUES (?, ?, ?, ?)
  `).run(id, `/uploads/projects/${filename}`, altText, maxOrder.max + 1)

  return {
    id: result.lastInsertRowid,
    url: `/uploads/projects/${filename}`,
    alt: altText,
    sortOrder: maxOrder.max + 1,
  }
})
