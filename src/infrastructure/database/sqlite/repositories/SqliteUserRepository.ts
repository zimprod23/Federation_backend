import { Database } from "better-sqlite3";
import crypto from "crypto";
import { IUserRepository } from "../../../../domain/interfaces";
import { User } from "../../../../domain/entities/User";
import { UserRole } from "../../../../domain/value-objects";
import { IUserRow } from "../models/types";

export class SqliteUserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  private toDomain(row: IUserRow): User {
    return new User({
      id: row.id,
      email: row.email,
      password: row.password,
      role: row.role as UserRole,
      memberId: row.member_id,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as IUserRow;
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Ensuring case-insensitivity just like the Mongo version
    const row = this.db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase()) as IUserRow;
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const id = user.id || crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, email, password, role, member_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        password = excluded.password,
        role = excluded.role,
        member_id = excluded.member_id,
        is_active = excluded.is_active,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      user.email.toLowerCase(),
      user.password,
      user.role,
      user.memberId || null,
      user.isActive ? 1 : 0,
    );

    const updatedRow = this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as IUserRow;
    return this.toDomain(updatedRow);
  }
}
