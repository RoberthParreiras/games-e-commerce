from fastapi import UploadFile, HTTPException, status, Depends
from ..repository.image_repository import ImageRepository

class ImageService:
    def __init__(self, image_repository: ImageRepository = Depends(ImageRepository)):
        self.image_repository = image_repository

    async def create_image(self, file: UploadFile, user_id: str):
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only images are allowed."
            )
        
        image_metadata = await self.image_repository.create(file, user_id)
        if not image_metadata:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not save image."
            )
        
        return image_metadata
    
    async def update_image(self, file: UploadFile, image_id: str, user_id: str):
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only images are allowed"
            )
        
        image_metadata = await self.image_repository.update(file, image_id, user_id)
        if not image_metadata:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not update image"
            )
        
        return image_metadata

    async def get_image(self, image_id: str):
        image_metadata = await self.image_repository.get(image_id)
        if not image_metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
        
        return image_metadata

    async def delete_image(self, image_id: str):
        image_deleted = await self.image_repository.delete(image_id)
        if not image_deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not delete image"
            )
        return image_deleted
