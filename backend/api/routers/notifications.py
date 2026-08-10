from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from api.deps import get_current_user
from models import Notification, User
from schemas import NotificationResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# ----------------------------- HELPER METHODS ------------------------------
# ---------------------------------------------------------------------------

# creates a notification for a user; called by other routers when events happen
# (new claim, claim status change, new message, new review, etc.)
def create_notification(
    db: Session,
    user_id: int,
    content: str,
    type: str | None = None,
    message_id: int | None = None,
    claim_request_id: int | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        content=content,
        type=type,
        message_id=message_id,
        claim_request_id=claim_request_id,
    )
    db.add(notification)
    return notification


# retrieves a notification by ID from the database
# returns a Notification object if found; raises a 404 error if not
def _get_notification(db: Session, notification_id: int) -> Notification:
    notification = (
        db.query(Notification)
        .filter(Notification.notification_id == notification_id)
        .first()
    )
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification


# ---------------------------------------------------------------------------
# ------------------------------- API METHODS -------------------------------
# ---------------------------------------------------------------------------

# lists notifications for a user, optionally filtered by type
# a user can only view their own notifications
# returns a list of NotificationResponse objects in descending order of timestamp
@router.get("/v1/users/{user_id}/notifications", response_model=list[NotificationResponse])
def list_notifications(
    user_id: int,
    type: str | None = Query(None, description="Filter by notification type, e.g. 'message', 'listing', 'community', 'exchange'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own notifications",
        )

    query = db.query(Notification).filter(Notification.user_id == user_id)
    if type is not None:
        query = query.filter(Notification.type == type)

    return query.order_by(Notification.is_read.asc(), Notification.timestamp.desc()).all()


# marks a single notification as read
# a user can only mark their own notifications as read
# returns a NotificationResponse object with the updated notification's details
@router.put("/v1/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = _get_notification(db, notification_id)

    if notification.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only mark your own notifications as read",
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)
    return notification


# marks every one of the current user's unread notifications as read
@router.put("/v1/users/{user_id}/notifications/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_notifications_read(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only mark your own notifications as read",
        )

    db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read.is_(False)).update({"is_read": True})
    db.commit()