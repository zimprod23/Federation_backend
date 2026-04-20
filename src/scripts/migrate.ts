import fs from "fs";
import path from "path";
import readline from "readline";
import { connectDatabase, DB } from "../infrastructure/database/connection";
import { getConfig, initConfig } from "../shared/config";

// Helper to safely format dates for SQLite (YYYY-MM-DD)
function formatDate(mongoDate: any): string {
  if (!mongoDate) return "2000-01-01";

  // If it's the Mongo $date object
  const dateStr = mongoDate.$date ? mongoDate.$date : mongoDate;

  try {
    // Ensure we have a string before calling split
    const isoString = new Date(dateStr).toISOString();
    return isoString.split("T")[0];
  } catch (e) {
    return "2000-01-01";
  }
}

async function runMigration() {
  initConfig();
  const cfg = getConfig();

  await connectDatabase(cfg.SQLITE_PATH);
  const db = DB.conn;

  const CLUBS_JSON = path.join(__dirname, "./old/clubs.json");
  const MEMBERS_JSON = path.join(__dirname, "./old/members.json");
  const COUNTER_JSON = path.join(__dirname, "./old/counter.json");

  const insertClub = db.prepare(`
    INSERT INTO clubs (id, name, code, club_short, region, city, status, disciplines, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMember = db.prepare(`
    INSERT INTO members (
      id, license_number, first_name, last_name, first_name_ar, last_name_ar, 
      date_of_birth, gender, position, photo_url, height, arm_span, weight, 
      status, season, club_id, qr_token, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const readLines = async (filePath: string) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return [];
    }
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });
    const lines = [];
    for await (const line of rl) if (line.trim()) lines.push(JSON.parse(line));
    return lines;
  };

  try {
    console.log("🚀 Initializing Migration from MongoDB exports...");

    const clubs = await readLines(CLUBS_JSON);
    const members = await readLines(MEMBERS_JSON);
    const counters = await readLines(COUNTER_JSON);

    const transaction = db.transaction(() => {
      // 1. CLUBS
      clubs.forEach((c) => {
        insertClub.run(
          c._id.$oid,
          c.name,
          c.code,
          c.clubShort,
          c.region,
          c.city,
          c.status,
          JSON.stringify(c.disciplines || []),
          c.createdAt?.$date || new Date().toISOString(),
          c.updatedAt?.$date || new Date().toISOString(),
        );
      });

      // 2. MEMBERS
      members.forEach((m) => {
        insertMember.run(
          m._id.$oid,
          m.licenseNumber,
          m.firstName,
          m.lastName,
          m.firstNameAr || m.firstName,
          m.lastNameAr || m.lastName,
          formatDate(m.date_of_birth || m.dateOfBirth), // Safe date handling
          m.gender?.toLowerCase() || "male",
          m.position || "Athlete",
          m.photoUrl || null,
          m.height || null,
          m.armSpan || null,
          m.weight || null,
          m.status || "active",
          m.season || 2026,
          m.clubId?.$oid || null,
          m.qrToken || null,
          m.createdAt?.$date || new Date().toISOString(),
          m.updatedAt?.$date || new Date().toISOString(),
        );
      });

      // 3. COUNTER
      const memberSeq = counters.find((cnt) => cnt._id === "member_seq_2026");
      if (memberSeq) {
        db.prepare(
          `INSERT OR REPLACE INTO counters (id, seq) VALUES (?, ?)`,
        ).run("member_seq_2026", memberSeq.seq);
      }
    });

    transaction();
    console.log("✅ Migration successful!");
    console.log(
      `📊 Statistics: ${clubs.length} Clubs, ${members.length} Members migrated.`,
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
