import os
import io
from uuid import uuid4
from fastapi import UploadFile, APIRouter, File, status, HTTPException, Depends

from ....repository.mongo.image import ImageModel
from ....services.image_service import ImageService

router = APIRouter()

@router.post("/upload/", response_description="Add new image", response_model=ImageModel, status_code=status.HTTP_201_CREATED, response_model_by_alias=False)
async def create_image(user_id: str, file: UploadFile = File(...), image_service: ImageService = Depends(ImageService)):
    try:
        created_image = await image_service.create_image(file=file, user_id=user_id)
        return created_image
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"An error occurred during file upload: {str(e)}")
    finally:
        await file.close()
