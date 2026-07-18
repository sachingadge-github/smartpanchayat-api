# Smart Panchayat API — cURL Reference

> **Base URLs**
> - Local: `http://localhost:5000/api/v1`
> - UAT:   `https://smartpanchayat.co.in/api/api/v1`

---

## Quick Start — Get a Token

```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

# 2. Verify OTP → returns access_token + refresh_token
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "otp": "123456"}'

# 3. Save token (bash)
TOKEN="paste_access_token_here"
LOCAL="http://localhost:5000/api/v1"
UAT="https://smartpanchayat.co.in/api/api/v1"
```

> **Mock OTP**: set `MOCK_OTP=true` and `MOCK_OTP_CODE=123456` in `.env` for local testing.

---

## 1. Auth

### Register (sign up)
```bash
curl -X POST "$LOCAL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ramesh Patil", "mobile": "9876543210", "panchayat_id": 1}'

curl -X POST "$UAT/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ramesh Patil", "mobile": "9876543210", "panchayat_id": 1}'
```

### Send OTP
```bash
curl -X POST "$LOCAL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'
```

### Verify OTP (login)
```bash
curl -X POST "$LOCAL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "otp": "123456"}'
```

### Refresh Token
```bash
curl -X POST "$LOCAL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "your_refresh_token"}'
```

### Logout
```bash
curl -X POST "$LOCAL/auth/logout" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 2. Citizen Profile

### Get profile
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/citizen/profile"
```

### Update profile
```bash
curl -X PUT "$LOCAL/citizen/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ramesh Patil", "email": "ramesh@example.com"}'
```

### Upload profile photo *(NEW)*
```bash
# Local
curl -X POST "$LOCAL/citizen/profile/photo" \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/path/to/photo.jpg"

# UAT
curl -X POST "$UAT/citizen/profile/photo" \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

---

## 3. Home (static config)

### Quick service icons *(NEW)*
```bash
curl "$LOCAL/home/quick-services"
curl "$UAT/home/quick-services"
```

### Emergency contacts *(NEW)*
```bash
curl "$LOCAL/home/emergency-contacts"
curl "$UAT/home/emergency-contacts"
```

### App config / version check *(NEW)*
```bash
curl "$LOCAL/home/app-config"
curl "$UAT/home/app-config"
```

---

## 4. Panchayats

### List all panchayats
```bash
curl "$LOCAL/panchayats"
curl "$LOCAL/panchayats?search=nerle&district=Sindhudurg&page=1&limit=10"
```

### Get panchayat by ID
```bash
curl "$LOCAL/panchayats/1"
```

### Get stats
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/panchayats/1/stats"
```

### Get village profile (directory screen)
```bash
curl "$LOCAL/panchayats/1/profile"
curl "$UAT/panchayats/1/profile"
```

### Get quick services (panchayat-scoped)
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/panchayats/1/quick-services"
```

### Update village profile *(officer/admin)*
```bash
curl -X PUT "$LOCAL/panchayats/1/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "about": "Nerle is a coastal village in Sindhudurg.",
    "vision": "Paperless, inclusive, prosperous village by 2030.",
    "established_year": 1952,
    "area_sq_km": 12.5,
    "total_households": 310,
    "literacy_rate": 78.5,
    "main_occupation": "Agriculture",
    "languages_spoken": "Marathi, Konkani",
    "office_hours": "Mon-Sat 10:00-17:00",
    "contact_phone": "02362-123456",
    "office_address": "GP Office, Nerle, Tal. Malvan, Sindhudurg 416606"
  }'
```

### Add staff *(officer/admin)*
```bash
curl -X POST "$LOCAL/panchayats/1/staff" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunita More",
    "designation": "Upa Sarpanch",
    "role_type": "upa_sarpanch",
    "ward_no": 2,
    "phone": "9876500001",
    "since_year": 2022,
    "display_order": 1
  }'
```

### Update staff *(officer/admin)*
```bash
curl -X PUT "$LOCAL/panchayats/1/staff/2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876500099", "is_active": 1}'
```

### Delete staff *(officer/admin)*
```bash
curl -X DELETE "$LOCAL/panchayats/1/staff/2" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. Citizen Services *(NEW)*

