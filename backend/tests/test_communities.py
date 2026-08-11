from datetime import datetime, timedelta, timezone

from api.routers.communities import _community_to_community_response

# ---------------------------------------------------------------------------
# GET /v1/communities
# ---------------------------------------------------------------------------

def test_list_communities_requires_auth(client):
    response = client.get("/v1/communities")

    assert response.status_code == 401


def test_list_communities_splits_mine_and_public(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    mine = make_community(name="Mine", is_private=True)
    make_membership(user, mine, role="member")
    public = make_community(name="Public", is_private=False)
    private_other = make_community(name="PrivateOther", is_private=True)

    response = client.get("/v1/communities", headers=auth_header(user))

    assert response.status_code == 200
    body = response.json()
    my_names = {c["name"] for c in body["my_communities"]}
    public_names = {c["name"] for c in body["public_communities"]}
    assert my_names == {"Mine"}
    assert public_names == {"Public"}
    assert "PrivateOther" not in my_names | public_names


def test_list_communities_search_filters_both_lists(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    mine_match = make_community(name="Garden Club", description="for gardeners", is_private=True)
    make_membership(user, mine_match, role="member")
    mine_no_match = make_community(name="Book Club", description="for readers", is_private=True)
    make_membership(user, mine_no_match, role="member")
    public_match = make_community(name="Public Garden", description="open to all", is_private=False)
    public_no_match = make_community(name="Random Public", description="misc", is_private=False)

    response = client.get("/v1/communities", params={"search": "garden"}, headers=auth_header(user))

    assert response.status_code == 200
    body = response.json()
    my_names = {c["name"] for c in body["my_communities"]}
    public_names = {c["name"] for c in body["public_communities"]}
    assert my_names == {"Garden Club"}
    assert public_names == {"Public Garden"}


def test_list_communities_ordered_alphabetically(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    zebra = make_community(name="Zebra", is_private=True)
    apple = make_community(name="Apple", is_private=True)
    make_membership(user, zebra, role="member")
    make_membership(user, apple, role="member")

    response = client.get("/v1/communities", headers=auth_header(user))

    assert response.status_code == 200
    names = [c["name"] for c in response.json()["my_communities"]]
    assert names == ["Apple", "Zebra"]


# ---------------------------------------------------------------------------
# POST /v1/communities
# ---------------------------------------------------------------------------

def test_create_community_success(client, make_user, auth_header):
    user = make_user()

    response = client.post(
        "/v1/communities",
        json={
            "name": "New Community",
            "description": "desc",
            "location": "Honolulu",
            "guidelines": "be kind",
            "is_private": True,
        },
        headers=auth_header(user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "New Community"
    assert body["member_count"] == 1

    listing = client.get("/v1/communities", headers=auth_header(user))
    assert any(c["name"] == "New Community" for c in listing.json()["my_communities"])


def test_create_community_requires_auth(client):
    response = client.post(
        "/v1/communities",
        json={"name": "X", "description": "d", "location": "l", "guidelines": "g"},
    )

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /v1/communities/{community_id}
# ---------------------------------------------------------------------------

def test_get_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.get("/v1/communities/999999", headers=auth_header(user))

    assert response.status_code == 404


def test_get_community_forbidden_private_non_member(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community(is_private=True)

    response = client.get(f"/v1/communities/{community.community_id}", headers=auth_header(user))

    assert response.status_code == 403
    assert response.json()["detail"] == "This community is private"


def test_get_community_success_private_member(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    community = make_community(is_private=True)
    make_membership(user, community, role="member")

    response = client.get(f"/v1/communities/{community.community_id}", headers=auth_header(user))

    assert response.status_code == 200


def test_get_community_success_public_non_member(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community(is_private=False)

    response = client.get(f"/v1/communities/{community.community_id}", headers=auth_header(user))

    assert response.status_code == 200


def test_get_community_with_banner_photo(client, make_user, make_community, make_photo, auth_header):
    user = make_user()
    photo = make_photo()
    community = make_community(is_private=False, banner_photo_id=photo.photo_id)

    response = client.get(f"/v1/communities/{community.community_id}", headers=auth_header(user))

    assert response.status_code == 200
    assert response.json()["banner_url"] == photo.image_link


def test_get_community_without_banner_photo(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community(is_private=False)

    response = client.get(f"/v1/communities/{community.community_id}", headers=auth_header(user))

    assert response.status_code == 200
    assert response.json()["banner_url"] is None


def test_community_to_community_response_dangling_banner_photo_id(db_session, make_community):
    community = make_community(is_private=False, banner_photo_id=999999)

    response = _community_to_community_response(db_session, community)

    assert response.banner_url is None


# ---------------------------------------------------------------------------
# PUT /v1/communities/{community_id}
# ---------------------------------------------------------------------------

def test_update_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put(
        "/v1/communities/999999",
        json={"name": "N", "description": "d", "location": "l", "guidelines": "g"},
        headers=auth_header(user),
    )

    assert response.status_code == 404


def test_update_community_forbidden_no_membership(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community()

    response = client.put(
        f"/v1/communities/{community.community_id}",
        json={"name": "N", "description": "d", "location": "l", "guidelines": "g"},
        headers=auth_header(user),
    )

    assert response.status_code == 403


def test_update_community_forbidden_plain_member(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    community = make_community()
    make_membership(user, community, role="member")

    response = client.put(
        f"/v1/communities/{community.community_id}",
        json={"name": "N", "description": "d", "location": "l", "guidelines": "g"},
        headers=auth_header(user),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "You must be a community moderator to perform this action"


def test_update_community_success_for_each_privileged_role(client, make_user, make_community, make_membership, auth_header):
    for role in ("owner", "moderator", "admin"):
        user = make_user(name=f"{role.title()}User")
        community = make_community(name=f"Community-{role}")
        make_membership(user, community, role=role)

        response = client.put(
            f"/v1/communities/{community.community_id}",
            json={"name": "Updated Name", "description": "d2", "location": "l2", "guidelines": "g2"},
            headers=auth_header(user),
        )

        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"

        confirm = client.get(f"/v1/communities/{community.community_id}", headers=auth_header(user))
        assert confirm.json()["name"] == "Updated Name"


def test_update_community_requires_auth(client, make_community):
    community = make_community()

    response = client.put(
        f"/v1/communities/{community.community_id}",
        json={"name": "N", "description": "d", "location": "l", "guidelines": "g"},
    )

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# POST /v1/communities/{community_id}/invite
# ---------------------------------------------------------------------------

def test_invite_to_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.post(
        "/v1/communities/999999/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(user),
    )

    assert response.status_code == 404


def test_invite_to_private_community_forbidden_for_plain_member(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    community = make_community(is_private=True)
    make_membership(user, community, role="member")

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(user),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "You must be a community moderator to perform this action"


def test_invite_to_private_community_success_for_moderator(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    community = make_community(is_private=True)
    make_membership(user, community, role="moderator")

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"
    assert body["expiration_date"] is not None


def test_invite_to_public_community_forbidden_for_non_member(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community(is_private=False)

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(user),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Only members can send invitations"


def test_invite_to_public_community_success_for_plain_member(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    community = make_community(is_private=False)
    make_membership(user, community, role="member")

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(user),
    )

    assert response.status_code == 201


def test_invite_to_community_conflict_invitee_already_member(client, make_user, make_community, make_membership, auth_header):
    inviter = make_user(name="Inviter")
    invitee = make_user(name="Invitee", email="invitee@example.com")
    community = make_community(is_private=False)
    make_membership(inviter, community, role="member")
    make_membership(invitee, community, role="member")

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(inviter),
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "This user is already a member of the community"


def test_invite_to_community_conflict_pending_invitation_no_expiration(
    client, make_user, make_community, make_membership, make_invitation, auth_header
):
    inviter = make_user(name="Inviter")
    community = make_community(is_private=False)
    make_membership(inviter, community, role="member")
    make_invitation(community, inviter, email="invitee@example.com", status="pending", expiration_date=None)

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(inviter),
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "This email already has a pending invitation to the community"


def test_invite_to_community_conflict_pending_invitation_not_yet_expired(
    client, make_user, make_community, make_membership, make_invitation, auth_header
):
    inviter = make_user(name="Inviter")
    community = make_community(is_private=False)
    make_membership(inviter, community, role="member")
    make_invitation(
        community,
        inviter,
        email="invitee@example.com",
        status="pending",
        expiration_date=datetime.now(timezone.utc) + timedelta(days=1),
    )

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(inviter),
    )

    assert response.status_code == 409


def test_invite_to_community_allowed_when_previous_invitation_expired(
    client, make_user, make_community, make_membership, make_invitation, auth_header
):
    inviter = make_user(name="Inviter")
    community = make_community(is_private=False)
    make_membership(inviter, community, role="member")
    make_invitation(
        community,
        inviter,
        email="invitee@example.com",
        status="pending",
        expiration_date=datetime.now(timezone.utc) - timedelta(days=1),
    )

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
        headers=auth_header(inviter),
    )

    assert response.status_code == 201


def test_invite_to_community_requires_auth(client, make_community):
    community = make_community(is_private=False)

    response = client.post(
        f"/v1/communities/{community.community_id}/invite",
        json={"email": "invitee@example.com"},
    )

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# POST /v1/communities/{community_id}/join
# ---------------------------------------------------------------------------

def test_join_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.post("/v1/communities/999999/join", headers=auth_header(user))

    assert response.status_code == 404


def test_join_community_conflict_already_member(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    community = make_community(is_private=False)
    make_membership(user, community, role="member")

    response = client.post(f"/v1/communities/{community.community_id}/join", headers=auth_header(user))

    assert response.status_code == 409
    assert response.json()["detail"] == "You are already a member of this community"


def test_join_community_success(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community(is_private=False)

    response = client.post(f"/v1/communities/{community.community_id}/join", headers=auth_header(user))

    assert response.status_code == 201
    assert response.json()["role"] == "member"


def test_join_community_requires_auth(client, make_community):
    community = make_community(is_private=False)

    response = client.post(f"/v1/communities/{community.community_id}/join")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# POST /v1/communities/{community_id}/leave
# ---------------------------------------------------------------------------

def test_leave_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.post("/v1/communities/999999/leave", headers=auth_header(user))

    assert response.status_code == 404


def test_leave_community_not_a_member(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community(is_private=False)

    response = client.post(f"/v1/communities/{community.community_id}/leave", headers=auth_header(user))

    assert response.status_code == 404
    assert response.json()["detail"] == "You are not a member of this community"


def test_leave_community_forbidden_for_owner(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    community = make_community(is_private=False)
    make_membership(user, community, role="owner")

    response = client.post(f"/v1/communities/{community.community_id}/leave", headers=auth_header(user))

    assert response.status_code == 400
    assert "Owners cannot leave" in response.json()["detail"]


def test_leave_community_success(client, make_user, make_community, make_membership, auth_header):
    user = make_user()
    community = make_community(is_private=False)
    make_membership(user, community, role="member")

    response = client.post(f"/v1/communities/{community.community_id}/leave", headers=auth_header(user))

    assert response.status_code == 204

    again = client.post(f"/v1/communities/{community.community_id}/leave", headers=auth_header(user))
    assert again.status_code == 404


def test_leave_community_requires_auth(client, make_community):
    community = make_community(is_private=False)

    response = client.post(f"/v1/communities/{community.community_id}/leave")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /v1/communities/{community_id}/members
# ---------------------------------------------------------------------------

def test_list_community_members_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.get("/v1/communities/999999/members", headers=auth_header(user))

    assert response.status_code == 404


def test_list_community_members_forbidden_non_member(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community()

    response = client.get(f"/v1/communities/{community.community_id}/members", headers=auth_header(user))

    assert response.status_code == 403
    assert response.json()["detail"] == "You must be a member to view this community's members"


def test_list_community_members_success(client, make_user, make_community, make_membership, auth_header):
    owner = make_user(name="Owner")
    other = make_user(name="Other")
    community = make_community()
    make_membership(owner, community, role="owner")
    make_membership(other, community, role="member")

    response = client.get(f"/v1/communities/{community.community_id}/members", headers=auth_header(owner))

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_community_members_requires_auth(client, make_community):
    community = make_community()

    response = client.get(f"/v1/communities/{community.community_id}/members")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# DELETE /v1/communities/{community_id}/members/{user_id}
# ---------------------------------------------------------------------------

def test_remove_community_member_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.delete("/v1/communities/999999/members/1", headers=auth_header(user))

    assert response.status_code == 404


def test_remove_community_member_forbidden_not_moderator(client, make_user, make_community, make_membership, auth_header):
    plain_member = make_user(name="PlainMember")
    target = make_user(name="Target")
    community = make_community()
    make_membership(plain_member, community, role="member")
    make_membership(target, community, role="member")

    response = client.delete(
        f"/v1/communities/{community.community_id}/members/{target.user_id}",
        headers=auth_header(plain_member),
    )

    assert response.status_code == 403


def test_remove_community_member_target_not_found(client, make_user, make_community, make_membership, auth_header):
    owner = make_user(name="Owner")
    community = make_community()
    make_membership(owner, community, role="owner")

    response = client.delete(
        f"/v1/communities/{community.community_id}/members/999999",
        headers=auth_header(owner),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User is not a member of this community"


def test_remove_community_member_cannot_remove_owner(client, make_user, make_community, make_membership, auth_header):
    owner = make_user(name="Owner")
    moderator = make_user(name="Moderator")
    community = make_community()
    make_membership(owner, community, role="owner")
    make_membership(moderator, community, role="moderator")

    response = client.delete(
        f"/v1/communities/{community.community_id}/members/{owner.user_id}",
        headers=auth_header(moderator),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot remove the community owner"


def test_remove_community_member_success(client, make_user, make_community, make_membership, auth_header):
    owner = make_user(name="Owner")
    target = make_user(name="Target")
    community = make_community()
    make_membership(owner, community, role="owner")
    make_membership(target, community, role="member")

    response = client.delete(
        f"/v1/communities/{community.community_id}/members/{target.user_id}",
        headers=auth_header(owner),
    )

    assert response.status_code == 204


def test_remove_community_member_requires_auth(client, make_community):
    community = make_community()

    response = client.delete(f"/v1/communities/{community.community_id}/members/1")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/communities/{community_id}/members/{user_id}/role
# ---------------------------------------------------------------------------

def test_update_member_role_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put(
        "/v1/communities/999999/members/1/role",
        params={"role": "moderator"},
        headers=auth_header(user),
    )

    assert response.status_code == 404


def test_update_member_role_forbidden_not_moderator(client, make_user, make_community, make_membership, auth_header):
    plain_member = make_user(name="PlainMember")
    target = make_user(name="Target")
    community = make_community()
    make_membership(plain_member, community, role="member")
    make_membership(target, community, role="member")

    response = client.put(
        f"/v1/communities/{community.community_id}/members/{target.user_id}/role",
        params={"role": "moderator"},
        headers=auth_header(plain_member),
    )

    assert response.status_code == 403


def test_update_member_role_target_not_found(client, make_user, make_community, make_membership, auth_header):
    owner = make_user(name="Owner")
    community = make_community()
    make_membership(owner, community, role="owner")

    response = client.put(
        f"/v1/communities/{community.community_id}/members/999999/role",
        params={"role": "moderator"},
        headers=auth_header(owner),
    )

    assert response.status_code == 404


def test_update_member_role_cannot_change_owner(client, make_user, make_community, make_membership, auth_header):
    owner = make_user(name="Owner")
    moderator = make_user(name="Moderator")
    community = make_community()
    make_membership(owner, community, role="owner")
    make_membership(moderator, community, role="moderator")

    response = client.put(
        f"/v1/communities/{community.community_id}/members/{owner.user_id}/role",
        params={"role": "moderator"},
        headers=auth_header(moderator),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot change the owner's role"


def test_update_member_role_invalid_role(client, make_user, make_community, make_membership, auth_header):
    owner = make_user(name="Owner")
    target = make_user(name="Target")
    community = make_community()
    make_membership(owner, community, role="owner")
    make_membership(target, community, role="member")

    response = client.put(
        f"/v1/communities/{community.community_id}/members/{target.user_id}/role",
        params={"role": "supreme-leader"},
        headers=auth_header(owner),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid role"


def test_update_member_role_success(client, make_user, make_community, make_membership, auth_header):
    owner = make_user(name="Owner")
    target = make_user(name="Target")
    community = make_community()
    make_membership(owner, community, role="owner")
    make_membership(target, community, role="member")

    response = client.put(
        f"/v1/communities/{community.community_id}/members/{target.user_id}/role",
        params={"role": "moderator"},
        headers=auth_header(owner),
    )

    assert response.status_code == 200
    assert response.json()["role"] == "moderator"


def test_update_member_role_requires_auth(client, make_community):
    community = make_community()

    response = client.put(
        f"/v1/communities/{community.community_id}/members/1/role",
        params={"role": "moderator"},
    )

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /v1/communities/{community_id}/posts
# ---------------------------------------------------------------------------

def test_list_community_posts_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.get("/v1/communities/999999/posts", headers=auth_header(user))

    assert response.status_code == 404


def test_list_community_posts_forbidden_non_member(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community()

    response = client.get(f"/v1/communities/{community.community_id}/posts", headers=auth_header(user))

    assert response.status_code == 403
    assert response.json()["detail"] == "You must be a member to view posts"


def test_list_community_posts_success(client, make_user, make_community, make_membership, make_community_post, auth_header):
    member = make_user()
    community = make_community()
    make_membership(member, community, role="member")
    make_community_post(community, member, content="First post")
    make_community_post(community, member, content="Second post")

    response = client.get(f"/v1/communities/{community.community_id}/posts", headers=auth_header(member))

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_community_posts_requires_auth(client, make_community):
    community = make_community()

    response = client.get(f"/v1/communities/{community.community_id}/posts")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# POST /v1/communities/{community_id}/posts
# ---------------------------------------------------------------------------

def test_create_community_post_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.post(
        "/v1/communities/999999/posts",
        json={"content": "Hello"},
        headers=auth_header(user),
    )

    assert response.status_code == 404


def test_create_community_post_forbidden_non_member(client, make_user, make_community, auth_header):
    user = make_user()
    community = make_community()

    response = client.post(
        f"/v1/communities/{community.community_id}/posts",
        json={"content": "Hello"},
        headers=auth_header(user),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "You must be a member to create posts"


def test_create_community_post_success(client, make_user, make_community, make_membership, auth_header):
    member = make_user()
    community = make_community()
    make_membership(member, community, role="member")

    response = client.post(
        f"/v1/communities/{community.community_id}/posts",
        json={"content": "Hello community!"},
        headers=auth_header(member),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["content"] == "Hello community!"
    assert body["user_id"] == member.user_id


def test_create_community_post_requires_auth(client, make_community):
    community = make_community()

    response = client.post(f"/v1/communities/{community.community_id}/posts", json={"content": "Hello"})

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /v1/communities/{community_id}/join-requests
# ---------------------------------------------------------------------------

def test_list_join_requests_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.get("/v1/communities/999999/join-requests", headers=auth_header(user))

    assert response.status_code == 404


def test_list_join_requests_forbidden_not_moderator(client, make_user, make_community, make_membership, auth_header):
    plain_member = make_user()
    community = make_community()
    make_membership(plain_member, community, role="member")

    response = client.get(f"/v1/communities/{community.community_id}/join-requests", headers=auth_header(plain_member))

    assert response.status_code == 403


def test_list_join_requests_only_pending(
    client, make_user, make_community, make_membership, make_join_request, auth_header
):
    owner = make_user(name="Owner")
    applicant1 = make_user(name="Applicant1")
    applicant2 = make_user(name="Applicant2")
    community = make_community()
    make_membership(owner, community, role="owner")
    pending = make_join_request(community, applicant1, status="pending")
    make_join_request(community, applicant2, status="approved")

    response = client.get(f"/v1/communities/{community.community_id}/join-requests", headers=auth_header(owner))

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["request_id"] == pending.request_id


def test_list_join_requests_requires_auth(client, make_community):
    community = make_community()

    response = client.get(f"/v1/communities/{community.community_id}/join-requests")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/communities/{community_id}/join-requests/{request_id}/approve
# ---------------------------------------------------------------------------

def test_approve_join_request_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/communities/999999/join-requests/1/approve", headers=auth_header(user))

    assert response.status_code == 404


def test_approve_join_request_forbidden_not_moderator(
    client, make_user, make_community, make_membership, make_join_request, auth_header
):
    plain_member = make_user(name="PlainMember")
    applicant = make_user(name="Applicant")
    community = make_community()
    make_membership(plain_member, community, role="member")
    join_request = make_join_request(community, applicant)

    response = client.put(
        f"/v1/communities/{community.community_id}/join-requests/{join_request.request_id}/approve",
        headers=auth_header(plain_member),
    )

    assert response.status_code == 403


def test_approve_join_request_not_found(client, make_user, make_community, make_membership, auth_header):
    owner = make_user()
    community = make_community()
    make_membership(owner, community, role="owner")

    response = client.put(
        f"/v1/communities/{community.community_id}/join-requests/999999/approve",
        headers=auth_header(owner),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Join request not found"


def test_approve_join_request_not_pending(
    client, make_user, make_community, make_membership, make_join_request, auth_header
):
    owner = make_user(name="Owner")
    applicant = make_user(name="Applicant")
    community = make_community()
    make_membership(owner, community, role="owner")
    join_request = make_join_request(community, applicant, status="rejected")

    response = client.put(
        f"/v1/communities/{community.community_id}/join-requests/{join_request.request_id}/approve",
        headers=auth_header(owner),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Join request is no longer pending"


def test_approve_join_request_success_creates_membership(
    client, make_user, make_community, make_membership, make_join_request, auth_header
):
    owner = make_user(name="Owner")
    applicant = make_user(name="Applicant")
    community = make_community()
    make_membership(owner, community, role="owner")
    join_request = make_join_request(community, applicant)

    response = client.put(
        f"/v1/communities/{community.community_id}/join-requests/{join_request.request_id}/approve",
        headers=auth_header(owner),
    )

    assert response.status_code == 200
    assert response.json()["status"] == "approved"

    members = client.get(f"/v1/communities/{community.community_id}/members", headers=auth_header(owner))
    member_ids = {m["user_id"] for m in members.json()}
    assert applicant.user_id in member_ids


def test_approve_join_request_requires_auth(client, make_community):
    community = make_community()

    response = client.put(f"/v1/communities/{community.community_id}/join-requests/1/approve")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/communities/{community_id}/join-requests/{request_id}/reject
# ---------------------------------------------------------------------------

def test_reject_join_request_community_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/communities/999999/join-requests/1/reject", headers=auth_header(user))

    assert response.status_code == 404


def test_reject_join_request_forbidden_not_moderator(
    client, make_user, make_community, make_membership, make_join_request, auth_header
):
    plain_member = make_user(name="PlainMember")
    applicant = make_user(name="Applicant")
    community = make_community()
    make_membership(plain_member, community, role="member")
    join_request = make_join_request(community, applicant)

    response = client.put(
        f"/v1/communities/{community.community_id}/join-requests/{join_request.request_id}/reject",
        headers=auth_header(plain_member),
    )

    assert response.status_code == 403


def test_reject_join_request_not_found(client, make_user, make_community, make_membership, auth_header):
    owner = make_user()
    community = make_community()
    make_membership(owner, community, role="owner")

    response = client.put(
        f"/v1/communities/{community.community_id}/join-requests/999999/reject",
        headers=auth_header(owner),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Join request not found"


def test_reject_join_request_not_pending(
    client, make_user, make_community, make_membership, make_join_request, auth_header
):
    owner = make_user(name="Owner")
    applicant = make_user(name="Applicant")
    community = make_community()
    make_membership(owner, community, role="owner")
    join_request = make_join_request(community, applicant, status="approved")

    response = client.put(
        f"/v1/communities/{community.community_id}/join-requests/{join_request.request_id}/reject",
        headers=auth_header(owner),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Join request is no longer pending"


def test_reject_join_request_success(
    client, make_user, make_community, make_membership, make_join_request, auth_header
):
    owner = make_user(name="Owner")
    applicant = make_user(name="Applicant")
    community = make_community()
    make_membership(owner, community, role="owner")
    join_request = make_join_request(community, applicant)

    response = client.put(
        f"/v1/communities/{community.community_id}/join-requests/{join_request.request_id}/reject",
        headers=auth_header(owner),
    )

    assert response.status_code == 200
    assert response.json()["status"] == "rejected"


def test_reject_join_request_requires_auth(client, make_community):
    community = make_community()

    response = client.put(f"/v1/communities/{community.community_id}/join-requests/1/reject")

    assert response.status_code == 401
