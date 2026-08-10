from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from api.deps import get_current_user
from api.routers.notifications import create_notification
from api.routers.claims import STATUS_COMPLETED
from models import ClaimRequest, Listing, Review, User
from schemas import CreateReview, ReviewResponse, UserReviewsResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# ----------------------------- HELPER METHODS ------------------------------
# ---------------------------------------------------------------------------

# computes a user's average rating and total review count from reviews they've received
# returns (average rounded to 2 decimal places, count), or (None, 0) if they have no reviews yet
def get_user_rating(db: Session, user_id: int) -> tuple[float | None, int]:
    average, count = (
        db.query(func.avg(Review.rating), func.count(Review.review_id))
        .filter(Review.reviewed_user_id == user_id)
        .one()
    )
    return (round(float(average), 2) if average is not None else None, count or 0)


# converts a Review object into a ReviewResponse object
def _serialize_review(review: Review) -> ReviewResponse:
    return ReviewResponse(
        review_id=review.review_id,
        claim_request_id=review.claim_request_id,
        reviewer_user_id=review.reviewer_user_id,
        reviewer_name=review.reviewer.name if review.reviewer else None,
        reviewed_user_id=review.reviewed_user_id,
        rating=review.rating,
        comment=review.comment,
        review_date=review.review_date,
    )


# ---------------------------------------------------------------------------
# ------------------------------- API METHODS -------------------------------
# ---------------------------------------------------------------------------

# lists the reviews a user has received, along with their average rating
# returns a UserReviewsResponse for display on that user's public profile
@router.get("/v1/users/{user_id}/reviews", response_model=UserReviewsResponse)
def list_user_reviews(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    reviews = (
        db.query(Review)
        .filter(Review.reviewed_user_id == user_id)
        .order_by(Review.review_date.desc())
        .all()
    )
    average, count = get_user_rating(db, user_id)

    return UserReviewsResponse(
        average_rating=average,
        review_count=count,
        reviews=[_serialize_review(review) for review in reviews],
    )


# lists the reviews left on a specific completed exchange; only the two participants can view them
# returns a list of ReviewResponse objects
@router.get("/v1/claims/{claim_id}/reviews", response_model=list[ReviewResponse])
def list_claim_reviews(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = db.query(ClaimRequest).filter(ClaimRequest.request_id == claim_id).first()
    if claim is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    listing = db.query(Listing).filter(Listing.listing_id == claim.listing_id).first()
    if current_user.user_id not in (claim.requester_user_id, listing.user_id if listing else None):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only participants in this exchange can view its reviews",
        )

    reviews = (
        db.query(Review)
        .filter(Review.claim_request_id == claim_id)
        .order_by(Review.review_date.desc())
        .all()
    )
    return [_serialize_review(review) for review in reviews]


# leaves a review on a completed exchange for the other participant
# returns a ReviewResponse object with the new review's details
@router.post(
    "/v1/claims/{claim_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    claim_id: int,
    review_form: CreateReview,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = db.query(ClaimRequest).filter(ClaimRequest.request_id == claim_id).first()
    if claim is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    listing = db.query(Listing).filter(Listing.listing_id == claim.listing_id).first()
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    # the reviewed user is always the other participant in the exchange
    if current_user.user_id == claim.requester_user_id:
        reviewed_user_id = listing.user_id
    elif current_user.user_id == listing.user_id:
        reviewed_user_id = claim.requester_user_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only participants in this exchange can leave a review",
        )

    if claim.status != STATUS_COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only completed exchanges can be reviewed",
        )

    existing_review = (
        db.query(Review)
        .filter(
            Review.claim_request_id == claim_id,
            Review.reviewer_user_id == current_user.user_id,
        )
        .first()
    )
    if existing_review is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Review already submitted",
        )

    review = Review(
        claim_request_id=claim_id,
        reviewer_user_id=current_user.user_id,
        reviewed_user_id=reviewed_user_id,
        rating=review_form.rating,
        comment=review_form.comment,
    )
    db.add(review)

    # notify the reviewed user that they received a review
    create_notification(
        db,
        user_id=reviewed_user_id,
        content=f"{current_user.name} left you a {review_form.rating}-star review.",
        type="exchange",
        claim_request_id=claim_id,
    )

    db.commit()
    db.refresh(review)

    return _serialize_review(review)