### List all services
```bash
# All categories
curl "$LOCAL/citizen-services?panchayat_id=1"
curl "$UAT/citizen-services?panchayat_id=1"

# Filter by category
curl "$LOCAL/citizen-services?panchayat_id=1&category=certificate"
curl "$LOCAL/citizen-services?panchayat_id=1&category=tax"
```

### Get service detail (fees, documents, steps)
```bash
# birth | death | marriage | income | residence | property | water | receipt
curl "$LOCAL/citizen-services/birth"
curl "$LOCAL/citizen-services/marriage"
curl "$LOCAL/citizen-services/income"
curl "$LOCAL/citizen-services/water"

# UAT
curl "$UAT/citizen-services/birth"
curl "$UAT/citizen-services/marriage"
```

---

## 6. Complaints

### Get complaint categories *(NEW)*
```bash
curl "$LOCAL/complaints/categories"
curl "$UAT/complaints/categories"
```

### File a complaint
```bash
curl -X POST "$LOCAL/complaints" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "category": "water",
    "description": "Water pipe leaking near ward 3 bus stop.",
    "location": "Near bus stop, Ward 3",
    "latitude": 16.0030,
    "longitude": 73.4671,
    "photo_url": "https://smartpanchayat.co.in/uploads/complaint1.jpg"
  }'
```

### My complaints
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/complaints/mine"
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/complaints/mine?status=open&page=1&limit=10"
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/complaints/mine?category=road"
```

### Complaint detail with timeline *(ENHANCED)*
```bash
# Returns: timeline[], assigned_to, resolution_note, citizen_rating
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/complaints/1"
curl -H "Authorization: Bearer $TOKEN" "$UAT/complaints/1"
```

### All complaints by panchayat *(officer/admin)*
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "$LOCAL/complaints/panchayat/1?status=open&page=1&limit=10"

curl -H "Authorization: Bearer $TOKEN" \
  "$UAT/complaints/panchayat/1?status=in_progress&page=1&limit=20"
```

### Update complaint status *(officer/admin)*
```bash
curl -X PATCH "$LOCAL/complaints/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress", "remark": "Assigned to water dept."}'

# Resolve
curl -X PATCH "$LOCAL/complaints/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved", "remark": "Pipe repaired on 2026-07-20."}'
```

### Rate a resolved complaint *(NEW)*
```bash
# Local
curl -X POST "$LOCAL/complaints/1/rating" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "comment": "Resolved quickly, thank you"}'

# UAT
curl -X POST "$UAT/complaints/1/rating" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "चांगले काम केले"}'
```

---

## 7. Certificates

### Apply for certificate
```bash
# Birth
curl -X POST "$LOCAL/certificates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "birth",
    "applicant_name": "Baby Patil",
    "details": {"date_of_birth": "2026-01-15", "place_of_birth": "Nerle"}
  }'

# Death
curl -X POST "$LOCAL/certificates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "death",
    "applicant_name": "Shivaji Patil",
    "details": {"date_of_death": "2026-05-10", "place_of_death": "Nerle"}
  }'

# Marriage
curl -X POST "$LOCAL/certificates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "marriage",
    "applicant_name": "Ramesh Patil",
    "details": {"spouse_name": "Sunita Patil", "date_of_marriage": "2025-12-01"}
  }'

# Income
curl -X POST "$LOCAL/certificates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "income",
    "applicant_name": "Vijay More",
    "details": {"annual_income": 120000, "financial_year": "2025-26"}
  }'

# Property
curl -X POST "$LOCAL/certificates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "property",
    "applicant_name": "Vijay More",
    "details": {"property_no": "NR/W3/042", "survey_no": "S-117"}
  }'
```

### My certificates
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/certificates/mine"
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/certificates/mine?status=pending&type=birth"
```

### Certificate detail
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/certificates/1"
```

### Update certificate status *(officer/admin)*
```bash
# Approve
curl -X PATCH "$LOCAL/certificates/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# Mark ready with PDF link
curl -X PATCH "$LOCAL/certificates/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready",
    "pdf_url": "https://smartpanchayat.co.in/certificates/cert_001.pdf",
    "remark": "Certificate issued"
  }'

# Reject
curl -X PATCH "$LOCAL/certificates/1/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected", "remark": "Documents incomplete"}'
```

---

## 8. Water Bills

