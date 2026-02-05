import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const dbPath = path.join(process.cwd(), 'data', 'app.db');
const migrationsDir = path.join(process.cwd(), 'server', 'db', 'migrations');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

const applied = new Set(
    db.prepare('SELECT name FROM _migrations').all().map((row: any) => row.name)
);

const files = fs.readdirSync(migrationsDir)
    .filter((f: any) => f.endsWith('.sql'))
    .sort();

for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec('BEGIN');
    try {
        db.exec(sql);
        db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
        db.exec('COMMIT');
        console.log(`Applied migration: ${file}`);
    } catch (e) {
        db.exec('ROLLBACK');
        throw e;
    }
}