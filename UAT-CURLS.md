# Smart Panchayat API — UAT cURL Reference

> **UAT Base URL:** `https://smartpanchayat.co.in/api/api/v1`
>
> Replace `YOUR_TOKEN` with the JWT access token from the login step below.

---

## Step 1 — Get a Token

```bash
# Send OTP to your mobile number
curl -X POST https://smartpanchayat.co.in/api/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'

# Verify OTP → copy the access_token from the response
curl -X POST https://smartpanchayat.co.in/api/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "otp": "123456"}'
```

> Mock OTP: use OTP `123456` when `MOCK_OTP=true` is set on the server.

---

## 1. Auth

### Register new citizen
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Ramesh Patil", "mobile": "9876543210", "panchayat_id": 1}'
```

### Send OTP
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999"}'
```

### Verify OTP (login)
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "otp": "123456"}'
```

### Refresh access token
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

### Logout
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. Citizen Profile

### Get my profile
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update my profile
```bash
curl -X PUT https://smartpanchayat.co.in/api/api/v1/citizen/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ramesh Patil", "email": "ramesh@example.com", "address": "Ward 3, Nerle"}'
```

### Upload profile photo
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/citizen/profile/photo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

---

## 3. Home (Static Config)

### Quick service icons
```bash
curl https://smartpanchayat.co.in/api/api/v1/home/quick-services
```

### Emergency contacts
```bash
curl https://smartpanchayat.co.in/api/api/v1/home/emergency-contacts
```

### App config / version check
```bash
curl https://smartpanchayat.co.in/api/api/v1/home/app-config
```

---

## 4. Panchayats

### List all panchayats
```bash
curl https://smartpanchayat.co.in/api/api/v1/panchayats
```

### Search panchayats
```bash
curl "https://smartpanchayat.co.in/api/api/v1/panchayats?search=nerle&district=Sindhudurg&page=1&limit=10"
```

### Get panchayat by ID
```bash
curl https://smartpanchayat.co.in/api/api/v1/panchayats/1
```

### Get panchayat stats
```bash
curl https://smartpanchayat.co.in/api/api/v1/panchayats/1/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get village profile
```bash
curl https://smartpanchayat.co.in/api/api/v1/panchayats/1/profile
```

### Get quick services (panchayat-scoped)
```bash
curl https://smartpanchayat.co.in/api/api/v1/panchayats/1/quick-services \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update village profile (officer/admin only)
```bash
curl -X PUT https://smartpanchayat.co.in/api/api/v1/panchayats/1/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "about": "Nerle is a coastal village in Sindhudurg district.",
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

### Add staff member (officer/admin only)
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/panchayats/1/staff \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

### Update staff member (officer/admin only)
```bash
curl -X PUT https://smartpanchayat.co.in/api/api/v1/panchayats/1/staff/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876500099", "is_active": 1}'
```

### Delete staff member (officer/admin only)
```bash
curl -X DELETE https://smartpanchayat.co.in/api/api/v1/panchayats/1/staff/2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5. Citizen Services

### List all services
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services
```

### Filter by category (certificate / tax)
```bash
curl "https://smartpanchayat.co.in/api/api/v1/citizen-services?category=certificate"
curl "https://smartpanchayat.co.in/api/api/v1/citizen-services?category=tax"
```

### Get service detail — Birth certificate
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services/birth
```

### Get service detail — Death certificate
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services/death
```

### Get service detail — Marriage certificate
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services/marriage
```

### Get service detail — Income certificate
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services/income
```

### Get service detail — Residence certificate
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services/residence
```

### Get service detail — Property certificate
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services/property
```

### Get service detail — Water connection
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services/water
```

### Get service detail — Receipt/payment
```bash
curl https://smartpanchayat.co.in/api/api/v1/citizen-services/receipt
```

---

## 6. Complaints

### Get complaint categories (public)
```bash
curl https://smartpanchayat.co.in/api/api/v1/complaints/categories
```

### File a new complaint
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/complaints \
  -H "Authorization: Bearer YOUR_TOKEN" \
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
curl https://smartpanchayat.co.in/api/api/v1/complaints/mine \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### My complaints — filtered
```bash
curl "https://smartpanchayat.co.in/api/api/v1/complaints/mine?status=open&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl "https://smartpanchayat.co.in/api/api/v1/complaints/mine?category=road" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Complaint detail with timeline
```bash
curl https://smartpanchayat.co.in/api/api/v1/complaints/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### All complaints for a panchayat (officer/admin only)
```bash
curl "https://smartpanchayat.co.in/api/api/v1/complaints/panchayat/1?status=open&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl "https://smartpanchayat.co.in/api/api/v1/complaints/panchayat/1?status=in_progress&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update complaint status (officer/admin only)
```bash
# Assign / In Progress
curl -X PATCH https://smartpanchayat.co.in/api/api/v1/complaints/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress", "remark": "Assigned to water department."}'

# Resolve
curl -X PATCH https://smartpanchayat.co.in/api/api/v1/complaints/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved", "remark": "Pipe repaired on 2026-07-20."}'
```

