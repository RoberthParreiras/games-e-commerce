# syntax=docker/dockerfile:1

# --- Builder Stage ---
FROM python:3.12-slim AS builder

# Set environment variables for uv
ENV UV_EXTRA_INDEX_URL=""
ENV UV_NO_CACHE=1

RUN pip install uv

WORKDIR /app

COPY pyproject.toml .

# Compile dependencies into a requirements file
RUN uv pip compile pyproject.toml -o requirements.txt

# Create the virtual environment and install dependencies from the file
RUN uv venv && uv pip install --no-cache-dir -r requirements.txt

# --- Production Stage ---
FROM python:3.12-slim AS production

WORKDIR /app

# Create a non-root user for security
RUN useradd --create-home --shell /bin/bash appuser

COPY --from=builder /usr/local/bin/uv /usr/local/bin/uv
COPY --from=builder --chown=appuser:appuser /app/.venv ./.venv
COPY --chown=appuser:appuser ./pyproject.toml .
COPY --chown=appuser:appuser ./app ./app

# Switch to the non-root user
USER appuser

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" ]