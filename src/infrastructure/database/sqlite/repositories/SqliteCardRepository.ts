import { Database } from "better-sqlite3";
import crypto from "crypto";
import { ICardRepository } from "../../../../domain/interfaces";
import { MembershipCard } from "../../../../domain/entities/MembershipCard";

export class SqliteCardRepository implements ICardRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: any): MembershipCard {
    return new MembershipCard({
      id: row.id,
      memberId: row.member_id,
      licenseNumber: row.license_number,
      season: row.season,
      cardNumber: row.card_number,
      pdfUrl: row.pdf_url,
      qrPayload: row.qr_payload,
      isValid: row.is_valid === 1,
      validFrom: row.valid_from ? new Date(row.valid_from) : new Date(),
      validUntil: row.valid_until ? new Date(row.valid_until) : new Date(),
      generatedAt: new Date(row.generated_at),
      downloadedAt: row.downloaded_at
        ? new Date(row.downloaded_at)
        : new Date(),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findByMemberId(
    memberId: string,
    season?: number,
  ): Promise<MembershipCard | null> {
    let sql =
      "SELECT * FROM membership_cards WHERE member_id = ? AND is_valid = 1";
    const params: any[] = [memberId];

    if (season !== undefined) {
      sql += " AND season = ?";
      params.push(season);
    }

    // sort by generated_at DESC as in Mongo findOne with sort
    sql += " ORDER BY generated_at DESC LIMIT 1";

    const row = this.db.prepare(sql).get(...params) as any;
    return row ? this.toDomain(row) : null;
  }

  async findByQrPayload(qrPayload: string): Promise<MembershipCard | null> {
    const row = this.db
      .prepare("SELECT * FROM membership_cards WHERE qr_payload = ?")
      .get(qrPayload) as any;
    return row ? this.toDomain(row) : null;
  }

  async save(card: MembershipCard): Promise<MembershipCard> {
    const id = card.id || crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO membership_cards (
        id, member_id, license_number, season, card_number, pdf_url, 
        qr_payload, is_valid, valid_from, valid_until, generated_at, downloaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        pdf_url = excluded.pdf_url,
        is_valid = excluded.is_valid,
        downloaded_at = excluded.downloaded_at,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      card.memberId,
      card.licenseNumber,
      card.season,
      card.cardNumber,
      card.pdfUrl,
      card.qrPayload,
      card.isValid ? 1 : 0,
      card.validFrom?.toISOString(),
      card.validUntil?.toISOString(),
      (card.generatedAt || new Date()).toISOString(),
      card.downloadedAt?.toISOString(),
    );

    const updatedRow = this.db
      .prepare("SELECT * FROM membership_cards WHERE id = ?")
      .get(id) as any;
    return this.toDomain(updatedRow);
  }

  async invalidatePrevious(memberId: string, season: number): Promise<void> {
    this.db
      .prepare(
        `
      UPDATE membership_cards 
      SET is_valid = 0, updated_at = CURRENT_TIMESTAMP 
      WHERE member_id = ? AND season = ? AND is_valid = 1
    `,
      )
      .run(memberId, season);
  }
}
