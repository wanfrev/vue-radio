CREATE TABLE IF NOT EXISTS donation_accounts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  bank_name      TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  clabe          TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type   TEXT NOT NULL DEFAULT 'ahorro',
  notes          TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  active         INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS station_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default accounts if table is empty
INSERT INTO donation_accounts (bank_name, account_holder, clabe, account_number, account_type, notes, sort_order)
SELECT 'BBVA', 'Nombre del titular', '012345678901234567', '1234567890', 'ahorro', 'Cuenta principal', 0
WHERE NOT EXISTS (SELECT 1 FROM donation_accounts);

INSERT INTO donation_accounts (bank_name, account_holder, clabe, account_number, account_type, notes, sort_order)
SELECT 'Santander', 'Nombre del titular', '098765432109876543', '0987654321', 'cheques', 'Cuenta secundaria', 1
WHERE NOT EXISTS (SELECT 1 FROM donation_accounts WHERE id = 2);
