import { Database } from "better-sqlite3";
import crypto from "crypto";
import {
  IClubRepository,
  PaginatedResult,
  PaginationParams,
} from "../../../../domain/interfaces";
import { Club } from "../../../../domain/entities/Club";
import { ClubStatus, Discipline } from "../../../../domain/value-objects";
import { IClubRow } from "../models/types";

export class SqliteClubRepository implements IClubRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: IClubRow): Club {
    return new Club({
      id: row.id,
      name: row.name,
      code: row.code,
      clubShort: row.club_short ?? "",
      region: row.region,
      city: row.city,
      status: row.status as ClubStatus,
      // Parse JSON string back into an array of Disciplines
      disciplines: JSON.parse(row.disciplines || "[]") as Discipline[],
      presidentName: row.president_name,
      presidentEmail: row.president_email,
      presidentPhone: row.president_phone,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findById(id: string): Promise<Club | null> {
    const row = this.db
      .prepare("SELECT * FROM clubs WHERE id = ?")
      .get(id) as IClubRow;
    return row ? this.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<Club | null> {
    // Replicating the toUpperCase() logic from Mongo version
    const row = this.db
      .prepare("SELECT * FROM clubs WHERE UPPER(code) = ?")
      .get(code.toUpperCase()) as IClubRow;
    return row ? this.toDomain(row) : null;
  }

  async findAll(pagination: PaginationParams): Promise<PaginatedResult<Club>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Execute count and data fetch
    const countResult = this.db
      .prepare("SELECT COUNT(*) as total FROM clubs")
      .get() as { total: number };
    const rows = this.db
      .prepare("SELECT * FROM clubs ORDER BY name ASC LIMIT ? OFFSET ?")
      .all(limit, offset) as IClubRow[];

    return {
      data: rows.map((row) => this.toDomain(row)),
      total: countResult.total,
      page,
      limit,
    };
  }

  async save(club: Club): Promise<Club> {
    const id = club.id || crypto.randomUUID();

    // Convert array to string for SQLite storage
    const disciplinesJson = JSON.stringify(club.disciplines || []);

    const stmt = this.db.prepare(`
      INSERT INTO clubs (
        id, name, code, club_short, region, city, 
        status, disciplines, president_name, president_email, president_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        code = excluded.code,
        club_short = excluded.club_short,
        region = excluded.region,
        city = excluded.city,
        status = excluded.status,
        disciplines = excluded.disciplines,
        president_name = excluded.president_name,
        president_email = excluded.president_email,
        president_phone = excluded.president_phone,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      club.name,
      club.code,
      club.clubShort,
      club.region,
      club.city,
      club.status,
      disciplinesJson,
      club.presidentName,
      club.presidentEmail,
      club.presidentPhone,
    );

    const updatedRow = this.db
      .prepare("SELECT * FROM clubs WHERE id = ?")
      .get(id) as IClubRow;
    return this.toDomain(updatedRow);
  }
}
