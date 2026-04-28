import { Database } from "better-sqlite3";
import crypto from "crypto";
import {
  IMemberRepository,
  MemberFilters,
  PaginatedResult,
  PaginationParams,
} from "../../../../domain/interfaces";
import { Member } from "../../../../domain/entities/Member";
import {
  Gender,
  MemberStatus,
  PositionType,
} from "../../../../domain/value-objects";
import { IMemberRow } from "../models/types";

export class SqliteMemberRepository implements IMemberRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: IMemberRow): Member {
    return new Member({
      id: row.id,
      licenseNumber: row.license_number,
      firstName: row.first_name,
      lastName: row.last_name,
      firstNameAr: row.first_name_ar,
      lastNameAr: row.last_name_ar,
      dateOfBirth: new Date(row.date_of_birth),
      gender: row.gender as Gender,
      email: row.email,
      phone: row.phone,
      photoUrl: row.photo_url,
      height: row.height,
      armSpan: row.arm_span,
      weight: row.weight,
      cin: row.cin,
      position: row.position as PositionType,
      status: row.status as MemberStatus,
      clubId: row.club_id,
      season: row.season,
      qrToken: row.qr_token,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findById(id: string): Promise<Member | null> {
    const row = this.db
      .prepare("SELECT * FROM members WHERE id = ?")
      .get(id) as IMemberRow;
    return row ? this.toDomain(row) : null;
  }

  async findByLicenseNumber(ln: string): Promise<Member | null> {
    const row = this.db
      .prepare("SELECT * FROM members WHERE license_number = ?")
      .get(ln) as IMemberRow;
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Member | null> {
    const row = this.db
      .prepare("SELECT * FROM members WHERE LOWER(email) = ?")
      .get(email.toLowerCase()) as IMemberRow;
    return row ? this.toDomain(row) : null;
  }

  async findByCin(cin: string): Promise<Member | null> {
    const row = this.db
      .prepare("SELECT * FROM members WHERE cin = ?")
      .get(cin) as IMemberRow;
    return row ? this.toDomain(row) : null;
  }

  async findAll(
    pagination: PaginationParams,
    filters: MemberFilters,
  ): Promise<PaginatedResult<Member>> {
    let whereClauses = ["1=1"];
    let params: any[] = [];

    if (filters.status) {
      whereClauses.push("status = ?");
      params.push(filters.status);
    }
    if (filters.gender) {
      whereClauses.push("gender = ?");
      params.push(filters.gender);
    }
    if (filters.clubId) {
      whereClauses.push("club_id = ?");
      params.push(filters.clubId);
    }
    if (filters.season) {
      whereClauses.push("season = ?");
      params.push(filters.season);
    }

    if (filters.search) {
      whereClauses.push(
        "(first_name LIKE ? OR last_name LIKE ? OR license_number LIKE ? OR cin LIKE ?)",
      );
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }

    if (filters.category) {
      const currentYear = new Date().getFullYear();

      let minDate: Date;
      let maxDate: Date;

      switch (filters.category.toLowerCase()) {
        case "u23":
          // Age 18 → 22
          minDate = new Date(currentYear - 22, 0, 1); // youngest
          maxDate = new Date(currentYear - 18, 11, 31); // oldest
          break;

        case "u19":
          // Age 15 → 18
          minDate = new Date(currentYear - 18, 0, 1);
          maxDate = new Date(currentYear - 15, 11, 31);
          break;

        case "u15":
          // Age 12 → 14 (adjust if needed)
          minDate = new Date(currentYear - 14, 0, 1);
          maxDate = new Date(currentYear - 12, 11, 31);
          break;

        case "senior":
          // Age 23+
          minDate = new Date(1900, 0, 1);
          maxDate = new Date(currentYear - 23, 11, 31);
          break;

        default:
          // fallback: no filtering
          minDate = new Date(1900, 0, 1);
          maxDate = new Date(2100, 11, 31);
      }

      whereClauses.push("date_of_birth BETWEEN ? AND ?");
      params.push(minDate.toISOString(), maxDate.toISOString());
    }

    const whereSql = whereClauses.join(" AND ");

    // Count total
    const countRow = this.db
      .prepare(`SELECT COUNT(*) as total FROM members WHERE ${whereSql}`)
      .get(...params) as { total: number };

    // Get paginated data
    const offset = (pagination.page - 1) * pagination.limit;
    const rows = this.db
      .prepare(
        `
      SELECT * FROM members 
      WHERE ${whereSql} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `,
      )
      .all(...params, pagination.limit, offset) as IMemberRow[];

    return {
      data: rows.map((r) => this.toDomain(r)),
      total: countRow.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async nextSequence(year: number): Promise<number> {
    const counterId = `member_seq_${year}`;

    // Initialize if not exists
    this.db
      .prepare("INSERT OR IGNORE INTO counters (id, seq) VALUES (?, 0)")
      .run(counterId);

    // Increment and return
    const row = this.db
      .prepare(
        `
      UPDATE counters SET seq = seq + 1 WHERE id = ? RETURNING seq
    `,
      )
      .get(counterId) as { seq: number };

    return row.seq;
  }

  async save(member: Member): Promise<Member> {
    const id = member.id || crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO members (
        id, license_number, first_name, last_name, first_name_ar, last_name_ar,
        date_of_birth, gender, email, phone, photo_url, height, arm_span,
        weight, position, cin, status, club_id, season, qr_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        license_number = excluded.license_number,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        first_name_ar = excluded.first_name_ar,
        last_name_ar = excluded.last_name_ar,
        date_of_birth = excluded.date_of_birth,
        gender = excluded.gender,
        email = excluded.email,
        phone = excluded.phone,
        photo_url = excluded.photo_url,
        height = excluded.height,
        arm_span = excluded.arm_span,
        weight = excluded.weight,
        position = excluded.position,
        cin = excluded.cin,
        status = excluded.status,
        club_id = excluded.club_id,
        season = excluded.season,
        qr_token = excluded.qr_token,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      member.licenseNumber,
      member.firstName,
      member.lastName,
      member.firstNameAr,
      member.lastNameAr,
      member.dateOfBirth instanceof Date
        ? member.dateOfBirth.toISOString()
        : member.dateOfBirth,
      member.gender,
      member.email,
      member.phone,
      member.photoUrl,
      member.height,
      member.armSpan,
      member.weight,
      member.position,
      member.cin,
      member.status,
      member.clubId,
      member.season,
      member.qrToken,
    );

    const updatedRow = this.db
      .prepare("SELECT * FROM members WHERE id = ?")
      .get(id) as IMemberRow;
    return this.toDomain(updatedRow);
  }

  async delete(id: string): Promise<void> {
    this.db.prepare("DELETE FROM members WHERE id = ?").run(id);
  }
}
