import { createError, readMultipartFormData, getRouterParam } from 'h3'
import db from '../../../../utils/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const postId = parseInt(getRouterParam(event, 'id') || '')
  
  if (isNaN(postId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid post ID',
    })
  }

  // Check if post exists
  const post = db.prepare('SELECT id FROM writing_posts WHERE id = ?').get(postId)
  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No image file provided',
    })
  }

  const imageFile = formData.find(f => f.name === 'image')
  const altText = formData.find(f => f.name === 'alt')?.data.toString() || ''

  if (!imageFile || !imageFile.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No image file provided',
    })
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(imageFile.type || '')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
    })
  }

  // Generate unique filename
  const ext = imageFile.filename.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${randomUUID()}.${ext}`
  
  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'writing')
  await mkdir(uploadsDir, { recursive: true })
  
  // Save file
  const filePath = join(uploadsDir, filename)
  await writeFile(filePath, imageFile.data)
  
  // Get next sort order
  const maxOrder: any = db.prepare('SELECT MAX(sort_order) as max_order FROM writing_post_images WHERE post_id = ?').get(postId)
  const sortOrder = (maxOrder?.max_order || 0) + 1
  
  // Save to database
  const stmt = db.prepare(`
    INSERT INTO writing_post_images (post_id, url, alt_text, sort_order)
    VALUES (?, ?, ?, ?)
    RETURNING *
  `)

  const row: any = stmt.get(postId, `/uploads/writing/${filename}`, altText, sortOrder)

  return {
    id: row.id,
    url: row.url,
    alt: row.alt_text,
    sortOrder: row.sort_order,
  }
})
