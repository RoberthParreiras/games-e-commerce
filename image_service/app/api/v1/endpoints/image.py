import os
import io
from uuid import uuid4
from fastapi import UploadFile, APIRouter, File, status, HTTPException

# from ....repository.image_repository import
# from image_service.app.model.mongo.image import ImageModel
# from image_service.app.model.mongo.mongo import image_collection
from ....services.image_service import ImageService

router = APIRouter()

class Image:
    def __init__(self, image_service: ImageService):
        self.image_service = image_service

    @router.post("/upload/", response_description="Add new image", 
                #  response_model=ImageModel, 
                 status_code=status.HTTP_201_CREATED, response_model_by_alias=False)
    async def create_image(self, file: UploadFile = File(...)):
        try:
            url = await self.image_service.create_image(file=file, user_id="asdasdsa")
            return url

            # image = ImageModel(
            #     filename=file.filename, # type: ignore
            #     object_name=object_name,
            #     url=file_url, # type: ignore
            #     content_type=file.content_type,
            #     size=file_size
            # )

            # new_image = await image_collection.insert_one(
            #     image.model_dump(by_alias=True, exclude={"id"}, exclude_none=True, exclude_unset=True)
            # )
            # created_image = await image_collection.find_one(
            #     {"_id": new_image.inserted_id}
            # )

            # if created_image and "_id" in created_image:
            #     created_image["id"] = str(created_image["_id"])
            #     del created_image["_id"]

            # return created_image
        
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"An error occurred during file upload: {str(e)}")
        finally:
            await file.close()