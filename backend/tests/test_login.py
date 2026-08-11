# ---------------------------------------------------------------------------
# POST /v1/register
# ---------------------------------------------------------------------------

def test_register_user_success(client):
    response = client.post(
        "/v1/register",
        json={"name": "NewUser", "email": "newuser@example.com", "password": "password123"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "NewUser"
    assert body["email"] == "newuser@example.com"
    assert "password" not in body
    assert body["review_count"] == 0
    assert body["rating"] is None


def test_register_user_duplicate_email(client, make_user):
    existing = make_user(name="Existing", email="dup@example.com")

    response = client.post(
        "/v1/register",
        json={"name": "AnotherUser", "email": existing.email, "password": "password123"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "The user with this email already exists"


# ---------------------------------------------------------------------------
# POST /v1/login
# ---------------------------------------------------------------------------

def test_login_user_success(client):
    client.post(
        "/v1/register",
        json={"name": "LoginUser", "email": "loginuser@example.com", "password": "password123"},
    )

    response = client.post(
        "/v1/login",
        json={"email": "loginuser@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_user_unknown_email(client):
    response = client.post(
        "/v1/login",
        json={"email": "nobody@example.com", "password": "password123"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_user_wrong_password(client):
    client.post(
        "/v1/register",
        json={"name": "LoginUser", "email": "loginuser2@example.com", "password": "password123"},
    )

    response = client.post(
        "/v1/login",
        json={"email": "loginuser2@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"


# ---------------------------------------------------------------------------
# GET /v1/me
# ---------------------------------------------------------------------------

def test_get_me_without_reviews(client, make_user, auth_header):
    user = make_user()

    response = client.get("/v1/me", headers=auth_header(user))

    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == user.user_id
    assert body["rating"] is None
    assert body["review_count"] == 0


def test_get_me_with_reviews(client, make_user, make_listing, make_claim, make_review, auth_header):
    reviewed = make_user(name="Reviewed User")
    reviewer = make_user(name="Reviewer")
    listing = make_listing(reviewed)
    claim = make_claim(requester=reviewer, listing=listing)
    make_review(claim, reviewer, reviewed, rating=5)

    response = client.get("/v1/me", headers=auth_header(reviewed))

    assert response.status_code == 200
    body = response.json()
    assert body["rating"] == 5.0
    assert body["review_count"] == 1


def test_get_me_requires_auth(client):
    response = client.get("/v1/me")

    assert response.status_code == 401


def test_get_me_with_profile_photo(client, make_user, make_photo, auth_header):
    user = make_user()
    photo = make_photo()
    user.profile_photo_id = photo.photo_id

    response = client.get("/v1/me", headers=auth_header(user))

    assert response.status_code == 200
    assert response.json()["profile_photo_url"] == photo.image_link


def test_get_me_with_dangling_profile_photo_id(client, make_user, auth_header):
    user = make_user()
    user.profile_photo_id = 999999

    response = client.get("/v1/me", headers=auth_header(user))

    assert response.status_code == 200
    assert response.json()["profile_photo_url"] is None


# ---------------------------------------------------------------------------
# GET /v1/users/{user_id}
# ---------------------------------------------------------------------------

def test_get_user_not_found(client):
    response = client.get("/v1/users/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_get_user_without_photo(client, make_user):
    user = make_user()

    response = client.get(f"/v1/users/{user.user_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == user.user_id
    assert body["profile_photo_url"] is None
    assert body["review_count"] == 0


def test_get_user_with_photo(client, make_user, make_photo):
    user = make_user()
    photo = make_photo()
    user.profile_photo_id = photo.photo_id

    response = client.get(f"/v1/users/{user.user_id}")

    assert response.status_code == 200
    assert response.json()["profile_photo_url"] == photo.image_link


def test_get_user_with_reviews(client, make_user, make_listing, make_claim, make_review):
    reviewed = make_user(name="Reviewed User")
    reviewer = make_user(name="Reviewer")
    listing = make_listing(reviewed)
    claim = make_claim(requester=reviewer, listing=listing)
    make_review(claim, reviewer, reviewed, rating=4)

    response = client.get(f"/v1/users/{reviewed.user_id}")

    assert response.status_code == 200
    assert response.json()["rating"] == 4.0
    assert response.json()["review_count"] == 1


# ---------------------------------------------------------------------------
# PUT /v1/me
# ---------------------------------------------------------------------------

def test_update_me_partial_update(client, make_user, auth_header):
    user = make_user(name="OldName")

    response = client.put("/v1/me", json={"name": "NewName"}, headers=auth_header(user))

    assert response.status_code == 200
    assert response.json()["name"] == "NewName"


def test_update_me_profile_photo_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/me", json={"profile_photo_id": 999999}, headers=auth_header(user))

    assert response.status_code == 400
    assert response.json()["detail"] == "Photo not found"


def test_update_me_profile_photo_success(client, make_user, make_photo, auth_header):
    user = make_user()
    photo = make_photo()

    response = client.put("/v1/me", json={"profile_photo_id": photo.photo_id}, headers=auth_header(user))

    assert response.status_code == 200
    body = response.json()
    assert body["profile_photo_id"] == photo.photo_id
    assert body["profile_photo_url"] == photo.image_link


def test_update_me_no_fields_provided(client, make_user, auth_header):
    user = make_user(name="Unchanged")

    response = client.put("/v1/me", json={}, headers=auth_header(user))

    assert response.status_code == 200
    assert response.json()["name"] == "Unchanged"


def test_update_me_requires_auth(client):
    response = client.put("/v1/me", json={"name": "NewName"})

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /v1/me/listings
# ---------------------------------------------------------------------------

def test_list_my_listings_empty(client, make_user, auth_header):
    user = make_user()

    response = client.get("/v1/me/listings", headers=auth_header(user))

    assert response.status_code == 200
    assert response.json() == []


def test_list_my_listings_returns_only_own_listings(client, make_user, make_listing, auth_header):
    user = make_user(name="Owner")
    other = make_user(name="Other")
    make_listing(user, name="Mine")
    make_listing(other, name="NotMine")

    response = client.get("/v1/me/listings", headers=auth_header(user))

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Mine"


def test_list_my_listings_requires_auth(client):
    response = client.get("/v1/me/listings")

    assert response.status_code == 401
