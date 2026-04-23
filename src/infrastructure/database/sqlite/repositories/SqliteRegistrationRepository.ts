import { Database } from "better-sqlite3";
import crypto from "crypto";
import { IRegistrationRepository } from "../../../../domain/interfaces";
import {
  Registration,
  RegistrationStatus,
} from "../../../../domain/entities/Registration";

export class SqliteRegistrationRepository implements IRegistrationRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: any): Registration {
    return new Registration({
      id: row.id,
      competitionId: row.competition_id,
      eventId: row.event_id,
      memberId: row.member_id,
      clubId: row.club_id,
      status: row.status as RegistrationStatus,
      lane: row.lane,
      bib: row.bib,
      registeredBy: row.registered_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findById(id: string): Promise<Registration | null> {
    const row = this.db
      .prepare("SELECT * FROM registrations WHERE id = ?")
      .get(id) as any;
    return row ? this.toDomain(row) : null;
  }

  // async findByEventId(eventId: string): Promise<Registration[]> {
  //   const rows = this.db
  //     .prepare("SELECT * FROM registrations WHERE event_id = ?")
  //     .all(eventId) as any[];
  //   return rows.map((r) => this.toDomain(r));
  // }
  async findByEventId(eventId: string): Promise<any[]> {
    const rows = this.db
      .prepare(
        `
      SELECT
        r.*,
        m.first_name || ' ' || m.last_name as memberFullName,
        m.license_number as memberLicenseNumber
      FROM registrations r
      JOIN members m ON r.member_id = m.id
      WHERE r.event_id = ?
    `,
      )
      .all(eventId) as any[];

    // Note: If you want to keep using this.toDomain(r),
    // you must ensure your Registration entity/class can hold these new fields.
    // Otherwise, return the raw objects or a DTO.
    return rows.map((r) => ({
      ...this.toDomain(r),
      memberFullName: r.memberFullName,
      memberLicenseNumber: r.memberLicenseNumber,
    }));
  }
  async findByMemberId(memberId: string): Promise<Registration[]> {
    const rows = this.db
      .prepare("SELECT * FROM registrations WHERE member_id = ?")
      .all(memberId) as any[];
    return rows.map((r) => this.toDomain(r));
  }

  async findByMemberAndEvent(
    memberId: string,
    eventId: string,
  ): Promise<Registration | null> {
    const row = this.db
      .prepare(
        "SELECT * FROM registrations WHERE member_id = ? AND event_id = ?",
      )
      .get(memberId, eventId) as any;
    return row ? this.toDomain(row) : null;
  }

  async findByMemberAndCompetition(
    memberId: string,
    competitionId: string,
  ): Promise<Registration[]> {
    const rows = this.db
      .prepare(
        "SELECT * FROM registrations WHERE member_id = ? AND competition_id = ?",
      )
      .all(memberId, competitionId) as any[];
    return rows.map((r) => this.toDomain(r));
  }

  async save(registration: Registration): Promise<Registration> {
    const id = registration.id || crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO registrations (
        id, competition_id, event_id, member_id, club_id, 
        status, lane, bib, registered_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        lane = excluded.lane,
        bib = excluded.bib,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      registration.competitionId,
      registration.eventId,
      registration.memberId,
      registration.clubId || null,
      registration.status,
      registration.lane ?? null,
      registration.bib ?? null,
      registration.registeredBy,
    );

    const updatedRow = this.db
      .prepare("SELECT * FROM registrations WHERE id = ?")
      .get(id) as any;
    return this.toDomain(updatedRow);
  }

  async deleteByEventId(eventId: string): Promise<void> {
    this.db
      .prepare("DELETE FROM registrations WHERE event_id = ?")
      .run(eventId);
  }
}
