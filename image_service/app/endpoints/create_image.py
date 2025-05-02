import os
import io
from uuid import uuid4
from fastapi import UploadFile, APIRouter, File, status, HTTPException

from app.model.minio import create_minio_client # type: ignore
from image_service.app.model.mongo.image import ImageModel
from image_service.app.model.mongo.mongo import image_collection

router = APIRouter()

@router.post("/upload/", response_description="Add new image", response_model=ImageModel, status_code=status.HTTP_201_CREATED, response_model_by_alias=False)
async def create_image(file: UploadFile = File(...)):
    try:
        MINIO_BUCKET = os.environ.get("MINIO_BUCKET")
        MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT")
        minio_client = create_minio_client()

        file_extension = os.path.splitext(file.filename)[1] # type: ignore
        object_name = f"{uuid4()}{file_extension}"

        contents = await file.read()
        file_size = len(contents)

        minio_client.put_object(
            MINIO_BUCKET,
            object_name=object_name,
            data=io.BytesIO(contents),
            length=file_size,
            content_type=file.content_type
        )
        file_url = f"http://{MINIO_ENDPOINT}/{MINIO_BUCKET}/{object_name}"

        image = ImageModel(
            filename=file.filename, # type: ignore
            object_name=object_name,
            url=file_url, # type: ignore
            content_type=file.content_type,
            size=file_size
        )

        new_image = await image_collection.insert_one(
            image.model_dump(by_alias=True, exclude={"id"}, exclude_none=True, exclude_unset=True)
        )
        created_image = await image_collection.find_one(
            {"_id": new_image.inserted_id}
        )

        if created_image and "_id" in created_image:
            created_image["id"] = str(created_image["_id"])
            del created_image["_id"]

        return created_image
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"An error occurred during file upload: {str(e)}")
    finally:
        await file.close()