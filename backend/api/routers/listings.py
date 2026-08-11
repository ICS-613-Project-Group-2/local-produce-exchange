from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from api.routers.moderation import _require_moderator_or_owner
from database import get_db
from models import Community, Listing, ListingPhoto, Membership, Photo, User
from schemas import Category, CreateListing, DietaryRestriction, ListingResponse, ListingUpdate
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

# checks if the current user is allowed to view a listing
# listings in public communities can be viewed by any authenticated user
# listings in private communities can only be viewed by members of that community
def _check_listing_view_perms(db: Session, listing: Listing, current_user: User) -> None:

    community = db.query(Community).filter(Community.community_id == listing.community_id).first()

    if community is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found",
        )

    # listings in public communities can be viewed by any authenticated user
    if not community.is_private:
        return

    # check if the current user is a member of the private community
    membership = db.query(Membership).filter(
        Membership.community_id == community.community_id,
        Membership.user_id == current_user.user_id,
    ).first()

    # return a 404 instead of a 403 so the existence of a private listing is not revealed
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

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

# creates a new listing for the current user in a community they are a member of
# optionally attaches an uploaded photo to the listing
# returns a ListingResponse object with the new listing's details
@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_form: CreateListing,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # every listing must belong to a community
    if listing_form.community_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A community is required to create a listing",
        )

    # check that the selected community exists
    community = (
        db.query(Community)
        .filter(Community.community_id == listing_form.community_id)
        .first()
    )

    if community is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found",
        )

    # check that the current user is a member of the selected community
    membership = (
        db.query(Membership)
        .filter(
            Membership.community_id == listing_form.community_id,
            Membership.user_id == current_user.user_id,
        )
        .first()
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of this community to create a listing",
        )

    # the photo must already exist before it can be linked to the listing
    if listing_form.photo_id is not None:
        photo = (
            db.query(Photo)
            .filter(Photo.photo_id == listing_form.photo_id)
            .first()
        )

        if photo is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Photo {listing_form.photo_id} does not exist",
            )

    # create listing model instance and add it to the database
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
        dietary_restrictions=listing_form.dietary_restrictions,
    )
    db.add(new_listing)

    # flush the session so the listing_id is generated before linking the photo
    db.flush()

    # link the uploaded photo to the listing, if one was provided
    if listing_form.photo_id is not None:
        listing_photo = ListingPhoto(
            listing_id=new_listing.listing_id,
            photo_id=listing_form.photo_id,
        )
        db.add(listing_photo)

    # commit the changes and refresh the listing to retrieve its generated values
    db.commit()
    db.refresh(new_listing)

    return _serialize_listing(new_listing)


# lists listings with optional filtering by community, category, status, dietary restrictions, and search term
# public community listings are visible to every authenticated user
# private community listings are only visible to members of that community
# returns a list of ListingResponse objects matching the filters, ordered by most recently posted
@router.get("", response_model=list[ListingResponse])
def list_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    community_id: int | None = None,
    category: Category | None = None,
    status_filter: str | None = None,
    dietary_restriction: DietaryRestriction | None = None,
    search: str | None = None,
):
    # finds the IDs of communities the current user is a member of
    my_community_ids = (
        db.query(Membership.community_id)
        .filter(Membership.user_id == current_user.user_id)
    )

    # only includes listings from public communities or communities the current user is a member of
    query = db.query(Listing).join(Community, Community.community_id == Listing.community_id).filter(
        or_(
            Community.is_private.is_(False),
            Listing.community_id.in_(my_community_ids),
        )
    )

    # filters the query down by community, if provided
    if community_id is not None:
        query = query.filter(Listing.community_id == community_id)

    # filters the query down by category, if provided
    if category is not None:
        query = query.filter(Listing.category.ilike(category))

    # filters the query down by status, if provided
    if status_filter is not None:
        query = query.filter(Listing.status == status_filter)

    # filters the query down to listings whose dietary_restrictions array contains this value, if provided
    if dietary_restriction is not None:
        query = query.filter(Listing.dietary_restrictions.any(dietary_restriction))

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
# public community listings can be viewed by any authenticated user
# private community listings can only be viewed by members of that community
# returns a ListingResponse object with the listing's details
@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # retrieves the listing by ID; raises a 404 error if not found
    listing = _get_listing(listing_id, db)

    # checks if the current user is allowed to view the listing
    _check_listing_view_perms(db, listing, current_user)

    return _serialize_listing(listing)


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
    # exclude_unset means a field the client left out of the request body entirely is skipped
    # (rather than treated as an explicit "set this to None"); this applies to dietary_restrictions
    # too, so sending an empty list is a deliberate "clear all restrictions", not the same as omitting it
    updates = listing_form.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(listing, field, value)

    # commits the changes to the database and refreshes the listing object to get the updated values
    db.commit()
    db.refresh(listing)

    return _serialize_listing(listing)


# deletes a listing if the current user is the owner, or if they are a moderator/owner of the community
# returns a 204 No Content response if successful
@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # retrieves the listing by ID; raises a 404 error if not found
    listing = _get_listing(listing_id, db)

    # the listing creator can always delete their own listing
    if listing.user_id == current_user.user_id:
        db.delete(listing)
        db.commit()
        return None

    # otherwise, the current user must be a moderator or owner of the community containing the listing
    _require_moderator_or_owner(db, listing.community_id, current_user.user_id)

    db.delete(listing)
    db.commit()

    return None