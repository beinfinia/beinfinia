PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', service TEXT NOT NULL DEFAULT '', stage TEXT NOT NULL DEFAULT 'Nuevo', source TEXT NOT NULL DEFAULT 'Manual', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS appointments (id TEXT PRIMARY KEY, contact_id TEXT NOT NULL REFERENCES contacts(id), starts_at TEXT NOT NULL, duration INTEGER NOT NULL DEFAULT 30, status TEXT NOT NULL DEFAULT 'Agendada', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_slot ON appointments(starts_at) WHERE status != 'Cancelada';
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, due_date TEXT NOT NULL DEFAULT '', done INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
INSERT OR IGNORE INTO settings VALUES(1, '{"days":[1,2,3,4,5],"start":9,"end":17,"duration":30,"timezone":"America/Managua"}');

CREATE TRIGGER IF NOT EXISTS prevent_overlap_insert BEFORE INSERT ON appointments WHEN NEW.status != 'Cancelada' BEGIN
 SELECT RAISE(ABORT, 'SLOT_CONFLICT') WHERE EXISTS (SELECT 1 FROM appointments a WHERE a.status != 'Cancelada' AND julianday(a.starts_at)<julianday(NEW.starts_at)+NEW.duration/1440.0 AND julianday(a.starts_at)+a.duration/1440.0>julianday(NEW.starts_at));
END;
CREATE TRIGGER IF NOT EXISTS prevent_overlap_update BEFORE UPDATE ON appointments WHEN NEW.status != 'Cancelada' BEGIN
 SELECT RAISE(ABORT, 'SLOT_CONFLICT') WHERE EXISTS (SELECT 1 FROM appointments a WHERE a.id != NEW.id AND a.status != 'Cancelada' AND julianday(a.starts_at)<julianday(NEW.starts_at)+NEW.duration/1440.0 AND julianday(a.starts_at)+a.duration/1440.0>julianday(NEW.starts_at));
END;
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 1);
