from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Form
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
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
import base64
import mimetypes
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


# ---------------- production-safe error handling ----------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request. Please check the submitted information."},
    )


@app.exception_handler(Exception)
async def production_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled server error: %s %s",
        request.method,
        request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )

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
    {"key": "master", "alias": "master@pji.com", "internal_email": "agencyvedanta@gmail.com",
     "display_name": "Master", "greeting": "Welcome, Master", "role": "master",
     "role_label": "Master Admin", "image_key": "logo",
     "permissions": ["bookings", "feedback", "homepage", "destinations", "packages", "images", "experiences", "team", "users", "admins", "settings"]},
    {"key": "ramesh", "alias": "ramesh@pji.com", "internal_email": "agencyvedanta@gmail.com",
     "display_name": "Mr. Ramesh Dhir", "greeting": "Welcome, Mr. Ramesh", "role": "admin",
     "role_label": "Founder / Admin", "image_key": "founder",
     "permissions": ["bookings", "feedback", "homepage", "destinations", "packages", "images", "experiences", "team", "users", "admins", "settings"]},
    {"key": "abhishek", "alias": "abhishek@pji.com", "internal_email": "agencyvedanta@gmail.com",
     "display_name": "Mr. Abhishek Dhir", "greeting": "Welcome, Mr. Abhishek", "role": "admin",
     "role_label": "Co-Founder / Admin", "image_key": "cofounder2",
     "permissions": ["bookings", "feedback", "homepage", "destinations", "packages", "images", "experiences", "team", "users", "admins", "settings"]},
    {"key": "dheeraj", "alias": "dheeraj@pji.com", "internal_email": "agencyvedanta@gmail.com",
     "display_name": "Mr. Dheeraj Dhir", "greeting": "Welcome, Mr. Dheeraj", "role": "admin",
     "role_label": "Co-Founder / Admin", "image_key": "cofounder1",
     "permissions": ["bookings", "feedback", "homepage", "destinations", "packages", "images", "experiences", "team", "users", "admins", "settings"]},
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
        "mustChangePassword": admin.get("must_change_password", False),
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

