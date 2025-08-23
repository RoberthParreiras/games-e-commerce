import os
from fastapi import HTTPException, status, Header
from jose import jwt, JWTError

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"


async def get_current_user_id(authorization: str = Header(...)) -> str:
    token_prefix, _, token = authorization.partition(" ")
    if token_prefix.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id

    except JWTError:
        raise credentials_exception
