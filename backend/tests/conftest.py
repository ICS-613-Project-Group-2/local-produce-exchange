import json
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import ARRAY as PGArray
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.sql import operators
from sqlalchemy.sql.elements import BinaryExpression, CollectionAggregate

from main import app
from database import get_db
from models import (
    Base,
    ClaimRequest,
    Community,
    CommunityPost,
    Invitation,
    JoinRequest,
    Listing,
    ListingPhoto,
    Membership,
    Message,
    MessageThread,
    Notification,
    Photo,
    Review,
    User,
)
from core.auth import create_access_tkn, hash_password

# ---------------------------------------------------------------------------
# SQLite compatibility shims
# ---------------------------------------------------------------------------
# production runs on Postgres, whose ARRAY column type and array-containment
# CHECK constraint syntax SQLite can't compile. These adapt the schema so the
# in-memory SQLite test database can be created and round-trip list values;
# they're only ever registered for the "sqlite" dialect, so real Postgres
# usage (bind_processor/result_processor's non-sqlite branch) is untouched.


@compiles(PGArray, "sqlite")
def _compile_array_as_json_for_sqlite(element, compiler, **kw):
    return "JSON"


_orig_array_bind_processor = PGArray.bind_processor
_orig_array_result_processor = PGArray.result_processor


def _array_bind_processor(self, dialect):
    if dialect.name != "postgresql":
        def process(value):
            return None if value is None else json.dumps(value)
        return process
    return _orig_array_bind_processor(self, dialect)


def _array_result_processor(self, dialect, coltype):
    if dialect.name != "postgresql":
        def process(value):
            return None if value is None else json.loads(value)
        return process
    return _orig_array_result_processor(self, dialect, coltype)


PGArray.bind_processor = _array_bind_processor
PGArray.result_processor = _array_result_processor


# ARRAY.any(value) compiles to Postgres's "value = ANY (array_col)", which has no SQLite
# equivalent ("no such function: ANY"). Rewrite that one comparison shape into an EXISTS
# over SQLite's json_each() table-valued function instead; everything else compiles as usual.
@compiles(BinaryExpression, "sqlite")
def _compile_any_membership_as_json_each_for_sqlite(element, compiler, **kw):
    if isinstance(element.right, CollectionAggregate) and element.right.operator is operators.any_op:
        needle_sql = compiler.process(element.left, **kw)
        array_sql = compiler.process(element.right.element, **kw)
        return f"EXISTS (SELECT 1 FROM json_each({array_sql}) WHERE json_each.value = {needle_sql})"
    return compiler.visit_binary(element, **kw)


