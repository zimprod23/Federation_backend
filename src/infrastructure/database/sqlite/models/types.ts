// infrastructure/persistence/sqlite/models/types.ts

export interface IClubRow {
  id: string;
  name: string;
  code: string;
  club_short: string;
  region: string;
  city: string;
  status: string;
  disciplines: string; // JSON.stringify(Discipline[])
  president_name?: string;
  president_email?: string;
  president_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface IMemberRow {
  id: string;
  license_number: string;
  first_name: string;
  last_name: string;
  first_name_ar: string;
  last_name_ar: string;
  date_of_birth: string;
  gender: string;
  position?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  cin?: string;
  height?: number;
  arm_span?: number;
  weight?: number;
  status: string;
  club_id?: string;
  season: number;
  qr_token?: string;
  created_at: string;
  updated_at: string;
}

export interface ICompetitionRow {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  city: string;
  start_date: string;
  end_date: string;
  season: number;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IRegistrationRow {
  id: string;
  competition_id: string;
  event_id: string;
  member_id: string;
  club_id?: string;
  status: string;
  lane?: number;
  bib?: number;
  registered_by: string;
  created_at: string;
  updated_at: string;
}

// infrastructure/persistence/sqlite/models/types.ts (Continued)

export interface ICompetitionRow {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  city: string;
  start_date: string; // SQLite stores as ISO string
  end_date: string;
  season: number;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ICompetitionEventRow {
  id: string;
  competition_id: string;
  distance: string;
  category: string;
  gender: string;
  status: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IUserRow {
  id: string;
  email: string;
  password: string;
  role: string;
  member_id?: string;
  is_active: number; // SQLite uses 0 or 1 for booleans
  created_at: string;
  updated_at: string;
}

export interface IVerificationLogRow {
  id: string;
  member_id?: string;
  scanned_by: string;
  scanned_at: string;
  location?: string;
  result: string;
  raw_token: string;
  created_at: string;
  updated_at: string;
}

export interface ICounterRow {
  id: string; // e.g., "member_seq_2026"
  seq: number;
}
