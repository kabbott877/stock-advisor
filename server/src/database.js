/**
 * SQLite Database Module
 *
 * Uses better-sqlite3 for synchronous, fast queries.
 * Database file: ../data/stock-advisor.db
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'stock-advisor.db');

let db;

/**
 * Initialize database connection and create tables if needed.
 */
function initDatabase() {
  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scan_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      symbol TEXT NOT NULL,
      earnings_date TEXT NOT NULL,
      company_name TEXT,
      move_percent REAL,
      range_percent REAL,
      open_price REAL,
      close_price REAL,
      high_price REAL,
      low_price REAL,
      volume INTEGER,
      atr REAL,
      atr_ratio REAL,
      flagged INTEGER DEFAULT 0,
      guidance_change TEXT,
      one_time_items TEXT,
      fundamental_change INTEGER DEFAULT 0,
      source TEXT,
      filing_accession TEXT,
      scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_scan_results_symbol ON scan_results(symbol);
    CREATE INDEX IF NOT EXISTS idx_scan_results_user ON scan_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_scan_results_date ON scan_results(scanned_at);
  `);

  console.log(`[Database] Connected to ${DB_PATH}`);
  return db;
}

/**
 * Get database instance. Initializes if not already done.
 */
function getDatabase() {
  if (!db) {
    initDatabase();
  }
  return db;
}

/**
 * Close database connection.
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export { initDatabase, getDatabase, closeDatabase };
