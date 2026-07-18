-- Migration 005: New tables for APIs 1-22 + mock data
-- Safe to re-run (IF NOT EXISTS / IF NOT EXISTS column guards)
USE smart_panchayat;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Alter existing tables — add new columns
-- ─────────────────────────────────────────────────────────────────────────────

-- Expand notices.type ENUM to include gramSabha, tender, holiday
ALTER TABLE notices
  MODIFY COLUMN type ENUM('general','meeting','scheme','water','emergency','gramSabha','tender','holiday') DEFAULT 'general';

-- Expand certificates.type ENUM to include marriage, property
ALTER TABLE certificates
  MODIFY COLUMN type ENUM('birth','death','income','residence','marriage','property') NOT NULL;

-- complaints: add timeline + assignment + rating columns
ALTER TABLE complaints ADD COLUMN assigned_to_name        VARCHAR(255)  NULL;
ALTER TABLE complaints ADD COLUMN assigned_to_designation VARCHAR(255)  NULL;
ALTER TABLE complaints ADD COLUMN assigned_to_phone       VARCHAR(20)   NULL;
ALTER TABLE complaints ADD COLUMN assigned_at             TIMESTAMP     NULL;
ALTER TABLE complaints ADD COLUMN resolved_at             TIMESTAMP     NULL;
ALTER TABLE complaints ADD COLUMN resolution_note         TEXT          NULL;
ALTER TABLE complaints ADD COLUMN citizen_rating          TINYINT       NULL;

-- notices: add pinning + attachment + author columns
ALTER TABLE notices ADD COLUMN is_pinned       TINYINT(1)    DEFAULT 0;
ALTER TABLE notices ADD COLUMN has_attachment  TINYINT(1)    DEFAULT 0;
ALTER TABLE notices ADD COLUMN attachment_url  VARCHAR(1000) NULL;
ALTER TABLE notices ADD COLUMN author          VARCHAR(255)  NULL;

