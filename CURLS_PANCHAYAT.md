# Panchayat Profile & Quick Services — cURL Reference

> Base URL: `http://localhost:3000/api/v1`  
> Replace `YOUR_TOKEN` with a valid JWT from the login flow.

---

## 0. Run Migrations (Terminal)

```bash
# Run both new migrations
mysql -u root -p smart_panchayat < src/database/migrations/003_panchayat_profile.sql
mysql -u root -p smart_panchayat < src/database/migrations/004_seed_village_profiles.sql
```

---

## 1. Get Panchayat Profile

Returns full village profile — base info, extended profile, sarpanch card, and team list.

### Nerle GP (id=1)
```bash
curl -s http://localhost:3000/api/v1/panchayats/1/profile | jq
```

### Kole GP (id=2)
```bash
curl -s http://localhost:3000/api/v1/panchayats/2/profile | jq
```

### Yewalewadi GP (id=3)
```bash
curl -s http://localhost:3000/api/v1/panchayats/3/profile | jq
```

### Bhose GP (id=4)
```bash
curl -s http://localhost:3000/api/v1/panchayats/4/profile | jq
```

### Kasegaon GP (id=5)
```bash
curl -s http://localhost:3000/api/v1/panchayats/5/profile | jq
```

---

## 2. Get Quick Services (Dashboard Snapshot)

Returns notices, schemes, water bill summary, complaints, and certificate stats — one call for the app home screen.

### Nerle GP
```bash
curl -s http://localhost:3000/api/v1/panchayats/1/quick-services | jq
```

### Kole GP
```bash
curl -s http://localhost:3000/api/v1/panchayats/2/quick-services | jq
```

### Yewalewadi GP
```bash
curl -s http://localhost:3000/api/v1/panchayats/3/quick-services | jq
```

### Bhose GP
```bash
curl -s http://localhost:3000/api/v1/panchayats/4/quick-services | jq
```

### Kasegaon GP
```bash
curl -s http://localhost:3000/api/v1/panchayats/5/quick-services | jq
```

---

## 3. Update Panchayat Profile  *(Officer / Admin only)*

### Update Nerle GP profile (cover photo + contact)
```bash
curl -s -X PUT http://localhost:3000/api/v1/panchayats/1/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cover_photo_url": "https://example.com/nerle-cover.jpg",
    "contact_phone": "02346-220101",
    "contact_email": "nerlegp@mahagov.in",
    "office_hours": "Mon–Sat 10:00 AM – 5:00 PM",
    "whatsapp_number": "9876500001"
  }' | jq
```

### Update Kasegaon GP — add website & social
```bash
curl -s -X PUT http://localhost:3000/api/v1/panchayats/5/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "website_url": "https://kasegaon.gov.in",
    "facebook_url": "https://facebook.com/kasegaongp",
    "whatsapp_number": "9876500005",
    "vision": "To be the benchmark panchayat of Sangli district by 2028."
  }' | jq
```

---

## 4. Add Staff Member  *(Officer / Admin only)*

### Add a new Ward Member to Nerle GP
```bash
curl -s -X POST http://localhost:3000/api/v1/panchayats/1/staff \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Dilip Patil",
    "designation": "Ward Member – Ward 5",
    "role_type": "ward_member",
    "ward_no": 5,
    "phone": "9823100099",
    "education": "12th Pass",
    "since_year": 2022,
    "display_order": 9
  }' | jq
```

### Add Sarpanch photo to Yewalewadi GP
```bash
curl -s -X POST http://localhost:3000/api/v1/panchayats/3/staff \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amol Dinesh Joshi",
    "designation": "Sarpanch",
    "role_type": "sarpanch",
    "phone": "9823300001",
    "photo_url": "https://example.com/amol-joshi.jpg",
    "education": "M.B.A.",
    "since_year": 2022,
    "bio": "IT professional turned public servant.",
    "display_order": 1
  }' | jq
```

---

## 5. Update Staff Member  *(Officer / Admin only)*

> Replace `STAFF_ID` with the actual id returned from the POST or GET profile response.

### Update a staff member's photo and phone
```bash
curl -s -X PUT http://localhost:3000/api/v1/panchayats/1/staff/STAFF_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photo_url": "https://example.com/rajan-patil.jpg",
    "phone": "9823100001"
  }' | jq
```

