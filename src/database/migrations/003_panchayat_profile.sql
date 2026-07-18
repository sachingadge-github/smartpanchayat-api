USE smart_panchayat;

-- ─────────────────────────────────────────────
-- PANCHAYAT PROFILE  (one row per panchayat)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS panchayat_profiles (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  panchayat_id        INT UNSIGNED NOT NULL UNIQUE,

  -- About the village
  about               TEXT,
  history             TEXT,
  vision              TEXT,
  established_year    YEAR,
  area_sq_km          DECIMAL(8,2),
  total_households    INT UNSIGNED,
  literacy_rate       DECIMAL(5,2),        -- percentage e.g. 78.50
  main_occupation     VARCHAR(200),        -- e.g. "Farming, Sugarcane"
  languages_spoken    VARCHAR(200),        -- e.g. "Marathi, Hindi"

  -- Visuals
  cover_photo_url     VARCHAR(500),
  village_map_url     VARCHAR(500),

  -- Location & contact
  pincode             VARCHAR(10),
  latitude            DECIMAL(10,8),
  longitude           DECIMAL(11,8),
  contact_phone       VARCHAR(20),
  contact_email       VARCHAR(150),
  office_address      TEXT,
  office_hours        VARCHAR(100),        -- e.g. "Mon–Sat 10am–5pm"

  -- Social / digital
  website_url         VARCHAR(500),
  facebook_url        VARCHAR(500),
  whatsapp_number     VARCHAR(20),

  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- PANCHAYAT STAFF  (sarpanch + team members)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS panchayat_staff (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  panchayat_id    INT UNSIGNED NOT NULL,

  name            VARCHAR(100) NOT NULL,
  designation     VARCHAR(100) NOT NULL,   -- e.g. "Sarpanch", "Upa-Sarpanch", "Gram Sevak"
  role_type       ENUM('sarpanch','upa_sarpanch','gram_sevak','ward_member','secretary','other') DEFAULT 'other',
  ward_no         TINYINT UNSIGNED,        -- for ward members
  photo_url       VARCHAR(500),
  phone           VARCHAR(20),
  email           VARCHAR(150),
  education       VARCHAR(200),
  since_year      YEAR,                    -- year they took this role
  party           VARCHAR(100),            -- political party (optional)
  bio             TEXT,
  is_active       TINYINT(1) DEFAULT 1,
  display_order   TINYINT UNSIGNED DEFAULT 99,

  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

-- Seed: profile for Nerle GP (id=1)
INSERT IGNORE INTO panchayat_profiles
  (panchayat_id, about, history, vision, established_year, area_sq_km,
   total_households, literacy_rate, main_occupation, languages_spoken,
   pincode, office_hours, office_address)
VALUES
  (1,
   'Nerle is a scenic village in Valva taluka known for its sugarcane farming and rich cultural heritage.',
   'Nerle Gram Panchayat was established post-independence as part of Maharashtra''s rural self-governance initiative.',
   'A digitally empowered, self-sufficient village with 100% literacy and clean water for every household.',
   1952, 12.50, 310, 78.50,
   'Farming, Sugarcane, Dairy',
   'Marathi, Hindi',
   '415414',
   'Mon–Sat 10:00 AM – 5:00 PM',
   'Panchayat Bhavan, Nerle, Taluka Valva, Dist. Sangli – 415414');

-- Seed: sarpanch & staff for Nerle GP (id=1)
INSERT IGNORE INTO panchayat_staff
  (panchayat_id, name, designation, role_type, display_order, since_year)
VALUES
  (1, 'Rajan Patil',    'Sarpanch',      'sarpanch',      1, 2022),
  (1, 'Sunita More',    'Upa-Sarpanch',  'upa_sarpanch',  2, 2022),
  (1, 'Vijay Kadam',    'Gram Sevak',    'gram_sevak',     3, 2020),
  (1, 'Meena Jadhav',   'Ward Member 1', 'ward_member',   4, 2022),
  (1, 'Arun Shinde',    'Ward Member 2', 'ward_member',   5, 2022);
