from pymongo import AsyncMongoClient

client = AsyncMongoClient("mongodb://localhost:27017") #type: ignore
db = client.get_database("images")
image_collection = db.get_collection("images")