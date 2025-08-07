pipeline {
    agent {
        docker {
            image 'docker:24.0-cli'
            args '-v /var/run/docker.sock:/var/run/docker.sock --user root --network host'
        }
    }

    environment {
        // --- API Nest Service ---
        DATABASE_URL = credentials('DATABASE_URL')
        MYSQL_ROOT_PASSWORD = credentials('MYSQL_ROOT_PASSWORD')
        MYSQL_DATABASE = credentials('MYSQL_DATABASE')
        MYSQL_USER = credentials('MYSQL_USER')

        REDIS_HOST = credentials('REDIS_HOST')
        REDIS_PORT = credentials('REDIS_PORT')

        JWT_SECRET = credentials('JWT_SECRET')

        DEFAULT_PAGE = credentials('DEFAULT_PAGE')
        MAX_PAGE_DEFAULT_LIMIT = credentials('MAX_PAGE_DEFAULT_LIMIT')

        // --- Image Service ---
        MINIO_ENDPOINT = credentials('MINIO_ENDPOINT')
        MINIO_ROOT_USER = credentials('MINIO_ROOT_USER')
        MINIO_ROOT_PASSWORD = credentials('MINIO_ROOT_PASSWORD')
        MINIO_BUCKET = credentials('MINIO_BUCKET')
        MINIO_SECURE = credentials('MINIO_SECURE')

        MONGO_HOST = credentials('MONGO_HOST')
        MONGO_PORT = credentials('MONGO_PORT')
        MONGO_INITDB_ROOT_USERNAME = credentials('MONGO_INITDB_ROOT_USERNAME')
        MONGO_INITDB_ROOT_PASSWORD = credentials('MONGO_INITDB_ROOT_PASSWORD')

        // --- Docker Compose Files ---
        TEST_COMPOSE_FILES = '--project-directory . --env-file /dev/null -f api_nest/docker-compose.yml -f image_service/docker-compose.yml -f api_nest/docker-compose.prod.yml -f image_service/docker-compose.prod.yml'
    }

    stages {
        stage('Build Services') {
            steps {
                script {
                    echo 'Building services...'
                    dir('api_nest') {
                        sh 'docker build -t games-e-commerce-app -f prod.Dockerfile .'
                    }
                    dir('image_service') {
                        sh 'docker build -t games-e-commerce-image-service -f prod.Dockerfile .'
                    }
                }
            }
        }

        stage('Start Dependencies for Testing') {
            steps {
                script {
                    sh """
                        echo "DATABASE_URL=${env.DATABASE_URL}" > .env
                        echo "MYSQL_ROOT_PASSWORD=${env.MYSQL_ROOT_PASSWORD}" >> .env
                        echo "MYSQL_DATABASE=${env.MYSQL_DATABASE}" >> .env
                        echo "MYSQL_USER=${env.MYSQL_USER}" >> .env
                        echo "REDIS_HOST=${env.REDIS_HOST}" >> .env
                        echo "REDIS_PORT=${env.REDIS_PORT}" >> .env
                        echo "JWT_SECRET=${env.JWT_SECRET}" >> .env
                        echo "DEFAULT_PAGE=${env.DEFAULT_PAGE}" >> .env
                        echo "MAX_PAGE_DEFAULT_LIMIT=${env.MAX_PAGE_DEFAULT_LIMIT}" >> .env
                        echo "MINIO_ENDPOINT=${env.MINIO_ENDPOINT}" >> .env
                        echo "MINIO_ROOT_USER=${env.MINIO_ROOT_USER}" >> .env
                        echo "MINIO_ROOT_PASSWORD=${env.MINIO_ROOT_PASSWORD}" >> .env
                        echo "MINIO_BUCKET=${env.MINIO_BUCKET}" >> .env
                        echo "MINIO_SECURE=${env.MINIO_SECURE}" >> .env
                        echo "MONGO_HOST=${env.MONGO_HOST}" >> .env
                        echo "MONGO_PORT=${env.MONGO_PORT}" >> .env
                        echo "MONGO_INITDB_ROOT_USERNAME=${env.MONGO_INITDB_ROOT_USERNAME}" >> .env
                        echo "MONGO_INITDB_ROOT_PASSWORD=${env.MONGO_INITDB_ROOT_PASSWORD}" >> .env
                    """

                    def composeFiles = env.TEST_COMPOSE_FILES.replace('--env-file /dev/null', '--env-file .env')

                    echo 'Cleaning up any old containers before starting...'
                    sh "docker compose ${composeFiles} down --remove-orphans || true"

                    echo 'Starting database and dependency containers...'
                    sh "docker compose ${composeFiles} up -d --no-build"

                    echo 'Listing running services...'
                    sh "docker compose ${composeFiles} ps"
                }
            }
        }
    
        stage('Run Unit and E2E Tests') {
            steps {
                script {
                    echo 'Waiting for services to be ready...'

                    // This script waits for the services to become available before running tests.
                    sh """
                        TIMEOUT=120
                        INTERVAL=5
                        
                        # Wait for MySQL
                        echo "Waiting for MySQL..."
                        # Parse the port from the URL
                        DB_PORT=\$(echo \$DATABASE_URL | awk -F'[@:/]' '{print \$7}')

                        ELAPSED=0
                        # Connect to localhost since the agent is on the host network
                        while ! nc -z localhost \$DB_PORT; do
                            if [ \$ELAPSED -ge \$TIMEOUT ]; then
                                echo "Timed out waiting for MySQL."
                                exit 1
                            fi
                            sleep \$INTERVAL
                            ELAPSED=\$((ELAPSED + INTERVAL))
                        done
                        echo "MySQL is up!"

                        # Reset timer for next service
                        ELAPSED=0
                        
                        # Wait for Redis
                        echo "Waiting for Redis on localhost:\${REDIS_PORT}..."
                        while ! nc -z localhost \${REDIS_PORT}; do
                            if [ \$ELAPSED -ge \$TIMEOUT ]; then
                                echo "Timed out waiting for Redis."
                                exit 1
                            fi
                            sleep \$INTERVAL
                            ELAPSED=\$((ELAPSED + INTERVAL))
                        done
                        echo "Redis is up!"

                        ELAPSED=0

                        # Wait for MongoDB
                        echo "Waiting for MongoDB on localhost:\${MONGO_PORT}..."
                        while ! nc -z localhost \${MONGO_PORT}; do
                            if [ \$ELAPSED -ge \$TIMEOUT ]; then
                                echo "Timed out waiting for MongoDB."
                                exit 1
                            fi
                            sleep \$INTERVAL
                            ELAPSED=\$((ELAPSED + INTERVAL))
                        done
                        echo "MongoDB is up!"

                        ELAPSED=0

                        # Wait for MinIO - assuming default port 9000
                        echo "Waiting for MinIO on localhost:9000..."
                        while ! nc -z localhost 9000; do
                            if [ \$ELAPSED -ge \$TIMEOUT ]; then
                                echo "Timed out waiting for MinIO."
                                exit 1
                            fi
                            sleep \$INTERVAL
                            ELAPSED=\$((ELAPSED + INTERVAL))
                        done
                        echo "MinIO is up!"

                        # Wait for the main application services to be in a running state
                        echo "Waiting for app service..."
                        ELAPSED=0
                        while ! docker compose ${env.TEST_COMPOSE_FILES} ps app | grep -q "Up"; do
                            if [ \$ELAPSED -ge \$TIMEOUT ]; then
                                echo "Timed out waiting for app service."
                                echo "--- api_nest logs ---"
                                docker compose ${env.TEST_COMPOSE_FILES} logs app || echo "Could not retrieve logs for app."
                                exit 1
                            fi
                            sleep \$INTERVAL
                            ELAPSED=\$((ELAPSED + INTERVAL))
                        done
                        echo "app service is running!"
                    """

                    echo 'Running tests...'

                    sh 'docker container ls'

                    // --- API Nest Tests ---
                    // Use the same TEST_COMPOSE_FILES variable to execute commands in the correct context.
                    // sh "docker compose ${env.TEST_COMPOSE_FILES} exec -T --user root app npm ci"
                    // sh "docker compose ${env.TEST_COMPOSE_FILES} exec -T app npm test"
                    // sh "docker compose ${env.TEST_COMPOSE_FILES} exec -T app npm test:e2e"
                    
                    // --- Image Tests ---
                    // sh "docker compose ${env.TEST_COMPOSE_FILES} exec -T --user root app uv sync"
                    // sh "docker compose ${env.TEST_COMPOSE_FILES} exec -T app pytest"
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    // Create an empty .env file to prevent docker-compose from complaining.
                    sh 'touch .env'

                    echo 'Deploying to production...'
                    sh """
                        DATABASE_URL=${env.DATABASE_URL} \
                        MYSQL_ROOT_PASSWORD=${env.MYSQL_ROOT_PASSWORD} \
                        MYSQL_DATABASE=${env.MYSQL_DATABASE} \
                        MYSQL_USER=${env.MYSQL_USER} \
                        REDIS_HOST=${env.REDIS_HOST} \
                        REDIS_PORT=${env.REDIS_PORT} \
                        JWT_SECRET=${env.JWT_SECRET} \
                        DEFAULT_PAGE=${env.DEFAULT_PAGE} \
                        MAX_PAGE_DEFAULT_LIMIT=${env.MAX_PAGE_DEFAULT_LIMIT} \
                        MINIO_ENDPOINT=${env.MINIO_ENDPOINT} \
                        MINIO_ROOT_USER=${env.MINIO_ROOT_USER} \
                        MINIO_ROOT_PASSWORD=${env.MINIO_ROOT_PASSWORD} \
                        MINIO_BUCKET=${env.MINIO_BUCKET} \
                        MINIO_SECURE=${env.MINIO_SECURE} \
                        MONGO_HOST=${env.MONGO_HOST} \
                        MONGO_PORT=${env.MONGO_PORT} \
                        MONGO_INITDB_ROOT_USERNAME=${env.MONGO_INITDB_ROOT_USERNAME} \
                        MONGO_INITDB_ROOT_PASSWORD=${env.MONGO_INITDB_ROOT_PASSWORD} \
                        docker compose ${env.TEST_COMPOSE_FILES} up -d --no-build
                    """
                }
            }
        }
    }

    // post {
    //     always {
    //         script {
    //             def allComposeFiles = '--project-directory . --env-file /dev/null -f api_nest/docker-compose.yml -f image_service/docker-compose.yml -f api_nest/docker-compose.prod.yml -f image_service/docker-compose.prod.yml'
    //             echo 'Pipeline finished. Cleaning up all containers...'
    //             sh "docker compose ${allComposeFiles} down --remove-orphans || true"
    //         }
    //     }
    // }
}