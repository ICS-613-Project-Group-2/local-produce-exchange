from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from api.deps import get_current_user
from models import Community, Membership, User
from schemas import MembershipResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# ----------------------------- HELPER METHODS ------------------------------
# ---------------------------------------------------------------------------

# retrieves a community by ID from the database
# returns a Community object if found; raises a 404 error if not
def _get_community(db: Session, community_id: int) -> Community:
    community = (
        db.query(Community)
        .filter(Community.community_id == community_id)
        .first()
    )
    if community is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community not found")
    return community


# retrieves a membership for a user in a community
# returns a Membership object if found, or None if the user isn't a member
def _get_membership(db: Session, community_id: int, user_id: int) -> Membership | None:
    return (
        db.query(Membership)
        .filter(
            Membership.community_id == community_id,
            Membership.user_id == user_id,
        )
        .first()
    )


# checks that the current user is the community's owner
# returns their Membership object if so; raises a 403 error if not
def _require_owner(db: Session, community_id: int, user_id: int) -> Membership:
    membership = _get_membership(db, community_id, user_id)
    if membership is None or membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the community owner can perform this action",
        )
    return membership


# checks that the current user is the community's owner or a moderator
# returns their Membership object if so; raises a 403 error if not
def _require_moderator_or_owner(db: Session, community_id: int, user_id: int) -> Membership:
    membership = _get_membership(db, community_id, user_id)
    if membership is None or membership.role not in ("owner", "moderator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the community owner or a moderator can perform this action",
        )
    return membership


# checks that the acting member is actually allowed to kick the target member
# nobody can act on the owner, and a moderator can't act on another moderator
# raises a 403 error if the action isn't allowed
def _require_can_moderate_target(actor_membership: Membership, target_membership: Membership) -> None:
    if target_membership.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The community owner cannot be kicked or banned",
        )
    if actor_membership.role == "moderator" and target_membership.role == "moderator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderators cannot kick or ban other moderators; only the owner can",
        )



# ---------------------------------------------------------------------------
# ------------------------------- API METHODS -------------------------------
# ---------------------------------------------------------------------------

# promotes a member to moderator
# only the community owner can do this
# returns a MembershipResponse object with the updated membership's details
@router.put("/v1/communities/{community_id}/members/{user_id}/promote", response_model=MembershipResponse)
def promote_member(
    community_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_owner(db, community_id, current_user.user_id)

    target_membership = _get_membership(db, community_id, user_id)
    if target_membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This user is not a member of the community")

    if target_membership.role != "member":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only regular members can be promoted to moderator",
        )

    target_membership.role = "moderator"

    db.commit()
    db.refresh(target_membership)
    return target_membership


# demotes a moderator back to a regular member
# only the community owner can do this
# returns a MembershipResponse object with the updated membership's details
@router.put("/v1/communities/{community_id}/members/{user_id}/demote", response_model=MembershipResponse)
def demote_member(
    community_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_owner(db, community_id, current_user.user_id)

    target_membership = _get_membership(db, community_id, user_id)
    if target_membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This user is not a member of the community")

    if target_membership.role != "moderator":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only moderators can be demoted",
        )

    target_membership.role = "member"

    db.commit()
    db.refresh(target_membership)
    return target_membership


# removes a member from the community
# owners can kick members and moderators, moderators can only kick members
# returns a 204 No Content response if successful
@router.delete("/v1/communities/{community_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def kick_member(
    community_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use the leave endpoint to remove yourself from a community",
        )

    actor_membership = _require_moderator_or_owner(db, community_id, current_user.user_id)

    target_membership = _get_membership(db, community_id, user_id)
    if target_membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This user is not a member of the community")

    _require_can_moderate_target(actor_membership, target_membership)

    db.delete(target_membership)
    db.commit()
    return None



# permanently deletes a community
# only the owner can do this
# returns a 204 No Content response if successful
@router.delete("/v1/communities/{community_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_community(
    community_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    community = _get_community(db, community_id)
    _require_owner(db, community_id, current_user.user_id)

    db.delete(community)
    db.commit()
    return None
