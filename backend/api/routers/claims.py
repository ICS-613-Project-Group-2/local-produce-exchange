from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from api.deps import get_current_user
from models import ClaimRequest, Listing, MessageThread, Review, User
from schemas import CreateClaim, ClaimResponse, ClaimHistoryResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# ------------------------------- STATUSES -----------------------------------
# ---------------------------------------------------------------------------
# REQUESTED -> APPROVED -> PICKED_UP -> COMPLETED
# REQUESTED -> DENIED (terminal rejection)
# CANCELLED allowed only from REQUESTED or APPROVED (not after PICKED_UP)

STATUS_REQUESTED = "requested"
STATUS_APPROVED = "approved"
STATUS_PICKED_UP = "picked_up"
STATUS_COMPLETED = "completed"
STATUS_DENIED = "denied"
STATUS_CANCELLED = "cancelled"


# ---------------------------------------------------------------------------
# ----------------------------- HELPER METHODS ------------------------------
# ---------------------------------------------------------------------------

# retrieves a listing by ID from the database
# returns a Listing object if found; raises a 404 error if not
def _get_listing(db: Session, listing_id: int) -> Listing:
    listing = (
        db.query(Listing)
        .filter(Listing.listing_id == listing_id)
        .first()
    )
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return listing


# retrieves a claim by ID from the database
# returns a ClaimRequest object if found; raises a 404 error if not
def _get_claim(db: Session, claim_id: int) -> ClaimRequest:
    claim = (
        db.query(ClaimRequest)
        .filter(ClaimRequest.request_id == claim_id)
        .first()
    )
    if claim is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
    return claim


# builds a ClaimHistoryResponse for a claim from the perspective of the given user,
# who is either the claim's requester or the owner of the listing it's on
# returns a ClaimHistoryResponse with listing and counterparty details, and whether
# the given user is still able to leave a review for this claim
def _serialize_claim_history(
    claim: ClaimRequest,
    listing: Listing | None,
    current_user_id: int,
    reviewed_claim_ids: set[int],
    db: Session,
) -> ClaimHistoryResponse:
    is_owner = listing is not None and listing.user_id == current_user_id
    other_user_id = claim.requester_user_id if is_owner else (listing.user_id if listing else None)
    other_user = (
        db.query(User).filter(User.user_id == other_user_id).first()
        if other_user_id is not None
        else None
    )

    return ClaimHistoryResponse(
        request_id=claim.request_id,
        listing_id=claim.listing_id,
        listing_name=listing.name if listing else "Listing removed",
        listing_photo_url=listing.photos[0].image_link if listing and listing.photos else None,
        quantity_requested=claim.quantity_requested,
        status=claim.status,
        request_date=claim.request_date,
        closed_date=claim.closed_date,
        role="owner" if is_owner else "claimant",
        other_user_id=other_user_id,
        other_user_name=other_user.name if other_user else None,
        can_review=claim.status == STATUS_COMPLETED and claim.request_id not in reviewed_claim_ids,
        already_reviewed=claim.request_id in reviewed_claim_ids,
    )


# ---------------------------------------------------------------------------
# ------------------------------- API METHODS -------------------------------
# ---------------------------------------------------------------------------

# lists every claim the current user is involved in, either as the requester or as
# the owner of the listing being claimed, for display on the exchange history page
# returns a list of ClaimHistoryResponse objects, most recent first
@router.get("/v1/claims/mine", response_model=list[ClaimHistoryResponse])
def list_my_claims(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claims = (
        db.query(ClaimRequest)
        .join(Listing, Listing.listing_id == ClaimRequest.listing_id)
        .filter(
            (ClaimRequest.requester_user_id == current_user.user_id)
            | (Listing.user_id == current_user.user_id)
        )
        .order_by(ClaimRequest.request_date.desc())
        .all()
    )

    # claims the current user has already left a review for, so the history page
    # can show "Review submitted" instead of a "Leave Review" button
    reviewed_claim_ids = {
        row[0]
        for row in db.query(Review.claim_request_id)
        .filter(Review.reviewer_user_id == current_user.user_id)
        .all()
    }

    return [
        # the join above guarantees a matching listing exists for every claim returned here
        _serialize_claim_history(claim, _get_listing(db, claim.listing_id), current_user.user_id, reviewed_claim_ids, db)
        for claim in claims
    ]

# lists claims for a listing
# the listing owner sees every claim on their listing; anyone else only sees their own claim(s)
# returns a list of ClaimResponse objects
@router.get("/v1/listings/{listing_id}/claims", response_model=list[ClaimResponse])
def list_claims_for_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = _get_listing(db, listing_id)

    query = db.query(ClaimRequest).filter(ClaimRequest.listing_id == listing_id)

    # non-owners can only see their own claims on this listing, not everyone else's
    if listing.user_id != current_user.user_id:
        query = query.filter(ClaimRequest.requester_user_id == current_user.user_id)

    return query.order_by(ClaimRequest.request_date.desc()).all()


# creates a new claim on a listing
# returns a ClaimResponse object with the new claim's details
@router.post("/v1/listings/{listing_id}/claims", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def create_claim(
    listing_id: int,
    created_claim: CreateClaim,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = _get_listing(db, listing_id)

    # listing owners can't claim their own listing
    if listing.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot claim your own listing",
        )

    # the listing must currently be available
    if listing.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This listing is not currently available",
        )

    # the requested quantity can't exceed what's left on the listing
    if created_claim.quantity_requested > listing.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested quantity exceeds what's available on this listing",
        )

    # a user can't file a new claim while they still have an active one
    existing_claim = (
        db.query(ClaimRequest)
        .filter(
            ClaimRequest.listing_id == listing_id,
            ClaimRequest.requester_user_id == current_user.user_id,
            ClaimRequest.status.notin_([STATUS_COMPLETED, STATUS_DENIED, STATUS_CANCELLED]),
        )
        .first()
    )
    if existing_claim is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active claim on this listing",
        )

    # create the claim and add it to the database
    claim = ClaimRequest(
        listing_id=listing_id,
        requester_user_id=current_user.user_id,
        quantity_requested=created_claim.quantity_requested,
        status=STATUS_REQUESTED,
        request_date=datetime.now(timezone.utc),
    )
    db.add(claim)

    # flush the session to get the request_id for the new claim before creating its message thread
    db.flush()

    # every claim gets its own message thread so the requester and listing owner can talk
    thread = MessageThread(claim_request_id=claim.request_id)
    db.add(thread)

    # flush again to get the new thread's ID, then link it back onto the claim
    # (ClaimRequest.message_thread_id and MessageThread.claim_request_id both exist,
    # pointing at each other)
    db.flush()
    claim.message_thread_id = thread.thread_id

    db.commit()
    db.refresh(claim)
    return claim


