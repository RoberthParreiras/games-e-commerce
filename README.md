# 🎮 Games E-commerce Platform - Backend

This repository contains the backend services for a modern Games E-commerce platform. It is built with a microservices architecture, featuring a robust API for application logic and a dedicated service for image handling.

---

## 🚀 Core Technologies

* **API Service (api_nest):**
    * [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
    * [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript.
    * [Prisma](https://www.prisma.io/) - A next-generation ORM for Node.js and TypeScript.
    * [Redis](https://redis.io/) - An in-memory data structure store, used as cache
* **Image Service (image_service):**
    * [FastAPI](https://fastapi.tiangolo.com/) - A modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints.
    * [Python](https://www.python.org/) - A high-level, general-purpose programming language.
    * [MinIO](https://min.io/) - A high-performance, S3 compatible object storage.
    * [MongoDB](https://www.mongodb.com/) - A source-available cross-platform document-oriented database program.
* **Containerization:**
    * [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) - For creating, deploying, and running applications in containers.

---

## 🔧 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/en/) (v20 or higher)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Python](https://www.python.org/downloads/) (v3.12 or higher)
* [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-folder>
    ```
2.  **Install dependencies for the API Service:**
    ```bash
    cd api_nest
    npm install
    ```
3.  **Install dependencies for the Image Service:**
    ```bash
    cd ../image_service
    # It's recommended to use a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

---

## 🐳 Running the Application with Docker

For a streamlined setup, you can run the entire application using Docker Compose. This will start the NestJS API, the database, and other services.

* **Development Mode:**
    (Includes features like hot-reloading for a better development experience)
    ```bash
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
    ```
* **Production Mode:**
    (Optimized for performance and stability)
    ```bash
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
    ```

---

## 🧪 Testing

To ensure the reliability of the application, you can run the provided tests.

* **API Service Tests:**
    ```bash
    cd api_nest
    # Run unit tests
    npm run test

    # Run end-to-end (e2e) tests
    npm run test:e2e

    # Check test coverage
    npm run test:cov
    ```

---