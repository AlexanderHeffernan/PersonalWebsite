import Database from 'better-sqlite3'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const DB_PATH = process.env.DB_PATH || '/app/data/app.db'
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR || '/app/scripts/migrations'

function runMigrations() {
  console.log('Running migrations...')
  
  const db = new Database(DB_PATH)
  
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Get list of executed migrations
  const executedMigrations = db.prepare('SELECT name FROM migrations').all().map((row) => row.name)
  
  // Find and run pending migrations
  try {
    const migrationFiles = readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()
    
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Applying migration: ${file}`)
        const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')
        db.exec(sql)
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file)
        console.log(`✓ Applied: ${file}`)
      }
    }
    
    console.log('Migrations complete')
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No migrations directory found, skipping...')
    } else {
      throw error
    }
  }
  
  db.close()
}

runMigrations()
