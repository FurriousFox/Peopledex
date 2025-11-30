db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth (
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE IF NOT EXISTS characteristics (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    metadata TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS characteristic_values (
    id INTEGER PRIMARY KEY,
    person_id INTEGER NOT NULL,
    characteristic_id INTEGER NOT NULL,
    value TEXT,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
    FOREIGN KEY (characteristic_id) REFERENCES characteristics(id) ON DELETE CASCADE,
    UNIQUE (person_id, characteristic_id)
);
`);
