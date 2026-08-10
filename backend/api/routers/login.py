from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from api.deps import get_current_user
from api.routers.reviews import get_user_rating
from core.auth import hash_password, verify_password, create_access_tkn

from models import Photo, User
from schemas import RegisterUser, GetUser, LoginUser, TokenResponse


router = APIRouter(
    prefix="/v1",
)


@router.post("/register", response_model=GetUser, status_code=status.HTTP_201_CREATED)
def register_user(
    user_form: RegisterUser,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.email == user_form.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The user with this email already exists",
        )

    new_user = User(
        name=user_form.name,
        email=user_form.email,
        password_hash=hash_password(user_form.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
def login_user(
    user_form: LoginUser,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == user_form.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    if not verify_password(user_form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    access_token = create_access_tkn(
        user_id=user.user_id,
        email=user.email,
    )

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=GetUser)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    response = GetUser.model_validate(current_user)
    response.rating, response.review_count = get_user_rating(db, current_user.user_id)
    if current_user.profile_photo_id:
        photo = db.query(Photo).filter(Photo.photo_id == current_user.profile_photo_id).first()
        response.profile_photo_url = photo.image_link if photo else None
    return response