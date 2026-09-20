import Database from 'better-sqlite3';
import { initializeSchema } from './schema.js';

let _db: Database.Database | null = null;

export function getDatabase(dbPath?: string): Database.Database {
  if (_db) return _db;
  const resolvedPath = dbPath ?? process.env.DESIGNOS_DB_PATH ?? '.designos/designos.db';
  _db = new Database(resolvedPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initializeSchema(_db);
  return _db;
}

export function closeDatabase(): void {
  if (_db) { _db.close(); _db = null; }
}
