import os
from fastapi import FastAPI
from dotenv import load_dotenv

from app.endpoints import create_image
from app.model.minio import create_minio_client, create_minio_bucket

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

minio_client = create_minio_client()
create_minio_bucket(minio_client)

app = FastAPI()
app.include_router(create_image.router, tags=["image"])
