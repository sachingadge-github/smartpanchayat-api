USE smart_panchayat;

-- Panchayats
INSERT IGNORE INTO panchayats (name, taluka, district, state, population, ward_count) VALUES
('Nerle Gram Panchayat',       'Valva',     'Sangli', 'Maharashtra', 1247, 9),
('Kole Gram Panchayat',        'Walwa',     'Sangli', 'Maharashtra', 890,  7),
('Yewalewadi Gram Panchayat',  'Haveli',    'Pune',   'Maharashtra', 2100, 11),
('Bhose Gram Panchayat',       'Miraj',     'Sangli', 'Maharashtra', 1560, 9),
('Kasegaon Gram Panchayat',    'Valva',     'Sangli', 'Maharashtra', 3200, 13);

-- Government Schemes
INSERT IGNORE INTO schemes (name, description, benefit, eligibility, category, last_date) VALUES
('PM Kisan Samman Nidhi',       'Income support for farmers',               '₹6,000/year in 3 installments', 'Farmer with land records, Aadhaar linked', 'agriculture', '2026-12-31'),
('Pradhan Mantri Awas Yojana',  'Housing for rural poor',                   'Subsidy up to ₹1.20 lakh',       'BPL family, no pucca house',               'housing',     '2026-09-30'),
('Ayushman Bharat PM-JAY',      'Health insurance scheme',                  'Coverage up to ₹5 lakh/year',    'BPL & lower middle class families',        'health',      NULL),
('Sukanya Samriddhi Yojana',    'Savings scheme for girl child',            '8.2% interest rate',             'Girl child below 10 years',                'women',       NULL),
('MGNREGA',                     '100 days guaranteed rural employment',     '₹238/day minimum wages',         'Rural household adults',                   'employment',  NULL),
('Kisan Credit Card',           'Short-term crop loans for farmers',        'Loan up to ₹3 lakh at 4% PA',   'Farmers, horticulturalists',               'agriculture', NULL),
('PM Ujjwala Yojana',           'Free LPG connection for BPL families',    'Free gas cylinder connection',   'Women from BPL family',                    'women',       NULL),
('Scholarship for SC/ST',       'Education scholarship for SC/ST students', 'Up to ₹12,000/year',            'SC/ST students in class 9-12',             'education',   '2026-10-31');

-- Water bills for demo
INSERT IGNORE INTO water_bills (citizen_id, panchayat_id, month, year, amount, paid)
SELECT 1, 1, MONTH(NOW()), YEAR(NOW()), 240.00, 0 WHERE EXISTS (SELECT 1 FROM citizens WHERE id = 1);

-- Demo notice
INSERT IGNORE INTO notices (panchayat_id, title, body, type)
SELECT 1, 'Gram Sabha Meeting — July 15, 2026',
'All citizens are invited to attend the Gram Sabha at Panchayat Bhavan. Discussion on village development plan and budget allocation for 2026–27. Your presence is important.',
'meeting' WHERE EXISTS (SELECT 1 FROM panchayats WHERE id = 1);
