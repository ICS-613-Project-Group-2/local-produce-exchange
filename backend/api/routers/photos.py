from fastapi import APIRouter, Depends, UploadFile, status
from sqlalchemy.orm import Session

from database import get_db
from models import Photo, User
from schemas import PhotoResponse
from api.deps import get_current_user
import uuid
import httpx
from fastapi import HTTPException, status

from config import settings

# image types accepted for upload, and the maximum allowed file size
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024

router = APIRouter(
    prefix="/v1/photos",
)


# ---------------------------------------------------------------------------
# ----------------------------- HELPER METHODS ------------------------------
# ---------------------------------------------------------------------------

# uploads image content to Supabase Storage
# returns the public URL of the uploaded image
def _upload_photo(content: bytes, content_type: str, original_filename: str) -> str:
    # rejects content types outside the allow list
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type. Allowed types: jpeg, png, webp, gif",
        )

    # rejects files over the size limit
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large. Maximum size is 5MB",
        )

    # builds unique object path
    extension = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
    object_path = f"listings/{uuid.uuid4().hex}.{extension}"

    # uploads the raw file content to Supabase Storage
    upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/{object_path}"

    response = httpx.post(
        upload_url,
        headers={
            "Authorization": f"Bearer {settings.SUPABASE_SECRET_KEY}",
            "apikey": settings.SUPABASE_SECRET_KEY,
            "Content-Type": content_type,
        },
        content=content,
    )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload image to storage",
        )

    # returns the public URL for the uploaded objec
    return f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_STORAGE_BUCKET}/{object_path}"


# ---------------------------------------------------------------------------
# ------------------------------- API METHODS -------------------------------
# ---------------------------------------------------------------------------

# uploads a photo for the current user and stores a record of it in the database
# returns a PhotoResponse object with the new photo's ID and public URL
@router.post("", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED)
def create_photo(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # reads the uploaded file and pushes it to Supabase Storage
    content = file.file.read()
    image_link = _upload_photo(content, file.content_type or "", file.filename or "")

    # creates a photo model instance pointing at the uploaded image and adds it to the database
    photo = Photo(image_link=image_link)
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return photo
