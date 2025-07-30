import os
from fastapi import FastAPI
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path)

from app.api.v1.endpoints.image import router
from app.core.config import minio_client, create_minio_bucket

create_minio_bucket(minio_client)

app = FastAPI()
app.include_router(router, tags=["image"])
