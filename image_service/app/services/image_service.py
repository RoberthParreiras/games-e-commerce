from fastapi import UploadFile, Depends
from ..repository.image_repository import ImageRepository
from .exceptions import (
    ImageStorageException,
    InvalidFileTypeException,
    ImageNotFoundException,
)


class ImageService:
    def __init__(self, image_repository: ImageRepository = Depends(ImageRepository)):
        self.image_repository = image_repository

    async def create_image(self, file: UploadFile, user_id: str):
        if not file.content_type.startswith("image/"):  # type: ignore
            raise InvalidFileTypeException("Invalid file type. Only images are allowed")

        image_metadata = await self.image_repository.create(file, user_id)
        if not image_metadata:
            raise ImageStorageException("Could not create the image")

        return image_metadata

    async def update_image(self, file: UploadFile, image_id: str, user_id: str):
        if not file.content_type.startswith("image/"):  # type: ignore
            raise InvalidFileTypeException("Invalid file type. Only images are allowed")

        image_metadata = await self.image_repository.update(file, image_id, user_id)
        if not image_metadata:
            raise ImageStorageException("Could not update image")

        return image_metadata

    async def get_image(self, image_id: str):
        image_metadata = await self.image_repository.get(image_id)
        if not image_metadata:
            raise ImageNotFoundException("Image not found")

        return image_metadata

    async def delete_image(self, image_id: str):
        image_deleted = await self.image_repository.delete(image_id)
        if not image_deleted:
            raise ImageStorageException("Could not delete image")

        return image_deleted
