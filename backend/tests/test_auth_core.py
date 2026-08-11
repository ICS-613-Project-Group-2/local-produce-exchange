from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import HTTPException

from config import settings
from core.auth import (
    JWT_ALGORITHM,
    create_access_tkn,
    decode_access_tkn,
    hash_password,
    verify_password,
)


# ---------------------------------------------------------------------------
# hash_password / verify_password
# ---------------------------------------------------------------------------

def test_hash_password_produces_a_verifiable_hash():
    password_hash = hash_password("correct-horse-battery-staple")

    assert password_hash != "correct-horse-battery-staple"
    assert verify_password("correct-horse-battery-staple", password_hash) is True


def test_verify_password_returns_false_for_wrong_password():
    password_hash = hash_password("correct-horse-battery-staple")

    assert verify_password("wrong-password", password_hash) is False


# ---------------------------------------------------------------------------
# create_access_tkn / decode_access_tkn
# ---------------------------------------------------------------------------

def test_create_access_tkn_round_trips_through_decode():
    token = create_access_tkn(user_id=42, email="user@example.com")

    payload = decode_access_tkn(token)

    assert payload["user_id"] == 42
    assert payload["email"] == "user@example.com"


def test_decode_access_tkn_rejects_expired_token():
    expired_payload = {
        "user_id": 1,
        "email": "user@example.com",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
    }
    expired_token = jwt.encode(expired_payload, settings.JWT_SECRET, algorithm=JWT_ALGORITHM)

    with pytest.raises(HTTPException) as exc_info:
        decode_access_tkn(expired_token)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Token expired"


def test_decode_access_tkn_rejects_invalid_token():
    with pytest.raises(HTTPException) as exc_info:
        decode_access_tkn("not-a-valid-token")

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"


def test_decode_access_tkn_rejects_token_signed_with_wrong_secret():
    token = jwt.encode(
        {"user_id": 1, "email": "user@example.com", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
        "a-completely-different-secret",
        algorithm=JWT_ALGORITHM,
    )

    with pytest.raises(HTTPException) as exc_info:
        decode_access_tkn(token)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"
