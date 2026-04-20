-- -- ─── 1. SEQUENCES (REPLACES COUNTERMODEL) ────────────────────────────────────
-- CREATE TABLE counters (
--     id TEXT PRIMARY KEY, -- e.g., 'member_seq_2026'
--     seq INTEGER DEFAULT 0
-- );

-- -- ─── 2. CLUBS ────────────────────────────────────────────────────────────────
-- CREATE TABLE clubs (
--     id TEXT PRIMARY KEY,
--     name TEXT NOT NULL,
--     code TEXT UNIQUE NOT NULL,
--     club_short TEXT NOT NULL,
--     region TEXT NOT NULL,
--     city TEXT NOT NULL,
--     status TEXT NOT NULL,
--     disciplines TEXT, -- JSON Array string
--     president_name TEXT,
--     president_email TEXT,
--     president_phone TEXT,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );
-- CREATE INDEX idx_clubs_status ON clubs(status);
-- CREATE INDEX idx_clubs_region ON clubs(region);

-- -- ─── 3. MEMBERS ──────────────────────────────────────────────────────────────
-- CREATE TABLE members (
--     id TEXT PRIMARY KEY,
--     license_number TEXT UNIQUE NOT NULL,
--     first_name TEXT NOT NULL,
--     last_name TEXT NOT NULL,
--     first_name_ar TEXT NOT NULL,
--     last_name_ar TEXT NOT NULL,
--     date_of_birth DATETIME NOT NULL,
--     gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
--     position TEXT,
--     email TEXT,
--     phone TEXT,
--     photo_url TEXT,
--     cin TEXT,
--     height REAL,
--     arm_span REAL,
--     weight REAL,
--     status TEXT NOT NULL,
--     club_id TEXT,
--     season INTEGER NOT NULL,
--     qr_token TEXT,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
-- );

-- -- Replication of Mongo's partialFilterExpression (Unique if not null)
-- CREATE UNIQUE INDEX idx_members_cin_unique ON members(cin) WHERE cin IS NOT NULL;
-- CREATE UNIQUE INDEX idx_members_email_unique ON members(email) WHERE email IS NOT NULL;

-- CREATE INDEX idx_members_status ON members(status);
-- CREATE INDEX idx_members_season ON members(season);
-- CREATE INDEX idx_members_club_id ON members(club_id);
-- CREATE INDEX idx_members_gender ON members(gender);

-- -- ─── 4. USERS ────────────────────────────────────────────────────────────────
-- CREATE TABLE users (
--     id TEXT PRIMARY KEY,
--     email TEXT UNIQUE NOT NULL,
--     password TEXT NOT NULL,
--     role TEXT NOT NULL,
--     member_id TEXT,
--     is_active INTEGER DEFAULT 1, -- Boolean 0/1
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
-- );
-- CREATE INDEX idx_users_role ON users(role);

-- -- ─── 5. MEMBERSHIP CARDS ─────────────────────────────────────────────────────
-- CREATE TABLE membership_cards (
--     id TEXT PRIMARY KEY,
--     member_id TEXT NOT NULL,
--     license_number TEXT NOT NULL,
--     season INTEGER NOT NULL,
--     card_number TEXT UNIQUE NOT NULL,
--     pdf_url TEXT,
--     qr_payload TEXT UNIQUE NOT NULL,
--     is_valid INTEGER DEFAULT 1,
--     qr_data_url TEXT,
--     valid_from DATETIME NOT NULL,
--     valid_until DATETIME NOT NULL,
--     generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     downloaded_at DATETIME,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
-- );
-- CREATE INDEX idx_cards_member_season ON membership_cards(member_id, season);
-- CREATE INDEX idx_cards_qr_payload ON membership_cards(qr_payload);
-- CREATE INDEX idx_cards_valid_until ON membership_cards(valid_until);

-- -- ─── 6. COMPETITIONS & EVENTS ────────────────────────────────────────────────
-- CREATE TABLE competitions (
--     id TEXT PRIMARY KEY,
--     name TEXT NOT NULL,
--     type TEXT NOT NULL,
--     status TEXT NOT NULL,
--     location TEXT NOT NULL,
--     city TEXT NOT NULL,
--     start_date DATETIME NOT NULL,
--     end_date DATETIME NOT NULL,
--     season INTEGER NOT NULL,
--     description TEXT,
--     created_by TEXT NOT NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );
-- CREATE INDEX idx_competitions_status ON competitions(status);
-- CREATE INDEX idx_competitions_season ON competitions(season);
-- CREATE INDEX idx_competitions_start_date ON competitions(start_date DESC);

-- CREATE TABLE competition_events (
--     id TEXT PRIMARY KEY,
--     competition_id TEXT NOT NULL,
--     distance TEXT NOT NULL,
--     category TEXT NOT NULL,
--     gender TEXT NOT NULL,
--     status TEXT NOT NULL,
--     scheduled_at DATETIME,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
-- );
-- CREATE INDEX idx_events_lookup ON competition_events(competition_id, distance, category, gender);

