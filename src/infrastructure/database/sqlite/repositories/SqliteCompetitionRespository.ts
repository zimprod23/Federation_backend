import { Database } from "better-sqlite3";
import crypto from "crypto";
import {
  ICompetitionRepository,
  CompetitionFilters,
  PaginatedResult,
  PaginationParams,
} from "../../../../domain/interfaces";
import { Competition } from "../../../../domain/entities/Competition";
import {
  CompetitionType,
  CompetitionStatus,
} from "../../../../domain/value-objects";
import { ICompetitionRow } from "../models/types";

export class SqliteCompetitionRepository implements ICompetitionRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: ICompetitionRow): Competition {
    return new Competition({
      id: row.id,
      name: row.name,
      type: row.type as CompetitionType,
      status: row.status as CompetitionStatus,
      location: row.location,
      city: row.city,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      season: row.season,
      description: row.description,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findById(id: string): Promise<Competition | null> {
    const row = this.db
      .prepare("SELECT * FROM competitions WHERE id = ?")
      .get(id) as ICompetitionRow;
    return row ? this.toDomain(row) : null;
  }

  async findAll(
    pagination: PaginationParams,
    filters: CompetitionFilters,
  ): Promise<PaginatedResult<Competition>> {
    let whereClauses = ["1=1"];
    let params: any[] = [];

    if (filters.status) {
      whereClauses.push("status = ?");
      params.push(filters.status);
    }
    if (filters.season) {
      whereClauses.push("season = ?");
      params.push(filters.season);
    }
    if (filters.type) {
      whereClauses.push("type = ?");
      params.push(filters.type);
    }

    const whereSql = whereClauses.join(" AND ");

    // Count total matches
    const countResult = this.db
      .prepare(`SELECT COUNT(*) as total FROM competitions WHERE ${whereSql}`)
      .get(...params) as { total: number };

    // Fetch paginated rows
    const offset = (pagination.page - 1) * pagination.limit;
    const rows = this.db
      .prepare(
        `SELECT * FROM competitions 
         WHERE ${whereSql} 
         ORDER BY start_date DESC 
         LIMIT ? OFFSET ?`,
      )
      .all(...params, pagination.limit, offset) as ICompetitionRow[];

    return {
      data: rows.map((r) => this.toDomain(r)),
      total: countResult.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async save(competition: Competition): Promise<Competition> {
    const id = competition.id || crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO competitions (
        id, name, type, status, location, city, 
        start_date, end_date, season, description, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        type = excluded.type,
        status = excluded.status,
        location = excluded.location,
        city = excluded.city,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        season = excluded.season,
        description = excluded.description,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      competition.name,
      competition.type,
      competition.status,
      competition.location,
      competition.city,
      competition.startDate.toISOString(),
      competition.endDate.toISOString(),
      competition.season,
      competition.description || null,
      competition.createdBy,
    );

    const updatedRow = this.db
      .prepare("SELECT * FROM competitions WHERE id = ?")
      .get(id) as ICompetitionRow;
    return this.toDomain(updatedRow);
  }

  async delete(id: string): Promise<void> {
    this.db.prepare("DELETE FROM competitions WHERE id = ?").run(id);
  }
}
