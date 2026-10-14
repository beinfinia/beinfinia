CREATE TABLE IF NOT EXISTS calendar_blocks (
 id TEXT PRIMARY KEY, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL,
 reason TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(julianday(ends_at)>julianday(starts_at))
);
CREATE INDEX IF NOT EXISTS calendar_blocks_range ON calendar_blocks(active,starts_at,ends_at);
CREATE TABLE IF NOT EXISTS email_notifications (
 id TEXT PRIMARY KEY, appointment_id TEXT NOT NULL REFERENCES appointments(id),
 payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pendiente',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER IF NOT EXISTS booking_block_insert BEFORE INSERT ON appointments WHEN NEW.status != 'Cancelada' BEGIN
 SELECT RAISE(ABORT,'BLOCK_CONFLICT') WHERE EXISTS (SELECT 1 FROM calendar_blocks b WHERE b.active=1 AND julianday(b.starts_at)<julianday(NEW.starts_at)+NEW.duration/1440.0 AND julianday(b.ends_at)>julianday(NEW.starts_at));
END;
CREATE TRIGGER IF NOT EXISTS booking_block_update BEFORE UPDATE ON appointments WHEN NEW.status != 'Cancelada' BEGIN
 SELECT RAISE(ABORT,'BLOCK_CONFLICT') WHERE EXISTS (SELECT 1 FROM calendar_blocks b WHERE b.active=1 AND julianday(b.starts_at)<julianday(NEW.starts_at)+NEW.duration/1440.0 AND julianday(b.ends_at)>julianday(NEW.starts_at));
END;
CREATE TRIGGER IF NOT EXISTS block_booking_insert BEFORE INSERT ON calendar_blocks WHEN NEW.active=1 BEGIN
 SELECT RAISE(ABORT,'BLOCK_HAS_APPOINTMENTS') WHERE EXISTS (SELECT 1 FROM appointments a WHERE a.status != 'Cancelada' AND julianday(a.starts_at)<julianday(NEW.ends_at) AND julianday(a.starts_at)+a.duration/1440.0>julianday(NEW.starts_at));
END;
