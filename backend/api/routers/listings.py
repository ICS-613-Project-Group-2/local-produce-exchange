from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Community, Listing, User
from schemas import CreateListing, ListingResponse, ListingUpdate
from api.deps import get_current_user


router = APIRouter(
    prefix="/v1/listings",
    tags=["listings"],
)


def _get_listing_or_404(listing_id: int, db: Session) -> Listing:
    listing = db.query(Listing).filter(Listing.listing_id == listing_id).first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    return listing


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_form: CreateListing,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if listing_form.community_id is not None:
        community = (
            db.query(Community)
            .filter(Community.community_id == listing_form.community_id)
            .first()
        )
        if not community:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Community {listing_form.community_id} does not exist",
            )

    new_listing = Listing(
        user_id=current_user.user_id,
        community_id=listing_form.community_id,
        name=listing_form.name,
        description=listing_form.description,
        quantity=listing_form.quantity,
        expiration_date=listing_form.expiration_date,
        pickup_location=listing_form.pickup_location,
        category=listing_form.category,
    )

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    return new_listing


@router.get("", response_model=list[ListingResponse])
def list_listings(
    db: Session = Depends(get_db),
    community_id: int | None = None,
    category: str | None = None,
    status_filter: str | None = None,
    search: str | None = None,
):
    query = db.query(Listing)

    if community_id is not None:
        query = query.filter(Listing.community_id == community_id)

    if category is not None:
        query = query.filter(Listing.category.ilike(category))

    if status_filter is not None:
        query = query.filter(Listing.status == status_filter)

    if search is not None:
        like_pattern = f"%{search}%"
        query = query.filter(
            (Listing.name.ilike(like_pattern)) | (Listing.description.ilike(like_pattern))
        )

    return query.order_by(Listing.date_posted.desc()).all()


@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):
    return _get_listing_or_404(listing_id, db)


@router.patch("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_form: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = _get_listing_or_404(listing_id, db)

    if listing.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this listing",
        )

    updates = listing_form.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)

    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = _get_listing_or_404(listing_id, db)

    if listing.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this listing",
        )

    db.delete(listing)
    db.commit()

    return None
