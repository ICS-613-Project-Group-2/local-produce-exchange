from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    Boolean,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    profile_photo_id = Column(Integer, ForeignKey("photos.photo_id"), nullable=True)
    location = Column(String(150), nullable=True)

class Community(Base):
    __tablename__ = "communities"

    community_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(250), nullable=False)
    location = Column(String(100), nullable=False)
    guidelines = Column(String(250), nullable=False)
    is_private = Column(Boolean, server_default=text("true"))
    banner_photo_id = Column(Integer, ForeignKey("photos.photo_id"), nullable=True)

class Membership(Base):
    __tablename__ = "memberships"

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True,
    )
    community_id = Column(
        Integer,
        ForeignKey("communities.community_id", ondelete="CASCADE"),
        primary_key=True,
    )
    role = Column(String(50), server_default=text("'member'"))
    date_joined = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

class Listing(Base):
    __tablename__ = "listings"

    listing_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    community_id = Column(Integer, ForeignKey("communities.community_id", ondelete="CASCADE"))

    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(50), nullable=True)
    status = Column(String(50), server_default=text("'available'"))
    expiration_date = Column(Date, nullable=True)
    date_posted = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    pickup_location = Column(Text, nullable=True)
    category = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="listings_quantity_check"),
    )


class ClaimRequest(Base):
    __tablename__ = "claim_requests"

    request_id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.listing_id", ondelete="CASCADE"))
    requester_user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    message_thread_id = Column(Integer, ForeignKey("message_threads.thread_id"))

    quantity_requested = Column(Integer, nullable=False)
    status = Column(String(50), server_default=text("'requested'"))
    request_date = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    closed_date = Column(DateTime, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "quantity_requested > 0",
            name="claim_requests_quantity_requested_check",
        ),
    )


class MessageThread(Base):
    __tablename__ = "message_threads"

    thread_id = Column(Integer, primary_key=True)
    claim_request_id = Column(
        Integer,
        ForeignKey("claim_requests.request_id", ondelete="CASCADE"),
        unique=True,
    )


class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True)
    thread_id = Column(Integer, ForeignKey("message_threads.thread_id", ondelete="CASCADE"))
    sender_user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    timestamp = Column("timestamp", DateTime, server_default=text("CURRENT_TIMESTAMP"))


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    message_id = Column(Integer, ForeignKey("messages.message_id", ondelete="SET NULL"))
    claim_request_id = Column(
        Integer,
        ForeignKey("claim_requests.request_id", ondelete="SET NULL"),
    )

    content = Column(Text, nullable=False)
    timestamp = Column("timestamp", DateTime, server_default=text("CURRENT_TIMESTAMP"))
    is_read = Column(Boolean, server_default=text("false"))
    type = Column(String(50), nullable=True)


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True)
    claim_request_id = Column(
        Integer,
        ForeignKey("claim_requests.request_id", ondelete="CASCADE"),
    )
    reviewer_user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    reviewed_user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))

    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    review_date = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="reviews_rating_check"),
        UniqueConstraint(
            "claim_request_id",
            "reviewer_user_id",
            name="reviews_claim_request_id_reviewer_user_id_key",
        ),
    )


class Invitation(Base):
    __tablename__ = "invitations"

    invitation_id = Column(Integer, primary_key=True)
    community_id = Column(Integer, ForeignKey("communities.community_id", ondelete="CASCADE"))
    sender_user_id = Column(Integer, ForeignKey("users.user_id"))

    email = Column(String(255), nullable=False)
    status = Column(String(50), server_default=text("'pending'"))
    sent_date = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    expiration_date = Column(DateTime, nullable=True)


class ListingPhoto(Base):
    __tablename__ = "listing_photos"

    listing_id = Column(
        Integer,
        ForeignKey("listings.listing_id", ondelete="CASCADE"),
        primary_key=True,
    )
    photo_id = Column(
        Integer,
        ForeignKey("photos.photo_id", ondelete="CASCADE"),
        primary_key=True,
    )


class Photo(Base):
    __tablename__ = "photos"

    photo_id = Column(Integer, primary_key=True)
    image_link = Column(Text, nullable=False)


class CommunityPost(Base):
    __tablename__ = "community_posts"

    post_id = Column(Integer, primary_key=True)
    community_id = Column(
        Integer,
        ForeignKey("communities.community_id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    timestamp = Column("timestamp", DateTime, server_default=text("CURRENT_TIMESTAMP"))


class JoinRequest(Base):
    __tablename__ = "join_requests"

    request_id = Column(Integer, primary_key=True)
    community_id = Column(
        Integer,
        ForeignKey("communities.community_id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    status = Column(String(50), server_default=text("'pending'"))
    request_date = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
