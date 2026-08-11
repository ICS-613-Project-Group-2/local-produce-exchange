class FakeUploadResponse:
    def __init__(self, status_code):
        self.status_code = status_code


def test_create_photo_success(client, make_user, auth_header, monkeypatch):
    monkeypatch.setattr("api.routers.photos.httpx.post", lambda *a, **k: FakeUploadResponse(200))
    user = make_user()

    response = client.post(
        "/v1/photos",
        files={"file": ("photo.png", b"fake-image-bytes", "image/png")},
        headers=auth_header(user),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["image_link"].endswith(".png")
    assert "/storage/v1/object/public/" in body["image_link"]


def test_create_photo_without_filename_extension_defaults_to_jpg(client, make_user, auth_header, monkeypatch):
    monkeypatch.setattr("api.routers.photos.httpx.post", lambda *a, **k: FakeUploadResponse(200))
    user = make_user()

    response = client.post(
        "/v1/photos",
        files={"file": ("photoNoExtension", b"fake-image-bytes", "image/jpeg")},
        headers=auth_header(user),
    )

    assert response.status_code == 201
    assert response.json()["image_link"].endswith(".jpg")


def test_create_photo_unsupported_content_type(client, make_user, auth_header, monkeypatch):
    monkeypatch.setattr("api.routers.photos.httpx.post", lambda *a, **k: FakeUploadResponse(200))
    user = make_user()

    response = client.post(
        "/v1/photos",
        files={"file": ("notes.txt", b"just some text", "text/plain")},
        headers=auth_header(user),
    )

    assert response.status_code == 400
    assert "Unsupported image type" in response.json()["detail"]


def test_create_photo_too_large(client, make_user, auth_header, monkeypatch):
    monkeypatch.setattr("api.routers.photos.httpx.post", lambda *a, **k: FakeUploadResponse(200))
    user = make_user()
    oversized_content = b"a" * (5 * 1024 * 1024 + 1)

    response = client.post(
        "/v1/photos",
        files={"file": ("photo.png", oversized_content, "image/png")},
        headers=auth_header(user),
    )

    assert response.status_code == 400
    assert "too large" in response.json()["detail"]


def test_create_photo_upload_failure_returns_bad_gateway(client, make_user, auth_header, monkeypatch):
    monkeypatch.setattr("api.routers.photos.httpx.post", lambda *a, **k: FakeUploadResponse(500))
    user = make_user()

    response = client.post(
        "/v1/photos",
        files={"file": ("photo.png", b"fake-image-bytes", "image/png")},
        headers=auth_header(user),
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "Failed to upload image to storage"


def test_create_photo_requires_auth(client, monkeypatch):
    monkeypatch.setattr("api.routers.photos.httpx.post", lambda *a, **k: FakeUploadResponse(200))

    response = client.post(
        "/v1/photos",
        files={"file": ("photo.png", b"fake-image-bytes", "image/png")},
    )

    assert response.status_code == 401
