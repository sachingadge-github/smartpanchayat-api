USE smart_panchayat;

-- ─────────────────────────────────────────────────────────────────────────────
-- PANCHAYAT PROFILES  (all 5 villages)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO panchayat_profiles
  (panchayat_id, about, history, vision,
   established_year, area_sq_km, total_households, literacy_rate,
   main_occupation, languages_spoken,
   cover_photo_url,
   pincode, latitude, longitude,
   contact_phone, contact_email, office_address, office_hours,
   website_url, whatsapp_number)
VALUES

-- 1. Nerle GP
(1,
 'Nerle is a peaceful village in Valva taluka nestled along the banks of the Warna river, known for its lush sugarcane fields and strong community spirit.',
 'Established after Indian Independence in 1952 under the Bombay Village Panchayats Act, Nerle GP has consistently led in sanitation and water supply in Valva taluka.',
 'To become a model digital village with 100% literacy, clean piped water for every household, and zero open complaints by 2030.',
 1952, 12.50, 310, 78.50,
 'Sugarcane Farming, Dairy, Small Trade',
 'Marathi, Hindi',
 NULL,
 '415414', 17.03240, 74.28910,
 '02346-220101', 'nerlegp@mahagov.in',
 'Panchayat Bhavan, Near Primary School, Nerle, Taluka Valva, Dist. Sangli – 415414',
 'Mon–Sat 10:00 AM – 5:00 PM',
 NULL, '9876500001'),

-- 2. Kole GP
(2,
 'Kole is a small, close-knit village in Walwa taluka with a strong tradition of cooperative farming and annual Ganesh festival celebrations that draw visitors from across the district.',
 'Kole Gram Panchayat was formed in 1956. The village is historically known for its cooperative sugar factory membership and was among the first in the taluka to achieve Open Defecation Free (ODF) status.',
 'A self-sufficient, green village where every citizen has access to digital services, quality education, and sustainable livelihoods.',
 1956, 8.20, 215, 72.30,
 'Sugarcane, Soybean, Poultry',
 'Marathi, Kannada',
 NULL,
 '416313', 16.96810, 74.32450,
 '02346-230202', 'kolegp@mahagov.in',
 'Gram Panchayat Office, Main Road, Kole, Taluka Walwa, Dist. Sangli – 416313',
 'Mon–Fri 10:00 AM – 5:00 PM, Sat 10:00 AM – 2:00 PM',
 NULL, '9876500002'),

-- 3. Yewalewadi GP
(3,
 'Yewalewadi is a rapidly growing peri-urban village on the outskirts of Pune in Haveli taluka, blending traditional Maharashtrian culture with modern infrastructure development.',
 'Yewalewadi GP was established in 1949 and has seen exponential growth over the last two decades due to its proximity to Pune IT corridors. The panchayat has been awarded for best e-governance practices in Pune district.',
 'A smart, inclusive village offering world-class civic services digitally, with green spaces preserved and cultural heritage celebrated.',
 1949, 18.70, 540, 88.40,
 'Service Sector, IT, Construction, Farming',
 'Marathi, Hindi, English',
 NULL,
 '411048', 18.44620, 73.93880,
 '020-27801234', 'yewalewadi.gp@punedistrict.gov.in',
 'Gram Panchayat Bhavan, Yewalewadi Road, Haveli, Pune – 411048',
 'Mon–Sat 9:30 AM – 5:30 PM',
 'https://yewalewadi.gov.in', '9876500003'),

-- 4. Bhose GP
(4,
 'Bhose is a historically rich village in Miraj taluka, famed for its ancient Bhose Devi temple. The village has strong agricultural roots and is known for producing high-quality jowar and sunflower.',
 'Bhose Gram Panchayat traces its administrative roots to 1953. The village gained prominence during the Bhakti movement era and its temple complex is a protected heritage site. The panchayat has consistently maintained clean village award status.',
 'Preserve heritage while modernising governance — a village where traditions thrive alongside transparent, responsive civic administration.',
 1953, 15.90, 385, 74.80,
 'Jowar, Sunflower, Cattle Farming',
 'Marathi, Hindi',
 NULL,
 '416410', 16.84930, 74.66150,
 '0233-222303', 'bhosegp@mahagov.in',
 'Gram Panchayat Karyalay, Temple Road, Bhose, Taluka Miraj, Dist. Sangli – 416410',
 'Mon–Sat 10:00 AM – 5:00 PM',
 NULL, '9876500004'),

