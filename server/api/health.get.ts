import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  try {
    // You can add more comprehensive checks here
    // e.g., check database connectivity
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})
