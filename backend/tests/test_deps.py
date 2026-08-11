from datetime import datetime, timedelta, timezone

import jwt

from config import settings
from core.auth import JWT_ALGORITHM


def test_get_current_user_success(client, make_user, auth_header):
    user = make_user(name="Deps Tester")

    response = client.get("/v1/me", headers=auth_header(user))

    assert response.status_code == 200
    assert response.json()["user_id"] == user.user_id


def test_get_current_user_missing_user_id_claim(client):
    token = jwt.encode(
        {"email": "user@example.com", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
        settings.JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    response = client.get("/v1/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"


def test_get_current_user_unknown_user_id(client):
    token = jwt.encode(
        {"user_id": 999999, "email": "ghost@example.com", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
        settings.JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    response = client.get("/v1/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_get_current_user_invalid_token(client):
    response = client.get("/v1/me", headers={"Authorization": "Bearer not-a-valid-token"})

    assert response.status_code == 401


def test_get_current_user_missing_token(client):
    response = client.get("/v1/me")

    assert response.status_code == 401
