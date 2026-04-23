import { Database } from "better-sqlite3";
import crypto from "crypto";
import { IEventRepository } from "../../../../domain/interfaces";
import { CompetitionEvent } from "../../../../domain/entities/CompetitionEvent";
import {
  EventDistance,
  EventStatus,
  MemberCategory,
  Gender,
} from "../../../../domain/value-objects";

export class SqliteEventRepository implements IEventRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: any): CompetitionEvent {
    return new CompetitionEvent({
      id: row.id,
      competitionId: row.competition_id,
      distance: row.distance as EventDistance,
      category: row.category as MemberCategory,
      gender: row.gender as Gender,
      status: row.status as EventStatus,
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findById(id: string): Promise<CompetitionEvent | null> {
    const row = this.db
      .prepare("SELECT * FROM competition_events WHERE id = ?")
      .get(id) as any;
    return row ? this.toDomain(row) : null;
  }

  async findByCompetitionId(
    competitionId: string,
  ): Promise<CompetitionEvent[]> {
    // Replicating .sort({ distance: 1, category: 1 })
    const rows = this.db
      .prepare(
        `
        SELECT * FROM competition_events 
        WHERE competition_id = ? 
        ORDER BY distance ASC, category ASC
      `,
      )
      .all(competitionId) as any[];

    return rows.map((r) => this.toDomain(r));
  }

  async findByCompetitionAndFilter(
    competitionId: string,
    distance?: EventDistance,
    category?: MemberCategory,
    gender?: Gender,
  ): Promise<CompetitionEvent[]> {
    let sql = "SELECT * FROM competition_events WHERE competition_id = ?";
    const params: any[] = [competitionId];

    if (distance) {
      sql += " AND distance = ?";
      params.push(distance);
    }
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (gender) {
      sql += " AND gender = ?";
      params.push(gender);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map((r) => this.toDomain(r));
  }

  async save(event: CompetitionEvent): Promise<CompetitionEvent> {
    const id = event.id || crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO competition_events (
        id, competition_id, distance, category, gender, status, scheduled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        distance = excluded.distance,
        category = excluded.category,
        gender = excluded.gender,
        status = excluded.status,
        scheduled_at = excluded.scheduled_at,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      event.competitionId,
      event.distance,
      event.category,
      event.gender,
      event.status,
      event.scheduledAt ? event.scheduledAt.toISOString() : null,
    );

    const updatedRow = this.db
      .prepare("SELECT * FROM competition_events WHERE id = ?")
      .get(id) as any;
    return this.toDomain(updatedRow);
  }

  async delete(id: string): Promise<void> {
    this.db.prepare("DELETE FROM competition_events WHERE id = ?").run(id);
  }
}