-- 5. Kasegaon GP
(5,
 'Kasegaon is the largest panchayat in Valva taluka, a vibrant market village and agricultural hub with a well-established primary health centre, high school, and cooperative bank.',
 'Kasegaon GP was established in 1948, one of the earliest in Sangli district. It has historically been a centre of trade and education in the region. The panchayat was the first in Valva taluka to complete household-level tap water connections under Jal Jeevan Mission.',
 'To be the benchmark panchayat of Sangli district — leading in healthcare, education, water supply, and digital citizen services.',
 1948, 24.60, 810, 82.10,
 'Sugarcane, Grape Farming, Trade, Education',
 'Marathi, Hindi',
 NULL,
 '415404', 17.07560, 74.26740,
 '02346-244501', 'kasegaongp@mahagov.in',
 'Gram Panchayat Office, Market Road, Kasegaon, Taluka Valva, Dist. Sangli – 415404',
 'Mon–Sat 9:00 AM – 6:00 PM',
 NULL, '9876500005');


-- ─────────────────────────────────────────────────────────────────────────────
-- PANCHAYAT STAFF
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Nerle GP Staff
INSERT IGNORE INTO panchayat_staff
  (panchayat_id, name, designation, role_type, ward_no, phone, education, since_year, bio, display_order)
VALUES
(1, 'Rajan Maruti Patil',   'Sarpanch',       'sarpanch',     NULL, '9823100001', 'B.A.',           2022, 'Born and raised in Nerle, Rajan has led multiple village development projects including the new water pipeline scheme.',        1),
(1, 'Sunita Vijay More',    'Upa-Sarpanch',   'upa_sarpanch', NULL, '9823100002', '12th Pass',      2022, 'Active women leader focused on self-help groups and girl-child education in Nerle.',                                           2),
(1, 'Vijay Suresh Kadam',   'Gram Sevak',     'gram_sevak',   NULL, '9823100003', 'B.Com, Diploma', 2020, 'Government-appointed Gram Sevak handling all administrative and scheme-related work for the panchayat.',                      3),
(1, 'Meena Arun Jadhav',    'Ward Member – Ward 1', 'ward_member', 1, '9823100004', '10th Pass',   2022, NULL, 4),
(1, 'Arun Dattu Shinde',    'Ward Member – Ward 2', 'ward_member', 2, '9823100005', '12th Pass',   2022, NULL, 5),
(1, 'Priya Sanjay Gaikwad', 'Ward Member – Ward 3', 'ward_member', 3, '9823100006', '10th Pass',   2022, NULL, 6),
(1, 'Santosh Bhau Mane',    'Ward Member – Ward 4', 'ward_member', 4, '9823100007', '12th Pass',   2022, NULL, 7),
(1, 'Lata Rajesh Desai',    'Secretary',      'secretary',    NULL, '9823100008', 'B.A., LLB',      2018, 'Handles all legal notices, RTI applications, and official correspondence of the panchayat.',                                    8);

-- 2. Kole GP Staff
INSERT IGNORE INTO panchayat_staff
  (panchayat_id, name, designation, role_type, ward_no, phone, education, since_year, bio, display_order)
VALUES
(2, 'Prakash Nana Kulkarni', 'Sarpanch',       'sarpanch',     NULL, '9823200001', 'M.A.',           2022, 'Farmer-turned-leader who spearheaded Kole village''s ODF achievement and community biogas plant project.',                     1),
(2, 'Rekha Sunil Pawar',     'Upa-Sarpanch',   'upa_sarpanch', NULL, '9823200002', 'B.Sc.',          2022, 'Science graduate focusing on health and sanitation initiatives in Kole GP.',                                                  2),
(2, 'Mohan Tukaram Sawant',  'Gram Sevak',     'gram_sevak',   NULL, '9823200003', 'B.Com',          2021, 'Experienced Gram Sevak with 8 years in rural administration across Walwa and Valva talukas.',                                3),
(2, 'Ramesh Ganpat Kore',   'Ward Member – Ward 1', 'ward_member', 1, '9823200004', '10th Pass',    2022, NULL, 4),
(2, 'Anita Dilip Bhosale',  'Ward Member – Ward 2', 'ward_member', 2, '9823200005', '12th Pass',    2022, NULL, 5),
(2, 'Kiran Sudhakar Naik',  'Ward Member – Ward 3', 'ward_member', 3, '9823200006', '10th Pass',    2022, NULL, 6),
(2, 'Geeta Ramchandra Mali', 'Secretary',      'secretary',    NULL, '9823200007', 'B.Com',          2019, NULL, 7);