-- -- ─── 7. REGISTRATIONS & RESULTS ──────────────────────────────────────────────
-- CREATE TABLE registrations (
--     id TEXT PRIMARY KEY,
--     competition_id TEXT NOT NULL,
--     event_id TEXT NOT NULL,
--     member_id TEXT NOT NULL,
--     club_id TEXT,
--     status TEXT NOT NULL,
--     lane INTEGER,
--     bib INTEGER,
--     registered_by TEXT NOT NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (event_id) REFERENCES competition_events(id) ON DELETE CASCADE,
--     UNIQUE(member_id, event_id)
-- );
-- CREATE INDEX idx_registrations_event ON registrations(event_id);
-- CREATE INDEX idx_registrations_member ON registrations(member_id);

-- CREATE TABLE results (
--     id TEXT PRIMARY KEY,
--     competition_id TEXT NOT NULL,
--     event_id TEXT NOT NULL,
--     member_id TEXT NOT NULL,
--     registration_id TEXT NOT NULL,
--     rank INTEGER,
--     final_time TEXT,
--     split_time_500 TEXT,
--     stroke_rate REAL,
--     heart_rate REAL,
--     watts REAL,
--     notes TEXT,
--     recorded_by TEXT NOT NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
--     UNIQUE(member_id, event_id)
-- );
-- CREATE INDEX idx_results_event_rank ON results(event_id, rank);

-- -- ─── 8. VERIFICATION LOGS ────────────────────────────────────────────────────
-- CREATE TABLE verification_logs (
--     id TEXT PRIMARY KEY,
--     member_id TEXT,
--     scanned_by TEXT NOT NULL,
--     scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     location TEXT,
--     result TEXT NOT NULL,
--     raw_token TEXT NOT NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
-- );
-- CREATE INDEX idx_logs_member ON verification_logs(member_id);
-- CREATE INDEX idx_logs_date ON verification_logs(scanned_at DESC);



-- ─── 1. SEQUENCES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS counters (
    id TEXT PRIMARY KEY,
    seq INTEGER DEFAULT 0
);

-- ─── 2. CLUBS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    club_short TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    status TEXT NOT NULL,
    disciplines TEXT, -- JSON Array string
    president_name TEXT,
    president_email TEXT,
    president_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON clubs(status);
CREATE INDEX IF NOT EXISTS idx_clubs_region ON clubs(region);

-- ─── 3. MEMBERS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    license_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    first_name_ar TEXT NOT NULL,
    last_name_ar TEXT NOT NULL,
    date_of_birth DATETIME NOT NULL,
    gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
    position TEXT,
    email TEXT COLLATE NOCASE, -- Case-insensitive search
    phone TEXT,
    photo_url TEXT,
    cin TEXT,
    height REAL,
    arm_span REAL,
    weight REAL,
    status TEXT NOT NULL,
    club_id TEXT,
    season INTEGER NOT NULL,
    qr_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_cin_unique ON members(cin) WHERE cin IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email_unique ON members(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_season ON members(season);
CREATE INDEX IF NOT EXISTS idx_members_club_id ON members(club_id);

-- ─── 4. USERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE, 
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    member_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- AUTOMATIC UPDATED_AT TRIGGER FOR USERS
CREATE TRIGGER IF NOT EXISTS tr_users_updated_at 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ─── 5. MEMBERSHIP CARDS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_cards (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    license_number TEXT NOT NULL,
    season INTEGER NOT NULL,
    card_number TEXT UNIQUE NOT NULL,
    pdf_url TEXT,
    qr_payload TEXT UNIQUE NOT NULL,
    is_valid INTEGER DEFAULT 1,
    qr_data_url TEXT,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    downloaded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cards_member_season ON membership_cards(member_id, season);
CREATE INDEX IF NOT EXISTS idx_cards_qr_payload ON membership_cards(qr_payload);

-- ─── 6. COMPETITIONS & EVENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    season INTEGER NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competition_events (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    distance TEXT NOT NULL,
    category TEXT NOT NULL,
    gender TEXT NOT NULL,
    status TEXT NOT NULL,
    scheduled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_events_lookup ON competition_events(competition_id, distance, category, gender);

-- ─── 7. REGISTRATIONS & RESULTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    club_id TEXT,
    status TEXT NOT NULL,
    lane INTEGER,
    bib INTEGER,
    registered_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES competition_events(id) ON DELETE CASCADE,
    UNIQUE(member_id, event_id)
);

CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    registration_id TEXT NOT NULL,
    rank INTEGER,
    final_time TEXT,
    split_time_500 TEXT,
    stroke_rate REAL,
    heart_rate REAL,
    watts REAL,
    notes TEXT,
    recorded_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    UNIQUE(member_id, event_id)
);
CREATE INDEX IF NOT EXISTS idx_results_event_rank ON results(event_id, rank);

-- ─── 8. VERIFICATION LOGS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_logs (
    id TEXT PRIMARY KEY,
    member_id TEXT,
    scanned_by TEXT NOT NULL,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    location TEXT,
    result TEXT NOT NULL,
    raw_token TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_logs_date ON verification_logs(scanned_at DESC);