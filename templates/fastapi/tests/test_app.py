from fastapi.testclient import TestClient

from src.app import app, users_db


client = TestClient(app)


def setup_function() -> None:
    users_db.clear()


def test_health_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_and_get_user() -> None:
    created = client.post(
        "/api/v1/users",
        json={"name": "Juan Perez", "email": "juan@demo.com", "status": "active"},
    )
    assert created.status_code == 201
    user_id = created.json()["id"]

    fetched = client.get(f"/api/v1/users/{user_id}")
    assert fetched.status_code == 200
    assert fetched.json()["email"] == "juan@demo.com"


def test_email_duplicate_returns_409() -> None:
    first = client.post(
        "/api/v1/users",
        json={"name": "Juan Perez", "email": "juan@demo.com", "status": "active"},
    )
    assert first.status_code == 201

    duplicate = client.post(
        "/api/v1/users",
        json={"name": "Otro Usuario", "email": "juan@demo.com", "status": "active"},
    )
    assert duplicate.status_code == 409


def test_update_and_delete_user() -> None:
    created = client.post(
        "/api/v1/users",
        json={"name": "Maria Garcia", "email": "maria@demo.com", "status": "active"},
    )
    assert created.status_code == 201
    user_id = created.json()["id"]

    updated = client.put(
        f"/api/v1/users/{user_id}",
        json={"name": "Maria G.", "status": "inactive"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "inactive"
    assert updated.json()["name"] == "Maria G."

    deleted = client.delete(f"/api/v1/users/{user_id}")
    assert deleted.status_code == 204

    fetch_deleted = client.get(f"/api/v1/users/{user_id}")
    assert fetch_deleted.status_code == 404


def test_validation_error() -> None:
    response = client.post(
        "/api/v1/users",
        json={"name": "A", "email": "no-es-email"},
    )
    assert response.status_code == 422
