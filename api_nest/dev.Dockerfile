# syntax=docker/dockerfile:1

FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Install dos2unix to fix line endings
RUN apt-get update && apt-get install -y dos2unix

COPY . .

# Fix line endings and make the script executable
RUN dos2unix ./dev-prisma-entrypoint.sh
RUN chmod +x ./dev-prisma-entrypoint.sh

EXPOSE 3000

# Set the entrypoint to run the migration script on startup.
ENTRYPOINT ["./dev-prisma-entrypoint.sh"]

CMD ["npm", "run", "start:dev", "--", "-b", "swc"]