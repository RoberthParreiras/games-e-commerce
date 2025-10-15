from fastapi import UploadFile
import io
from PIL import Image


async def compress_image(file: UploadFile) -> UploadFile:
    image_data = await file.read()
    image_stream = io.BytesIO(image_data)

    with Image.open(image_stream) as im:
        # New stream to hold the compressed image
        output_stream = io.BytesIO()

        im.save(output_stream, format=im.format, optimize=True, quality=85)
        output_stream.seek(0)

        compressed_file = UploadFile(
            filename=file.filename,
            file=output_stream,
        )

    return compressed_file
