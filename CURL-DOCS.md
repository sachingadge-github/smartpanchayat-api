# Smart Panchayat API — cURL Reference

All endpoints with sample payloads for **Local** and **UAT** environments.

- **Local** base: `http://localhost:4002/api/v1`
- **UAT** base: `http://smartpanchayat.co.in/api`

Set the token variable after login:
```bash
# Bash / Git Bash / macOS
TOKEN="<your_accessToken_here>"

# PowerShell
$TOKEN = "<your_accessToken_here>"
```

---

## 1. Health

### GET /health
```bash
# Local
curl http://localhost:4002/health

# UAT
curl http://smartpanchayat.co.in/health
```

---

## 2. Auth

### POST /auth/send-otp
```bash
# Local
curl -X POST http://localhost:4002/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'

# UAT
curl -X POST http://smartpanchayat.co.in/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'
```

### POST /auth/verify-otp
```bash
# Local (mock OTP is returned in the send-otp response when MOCK_OTP=true)
curl -X POST http://localhost:4002/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","otp":"123456"}'

# UAT
curl -X POST http://smartpanchayat.co.in/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","otp":"123456"}'
```
> Response contains `accessToken` and `refreshToken` — copy `accessToken` into `$TOKEN`.

### POST /auth/refresh
```bash
# Local
curl -X POST http://localhost:4002/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your_refreshToken>"}'

# UAT
curl -X POST http://smartpanchayat.co.in/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your_refreshToken>"}'
```

### POST /auth/logout
```bash
# Local
curl -X POST http://localhost:4002/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl -X POST http://smartpanchayat.co.in/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Citizen

### GET /citizen/profile
```bash
# Local
curl http://localhost:4002/api/v1/citizen/profile \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl http://smartpanchayat.co.in/api/citizen/profile \
  -H "Authorization: Bearer $TOKEN"
```

### PUT /citizen/profile
```bash
# Local
curl -X PUT http://localhost:4002/api/v1/citizen/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Sachin Gadge",
    "gender": "male",
    "age": 30,
    "address": "At Post Nerle, Tal Valva, Dist Sangli",
    "panchayat_id": 1
  }'

# UAT
curl -X PUT http://smartpanchayat.co.in/api/citizen/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Sachin Gadge",
    "gender": "male",
    "age": 30,
    "address": "At Post Nerle, Tal Valva, Dist Sangli",
    "panchayat_id": 1
  }'
```

---

## 4. Panchayats

### GET /panchayats
```bash
# Local
curl "http://localhost:4002/api/v1/panchayats?page=1&limit=10"

# UAT
curl "http://smartpanchayat.co.in/api/panchayats?page=1&limit=10"
```

### GET /panchayats/:id
```bash
# Local
curl http://localhost:4002/api/v1/panchayats/1

# UAT
curl http://smartpanchayat.co.in/api/panchayats/1
```

### GET /panchayats/:id/stats  *(requires auth)*
```bash
# Local
curl http://localhost:4002/api/v1/panchayats/1/stats \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl http://smartpanchayat.co.in/api/panchayats/1/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. Complaints

### POST /complaints
```bash
# Local
curl -X POST http://localhost:4002/api/v1/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "panchayat_id": 1,
    "category": "road",
    "description": "Large pothole near primary school gate causing accidents",
    "location": "Near Primary School, Nerle",
    "latitude": 17.0282,
    "longitude": 74.2754
  }'

# UAT
curl -X POST http://smartpanchayat.co.in/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "panchayat_id": 1,
    "category": "road",
    "description": "Large pothole near primary school gate causing accidents",
    "location": "Near Primary School, Nerle",
    "latitude": 17.0282,
    "longitude": 74.2754
  }'
```

### GET /complaints/mine
```bash
# Local
curl "http://localhost:4002/api/v1/complaints/mine?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl "http://smartpanchayat.co.in/api/complaints/mine?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### GET /complaints/:id
```bash
# Local
curl http://localhost:4002/api/v1/complaints/1 \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl http://smartpanchayat.co.in/api/complaints/1 \
  -H "Authorization: Bearer $TOKEN"
```

### GET /complaints/panchayat/:id
```bash
# Local (filter by status: open | in_progress | resolved | closed)
curl "http://localhost:4002/api/v1/complaints/panchayat/1?status=open&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl "http://smartpanchayat.co.in/api/complaints/panchayat/1?status=open&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### PATCH /complaints/:id/status
```bash
# Local
curl -X PATCH http://localhost:4002/api/v1/complaints/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"in_progress","remark":"Team dispatched to site"}'

# UAT
curl -X PATCH http://smartpanchayat.co.in/api/complaints/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"in_progress","remark":"Team dispatched to site"}'
```

---

## 6. Certificates

### POST /certificates
```bash
# Local (types: birth | death | residence | income | caste)
curl -X POST http://localhost:4002/api/v1/certificates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "panchayat_id": 1,
    "type": "birth",
    "applicant_name": "Arjun Sachin Gadge",
    "details": {
      "date_of_birth": "2020-05-15",
      "place_of_birth": "Nerle",
      "father_name": "Sachin Gadge",
      "mother_name": "Priya Gadge"
    }
  }'

# UAT
curl -X POST http://smartpanchayat.co.in/api/certificates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "panchayat_id": 1,
    "type": "birth",
    "applicant_name": "Arjun Sachin Gadge",
    "details": {
      "date_of_birth": "2020-05-15",
      "place_of_birth": "Nerle",
      "father_name": "Sachin Gadge",
      "mother_name": "Priya Gadge"
    }
  }'
```

