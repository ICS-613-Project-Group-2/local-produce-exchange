from api.routers.claims import _serialize_claim_history

# ---------------------------------------------------------------------------
# GET /v1/claims/mine
# ---------------------------------------------------------------------------

def test_list_my_claims_requires_auth(client):
    response = client.get("/v1/claims/mine")

    assert response.status_code == 401


def test_list_my_claims_as_requester_and_as_owner(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, name="Corn")
    claim = make_claim(requester=requester, listing=listing)

    response = client.get("/v1/claims/mine", headers=auth_header(requester))
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["role"] == "claimant"
    assert body[0]["other_user_id"] == owner.user_id
    assert body[0]["other_user_name"] == "Owner"
    assert body[0]["listing_name"] == "Corn"
    assert body[0]["listing_photo_url"] is None
    assert body[0]["can_review"] is False
    assert body[0]["already_reviewed"] is False

    response = client.get("/v1/claims/mine", headers=auth_header(owner))
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["role"] == "owner"
    assert body[0]["other_user_id"] == requester.user_id
    assert body[0]["other_user_name"] == "Requester"


def test_list_my_claims_listing_photo_url(client, make_user, make_listing, make_claim, make_photo, link_listing_photo, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    photo = make_photo()
    link_listing_photo(listing, photo)
    make_claim(requester=requester, listing=listing)

    response = client.get("/v1/claims/mine", headers=auth_header(requester))

    assert response.status_code == 200
    assert response.json()[0]["listing_photo_url"] == photo.image_link


def test_list_my_claims_can_review_and_already_reviewed(
    client, make_user, make_listing, make_claim, make_review, auth_header
):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    completed_claim = make_claim(requester=requester, listing=listing, status="completed")
    reviewed_claim = make_claim(requester=requester, listing=listing, status="completed")
    make_review(reviewed_claim, requester, owner, rating=5)

    response = client.get("/v1/claims/mine", headers=auth_header(requester))

    assert response.status_code == 200
    by_id = {row["request_id"]: row for row in response.json()}
    assert by_id[completed_claim.request_id]["can_review"] is True
    assert by_id[completed_claim.request_id]["already_reviewed"] is False
    assert by_id[reviewed_claim.request_id]["can_review"] is False
    assert by_id[reviewed_claim.request_id]["already_reviewed"] is True


def test_list_my_claims_ordered_most_recent_first(client, make_user, make_listing, make_claim, db_session, auth_header):
    from datetime import datetime, timedelta, timezone

    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    older = make_claim(requester=requester, listing=listing)
    newer = make_claim(requester=requester, listing=listing)
    older.request_date = datetime.now(timezone.utc) - timedelta(days=1)
    newer.request_date = datetime.now(timezone.utc)
    db_session.commit()

    response = client.get("/v1/claims/mine", headers=auth_header(requester))

    assert response.status_code == 200
    body = response.json()
    assert [row["request_id"] for row in body] == [newer.request_id, older.request_id]


def test_serialize_claim_history_with_no_listing():
    history = _serialize_claim_history(
        claim=type(
            "FakeClaim",
            (),
            {
                "request_id": 1,
                "listing_id": None,
                "quantity_requested": 1,
                "status": "completed",
                "request_date": None,
                "closed_date": None,
                "requester_user_id": 7,
            },
        )(),
        listing=None,
        current_user_id=7,
        reviewed_claim_ids=set(),
        db=None,
    )

    assert history.listing_name == "Listing removed"
    assert history.listing_photo_url is None
    assert history.role == "claimant"


def test_list_my_claims_other_user_none_when_listing_has_no_owner(client, make_user, make_listing, make_claim, auth_header):
    requester = make_user(name="Requester")
    listing = make_listing(owner=None)

    make_claim(requester=requester, listing=listing)

    response = client.get("/v1/claims/mine", headers=auth_header(requester))

    assert response.status_code == 200
    body = response.json()
    assert body[0]["role"] == "claimant"
    assert body[0]["other_user_id"] is None
    assert body[0]["other_user_name"] is None


# ---------------------------------------------------------------------------
# GET /v1/listings/{listing_id}/claims
# ---------------------------------------------------------------------------

def test_list_claims_for_listing_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.get("/v1/listings/999999/claims", headers=auth_header(user))

    assert response.status_code == 404


def test_list_claims_for_listing_owner_sees_all(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester1 = make_user(name="Requester1")
    requester2 = make_user(name="Requester2")
    listing = make_listing(owner)
    make_claim(requester=requester1, listing=listing)
    make_claim(requester=requester2, listing=listing)

    response = client.get(f"/v1/listings/{listing.listing_id}/claims", headers=auth_header(owner))

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_claims_for_listing_non_owner_sees_only_their_own(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester1 = make_user(name="Requester1")
    requester2 = make_user(name="Requester2")
    listing = make_listing(owner)
    claim1 = make_claim(requester=requester1, listing=listing)
    make_claim(requester=requester2, listing=listing)

    response = client.get(f"/v1/listings/{listing.listing_id}/claims", headers=auth_header(requester1))

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["request_id"] == claim1.request_id


def test_list_claims_for_listing_community_moderator_sees_all(
    client, make_user, make_community, make_membership, make_listing, make_claim, auth_header
):
    owner = make_user(name="Owner")
    moderator = make_user(name="Moderator")
    requester1 = make_user(name="Requester1")
    requester2 = make_user(name="Requester2")
    community = make_community()
    make_membership(moderator, community, role="moderator")
    listing = make_listing(owner, community_id=community.community_id)
    make_claim(requester=requester1, listing=listing)
    make_claim(requester=requester2, listing=listing)

    response = client.get(f"/v1/listings/{listing.listing_id}/claims", headers=auth_header(moderator))

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_claims_for_listing_requires_auth(client, make_user, make_listing):
    owner = make_user()
    listing = make_listing(owner)

    response = client.get(f"/v1/listings/{listing.listing_id}/claims")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# POST /v1/listings/{listing_id}/claims
# ---------------------------------------------------------------------------

def test_create_claim_listing_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.post(
        "/v1/listings/999999/claims",
        json={"quantity_requested": 1},
        headers=auth_header(user),
    )

    assert response.status_code == 404


def test_create_claim_owner_cannot_claim_own_listing(client, make_user, make_listing, auth_header):
    owner = make_user()
    listing = make_listing(owner)

    response = client.post(
        f"/v1/listings/{listing.listing_id}/claims",
        json={"quantity_requested": 1},
        headers=auth_header(owner),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "You cannot claim your own listing"


def test_create_claim_listing_not_available(client, make_user, make_listing, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, status="unavailable")

    response = client.post(
        f"/v1/listings/{listing.listing_id}/claims",
        json={"quantity_requested": 1},
        headers=auth_header(requester),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "This listing is not currently available"


def test_create_claim_quantity_exceeds_available(client, make_user, make_listing, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=2)

    response = client.post(
        f"/v1/listings/{listing.listing_id}/claims",
        json={"quantity_requested": 3},
        headers=auth_header(requester),
    )

    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"]


def test_create_claim_conflicts_with_existing_active_claim(client, make_user, make_listing, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=5)

    first = client.post(
        f"/v1/listings/{listing.listing_id}/claims",
        json={"quantity_requested": 1},
        headers=auth_header(requester),
    )
    assert first.status_code == 201

    second = client.post(
        f"/v1/listings/{listing.listing_id}/claims",
        json={"quantity_requested": 1},
        headers=auth_header(requester),
    )

    assert second.status_code == 409
    assert second.json()["detail"] == "You already have an active claim on this listing"


def test_create_claim_success_creates_message_thread(client, make_user, make_listing, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=5)

    response = client.post(
        f"/v1/listings/{listing.listing_id}/claims",
        json={"quantity_requested": 2},
        headers=auth_header(requester),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "requested"
    assert body["quantity_requested"] == 2
    assert body["requester_user_id"] == requester.user_id


def test_create_claim_requires_auth(client, make_user, make_listing):
    owner = make_user()
    listing = make_listing(owner)

    response = client.post(f"/v1/listings/{listing.listing_id}/claims", json={"quantity_requested": 1})

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/claims/{claim_id}/approve
# ---------------------------------------------------------------------------

def test_approve_claim_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/claims/999999/approve", headers=auth_header(user))

    assert response.status_code == 404


def test_approve_claim_forbidden_not_owner(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)

    response = client.put(f"/v1/claims/{claim.request_id}/approve", headers=auth_header(requester))

    assert response.status_code == 403
    assert response.json()["detail"] == "Only the listing owner can perform this action"


def test_approve_claim_wrong_status(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="approved")

    response = client.put(f"/v1/claims/{claim.request_id}/approve", headers=auth_header(owner))

    assert response.status_code == 400
    assert response.json()["detail"] == "Only requested claims can be approved"


def test_approve_claim_quantity_exceeds_remaining(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=2)
    claim = make_claim(requester=requester, listing=listing, status="requested", quantity_requested=5)

    response = client.put(f"/v1/claims/{claim.request_id}/approve", headers=auth_header(owner))

    assert response.status_code == 400
    assert "Not enough quantity remaining" in response.json()["detail"]


def test_approve_claim_success_quantity_reaches_zero(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=2)
    claim = make_claim(requester=requester, listing=listing, status="requested", quantity_requested=2)

    response = client.put(f"/v1/claims/{claim.request_id}/approve", headers=auth_header(owner))

    assert response.status_code == 200
    assert response.json()["status"] == "approved"

    listing_response = client.get(f"/v1/listings/{listing.listing_id}")
    assert listing_response.json()["quantity"] == 0
    assert listing_response.json()["status"] == "unavailable"


def test_approve_claim_success_quantity_remains_positive(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=5)
    claim = make_claim(requester=requester, listing=listing, status="requested", quantity_requested=2)

    response = client.put(f"/v1/claims/{claim.request_id}/approve", headers=auth_header(owner))

    assert response.status_code == 200

    listing_response = client.get(f"/v1/listings/{listing.listing_id}")
    assert listing_response.json()["quantity"] == 3
    assert listing_response.json()["status"] == "available"


def test_approve_claim_requires_auth(client, make_user, make_listing, make_claim):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)

    response = client.put(f"/v1/claims/{claim.request_id}/approve")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/claims/{claim_id}/decline
# ---------------------------------------------------------------------------

def test_decline_claim_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/claims/999999/decline", headers=auth_header(user))

    assert response.status_code == 404


def test_decline_claim_forbidden_not_owner(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)

    response = client.put(f"/v1/claims/{claim.request_id}/decline", headers=auth_header(requester))

    assert response.status_code == 403


def test_decline_claim_wrong_status(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="approved")

    response = client.put(f"/v1/claims/{claim.request_id}/decline", headers=auth_header(owner))

    assert response.status_code == 400
    assert response.json()["detail"] == "Only requested claims can be denied"


def test_decline_claim_success(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="requested")

    response = client.put(f"/v1/claims/{claim.request_id}/decline", headers=auth_header(owner))

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "denied"
    assert body["closed_date"] is not None


def test_decline_claim_requires_auth(client, make_user, make_listing, make_claim):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)

    response = client.put(f"/v1/claims/{claim.request_id}/decline")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/claims/{claim_id}/cancel
# ---------------------------------------------------------------------------

def test_cancel_claim_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/claims/999999/cancel", headers=auth_header(user))

    assert response.status_code == 404


def test_cancel_claim_forbidden_neither_participant(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    outsider = make_user(name="Outsider")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)

    response = client.put(f"/v1/claims/{claim.request_id}/cancel", headers=auth_header(outsider))

    assert response.status_code == 400
    assert "Only those who have made the claim request" in response.json()["detail"]


def test_cancel_claim_wrong_status(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="picked_up")

    response = client.put(f"/v1/claims/{claim.request_id}/cancel", headers=auth_header(requester))

    assert response.status_code == 400
    assert "cancellation after pickup is not allowed" in response.json()["detail"]


def test_cancel_claim_success_from_requested_as_requester(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=5)
    claim = make_claim(requester=requester, listing=listing, status="requested", quantity_requested=2)

    response = client.put(f"/v1/claims/{claim.request_id}/cancel", headers=auth_header(requester))

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"

    listing_response = client.get(f"/v1/listings/{listing.listing_id}")
    assert listing_response.json()["quantity"] == 5


def test_cancel_claim_success_from_approved_as_owner_restores_unavailable_listing(
    client, make_user, make_listing, make_claim, auth_header
):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=2, status="unavailable")
    claim = make_claim(requester=requester, listing=listing, status="approved", quantity_requested=2)

    response = client.put(f"/v1/claims/{claim.request_id}/cancel", headers=auth_header(owner))

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"

    listing_response = client.get(f"/v1/listings/{listing.listing_id}")
    assert listing_response.json()["quantity"] == 4
    assert listing_response.json()["status"] == "available"


def test_cancel_claim_success_from_approved_listing_stays_available(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner, quantity=3, status="available")
    claim = make_claim(requester=requester, listing=listing, status="approved", quantity_requested=2)

    response = client.put(f"/v1/claims/{claim.request_id}/cancel", headers=auth_header(requester))

    assert response.status_code == 200

    listing_response = client.get(f"/v1/listings/{listing.listing_id}")
    assert listing_response.json()["quantity"] == 5
    assert listing_response.json()["status"] == "available"


def test_cancel_claim_requires_auth(client, make_user, make_listing, make_claim):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)

    response = client.put(f"/v1/claims/{claim.request_id}/cancel")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/claims/{claim_id}/pickup
# ---------------------------------------------------------------------------

def test_pickup_claim_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/claims/999999/pickup", headers=auth_header(user))

    assert response.status_code == 404


def test_pickup_claim_forbidden_neither_participant(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    outsider = make_user(name="Outsider")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing)

    response = client.put(f"/v1/claims/{claim.request_id}/pickup", headers=auth_header(outsider))

    assert response.status_code == 400


def test_pickup_claim_wrong_status(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="requested")

    response = client.put(f"/v1/claims/{claim.request_id}/pickup", headers=auth_header(requester))

    assert response.status_code == 400
    assert response.json()["detail"] == "Only approved claims can be marked as picked up"


def test_pickup_claim_success_as_requester(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="approved")

    response = client.put(f"/v1/claims/{claim.request_id}/pickup", headers=auth_header(requester))

    assert response.status_code == 200
    assert response.json()["status"] == "picked_up"


def test_pickup_claim_success_as_owner(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="approved")

    response = client.put(f"/v1/claims/{claim.request_id}/pickup", headers=auth_header(owner))

    assert response.status_code == 200
    assert response.json()["status"] == "picked_up"


def test_pickup_claim_requires_auth(client, make_user, make_listing, make_claim):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="approved")

    response = client.put(f"/v1/claims/{claim.request_id}/pickup")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/claims/{claim_id}/complete
# ---------------------------------------------------------------------------

def test_complete_claim_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/claims/999999/complete", headers=auth_header(user))

    assert response.status_code == 404


def test_complete_claim_forbidden_neither_participant(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    outsider = make_user(name="Outsider")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="picked_up")

    response = client.put(f"/v1/claims/{claim.request_id}/complete", headers=auth_header(outsider))

    assert response.status_code == 400


def test_complete_claim_wrong_status(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="approved")

    response = client.put(f"/v1/claims/{claim.request_id}/complete", headers=auth_header(requester))

    assert response.status_code == 400
    assert response.json()["detail"] == "Only picked-up claims can be marked as completed"


def test_complete_claim_success_as_requester(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="picked_up")

    response = client.put(f"/v1/claims/{claim.request_id}/complete", headers=auth_header(requester))

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["closed_date"] is not None


def test_complete_claim_success_as_owner(client, make_user, make_listing, make_claim, auth_header):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="picked_up")

    response = client.put(f"/v1/claims/{claim.request_id}/complete", headers=auth_header(owner))

    assert response.status_code == 200
    assert response.json()["status"] == "completed"


def test_complete_claim_requires_auth(client, make_user, make_listing, make_claim):
    owner = make_user(name="Owner")
    requester = make_user(name="Requester")
    listing = make_listing(owner)
    claim = make_claim(requester=requester, listing=listing, status="picked_up")

    response = client.put(f"/v1/claims/{claim.request_id}/complete")

    assert response.status_code == 401
