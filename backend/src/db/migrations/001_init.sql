CREATE TABLE IF NOT EXISTS donation_accounts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  bank_name      TEXT NOT NULL,
  account_holder TEXT NOT NULL DEFAULT '',
  clabe          TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
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

-- Seed default data
INSERT INTO donation_accounts (bank_name, account_holder, clabe, account_number, account_type, notes, sort_order)
SELECT 'Pago Móvil', '04146590118', '', '10453881', 'ahorro', 'Banco: Vzla', 0
WHERE NOT EXISTS (SELECT 1 FROM donation_accounts);

INSERT INTO donation_accounts (bank_name, account_holder, clabe, account_number, account_type, notes, sort_order)
SELECT 'ZELLE', 'vilchezelvis@gmail.com', '', '', 'ahorro', '', 1
WHERE NOT EXISTS (SELECT 1 FROM donation_accounts WHERE id = 2);