-- 3. Yewalewadi GP Staff
INSERT IGNORE INTO panchayat_staff
  (panchayat_id, name, designation, role_type, ward_no, phone, education, since_year, bio, display_order)
VALUES
(3, 'Amol Dinesh Joshi',     'Sarpanch',       'sarpanch',     NULL, '9823300001', 'M.B.A.',         2022, 'IT professional turned public servant, Amol brought e-governance and digital notice boards to Yewalewadi GP, winning district-level recognition.', 1),
(3, 'Pooja Mahesh Kulkarni', 'Upa-Sarpanch',   'upa_sarpanch', NULL, '9823300002', 'B.E. (Civil)',   2022, 'Civil engineer and community activist working on road infrastructure and flood-resilient drainage in Yewalewadi.',            2),
(3, 'Suresh Vitthal Mhetre', 'Gram Sevak',     'gram_sevak',   NULL, '9823300003', 'B.A., D.P.A.',   2019, 'Senior Gram Sevak with expertise in Jal Jeevan Mission implementation and rural housing schemes.',                           3),
(3, 'Nilesh Pramod Deshpande','Ward Member – Ward 1', 'ward_member', 1, '9823300004', 'B.Com',       2022, NULL, 4),
(3, 'Shweta Ajay Thorat',    'Ward Member – Ward 2', 'ward_member', 2, '9823300005', 'B.A.',         2022, NULL, 5),
(3, 'Manoj Sanjay Waghmare', 'Ward Member – Ward 3', 'ward_member', 3, '9823300006', '12th Pass',   2022, NULL, 6),
(3, 'Kavita Raju Salunkhe',  'Ward Member – Ward 4', 'ward_member', 4, '9823300007', 'B.Sc.',        2022, NULL, 7),
(3, 'Deepak Vishnu Gaikwad', 'Ward Member – Ward 5', 'ward_member', 5, '9823300008', '12th Pass',   2022, NULL, 8),
(3, 'Priya Santosh Chavan',  'Secretary',      'secretary',    NULL, '9823300009', 'M.Com, LLB',     2017, 'Handles all legal, financial, and RTI matters. Has managed 3 successive panchayat election processes.',                        9);

-- 4. Bhose GP Staff
INSERT IGNORE INTO panchayat_staff
  (panchayat_id, name, designation, role_type, ward_no, phone, education, since_year, bio, display_order)
VALUES
(4, 'Dattatray Balaso Patil', 'Sarpanch',       'sarpanch',     NULL, '9823400001', 'B.A.',           2022, 'Third-generation farmer and community leader, Dattatray is known for reviving the traditional Bhose Devi fair and building the village cultural hall.', 1),
(4, 'Vandana Suresh Jadhav',  'Upa-Sarpanch',   'upa_sarpanch', NULL, '9823400002', '12th Pass',      2022, 'Women''s welfare champion, managing 5 active self-help groups (Bachat Gats) in Bhose village.',                              2),
(4, 'Rajendra Krushna More',  'Gram Sevak',     'gram_sevak',   NULL, '9823400003', 'B.Com, DCA',     2022, 'Newly appointed Gram Sevak digitising all land records and birth-death certificates for Bhose GP.',                           3),
(4, 'Balu Shankar Chougule',  'Ward Member – Ward 1', 'ward_member', 1, '9823400004', '10th Pass',   2022, NULL, 4),
(4, 'Suman Anil Kumbhar',     'Ward Member – Ward 2', 'ward_member', 2, '9823400005', '12th Pass',   2022, NULL, 5),
(4, 'Ravi Popat Gade',        'Ward Member – Ward 3', 'ward_member', 3, '9823400006', '10th Pass',   2022, NULL, 6),
(4, 'Usha Dilip Pawar',       'Secretary',      'secretary',    NULL, '9823400007', 'B.A.',           2020, NULL, 7);

-- 5. Kasegaon GP Staff
INSERT IGNORE INTO panchayat_staff
  (panchayat_id, name, designation, role_type, ward_no, phone, education, since_year, bio, display_order)
