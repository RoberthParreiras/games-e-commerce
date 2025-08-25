# syntax=docker/dockerfile:1

# --- Base Stage ---
FROM node:20 AS base

WORKDIR /usr/src/app

# --- Dependencies Stage ---
FROM base AS dependencies

COPY package*.json ./

RUN npm install --production=false

# --- Builder Stage ---
FROM dependencies AS builder

COPY . .

RUN npx prisma generate --schema=./src/models/prisma/schema.prisma
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install dos2unix to fix potential line ending issues
RUN apk add --no-cache dos2unix
COPY prod-prisma-entrypoint.sh .
RUN dos2unix ./prod-prisma-entrypoint.sh
RUN chmod +x ./prod-prisma-entrypoint.sh

COPY --from=builder /usr/src/app/src/models/prisma ./prisma

COPY package*.json ./

RUN npm install --production=true


COPY --from=builder --chown=node:nodejs /usr/src/app/dist ./dist

RUN chown node:node ./prod-prisma-entrypoint.sh
USER node

EXPOSE 3001

# Set the entrypoint to run the migration script on startup.
ENTRYPOINT [ "./prod-prisma-entrypoint.sh" ]

CMD [ "node", "dist/main" ]
