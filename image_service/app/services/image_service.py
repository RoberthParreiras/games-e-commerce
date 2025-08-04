from fastapi import UploadFile, Depends
import logging

from ..repository.image_repository import ImageRepository
from .exceptions import (
    ImageStorageException,
    InvalidFileTypeException,
    ImageNotFoundException,
)

log = logging.getLogger(__name__)

class ImageService:
    def __init__(self, image_repository: ImageRepository = Depends(ImageRepository)):
        self.image_repository = image_repository

    async def create_image(self, file: UploadFile, user_id: str):
        if not file.content_type.startswith("image/"):  # type: ignore
            log.error("Invalid file type. Only images are allowed")

            raise InvalidFileTypeException("Invalid file type. Only images are allowed")

        image_metadata = await self.image_repository.create(file, user_id)
        if not image_metadata:
            log.error(f"Could not create the image for user_id={user_id}, filename={file.filename}")

            raise ImageStorageException("Could not create the image")

        return image_metadata

    async def update_image(self, file: UploadFile, image_id: str, user_id: str):
        if not file.content_type.startswith("image/"):  # type: ignore
            log.error("Invalid file type. Only images are allowed")

            raise InvalidFileTypeException("Invalid file type. Only images are allowed")

        image_metadata = await self.image_repository.update(file, image_id, user_id)
        if not image_metadata:
            log.error("Could not update image")

            raise ImageStorageException("Could not update image")

        return image_metadata

    async def get_image(self, image_id: str):
        image_metadata = await self.image_repository.get(image_id)
        if not image_metadata:
            log.error(f"Image not found: {image_id}")

            raise ImageNotFoundException(f"Image not found")

        return image_metadata

    async def delete_image(self, image_id: str):
        image_deleted = await self.image_repository.delete(image_id)
        if not image_deleted:
            log.error("Could not delete image with image_id={image_id}")

            raise ImageStorageException(f"Could not delete image")

        return image_deleted
