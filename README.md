# 🎮 Games E-commerce Platform

This repository contains the services for a modern Games E-commerce platform. It is built with a microservices architecture, featuring a robust API for application logic, a dedicated service for image handling, and a responsive frontend.

## 🚀 Core Technologies

- **API Service (api_nest):**

  - [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
  - [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript.
  - [Prisma](https://www.prisma.io/) - A next-generation ORM for Node.js and TypeScript.
  - [Redis](https://redis.io/) - An in-memory data structure store, used as a cache.

- **Image Service (image_service):**

  - [FastAPI](https://fastapi.tiangolo.com/) - A modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints.
  - [Python](https://www.python.org/) - A high-level, general-purpose programming language.
  - [MinIO](https://min.io/) - A high-performance, S3 compatible object storage.
  - [MongoDB](https://www.mongodb.com/) - A source-available cross-platform document-oriented database program.

- **Frontend Service (frontend-next):**

  - [Next.js](https://nextjs.org/) - The React Framework for building full-stack web applications.
  - [React](https://react.dev/) - The library for web and native user interfaces.
  - [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript.
  - [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.

- **Containerization:**
  - [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) - For creating, deploying, and running applications in containers.

## 📖 Service Documentation

For detailed instructions on setting up and running each service, please refer to their respective `README.md` files:

- **[API Service](./api_nest/README.md)**
- **[Image Service](./image_service/README.md)**
- **[Frontend Service](./frontend-next/README.md)**

## ⚙️ CI/CD Pipeline

This project includes a `Jenkinsfile` to set up a CI/CD pipeline using [Jenkins](https://www.jenkins.io/). This allows for automated building, testing, and deployment of the services.

### Running the Jenkins Pipeline

1.  **Setup Jenkins:** You could use this Dockerfile to create a Jenkins that runs Docker:

    ```dockerfile
    # Use the official Jenkins LTS image as a base
    FROM jenkins/jenkins:lts-jdk17

    # Switch to root user to install software
    USER root

    # Install dependencies and Docker's GPG key
    RUN apt-get update && apt-get install -y curl gnupg lsb-release && \
        mkdir -p /etc/apt/keyrings && \
        curl -fsSL [https://download.docker.com/linux/debian/gpg](https://download.docker.com/linux/debian/gpg) | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Add the Docker repository to Apt sources
    RUN echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] [https://download.docker.com/linux/debian](https://download.docker.com/linux/debian) \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker CLI and Docker Compose
    RUN apt-get update && apt-get install -y docker-ce-cli docker-compose-plugin

    # Switch back to the jenkins user
    USER jenkins
    ```

2.  **Run the Jenkins using docker:** Here is an example of how to run:
    ```bash
    docker run -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock --group-add $(getent group docker | cut -d: -f3) --name jenkins docker-with-jenkins
    ```
3.  **Install the Docker Pipeline plugin**
4.  **Include a GitHub PAT for credentials**
5.  **Include the environment variables in the Jenkins Dashboard**
6.  **Run the Pipeline**