# the dietary_restrictions CHECK uses Postgres's "<@ ARRAY[...]::varchar[]" containment
# operator, which SQLite's parser rejects outright at CREATE TABLE time; drop it for tests
for _constraint in list(Base.metadata.tables["listings"].constraints):
    if getattr(_constraint, "name", None) == "listings_dietary_restrictions_check":
        Base.metadata.tables["listings"].constraints.discard(_constraint)


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    testing_session_local = sessionmaker(bind=engine)
    session = testing_session_local()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def make_user(db_session):
    counter = {"n": 0}

    def _make_user(name="Test User", email=None):
        counter["n"] += 1
        user = User(
            name=name,
            email=email or f"user{counter['n']}@example.com",
            password_hash=hash_password("password123"),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _make_user


@pytest.fixture()
def make_listing(db_session):
    def _make_listing(
        owner=None,
        name="Tomatoes",
        quantity=5,
        community_id=None,
        status=None,
        category=None,
        description=None,
        unit=None,
        dietary_restrictions=None,
    ):
        listing = Listing(
            user_id=owner.user_id if owner else None,
            community_id=community_id,
            name=name,
            quantity=quantity,
            category=category,
            description=description,
            unit=unit,
            dietary_restrictions=dietary_restrictions if dietary_restrictions is not None else [],
        )
        # only set status when explicitly requested, so the column's server_default
        # ("available") applies otherwise instead of being overridden with NULL
        if status is not None:
            listing.status = status
        db_session.add(listing)
        db_session.commit()
        db_session.refresh(listing)
        return listing

    return _make_listing


@pytest.fixture()
def make_claim(db_session):
    def _make_claim(requester, listing=None, listing_id=None, status="requested", quantity_requested=1):
        resolved_listing_id = listing_id if listing_id is not None else (listing.listing_id if listing else None)
        claim = ClaimRequest(
            listing_id=resolved_listing_id,
            requester_user_id=requester.user_id,
            quantity_requested=quantity_requested,
            status=status,
        )
        db_session.add(claim)
        db_session.commit()
        db_session.refresh(claim)
        return claim

    return _make_claim


@pytest.fixture()
def make_review(db_session):
    def _make_review(claim, reviewer, reviewed, rating=5, comment=None):
        review = Review(
            claim_request_id=claim.request_id if claim else None,
            reviewer_user_id=reviewer.user_id if reviewer else None,
            reviewed_user_id=reviewed.user_id,
            rating=rating,
            comment=comment,
        )
        db_session.add(review)
        db_session.commit()
        db_session.refresh(review)
        return review

    return _make_review


@pytest.fixture()
def make_photo(db_session):
    def _make_photo(image_link="https://example.com/photo.jpg"):
        photo = Photo(image_link=image_link)
        db_session.add(photo)
        db_session.commit()
        db_session.refresh(photo)
        return photo

    return _make_photo


@pytest.fixture()
def link_listing_photo(db_session):
    def _link(listing, photo):
        db_session.add(ListingPhoto(listing_id=listing.listing_id, photo_id=photo.photo_id))
        db_session.commit()

    return _link


@pytest.fixture()
def make_community(db_session):
    def _make_community(
        name="Test Community",
        description="A community",
        location="Honolulu",
        guidelines="Be nice",
        is_private=True,
        banner_photo_id=None,
    ):
        community = Community(
            name=name,
            description=description,
            location=location,
            guidelines=guidelines,
            is_private=is_private,
            banner_photo_id=banner_photo_id,
        )
        db_session.add(community)
        db_session.commit()
        db_session.refresh(community)
        return community

    return _make_community


@pytest.fixture()
def make_membership(db_session):
    def _make_membership(user, community, role="member"):
        membership = Membership(
            user_id=user.user_id,
            community_id=community.community_id,
            role=role,
        )
        db_session.add(membership)
        db_session.commit()
        db_session.refresh(membership)
        return membership

    return _make_membership


@pytest.fixture()
def make_invitation(db_session):
    def _make_invitation(community, sender, email, status="pending", expiration_date=None, sent_date=None):
        invitation = Invitation(
            community_id=community.community_id,
            sender_user_id=sender.user_id,
            email=email,
            status=status,
            sent_date=sent_date or datetime.now(timezone.utc),
            expiration_date=expiration_date,
        )
        db_session.add(invitation)
        db_session.commit()
        db_session.refresh(invitation)
        return invitation

    return _make_invitation


@pytest.fixture()
def make_join_request(db_session):
    def _make_join_request(community, user, status="pending"):
        join_request = JoinRequest(
            community_id=community.community_id,
            user_id=user.user_id,
            status=status,
        )
        db_session.add(join_request)
        db_session.commit()
        db_session.refresh(join_request)
        return join_request

    return _make_join_request


@pytest.fixture()
def make_community_post(db_session):
    def _make_community_post(community, user, content="Hello community!"):
        post = CommunityPost(
            community_id=community.community_id,
            user_id=user.user_id,
            content=content,
        )
        db_session.add(post)
        db_session.commit()
        db_session.refresh(post)
        return post

    return _make_community_post


@pytest.fixture()
def make_message_thread(db_session):
    def _make_message_thread(claim):
        thread = MessageThread(claim_request_id=claim.request_id)
        db_session.add(thread)
        db_session.commit()
        db_session.refresh(thread)
        return thread

    return _make_message_thread


@pytest.fixture()
def make_message(db_session):
    def _make_message(thread, sender, content="Hello!"):
        message = Message(
            thread_id=thread.thread_id,
            sender_user_id=sender.user_id if sender else None,
            content=content,
        )
        db_session.add(message)
        db_session.commit()
        db_session.refresh(message)
        return message

    return _make_message


@pytest.fixture()
def make_notification(db_session):
    def _make_notification(user, content="You have a notification", type=None, is_read=False, message_id=None, claim_request_id=None):
        notification = Notification(
            user_id=user.user_id,
            content=content,
            type=type,
            message_id=message_id,
            claim_request_id=claim_request_id,
        )
        if is_read:
            notification.is_read = True
        db_session.add(notification)
        db_session.commit()
        db_session.refresh(notification)
        return notification

    return _make_notification


@pytest.fixture()
def auth_header():
    def _auth_header(user):
        token = create_access_tkn(user.user_id, user.email)
        return {"Authorization": f"Bearer {token}"}

    return _auth_header
