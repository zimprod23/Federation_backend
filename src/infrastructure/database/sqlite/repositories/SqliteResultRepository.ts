import { Database } from "better-sqlite3";
import crypto from "crypto";
import { IResultRepository } from "../../../../domain/interfaces";
import { Result } from "../../../../domain/entities/Result";

export class SqliteResultRepository implements IResultRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: any): Result {
    return new Result({
      id: row.id,
      competitionId: row.competition_id,
      eventId: row.event_id,
      memberId: row.member_id,
      registrationId: row.registration_id,
      rank: row.rank,
      finalTime: row.final_time,
      splitTime500: row.split_time_500,
      strokeRate: row.stroke_rate,
      heartRate: row.heart_rate,
      watts: row.watts,
      notes: row.notes,
      recordedBy: row.recorded_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findByEventId(eventId: string): Promise<Result[]> {
    // Replicating .sort({ rank: 1 })
    const rows = this.db
      .prepare("SELECT * FROM results WHERE event_id = ? ORDER BY rank ASC")
      .all(eventId) as any[];
    return rows.map((r) => this.toDomain(r));
  }

  async findByMemberAndEvent(
    memberId: string,
    eventId: string,
  ): Promise<Result | null> {
    const row = this.db
      .prepare("SELECT * FROM results WHERE member_id = ? AND event_id = ?")
      .get(memberId, eventId) as any;
    return row ? this.toDomain(row) : null;
  }

  async findByCompetitionId(competitionId: string): Promise<Result[]> {
    // Replicating .sort({ eventId: 1, rank: 1 })
    const rows = this.db
      .prepare(
        `
        SELECT * FROM results 
        WHERE competition_id = ? 
        ORDER BY event_id ASC, rank ASC
      `,
      )
      .all(competitionId) as any[];
    return rows.map((r) => this.toDomain(r));
  }

  async save(result: Result): Promise<Result> {
    const id = result.id || crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO results (
        id, competition_id, event_id, member_id, registration_id,
        rank, final_time, split_time_500, stroke_rate, heart_rate, 
        watts, notes, recorded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        rank = excluded.rank,
        final_time = excluded.final_time,
        split_time_500 = excluded.split_time_500,
        stroke_rate = excluded.stroke_rate,
        heart_rate = excluded.heart_rate,
        watts = excluded.watts,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      result.competitionId,
      result.eventId,
      result.memberId,
      result.registrationId,
      result.rank ?? null,
      result.finalTime ?? null,
      result.splitTime500 ?? null,
      result.strokeRate ?? null,
      result.heartRate ?? null,
      result.watts ?? null,
      result.notes ?? null,
      result.recordedBy,
    );

    const updatedRow = this.db
      .prepare("SELECT * FROM results WHERE id = ?")
      .get(id) as any;
    return this.toDomain(updatedRow);
  }

  async deleteByEventId(eventId: string): Promise<void> {
    this.db.prepare("DELETE FROM results WHERE event_id = ?").run(eventId);
  }
}