-- citizens: add photo_url column
ALTER TABLE citizens ADD COLUMN photo_url VARCHAR(1000) NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Create new tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gram_sabha_meetings (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  panchayat_id INT UNSIGNED NOT NULL,
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
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id INT UNSIGNED NOT NULL,
  citizen_id INT UNSIGNED NOT NULL,
  attending  TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_attendance (meeting_id, citizen_id),
  FOREIGN KEY (meeting_id) REFERENCES gram_sabha_meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gram_sabha_polls (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  panchayat_id INT UNSIGNED NOT NULL,
  question     VARCHAR(500) NOT NULL,
  deadline     DATE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_gsp_panchayat (panchayat_id),
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gram_sabha_poll_options (
  id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  poll_id INT UNSIGNED NOT NULL,
  text    VARCHAR(500) NOT NULL,
  votes   INT UNSIGNED DEFAULT 0,
  FOREIGN KEY (poll_id) REFERENCES gram_sabha_polls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gram_sabha_votes (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  poll_id    INT UNSIGNED NOT NULL,
  option_id  INT UNSIGNED NOT NULL,
  citizen_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_vote (poll_id, citizen_id),
  FOREIGN KEY (poll_id)    REFERENCES gram_sabha_polls(id)        ON DELETE CASCADE,
  FOREIGN KEY (option_id)  REFERENCES gram_sabha_poll_options(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id)                ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  citizen_id   INT UNSIGNED NULL,
  panchayat_id INT UNSIGNED NULL,
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

CREATE TABLE IF NOT EXISTS scheme_bookmarks (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scheme_id  INT UNSIGNED NOT NULL,
  citizen_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_bookmark (scheme_id, citizen_id),
  FOREIGN KEY (scheme_id)  REFERENCES schemes(id)  ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_configs (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  panchayat_id     INT UNSIGNED NOT NULL UNIQUE,
  upi_id           VARCHAR(100),
  gateway          ENUM('razorpay','payu','none') DEFAULT 'none',
  gateway_key_id   VARCHAR(255),
  methods_enabled  JSON,
  helpline         VARCHAR(50),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (panchayat_id) REFERENCES panchayats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS property_tax (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  citizen_id   INT UNSIGNED NOT NULL,
  panchayat_id INT UNSIGNED NOT NULL,
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

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Demo citizens (INSERT IGNORE — safe to re-run)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO citizens (id, panchayat_id, name, mobile, gender, age, address, role) VALUES
(1,  1, 'Ramesh Maruti Patil',   '9999999999', 'male',   38, 'Ward 3, Nerle, Taluka Valva, Sangli',          'citizen'),
(2,  1, 'Sunita Vijay More',     '9876543210', 'female', 34, 'Ward 1, Nerle, Taluka Valva, Sangli',          'officer'),
(3,  1, 'Vijay Suresh Kadam',    '9876543211', 'male',   45, 'Ward 5, Nerle, Taluka Valva, Sangli',          'admin'),
(4,  1, 'Meena Arun Jadhav',     '9876543212', 'female', 29, 'Ward 2, Nerle, Taluka Valva, Sangli',          'citizen'),
(5,  1, 'Arun Dattu Shinde',     '9876543213', 'male',   52, 'Ward 4, Nerle, Taluka Valva, Sangli',          'citizen'),
(6,  2, 'Prakash Nana Kulkarni', '9823200001', 'male',   47, 'Main Road, Kole, Taluka Walwa, Sangli',        'officer'),
(7,  2, 'Rekha Sunil Pawar',     '9823200002', 'female', 36, 'Ward 2, Kole, Taluka Walwa, Sangli',           'citizen'),
(8,  3, 'Amol Dinesh Joshi',     '9823300001', 'male',   40, 'Yewalewadi Road, Haveli, Pune',                'officer'),
(9,  3, 'Pooja Mahesh Kulkarni', '9823300002', 'female', 32, 'Ward 1, Yewalewadi, Haveli, Pune',             'citizen'),
(10, 4, 'Dattatray Balaso Patil','9823400001', 'male',   55, 'Temple Road, Bhose, Taluka Miraj, Sangli',     'officer'),
(11, 5, 'Sampat Raghunath Desai','9823500001', 'male',   58, 'Market Road, Kasegaon, Taluka Valva, Sangli',  'officer');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: Water bills for demo citizens
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO water_bills (citizen_id, panchayat_id, month, year, amount, paid, receipt_no) VALUES
-- Citizen 1 (Ramesh) - current month pending
(1, 1,  7, 2026, 240.00, 0, NULL),
-- Citizen 1 - previous months paid
(1, 1,  6, 2026, 240.00, 1, 'RCP-2026-000101'),
(1, 1,  5, 2026, 240.00, 1, 'RCP-2026-000088'),
(1, 1,  4, 2026, 260.00, 1, 'RCP-2026-000072'),
(1, 1,  3, 2026, 240.00, 1, 'RCP-2026-000055'),
-- Citizen 4 (Meena)
(4, 1,  7, 2026, 180.00, 0, NULL),
(4, 1,  6, 2026, 180.00, 1, 'RCP-2026-000102'),
-- Citizen 5 (Arun)
(5, 1,  7, 2026, 210.00, 0, NULL),
(5, 1,  6, 2026, 210.00, 1, 'RCP-2026-000103');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5: Complaints with new columns
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO complaints
  (id, citizen_id, panchayat_id, reference_no, category, description, location,
   latitude, longitude, status, remark,
   assigned_to_name, assigned_to_designation, assigned_to_phone,
   assigned_at, resolved_at, resolution_note, citizen_rating)
VALUES
(1, 1, 1, 'CMP-2026-000001', 'water',
 'Water pipe leaking near ward 3 bus stop. Water is wasting for 3 days.',
 'Near bus stop, Ward 3, Nerle', 17.03210, 74.28870,
 'resolved', 'Pipe repaired successfully.',
 'Vijay Suresh Kadam', 'Gram Sevak', '9876543211',
 '2026-07-10 10:00:00', '2026-07-12 15:30:00', 'Pipe joint replaced. Water supply restored.', 4),

(2, 1, 1, 'CMP-2026-000002', 'road',
 'Large pothole on the main road near primary school. Causing accidents.',
 'Near Primary School, Main Road, Nerle', 17.03280, 74.28950,
 'in_progress', 'Assigned to road works team.',
 'Arun Dattu Shinde', 'Ward Member Ward 4', '9876543213',
 '2026-07-15 11:00:00', NULL, NULL, NULL),

(3, 4, 1, 'CMP-2026-000003', 'streetlight',
 'Three street lights not working in ward 2 for past one week.',
 'Ward 2 Lane, Nerle', 17.03190, 74.28830,
 'open', NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),

(4, 5, 1, 'CMP-2026-000004', 'garbage',
 'Garbage not collected from Ward 4 for 5 days. Bad smell and unhygienic.',
 'Ward 4, Near temple, Nerle', 17.03300, 74.28910,
 'resolved', 'Garbage collected and area cleaned.',
 'Sunita Vijay More', 'Upa-Sarpanch', '9876543210',
 '2026-07-05 09:00:00', '2026-07-06 17:00:00', 'Area cleaned. Daily collection schedule resumed.', 5),

(5, 7, 2, 'CMP-2026-000005', 'drainage',
 'Drainage blocked near Ward 2 market area. Water logging during rains.',
 'Market Lane, Ward 2, Kole', 16.96820, 74.32460,
 'open', NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),

(6, 9, 3, 'CMP-2026-000006', 'road',
 'Speed breaker needed near the school on Yewalewadi main road.',
 'Near Zilla Parishad School, Yewalewadi', 18.44630, 73.93890,
 'in_progress', 'PWD approval pending.',
 'Amol Dinesh Joshi', 'Sarpanch', '9823300001',
 '2026-07-14 14:00:00', NULL, NULL, NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 6: Certificates (demo applications)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO certificates
  (id, citizen_id, panchayat_id, reference_no, type, applicant_name, details, status, remark, pdf_url)
VALUES
(1, 1, 1, 'CERT-2026-000001', 'birth', 'Baby Patil',
 '{"date_of_birth":"2026-01-15","place_of_birth":"Nerle","father_name":"Ramesh Patil","mother_name":"Priya Patil"}',
 'ready', 'Certificate issued', 'https://smartpanchayat.co.in/certificates/cert_001.pdf'),

(2, 1, 1, 'CERT-2026-000002', 'residence', 'Ramesh Maruti Patil',
 '{"address":"Ward 3, Nerle, Taluka Valva, Sangli","since_year":2005}',
 'approved', 'Under processing', NULL),

(3, 4, 1, 'CERT-2026-000003', 'income', 'Meena Arun Jadhav',
 '{"annual_income":84000,"financial_year":"2025-26","occupation":"Agriculture"}',
 'pending', NULL, NULL),

(4, 5, 1, 'CERT-2026-000004', 'death', 'Dattu Bhau Shinde',
 '{"date_of_death":"2026-06-28","place_of_death":"Nerle","age_at_death":78}',
 'under_review', 'Documents under verification', NULL),

(5, 9, 3, 'CERT-2026-000005', 'marriage', 'Pooja Mahesh Kulkarni',
 '{"spouse_name":"Rahul Sharma","date_of_marriage":"2026-04-12","venue":"Yewalewadi"}',
 'ready', 'Certificate issued', 'https://smartpanchayat.co.in/certificates/cert_005.pdf');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 7: Gram Sabha meetings
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO gram_sabha_meetings
  (id, panchayat_id, title, description, date, time, venue, agenda, status)
VALUES
(1, 1,
 'विशेष ग्रामसभा – जुलै 2026',
 'Village development plan discussion and budget review for 2026-27. All ward members and citizens are invited.',
 '2026-07-25', '11:00:00', 'ग्रामपंचायत भवन, नेर्ले',
 '["गाव विकास आराखडा 2026-27", "पाणीपुरवठा योजना अपडेट", "स्वच्छ भारत अभियान प्रगती", "नागरिकांच्या तक्रारी"]',
 'upcoming'),

(2, 1,
 'सामान्य ग्रामसभा – मे 2026',
 'Regular quarterly Gram Sabha. Budget review and scheme beneficiary list approval.',
 '2026-05-15', '10:30:00', 'ग्रामपंचायत भवन, नेर्ले',
 '["वार्षिक ताळेबंद", "PM आवास योजना यादी मंजुरी", "जल जीवन मिशन प्रगती"]',
 'completed'),

(3, 1,
 'स्वातंत्र्य दिन विशेष ग्रामसभा – ऑगस्ट 2026',
 'Special Gram Sabha on Independence Day. Reviewing achievements and setting goals for next year.',
 '2026-08-15', '09:00:00', 'ग्रामपंचायत मैदान, नेर्ले',
 '["गाव प्रगती अहवाल", "नवीन योजना माहिती", "युवा विकास उपक्रम"]',
 'upcoming'),

(4, 3,
 'Yewalewadi Gram Sabha – July 2026',
 'Quarterly meeting to discuss ward-level issues and new road construction tenders.',
 '2026-07-28', '11:00:00', 'GP Bhavan, Yewalewadi',
 '["Road Construction Tender - Ward 3", "Property Tax Collection Update", "Solid Waste Management"]',
 'upcoming'),

(5, 3,
 'Yewalewadi Gram Sabha – April 2026',
 'Year-start planning and new financial year budget approval.',
 '2026-04-10', '10:00:00', 'GP Bhavan, Yewalewadi',
 '["Budget 2026-27 Approval", "New Staff Appointments", "Digital Services Launch"]',
 'completed');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 8: Gram Sabha polls + options
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO gram_sabha_polls (id, panchayat_id, question, deadline) VALUES
(1, 1, 'नवीन समाज मंदिर कुठे बांधायचे?',           '2026-07-31'),
(2, 1, 'गावातील कोणत्या रस्त्याला प्राधान्य द्यावे?', '2026-08-10'),
(3, 3, 'Which road improvement should be prioritized?', '2026-08-05'),
(4, 3, 'Where should the new playground be built?',    '2026-08-15');

INSERT IGNORE INTO gram_sabha_poll_options (id, poll_id, text, votes) VALUES
-- Poll 1 options
(1,  1, 'वार्ड १ भागात',   12),
(2,  1, 'वार्ड ३ भागात',   28),
(3,  1, 'मुख्य चौकाजवळ',  19),
-- Poll 2 options
(4,  2, 'नेर्ले-वाळवा मुख्य रस्ता',  35),
(5,  2, 'वार्ड ४ अंतर्गत रस्ता',     22),
(6,  2, 'शाळेजवळील रस्ता',          18),
-- Poll 3 options
(7,  3, 'Main Road - School to Market', 44),
(8,  3, 'Ward 3 Internal Road',         31),
(9,  3, 'Old Bridge Road',              17),
-- Poll 4 options
(10, 4, 'Near the School',              25),
(11, 4, 'Ward 5 Open Ground',           38),
(12, 4, 'Near GP Office',               14);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 9: Payment configs (one per panchayat)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO payment_configs
  (panchayat_id, upi_id, gateway, methods_enabled, helpline)
VALUES
(1, 'nerlegp@upi',      'none', '["upi","cash"]',     '02346-220101'),
(2, 'kolegp@upi',       'none', '["upi","cash"]',     '02346-230202'),
(3, 'yewalewadi@upi',   'none', '["upi","cash","card"]', '020-27801234'),
(4, 'bhosegp@upi',      'none', '["upi","cash"]',     '0233-222303'),
(5, 'kasegaongp@upi',   'none', '["upi","cash"]',     '02346-244501');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 10: Property tax records
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO property_tax
  (citizen_id, panchayat_id, property_no, description, amount, due_date, year, status, paid_at, receipt_no)
VALUES
-- Ramesh (citizen 1)
(1, 1, 'NR/W3/042', 'Residential house, Ward 3',   1200.00, '2026-09-30', '2026-27', 'pending', NULL, NULL),
(1, 1, 'NR/W3/043', 'Agricultural land, Survey 117', 600.00, '2026-09-30', '2026-27', 'pending', NULL, NULL),
(1, 1, 'NR/W3/042', 'Residential house, Ward 3',   1150.00, '2025-09-30', '2025-26', 'paid',    '2025-08-20 11:30:00', 'RCP-2026-000318'),
-- Meena (citizen 4)
(4, 1, 'NR/W2/018', 'Residential house, Ward 2',    850.00, '2026-09-30', '2026-27', 'pending', NULL, NULL),
(4, 1, 'NR/W2/018', 'Residential house, Ward 2',    820.00, '2025-09-30', '2025-26', 'paid',    '2025-09-05 14:00:00', 'RCP-2025-000214'),
-- Arun (citizen 5)
(5, 1, 'NR/W4/031', 'Residential house, Ward 4',   1050.00, '2026-09-30', '2026-27', 'overdue', NULL, NULL),
(5, 1, 'NR/W4/032', 'Shop / commercial, Ward 4',   2400.00, '2026-09-30', '2026-27', 'overdue', NULL, NULL),
-- Yewalewadi citizens
(9, 3, 'YW/W1/104', 'Residential flat, Ward 1',    3600.00, '2026-09-30', '2026-27', 'pending', NULL, NULL),
(9, 3, 'YW/W1/104', 'Residential flat, Ward 1',    3400.00, '2025-09-30', '2025-26', 'paid',    '2025-08-01 10:00:00', 'RCP-2025-000318');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 11: Notifications
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO notifications
  (citizen_id, panchayat_id, title, body, type, sender, is_read, route)
VALUES
-- Broadcast to panchayat 1 (citizen_id NULL = all citizens of that panchayat)
(NULL, 1, 'ग्रामसभा आमंत्रण',
 'दि. २५ जुलै रोजी सकाळी ११ वाजता ग्रामसभा होणार आहे. सर्व नागरिकांनी उपस्थित राहावे.',
 'gramSabha', 'ग्रामपंचायत नेर्ले', 0, '/gram-sabha'),

(NULL, 1, 'पाणी कपात सूचना',
 'उद्या (२० जुलै) सकाळी ८ ते दुपारी ४ वाजेपर्यंत पाणीपुरवठा बंद राहील. पाणी साठवून ठेवा.',
 'emergency', 'ग्रामपंचायत नेर्ले', 0, NULL),

(NULL, 1, 'मालमत्ता कर भरण्याची शेवटची तारीख',
 'मालमत्ता कर भरण्याची शेवटची तारीख ३० सप्टेंबर आहे. वेळेत भरा आणि दंड टाळा.',
 'reminder', 'ग्रामपंचायत नेर्ले', 0, '/payments/property-tax'),

-- Direct to citizen 1 (Ramesh)
(1, NULL, 'तक्रार सोडवली गेली',
 'तुमची तक्रार #CMP-2026-000001 (पाणी गळती) यशस्वीपणे सोडवण्यात आली.',
 'complaint', 'ग्रामपंचायत नेर्ले', 1, '/complaints/1'),

(1, NULL, 'दाखला तयार आहे',
 'तुमचा जन्म दाखला (CERT-2026-000001) तयार आहे. डाउनलोड करा.',
 'notice', 'ग्रामपंचायत नेर्ले', 0, '/certificates/1'),

(1, NULL, 'PM किसान सन्मान निधी – नवीन हप्ता',
 'PM किसान योजनेचा नवीन हप्ता (₹2,000) तुमच्या खात्यात जमा होणार आहे.',
 'scheme', 'सरकारी योजना', 1, '/schemes/1'),

-- Direct to citizen 4 (Meena)
(4, NULL, 'पाणीपट्टी थकीत आहे',
 'जुलै 2026 ची पाणीपट्टी अजून भरलेली नाही. लवकर भरा.',
 'payment', 'ग्रामपंचायत नेर्ले', 0, '/water-bills'),

-- Broadcast to panchayat 3
(NULL, 3, 'Property Tax Due – Last Date July 31',
 'Reminder: Last date for property tax payment without penalty is 31st July 2026.',
 'reminder', 'Yewalewadi GP', 0, '/payments/property-tax'),

(NULL, 3, 'New Road Construction – Ward 3',
 'Construction begins July 22. Please use alternate route via Old Pune Road.',
 'notice', 'Yewalewadi GP', 0, '/notices');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 12: Scheme bookmarks (for citizen 1)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO scheme_bookmarks (scheme_id, citizen_id) VALUES
(1, 1),  -- PM Kisan Samman Nidhi
(5, 1),  -- MGNREGA
(6, 1);  -- Kisan Credit Card

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 13: Enrich existing notices with new columns
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE notices SET is_pinned = 1, author = 'Rajan Maruti Patil, Sarpanch'
WHERE panchayat_id = 1 AND title LIKE '%Gram Sabha%' LIMIT 1;

UPDATE notices SET is_pinned = 1, author = 'Amol Dinesh Joshi, Sarpanch'
WHERE panchayat_id = 3 AND title LIKE '%Property Tax%' LIMIT 1;
