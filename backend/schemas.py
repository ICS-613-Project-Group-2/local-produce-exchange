from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import date, datetime

class RegisterUser(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=1, max_length=128, pattern="^[A-Za-z0-9-_]+$")
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

class LoginUser(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str

class GetUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    email: EmailStr
    profile_photo_id: int | None = None
    #profile_photo_url: str | None = None
    #rating: float | None = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CreateListing(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
    )
    
    name: str
    description: str | None = None
    quantity: int = Field(gt=0)
    unit: str | None = None
    expiration_date: date | None = None
    pickup_location: str | None = None
    category: str | None = None
    community_id: int | None = None
    photo_id: int | None = None


class PhotoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    photo_id: int
    image_link: str


class ListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    listing_id: int
    user_id: int | None
    community_id: int | None
    name: str
    description: str | None
    quantity: int
    unit: str | None = None
    status: str | None
    expiration_date: date | None
    date_posted: datetime | None
    pickup_location: str | None
    category: str | None
    photo_url: str | None = None

class ListingUpdate(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
    )

    name: str | None = None
    description: str | None = None
    quantity: int | None = None
    unit: str | None = None
    status: str | None = None
    category: str | None = None
    expiration_date: date | None = None
    pickup_location: str | None = None


class CreateClaim(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
    )
    quantity_requested: int = Field(gt=0)


class ClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    request_id: int
    listing_id: int | None
    requester_user_id: int | None
    quantity_requested: int
    status: str | None
    request_date: datetime | None
    closed_date: datetime | None

class CreateCommunity(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
    )

    name: str
    description: str
    location: str
    guidelines: str
    is_private: bool = True

class CommunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    community_id: int
    name: str
    description: str
    location: str
    guidelines: str
    is_private: bool | None = True
    member_count: int
    banner_url: str | None = None

# class for listing communities in GET /v1/communities
class CommunitiesListResponse(BaseModel):    
    my_communities: list[CommunityResponse]
    public_communities: list[CommunityResponse]

class MembershipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    community_id: int
    role: str | None = "member"
    date_joined: datetime | None = None


class InviteUser(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
    )
    
    email: EmailStr


class InvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    invitation_id: int
    community_id: int | None
    sender_user_id: int | None
    email: EmailStr
    status: str | None
    sent_date: datetime | None
    expiration_date: datetime | None


# --- Notification schemas ---

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    notification_id: int
    user_id: int | None
    message_id: int | None = None
    claim_request_id: int | None = None
    content: str
    timestamp: datetime | None
    is_read: bool
    type: str | None = None


# --- MessageThread schemas ---

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message_id: int
    thread_id: int
    sender_user_id: int | None
    content: str
    timestamp: datetime | None


class CreateMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content: str = Field(..., min_length=1)


class MessageThreadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    thread_id: int
    claim_request_id: int | None
    listing_id: int | None = None
    participant_ids: list[int] = []
    messages: list[MessageResponse] = []


# --- CommunityPost schemas ---

class CreateCommunityPost(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content: str = Field(..., min_length=1)


class CommunityPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    post_id: int
    community_id: int
    user_id: int
    content: str
    timestamp: datetime | None


# --- JoinRequest schemas ---

class JoinRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    request_id: int
    community_id: int
    user_id: int
    status: str | None
    request_date: datetime | None