def require_admin(admin: dict):
    if not admin:
        raise HTTPException(status_code=401, detail="Not authenticated")

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

    # Master is never forced to change password.
    must_change = admin.get("key") != "master" and admin.get("must_change_password", False)

    return {
        "token": create_admin_token(admin),
        "profile": {**public_profile(admin), "mustChangePassword": must_change},
    }

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
    # Feedback belongs ONLY in the Feedback section.
    # Enquiries contains bookings, customised trips and general enquiries.
    docs = await db.enquiries.find(
        {"type": {"$ne": "Feedback"}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)

    return {"enquiries": docs}


class AdminEnquiryStatusUpdate(BaseModel):
    status: str

@api_router.put("/admin/enquiries/{enquiry_id}/status")
async def admin_update_enquiry_status(
    enquiry_id: str,
    body: AdminEnquiryStatusUpdate,
    admin: dict = Depends(get_current_admin),
):
    allowed = {
        "New",
        "Pending",
        "Approved",
        "Rejected",
        "Contacted",
        "In Progress",
        "Completed",
    }

    if body.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Invalid enquiry status."
        )

    result = await db.enquiries.update_one(
        {"id": enquiry_id},
        {
            "$set": {
                "status": body.status,
                "updated_by": admin["key"],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found.")

    return {
        "success": True,
        "id": enquiry_id,
        "status": body.status,
    }


@api_router.get("/admin/settings")
async def admin_settings(admin: dict = Depends(get_current_admin)):
    return {
        "message": "Admin settings access granted",
        "profile": public_profile(admin),
    }


class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str


@api_router.post("/admin/auth/change-password")
async def admin_change_password(
    body: AdminPasswordChange,
    admin: dict = Depends(get_current_admin),
):
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    if not verify_password(body.current_password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")

    if body.current_password == body.new_password:
        raise HTTPException(status_code=400, detail="New password must be different.")

    await db.admins.update_one(
        {"_id": admin["_id"]},
        {"$set": {
            "password_hash": hash_password(body.new_password),
            "must_change_password": False,
        }},
    )

    return {"message": "Password changed successfully."}


@api_router.get("/admin/feedback")
async def admin_feedback(admin: dict = Depends(get_current_admin)):
    docs = await db.enquiries.find(
        {"type": "Feedback"},
        {"_id": 0},
    ).sort("created_at", -1).to_list(500)

    return {"feedback": docs}


@api_router.get("/admin/content")
async def admin_content(admin: dict = Depends(get_current_admin)):
    doc = await db.admin_content.find_one({"key": "site"}, {"_id": 0})

    if not doc:
        doc = {
            "key": "site",
            "heroTitle": "India, Your Way.",
            "heroSubtitle": "",
            "leadershipTitle": "Meet The People Behind Prime Journey India",
            "leadershipSubtitle": "",
            "aboutText": "",
        }

    return doc


class AdminContentUpdate(BaseModel):
    heroTitle: Optional[str] = None
    heroSubtitle: Optional[str] = None
    leadershipTitle: Optional[str] = None
    leadershipSubtitle: Optional[str] = None
    aboutText: Optional[str] = None


@api_router.put("/admin/content")
async def update_admin_content(
    body: AdminContentUpdate,
    admin: dict = Depends(get_current_admin),
):
    values = {
        k: v
        for k, v in body.model_dump().items()
        if v is not None
    }

    await db.admin_content.update_one(
        {"key": "site"},
        {
            "$set": values,
            "$setOnInsert": {"key": "site"},
        },
        upsert=True,
    )

    return await admin_content(admin)


class AdminImageUpdate(BaseModel):
    imageKey: str
    filename: str
    data: str


@api_router.post("/admin/images")
async def admin_upload_image(
    body: AdminImageUpdate,
    admin: dict = Depends(get_current_admin),
):
    allowed_keys = {
        "logo",
        "founder",
        "cofounder1",
        "cofounder2",
    }

    if body.imageKey not in allowed_keys:
        raise HTTPException(status_code=400, detail="Unsupported image key.")

    if not body.data.startswith("data:"):
        raise HTTPException(status_code=400, detail="Invalid image data.")

    try:
        header, encoded = body.data.split(",", 1)
        raw = base64.b64decode(encoded)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image encoding.")

    ext = Path(body.filename).suffix.lower()

    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(status_code=400, detail="Only PNG, JPG, JPEG and WEBP images are allowed.")

    image_dir = ROOT_DIR.parent / "frontend" / "public" / "images"
    image_dir.mkdir(parents=True, exist_ok=True)

    target = image_dir / f"{body.imageKey}{ext}"
    target.write_bytes(raw)

    # Remove previous formats so old image cannot accidentally remain active.
    for old_ext in [".png", ".jpg", ".jpeg", ".webp"]:
        old_file = image_dir / f"{body.imageKey}{old_ext}"
        if old_file.exists() and old_file != target:
            old_file.unlink()

    public_path = f"/images/{body.imageKey}{ext}"

    await db.admin_media.update_one(
        {"imageKey": body.imageKey},
        {
            "$set": {
                "imageKey": body.imageKey,
                "path": public_path,
                "filename": body.filename,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": admin["key"],
            }
        },
        upsert=True,
    )

    return {
        "message": "Image updated successfully.",
        "imageKey": body.imageKey,
        "path": public_path,
    }


@api_router.get("/admin/images")
async def admin_images(admin: dict = Depends(get_current_admin)):
    docs = await db.admin_media.find({}, {"_id": 0}).to_list(100)
    return {"images": docs}



# ---------------- feedback replies ----------------

class FeedbackReplyIn(BaseModel):
    reply: str


@api_router.post("/admin/feedback/{feedback_id}/reply")
async def reply_to_feedback(
    feedback_id: str,
    body: FeedbackReplyIn,
    admin: dict = Depends(get_current_admin),
):
    reply = body.reply.strip()

    if not reply:
        raise HTTPException(status_code=400, detail="Reply cannot be empty.")

    feedback = await db.enquiries.find_one({
        "$or": [
            {"id": feedback_id},
            {"_id": ObjectId(feedback_id)}
        ],
        "type": "Feedback",
    })

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found.")

    reply_doc = {
        "text": reply,
        "replied_by": admin["key"],
        "replied_by_name": admin["display_name"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.enquiries.update_one(
        {"_id": feedback["_id"]},
        {
            "$push": {"replies": reply_doc},
            "$set": {
                "last_replied_at": reply_doc["created_at"],
                "last_replied_by": admin["key"],
            },
        },
    )

    return {
        "message": "Reply saved successfully.",
        "reply": reply_doc,
    }


# ---------------- shared trip photo gallery ----------------

class TripImageIn(BaseModel):
    title: str = ""
    destination: str = ""
    filename: str
    data: str


@api_router.get("/admin/trip-images")
async def admin_trip_images(admin: dict = Depends(get_current_admin)):
    docs = await db.trip_images.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)

    return {"images": docs}


@api_router.post("/admin/trip-images")
async def admin_upload_trip_image(
    body: TripImageIn,
    admin: dict = Depends(get_current_admin),
):
    if not body.data.startswith("data:"):
        raise HTTPException(status_code=400, detail="Invalid image data.")

    try:
        header, encoded = body.data.split(",", 1)
        raw = base64.b64decode(encoded)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image encoding.")

    ext = Path(body.filename).suffix.lower()

    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPG, JPEG and WEBP images are allowed."
        )

    gallery_dir = ROOT_DIR.parent / "frontend" / "public" / "images" / "trips"
    gallery_dir.mkdir(parents=True, exist_ok=True)

    image_id = uuid.uuid4().hex
    filename = f"{image_id}{ext}"
    target = gallery_dir / filename
    target.write_bytes(raw)

    doc = {
        "id": image_id,
        "title": body.title.strip(),
        "destination": body.destination.strip(),
        "filename": body.filename,
        "path": f"/images/trips/{filename}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": admin["key"],
    }

    await db.trip_images.insert_one(doc)

    doc.pop("_id", None)

    return {
        "message": "Trip image uploaded successfully.",
        "image": doc,
    }


@api_router.delete("/admin/trip-images/{image_id}")
async def admin_delete_trip_image(
    image_id: str,
    admin: dict = Depends(get_current_admin),
):
    image = await db.trip_images.find_one({"id": image_id})

    if not image:
        raise HTTPException(status_code=404, detail="Trip image not found.")

    relative = image.get("path", "").replace("/images/", "")
    target = ROOT_DIR.parent / "frontend" / "public" / "images" / relative

    if target.exists():
        target.unlink()

    await db.trip_images.delete_one({"id": image_id})

    return {"message": "Trip image deleted successfully."}



@api_router.get("/public/package-prices")
async def public_package_prices():
    docs = await db.packages.find(
        {},
        {"_id": 0, "id": 1, "priceFrom": 1, "priceTo": 1, "saved": 1}
    ).to_list(500)

    return {
        "packages": [
            {
                "package_id": d["id"],
                "price_from": d.get("priceFrom", 0),
                "price_to": d.get("priceTo", 0),
                "saved": d.get("saved", max(0, d.get("priceFrom", 0) - d.get("priceTo", 0))),
            }
            for d in docs
        ]
    }

# ---------------- admin package price management ----------------

class AdminPackagePriceUpdate(BaseModel):
    price_from: int = Field(ge=0)
    price_to: int = Field(ge=0)
    saved: int = Field(ge=0)

@api_router.get("/admin/packages")
async def admin_packages(admin: dict = Depends(get_current_admin)):
    docs = await db.packages.find({}, {"_id": 0}).to_list(500)
    return {"packages": docs}

@api_router.put("/admin/packages/{package_id}/price")
async def admin_update_package_price(
    package_id: str,
    body: AdminPackagePriceUpdate,
    admin: dict = Depends(get_current_admin),
):
    if body.price_from < 0 or body.price_to < 0:
        raise HTTPException(
            status_code=400,
            detail="Prices cannot be negative."
        )

    result = await db.packages.update_one(
        {"id": package_id},
        {
            "$set": {
                "priceFrom": body.price_from,
                "priceTo": body.price_to,
                "saved": body.saved,
                "updated_by": admin["key"],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Package not found.")

    return {
        "success": True,
        "packageId": package_id,
        "priceFrom": body.price_from,
        "priceTo": body.price_to,
        "saved": body.saved,
    }


# ---------------- seasonal offer price management ----------------

@api_router.get("/public/seasonal-offer")
async def public_seasonal_offer():
    doc = await db.admin_content.find_one({"key": "seasonal_offer_prices"}, {"_id": 0})
    if not doc:
        return {
            "price_from": 39999,
            "price_to": 29999,
        }
    return {
        "price_from": doc.get("price_from", 39999),
        "price_to": doc.get("price_to", 29999),
    }


@api_router.get("/admin/seasonal-offer")
async def admin_seasonal_offer(admin: dict = Depends(get_current_admin)):
    doc = await db.admin_content.find_one({"key": "seasonal_offer_prices"}, {"_id": 0})
    return {
        "price_from": doc.get("price_from", 39999) if doc else 39999,
        "price_to": doc.get("price_to", 29999) if doc else 29999,
    }


class SeasonalOfferPriceUpdate(BaseModel):
    price_from: int = Field(ge=0)
    price_to: int = Field(ge=0)


@api_router.put("/admin/seasonal-offer")
async def update_seasonal_offer(
    body: SeasonalOfferPriceUpdate,
    admin: dict = Depends(get_current_admin),
):
    await db.admin_content.update_one(
        {"key": "seasonal_offer_prices"},
        {
            "$set": {
                "key": "seasonal_offer_prices",
                "price_from": body.price_from,
                "price_to": body.price_to,
                "updated_by": admin["key"],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )

    return {
        "success": True,
        "price_from": body.price_from,
        "price_to": body.price_to,
    }


# ---------------- admin: real trips / trip photo management ----------------

class AdminTripCreate(BaseModel):
    name: str
    destination: str = ""
    trip_date: str = ""
    description: str = ""


@api_router.get("/admin/trips")
async def admin_trips(admin: dict = Depends(get_current_admin)):
    docs = await db.admin_trips.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

    for trip in docs:
        trip["photos"] = await db.trip_images.count_documents({
            "trip_id": trip["id"]
        })

    return {"trips": docs}


@api_router.post("/admin/trips")
async def admin_create_trip(
    body: AdminTripCreate,
    admin: dict = Depends(get_current_admin),
):
    name = body.name.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Trip name is required.")

    trip_id = f"TRIP-{uuid.uuid4().hex[:10].upper()}"

    doc = {
        "id": trip_id,
        "name": name,
        "destination": body.destination.strip(),
        "trip_date": body.trip_date.strip(),
        "description": body.description.strip(),
        "created_by": admin["key"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.admin_trips.insert_one(doc)

    doc.pop("_id", None)
    doc["photos"] = 0

    return {"trip": doc}


@api_router.delete("/admin/trips/{trip_id}")
async def admin_delete_trip(
    trip_id: str,
    admin: dict = Depends(get_current_admin),
):
    trip = await db.admin_trips.find_one({"id": trip_id})

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    photos = await db.trip_images.find(
        {"trip_id": trip_id},
        {"_id": 0}
    ).to_list(500)

    for image in photos:
        relative = image.get("path", "").replace("/images/", "")
        target = ROOT_DIR.parent / "frontend" / "public" / "images" / relative

        try:
            if target.exists():
                target.unlink()
        except OSError:
            pass

    await db.trip_images.delete_many({"trip_id": trip_id})
    await db.admin_trips.delete_one({"id": trip_id})

    return {"message": "Trip and its photos deleted successfully."}


@api_router.get("/admin/trips/{trip_id}/photos")
async def admin_trip_photos(
    trip_id: str,
    admin: dict = Depends(get_current_admin),
):
    docs = await db.trip_images.find(
        {"trip_id": trip_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)

    return {"images": docs}


@api_router.post("/admin/trips/{trip_id}/photos")
async def admin_add_trip_photo(
    trip_id: str,
    file: UploadFile = File(...),
    title: str = Form(""),
    admin: dict = Depends(get_current_admin),
):
    trip = await db.admin_trips.find_one({"id": trip_id})

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    ext = Path(file.filename or "").suffix.lower()

    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPG, JPEG and WEBP images are allowed."
        )

    gallery_dir = ROOT_DIR.parent / "frontend" / "public" / "images" / "trips"
    gallery_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{trip_id.lower()}-{uuid.uuid4().hex}{ext}"
    target = gallery_dir / filename

    data = await file.read()
    target.write_bytes(data)

    doc = {
        "id": f"IMG-{uuid.uuid4().hex[:10].upper()}",
        "trip_id": trip_id,
        "trip_name": trip["name"],
        "title": title.strip(),
        "path": f"/images/trips/{filename}",
        "uploaded_by": admin["key"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.trip_images.insert_one(doc)

    doc.pop("_id", None)

    return {
        "success": True,
        "image": doc,
    }


@api_router.delete("/admin/trips/{trip_id}/photos/{image_id}")
async def admin_delete_trip_photo(
    trip_id: str,
    image_id: str,
    admin: dict = Depends(get_current_admin),
):
    image = await db.trip_images.find_one({
        "id": image_id,
        "trip_id": trip_id,
    })

    if not image:
        raise HTTPException(status_code=404, detail="Trip photo not found.")

    relative = image.get("path", "").replace("/images/", "")
    target = ROOT_DIR.parent / "frontend" / "public" / "images" / relative

    try:
        if target.exists():
            target.unlink()
    except OSError:
        pass

    await db.trip_images.delete_one({
        "id": image_id,
        "trip_id": trip_id,
    })

    return {"message": "Trip photo deleted successfully."}

# ---------------- startup: indexes + idempotent admin seeding ----------------

@app.on_event("startup")
async def startup():
    await db.admins.create_index("alias", unique=True)
    await db.admins.create_index("internal_email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.enquiries.create_index("created_at")
    await db.trip_images.create_index("created_at")
    await db.admin_content.create_index("key", unique=True)
    await db.admin_media.create_index("imageKey", unique=True)
    for spec in ADMIN_SEED:
        existing = await db.admins.find_one({"alias": spec["alias"]})
        if existing is None:
            await db.admins.insert_one({
                **spec,
                "password_hash": hash_password(ADMIN_INITIAL_PASSWORD),
                "must_change_password": spec["key"] != "master",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Seeded admin alias %s", spec["alias"])
        else:
            # Existing admin accounts keep their current password.
            # This is important because admins can now change their own passwords.
            updates = {
                "must_change_password": existing.get("must_change_password", spec["key"] != "master"),
                "permissions": spec["permissions"],
                "image_key": spec["image_key"],
                "display_name": spec["display_name"],
                "greeting": spec["greeting"],
                "role_label": spec["role_label"],
                "role": spec["role"],
            }
            # HARD-LOCKED CO-FOUNDER IMAGE MAPPING
            if spec["key"] == "dheeraj":
                updates["image_key"] = "cofounder1"
            elif spec["key"] == "abhishek":
                updates["image_key"] = "cofounder2"

            await db.admins.update_one(
                {"alias": spec["alias"]},
                {"$set": updates},
            )

app.include_router(api_router)

cors_origins = [
    origin.strip().rstrip("/")
    for origin in os.environ.get("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

logging.warning("PRODUCTION CORS_ORIGINS=%r", cors_origins)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
