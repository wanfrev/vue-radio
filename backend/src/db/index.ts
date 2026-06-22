import Database from 'better-sqlite3';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

let db: Database.Database | undefined;

export function initDb(): Database.Database {
  if (db) return db;

  const dbPath = env.DATABASE_PATH;
  mkdirSync(dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);

  return db;
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialised. Call initDb() first.');
  return db;
}

function runMigrations(database: Database.Database): void {
  const migrationsDir = join(
    dirname(fileURLToPath(import.meta.url)),
    'migrations',
  );

  let files: string[];
  try {
    files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
  } catch {
    console.warn(`[db] No migrations directory found at ${migrationsDir}`);
    return;
  }

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    database.exec(sql);
    console.log(`[db] Migration applied: ${file}`);
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined;
  }
}
