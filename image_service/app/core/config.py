from pymongo import AsyncMongoClient
from os import environ as env
from minio import Minio

## MINIO configuration
def create_minio_client():
    MINIO_ENDPOINT = env.get("MINIO_ENDPOINT")
    MINIO_ACCESS_KEY = env.get("MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY = env.get("MINIO_SECRET_KEY")
    MINIO_SECURE = env.get("MINIO_SECURE")

    minio_client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=True if MINIO_SECURE == "True" else False
    )
    return minio_client

def create_minio_bucket(minio_client: Minio):
    MINIO_BUCKET = env.get("MINIO_BUCKET")

    try:
        bucket_exist = minio_client.bucket_exists(MINIO_BUCKET) #type: ignore
        if not bucket_exist:
            minio_client.make_bucket(MINIO_BUCKET) #type: ignore
        
    except Exception as e:
        print(e)

## MONGODB configuration
client: AsyncMongoClient = AsyncMongoClient("mongodb://localhost:27017")
db = client.get_database("images")
image_collection = db.get_collection("images")