### Rate a resolved complaint (citizen)
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/complaints/1/rating \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "comment": "Resolved quickly, thank you"}'
```

---

## 7. Certificates

### Apply — Birth certificate
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/certificates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "birth",
    "applicant_name": "Baby Patil",
    "details": {"date_of_birth": "2026-01-15", "place_of_birth": "Nerle"}
  }'
```

### Apply — Death certificate
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/certificates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "death",
    "applicant_name": "Shivaji Patil",
    "details": {"date_of_death": "2026-05-10", "place_of_death": "Nerle"}
  }'
```

### Apply — Marriage certificate
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/certificates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "marriage",
    "applicant_name": "Ramesh Patil",
    "details": {"spouse_name": "Sunita Patil", "date_of_marriage": "2025-12-01"}
  }'
```

### Apply — Income certificate
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/certificates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "income",
    "applicant_name": "Vijay More",
    "details": {"annual_income": 120000, "financial_year": "2025-26"}
  }'
```

### Apply — Residence certificate
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/certificates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "type": "residence",
    "applicant_name": "Vijay More",
    "details": {"address": "Ward 3, Nerle, Sindhudurg", "since_year": 2010}
  }'
```

### Apply — Property certificate
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/certificates \
  -H "Authorization: Bearer YOUR_TOKEN" \
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
curl https://smartpanchayat.co.in/api/api/v1/certificates/mine \
  -H "Authorization: Bearer YOUR_TOKEN"

curl "https://smartpanchayat.co.in/api/api/v1/certificates/mine?status=pending&type=birth" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Certificate detail
```bash
curl https://smartpanchayat.co.in/api/api/v1/certificates/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update certificate status (officer/admin only)
```bash
# Approve
curl -X PATCH https://smartpanchayat.co.in/api/api/v1/certificates/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# Mark ready with PDF link
curl -X PATCH https://smartpanchayat.co.in/api/api/v1/certificates/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready",
    "pdf_url": "https://smartpanchayat.co.in/certificates/cert_001.pdf",
    "remark": "Certificate issued"
  }'

# Reject
curl -X PATCH https://smartpanchayat.co.in/api/api/v1/certificates/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected", "remark": "Documents incomplete. Please resubmit."}'
```

---

## 8. Water Bills

### My pending dues
```bash
curl https://smartpanchayat.co.in/api/api/v1/water-bills/dues \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Payment history
```bash
curl https://smartpanchayat.co.in/api/api/v1/water-bills/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Initiate payment
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/water-bills/1/pay/init \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "upi"}'
```

### Confirm payment
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/water-bills/1/pay/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_ref": "pay_xyz123", "order_id": "PAY-ABCD1234"}'
```

---

## 9. Payments

### Payment config (UPI ID / gateway settings for panchayat)
```bash
curl "https://smartpanchayat.co.in/api/api/v1/payments/config?panchayat_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Full payment history (water bills + property tax combined)
```bash
curl https://smartpanchayat.co.in/api/api/v1/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Property tax dues
```bash
curl https://smartpanchayat.co.in/api/api/v1/payments/property-tax/dues \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get receipt by receipt number
```bash
curl https://smartpanchayat.co.in/api/api/v1/payments/RCP-2026-000318/receipt \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 10. Notices

### List notices (public)
```bash
curl https://smartpanchayat.co.in/api/api/v1/notices
```

### List notices — filtered by panchayat
```bash
curl "https://smartpanchayat.co.in/api/api/v1/notices?panchayat_id=1"
curl "https://smartpanchayat.co.in/api/api/v1/notices?panchayat_id=1&type=gramSabha&page=1&limit=10"
```

### Notice types
```
general | gramSabha | tender | emergency | holiday | scheme
```

### Notice detail
```bash
curl https://smartpanchayat.co.in/api/api/v1/notices/1
```

### Create notice (auth required)
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/notices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "title": "ग्रामसभा बैठक सूचना",
    "body": "दि. २५ जुलै रोजी सकाळी ११ वाजता ग्रामपंचायत कार्यालयात ग्रामसभा होणार आहे.",
    "type": "gramSabha"
  }'
```