### Deactivate a staff member (soft remove from public profile)
```bash
curl -s -X PUT http://localhost:3000/api/v1/panchayats/1/staff/STAFF_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": 0
  }' | jq
```

---

## 6. Delete Staff Member  *(Officer / Admin only)*

```bash
curl -s -X DELETE http://localhost:3000/api/v1/panchayats/1/staff/STAFF_ID \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

---

## 7. Existing Endpoints (for reference)

### List all panchayats
```bash
curl -s "http://localhost:3000/api/v1/panchayats?page=1&limit=10" | jq
```

### Get single panchayat (basic)
```bash
curl -s http://localhost:3000/api/v1/panchayats/1 | jq
```

### Get panchayat stats (auth required)
```bash
curl -s http://localhost:3000/api/v1/panchayats/1/stats \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

### Search panchayats by district
```bash
curl -s "http://localhost:3000/api/v1/panchayats?district=Sangli" | jq
```

### Search panchayats by name
```bash
curl -s "http://localhost:3000/api/v1/panchayats?search=kasegaon" | jq
```

---

## Sample Profile Response Structure

```json
{
  "success": true,
  "message": "Panchayat profile fetched",
  "data": {
    "id": 1,
    "name": "Nerle Gram Panchayat",
    "taluka": "Valva",
    "district": "Sangli",
    "state": "Maharashtra",
    "population": 1247,
    "ward_count": 9,
    "logo_url": null,
    "profile": {
      "about": "Nerle is a peaceful village...",
      "history": "Established after Indian Independence...",
      "vision": "To become a model digital village...",
      "established_year": 1952,
      "area_sq_km": "12.50",
      "total_households": 310,
      "literacy_rate": "78.50",
      "main_occupation": "Sugarcane Farming, Dairy, Small Trade",
      "languages_spoken": "Marathi, Hindi",
      "cover_photo_url": null,
      "village_map_url": null,
      "pincode": "415414",
      "latitude": "17.03240000",
      "longitude": "74.28910000",
      "contact_phone": "02346-220101",
      "contact_email": "nerlegp@mahagov.in",
      "office_address": "Panchayat Bhavan, Near Primary School...",
      "office_hours": "Mon–Sat 10:00 AM – 5:00 PM",
      "website_url": null,
      "facebook_url": null,
      "whatsapp_number": "9876500001"
    },
    "sarpanch": {
      "id": 1,
      "name": "Rajan Maruti Patil",
      "designation": "Sarpanch",
      "role_type": "sarpanch",
      "photo_url": null,
      "phone": "9823100001",
      "education": "B.A.",
      "since_year": 2022,
      "bio": "Born and raised in Nerle..."
    },
    "team": [
      { "id": 2, "name": "Sunita Vijay More",  "designation": "Upa-Sarpanch", "role_type": "upa_sarpanch" },
      { "id": 3, "name": "Vijay Suresh Kadam", "designation": "Gram Sevak",   "role_type": "gram_sevak"   },
      { "id": 4, "name": "Meena Arun Jadhav",  "designation": "Ward Member – Ward 1", "role_type": "ward_member", "ward_no": 1 }
    ]
  }
}
```

## Sample Quick Services Response Structure

```json
{
  "success": true,
  "message": "Quick services fetched",
  "data": {
    "panchayat": { "id": 1, "name": "Nerle Gram Panchayat" },
    "services": {
      "notices": {
        "label": "Notices & Announcements",
        "icon": "megaphone",
        "recent": [
          { "id": 2, "title": "Gram Sabha – August 15, 2026", "type": "meeting" },
          { "id": 1, "title": "Water Supply Shutdown – 20 July 2026", "type": "water" }
        ]
      },
      "schemes": {
        "label": "Government Schemes",
        "icon": "document-text",
        "active_count": 5,
        "items": [ { "id": 1, "name": "PM Kisan Samman Nidhi", "category": "agriculture" } ]
      },
      "water_bills": {
        "label": "Water Bills",
        "icon": "water",
        "unpaid_count": 0,
        "total_due": 0
      },
      "complaints": {
        "label": "Complaints",
        "icon": "warning",
        "total": 0, "open": 0, "in_progress": 0, "resolved": 0
      },
      "certificates": {
        "label": "Certificates",
        "icon": "ribbon",
        "total": 0, "pending": 0, "ready": 0
      }
    }
  }
}
```
