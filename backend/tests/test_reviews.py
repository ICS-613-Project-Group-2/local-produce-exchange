# ---------------------------------------------------------------------------
# GET /v1/users/{user_id}/reviews
# ---------------------------------------------------------------------------

def test_list_user_reviews_user_not_found(client):
    response = client.get("/v1/users/999999/reviews")

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_list_user_reviews_no_reviews(client, make_user):
    user = make_user()

    response = client.get(f"/v1/users/{user.user_id}/reviews")

    assert response.status_code == 200
    assert response.json() == {"average_rating": None, "review_count": 0, "reviews": []}


def test_list_user_reviews_with_reviews(client, make_user, make_listing, make_claim, make_review):
    reviewed = make_user(name="Reviewed User")
    reviewer1 = make_user(name="Reviewer One")
    reviewer2 = make_user(name="Reviewer Two")
    listing = make_listing(reviewed)
    claim1 = make_claim(requester=reviewer1, listing=listing)
    claim2 = make_claim(requester=reviewer2, listing=listing)
    make_review(claim1, reviewer1, reviewed, rating=5)
    make_review(claim2, reviewer2, reviewed, rating=3)

    response = client.get(f"/v1/users/{reviewed.user_id}/reviews")

    assert response.status_code == 200
    body = response.json()
    assert body["average_rating"] == 4.0
    assert body["review_count"] == 2
    reviewer_names = {r["reviewer_name"] for r in body["reviews"]}
    assert reviewer_names == {"Reviewer One", "Reviewer Two"}


def test_list_user_reviews_null_reviewer(client, make_user, make_review):
    reviewed = make_user(name="Reviewed User")
    make_review(claim=None, reviewer=None, reviewed=reviewed, rating=4)

    response = client.get(f"/v1/users/{reviewed.user_id}/reviews")

    assert response.status_code == 200
    body = response.json()
    assert body["reviews"][0]["reviewer_name"] is None
    assert body["reviews"][0]["reviewer_user_id"] is None


# ---------------------------------------------------------------------------
# GET /v1/claims/{claim_id}/reviews
# ---------------------------------------------------------------------------

def test_list_claim_reviews_claim_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.get("/v1/claims/999999/reviews", headers=auth_header(user))

    assert response.status_code == 404
    assert response.json()["detail"] == "Claim not found"


def test_list_claim_reviews_requires_auth(client, make_user, make_listing, make_claim):
    owner = make_user()
    listing = make_listing(owner)
    claim = make_claim(requester=owner, listing=listing)

    response = client.get(f"/v1/claims/{claim.request_id}/reviews")

    assert response.status_code == 401


def test_list_claim_reviews_missing_listing_allows_requester(client, make_user, make_claim, auth_header):
    requester = make_user(name="Requester")
    claim = make_claim(requester=requester, listing_id=999999)

    response = client.get(f"/v1/claims/{claim.request_id}/reviews", headers=auth_header(requester))

    assert response.status_code == 200
    assert response.json() == []


def test_list_claim_reviews_missing_listing_forbidden_for_others(client, make_user, make_claim, auth_header):
    requester = make_user(name="Requester")
    other = make_user(name="Other")
    claim = make_claim(requester=requester, listing_id=999999)

    response = client.get(f"/v1/claims/{claim.request_id}/reviews", headers=auth_header(other))

    assert response.status_code == 403


def test_list_claim_reviews_forbidden_non_participant(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    outsider = make_user(name="Outsider")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)

    response = client.get(f"/v1/claims/{claim.request_id}/reviews", headers=auth_header(outsider))

    assert response.status_code == 403
    assert response.json()["detail"] == "Only participants in this exchange can view its reviews"


def test_list_claim_reviews_success_for_both_participants(
    client, make_user, make_listing, make_claim, make_review, auth_header
):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)
    make_review(claim, requester, owner, rating=5, comment="Great!")

    for viewer in (owner, requester):
        response = client.get(f"/v1/claims/{claim.request_id}/reviews", headers=auth_header(viewer))
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1
        assert body[0]["comment"] == "Great!"


# ---------------------------------------------------------------------------
# POST /v1/claims/{claim_id}/reviews
# ---------------------------------------------------------------------------

def test_create_review_claim_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.post(
        "/v1/claims/999999/reviews",
        json={"rating": 5},
        headers=auth_header(user),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Claim not found"


def test_create_review_requires_auth(client, make_user, make_listing, make_claim):
    owner = make_user()
    listing = make_listing(owner)
    claim = make_claim(requester=owner, listing=listing, status="completed")

    response = client.post(f"/v1/claims/{claim.request_id}/reviews", json={"rating": 5})

    assert response.status_code == 401


def test_create_review_listing_not_found(client, make_user, make_claim, auth_header):
    requester = make_user(name="Requester")
    claim = make_claim(requester=requester, listing_id=999999, status="completed")

    response = client.post(
        f"/v1/claims/{claim.request_id}/reviews",
        json={"rating": 5},
        headers=auth_header(requester),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Listing not found"


def test_create_review_forbidden_non_participant(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    outsider = make_user(name="Outsider")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="completed")

    response = client.post(
        f"/v1/claims/{claim.request_id}/reviews",
        json={"rating": 5},
        headers=auth_header(outsider),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Only participants in this exchange can leave a review"


def test_create_review_not_completed(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="requested")

    response = client.post(
        f"/v1/claims/{claim.request_id}/reviews",
        json={"rating": 5},
        headers=auth_header(requester),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only completed exchanges can be reviewed"


def test_create_review_success_as_requester(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="completed")

    response = client.post(
        f"/v1/claims/{claim.request_id}/reviews",
        json={"rating": 4, "comment": "Smooth exchange"},
        headers=auth_header(requester),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["reviewer_user_id"] == requester.user_id
    assert body["reviewed_user_id"] == owner.user_id
    assert body["rating"] == 4
    assert body["comment"] == "Smooth exchange"
    assert body["reviewer_name"] == requester.name
    assert body["claim_request_id"] == claim.request_id


def test_create_review_success_as_owner(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="completed")

    response = client.post(
        f"/v1/claims/{claim.request_id}/reviews",
        json={"rating": 3},
        headers=auth_header(owner),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["reviewer_user_id"] == owner.user_id
    assert body["reviewed_user_id"] == requester.user_id
    assert body["comment"] is None


def test_create_review_duplicate(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="completed")

    first = client.post(
        f"/v1/claims/{claim.request_id}/reviews",
        json={"rating": 5},
        headers=auth_header(requester),
    )
    assert first.status_code == 201

    second = client.post(
        f"/v1/claims/{claim.request_id}/reviews",
        json={"rating": 2},
        headers=auth_header(requester),
    )

    assert second.status_code == 409
    assert second.json()["detail"] == "Review already submitted"
