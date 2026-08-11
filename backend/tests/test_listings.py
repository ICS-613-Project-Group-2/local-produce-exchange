# ---------------------------------------------------------------------------
# POST /v1/listings
# ---------------------------------------------------------------------------

def test_create_listing_success_minimal(client, make_user, auth_header):
    owner = make_user()

    response = client.post(
        "/v1/listings",
        json={"name": "Bananas", "quantity": 3},
        headers=auth_header(owner),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Bananas"
    assert body["user_id"] == owner.user_id
    assert body["photo_url"] is None


def test_create_listing_community_not_found(client, make_user, auth_header):
    owner = make_user()

    response = client.post(
        "/v1/listings",
        json={"name": "Bananas", "quantity": 3, "community_id": 999999},
        headers=auth_header(owner),
    )

    assert response.status_code == 400
    assert "does not exist" in response.json()["detail"]


def test_create_listing_photo_not_found(client, make_user, auth_header):
    owner = make_user()

    response = client.post(
        "/v1/listings",
        json={"name": "Bananas", "quantity": 3, "photo_id": 999999},
        headers=auth_header(owner),
    )

    assert response.status_code == 400
    assert "does not exist" in response.json()["detail"]


def test_create_listing_with_community_and_photo(client, make_user, make_community, make_photo, auth_header):
    owner = make_user()
    community = make_community()
    photo = make_photo()

    response = client.post(
        "/v1/listings",
        json={
            "name": "Bananas",
            "quantity": 3,
            "community_id": community.community_id,
            "photo_id": photo.photo_id,
        },
        headers=auth_header(owner),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["community_id"] == community.community_id
    assert body["photo_url"] == photo.image_link


def test_create_listing_requires_auth(client):
    response = client.post("/v1/listings", json={"name": "Bananas", "quantity": 3})

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /v1/listings
# ---------------------------------------------------------------------------

def test_list_listings_no_filters(client, make_user, make_listing):
    owner = make_user()
    make_listing(owner, name="Apples")
    make_listing(owner, name="Oranges")

    response = client.get("/v1/listings")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_listings_filter_by_community(client, make_user, make_community, make_listing):
    owner = make_user()
    community = make_community()
    make_listing(owner, name="In Community", community_id=community.community_id)
    make_listing(owner, name="No Community")

    response = client.get("/v1/listings", params={"community_id": community.community_id})

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "In Community"


def test_list_listings_filter_by_category(client, make_user, make_listing):
    owner = make_user()
    make_listing(owner, name="Veggie", category="vegetables")
    make_listing(owner, name="Fruit", category="fruits")

    response = client.get("/v1/listings", params={"category": "vegetables"})

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Veggie"


def test_list_listings_filter_by_dietary_restriction(client, make_user, make_listing):
    owner = make_user()
    make_listing(owner, name="Vegan Chili", dietary_restrictions=["vegan", "gluten_free"])
    make_listing(owner, name="Regular Chili", dietary_restrictions=["gluten_free"])

    response = client.get("/v1/listings", params={"dietary_restriction": "vegan"})

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Vegan Chili"


def test_list_listings_filter_by_status(client, make_user, make_listing):
    owner = make_user()
    make_listing(owner, name="Available One")
    make_listing(owner, name="Unavailable One", status="unavailable")

    response = client.get("/v1/listings", params={"status_filter": "unavailable"})

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Unavailable One"


def test_list_listings_filter_by_search(client, make_user, make_listing):
    owner = make_user()
    make_listing(owner, name="Fresh Kale", description="Leafy greens")
    make_listing(owner, name="Ripe Mango", description="Sweet fruit")

    response = client.get("/v1/listings", params={"search": "leafy"})

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Fresh Kale"

    response = client.get("/v1/listings", params={"search": "mango"})

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Ripe Mango"


# ---------------------------------------------------------------------------
# GET /v1/listings/{listing_id}
# ---------------------------------------------------------------------------

def test_get_listing_not_found(client):
    response = client.get("/v1/listings/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Listing not found"


def test_get_listing_without_photo(client, make_user, make_listing):
    owner = make_user()
    listing = make_listing(owner)

    response = client.get(f"/v1/listings/{listing.listing_id}")

    assert response.status_code == 200
    assert response.json()["photo_url"] is None


def test_get_listing_with_photo(client, make_user, make_listing, make_photo, link_listing_photo):
    owner = make_user()
    listing = make_listing(owner)
    photo = make_photo()
    link_listing_photo(listing, photo)

    response = client.get(f"/v1/listings/{listing.listing_id}")

    assert response.status_code == 200
    assert response.json()["photo_url"] == photo.image_link


# ---------------------------------------------------------------------------
# PATCH /v1/listings/{listing_id}
# ---------------------------------------------------------------------------

def test_update_listing_not_found(client, make_user, auth_header):
    owner = make_user()

    response = client.patch(
        "/v1/listings/999999",
        json={"name": "New Name"},
        headers=auth_header(owner),
    )

    assert response.status_code == 404


def test_update_listing_forbidden_not_owner(client, make_user, make_listing, auth_header):
    owner = make_user(name="Owner")
    other = make_user(name="Other")
    listing = make_listing(owner)

    response = client.patch(
        f"/v1/listings/{listing.listing_id}",
        json={"name": "New Name"},
        headers=auth_header(other),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "You do not have permission to modify this listing"


def test_update_listing_success_partial(client, make_user, make_listing, auth_header):
    owner = make_user()
    listing = make_listing(owner, name="Old Name", quantity=5)

    response = client.patch(
        f"/v1/listings/{listing.listing_id}",
        json={"name": "New Name"},
        headers=auth_header(owner),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "New Name"
    assert body["quantity"] == 5


def test_update_listing_requires_auth(client, make_user, make_listing):
    owner = make_user()
    listing = make_listing(owner)

    response = client.patch(f"/v1/listings/{listing.listing_id}", json={"name": "New Name"})

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# DELETE /v1/listings/{listing_id}
# ---------------------------------------------------------------------------

def test_delete_listing_not_found(client, make_user, auth_header):
    owner = make_user()

    response = client.delete("/v1/listings/999999", headers=auth_header(owner))

    assert response.status_code == 404


def test_delete_listing_forbidden_not_owner_or_moderator(client, make_user, make_listing, auth_header):
    owner = make_user(name="Owner")
    other = make_user(name="Other")
    listing = make_listing(owner)

    response = client.delete(f"/v1/listings/{listing.listing_id}", headers=auth_header(other))

    assert response.status_code == 403
    assert response.json()["detail"] == "Only the community owner or a moderator can perform this action"


def test_delete_listing_forbidden_plain_community_member(
    client, make_user, make_community, make_membership, make_listing, auth_header
):
    owner = make_user(name="Owner")
    plain_member = make_user(name="PlainMember")
    community = make_community()
    make_membership(plain_member, community, role="member")
    listing = make_listing(owner, community_id=community.community_id)

    response = client.delete(f"/v1/listings/{listing.listing_id}", headers=auth_header(plain_member))

    assert response.status_code == 403


def test_delete_listing_success_as_community_moderator(
    client, make_user, make_community, make_membership, make_listing, auth_header
):
    owner = make_user(name="Owner")
    moderator = make_user(name="Moderator")
    community = make_community()
    make_membership(moderator, community, role="moderator")
    listing = make_listing(owner, community_id=community.community_id)

    response = client.delete(f"/v1/listings/{listing.listing_id}", headers=auth_header(moderator))

    assert response.status_code == 204

    follow_up = client.get(f"/v1/listings/{listing.listing_id}")
    assert follow_up.status_code == 404


def test_delete_listing_success(client, make_user, make_listing, auth_header):
    owner = make_user()
    listing = make_listing(owner)

    response = client.delete(f"/v1/listings/{listing.listing_id}", headers=auth_header(owner))

    assert response.status_code == 204

    follow_up = client.get(f"/v1/listings/{listing.listing_id}")
    assert follow_up.status_code == 404


def test_delete_listing_requires_auth(client, make_user, make_listing):
    owner = make_user()
    listing = make_listing(owner)

    response = client.delete(f"/v1/listings/{listing.listing_id}")

    assert response.status_code == 401
