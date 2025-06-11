# tests/test_auth.py

def test_register_and_login(client):
    # Rejestracja
    res = client.post("/auth/register", json={
        "username": "jan",
        "email": "jan@example.com",
        "password": "haslo123"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["username"] == "jan"
    assert data["email"] == "jan@example.com"
    assert data["language"] == "pl"

    # Logowanie
    res2 = client.post("/auth/login", json={
        "username": "jan",
        "password": "haslo123"
    })
    assert res2.status_code == 200
    tok = res2.json()
    assert "access_token" in tok
    assert tok["token_type"] == "bearer"

def test_me_endpoint_requires_auth(client):
    # Bez tokena → 401
    res = client.get("/users/me")
    assert res.status_code == 401

    # Z poprawnym tokenem
    client.post("/auth/register", json={
        "username": "xuser",
        "email": "xuser@example.com",
        "password": "pwd"
    })
    login = client.post("/auth/login", json={
        "username": "xuser",
        "password": "pwd"
    }).json()
    headers = {"Authorization": f"Bearer {login['access_token']}"}
    res2 = client.get("/users/me", headers=headers)
    assert res2.status_code == 200
    me = res2.json()
    assert me["username"] == "xuser"
    assert me["email"] == "xuser@example.com"