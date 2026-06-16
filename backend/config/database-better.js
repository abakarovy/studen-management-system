import Database from 'better-sqlite3';

export function createBetterSqliteAdapter(dbPath) {
  const instance = new Database(dbPath);
  instance.pragma('foreign_keys = ON');
  return instance;
}
