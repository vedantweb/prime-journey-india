# Auth Testing Playbook — Prime Journey India Admin Auth

## Architecture
- 4 admin aliases (Master@pji.com, Ramesh@pji.com, Abhishek@pji.com, Dheeraj@pji.com) map to internal backend accounts in the `admins` MongoDB collection. Internal emails are never exposed by the API.
- Initial password for all four: backend env `ADMIN_INITIAL_PASSWORD` (bcrypt-hashed at startup; seeding is idempotent and re-hashes if the env password changes).
- JWT (HS256, 12h, type=admin) returned as Bearer token. Brute-force lockout: 5 failed attempts → 15 min lock per ip+alias.

## MongoDB verification
```
mongosh
use test_database
db.admins.find({}, {alias: 1, key: 1, role: 1, password_hash: 1}).pretty()
```
Verify: 4 docs, hash starts with `$2b$`, unique indexes on alias and internal_email.

## API testing
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '"' -f2)
TOKEN=$(curl -s -X POST "$API/api/admin/auth/login" -H "Content-Type: application/json" -d '{"alias":"Master@pji.com","password":"<ADMIN_INITIAL_PASSWORD>"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s "$API/api/admin/auth/me" -H "Authorization: Bearer $TOKEN"
curl -s "$API/api/admin/enquiries" -H "Authorization: Bearer $TOKEN"
curl -s "$API/api/admin/settings" -H "Authorization: Bearer $TOKEN"   # master: 200; non-master: 403
curl -s -X POST "$API/api/enquiries" -H "Content-Type: application/json" -d '{"type":"Booking Enquiry","name":"Test"}'  # returns {"id":"PJI-01xx"}
```
Also verify: wrong password → 401; unknown alias → 401; no token → 401 on all /admin/* GETs.
