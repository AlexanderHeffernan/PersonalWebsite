import { defineEventHandler, readBody, createError } from 'h3'
import db from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  if (!body.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, email, and message are required',
    })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address',
    })
  }

  // Insert submission
  const stmt = db.prepare(`
    INSERT INTO contact_submissions (name, email, message)
    VALUES (?, ?, ?)
  `)

  try {
    const result = stmt.run(body.name, body.email, body.message)
    
    return {
      success: true,
      id: result.lastInsertRowid,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save contact submission',
    })
  }
})
