import os
from fastapi import FastAPI
from dotenv import load_dotenv

from app.api.v1.endpoints.image import router
from app.core.config import create_minio_client, create_minio_bucket
from app.repository.image_repository import ImageRepository

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path)

minio_client = create_minio_client()
create_minio_bucket(minio_client)
ImageRepository(minio_client)

app = FastAPI()
app.include_router(router, tags=["image"])
