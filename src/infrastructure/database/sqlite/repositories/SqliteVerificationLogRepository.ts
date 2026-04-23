import { Database } from "better-sqlite3";
import crypto from "crypto";
import { IVerificationLogRepository } from "../../../../domain/interfaces";
import { VerificationLog } from "../../../../domain/entities/VerificationLog";
import { VerificationResult } from "../../../../domain/value-objects";

export class SqliteVerificationLogRepository implements IVerificationLogRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: any): VerificationLog {
    return new VerificationLog({
      id: row.id,
      memberId: row.member_id,
      scannedBy: row.scanned_by,
      scannedAt: new Date(row.scanned_at),
      location: row.location,
      result: row.result as VerificationResult,
      rawToken: row.raw_token,
      createdAt: new Date(row.created_at),
    });
  }

  async save(log: VerificationLog): Promise<VerificationLog> {
    const id = log.id || crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO verification_logs (
        id, member_id, scanned_by, scanned_at, location, result, raw_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      log.memberId || null,
      log.scannedBy,
      (log.scannedAt || new Date()).toISOString(),
      log.location || null,
      log.result,
      log.rawToken || null,
    );

    // Fetch the newly created log
    const row = this.db
      .prepare("SELECT * FROM verification_logs WHERE id = ?")
      .get(id) as any;
    return this.toDomain(row);
  }

  async findByMemberId(memberId: string): Promise<VerificationLog[]> {
    // Replicating .sort({ scannedAt: -1 })
    const rows = this.db
      .prepare(
        "SELECT * FROM verification_logs WHERE member_id = ? ORDER BY scanned_at DESC",
      )
      .all(memberId) as any[];

    return rows.map((row) => this.toDomain(row));
  }
}
