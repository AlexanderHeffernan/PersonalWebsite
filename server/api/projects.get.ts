import db from '../utils/db';

export default defineEventHandler(() => {
    const rows = db.prepare('SELECT id, name, created_at FROM projects ORDER BY id DESC').all();
    return rows;
})