from fastapi import UploadFile, APIRouter, File, status, HTTPException, Depends

from ....repository.mongo.image import ImageModel
from ....services.image_service import ImageService

router = APIRouter()

@router.post("/image/upload/", response_description="Add new image", response_model=ImageModel, status_code=status.HTTP_201_CREATED, response_model_by_alias=False)
async def create_image(user_id: str, file: UploadFile = File(...), image_service: ImageService = Depends(ImageService)):
    try:
        created_image = await image_service.create_image(file=file, user_id=user_id)
        return created_image
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"An error occurred during file upload: {str(e)}")
    finally:
        await file.close()

@router.put("/image/update/", response_description="Update existing image", response_model=ImageModel, status_code=status.HTTP_200_OK, response_model_by_alias=False)
async def update_image(image_id: str, user_id: str, file: UploadFile = File(...), image_service: ImageService = Depends(ImageService)):
    try:
        updated_image = await image_service.update_image(file, image_id, user_id)
        return updated_image
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"An error occurred during file update: {str(e)}")
    finally:
        await file.close()

@router.get("/image/{image_id}", response_description="Get image", response_model=ImageModel, status_code=status.HTTP_200_OK, response_model_by_alias=False)
async def get_image(image_id: str, image_service: ImageService = Depends(ImageService)):
    try:
        image = await image_service.get_image(image_id)
        return image
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"An error occurred retrieving file: {str(e)}")

@router.delete("/image/{image_id}", response_description="Delete image", response_model=str, status_code=status.HTTP_200_OK, response_model_by_alias=False)
async def delete(image_id: str, image_service: ImageService = Depends(ImageService)):
    try:
        deleted_image = await image_service.delete_image(image_id)
        return deleted_image
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"An error occurred in the deletion file: {str(e)}")