### Delete notice (auth required)
```bash
curl -X DELETE https://smartpanchayat.co.in/api/api/v1/notices/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 11. Schemes

### List all schemes (public)
```bash
curl https://smartpanchayat.co.in/api/api/v1/schemes
```

### Search and filter schemes
```bash
curl "https://smartpanchayat.co.in/api/api/v1/schemes?category=agriculture&search=PM&page=1&limit=10"
```

### List schemes with bookmarks (authenticated)
```bash
curl https://smartpanchayat.co.in/api/api/v1/schemes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Scheme detail
```bash
curl https://smartpanchayat.co.in/api/api/v1/schemes/1
```

### Bookmark a scheme
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/schemes/1/bookmark \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Remove bookmark
```bash
curl -X DELETE https://smartpanchayat.co.in/api/api/v1/schemes/1/bookmark \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 12. Gram Sabha

### List meetings (public)
```bash
curl "https://smartpanchayat.co.in/api/api/v1/gram-sabha/meetings?panchayat_id=1"
```

### RSVP — Mark attending
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/gram-sabha/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meeting_id": 1, "attending": true}'
```

### RSVP — Mark not attending
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/gram-sabha/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meeting_id": 1, "attending": false}'
```

### List polls
```bash
curl "https://smartpanchayat.co.in/api/api/v1/gram-sabha/polls?panchayat_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Submit vote
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/gram-sabha/polls/1/vote \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"option_id": 1}'
```

---

## 13. AI Assistant

### Ask in Marathi — water bill
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "पाणीपट्टी कशी भरायची?", "lang": "mr", "panchayat_id": "1"}'
```

### Ask in Marathi — certificate
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "दाखला कसा मिळवायचा?", "lang": "mr", "panchayat_id": "1"}'
```

### Ask in Marathi — schemes
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "सरकारी योजना कोणत्या आहेत?", "lang": "mr", "panchayat_id": "1"}'
```

### Ask in Marathi — gram sabha
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "ग्रामसभा कधी आहे?", "lang": "mr", "panchayat_id": "1"}'
```

### Ask in Hindi — complaint
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "शिकायत कैसे करें?", "lang": "hi", "panchayat_id": "1"}'
```

### Ask in English
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "how to get birth certificate", "lang": "en", "panchayat_id": "1"}'
```

---

## 14. Notifications

### List my notifications
```bash
curl https://smartpanchayat.co.in/api/api/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get unread count
```bash
curl https://smartpanchayat.co.in/api/api/v1/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark one notification as read
```bash
curl -X PATCH https://smartpanchayat.co.in/api/api/v1/notifications/1/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark all notifications as read
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Register device token (FCM push)
```bash
# Android
curl -X POST https://smartpanchayat.co.in/api/api/v1/notifications/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "fcm_device_token_here", "platform": "android"}'

# iOS
curl -X POST https://smartpanchayat.co.in/api/api/v1/notifications/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "apns_device_token_here", "platform": "ios"}'
```

### Unregister device token
```bash
curl -X DELETE https://smartpanchayat.co.in/api/api/v1/notifications/unregister \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "fcm_device_token_here"}'
```

### Send push to a specific citizen (admin only)
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/notifications/send/user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "citizen_id": 5,
    "title": "तक्रार अपडेट",
    "body": "तुमची तक्रार #CMP-123456 सोडवली गेली आहे.",
    "data": {"complaint_id": "1", "status": "resolved"}
  }'
```

### Broadcast to entire panchayat (admin only)
```bash
# Gram Sabha reminder
curl -X POST https://smartpanchayat.co.in/api/api/v1/notifications/send/panchayat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "title": "ग्रामसभा आमंत्रण",
    "body": "२५ जुलै रोजी होणाऱ्या बैठकीला नक्की उपस्थित रहा.",
    "data": {"type": "gramSabha"}
  }'

# Emergency water cut
curl -X POST https://smartpanchayat.co.in/api/api/v1/notifications/send/panchayat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "panchayat_id": 1,
    "title": "पाणी कपात सूचना",
    "body": "उद्या सकाळी ९ ते दुपारी १ वाजेपर्यंत पाणीपुरवठा बंद राहील.",
    "data": {"type": "emergency"}
  }'
