# ---------------------------------------------------------------------------
# GET /v1/users/{user_id}/notifications
# ---------------------------------------------------------------------------

def test_list_notifications_forbidden_for_other_user(client, make_user, auth_header):
    user = make_user(name="User")
    other = make_user(name="Other")

    response = client.get(f"/v1/users/{other.user_id}/notifications", headers=auth_header(user))

    assert response.status_code == 403
    assert response.json()["detail"] == "You can only view your own notifications"


def test_list_notifications_success(client, make_user, make_notification, auth_header):
    user = make_user()
    make_notification(user, content="First", type="message")
    make_notification(user, content="Second", type="exchange")

    response = client.get(f"/v1/users/{user.user_id}/notifications", headers=auth_header(user))

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_notifications_filtered_by_type(client, make_user, make_notification, auth_header):
    user = make_user()
    make_notification(user, content="Msg", type="message")
    make_notification(user, content="Exch", type="exchange")

    response = client.get(
        f"/v1/users/{user.user_id}/notifications",
        params={"type": "message"},
        headers=auth_header(user),
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["type"] == "message"


def test_list_notifications_ordered_unread_first(client, make_user, make_notification, auth_header):
    user = make_user()
    make_notification(user, content="Already read", is_read=True)
    unread = make_notification(user, content="Still unread", is_read=False)

    response = client.get(f"/v1/users/{user.user_id}/notifications", headers=auth_header(user))

    assert response.status_code == 200
    body = response.json()
    assert body[0]["notification_id"] == unread.notification_id


def test_list_notifications_requires_auth(client, make_user):
    user = make_user()

    response = client.get(f"/v1/users/{user.user_id}/notifications")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /v1/me/notifications
# ---------------------------------------------------------------------------

def test_list_my_notifications_success(client, make_user, make_notification, auth_header):
    user = make_user()
    other = make_user()
    make_notification(user, content="Mine")
    make_notification(other, content="Not mine")

    response = client.get("/v1/me/notifications", headers=auth_header(user))

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["content"] == "Mine"


def test_list_my_notifications_requires_auth(client):
    response = client.get("/v1/me/notifications")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/notifications/{notification_id}/read
# ---------------------------------------------------------------------------

def test_mark_notification_read_not_found(client, make_user, auth_header):
    user = make_user()

    response = client.put("/v1/notifications/999999/read", headers=auth_header(user))

    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"


def test_mark_notification_read_forbidden_not_owner(client, make_user, make_notification, auth_header):
    owner = make_user(name="Owner")
    other = make_user(name="Other")
    notification = make_notification(owner)

    response = client.put(f"/v1/notifications/{notification.notification_id}/read", headers=auth_header(other))

    assert response.status_code == 403
    assert response.json()["detail"] == "You can only mark your own notifications as read"


def test_mark_notification_read_success(client, make_user, make_notification, auth_header):
    user = make_user()
    notification = make_notification(user, is_read=False)

    response = client.put(f"/v1/notifications/{notification.notification_id}/read", headers=auth_header(user))

    assert response.status_code == 200
    assert response.json()["is_read"] is True


def test_mark_notification_read_requires_auth(client, make_user, make_notification):
    user = make_user()
    notification = make_notification(user)

    response = client.put(f"/v1/notifications/{notification.notification_id}/read")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/users/{user_id}/notifications/read-all
# ---------------------------------------------------------------------------

def test_mark_all_notifications_read_forbidden_for_other_user(client, make_user, auth_header):
    user = make_user(name="User")
    other = make_user(name="Other")

    response = client.put(f"/v1/users/{other.user_id}/notifications/read-all", headers=auth_header(user))

    assert response.status_code == 403
    assert response.json()["detail"] == "You can only mark your own notifications as read"


def test_mark_all_notifications_read_success(client, make_user, make_notification, auth_header):
    user = make_user()
    n1 = make_notification(user, is_read=False)
    n2 = make_notification(user, is_read=False)

    response = client.put(f"/v1/users/{user.user_id}/notifications/read-all", headers=auth_header(user))

    assert response.status_code == 204

    follow_up = client.get(f"/v1/users/{user.user_id}/notifications", headers=auth_header(user))
    assert all(n["is_read"] for n in follow_up.json())


def test_mark_all_notifications_read_requires_auth(client, make_user):
    user = make_user()

    response = client.put(f"/v1/users/{user.user_id}/notifications/read-all")

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PUT /v1/me/notifications/read-all
# ---------------------------------------------------------------------------

def test_mark_all_my_notifications_read_success(client, make_user, make_notification, auth_header):
    user = make_user()
    other = make_user()
    make_notification(user, is_read=False)
    other_notification = make_notification(other, is_read=False)

    response = client.put("/v1/me/notifications/read-all", headers=auth_header(user))

    assert response.status_code == 204

    other_follow_up = client.get(f"/v1/users/{other.user_id}/notifications", headers=auth_header(other))
    assert other_follow_up.json()[0]["is_read"] is False
    assert other_follow_up.json()[0]["notification_id"] == other_notification.notification_id


def test_mark_all_my_notifications_read_requires_auth(client):
    response = client.put("/v1/me/notifications/read-all")

    assert response.status_code == 401
