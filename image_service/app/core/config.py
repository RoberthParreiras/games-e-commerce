from pymongo import AsyncMongoClient
from os import environ as env
from minio import Minio
from bson import CodecOptions, UuidRepresentation
import logging

from .exceptions import BucketCreationException

log = logging.getLogger(__name__)


# MinIO configuration
def create_minio_client():
    MINIO_ENDPOINT = env.get("MINIO_ENDPOINT")
    MINIO_ACCESS_KEY = env.get("MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY = env.get("MINIO_SECRET_KEY")
    MINIO_SECURE = env.get("MINIO_SECURE")

    minio_client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=True if MINIO_SECURE == "True" else False,
    )

    log.info("MinIO client created with success")

    return minio_client


def create_minio_bucket(minio_client: Minio):
    MINIO_BUCKET = env.get("MINIO_BUCKET")

    try:
        bucket_exist = minio_client.bucket_exists(MINIO_BUCKET)  # type: ignore
        if not bucket_exist:
            minio_client.make_bucket(MINIO_BUCKET)  # type: ignore

    except Exception:
        log.critical("Could not create the MinIO bucket")
        raise BucketCreationException("Could not create the MinIO bucket")


# Create a minIO client Singleton for the use of Dependency Injection through the app
minio_client = create_minio_client()


def get_minio_client():
    return minio_client


## MongoDB configuration
def create_mongodb_client():
    MONGO_HOST = env.get("MONGO_HOST")
    MONGO_PORT = env.get("MONGO_PORT")

    client: AsyncMongoClient = AsyncMongoClient(f"mongodb://{MONGO_HOST}:{MONGO_PORT}")

    log.info("MongoDB client created with success")

    return client


mongodb_client = create_mongodb_client()


def get_mongodb_client():
    return mongodb_client


db = mongodb_client.get_database("images")

standard_opts: CodecOptions = CodecOptions(
    uuid_representation=UuidRepresentation.STANDARD
)
image_collection = db.get_collection("images", codec_options=standard_opts)
