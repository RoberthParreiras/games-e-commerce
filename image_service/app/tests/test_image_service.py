import pytest
import httpx
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from ..main import app
from ..repository.image_repository import ImageRepository
from ..services.image_service import ImageService


@pytest.fixture
def mock_image_repository():
    return AsyncMock()


@pytest.fixture(autouse=True)
def override_image_repository(mock_image_repository):
    app.dependency_overrides[ImageRepository] = lambda: mock_image_repository
    yield
    app.dependency_overrides = {}


def test_create_image_success(mock_image_repository):
    """Test successful image creation via API endpoint."""
    expected_metadata = {
        "id": "68909019c7ce69410acefca8",
        "user_id": "a1b2c3d4-e5f6-5895-1234-567890abcdef",
        "filename": "image.png",
        "object_name": "add09d36-9d1f-4c1d-b177-e1dd6baf76f9.png",
        "url": "http://127.0.0.1:9000/images/add09d36-9d1f-4c1d-b177-e1dd6baf76f9.png",
        "content_type": "image/png",
        "size": 178398,
        "uploaded_at": "2025-08-04T07:48:57.419399",
    }
    mock_image_repository.create.return_value = expected_metadata

    file_content = b"fake image data"
    files = {"file": ("test.jpg", file_content, "image/jpeg")}
    params = {"user_id": "a1b2c3d4-e5f6-5895-1234-567890abcdef"}

    client = TestClient(app)
    response = client.post("/image/upload/", files=files, params=params)

    assert response.status_code == 201
    assert response.json() == expected_metadata

    mock_image_repository.create.assert_called_once()


def test_get_image_success(mock_image_repository):
    image_id = "68909019c7ce69410acefca8"
    expected_metadata = {
        "id": "68909019c7ce69410acefca8",
        "user_id": "a1b2c3d4-e5f6-5895-1234-567890abcdef",
        "filename": "image.png",
        "object_name": "add09d36-9d1f-4c1d-b177-e1dd6baf76f9.png",
        "url": "http://127.0.0.1:9000/images/add09d36-9d1f-4c1d-b177-e1dd6baf76f9.png",
        "content_type": "image/png",
        "size": 178398,
        "uploaded_at": "2025-08-04T07:48:57.419399",
    }
    mock_image_repository.get.return_value = expected_metadata

    client = TestClient(app)
    response = client.get(f"/image/{image_id}")

    assert response.status_code == 200
    assert response.json() == expected_metadata
    mock_image_repository.get.assert_called_once_with(image_id)


def test_get_image_not_found(mock_image_repository):
    image_id = ""
    mock_image_repository.get.return_value = None

    client = TestClient(app)
    response = client.get(f"/image/{image_id}")

    assert response.status_code == 404


def test_update_image_success(mock_image_repository):
    image_id = "68909019c7ce69410acefca8"
    expected_metadata = {
        "id": "68909019c7ce69410acefca8",
        "user_id": "a1b2c3d4-e5f6-5895-1234-567890abcdef",
        "filename": "new_image.png",
        "object_name": "add09d36-9d1f-4c1d-b177-e1dd6baf76f9.png",
        "url": "http://127.0.0.1:9000/images/add09d36-9d1f-4c1d-b177-e1dd6baf76f9.png",
        "content_type": "image/png",
        "size": 178398,
        "uploaded_at": "2025-08-04T07:48:57.419399",
    }

    file_content = b"new fake image data"
    files = {"file": ("new_image.png", file_content, "image/png")}
    params = {
        "user_id": "a1b2c3d4-e5f6-5895-1234-567890abcdef",
        "image_id": "68909019c7ce69410acefca8",
    }
    mock_image_repository.update.return_value = expected_metadata

    client = TestClient(app)
    response = client.put("/image/update/", files=files, params=params)

    assert response.status_code == 200
    assert response.json() == expected_metadata
    mock_image_repository.update.assert_called_once()


def test_delete_image_success(mock_image_repository):
    image_id = "68909019c7ce69410acefca8"
    expected_metadata = {"message": "Image deleted successfully"}
    mock_image_repository.delete.return_value = expected_metadata

    client = TestClient(app)
    response = client.delete(f"/image/{image_id}")

    assert response.status_code == 200
    assert response.json() == {"message": "Image deleted successfully"}


def test_delete_image_failure(mock_image_repository):
    image_id = "non_existent_id"
    mock_image_repository.delete.return_value = False

    client = TestClient(app)
    response = client.delete(f"/image/{image_id}")

    assert response.status_code == 500
