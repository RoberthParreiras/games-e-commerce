from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017") #type: ignore
db = client.get_database("images")
image_collection = db.get_collection("images")