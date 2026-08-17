from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import uuid
import bcrypt
import jwt
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = 'HS256'
ADMIN_INITIAL_PASSWORD = os.environ['ADMIN_INITIAL_PASSWORD']

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------- template status endpoints (kept) ----------------

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ---------------- enquiries (public intake + admin read) ----------------

class EnquiryIn(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: Optional[str] = "Enquiry"

@api_router.post("/enquiries")
async def create_enquiry(payload: EnquiryIn):
    data = payload.model_dump()
    count = await db.enquiries.count_documents({})
    ref = f"PJI-{str(count + 101).zfill(4)}"
    doc = {
        **data,
        "id": ref,
        "status": "New",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.enquiries.insert_one(doc)
    return {"id": ref, "status": "New"}

# ---------------- admin authentication ----------------
# Aliases (e.g. Master@pji.com) are friendly identifiers only. They resolve to
# internal backend accounts; internal emails are never exposed by the API.

ADMIN_SEED = [
    {"key": "master", "alias": "master@pji.com", "internal_email": "admin.master@primejourneyindia.internal",
     "display_name": "Master", "greeting": "Welcome, Master", "role": "master",
     "role_label": "Master Admin", "image_key": "logo",
     "permissions": ["bookings", "feedback", "homepage", "destinations", "packages", "images", "experiences", "team", "users", "admins", "settings"]},
    {"key": "ramesh", "alias": "ramesh@pji.com", "internal_email": "admin.ramesh@primejourneyindia.internal",
     "display_name": "Mr. Ramesh Dhir", "greeting": "Welcome, Mr. Ramesh", "role": "admin",
     "role_label": "Founder / Admin", "image_key": "founder",
     "permissions": ["bookings", "feedback", "homepage", "destinations", "packages", "images", "experiences"]},
    {"key": "abhishek", "alias": "abhishek@pji.com", "internal_email": "admin.abhishek@primejourneyindia.internal",
     "display_name": "Mr. Abhishek Dhir", "greeting": "Welcome, Mr. Abhishek", "role": "admin",
     "role_label": "Co-Founder / Admin", "image_key": "cofounder1",
     "permissions": ["bookings", "feedback", "homepage", "destinations", "packages", "images", "experiences"]},
    {"key": "dheeraj", "alias": "dheeraj@pji.com", "internal_email": "admin.dheeraj@primejourneyindia.internal",
     "display_name": "Mr. Dheeraj Dhir", "greeting": "Welcome, Mr. Dheeraj", "role": "admin",
     "role_label": "Co-Founder / Admin", "image_key": "cofounder2",
     "permissions": ["bookings", "feedback", "homepage", "destinations", "packages", "images", "experiences"]},
]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_admin_token(admin: dict) -> str:
    payload = {
        "sub": str(admin["_id"]),
        "key": admin["key"],
        "role": admin["role"],
        "type": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def public_profile(admin: dict) -> dict:
    return {
        "key": admin["key"],
        "displayName": admin["display_name"],
        "greeting": admin["greeting"],
        "role": admin["role"],
        "roleLabel": admin["role_label"],
        "imageKey": admin["image_key"],
        "permissions": admin["permissions"],
    }

bearer = HTTPBearer(auto_error=False)

async def get_current_admin(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token type")
        admin = await db.admins.find_one({"_id": ObjectId(payload["sub"])})
        if not admin:
            raise HTTPException(status_code=401, detail="Account not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_master(admin: dict):
    if admin["role"] != "master":
        raise HTTPException(status_code=403, detail="Master Admin access required")

class AdminLoginIn(BaseModel):
    alias: str
    password: str

@api_router.post("/admin/auth/login")
async def admin_login(body: AdminLoginIn, request: Request):
    alias = body.alias.strip().lower()
    identifier = f"{request.client.host}:{alias}"
    now = datetime.now(timezone.utc)

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until"):
        locked_until = datetime.fromisoformat(attempt["locked_until"])
        if locked_until > now:
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")

    admin = await db.admins.find_one({"alias": alias})
    if not admin or not verify_password(body.password, admin["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": None}},
            upsert=True,
        )
        updated = await db.login_attempts.find_one({"identifier": identifier})
        if updated and updated.get("count", 0) >= 5:
            await db.login_attempts.update_one(
                {"identifier": identifier},
                {"$set": {"locked_until": (now + timedelta(minutes=15)).isoformat(), "count": 0}},
            )
        raise HTTPException(status_code=401, detail="Invalid alias or password.")

    await db.login_attempts.delete_one({"identifier": identifier})
    return {"token": create_admin_token(admin), "profile": public_profile(admin)}

@api_router.get("/admin/auth/me")
async def admin_me(admin: dict = Depends(get_current_admin)):
    return {"profile": public_profile(admin)}

@api_router.get("/admin/overview")
async def admin_overview(admin: dict = Depends(get_current_admin)):
    return {
        "enquiries": await db.enquiries.count_documents({"type": {"$ne": "Feedback"}}),
        "feedback": await db.enquiries.count_documents({"type": "Feedback"}),
        "profile": public_profile(admin),
    }

@api_router.get("/admin/enquiries")
async def admin_enquiries(admin: dict = Depends(get_current_admin)):
    docs = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"enquiries": docs}

@api_router.get("/admin/settings")
async def admin_settings(admin: dict = Depends(get_current_admin)):
    require_master(admin)
    return {"message": "Master settings access granted", "profile": public_profile(admin)}

# ---------------- startup: indexes + idempotent admin seeding ----------------

@app.on_event("startup")
async def startup():
    await db.admins.create_index("alias", unique=True)
    await db.admins.create_index("internal_email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.enquiries.create_index("created_at")
    for spec in ADMIN_SEED:
        existing = await db.admins.find_one({"alias": spec["alias"]})
        if existing is None:
            await db.admins.insert_one({
                **spec,
                "password_hash": hash_password(ADMIN_INITIAL_PASSWORD),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Seeded admin alias %s", spec["alias"])
        elif not verify_password(ADMIN_INITIAL_PASSWORD, existing["password_hash"]):
            await db.admins.update_one(
                {"alias": spec["alias"]},
                {"$set": {"password_hash": hash_password(ADMIN_INITIAL_PASSWORD)}},
            )
            logger.info("Updated admin password hash for %s", spec["alias"])

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
