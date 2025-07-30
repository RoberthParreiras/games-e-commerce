import os
import io
from fastapi import UploadFile, Depends
from uuid import uuid4
from minio import Minio
from minio.error import S3Error

from ..core.config import get_minio_client

class ImageRepository:
    def __init__(self, store_object_bucket: Minio = Depends(get_minio_client)):
        self.bucket = store_object_bucket
        # self.db = db

    async def create(self, file: UploadFile, user_id: str):
        """
        Uploads an image to MinIO and saves its metadata to MongoDB
        """
        MINIO_BUCKET = os.environ.get("MINIO_BUCKET")
        MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT")

        file_id = str(uuid4())
        file_extension = file.filename.split(".")[-1] # type:ignore
        object_name = f"{file_id}.{file_extension}"

        content: bytes = await file.read()
        content_size: int = len(content)

        try:
            self.bucket.put_object(
                bucket_name=MINIO_BUCKET,
                object_name=object_name,
                data=io.BytesIO(content),
                length=content_size,
                content_type=file.content_type
            )

            file_url = f"http://{MINIO_ENDPOINT}/{MINIO_BUCKET}/{object_name}"
            return file_url

        except S3Error as e:
            print(f"Error uploading to MinIO: {e}")
            return None