### Pending dues
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/water-bills/dues"
curl -H "Authorization: Bearer $TOKEN" "$UAT/water-bills/dues"
```

### Payment history *(NEW)*
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/water-bills/history"
curl -H "Authorization: Bearer $TOKEN" "$UAT/water-bills/history"
```

### Initiate payment
```bash
curl -X POST "$LOCAL/water-bills/1/pay/init" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "upi"}'
```

### Confirm payment
```bash
curl -X POST "$LOCAL/water-bills/1/pay/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_ref": "pay_xyz123", "order_id": "PAY-ABCD1234"}'
```

---

## 9. Payments *(NEW)*

### Payment config (UPI ID, gateway settings)
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/payments/config?panchayat_id=1"
curl -H "Authorization: Bearer $TOKEN" "$UAT/payments/config?panchayat_id=1"
```

### Full payment history (water bills + property tax combined)
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/payments/history"
curl -H "Authorization: Bearer $TOKEN" "$UAT/payments/history"
```

### Property tax dues
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/payments/property-tax/dues"
curl -H "Authorization: Bearer $TOKEN" "$UAT/payments/property-tax/dues"
```

### Receipt by receipt number
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/payments/RCP-2026-000318/receipt"
curl -H "Authorization: Bearer $TOKEN" "$UAT/payments/RCP-2026-000318/receipt"
```

---

## 10. Notices

### List notices
```bash
curl "$LOCAL/notices"
curl "$LOCAL/notices?panchayat_id=1&type=general&page=1&limit=10"
curl "$UAT/notices?panchayat_id=1"
```

> Response now includes `is_pinned`, `has_attachment`, `attachment_url`, `author`.  
> Pinned notices appear first.

### Notice detail
```bash
curl "$LOCAL/notices/1"
curl "$UAT/notices/1"
```

### Create notice *(auth required)*
```bash
curl -X POST "$LOCAL/notices" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "title": "ग्रामसभा बैठक सूचना",
    "body": "दि. २५ जुलै रोजी सकाळी ११ वाजता ग्रामसभा होणार आहे.",
    "type": "gramSabha"
  }'
```

### Delete notice *(auth required)*
```bash
curl -X DELETE "$LOCAL/notices/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 11. Schemes

### List schemes (includes is_bookmarked when authenticated)
```bash
# Without auth
curl "$LOCAL/schemes"
curl "$LOCAL/schemes?category=agriculture&search=PM&page=1&limit=10"

# With auth (is_bookmarked field per scheme)
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/schemes"
curl -H "Authorization: Bearer $TOKEN" "$UAT/schemes"
```

### Scheme detail
```bash
curl "$LOCAL/schemes/1"
```

### Bookmark a scheme *(NEW)*
```bash
# Add bookmark
curl -X POST "$LOCAL/schemes/1/bookmark" \
  -H "Authorization: Bearer $TOKEN"

curl -X POST "$UAT/schemes/4/bookmark" \
  -H "Authorization: Bearer $TOKEN"

# Remove bookmark
curl -X DELETE "$LOCAL/schemes/1/bookmark" \
  -H "Authorization: Bearer $TOKEN"

curl -X DELETE "$UAT/schemes/4/bookmark" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 12. Gram Sabha *(NEW)*

### List meetings
```bash
curl "$LOCAL/gram-sabha/meetings?panchayat_id=1"
curl "$UAT/gram-sabha/meetings?panchayat_id=1"
```

### RSVP — Submit attendance
```bash
# Attending
curl -X POST "$LOCAL/gram-sabha/attendance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meeting_id": 1, "attending": true}'

# Not attending
curl -X POST "$UAT/gram-sabha/attendance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meeting_id": 1, "attending": false}'
```

### List polls
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/gram-sabha/polls?panchayat_id=1"
curl -H "Authorization: Bearer $TOKEN" "$UAT/gram-sabha/polls?panchayat_id=1"
```

### Submit vote
```bash
# Local
curl -X POST "$LOCAL/gram-sabha/polls/1/vote" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"option_id": 1}'

# UAT
curl -X POST "$UAT/gram-sabha/polls/1/vote" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"option_id": 2}'
```

---

## 13. AI Assistant *(NEW)*

```bash
# Marathi — water bill
curl -X POST "$LOCAL/ai/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "पाणीपट्टी कशी भरायची?", "lang": "mr", "panchayat_id": "1"}'

