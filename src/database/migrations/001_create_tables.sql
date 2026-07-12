-- Smart Panchayat — Database Schema v1.0
-- Run: mysql -u root -p smart_panchayat < src/database/migrations/001_create_tables.sql

CREATE DATABASE IF NOT EXISTS smart_panchayat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_panchayat;

-- ─────────────────────────────────────────────
-- PANCHAYATS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS panchayats (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  taluka        VARCHAR(100),
  district      VARCHAR(100),
  state         VARCHAR(100) DEFAULT 'Maharashtra',
  population    INT UNSIGNED,
  ward_count    TINYINT UNSIGNED DEFAULT 0,
  logo_url      VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- CITIZENS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizens (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  panchayat_id  INT UNSIGNED,
  name          VARCHAR(100),
  mobile        VARCHAR(15) NOT NULL UNIQUE,
  gender        ENUM('male','female','other'),
  age           TINYINT UNSIGNED,
  address       TEXT,
  role          ENUM('citizen','officer','admin') DEFAULT 'citizen',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- OTP LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_logs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mobile      VARCHAR(15) NOT NULL,
  otp         VARCHAR(10) NOT NULL,
  purpose     VARCHAR(30) DEFAULT 'login',
  verified    TINYINT(1) DEFAULT 0,
  expires_at  DATETIME NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mobile_purpose (mobile, purpose)
);

-- ─────────────────────────────────────────────
-- COMPLAINTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  citizen_id    INT UNSIGNED NOT NULL,
  panchayat_id  INT UNSIGNED NOT NULL,
  reference_no  VARCHAR(20) UNIQUE,
  category      ENUM('road','water','streetlight','garbage','drainage','tree','other') NOT NULL,
  description   TEXT NOT NULL,
  photo_url     VARCHAR(500),
  location      VARCHAR(300),
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  status        ENUM('open','in_progress','resolved','rejected') DEFAULT 'open',
  remark        TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id),
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id)
);

-- ─────────────────────────────────────────────
-- CERTIFICATES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  citizen_id      INT UNSIGNED NOT NULL,
  panchayat_id    INT UNSIGNED NOT NULL,
  reference_no    VARCHAR(30) UNIQUE,
  type            ENUM('birth','death','income','residence') NOT NULL,
  applicant_name  VARCHAR(100) NOT NULL,
  details         JSON,
  status          ENUM('pending','under_review','approved','rejected','ready') DEFAULT 'pending',
  remark          TEXT,
  pdf_url         VARCHAR(500),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id),
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id)
);

-- ─────────────────────────────────────────────
-- WATER BILLS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS water_bills (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  citizen_id    INT UNSIGNED NOT NULL,
  panchayat_id  INT UNSIGNED NOT NULL,
  month         TINYINT UNSIGNED NOT NULL,
  year          SMALLINT UNSIGNED NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  paid          TINYINT(1) DEFAULT 0,
  order_id      VARCHAR(50),
  payment_ref   VARCHAR(100),
  payment_date  DATETIME,
  receipt_no    VARCHAR(30),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_citizen_month_year (citizen_id, month, year),
  FOREIGN KEY (citizen_id) REFERENCES citizens(id),
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id)
);

-- ─────────────────────────────────────────────
-- NOTICES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  panchayat_id  INT UNSIGNED NOT NULL,
  title         VARCHAR(200) NOT NULL,
  body          TEXT NOT NULL,
  type          ENUM('general','meeting','scheme','water','emergency') DEFAULT 'general',
  created_by    INT UNSIGNED,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id),
  FOREIGN KEY (created_by) REFERENCES citizens(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- SCHEMES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schemes (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  benefit       VARCHAR(300),
  eligibility   TEXT,
  category      ENUM('agriculture','housing','health','education','women','employment','other') DEFAULT 'other',
  last_date     DATE,
  apply_url     VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- DEVICE TOKENS (Push Notifications)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  citizen_id  INT UNSIGNED NOT NULL,
  token       VARCHAR(500) NOT NULL UNIQUE,
  platform    ENUM('android','ios') NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
);
