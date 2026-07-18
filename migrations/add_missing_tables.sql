-- Migration: add tables required for APIs 1-22
-- Run once on the production DB after deploying this release.
-- Safe to re-run (uses IF NOT EXISTS / IF NOT EXISTS column guards).

-- ── Gram Sabha ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gram_sabha_meetings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  panchayat_id INT NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  date         DATE NOT NULL,
  time         TIME,
  venue        VARCHAR(500),
  agenda       JSON,
  status       ENUM('upcoming','completed') DEFAULT 'upcoming',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gsm_panchayat (panchayat_id),
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gram_sabha_attendance (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id INT NOT NULL,
  citizen_id INT NOT NULL,
  attending  TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_attendance (meeting_id, citizen_id),
  FOREIGN KEY (meeting_id) REFERENCES gram_sabha_meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gram_sabha_polls (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  panchayat_id INT NOT NULL,
  question     VARCHAR(500) NOT NULL,
  deadline     DATE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_gsp_panchayat (panchayat_id),
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gram_sabha_poll_options (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  poll_id INT NOT NULL,
  text    VARCHAR(500) NOT NULL,
  votes   INT DEFAULT 0,
  FOREIGN KEY (poll_id) REFERENCES gram_sabha_polls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gram_sabha_votes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  poll_id    INT NOT NULL,
  option_id  INT NOT NULL,
  citizen_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_vote (poll_id, citizen_id),
  FOREIGN KEY (poll_id)    REFERENCES gram_sabha_polls(id)        ON DELETE CASCADE,
  FOREIGN KEY (option_id)  REFERENCES gram_sabha_poll_options(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id)                ON DELETE CASCADE
);

-- ── Notifications (user-facing inbox) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  citizen_id   INT NULL,
  panchayat_id INT NULL,
  title        VARCHAR(255) NOT NULL,
  body         TEXT NOT NULL,
  type         ENUM('gramSabha','reminder','scheme','payment','complaint','notice','festival','emergency','general') DEFAULT 'general',
  sender       VARCHAR(255),
  is_read      TINYINT(1) DEFAULT 0,
  due_at       TIMESTAMP NULL,
  route        VARCHAR(500) NULL,
  meta         JSON NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_citizen   (citizen_id),
  INDEX idx_notif_panchayat (panchayat_id),
  FOREIGN KEY (citizen_id)   REFERENCES citizens(id)   ON DELETE CASCADE,
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

-- ── Scheme bookmarks ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scheme_bookmarks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  scheme_id  INT NOT NULL,
  citizen_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_bookmark (scheme_id, citizen_id),
  FOREIGN KEY (scheme_id)  REFERENCES schemes(id)  ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
);

-- ── Payment config (per-panchayat UPI / gateway settings) ────────────────────

CREATE TABLE IF NOT EXISTS payment_configs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  panchayat_id     INT NOT NULL UNIQUE,
  upi_id           VARCHAR(100),
  gateway          ENUM('razorpay','payu','none') DEFAULT 'none',
  gateway_key_id   VARCHAR(255),
  methods_enabled  JSON,
  helpline         VARCHAR(50),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

-- ── Property tax ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS property_tax (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  citizen_id   INT NOT NULL,
  panchayat_id INT NOT NULL,
  property_no  VARCHAR(100),
  description  VARCHAR(500),
  amount       DECIMAL(10,2) NOT NULL,
  due_date     DATE,
  year         VARCHAR(20),
  status       ENUM('pending','paid','overdue') DEFAULT 'pending',
  paid_at      TIMESTAMP NULL,
  payment_ref  VARCHAR(255),
  receipt_no   VARCHAR(100),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pt_citizen   (citizen_id),
  INDEX idx_pt_panchayat (panchayat_id),
  FOREIGN KEY (citizen_id)   REFERENCES citizens(id)   ON DELETE CASCADE,
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

-- ── Alter existing tables ─────────────────────────────────────────────────────

-- complaints: add timeline + assignment + rating columns
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS assigned_to_name        VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS assigned_to_designation VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS assigned_to_phone       VARCHAR(20)  NULL,
  ADD COLUMN IF NOT EXISTS assigned_at             TIMESTAMP    NULL,
  ADD COLUMN IF NOT EXISTS resolved_at             TIMESTAMP    NULL,
  ADD COLUMN IF NOT EXISTS resolution_note         TEXT         NULL,
  ADD COLUMN IF NOT EXISTS citizen_rating          TINYINT      NULL;

-- notices: add pinning + attachment + author columns
ALTER TABLE notices
  ADD COLUMN IF NOT EXISTS is_pinned       TINYINT(1)    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_attachment  TINYINT(1)    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attachment_url  VARCHAR(1000) NULL,
  ADD COLUMN IF NOT EXISTS author          VARCHAR(255)  NULL;

-- citizens: add photo_url column
ALTER TABLE citizens
  ADD COLUMN IF NOT EXISTS photo_url VARCHAR(1000) NULL;
