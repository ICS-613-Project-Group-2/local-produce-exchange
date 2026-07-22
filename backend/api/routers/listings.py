from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Community, Listing, ListingPhoto, Photo, User
from schemas import CreateListing, ListingResponse, ListingUpdate
from api.deps import get_current_user


router = APIRouter(
    prefix="/v1/listings"
)


# ---------------------------------------------------------------------------
# ----------------------------- HELPER METHODS ------------------------------
# ---------------------------------------------------------------------------

# retrieves a listing by ID from the database
# returns a Listing object if found; raises a 404 error if not
def _get_listing(listing_id: int, db: Session) -> Listing:
    listing = db.query(Listing).filter(Listing.listing_id == listing_id).first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    return listing


# converts a Listing object into a ListingResponse object
# returns a ListingResponse object with photo_url set to the listing's first linked photo (a listing can have
# several photos linked via listing_photos, but the API only surfaces one cover image), or None if it has none
def _serialize_listing(listing: Listing) -> ListingResponse:
    response = ListingResponse.model_validate(listing)
    response.photo_url = listing.photos[0].image_link if listing.photos else None
    return response


# ---------------------------------------------------------------------------
# ------------------------------- API METHODS -------------------------------
# ---------------------------------------------------------------------------

# creates a new listing for the current user, optionally attached to a community and a photo
# returns a ListingResponse object with the new listing's details
@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_form: CreateListing,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # if a community was specified, check that it exists first so we can return a clear 400 error
    # instead of letting the insert below fail on the community_id foreign key
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

    # same reasoning for the photo: it must already exist (uploaded via POST /v1/photos)
    # before we can link it to this listing
    if listing_form.photo_id is not None:
        photo = db.query(Photo).filter(Photo.photo_id == listing_form.photo_id).first()
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Photo {listing_form.photo_id} does not exist",
            )

    # create listing model instance and add to database
    new_listing = Listing(
        user_id=current_user.user_id,
        community_id=listing_form.community_id,
        name=listing_form.name,
        description=listing_form.description,
        quantity=listing_form.quantity,
        unit=listing_form.unit,
        expiration_date=listing_form.expiration_date,
        pickup_location=listing_form.pickup_location,
        category=listing_form.category,
    )
    db.add(new_listing)

    # flush (without committing) so new_listing.listing_id is generated now; the listing_photos
    # row below needs that ID as a foreign key before the outer commit happens
    db.flush()

    # link the uploaded photo to the listing, if one was provided
    if listing_form.photo_id is not None:
        db.add(ListingPhoto(listing_id=new_listing.listing_id, photo_id=listing_form.photo_id))

    # commit the changes to the database and refresh the listing object to get the updated values
    # (e.g. the server-generated status and date_posted defaults)
    db.commit()
    db.refresh(new_listing)

    return _serialize_listing(new_listing)


# lists listings with optional filtering by community, category, status, and search term
# returns a list of ListingResponse objects matching the filters, ordered by most recently posted
@router.get("", response_model=list[ListingResponse])
def list_listings(
    db: Session = Depends(get_db),
    community_id: int | None = None,
    category: str | None = None,
    status_filter: str | None = None,
    search: str | None = None,
):
    query = db.query(Listing)

    # filters the query down by community, if provided
    if community_id is not None:
        query = query.filter(Listing.community_id == community_id)

    # filters the query down by category, if provided; ilike so the frontend's category value
    # doesn't have to match the stored casing exactly
    if category is not None:
        query = query.filter(Listing.category.ilike(category))

    # filters the query down by status, if provided
    if status_filter is not None:
        query = query.filter(Listing.status == status_filter)

    # filters the query down to listings whose name or description contain the search term, if provided
    if search is not None:
        like_pattern = f"%{search}%"
        query = query.filter(
            (Listing.name.ilike(like_pattern)) | (Listing.description.ilike(like_pattern))
        )

    # orders the query by most recently posted and turns every Listing object into a ListingResponse object
    listings = query.order_by(Listing.date_posted.desc()).all()
    return [_serialize_listing(listing) for listing in listings]


# retrieves a listing by ID
# returns a ListingResponse object with the listing's details
@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):
    return _serialize_listing(_get_listing(listing_id, db))


# updates a listing's details if the current user is the owner
# returns a ListingResponse object with the updated listing's details
@router.patch("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_form: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # retrieves the listing by ID; raises a 404 error if not found
    listing = _get_listing(listing_id, db)

    # checks if the current user is the owner of the listing; raises a 403 error if not
    if listing.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this listing",
        )

    # updates the listing's details with the new values from the request body
    updates = listing_form.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(listing, field, value)

    # commits the changes to the database and refreshes the listing object to get the updated values
    db.commit()
    db.refresh(listing)

    return _serialize_listing(listing)


# deletes a listing if the current user is the owner
# returns a 204 No Content response if successful
@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # retrieves the listing by ID; raises a 404 error if not found
    listing = _get_listing(listing_id, db)

    # checks if the current user is the owner of the listing; raises a 403 error if not
    if listing.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this listing",
        )

    # deletes the listing and commits the changes to the database
    db.delete(listing)
    db.commit()

    return None