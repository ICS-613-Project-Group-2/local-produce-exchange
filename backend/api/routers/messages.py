from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from api.deps import get_current_user
from models import ClaimRequest, Listing, Message, MessageThread, User
from schemas import CreateMessage, MessageResponse, MessageThreadResponse

router = APIRouter()


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

# retrieves the message thread for a claim
# returns a MessageThread object if found; raises a 404 error if not
def _get_thread_for_claim(db: Session, claim: ClaimRequest) -> MessageThread:
    thread = (
        db.query(MessageThread)
        .filter(MessageThread.claim_request_id == claim.request_id)
        .first()
    )
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message thread not found")
    return thread


# ---------------------------------------------------------------------------
# ------------------------------- API METHODS -------------------------------
# ---------------------------------------------------------------------------

# retrieves the message thread for a claim, including all of its messages
# only the claim's requester or the listing's owner can view it
# returns a MessageThreadResponse object
@router.get("/v1/claims/{claim_id}/thread", response_model=MessageThreadResponse)
def get_message_thread(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = _get_claim(db, claim_id)
    listing = _get_listing(db, claim.listing_id)
    if current_user.user_id not in (claim.requester_user_id, listing.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this claim's conversation",
        )
    
    thread = _get_thread_for_claim(db, claim)

    messages = (
        db.query(Message)
        .filter(Message.thread_id == thread.thread_id)
        .order_by(Message.timestamp)
        .all()
    )

    return MessageThreadResponse(
        thread_id=thread.thread_id,
        claim_request_id=claim.request_id,
        listing_id=listing.listing_id,
        participant_ids=[claim.requester_user_id, listing.user_id],
        messages=messages,
    )


# posts a new message to a claim's thread
# only the claim's requester or the listing's owner can post to it
# returns a MessageResponse object with the new message's details
@router.post("/v1/claims/{claim_id}/thread/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def post_message(
    claim_id: int,
    created_message: CreateMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = _get_claim(db, claim_id)
    listing = _get_listing(db, claim.listing_id)
    if current_user.user_id not in (claim.requester_user_id, listing.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this claim's conversation",
        )
    
    thread = _get_thread_for_claim(db, claim)

    message = Message(
        thread_id=thread.thread_id,
        sender_user_id=current_user.user_id,
        content=created_message.content,
        timestamp=datetime.now(timezone.utc),
    )

    db.add(message)
    db.commit()
    db.refresh(message)
    return message