VALUES
(5, 'Sampat Raghunath Desai',  'Sarpanch',       'sarpanch',     NULL, '9823500001', 'M.A. (Political Science)', 2022, 'Former school principal turned sarpanch, Sampat led Kasegaon to become the first village in Valva taluka with 100% tap water connections under Jal Jeevan Mission.', 1),
(5, 'Nirmala Prakash Shinde',  'Upa-Sarpanch',   'upa_sarpanch', NULL, '9823500002', 'B.Ed.',          2022, 'Teacher and community organiser, running adult literacy camps and anganwadi monitoring across Kasegaon.',                    2),
(5, 'Ganesh Vitthal Karale',   'Gram Sevak',     'gram_sevak',   NULL, '9823500003', 'M.Com, D.P.A.',  2016, 'Senior Gram Sevak with 10+ years of experience, managing one of the largest GP offices in Valva taluka.',                   3),
(5, 'Sanjay Anant Patil',      'Ward Member – Ward 1',  'ward_member', 1,  '9823500004', 'B.Com',      2022, NULL, 4),
(5, 'Rohini Sunil Mane',       'Ward Member – Ward 2',  'ward_member', 2,  '9823500005', '12th Pass',  2022, NULL, 5),
(5, 'Mahesh Dadu Jagtap',      'Ward Member – Ward 3',  'ward_member', 3,  '9823500006', 'B.A.',       2022, NULL, 6),
(5, 'Tarabai Mohan Gaikwad',   'Ward Member – Ward 4',  'ward_member', 4,  '9823500007', '10th Pass',  2022, NULL, 7),
(5, 'Kishor Bhimrao Salunkhe', 'Ward Member – Ward 5',  'ward_member', 5,  '9823500008', '12th Pass',  2022, NULL, 8),
(5, 'Dinkar Tukaram Jadhav',   'Ward Member – Ward 6',  'ward_member', 6,  '9823500009', '10th Pass',  2022, NULL, 9),
(5, 'Anusaya Ratan Pawar',     'Ward Member – Ward 7',  'ward_member', 7,  '9823500010', 'B.Sc.',      2022, NULL, 10),
(5, 'Chandrakant Vasant Kore', 'Secretary',      'secretary',    NULL, '9823500011', 'M.Com, LLB',     2014, 'Most experienced GP secretary in Valva taluka, has handled 3 Gram Sabha election cycles and manages all scheme documentation.', 11);


-- ─────────────────────────────────────────────────────────────────────────────
-- NOTICES  (2 per panchayat)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT IGNORE INTO notices (panchayat_id, title, body, type) VALUES
(1, 'Water Supply Shutdown – 20 July 2026',       'Due to pipeline maintenance, water supply will remain shut from 8 AM to 4 PM on 20th July 2026. Citizens are requested to store sufficient water in advance.', 'water'),
(1, 'Gram Sabha – August 15, 2026',               'Special Independence Day Gram Sabha at Panchayat Bhavan, Nerle. All ward members and citizens are requested to attend. Agenda: village development plan 2026–27.', 'meeting'),
(2, 'ODF Plus Certification Drive',               'Kole GP is participating in the district ODF Plus certification inspection on 25th July. Citizens are requested to maintain cleanliness around their homes.', 'general'),
(2, 'Tree Plantation Drive – Van Mahotsav',       'Join us for Van Mahotsav tree plantation on 1st August. Free saplings will be distributed at the GP office. Come be part of making Kole greener!', 'general'),
(3, 'New Road Construction – Ward 3',             'Tender has been awarded for the Ward 3 internal road. Construction will begin from 22nd July. Alternate route via Old Pune Road to be used during work.', 'general'),
(3, 'Property Tax Last Date – 31 July 2026',      'Citizens are reminded that the last date for property tax payment without penalty is 31st July 2026. Visit the GP office or pay online via our website.', 'general'),
(4, 'Bhose Devi Yatra – August 10, 2026',         'Annual Bhose Devi Yatra will be celebrated on 10th August. Village cultural programme, procession, and prasad distribution planned. All citizens invited.', 'general'),
(4, 'PM Awas Yojana Survey',                      'House survey for Pradhan Mantri Awas Yojana (Gramin) will be conducted from 22–28 July. BPL families who need housing assistance must register at the GP office.', 'scheme'),
(5, 'Jal Jeevan Mission – Final Connections',     'Last batch of household tap connections under Jal Jeevan Mission will be completed by 31st July. Pending applicants please contact GP office with Aadhaar.', 'water'),
(5, 'Kisan Mela – Agricultural Fair – August 5',  'District Agriculture Department is organising a Kisan Mela at Kasegaon Ground on 5th August. Free soil testing, seed distribution, and expert consultations available.', 'scheme');
