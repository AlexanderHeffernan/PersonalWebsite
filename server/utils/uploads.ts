import { join } from 'path'

/**
 * Returns the base directory for file uploads.
 * In production, uses /app/data/uploads (persisted via Docker volume).
 * In development, uses <project>/data/uploads.
 */
export function getUploadsDir(...subpath: string[]): string {
  const dataDir = process.env.DATA_DIR || (process.env.NODE_ENV === 'production' ? '/app/data' : join(process.cwd(), 'data'))
  return join(dataDir, 'uploads', ...subpath)
}
