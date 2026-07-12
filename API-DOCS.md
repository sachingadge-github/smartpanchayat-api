# Smart Panchayat — API Documentation
**Version:** 1.0.0 | **Base URL:** `{{base_url}}/api/v1` | **By:** NexBuild

---

## Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": { "timestamp": "2026-07-12T10:00:00.000Z", "version": "1.0.0" }
}
```

### Paginated
```json
{
  "success": true,
  "message": "Records fetched",
  "data": [],
  "pagination": { "total": 100, "page": 1, "limit": 10, "pages": 10 },
  "meta": { "timestamp": "...", "version": "1.0.0" }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "error": { "code": "VALIDATION_ERROR", "details": [{ "field": "mobile", "message": "required" }] },
  "meta": { "timestamp": "...", "version": "1.0.0" }
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized — token missing or invalid |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Authentication
All protected routes require: `Authorization: Bearer <accessToken>`

---

## Module 1 — Auth

### POST `/auth/send-otp`
Send OTP to mobile number. **Mock mode:** OTP is returned in response and logged to console.

**Request Body:**
```json
{ "mobile": "9876543210" }
```
**Response:**
```json
{
  "success": true,
  "message": "[MOCK] OTP for 9876543210 is 123456",
  "data": { "otp": "123456" }
}
```

---

### POST `/auth/verify-otp`
Verify OTP. Creates citizen account if first login.

**Request Body:**
```json
{ "mobile": "9876543210", "otp": "123456" }
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "isNew": false,
    "citizen": { "id": 1, "mobile": "9876543210", "name": null, "role": "citizen" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### POST `/auth/refresh`
Refresh access token.

**Request Body:** `{ "refreshToken": "eyJ..." }`

---

### POST `/auth/logout` 🔒
Invalidate session.

---

## Module 2 — Citizen

### GET `/citizen/profile` 🔒
Get logged-in citizen's profile with panchayat details.

---

### PUT `/citizen/profile` 🔒
Update profile.

**Request Body:**
```json
{
  "name": "Sachin Gadge",
  "gender": "male",
  "age": 30,
  "address": "At Post Nerle, Tal Valva, Dist Sangli",
  "panchayat_id": 1
}
```

---

## Module 3 — Panchayats

### GET `/panchayats`
List all panchayats with pagination.

**Query Params:** `search`, `district`, `taluka`, `page`, `limit`

---

### GET `/panchayats/:id`
Get panchayat details with citizen count and open complaint count.

---

### GET `/panchayats/:id/stats` 🔒
Get full stats — total citizens, complaints, resolved, notices, amount collected.

---

## Module 4 — Complaints

### POST `/complaints` 🔒
File a complaint. Supports photo upload (multipart/form-data).

**Form Data:**
| Field | Type | Required |
|-------|------|----------|
| panchayat_id | number | ✅ |
| category | string (road/water/streetlight/garbage/drainage/tree/other) | ✅ |
| description | string (min 10 chars) | ✅ |
| location | string | ❌ |
| latitude | number | ❌ |
| longitude | number | ❌ |
| photo | file (jpg/png/webp, max 5MB) | ❌ |

**Response:** Complaint object with `reference_no` (e.g. `CMP-241012`)

---

### GET `/complaints/mine` 🔒
List my complaints.

**Query Params:** `status` (open/in_progress/resolved/rejected), `category`, `page`, `limit`

---

### GET `/complaints/:id` 🔒
Get single complaint by ID.

---

### GET `/complaints/panchayat/:panchayatId` 🔒
List all complaints for a panchayat (officer view).

---

### PATCH `/complaints/:id/status` 🔒
Update complaint status (officer action).

**Request Body:**
```json
{ "status": "resolved", "remark": "Road repaired by PWD team on July 10" }
```

---

## Module 5 — Certificates

### POST `/certificates` 🔒
Apply for a certificate.

**Request Body:**
```json
{
  "panchayat_id": 1,
  "type": "birth",
  "applicant_name": "Arjun Sachin Gadge",
  "details": {
    "date_of_birth": "2020-05-15",
    "place_of_birth": "Nerle",
    "father_name": "Sachin Gadge",
    "mother_name": "Priya Gadge"
  }
}
```

**Types:** `birth` | `death` | `income` | `residence`

---

### GET `/certificates/mine` 🔒
List my certificate applications.

**Query Params:** `status`, `type`, `page`, `limit`

---

### GET `/certificates/:id` 🔒
Get certificate application detail (includes `pdf_url` when ready).

---

### PATCH `/certificates/:id/status` 🔒
Update certificate status (officer).

**Request Body:**
```json
{ "status": "ready", "pdf_url": "https://...", "remark": "Certificate issued" }
```

**Statuses:** `pending` → `under_review` → `approved` / `rejected` → `ready`

---

## Module 6 — Water Bills

### GET `/water-bills/dues` 🔒
Get all water bills with total outstanding amount.

**Response:**
```json
{
  "data": {
    "bills": [{ "id": 1, "month": 7, "year": 2026, "amount": "240.00", "paid": 0 }],
    "total_due": 240
  }
}
```

---

### POST `/water-bills/:id/pay/init` 🔒
Initiate payment. Returns `order_id` to pass to payment gateway.

**Response:**
```json
{ "bill_id": 1, "amount": "240.00", "order_id": "PAY-A1B2C3D4", "currency": "INR" }
```

---

### POST `/water-bills/:id/pay/confirm` 🔒
Confirm payment after gateway callback.

**Request Body:** `{ "payment_ref": "pay_xyz123" }`

**Response:** Updated bill with `receipt_no`.

---

## Module 7 — Notices

### GET `/notices`
List notices. No auth required.

**Query Params:** `panchayat_id`, `type` (general/meeting/scheme/water/emergency), `page`, `limit`

---

### GET `/notices/:id`
Get notice detail.

---

### POST `/notices` 🔒
Publish a notice (officer only).

**Request Body:**
```json
{
  "panchayat_id": 1,
  "title": "Gram Sabha Meeting — July 15",
  "body": "All citizens are invited...",
  "type": "meeting"
}
```

---

### DELETE `/notices/:id` 🔒
Delete a notice.

---

## Module 8 — Schemes

### GET `/schemes`
List government schemes.

**Query Params:** `category` (agriculture/housing/health/education/women/employment/other), `search`, `page`, `limit`

---

### GET `/schemes/:id`
Get scheme details.

---

## Module 9 — Upload

### POST `/upload` 🔒
Upload a file (image or PDF).

**Form Data:** `file` (jpg/png/webp/pdf, max 5MB)

**Response:**
```json
{ "filename": "1720778400-abc123.jpg", "url": "/uploads/1720778400-abc123.jpg", "size": 102400, "mimetype": "image/jpeg" }
```

---

## Module 10 — Notifications

### POST `/notifications/register` 🔒
Register device push token.

**Request Body:** `{ "token": "fcm_token_here", "platform": "android" }`

---

### DELETE `/notifications/unregister` 🔒
Remove device push token.

**Request Body:** `{ "token": "fcm_token_here" }`

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request body failed schema validation |
| `UNAUTHORIZED` | Missing or invalid bearer token |
| `FORBIDDEN` | Token valid but insufficient role |
| `NOT_FOUND` | Resource does not exist |
| `DUPLICATE_ENTRY` | Unique constraint violation |
| `BAD_REQUEST` | Invalid OTP, already paid, etc. |

---

## Quick Start

```bash
# 1. Install
cd backend && npm install

# 2. Configure
cp .env.example .env   # edit DB credentials

# 3. Run migrations
npm run migrate

# 4. Start
npm run dev   # http://localhost:5000
```

> 🔑 **Mock OTP:** Set `MOCK_OTP=true` in `.env`. Use `123456` as OTP for any number. The OTP is also returned in the send-otp response for easy testing.
