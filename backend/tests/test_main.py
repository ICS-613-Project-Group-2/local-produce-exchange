def test_index_route(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "this is the main index page"}
