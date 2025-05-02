# Image Service

This directory contains the `image_service`, a microservice for handling image processing tasks.

## Features

- Upload images to MinIO
- Store the images URL in a MongoDB database

## Getting Started

### Running the docker containers for MinIO and MongoDB
```bash
docker run -p 9000:9000 -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=YOUR_ACCESS_KEY" \
  -e "MINIO_ROOT_PASSWORD=YOUR_SECRET_KEY" \
  quay.io/minio/minio server /data --console-address ":9001"

docker run -d -p 27017:27017 --name mongodb mongo
```

### Installation

```bash
uv python install 3.12
uv venv
uv lock
uv sync
```

### Running the Service

```bash
uvicorn main:app --reload
```

### API Endpoints

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| POST   | `/upload/`       | Upload an image      |
| GET    | `/docs`          | Open FastAPI Swagger |

## Configuration

Configure environment variables in a `.env` file:

```
MINIO_ENDPOINT=127.0.0.1:9000
MINIO_ACCESS_KEY=minio_access_key
MINIO_SECRET_KEY=minio_secret_key
MINIO_BUCKET=minio_bucket
MINIO_SECURE=False # Set to True if using HTTPS
```

## License

MIT
