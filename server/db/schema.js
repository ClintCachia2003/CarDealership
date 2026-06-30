const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/dealership.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT    NOT NULL UNIQUE,
      password_hash TEXT  NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cars (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      make         TEXT    NOT NULL,
      model        TEXT    NOT NULL,
      year         INTEGER NOT NULL,
      price        REAL    NOT NULL,
      mileage      INTEGER NOT NULL,
      vin          TEXT    UNIQUE,
      color        TEXT,
      description  TEXT,
      fuel_type    TEXT,
      transmission TEXT,
      status       TEXT    NOT NULL DEFAULT 'available' CHECK(status IN ('available','sold')),
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS car_images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id     INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      filename   TEXT    NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id     INTEGER REFERENCES cars(id) ON DELETE SET NULL,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      phone      TEXT,
      message    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { getDb };
