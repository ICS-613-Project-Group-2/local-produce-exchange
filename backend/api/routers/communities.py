from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from database import get_db
from api.deps import get_current_user
from models import Community, Membership, Invitation, Photo, User
from schemas import (
    CreateCommunity,
    CommunityResponse,
    CommunitiesListResponse,
    InviteUser,
    InvitationResponse,
)

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
# returns a Membership object if the user is a member of the community, or None if not
def _get_membership(db: Session, community_id: int, user_id: int) -> Membership | None:
    return (
        db.query(Membership)
        .filter(
            Membership.community_id == community_id,
            Membership.user_id == user_id,
        )
        .first()
    )


# checks if a user is a moderator or higher for a community
# returns a Membership object if the user is a moderator or higher; raises a 403 error if not
def _check_moderation_perms(db: Session, community_id: int, user_id: int) -> Membership:
    membership = _get_membership(db, community_id, user_id)
    if membership is None or membership.role not in ("owner", "moderator", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a community moderator to perform this action",
        )
    return membership


# checks if a user has a pending invitation to a community
# returns True if the user has a pending invitation, False otherwise    
def _has_pending_invitation(db: Session, community_id: int, email: str) -> bool:
    now = datetime.now(datetime.timezone.utc)
    return (
        db.query(Invitation)
        .filter(
            Invitation.community_id == community_id,
            Invitation.email == email,
            Invitation.status == "pending",
            or_(Invitation.expiration_date.is_(None), Invitation.expiration_date > now),
        )
        .first()
        is not None
    )


# adds member count and banner photo URL to a Community object
# returns a CommunityResponse object with the member count and banner photo URL
def _community_to_community_response(db: Session, community: Community) -> CommunityResponse:
 
    response = CommunityResponse(
        community_id = community.community_id,
        name = community.name,
        description = community.description,
        location = community.location,
        guidelines = community.guidelines,
        is_private = community.is_private,
        member_count = _num_members(db, community.community_id),
    )
 
    if community.banner_photo_id is not None:
        photo = (
            db.query(Photo)
            .filter(Photo.photo_id == community.banner_photo_id)
            .first()
        )
        if photo is not None:
            response.banner_url = photo.image_link
 
    return response

# computes the number of members in a community
# returns an integer representing the number of members in the community, or 0 by default
def _num_members(db: Session, community_id: int) -> int:
    return (
        db.query(func.count(Membership.user_id))
        .filter(Membership.community_id == community_id)
        .scalar()
    ) or 0



# ---------------------------------------------------------------------------
# ------------------------------- API METHODS -------------------------------
# ---------------------------------------------------------------------------