```

---

## 15. Weather

### Current weather — Nerle, Sindhudurg
```bash
curl "https://smartpanchayat.co.in/api/api/v1/weather/current?lat=16.003&lon=73.467"
```

### Current weather — Pune
```bash
curl "https://smartpanchayat.co.in/api/api/v1/weather/current?lat=18.5204&lon=73.8567"
```

### Current weather — Mumbai
```bash
curl "https://smartpanchayat.co.in/api/api/v1/weather/current?lat=19.0760&lon=72.8777"
```

---

## 16. File Upload

### Upload image or PDF
```bash
curl -X POST https://smartpanchayat.co.in/api/api/v1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf"

curl -X POST https://smartpanchayat.co.in/api/api/v1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/photo.jpg"
```

---

## Quick Reference Table

| # | Module | Method | Full UAT URL | Auth |
|---|--------|--------|--------------|------|
| 1 | Auth | POST | `https://smartpanchayat.co.in/api/api/v1/auth/register` | No |
| 2 | Auth | POST | `https://smartpanchayat.co.in/api/api/v1/auth/send-otp` | No |
| 3 | Auth | POST | `https://smartpanchayat.co.in/api/api/v1/auth/verify-otp` | No |
| 4 | Auth | POST | `https://smartpanchayat.co.in/api/api/v1/auth/refresh` | No |
| 5 | Auth | POST | `https://smartpanchayat.co.in/api/api/v1/auth/logout` | Yes |
| 6 | Citizen | GET | `https://smartpanchayat.co.in/api/api/v1/citizen/profile` | Yes |
| 7 | Citizen | PUT | `https://smartpanchayat.co.in/api/api/v1/citizen/profile` | Yes |
| 8 | Citizen | POST | `https://smartpanchayat.co.in/api/api/v1/citizen/profile/photo` | Yes |
| 9 | Home | GET | `https://smartpanchayat.co.in/api/api/v1/home/quick-services` | No |
| 10 | Home | GET | `https://smartpanchayat.co.in/api/api/v1/home/emergency-contacts` | No |
| 11 | Home | GET | `https://smartpanchayat.co.in/api/api/v1/home/app-config` | No |
| 12 | Panchayat | GET | `https://smartpanchayat.co.in/api/api/v1/panchayats` | No |
| 13 | Panchayat | GET | `https://smartpanchayat.co.in/api/api/v1/panchayats/1` | No |
| 14 | Panchayat | GET | `https://smartpanchayat.co.in/api/api/v1/panchayats/1/stats` | Yes |
| 15 | Panchayat | GET | `https://smartpanchayat.co.in/api/api/v1/panchayats/1/profile` | No |
| 16 | Panchayat | GET | `https://smartpanchayat.co.in/api/api/v1/panchayats/1/quick-services` | Yes |
| 17 | Panchayat | PUT | `https://smartpanchayat.co.in/api/api/v1/panchayats/1/profile` | Officer |
| 18 | Panchayat | POST | `https://smartpanchayat.co.in/api/api/v1/panchayats/1/staff` | Officer |
| 19 | Panchayat | PUT | `https://smartpanchayat.co.in/api/api/v1/panchayats/1/staff/2` | Officer |
| 20 | Panchayat | DELETE | `https://smartpanchayat.co.in/api/api/v1/panchayats/1/staff/2` | Officer |
| 21 | Citizen Services | GET | `https://smartpanchayat.co.in/api/api/v1/citizen-services` | No |
| 22 | Citizen Services | GET | `https://smartpanchayat.co.in/api/api/v1/citizen-services/birth` | No |
| 23 | Complaints | GET | `https://smartpanchayat.co.in/api/api/v1/complaints/categories` | No |
| 24 | Complaints | POST | `https://smartpanchayat.co.in/api/api/v1/complaints` | Yes |
| 25 | Complaints | GET | `https://smartpanchayat.co.in/api/api/v1/complaints/mine` | Yes |
| 26 | Complaints | GET | `https://smartpanchayat.co.in/api/api/v1/complaints/1` | Yes |
| 27 | Complaints | GET | `https://smartpanchayat.co.in/api/api/v1/complaints/panchayat/1` | Officer |
| 28 | Complaints | PATCH | `https://smartpanchayat.co.in/api/api/v1/complaints/1/status` | Officer |
| 29 | Complaints | POST | `https://smartpanchayat.co.in/api/api/v1/complaints/1/rating` | Yes |
| 30 | Certificates | POST | `https://smartpanchayat.co.in/api/api/v1/certificates` | Yes |
| 31 | Certificates | GET | `https://smartpanchayat.co.in/api/api/v1/certificates/mine` | Yes |
| 32 | Certificates | GET | `https://smartpanchayat.co.in/api/api/v1/certificates/1` | Yes |
| 33 | Certificates | PATCH | `https://smartpanchayat.co.in/api/api/v1/certificates/1/status` | Officer |
| 34 | Water Bills | GET | `https://smartpanchayat.co.in/api/api/v1/water-bills/dues` | Yes |
| 35 | Water Bills | GET | `https://smartpanchayat.co.in/api/api/v1/water-bills/history` | Yes |
| 36 | Water Bills | POST | `https://smartpanchayat.co.in/api/api/v1/water-bills/1/pay/init` | Yes |
| 37 | Water Bills | POST | `https://smartpanchayat.co.in/api/api/v1/water-bills/1/pay/confirm` | Yes |
| 38 | Payments | GET | `https://smartpanchayat.co.in/api/api/v1/payments/config?panchayat_id=1` | Yes |
| 39 | Payments | GET | `https://smartpanchayat.co.in/api/api/v1/payments/history` | Yes |
| 40 | Payments | GET | `https://smartpanchayat.co.in/api/api/v1/payments/property-tax/dues` | Yes |
| 41 | Payments | GET | `https://smartpanchayat.co.in/api/api/v1/payments/RCP-2026-000318/receipt` | Yes |
| 42 | Notices | GET | `https://smartpanchayat.co.in/api/api/v1/notices` | No |
| 43 | Notices | GET | `https://smartpanchayat.co.in/api/api/v1/notices/1` | No |
| 44 | Notices | POST | `https://smartpanchayat.co.in/api/api/v1/notices` | Yes |
| 45 | Notices | DELETE | `https://smartpanchayat.co.in/api/api/v1/notices/1` | Yes |
| 46 | Schemes | GET | `https://smartpanchayat.co.in/api/api/v1/schemes` | No |
| 47 | Schemes | GET | `https://smartpanchayat.co.in/api/api/v1/schemes/1` | No |
| 48 | Schemes | POST | `https://smartpanchayat.co.in/api/api/v1/schemes/1/bookmark` | Yes |
| 49 | Schemes | DELETE | `https://smartpanchayat.co.in/api/api/v1/schemes/1/bookmark` | Yes |
| 50 | Gram Sabha | GET | `https://smartpanchayat.co.in/api/api/v1/gram-sabha/meetings?panchayat_id=1` | No |
| 51 | Gram Sabha | POST | `https://smartpanchayat.co.in/api/api/v1/gram-sabha/attendance` | Yes |
| 52 | Gram Sabha | GET | `https://smartpanchayat.co.in/api/api/v1/gram-sabha/polls?panchayat_id=1` | Yes |
| 53 | Gram Sabha | POST | `https://smartpanchayat.co.in/api/api/v1/gram-sabha/polls/1/vote` | Yes |
| 54 | AI | POST | `https://smartpanchayat.co.in/api/api/v1/ai/chat` | Yes |
| 55 | Notifications | GET | `https://smartpanchayat.co.in/api/api/v1/notifications` | Yes |
| 56 | Notifications | GET | `https://smartpanchayat.co.in/api/api/v1/notifications/unread-count` | Yes |
| 57 | Notifications | POST | `https://smartpanchayat.co.in/api/api/v1/notifications/read-all` | Yes |
| 58 | Notifications | PATCH | `https://smartpanchayat.co.in/api/api/v1/notifications/1/read` | Yes |
| 59 | Notifications | POST | `https://smartpanchayat.co.in/api/api/v1/notifications/register` | Yes |
| 60 | Notifications | DELETE | `https://smartpanchayat.co.in/api/api/v1/notifications/unregister` | Yes |
| 61 | Notifications | POST | `https://smartpanchayat.co.in/api/api/v1/notifications/send/user` | Admin |
| 62 | Notifications | POST | `https://smartpanchayat.co.in/api/api/v1/notifications/send/panchayat` | Admin |
| 63 | Weather | GET | `https://smartpanchayat.co.in/api/api/v1/weather/current?lat=16.003&lon=73.467` | No |
| 64 | Upload | POST | `https://smartpanchayat.co.in/api/api/v1/upload` | Yes |

---

## Response Format

All endpoints return:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Paginated endpoints also include:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request / missing fields |
| 401 | Missing or expired token |
| 403 | Role not allowed (need officer/admin) |
| 404 | Record not found |
| 409 | Conflict (duplicate vote, already rated, etc.) |
| 422 | Validation error |
| 429 | Too many requests (rate limit) |
| 500 | Server error |
