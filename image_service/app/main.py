import os
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import logging

from .core.logging import setup_logging


dotenv_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"
)
load_dotenv(dotenv_path)

from app.api.v1.endpoints.image import router
from app.core.config import minio_client, create_minio_bucket
from .services.exceptions import (
    InvalidFileTypeException,
    ImageStorageException,
    ImageNotFoundException,
)

create_minio_bucket(minio_client)

log = logging.getLogger(__name__)
setup_logging()

app = FastAPI()


@app.exception_handler(InvalidFileTypeException)
async def invalid_file_type_handler(exception: InvalidFileTypeException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(exception)}
    )


@app.exception_handler(ImageNotFoundException)
async def image_not_found_handler(exception: ImageNotFoundException):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exception)}
    )


@app.exception_handler(ImageStorageException)
async def image_storage_handler(exception: ImageStorageException):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exception)},
    )


app.include_router(router, tags=["image"])