# Marathi — certificate
curl -X POST "$LOCAL/ai/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "दाखला कसा मिळवायचा?", "lang": "mr", "panchayat_id": "1"}'

# Marathi — schemes
curl -X POST "$LOCAL/ai/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "सरकारी योजना कोणत्या आहेत?", "lang": "mr", "panchayat_id": "1"}'

# Hindi — complaint
curl -X POST "$LOCAL/ai/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "शिकायत कैसे करें?", "lang": "hi", "panchayat_id": "1"}'

# English — birth certificate
curl -X POST "$UAT/ai/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "how to get birth certificate", "lang": "en", "panchayat_id": "1"}'
```

---

## 14. Notifications

### List user notifications *(NEW)*
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/notifications"
curl -H "Authorization: Bearer $TOKEN" "$UAT/notifications"
```

### Unread count *(NEW)*
```bash
curl -H "Authorization: Bearer $TOKEN" "$LOCAL/notifications/unread-count"
curl -H "Authorization: Bearer $TOKEN" "$UAT/notifications/unread-count"
```

### Mark one as read *(NEW)*
```bash
curl -X PATCH "$LOCAL/notifications/1/read" \
  -H "Authorization: Bearer $TOKEN"
```

### Mark all as read *(NEW)*
```bash
curl -X POST "$LOCAL/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN"

curl -X POST "$UAT/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN"
```

### Register device token (FCM)
```bash
curl -X POST "$LOCAL/notifications/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "fcm_device_token_here", "platform": "android"}'

curl -X POST "$LOCAL/notifications/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "apns_device_token_here", "platform": "ios"}'
```

### Unregister device token
```bash
curl -X DELETE "$LOCAL/notifications/unregister" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "fcm_device_token_here"}'
```

### Send to specific citizen *(admin)*
```bash
curl -X POST "$LOCAL/notifications/send/user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "citizen_id": 5,
    "title": "तक्रार अपडेट",
    "body": "तुमची तक्रार #CMP-123456 सोडवली गेली आहे.",
    "data": {"complaint_id": "1", "status": "resolved"}
  }'
```

### Broadcast to entire panchayat *(admin)*
```bash
# Emergency water cut
curl -X POST "$LOCAL/notifications/send/panchayat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "title": "पाणी कपात सूचना",
    "body": "उद्या सकाळी ९ ते दुपारी १ वाजेपर्यंत पाणीपुरवठा बंद राहील.",
    "data": {"type": "emergency"}
  }'

# Gram Sabha reminder
curl -X POST "$UAT/notifications/send/panchayat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "title": "ग्रामसभा आमंत्रण",
    "body": "२५ जुलै रोजी होणाऱ्या बैठकीला नक्की उपस्थित रहा.",
    "data": {"type": "gramSabha"}
  }'
```

---

## 15. Weather

### Current weather by coordinates
```bash
# Nerle, Sindhudurg
curl "$LOCAL/weather/current?lat=16.003&lon=73.467"

# Pune
curl "$LOCAL/weather/current?lat=18.5204&lon=73.8567"

# UAT
curl "$UAT/weather/current?lat=16.003&lon=73.467"
```

---

## 16. Upload

### Upload file (image or PDF)
```bash
# Local
curl -X POST "$LOCAL/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf"

curl -X POST "$LOCAL/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/photo.jpg"

# UAT
curl -X POST "$UAT/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf"
```

---

## Quick Reference Table

