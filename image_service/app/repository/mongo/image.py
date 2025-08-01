from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, List, Annotated
from uuid import UUID
from datetime import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]


# for more details https://www.mongodb.com/docs/languages/python/pymongo-driver/current/integrations/fastapi-integration/
class ImageModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: UUID
    filename: str
    object_name: str
    url: str
    content_type: Optional[str] = Field(default=None)
    size: Optional[int] = Field(default=None)
    uploaded_at: datetime = Field(default_factory=datetime.now)
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "688b3f182cb8ea197c3a6c75",
                "user_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "filename": "my_image.jpg",
                "object_name": "a1b2c3d4-e5f6-5895-1234-567890abcdef.jpg",
                "url": "http://localhost:9000/images/a1b2c3d4-e5f6-5895-1234-567890abcdef.jpg",
                "content_type": "image/jpeg",
                "size": "102400",
                "uploaded_at": "2025-04-29T10:00:00Z",
            }
        },
    )


class ImageCollection(BaseModel):
    images: List[ImageModel]
