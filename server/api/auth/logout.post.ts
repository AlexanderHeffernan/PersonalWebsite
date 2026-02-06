import { deleteSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  deleteSession(event)
  return { success: true }
})