| Module | Method | Path | Auth | Status |
|--------|--------|------|------|--------|
| Auth | POST | `/auth/register` | No | — |
| Auth | POST | `/auth/send-otp` | No | — |
| Auth | POST | `/auth/verify-otp` | No | — |
| Auth | POST | `/auth/refresh` | No | — |
| Auth | POST | `/auth/logout` | Yes | — |
| Citizen | GET | `/citizen/profile` | Yes | — |
| Citizen | PUT | `/citizen/profile` | Yes | — |
| Citizen | POST | `/citizen/profile/photo` | Yes | **NEW** |
| Home | GET | `/home/quick-services` | No | **NEW** |
| Home | GET | `/home/emergency-contacts` | No | **NEW** |
| Home | GET | `/home/app-config` | No | **NEW** |
| Panchayat | GET | `/panchayats` | No | — |
| Panchayat | GET | `/panchayats/:id` | No | — |
| Panchayat | GET | `/panchayats/:id/stats` | Yes | — |
| Panchayat | GET | `/panchayats/:id/profile` | No | — |
| Panchayat | GET | `/panchayats/:id/quick-services` | Yes | — |
| Panchayat | PUT | `/panchayats/:id/profile` | Officer | — |
| Panchayat | POST | `/panchayats/:id/staff` | Officer | — |
| Panchayat | PUT | `/panchayats/:id/staff/:staff_id` | Officer | — |
| Panchayat | DELETE | `/panchayats/:id/staff/:staff_id` | Officer | — |
| Citizen Services | GET | `/citizen-services` | No | **NEW** |
| Citizen Services | GET | `/citizen-services/:id` | No | **NEW** |
| Complaints | GET | `/complaints/categories` | No | **NEW** |
| Complaints | POST | `/complaints` | Yes | — |
| Complaints | GET | `/complaints/mine` | Yes | — |
| Complaints | GET | `/complaints/:id` | Yes | Enhanced |
| Complaints | GET | `/complaints/panchayat/:id` | Yes | — |
| Complaints | PATCH | `/complaints/:id/status` | Yes | — |
| Complaints | POST | `/complaints/:id/rating` | Yes | **NEW** |
| Certificates | POST | `/certificates` | Yes | — |
| Certificates | GET | `/certificates/mine` | Yes | — |
| Certificates | GET | `/certificates/:id` | Yes | — |
| Certificates | PATCH | `/certificates/:id/status` | Officer | — |
| Water Bills | GET | `/water-bills/dues` | Yes | — |
| Water Bills | GET | `/water-bills/history` | Yes | **NEW** |
| Water Bills | POST | `/water-bills/:id/pay/init` | Yes | — |
| Water Bills | POST | `/water-bills/:id/pay/confirm` | Yes | — |
| Payments | GET | `/payments/config` | Yes | **NEW** |
| Payments | GET | `/payments/history` | Yes | **NEW** |
| Payments | GET | `/payments/property-tax/dues` | Yes | **NEW** |
| Payments | GET | `/payments/:receipt_no/receipt` | Yes | **NEW** |
| Notices | GET | `/notices` | No | Enhanced |
| Notices | GET | `/notices/:id` | No | Enhanced |
| Notices | POST | `/notices` | Yes | — |
| Notices | DELETE | `/notices/:id` | Yes | — |
| Schemes | GET | `/schemes` | No | Enhanced |
| Schemes | GET | `/schemes/:id` | No | — |
| Schemes | POST | `/schemes/:id/bookmark` | Yes | **NEW** |
| Schemes | DELETE | `/schemes/:id/bookmark` | Yes | **NEW** |
| Gram Sabha | GET | `/gram-sabha/meetings` | No | **NEW** |
| Gram Sabha | POST | `/gram-sabha/attendance` | Yes | **NEW** |
| Gram Sabha | GET | `/gram-sabha/polls` | Yes | **NEW** |
| Gram Sabha | POST | `/gram-sabha/polls/:id/vote` | Yes | **NEW** |
| AI | POST | `/ai/chat` | Yes | **NEW** |
| Notifications | GET | `/notifications` | Yes | **NEW** |
| Notifications | GET | `/notifications/unread-count` | Yes | **NEW** |
| Notifications | POST | `/notifications/read-all` | Yes | **NEW** |
| Notifications | PATCH | `/notifications/:id/read` | Yes | **NEW** |
| Notifications | POST | `/notifications/register` | Yes | — |
| Notifications | DELETE | `/notifications/unregister` | Yes | — |
| Notifications | POST | `/notifications/send/user` | Admin | — |
| Notifications | POST | `/notifications/send/panchayat` | Admin | — |
| Weather | GET | `/weather/current` | No | — |
| Upload | POST | `/upload` | Yes | — |

---

## Notes

- All responses: `{ success, message, data, meta }` envelope.
- Paginated responses add `pagination: { total, page, limit, pages }`.
- `401` = missing/expired token · `403` = role not allowed · `422` = validation error.
- `MOCK_OTP=true` + `MOCK_OTP_CODE=123456` in `.env` allows any mobile to login during local dev.
- Run `migrations/add_missing_tables.sql` on the DB before deploying new-module endpoints.
