import { createError, setHeader, sendStream } from 'h3'
import { extname } from 'path'
import { createReadStream, existsSync } from 'fs'
import { getUploadsDir } from '../../utils/uploads'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

export default defineEventHandler(async (event) => {
  const pathParam = getRouterParam(event, 'path')

  if (!pathParam) {
    throw createError({ statusCode: 400, statusMessage: 'Missing path' })
  }

  // Prevent directory traversal
  if (pathParam.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  const filePath = getUploadsDir(pathParam)
  const ext = extname(filePath).toLowerCase()
  const mime = MIME_TYPES[ext]

  if (!mime) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported file type' })
  }

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  setHeader(event, 'Content-Type', mime)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return sendStream(event, createReadStream(filePath))
})
