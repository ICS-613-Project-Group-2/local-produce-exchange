from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from api.routers.moderation import _require_moderator_or_owner
from database import get_db
from api.deps import get_current_user
from models import ClaimRequest, Listing, Message, MessageThread, User
from schemas import CreateMessage, MessageResponse, MessageThreadResponse
from api.routers.notifications import create_notification

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

# lists all message threads for the current user (their inbox)
# returns threads where the user is either the claim requester or the listing owner
@router.get("/v1/me/threads", response_model=list[MessageThreadResponse])
def list_my_threads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # find all claims where the current user is the requester
    requester_claims = (
        db.query(ClaimRequest.request_id)
        .filter(ClaimRequest.requester_user_id == current_user.user_id)
        .subquery()
    )

    # find all claims on the current user's listings
    owner_claims = (
        db.query(ClaimRequest.request_id)
        .join(Listing, Listing.listing_id == ClaimRequest.listing_id)
        .filter(Listing.user_id == current_user.user_id)
        .subquery()
    )

    # get all threads for those claims
    threads = (
        db.query(MessageThread)
        .filter(
            or_(
                MessageThread.claim_request_id.in_(requester_claims),
                MessageThread.claim_request_id.in_(owner_claims),
            )
        )
        .all()
    )

    results: list[MessageThreadResponse] = []
    for thread in threads:
        claim = (
            db.query(ClaimRequest)
            .filter(ClaimRequest.request_id == thread.claim_request_id)
            .first()
        )
        if not claim:
            continue

        listing = (
            db.query(Listing)
            .filter(Listing.listing_id == claim.listing_id)
            .first()
        )

        messages = (
            db.query(Message)
            .filter(Message.thread_id == thread.thread_id)
            .order_by(Message.timestamp)
            .all()
        )

        results.append(MessageThreadResponse(
            thread_id=thread.thread_id,
            claim_request_id=claim.request_id,
            listing_id=listing.listing_id if listing else None,
            participant_ids=[claim.requester_user_id, listing.user_id] if listing else [claim.requester_user_id],
            messages=messages,
        ))

    # sort by latest message timestamp (most recent first)
    def latest_ts(t: MessageThreadResponse):
        if t.messages:
            return t.messages[-1].timestamp or datetime.min.replace(tzinfo=timezone.utc)
        return datetime.min.replace(tzinfo=timezone.utc)

    results.sort(key=latest_ts, reverse=True)
    return results


# retrieves the message thread for a claim, including all of its messages
# the claim's requester, listing's owner, community owner, or community moderator can view it
# only the claim's requester or listing's owner can post messages
# returns a MessageThreadResponse object
@router.get("/v1/claims/{claim_id}/thread", response_model=MessageThreadResponse)
def get_message_thread(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    claim = _get_claim(db, claim_id)
    listing = _get_listing(db, claim.listing_id)

    # claim requester and listing owner can view the thread
    if current_user.user_id not in (claim.requester_user_id, listing.user_id):
        # community owners and moderators can also view the thread
        _require_moderator_or_owner(
            db,
            listing.community_id,
            current_user.user_id,
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
    db.flush()

    # notify the other participant about the new message
    recipient_id = listing.user_id if current_user.user_id == claim.requester_user_id else claim.requester_user_id
    create_notification(
        db,
        user_id=recipient_id,
        content=f"New message from {current_user.name} about \"{listing.name}\"",
        type="message",
        message_id=message.message_id,
        claim_request_id=claim.request_id,
    )

    db.commit()
    db.refresh(message)
    return message