# lists communities for the current user with optional search filtering
# returns two lists: communities the user is a member of, and public communities the user is not a member of
@router.get("/v1/communities", response_model=CommunitiesListResponse)
def list_communities(
    search: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    
    # finds the IDs of communites the current user is in
    my_community_ids =  db.query(Membership.community_id).filter(Membership.user_id == current_user.user_id)
 
    # queries for all the communities the user is in
    my_query = db.query(Community).filter(Community.community_id.in_(my_community_ids))
    # queries for all the public communities the user is not in
    public_query = db.query(Community).filter(Community.is_private.is_(False), Community.community_id.notin_(my_community_ids))
 
    # filters the queries based on if there is a search
    if search:
        name_or_description = or_(Community.name.ilike(f"%{search}%"), Community.description.ilike(f"%{search}%"))
        my_query = my_query.filter(name_or_description)
        public_query = public_query.filter(name_or_description)
 
    # orders the queries by name in alphabetical order
    my_communities = my_query.order_by(Community.name).all()
    public_communities = public_query.order_by(Community.name).all()
 
    # turns every Community object into a CommunityResponse object (computes member count and links banner photo)
    # and returns a CommunitiesListResponse object with the two lists of CommunityResponse objects
    return CommunitiesListResponse(
        my_communities = [_community_to_community_response(db, community) for community in my_communities],
        public_communities = [_community_to_community_response(db, community) for community in public_communities],
    )


# creates a new community and adds the current user as the owner
# returns a CommunityResponse object with the new community's details
@router.post("/v1/communities", response_model=CommunityResponse, status_code=status.HTTP_201_CREATED)
def create_community(
    created_community: CreateCommunity,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # create community model instance and add to database
    community = Community(
        name = created_community.name,
        description = created_community.description,
        location = created_community.location,
        guidelines = created_community.guidelines,
        is_private = created_community.is_private,
    )
    db.add(community)

    # flush the session to get the community_id for the new community before creating the membership
    db.flush()

    # create membership for the current user as the owner of the community
    owner_membership = Membership(
        user_id = current_user.user_id,
        community_id = community.community_id,
        role = "owner",
        date_joined = datetime.now(datetime.timezone.utc),
    )
    db.add(owner_membership)

    # commit the changes to the database and refresh the community object to get the updated values
    db.commit()
    db.refresh(community)
    return _community_to_community_response(db, community)


# retrieves a community by ID and checks if the current user is allowed to view it (if it's private)
# returns a CommunityResponse object with the community's details
@router.get("/v1/communities/{community_id}", response_model=CommunityResponse)
def get_community(
    community_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # retrieves the community by ID; raises a 404 error if not found
    community = _get_community(db, community_id)

    # checks if the community is private and if the current user is a member; raises a 403 error if not
    if community.is_private and _get_membership(db, community_id, current_user.user_id) is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This community is private")

    return _community_to_community_response(db, community)


# updates a community's details if the current user is a moderator or higher
# returns a CommunityResponse object with the updated community's details
@router.put("/v1/communities/{community_id}", response_model=CommunityResponse)
def update_community(
    community_id: int,
    updated_community: CreateCommunity,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # retrieves the community by ID; raises a 404 error if not found
    community = _get_community(db, community_id)

    # checks if the current user is a moderator or higher for the community; raises a 403 error if not
    _check_moderation_perms(db, community_id, current_user.user_id)

    # updates the community's details with the new values from the request body
    community.name = updated_community.name
    community.description = updated_community.description
    community.location = updated_community.location
    community.guidelines = updated_community.guidelines
    community.is_private = updated_community.is_private

    # commits the changes to the database and refreshes the community object to get the updated values
    db.commit()
    db.refresh(community)
    return _community_to_community_response(db, community)

# invites a user to a community by email if the current user has permission to do so
# returns an InvitationResponse object with the details of the invitation
@router.post("/v1/communities/{community_id}/invite", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
def invite_to_community(
    community_id: int,
    invite_user_form: InviteUser,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    community = _get_community(db, community_id)

    # only owners/moderators can invite people into a private community
    # if the community is public, any member of that community can invite people
    if community.is_private:
        _check_moderation_perms(db, community_id, current_user.user_id)
    elif _get_membership(db, community_id, current_user.user_id) is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only members can send invitations")
    
    # check if the invited user is already a member of the community
    invited_user = db.query(User).filter(User.email == invite_user_form.email).first()
    if invited_user is not None and _get_membership(db, community_id, invited_user.user_id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user is already a member of the community",
        )
 
    # check if the invited user already has a pending invitation to the community
    if _has_pending_invitation(db, community_id, invite_user_form.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email already has a pending invitation to the community",
        )

    # create a new invitation for the invited user and add it to the database
    now = datetime.now(datetime.timezone.utc)
    invitation = Invitation(
        community_id = community_id,
        sender_user_id = current_user.user_id,
        email = invite_user_form.email,
        status = "pending",
        sent_date = now,
        expiration_date = now + timedelta(days=7),
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    # TODO: send actual invitation email here
    return invitation


@router.post("/v1/communities/{community_id}/join", response_model=Membership, status_code=status.HTTP_201_CREATED)
def join_community(
    community_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # check if the community exists
    _get_community(db, community_id)

    # check if the user is already a member of the community
    if _get_membership(db, community_id, current_user.user_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You are already a member of this community")

    # create a new membership for the user and add it to the database
    membership = Membership(
        user_id = current_user.user_id,
        community_id = community_id,
        role = "member",
        date_joined = datetime.now(datetime.timezone.utc),
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


# allows a user to leave a community if they are a member and not the owner
# returns a 204 No Content response if successful
@router.post("/v1/communities/{community_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_community(
    community_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    
    # check if the community exists
    _get_community(db, community_id)

    # check if the user is a member of the community and get their membership role
    membership = _get_membership(db, community_id, current_user.user_id)
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You are not a member of this community")

    # check if the user is the owner of the community; owners cannot leave their own community
    if membership.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owners cannot leave their own community; transfer ownership first",
        )

    # delete the membership and commit the changes to the database
    db.delete(membership)
    db.commit()
    return None
