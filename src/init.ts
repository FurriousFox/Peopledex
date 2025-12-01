db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth (
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY NOT NULL,
    expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE IF NOT EXISTS characteristics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    exclusive BOOLEAN NOT NULL DEFAULT 0,
    metadata TEXT NOT NULL DEFAULT '{}',
    system BOOLEAN NOT NULL DEFAULT 0,
    "default" BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS characteristic_values (
    id INTEGER PRIMARY KEY,
    person_id INTEGER NOT NULL,
    characteristic_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
    FOREIGN KEY (characteristic_id) REFERENCES characteristics(id) ON DELETE CASCADE
);
`);
