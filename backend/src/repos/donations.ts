import type { DonationAccount } from '../schemas/donations.js';
import { getDb } from '../db/index.js';

interface SqlRow {
  id: number;
  bank_name: string;
  account_holder: string;
  clabe: string;
  account_number: string;
  account_type: string;
  notes: string;
  sort_order: number;
  active: number;
}

function toAccount(row: SqlRow): DonationAccount {
  return {
    id: row.id,
    bankName: row.bank_name,
    accountHolder: row.account_holder,
    clabe: row.clabe,
    accountNumber: row.account_number,
    accountType: row.account_type as 'ahorro' | 'cheques',
    notes: row.notes,
    sortOrder: row.sort_order,
    active: row.active === 1,
  };
}

type CreateInput = Omit<DonationAccount, 'id'>;
type UpdateInput = Partial<Omit<DonationAccount, 'id'>>;

class DonationsRepo {
  async findActive(): Promise<DonationAccount[]> {
    const db = getDb();
    const rows = db
      .prepare(
        'SELECT * FROM donation_accounts WHERE active = 1 ORDER BY sort_order',
      )
      .all() as SqlRow[];
    return rows.map(toAccount);
  }

  async findAll(): Promise<DonationAccount[]> {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM donation_accounts ORDER BY sort_order')
      .all() as SqlRow[];
    return rows.map(toAccount);
  }

  async findById(id: number): Promise<DonationAccount | undefined> {
    const db = getDb();
    const row = db
      .prepare('SELECT * FROM donation_accounts WHERE id = ?')
      .get(id) as SqlRow | undefined;
    return row ? toAccount(row) : undefined;
  }

  async create(input: CreateInput): Promise<DonationAccount> {
    const db = getDb();
    const stmt = db.prepare(
      `INSERT INTO donation_accounts
         (bank_name, account_holder, clabe, account_number, account_type, notes, sort_order, active)
       VALUES (@bankName, @accountHolder, @clabe, @accountNumber, @accountType, @notes, @sortOrder, @active)`,
    );
    const result = stmt.run({
      bankName: input.bankName,
      accountHolder: input.accountHolder,
      clabe: input.clabe,
      accountNumber: input.accountNumber,
      accountType: input.accountType,
      notes: input.notes,
      sortOrder: input.sortOrder,
      active: input.active ? 1 : 0,
    });
    const account = await this.findById(Number(result.lastInsertRowid));
    return account!;
  }

  async update(id: number, input: UpdateInput): Promise<DonationAccount | undefined> {
    const db = getDb();
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };

    if (input.bankName !== undefined) {
      sets.push('bank_name = @bankName');
      params.bankName = input.bankName;
    }
    if (input.accountHolder !== undefined) {
      sets.push('account_holder = @accountHolder');
      params.accountHolder = input.accountHolder;
    }
    if (input.clabe !== undefined) {
      sets.push('clabe = @clabe');
      params.clabe = input.clabe;
    }
    if (input.accountNumber !== undefined) {
      sets.push('account_number = @accountNumber');
      params.accountNumber = input.accountNumber;
    }
    if (input.accountType !== undefined) {
      sets.push('account_type = @accountType');
      params.accountType = input.accountType;
    }
    if (input.notes !== undefined) {
      sets.push('notes = @notes');
      params.notes = input.notes;
    }
    if (input.sortOrder !== undefined) {
      sets.push('sort_order = @sortOrder');
      params.sortOrder = input.sortOrder;
    }
    if (input.active !== undefined) {
      sets.push('active = @active');
      params.active = input.active ? 1 : 0;
    }

    if (sets.length === 0) return this.findById(id);

    sets.push("updated_at = datetime('now')");
    const sql = `UPDATE donation_accounts SET ${sets.join(', ')} WHERE id = @id`;
    const result = db.prepare(sql).run(params);
    if (result.changes === 0) return undefined;
    return this.findById(id);
  }

  async softDelete(id: number): Promise<boolean> {
    const db = getDb();
    const result = db
      .prepare(
        "UPDATE donation_accounts SET active = 0, updated_at = datetime('now') WHERE id = ?",
      )
      .run(id);
    return result.changes > 0;
  }
}

export const donationsRepo = new DonationsRepo();
