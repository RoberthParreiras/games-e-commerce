import os
import io
from fastapi import UploadFile, Depends
from uuid import uuid4
from minio import Minio
from minio.error import S3Error
from pymongo.asynchronous.collection import AsyncCollection
from pymongo.errors import PyMongoError
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
import logging

from ..core.config import get_minio_client, image_collection
from ..repository.mongo.image import ImageModel
from ..repository.exceptions import StorageOperationError, DatabaseOperationError

log = logging.getLogger(__name__)


class ImageRepository:
    _MINIO_BUCKET = os.environ.get("MINIO_BUCKET")
    _MINIO_HOST = os.environ.get("MINIO_HOST")

    def __init__(
        self,
        store_object_bucket: Minio = Depends(get_minio_client),
        db: AsyncCollection = Depends(lambda: image_collection),
    ):
        self.bucket = store_object_bucket
        self.db = db

    async def _prepare_file_for_upload(
        self, file: UploadFile
    ) -> tuple[str, bytes, int, str]:
        """
        Prepares file for upload by generating a unique name and reading its content.
        """

        file_id = str(uuid4())
        file_extension = file.filename.split(".")[-1]  # type:ignore
        object_name = f"{file_id}.{file_extension}"

        content: bytes = await file.read()
        content_size: int = len(content)
        content_type = file.content_type

        return object_name, content, content_size, content_type  # type:ignore

    async def create(self, file: UploadFile, user_id: str):
        """
        Uploads an image to MinIO and saves its metadata to MongoDB
        """

        (
            object_name,
            content,
            content_size,
            content_type,
        ) = await self._prepare_file_for_upload(file)

        try:
            self.bucket.put_object(
                bucket_name=self._MINIO_BUCKET,  # type:ignore
                object_name=object_name,
                data=io.BytesIO(content),
                length=content_size,
                content_type=content_type,
            )

            file_url = f"http://{self._MINIO_HOST}/{self._MINIO_BUCKET}/{object_name}"

            image = ImageModel(
                user_id=user_id,  # type:ignore
                filename=file.filename,  # type:ignore
                object_name=object_name,
                url=file_url,
                content_type=file.content_type,
                size=content_size,
                uploaded_at=datetime.now(),
            )

            new_image = image.model_dump(
                by_alias=True, exclude={"id"}, exclude_none=True, exclude_unset=True
            )
            result = await self.db.insert_one(new_image)
            new_image["_id"] = result.inserted_id

            return new_image

        except S3Error as e:
            log.error(f"Error uploading file to MinIO: {e}")

            raise StorageOperationError(f"Error uploading file to MinIO: {e}") from e

        except (PyMongoError, InvalidId) as e:
            log.error(f"Database error during creation: {e}")

            raise DatabaseOperationError(f"Database error during creation: {e}") from e

    async def update(self, file: UploadFile, image_url: str, user_id: str):
        """
        Update an image to MinIO and saves its metadata to MongoDB
        """

        try:
            image_doc = await self.db.find_one({"url": ObjectId(image_url)})
            if not image_doc:
                return None

            object_name = image_doc["object_name"]
            (
                _,
                content,
                content_size,
                content_type,
            ) = await self._prepare_file_for_upload(file)

            self.bucket.put_object(
                bucket_name=self._MINIO_BUCKET,  # type:ignore
                object_name=object_name,
                data=io.BytesIO(content),
                length=content_size,
                content_type=content_type,
            )

            update_data = {
                "$set": {
                    "filename": file.filename,
                    "user_id": user_id,
                    "size": content_size,
                    "content_type": content_type,
                    "uploaded_at": datetime.now(),
                }
            }
            await self.db.update_one({"url": ObjectId(image_url)}, update_data)
            updated_doc = await self.db.find_one({"url": ObjectId(image_url)})

            return updated_doc

        except S3Error as e:
            log.error(f"Error updating file to MinIO: {e}")

            raise StorageOperationError(f"Error updating file to MinIO: {e}") from e

        except (PyMongoError, InvalidId) as e:
            log.error(f"Database error during update: {e}")

            raise DatabaseOperationError(f"Database error during update: {e}") from e

    async def get(self, image_id: str):
        try:
            image = await self.db.find_one({"_id": ObjectId(image_id)})
            return image

        except (PyMongoError, InvalidId) as e:
            log.error(f"Database error while retrieving: {e}")

            raise DatabaseOperationError(f"Database error while retrieving: {e}") from e

    async def delete(self, image_url: str):
        try:
            image_doc = await self.db.find_one({"url": image_url})
            if not image_doc:
                return None

            object_name = image_doc["object_name"]

            self.bucket.remove_object(
                bucket_name=self._MINIO_BUCKET,  # type:ignore
                object_name=object_name,
            )

            await self.db.delete_one({"url": image_url})
            return "Deleted with success"

        except S3Error as e:
            log.error(f"Error deleting file in MinIO: {e}")

            raise StorageOperationError(f"Error deleting file in MinIO: {e}") from e

        except (PyMongoError, InvalidId) as e:
            log.error(f"Database error during deletion: {e}")

            raise DatabaseOperationError(f"Database error during deletion: {e}") from e