### GET /certificates/mine
```bash
# Local
curl "http://localhost:4002/api/v1/certificates/mine?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl "http://smartpanchayat.co.in/api/certificates/mine?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### GET /certificates/:id
```bash
# Local
curl http://localhost:4002/api/v1/certificates/1 \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl http://smartpanchayat.co.in/api/certificates/1 \
  -H "Authorization: Bearer $TOKEN"
```

### PATCH /certificates/:id/status
```bash
# Local (status: pending | processing | approved | rejected)
curl -X PATCH http://localhost:4002/api/v1/certificates/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"approved","remark":"Documents verified, certificate issued"}'

# UAT
curl -X PATCH http://smartpanchayat.co.in/api/certificates/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"approved","remark":"Documents verified, certificate issued"}'
```

---

## 7. Water Bills

### GET /water-bills/dues
```bash
# Local
curl http://localhost:4002/api/v1/water-bills/dues \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl http://smartpanchayat.co.in/api/water-bills/dues \
  -H "Authorization: Bearer $TOKEN"
```

### POST /water-bills/:id/pay/init
```bash
# Local
curl -X POST http://localhost:4002/api/v1/water-bills/1/pay/init \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl -X POST http://smartpanchayat.co.in/api/water-bills/1/pay/init \
  -H "Authorization: Bearer $TOKEN"
```

### POST /water-bills/:id/pay/confirm
```bash
# Local (payment_ref from Razorpay or test string)
curl -X POST http://localhost:4002/api/v1/water-bills/1/pay/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"payment_ref":"pay_test_ref_12345"}'

# UAT
curl -X POST http://smartpanchayat.co.in/api/water-bills/1/pay/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"payment_ref":"pay_test_ref_12345"}'
```

---

## 8. Notices

### GET /notices
```bash
# Local
curl "http://localhost:4002/api/v1/notices?panchayat_id=1&page=1&limit=10"

# UAT
curl "http://smartpanchayat.co.in/api/notices?panchayat_id=1&page=1&limit=10"
```

### GET /notices/:id
```bash
# Local
curl http://localhost:4002/api/v1/notices/1

# UAT
curl http://smartpanchayat.co.in/api/notices/1
```

### POST /notices  *(officer/admin)*
```bash
# Local
curl -X POST http://localhost:4002/api/v1/notices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "panchayat_id": 1,
    "title": "Gram Sabha Meeting — July 2025",
    "body": "All citizens are invited to the Gram Sabha meeting on 20 July 2025 at the Panchayat Hall.",
    "type": "general"
  }'

# UAT
curl -X POST http://smartpanchayat.co.in/api/notices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "panchayat_id": 1,
    "title": "Gram Sabha Meeting — July 2025",
    "body": "All citizens are invited to the Gram Sabha meeting on 20 July 2025 at the Panchayat Hall.",
    "type": "general"
  }'
```

### DELETE /notices/:id
```bash
# Local
curl -X DELETE http://localhost:4002/api/v1/notices/1 \
  -H "Authorization: Bearer $TOKEN"

# UAT
curl -X DELETE http://smartpanchayat.co.in/api/notices/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 9. Schemes

### GET /schemes
```bash
# Local
curl "http://localhost:4002/api/v1/schemes?page=1&limit=10"

# UAT
curl "http://smartpanchayat.co.in/api/schemes?page=1&limit=10"
```

### GET /schemes/:id
```bash
# Local
curl http://localhost:4002/api/v1/schemes/1

# UAT
curl http://smartpanchayat.co.in/api/schemes/1
```

---

## 10. Upload

### POST /upload  *(multipart)*
```bash
# Local
curl -X POST http://localhost:4002/api/v1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "type=certificate"

# UAT
curl -X POST http://smartpanchayat.co.in/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "type=certificate"
```

---

## 11. Notifications

### POST /notifications/register
```bash
# Local
curl -X POST http://localhost:4002/api/v1/notifications/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"token":"fcm_device_token_here","platform":"android"}'

# UAT
curl -X POST http://smartpanchayat.co.in/api/notifications/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"token":"fcm_device_token_here","platform":"android"}'
```

### DELETE /notifications/unregister
```bash
# Local
curl -X DELETE http://localhost:4002/api/v1/notifications/unregister \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"token":"fcm_device_token_here"}'

# UAT
curl -X DELETE http://smartpanchayat.co.in/api/notifications/unregister \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"token":"fcm_device_token_here"}'
```

---

## Quick Login Flow (copy-paste)

```bash
# Step 1 — Send OTP (Local)
curl -s -X POST http://localhost:4002/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}' | python -m json.tool

# Step 2 — Verify OTP and capture token
TOKEN=$(curl -s -X POST http://localhost:4002/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","otp":"123456"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

echo "Token: $TOKEN"
```

> **PowerShell equivalent:**
> ```powershell
> $r = Invoke-RestMethod -Method Post -Uri "http://localhost:4002/api/v1/auth/verify-otp" `
>      -ContentType "application/json" `
>      -Body '{"mobile":"9876543210","otp":"123456"}'
> $TOKEN = $r.data.accessToken
> ```