# approves a pending claim; only the listing owner can do this
# decrements the listing's available quantity, and marks it unavailable once fully claimed
# returns a ClaimResponse object with the updated claim's details
@router.put("/v1/claims/{claim_id}/approve", response_model=ClaimResponse)
def approve_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = _get_claim(db, claim_id)
    listing = _get_listing(db, claim.listing_id)

    if listing.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the listing owner can perform this action",
        )

    # user tries to approve a claim request that isn't at the REQUESTED stage
    if claim.status != STATUS_REQUESTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only requested claims can be approved",
        )

    # guard against approving a claim for more than what's actually still available
    # (e.g. multiple active claims outstanding on the same listing)
    if claim.quantity_requested > listing.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough quantity remaining on this listing to approve this claim",
        )

    # reserve the requested quantity now; it's given back if this claim is later cancelled
    listing.quantity -= claim.quantity_requested
    if listing.quantity == 0:
        listing.status = "unavailable"

    claim.status = STATUS_APPROVED

    db.commit()
    db.refresh(claim)
    return claim


# denies a requested claim; only the listing owner can do this
# returns a ClaimResponse object with the updated claim's details
@router.put("/v1/claims/{claim_id}/decline", response_model=ClaimResponse)
def decline_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = _get_claim(db, claim_id)
    listing = _get_listing(db, claim.listing_id)
    if listing.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the listing owner can perform this action",
        )

    if claim.status != STATUS_REQUESTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only requested claims can be denied",
        )

    claim.status = STATUS_DENIED
    claim.closed_date = datetime.now(timezone.utc)

    db.commit()
    db.refresh(claim)
    return claim


# cancels a claim that's still REQUESTED or APPROVED; only the user who made the claim can do this
# cancellation is not allowed once a claim has been picked up
# if the claim had already been approved (and its quantity reserved), that quantity is given back
# returns a ClaimResponse object with the updated claim's details
@router.put("/v1/claims/{claim_id}/cancel", response_model=ClaimResponse)
def cancel_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = _get_claim(db, claim_id)
    listing = _get_listing(db, claim.listing_id)

    if(claim.requester_user_id != current_user.user_id and listing.user_id != current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only those who have made the claim request or the listing can perform this action",
        )

    if claim.status not in (STATUS_REQUESTED, STATUS_APPROVED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only requested or approved claims can be cancelled; cancellation after pickup is not allowed",
        )

    # an approved claim already reserved quantity on the listing — give it back
    if claim.status == STATUS_APPROVED:
        listing.quantity += claim.quantity_requested
        if listing.status == "unavailable":
            listing.status = "available"

    claim.status = STATUS_CANCELLED
    claim.closed_date = datetime.now(timezone.utc)

    db.commit()
    db.refresh(claim)
    return claim


# marks an approved claim as completed once the pickup has happened; either the requester
# or the listing owner can do this, since the actual handoff happens outside the app
# completed claims can be reviewed by both participants
# returns a ClaimResponse object with the updated claim's details
@router.put("/v1/claims/{claim_id}/complete", response_model=ClaimResponse)
def complete_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = _get_claim(db, claim_id)
    listing = _get_listing(db, claim.listing_id)

    if claim.requester_user_id != current_user.user_id and listing.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only those who have made the claim request or the listing can perform this action",
        )

    if claim.status != STATUS_APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only approved claims can be marked as completed",
        )

    claim.status = STATUS_COMPLETED
    claim.closed_date = datetime.now(timezone.utc)

    db.commit()
    db.refresh(claim)
    return claim